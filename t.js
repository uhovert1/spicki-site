/* Spički: анонимная статистика посещений — без cookies и без сторонних сервисов.
   Отправляем на book.spickibg.com/api/t: страницу, язык, откуда пришли (домен и utm-метки), ширину экрана
   и клики по «Забронировать», Instagram, карте, меню. Сервер не хранит IP — только суточный анонимный хеш.
   Источник визита помним в sessionStorage до закрытия вкладки, чтобы бронь знала, откуда пришёл гость. */
(function () {
  var E = "https://book.spickibg.com/api/t", d = document, L = location, ss = null;
  try { ss = window.sessionStorage; } catch (e) {}
  var q; try { q = new URLSearchParams(L.search); } catch (e) { return; }
  var utm = { source: q.get("utm_source") || "", medium: q.get("utm_medium") || "", campaign: q.get("utm_campaign") || "" };
  var refHost = ""; try { refHost = d.referrer ? new URL(d.referrer).hostname.replace(/^www\./, "") : ""; } catch (e) {}
  var internal = /(^|\.)spickibg\.com$/.test(refHost);
  var nav = (performance.getEntriesByType && performance.getEntriesByType("navigation")[0]) || {};
  var reload = /reload|back_forward/.test(nav.type || "");
  var src = null; try { src = JSON.parse((ss && ss.getItem("sp_src")) || "null"); } catch (e) {}
  var first = false;
  // Новый визит: пришли извне (или впервые в этой вкладке) и это не перезагрузка
  if (!internal && !reload && (!src || d.referrer || utm.source)) {
    src = { r: d.referrer ? d.referrer.split(/[?#]/)[0] : "", h: refHost, u: utm };
    first = true;
    try { ss && ss.setItem("sp_src", JSON.stringify(src)); } catch (e) {}
  }
  src = src || { r: internal ? d.referrer.split(/[?#]/)[0] : "", h: refHost, u: utm };
  var host = L.hostname, site = /^3d\./.test(host) || /^\/3d(\/|$)/.test(L.pathname) ? "3d" : "main";
  var lang = (d.documentElement.lang || "").slice(0, 2);
  function send(o) {
    o.s = site; o.p = L.pathname; o.l = lang; o.r = src.r; o.u = src.u; o.w = window.innerWidth;
    var body = JSON.stringify(o);
    try { if (navigator.sendBeacon && navigator.sendBeacon(E, body)) return; } catch (e) {}
    try { fetch(E, { method: "POST", body: body, mode: "no-cors", keepalive: true }); } catch (e) {}
  }
  send({ k: "view", f: first });

  // Канал для брони: откуда пришёл гость (Google, Instagram…), чтобы в панели было видно, какие брони дал сайт
  var ch = (src.u && src.u.source) || src.h || "direct";
  function targetOf(a) {
    var h = a.getAttribute("href") || "";
    if (/^tel:/i.test(h)) return "phone";
    if (/^mailto:/i.test(h)) return "email";
    var u; try { u = new URL(a.href, L.href); } catch (e) { return null; }
    var x = u.hostname.replace(/^www\./, "");
    if (x === "book.spickibg.com") return "book";
    if (/instagram\.com$|ig\.me$/.test(x)) return "instagram";
    if (/(^|\.)google\.[a-z.]+$/.test(x) && /maps/.test(u.pathname + u.search) || /maps\.app\.goo\.gl$|goo\.gl$|maps\.apple\.com$|yandex\.[a-z]+$/.test(x)) return "maps";
    if (/qastio\./.test(x)) return "menu";
    if (/wolt\.com$/.test(x)) return "wolt";
    if (/^(t\.me|telegram\.me)$/.test(x)) return "telegram";
    if (/^(wa\.me|api\.whatsapp\.com)$/.test(x)) return "whatsapp";
    if (/^3d\.spickibg\.com$/.test(x) || (x === "spickibg.com" && /^\/3d\//.test(u.pathname) && site !== "3d")) return "3d";
    return null;
  }
  function onClick(e) {
    var a = e.target && e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var t = targetOf(a);
    if (!t) return;
    if (t === "book") {
      try { var u = new URL(a.href); if (!u.searchParams.get("ch")) { u.searchParams.set("ch", ch); a.href = u.toString(); } } catch (x) {}
    }
    if (e.type === "click" || e.button === 1) send({ k: "click", t: t });
  }
  d.addEventListener("click", onClick, true);
  d.addEventListener("auxclick", onClick, true);
})();
