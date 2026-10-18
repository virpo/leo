import { test } from "node:test";
import assert from "node:assert/strict";
import { parachuteAt, boatAt, lockAt, paddleDragAngle, CANOPY_SIZES, REFERENCE_CANOPY } from "../src/experiments.js";
import { sceneAt } from "../src/art.js";
import { TAU } from "../src/model.js";
import * as K from "../src/vendor/iso-kit.mjs";

test("equal parachute loads fall more slowly as canopy area increases", () => {
  for (const seconds of [0.2, 0.5, 0.8]) {
    assert.ok(parachuteAt(seconds, 0).fall > parachuteAt(seconds, 0.35).fall);
    assert.ok(parachuteAt(seconds, 0.35).fall > parachuteAt(seconds, 0.82).fall);
  }
  assert.equal(parachuteAt(0, 0.82).fall, 0);
  for (const width of [0, 0.32, 0.42, 0.82, 0.9]) {
    assert.equal(parachuteAt(10, width).fall, 1);
    let previous = 0;
    for (let i = 0; i < 100; i++) {
      const value = parachuteAt(i / 20, width);
      assert.ok(value.fall >= previous && Number.isFinite(value.velocity));
      previous = value.fall;
    }
  }
});
test("paddle wheel direction and travel reverse together", () => {
  assert.equal(boatAt(TAU, 1).distance, 0);
  assert.equal(boatAt(TAU, 2).distance, 65);
  assert.equal(boatAt(-TAU, 3).distance, -65);
  assert.equal(boatAt(TAU, 3).distance, 65);
});
test("paddle drag inverts the blade position, preserving pointer direction and bounds", () => {
  for (const angle of [0, 0.7, Math.PI / 2, 2.4, Math.PI]) {
    const from = 35 * Math.cos(angle);
    for (const dx of [-100, -14, 0, 14, 100]) {
      const next = paddleDragAngle(angle, dx);
      assert.ok(next >= 0 && next <= Math.PI);
      assert.ok(Math.abs(35 * Math.cos(next) - Math.max(-35, Math.min(35, from + dx))) < 1e-8);
    }
  }
});
test("basket rebounds only after contact, dissipates and stays above the tray", () => {
  for (const width of [0, ...CANOPY_SIZES]) {
    let bounced = false;
    for (let i = 0; i < 1200; i++) {
      const s = parachuteAt(i / 100, width);
      assert.ok(s.bounce >= 0 && s.bounce <= 8);
      if (!s.landed) assert.equal(s.bounce, 0);
      if (s.bounce > 1) bounced = true;
      if (s.settled) assert.equal(s.bounce, 0);
    }
    assert.ok(bounced);
    assert.equal(parachuteAt(12, width).settled, true);
  }
});
test("adjustable parachute always has a fixed medium companion", () => {
  const baseline = sceneAt("parachute", 3, { canopyWidth: CANOPY_SIZES[0] });
  const reference = baseline.items.filter((i) => i.id.startsWith("small-"));
  assert.equal(REFERENCE_CANOPY, 0.6);
  for (const width of CANOPY_SIZES) {
    const scene = sceneAt("parachute", 3, { canopyWidth: width });
    assert.deepEqual(scene.items.filter((i) => i.id.startsWith("small-")), reference);
  }
});
test("single paddle meets the water broadside and wakes remain on the water plane", () => {
  const rest = sceneAt("boat", 0);
  const blade = rest.items.find((i) => i.id === "single-paddle-wet");
  assert.equal(blade.style.underwater, true);
  // Its actual prism is thin on the travel axis, wide across the water.
  assert.equal(blade.at[0], 35);
  assert.equal(blade.at[1], -24);
  assert.deepEqual(blade.paths, K.slabOf({ x: 32.5, y: -40, w: 5, d: 32, r: 0.8 }, 10, 18, rest.P, 3, 0.45));
  const active = sceneAt("boat", 0, { angle: 1.2, wake: 1, waterTravel: 24, waterDirection: -1 });
  const waves = active.items.filter((i) => i.wake);
  assert.ok(waves.length >= 10);
  assert.ok(waves.every((i) => i.at[2] >= 28 && i.at[2] < 29));
  assert.ok(waves.some((i) => i.fill !== rest.items.find((r) => r.id === i.id).fill));
});
test("gate leaves are split at the waterline, including every full-lock phase", () => {
  for (const step of [1, 2, 3]) for (const phase of [0, 1, 2, 3]) for (const progress of [0, 0.5, 1]) {
    const scene = sceneAt("lock", step, { progress, phase });
    const level = lockAt(step, progress, phase).level;
    const wet = scene.items.find((i) => i.id === "upper-leaf1-wet");
    const dry = scene.items.find((i) => i.id === "upper-leaf1");
    assert.equal(wet.style.underwater, true);
    assert.ok(wet.at[2] < level);
    assert.ok(dry.at[2] > level);
    assert.equal(wet.at[2] * 2 - 7, level);
    assert.equal(dry.at[2] * 2 - 93, level);
  }
});
test("connected equal-area tanks conserve water and approach equal levels", () => {
  for (let i = 0; i <= 100; i++) {
    const water = lockAt(0, i / 100);
    assert.equal(water.low + water.high, 108);
    assert.ok(water.low <= water.high);
  }
  assert.equal(lockAt(0, 1).low, lockAt(0, 1).high);
});
test("full lock never opens the upper gate before equalization, or both gates together", () => {
  for (let phase = 0; phase <= 4; phase++)
    for (let i = 0; i <= 100; i++) {
      const s = lockAt(3, i / 100, phase);
      assert.ok(s.lowGate === 0 || s.highGate === 0);
      if (s.highGate > 0) assert.equal(s.level, s.high);
      if (s.lowGate > 0) assert.equal(s.level, s.low);
      if (s.boatX > 0) assert.equal(s.highGate, 1);
    }
});
test("new drawings have unique parts and finite paths in resting and active states", () => {
  for (const kind of ["parachute", "boat", "lock"])
    for (let step = 0; step < 4; step++)
      for (const t of [0, 0.33, 0.75, 1]) {
        const s = sceneAt(kind, step, { angle: t * TAU, fall: t, fallSmall: t, canopyWidth: 0.4 + t * 0.4, progress: t, phase: 1 });
        assert.equal(new Set(s.items.map((item) => item.id)).size, s.items.length);
        assert.ok(s.items.length >= 30);
        assert.doesNotMatch(JSON.stringify(s.items), /NaN|Infinity/);
      }
});
test("robot pull cord is highlighted and visibly longer without detaching", () => {
  for (const lift of [0, 0.5, 0.94]) {
    const scene = sceneAt("knight", 1, { lift });
    const cord = scene.items.find((item) => item.id === "cord");
    assert.equal(cord.cord, true);
    assert.ok(scene.items.some((item) => item.id === "grip-cord-eyelet"));
  }
});
test("tank floor seams precede their rims and floating boats follow water", () => {
  for (const kind of ["boat", "parachute"]) {
    const s = sceneAt(kind, 3);
    const firstRim = s.items.findIndex((item) => item.id.startsWith("tray-"));
    assert.ok(s.items.filter((item) => item.id.startsWith("floor-seam")).every((item) => s.items.indexOf(item) < firstRim));
  }
  const s = sceneAt("lock", 3, { progress: 1, phase: 1 });
  const hull = s.items.findIndex((item) => item.id === "lock-boat-floor");
  assert.ok(s.items.filter((item) => item.water).every((item) => s.items.indexOf(item) < hull));
});
