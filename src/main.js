import "./vendor/iso.css";
import "./style.css";
import { artMarkup, mountArt } from "./art.js";
import { leoMarkup, connectLeo } from "./leo.js";
import { CONTENT } from "./content.js";
import { TAU, clamp, smooth, follow, cartAt, screwAttemptAt, MACHINES } from "./model.js";
import { say, stopVoice, isMuted, toggleMute, voice } from "./narration.js";
import { createLessonGuide } from "./lesson-guide.js";
import { connectExploration } from "./explorers.js";
import { EXPLORATIONS } from "./experiments.js";

const app = document.querySelector("#app");
const icons = {
  home: '<path d="m4 11 8-7 8 7v9h-6v-6h-4v6H4z"/>',
  sound: '<path d="M4 9h4l5-4v14l-5-4H4zM17 8q5 4 0 8M20 5q8 7 0 14"/>',
  mute: '<path d="M4 9h4l5-4v14l-5-4H4zM17 9l5 6m0-6-5 6"/>',
  full: '<path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  turn: '<path d="M19 8a8 8 0 1 0 1 7M19 3v6h-6"/>',
  play: '<path d="m9 5 11 7-11 7z"/>',
  pull: '<path d="M12 3v17m-6-6 6 6 6-6"/>',
  pullUp: '<path d="M12 21V4m-6 6 6-6 6 6"/>',
  water: '<path d="M3 8q3-4 6 0t6 0t6 0M3 14q3-4 6 0t6 0t6 0M3 20q3-4 6 0t6 0t6 0"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
};
icons.pause = '<path d="M8 5v14M16 5v14"/>';
const icon = (name) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
let state = readRoute(),
  lessonGuide = null,
  cleanup = () => {};
function readRoute() {
  const parts = location.hash.slice(1).split("/").filter(Boolean);
  const remembered = localStorage.getItem("leo-lang");
  const lang = ["sk", "en"].includes(parts[0])
    ? parts.shift()
    : ["sk", "en"].includes(remembered) ? remembered : "sk";
  const requestedStep = Number(parts[1]);
  return {
    lang,
    machine: MACHINES.some(({ id }) => id === parts[0]) ? parts[0] : null,
    step: clamp((Number.isFinite(requestedStep) ? Math.trunc(requestedStep) : 1) - 1, 0, 3),
  };
}
function route(machine = null, step = 0, speech = true) {
  state = { ...state, machine, step };
  history.pushState(
    null,
    "",
    `#${state.lang}${machine ? `/${machine}/${step + 1}` : ""}`,
  );
  render(speech);
}
function header(c) {
  const brand = state.machine
    ? `<div class="workshop-brand"><button class="home-button" data-home aria-label="${c.homeButton}: ${c.home}">${icon("home")}<span>${c.homeButton}</span></button><span class="brand">${c.brand}</span></div>`
    : `<button class="brand" data-home aria-label="${c.home}">${icon("home")}<span>${c.brand}</span></button>`;
  return `<header class="topbar">${brand}<div class="top-tools"><div class="languages" aria-label="Language"><button data-lang="sk" lang="sk" aria-pressed="${state.lang === "sk"}">SK</button><button data-lang="en" lang="en" aria-pressed="${state.lang === "en"}">EN</button></div><button class="icon-button sound-button" aria-label="${isMuted() ? c.unmute : c.mute}" aria-pressed="${isMuted()}">${icon(isMuted() ? "mute" : "sound")}</button>${document.fullscreenEnabled ? `<button class="icon-button fullscreen" aria-label="${c.fullscreen}">${icon("full")}</button>` : ""}</div></header>`;
}
function leo(c, home = false) {
  return `<aside class="leo-guide ${home ? "welcome-guide" : ""}"><button class="leo-button" aria-label="${c.listen}">${leoMarkup(c.hello)}<span class="speech-button">${icon("play")}</span></button>${home ? `<p class="leo-hello">${c.hello}</p>` : ""}<span class="audio-error" role="status"></span></aside>`;
}
function render(speak = false) {
  cleanup();
  lessonGuide = null;
  stopVoice();
  const c = CONTENT[state.lang],
    m = state.machine;
  document.documentElement.lang = state.lang;
  document.title = `✒️ ${c.brand}`;
  app.className = `iso kiosk ${m ? "lesson" : "home"}`;
  app.innerHTML =
    header(c) +
    (m
      ? lesson(c, m)
      : `<main class="home-layout"><div class="welcome"><h1>${c.homeTitle}</h1>${leo(c, true)}</div><div class="machine-choices">${MACHINES.map(({ id }) => `<button class="machine-choice" data-machine="${id}"><span class="choice-art">${artMarkup(id, 3, { lift: id === "knight" ? 0.35 : 0, phase: id === "lock" ? 1 : 0, progress: id === "lock" ? 0.5 : 0, preview: true })}</span><span class="choice-name">${c.machines[id].short.replace("\n", "<br>")}</span><span class="choice-arrow">${icon("arrow")}</span></button>`).join("")}</div></main>`);
  app.querySelectorAll(".choice-art svg").forEach((svg) => {
    svg.setAttribute("aria-hidden", "true");
    const b = svg.querySelector(".drawing-parts").getBBox(),
      pad = 12;
    svg.setAttribute(
      "viewBox",
      `${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}`,
    );
  });
  const disconnectLeo = connectLeo(app.querySelector(".leo-button"));
  app.querySelector("[data-home]").onclick = () => route();
  app.querySelectorAll("[data-lang]").forEach(
    (button) =>
      (button.onclick = () => {
        state.lang = button.dataset.lang;
        localStorage.setItem("leo-lang", state.lang);
        history.replaceState(
          null,
          "",
          `#${state.lang}${m ? `/${m}/${state.step + 1}` : ""}`,
        );
        render(true);
      }),
  );
  app.querySelector(".sound-button").onclick = () => {
    toggleMute();
    if (isMuted()) lessonGuide?.pause();
    const b = app.querySelector(".sound-button");
    b.innerHTML = icon(isMuted() ? "mute" : "sound");
    b.setAttribute("aria-label", isMuted() ? c.unmute : c.mute);
    b.setAttribute("aria-pressed", String(isMuted()));
    if (!isMuted()) speakInstruction();
  };
  app
    .querySelector(".fullscreen")
    ?.addEventListener("click", () =>
      document.fullscreenElement
        ? document.exitFullscreen()
        : document.documentElement.requestFullscreen(),
    );
  app.querySelector(".leo-button").onclick = () => {
    if (isMuted()) {
      app.querySelector(".sound-button").click();
      return;
    }
    if (!voice.paused) lessonGuide ? lessonGuide.pause() : stopVoice();
    else speakInstruction();
  };
  app
    .querySelectorAll("[data-machine]")
    .forEach(
      (button) => (button.onclick = () => route(button.dataset.machine)),
    );
  const disposeModel = m ? connectLesson(m, state.step) : () => {};
  cleanup = () => {
    disposeModel();
    disconnectLeo();
  };
  if (speak)
    typeof speak === "string" ? say(state.lang, speak) : speakInstruction();
}
function speakInstruction() {
  if (lessonGuide) return lessonGuide.explain();
  say(
    state.lang,
    state.machine ? `${state.machine}-${state.step + 1}` : "hello",
  );
}
function lesson(c, m) {
  const step = c.machines[m].steps[state.step];
  const actionIcon = m === "parachute" ? "pull" : m === "lock" ? "water" : m === "knight" && state.step < 3 ? (state.step === 1 ? "pullUp" : "pull") : m === "cart" && state.step === 3 ? "play" : "turn";
  const resizeCanopy = m === "parachute" && state.step === 3;
  const reverseBoat = m === "boat" && state.step === 3;
  const sizeButton = (direction) => `<button class="canopy-adjust" data-size="${direction}" aria-label="${c.machines.parachute[direction < 0 ? "smaller" : "larger"]}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14${direction > 0 ? "M12 5v14" : ""}"/></svg></button>`;
  return `<main class="lesson-layout"><h1 class="step-title">${step.title}</h1><div class="model-stage" tabindex="0" role="group" aria-label="${step.action}"><div class="art-host"></div>${m === "screw" && state.step >= 2 ? windMarkup() : ""}</div>${leo(c)}<div class="action-row${resizeCanopy ? " canopy-controls" : reverseBoat ? " direction-controls" : ""}">${resizeCanopy ? sizeButton(-1) : reverseBoat ? `<button class="direction-button" data-direction="-1">${icon("arrow")}<span>${c.machines.boat.backward}</span></button>` : ""}<button class="action-button">${icon(reverseBoat ? "arrow" : actionIcon)}<span>${step.action}</span></button>${resizeCanopy ? sizeButton(1) : ""}</div><nav class="step-nav" aria-label="${c.machines[m].name}"><button class="nav-arrow previous" aria-label="${c.previous}">${icon("arrow")}</button><div class="step-dots">${[0, 1, 2, 3].map((i) => `<button data-step="${i}" aria-label="${i + 1}. ${c.machines[m].steps[i].title}" aria-current="${i === state.step ? "step" : "false"}">${i + 1}</button>`).join("")}</div><button class="nav-arrow next ${state.step === 3 ? "done" : ""}" aria-label="${state.step === 3 ? c.done : c.next}">${icon(state.step === 3 ? "check" : "arrow")}${state.step === 3 ? `<span>${c.done}</span>` : ""}</button></nav></main>`;
}
function windMarkup() {
  return `<svg class="airflow" viewBox="0 0 600 460" aria-hidden="true">${Array.from(
    { length: 8 },
    (_, i) => {
      const x = 110 + i * 53,
        y = 45 + (i % 3) * 20;
      return `<path d="M${x} ${y}c-48 50 55 85 10 135s-42 90-5 170m-12-14 12 14 6-19" style="--delay:${-i * 0.17}s"/>`;
    },
  ).join("")}</svg>`;
}
function connectLesson(kind, step) {
  const stage = app.querySelector(".model-stage"),
    host = app.querySelector(".art-host"),
    action = app.querySelector(".action-button");
  const draw = mountArt(host, kind, step),
    reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const guide = createLessonGuide({
    play: (id) => say(state.lang, id),
    stop: stopVoice,
    instruction: `${kind}-${step + 1}`,
    result: `${kind}-${step + 1}-result`,
  });
  lessonGuide = guide;
  connectLessonNavigation(kind, step);
  host.querySelector("svg").setAttribute("aria-label", CONTENT[state.lang].machines[kind].name);
  if (EXPLORATIONS.includes(kind)) return connectExploration({
    kind, step, stage, action, draw, guide,
    content: CONTENT[state.lang].machines[kind], replay: CONTENT[state.lang].replay,
  });
  let angle = 0,
    targetAngle = 0,
    lift = 0,
    targetLift = 0,
    charge = 0,
    frame = 0,
    last = 0,
    holding = false,
    pressedAt = 0,
    skipClick = false,
    drag = null,
    acted = false,
    attemptAt = null,
    rock = 0,
    releaseAt = null,
    distance = 0,
    energy = 1,
    disposed = false;
  const rotational = kind !== "knight" || step === 3,
    values = () => ({
      angle,
      lift,
      charge,
      distance,
      energy,
      wheelAngle: distance / 25,
      rock,
    });
  draw(values());
  const mark = () => {
    acted = true;
    stage.classList.add("explored");
    if (kind === "screw" && step === 3 && !reduced && attemptAt === null)
      attemptAt = performance.now();
    guide.observe(true);
  };
  const start = () => {
    if (!frame && !disposed) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  };
  function tick(now) {
    frame = 0;
    const dt = Math.min((now - last) / 1000, 0.045);
    last = now;
    if (holding && rotational)
      targetAngle += dt * (kind === "screw" && step >= 2 ? 13 : 4);
    if (holding) mark();
    if (attemptAt !== null && !holding && !drag) {
      const t = clamp((now - attemptAt) / 2800, 0, 1);
      targetAngle += dt * 12 * smooth(t / 0.14) * (1 - smooth((t - 0.76) / 0.14));
    }
    const previous = angle;
    angle = reduced ? targetAngle : follow(angle, targetAngle, dt, 0.13);
    lift = reduced ? targetLift : follow(lift, targetLift, dt, 0.16);
    if (kind === "knight" && step === 3)
      lift = (0.94 * (1 - Math.cos(angle))) / 2;
    if (kind === "cart" && step === 2)
      charge = clamp(charge + Math.abs(angle - previous) / TAU / 2, 0, 1);
    if (releaseAt !== null) {
      const t = clamp((now - releaseAt) / 3800, 0, 1),
        v = cartAt(t);
      distance = v.distance;
      energy = v.energy;
      angle = targetAngle = t * TAU * 3;
      if (t === 1) releaseAt = null;
    }
    if (attemptAt !== null) {
      const t = clamp((now - attemptAt) / 2800, 0, 1);
      rock = screwAttemptAt(t);
      if (t === 1) attemptAt = null;
    }
    draw(values());
    const wind = app.querySelector(".airflow");
    if (wind) {
      const speed = Math.abs(angle - previous) / Math.max(dt, 0.001);
      wind.style.opacity = String(
        reduced && acted ? 0.55 : clamp(speed / 3, 0, 0.85),
      );
      wind.classList.toggle("blowing", !reduced && speed > 0.1);
    }
    if (
      holding ||
      releaseAt !== null ||
      attemptAt !== null ||
      Math.abs(angle - targetAngle) > 0.002 ||
      (Math.abs(lift - targetLift) > 0.002 &&
        !(kind === "knight" && step === 3))
    ) {
      guide.observe(true);
      frame = requestAnimationFrame(tick);
    } else {
      angle = targetAngle;
      lift = kind === "knight" && step === 3 ? lift : targetLift;
      draw(values());
      const ready = acted && (kind !== "cart" || (step === 2 ? charge >= 0.98 : step === 3 ? distance > 0 && energy === 0 : true));
      stage.dataset.settled = String(drag === null);
      guide.observe(drag !== null, ready);
      if (wind) {
        wind.style.opacity = reduced && acted ? ".55" : "0";
        wind.classList.remove("blowing");
      }
    }
  }
  function act() {
    stage.dataset.settled = "false";
    if (kind === "cart" && step === 3) {
      if (reduced) {
        distance = distance > 0 ? 0 : 110;
        energy = distance > 0 ? 0 : 1;
        angle = targetAngle = distance / 25;
      } else {
        if (distance > 0) {
          distance = 0;
          energy = 1;
        }
        releaseAt = performance.now();
      }
    } else if (rotational)
      targetAngle += reduced
        ? TAU / 6
        : kind === "screw" && step >= 2
          ? TAU * (step === 3 ? 0.25 : 2)
          : TAU;
    else targetLift = targetLift > 0.4 ? 0 : 0.94;
    mark();
    start();
  }
  action.onclick = () => {
    if (skipClick) {
      skipClick = false;
      mark();
      return;
    }
    act();
  };
  action.addEventListener("pointerdown", (event) => {
    if (reduced || !rotational || (kind === "cart" && step === 3)) return;
    pressedAt = performance.now();
    holding = true;
    mark();
    action.setPointerCapture(event.pointerId);
    start();
  });
  action.addEventListener("pointerup", () => {
    if (holding && performance.now() - pressedAt > 280) skipClick = true;
    holding = false;
  });
  action.addEventListener("pointercancel", () => {
    holding = false;
    skipClick = false;
  });
  stage.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    guide.observe(true);
    stage.dataset.settled = "false";
    stage.setPointerCapture(event.pointerId);
    stage.classList.add("dragging");
    drag = {
      x: event.clientX,
      y: event.clientY,
      angle: draw.angleAt(event.clientX, event.clientY),
      lift: targetLift,
      moved: false,
    };
  });
  stage.addEventListener("pointermove", (event) => {
    if (!drag) return;
    if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 5)
      drag.moved = true;
    if (!drag.moved) return;
    if (kind === "cart" && step === 3) {
      if (!drag.released) {
        act();
        drag.released = true;
      }
      return;
    }
    if (rotational) {
      const a = draw.angleAt(event.clientX, event.clientY);
      targetAngle += Math.atan2(
        Math.sin(a - drag.angle),
        Math.cos(a - drag.angle),
      );
      drag.angle = a;
    } else
      targetLift = clamp(drag.lift + (drag.y - event.clientY) / 140, 0, 0.94);
    mark();
    start();
  });
  stage.addEventListener("pointerup", () => {
    if (!drag) return;
    const tap = !drag.moved;
    drag = null;
    stage.classList.remove("dragging");
    if (tap) act();
    else start();
  });
  stage.addEventListener("pointercancel", () => {
    drag = null;
    stage.classList.remove("dragging");
    start();
  });
  stage.addEventListener("keydown", (event) => {
    if (
      [
        " ",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
      ].includes(event.key)
    ) {
      event.preventDefault();
      if (rotational && !(kind === "cart" && step === 3) && ["ArrowLeft", "ArrowRight"].includes(event.key))
        targetAngle += event.key === "ArrowLeft" ? -TAU / 4 : TAU / 4;
      else act();
      mark();
      start();
    }
  });
  const visibility = () => {
    holding = false;
    if (document.hidden) {
      drag = null;
      stage.classList.remove("dragging");
      cancelAnimationFrame(frame);
      frame = 0;
      guide.pause();
    } else start();
  };
  document.addEventListener("visibilitychange", visibility);
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    guide.dispose();
    draw.destroy();
    document.removeEventListener("visibilitychange", visibility);
  };
}
function connectLessonNavigation(kind, step) {
  app.querySelector(".previous").onclick = () => step ? route(kind, step - 1) : route();
  app.querySelector(".next").onclick = () => step < 3 ? route(kind, step + 1) : route(null, 0, "complete");
  app.querySelectorAll("[data-step]").forEach((button) => {
    button.onclick = () => {
      const next = Number(button.dataset.step);
      if (next !== step) route(kind, next);
    };
  });
}
window.addEventListener("leo-audio-error", () => {
  const el = app.querySelector(".audio-error");
  if (el) el.textContent = CONTENT[state.lang].audioError;
});
window.addEventListener("leo-speaking", (event) => {
  app.classList.toggle("speaking", event.detail);
  const bubble = app.querySelector(".speech-button");
  if (bubble) bubble.innerHTML = icon(event.detail ? "pause" : "play");
  if (event.detail && app.querySelector(".audio-error"))
    app.querySelector(".audio-error").textContent = "";
});
window.addEventListener("popstate", () => {
  state = readRoute();
  render();
});
window.addEventListener("hashchange", () => {
  state = readRoute();
  render();
});
render();
