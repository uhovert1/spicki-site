#!/usr/bin/env python3
"""Собирает отдельные главные страницы /sr/ и /en/ из index.html.

Источник один — index.html (русская версия, корень сайта). Скрипт берёт переводы
из объектов I18N и DYN внутри index.html и подставляет их в разметку
(элементы с data-t и атрибуты из data-ta), меняет <head> (title, description,
canonical, og, JSON-LD), пути к файлам и переключатель языков.

Готовые sr/index.html и en/index.html руками не правят: правки вносят в index.html
и запускают  python3 tools/home_build.py  (его же вызывает tools/news_build.py).
"""
import json
import re
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://spickibg.com"
LANGS = ["ru", "sr", "en"]
HTML_LANG = {"ru": "ru", "sr": "sr-Latn", "en": "en"}
OG_LOCALE = {"ru": "ru_RU", "sr": "sr_RS", "en": "en_GB"}
PAGE_URL = {"ru": f"{SITE}/", "sr": f"{SITE}/sr/", "en": f"{SITE}/en/"}
PRIVACY_BTN = {"sr": "Podešavanja privatnosti", "en": "Privacy settings"}  # как в consent.js
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}


def fail(msg):
    print("ОШИБКА home_build:", msg, file=sys.stderr)
    sys.exit(1)


def load_dicts(html):
    m = re.search(r"\n(const SITE = \{.*?)\nconst LANGS = ", html, re.S)
    if not m:
        fail("не нашёл блок SITE/I18N/DYN в index.html")
    code = m.group(1) + "\nprocess.stdout.write(JSON.stringify({I18N, DYN}));"
    try:
        out = subprocess.run(["node", "-e", code], capture_output=True, text=True, check=True, timeout=60).stdout
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        fail(f"node не смог прочитать переводы: {getattr(e, 'stderr', e)}")
    d = json.loads(out)
    return d["I18N"], d["DYN"]


class Locator(HTMLParser):
    """Находит границы содержимого элементов с data-t и стартовые теги с data-ta."""

    def __init__(self, html):
        super().__init__(convert_charrefs=False)
        self.lines = [0]
        for line in html.splitlines(keepends=True):
            self.lines.append(self.lines[-1] + len(line))
        self.stack, self.inner, self.tags = [], [], []

    def off(self):
        ln, col = self.getpos()
        return self.lines[ln - 1] + col

    def handle_starttag(self, tag, attrs):
        start = self.off()
        text = self.get_starttag_text()
        a = dict(attrs)
        if "data-ta" in a:
            self.tags.append((start, start + len(text), a["data-ta"]))
        if tag in VOID:
            return
        self.stack.append((tag, a.get("data-t"), start + len(text)))

    def handle_startendtag(self, tag, attrs):
        start = self.off()
        a = dict(attrs)
        if "data-ta" in a:
            self.tags.append((start, start + len(self.get_starttag_text()), a["data-ta"]))

    def handle_endtag(self, tag):
        end = self.off()
        while self.stack:
            t, key, cstart = self.stack.pop()
            if t == tag:
                if key:
                    self.inner.append((cstart, end, key))
                return


def esc_attr(s):
    return s.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;").replace(">", "&gt;")


def translate(html, lang, I18N):
    d = I18N[lang]
    loc = Locator(html)
    loc.feed(html)
    loc.close()
    edits, missing = [], set()
    # содержимое data-t (вложенные внутрь другого data-t пропускаем — их заменит внешний)
    spans = sorted(loc.inner)
    outer = []
    for s, e, k in spans:
        if any(os_ <= s and e <= oe for os_, oe in outer):
            continue
        outer.append((s, e))
        if k in d:
            edits.append((s, e, d[k]))
        else:
            missing.add(k)
    # атрибуты data-ta
    for s, e, spec in loc.tags:
        tagtext = html[s:e]
        new = tagtext
        for pair in spec.split(";"):
            attr, k = pair.split(":")
            if k not in d:
                missing.add(k)
                continue
            new = re.sub(rf'(\s{re.escape(attr)}=")[^"]*(")', lambda m: m.group(1) + esc_attr(d[k]) + m.group(2), new, count=1)
        if new != tagtext:
            edits.append((s, e, new))
    # проверяем, что правки не пересекаются, и применяем с конца
    edits.sort()
    for (s1, e1, _), (s2, e2, _) in zip(edits, edits[1:]):
        if s2 < e1:
            fail(f"пересекающиеся правки около позиции {s2}")
    for s, e, new in reversed(edits):
        html = html[:s] + new + html[e:]
    return html, missing


def sub1(pattern, repl, s, what):
    new, n = re.subn(pattern, repl, s, count=1, flags=re.S)
    if n != 1:
        fail(f"не нашёл в index.html: {what}")
    return new


def build(lang, src, I18N, DYN):
    d = I18N[lang]
    for k in ("title", "meta", "og", "ld"):
        if k not in d:
            fail(f"в I18N.{lang} нет ключа «{k}»")
    html, missing = translate(src, lang, I18N)
    up = "../"
    # пути к файлам: относительные src/href получают ../ (кроме якорей, внешних ссылок и шаблонов JS)
    html = re.sub(r'(?<![\w-])(src|href)="(?!https?:|#|mailto:|tel:|data:|/|\$\{)([^"]+)"', lambda m: f'{m.group(1)}="{up}{m.group(2)}"', html)
    html = html.replace('<script src="../consent.js" data-root="">', '<script src="../consent.js" data-root="../">')
    # переключатель языков
    hrefs = {"ru": "../", "sr": "../sr/" if lang != "sr" else "./", "en": "../en/" if lang != "en" else "./"}
    links = "".join(
        f'<a href="{hrefs[k]}" hreflang="{HTML_LANG[k]}" lang="{HTML_LANG[k]}" data-lang="{k}"{" aria-current=\"page\"" if k == lang else ""}>{k.upper()}</a>'
        for k in LANGS)
    html = sub1(r'<a href="[^"]*" hreflang="ru" lang="ru" data-lang="ru".*?data-lang="en"[^>]*>EN</a>', lambda m: links, html, "переключатель языков")
    # тексты, которые на странице дописывает JS: статус часов и кнопка приватности (из consent.js)
    html = sub1(r'<span id="status-text">[^<]*</span>', lambda m: f'<span id="status-text">{DYN[lang]["daily"]}</span>', html, "status-text")
    html = sub1(r'data-privacy-open>[^<]*</a>', lambda m: f'data-privacy-open>{PRIVACY_BTN[lang]}</a>', html, "кнопка приватности")
    # <head>
    html = sub1(r'<html lang="ru" data-page="ru" data-root="">', f'<html lang="{HTML_LANG[lang]}" data-page="{lang}" data-root="{up}">', html, "<html>")
    html = sub1(r"<title>.*?</title>", lambda m: f"<title>{d['title']}</title>", html, "<title>")
    html = sub1(r'<meta name="description" content="[^"]*">', lambda m: f'<meta name="description" content="{esc_attr(d["meta"])}">', html, "description")
    html = sub1(r'<meta property="og:title" content="[^"]*">', lambda m: f'<meta property="og:title" content="{esc_attr(d["og"])}">', html, "og:title")
    html = sub1(r'<meta property="og:description" content="[^"]*">', lambda m: f'<meta property="og:description" content="{esc_attr(d["meta"])}">', html, "og:description")
    html = sub1(r'<meta property="og:locale" content="[^"]*">', f'<meta property="og:locale" content="{OG_LOCALE[lang]}">', html, "og:locale")
    html = sub1(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{PAGE_URL[lang]}">', html, "og:url")
    html = sub1(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{PAGE_URL[lang]}">', html, "canonical")
    ld = re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
    if not ld:
        fail("нет JSON-LD")
    data = json.loads(ld.group(1))
    data["description"] = d["ld"]
    html = html[:ld.start(1)] + json.dumps(data, ensure_ascii=False) + html[ld.end(1):]
    note = f"<!-- Сгенерировано tools/home_build.py из index.html ({lang}). Не править вручную. -->\n"
    html = html.replace("<!doctype html>\n", "<!doctype html>\n" + note, 1)
    return html, missing


def build_from(src):
    """Вернуть {путь: html} для /sr/ и /en/ по тексту index.html (без записи на диск)."""
    I18N, DYN = load_dicts(src)
    out = {}
    for lang in ("sr", "en"):
        html, missing = build(lang, src, I18N, DYN)
        if missing:
            print(f"  внимание: в I18N.{lang} нет перевода для {sorted(missing)} — оставлен русский текст")
        out[ROOT / lang / "index.html"] = html
    return out


def main():
    out = build_from((ROOT / "index.html").read_text(encoding="utf-8"))
    for p, s in out.items():
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(s, encoding="utf-8")
    print(f"OK: главные /sr/ и /en/ собраны ({len(out)} файла)")


if __name__ == "__main__":
    main()
