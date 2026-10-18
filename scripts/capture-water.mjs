import { chromium } from "playwright";
import sharp from "sharp";
const base = process.env.LEO_TEST_URL || "http://localhost:5174";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1180, height: 740 }, hasTouch: true });
await page.goto(base);
await page.evaluate(() => localStorage.setItem("leo-muted", "true"));
const shot = async (name) => page.screenshot({ path: `artifacts/water-${name}.png` });
for (const step of [1, 2, 3, 4]) {
  await page.goto(`${base}/#sk/boat/${step}`);
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".action-button").tap();
  await page.waitForFunction(() => Number(document.querySelector(".model-stage").dataset.wake) > 0.65);
  await page.waitForTimeout(160);
  await shot(`boat${step}-wake`);
  if (step === 4) {
    await page.waitForFunction(() => document.querySelector(".model-stage").dataset.settled === "true");
    await page.locator('[data-direction="-1"]').tap();
    await page.waitForTimeout(300);
    await shot("boat4-reverse");
  }
}
await page.goto(`${base}/#sk/parachute/4`);
await shot("canopy-controls");
await page.locator('[data-size="-1"]').tap();
await page.locator('[data-size="-1"]').tap();
await page.locator(".action-button").tap();
await page.waitForTimeout(700);
await shot("canopy-comparison");
await page.goto(`${base}/#sk/parachute/1`);
await page.locator(".action-button").tap();
await page.waitForFunction(() => Number(document.querySelector(".model-stage").dataset.bounce) > 6);
await shot("basket-bounce");
await page.goto(`${base}/#sk/lock/2`);
await page.locator(".action-button").tap();
await page.waitForFunction(() => Number(document.querySelector(".model-stage").dataset.waterLevel) > 49);
await shot("lock2-half");
await page.waitForFunction(() => document.querySelector(".model-stage").dataset.settled === "true");
await shot("lock2-filled");
await page.goto(`${base}/#sk/lock/4`);
for (let phase = 0; phase < 4; phase++) {
  await page.locator(".action-button").tap();
  await page.waitForFunction((p) => document.querySelector(".model-stage").dataset.phase === String(p), phase + 1);
  await shot(`lock4-phase${phase + 1}`);
}
for (const [name, size] of [["portrait", { width: 820, height: 1060 }], ["phone", { width: 390, height: 844 }]]) {
  await page.setViewportSize(size);
  for (const route of ["parachute/4", "boat/4"]) {
    await page.goto(`${base}/#en/${route}`);
    await shot(`${name}-${route.replace("/", "-")}`);
    if (route === "boat/4") {
      await page.locator(".action-button").tap();
      await page.waitForFunction(() => Number(document.querySelector(".model-stage").dataset.wake) > 0.7);
      await page.waitForTimeout(160);
      await shot(`${name}-boat-wake`);
    }
  }
}
await browser.close();
const detailBrowser = await chromium.launch({ channel: "chrome" });
const detail = await detailBrowser.newPage({ viewport: { width: 1180, height: 740 }, deviceScaleFactor: 4 });
await detail.goto(base);
await detail.evaluate(() => localStorage.setItem("leo-muted", "true"));
for (const [name, route, selector] of [["blade", "boat/1", '[data-part="single-paddle-wet"]'], ["gate", "lock/3", '[data-part="upper-leaf1-wet"]']]) {
  await detail.goto(`${base}/#sk/${route}`);
  const b = await detail.locator(selector).boundingBox();
  await detail.screenshot({ path: `artifacts/water-detail-${name}-4x.png`, clip: { x: Math.floor(b.x - 16), y: Math.floor(b.y - 16), width: Math.ceil(b.width + 32), height: Math.ceil(b.height + 32) } });
}
await detailBrowser.close();
const names = ["boat1-wake", "boat2-wake", "boat3-wake", "boat4-reverse", "canopy-controls", "canopy-comparison", "lock2-half", "lock2-filled", "lock4-phase1", "lock4-phase2", "lock4-phase3", "lock4-phase4"];
const tiles = await Promise.all(names.map(async (name, i) => ({ input: await sharp(`artifacts/water-${name}.png`).resize(590, 370).toBuffer(), left: i % 3 * 590, top: Math.floor(i / 3) * 370 })));
await sharp({ create: { width: 1770, height: 1480, channels: 3, background: "#eee1c2" } }).composite(tiles).png().toFile("artifacts/water-contact-sheet.png");
console.log("Captured water motion, comparison controls, bounce and gate waterlines.");
