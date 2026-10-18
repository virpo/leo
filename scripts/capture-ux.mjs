import { chromium } from "playwright";
import sharp from "sharp";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1180, height: 740 }, hasTouch: true });
const url = process.env.LEO_TEST_URL || "http://localhost:5174";
await page.goto(`${url}/#sk/screw/4`);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "artifacts/ux-after-screw.png" });
const frames = [];
await page.locator(".action-button").tap();
const started = Date.now();
for (const at of [0, 880, 1260, 2120, 2440, 3700]) {
  await page.waitForTimeout(Math.max(0, started + at - Date.now()));
  const shot = await page.locator(".model-stage").screenshot();
  frames.push({ input: await sharp(shot).resize(420, 190, { fit: "contain", background: "#eee1c2" }).toBuffer(), left: frames.length % 3 * 420, top: Math.floor(frames.length / 3) * 190 });
}
await sharp({ create: { width: 1260, height: 380, channels: 3, background: "#eee1c2" } }).composite(frames).png().toFile("artifacts/ux-failed-lift-sheet.png");
await page.goto(`${url}/#sk/cart/3`);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "artifacts/ux-spring-rest.png" });
const spring = await page.locator('[data-part="springdrum"]').boundingBox();
const crop = { x: Math.floor(spring.x - 12), y: Math.floor(spring.y - 20), width: Math.ceil(spring.width + 24), height: Math.ceil(spring.height + 40) };
await sharp(await page.screenshot({ clip: crop })).resize(crop.width * 4, crop.height * 4).png().toFile("artifacts/ux-spring-rest-4x.png");
for (let i = 0; i < 2; i++) {
  await page.locator(".action-button").tap();
  await page.waitForFunction(() => document.querySelector(".model-stage").dataset.settled === "true");
}
await page.screenshot({ path: "artifacts/ux-spring-wound.png" });
await sharp(await page.screenshot({ clip: crop })).resize(crop.width * 4, crop.height * 4).png().toFile("artifacts/ux-spring-wound-4x.png");
await page.setViewportSize({ width: 820, height: 1060 });
await page.waitForTimeout(250);
await page.screenshot({ path: "artifacts/ux-spring-portrait.png" });
await page.setViewportSize({ width: 1024, height: 672 });
await page.goto(`${url}/#en/screw/4`);
await page.screenshot({ path: "artifacts/ux-compact.png" });
await browser.close();
console.log("Captured the failed-lift sequence, winding detail and tablet layouts.");
