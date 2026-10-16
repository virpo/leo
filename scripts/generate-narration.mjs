import { spawn } from "node:child_process";
import { mkdir, stat, readFile, writeFile, rename } from "node:fs/promises";
import { narrationManifest } from "../src/content.js";
import { VOICE_SETTINGS } from "../src/voices.js";
import { createHash } from "node:crypto";

const clips = narrationManifest();
let previous = [];
let previousVoices = {};
try {
  previousVoices = JSON.parse(
    await readFile(
      new URL("../public/audio/voices.json", import.meta.url),
      "utf8",
    ),
  );
} catch {}
const receiptFile = new URL("../public/audio/receipts.json", import.meta.url);
let receipts = {};
try {
  receipts = JSON.parse(await readFile(receiptFile, "utf8"));
} catch {}
try {
  previous = JSON.parse(
    await readFile(
      new URL("../public/audio/manifest.json", import.meta.url),
      "utf8",
    ),
  );
} catch {}
let finished = 0;
async function generate(clip) {
  const directory = new URL(`../public/audio/${clip.lang}/`, import.meta.url);
  await mkdir(directory, { recursive: true });
  const output = new URL(`${clip.id}.mp3`, directory);
  const temporary = new URL(`${clip.id}.pending.mp3`, directory);
  const settings = VOICE_SETTINGS[clip.lang],
    oldSettings = previousVoices[clip.lang];
  const key = `${clip.lang}/${clip.id}`,
    fingerprint = createHash("sha256")
      .update(JSON.stringify({ text: clip.text, ...settings }))
      .digest("hex");
  try {
    if (
      !process.argv.includes("--force") &&
      (receipts[key] === fingerprint ||
        (["voice", "rate", "pitch"].every(
          (key) => oldSettings?.[key] === settings[key],
        ) &&
          previous.some(
            (old) =>
              old.lang === clip.lang &&
              old.id === clip.id &&
              old.text === clip.text,
          ))) &&
      (await stat(output)).size > 1000
    )
      return;
  } catch {}
  const attempt = () =>
    new Promise((resolve, reject) => {
      const child = spawn(
        "uvx",
        [
          "--from",
          "edge-tts==7.3.1",
          "edge-tts",
          "--voice",
          settings.voice,
          `--rate=${settings.rate}`,
          ...(settings.pitch === "+0Hz" ? [] : [`--pitch=${settings.pitch}`]),
          "--text",
          clip.text,
          "--write-media",
          temporary.pathname,
        ],
        { stdio: ["ignore", "ignore", "pipe"] },
      );
      let error = "";
      child.stderr.on("data", (chunk) => (error += chunk));
      child.on("error", reject);
      child.on("exit", (code) =>
        code === 0
          ? resolve()
          : reject(new Error(`${clip.lang}/${clip.id}: ${error}`)),
      );
    });
  for (let retry = 0; retry < 12; retry++) {
    try {
      await attempt();
      if ((await stat(temporary)).size < 1000) throw new Error("Empty audio");
      await rename(temporary, output);
      receipts[key] = fingerprint;
      await writeFile(receiptFile, JSON.stringify(receipts, null, 2) + "\n");
      return;
    } catch (error) {
      if (retry === 11) throw error;
      console.log(`Retry ${clip.lang}/${clip.id}`);
      await new Promise((resolve) =>
        setTimeout(resolve, 800 * Math.min(retry + 1, 5)),
      );
    }
  }
}
for (const clip of clips) {
  await generate(clip);
  finished++;
  console.log(`${finished}/${clips.length} ${clip.lang}/${clip.id}`);
}
await writeFile(
  new URL("../public/audio/manifest.json", import.meta.url),
  JSON.stringify(clips, null, 2) + "\n",
);
await writeFile(
  new URL("../public/audio/voices.json", import.meta.url),
  JSON.stringify(VOICE_SETTINGS, null, 2) + "\n",
);
console.log(
  "All narration is bundled locally. No browser speech synthesis is used.",
);
