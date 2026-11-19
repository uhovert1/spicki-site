// Spički 3D — сцена: зал, бар с рифлёной подсветкой, неон, полки с табаком, кальян, стол, PS5, Secret Room.
// Всё собрано из примитивов three.js — без внешних моделей. Метры, Y — вверх; задняя стена бара z = -4.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import * as TX from "./tex.js";

RectAreaLightUniformsLib.init();

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const rnd = (a, b) => a + Math.random() * (b - a);

export function buildWorld(renderer, t, onProgress) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#07050a");
  scene.fog = new THREE.Fog("#07050a", 7, 16);

  // Окружение для металла: маленькая «комната» из светящихся панелей в цветах бара
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color("#120a0c");
  const panel = (col, w, h, p, r) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide })); m.position.copy(p); if (r) m.rotation.set(...r); envScene.add(m); };
  panel(new THREE.Color("#ff5a1a").multiplyScalar(3), 6, 1, V(0, -1, -4));
  panel(new THREE.Color("#ffe2bd").multiplyScalar(4), 4, 0.8, V(0, 2.5, -4));
  panel(new THREE.Color("#ff2e7e").multiplyScalar(2), 1.5, 1.5, V(-4, 1.5, 0), [0, Math.PI / 2, 0]);
  panel(new THREE.Color("#fff1dd").multiplyScalar(2), 3, 3, V(0, 4, 0), [Math.PI / 2, 0, 0]);
  scene.environment = pmrem.fromScene(envScene, 0.04).texture;
  scene.environmentIntensity = 0.35;

  const hot = {};         // кликабельные предметы: ключ → { group, beacon }
  const lights = { neon: [], bar: [], room: [] };   // группы для кнопки «Свет»
  const flick = [];       // мерцающие источники
  const tick = [];        // функции анимации

  // ---------- материалы ----------
  const M = {
    floor: new THREE.MeshStandardMaterial({ color: "#161213", roughness: 0.5, metalness: 0.0, map: TX.grain([60, 50, 50], 26) }),
    wall: new THREE.MeshStandardMaterial({ color: "#3a2e30", roughness: 0.95, map: TX.grain([70, 58, 60], 22) }),
    ceil: new THREE.MeshStandardMaterial({ color: "#0c0a0b", roughness: 1 }),
    black: new THREE.MeshStandardMaterial({ color: "#121012", roughness: 0.5, metalness: 0.5 }),
    blackMatte: new THREE.MeshStandardMaterial({ color: "#0d0c0d", roughness: 0.85 }),
    steel: new THREE.MeshStandardMaterial({ color: "#d7dade", roughness: 0.18, metalness: 1 }),
    top: new THREE.MeshStandardMaterial({ color: "#1c1b1c", roughness: 0.3, metalness: 0.2 }),
    wood: new THREE.MeshStandardMaterial({ color: "#4a3326", roughness: 0.55 }),
    fabric: new THREE.MeshStandardMaterial({ color: "#2c2629", roughness: 0.95 }),
    leather: new THREE.MeshStandardMaterial({ color: "#171416", roughness: 0.55, metalness: 0.05 }),
    glass: new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.05, transmission: 1, thickness: 0.01, ior: 1.5, transparent: true, opacity: 0.35 }),
  };
  M.floor.map.repeat.set(8, 8); M.wall.map.repeat.set(6, 3);

  const add = (geo, mat, x = 0, y = 0, z = 0, parent = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const shadowBlob = TX.blob();
  const contact = (x, z, r, o = 0.7, parent = scene, y = 0.002) => {
    const m = add(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: shadowBlob, transparent: true, opacity: o, depthWrite: false }), x, y, z, parent);
    m.rotation.x = -Math.PI / 2; return m;
  };

  // ---------- комната ----------
  const floor = add(new THREE.PlaneGeometry(12, 12), M.floor, 0, 0, 0); floor.rotation.x = -Math.PI / 2;
  add(new THREE.PlaneGeometry(10, 3.4), M.wall, 0, 1.7, -4);
  const lw = add(new THREE.PlaneGeometry(9, 3.4), M.wall, -4.6, 1.7, 0.5); lw.rotation.y = Math.PI / 2;
  const rw = add(new THREE.PlaneGeometry(9, 3.4), M.wall, 4.6, 1.7, 0.5); rw.rotation.y = -Math.PI / 2;
  const ce = add(new THREE.PlaneGeometry(10, 9), M.ceil, 0, 3.4, 0.5); ce.rotation.x = Math.PI / 2;

  // кабель-каналы под потолком
  const meshMat = new THREE.MeshStandardMaterial({ color: "#1a1a1c", metalness: 0.6, roughness: 0.5, alphaMap: TX.mesh(), alphaTest: 0.5, side: THREE.DoubleSide });
  meshMat.alphaMap.repeat.set(30, 1);
  for (const z of [-2.6, -0.6, 1.4]) add(new THREE.BoxGeometry(8.6, 0.08, 0.3), meshMat, 0, 3.12, z);
  // светильники-«банки» над стойкой
  for (const x of [-1.6, 0, 1.6]) {
    add(new THREE.CylinderGeometry(0.07, 0.07, 0.16, 20), M.black, x, 3.25, -2.7);
    const d = add(new THREE.CircleGeometry(0.055, 20), new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffd9a8").multiplyScalar(4), toneMapped: false }), x, 3.168, -2.7);
    d.rotation.x = Math.PI / 2; lights.room.push({ obj: d.material, on: 4, color: "#ffd9a8" });
    const s = new THREE.SpotLight("#ffcf99", 9, 6, 0.42, 0.6, 1.6); s.position.set(x, 3.15, -2.7); s.target.position.set(x, 0.9, -2.7);
    scene.add(s, s.target); lights.room.push({ light: s, on: 9 });
  }

  // ---------- бар ----------
  const bar = new THREE.Group(); scene.add(bar);
  const BAR_W = 4.6, BAR_H = 1.06, BAR_Z = -2.35;
  // корпус
  add(new THREE.BoxGeometry(BAR_W, BAR_H - 0.06, 0.62), M.blackMatte, 0, (BAR_H - 0.06) / 2, BAR_Z - 0.34, bar);
  // столешница
  add(new RoundedBoxGeometry(BAR_W + 0.16, 0.06, 0.8, 2, 0.02), M.top, 0, BAR_H - 0.03, BAR_Z - 0.3, bar);
  // рифлёный фасад: полуцилиндры, подсвеченные снизу оранжевым
  const ribMat = new THREE.MeshStandardMaterial({ color: "#a8341c", roughness: 0.42, emissive: "#ffffff", emissiveMap: TX.ribGlow(), emissiveIntensity: 1.35 });
  const ribGeo = new THREE.CylinderGeometry(0.045, 0.045, BAR_H - 0.1, 14, 1, true, -Math.PI / 2, Math.PI);
  const ribN = Math.floor(BAR_W / 0.092);
  const ribs = new THREE.InstancedMesh(ribGeo, ribMat, ribN + 12);
  const dm = new THREE.Object3D(); let ri = 0;
  for (let i = 0; i < ribN; i++) { dm.position.set(-BAR_W / 2 + 0.046 + i * 0.092, (BAR_H - 0.1) / 2, BAR_Z - 0.03); dm.rotation.set(0, 0, 0); dm.updateMatrix(); ribs.setMatrixAt(ri++, dm.matrix); }
  for (const side of [-1, 1]) for (let i = 0; i < 6; i++) {
    dm.position.set(side * (BAR_W / 2 + 0.01), (BAR_H - 0.1) / 2, BAR_Z - 0.08 - i * 0.092); dm.rotation.set(0, side * Math.PI / 2, 0); dm.updateMatrix(); ribs.setMatrixAt(ri++, dm.matrix);
  }
  bar.add(ribs);
  lights.bar.push({ mat: ribMat, on: 1.35 });
  // свет от подсветки на пол и фасад
  const ra = new THREE.RectAreaLight("#ff5a1f", 5, BAR_W, 0.25); ra.position.set(0, 0.04, BAR_Z + 0.25); ra.lookAt(0, 0.6, BAR_Z - 0.2); bar.add(ra);
  lights.bar.push({ light: ra, on: 5 });
  const floorGlow = add(new THREE.PlaneGeometry(BAR_W + 0.6, 1.4), new THREE.MeshBasicMaterial({ map: TX.blob("rgba(255,80,20,.38)"), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), 0, 0.004, BAR_Z + 0.35, bar);
  floorGlow.rotation.x = -Math.PI / 2; lights.bar.push({ obj: floorGlow.material, on: 1, prop: "opacity" });

  // на стойке: чайник, стаканы, бутылки, кофемашина-блок
  add(new THREE.CylinderGeometry(0.08, 0.09, 0.2, 24), M.steel, -1.7, BAR_H + 0.1, BAR_Z - 0.35, bar);
  for (let i = 0; i < 7; i++) add(new THREE.CylinderGeometry(0.035, 0.03, 0.1, 16), M.glass, -1.2 + i * 0.09, BAR_H + 0.05, BAR_Z - 0.22 + (i % 2) * 0.06, bar);
  const bottle = (x, z, col, h = 0.32) => {
    const pts = [V(0, 0, 0), V(0.035, 0, 0), V(0.037, h * 0.6, 0), V(0.014, h * 0.78, 0), V(0.012, h, 0), V(0, h, 0)].map((p) => new THREE.Vector2(p.x, p.y));
    add(new THREE.LatheGeometry(pts, 18), new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.1, transmission: 0.6, thickness: 0.04, transparent: true, opacity: 0.85 }), x, BAR_H, z, bar);
  };
  bottle(0.9, BAR_Z - 0.42, "#6b2f1a"); bottle(1.0, BAR_Z - 0.5, "#c9d6c0", 0.36); bottle(1.12, BAR_Z - 0.4, "#3a4a2a"); bottle(1.9, BAR_Z - 0.45, "#a83a5a", 0.28);
  add(new RoundedBoxGeometry(0.42, 0.36, 0.34, 2, 0.03), M.steel, 1.55, BAR_H + 0.18, BAR_Z - 0.48, bar);

  // барные стулья
  for (const x of [-1.6, -0.55, 0.5, 1.55]) {
    const s = new THREE.Group(); s.position.set(x, 0, BAR_Z + 0.42); s.rotation.y = rnd(-0.2, 0.2); scene.add(s);
    add(new THREE.CylinderGeometry(0.21, 0.2, 0.06, 28), M.leather, 0, 0.74, 0, s);
    const back = add(new RoundedBoxGeometry(0.4, 0.26, 0.04, 2, 0.015), M.leather, 0, 0.94, 0.19, s); back.rotation.x = -0.12;
    for (const [lx, lz] of [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]]) { const l = add(new THREE.CylinderGeometry(0.012, 0.012, 0.74, 8), M.black, lx, 0.37, lz, s); l.rotation.set(lz * 0.25, 0, -lx * 0.25); }
    add(new THREE.TorusGeometry(0.17, 0.008, 6, 24), M.black, 0, 0.28, 0, s).rotation.x = Math.PI / 2;
    contact(0, 0, 0.32, 0.6, s);
  }

  // ---------- задняя стена бара: полки с табаком ----------
  const shelves = new THREE.Group(); scene.add(shelves);
  const SH_Z = -3.86, SH_W = 4.4;
  for (let r = 0; r < 4; r++) {
    const y = 1.18 + r * 0.32;
    add(new THREE.BoxGeometry(SH_W, 0.03, 0.26), M.black, 0, y, SH_Z, shelves);
    // светодиодная полоса под полкой
    const strip = add(new THREE.BoxGeometry(SH_W - 0.1, 0.008, 0.02), new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffd9a8").multiplyScalar(2.2), toneMapped: false }), 0, y - 0.02, SH_Z + 0.1, shelves);
    lights.bar.push({ obj: strip.material, on: 2.2, color: "#ffd9a8" });
  }
  const shelfLight = new THREE.RectAreaLight("#ffd2a0", 5, SH_W, 1.3); shelfLight.position.set(0, 1.7, SH_Z + 0.6); shelfLight.lookAt(0, 1.7, SH_Z); scene.add(shelfLight);
  lights.bar.push({ light: shelfLight, on: 5 });
  const jarGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.11, 16), lidGeo = new THREE.CylinderGeometry(0.047, 0.047, 0.025, 16);
  const jarMat = new THREE.MeshStandardMaterial({ map: TX.jarLabel(), roughness: 0.5 }), lidMat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.4, metalness: 0.3 });
  const PAL = ["#f2efe8", "#2a63c9", "#f08a2c", "#cfcfcf", "#202020", "#e2486e", "#f4c542", "#3cb371", "#8b5cf6", "#ffffff", "#c0392b"];
  const N_JAR = 4 * 38, jars = new THREE.InstancedMesh(jarGeo, jarMat, N_JAR), lids = new THREE.InstancedMesh(lidGeo, lidMat, N_JAR);
  let k = 0;
  for (let r = 0; r < 4; r++) for (let i = 0; i < 38; i++) {
    if (Math.random() < 0.08) continue;
    const box = Math.random() < 0.3;
    dm.position.set(-SH_W / 2 + 0.07 + i * 0.113 + rnd(-0.01, 0.01), 1.18 + r * 0.32 + 0.07, SH_Z + rnd(-0.05, 0.05));
    dm.rotation.set(0, rnd(0, 6.28), 0); dm.scale.set(box ? 1.15 : 1, box ? 0.8 : rnd(0.9, 1.15), box ? 1.15 : 1); dm.updateMatrix();
    jars.setMatrixAt(k, dm.matrix); jars.setColorAt(k, new THREE.Color(PAL[(Math.random() * PAL.length) | 0]).lerp(new THREE.Color("#fff"), 0.25));
    dm.position.y += 0.065 * dm.scale.y; dm.scale.y = 1; dm.updateMatrix();
    lids.setMatrixAt(k, dm.matrix); lids.setColorAt(k, new THREE.Color(PAL[(Math.random() * PAL.length) | 0]));
    k++;
  }
  jars.count = lids.count = k; shelves.add(jars, lids);
  hot.shelves = { group: shelves };

  // ---------- неон ŠPIČKI и ŠIBICE ----------
  const neon = new THREE.Group(); scene.add(neon);
  const neonMat = new THREE.MeshBasicMaterial({ map: TX.neonSign(), transparent: true, depthWrite: false, toneMapped: false, color: new THREE.Color(1, 1, 1).multiplyScalar(2.4) });
  add(new THREE.PlaneGeometry(3.3, 1.03), neonMat, -0.35, 2.68, -3.9, neon);
  const sibMat = new THREE.MeshBasicMaterial({ map: TX.sibice(), transparent: true, depthWrite: false, toneMapped: false, color: new THREE.Color(1, 1, 1).multiplyScalar(2.2) });
  add(new THREE.PlaneGeometry(1.0, 0.25), sibMat, 1.55, 2.44, -3.89, neon);
  lights.neon.push({ obj: neonMat, on: 2.4, kind: "neon" }, { obj: sibMat, on: 2.2, kind: "neon" });
  const neonLight = new THREE.RectAreaLight("#ffd7a8", 7, 3.4, 0.9); neonLight.position.set(-0.35, 2.68, -3.6); neonLight.lookAt(-0.35, 1.9, -1); scene.add(neonLight);
  lights.neon.push({ light: neonLight, on: 7 });
  hot.neon = { group: neon };

  // ---------- Secret Room: дверь справа на задней стене ----------
  const secret = new THREE.Group(); secret.position.set(3.55, 0, -3.98); scene.add(secret);
  add(new THREE.BoxGeometry(1.06, 2.16, 0.04), M.black, 0, 1.08, 0, secret);
  add(new THREE.BoxGeometry(0.94, 2.06, 0.03), new THREE.MeshStandardMaterial({ color: "#151215", roughness: 0.6 }), 0, 1.04, 0.02, secret);
  add(new THREE.BoxGeometry(0.03, 0.22, 0.03), M.steel, 0.36, 1.05, 0.05, secret);
  const gap = add(new THREE.PlaneGeometry(0.94, 0.02), new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff2e7e").multiplyScalar(3), toneMapped: false }), 0, 0.012, 0.045, secret);
  const secMat = new THREE.MeshBasicMaterial({ map: TX.pinkNeon("SECRET ROOM", 110), transparent: true, depthWrite: false, toneMapped: false, color: new THREE.Color(1, 1, 1).multiplyScalar(2) });
  add(new THREE.PlaneGeometry(1.2, 0.3), secMat, 0, 2.42, 0.03, secret);
  const secLight = new THREE.PointLight("#ff2e7e", 0.8, 2.5, 2); secLight.position.set(0, 0.15, 0.4); secret.add(secLight);
  lights.neon.push({ obj: secMat, on: 2, kind: "neon" }, { obj: gap.material, on: 3, color: "#ff2e7e" }, { light: secLight, on: 0.8 });
  // розовый свет сверху на дверь
  const secSpot = new THREE.SpotLight("#ff4f9a", 6, 3.5, 0.5, 0.7, 1.5); secSpot.position.set(3.55, 3.1, -3.3); secSpot.target.position.set(3.55, 1.0, -3.98); scene.add(secSpot, secSpot.target);
  lights.neon.push({ light: secSpot, on: 6 });
  hot.secret = { group: secret };

  // ---------- PS5: телевизор на левой стене ----------
  const tv = new THREE.Group(); tv.position.set(-4.55, 0, -0.9); tv.rotation.y = Math.PI / 2; scene.add(tv);
  add(new RoundedBoxGeometry(1.56, 0.92, 0.05, 2, 0.01), M.black, 0, 1.55, 0.03, tv);
  const tvCanvas = TX.tvScreen(0), tvTex = new THREE.CanvasTexture(tvCanvas); tvTex.colorSpace = THREE.SRGBColorSpace;
  const tvMat = new THREE.MeshBasicMaterial({ map: tvTex, toneMapped: false, color: new THREE.Color(1.15, 1.15, 1.15) });
  add(new THREE.PlaneGeometry(1.5, 0.845), tvMat, 0, 1.55, 0.06, tv);
  const tvLight = new THREE.RectAreaLight("#7d6cff", 4, 1.5, 0.85); tvLight.position.set(0, 1.55, 0.1); tvLight.lookAt(0, 1.2, 3); tv.add(tvLight);
  // тумба, консоль, геймпад
  add(new RoundedBoxGeometry(1.4, 0.42, 0.42, 2, 0.02), M.blackMatte, 0, 0.21, 0.24, tv);
  add(new RoundedBoxGeometry(0.1, 0.38, 0.28, 3, 0.03), new THREE.MeshStandardMaterial({ color: "#eeeef0", roughness: 0.35 }), 0.45, 0.61, 0.22, tv);
  const pad = new THREE.Group(); pad.position.set(-0.25, 0.43, 0.3); tv.add(pad);
  add(new RoundedBoxGeometry(0.16, 0.035, 0.1, 3, 0.015), new THREE.MeshStandardMaterial({ color: "#f0f0f2", roughness: 0.4 }), 0, 0, 0, pad);
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.03, 12, 8), new THREE.MeshStandardMaterial({ color: "#1d1d22", roughness: 0.4 }), s * 0.065, -0.005, 0.045, pad);
  // розовая неоновая полоса над ТВ
  const pinkBar = add(new THREE.BoxGeometry(1.7, 0.018, 0.018), new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff2e7e").multiplyScalar(2.5), toneMapped: false }), 0, 2.15, 0.04, tv);
  lights.neon.push({ obj: pinkBar.material, on: 2.5, color: "#ff2e7e" });
  const pinkL = new THREE.PointLight("#ff2e7e", 1.4, 3.5, 2); pinkL.position.set(0, 2.1, 0.4); tv.add(pinkL); lights.neon.push({ light: pinkL, on: 1.4 });
  let tvFrame = 0, tvT = 0;
  tick.push((tt, dt) => { tvT += dt; if (tvT > 0.12) { tvT = 0; TX.tvScreen(++tvFrame, tvCanvas); tvTex.needsUpdate = true; tvLight.intensity = 3.2 + Math.random() * 1.2; } });
  hot.tv = { group: tv };

  // ---------- фото на правой стене ----------
  const photos = new THREE.Group(); scene.add(photos);
  const loader = new THREE.TextureLoader();
  const pics = [["img/p1.webp", 0.62, 1.1], ["img/p2.webp", 0.98, 0.98], ["img/p3.webp", 0.62, 1.1]];
  const zs = [-1.75, -0.45, 0.85];
  pics.forEach(([src, w, h], i) => {
    const f = new THREE.Group(); f.position.set(4.57, 1.6, zs[i]); f.rotation.y = -Math.PI / 2; photos.add(f);
    add(new THREE.BoxGeometry(w + 0.08, h + 0.08, 0.03), M.black, 0, 0, 0, f);
    const tx = loader.load(src, () => onProgress && onProgress()); tx.colorSpace = THREE.SRGBColorSpace;
    add(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tx, roughness: 0.6, emissive: "#ffffff", emissiveMap: tx, emissiveIntensity: 0.25 }), 0, 0, 0.017, f);
    const sp = new THREE.SpotLight("#ffd9b0", 4, 3, 0.5, 0.7, 1.5); sp.position.set(4.1, 2.9, zs[i]); sp.target.position.set(4.57, 1.6, zs[i]); scene.add(sp, sp.target); lights.room.push({ light: sp, on: 4 });
  });
  hot.photos = { group: photos };
  // слоган розовым неоном над фото
  const slMat = new THREE.MeshBasicMaterial({ map: TX.pinkNeon(t.slogan, 118, 1400, 220, true), transparent: true, depthWrite: false, toneMapped: false, color: new THREE.Color(1, 1, 1).multiplyScalar(2) });
  const sl = add(new THREE.PlaneGeometry(2.6, 0.41), slMat, 4.58, 2.62, -0.45); sl.rotation.y = -Math.PI / 2;
  lights.neon.push({ obj: slMat, on: 2, kind: "neon" });
  const slL = new THREE.PointLight("#ff2e7e", 0.9, 3, 2); slL.position.set(4.2, 2.6, -0.45); scene.add(slL); lights.neon.push({ light: slL, on: 0.9 });

  // растение у входа
  const plant = new THREE.Group(); plant.position.set(-3.9, 0, -3.3); scene.add(plant);
  add(new THREE.CylinderGeometry(0.22, 0.17, 0.5, 24), M.blackMatte, 0, 0.25, 0, plant);
  const leafMat = new THREE.MeshStandardMaterial({ color: "#1f3a22", roughness: 0.7, side: THREE.DoubleSide });
  for (let i = 0; i < 26; i++) {
    const l = add(new THREE.SphereGeometry(0.16, 8, 6), leafMat, 0, 0, 0, plant);
    l.scale.set(0.35, 1, 0.08); const a = rnd(0, 6.28), h = rnd(0.7, 1.6), rr = rnd(0.05, 0.28);
    l.position.set(Math.cos(a) * rr, h, Math.sin(a) * rr); l.rotation.set(rnd(-0.6, 0.6), a, rnd(-0.6, 0.6));
  }

  // ---------- лаунж: диван, столик ----------
  const sofa = new THREE.Group(); sofa.position.set(-1.55, 0, 0.9); sofa.rotation.y = Math.PI / 2; scene.add(sofa);
  add(new RoundedBoxGeometry(2.2, 0.42, 0.9, 3, 0.06), M.fabric, 0, 0.21, 0, sofa);
  add(new RoundedBoxGeometry(2.2, 0.5, 0.22, 3, 0.08), M.fabric, 0, 0.62, -0.36, sofa);
  for (const s of [-1, 1]) add(new RoundedBoxGeometry(0.2, 0.62, 0.9, 3, 0.08), M.fabric, s * 1.0, 0.31, 0, sofa);
  for (const s of [-0.5, 0.5]) add(new RoundedBoxGeometry(0.98, 0.12, 0.66, 3, 0.05), new THREE.MeshStandardMaterial({ color: "#352d31", roughness: 0.95 }), s, 0.47, 0.05, sofa);
  const pillow = add(new RoundedBoxGeometry(0.42, 0.42, 0.12, 4, 0.06), new THREE.MeshStandardMaterial({ color: "#7a1f3d", roughness: 0.9 }), 0.55, 0.72, -0.2, sofa); pillow.rotation.set(-0.25, 0.2, 0.1);
  contact(-1.55, 0.9, 1.4, 0.55);

  const TABLE = V(0.25, 0.52, 0.85);
  const table = new THREE.Group(); table.position.set(TABLE.x, 0, TABLE.z); scene.add(table);
  add(new THREE.CylinderGeometry(0.46, 0.46, 0.04, 48), M.wood, 0, 0.5, 0, table);
  add(new THREE.CylinderGeometry(0.05, 0.06, 0.48, 16), M.black, 0, 0.25, 0, table);
  add(new THREE.CylinderGeometry(0.26, 0.28, 0.025, 32), M.black, 0, 0.012, 0, table);
  contact(0, 0, 0.7, 0.75, table);
  // тёплая лампа над столом (подвес)
  const pend = new THREE.Group(); pend.position.set(TABLE.x, 0, TABLE.z); scene.add(pend);
  add(new THREE.CylinderGeometry(0.004, 0.004, 1.15, 6), M.black, 0, 2.83, 0, pend);
  const shade = [[0.012, 0.2], [0.03, 0.19], [0.06, 0.15], [0.11, 0.08], [0.15, 0.02], [0.16, 0]].map(([r, y]) => new THREE.Vector2(r, y));
  add(new THREE.LatheGeometry(shade, 32), new THREE.MeshStandardMaterial({ color: "#151314", roughness: 0.45, metalness: 0.6, side: THREE.DoubleSide }), 0, 2.06, 0, pend);
  const bulb = add(new THREE.SphereGeometry(0.035, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffcf8a").multiplyScalar(5), toneMapped: false }), 0, 2.08, 0, pend);
  const tl = new THREE.SpotLight("#ffc98a", 7, 4, 0.75, 0.55, 1.6); tl.position.set(TABLE.x, 2.08, TABLE.z); tl.target.position.set(TABLE.x, 0.5, TABLE.z); scene.add(tl, tl.target);
  lights.room.push({ light: tl, on: 7 }, { obj: bulb.material, on: 5, color: "#ffcf8a" });

  // ---------- кальян (как на фото: стальная шахта, матовая белая колба, чёрный колпак, чёрный шланг, длинный мундштук) ----------
  const hk = new THREE.Group(); hk.position.set(TABLE.x - 0.12, TABLE.y, TABLE.z - 0.08); scene.add(hk);
  const vasePts = [[0, 0], [0.085, 0], [0.097, 0.012], [0.102, 0.045], [0.099, 0.1], [0.086, 0.16], [0.062, 0.205], [0.036, 0.238], [0.031, 0.252], [0.033, 0.262], [0, 0.262]].map(([r, y]) => new THREE.Vector2(r, y));
  const vaseMat = new THREE.MeshPhysicalMaterial({ color: "#f4f0ee", roughness: 0.5, transmission: 0.55, thickness: 0.06, ior: 1.45, sheen: 0.3, attenuationColor: "#ffe9e0", attenuationDistance: 0.4 });
  add(new THREE.LatheGeometry(vasePts, 48), vaseMat, 0, 0, 0, hk);
  // вода внутри колбы (видна сквозь мат)
  const water = add(new THREE.CylinderGeometry(0.09, 0.082, 0.1, 32), new THREE.MeshStandardMaterial({ color: "#d8e6ec", roughness: 0.2, transparent: true, opacity: 0.35 }), 0, 0.055, 0, hk);
  const shaftPts = [[0.0, 0.252], [0.04, 0.252], [0.04, 0.29], [0.022, 0.3], [0.017, 0.31], [0.017, 0.4], [0.026, 0.41], [0.026, 0.5], [0.018, 0.51], [0.016, 0.6], [0.024, 0.61], [0.024, 0.63], [0.0, 0.63]].map(([r, y]) => new THREE.Vector2(r, y));
  add(new THREE.LatheGeometry(shaftPts, 32), M.steel, 0, 0, 0, hk);
  // порт шланга
  const port = add(new THREE.CylinderGeometry(0.011, 0.012, 0.07, 16), M.steel, 0.045, 0.455, 0, hk); port.rotation.z = Math.PI / 2;
  // поднос для углей
  const trayPts = [[0, 0], [0.105, 0], [0.11, 0.012], [0.098, 0.008], [0.03, 0.006], [0, 0.006]].map(([r, y]) => new THREE.Vector2(r, y));
  add(new THREE.LatheGeometry(trayPts, 48), M.steel, 0, 0.632, 0, hk);
  // чаша
  const bowlPts = [[0.012, 0], [0.02, 0], [0.036, 0.04], [0.038, 0.055], [0, 0.055]].map(([r, y]) => new THREE.Vector2(r, y));
  add(new THREE.LatheGeometry(bowlPts, 32), new THREE.MeshStandardMaterial({ color: "#2a1f1c", roughness: 0.8 }), 0, 0.64, 0, hk);
  // угли и их свечение
  const coalMat = new THREE.MeshStandardMaterial({ color: "#2a1a14", emissive: "#ff4a10", emissiveIntensity: 1.6, roughness: 1 });
  for (let i = 0; i < 3; i++) { const c = add(new RoundedBoxGeometry(0.022, 0.018, 0.022, 1, 0.004), coalMat, Math.cos(i * 2.1) * 0.02, 0.705, Math.sin(i * 2.1) * 0.02, hk); c.rotation.y = i; }
  const inner = add(new THREE.CylinderGeometry(0.047, 0.047, 0.1, 24, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff5a1a").multiplyScalar(1.4), side: THREE.BackSide, toneMapped: false }), 0, 0.745, 0, hk);
  // колпак с перфорацией
  const capMat = new THREE.MeshStandardMaterial({ color: "#151516", roughness: 0.45, metalness: 0.7, alphaMap: TX.perforated(), alphaTest: 0.5, side: THREE.DoubleSide });
  capMat.alphaMap.repeat.set(2, 1);
  add(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 32, 1, true), capMat, 0, 0.75, 0, hk);
  add(new THREE.CylinderGeometry(0.052, 0.05, 0.012, 32), M.black, 0, 0.814, 0, hk);
  add(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 12), M.black, 0, 0.83, 0, hk);
  const coal = new THREE.PointLight("#ff5a1f", 0.35, 1.4, 2); coal.position.set(0, 0.76, 0); hk.add(coal);
  // шланг: чёрный силикон — с порта вниз на стол и к мундштуку
  const hoseCurve = new THREE.CatmullRomCurve3([V(0.08, 0.455, 0), V(0.16, 0.43, 0.02), V(0.24, 0.3, 0.06), V(0.29, 0.12, 0.11), V(0.3, 0.025, 0.17), V(0.27, 0.012, 0.25), V(0.22, 0.012, 0.3)]);
  add(new THREE.TubeGeometry(hoseCurve, 80, 0.012, 12), new THREE.MeshStandardMaterial({ color: "#0d0d0e", roughness: 0.55 }), 0, 0, 0, hk);
  // мундштук: чёрная ручка + длинная стальная трубка
  const mp = new THREE.Group(); mp.position.set(0.22, 0.016, 0.3); mp.rotation.y = -0.55; hk.add(mp);
  const grip = add(new THREE.CylinderGeometry(0.013, 0.013, 0.07, 16), M.black, 0, 0, 0.035, mp); grip.rotation.x = Math.PI / 2;
  const tube = add(new THREE.CylinderGeometry(0.0075, 0.0075, 0.26, 12), M.steel, 0, 0.002, 0.2, mp); tube.rotation.x = Math.PI / 2;
  contact(0, 0, 0.16, 0.8, hk, 0.001);
  hot.hookah = { group: hk };
  const hookah = { group: hk, coal, coalMat, inner, top: V(hk.position.x, hk.position.y + 0.84, hk.position.z), boost: 0 };

  // ---------- реквизит на столе ----------
  // коктейль-купе с розовым напитком
  const cocktail = new THREE.Group(); cocktail.position.set(TABLE.x + 0.24, TABLE.y, TABLE.z + 0.17); scene.add(cocktail);
  const coupe = [[0, 0], [0.04, 0], [0.042, 0.004], [0.006, 0.012], [0.005, 0.11], [0.03, 0.12], [0.055, 0.15], [0.058, 0.165], [0.056, 0.165], [0.05, 0.15], [0.03, 0.128], [0.0, 0.124]].map(([r, y]) => new THREE.Vector2(r, y));
  add(new THREE.LatheGeometry(coupe, 40), new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.03, transmission: 1, thickness: 0.004, ior: 1.5 }), 0, 0, 0, cocktail);
  const liquid = [[0, 0.126], [0.03, 0.13], [0.05, 0.148], [0.052, 0.152], [0, 0.152]].map(([r, y]) => new THREE.Vector2(r, y));
  add(new THREE.LatheGeometry(liquid, 32), new THREE.MeshStandardMaterial({ color: "#ff4f8a", emissive: "#ff2e6e", emissiveIntensity: 0.25, roughness: 0.15, transparent: true, opacity: 0.88 }), 0, 0, 0, cocktail);
  const cherry = add(new THREE.SphereGeometry(0.011, 12, 10), new THREE.MeshStandardMaterial({ color: "#a0101e", roughness: 0.3 }), 0.02, 0.156, 0.01, cocktail);
  contact(0, 0, 0.07, 0.6, cocktail, 0.001);
  hot.cocktail = { group: cocktail };

  // коробок спичек + спичка
  const mb = new THREE.Group(); mb.position.set(TABLE.x - 0.2, TABLE.y, TABLE.z + 0.26); mb.rotation.y = 0.35; scene.add(mb);
  const mbTex = TX.matchbox(), strTex = TX.striker();
  const mbMats = [new THREE.MeshStandardMaterial({ map: strTex, roughness: 0.9 }), new THREE.MeshStandardMaterial({ map: strTex, roughness: 0.9 }), new THREE.MeshStandardMaterial({ map: mbTex, roughness: 0.6 }), new THREE.MeshStandardMaterial({ color: "#121012", roughness: 0.7 }), new THREE.MeshStandardMaterial({ color: "#121012" }), new THREE.MeshStandardMaterial({ color: "#121012" })];
  add(new THREE.BoxGeometry(0.1, 0.02, 0.064), mbMats, 0, 0.01, 0, mb);
  const match = new THREE.Group(); match.position.set(0.07, 0.003, 0.03); match.rotation.y = 0.9; mb.add(match);
  const stick = add(new THREE.BoxGeometry(0.05, 0.003, 0.003), new THREE.MeshStandardMaterial({ color: "#e8d2a8", roughness: 0.9 }), 0, 0, 0, match);
  const head = add(new THREE.SphereGeometry(0.0035, 10, 8), new THREE.MeshStandardMaterial({ color: "#b0183a", roughness: 0.6 }), 0.026, 0, 0, match); head.scale.set(1.5, 1, 1);
  const flameMat = new THREE.SpriteMaterial({ map: TX.blob("rgba(255,190,90,1)"), color: new THREE.Color("#ffb347").multiplyScalar(3), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0 });
  const flameSp = new THREE.Sprite(flameMat); flameSp.scale.set(0.025, 0.045, 1); flameSp.position.set(0.03, 0.018, 0); match.add(flameSp);
  const matchLight = new THREE.PointLight("#ffa040", 0, 1.2, 2); matchLight.position.set(0.03, 0.03, 0); match.add(matchLight);
  contact(0, 0, 0.09, 0.6, mb, 0.001);
  hot.matchbox = { group: mb };
  const matchFx = { lit: 0, flameMat, matchLight, flameSp, stick };

  // телефон экраном вверх
  const ph = new THREE.Group(); ph.position.set(TABLE.x + 0.12, TABLE.y, TABLE.z - 0.27); ph.rotation.y = -0.4; scene.add(ph);
  add(new RoundedBoxGeometry(0.075, 0.009, 0.155, 3, 0.004), M.black, 0, 0.0045, 0, ph);
  const scr = add(new THREE.PlaneGeometry(0.069, 0.146), new THREE.MeshBasicMaterial({ map: TX.phoneScreen(t), toneMapped: false, color: new THREE.Color(1.1, 1.1, 1.1) }), 0, 0.0095, 0, ph); scr.rotation.x = -Math.PI / 2;
  contact(0, 0, 0.11, 0.6, ph, 0.001);
  hot.phone = { group: ph };

  // меню-домик
  const menu = new THREE.Group(); menu.position.set(TABLE.x - 0.3, TABLE.y, TABLE.z - 0.18); menu.rotation.y = 0.7; scene.add(menu);
  const menuTex = TX.menuCard(t);
  for (const s of [-1, 1]) { const p = add(new THREE.PlaneGeometry(0.1, 0.13), new THREE.MeshStandardMaterial({ map: menuTex, roughness: 0.8, side: THREE.DoubleSide }), 0, 0.062, s * 0.02, menu); p.rotation.x = s * 0.3; if (s < 0) p.rotation.y = Math.PI; }
  contact(0, 0, 0.09, 0.5, menu, 0.001);
  hot.menu = { group: menu };

  // общий слабый свет зала
  const hemi = new THREE.HemisphereLight("#5a3440", "#0a0606", 0.6); scene.add(hemi); lights.room.push({ light: hemi, on: 0.6 });
  const fill = new THREE.PointLight("#ff9a6a", 1.0, 9, 2); fill.position.set(1.5, 2.6, 2.6); scene.add(fill); lights.room.push({ light: fill, on: 1.0 });

  // ---------- дым ----------
  const puffTex = TX.puff();
  const pool = [];
  for (let i = 0; i < 160; i++) {
    const m = new THREE.SpriteMaterial({ map: puffTex, color: "#e9dfe6", transparent: true, depthWrite: false, opacity: 0 });
    const s = new THREE.Sprite(m); s.visible = false; scene.add(s);
    pool.push({ s, life: 0, max: 1, v: V(0, 0, 0), g: 0, a: 0, rot: 0 });
  }
  function emit(pos, opt = {}) {
    const p = pool.find((q) => q.life <= 0); if (!p) return;
    p.s.position.copy(pos); p.s.visible = true;
    p.life = p.max = opt.life || rnd(2.5, 4);
    p.v.set(...(opt.v || [rnd(-0.02, 0.02), rnd(0.05, 0.12), rnd(-0.02, 0.02)]));
    p.size0 = opt.size || 0.05; p.g = opt.grow || 0.12; p.a = opt.alpha || 0.18; p.drag = opt.drag || 0.4;
    p.s.material.rotation = rnd(0, 6.28); p.rot = rnd(-0.4, 0.4);
    p.s.material.color.set(opt.color || "#e9dfe6");
  }
  let idleT = 0;
  tick.push((tt, dt) => {
    // тонкие струйки над колпаком
    idleT += dt;
    if (idleT > 0.28) { idleT = 0; emit(hookah.top.clone().add(V(rnd(-0.01, 0.01), 0, rnd(-0.01, 0.01))), { size: 0.03, grow: 0.09, alpha: 0.14 }); }
    for (const p of pool) {
      if (p.life <= 0) continue;
      p.life -= dt;
      if (p.life <= 0) { p.s.visible = false; continue; }
      const k = 1 - p.life / p.max;
      p.v.multiplyScalar(Math.pow(p.drag, dt)); p.v.y += 0.02 * dt;
      p.s.position.addScaledVector(p.v, dt);
      const sz = p.size0 + p.g * Math.sqrt(k) * p.max;
      p.s.scale.set(sz, sz, 1);
      p.s.material.rotation += p.rot * dt;
      p.s.material.opacity = p.a * Math.min(1, k * 6) * (1 - k);
    }
    // угли мерцают; при затяжке разгораются
    hookah.boost = Math.max(0, hookah.boost - dt * 0.6);
    const f = 0.85 + Math.sin(tt * 7.3) * 0.06 + Math.sin(tt * 13.1) * 0.05 + hookah.boost * 1.6;
    coal.intensity = 0.35 * f; coalMat.emissiveIntensity = 1.6 * f; inner.material.color.setRGB(1.4 * f, 0.5 * f, 0.15 * f);
    // спичка
    if (matchFx.lit > 0) {
      matchFx.lit -= dt;
      const on = matchFx.lit > 0 ? Math.min(1, (6 - matchFx.lit) * 6) * Math.min(1, matchFx.lit * 2) : 0;
      const fl = 0.85 + Math.sin(tt * 23) * 0.1 + Math.sin(tt * 37) * 0.08;
      flameMat.opacity = on; matchLight.intensity = 0.5 * on * fl; flameSp.scale.set(0.025 * fl, 0.045 * fl, 1);
    }
  });

  // маячки на ещё не открытых предметах
  const beaconTex = TX.blob("rgba(255,95,162,1)");
  for (const key in hot) {
    const box = new THREE.Box3().setFromObject(hot[key].group), c = box.getCenter(V(0, 0, 0));
    const sm = new THREE.SpriteMaterial({ map: beaconTex, color: new THREE.Color("#ff5fa2").multiplyScalar(2), transparent: true, depthWrite: false, depthTest: false, toneMapped: false, blending: THREE.AdditiveBlending });
    const b = new THREE.Sprite(sm); b.position.set(c.x, box.max.y + 0.06, c.z); b.renderOrder = 10;
    const sz = Math.min(0.12, Math.max(0.05, box.getSize(V(0, 0, 0)).length() * 0.05)); b.scale.setScalar(sz); b.userData.base = sz;
    scene.add(b); hot[key].beacon = b; hot[key].center = c; hot[key].box = box;
  }
  let bt = 0;
  tick.push((tt, dt) => { bt += dt; for (const key in hot) { const b = hot[key].beacon; if (b.visible) { const s = 1 + Math.sin(bt * 3 + b.position.x) * 0.25; b.scale.setScalar(b.userData.base * s); b.material.opacity = 0.65 + 0.35 * Math.sin(bt * 3 + b.position.x); } } });

  // помечаем меши ключом для raycast
  for (const key in hot) hot[key].group.traverse((o) => { if (o.isMesh) o.userData.hot = key; });

  // Свет: плавно включаем/выключаем группы
  const lightState = { neon: 1, bar: 1, room: 1 }, lightCur = { neon: 1, bar: 1, room: 1 };
  function applyLights() {
    for (const g in lights) for (const L of lights[g]) {
      const v = lightCur[g];
      if (L.light) L.light.intensity = L.on * v;
      else if (L.mat) L.mat.emissiveIntensity = L.on * v;
      else if (L.prop === "opacity") L.obj.opacity = L.on * v;
      else if (L.color) L.obj.color.set(L.color).multiplyScalar(L.on * Math.max(0.04, v));
      else if (L.kind === "neon") L.obj.color.setScalar(L.on * Math.max(0.05, v));
    }
  }
  tick.push((tt, dt) => {
    let ch = false;
    for (const g in lightState) { const d = lightState[g] - lightCur[g]; if (Math.abs(d) > 0.001) { lightCur[g] += Math.sign(d) * Math.min(Math.abs(d), dt * 2.2); ch = true; } }
    if (ch) applyLights();
  });
  function setLight(g, on) { lightState[g] = on ? 1 : 0; }

  // кадры камеры для каждого предмета и общих видов
  const views = {
    overview: { pos: V(2.7, 1.75, 4.3), target: V(-0.1, 1.15, -1.3) },
    hookah: { pos: V(0.95, 1.02, 1.95), target: V(hk.position.x, 0.86, hk.position.z) },
    bar: { pos: V(0.4, 1.6, 0.4), target: V(0, 1.55, -3.6) },
    neon: { pos: V(-0.3, 2.05, -0.55), target: V(-0.2, 2.55, -3.9) },
    shelves: { pos: V(0.7, 1.75, -1.25), target: V(0.3, 1.65, -3.9) },
    secret: { pos: V(2.75, 1.5, -1.45), target: V(3.55, 1.3, -4) },
    tv: { pos: V(-2.4, 1.5, -0.2), target: V(-4.55, 1.4, -0.9) },
    photos: { pos: V(1.75, 1.75, -0.45), target: V(4.57, 1.95, -0.45) },
    cocktail: { pos: V(TABLE.x + 0.62, 0.9, TABLE.z + 0.62), target: V(cocktail.position.x, 0.6, cocktail.position.z) },
    matchbox: { pos: V(TABLE.x - 0.25, 0.86, TABLE.z + 0.75), target: V(mb.position.x, 0.53, mb.position.z) },
    phone: { pos: V(TABLE.x + 0.28, 0.98, TABLE.z + 0.18), target: V(ph.position.x, 0.52, ph.position.z) },
    menu: { pos: V(TABLE.x - 0.05, 0.82, TABLE.z + 0.55), target: V(menu.position.x, 0.58, menu.position.z) },
  };

  return {
    scene, hot, views, hookah, emit, setLight, lightState,
    strike() { matchFx.lit = 6; },
    update(tt, dt) { for (const f of tick) f(tt, dt); },
  };
}
