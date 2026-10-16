import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const pass = process.argv[2] || "pass1";
const base = process.env.LEO_TEST_URL || "http://localhost:5174";
await mkdir("artifacts", { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1180, height: 740 }, deviceScaleFactor: 2 });
await page.addInitScript(() => localStorage.setItem("leo-muted", "true"));
for (const [name, route, viewport] of [
  ["home", "sk", [1180, 740]],
  ["gears", "sk/cart/2", [1180, 740]],
  ["crank", "sk/cart/3", [1180, 740]],
  ["cart", "sk/cart/4", [1180, 740]],
  ["knight", "en/knight/4", [1180, 740]],
  ["screw", "sk/screw/4", [1180, 740]],
  ["portrait", "sk/cart/2", [820, 1060]],
  ["portrait-knight", "en/knight/4", [820, 1060]],
  ["compact", "en/screw/4", [1024, 672]],
]) {
  await page.setViewportSize({ width: viewport[0], height: viewport[1] });
  await page.goto(`${base}/#${route}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(100);
  await page.screenshot({ path: `artifacts/polish-${pass}-${name}.png` });
}
await page.setViewportSize({ width: 1180, height: 740 });
await page.goto(`${base}/#sk/cart/2`);
await page.evaluate(() => document.fonts.ready);
await page.evaluate(async () => {
  const { mountArt } = await import("/src/art.js");
  window.polishDraw = mountArt(document.querySelector(".art-host"), "cart", 1);
});
const tiles = [];
for (let i = 0; i < 12; i++) {
  await page.evaluate((i) => window.polishDraw({ angle: i * Math.PI / 36 }), i);
  await page.waitForTimeout(20);
  const input = await sharp(await page.locator(".model-stage").screenshot()).resize(600, 300, { fit: "contain", background: "#eee1c2" }).toBuffer();
  tiles.push({ input, left: (i % 4) * 600, top: Math.floor(i / 4) * 300 });
  if ([0, 3, 6, 9].includes(i)) {
    await page.locator(".model-stage").screenshot({ path: `artifacts/polish-${pass}-gear-phase-${i}.png` });
  }
}
await sharp({ create: { width: 2400, height: 900, channels: 3, background: "#eee1c2" } }).composite(tiles).png().toFile(`artifacts/polish-${pass}-gear-phases.png`);
const close = await browser.newPage({ viewport: { width: 1180, height: 740 }, deviceScaleFactor: 4 });
await close.goto(`${base}/#sk/cart/2`);
await close.evaluate(() => document.fonts.ready);
for (const i of [0, 3, 6, 9]) {
  const p = await close.evaluate(async (i) => {
    const { mountArt, sceneAt } = await import("/src/art.js");
    const { iso } = await import("/src/vendor/iso-kit.mjs");
    window.closeDraw ||= mountArt(document.querySelector(".art-host"), "cart", 1);
    window.closeDraw({ angle: i * Math.PI / 36 });
    const [x, y] = iso([-16, 0, 50], sceneAt("cart", 1).P);
    const point = new DOMPoint(x, y).matrixTransform(document.querySelector(".art-host svg").getScreenCTM());
    return { x: point.x - 85, y: point.y - 70, width: 170, height: 140 };
  }, i);
  await close.screenshot({ path: `artifacts/polish-${pass}-mesh-4x-${i}.png`, clip: p });
}
await browser.close();
console.log(`Captured ${pass}: tablet layouts, all full machines, gear phases.`);
