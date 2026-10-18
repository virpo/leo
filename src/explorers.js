import { TAU, clamp, follow } from "./model.js";
import { parachuteAt, lockAt, paddleDragAngle, CANOPY_SIZES, REFERENCE_CANOPY } from "./experiments.js";

export function connectExploration({ kind, step, stage, action, draw, guide, content, replay }) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let frame = 0, last = 0, disposed = false, acted = false;
  let angle = 0, targetAngle = 0, waterTravel = 0, wake = 0, waterDirection = -1;
  let fall = 0, fallSmall = 0, bounce = 0, bounceSmall = 0, canopyWidth = CANOPY_SIZES[3];
  let progress = 0, phase = 0, started = null, duration = 0;
  let drag = null, holding = false, skipClick = false, pressedAt = 0;
  const sizeButtons = [...stage.closest(".lesson-layout").querySelectorAll("[data-size]")];
  const boatDirections = new Set();
  const values = () => ({ angle, fall, fallSmall, bounce, bounceSmall, canopyWidth, progress, phase, wake, waterTravel, waterDirection });
  const ready = () => acted && (kind !== "lock" || step !== 3 || phase === 4)
    && (kind !== "boat" || step !== 3 || boatDirections.size === 2);
  const label = () => {
    action.setAttribute("aria-busy", String(started !== null));
    for (const button of sizeButtons) button.disabled = started !== null ||
      (Number(button.dataset.size) < 0 ? canopyWidth <= CANOPY_SIZES[0] : canopyWidth >= CANOPY_SIZES.at(-1));
    if (kind === "boat" && step === 3) {
      action.disabled = angle >= TAU - 0.002;
      stage.closest(".lesson-layout").querySelector("[data-direction]").disabled = angle <= -TAU + 0.002;
    }
    if (kind === "boat" && step === 2) {
      action.querySelector("span").textContent = angle >= TAU - 0.002 && wake === 0
        ? replay : content.steps[step].action;
    }
    if (kind === "lock") {
      action.querySelector("span").textContent = step === 3
        ? (started !== null ? content.busy[phase] : content.phases[phase])
        : progress === 1 && started === null ? replay : content.steps[step].action;
      stage.dataset.phase = String(phase);
      stage.setAttribute("aria-label", action.querySelector("span").textContent);
      stage.dataset.waterLevel = String(lockAt(step, progress, phase).level);
    }
  };
  const paint = () => {
    draw(values());
    stage.dataset.progress = String(progress);
    stage.dataset.fall = String(fall);
    stage.dataset.bounce = String(bounce);
    stage.dataset.wake = String(wake);
    stage.dataset.waterDirection = String(waterDirection);
    stage.dataset.canopy = String(canopyWidth);
    stage.dataset.angle = String(angle);
    label();
  };
  const run = () => {
    if (!frame && !disposed && !document.hidden) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  };
  function tick(now) {
    frame = 0;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (kind === "boat") {
      if (holding) {
        targetAngle += dt * 3;
        if (step >= 2) targetAngle = clamp(targetAngle, -TAU, TAU);
      }
      const previous = angle;
      angle = reduced ? targetAngle : follow(angle, targetAngle, dt, drag ? 0.08 : 0.32);
      if (Math.abs(angle - targetAngle) < 0.002) angle = targetAngle;
      const delta = angle - previous;
      // Water is driven by the blade, never an idle animation. Continue a short
      // dissipating wake after a stroke so the push remains easy to see.
      const push = step === 0 ? 35 * (Math.cos(angle) - Math.cos(previous)) : -delta * 30;
      const speed = Math.abs(push) / Math.max(dt, 0.001) / 30;
      if (speed > 0.03) {
        waterDirection = Math.sign(push);
        boatDirections.add(waterDirection);
      }
      wake = reduced ? 0 : follow(wake, Math.min(1, speed / 1.2), dt, speed > 0.03 ? 0.08 : 0.2);
      if (wake < 0.008) wake = 0;
      waterTravel += dt * wake * 65;
    } else if (started !== null) {
      const seconds = (now - started) / 1000;
      if (kind === "parachute") {
        const width = step === 0 ? 0 : step === 1 ? 0.42 : step === 2 ? 0.82 : canopyWidth;
        const big = parachuteAt(seconds, width), small = parachuteAt(seconds, step === 3 ? REFERENCE_CANOPY : 0.35);
        fall = reduced ? 1 : big.fall;
        fallSmall = reduced ? 1 : small.fall;
        bounce = reduced ? 0 : big.bounce;
        bounceSmall = reduced ? 0 : small.bounce;
        if (reduced || big.settled && (step < 2 || small.settled)) started = null;
      } else {
        progress = reduced ? 1 : clamp(seconds * 1000 / duration, 0, 1);
        if (progress === 1) {
          started = null;
          if (step === 3) { phase++; progress = 0; }
        }
      }
    }
    const moving = started !== null || holding || Math.abs(angle - targetAngle) > 0.002 || wake > 0;
    stage.dataset.settled = String(!moving && !drag);
    paint();
    guide.observe(moving || drag !== null, ready());
    if (moving) frame = requestAnimationFrame(tick);
  }
  function act(boatDirection = 1) {
    if (disposed || started !== null) return;
    if (kind === "boat" && step === 2 && targetAngle >= TAU &&
      (angle < TAU - 0.002 || wake > 0)) return;
    acted = true;
    stage.classList.add("explored");
    stage.dataset.settled = "false";
    guide.observe(true);
    if (kind === "boat") {
      if (step === 0) targetAngle = targetAngle > Math.PI / 2 ? 0 : Math.PI;
      else if (step === 3) targetAngle = boatDirection * TAU;
      else {
        if (step === 2 && targetAngle >= TAU) angle = targetAngle = 0;
        targetAngle = step === 2 ? TAU : targetAngle + TAU;
      }
    } else {
      if (kind === "parachute") { fall = fallSmall = bounce = bounceSmall = 0; }
      else {
        if (phase === 4) phase = 0;
        progress = 0;
        duration = step === 3 ? [900, 2800, 1100, 1900][phase] : [2400, 2800, 1100][step];
      }
      started = performance.now();
    }
    paint();
    run();
  }
  action.onclick = () => {
    if (skipClick) { skipClick = false; return; }
    act();
  };
  stage.closest(".lesson-layout").querySelector("[data-direction]")?.addEventListener("click", () => act(-1));
  function resizeCanopy(direction) {
    if (started !== null) return;
    const index = CANOPY_SIZES.findIndex((size) => size >= canopyWidth - 0.001);
    canopyWidth = CANOPY_SIZES[clamp(index + direction, 0, CANOPY_SIZES.length - 1)];
    fall = fallSmall = bounce = bounceSmall = 0;
    stage.classList.add("explored");
    paint();
  }
  for (const button of sizeButtons) button.addEventListener("click", () => resizeCanopy(Number(button.dataset.size)));
  action.addEventListener("pointerdown", (event) => {
    if (kind !== "boat" || step === 0 || step === 3 || reduced) return;
    holding = true;
    acted = true;
    stage.classList.add("explored");
    if (step === 2 && angle >= TAU - 0.002 && wake === 0) angle = targetAngle = 0;
    pressedAt = performance.now();
    action.setPointerCapture(event.pointerId);
    guide.observe(true);
    run();
  });
  action.addEventListener("pointerup", () => {
    skipClick = holding && performance.now() - pressedAt > 250;
    holding = false;
    run();
  });
  action.addEventListener("pointercancel", () => { holding = false; skipClick = false; run(); });
  stage.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    stage.setPointerCapture(event.pointerId);
    // Grab the visible pose, even while a previous button action is easing.
    if (kind === "boat") targetAngle = angle;
    drag = { x: event.clientX, y: event.clientY, angle, moved: false, triggered: false };
    stage.dataset.settled = "false";
    stage.classList.add("dragging");
    guide.observe(true);
  });
  stage.addEventListener("pointermove", (event) => {
    if (!drag || Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 6) return;
    drag.moved = true;
    stage.classList.add("explored");
    if (kind === "boat") {
      acted = true;
      targetAngle = step === 0
        ? paddleDragAngle(drag.angle, draw.worldDx(event.clientX - drag.x))
        : drag.angle + (event.clientX - drag.x) / 35;
      if (step === 0) targetAngle = clamp(targetAngle, 0, Math.PI);
      else if (step >= 2) targetAngle = clamp(targetAngle, -TAU, TAU);
    } else if (kind === "parachute" && step === 3) {
      // Sizing has explicit, large +/− controls. A swipe must not accidentally
      // change the fair-test variable or launch a comparison.
    } else if (!drag.triggered) { act(); drag.triggered = true; }
    run();
  });
  const release = (cancelled = false) => {
    if (!drag) return;
    const tap = !drag.moved;
    drag = null;
    stage.classList.remove("dragging");
    if (tap && !cancelled) act();
    run();
  };
  stage.addEventListener("pointerup", () => release());
  stage.addEventListener("pointercancel", () => release(true));
  stage.addEventListener("keydown", (event) => {
    if (![" ", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    if (kind === "parachute" && step === 3 && event.key.startsWith("Arrow") && started === null) {
      resizeCanopy(["ArrowLeft", "ArrowDown"].includes(event.key) ? -1 : 1);
    } else if (kind === "boat" && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
      targetAngle = step === 0 ? paddleDragAngle(angle, event.key === "ArrowLeft" ? -14 : 14)
        : clamp(targetAngle + (event.key === "ArrowLeft" ? -1 : 1) * TAU / 4, -TAU, TAU);
      acted = true;
      stage.dataset.settled = "false";
      guide.observe(true);
      run();
    } else act();
  });
  const visibility = () => {
    if (document.hidden) {
      holding = false;
      drag = null;
      stage.classList.remove("dragging");
      cancelAnimationFrame(frame);
      frame = 0;
      // Finish a bounded experiment on return, without restarting narration.
      guide.pause();
    } else run();
  };
  document.addEventListener("visibilitychange", visibility);
  paint();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    guide.dispose();
    draw.destroy();
    document.removeEventListener("visibilitychange", visibility);
  };
}
