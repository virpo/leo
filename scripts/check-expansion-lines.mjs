import { spawn } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";
const base = process.env.LEO_TEST_URL || "http://localhost:5174";
const skill = join(process.env.ANATOMY_SKILL_PATH || join(homedir(), ".codex/skills/anatomy"), "scripts/lines.mjs");
let failures = 0;
for (const kind of ["parachute", "boat", "lock", "knight"])
  for (let step = kind === "knight" ? 2 : 1; step <= 4; step++) {
    const route = `sk/${kind}/${step}`;
    const child = spawn("node", [skill, `${base}/#${route}`, "--select", ".model-stage", "--reduced", "--wait", "100"], { stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (chunk) => { output += chunk; });
    child.stderr.on("data", (chunk) => { output += chunk; });
    const code = await new Promise((resolve) => child.on("close", resolve));
    console.log(`${route}: ${output.trim()}`);
    if (code !== 0) failures++;
  }
process.exitCode = failures ? 1 : 0;
