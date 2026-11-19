// Spički 3D — текстуры, нарисованные на canvas: неон, экраны, этикетки, дым.
import * as THREE from "three";

const F = '"Montserrat", system-ui, sans-serif';

function cv(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; }
function tex(c, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Пламя спички над «S» — как в логотипе
function flame(g, x, y, s) {
  g.beginPath();
  g.moveTo(x, y);
  g.bezierCurveTo(x - s * 0.55, y - s * 0.35, x - s * 0.35, y - s * 0.95, x + s * 0.05, y - s * 1.35);
  g.bezierCurveTo(x + s * 0.05, y - s * 0.85, x + s * 0.5, y - s * 0.7, x + s * 0.42, y - s * 0.25);
  g.bezierCurveTo(x + s * 0.36, y - s * 0.05, x + s * 0.18, y + s * 0.02, x, y);
  g.closePath();
}

// Вывеска ŠPIČKI: трубки-контуры тёплого белого неона (strokeText даёт ровно такой «двойной» контур)
export function neonSign() {
  const [c, g] = cv(2048, 640);
  g.clearRect(0, 0, c.width, c.height);
  g.font = `600 380px ${F}`;
  g.textBaseline = "alphabetic";
  const txt = "SPIČKI", w = g.measureText(txt).width, x0 = (c.width - w) / 2, y0 = 520;
  for (const [lw, col, blur] of [[26, "rgba(255,170,90,.55)", 60], [14, "#ffe2bd", 24], [6, "#fffaf0", 6]]) {
    g.save(); g.lineWidth = lw; g.strokeStyle = col; g.shadowColor = "rgba(255,150,70,.9)"; g.shadowBlur = blur; g.lineJoin = "round";
    g.strokeText(txt, x0, y0);
    const sW = g.measureText("S").width;
    flame(g, x0 + sW * 0.52, y0 - 300, 120); g.stroke();
    g.restore();
  }
  return tex(c);
}

// Малая вывеска ŠIBICE — красно-оранжевый неон, заливкой
export function sibice() {
  const [c, g] = cv(1024, 256);
  g.font = `700 150px ${F}`;
  g.textAlign = "center"; g.textBaseline = "middle";
  for (const [col, blur] of [["rgba(255,80,40,.7)", 40], ["#ff6a3a", 14], ["#ffd2bf", 2]]) {
    g.save(); g.fillStyle = col; g.shadowColor = "#ff3a1a"; g.shadowBlur = blur; g.fillText("ŠIBICE", 512, 135); g.restore();
  }
  return tex(c);
}

// Розовый неон с любой надписью (Secret Room, слоган)
export function pinkNeon(text, size = 120, w = 1024, h = 256, italic = false) {
  const [c, g] = cv(w, h);
  g.font = `${italic ? "italic " : ""}600 ${size}px ${F}`;
  g.textAlign = "center"; g.textBaseline = "middle";
  for (const [lw, col, blur] of [[16, "rgba(255,46,126,.55)", 40], [8, "#ff5fa2", 16], [3, "#ffe0ee", 3]]) {
    g.save(); g.lineWidth = lw; g.strokeStyle = col; g.shadowColor = "#ff2e7e"; g.shadowBlur = blur; g.lineJoin = "round"; g.strokeText(text, w / 2, h / 2 + 6); g.restore();
  }
  return tex(c);
}

// Градиент подсветки рифлёной стойки: снизу ярко, кверху гаснет
export function ribGlow() {
  const [c, g] = cv(4, 256);
  const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, "#1a0500"); gr.addColorStop(0.45, "#5a1404"); gr.addColorStop(0.85, "#ff5a1a"); gr.addColorStop(1, "#ffb070");
  g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
  return tex(c);
}

// Перфорация колпака кальяна: альфа-карта с дырочками
export function perforated() {
  const [c, g] = cv(256, 128);
  g.fillStyle = "#fff"; g.fillRect(0, 0, 256, 128);
  g.fillStyle = "#000";
  for (let y = 10; y < 118; y += 12) for (let x = (y / 12) % 2 ? 6 : 12; x < 256; x += 12) { g.beginPath(); g.arc(x, y, 3.6, 0, 7); g.fill(); }
  const t = tex(c, false); t.wrapS = THREE.RepeatWrapping; return t;
}

// Шум для бетона/штукатурки
export function grain(base, amp = 18, size = 256) {
  const [c, g] = cv(size, size);
  const im = g.createImageData(size, size), d = im.data;
  const [r0, g0, b0] = base;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amp;
    d[i] = r0 + n; d[i + 1] = g0 + n; d[i + 2] = b0 + n; d[i + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

// Клуб дыма для частиц
export function puff() {
  const N = 128, [c, g] = cv(N, N), im = g.createImageData(N, N), d = im.data, oct = [];
  for (let o = 0; o < 4; o++) { const cells = 3 << o, gr = []; for (let k = 0; k < (cells + 1) ** 2; k++) gr.push(Math.random()); oct.push({ c: cells, g: gr, w: 1 / 1.8 ** o }); }
  const sm = (v) => v * v * (3 - 2 * v);
  for (let py = 0; py < N; py++) for (let px = 0; px < N; px++) {
    let v = 0, ws = 0;
    for (let q = 0; q < oct.length; q++) {
      const O = oct[q], fx = px / N * O.c, fy = py / N * O.c, ix = fx | 0, iy = fy | 0, tx = sm(fx - ix), ty = sm(fy - iy), W = O.c + 1;
      const a = O.g[iy * W + ix], b = O.g[iy * W + ix + 1], cc = O.g[(iy + 1) * W + ix], dd = O.g[(iy + 1) * W + ix + 1];
      const n = (a + (b - a) * tx) * (1 - ty) + (cc + (dd - cc) * tx) * ty;
      v += O.w * (q ? 1 - Math.abs(n * 2 - 1) : n); ws += O.w;
    }
    v /= ws;
    const dx = px / N * 2 - 1, dy = py / N * 2 - 1, r = Math.hypot(dx, dy), fall = Math.max(0, 1 - r * r);
    const al = Math.max(0, Math.min(1, (v * fall - 0.18) * 2.2)), i = (py * N + px) * 4;
    d[i] = 235; d[i + 1] = 226; d[i + 2] = 232; d[i + 3] = al * 255;
  }
  g.putImageData(im, 0, 0);
  return tex(c);
}

// Мягкое круглое пятно — тень под предметами, маячки
export function blob(inner = "rgba(0,0,0,.75)") {
  const [c, g] = cv(128, 128), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, inner); gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return tex(c);
}

// Экран телефона: бронь стола
export function phoneScreen(t) {
  const [c, g] = cv(360, 760);
  const gr = g.createLinearGradient(0, 0, 0, 760); gr.addColorStop(0, "#2a1420"); gr.addColorStop(1, "#0f0a0d");
  g.fillStyle = gr; g.fillRect(0, 0, 360, 760);
  g.fillStyle = "#fff0f5"; g.font = `600 22px ${F}`; g.fillText("21:37", 28, 50);
  g.font = `700 44px ${F}`; g.fillText("Spički", 28, 170);
  g.fillStyle = "#bfa2ae"; g.font = `500 22px ${F}`; g.fillText("Mačvanska 10", 28, 206);
  g.fillStyle = "#ff2e7e"; roundRect(g, 28, 560, 304, 78, 39); g.fill();
  g.fillStyle = "#fff"; g.font = `700 26px ${F}`; g.textAlign = "center"; g.fillText(t.phoneBtn, 180, 608);
  g.textAlign = "left"; g.fillStyle = "rgba(255,240,245,.14)";
  for (let i = 0; i < 3; i++) { roundRect(g, 28, 260 + i * 92, 304, 74, 18); g.fill(); }
  g.fillStyle = "#fff0f5"; g.font = `600 22px ${F}`;
  t.phoneRows.forEach((r, i) => g.fillText(r, 52, 305 + i * 92));
  return tex(c);
}

// Экран телевизора с PS5: абстрактный файтинг (без чужих персонажей)
export function tvScreen(frame = 0, reuse) {
  const [c, g] = reuse ? [reuse, reuse.getContext("2d")] : cv(1024, 576);
  const gr = g.createLinearGradient(0, 0, 0, 576); gr.addColorStop(0, "#3a5bd8"); gr.addColorStop(0.6, "#7a4bd0"); gr.addColorStop(1, "#1a1030");
  g.fillStyle = gr; g.fillRect(0, 0, 1024, 576);
  g.fillStyle = "rgba(255,255,255,.08)"; for (let i = 0; i < 14; i++) g.fillRect(((i * 97 + frame * 3) % 1100) - 50, 380 + (i % 3) * 20, 60, 4);
  g.fillStyle = "#1b1030"; g.fillRect(0, 470, 1024, 106);
  // полоски здоровья
  g.fillStyle = "#111"; g.fillRect(40, 34, 400, 30); g.fillRect(584, 34, 400, 30);
  g.fillStyle = "#ffcc33"; g.fillRect(44, 38, 392 * (0.78 - (frame % 50) / 400), 22);
  g.fillStyle = "#ff3a6a"; g.fillRect(588 + 392 * 0.45, 38, 392 * 0.55, 22);
  g.fillStyle = "#fff"; g.font = `800 48px ${F}`; g.textAlign = "center"; g.fillText(String(49 - (frame % 40)), 512, 66);
  g.font = `700 20px ${F}`; g.textAlign = "left"; g.fillText("P1", 44, 92); g.textAlign = "right"; g.fillText("P2", 980, 92);
  // два силуэта-бойца
  const bob = Math.sin(frame * 0.4) * 6;
  fighter(g, 360, 470 + bob, "#ffd23a", 1); fighter(g, 660, 470 - bob, "#ff4f8a", -1);
  if (frame % 9 < 3) { g.fillStyle = "rgba(255,255,255,.9)"; star(g, 510, 300, 40); }
  return c;
}
function fighter(g, x, y, col, dir) {
  g.save(); g.translate(x, y); g.scale(dir, 1); g.fillStyle = col;
  g.beginPath(); g.arc(0, -260, 34, 0, 7); g.fill();
  roundRect(g, -40, -220, 80, 130, 26); g.fill();
  g.fillRect(-34, -100, 26, 100); g.fillRect(8, -100, 26, 100);
  g.save(); g.translate(30, -200); g.rotate(-0.25); g.fillRect(0, 0, 110, 24); g.restore();
  g.restore();
}
function star(g, x, y, r) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5, rr = i % 2 ? r * 0.4 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill(); }

// Коробок спичек Spički
export function matchbox() {
  const [c, g] = cv(512, 320);
  g.fillStyle = "#121012"; g.fillRect(0, 0, 512, 320);
  g.fillStyle = "#ff2e7e"; g.fillRect(0, 0, 512, 26); g.fillRect(0, 294, 512, 26);
  g.fillStyle = "#fff0f5"; g.font = `700 92px ${F}`; g.textAlign = "center"; g.fillText("SPIČKI", 256, 190);
  g.fillStyle = "#ff5fa2"; flame(g, 168, 108, 34); g.fill();
  g.fillStyle = "#bfa2ae"; g.font = `600 26px ${F}`; g.fillText("Š I B I C E", 256, 244);
  return tex(c);
}
// Тёрка коробка
export function striker() {
  const [c, g] = cv(64, 64); g.fillStyle = "#4a2418"; g.fillRect(0, 0, 64, 64);
  for (let i = 0; i < 400; i++) { g.fillStyle = Math.random() < 0.5 ? "#2a120a" : "#6a3a28"; g.fillRect(Math.random() * 64, Math.random() * 64, 2, 2); }
  return tex(c);
}

// Меню-домик на столе
export function menuCard(t) {
  const [c, g] = cv(400, 520);
  g.fillStyle = "#f2e9e4"; g.fillRect(0, 0, 400, 520);
  g.fillStyle = "#121012"; g.font = `700 72px ${F}`; g.textAlign = "center"; g.fillText("MENU", 200, 230);
  g.fillStyle = "#ff2e7e"; flame(g, 200, 130, 46); g.fill();
  g.fillStyle = "#555"; g.font = `500 26px ${F}`; g.fillText(t.menuSub, 200, 300);
  g.fillStyle = "#121012"; g.font = `600 22px ${F}`; g.fillText("qastio.app", 200, 460);
  return tex(c);
}

// Этикетки банок табака: полосы разных цветов
export function jarLabel() {
  const [c, g] = cv(256, 64);
  const cols = ["#f2efe8", "#2a63c9", "#f08a2c", "#d9d9d9", "#1d1d1d", "#e2486e", "#f4c542", "#3cb371", "#8b5cf6", "#ffffff"];
  for (let i = 0; i < 8; i++) { g.fillStyle = cols[(Math.random() * cols.length) | 0]; g.fillRect(i * 32, 0, 32, 64); }
  g.fillStyle = "rgba(0,0,0,.25)"; for (let i = 0; i < 8; i++) g.fillRect(i * 32 + 6, 24, 20, 6);
  return tex(c);
}

// Решётка кабель-каналов под потолком
export function mesh() {
  const [c, g] = cv(128, 128); g.fillStyle = "#000"; g.fillRect(0, 0, 128, 128);
  g.strokeStyle = "#fff"; g.lineWidth = 3;
  for (let i = 0; i <= 128; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 128); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(128, i); g.stroke(); }
  const t = tex(c, false); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
