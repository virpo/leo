import { chromium, webkit } from "playwright";
import assert from "node:assert/strict";
const base = process.env.LEO_TEST_URL || "http://localhost:5174";
for (const engine of [chromium, webkit]) {
  const browser = await engine.launch(engine === chromium ? { channel: "chrome" } : {});
  const page = await browser.newPage({ viewport: { width: 1180, height: 740 }, hasTouch: true });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base);
  await page.evaluate(() => localStorage.setItem("leo-muted", "true"));
  const bladeX = async () => {
    const b = await page.locator('[data-part="single-paddle-wet"]').boundingBox();
    return b.x + b.width / 2;
  };
  const settled = () => page.waitForFunction(() => document.querySelector(".model-stage").dataset.settled === "true");
  const swipe = async (dx) => {
    const b = await page.locator(".model-stage").boundingBox();
    const x = b.x + b.width * 0.55, y = b.y + b.height * 0.45;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + dx, y, { steps: 12 });
    await page.mouse.up();
    await settled();
  };
  await page.goto(`${base}/#sk/boat/1`);
  const initial = await bladeX();
  if (engine === chromium) await page.screenshot({ path: "artifacts/release-paddle-start.png" });
  await swipe(-30);
  const left = await bladeX();
  if (engine === chromium) await page.screenshot({ path: "artifacts/release-paddle-left.png" });
  assert.ok(left < initial - 20, "left swipe moves the paddle left");
  await swipe(22);
  const right = await bladeX();
  if (engine === chromium) await page.screenshot({ path: "artifacts/release-paddle-right.png" });
  assert.ok(right > left + 15, "right swipe moves the paddle right");
  await page.locator(".model-stage").focus();
  await page.keyboard.press("ArrowLeft");
  await settled();
  assert.ok(await bladeX() < right - 5, "left arrow moves the paddle left");
  const keyedLeft = await bladeX();
  await page.keyboard.press("ArrowRight");
  await settled();
  assert.ok(await bladeX() > keyedLeft + 5, "right arrow moves the paddle right");
  await page.locator(".action-button").tap();
  await settled();
  const stroke = await bladeX();
  await page.locator(".action-button").tap();
  await settled();
  assert.ok(Math.abs(await bladeX() - stroke) > 35, "repeated taps make opposite strokes without a hidden reset");

  await page.goto(`${base}/#sk/boat/3`);
  await page.locator(".action-button").tap();
  await page.waitForTimeout(300);
  const before = Number(await page.locator(".model-stage").getAttribute("data-angle"));
  await page.locator(".action-button").tap();
  await page.waitForTimeout(40);
  assert.ok(Number(await page.locator(".model-stage").getAttribute("data-angle")) >= before, "rapid tap cannot teleport the moving boat back");
  await settled();
  assert.equal(await page.locator(".action-button span").textContent(), "Ešte raz");
  await page.locator(".action-button").tap();
  await page.waitForTimeout(200);
  assert.ok(Number(await page.locator(".model-stage").getAttribute("data-angle")) < 6, "explicit Again restarts the journey");

  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const viewport of [{ width: 820, height: 1060 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto(`${base}/#en/boat/4`);
    await page.locator(".action-button").tap();
    await page.waitForFunction(() => Number(document.querySelector(".model-stage").dataset.angle) > 6);
    await page.locator('[data-direction="-1"]').tap();
    await page.waitForFunction(() => Number(document.querySelector(".model-stage").dataset.angle) < -6);
    await page.goto(`${base}/#en/parachute/4`);
    for (let i = 0; i < 3; i++) await page.locator('[data-size="-1"]').tap();
    assert.equal(await page.locator('[data-size="-1"]').isDisabled(), true);
    for (let i = 0; i < 4; i++) await page.locator('[data-size="1"]').tap();
    assert.equal(await page.locator('[data-size="1"]').isDisabled(), true);
    await page.locator(".action-button").tap();
    await settled();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth && document.documentElement.scrollHeight === innerHeight), true);
  }
  await page.evaluate(() => localStorage.setItem("leo-lang", "unknown"));
  for (const route of ["boat/1.5", "sk/boat/Infinity", "sk/boat/-5"]) {
    await page.goto(`${base}/#${route}`);
    assert.equal(await page.locator("html").getAttribute("lang"), "sk");
    assert.equal(await page.locator('[data-step="0"]').getAttribute("aria-current"), "step");
  }
  await page.goto(`${base}/#en/boat/999`);
  assert.equal(await page.locator('[data-step="3"]').getAttribute("aria-current"), "step");
  if (engine === chromium) {
    const manifest = await (await page.request.get(`${base}/audio/manifest.json`)).json();
    assert.equal(manifest.length, 100);
    const queue = [...manifest];
    await Promise.all(Array.from({ length: 6 }, async () => {
      while (queue.length) {
        const clip = queue.pop();
        const response = await page.request.get(`${base}/audio/${clip.lang}/${clip.id}.mp3`);
        assert.equal(response.status(), 200, `${clip.lang}/${clip.id} is published`);
        assert.match(response.headers()["content-type"], /audio\/(mpeg|mp3)/);
        const bytes = await response.body();
        assert.ok(bytes.length > 1000);
        assert.ok(bytes.subarray(0, 3).toString() === "ID3" || bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0, "real MP3 bytes, not an HTML fallback");
      }
    }));
  }
  assert.deepEqual(errors, []);
  await browser.close();
  console.log(`${engine.name()}: paddle directions, repeated strokes, rapid taps, replay, phone/portrait targets, malformed routes and audio assets passed`);
}
