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
      now: "сейчас", unread: "Непрочитанных", skip: "Пропустить", h: ["Время", "<em>выдохнуть</em>"], sub: "Spički · Mačvanska 10",
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
      now: "sada", unread: "Nepročitano", skip: "Preskoči", h: ["Vreme da", "<em>izdahneš</em>"], sub: "Spički · Mačvanska 10",
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
      now: "now", unread: "Unread", skip: "Skip", h: ["Time to", "<em>exhale</em>"], sub: "Spički · Mačvanska 10",
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
  stage.appendChild(el("div", "intro-top", '<span class="intro-clock">' + esc(hm) + '</span><span class="intro-count">' + esc(t.unread) + "<b>0</b></span>"));
  stage.appendChild(el("div", "intro-lock", '<div class="intro-time">' + esc(hm) + '</div><div class="intro-date">' + esc(day) + "</div>"));
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
  document.body.appendChild(box);
  var count = box.querySelector(".intro-count b");

  var timers = [], done = false, n = 0, unread = 0;
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
    unread += i < 5 ? 1 : Math.ceil(rnd(2, 6));
    count.textContent = unread;
    count.classList.add("bump"); setTimeout(function () { count.classList.remove("bump"); }, 140);
    if (i === 2) box.classList.add("busy");
    if (i >= 5) { box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake"); }
  }

  function exhale() {
    if (done || box.classList.contains("calm")) return;
    timers.forEach(clearTimeout); timers = [];
    Array.prototype.forEach.call(pile.children, function (c) { c.classList.add("in"); });
    void box.offsetWidth;
    box.classList.add("calm");
    later(finish, 2600);
  }
  function finish() {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    box.classList.add("out");
    root.classList.remove("intro-on");
    document.removeEventListener("keydown", onKey);
    setTimeout(function () { box.remove(); }, 900);
  }
  function onKey(e) { if (e.key === "Escape") finish(); }

  skip.addEventListener("click", finish);
  box.addEventListener("click", function (e) { if (e.target !== skip && box.classList.contains("calm")) finish(); });
  document.addEventListener("keydown", onKey);

  function play() {
    var at = 500, gap = [560, 520, 480, 430, 380];
    t.n.forEach(function (item, i) {
      later(function () { push(item); }, at);
      at += i < 5 ? gap[i] : Math.max(70, 150 - (i - 5) * 9);
    });
    later(exhale, at + 450);
  }

  // Если открыт вопрос «Вам есть 18?», ждём ответа: экран блокировки стоит, уведомления — после
  if (root.classList.contains("ag-lock")) {
    var mo = new MutationObserver(function () {
      if (!root.classList.contains("ag-lock")) { mo.disconnect(); play(); }
    });
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
  } else play();
})();
