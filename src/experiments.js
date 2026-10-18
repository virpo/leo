import { clamp, smooth, TAU } from "./model.js";
export const EXPLORATIONS = ["parachute", "boat", "lock"];
export const CANOPY_SIZES = [0.32, 0.46, 0.6, 0.74, 0.9];
export const REFERENCE_CANOPY = 0.6;

// Equal payloads, equal height, one variable: canopy width. Quadratic drag,
// constant Cd and density. Displayed motion is illustrative, not a safety model.
export function parachuteAt(seconds, width = 0, height = 3) {
  const t = Math.max(0, seconds), g = 9.81, mass = 0.08;
  const drag = 0.5 * 1.225 * 1.2 * width * width;
  const terminal = drag > 0 ? Math.sqrt(mass * g / drag) : Infinity;
  const x = g * t / terminal;
  const logCosh = (v) => v + Math.log1p(Math.exp(-2 * v)) - Math.log(2);
  const distance = drag > 0 ? terminal * terminal / g * logCosh(x) : g * t * t / 2;
  const impactTime = drag > 0
    ? Math.acosh(Math.exp(height * g / (terminal * terminal))) * terminal / g
    : Math.sqrt(2 * height / g);
  const impactSpeed = drag > 0 ? terminal * Math.tanh(g * impactTime / terminal) : g * impactTime;
  const age = t - impactTime;
  // Two small, dissipating basket bounces. Never dip below the landing tray.
  const bounce = age < 0 ? 0 : age < 0.34
    ? Math.sin(Math.PI * age / 0.34) * clamp(impactSpeed * 1.2, 2, 8)
    : age < 0.56 ? Math.sin(Math.PI * (age - 0.34) / 0.22) * clamp(impactSpeed * 0.25, 0.4, 1.6) : 0;
  return { fall: clamp(distance / height, 0, 1), landed: distance >= height,
    velocity: drag > 0 ? terminal * Math.tanh(x) : g * t,
    bounce, settled: age >= 0.56 };
}
export function boatAt(angle, step) {
  return { angle, distance: step >= 2 ? clamp(angle / TAU * 65, -76, 76) : 0, stroke: (1 - Math.cos(angle)) / 2 };
}
export function paddleDragAngle(angle, worldDx) {
  // The blade travels as x = 35 cos(angle). Invert that actual position,
  // rather than mapping rightward pointer travel to a positive wheel angle.
  return Math.acos(clamp(Math.cos(angle) + worldDx / 35, -1, 1));
}
export function lockAt(step, progress = 0, phase = 0) {
  const p = smooth(progress);
  if (step === 0) return { low: 24 + 30 * p, high: 84 - 30 * p, level: 24 + 30 * p, lowGate: 0, highGate: 0, valve: p, boatX: 30 };
  if (step === 1) return { low: 24, high: 84, level: 24 + 60 * p, lowGate: 0, highGate: 0, valve: Math.sin(Math.PI * p), boatX: 0 };
  if (step === 2) return { low: 84, high: 84, level: 84, lowGate: 0, highGate: p, valve: 0, boatX: 0 };
  return {
    low: 24, high: 84,
    level: phase < 1 ? 24 : phase === 1 ? 24 + 60 * p : 84,
    lowGate: phase === 0 ? 1 - p : 0,
    highGate: phase < 2 ? 0 : phase === 2 ? p : 1,
    valve: phase === 1 ? Math.sin(Math.PI * p) : 0,
    boatX: phase === 3 ? 143 * p : phase > 3 ? 143 : 0,
  };
}
