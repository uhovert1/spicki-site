/* Spički: проверка возраста 18+ и «Настройки приватности».
   Подключается на всех страницах. Язык интерфейса берётся из <html lang>.

   Что сайт хранит на устройстве (только localStorage, cookies нет):
     spicki-age-18 — подтверждение 18+, хранится 30 дней;
     spicki-lang   — язык, только если посетитель сам нажал RU/SR/EN, хранится 12 месяцев.
   Аналитики, рекламы и пикселей на сайте нет, поэтому баннера согласия нет.
   Если такие технологии появятся, сначала нужен баннер с «Принять все / Отклонить / Настроить». */
(function () {
  var AGE_KEY = "spicki-age-18", LANG_KEY = "spicki-lang", DAY = 864e5, AGE_DAYS = 30;
  var T = {
    ru: { k: "Только для взрослых", h: "Вам есть 18 лет?", p: "Сайт кальянного лаунжа. Кальяны и алкоголь — только для гостей старше 18 лет.",
          remember: "Ответ сохранится на этом устройстве на 30 дней, чтобы не спрашивать на каждой странице.",
          yes: "Да, мне есть 18", no: "Нет", denied: "Извините, сайт и заведение доступны только гостям старше 18 лет.",
          more: "Политика конфиденциальности", open: "Настройки приватности",
          st: "Настройки приватности", sp: "Сайт не использует cookies, аналитику, рекламу и пиксели соцсетей. На этом устройстве хранится только то, что нужно для работы сайта:",
          age: "Подтверждение 18+", ageD: "Чтобы не спрашивать возраст на каждой странице. Срок — 30 дней.",
          lang: "Выбранный язык", langD: "Сохраняется, только если вы сами переключили язык. Срок — 12 месяцев.",
          until: "до", none: "не сохранено",
          clear: "Удалить данные с устройства", cleared: "Данные удалены. При следующем открытии страницы сайт снова спросит возраст.",
          close: "Закрыть" },
    sr: { k: "Samo za odrasle", h: "Da li imate 18 godina?", p: "Sajt nargila lounge-a. Nargile i alkohol — samo za goste starije od 18 godina.",
          remember: "Odgovor se čuva na ovom uređaju 30 dana, da vas ne bismo pitali na svakoj stranici.",
          yes: "Da, imam 18", no: "Ne", denied: "Izvinite, sajt i lokal su dostupni samo gostima starijim od 18 godina.",
          more: "Politika privatnosti", open: "Podešavanja privatnosti",
          st: "Podešavanja privatnosti", sp: "Sajt ne koristi kolačiće, analitiku, reklame ni piksele društvenih mreža. Na ovom uređaju čuva se samo ono što je potrebno za rad sajta:",
          age: "Potvrda 18+", ageD: "Da vas ne bismo pitali za godine na svakoj stranici. Rok — 30 dana.",
          lang: "Izabrani jezik", langD: "Čuva se samo ako ste sami promenili jezik. Rok — 12 meseci.",
          until: "do", none: "nije sačuvano",
          clear: "Obriši podatke sa uređaja", cleared: "Podaci su obrisani. Pri sledećem otvaranju stranice sajt će ponovo pitati za godine.",
          close: "Zatvori" },
    en: { k: "Adults only", h: "Are you 18 or older?", p: "This is a hookah lounge website. Hookah and alcohol are for guests aged 18 and over only.",
          remember: "Your answer is saved on this device for 30 days so we don't ask on every page.",
          yes: "Yes, I'm 18+", no: "No", denied: "Sorry, this website and venue are only for guests aged 18 and over.",
          more: "Privacy policy", open: "Privacy settings",
          st: "Privacy settings", sp: "This site uses no cookies, analytics, ads or social media pixels. This device only stores what the site needs to work:",
          age: "18+ confirmation", ageD: "So we don't ask your age on every page. Kept for 30 days.",
          lang: "Chosen language", langD: "Saved only if you switched the language yourself. Kept for 12 months.",
          until: "until", none: "not saved",
          clear: "Delete data from this device", cleared: "Data deleted. The site will ask your age again next time a page opens.",
          close: "Close" }
  };
  function lang() { var l = (document.documentElement.lang || "ru").slice(0, 2); return T[l] ? l : "ru"; }
  function x() { return T[lang()]; }
  function read(k) {
    try {
      var raw = localStorage.getItem(k); if (!raw) return null;
      var o = JSON.parse(raw);
      if (!o || typeof o !== "object" || !o.exp || o.exp < Date.now()) { localStorage.removeItem(k); return null; }
      return o;
    } catch (e) { try { localStorage.removeItem(k); } catch (e2) {} return null; }
  }
  function write(k, v, days) { try { localStorage.setItem(k, JSON.stringify({ v: v, exp: Date.now() + days * DAY })); } catch (e) {} }
  function fmtDate(ts) { try { return new Date(ts).toLocaleDateString(lang() === "sr" ? "sr-Latn-RS" : lang() === "en" ? "en-GB" : "ru-RU", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { return ""; } }

  var s = document.currentScript, root = (s && s.dataset.root) || "", privacy = root + "privacy.html";
  var gate, panel;

  /* ---------- 18+ ---------- */
  function openGate() {
    gate = document.createElement("dialog");
    gate.className = "ag";
    gate.setAttribute("aria-labelledby", "ag-h");
    gate.innerHTML = '<div class="ag-box">' +
      '<svg class="ag-flame" viewBox="0 0 24 34" aria-hidden="true"><defs><linearGradient id="agf" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#9e140c"/><stop offset=".5" stop-color="#e0301c"/><stop offset="1" stop-color="#ff8a4a"/></linearGradient></defs><path fill="url(#agf)" d="M13.5 1c1.2 5.6 9.5 9.6 9.5 18.6C23 27.4 18 33 12 33S1 27.4 1 20.6c0-5 2.8-8.5 5.6-10.7-.2 3.6 1 6.2 3.3 7.4C9.6 10.6 11.4 5.3 13.5 1Z"/></svg>' +
      '<p class="ag-k" data-k="k"></p><h2 class="ag-h" id="ag-h" data-k="h"></h2><p class="ag-p"></p>' +
      '<div class="ag-actions"><button type="button" class="ag-yes" data-k="yes"></button><button type="button" class="ag-no" data-k="no"></button></div>' +
      '<p class="ag-note" data-k="remember"></p><a class="ag-more" href="' + privacy + '" data-k="more"></a></div>';
    document.body.appendChild(gate);
    document.documentElement.classList.add("ag-lock");
    var ok = false;
    gate.addEventListener("cancel", function (e) { e.preventDefault(); });
    // Chrome закрывает диалог по Esc даже при preventDefault — закрытие не считается подтверждением
    gate.addEventListener("close", function () { if (!ok && gate) { try { gate.showModal(); } catch (e) { gate.setAttribute("open", ""); } } });
    gate.querySelector(".ag-yes").onclick = function () {
      ok = true;
      write(AGE_KEY, 1, AGE_DAYS);
      document.documentElement.classList.remove("ag-lock");
      try { gate.close(); } catch (e) {}
      gate.remove(); gate = null;
    };
    gate.querySelector(".ag-no").onclick = function () { gate.classList.add("denied"); fill(); };
    fill();
    try { gate.showModal(); } catch (e) { gate.setAttribute("open", ""); }
  }

  /* ---------- Настройки приватности ---------- */
  function rows() {
    var a = read(AGE_KEY), l = read(LANG_KEY), t = x();
    function row(title, desc, item, val) {
      return '<li><div><p class="pv-h">' + title + '</p><p class="pv-d">' + desc + '</p></div><p class="pv-s">' +
        (item ? (val ? val + " · " : "") + t.until + " " + fmtDate(item.exp) : t.none) + '</p></li>';
    }
    return '<ul class="pv-list">' + row(t.age, t.ageD, a, "") + row(t.lang, t.langD, l, l ? String(l.v).toUpperCase() : "") + '</ul>';
  }
  function openPanel() {
    if (panel) return;
    panel = document.createElement("dialog");
    panel.className = "pv";
    panel.setAttribute("aria-labelledby", "pv-h");
    panel.innerHTML = '<div class="pv-box"><button type="button" class="pv-x">×</button><h2 id="pv-h" data-k="st"></h2><p class="pv-p" data-k="sp"></p>' +
      '<div class="pv-rows"></div><p class="pv-msg" role="status" aria-live="polite"></p>' +
      '<div class="pv-actions"><button type="button" class="pv-clear" data-k="clear"></button><a class="pv-more" href="' + privacy + '" data-k="more"></a></div></div>';
    document.body.appendChild(panel);
    panel.querySelector(".pv-x").onclick = closePanel;
    panel.addEventListener("cancel", function (e) { e.preventDefault(); closePanel(); });
    panel.addEventListener("click", function (e) { if (e.target === panel) closePanel(); });
    panel.querySelector(".pv-clear").onclick = function () {
      try { localStorage.removeItem(AGE_KEY); localStorage.removeItem(LANG_KEY); } catch (e) {}
      panel.querySelector(".pv-msg").textContent = x().cleared;
      panel.querySelector(".pv-rows").innerHTML = rows();
    };
    fill();
    try { panel.showModal(); } catch (e) { panel.setAttribute("open", ""); }
  }
  function closePanel() { if (panel) { try { panel.close(); } catch (e) {} panel.remove(); panel = null; } }
  window.spickiPrivacy = { open: openPanel };

  /* ---------- тексты ---------- */
  function fill() {
    var t = x();
    [gate, panel].forEach(function (el) {
      if (!el) return;
      el.querySelectorAll("[data-k]").forEach(function (n) { n.textContent = t[n.dataset.k]; });
    });
    if (gate) gate.querySelector(".ag-p").textContent = gate.classList.contains("denied") ? t.denied : t.p;
    if (panel) { panel.querySelector(".pv-x").setAttribute("aria-label", t.close); panel.querySelector(".pv-rows").innerHTML = rows(); }
    document.querySelectorAll("[data-privacy-open]").forEach(function (a) { a.textContent = t.open; });
  }

  function start() {
    document.querySelectorAll("[data-privacy-open]").forEach(function (a) {
      a.addEventListener("click", function (e) { e.preventDefault(); openPanel(); });
    });
    read(LANG_KEY); // удаляет просроченное и старый формат
    var isPrivacy = /privacy\.html$/.test(location.pathname);
    if (!read(AGE_KEY) && !isPrivacy) openGate();
    fill();
    new MutationObserver(fill).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
