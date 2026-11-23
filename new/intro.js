/* Spički: интро на главной.
   Сначала сыплются уведомления (штраф, врач, МУП, счёт за свет, грязный воздух),
   потом всё растворяется — «Время выдохнуть» — и открывается сайт.
   Показывается, только если скрипт в <head> поставил на <html> класс intro-on:
   при заходе извне (не со страниц сайта), не при перезагрузке и «назад», без «уменьшить движение».
   Ничего не сохраняет на устройстве. ?intro — показать принудительно, ?nointro — не показывать. */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains("intro-on")) return;

  var IC = {
    park: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 3h6.2a5.3 5.3 0 0 1 0 10.6H10.6V21H7Zm3.6 3.3v4h2.5a2 2 0 0 0 0-4Z"/></svg>',
    doc: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M9.5 3h5v6.5H21v5h-6.5V21h-5v-6.5H3v-5h6.5Z"/></svg>',
    mup: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5Zm0 5.2 1.4 2.9 3.1.4-2.3 2.2.6 3.1L12 14.3l-2.8 1.5.6-3.1-2.3-2.2 3.1-.4Z"/></svg>',
    bolt: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13.5 2 4 14h6.5L9.5 22 20 9.5h-6.6Z"/></svg>',
    air: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/></svg>',
    home: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3 2 11h3v10h5v-6h4v6h5V11h3Z"/></svg>'
  };
  var COL = { park: "#2f6fed", doc: "#16a88f", mup: "#3d4f9c", bolt: "#e59a0b", air: "#7a67ad", chat: "#24a148", home: "#b5543c" };

  // [иконка, приложение, заголовок, текст]; первые пять — главные, дальше — лавина
  var T = {
    ru: {
      now: "сейчас", skip: "Пропустить", tap: "Коснитесь, чтобы открыть", snd: "Звук кальяна", h: ["Время", "<em>выдохнуть</em>"], sub: "Spički · Mačvanska 10",
      sr: "Время выдохнуть. Spički, кальянная в Белграде.",
      n: [
        ["park", "Паркинг", "Штраф за парковку", "Зона 2, Vračar — 3 000 RSD. Оплатите в течение 8 дней"],
        ["doc", "Клиника", "Запись к врачу", "Завтра в 07:30. Натощак, не забудьте направление"],
        ["mup", "МУП", "Вызов в МУП", "Среда, 9:00, окно 4. При себе паспорт и все копии"],
        ["bolt", "Электричество", "Счёт за электричество", "К оплате 14 860 RSD. Срок был вчера"],
        ["air", "Воздух", "Низкое качество воздуха", "AQI 187 — вредно для всех. Закройте окна"],
        ["chat", "Работа", "Есть минутка?", "Нужно срочно, до конца дня"],
        ["park", "Паркинг", "Штраф не оплачен", "Начислена пеня"],
        ["doc", "Клиника", "Запись перенесена", "Новое время — 06:45"],
        ["mup", "МУП", "Напоминание", "Возьмите ещё одну копию"],
        ["home", "Хозяин квартиры", "Нам надо поговорить", "Перезвони, как сможешь"],
        ["bolt", "Электричество", "Последнее предупреждение", "Возможно отключение"],
        ["air", "Воздух", "AQI 212", "Очень вредно. Не выходите на улицу"],
        ["chat", "Работа", "47 новых сообщений", "Вас упомянули 12 раз"],
        ["park", "Паркинг", "Ещё один штраф", "Зона 1 — 3 000 RSD"],
        ["mup", "МУП", "Очередь сдвинулась", "Перед вами 143 человека"]
      ]
    },
    sr: {
      now: "sada", skip: "Preskoči", tap: "Dodirnite da otvorite", snd: "Zvuk nargile", h: ["Vreme da", "<em>izdahneš</em>"], sub: "Spički · Mačvanska 10",
      sr: "Vreme da izdahneš. Spički, nargila lounge u Beogradu.",
      n: [
        ["park", "Parking", "Kazna za parkiranje", "Zona 2, Vračar — 3.000 RSD. Platite u roku od 8 dana"],
        ["doc", "Klinika", "Zakazan pregled", "Sutra u 07:30. Natašte, ponesite uput"],
        ["mup", "MUP", "Poziv u MUP", "Sreda, 9:00, šalter 4. Ponesite pasoš i sve kopije"],
        ["bolt", "Struja", "Račun za struju", "Za uplatu 14.860 RSD. Rok je bio juče"],
        ["air", "Vazduh", "Loš kvalitet vazduha", "AQI 187 — štetno za sve. Zatvorite prozore"],
        ["chat", "Posao", "Imaš minut?", "Hitno je, do kraja dana"],
        ["park", "Parking", "Kazna nije plaćena", "Obračunata je kamata"],
        ["doc", "Klinika", "Pregled je pomeren", "Novo vreme — 06:45"],
        ["mup", "MUP", "Podsetnik", "Ponesite još jednu kopiju"],
        ["home", "Stanodavac", "Moramo da razgovaramo", "Pozovi kad stigneš"],
        ["bolt", "Struja", "Poslednja opomena", "Moguće isključenje"],
        ["air", "Vazduh", "AQI 212", "Veoma štetno. Ne izlazite napolje"],
        ["chat", "Posao", "47 novih poruka", "Pomenuli su vas 12 puta"],
        ["park", "Parking", "Još jedna kazna", "Zona 1 — 3.000 RSD"],
        ["mup", "MUP", "Red se pomerio", "Ispred vas je 143 ljudi"]
      ]
    },
    en: {
      now: "now", skip: "Skip", tap: "Tap to open", snd: "Hookah sound", h: ["Time to", "<em>exhale</em>"], sub: "Spički · Mačvanska 10",
      sr: "Time to exhale. Spički, a hookah lounge in Belgrade.",
      n: [
        ["park", "Parking", "Parking fine", "Zone 2, Vračar — 3,000 RSD. Pay within 8 days"],
        ["doc", "Clinic", "Doctor's appointment", "Tomorrow at 07:30. Empty stomach, bring the referral"],
        ["mup", "MUP", "You're summoned to MUP", "Wednesday, 9:00, desk 4. Bring your passport and all copies"],
        ["bolt", "Electricity", "Electricity bill", "14,860 RSD due. The deadline was yesterday"],
        ["air", "Air", "Poor air quality", "AQI 187 — unhealthy for everyone. Close the windows"],
        ["chat", "Work", "Got a minute?", "It's urgent, by end of day"],
        ["park", "Parking", "Fine still unpaid", "Late fee added"],
        ["doc", "Clinic", "Appointment moved", "New time — 06:45"],
        ["mup", "MUP", "Reminder", "Bring one more copy"],
        ["home", "Landlord", "We need to talk", "Call me back when you can"],
        ["bolt", "Electricity", "Final notice", "Supply may be cut off"],
        ["air", "Air", "AQI 212", "Very unhealthy. Stay indoors"],
        ["chat", "Work", "47 new messages", "You were mentioned 12 times"],
        ["park", "Parking", "Another fine", "Zone 1 — 3,000 RSD"],
        ["mup", "MUP", "The queue moved", "143 people ahead of you"]
      ]
    }
  };
  var lang = (root.lang || "ru").slice(0, 2), t = T[lang] || T.ru;
  var loc = { ru: "ru-RU", sr: "sr-Latn-RS", en: "en-GB" }[lang] || "ru-RU";

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var now = new Date(), hm = now.toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit" });
  var day = now.toLocaleDateString(loc, { weekday: "long", day: "numeric", month: "long" });

  var box = el("div", "intro");
  var stage = el("div", "intro-stage");
  stage.setAttribute("aria-hidden", "true");
  stage.appendChild(el("div", "intro-top", '<span class="intro-clock">' + esc(hm) + "</span>"));
  stage.appendChild(el("div", "intro-lock", '<div class="intro-time">' + esc(hm) + '</div><div class="intro-date">' + esc(day) + '</div><div class="intro-tap">' + esc(t.tap) + "</div>"));
  var pile = el("div", "intro-pile");
  stage.appendChild(pile);
  var wi = 0, words = t.h.map(function (w) { return '<span class="w" style="--i:' + (wi++) + '">' + w + "</span>"; }).join(" ");
  stage.appendChild(el("div", "intro-calm",
    '<svg class="intro-flame" viewBox="0 0 24 34"><defs><linearGradient id="introF" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#9e140c"/><stop offset=".5" stop-color="#ff2e7e"/><stop offset="1" stop-color="#ffb3cf"/></linearGradient></defs><path fill="url(#introF)" d="M13.5 1c1.2 5.6 9.5 9.6 9.5 18.6C23 27.4 18 33 12 33S1 27.4 1 20.6c0-5 2.8-8.5 5.6-10.7-.2 3.6 1 6.2 3.3 7.4C9.6 10.6 11.4 5.3 13.5 1Z"/></svg>' +
    '<p class="intro-h">' + words + '</p><p class="intro-sub">' + esc(t.sub) + "</p>"));
  box.appendChild(stage);
  var sr = el("p", "intro-sr", esc(t.sr)); sr.setAttribute("role", "status");
  box.appendChild(sr);
  var skip = el("button", "intro-skip", esc(t.skip)); skip.type = "button";
  box.appendChild(skip);
  var sndBtn = el("button", "intro-snd", '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 9h4l5-4v14l-5-4H4Z"/><path class="on" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M16 9.2a4 4 0 0 1 0 5.6M18.6 6.6a7.6 7.6 0 0 1 0 10.8"/><path class="off" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="m16.5 9.5 5 5m0-5-5 5"/></svg>');
  sndBtn.type = "button"; sndBtn.setAttribute("aria-label", t.snd); sndBtn.title = t.snd;
  box.appendChild(sndBtn);
  document.body.appendChild(box);

  var timers = [], done = false, n = 0;
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function place(i) {
    var W = innerWidth, H = innerHeight, cw = Math.min(360, W - 32), narrow = W < 640;
    var x, y;
    if (i < 5) {
      // главные — столбиком по центру, чтобы успели прочитать
      x = (W - cw) / 2 + (narrow ? rnd(-6, 6) : rnd(-60, 60));
      y = H * (narrow ? 0.2 : 0.22) + i * (narrow ? 0.12 : 0.115) * H;
    } else {
      x = narrow ? rnd(6, W - cw - 6) : rnd(W * 0.04, W * 0.96 - cw);
      y = rnd(H * 0.1, H * 0.78);
    }
    return { x: Math.max(8, Math.min(x, W - cw - 8)), y: Math.max(56, Math.min(y, H - 110)) };
  }

  function push(item) {
    var i = n++, p = place(i);
    var c = el("div", "intro-n",
      '<span class="intro-ic">' + IC[item[0]] + '</span><span><span class="intro-meta"><span>' + esc(item[1]) + "</span><span>" + esc(t.now) + '</span></span><span class="intro-t" style="display:block">' + esc(item[2]) + '</span><span class="intro-b" style="display:block">' + esc(item[3]) + "</span></span>");
    c.style.setProperty("--x", p.x.toFixed(0) + "px");
    c.style.setProperty("--y", p.y.toFixed(0) + "px");
    c.style.setProperty("--r", (i < 5 ? rnd(-1.5, 1.5) : rnd(-7, 7)).toFixed(1) + "deg");
    c.style.setProperty("--k", i);
    c.querySelector(".intro-ic").style.setProperty("--c", COL[item[0]]);
    c.addEventListener("animationend", function () { c.classList.add("in"); });
    pile.appendChild(c);
    var cards = pile.children;
    for (var k = 0; k < cards.length; k++) {
      var age = cards.length - 1 - k;
      cards[k].classList.toggle("back", age >= 2 && age < 6);
      cards[k].classList.toggle("far", age >= 6);
    }
    if (i < 5) sfx(SND[item[0]], 0.8);
    else { sfx(SND[item[0]], rnd(0.3, 0.5), rnd(0.94, 1.06)); if (i % 3 === 0) sfx("n-buzz", 0.7); }
    if (i === 2) box.classList.add("busy");
    if (i >= 5) { box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake"); }
  }


  /* ---------- Звук: записи из библиотеки Freesound (CC0), файлы в /sfx ----------
     Бульканье — «Hookah bubling» (oresamp), выдох — «blow smoke» (dreggsome),
     уведомления — qubodup, Qvantor, NoTomorrow12, Froey_. Все CC0, см. sfx/CREDITS.txt.
     Звук включён по умолчанию, но браузер даёт его только после касания: поэтому интро
     стартует с экрана блокировки «Коснитесь, чтобы открыть» (или после «Да, мне есть 18»). */
  var BASE = (function () { try { return new URL("sfx/", (document.currentScript && document.currentScript.src) || location.href).href; } catch (e) { return "/sfx/"; } })();
  var FILES = ["hookah-bubbles", "hookah-exhale", "n-bell", "n-chime", "n-ding", "n-pluck", "n-pop", "n-buzz"];
  var SND = { park: "n-bell", doc: "n-chime", mup: "n-ding", bolt: "n-pluck", air: "n-pop", chat: "n-pop", home: "n-chime" };
  var AC = window.AudioContext || window.webkitAudioContext, ctx = null, master = null, muted = false, raw = {}, buf = {}, VOL = 0.85;
  if (AC && window.fetch) FILES.forEach(function (f) {
    raw[f] = fetch(BASE + f + ".mp3").then(function (r) { return r.ok ? r.arrayBuffer() : null; }).catch(function () { return null; });
  });
  function decodeAll() {
    FILES.forEach(function (f) {
      if (buf[f] || !raw[f]) return;
      buf[f] = raw[f].then(function (ab) {
        if (!ab) return null;
        return new Promise(function (ok) { ctx.decodeAudioData(ab, ok, function () { ok(null); }); });
      });
    });
  }
  function audio() {
    if (!AC) return null;
    if (!ctx) {
      try { ctx = new AC(); } catch (e) { AC = null; return null; }
      master = ctx.createGain(); master.gain.value = VOL;
      var comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
      decodeAll();
    }
    return ctx;
  }
  function live() { return ctx && ctx.state === "running" && !muted; }
  function syncBtn() { var on = !muted; sndBtn.classList.toggle("is-on", on); sndBtn.classList.toggle("blocked", on && !(ctx && ctx.state === "running")); sndBtn.setAttribute("aria-pressed", on ? "true" : "false"); }
  function unlock(e) {
    if (e && sndBtn.contains(e.target)) return;
    var c = audio(); if (!c) return;
    if (c.state !== "running") {
      // iOS: тихий буфер внутри жеста окончательно «открывает» звук
      try { var sb = c.createBufferSource(); sb.buffer = c.createBuffer(1, 1, 22050); sb.connect(c.destination); sb.start(0); } catch (x) {}
      c.resume().then(syncBtn, function () {});
    } else syncBtn();
  }
  if (!AC) sndBtn.hidden = true;
  syncBtn();
  var GESTURES = ["pointerdown", "pointerup", "touchend", "click", "keydown"];
  GESTURES.forEach(function (ev) { document.addEventListener(ev, unlock, true); });
  sndBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    var c = audio(); if (!c) return;
    if (live()) { muted = true; master.gain.setTargetAtTime(0, c.currentTime, 0.04); syncBtn(); return; }
    muted = false; master.gain.setTargetAtTime(VOL, c.currentTime, 0.04);
    c.resume().then(syncBtn, function () {});
  });
  function sfx(name, gain, rate) {
    if (!live() || !buf[name]) return;
    buf[name].then(function (b) {
      if (!b || !live()) return;
      var s = ctx.createBufferSource(), g = ctx.createGain();
      s.buffer = b; if (rate) s.playbackRate.value = rate;
      g.gain.value = gain == null ? 1 : gain;
      s.connect(g); g.connect(master); s.start();
    });
  }
  function bubbles() { sfx("hookah-bubbles", 1); }
  function exhaleSound() { sfx("hookah-exhale", 1); }

  /* ---------- Дым: заливает экран и рассеивается, открывая сайт ---------- */
  function puff(rgb) {
    // клуб дыма: «кучевой» фрактальный шум с мягким краем и светом сверху
    var N = 160, c = document.createElement("canvas"); c.width = c.height = N;
    var x = c.getContext("2d"), im = x.createImageData(N, N), d = im.data, oct = [];
    for (var o = 0; o < 5; o++) {
      var cells = 3 << o, g = [];
      for (var k = 0; k < (cells + 1) * (cells + 1); k++) g.push(Math.random());
      oct.push({ c: cells, g: g, w: 1 / Math.pow(1.8, o) });
    }
    function sm(v) { return v * v * (3 - 2 * v); }
    for (var py = 0; py < N; py++) for (var px = 0; px < N; px++) {
      var v = 0, ws = 0;
      for (var q = 0; q < oct.length; q++) {
        var O = oct[q], fx = px / N * O.c, fy = py / N * O.c, ix = fx | 0, iy = fy | 0, tx = sm(fx - ix), ty = sm(fy - iy), W = O.c + 1;
        var a = O.g[iy * W + ix], b = O.g[iy * W + ix + 1], cc = O.g[(iy + 1) * W + ix], dd = O.g[(iy + 1) * W + ix + 1];
        var n = (a + (b - a) * tx) * (1 - ty) + (cc + (dd - cc) * tx) * ty;
        v += O.w * (q ? 1 - Math.abs(n * 2 - 1) : n); ws += O.w;
      }
      v /= ws;
      var dx = px / N * 2 - 1, dy = py / N * 2 - 1, r = Math.sqrt(dx * dx + dy * dy), fall = Math.max(0, 1 - r * r);
      var al = Math.max(0, Math.min(1, (v * fall - 0.2) * 2.4));
      var lit = 0.82 + 0.3 * (1 - py / N) * v;
      var i = (py * N + px) * 4;
      d[i] = Math.min(255, rgb[0] * lit); d[i + 1] = Math.min(255, rgb[1] * lit); d[i + 2] = Math.min(255, rgb[2] * lit); d[i + 3] = al * 255;
    }
    x.putImageData(im, 0, 0);
    return c;
  }
  function smoke(onCovered, onDone) {
    var cv = el("canvas", "intro-smoke"); box.appendChild(cv);
    var g = cv.getContext && cv.getContext("2d");
    if (!g) { onCovered(); onDone(); return; }
    var S = 0.34, W = Math.ceil(innerWidth * S), H = Math.ceil(innerHeight * S), M = Math.max(W, H), m = Math.min(W, H);
    cv.width = W; cv.height = H;
    // светлые клубы, тени для объёма и розовые — подсвеченные неоном
    var light = [puff([204, 192, 199]), puff([214, 204, 210]), puff([194, 180, 189])], dark = [puff([112, 94, 106])], pink = [puff([226, 140, 182]), puff([206, 122, 164])];
    var parts = [], t0 = performance.now(), last = t0, emitted = 0, covered = false, TOTAL = 56;
    function add(i) {
      var side = rnd(-1, 1), roll = Math.random();
      parts.push({
        x: W * (0.5 + side * 0.32), y: H * rnd(0.85, 1.15),
        vx: side * rnd(0.05, 0.35) * M, vy: -rnd(0.45, 1.05) * H,
        r0: m * rnd(0.25, 0.4), r1: M * rnd(0.45, 0.75), rot: rnd(0, 6.28), vr: rnd(-0.6, 0.6),
        a: rnd(0.45, 0.75), born: (performance.now() - t0) / 1000,
        tex: roll < 0.24 ? dark[0] : roll < 0.38 ? pink[(Math.random() * 2) | 0] : light[(Math.random() * 3) | 0]
      });
      // тени рисуем первыми — они «под» светлым дымом
      parts.sort(function (p, q) { return (q.tex === dark[0]) - (p.tex === dark[0]); });
    }
    (function frame(now) {
      var tt = (now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000); last = now;
      var want = Math.min(TOTAL, Math.floor(tt / 1.1 * TOTAL));
      while (emitted < want) add(emitted++);
      if (!covered && tt > 1.0) { covered = true; onCovered(); }
      var fade = tt < 1.5 ? 1 : Math.max(0, 1 - Math.pow((tt - 1.5) / 2.3, 1.2));
      g.clearRect(0, 0, W, H);
      // ровная дымка снизу вверх — чтобы экран залило целиком, а клубы дали фактуру
      var veil = Math.min(1, Math.max(0, (tt - 0.35) / 0.65)) * 0.55 * fade;
      if (veil > 0) {
        var gr = g.createLinearGradient(0, H, 0, 0);
        gr.addColorStop(0, "rgba(150,128,142," + veil + ")"); gr.addColorStop(1, "rgba(120,98,112," + veil * 0.9 + ")");
        g.globalAlpha = 1; g.fillStyle = gr; g.fillRect(0, 0, W, H);
      }
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], age = tt - p.born, k = Math.min(1, age / 2.2), drag = Math.pow(0.45, dt);
        p.vx *= drag; p.vy *= drag; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        var r = p.r0 + (p.r1 - p.r0) * (1 - Math.pow(1 - k, 2.5));
        g.globalAlpha = p.a * Math.min(1, age / 0.25) * fade;
        g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.drawImage(p.tex, -r, -r, r * 2, r * 2); g.restore();
      }
      if (tt < 3.9) requestAnimationFrame(frame); else onDone();
    })(t0);
  }
  function exhale() {
    if (done || box.classList.contains("calm")) return;
    timers.forEach(clearTimeout); timers = [];
    Array.prototype.forEach.call(pile.children, function (c) { c.classList.add("in"); });
    void box.offsetWidth;
    box.classList.add("calm");
    later(bubbles, 250);
    later(finish, 2700);
  }
  function finish() {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    document.removeEventListener("keydown", onKey);
    exhaleSound();
    box.classList.add("smoking");
    smoke(function () {
      // экран под дымом: интро прячем, сайт уже живой — дым рассеивается поверх него
      box.classList.add("smoked");
      root.classList.remove("intro-on");
    }, function () {
      GESTURES.forEach(function (ev) { document.removeEventListener(ev, unlock, true); });
      box.remove();
    });
  }
  function onKey(e) { if (e.key === "Escape") finish(); }

  skip.addEventListener("click", finish);
  box.addEventListener("click", function (e) { if (e.target !== skip && !sndBtn.contains(e.target) && box.classList.contains("calm")) finish(); });
  document.addEventListener("keydown", onKey);

  function play() {
    var at = 500, gap = [560, 520, 480, 430, 380];
    t.n.forEach(function (item, i) {
      later(function () { push(item); }, at);
      at += i < 5 ? gap[i] : Math.max(70, 150 - (i - 5) * 9);
    });
    later(exhale, at + 450);
  }

  var started = false;
  function gateOpen() { return root.classList.contains("ag-lock"); }
  function start() { if (started) return; started = true; box.classList.remove("wait"); play(); }
  // Вопрос «Вам есть 18?» может открыться чуть позже интро. Пока он открыт — ждём;
  // ответ «Да» — это и есть касание: звук включается, уведомления идут сразу.
  var sawGate = gateOpen();
  new MutationObserver(function () {
    if (gateOpen()) sawGate = true;
    else if (sawGate) start();
  }).observe(root, { attributes: true, attributeFilter: ["class"] });
  // Без вопроса — экран блокировки «Коснитесь, чтобы открыть»: касание включает звук и запускает уведомления.
  // Если никто не коснулся — через 7 секунд стартуем сами (без звука, динамик подскажет).
  box.classList.add("wait");
  function go(e) {
    if (started || gateOpen()) return;
    if (e && (e.target === skip || sndBtn.contains(e.target))) return;
    if (e && e.type === "keydown" && e.key === "Escape") return;
    start();
  }
  box.addEventListener("click", go);
  document.addEventListener("keydown", go);
  later(go, 7000);
})();
