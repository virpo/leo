import { chromium, webkit } from "playwright";
import assert from "node:assert/strict";
import sharp from "sharp";
const url = process.env.LEO_TEST_URL || "http://localhost:5174";
const failures = [],
  shots = [];
for (const engine of [chromium, webkit]) {
  const browser = await engine.launch(
    engine === chromium ? { channel: "chrome" } : {},
  );
  const context = await browser.newContext({
    viewport: { width: 1180, height: 740 },
    hasTouch: true,
    isMobile: engine === webkit,
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => failures.push(`${engine.name()}: ${e.message}`));
  await page.goto(`${url}/#sk`);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator(".machine-choice").count(), 3);
  await page.locator(".leo-button").tap();
  await page.waitForFunction(() =>
    document.querySelector("#app").classList.contains("speaking"),
  );
  await page.waitForFunction(
    () => {
      const voice = document.querySelector("#leo-voice");
      return voice.currentTime > 0.05 && !voice.paused;
    },
    {},
    { timeout: 5000 },
  );
  assert.ok(
    await page.evaluate(() => {
      const voice = document.querySelector("#leo-voice");
      return (
        voice.currentTime > 0 &&
        !voice.paused &&
        new URL(voice.src).pathname.endsWith("/sk/hello.mp3")
      );
    }),
    `${engine.name()} actual Slovak audio playback`,
  );
  await page.locator("[data-lang=en]").tap();
  await page.waitForFunction(() =>
    document.querySelector("#app").classList.contains("speaking"),
  );
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  assert.ok(
    await page.evaluate(() => {
      const voice = document.querySelector("#leo-voice");
      return new URL(voice.src).pathname.endsWith("/en/hello.mp3");
    }),
  );
  await page.locator(".sound-button").tap();
  for (const lang of ["sk", "en"])
    for (const machine of ["screw", "cart", "knight"])
      for (let step = 1; step <= 4; step++) {
        await page.goto(`${url}/#${lang}/${machine}/${step}`);
        await page.locator(".art-host svg").waitFor();
        const initial = await page.locator(".drawing-parts").innerHTML();
        await page.waitForTimeout(125);
        assert.equal(
          await page.locator(".drawing-parts").innerHTML(),
          initial,
          `${machine}/${step} must not start itself`,
        );
        await page.locator(".action-button").tap();
        await page.waitForTimeout(160);
        assert.notEqual(
          await page.locator(".drawing-parts").innerHTML(),
          initial,
          `${machine}/${step} responds to child`,
        );
        if (lang === "sk" && engine === chromium) {
          const shot = await sharp(await page.screenshot())
            .resize(472, 296)
            .toBuffer();
          shots.push({
            input: shot,
            left: (step - 1) * 472,
            top: ["screw", "cart", "knight"].indexOf(machine) * 296,
          });
        }
      }
  for (const size of [
    { width: 1180, height: 820 },
    { width: 1180, height: 740 },
    { width: 1024, height: 672 },
    { width: 820, height: 1060 },
    { width: 768, height: 950 },
  ]) {
    await page.setViewportSize(size);
    for (const route of ["sk", "en/screw/4", "sk/cart/3", "en/knight/4"]) {
      await page.goto(`${url}/#${route}`);
      await page.evaluate(() => document.fonts.ready);
      const check = await page.evaluate(() => {
        const bad = [...document.querySelectorAll("button,h1")]
          .filter((e) => {
            const b = e.getBoundingClientRect();
            return (
              b.width &&
              b.height &&
              (b.left < 0 ||
                b.top < 0 ||
                b.right > innerWidth + 1 ||
                b.bottom > innerHeight + 1)
            );
          })
          .map((e) => e.outerHTML.slice(0, 100));
        return {
          bad,
          width: document.documentElement.scrollWidth,
          height: document.documentElement.scrollHeight,
          w: innerWidth,
          h: innerHeight,
        };
      });
      assert.deepEqual(
        check.bad,
        [],
        `${engine.name()} ${JSON.stringify(size)} ${route}`,
      );
      assert.equal(check.width, check.w);
      assert.equal(check.height, check.h);
      if (route.includes("/")) {
        const alignment = await page.evaluate(() => {
          const center = (selector) => {
            const b = document.querySelector(selector).getBoundingClientRect();
            return b.x + b.width / 2;
          };
          const dots = [...document.querySelectorAll(".step-dots button")].map((b) => b.getBoundingClientRect());
          return {
            title: center(".step-title"),
            action: center(".action-button"),
            steps: center(".step-dots"),
            gaps: dots.slice(1).map((b, i) => b.x - dots[i].right),
            minTarget: Math.min(...dots.map((b) => Math.min(b.width, b.height))),
          };
        });
        assert.ok(Math.abs(alignment.title - alignment.action) < 1, "title and action share an axis");
        assert.ok(Math.abs(alignment.action - alignment.steps) < 1, "step rail remains centred, including Done");
        assert.ok(alignment.gaps.every((gap) => Math.abs(gap - alignment.gaps[0]) < 1));
        assert.ok(alignment.minTarget >= 44, "child-sized step targets");
      }
    }
  }
  await page.setViewportSize({ width: 1180, height: 740 });
  await page.goto(`${url}/#sk/cart/4`);
  const cartFits = () => page.evaluate(() => {
    const stage = document.querySelector(".model-stage").getBoundingClientRect();
    const cart = document.querySelector(".drawing-parts").getBoundingClientRect();
    return cart.left >= stage.left && cart.right <= stage.right && cart.top >= stage.top && cart.bottom <= stage.bottom;
  });
  assert.ok(await cartFits(), "full cart fits at rest");
  await page.locator(".action-button").tap();
  await page.waitForTimeout(4100);
  assert.ok(await cartFits(), "full cart fits after its complete journey");
  await page.goto(`${url}/#sk/cart/3`);
  const idle = await page.locator(".drawing-parts").innerHTML();
  await page.waitForTimeout(2400);
  assert.equal(
    await page.locator(".drawing-parts").innerHTML(),
    idle,
    "no delayed idle tour",
  );
  let old = await page.locator("[data-part=winding]").innerHTML();
  const b = await page.locator(".model-stage").boundingBox();
  await page.mouse.move(b.x + b.width * 0.45, b.y + b.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width * 0.55, b.y + b.height * 0.5, {
    steps: 8,
  });
  await page.mouse.up();
  await page.waitForTimeout(180);
  assert.notEqual(
    await page.locator("[data-part=winding]").innerHTML(),
    old,
    `${engine.name()} direct crank drag`,
  );
  await page.waitForTimeout(2200);
  old = await page.locator(".drawing-parts").innerHTML();
  await page.waitForTimeout(2100);
  assert.equal(
    await page.locator(".drawing-parts").innerHTML(),
    old,
    "no idle movement after settling",
  );
  if (engine === chromium) await page.mouse.wheel(0, 700);
  else await page.evaluate(() => scrollTo(0, 700));
  assert.equal(await page.evaluate(() => scrollY), 0);
  await page.screenshot({ path: `artifacts/kiosk-crank-${engine.name()}.png` });
  await page.goto(`${url}/#sk`);
  await page.screenshot({ path: `artifacts/kiosk-home-${engine.name()}.png` });
  await page.setViewportSize({ width: 820, height: 1060 });
  await page.screenshot({
    path: `artifacts/kiosk-home-portrait-${engine.name()}.png`,
  });
  await page.goto(`${url}/#en/knight/4`);
  await page.screenshot({
    path: `artifacts/kiosk-knight-portrait-${engine.name()}.png`,
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const machine of ["screw", "cart", "knight"]) {
    await page.goto(`${url}/#sk/${machine}/4`);
    const before = await page.locator(".drawing-parts").innerHTML();
    await page.locator(".action-button").tap();
    await page.waitForTimeout(150);
    const after = await page.locator(".drawing-parts").innerHTML();
    assert.notEqual(
      after,
      before,
      `${machine} reduced motion gives visible state`,
    );
    await page.waitForTimeout(500);
    assert.equal(
      await page.locator(".drawing-parts").innerHTML(),
      after,
      `${machine} reduced motion settles immediately`,
    );
  }
  await page.goto(`${url}/#sk/cart/2`);
  const beforeKey = await page.locator(".drawing-parts").innerHTML();
  await page.locator(".model-stage").focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(100);
  assert.notEqual(await page.locator(".drawing-parts").innerHTML(), beforeKey);
  await page.goto(`${url}/#en/knight/4`);
  await page.locator(".next").tap();
  assert.equal(
    await page.locator(".machine-choice").count(),
    3,
    "Done returns to machine choice",
  );
  await browser.close();
  console.log(
    `${engine.name()}: bilingual lessons, real audio, tablet fit, touch, drag, keyboard, reduced motion, no autoplay passed`,
  );
}
assert.deepEqual(failures, []);
await sharp({
  create: { width: 1888, height: 888, channels: 3, background: "#eee1c2" },
})
  .composite(shots)
  .png()
  .toFile("artifacts/kiosk-lessons-contact-sheet.png");
console.log("All tablet checks passed.");
