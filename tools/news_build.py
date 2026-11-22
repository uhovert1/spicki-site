#!/usr/bin/env python3
"""Сборка раздела «Новости» сайта Spički.

Источник: news/data/*.json — по одному файлу на новость (формат в news/README.md).
Результат:
  news/<slug>.html, news/sr/<slug>.html, news/en/<slug>.html — страницы новости;
  news/index.html, news/sr/index.html, news/en/index.html — списки новостей;
  блок последних новостей на главной (index.html, между /*NEWS-START*/ и /*NEWS-END*/);
  sitemap.xml с альтернативными языковыми версиями.

Запуск из корня репозитория:  python3 tools/news_build.py
Скрипт сначала проверяет все файлы и ничего не записывает, если нашёл ошибку.
"""
import html, json, re, sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "news" / "data"
SITE = "https://spickibg.com"
LANGS = ["ru", "sr", "en"]
HTML_LANG = {"ru": "ru", "sr": "sr-Latn", "en": "en"}
HREFLANG = {"ru": "ru", "sr": "sr-Latn", "en": "en"}
SUBDIR = {"ru": "news/", "sr": "news/sr/", "en": "news/en/"}
UP = {"ru": "../", "sr": "../../", "en": "../../"}
HOME = {"ru": "", "sr": "sr/", "en": "en/"}  # главная на каждом языке: /, /sr/, /en/
MONTHS = {
    "ru": ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
    "sr": ["januar", "februar", "mart", "april", "maj", "jun", "jul", "avgust", "septembar", "oktobar", "novembar", "decembar"],
    "en": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
}
T = {
    "ru": dict(news="Новости", all="Все новости", h="Новости кальянного мира", sources="Источники", faq="Частые вопросы",
               more="Ещё новости", articles="Статьи", book="Забронировать стол", menu="Полное меню", menu_s="Меню",
               cta_h="Кальяны в Белграде — в Spički", cta_p="Mačvanska 10, Врачар, Белград · ежедневно с 12:00",
               cta_p2="Кальяны, кухня, бар, столы с PS5 и Secret Room с игровыми ПК.", read="Читать",
               idx_title="Новости кальянного мира — Spički, Белград",
               idx_desc="Новости кальянной индустрии и культуры кальяна: законы, рынок, тренды. Что это значит для гостей кальянных в Белграде.",
               idx_lead="Что происходит в мире кальянов: законы, рынок, тренды. И что это значит для гостей кальянных в Белграде.",
               privacy="Политика конфиденциальности", pib="ПИБ", mb="МБ", updated="Обновлено"),
    "sr": dict(news="Vesti", all="Sve vesti", h="Vesti iz sveta nargila", sources="Izvori", faq="Česta pitanja",
               more="Još vesti", articles="Članci", book="Rezerviši sto", menu="Ceo meni", menu_s="Meni",
               cta_h="Nargile u Beogradu — u Spički", cta_p="Mačvanska 10, Vračar, Beograd · svaki dan od 12:00",
               cta_p2="Nargile, kuhinja, bar, PS5 stolovi i Secret Room sa gejming računarima.", read="Pročitaj",
               idx_title="Vesti iz sveta nargila — Spički, Beograd",
               idx_desc="Vesti iz industrije i kulture nargila: zakoni, tržište, trendovi. Šta to znači za goste nargila barova u Beogradu.",
               idx_lead="Šta se dešava u svetu nargila: zakoni, tržište, trendovi. I šta to znači za goste nargila barova u Beogradu.",
               privacy="Politika privatnosti", pib="PIB", mb="MB", updated="Ažurirano"),
    "en": dict(news="News", all="All news", h="Hookah world news", sources="Sources", faq="FAQ",
               more="More news", articles="Articles", book="Book a table", menu="Full menu", menu_s="Menu",
               cta_h="Hookah in Belgrade — at Spički", cta_p="Mačvanska 10, Vračar, Belgrade · daily from 12:00",
               cta_p2="Hookah, kitchen, bar, PS5 tables and a Secret Room with gaming PCs.", read="Read",
               idx_title="Hookah world news — Spički, Belgrade",
               idx_desc="News from the hookah industry and culture: laws, market, trends. What it means for hookah lounge guests in Belgrade.",
               idx_lead="What is happening in the hookah world: laws, market and trends, and what it means for hookah lounge guests in Belgrade.",
               privacy="Privacy policy", pib="Tax ID (PIB)", mb="Company No. (MB)", updated="Updated"),
}
ALLOWED_TAGS = {"h2", "h3", "p", "ul", "ol", "li", "strong", "em", "a", "blockquote", "br", "table", "tr", "td", "th", "tbody", "thead"}
e = lambda s: html.escape(str(s), quote=True)


def fail(msg):
    print("ОШИБКА:", msg)
    sys.exit(1)


def fmt_date(d, lang):
    y, m, dd = map(int, d.split("-"))
    if lang == "ru":
        return f"{dd} {MONTHS['ru'][m-1]} {y}"
    if lang == "sr":
        return f"{dd}. {MONTHS['sr'][m-1]} {y}."
    return f"{dd} {MONTHS['en'][m-1]} {y}"


def check_body(body, where):
    for tag in re.findall(r"</?\s*([a-zA-Z0-9]+)", body):
        if tag.lower() not in ALLOWED_TAGS:
            fail(f"{where}: тег <{tag}> не разрешён")
    if re.search(r"\son\w+\s*=|javascript:|style\s*=", body, re.I):
        fail(f"{where}: запрещены обработчики событий, javascript: и style")
    for href in re.findall(r'href="([^"]+)"', body):
        if not (href.startswith("https://") or href.startswith("../") or href.startswith("#")):
            fail(f"{where}: ссылка {href} должна начинаться с https:// или ../")


def load():
    items = []
    for f in sorted(DATA.glob("*.json")):
        try:
            a = json.loads(f.read_text(encoding="utf-8"))
        except Exception as ex:
            fail(f"{f.name}: не JSON ({ex})")
        for k in ["date", "slug", "image", "sources"] + LANGS:
            if k not in a:
                fail(f"{f.name}: нет поля {k}")
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", a["date"]):
            fail(f"{f.name}: дата должна быть ГГГГ-ММ-ДД")
        date.fromisoformat(a["date"])
        if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", a["slug"]):
            fail(f"{f.name}: slug только латиница, цифры и дефисы")
        if not (ROOT / a["image"]).exists():
            fail(f"{f.name}: нет картинки {a['image']}")
        if len(a["sources"]) < 1:
            fail(f"{f.name}: нужен хотя бы один источник")
        for s in a["sources"]:
            if not s.get("url", "").startswith("https://") or not s.get("title"):
                fail(f"{f.name}: у источника нужны title и https-url")
        for l in LANGS:
            x = a[l]
            for k in ["title", "description", "lead", "tag", "body"]:
                if not x.get(k):
                    fail(f"{f.name}: {l}.{k} пусто")
            if len(x["title"]) > 110:
                fail(f"{f.name}: {l}.title длиннее 110 символов")
            if not 70 <= len(x["description"]) <= 200:
                fail(f"{f.name}: {l}.description должно быть 70–200 символов (сейчас {len(x['description'])})")
            check_body(x["body"], f"{f.name} {l}.body")
            for q in x.get("faq", []):
                if len(q) != 2:
                    fail(f"{f.name}: {l}.faq — пары [вопрос, ответ]")
        a["_file"] = f.name
        items.append(a)
    slugs = [a["slug"] for a in items]
    if len(slugs) != len(set(slugs)):
        fail("повторяющийся slug")
    items.sort(key=lambda a: (a["date"], a["_file"]), reverse=True)
    return items


def url(a, l):
    return f"{SITE}/{SUBDIR[l]}{a['slug']}.html"


def idx_url(l):
    return f"{SITE}/{SUBDIR[l]}"


# --- общие куски из существующей статьи, чтобы шапка и подвал совпадали с сайтом
SRC = (ROOT / "articles" / "kejtering.html").read_text(encoding="utf-8")
LOGO = re.search(r'<svg class="logo".*?</svg>', SRC, re.S).group(0)
DEFS = re.search(r'<svg width="1" height="1".*?</svg>', SRC, re.S).group(0)
FAB_ICON = re.search(r'<a class="menu-fab"[^>]*>(<svg.*?</svg>)', SRC, re.S).group(1)


def head(l, title, desc, canon, alts, up, ld, og_img, og_type="article"):
    alt_links = "".join(f'<link rel="alternate" hreflang="{HREFLANG[k]}" href="{v}">' for k, v in alts.items())
    alt_links += f'<link rel="alternate" hreflang="x-default" href="{alts["ru"]}">'
    return f"""<!doctype html>
<html lang="{HTML_LANG[l]}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{canon}">
{alt_links}
<meta property="og:type" content="{og_type}">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="{og_img}">
<meta property="og:locale" content="{ {'ru':'ru_RU','sr':'sr_RS','en':'en_US'}[l] }">
<link rel="stylesheet" href="{up}fonts/fonts.css">
<link rel="stylesheet" href="{up}articles/article.css">
<link rel="stylesheet" href="{up}consent.css">
<link rel="icon" href="{up}favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="{up}apple-touch-icon.png">
<meta name="theme-color" content="#0f0a0d">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head>
<body>
{DEFS}"""


def topbar(l, up, lang_hrefs):
    t = T[l]
    langs = "".join(
        f'<a href="{lang_hrefs[k]}" hreflang="{HREFLANG[k]}" lang="{HTML_LANG[k]}"{" aria-current=\"true\"" if k == l else ""}>{k.upper()}</a>'
        for k in LANGS)
    return f"""<header class="top"><div class="wrap">
  <a href="{up}{HOME[l]}" aria-label="Spički">{LOGO}</a>
  <div class="top-right">
    <nav class="lang" aria-label="Language">{langs}</nav>
    <a class="btn btn-fire" href="https://book.spickibg.com/" target="_blank" rel="noopener">{t['book']}</a>
  </div>
</div></header>"""


def footer(l, up):
    t = T[l]
    return f"""<footer><div class="wrap">Spički šibice · Mačvanska 10, Beograd · <a href="https://www.instagram.com/spicki_bg/" target="_blank" rel="noopener">Instagram @spicki_bg</a><br>© {date.today().year} MANUYLOV AND PARTNERS DOO BEOGRAD (VRAČAR) · {t['pib']} 114447111 · {t['mb']} 22025082 · <a href="mailto:info@spickibg.com">info@spickibg.com</a> · <a href="{up}privacy.html">{t['privacy']}</a> · <a href="{up}privacy.html" data-privacy-open>{t['privacy']}</a></div></footer>
<a class="menu-fab" href="https://qastio.app/rs/belgrade/spicki" target="_blank" rel="noopener">{FAB_ICON}<span>{t['menu_s']}</span><span class="arrow" aria-hidden="true">↗</span></a>
<script src="{up}consent.js" data-root="{up}"></script>
<script src="{up}t.js" defer></script>
</body>
</html>
"""


def cta(l):
    t = T[l]
    return f"""<aside class="cta"><h2>{t['cta_h']}</h2><p>{t['cta_p']}</p><p>{t['cta_p2']}</p>
      <div class="row"><a class="btn btn-fire" href="https://book.spickibg.com/" target="_blank" rel="noopener">{t['book']} ↗</a><a class="btn btn-line" href="https://qastio.app/rs/belgrade/spicki" target="_blank" rel="noopener">{t['menu']} ↗</a></div></aside>"""


def article_page(a, l, others):
    x, t, up = a[l], T[l], UP[l]
    alts = {k: url(a, k) for k in LANGS}
    hrefs = {k: (f"{a['slug']}.html" if k == l else
                 {("ru", "sr"): f"sr/{a['slug']}.html", ("ru", "en"): f"en/{a['slug']}.html",
                  ("sr", "ru"): f"../{a['slug']}.html", ("en", "ru"): f"../{a['slug']}.html",
                  ("sr", "en"): f"../en/{a['slug']}.html", ("en", "sr"): f"../sr/{a['slug']}.html"}[(l, k)])
             for k in LANGS}
    img_abs = f"{SITE}/{a['image']}"
    ld = [{
        "@context": "https://schema.org", "@type": "NewsArticle", "headline": x["title"], "description": x["description"],
        "inLanguage": HTML_LANG[l], "datePublished": a["date"], "dateModified": a.get("updated", a["date"]),
        "image": [img_abs], "mainEntityOfPage": url(a, l),
        "author": {"@type": "Organization", "name": "Spički šibice", "url": SITE + "/"},
        "publisher": {"@type": "Organization", "name": "Spički šibice", "logo": {"@type": "ImageObject", "url": f"{SITE}/apple-touch-icon.png"}},
        "about": {"@type": "BarOrPub", "name": "Spički šibice", "address": "Mačvanska 10, Beograd", "url": SITE + "/"},
        "citation": [s["url"] for s in a["sources"]],
    }, {
        "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Spički", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": t["news"], "item": idx_url(l)},
            {"@type": "ListItem", "position": 3, "name": x["title"], "item": url(a, l)}]}]
    faq = x.get("faq", [])
    if faq:
        ld.append({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": ans}} for q, ans in faq]})
    faq_html = ""
    if faq:
        faq_html = f'<section class="faq"><h2>{t["faq"]}</h2>' + "".join(
            f"<details><summary>{e(q)}</summary><p>{e(ans)}</p></details>" for q, ans in faq) + "</section>"
    src_html = f'<section class="sources"><h2>{t["sources"]}</h2><ul>' + "".join(
        f'<li><a href="{e(s["url"])}" target="_blank" rel="noopener nofollow">{e(s["title"])}</a></li>' for s in a["sources"]) + "</ul></section>"
    more = "".join(
        f'<a href="{hrefs_for(o, l, a)}"><img src="{up}{o["image"].replace("-l.webp", "-s.webp")}" alt="" loading="lazy"><span>{e(o[l]["title"])}</span></a>'
        for o in others[:3])
    more_html = (f'<section class="more wrap narrow"><h2>{t["more"]}</h2><div class="more-list">{more}</div>'
                 f'<p class="all-news"><a href="index.html">{t["all"]} →</a></p></section>') if more else ""
    upd = f' · {t["updated"]} {fmt_date(a["updated"], l)}' if a.get("updated") else ""
    page = head(l, x["title"] + " — Spički", x["description"], url(a, l), alts, up, ld, img_abs)
    page += topbar(l, up, hrefs)
    page += f"""
<main>
  <article class="wrap narrow">
    <p class="crumbs"><a href="{up}{HOME[l]}">Spički</a> / <a href="index.html">{t['news']}</a></p>
    <span class="tag">{e(x['tag'])}</span>
    <h1>{e(x['title'])}</h1>
    <p class="news-date"><time datetime="{a['date']}">{fmt_date(a['date'], l)}</time>{upd}</p>
    <p class="lead">{e(x['lead'])}</p>
    <figure class="cover"><img src="{up}{a['image']}" alt="{e(x.get('image_alt', ''))}" fetchpriority="high" style="object-position:{e(a.get('image_pos', '50% 50%'))}"></figure>
    <div class="body">
{x['body']}
    </div>
    {faq_html}
    {src_html}
    {cta(l)}
  </article>
  {more_html}
</main>
"""
    page += footer(l, up)
    return page


def hrefs_for(o, l, _a):
    return f"{o['slug']}.html"


def index_page(items, l):
    t, up = T[l], UP[l]
    alts = {k: idx_url(k) for k in LANGS}
    hrefs = {k: ("index.html" if k == l else {("ru", "sr"): "sr/", ("ru", "en"): "en/", ("sr", "ru"): "../", ("en", "ru"): "../",
                                               ("sr", "en"): "../en/", ("en", "sr"): "../sr/"}[(l, k)]) for k in LANGS}
    ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": t["h"], "url": idx_url(l), "inLanguage": HTML_LANG[l],
          "hasPart": [{"@type": "NewsArticle", "headline": a[l]["title"], "url": url(a, l), "datePublished": a["date"]} for a in items[:30]]}
    cards = "".join(f"""
    <a class="news-card" href="{a['slug']}.html">
      <span class="news-img"><img src="{up}{a['image'].replace('-l.webp', '-s.webp')}" alt="" loading="lazy"></span>
      <span class="news-meta"><time datetime="{a['date']}">{fmt_date(a['date'], l)}</time> · {e(a[l]['tag'])}</span>
      <span class="news-title">{e(a[l]['title'])}</span>
      <span class="news-lead">{e(a[l]['lead'])}</span>
    </a>""" for a in items)
    page = head(l, t["idx_title"], t["idx_desc"], idx_url(l), alts, up, ld, f"{SITE}/img/og-cover.jpg", "website")
    page += topbar(l, up, hrefs)
    page += f"""
<main>
  <section class="wrap narrow news-index">
    <p class="crumbs"><a href="{up}{HOME[l]}">Spički</a> / {t['news']}</p>
    <h1>{t['h']}</h1>
    <p class="lead">{t['idx_lead']}</p>
    <div class="news-list">{cards}
    </div>
    {cta(l)}
  </section>
</main>
"""
    page += footer(l, up)
    return page


def home_block(items):
    data = [{"slug": a["slug"], "date": a["date"], "img": a["image"].replace("-l.webp", "-s.webp"),
             "tag": {l: a[l]["tag"] for l in LANGS}, "title": {l: a[l]["title"] for l in LANGS},
             "desc": {l: a[l]["lead"] for l in LANGS}} for a in items[:3]]
    return "/*NEWS-START*/" + json.dumps(data, ensure_ascii=False) + "/*NEWS-END*/"


def sitemap(items):
    sm = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    static = [u for u in re.findall(r"<url>.*?</url>", sm, re.S) if "/news/" not in u]
    today = date.today().isoformat()
    out = []
    for u in static:
        if re.search(r"<loc>https://spickibg\.com/(sr/|en/)?</loc>", u) and items:
            u = re.sub(r"<lastmod>.*?</lastmod>", f"<lastmod>{items[0]['date']}</lastmod>", u)
        out.append(u)

    def alt(links):
        return "".join(f'<xhtml:link rel="alternate" hreflang="{HREFLANG[k]}" href="{v}"/>' for k, v in links.items())

    newest = items[0]["date"] if items else today
    for l in LANGS:
        out.append(f"<url><loc>{idx_url(l)}</loc><lastmod>{newest}</lastmod>{alt({k: idx_url(k) for k in LANGS})}</url>")
    for a in items:
        links = {k: url(a, k) for k in LANGS}
        for l in LANGS:
            out.append(f"<url><loc>{url(a, l)}</loc><lastmod>{a.get('updated', a['date'])}</lastmod>{alt(links)}</url>")
    return ('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
            'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n  ' + "\n  ".join(out) + "\n</urlset>\n")


def main():
    items = load()
    writes = {}
    for i, a in enumerate(items):
        others = [o for o in items if o is not a]
        for l in LANGS:
            writes[ROOT / SUBDIR[l] / f"{a['slug']}.html"] = article_page(a, l, others)
    for l in LANGS:
        writes[ROOT / SUBDIR[l] / "index.html"] = index_page(items, l)
    home = (ROOT / "index.html").read_text(encoding="utf-8")
    if "/*NEWS-START*/" not in home:
        fail("в index.html нет метки /*NEWS-START*/")
    home = re.sub(r"/\*NEWS-START\*/.*?/\*NEWS-END\*/", lambda m: home_block(items), home, count=1, flags=re.S)
    writes[ROOT / "index.html"] = home
    writes[ROOT / "sitemap.xml"] = sitemap(items)
    # отдельные главные /sr/ и /en/ собираются из обновлённого index.html
    import home_build
    writes.update(home_build.build_from(home))
    for p, s in writes.items():
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(s, encoding="utf-8")
    print(f"OK: новостей {len(items)}, файлов записано {len(writes)}")
    for a in items[:3]:
        print(" ", a["date"], a["slug"])


if __name__ == "__main__":
    main()
