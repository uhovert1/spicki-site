#!/usr/bin/env python3
"""Собирает сайт new.spickibg.com (папка new/) — Spički в другом дизайне.

Тексты и переводы берутся из основного index.html (data-t/data-ta + I18N/DYN + SITE),
тексты, которых на основном сайте нет, — из tools/new/texts.json.
Разметка — tools/new/template.html, стили и логика — new/app.css, new/app.js (их правят руками).

Скрипт:
  1) подставляет русский текст в шаблон → new/index.html;
  2) пишет new/data.js (SITE, переводы ru/sr/en, DYN);
  3) копирует в new/ общие файлы: фото, звуки, интро, проверку 18+, иконки.

Запуск:  python3 tools/new_build.py
"""
import hashlib
import json
import re
import shutil
import subprocess
import sys
from html import escape
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import home_build as hb  # noqa: E402

ROOT = hb.ROOT
OUT = ROOT / "new"
SRC = ROOT / "tools" / "new"

COPY = [
    "intro.js", "intro.css", "consent.js", "consent.css",
    "favicon.svg", "favicon-32.png", "apple-touch-icon.png",
    "img/hero-photo.webp", "img/about-hookah.webp", "img/zone-bar.webp", "img/zone-play.webp",
    "img/zone-secret.webp", "img/tuna_steak.webp", "img/midnight-thumb.webp",
]
COPY_DIRS = ["sfx", "img/g"]


def fail(msg):
    print("ОШИБКА new_build:", msg, file=sys.stderr)
    sys.exit(1)


def load(html):
    m = re.search(r"\n(const SITE = \{.*?)\nconst LANGS = ", html, re.S)
    if not m:
        fail("не нашёл блок SITE/I18N/DYN в index.html")
    code = m.group(1) + "\nprocess.stdout.write(JSON.stringify({SITE, I18N, DYN}));"
    out = subprocess.run(["node", "-e", code], capture_output=True, text=True, check=True, timeout=60).stdout
    return json.loads(out)


def ru_dict(html):
    loc = hb.Locator(html)
    loc.feed(html)
    ru = {}
    for s, e, k in loc.inner:
        ru.setdefault(k, html[s:e].strip())
    for s, e, spec in loc.tags:
        tag = html[s:e]
        for part in spec.split(";"):
            attr, k = part.split(":")
            m = re.search(r'\s' + re.escape(attr) + r'="([^"]*)"', tag)
            if m:
                ru.setdefault(k, m.group(1))
    return ru


def main():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    d = load(html)
    ru = ru_dict(html)
    extra = json.loads((SRC / "texts.json").read_text(encoding="utf-8"))
    T = {"ru": {**ru, **extra["ru"]}, "sr": {**ru, **d["I18N"]["sr"], **extra["sr"]}, "en": {**ru, **d["I18N"]["en"], **extra["en"]}}
    # data-ta на основном сайте хранят текст уже экранированным; в атрибуты подставляем как есть
    tpl = (SRC / "template.html").read_text(encoding="utf-8")

    used = set(re.findall(r'data-t="([^"]+)"', tpl)) | {k.split(":")[1] for spec in re.findall(r'data-ta="([^"]+)"', tpl) for k in spec.split(";")}
    missing = sorted(k for k in used for l in ("ru", "sr", "en") if k not in T[l])
    if missing:
        fail("нет текстов: " + ", ".join(sorted(set(missing))))

    def fill_inner(m):
        return m.group(1) + T["ru"][m.group(3)] + m.group(4)
    out = re.sub(r'(<(\w+)\b[^>]*\sdata-t="([^"]+)"[^>]*>)(</\2>)', fill_inner, tpl)

    def fill_tag(m):
        tag = m.group(0)
        for part in m.group(1).split(";"):
            attr, k = part.split(":")
            val = T["ru"][k]
            if re.search(r'\s' + attr + r'="', tag):
                tag = re.sub(r'(\s' + attr + r'=")[^"]*"', lambda x: x.group(1) + val + '"', tag)
            else:
                tag = tag.replace(" data-ta=", f' {attr}="{val}" data-ta=', 1)
        return tag
    out = re.sub(r'<[^>]*\sdata-ta="([^"]+)"[^>]*>', fill_tag, out)

    ld = re.search(r'<script type="application/ld\+json">(\{"@context": "https://schema.org", "@type": "BarOrPub".*?)</script>', html, re.S)
    if not ld:
        fail("не нашёл JSON-LD заведения в index.html")

    data = {"SITE": d["SITE"], "T": T, "DYN": d["DYN"]}
    data_js = "/* Сгенерировано tools/new_build.py из index.html и tools/new/texts.json — руками не править */\nwindow.SP = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"

    OUT.mkdir(exist_ok=True)
    (OUT / "data.js").write_text(data_js, encoding="utf-8")
    ver = hashlib.sha1((data_js + (OUT / "app.js").read_text(encoding="utf-8") + (OUT / "app.css").read_text(encoding="utf-8")).encode()).hexdigest()[:8]
    page = (out.replace("{{n.title}}", escape(T["ru"]["n.title"]))
               .replace("{{hero.h1}}", escape(re.sub("<[^>]+>", "", T["ru"]["hero.h1"])))
               .replace("{{meta}}", escape(d["DYN"]["ru"]["meta"]))
               .replace("{{ld}}", ld.group(1))
               .replace("{{v}}", ver))
    if "{{" in page:
        fail("в шаблоне остались {{…}}: " + ", ".join(set(re.findall(r"\{\{[^}]+\}\}", page))))
    (OUT / "index.html").write_text(page, encoding="utf-8")

    for f in COPY:
        (OUT / f).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / f, OUT / f)
    for dd in COPY_DIRS:
        shutil.copytree(ROOT / dd, OUT / dd, dirs_exist_ok=True)
    # «печатные» растровые копии фото для анимации галереи (как страницы комикса)
    import halftone
    for g in d["SITE"]["gallery"]:
        src, dst = ROOT / "img" / "g" / f"{g['n']}-l.webp", OUT / "img" / "g" / f"{g['n']}-p.webp"
        if not dst.exists() or dst.stat().st_mtime < src.stat().st_mtime:
            halftone.main(str(src), str(dst))
    print(f"OK: new/ собран (v={ver}, ключей ru={len(T["ru"])})")


if __name__ == "__main__":
    main()
