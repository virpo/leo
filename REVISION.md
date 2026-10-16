# 🪶 Tablet museum revision

Peter's feedback is the brief. One fixed screen, primarily for iPad Air in either orientation. Large titles, an expressive talking Leo, large models and direct manipulation. No page scrolling, decorative captions or self-running machines.

- [x] Replace browser speech synthesis with bundled natural English and Slovak narration.
- [x] Translate the interface and all spoken teaching content into English and natural Slovak.
- [x] Replace the photographic portrait with a custom ink character that speaks.
- [x] Remove the long homepage, footers, metadata, captions and duplicate instructions.
- [x] Fit home, twelve learning views and return to selection into a fixed tablet viewport.
- [x] Remove automatic movement. Drag to turn or use a deliberate large tap control.
- [x] Make airflow strong and clearly connected to rotation.
- [x] Make the cart crank rotate around its shaft.
- [x] Put both gears in one plane and fix the meshing geometry and drawing order.
- [x] Check portrait and landscape iPad Air viewport sizes in Chrome and WebKit, including reduced browser-chrome space.
- [x] Review the real rendered output, then verify input, audio and targeted mechanism geometry.

Physical iPad Safari and a play session with a child remain manual checks. Automated viewport emulation is not physical-device proof.

## Reference inspected

`../ainator/src/Genie.tsx` renders its generated character through a Canvas ASCII luminance ramp. The first replacement was a vector ink character. Peter requested more artistry, so the current guide is an original fine pen-and-ink portrait with a live mouth, softened robe shading and transparent edges. The reference project remains unchanged.

## Voice direction

Warm, clear male narration. Short sentences addressed to one child. Slovak uses native Lukáš. The former Andrew multilingual fallback had an English accent and was rejected. All 26 Slovak recordings were replaced using a successful native batch stream, verified subtitles and silence-aligned cuts. English keeps Andrew. Bundle audio locally; never fall back to an English speaker for Slovak or to device-dependent SpeechSynthesis.
