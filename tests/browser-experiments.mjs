import { chromium, webkit } from "playwright";
import assert from "node:assert/strict";
const base = process.env.LEO_TEST_URL || "http://localhost:5174";
for (const engine of [chromium, webkit]) {
  const browser = await engine.launch(engine === chromium ? { channel: "chrome" } : {});
  const page = await browser.newPage({ viewport: { width: 1180, height: 740 }, hasTouch: true });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${base}/#sk`);
  assert.equal(await page.locator(".machine-choice").count(), 6);
  await page.locator('[data-machine="parachute"]').tap();
  await page.waitForFunction(() => document.querySelector("#leo-voice").currentTime > 0.05);
  assert.ok((await page.locator("#leo-voice").getAttribute("src")).includes("/sk/parachute-1.mp3"));
  await page.locator(".model-stage").tap();
  await page.waitForTimeout(350);
  assert.equal(await page.locator("#leo-voice").getAttribute("data-clip"), "parachute-1", "new lessons keep touch-first speech sequencing");
  await page.locator('[data-lang="en"]').tap();
  await page.waitForFunction(() => document.querySelector("#leo-voice").currentTime > 0.05);
  assert.ok((await page.locator("#leo-voice").getAttribute("src")).includes("/en/parachute-1.mp3"));
  await page.locator(".sound-button").tap();

  await page.goto(`${base}/#en/parachute/3`);
  await page.locator(".action-button").tap();
  await page.waitForTimeout(650);
  const drops = await page.evaluate(() => {
    const a = document.querySelector('[data-part="small-floor"]').getBoundingClientRect();
    const b = document.querySelector('[data-part="big-floor"]').getBoundingClientRect();
    return { small: a.top, big: b.top };
  });
  assert.ok(drops.small > drops.big, "small canopy has descended farther at the same moment");
  await page.waitForFunction(() => document.querySelector(".model-stage").dataset.settled === "true");
  assert.equal(await page.locator(".model-stage").getAttribute("data-fall"), "1");

  await page.goto(`${base}/#sk/parachute/4`);
  const size = Number(await page.locator(".model-stage").getAttribute("data-canopy"));
  const reference = await page.locator('[data-part="small-cloth2"]').innerHTML();
  await page.locator('[data-size="-1"]').tap();
  await page.locator('[data-size="-1"]').tap();
  assert.ok(Number(await page.locator(".model-stage").getAttribute("data-canopy")) < size - 0.2, "large minus button changes canopy size");
  assert.equal(await page.locator('[data-part="small-cloth2"]').innerHTML(), reference, "medium comparison canopy never changes");
  await page.locator('[data-size="1"]').tap();
  assert.equal(Number(await page.locator(".model-stage").getAttribute("data-canopy")), 0.6);
  await page.locator(".action-button").tap();
  assert.equal(await page.locator('[data-size="1"]').isDisabled(), true, "fair-test size is locked during a drop");
  await page.waitForFunction(() => document.querySelector(".model-stage").dataset.settled === "true");
  assert.equal(await page.locator('[data-size="1"]').isDisabled(), false);

  await page.goto(`${base}/#sk/parachute/1`);
  await page.locator(".action-button").tap();
  await page.waitForFunction(() => document.querySelector(".model-stage").dataset.fall === "1" && Number(document.querySelector(".model-stage").dataset.bounce) > 1);
  assert.equal(await page.locator(".model-stage").getAttribute("data-settled"), "false", "landing bounce finishes before the discovery narration");
  await page.waitForFunction(() => document.querySelector(".model-stage").dataset.settled === "true");
  assert.equal(await page.locator(".model-stage").getAttribute("data-bounce"), "0");

  for (const step of [1, 2]) {
    await page.goto(`${base}/#sk/boat/${step}`);
    const before = await page.locator('[data-part="wake-0-3"] path').getAttribute("d");
    await page.locator(".action-button").tap();
    await page.waitForFunction(() => Number(document.querySelector(".model-stage").dataset.wake) > 0.4);
    assert.notEqual(await page.locator('[data-part="wake-0-3"] path').getAttribute("d"), before, "stroke and wheel produce a moving, visible wake");
    await page.waitForFunction(() => document.querySelector(".model-stage").dataset.settled === "true");
    assert.equal(await page.locator(".model-stage").getAttribute("data-wake"), "0");
  }

  await page.goto(`${base}/#sk/boat/4`);
  await page.locator('[data-direction="-1"]').tap();
  await page.waitForFunction(() => document.querySelector(".model-stage").dataset.waterDirection === "1");
  await page.waitForFunction(() => document.querySelector(".model-stage").dataset.settled === "true");
  assert.ok(Number(await page.locator(".model-stage").getAttribute("data-angle")) < -6);
  await page.locator(".action-button").tap();
  await page.waitForFunction(() => document.querySelector(".model-stage").dataset.waterDirection === "-1");
  await page.waitForFunction(() => document.querySelector(".model-stage").dataset.settled === "true");
  assert.ok(Number(await page.locator(".model-stage").getAttribute("data-angle")) > 6);
  const parked = await page.locator(".drawing-parts").innerHTML();
  await page.waitForTimeout(600);
  assert.equal(await page.locator(".drawing-parts").innerHTML(), parked);

  await page.goto(`${base}/#sk/lock/4`);
  for (let phase = 0; phase < 4; phase++) {
    assert.equal(await page.locator(".model-stage").getAttribute("data-phase"), String(phase));
    await page.locator(".action-button").tap();
    await page.locator(".action-button").tap();
    assert.equal(await page.locator(".model-stage").getAttribute("data-phase"), String(phase), "rapid tapping cannot skip a lock operation");
    await page.waitForFunction((next) => document.querySelector(".model-stage").dataset.phase === String(next), phase + 1);
    if (phase === 0) assert.equal(await page.locator(".model-stage").getAttribute("data-water-level"), "24");
    if (phase >= 1) assert.equal(await page.locator(".model-stage").getAttribute("data-water-level"), "84");
  }
  assert.equal(await page.locator(".action-button span").textContent(), "Ešte raz");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${base}/#en/lock/4`);
  for (let phase = 0; phase < 4; phase++) {
    await page.locator(".action-button").tap();
    await page.waitForFunction((next) => document.querySelector(".model-stage").dataset.phase === String(next), phase + 1);
  }
  assert.equal(await page.locator(".action-button span").textContent(), "Again");
  assert.equal(await page.evaluate(() => scrollY), 0);
  assert.deepEqual(errors, []);
  await browser.close();
  console.log(`${engine.name()}: native audio, landing bounce, +/− fair comparison, visible wakes, explicit reverse propulsion and four-stage lock passed`);
}
