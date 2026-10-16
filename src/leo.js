// Original pen-and-ink portrait, with an isolated matching speaking frame.
// Only the lips crossfade. The drawing is completely still until Leo speaks.
export function leoMarkup(label) {
  return `<svg class="leo-drawing" viewBox="0 0 1214 1295" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="leo-ink-strength" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="white" stop-opacity=".88"/>
        <stop offset=".4" stop-color="white" stop-opacity=".92"/>
        <stop offset=".7" stop-color="white" stop-opacity=".68"/>
        <stop offset=".9" stop-color="white" stop-opacity=".54"/>
        <stop offset="1" stop-color="white" stop-opacity="0"/>
      </linearGradient>
      <mask id="leo-ink-mask"><rect width="1214" height="1295" fill="url(#leo-ink-strength)"/></mask>
      <radialGradient id="leo-lip-feather"><stop offset=".55" stop-color="white"/><stop offset="1" stop-color="white" stop-opacity="0"/></radialGradient>
      <mask id="leo-speaking-mask" maskUnits="userSpaceOnUse" x="610" y="335" width="180" height="130">
        <ellipse cx="698" cy="396" rx="78" ry="52" transform="rotate(-12 698 396)" fill="url(#leo-lip-feather)"/>
      </mask>
    </defs>
    <g mask="url(#leo-ink-mask)"><image href="/leo-ink-v3.webp" width="1214" height="1295"/>
    <image class="leo-speaking-frame" href="/leo-ink-v3-speaking.webp" width="1214" height="1295" mask="url(#leo-speaking-mask)" opacity="0"/></g>
  </svg>`;
}

export function connectLeo(element) {
  const mouth = element.querySelector(".leo-speaking-frame");
  let frame = 0,
    last = 0;
  function tick(now) {
    if (!element.isConnected) return;
    if (now - last > 85) {
      const syllable = Math.abs(Math.sin(now * 0.012) * Math.cos(now * 0.0047));
      mouth.setAttribute(
        "opacity",
        String(syllable > 0.25 ? 0.28 + syllable * 0.72 : 0),
      );
      last = now;
    }
    frame = requestAnimationFrame(tick);
  }
  function update(event) {
    cancelAnimationFrame(frame);
    element.dataset.speaking = String(event.detail);
    if (event.detail && !matchMedia("(prefers-reduced-motion: reduce)").matches)
      frame = requestAnimationFrame(tick);
    else mouth.setAttribute("opacity", event.detail ? ".7" : "0");
  }
  window.addEventListener("leo-speaking", update);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("leo-speaking", update);
  };
}
