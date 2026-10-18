// A child's hands never compete with the guide. Finish the thought, let the
// mechanism settle, then offer its discovery once. No timed interruptions.
export function createLessonGuide({
  play,
  stop,
  instruction,
  result,
  delay = 650,
  schedule = setTimeout,
  cancel = clearTimeout,
}) {
  let alive = true, generation = 0, timer = null;
  let busy = false, active = false, discovered = false;
  // A deep link may open silently. Its first real discovery can still speak.
  let introduced = true, delivered = false, automatic = true;
  const clear = () => {
    if (timer !== null) cancel(timer);
    timer = null;
  };
  const offer = () => {
    if (!alive || busy || active || !introduced || !discovered || delivered || !automatic || timer !== null) return;
    timer = schedule(() => {
      timer = null;
      tell(result);
    }, delay);
  };
  async function tell(id) {
    clear();
    const request = ++generation;
    busy = true;
    if (id === instruction) introduced = false;
    if (id === result) delivered = true;
    const outcome = await play(id);
    if (!alive || request !== generation) return;
    busy = false;
    if (outcome !== "ended") automatic = false;
    else if (id === instruction) introduced = true;
    offer();
  }
  return {
    explain() {
      automatic = true;
      return tell(discovered ? result : instruction);
    },
    observe(moving, ready = false) {
      if (!alive) return;
      active = moving;
      discovered ||= ready;
      if (active) clear();
      else offer();
    },
    pause() {
      clear();
      generation++;
      busy = false;
      automatic = false;
      stop();
    },
    dispose() {
      alive = false;
      generation++;
      clear();
    },
  };
}
