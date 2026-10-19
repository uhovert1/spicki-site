/* Spički: проверка возраста 18+ и уведомление о cookies.
   Подключается на всех страницах. Язык берётся из <html lang>, сайт меняет его при переключении. */
(function () {
  var KEY_AGE = "spicki-age-18", KEY_NOTICE = "spicki-cookie-notice";
  var T = {
    ru: { k: "Только для взрослых", h: "Вам есть 18 лет?", p: "Сайт кальянного лаунжа. Кальяны и алкоголь — только для гостей старше 18 лет.",
          yes: "Да, мне есть 18", no: "Нет", denied: "Извините, сайт и заведение доступны только гостям старше 18 лет.",
          c: "Мы не используем рекламные и аналитические cookies. В браузере сохраняются только выбранный язык и подтверждение возраста.", more: "Политика конфиденциальности", ok: "Понятно" },
    sr: { k: "Samo za odrasle", h: "Da li imate 18 godina?", p: "Sajt nargila lounge-a. Nargile i alkohol — samo za goste starije od 18 godina.",
          yes: "Da, imam 18", no: "Ne", denied: "Izvinite, sajt i lokal su dostupni samo gostima starijim od 18 godina.",
          c: "Ne koristimo reklamne i analitičke kolačiće. U pretraživaču se čuvaju samo izabrani jezik i potvrda godina.", more: "Politika privatnosti", ok: "U redu" },
    en: { k: "Adults only", h: "Are you 18 or older?", p: "This is a hookah lounge website. Hookah and alcohol are for guests aged 18 and over only.",
          yes: "Yes, I'm 18+", no: "No", denied: "Sorry, this website and venue are only for guests aged 18 and over.",
          c: "We don't use advertising or analytics cookies. Your browser only stores your chosen language and age confirmation.", more: "Privacy policy", ok: "Got it" }
  };
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lang() { var l = (document.documentElement.lang || "ru").slice(0, 2); return T[l] ? l : "ru"; }
  var root = document.currentScript && document.currentScript.dataset.root || "";
  var privacy = root + "privacy.html";

  var dlg, bar;
  function fill() {
    var t = T[lang()];
    if (dlg) {
      dlg.querySelector(".ag-k").textContent = t.k;
      dlg.querySelector(".ag-h").textContent = t.h;
      dlg.querySelector(".ag-p").textContent = dlg.classList.contains("denied") ? t.denied : t.p;
      dlg.querySelector(".ag-yes").textContent = t.yes;
      dlg.querySelector(".ag-no").textContent = t.no;
      dlg.querySelector(".ag-more").textContent = t.more;
    }
    if (bar) {
      bar.querySelector(".ck-p").textContent = t.c;
      bar.querySelector(".ck-more").textContent = t.more;
      bar.querySelector(".ck-ok").textContent = t.ok;
    }
  }

  function showNotice() {
    if (get(KEY_NOTICE) || bar) return;
    bar = document.createElement("div");
    bar.className = "ck-bar";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Cookies");
    bar.innerHTML = '<p class="ck-p"></p><div class="ck-actions"><a class="ck-more" href="' + privacy + '"></a><button type="button" class="ck-ok"></button></div>';
    document.body.appendChild(bar);
    document.body.classList.add("has-ck");
    bar.querySelector(".ck-ok").addEventListener("click", function () {
      set(KEY_NOTICE, "1"); bar.remove(); bar = null; document.body.classList.remove("has-ck");
    });
    fill();
  }

  function showGate() {
    dlg = document.createElement("dialog");
    dlg.className = "ag";
    dlg.setAttribute("aria-labelledby", "ag-h");
    dlg.innerHTML =
      '<div class="ag-box">' +
      '<svg class="ag-flame" viewBox="0 0 24 34" aria-hidden="true"><defs><linearGradient id="agf" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#9e140c"/><stop offset=".5" stop-color="#e0301c"/><stop offset="1" stop-color="#ff8a4a"/></linearGradient></defs><path fill="url(#agf)" d="M13.5 1c1.2 5.6 9.5 9.6 9.5 18.6C23 27.4 18 33 12 33S1 27.4 1 20.6c0-5 2.8-8.5 5.6-10.7-.2 3.6 1 6.2 3.3 7.4C9.6 10.6 11.4 5.3 13.5 1Z"/></svg>' +
      '<p class="ag-k"></p><h2 class="ag-h" id="ag-h"></h2><p class="ag-p"></p>' +
      '<div class="ag-actions"><button type="button" class="ag-yes"></button><button type="button" class="ag-no"></button></div>' +
      '<a class="ag-more" href="' + privacy + '"></a></div>';
    document.body.appendChild(dlg);
    document.documentElement.classList.add("ag-lock");
    dlg.addEventListener("cancel", function (e) { e.preventDefault(); });
    dlg.querySelector(".ag-yes").addEventListener("click", function () {
      set(KEY_AGE, "1");
      document.documentElement.classList.remove("ag-lock");
      try { dlg.close(); } catch (e) {}
      dlg.remove(); dlg = null;
      showNotice();
    });
    dlg.querySelector(".ag-no").addEventListener("click", function () {
      dlg.classList.add("denied"); fill();
    });
    fill();
    try { dlg.showModal(); } catch (e) { dlg.setAttribute("open", ""); }
  }

  function start() {
    var isPrivacy = /privacy\.html$/.test(location.pathname);
    if (!get(KEY_AGE) && !isPrivacy) showGate(); else showNotice();
    new MutationObserver(fill).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
