import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TAU,
  GEAR_PLANE,
  gearAngles,
  gearProfile,
  cartAt,
  knightAt,
  follow,
  screwAttemptAt,
  springAt,
  MACHINES,
} from "../src/model.js";
import { CONTENT, narrationManifest } from "../src/content.js";
import { VOICE_SETTINGS } from "../src/voices.js";
import { sceneAt } from "../src/art.js";
import { iso } from "../src/vendor/iso-kit.mjs";
import { stat, readFile } from "node:fs/promises";

test("failed lift has two bounded efforts and returns completely to ground", () => {
  assert.equal(screwAttemptAt(0), 0);
  assert.equal(screwAttemptAt(1), 0);
  assert.equal(screwAttemptAt(5), 0);
  assert.equal(screwAttemptAt(0.45), 0);
  assert.equal(screwAttemptAt(0.32), 2.5);
  assert.equal(screwAttemptAt(0.76), 6.5);
  for (let i = 0; i <= 200; i++) assert.ok(screwAttemptAt(i / 200) >= 0 && screwAttemptAt(i / 200) <= 6.5);
});
test("spring tightens around a fixed outer anchor, then loses tension with energy", () => {
  assert.ok(springAt(1).turns > springAt(0).turns);
  assert.ok(springAt(1).exponent > springAt(0).exponent);
  const anchor = (charge) => sceneAt("cart", 2, { charge }).items.find((i) => i.id === "springspring-anchor").at;
  const terminal = (charge) => sceneAt("cart", 2, { charge }).items.find((i) => i.id === "springterminal").d;
  assert.deepEqual(anchor(0), anchor(1));
  assert.equal(terminal(0), terminal(1));
  const coils = (energy) => sceneAt("cart", 3, { energy }).items.filter((i) => /spring[AB]coil/.test(i.id));
  assert.ok(coils(1).every((i) => i.tension === 1));
  assert.ok(coils(0).every((i) => i.tension === 0));
});

test("both languages have the same twenty-four lessons and bundled narration", async () => {
  for (const lang of ["sk", "en"])
    for (const { id } of MACHINES) {
      assert.equal(CONTENT[lang].machines[id].steps.length, 4);
      for (const step of CONTENT[lang].machines[id].steps)
        for (const key of ["title", "action", "voice", "result"])
          assert.ok(step[key].length > 0);
    }
  const clips = narrationManifest();
  assert.equal(clips.length, 100);
  assert.deepEqual(
    JSON.parse(
      await readFile(
        new URL("../public/audio/manifest.json", import.meta.url),
        "utf8",
      ),
    ),
    clips,
    "recordings must match current teaching scripts",
  );
  for (const clip of clips)
    assert.ok(
      (
        await stat(
          new URL(
            `../public/audio/${clip.lang}/${clip.id}.mp3`,
            import.meta.url,
          ),
        )
      ).size > 1000,
      `${clip.lang}/${clip.id}`,
    );
});
test("Slovak recordings must use the native narrator, with versioned assets", async () => {
  assert.match(VOICE_SETTINGS.sk.voice, /^sk-SK-/);
  assert.ok(VOICE_SETTINGS.sk.revision.includes("lukas"));
  const metadata = JSON.parse(
    await readFile(
      new URL("../public/audio/voices.json", import.meta.url),
      "utf8",
    ),
  );
  assert.deepEqual(metadata, VOICE_SETTINGS);
});
test("gear teeth mesh without collision across 360 degrees", () => {
  function inside(p, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++)
      if (
        poly[i][1] > p[1] !== poly[j][1] > p[1] &&
        p[0] <
          ((poly[j][0] - poly[i][0]) * (p[1] - poly[i][1])) /
            (poly[j][1] - poly[i][1]) +
            poly[i][0]
      )
        inside = !inside;
    return inside;
  }
  for (let i = 0; i < 144; i++) {
    const g = gearAngles((TAU * i) / 144),
      a = gearProfile(12, 18, g.driver),
      b = gearProfile(24, 36, g.follower).map(([x, y]) => [x + 54, y]);
    assert.ok(
      a.every((p) => !inside(p, b)),
      `small tooth collision at frame ${i}`,
    );
    assert.ok(
      b.every((p) => !inside(p, a)),
      `large tooth collision at frame ${i}`,
    );
  }
});
test("gear contours have no zero-length edges and hide side edges under the top", () => {
  for (const [teeth, radius] of [[12, 18], [24, 36]]) {
    const profile = gearProfile(teeth, radius);
    for (let i = 0; i < profile.length; i++) {
      const a = profile[i], b = profile[(i + 1) % profile.length];
      assert.ok(Math.hypot(a[0] - b[0], a[1] - b[1]) > 1e-6);
    }
  }
  for (let i = 0; i < 24; i++) {
    const scene = sceneAt("cart", 1, { angle: i * TAU / 24 });
    for (const id of ["driver", "follower"]) {
      const gear = scene.items.find((item) => item.id === id);
      assert.ok(gear.paths.sideOutline);
      assert.equal(gear.paths.outline, gear.paths.top);
      assert.equal(gear.paths.crease, "");
      assert.doesNotMatch(JSON.stringify(gear.paths), /NaN|Infinity/);
    }
  }
});
test("gear faces share a height and crank changes its real geometry", () => {
  for (const step of [1, 2]) {
    const a = sceneAt("cart", step, { angle: 0 }),
      b = sceneAt("cart", step, { angle: 0.75 });
    assert.equal(a.items.find((i) => i.id === "driver").at[2], GEAR_PLANE + 2);
    assert.equal(
      a.items.find((i) => i.id === "follower").at[2],
      GEAR_PLANE + 2,
    );
    if (step === 2)
      assert.notEqual(
        a.items.find((i) => i.id === "winding").paths.fill,
        b.items.find((i) => i.id === "winding").paths.fill,
      );
  }
});
test("home preview camera cannot contaminate lesson geometry cache", () => {
  const preview = sceneAt("cart", 3, { preview: true }),
    lesson = sceneAt("cart", 3);
  assert.notEqual(
    preview.items.find((i) => i.id === "rail22").paths.fill,
    lesson.items.find((i) => i.id === "rail22").paths.fill,
  );
  assert.equal(
    sceneAt("cart", 3).items.find((i) => i.id === "rail22").paths.fill,
    lesson.items.find((i) => i.id === "rail22").paths.fill,
  );
});
test("rotating crank stays below the title throughout its turn", () => {
  const P = sceneAt("cart", 2).P;
  for (let i = 0; i < 144; i++) {
    const angle = (i * TAU) / 144,
      p = iso([-34 + 26 * Math.cos(angle), 26 * Math.sin(angle), 87], P);
    assert.ok(p[1] >= 30, "crank must remain within padded model view");
  }
});
test("gear stages share a camera and the knight stands above its base", () => {
  assert.deepEqual(sceneAt("cart", 1).P, sceneAt("cart", 2).P);
  const items = sceneAt("knight", 3).items;
  const base = items.findIndex((item) => item.id === "base");
  for (const side of [-1, 1]) {
    assert.ok(items.findIndex((item) => item.id === `shoe${side}`) > base);
    assert.ok(items.findIndex((item) => item.id === `foot${side === -1 ? 0 : 1}`) < base);
  }
});
test("energy empties, wheel distance matches rotation, joints remain attached", () => {
  assert.equal(cartAt(0).energy, 1);
  assert.equal(cartAt(1).energy, 0);
  assert.equal(cartAt(1).distance, 110);
  for (let i = 0; i <= 20; i++) {
    const p = cartAt(i / 20),
      k = knightAt(i / 20);
    assert.equal(p.wheelAngle, p.distance / 25);
    assert.ok(
      Math.abs(
        Math.hypot(k.hand[0] - k.elbow[0], k.hand[2] - k.elbow[2]) - 47,
      ) < 1e-9,
    );
  }
  assert.ok(follow(0, 1, 0.1) > 0 && follow(0, 1, 0.1) < 1);
});
