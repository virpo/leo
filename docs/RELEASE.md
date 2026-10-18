# 🪶 Six-machine release check

## Target and north star

Ship the existing ink-on-paper museum at `leo.virpo.io`, retaining six choices, four lessons each, SK/EN narration and one tablet screen. Prioritize functional correctness, not another redesign.

## Before evidence

A 70 px rightward swipe moved the single paddle about 33 px left. Its arrow keys used the same inverted angle mapping. The first release regression failed with `left swipe moves the paddle left`. Rapid taps could reset the moving paddle boat. A fractional step URL produced `Cannot read properties of undefined (reading 'title')`.

## Ranked findings

1. Broken: a linear paddle reused a rotational drag mapping, reversing direct manipulation and keyboard directions.
2. Broken: repeated taps reset the paddle or moving boat instead of continuing from the visible state.
3. Broken: a fractional step could select a nonexistent lesson. Invalid saved language values could also break routing.

## Changes made

Invert the blade's actual `x = 35 cos(angle)` position and convert screen pixels through the drawing's real projection. Both drag directions and arrow keys now move in the expected direction. Dragging takes over the visible pose, not the old target. Repeated paddle taps alternate strokes without a hidden reset. Rapid taps cannot teleport the boat; a settled journey explicitly offers Again. Step values become bounded integers, and unsupported saved languages fall back to Slovak.

Earlier local work is included: touch-first narration, failed flying-screw attempts, visible spring tension, six machine choices, parachute comparison controls and bounce, reversible paddle boat, sequenced canal lock, blue submerged gate parts and stronger robot cords.

## After evidence and checks

- 27 unit tests, including position inversion and travel bounds.
- Chrome and WebKit: all 24 lessons in both languages, actual MP3 playback, touch, drag, keyboard, reduced motion, no idle demonstrations, narration sequencing and tablet/phone fit.
- Separate release regressions: both paddle drag/key directions, alternating strokes, rapid-tap continuity, explicit replay, phone/portrait touch targets, malformed links and all 100 audio files returning real MP3 bytes.
- Screenshots: `artifacts/release-paddle-start.png`, `release-paddle-left.png`, `release-paddle-right.png` and the `water-*` motion/layout captures. The screenshot check preserves the approved visual direction and checks the actual control positions.
- Production build and `git diff --check`. Runtime dependency audit reports zero vulnerabilities.

## Verdict

Local functional checks pass. Production publication and live verification are the final release gate. Physical iPad Safari and a child play-test remain manual checks. The models remain educational simplifications, not engineering plans.
