import { test } from "node:test";
import assert from "node:assert/strict";
import { createLessonGuide } from "../src/lesson-guide.js";

function fixture() {
  const calls = [], pending = [], timers = new Map();
  let next = 0;
  const guide = createLessonGuide({
    instruction: "intro", result: "discovery",
    play: (id) => {
      calls.push(id);
      return new Promise((resolve) => pending.push(resolve));
    },
    stop: () => pending.shift()?.("cancelled"),
    schedule: (fn) => { timers.set(++next, fn); return next; },
    cancel: (id) => timers.delete(id),
  });
  return {
    guide, calls,
    async end(outcome = "ended") { pending.shift()?.(outcome); await Promise.resolve(); },
    flush() { const jobs = [...timers.values()]; timers.clear(); jobs.forEach((fn) => fn()); },
    get queued() { return timers.size; },
  };
}
test("touch never interrupts an instruction, discovery waits for both voice and hands", async () => {
  const f = fixture();
  f.guide.explain();
  f.guide.observe(true, true);
  f.flush();
  assert.deepEqual(f.calls, ["intro"]);
  await f.end();
  assert.equal(f.queued, 0, "still being manipulated");
  f.guide.observe(false);
  assert.equal(f.queued, 1);
  f.guide.observe(true);
  assert.equal(f.queued, 0, "another touch cancels the quiet gap");
  f.guide.observe(false);
  f.flush();
  assert.deepEqual(f.calls, ["intro", "discovery"]);
  await f.end();
  f.guide.observe(true, true);
  f.guide.observe(false, true);
  f.flush();
  assert.equal(f.calls.length, 2, "no repeated chatter");
});
test("a settled mechanism does not cut off the introduction", async () => {
  const f = fixture();
  f.guide.explain();
  f.guide.observe(false, true);
  f.flush();
  assert.deepEqual(f.calls, ["intro"]);
  await f.end();
  assert.equal(f.queued, 1);
  f.flush();
  assert.deepEqual(f.calls, ["intro", "discovery"]);
});
test("pause, blocked audio and route disposal cannot release stale speech", async () => {
  for (const outcome of ["cancelled", "muted", "error"]) {
    const f = fixture();
    f.guide.explain();
    f.guide.observe(false, true);
    await f.end(outcome);
    f.flush();
    assert.deepEqual(f.calls, ["intro"]);
  }
  const f = fixture();
  f.guide.explain();
  f.guide.observe(false, true);
  f.guide.pause();
  await Promise.resolve();
  f.flush();
  assert.deepEqual(f.calls, ["intro"]);
  f.guide.explain();
  assert.deepEqual(f.calls, ["intro", "discovery"], "Leo replays the discovered idea");
  f.guide.dispose();
  await f.end();
  f.guide.observe(false, true);
  f.flush();
  assert.equal(f.calls.length, 2);
});
test("no result before a real discovery, including a partially wound spring", () => {
  const f = fixture();
  f.guide.observe(false, false);
  f.flush();
  assert.deepEqual(f.calls, []);
  f.guide.observe(false, true);
  f.flush();
  assert.deepEqual(f.calls, ["discovery"], "silent deep links still respond to play");
});
