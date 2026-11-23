Spički — new.spickibg.com: тот же сайт в красно-чёрном «плакатном» дизайне (лучи, наклонные плашки, жёсткие тени).

Что руками правят: new/app.css (стили), new/app.js (логика), tools/new/template.html (разметка), tools/new/texts.json (тексты, которых нет на основном сайте).
Всё остальное собирает  python3 tools/new_build.py  — его же вызывает tools/news_build.py, поэтому новости, меню, часы и переводы
подтягиваются из основного index.html автоматически. new/index.html и new/data.js руками не править.

Папка самодостаточная (свои шрифты, фото, звуки, интро, проверка 18+) — её отдаёт Render (static site, publish path: new).
Страница закрыта от индексации (noindex) и указывает canonical на https://spickibg.com/, чтобы не было дублей в поиске.
Язык: ?lang=ru|sr|en, иначе выбранный ранее, иначе язык устройства. Интро: ?intro / ?nointro.
Шрифты: Seymour One, Oswald, Mulish — SIL Open Font License (fonts/OFL-*.txt).
