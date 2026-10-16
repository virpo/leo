import { VOICE_SETTINGS } from "./voices.js";
let muted = localStorage.getItem("leo-muted") === "true",
  sequence = 0;
export const voice = new Audio();
voice.preload = "auto";
voice.id = "leo-voice";
voice.hidden = true;
document.body.append(voice);
const speaking = (value) =>
  window.dispatchEvent(new CustomEvent("leo-speaking", { detail: value }));
voice.addEventListener("playing", () => speaking(true));
for (const event of ["ended", "pause", "error"])
  voice.addEventListener(event, () => speaking(false));
export function stopVoice() {
  sequence++;
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
export async function say(lang, id) {
  stopVoice();
  if (muted) return;
  const request = sequence;
  voice.src = `/audio/${lang}/${id}.mp3?v=${VOICE_SETTINGS[lang].revision}`;
  try {
    await voice.play();
  } catch (error) {
    if (request === sequence && error.name !== "AbortError")
      window.dispatchEvent(new CustomEvent("leo-audio-error"));
  }
}
