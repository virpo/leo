import * as K from "./vendor/iso-kit.mjs";
import * as G from "./vendor/lathe.mjs";
import { TAU, clamp } from "./model.js";
import { boatAt, lockAt, REFERENCE_CANOPY } from "./experiments.js";

const ink = "#81694b", waterInk = "#6c969b";
const mid = (a, b) => a.map((n, i) => (n + b[i]) / 2);

function tray(s, w, d, water = false) {
  s.plinth(w + 12, d + 12);
  s.box("tray-back", -w / 2, -d / 2 - 3, 7, w, 3, water ? 35 : 5);
  s.box("tray-front", -w / 2, d / 2, 7, w, 3, 5);
  s.box("tray-left", -w / 2 - 3, -d / 2, 7, 3, d, 5);
  s.box("tray-right", w / 2, -d / 2, 7, 3, d, 5);
  for (let i = 1; i < 8; i++) {
    const x = -w / 2 + w * i / 8;
    s.line("floor-seam" + i, K.lineOnTop([x, -d / 2], [x, d / 2], 7.1, s.P), [x, 0, 7.1], "faint");
  }
}

function water(s, id, x0, x1, y0, y1, level, flow = 0, direction = -1) {
  const first = s.items.length;
  s.panel(id + "-surface", [[x0, y0, level], [x1, y0, level], [x1, y1, level], [x0, y1, level]], "#b8d1cbb3", waterInk);
  s.panel(id + "-front", [[x0, y1, 7], [x1, y1, 7], [x1, y1, level], [x0, y1, level]], "#99bfc580", waterInk);
  s.panel(id + "-end", [[x1, y0, 7], [x1, y1, 7], [x1, y1, level], [x1, y0, level]], "#a7c7c980", waterInk);
  s.panel(id + "-start", [[x0, y0, 7], [x0, y1, 7], [x0, y1, level], [x0, y0, level]], "#a7c7c980", waterInk);
  // Closed, tapered ink ripples. Their drift is driven only by manipulation.
  for (let i = 0; i < 7; i++) {
    const t = ((i / 7 + direction * flow * 0.09) % 1 + 1) % 1;
    const x = x0 + 10 + (x1 - x0 - 28) * t;
    const y = y0 + 10 + ((i * 29) % Math.max(12, y1 - y0 - 20));
    s.panel(id + "-ripple" + i, [[x - 6, y, level + 0.16], [x + 6, y - 1, level + 0.16], [x + 3, y + 0.6, level + 0.16]], "#8aa798", "none");
  }
  s.items.slice(first).forEach((item) => { item.water = true; });
}

function paddleWake(s, x, ys, v) {
  const strength = v.wake || 0, direction = v.waterDirection || -1;
  const first = s.items.length;
  for (const [row, y] of ys.entries()) {
    for (let i = 0; i < 8; i++) {
      const t = ((i / 8 + (v.waterTravel || 0) / 100) % 1 + 1) % 1;
      const cx = clamp(x + direction * (6 + t * 78), -137, 137);
      const span = (4 + t * 12) * strength;
      const alpha = Math.round(235 * strength * Math.sin(Math.PI * t)).toString(16).padStart(2, "0");
      // A curved, tapered wave front, not an explanatory arrow. Every point
      // lies on the same water plane as the immersed paddle.
      const [a, b, c, d] = [[cx, y - span], [cx + direction * 9, y],
        [cx, y + span], [cx + direction, y]].map(([px, py]) => K.iso([px, clamp(py, -59, 59), 28.45], s.P));
      s.custom(`wake-${row}-${i}`, `M${a}Q${b} ${c}Q${d} ${a}Z`, [cx, y, 28.45], `#3b7380${alpha}`);
    }
    for (let i = 0; i < 3; i++) {
      const t = ((i / 3 + (v.waterTravel || 0) / 26) % 1 + 1) % 1;
      const r = (1.7 + t) * strength, cx = clamp(x + direction * t * 15, -137, 137);
      const cy = y + (i - 1) * 8;
      const points = Array.from({ length: 16 }, (_, j) => [cx + r * Math.cos(j * TAU / 16), cy + r * Math.sin(j * TAU / 16), 28.6]);
      s.panel(`foam-${row}-${i}`, points, `#f6efdb${Math.round(220 * strength * (1 - t)).toString(16).padStart(2, "0")}`, "none");
    }
  }
  s.items.slice(first).forEach((item) => { item.water = true; item.wake = true; });
}

function basket(s, id, x, z) {
  s.box(id + "floor", x - 15, -12, z, 30, 24, 3, { tone: "hi" });
  for (let i = 0; i < 5; i++) {
    s.box(id + "front-slat" + i, x - 15 + i * 6.3, 10, z + 3, 5.2, 2.5, 16, { tone: "hi" });
    s.box(id + "back-slat" + i, x - 15 + i * 6.3, -12, z + 3, 5.2, 2.5, 16);
  }
  for (const side of [-1, 1]) {
    s.box(id + "end" + side, x + side * 14 - 1, -11, z + 3, 2, 22, 16, { tone: "hi" });
    s.box(id + "band" + side, x - 15, side * 11, z + 14, 30, 1.8, 3);
    for (const y of [-11, 11]) s.bolt(id + "nail" + side + y, [x + side * 14, y, z + 19], 0.7);
  }
  s.box(id + "cargo", x - 8, -7, z + 3, 16, 14, 19, { tone: "mid" });
  s.line(id + "parcel-tie", K.planOutline({ x: x - 7.8, y: -1.1, w: 15.6, d: 2.2, r: 0 }, z + 22, s.P), [x, 0, z + 22], "hi");
}

function canopy(s, id, x, z, width) {
  const r = width * 65, h = width * 72;
  const corners = [[x - r, -r, z], [x + r, -r, z], [x + r, r, z], [x - r, r, z]];
  const apex = [x, 0, z + h];
  const tones = ["#e0cfad", "#eee0c1", "#f6ecd7", "#e9d8b7"];
  corners.forEach((a, i) => {
    const b = corners[(i + 1) % 4];
    s.panel(id + "cloth" + i, [a, b, apex], tones[i], ink);
    s.rod(id + "frame" + i, a, b, 1.2, { tone: "mid" });
    s.rod(id + "spar" + i, a, apex, 0.8, { tone: "mid" });
    const attachment = [x + (a[0] < x ? -14 : 14), a[1] < 0 ? -11 : 11, z - 38];
    s.line(id + "rope" + i, s.path([attachment, a]), mid(attachment, a), "hi");
    s.bolt(id + "eyelet" + i, a, 0.75);
    for (let j = 1; j <= 3; j++) {
      const t = j / 4;
      const left = a.map((v, axis) => v + (apex[axis] - v) * t);
      const right = b.map((v, axis) => v + (apex[axis] - v) * t);
      s.line(id + "stitch" + i + j, s.path([left, right]), mid(left, right), "faint");
    }
  });
  s.cyl(id + "apex", x, 0, z + h - 1, 1.8, 3, { tone: "hi" });
}

function parachute(Scene, step, v) {
  const s = new Scene("parachute", step, v.preview);
  if (!v.preview) tray(s, 260, 105);
  const two = step >= 2 && !v.preview;
  const loads = two
    ? [{ id: "small-", x: -72, width: step === 3 ? REFERENCE_CANOPY : 0.35, fall: v.fallSmall || 0, bounce: v.bounceSmall || 0 }, { id: "big-", x: 72, width: step === 3 ? v.canopyWidth ?? 0.74 : 0.82, fall: v.fall || 0, bounce: v.bounce || 0 }]
    : [{ id: "chute-", x: 0, width: step === 0 ? 0 : step === 1 ? 0.42 : v.canopyWidth ?? 0.82, fall: v.fall || 0, bounce: v.bounce || 0 }];
  for (const load of loads) {
    const z = 8 + (1 - load.fall) * 140 + load.bounce;
    basket(s, load.id, load.x, z);
    if (load.width) canopy(s, load.id, load.x, z + 57, load.width);
    if (!v.preview) s.custom(load.id + "shadow", K.haloOf({ x: load.x - 15, y: -13, w: 30, d: 26, r: 10 }, 7.3, 0, s.P), [load.x, 0, 7.3], "#c5b591");
  }
  return s;
}

function hull(s, id, x, level, scale = 1) {
  const points = [[-48, -13], [-30, -21], [34, -21], [53, 0], [34, 21], [-30, 21], [-48, 13]].map(([a, b]) => [x + a * scale, b * scale]);
  s.solid(id + "floor", s.cached(id + "floor", [x, level, scale], () => K.extrude(points, level - 3, 3, s.P)), [x, 0, level - 1.5], { tone: "mid" });
  points.forEach((a, i) => {
    const b = points[(i + 1) % points.length], dx = b[0] - a[0], dy = b[1] - a[1], length = Math.hypot(dx, dy);
    const nx = -dy / length * 1.4 * scale, ny = dx / length * 1.4 * scale;
    const strip = [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]];
    s.solid(id + "strake" + i, s.cached(id + "strake" + i, [x, level, scale], () => K.extrude(strip, level - 3, 14 * scale, s.P)), [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, level + 3], { tone: id.startsWith("lock-") ? "lit" : "hi" });
    s.line(id + "seam" + i, s.path([[a[0], a[1], level + 3 * scale], [b[0], b[1], level + 3 * scale]]), [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, level + 3 * scale], "faint");
  });
  for (const sx of [-23, 20]) {
    s.box(id + "seat" + sx, x + sx * scale, -19 * scale, level + 5 * scale, 7 * scale, 38 * scale, 3 * scale, { tone: "hi" });
    for (const y of [-16, 16]) s.bolt(id + "seat-pin" + sx + y, [x + (sx + 3) * scale, y * scale, level + 8 * scale], 0.65);
  }
  if (id.startsWith("lock-")) {
    s.box(id + "cargo", x - 5, -4, level, 10, 8, 10, { tone: "hi" });
    s.line(id + "cargo-tie", K.planOutline({ x: x - 4.8, y: -1, w: 9.6, d: 2, r: 0 }, level + 10, s.P), [x, 0, level + 10], "hi", { cord: true });
  }
}

function paddleWheel(s, id, x, y, z, angle, radius = 29) {
  const F = G.frameAlong([x, y, z], [0, 1, 0]);
  s.solid(id + "rim", s.cached(id + "rim", [x, y, z, radius], () => G.ringBand(-1.2, 1.2, radius - 7, radius - 5, F, s.P, { steps: 56, hole: [1.2, radius - 7] })), [x, y, z], { tone: "hi", fillRule: "evenodd" });
  for (let i = 0; i < 8; i++) {
    const a = angle + i * TAU / 8, sn = Math.sin(a), cs = Math.cos(a);
    const end = [x + sn * (radius - 3), y, z + cs * (radius - 3)];
    s.rod(id + "spoke" + i, [x, y, z], end, 1.1, { tone: "mid" });
    const poly = [[-3.5, -1.4], [3.5, -1.4], [3.5, 1.4], [-3.5, 1.4]].map(([r, t]) => [-(sn * (radius + r) + cs * t), cs * (radius + r) - sn * t]);
    s.solid(id + "paddle" + i, G.prismOf(F, poly, -9, 9, s.P), [end[0], y, end[2]], { tone: "hi" });
    s.bolt(id + "paddle-pin" + i, [end[0], y + 9, end[2]], 0.6);
  }
  s.solid(id + "hub", G.disc(-4, 5, 5, F, s.P), [x, y, z], { tone: "hi" });
}

function boat(Scene, step, v) {
  const s = new Scene("boat", step, v.preview);
  const a = v.angle || 0, motion = boatAt(a, step), x = v.vesselX ?? motion.distance;
  if (!v.preview) tray(s, 300, 130, true);
  water(s, "water", v.preview ? -70 : -148, v.preview ? 70 : 148, -62, 62, 28, a);
  if (step === 0) {
    const stroke = 35 - 70 * motion.stroke;
    s.rod("paddle-shaft-wet", [stroke, -24, 13], [stroke, -24 - 21 * 15 / 69, 28], 2.2, { tone: "hi", underwater: true });
    s.rod("paddle-shaft", [stroke, -24 - 21 * 15 / 69, 28], [stroke, -45, 82], 2.2, { tone: "hi" });
    wetBox(s, "single-paddle", stroke - 2.5, -40, 10, 5, 32, 26, 28);
    s.rod("paddle-handle", [stroke - 10, -45, 82], [stroke + 10, -45, 82], 2.7, { tone: "hi" });
    paddleWake(s, stroke, [-24], v);
    return s;
  }
  const level = 28, wheelZ = level + 15;
  paddleWake(s, x, step >= 2 ? [-37, 37] : [0], v);
  if (step >= 2) hull(s, "boat-", x, level);
  else {
    for (const y of [-22, 22]) s.box("wheel-stand" + y, -8, y - 4, 7, 16, 8, wheelZ - 7, { tone: "mid" });
  }
  s.rod("paddle-axle", [x, -46, wheelZ], [x, 46, wheelZ], 2.5, { tone: "hi" });
  for (const y of step >= 2 ? [-37, 37] : [0]) paddleWheel(s, "wheel" + y, x, y, wheelZ, a);
  if (step >= 2) {
    for (const y of [-17, 17]) s.box("bearing" + y, x - 5, y - 4, level + 8, 10, 8, 13, { tone: "hi" });
    s.rod("rudder", [x - 48, 0, level - 3], [x - 48, 0, level + 25], 1.6, { tone: "mid" });
    s.box("rudder-blade", x - 57, -1.2, level - 13, 12, 2.4, 17);
  }
  const grip = [x + 16 * Math.sin(a), 49, wheelZ + 16 * Math.cos(a)];
  s.rod("boat-crank", [x, 49, wheelZ], grip, 1.8, { tone: "hi" });
  s.rod("boat-grip", grip, [grip[0], 59, grip[2]], 2.6, { tone: "hi" });
  return s;
}

// Split at a real horizontal water plane. The dry section must never inherit
// an underwater tint, and the wet section must not paint as opaque dry wood.
function wetBox(s, id, x, y, z, w, d, h, waterline, style = { tone: "hi" }) {
  const split = clamp(waterline, z, z + h);
  s.box(id + "-wet", x, y, z, w, d, Math.max(0.001, split - z), { ...style, underwater: true });
  s.box(id, x, y, split, w, d, Math.max(0.001, z + h - split), style);
}
function wetCylinder(s, id, x, y, z, r, h, waterline, style = { tone: "mid" }) {
  const split = clamp(waterline, z, z + h);
  s.cyl(id + "-wet", x, y, z, r, Math.max(0.001, split - z), { ...style, underwater: true });
  s.cyl(id, x, y, split, r, Math.max(0.001, z + h - split), style);
}
function gate(s, id, x, opening, waterline, level = 7) {
  for (const side of [-1, 1]) {
    const y = side * 35, closed = -side * Math.atan2(35, 10), a = closed + (-side * Math.PI - closed) * opening;
    const length = Math.hypot(35, 10), dx = Math.cos(a), dy = Math.sin(a);
    const view = G.viewOf(s.P);
    const facing = -dy * view[0] + dx * view[1] >= 0 ? 1 : -1;
    const px = -dy * 1.8 * facing, py = dx * 1.8 * facing;
    const tip = [x + dx * length, y + dy * length];
    const poly = [[x + px, y + py], [tip[0] + px, tip[1] + py], [tip[0] - px, tip[1] - py], [x - px, y - py]];
    const split = clamp(waterline, level, level + 86), mx = (x + tip[0]) / 2, my = (y + tip[1]) / 2;
    s.solid(id + "leaf" + side + "-wet", K.extrude(poly, level, split - level, s.P), [mx, my, (level + split) / 2], { tone: "hi", underwater: true });
    s.solid(id + "leaf" + side, K.extrude(poly, split, level + 86 - split, s.P), [mx, my, (level + 86 + split) / 2], { tone: "hi" });
    for (const z of [level + 18, level + 67]) {
      s.rod(id + "brace" + side + z, [x + dx * 2 + px, y + dy * 2 + py, z], [tip[0] + px, tip[1] + py, z], 1.8, { tone: "mid", underwater: z < waterline });
      wetCylinder(s, id + "hinge" + side + z, x, y, z - 3, 3, 6, waterline);
    }
    for (let i = 1; i <= 4; i++) {
      const t = i / 5, sx = x + dx * length * t + px, sy = y + dy * length * t + py;
      s.line(id + "plank" + side + i + "-wet", s.path([[sx, sy, level], [sx, sy, split]]), [sx, sy, (level + split) / 2], "faint", { underwater: true });
      s.line(id + "plank" + side + i, s.path([[sx, sy, split], [sx, sy, level + 86]]), [sx, sy, (level + 86 + split) / 2], "faint");
    }
    wetCylinder(s, id + "post" + side, x, y, 7, 3.8, 91, waterline);
    s.cyl(id + "post-cap" + side, x, y, 98, 5, 3, { tone: "hi" });
  }
}

function sluice(s, x, level, opening) {
  wetBox(s, "sluice-frame", x - 5, -35, 7, 10, 13, 26, level, { tone: "mid" });
  wetBox(s, "sluice-blade", x - 2, -29, 10 + opening * 18, 4, 8, 19, level);
  const bottom = 25 + opening * 18, split = Math.max(bottom, level);
  s.rod("sluice-stem-wet", [x, -25, bottom], [x, -25, split + 0.001], 1.5, { tone: "hi", underwater: true });
  s.rod("sluice-stem", [x, -25, split], [x, -25, 110], 1.5, { tone: "hi" });
  s.cyl("sluice-hub", x, -25, 108, 4, 4, { tone: "hi" });
  const a = opening * TAU;
  s.rod("sluice-handle", [x - 12 * Math.cos(a), -25 - 12 * Math.sin(a), 113], [x + 12 * Math.cos(a), -25 + 12 * Math.sin(a), 113], 1.5, { tone: "hi" });
}

function lock(Scene, step, v) {
  const s = new Scene("lock", step, v.preview);
  const state = lockAt(step, v.progress || 0, v.phase || 0);
  const full = step === 3, half = full ? 160 : 112;
  s.plinth(half * 2 + 16, 96);
  s.box("canal-back", -half, -43, 7, half * 2, 8, 100, { tone: "mid" });
  s.box("canal-front-cut", -half, 39, 7, half * 2, 5, 8, { tone: "lo" });
  for (const x of [-half, half - 5]) s.box("canal-end" + x, x, -39, 7, 5, 78, 8, { tone: "mid" });
  for (let i = 1; i < 12; i++) {
    const x = -half + half * 2 * i / 12;
    s.line("wall-joint" + i, s.path([[x, -34.9, 7], [x, -34.9, 107]]), [x, -34.9, 57], "faint");
    s.bolt("wall-pin" + i, [x - 3, -34.8, 98], 0.65);
  }
  if (step === 0) {
    s.box("tank-divider", -3, -39, 7, 6, 78, 92);
    water(s, "left", -half + 5, -3, -34, 38, state.high, v.progress || 0);
    water(s, "right", 3, half - 5, -34, 38, state.low, v.progress || 0);
    sluice(s, 0, state.low, state.valve);
  } else if (full) {
    water(s, "low", -155, -57, -34, 38, state.low, v.progress || 0);
    water(s, "chamber", -57, 57, -34, 38, state.level, v.progress || 0);
    water(s, "high", 57, 155, -34, 38, state.high, v.progress || 0);
    gate(s, "lower-", -57, state.lowGate, state.low);
    gate(s, "upper-", 57, state.highGate, state.level);
    hull(s, "lock-boat-", state.boatX, state.level, 0.65);
    sluice(s, 57, state.level, state.valve);
  } else {
    water(s, "chamber", -107, 22, -34, 38, state.level, v.progress || 0);
    water(s, "upper", 22, 107, -34, 38, state.high, v.progress || 0);
    gate(s, "upper-", 22, state.highGate, state.level);
    hull(s, "lock-boat-", -36, state.level, 0.65);
    sluice(s, 22, state.level, state.valve);
  }
  return s;
}

export function extraScene(kind, step, values, Scene) {
  const s = { parachute, boat, lock }[kind](Scene, step, values);
  // A cutaway water volume belongs below its floating and mounted mechanisms.
  // Sorting one large water face by its centre can incorrectly hide a boat.
  s.constructedLayers = true;
  return s;
}
