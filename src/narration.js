import { VOICE_SETTINGS } from "./voices.js";
let muted = localStorage.getItem("leo-muted") === "true",
  sequence = 0,
  finish = null;
export const voice = new Audio();
voice.preload = "auto";
voice.id = "leo-voice";
voice.hidden = true;
document.body.append(voice);
const speaking = (value) =>
  window.dispatchEvent(new CustomEvent("leo-speaking", { detail: value }));
voice.addEventListener("playing", () => speaking(true));
voice.addEventListener("ended", () => finish?.("ended"));
voice.addEventListener("error", () => finish?.("error"));
for (const event of ["ended", "pause", "error"])
  voice.addEventListener(event, () => speaking(false));
export function stopVoice() {
  sequence++;
  finish?.("cancelled");
  voice.pause();
  speaking(false);
}
export function isMuted() {
  return muted;
}
export function toggleMute() {
  muted = !muted;
  localStorage.setItem("leo-muted", String(muted));
  if (muted) stopVoice();
  return muted;
}
export function say(lang, id) {
  stopVoice();
  if (muted) return Promise.resolve("muted");
  const request = sequence;
  voice.src = `/audio/${lang}/${id}.mp3?v=${VOICE_SETTINGS[lang].revision}`;
  voice.dataset.clip = id;
  return new Promise((resolve) => {
    finish = (outcome) => {
      finish = null;
      resolve(outcome);
    };
    voice.play().catch((error) => {
      if (request !== sequence) return;
      finish?.("error");
      if (error.name !== "AbortError")
        window.dispatchEvent(new CustomEvent("leo-audio-error"));
    });
  });
}
