/* Spički: анимации главной страницы.
   Неон в слогане, искры от спички, бегущая строка, неоновая кнопка брони,
   свет за курсором в зонах, заголовки по словам, наклон фото, каскад галереи.
   При «уменьшить движение» в системе остаётся только неподвижная бегущая строка. */
(function () {
  var root = document.documentElement;
  var calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var on = calm ? ["a-marquee"] : ["a-neon", "a-sparks", "a-marquee", "a-btn", "a-words", "a-gal"].concat(fine ? ["a-spot", "a-tilt"] : []);
  on.forEach(function (c) { root.classList.add(c); });
  if (calm) root.classList.add("a-calm");

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function has(c) { return root.classList.contains(c); }

  var hero = $(".hero"), ph = $(".hero-photo");

  // Искры над пламенем спички на фото
  if (ph && has("a-sparks")) {
    var sp = document.createElement("div"); sp.className = "fx-sparks"; sp.setAttribute("aria-hidden", "true");
    var html = "";
    for (var i = 0; i < 16; i++) {
      var x = 85 + Math.random() * 7, y = 16 + Math.random() * 16, s = 3 + Math.random() * 3.5;
      var dx = (-50 + Math.random() * 80).toFixed(0), dy = (-120 - Math.random() * 160).toFixed(0);
      var d = (1.8 + Math.random() * 2.2).toFixed(2), dl = (-Math.random() * 4).toFixed(2);
      html += '<i style="--x:' + x.toFixed(1) + '%;--y:' + y.toFixed(1) + '%;--s:' + s.toFixed(1) + 'px;--dx:' + dx + 'px;--dy:' + dy + 'px;--d:' + d + 's;--delay:' + dl + 's"></i>';
    }
    sp.innerHTML = html; ph.appendChild(sp);
  }

  // Наклон фото за курсором
  if (ph && hero && has("a-tilt")) {
    var img = $("img", ph);
    hero.addEventListener("pointermove", function (e) {
      var r = ph.getBoundingClientRect();
      var nx = (e.clientX - (r.left + r.width / 2)) / innerWidth, ny = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      img.style.setProperty("--ry", (nx * 14).toFixed(2) + "deg");
      img.style.setProperty("--rx", (-ny * 10).toFixed(2) + "deg");
    });
    hero.addEventListener("pointerleave", function () { img.style.setProperty("--ry", "0deg"); img.style.setProperty("--rx", "0deg"); });
  }

  // Бегущая строка
  var MQ = {
    ru: ["Кальяны", "Кухня", "Бизнес-ланчи", "Бар", "PS5", "Secret Room", "Настольные игры", "Mačvanska 10"],
    sr: ["Nargile", "Kuhinja", "Poslovni ručkovi", "Bar", "PS5", "Secret Room", "Društvene igre", "Mačvanska 10"],
    en: ["Hookah", "Kitchen", "Business lunches", "Bar", "PS5", "Secret Room", "Board games", "Mačvanska 10"]
  };
  var mqs = [];
  function mqHTML() {
    var l = (root.lang || "ru").slice(0, 2), w = MQ[l] || MQ.ru, one = w.map(function (t) { return "<span>" + t + "</span><b>✦</b>"; }).join("");
    return '<div class="track">' + one + one + "</div>";
  }
  function addMarquee(after) {
    if (!after) return;
    var m = document.createElement("div"); m.className = "fx-marquee"; m.setAttribute("aria-hidden", "true");
    m.innerHTML = mqHTML(); after.parentNode.insertBefore(m, after.nextSibling); mqs.push(m);
  }
  addMarquee(hero);
  var gal = $("#gallery"); if (gal) addMarquee(gal.previousElementSibling);

  // Свет за курсором в зонах
  if (has("a-spot")) $$(".zone").forEach(function (z) {
    z.addEventListener("pointermove", function (e) {
      var r = z.getBoundingClientRect();
      z.style.setProperty("--mx", (e.clientX - r.left + 24) + "px");
      z.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  // Заголовки разделов по словам
  function split() {
    if (!has("a-words")) return;
    $$(".sec-head h2").forEach(function (h) {
      if (h.querySelector(".w")) return;
      var i = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var parts = c.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
            parts.forEach(function (p) {
              if (!p) return;
              if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
              var s = document.createElement("span"); s.className = "w"; s.style.setProperty("--i", i++); s.textContent = p; frag.appendChild(s);
            });
            node.replaceChild(frag, c);
          } else if (c.nodeType === 1 && !c.classList.contains("w")) walk(c);
        });
      })(h);
    });
  }
  split();

  // Появление заголовков и галереи
  if (!calm && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("fx-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -10% 0px" });
    $$(".sec-head").forEach(function (el) { io.observe(el); });
    var watchGallery = function () {
      $$(".gallery-grid figure").forEach(function (f, k) {
        if (f.dataset.fx) return; f.dataset.fx = 1; f.style.setProperty("--gi", k % 4); io.observe(f);
      });
    };
    watchGallery();
    var gg = $("#gallery-grid"); if (gg) new MutationObserver(watchGallery).observe(gg, { childList: true });
  } else {
    root.classList.remove("a-words", "a-gal");
  }

  // Смена языка: обновить бегущую строку и разбивку заголовков
  new MutationObserver(function () {
    mqs.forEach(function (m) { m.innerHTML = mqHTML(); });
    setTimeout(split, 0);
  }).observe(root, { attributes: true, attributeFilter: ["lang"] });
})();
