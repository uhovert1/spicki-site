/* Spički — new.spickibg.com: языки, часы «открыто сейчас», меню, галерея, статьи и новости,
   бронь (онлайн и сообщение в Instagram), нижняя панель и окно брони. Данные — data.js (window.SP). */
(function () {
  "use strict";
  var SP = window.SP, SITE = SP.SITE, d = document, H = d.documentElement;
  var LANGS = ["ru", "sr", "en"], MAIN = "https://spickibg.com/";
  var lang = LANGS.indexOf(H.dataset.lang) >= 0 ? H.dataset.lang : "ru";
  var $ = function (id) { return d.getElementById(id); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var t = function (k) { var v = SP.T[lang][k]; return v == null ? (SP.T.ru[k] == null ? "" : SP.T.ru[k]) : v; };
  var D = function () { return SP.DYN[lang]; };
  var plain = function (s) { var x = d.createElement("div"); x.innerHTML = s; return x.textContent; };
  H.classList.add("js");

  var enc = encodeURIComponent, placeName = "Spički, Mačvanska 10, Beograd";
  var L = {};
  for (var k in SITE.links) L[k] = SITE.links[k];
  L.mapCard = "https://www.google.com/maps/search/?api=1&query=" + enc(placeName) + "&query_place_id=" + SITE.placeId;
  L.route = "https://www.google.com/maps/dir/?api=1&destination=" + enc(placeName) + "&destination_place_id=" + SITE.placeId;
  L.review = "https://search.google.com/local/writereview?placeid=" + SITE.placeId;
  $$("[data-href]").forEach(function (a) { if (L[a.dataset.href]) a.href = L[a.dataset.href]; });

  /* ---------- онлайн-бронь: зона + язык ---------- */
  function bookingHref(zone) {
    var u = new URL(L.booking);
    if (zone) u.searchParams.set("zone", zone);
    u.searchParams.set("lang", lang);
    return u.href;
  }
  function syncBooking() { $$("[data-book]").forEach(function (a) { a.href = bookingHref(a.dataset.book); }); }

  /* ---------- часы и «открыто сейчас» по времени Белграда ---------- */
  var fmt = function (s) { var p = s.split(":").map(Number); return String(p[0] % 24).padStart(2, "0") + ":" + String(p[1]).padStart(2, "0"); };
  var toMin = function (s) { var p = s.split(":").map(Number); return p[0] * 60 + p[1]; };
  var bgDay = null, bgMin = null;
  function clock() {
    try {
      var p = {};
      new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Belgrade", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
        .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      bgDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
      bgMin = Number(p.hour) * 60 + Number(p.minute);
    } catch (e) {}
  }
  function renderHours() {
    clock();
    var order = [1, 2, 3, 4, 5, 6, 0];
    $("hours").innerHTML = order.map(function (dd, i) {
      return "<tr" + (dd === bgDay ? ' class="today"' : "") + "><td>" + esc(D().days[i]) + "</td><td>" + fmt(SITE.hours[dd][0]) + "–" + fmt(SITE.hours[dd][1]) + "</td></tr>";
    }).join("");
    var text = D().daily, on = false;
    if (bgDay !== null && bgDay >= 0) {
      var h = SITE.hours[bgDay], o = toMin(h[0]), c = toMin(h[1]);
      var prev = SITE.hours[(bgDay + 6) % 7], spill = toMin(prev[1]) - 1440;
      if (bgMin >= o && bgMin < c) { on = true; text = D().openTill + " " + fmt(h[1]); }
      else if (spill > 0 && bgMin < spill) { on = true; text = D().openTill + " " + fmt(prev[1]); }
      else if (bgMin < o) text = D().today + " " + fmt(h[0]);
      else text = D().tomorrow + " " + fmt(SITE.hours[(bgDay + 1) % 7][0]);
    }
    $$("[data-status]").forEach(function (el) { el.textContent = text; });
    $$("[data-status-dot]").forEach(function (el) { el.classList.toggle("on", on); });
  }

  /* ---------- меню ---------- */
  var menuTab = 0;
  function renderMenu() {
    $("menu-tabs").innerHTML = SITE.menu.map(function (col, i) {
      return '<button type="button" role="tab" aria-selected="' + (i === menuTab) + '" data-i="' + i + '">' + esc(col.title[lang]) + "</button>";
    }).join("");
    var col = SITE.menu[menuTab];
    $("menu-list").innerHTML = col.items.map(function (it) {
      return '<li class="dish"><b>' + esc(it.name[lang]) + '</b><em class="pr">' + esc(it.price) + "</em>" + (it.desc ? "<span>" + esc(it.desc[lang]) + "</span>" : "") + "</li>";
    }).join("");
  }
  $("menu-tabs").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-i]"); if (!b) return;
    menuTab = +b.dataset.i; renderMenu();
  });

  /* ---------- галерея ---------- */
  var ROT = ["-1.6deg", "1.2deg", "-.6deg", "1.8deg", "-1.1deg", ".7deg"];
  function renderGallery() {
    $("gal").innerHTML = SITE.gallery.map(function (g, i) {
      return '<figure><button type="button" data-i="' + i + '" style="--r:' + ROT[i % ROT.length] + '" aria-label="' + esc(D().open) + ": " + esc(g.alt[lang]) + '"><img src="img/g/' + g.n + '-s.webp" width="' + g.w + '" height="' + g.h + '" alt="' + esc(g.alt[lang]) + '" loading="lazy" decoding="async"></button></figure>';
    }).join("");
  }
  var lb = $("lb"), lbImg = $("lb-img"), lbCap = $("lb-cap"), lbI = 0;
  function lbShow(i) {
    var n = SITE.gallery.length; lbI = (i + n) % n; var g = SITE.gallery[lbI];
    lbImg.src = "img/g/" + g.n + "-l.webp"; lbImg.alt = g.alt[lang];
    lbCap.textContent = g.alt[lang] + " · " + (lbI + 1) + " / " + n;
  }
  function openDlg(dl) { try { dl.showModal(); } catch (e) { dl.setAttribute("open", ""); } }
  function closeDlg(dl) { if (dl.close) dl.close(); else dl.removeAttribute("open"); }
  $("gal").addEventListener("click", function (e) { var b = e.target.closest("button[data-i]"); if (!b) return; lbShow(+b.dataset.i); openDlg(lb); });
  $("lb-prev").onclick = function () { lbShow(lbI - 1); };
  $("lb-next").onclick = function () { lbShow(lbI + 1); };
  $("lb-close").onclick = function () { closeDlg(lb); };
  lb.addEventListener("click", function (e) { if (e.target === lb || e.target.tagName === "FIGURE") closeDlg(lb); });
  lb.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") lbShow(lbI - 1); if (e.key === "ArrowRight") lbShow(lbI + 1); });
  var tx = null;
  lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) lbShow(lbI + (dx < 0 ? 1 : -1)); tx = null; });

  /* ---------- статьи и новости (живут на основном сайте) ---------- */
  function renderRead() {
    $("arts").innerHTML = SITE.articles.map(function (a) {
      return '<a class="art" href="' + MAIN + "articles/" + a.slug + ".html#" + lang + '"><img src="' + a.img + '" alt="" loading="lazy" width="800" height="500"><span class="ai"><span class="tg">' + esc(a.tag[lang]) + "</span><b>" + esc(a.title[lang]) + '</b><span class="d">' + esc(a.desc[lang]) + '</span><span class="more">' + esc(D().read) + " →</span></span></a>";
    }).join("");
    var n = SITE.news || [];
    $("news").hidden = !n.length;
    var base = MAIN + ({ ru: "news/", sr: "news/sr/", en: "news/en/" }[lang]);
    $("news-all").href = base;
    $("news-list").innerHTML = n.map(function (a) {
      var dt = a.date;
      try { dt = new Date(a.date + "T12:00:00").toLocaleDateString(D().locale, { day: "numeric", month: "long", year: "numeric" }); } catch (e) {}
      return '<a class="nw" href="' + base + a.slug + '.html"><img src="' + MAIN + a.img + '" alt="" loading="lazy" width="72" height="72"><span><small>' + esc(dt) + " · " + esc(a.tag[lang]) + "</small><b>" + esc(a.title[lang]) + "</b></span></a>";
    }).join("");
  }

  /* ---------- ссылки «мы в сети» ---------- */
  function renderLinks() {
    var ln = D().links;
    var rows = [[ln[5], "book.spickibg.com", bookingHref("")], [ln[0], "@spicki_bg", L.instagram], [ln[1], "@spicki_bg", L.threads], [ln[2], "Wolt", L.wolt], [ln[3], "Qastio", L.menu]];
    $("links").innerHTML = rows.map(function (r) {
      return '<li><a href="' + r[2] + '" target="_blank" rel="noopener"><span>' + esc(r[0]) + "</span><span>" + esc(r[1]) + " ↗</span></a></li>";
    }).join("");
  }

  /* ---------- бронь через Instagram ---------- */
  try {
    var now = new Date(), iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    $("b-date").value = iso; $("b-date").min = iso;
  } catch (e) {}
  function fmtDate(v) {
    if (!v) return "";
    var p = v.split("-").map(Number);
    try { return new Date(p[0], p[1] - 1, p[2]).toLocaleDateString(D().locale, { day: "numeric", month: "long", weekday: "long" }); } catch (e) { return v; }
  }
  function message() {
    var M = D().msg, z = $("b-zone"), n = $("b-name").value.trim(), note = $("b-note").value.trim();
    return M[0] + "\n" + M[1] + ": " + z.options[z.selectedIndex].text + "\n" + M[2] + ": " + (fmtDate($("b-date").value) || "—") + "\n" + M[3] + ": " + ($("b-time").value || "—") + "\n" + M[4] + ": " + $("b-guests").value +
      (n ? "\n" + M[5] + ": " + n : "") + (note ? "\n" + M[6] + ": " + note : "");
  }
  function updatePreview() { $("b-preview").textContent = message(); }
  ["b-date", "b-time", "b-guests", "b-zone", "b-name", "b-note"].forEach(function (id) { $(id).addEventListener("input", updatePreview); $(id).addEventListener("change", updatePreview); });
  $("book-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var hint = $("b-hint");
    if (!$("b-date").value || !$("b-time").value) { hint.dataset.state = ""; hint.textContent = D().needDate; return; }
    var txt = message();
    var a = d.createElement("a"); a.href = L.instagramDM; a.target = "_blank"; a.rel = "noopener";
    var sel = function () { var r = d.createRange(); r.selectNodeContents($("b-preview")); var s = getSelection(); s.removeAllRanges(); s.addRange(r); };
    var p = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(txt) : Promise.reject();
    p.then(function () { hint.dataset.state = "ok"; hint.textContent = D().copied; })
     .catch(function () { sel(); hint.dataset.state = ""; hint.textContent = D().copyFail; });
    d.body.appendChild(a); a.click(); a.remove();
  });

  /* ---------- окно брони ---------- */
  var sheet = $("sheet"), shZone = "main";
  function setSheetZone(z) {
    shZone = z || "main";
    $$("#sh-zones button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.z === shZone)); });
    $("sh-online").dataset.book = shZone; $("sh-online").href = bookingHref(shZone);
  }
  d.addEventListener("click", function (e) {
    var b = e.target.closest("[data-sheet]"); if (!b) return;
    var z = b.dataset.sheet;
    if (b.id !== "sh-online" && b.closest(".bar")) z = curZone;
    setSheetZone(z); renderHours(); openDlg(sheet);
  });
  $("sh-zones").addEventListener("click", function (e) { var b = e.target.closest("button[data-z]"); if (b) setSheetZone(b.dataset.z); });
  $("sh-close").onclick = function () { closeDlg(sheet); };
  sheet.addEventListener("click", function (e) { if (e.target === sheet) closeDlg(sheet); });
  $("sh-online").addEventListener("click", function () { setTimeout(function () { closeDlg(sheet); }, 300); });
  $("sh-ig").onclick = function () {
    closeDlg(sheet);
    $("b-zone").value = shZone; updatePreview();
    $("book-form").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    setTimeout(function () { try { $("b-date").focus({ preventScroll: true }); } catch (e) {} }, 600);
  };

  /* ---------- нижняя панель: название текущего раздела ---------- */
  var bar = $("bar"), curKey = "", curZone = "main";
  function paintBar() { $("bar-name").textContent = curKey ? plain(t(curKey)).replace(/^\d+\s*·\s*/, "") : "Spički"; }
  if ("IntersectionObserver" in window) {
    var heroOut = false, footIn = false;
    var showBar = function () { var on = heroOut && !footIn; bar.classList.toggle("show", on); bar.setAttribute("aria-hidden", String(!on)); bar.querySelector("button").tabIndex = on ? 0 : -1; };
    new IntersectionObserver(function (es) { heroOut = !es[0].isIntersecting; showBar(); }, { rootMargin: "-40% 0px 0px 0px" }).observe($("top"));
    new IntersectionObserver(function (es) { footIn = es[0].isIntersecting; showBar(); }).observe(d.querySelector(".foot"));
    var secIO = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        curKey = en.target.dataset.bar; curZone = en.target.dataset.zone || "main"; paintBar();
      });
    }, { rootMargin: "-55% 0px -44% 0px" });
    $$("[data-bar]").forEach(function (s) { secIO.observe(s); });
  }

  /* ---------- язык ---------- */
  function splitHero() {
    var el = d.querySelector("#hero-h .split");
    var words = plain(t("hero.aka")).split(/\s+/).filter(Boolean);
    el.innerHTML = words.map(function (w, i) { return '<span class="w" style="--i:' + i + '">' + esc(w) + "</span>"; }).join(" ");
  }
  function setLang(l) {
    lang = LANGS.indexOf(l) >= 0 ? l : "ru";
    H.dataset.lang = lang; H.lang = lang === "sr" ? "sr-Latn" : lang;
    $$("[data-t]").forEach(function (el) { el.innerHTML = t(el.dataset.t); });
    $$("[data-ta]").forEach(function (el) { el.dataset.ta.split(";").forEach(function (p) { var q = p.split(":"); el.setAttribute(q[0], plain(t(q[1]))); }); });
    d.title = plain(t("n.title"));
    var md = d.querySelector('meta[name="description"]'); if (md) md.setAttribute("content", lang === "ru" ? SP.DYN.ru.meta : t("meta"));
    $$(".lang-chip button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === lang)); });
    $$("[data-main]").forEach(function (a) { a.href = MAIN + (lang === "ru" ? "" : lang + "/"); });
    splitHero(); syncBooking(); setSheetZone(shZone); renderMenu(); renderGallery(); renderRead(); renderLinks(); renderHours(); updatePreview(); paintBar(); observeReveal();
    H.classList.remove("i18n-wait");
  }
  $$(".lang-chip button").forEach(function (b) {
    b.addEventListener("click", function () {
      try { localStorage.setItem("spicki-lang", JSON.stringify({ v: b.dataset.lang, exp: Date.now() + 365 * 864e5 })); } catch (e) {}
      try { var u = new URL(location.href); u.searchParams.set("lang", b.dataset.lang); history.replaceState(null, "", u.href); } catch (e) {}
      setLang(b.dataset.lang);
    });
  });

  /* ---------- появление при прокрутке ---------- */
  var revIO = "IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches
    ? new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); revIO.unobserve(en.target); } }); }, { rootMargin: "0px 0px -8% 0px" })
    : null;
  function observeReveal() {
    if (!revIO) return;
    $$(".lot .blk, .lot .card, .lot .price, .lot .big, .lot .event, .lot .art, .lot .menu-box, .sup .blk, .faq details, .gal figure").forEach(function (el) {
      if (el.classList.contains("rv")) return;
      if (el.getBoundingClientRect().top < innerHeight) return;
      el.classList.add("rv"); revIO.observe(el);
    });
  }

  setLang(lang);
  setInterval(renderHours, 60000);

  /* ---------- старт анимации первого экрана: после интро и проверки 18+ ---------- */
  var goMO = new MutationObserver(maybeGo);
  function maybeGo() { if (H.classList.contains("go") || H.classList.contains("intro-on") || H.classList.contains("ag-lock")) return; goMO.disconnect(); H.classList.add("go"); }
  goMO.observe(H, { attributes: true, attributeFilter: ["class"] });
  requestAnimationFrame(function () { requestAnimationFrame(maybeGo); });
})();
