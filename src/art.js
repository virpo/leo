import * as K from "./vendor/iso-kit.mjs";
import * as G from "./vendor/lathe.mjs";
import { TAU, knightAt, gearAngles, gearProfile, GEAR_PLANE } from "./model.js";

const W = 600,
  H = 460;
const paper = ["#cbb990", "#dfcfad", "#e9dcc0", "#f2e7ce", "#f5ecd8"];
const xyz = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const geometryCache = new Map();

class Scene {
  constructor(kind, step, preview = false) {
    this.kind = kind;
    this.step = step;
    this.cacheNamespace = `${kind}/${step}/${preview ? "preview" : "lesson"}`;
    this.items = [];
    const configs = {
      screw: {
        bounds: {
          x: step === 0 ? -70 : -90,
          y: step === 0 ? -70 : -90,
          w: step === 0 ? 140 : 180,
          d: step === 0 ? 140 : 180,
          r: 0,
        },
        top: step === 0 ? 190 : 246,
        azimuth: 43,
        elevation: 24,
      },
      cart: {
        bounds:
          step === 0
            ? { x: -50, y: -43, w: 100, d: 86, r: 0 }
            : step === 3
              ? { x: -132, y: -72, w: 264, d: 144, r: 0 }
              : { x: -76, y: -52, w: 152, d: 104, r: 0 },
        top: 95,
        azimuth: preview ? 24 : 53,
        elevation: preview ? 43 : step === 1 || step === 2 ? 45 : 27,
      },
      knight: {
        bounds:
          step === 3
            ? { x: -75, y: -44, w: 200, d: 88, r: 0 }
            : { x: -20, y: -24, w: 145, d: 68, r: 0 },
        top: step === 3 ? 260 : 225,
        azimuth: 68,
        elevation: 16,
      },
    };
    const c = configs[kind];
    const pts = [...K.boxCorners(c.bounds, 0, 0), [0, 0, c.top]];
    // Both teaching stages use the same camera. Adding the spring must not
    // shrink or shift the gears the child has just learned about.
    if (kind === "cart" && (step === 1 || step === 2))
      for (let i = 0; i < 12; i++)
        pts.push([
          -34 + 26 * Math.cos((i * TAU) / 12),
          26 * Math.sin((i * TAU) / 12),
          87,
        ]);
    this.P = K.fitProjection(pts, W, H, {
      pad: 37,
      azimuth: c.azimuth,
      elevation: c.elevation,
    });
  }
  solid(id, paths, at, style = {}) {
    this.items.push({
      id,
      paths,
      at,
      style,
      type: "solid",
      key: K.depthOf(at, this.P),
    });
  }
  cached(id, values, build) {
    const name = `${this.cacheNamespace}/${id}`,
      key = JSON.stringify(values),
      old = geometryCache.get(name);
    if (old?.key === key) return old.paths;
    const paths = build();
    geometryCache.set(name, { key, paths });
    return paths;
  }
  line(id, d, at, tone = "lo", extra = {}) {
    this.items.push({
      id,
      d,
      at,
      tone,
      ...extra,
      type: "line",
      key: K.depthOf(at, this.P) + 0.02,
    });
  }
  custom(id, d, at, fill, stroke = "none", width = 0.65) {
    this.items.push({
      id,
      d,
      at,
      fill,
      stroke,
      width,
      type: "custom",
      key: K.depthOf(at, this.P),
    });
  }
  box(id, x, y, z, w, d, h, style = {}) {
    this.solid(
      id,
      this.cached(id, [x, y, z, w, d, h], () =>
        K.slabOf({ x, y, w, d, r: 0.8 }, z, h, this.P, 3, 0.45),
      ),
      [x + w / 2, y + d / 2, z + h / 2],
      style,
    );
  }
  cyl(id, x, y, z, r, h, style = {}) {
    this.solid(
      id,
      this.cached(id, [x, y, z, r, h], () =>
        K.cylinder(x, y, r, z, h, this.P, 40, 0.35),
      ),
      [x, y, z + h / 2],
      style,
    );
  }
  rod(id, a, b, r = 2, style = {}) {
    const dist = Math.hypot(...b.map((v, i) => v - a[i]));
    const F = G.frameAlong(
      a,
      b.map((v, i) => v - a[i]),
    );
    this.solid(
      id,
      this.cached(id, [a, b, r], () =>
        G.disc(0, dist, r, F, this.P, { steps: 20 }),
      ),
      xyz(a, b, 0.5),
      style,
    );
  }
  path(points, closed = false) {
    return K.pathOf(
      points.map((p) => K.iso(p, this.P)),
      closed,
    );
  }
  bolt(id, p, r = 1) {
    const q = K.iso(p, this.P);
    this.items.push({
      id,
      p,
      q,
      r,
      type: "dot",
      key: K.depthOf(p, this.P) + 0.02,
    });
  }
  panel(id, points, fill = paper[3], stroke = "#81694b") {
    this.custom(
      id,
      this.path(points, true),
      points.reduce(
        (s, p) => s.map((v, i) => v + p[i] / points.length),
        [0, 0, 0],
      ),
      fill,
      stroke,
    );
  }
  plinth(w = 130, d = 84) {
    const first = this.items.length;
    this.box("base", -w / 2, -d / 2, 0, w, d, 7, { tone: "lo" });
    for (const [i, [x, y]] of [
      [-w / 2 + 12, -d / 2 + 12],
      [w / 2 - 12, -d / 2 + 12],
      [-w / 2 + 12, d / 2 - 12],
      [w / 2 - 12, d / 2 - 12],
    ].entries()) {
      this.cyl("foot" + i, x, y, -5, 4, 5, { tone: "lo" });
      this.bolt("base-bolt" + i, [x, y, 7]);
    }
    this.line(
      "base-rim",
      K.planOutline(
        { x: -w / 2 + 3, y: -d / 2 + 3, w: w - 6, d: d - 6, r: 1 },
        7,
        this.P,
        3,
      ),
      [0, 0, 7],
      "faint",
    );
    // These are one supporting assembly, below everything mounted on its top.
    // Centre-only sorting otherwise lets the broad plate cover a far-side boot
    // and lets a near-side foot paint over its own mounting bolt.
    this.foundation = this.items.slice(first).sort((a, b) => {
      const rank = (item) => item.id.startsWith("foot") ? 0 : item.id === "base" ? 1 : 2;
      return rank(a) - rank(b) || a.key - b.key;
    });
    this.items.splice(first);
  }
}

function screw(step, v = {}) {
  const s = new Scene("screw", step),
    P = s.P,
    phase = v.angle || 0;
  const full = step === 3,
    radius = full ? 86 : 65;
  s.cyl("platform", 0, 0, 3, radius, 7, { tone: "mid" });
  for (let i = -3; i <= 3; i++) {
    const y = i * 19;
    if (Math.abs(y) < radius) {
      const x = Math.sqrt(radius * radius - y * y);
      s.line(
        "deck" + i,
        K.lineOnTop([-x, y], [x, y], 10, P),
        [0, y, 10],
        "faint",
      );
    }
  }
  for (let i = 0; i < 8; i++) {
    const a = (i * TAU) / 8;
    const x = (radius - 5) * Math.cos(a),
      y = (radius - 5) * Math.sin(a);
    s.bolt("peg" + i, [x, y, 10], 0.85);
  }
  for (let i = 0; i < 4; i++) {
    const a = (i * TAU) / 4 + 0.3;
    s.cyl(
      "foot" + i,
      (radius - 15) * Math.cos(a),
      (radius - 15) * Math.sin(a),
      -6,
      5,
      9,
      { tone: "lo" },
    );
  }
  s.cyl("bearing-low", 0, 0, 10, 10, 8, { tone: "hi" });
  const top = step === 0 ? 185 : 246;
  for (let i = 0; i < 16; i++) {
    const z = 18 + (i * (top - 18)) / 16;
    s.cyl("mast" + i, 0, 0, z, 3.4, (top - 18) / 16, { tone: "hi" });
  }
  s.cyl("mast-cap", 0, 0, top, 5, 3, { tone: "hi" });
  const handles = full ? 4 : 2;
  for (let i = 0; i < handles; i++) {
    const a = phase + (i * TAU) / handles;
    const p = [Math.cos(a) * 49, Math.sin(a) * 49, 42];
    s.rod("push-bar" + i, [0, 0, 42], p, 2.6, { tone: "hi" });
    s.rod("grip" + i, xyz(p, [0, 0, 42], 0.18), p, 3.3, { tone: "hi" });
  }
  s.cyl("handle-hub", 0, 0, 37, 7, 10, { tone: "hi" });
  if (full) {
    for (let i = 0; i < 4; i++) {
      const a = (i * TAU) / 4;
      const a0 = [Math.cos(a) * 47, Math.sin(a) * 47, 10],
        a1 = [Math.cos(a) * 5, Math.sin(a) * 5, 75];
      s.rod("brace" + i, a0, a1, 1.5, { tone: "mid" });
    }
  }
  if (step > 0) {
    const n = 96;
    const pt = (t, r) => {
      const a = t * TAU * 1.48 + phase;
      return [Math.cos(a) * r, Math.sin(a) * r, 77 + t * 159];
    };
    for (let i = 0; i < n; i++) {
      const t = i / n,
        t1 = (i + 1) / n,
        r = 82 * (1 - t * 0.68),
        r1 = 82 * (1 - t1 * 0.68);
      const pts = [pt(t, 3.4), pt(t, r), pt(t1, r1), pt(t1, 3.4)];
      const a = t * TAU * 1.48 + phase,
        shade = Math.floor((Math.sin(a + 0.6) + 1) * 1.8);
      s.panel("sail" + i, pts, paper[Math.min(4, shade + 1)], "none");
      s.line(
        "edge" + i,
        s.path([pt(t, r), pt(t1, r1)]),
        xyz(pt(t, r), pt(t1, r1), 0.5),
        "hi",
      );
      s.line(
        "inner-edge" + i,
        s.path([pt(t, 3.4), pt(t1, 3.4)]),
        xyz(pt(t, 3.4), pt(t1, 3.4), 0.5),
        "lo",
      );
      if (i % 8 === 0) {
        s.line(
          "rib" + i,
          s.path([pt(t, 3.4), pt(t, r)]),
          pt(t, r * 0.5),
          "mid",
        );
      }
      if (i % 8 === 4) {
        s.line(
          "seam" + i,
          s.path([pt(t, 3.4), pt(t, r)]),
          pt(t, r * 0.5),
          "faint",
        );
      }
    }
    // Closed hems give the cloth an edge at both ends.
    for (const t of [0, 1])
      s.line(
        "hem" + t,
        s.path([pt(t, 3.4), pt(t, 82 * (1 - t * 0.68))]),
        pt(t, 40),
        "hi",
      );
  }
  return s;
}

function wheel(s, id, c, r, angle = 0, axis = [0, 1, 0]) {
  const F = G.frameAlong(c, axis),
    P = s.P;
  s.solid(
    id + "rim",
    s.cached(id + "rim", [c, r, axis], () =>
      G.ringBand(-3, 3, r - 3, r, F, P, { steps: 56, hole: [3, r - 3] }),
    ),
    c,
    { tone: "hi", fillRule: "evenodd" },
  );
  s.solid(
    id + "rim-inner",
    s.cached(id + "rim-inner", [c, r, axis], () =>
      G.ringBand(3, 4, r - 3.5, r - 1.6, F, P, {
        steps: 56,
        hole: [4, r - 3.5],
      }),
    ),
    G.add3(c, G.mul3(axis, 3.5)),
    { tone: "mid" },
  );
  for (let i = 0; i < 8; i++) {
    const a = (i * TAU) / 8 + angle;
    const points = [
      [4, -1.3],
      [r - 2, -1.3],
      [r - 2, 1.3],
      [4, 1.3],
    ].map(([x, y]) => [
      x * Math.cos(a) - y * Math.sin(a),
      x * Math.sin(a) + y * Math.cos(a),
    ]);
    s.solid(
      id + "spoke" + i,
      G.prismOf(F, points, -1.8, 1.8, P),
      G.pointOf(F, 0, r / 2, a),
      { tone: "mid" },
    );
  }
  s.solid(
    id + "hub",
    s.cached(id + "hub", [c, r, axis], () =>
      G.disc(-4, 5, 5, F, P, { steps: 24 }),
    ),
    c,
    { tone: "hi" },
  );
  s.solid(
    id + "pin",
    s.cached(id + "pin", [c, r, axis], () =>
      G.disc(5, 7, 2, F, P, { steps: 16 }),
    ),
    G.add3(c, G.mul3(axis, 6)),
    { tone: "hi" },
  );
}

function gear(s, id, x, y, z, r, teeth, angle) {
  const pts = gearProfile(teeth, r, angle).map(([px, py]) => [x + px, y + py]);
  const paths = K.extrude(pts, z, 4, s.P, { convex: false });
  // A concave tooth root can hide a side edge of the same gear. Paint those
  // edges with the walls, then let the opaque top occlude them. Convex solids
  // can draw all outlines last; a gear cannot.
  paths.sideOutline = paths.outline;
  paths.outline = paths.top;
  paths.crease = "";
  s.solid(
    id,
    paths,
    [x, y, z + 2],
    { tone: "hi" },
  );
  for (let i = 0; i < 4; i++) {
    const a = (i * TAU) / 4 + angle;
    s.line(
      id + "groove" + i,
      K.lineOnTop(
        [x + Math.cos(a) * 4, y + Math.sin(a) * 4],
        [
          x + Math.cos(a) * (r + (2 * r) / teeth),
          y + Math.sin(a) * (r + (2 * r) / teeth),
        ],
        z + 4,
        s.P,
      ),
      [x, y, z + 4],
      "faint",
    );
  }
  s.cyl(id + "hub", x, y, z + 4, 4, 4, { tone: "hi" });
  s.bolt(id + "pin", [x, y, z + 8]);
}

function spring(s, id, x, y, z, charge = 0) {
  s.cyl(id + "drum", x, y, z, 20, 4, { tone: "mid" });
  const pts = [];
  for (let i = 0; i <= 150; i++) {
    const t = i / 150,
      a = t * TAU * (2.2 + charge * 1.4),
      r = 3 + t * (14 - charge * 3);
    pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r, z + 4.3]);
  }
  s.line(id + "coil", s.path(pts), [x, y, z + 4.3], "hi");
  s.cyl(id + "axle", x, y, z + 4, 3, 6, { tone: "hi" });
  const tip = pts.at(-1),
    outward = G.add3(
      [x, y, z + 4.3],
      G.mul3(
        G.sub3(tip, [x, y, z + 4.3]),
        19 / Math.hypot(tip[0] - x, tip[1] - y),
      ),
    );
  s.line(id + "terminal", s.path([tip, outward]), xyz(tip, outward, 0.5), "hi");
  s.bolt(id + "spring-anchor", outward, 0.75);
}

function cart(step, v = {}) {
  const s = new Scene("cart", step, v.preview),
    P = s.P,
    a = v.angle || 0,
    g = gearAngles(a),
    full = step === 3;
  if (step === 0) {
    wheel(s, "wheel", [0, 0, 47], 42, a);
    s.rod("axle", [0, -38, 47], [0, 38, 47], 4, { tone: "hi" });
    for (const y of [-25, 25]) {
      s.box("stand" + y, -8, y - 4, 0, 16, 8, 43, { tone: "lo" });
      s.cyl("stand-peg" + y, 0, y, 43, 5, 4, { tone: "mid" });
    }
    s.box("bench", -47, -40, -7, 94, 80, 7, { tone: "lo" });
    return s;
  }
  if (!full) {
    s.plinth(145, 100);
    for (const [i, x] of [-34, 20].entries()) {
      s.box("bearing" + i, x - 8, -8, 7, 16, 16, 26, { tone: "mid" });
      s.cyl("shaft" + i, x, 0, 33, 2.8, 18, { tone: "hi" });
    }
    gear(s, "driver", -34, 0, GEAR_PLANE, 18, 12, g.driver);
    gear(s, "follower", 20, 0, GEAR_PLANE, 36, 24, g.follower);
    if (step === 2) {
      spring(s, "spring", -34, 0, 57, v.charge || 0);
      const end = [-34 + 26 * Math.cos(a), 26 * Math.sin(a), 76];
      s.rod("winding-shaft", [-34, 0, 50], [-34, 0, 76], 2.8, { tone: "hi" });
      s.rod("winding", [-34, 0, 76], end, 2.3, { tone: "hi" });
      s.cyl("winding-grip", end[0], end[1], 76, 3, 11, { tone: "hi" });
    }
    return s;
  }
  const offset = v.distance || 0;
  const baseX = -30 + offset;
  // The running gear is visible through the open wooden chassis.
  for (const x of [-69, 60]) {
    const bx = x + baseX;
    s.rod("axle" + x, [bx, -56, 26], [bx, 56, 26], 3, { tone: "hi" });
  }
  for (const y of [-45, 45])
    wheel(s, "rear" + y, [-69 + baseX, y, 26], 25, v.wheelAngle || 0);
  wheel(s, "front", [60 + baseX, 0, 26], 25, v.wheelAngle || 0);
  for (const y of [-29, 22])
    s.box("rail" + y, -92 + baseX, y, 29, 165, 7, 9, { tone: "mid" });
  for (let i = 0; i < 5; i++)
    s.box("cross" + i, -85 + i * 34 + baseX, -29, 29, 6, 58, 7, {
      tone: "mid",
    });
  for (let i = 0; i < 6; i++)
    s.box("deck" + i, -89 + i * 15 + baseX, -23, 36, 13, 45, 3, {
      tone: "mid",
    });
  for (const x of [-69, 60])
    for (const y of [-27, 27]) {
      s.box("block" + x + y, x - 6 + baseX, y - 5, 26, 12, 10, 13, {
        tone: "mid",
      });
      s.bolt("blockpeg" + x + y, [x + baseX, y, 39]);
    }
  gear(s, "driver", -27 + baseX, -2, 42, 13, 12, g.driver);
  gear(s, "follower", 12 + baseX, -2, 42, 26, 24, g.follower);
  spring(s, "springA", -58 + baseX, -12, 41, v.energy ?? 1);
  spring(s, "springB", -58 + baseX, 17, 41, v.energy ?? 1);
  s.rod("wind-shaft", [-58 + baseX, -12, 51], [-58 + baseX, -12, 73], 2.5, {
    tone: "hi",
  });
  const end = [-58 + baseX + 20 * Math.cos(a), -12 + 20 * Math.sin(a), 73];
  s.rod("crank", [-58 + baseX, -12, 73], end, 2.2, {
    tone: "hi",
  });
  s.cyl("crank-grip", end[0], end[1], 73, 3, 10, { tone: "hi" });
  s.box("steering-fork", 50 + baseX, -6, 48, 22, 12, 5, { tone: "hi" });
  s.cyl("steering-pin", 60 + baseX, 0, 53, 3, 11, { tone: "hi" });
  for (const y of [-29, 29])
    for (const x of [-85, -20, 66])
      s.bolt("railpeg" + x + y, [x + baseX, y, 38], 0.8);
  return s;
}

function plateLimb(s, id, a, b, width0, width1, thickness = 11) {
  const F = G.frameAlong([0, a[1], 0], [0, 1, 0]);
  const dx = b[0] - a[0],
    dz = b[2] - a[2],
    l = Math.hypot(dx, dz),
    nx = -dz / l,
    nz = dx / l;
  const pts = [
    [a[0] + nx * width0, a[2] + nz * width0],
    [b[0] + nx * width1, b[2] + nz * width1],
    [b[0] - nx * width1, b[2] - nz * width1],
    [a[0] - nx * width0, a[2] - nz * width0],
  ];
  // For a y-axis frame u=-x and v=+z.
  const poly = pts.map(([x, z]) => [-x, z]);
  s.solid(
    id,
    s.cached(id, [a, b, width0, width1, thickness], () =>
      G.prismOf(F, poly, -thickness / 2, thickness / 2, s.P),
    ),
    xyz(a, b, 0.5),
    { tone: "hi" },
  );
  s.line(
    id + "seam",
    s.path([
      [a[0], a[1] + thickness / 2, a[2]],
      [b[0], a[1] + thickness / 2, b[2]],
    ]),
    xyz(a, b, 0.5),
    "faint",
  );
}

function knight(step, v = {}) {
  const s = new Scene("knight", step),
    P = s.P,
    lift = v.lift || 0,
    pose = knightAt(lift),
    full = step === 3;
  s.plinth(full ? 150 : 130, full ? 80 : 70);
  const shoulder = [55, 3, 181],
    elbow = pose.elbow,
    hand = pose.hand;
  if (full) {
    for (const side of [-1, 1]) {
      const x = side * 19;
      s.box("shoe" + side, x - 10, -17, 7, 20, 33, 10, { tone: "mid" });
      plateLimb(s, "calf" + side, [x, 0, 17], [x, 0, 70], 7, 9, 13);
      plateLimb(s, "thigh" + side, [x, 0, 82], [x * 0.8, 0, 125], 9, 11, 16);
      s.solid(
        "knee" + side,
        G.disc(-9, 9, 9, G.frameAlong([x, 0, 76], [0, 1, 0]), P),
        [x, 0, 76],
        { tone: "hi" },
      );
      s.bolt("kneerivet" + side, [x, 9, 76]);
      s.line(
        "boot-seam" + side,
        K.planOutline({ x: x - 8, y: -15, w: 16, d: 29, r: 1 }, 17, P),
        [x, 0, 17],
        "lo",
      );
    }
    s.box("hip", -27, -11, 125, 54, 22, 14, { tone: "mid" });
    for (let i = 0; i < 3; i++)
      s.box("belt" + i, -29, -13, 139 + i * 4, 58, 26, 3, { tone: "hi" });
    const F = G.frameAlong([0, 0, 0], [0, 1, 0]);
    const chest = [
      [-28, 150],
      [-35, 190],
      [-25, 203],
      [25, 203],
      [35, 190],
      [28, 150],
    ].map(([x, z]) => [-x, z]);
    s.solid("chest", G.prismOf(F, chest, -12, 12, P), [0, 0, 178], {
      tone: "hi",
    });
    // A central open panel reveals the cord route.
    s.panel(
      "chest-open",
      [
        [-12, 12.2, 156],
        [12, 12.2, 156],
        [12, 12.2, 194],
        [-12, 12.2, 194],
      ],
      "#b5a17b",
      "#705b40",
    );
    for (const x of [-23, 23])
      for (const z of [157, 183, 196])
        s.bolt("chest-rivet" + x + z, [x, 12.3, z], 1);
    s.cyl("neck", 0, 0, 203, 9, 11, { tone: "mid" });
    s.cyl("collar", 0, 0, 207, 15, 5, { tone: "hi" });
    const profile = [
      [0, 13],
      [5, 18],
      [27, 19],
      [34, 16],
      [39, 8],
      [40, 0],
    ];
    s.solid(
      "helmet",
      G.solidOf(profile, G.frameAlong([0, 0, 212], [0, 0, 1]), P, {
        steps: 64,
        smooth: false,
      }),
      [0, 0, 232],
      { tone: "hi" },
    );
    // A mounted faceplate, not a flat drawing sunk inside the round helmet.
    s.box("visor", -16, 14, 222, 32, 7, 18, { tone: "hi" });
    for (const x of [-7, 7])
      s.panel(
        "eye" + x,
        [
          [x - 3, 21.2, 231],
          [x + 3, 21.2, 231],
          [x + 3, 21.2, 233],
          [x - 3, 21.2, 233],
        ],
        "#624d35",
        "none",
      );
    s.panel(
      "visor-smile",
      [
        [-4, 21.2, 226.3],
        [0, 21.2, 225.3],
        [4, 21.2, 226.3],
        [4, 21.2, 225.7],
        [0, 21.2, 224.7],
        [-4, 21.2, 225.7],
      ],
      "#624d35",
      "none",
    );
    for (const x of [-17, 17]) s.bolt("visor-hinge" + x, [x, 12, 231], 1.4);
    s.rod("helmet-ridge", [0, -17, 242], [0, 0, 255], 1.5, { tone: "mid" });
    plateLimb(s, "leftupper", [-43, 0, 181], [-49, 0, 135], 10, 8, 15);
    plateLimb(s, "leftforearm", [-49, 0, 132], [-43, 4, 94], 9, 6, 13);
    s.solid(
      "leftshoulder",
      G.disc(-11, 11, 14, G.frameAlong([-40, 0, 187], [0, 1, 0]), P),
      [-40, 0, 187],
      { tone: "hi" },
    );
    s.solid(
      "rightshoulder",
      G.disc(-11, 11, 14, G.frameAlong([43, 0, 187], [0, 1, 0]), P),
      [43, 0, 187],
      { tone: "hi" },
    );
    s.box("left-palm", -50, 0, 82, 13, 13, 16, { tone: "hi" });
    for (let i = 0; i < 4; i++)
      s.box("left-finger" + i, -49 + i * 3.2, 3, 74, 2.4, 7, 10, {
        tone: "mid",
      });
    s.rod("shoulder-connect", [43, 0, 187], shoulder, 6, { tone: "hi" });
  } else {
    s.box("stand-post", -4, -10, 7, 9, 10, 181, { tone: "lo" });
    s.rod("stand-arm", [0, 0, 181], shoulder, 3, { tone: "mid" });
    s.cyl("stand-cap", 0, -5, 188, 7, 4, { tone: "mid" });
  }
  plateLimb(s, "upperarm", shoulder, elbow, 10, 7, 14);
  plateLimb(s, "forearm", elbow, hand, 8, 6, 12);
  s.solid("elbow", G.disc(-9, 9, 9, G.frameAlong(elbow, [0, 1, 0]), P), elbow, {
    tone: "hi",
  });
  s.bolt("elbow-pin", [elbow[0], 12, elbow[2]], 1.2);
  s.solid(
    "shoulder-pin",
    G.disc(-9, 9, 8, G.frameAlong(shoulder, [0, 1, 0]), P),
    shoulder,
    { tone: "hi" },
  );
  const wrist = xyz(elbow, hand, 0.9);
  s.rod("cuff", wrist, hand, 8, { tone: "mid" });
  if (full) {
    const dir = G.unit3(G.sub3(hand, elbow));
    const palmEnd = G.add3(hand, G.mul3(dir, 13));
    plateLimb(s, "palm", hand, palmEnd, 7, 7, 9);
    for (let i = 0; i < 4; i++) {
      const start = G.add3(palmEnd, [(i - 1.5) * 3, 0, 0]);
      s.rod("finger" + i, start, G.add3(start, G.mul3(dir, 9)), 1.2, {
        tone: "mid",
      });
    }
    const thumb = G.add3(hand, [7, 0, 0]);
    s.rod("thumb", thumb, G.add3(thumb, [6, 0, 6]), 2, { tone: "mid" });
  }
  if (step > 0) {
    const target = xyz(elbow, hand, 0.78),
      anchor = full ? [0, 13, 186] : [28, 14, 211];
    s.bolt("cord-terminal", G.add3(target, [0, 7, 0]), 1.4);
    const pulleyExit = [anchor[0] + 9, anchor[1] + 5, anchor[2]];
    const restingTarget = [55, 10, 132 - 47 * 0.78];
    const liveTarget = G.add3(target, [0, 7, 0]);
    const ropeDelta =
      Math.hypot(...G.sub3(restingTarget, pulleyExit)) -
      Math.hypot(...G.sub3(liveTarget, pulleyExit));
    const end =
      step === 1
        ? [target[0] + 28, 10, target[2] + 32]
        : [anchor[0] - 9, anchor[1] + 5, 118 - ropeDelta];
    s.bolt("grip-cord-eyelet", end, 1.5);
    if (step === 1) {
      s.line(
        "cord",
        s.path([G.add3(target, [0, 7, 0]), end]),
        xyz(target, end, 0.5),
        "hi",
      );
      s.rod("cord-grip", end, G.add3(end, [0, 0, 9]), 2.5, { tone: "hi" });
    } else {
      const pulley = anchor,
        F = G.frameAlong(pulley, [0, 1, 0]);
      wheel(s, "pulley", pulley, 9, -lift * 2);
      const left = [anchor[0] - 9, anchor[1] + 5, anchor[2]],
        right = [anchor[0] + 9, anchor[1] + 5, anchor[2]];
      const arc = [];
      for (let i = 0; i <= 24; i++) {
        const a = Math.PI - (i * Math.PI) / 24;
        arc.push([
          anchor[0] + Math.cos(a) * 9,
          anchor[1] + 5,
          anchor[2] + Math.sin(a) * 9,
        ]);
      }
      s.line("cord-up", s.path([end, left]), xyz(end, left, 0.5), "hi");
      s.line("cord-over", s.path(arc), G.add3(anchor, [0, 5, 7]), "hi");
      s.line(
        "cord-down",
        s.path([right, G.add3(target, [0, 7, 0])]),
        xyz(right, target, 0.5),
        "hi",
      );
      s.rod("cord-grip", end, G.add3(end, [0, 0, -9]), 2.5, { tone: "hi" });
      if (!full)
        s.rod("pulley-support", [0, -5, 185], [28, 9, 211], 2, { tone: "mid" });
      else {
        wheel(s, "crankwheel", [0, 16, 130], 17, v.angle || 0);
        s.rod(
          "crank-handle",
          [0, 20, 130],
          [-12 * Math.cos(v.angle || 0), 22, 130 + 12 * Math.sin(v.angle || 0)],
          2,
          { tone: "hi" },
        );
      }
    }
  }
  return s;
}

export function sceneAt(kind, step = 3, v = {}) {
  const s = { screw, cart, knight }[kind](step, v);
  s.items.sort((a, b) => a.key - b.key);
  if (s.foundation) s.items.unshift(...s.foundation);
  if (kind === "screw") {
    const onBase = (id) => /^(foot\d|platform$|deck-?\d|peg\d)/.test(id);
    const foundation = s.items.filter((item) => onBase(item.id));
    const rank = (item) => item.id.startsWith("foot") ? 0 : item.id === "platform" ? 1 : 2;
    foundation.sort((a, b) => rank(a) - rank(b) || a.key - b.key);
    s.items = [...foundation, ...s.items.filter((item) => !onBase(item.id))];
  }
  return s;
}

function markup(item) {
  if (item.type === "solid")
    return `<g data-part="${item.id}"><g class="iso-solid" ${item.paths.seamless ? "data-seamless" : ""}><path class="iso-fill" d="${item.paths.fill}" fill-rule="${item.style.fillRule || (item.id.includes("rim") ? "evenodd" : "nonzero")}"/>${item.paths.shades.map((d, i) => `<path class="iso-shade" data-shade="${i}" d="${d}"/>`).join("")}<path class="iso-line iso-side-edge" data-tone="${item.style.tone || "hi"}" d="${item.paths.sideOutline || ""}"/><path class="iso-top" d="${item.paths.top}"/><path class="iso-line iso-crease" data-tone="faint" d="${item.paths.crease}"/><path class="iso-line iso-bevel" data-tone="faint" d="${item.paths.bevel || ""}"/><path class="iso-line iso-edge" data-tone="${item.style.tone || "hi"}" d="${item.paths.outline}"/></g></g>`;
  if (item.type === "line")
    return `<g data-part="${item.id}">${K.lineSvg(item.d, { tone: item.tone, free: item.free })}</g>`;
  if (item.type === "dot")
    return `<g data-part="${item.id}"><g class="iso-dots" data-tone="hi"><circle cx="${item.q[0]}" cy="${item.q[1]}" r="${item.r}"/></g></g>`;
  return `<g data-part="${item.id}"><path class="art-custom" d="${item.d}" fill="${item.fill}" stroke="${item.stroke}" stroke-width="${item.width}" stroke-linejoin="round" stroke-linecap="round"/></g>`;
}

export function artMarkup(kind, step = 3, v = {}, extra = "") {
  const s = sceneAt(kind, step, v);
  return `<svg class="machine-art iso-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${kind === "screw" ? "Leonardo’s spiral flying machine" : kind === "cart" ? "A wooden spring-powered cart with visible gears" : "A friendly mechanical knight with cords and pulleys"}" ${extra}><g class="drawing-parts">${s.items.map(markup).join("")}</g></svg>`;
}

function touchPoint(kind, step, v) {
  if (kind === "screw") {
    const a = v.angle || 0;
    return [49 * Math.cos(a), 49 * Math.sin(a), 42];
  }
  if (kind === "cart")
    return step === 0
      ? [0, 5, 47]
      : step === 1
        ? [-34, 0, 48]
        : step === 2
          ? [-34 + 26 * Math.cos(v.angle || 0), 26 * Math.sin(v.angle || 0), 87]
          : [
              -88 + (v.distance || 0) + 20 * Math.cos(v.angle || 0),
              -12 + 20 * Math.sin(v.angle || 0),
              83,
            ];
  if (step === 0) return [55, 12, 132];
  if (step === 1) {
    const p = knightAt(v.lift || 0);
    const t = xyz(p.elbow, p.hand, 0.78);
    return [t[0] + 28, 10, t[2] + 36];
  }
  if (step === 2) return [19, 19, 100];
  return [0, 22, 130];
}

export function mountArt(element, kind, step, v = {}) {
  element.innerHTML = artMarkup(kind, step, v);
  const svg = element.querySelector("svg");
  const ns = "http://www.w3.org/2000/svg";
  const cue = document.createElementNS(ns, "g");
  cue.setAttribute("class", "touch-cue");
  cue.setAttribute("aria-hidden", "true");
  cue.innerHTML =
    '<circle class="cue-halo" r="22"/><circle class="cue-dot" r="4"/><path class="cue-cross" d="M-8 0H8M0-8V8"/>';
  svg.append(cue);
  const placeCue = (values) => {
    svg.setAttribute(
      "viewBox",
      kind === "knight" && step === 3 && innerHeight > innerWidth
        ? "110 0 360 460"
        : kind === "cart" && step === 3
          ? "50 30 535 320"
        : "0 0 600 460",
    );
    const scene = sceneAt(kind, step, values),
      p = K.iso(touchPoint(kind, step, values), scene.P),
      scale = svg.getScreenCTM()?.a || 1;
    cue.setAttribute(
      "transform",
      `translate(${p[0]} ${p[1]}) scale(${1 / scale})`,
    );
  };
  placeCue(v);
  const resize = new ResizeObserver(() => placeCue(v));
  resize.observe(svg);
  const container = element.querySelector(".drawing-parts");
  const nodes = new Map(
    [...container.children].map((el) => [el.dataset.part, el]),
  );
  const records = new Map();
  let previousOrder = "";
  const update = (values) => {
    v = values;
    const scene = sceneAt(
      kind,
      step,
      kind === "cart" && step === 3 ? { ...values, distance: 0 } : values,
    );
    if (kind === "cart" && step === 3)
      container.setAttribute(
        "transform",
        K.translateAlong(scene.P, [values.distance || 0, 0, 0]),
      );
    for (const item of scene.items) {
      const el = nodes.get(item.id);
      if (!el) continue;
      const prev = records.get(item.id);
      if (item.type === "solid") {
        for (const [field, selector] of [
          ["fill", ".iso-fill"],
          ["sideOutline", ".iso-side-edge"],
          ["top", ".iso-top"],
          ["crease", ".iso-crease"],
          ["bevel", ".iso-bevel"],
          ["outline", ".iso-edge"],
        ]) {
          if (!prev || prev.paths[field] !== item.paths[field])
            el.querySelector(selector)?.setAttribute(
              "d",
              item.paths[field] || "",
            );
        }
        item.paths.shades.forEach((d, i) => {
          if (!prev || prev.paths.shades[i] !== d)
            el.querySelector(`[data-shade="${i}"]`)?.setAttribute("d", d);
        });
      } else if (item.type === "dot") {
        if (!prev || prev.q[0] !== item.q[0])
          el.querySelector("circle")?.setAttribute("cx", item.q[0]);
        if (!prev || prev.q[1] !== item.q[1])
          el.querySelector("circle")?.setAttribute("cy", item.q[1]);
      } else if (!prev || prev.d !== item.d) {
        el.querySelector("path")?.setAttribute("d", item.d);
      }
      if (item.type === "custom" && (!prev || prev.fill !== item.fill))
        el.querySelector("path")?.setAttribute("fill", item.fill);
      records.set(item.id, item);
    }
    const order = scene.items.map((i) => i.id).join(",");
    if (order !== previousOrder) {
      const f = document.createDocumentFragment();
      for (const item of scene.items)
        if (nodes.has(item.id)) f.append(nodes.get(item.id));
      container.append(f);
      previousOrder = order;
    }
    const p = K.iso(touchPoint(kind, step, values), scene.P),
      scale = svg.getScreenCTM()?.a || 1;
    cue.setAttribute(
      "transform",
      `translate(${p[0]} ${p[1]}) scale(${1 / scale})`,
    );
  };
  update.destroy = () => resize.disconnect();
  update.angleAt = (clientX, clientY) => {
    const P = sceneAt(kind, step, v).P,
      c = K.cameraOf(P);
    const q = new DOMPoint(clientX, clientY).matrixTransform(
      svg.getScreenCTM().inverse(),
    );
    const horizontal = kind === "screw" || (kind === "cart" && step > 0);
    const center =
      kind === "screw"
        ? [0, 0, 42]
        : kind === "cart"
          ? step === 0
            ? [0, 0, 47]
            : step === 1
              ? [-34, 0, GEAR_PLANE]
              : step === 2
                ? [-34, 0, 76]
                : [-88 + (v.distance || 0), -12, 73]
          : [0, 22, 130];
    const p = K.iso(center, P),
      dx = q.x - p[0],
      dy = q.y - p[1];
    if (horizontal) {
      const u = dx / c.k,
        w = dy / (c.k * c.sinE);
      return Math.atan2(-u * c.cosA + w * c.sinA, u * c.sinA + w * c.cosA);
    }
    const x = dx / (c.k * c.sinA),
      z = (c.k * x * c.cosA * c.sinE - dy) / (c.k * c.cosE);
    return Math.atan2(z, -x);
  };
  return update;
}
