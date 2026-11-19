// Spički 3D — приложение: рендер, камера с «пружинным» полётом, клики по предметам, панели, звук.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { buildWorld } from "./world.js";

const BOOK = "https://book.spickibg.com/", MENU = "https://qastio.app/rs/belgrade/spicki", IG = "https://www.instagram.com/spicki_bg/";
const MAP = "https://www.google.com/maps/search/?api=1&query=Spi%C4%8Dki+Ma%C4%8Dvanska+10+Beograd";

const T = {
  ru: {
    title: "Spički 3D — загляните в кальянную в Белграде", slogan: "время выдохнуть",
    wh: "Загляните к нам <em>в гости</em>", ws: "Это наш зал в 3D: бар, неон, кальян, PS5 и Secret Room. Крутите, приближайте и нажимайте на предметы.",
    go: "Войти", loading: "Загружаем зал…", hint: "Тяните — осмотреться · колёсико или щипок — приблизить",
    book: "Забронировать", found: (a, b) => `Открыто <b>${a}</b> из ${b}`,
    views: { overview: "Весь зал", hookah: "Кальян", bar: "Бар", tv: "PS5", secret: "Secret Room" },
    lights: { neon: "Неон", bar: "Подсветка бара", room: "Свет в зале" },
    phoneBtn: "Забронировать стол", phoneRows: ["Сегодня · 21:30", "4 гостя · у бара", "Кальян: свежий микс"], menuSub: "кухня · бар · кальян",
    allFound: "Вы нашли всё! Осталось прийти вживую.",
    hours: "Вс–Чт 12:00–00:00 · Пт–Сб 12:00–01:00",
    p: {
      hookah: { k: "Кальян", h: "Кальян, как в зале", t: ["Стальная шахта, матовая колба, чёрный колпак и длинный мундштук — такие кальяны мы и подаём.", "Мастер подберёт табак и крепость под вас, а за углями следит система: менять их вовремя не забудут."], puff: "Затянуться", puffing: "Тянем…" },
      neon: { k: "Вывеска", h: "ŠPIČKI · ŠIBICE", t: ["Spički по-сербски — «спички», šibice. Отсюда огонёк над первой буквой.", "Мы хотели соединить разнообразную кухню, сильный бар с винной картой, яркий интерьер, нетворкинг и игры. Получилась кальянная, куда приходят на ужин, на матч и на долгий вечер с друзьями."], toggle: ["Выключить неон", "Включить неон"] },
      shelves: { k: "Табак", h: "Стена табаков", t: ["Банки за стойкой — палитра нашего кальянного мастера.", "Скажите, что любите: фрукты, десерт, свежесть, покрепче или полегче — и он соберёт микс под вас."] },
      cocktail: { k: "Бар", h: "Коктейли и вино", t: ["Сильный бар с винной картой и коктейлями — к кальяну и без него.", "Всё меню и актуальные цены — на Qastio."], link: "Меню бара" },
      menu: { k: "Кухня", h: "У нас ужинают", t: ["Разнообразная кухня — от закусок до горячего. Spički — это не только кальян."], link: "Полное меню" },
      matchbox: { k: "Спички", h: "Чиркните спичкой", t: ["Наш коробок. Чиркните — и загадайте хороший вечер."], strike: "Чиркнуть" },
      phone: { k: "Бронь", h: "Забронировать стол", t: ["Онлайн-бронь подтверждается сразу. Можно и написать нам в Instagram."], route: "Маршрут", ig: "Instagram" },
      tv: { k: "VIP · PlayStation 5", h: "Столы с PS5", t: ["Два VIP-стола с приставками: кальян, коктейли и матч на двоих или турнир на всю компанию."], link: "Забронировать стол с PS5" },
      secret: { k: "Закрытая зона · игровые ПК", h: "Secret Room", t: ["Полностью закрытое пространство с пятью игровыми компьютерами. Играйте соло или всем сквадом, курите кальян, пейте коктейли и ужинайте под стримы."], link: "Забронировать Secret Room" },
      photos: { k: "Галерея", h: "Как это выглядит вживую", t: ["Пара кадров из зала. Нажмите на фото, чтобы увеличить."], link: "Ещё фото на сайте" },
    },
    tips: { hookah: "Кальян", neon: "Вывеска", shelves: "Табаки", cocktail: "Коктейль", menu: "Меню", matchbox: "Спички", phone: "Бронь", tv: "PS5", secret: "Secret Room", photos: "Фото" },
  },
  sr: {
    title: "Spički 3D — zavirite u nargila bar u Beogradu", slogan: "vreme da izdahneš",
    wh: "Svratite <em>kod nas</em>", ws: "Ovo je naša sala u 3D: bar, neon, nargila, PS5 i Secret Room. Okrećite, približavajte i kliknite na predmete.",
    go: "Uđi", loading: "Učitavamo salu…", hint: "Prevucite — razgledajte · točkić ili štipanje — približite",
    book: "Rezerviši", found: (a, b) => `Otkriveno <b>${a}</b> od ${b}`,
    views: { overview: "Cela sala", hookah: "Nargila", bar: "Bar", tv: "PS5", secret: "Secret Room" },
    lights: { neon: "Neon", bar: "Osvetljenje bara", room: "Svetlo u sali" },
    phoneBtn: "Rezerviši sto", phoneRows: ["Danas · 21:30", "4 gosta · kod bara", "Nargila: novi miks"], menuSub: "kuhinja · bar · nargila",
    allFound: "Sve ste pronašli! Ostaje da dođete uživo.",
    hours: "Ned–Čet 12:00–00:00 · Pet–Sub 12:00–01:00",
    p: {
      hookah: { k: "Nargila", h: "Nargila kao u sali", t: ["Čelična cev, mat vaza, crni poklopac i dugačak muštikl — takve nargile i služimo.", "Majstor bira duvan i jačinu po vašem ukusu, a sistem prati ugljeve — zamena stiže na vreme."], puff: "Povuci dim", puffing: "Vučemo…" },
      neon: { k: "Natpis", h: "ŠPIČKI · ŠIBICE", t: ["Spički su šibice — otud plamičak iznad prvog slova.", "Hteli smo da spojimo raznovrsnu kuhinju, jak bar sa vinskom kartom, upečatljiv enterijer, networking i igre. Nastao je nargila bar u koji se dolazi na večeru, na meč i na dugo veče sa prijateljima."], toggle: ["Ugasi neon", "Upali neon"] },
      shelves: { k: "Duvan", h: "Zid duvana", t: ["Tegle iza šanka su paleta našeg majstora za nargile.", "Recite šta volite: voće, desert, svežinu, jače ili blaže — i on će složiti miks za vas."] },
      cocktail: { k: "Bar", h: "Kokteli i vino", t: ["Jak bar sa vinskom kartom i koktelima — uz nargilu i bez nje.", "Ceo meni i aktuelne cene — na Qastio."], link: "Meni bara" },
      menu: { k: "Kuhinja", h: "Kod nas se večera", t: ["Raznovrsna kuhinja — od predjela do glavnih jela. Spički nisu samo nargila."], link: "Ceo meni" },
      matchbox: { k: "Šibice", h: "Kresnite šibicu", t: ["Naša kutija šibica. Kresnite i zamislite dobro veče."], strike: "Kresni" },
      phone: { k: "Rezervacija", h: "Rezerviši sto", t: ["Online rezervacija se potvrđuje odmah. Možete nam pisati i na Instagramu."], route: "Mapa", ig: "Instagram" },
      tv: { k: "VIP stolovi · PlayStation 5", h: "Stolovi sa PS5", t: ["Dva VIP stola sa konzolama: nargila, kokteli i meč u dvoje ili turnir za celo društvo."], link: "Rezerviši sto sa PS5" },
      secret: { k: "Zatvorena zona · gejming računari", h: "Secret Room", t: ["Potpuno zatvoren prostor sa pet gejming računara. Igrajte solo ili sa celim skvadom, uz nargilu, koktele i večeru dok gledate strimove."], link: "Rezerviši Secret Room" },
      photos: { k: "Galerija", h: "Kako to izgleda uživo", t: ["Par kadrova iz sale. Kliknite na fotografiju da je uvećate."], link: "Još fotografija na sajtu" },
    },
    tips: { hookah: "Nargila", neon: "Natpis", shelves: "Duvani", cocktail: "Koktel", menu: "Meni", matchbox: "Šibice", phone: "Rezervacija", tv: "PS5", secret: "Secret Room", photos: "Fotografije" },
  },
  en: {
    title: "Spički 3D — step inside a Belgrade hookah lounge", slogan: "time to exhale",
    wh: "Come on <em>in</em>", ws: "This is our lounge in 3D: the bar, neon, hookah, PS5 and the Secret Room. Drag, zoom and click on things.",
    go: "Step in", loading: "Loading the lounge…", hint: "Drag to look around · scroll or pinch to zoom",
    book: "Book a table", found: (a, b) => `Found <b>${a}</b> of ${b}`,
    views: { overview: "Whole lounge", hookah: "Hookah", bar: "Bar", tv: "PS5", secret: "Secret Room" },
    lights: { neon: "Neon", bar: "Bar glow", room: "Room lights" },
    phoneBtn: "Book a table", phoneRows: ["Today · 21:30", "4 guests · by the bar", "Hookah: fresh mix"], menuSub: "kitchen · bar · hookah",
    allFound: "You found everything! Now come and see it for real.",
    hours: "Sun–Thu 12:00–00:00 · Fri–Sat 12:00–01:00",
    p: {
      hookah: { k: "Hookah", h: "The hookah we serve", t: ["Steel stem, frosted vase, black wind cover and a long mouthpiece — exactly what you get in the lounge.", "Our hookah master picks the tobacco and strength for you, and a system keeps track of the coals so they're changed on time."], puff: "Take a puff", puffing: "Puffing…" },
      neon: { k: "Sign", h: "ŠPIČKI · ŠIBICE", t: ["Spički means “matches” — šibice in Serbian. Hence the little flame over the first letter.", "We wanted a varied kitchen, a strong bar with a wine list, a bold interior, networking and games under one roof. The result is a hookah lounge for dinner, a match, or a long night with friends."], toggle: ["Turn neon off", "Turn neon on"] },
      shelves: { k: "Tobacco", h: "The tobacco wall", t: ["The jars behind the bar are our hookah master's palette.", "Tell them what you like — fruity, dessert, fresh, stronger or lighter — and they'll build a mix for you."] },
      cocktail: { k: "Bar", h: "Cocktails and wine", t: ["A strong bar with a wine list and cocktails — with a hookah or without.", "The full menu with current prices is on Qastio."], link: "Bar menu" },
      menu: { k: "Kitchen", h: "People come here for dinner", t: ["A varied kitchen, from starters to mains. Spički is more than hookah."], link: "Full menu" },
      matchbox: { k: "Matches", h: "Strike a match", t: ["Our own matchbox. Strike one and wish for a good night."], strike: "Strike" },
      phone: { k: "Booking", h: "Book a table", t: ["Online bookings are confirmed instantly. You can also DM us on Instagram."], route: "Directions", ig: "Instagram" },
      tv: { k: "VIP tables · PlayStation 5", h: "PS5 tables", t: ["Two VIP tables with consoles: hookah, cocktails and a one-on-one match or a tournament for the whole group."], link: "Book a PS5 table" },
      secret: { k: "Private zone · gaming PCs", h: "Secret Room", t: ["A fully private room with five gaming PCs. Play solo or as a squad, with hookah, cocktails and dinner while the streams are on."], link: "Book the Secret Room" },
      photos: { k: "Gallery", h: "What it looks like for real", t: ["A few shots from the lounge. Click a photo to enlarge it."], link: "More photos on the site" },
    },
    tips: { hookah: "Hookah", neon: "Sign", shelves: "Tobacco", cocktail: "Cocktail", menu: "Menu", matchbox: "Matches", phone: "Booking", tv: "PS5", secret: "Secret Room", photos: "Photos" },
  },
};
const q = new URLSearchParams(location.search);
const LANG = T[q.get("lang")] ? q.get("lang") : (navigator.language || "ru").slice(0, 2) === "sr" ? "sr" : (navigator.language || "ru").slice(0, 2) === "en" ? "en" : "ru";
const t = T[LANG];
const HL = { ru: "ru", sr: "sr", en: "en" }[LANG];
const zoneLink = (z) => `${BOOK}?zone=${z}&lang=${HL}`;
const $ = (id) => document.getElementById(id);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.lang = LANG;
document.title = t.title;
$("wh").innerHTML = t.wh; $("ws").textContent = t.ws; $("wgo").textContent = t.loading; $("whint").textContent = t.hint;
$("book").textContent = t.book; $("book").href = `${BOOK}?lang=${HL}`;
for (const a of document.querySelectorAll("#langs a")) { a.classList.toggle("on", a.dataset.l === LANG); a.href = `?lang=${a.dataset.l}`; }

// ---------- рендер ----------
const stage = $("stage");
const mobile = matchMedia("(pointer: coarse)").matches || innerWidth < 720;
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
stage.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.03, 40);
await document.fonts.load('600 100px "Montserrat"').catch(() => {});
await document.fonts.load('700 100px "Montserrat"').catch(() => {});

let loaded = 0; const NEED = 3;
const W = buildWorld(renderer, t, () => { loaded++; $("wbar").style.width = Math.min(100, 30 + loaded / NEED * 70) + "%"; if (loaded >= NEED) ready(); });
$("wbar").style.width = "30%";
setTimeout(ready, 6000); // если фото долго грузятся — не держим
const { scene, hot, views } = W;

const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: mobile ? 2 : 4 }));
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), 0.55, 0.42, 1.0);
composer.addPass(bloom);
composer.addPass(new OutputPass());
function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.fov = camera.aspect < 0.8 ? 66 : camera.aspect < 1.2 ? 58 : 48;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
  bloom.resolution.set(innerWidth / 2, innerHeight / 2);
}
addEventListener("resize", resize);

// ---------- камера: орбита + пружинный перелёт ----------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.minDistance = 0.25; controls.maxDistance = 7.5;
controls.maxPolarAngle = Math.PI * 0.58; controls.minPolarAngle = Math.PI * 0.12;
controls.rotateSpeed = 0.55; controls.zoomSpeed = 0.8; controls.panSpeed = 0.6;
controls.screenSpacePanning = true;

function adapt(v) {
  // на узких экранах отходим назад вдоль взгляда, чтобы предмет влез
  const pos = v.pos.clone(), tg = v.target.clone(), a = innerWidth / innerHeight;
  if (a < 1.2) pos.sub(tg).multiplyScalar(a < 0.8 ? 1.45 : 1.2).add(tg);
  return { pos, target: tg };
}
const start = adapt(views.overview);
camera.position.copy(start.pos).add(new THREE.Vector3(1.2, 0.6, 2.2)); controls.target.copy(start.target);
resize();

const fly = { on: false, pos: new THREE.Vector3(), tg: new THREE.Vector3(), vp: new THREE.Vector3(), vt: new THREE.Vector3() };
function flyTo(v) {
  const a = adapt(v);
  if (reduce) { camera.position.copy(a.pos); controls.target.copy(a.target); fly.on = false; return; }
  fly.pos.copy(a.pos); fly.tg.copy(a.target); fly.on = true;   // скорость сохраняется — перелёт можно перенаправить на лету
}
controls.addEventListener("start", () => { fly.on = false; fly.vp.set(0, 0, 0); fly.vt.set(0, 0, 0); });
function springStep(x, v, goal, dt, w = 4.2) {
  // критически демпфированная пружина
  const f = goal.clone().sub(x).multiplyScalar(w * w).sub(v.clone().multiplyScalar(2 * w));
  v.addScaledVector(f, dt); x.addScaledVector(v, dt);
}
const ROOM = new THREE.Box3(new THREE.Vector3(-4.35, 0.18, -3.75), new THREE.Vector3(4.35, 3.2, 6.5));

// ---------- звук ----------
const AC = window.AudioContext || window.webkitAudioContext;
let ac = null, master = null, muted = false; const sbuf = {};
const raw = {}; for (const f of ["hookah-bubbles", "hookah-exhale"]) raw[f] = fetch(`sfx/${f}.mp3`).then((r) => r.arrayBuffer()).catch(() => null);
function audio() {
  if (!AC) return null;
  if (!ac) {
    ac = new AC(); master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
    for (const f in raw) sbuf[f] = raw[f].then((ab) => ab && new Promise((ok) => ac.decodeAudioData(ab, ok, () => ok(null))));
  }
  if (ac.state !== "running") ac.resume();
  return ac;
}
function sfx(name, g = 1) { if (!ac || muted || !sbuf[name]) return; sbuf[name].then((b) => { if (!b) return; const s = ac.createBufferSource(), gn = ac.createGain(); s.buffer = b; gn.gain.value = g; s.connect(gn); gn.connect(master); s.start(); }); }
function scratch() {
  // чирк спички: короткий шорох шума
  if (!ac || muted) return;
  const n = ac.sampleRate * 0.35, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) { const k = i / n; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - k, 2) * (k < 0.05 ? k / 0.05 : 1); }
  const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = b; f.type = "bandpass"; f.frequency.value = 3200; f.Q.value = 0.8; g.gain.value = 0.9;
  s.connect(f); f.connect(g); g.connect(master); s.start();
  // вспышка серы
  const o = ac.createBufferSource(), f2 = ac.createBiquadFilter(), g2 = ac.createGain(); o.buffer = b; f2.type = "lowpass"; f2.frequency.value = 900; g2.gain.setValueAtTime(0, ac.currentTime + 0.12); g2.gain.linearRampToValueAtTime(0.8, ac.currentTime + 0.16); g2.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.6);
  o.connect(f2); f2.connect(g2); g2.connect(master); o.start(ac.currentTime + 0.12);
}
const sndBtn = $("snd");
function syncSnd() { sndBtn.classList.toggle("is-on", !muted); sndBtn.setAttribute("aria-pressed", String(!muted)); sndBtn.title = muted ? "Sound off" : "Sound on"; }
sndBtn.onclick = () => { audio(); muted = !muted; if (master) master.gain.setTargetAtTime(muted ? 0 : 0.9, ac.currentTime, 0.05); syncSnd(); };
syncSnd();

// ---------- интерфейс ----------
const KEYS = Object.keys(hot), seen = new Set();
function updateFound() { $("found").innerHTML = t.found(seen.size, KEYS.length); }
updateFound();

const vbar = $("views");
for (const k of ["overview", "hookah", "bar", "tv", "secret"]) {
  const b = document.createElement("button"); b.type = "button"; b.textContent = t.views[k]; b.dataset.v = k;
  b.onclick = () => { closePanel(); flyTo(views[k]); mark(k); if (k !== "overview" && hot[k]) open(k, false); };
  vbar.appendChild(b);
}
function mark(k) { for (const b of vbar.children) b.classList.toggle("on", b.dataset.v === k); }
mark("overview");

// свет
const pop = $("lightPop");
for (const g of ["neon", "bar", "room"]) {
  const l = document.createElement("label"); l.innerHTML = `<span>${t.lights[g]}</span><input type="checkbox" checked>`;
  l.querySelector("input").onchange = (e) => { W.setLight(g, e.target.checked); if (g === "neon") neonBtnSync(); };
  pop.appendChild(l);
}
$("lightBtn").onclick = () => { pop.hidden = !pop.hidden; $("lightBtn").setAttribute("aria-expanded", String(!pop.hidden)); };

// панель
const panel = $("panel");
function el(tag, cls, txt) { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
function btn(label, cls, onclick, href) {
  const b = el(href ? "a" : "button", "btn" + (cls ? " " + cls : ""), label);
  if (href) { b.href = href; b.target = "_blank"; b.rel = "noopener"; } else { b.type = "button"; b.onclick = onclick; }
  return b;
}
let neonBtn = null;
function neonBtnSync() { if (neonBtn) neonBtn.textContent = t.p.neon.toggle[W.lightState.neon ? 0 : 1]; const cb = pop.querySelectorAll("input")[0]; if (cb) cb.checked = !!W.lightState.neon; }
function open(key, move = true) {
  const p = t.p[key]; if (!p) return;
  if (move) { flyTo(views[key]); mark(["hookah", "tv", "secret"].includes(key) ? key : key === "neon" || key === "shelves" ? "bar" : ""); }
  $("pk").textContent = p.k; $("ph").textContent = p.h;
  const tx = $("pt"); tx.innerHTML = ""; p.t.forEach((s) => tx.appendChild(el("p", "", s)));
  const pa = $("pa"); pa.innerHTML = ""; neonBtn = null;
  if (key === "hookah") {
    const b = btn(p.puff, "main", () => puff(b)); pa.append(b, btn(t.book, "", null, `${BOOK}?zone=main&lang=${HL}`));
  } else if (key === "neon") {
    neonBtn = btn("", "main", () => { W.setLight("neon", !W.lightState.neon); neonBtnSync(); }); neonBtnSync(); pa.append(neonBtn);
  } else if (key === "shelves") pa.append(btn(t.p.menu.link, "", null, MENU));
  else if (key === "cocktail" || key === "menu") pa.append(btn(p.link, "main", null, MENU));
  else if (key === "matchbox") pa.append(btn(p.strike, "main", () => { audio(); W.strike(); scratch(); }));
  else if (key === "phone") {
    tx.appendChild(el("p", "hours", "Mačvanska 10, Beograd · " + t.hours));
    pa.append(btn(t.book, "main", null, `${BOOK}?lang=${HL}`), btn(p.ig, "", null, IG), btn(p.route, "", null, MAP));
  } else if (key === "tv") pa.append(btn(p.link, "main", null, zoneLink("ps5")));
  else if (key === "secret") pa.append(btn(p.link, "main", null, zoneLink("secret")));
  else if (key === "photos") {
    const th = el("div", "thumbs");
    for (let i = 1; i <= 5; i++) { const im = el("img"); im.src = `img/p${i}.webp`; im.alt = ""; im.loading = "lazy"; im.onclick = () => zoom(im.src); th.appendChild(im); }
    tx.appendChild(th); pa.append(btn(p.link, "", null, `https://spickibg.com/${LANG === "ru" ? "" : LANG + "/"}#gallery`));
  }
  panel.hidden = false; panel.style.animation = "none"; void panel.offsetWidth; panel.style.animation = "";
  discover(key);
}
function closePanel() { panel.hidden = true; }
$("panelX").onclick = closePanel;
addEventListener("keydown", (e) => { if (e.key === "Escape") { if (document.querySelector(".big")) document.querySelector(".big").remove(); else { closePanel(); flyTo(views.overview); mark("overview"); } } });
function zoom(src) { const d = el("div", "big"); const im = el("img"); im.src = src; d.appendChild(im); d.onclick = () => d.remove(); document.body.appendChild(d); }

function discover(key) {
  if (seen.has(key)) return;
  seen.add(key); hot[key].beacon.visible = false; updateFound();
  if (seen.size === KEYS.length) {
    const d = el("div", "toast"); d.append(el("span", "", t.allFound), btn(t.book, "main", null, `${BOOK}?lang=${HL}`));
    document.body.appendChild(d); setTimeout(() => d.remove(), 9000);
  }
}

// затяжка: угли разгораются под бульканье, потом выдох — облако дыма от камеры в зал
let puffing = false;
function puff(b) {
  if (puffing) return; puffing = true; audio();
  if (b) { b.disabled = true; b.textContent = t.p.hookah.puffing; }
  sfx("hookah-bubbles", 1);
  const t0 = performance.now();
  const iv = setInterval(() => { W.hookah.boost = 1; if (performance.now() - t0 > 2200) clearInterval(iv); }, 100);
  setTimeout(() => {
    sfx("hookah-exhale", 1);
    const dir = new THREE.Vector3(); camera.getWorldDirection(dir);
    const up = camera.up.clone();
    let n = 0;
    const em = setInterval(() => {
      for (let i = 0; i < 3; i++) {
        const o = camera.position.clone().addScaledVector(dir, 0.28).addScaledVector(up, -0.07);
        const v = dir.clone().multiplyScalar(0.45 + Math.random() * 0.5).add(new THREE.Vector3((Math.random() - 0.5) * 0.25, Math.random() * 0.12, (Math.random() - 0.5) * 0.25));
        W.emit(o, { v: [v.x, v.y, v.z], size: 0.06, grow: 0.22, alpha: 0.32, life: 3 + Math.random() * 1.5, drag: 0.35 });
      }
      if (++n > 22) clearInterval(em);
    }, 40);
    setTimeout(() => { puffing = false; if (b) { b.disabled = false; b.textContent = t.p.hookah.puff; } }, 2600);
  }, 2300);
}

// ---------- наведение и клики ----------
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), tip = $("tip");
const pickables = []; for (const k of KEYS) hot[k].group.traverse((o) => { if (o.isMesh) pickables.push(o); });
function pick(x, y) {
  ndc.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const h = ray.intersectObjects(pickables, false)[0];
  return h ? h.object.userData.hot : null;
}
let down = null, hoverKey = null;
renderer.domElement.addEventListener("pointerdown", (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; pop.hidden = true; });
renderer.domElement.addEventListener("pointerup", (e) => {
  if (!down) return; const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null;
  if (moved > 7) return;
  const k = pick(e.clientX, e.clientY);
  if (k) open(k); else if (!panel.hidden) closePanel();
});
renderer.domElement.addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse" || down) { tip.hidden = true; return; }
  const k = pick(e.clientX, e.clientY);
  if (k !== hoverKey) { hoverKey = k; stage.classList.toggle("hover", !!k); tip.hidden = !k; if (k) tip.textContent = t.tips[k]; }
  if (k) { tip.style.left = e.clientX + "px"; tip.style.top = e.clientY + "px"; }
});
renderer.domElement.addEventListener("pointerleave", () => { tip.hidden = true; hoverKey = null; stage.classList.remove("hover"); });

// ---------- старт ----------
let isReady = false;
function ready() {
  if (isReady) return; isReady = true;
  $("wbar").style.width = "100%"; const g = $("wgo"); g.disabled = false; g.textContent = t.go;
}
$("wgo").onclick = () => {
  audio();
  $("welcome").classList.add("gone");
  flyTo(views.overview);
};
if (q.has("skip")) { ready(); $("welcome").classList.add("gone"); camera.position.copy(start.pos); }
if (q.get("view") && views[q.get("view")]) { const v = adapt(views[q.get("view")]); camera.position.copy(v.pos); controls.target.copy(v.target); }
if (q.get("open") && hot[q.get("open")]) setTimeout(() => open(q.get("open"), false), 50);

// Когда открыта панель — сдвигаем кадр, чтобы предмет не прятался под ней
const off = { x: 0, y: 0 };
function frameOffset(dt) {
  let gx = 0, gy = 0;
  if (!panel.hidden) { if (innerWidth <= 720) gy = innerHeight * 0.2; else gx = Math.min(200, innerWidth * 0.13); }
  const k = reduce ? 1 : 1 - Math.exp(-dt * 6);
  off.x += (gx - off.x) * k; off.y += (gy - off.y) * k;
  if (Math.abs(off.x) < 0.5 && Math.abs(off.y) < 0.5) { if (camera.view && camera.view.enabled) camera.clearViewOffset(); }
  else camera.setViewOffset(innerWidth, innerHeight, off.x, off.y, innerWidth, innerHeight);
}

// Слабое устройство: если кадров стабильно мало — снижаем разрешение (фоновую вкладку с 1–5 к/с не считаем)
const perf = { n: 0, t: 0, step: 0 };
function adaptQuality(dt) {
  if (perf.step > 1 || document.hidden) return;
  perf.n++; perf.t += dt;
  if (perf.t < 2.5) return;
  const fps = perf.n / perf.t; perf.n = 0; perf.t = 0;
  if (fps > 6 && fps < 34) {
    perf.step++;
    renderer.setPixelRatio(perf.step === 1 ? Math.min(devicePixelRatio, 1.1) : 0.85);
    resize();
  }
}

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(0.05, clock.getDelta()), tt = clock.elapsedTime;
  if (fly.on) {
    springStep(camera.position, fly.vp, fly.pos, dt); springStep(controls.target, fly.vt, fly.tg, dt);
    if (camera.position.distanceTo(fly.pos) < 0.002 && controls.target.distanceTo(fly.tg) < 0.002 && fly.vp.length() < 0.01) fly.on = false;
  }
  frameOffset(dt);
  controls.update();
  camera.position.clamp(ROOM.min, ROOM.max);
  W.update(tt, dt);
  composer.render();
  adaptQuality(dt);
});
