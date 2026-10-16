// One native-language stream avoids dozens of unreliable voice-service handshakes.
import { spawn } from "node:child_process";
import { readFile, writeFile, stat, mkdir, rename } from "node:fs/promises";
import { createHash } from "node:crypto";
import { narrationManifest } from "../src/content.js";
import { VOICE_SETTINGS } from "../src/voices.js";
const clips = narrationManifest().filter((c) => c.lang === "sk"),
  settings = VOICE_SETTINGS.sk;
if (!settings.voice.startsWith("sk-SK-"))
  throw new Error("Native Slovak narrator required");
const marker = "Koniec nahrávky.",
  text = clips.map((c) => `${c.text} ${marker}`).join("\n\n");
const media = new URL("../artifacts/slovak-native-batch.mp3", import.meta.url),
  subtitles = new URL("../artifacts/slovak-native-batch.srt", import.meta.url);
function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (c) => (output += c));
    child.stderr.on("data", (c) => (output += c));
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve(output) : reject(new Error(output.slice(-2000))),
    );
  });
}
if (process.argv.includes("--record")) {
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      await run("uvx", [
        "--from",
        "edge-tts==7.3.1",
        "edge-tts",
        "--voice",
        settings.voice,
        `--rate=${settings.rate}`,
        "--text",
        text,
        "--write-media",
        media.pathname,
        "--write-subtitles",
        subtitles.pathname,
      ]);
      if ((await stat(media)).size < 50000)
        throw new Error("Empty native recording");
      break;
    } catch (error) {
      console.log(
        `Native batch attempt ${attempt + 1}: ${error.message.split("\n").at(-2)}`,
      );
      if (attempt === 7) throw error;
    }
  }
}
const time = (s) => {
  const [h, m, sec] = s.replace(",", ".").split(":").map(Number);
  return h * 3600 + m * 60 + sec;
};
const entries = (await readFile(subtitles, "utf8"))
  .trim()
  .split(/\r?\n\r?\n/)
  .map((block) => {
    const lines = block.split(/\r?\n/),
      range = lines[1]?.split(" --> ");
    return {
      start: time(range[0]),
      end: time(range[1]),
      text: lines.slice(2).join(" "),
    };
  });
const groups = [];
let group = [];
for (const entry of entries) {
  if (entry.text.trim() === marker) {
    groups.push(group);
    group = [];
  } else group.push(entry);
}
if (groups.length !== clips.length)
  throw new Error(
    `Expected ${clips.length} markers, got ${groups.length}. Inspect subtitles before splitting.`,
  );
const silenceLog = await run("ffmpeg", [
  "-hide_banner",
  "-i",
  media.pathname,
  "-af",
  "silencedetect=noise=-38dB:d=0.08",
  "-f",
  "null",
  "-",
]);
const pauses = [];
let pauseStart = 0;
for (const match of silenceLog.matchAll(/silence_(start|end): ([\d.]+)/g)) {
  if (match[1] === "start") pauseStart = Number(match[2]);
  else pauses.push({ start: pauseStart, end: Number(match[2]) });
}
function pauseAt(t) {
  const pause = pauses.find(
    (p) =>
      (p.start === 0 || p.end - p.start > 0.25) &&
      p.start - 0.03 <= t &&
      p.end + 0.03 >= t,
  );
  if (!pause)
    throw new Error(`No clean pause at ${t}s. Refusing to cut speech.`);
  return pause;
}
const segments = [];
const receiptFile = new URL("../public/audio/receipts.json", import.meta.url);
let receipts = {};
try {
  receipts = JSON.parse(await readFile(receiptFile, "utf8"));
} catch {}
await mkdir(new URL("../public/audio/sk/", import.meta.url), {
  recursive: true,
});
for (let i = 0; i < clips.length; i++) {
  const clip = clips[i],
    sentences = groups[i];
  if (
    sentences
      .map((s) => s.text)
      .join(" ")
      .replaceAll(/\s+/g, " ")
      .trim() !== clip.text.replaceAll(/\s+/g, " ").trim()
  )
    throw new Error(`Subtitle text mismatch: ${clip.id}`);
  const before = pauseAt(sentences[0].start),
    after = pauseAt(sentences.at(-1).end);
  const start = Math.max(0, before.end - 0.1),
    end = after.start + 0.18;
  if (end <= start) throw new Error(`Invalid speech boundaries for ${clip.id}`);
  const output = new URL(`../public/audio/sk/${clip.id}.mp3`, import.meta.url),
    pending = new URL(
      `../public/audio/sk/${clip.id}.pending.mp3`,
      import.meta.url,
    );
  await run("ffmpeg", [
    "-y",
    "-v",
    "error",
    "-i",
    media.pathname,
    "-ss",
    String(start),
    "-t",
    String(end - start),
    "-c:a",
    "libmp3lame",
    "-q:a",
    "3",
    pending.pathname,
  ]);
  await rename(pending, output);
  receipts[`sk/${clip.id}`] = createHash("sha256")
    .update(JSON.stringify({ text: clip.text, ...settings }))
    .digest("hex");
  segments.push({
    id: clip.id,
    voice: settings.voice,
    start,
    end,
    text: clip.text,
  });
  console.log(
    `${i + 1}/${clips.length} ${clip.id} ${start.toFixed(2)}–${end.toFixed(2)}s`,
  );
}
await writeFile(receiptFile, JSON.stringify(receipts, null, 2) + "\n");
await writeFile(
  new URL("../public/audio/voices.json", import.meta.url),
  JSON.stringify(VOICE_SETTINGS, null, 2) + "\n",
);
await writeFile(
  new URL("../public/audio/manifest.json", import.meta.url),
  JSON.stringify(narrationManifest(), null, 2) + "\n",
);
await writeFile(
  new URL("../artifacts/slovak-native-segments.json", import.meta.url),
  JSON.stringify(segments, null, 2) + "\n",
);
console.log(
  "All Slovak clips are native Lukáš. No English narrator or accent fallback.",
);
