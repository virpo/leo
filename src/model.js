export const TAU = Math.PI * 2;
export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const smooth = (value) => {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};
export const follow = (value, target, dt, seconds = 0.12) =>
  value + (target - value) * (1 - Math.exp(-dt / seconds));
export const MACHINES = ["screw", "cart", "knight", "parachute", "boat", "lock"].map((id) => ({ id }));
export const GEAR_PLANE = 46;
// A failed attempt, not a flight simulation. The platform rocks about one
// grounded edge twice, falls back, and comes completely to rest.
export function screwAttemptAt(progress) {
  const t = clamp(progress, 0, 1);
  const rock = (from, peak, to, amplitude) =>
    t < from || t >= to ? 0 : amplitude * (t < peak
      ? smooth((t - from) / (peak - from))
      : 1 - smooth((t - peak) / (to - peak)));
  return rock(0.08, 0.32, 0.45, 2.5) + rock(0.5, 0.76, 0.87, 6.5)
    + rock(0.87, 0.91, 1, 0.5);
}
export function springAt(charge) {
  const tension = clamp(charge, 0, 1);
  return { tension, turns: 2.2 + tension, exponent: 0.9 + tension * 1.4 };
}
export function gearAngles(driver) {
  return { driver, follower: -driver / 2 + Math.PI / 24 };
}

// Shared 20 degree involute tooth profile. Matching module and a small backlash
// let coplanar teeth mesh instead of interpenetrating or passing over each other.
export function gearProfile(teeth, pitchRadius, angle = 0) {
  const module = (2 * pitchRadius) / teeth,
    pressure = (20 * Math.PI) / 180;
  const base = pitchRadius * Math.cos(pressure),
    root = pitchRadius - 1.25 * module,
    tip = pitchRadius + module;
  const inv = (a) => Math.tan(a) - a;
  const halfAt = (r) =>
    Math.PI / (2 * teeth) +
    inv(pressure) -
    (r <= base ? 0 : inv(Math.acos(base / r))) -
    0.012;
  const points = [],
    add = (theta, r) => points.push([r * Math.cos(theta), r * Math.sin(theta)]);
  for (let i = 0; i < teeth; i++) {
    const center = angle + (i * TAU) / teeth,
      halfBase = halfAt(base),
      halfTip = halfAt(tip);
    add(center - Math.PI / teeth, root);
    add(center - halfBase, root);
    for (let j = 0; j <= 5; j++) {
      const r = base + ((tip - base) * j) / 5;
      add(center - halfAt(r), r);
    }
    for (let j = 1; j <= 3; j++)
      add(center - halfTip + (2 * halfTip * j) / 3, tip);
    for (let j = 4; j >= 0; j--) {
      const r = base + ((tip - base) * j) / 5;
      add(center + halfAt(r), r);
    }
    add(center + halfBase, root);
    // The next tooth supplies this root boundary. Duplicating it creates a
    // zero-length extrusion edge and an unstable normal as the gear rotates.
  }
  return points;
}
export function cartAt(progress, charge = 1) {
  const t = clamp(progress, 0, 1),
    distance = 110 * clamp(charge, 0, 1) * (1 - (1 - t) ** 2);
  return {
    distance,
    wheelAngle: distance / 25,
    energy: clamp(charge, 0, 1) * (1 - t) ** 2,
  };
}
export function knightAt(lift) {
  const angle = clamp(lift, 0, 1) * 2.5,
    elbow = [55, 3, 132];
  return {
    angle,
    elbow,
    hand: [elbow[0] + Math.sin(angle) * 47, 3, elbow[2] - Math.cos(angle) * 47],
    pull: clamp(lift, 0, 1) * 38,
  };
}
