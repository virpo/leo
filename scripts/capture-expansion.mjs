import { chromium } from "playwright";
import sharp from "sharp";
const base = process.env.LEO_TEST_URL || "http://localhost:5174";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1180, height: 740 }, hasTouch: true });
await page.goto(`${base}/#sk`);
await page.evaluate(() => { localStorage.setItem("leo-muted", "true"); });
const shots = [];
for (const [name, route] of [["home", "sk"], ["parachute", "sk/parachute/4"], ["boat", "sk/boat/3"], ["lock", "sk/lock/4"], ["cord", "sk/knight/2"]]) {
  await page.goto(`${base}/#${route}`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `artifacts/six-${name}-final.png` });
}
for (const [row, kind] of ["parachute", "boat", "lock"].entries())
  for (let step = 1; step <= 4; step++) {
    await page.goto(`${base}/#sk/${kind}/${step}`);
    const image = await sharp(await page.screenshot()).resize(472, 296).toBuffer();
    shots.push({ input: image, left: (step - 1) * 472, top: row * 296 });
  }
await sharp({ create: { width: 1888, height: 888, channels: 3, background: "#eee1c2" } }).composite(shots).png().toFile("artifacts/six-new-lessons.png");
await page.goto(`${base}/#sk/parachute/3`);
await page.locator(".action-button").tap();
await page.waitForTimeout(650);
await page.screenshot({ path: "artifacts/six-fair-drop.png" });
await page.goto(`${base}/#sk/lock/4`);
for (let phase = 0; phase < 4; phase++) {
  await page.locator(".action-button").tap();
  await page.waitForFunction((next) => document.querySelector(".model-stage").dataset.phase === String(next), phase + 1);
  await page.screenshot({ path: `artifacts/six-lock-phase${phase + 1}.png` });
}
await page.goto(`${base}/#sk/knight/2`);
await page.locator(".action-button").tap();
await page.waitForTimeout(800);
await page.screenshot({ path: "artifacts/six-cord-pulled.png" });
for (const [name, size] of [["portrait", { width: 820, height: 1060 }], ["compact", { width: 1024, height: 672 }], ["phone", { width: 390, height: 844 }]]) {
  await page.setViewportSize(size);
  await page.goto(`${base}/#sk`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `artifacts/six-home-${name}.png` });
  if (name !== "phone") {
    await page.goto(`${base}/#en/lock/4`);
    await page.screenshot({ path: `artifacts/six-lock-${name}.png` });
  }
}
await browser.close();
const detailBrowser = await chromium.launch({ channel: "chrome" });
const detail = await detailBrowser.newPage({ viewport: { width: 1180, height: 740 }, deviceScaleFactor: 4 });
for (const [name, route, selector] of [
  ["cord", "sk/knight/2", '[data-part="cord"]'],
  ["canopy", "sk/parachute/3", '[data-part="big-rope2"]'],
  ["paddle", "sk/boat/3", '[data-part="wheel37hub"]'],
  ["gate", "sk/lock/4", '[data-part="upper-leaf1"]'],
]) {
  await detail.goto(`${base}/#${route}`);
  const b = await detail.locator(selector).boundingBox();
  await detail.screenshot({ path: `artifacts/six-detail-${name}-4x.png`, clip: { x: Math.floor(b.x - 18), y: Math.floor(b.y - 18), width: Math.ceil(b.width + 36), height: Math.ceil(b.height + 36) } });
}
await detailBrowser.close();
console.log("Captured six-choice layouts, all new lessons, experiment states and robot cord.");
