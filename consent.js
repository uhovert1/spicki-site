/* Spički: проверка возраста 18+ и «Настройки приватности».
   Подключается на всех страницах. Язык интерфейса берётся из <html lang>.

   Что сайт хранит на устройстве:
     spicki-age-18 — подтверждение 18+, хранится 30 дней;
     spicki-lang   — язык, только если посетитель сам нажал RU/SR/EN, хранится 12 месяцев;
     spicki-ads    — выбор в баннере про рекламу Meta: согласие 12 месяцев, отказ 6 месяцев.
   Пиксель Meta (Facebook/Instagram) загружается ТОЛЬКО после «Принять» в баннере (закон о защите данных Сербии,
   ст. 12 ч. 1 п. 1 — согласие). До выбора и после отказа никаких запросов в Meta и cookies нет.
   <noscript>-картинку пикселя на страницы не ставим: она срабатывает без согласия. */
(function () {
  var AGE_KEY = "spicki-age-18", LANG_KEY = "spicki-lang", ADS_KEY = "spicki-ads", DAY = 864e5, AGE_DAYS = 30;
  var PIXEL_ID = "2237276870536129", ADS_YES_DAYS = 365, ADS_NO_DAYS = 182;
  var T = {
    ru: { k: "Только для взрослых", h: "Вам есть 18 лет?", p: "Сайт кальянного лаунжа. Кальяны и алкоголь — только для гостей старше 18 лет.",
          remember: "Ответ сохранится на этом устройстве на 30 дней, чтобы не спрашивать на каждой странице.",
          yes: "Да, мне есть 18", no: "Нет", denied: "Извините, сайт и заведение доступны только гостям старше 18 лет.",
          more: "Политика конфиденциальности", open: "Настройки приватности",
          st: "Настройки приватности", sp: "Без вашего согласия сайт не использует cookies, рекламу и пиксели соцсетей. На этом устройстве хранится:",
          ads: "Реклама Meta (Facebook, Instagram)", adsD: "Пиксель Meta ставит cookies и сообщает Meta, что вы были на сайте, — чтобы показывать рекламу Spički и считать её результаты.",
          adsOn: "разрешено", adsOff: "отклонено", adsAllow: "Разрешить рекламу Meta", adsStop: "Отключить рекламу Meta",
          bh: "Реклама Spički в Instagram и Facebook", bp: "Можно включить пиксель Meta? Он ставит cookies и сообщает Meta, что вы были на сайте, — чтобы показывать вам рекламу Spički. Без согласия ничего не загружается.",
          accept: "Принять", decline: "Отклонить", custom: "Подробнее",
          age: "Подтверждение 18+", ageD: "Чтобы не спрашивать возраст на каждой странице. Срок — 30 дней.",
          lang: "Выбранный язык", langD: "Сохраняется, только если вы сами переключили язык. Срок — 12 месяцев.",
          until: "до", none: "не сохранено",
          clear: "Удалить данные с устройства", cleared: "Данные удалены. При следующем открытии страницы сайт снова спросит возраст.",
          close: "Закрыть" },
    sr: { k: "Samo za odrasle", h: "Da li imate 18 godina?", p: "Sajt nargila lounge-a. Nargile i alkohol — samo za goste starije od 18 godina.",
          remember: "Odgovor se čuva na ovom uređaju 30 dana, da vas ne bismo pitali na svakoj stranici.",
          yes: "Da, imam 18", no: "Ne", denied: "Izvinite, sajt i lokal su dostupni samo gostima starijim od 18 godina.",
          more: "Politika privatnosti", open: "Podešavanja privatnosti",
          st: "Podešavanja privatnosti", sp: "Bez vašeg pristanka sajt ne koristi kolačiće, reklame ni piksele društvenih mreža. Na ovom uređaju se čuva:",
          ads: "Reklame Meta (Facebook, Instagram)", adsD: "Piksel Meta postavlja kolačiće i javlja kompaniji Meta da ste posetili sajt — da bi se prikazivale reklame Spički i merili rezultati.",
          adsOn: "dozvoljeno", adsOff: "odbijeno", adsAllow: "Dozvoli reklame Meta", adsStop: "Isključi reklame Meta",
          bh: "Reklame Spički na Instagramu i Facebooku", bp: "Da li smemo da uključimo piksel Meta? On postavlja kolačiće i javlja kompaniji Meta da ste posetili sajt — da biste videli reklame Spički. Bez pristanka ništa se ne učitava.",
          accept: "Prihvati", decline: "Odbij", custom: "Više",
          age: "Potvrda 18+", ageD: "Da vas ne bismo pitali za godine na svakoj stranici. Rok — 30 dana.",
          lang: "Izabrani jezik", langD: "Čuva se samo ako ste sami promenili jezik. Rok — 12 meseci.",
          until: "do", none: "nije sačuvano",
          clear: "Obriši podatke sa uređaja", cleared: "Podaci su obrisani. Pri sledećem otvaranju stranice sajt će ponovo pitati za godine.",
          close: "Zatvori" },
    en: { k: "Adults only", h: "Are you 18 or older?", p: "This is a hookah lounge website. Hookah and alcohol are for guests aged 18 and over only.",
          remember: "Your answer is saved on this device for 30 days so we don't ask on every page.",
          yes: "Yes, I'm 18+", no: "No", denied: "Sorry, this website and venue are only for guests aged 18 and over.",
          more: "Privacy policy", open: "Privacy settings",
          st: "Privacy settings", sp: "Without your consent this site uses no cookies, ads or social media pixels. This device stores:",
          ads: "Meta ads (Facebook, Instagram)", adsD: "The Meta pixel sets cookies and tells Meta you visited the site — so Spički ads can be shown and measured.",
          adsOn: "allowed", adsOff: "declined", adsAllow: "Allow Meta ads", adsStop: "Turn off Meta ads",
          bh: "Spički ads on Instagram and Facebook", bp: "May we switch on the Meta pixel? It sets cookies and tells Meta you visited the site, so you can see Spički ads. Nothing loads without your consent.",
          accept: "Accept", decline: "Decline", custom: "Details",
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
  var gate, panel, banner;

  /* ---------- Реклама Meta: пиксель только с согласия ---------- */
  function adsChoice() { var a = read(ADS_KEY); return a ? a.v : null; }   // 1 — согласие, 0 — отказ, null — не спрашивали
  function loadPixel() {
    if (window.fbq) return;
    /* Meta Pixel Code */
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', PIXEL_ID);
    fbq('track', 'PageView');
    /* End Meta Pixel Code */
  }
  function dropFbCookies() {
    var host = location.hostname, doms = ["", host, "." + host, "." + host.split(".").slice(-2).join(".")];
    ["_fbp", "_fbc"].forEach(function (n) {
      doms.forEach(function (d) { document.cookie = n + "=; Max-Age=0; path=/" + (d ? "; domain=" + d : ""); });
    });
  }
  function setAds(yes) {
    write(ADS_KEY, yes ? 1 : 0, yes ? ADS_YES_DAYS : ADS_NO_DAYS);
    closeBanner();
    if (yes) loadPixel();
    else { dropFbCookies(); if (window.fbq) location.reload(); }   // уже загруженный пиксель выгружается только перезагрузкой
  }
  function openBanner() {
    if (banner || adsChoice() !== null) return;
    banner = document.createElement("section");
    banner.className = "cb";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-labelledby", "cb-h");
    banner.innerHTML = '<div class="cb-box"><p class="cb-h" id="cb-h" data-k="bh"></p><p class="cb-p" data-k="bp"></p>' +
      '<div class="cb-actions"><button type="button" class="cb-yes" data-k="accept"></button><button type="button" class="cb-no" data-k="decline"></button>' +
      '<a class="cb-more" href="' + privacy + '#s13" data-k="custom"></a></div></div>';
    document.body.appendChild(banner);
    banner.querySelector(".cb-yes").onclick = function () { setAds(true); };
    banner.querySelector(".cb-no").onclick = function () { setAds(false); };
    banner.querySelector(".cb-more").onclick = function (e) { e.preventDefault(); openPanel(); };
    fill();
  }
  function closeBanner() { if (banner) { banner.remove(); banner = null; } }

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
      openBanner();
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
    var ad = read(ADS_KEY);
    return '<ul class="pv-list">' + row(t.ads, t.adsD, ad, ad ? (ad.v ? t.adsOn : t.adsOff) : "") + row(t.age, t.ageD, a, "") + row(t.lang, t.langD, l, l ? String(l.v).toUpperCase() : "") + '</ul>';
  }
  function openPanel() {
    if (panel) return;
    panel = document.createElement("dialog");
    panel.className = "pv";
    panel.setAttribute("aria-labelledby", "pv-h");
    panel.innerHTML = '<div class="pv-box"><button type="button" class="pv-x">×</button><h2 id="pv-h" data-k="st"></h2><p class="pv-p" data-k="sp"></p>' +
      '<div class="pv-rows"></div><p class="pv-msg" role="status" aria-live="polite"></p>' +
      '<div class="pv-actions"><button type="button" class="pv-ads"></button><button type="button" class="pv-clear" data-k="clear"></button><a class="pv-more" href="' + privacy + '" data-k="more"></a></div></div>';
    document.body.appendChild(panel);
    panel.querySelector(".pv-x").onclick = closePanel;
    panel.addEventListener("cancel", function (e) { e.preventDefault(); closePanel(); });
    panel.addEventListener("click", function (e) { if (e.target === panel) closePanel(); });
    panel.querySelector(".pv-ads").onclick = function () {
      var on = adsChoice() === 1;
      setAds(!on);
      fill();
    };
    panel.querySelector(".pv-clear").onclick = function () {
      try { localStorage.removeItem(AGE_KEY); localStorage.removeItem(LANG_KEY); localStorage.removeItem(ADS_KEY); } catch (e) {}
      dropFbCookies();
      if (window.fbq) { location.reload(); return; }
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
    [gate, panel, banner].forEach(function (el) {
      if (!el) return;
      el.querySelectorAll("[data-k]").forEach(function (n) { n.textContent = t[n.dataset.k]; });
    });
    if (gate) gate.querySelector(".ag-p").textContent = gate.classList.contains("denied") ? t.denied : t.p;
    if (panel) {
      panel.querySelector(".pv-x").setAttribute("aria-label", t.close); panel.querySelector(".pv-rows").innerHTML = rows();
      panel.querySelector(".pv-ads").textContent = adsChoice() === 1 ? t.adsStop : t.adsAllow;
    }
    document.querySelectorAll("[data-privacy-open]").forEach(function (a) { a.textContent = t.open; });
  }

  function start() {
    document.querySelectorAll("[data-privacy-open]").forEach(function (a) {
      a.addEventListener("click", function (e) { e.preventDefault(); openPanel(); });
    });
    read(LANG_KEY); // удаляет просроченное и старый формат
    var isPrivacy = /privacy\.html$/.test(location.pathname);
    if (adsChoice() === 1) loadPixel();
    if (!read(AGE_KEY) && !isPrivacy) openGate();
    else openBanner();
    fill();
    new MutationObserver(fill).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
