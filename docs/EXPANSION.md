# 🪶 Air and water

## Choice and evidence

Three Figure-sized teaching models, four steps each. The new concepts are air resistance, propulsion through water and water-level control. Keep the existing touch-first narration, no idle demonstrations, bilingual audio and a single tablet screen.

| Model | Four discoveries | Why this one |
| --- | --- | --- |
| Parachute | Gravity; a canopy slows the same cargo; compare two sizes; change the canopy and test again | A visible fair test. Equal loads, one changed variable. A basket replaces the museum mannequin. |
| Paddle boat | One paddle pushes water; a wheel repeats the stroke; twin wheels move the boat; reverse the wheels to reverse travel | Familiar boat play with visible action and reaction. Both wheels share an axle, not independent steering. |
| Canal lock | Connected water levels meet; a floating boat rises with water; equal levels allow a gate to open; close, fill, open, leave | A small sequencing puzzle. Water moves the boat vertically, not a hidden platform. |

The museum's parachute has a rigid square wooden frame and pyramidal cloth canopy. Do not show a modern folded canopy opening during a fall. Leonardo studied and improved locks; do not claim he invented the canal lock. The paddle boat is a simplified arm-powered version, not the specific pedal-driven reconstruction in Leonardo3's folio 945r exhibit.

Child appeal is a design judgment, not a popularity ranking. NAEYC describes water play, transport toys and float/sink investigations for preschool children. NASA's pre-K resource includes comparing parachute size and fall speed. These support the chosen interactions, not claims about learning outcomes from this app.

## Parts before geometry

- Parachute: landing tray, four feet, four rim rails, four corner pegs, eight floor slats; basket floor, eight basket slats, two binding bands, four corner posts, cargo, four suspension cords, four corner eyelets; four square frame rails, four inclined spars, apex cap, four cloth panels, eight sewn hems, twelve fabric seams. The full object has more than forty purposeful parts. Comparison models share cargo mass and drop height.
- Boat: water tray, four feet, four rim rails, eight bed slats, water surface and front face; keel, floor, six hull strakes, bow, stern, four ribs, four gunwale rails, two seats, four seat pins; common axle, two bearing blocks, two hubs, sixteen spokes, sixteen paddle boards, crank, crank grip, rudder and rudder pin. Earlier steps isolate a stroke and one wheel.
- Lock: floor slab, four feet, three canal beds, back wall, two end walls, front cutaway rails, four gate posts, four hinge pins, four gate leaves, eight reinforcing rails, twelve plank seams, eight hinge straps, eight hinge pegs; inlet, valve blade, valve stem, handwheel, water surfaces and cut faces; boat floor, six hull strakes, bow, stern, seat, four pegs. Every gate is held at its hinge. The water and boat use one shared level.

The water is an ink-tinted SVG volume, not a photorealistic shader. Static parts are cached, motion is time-based and deliberately stops. The unchanged paper/light theme is the only shipping theme.

## Rendered refinement

Before evidence: the original three-choice home and thin robot cord are preserved as local `artifacts/six-before-*` captures. The approved portrait, paper palette and four-step controls are unchanged.

The first rendered pass exposed water faces hiding the boat. Water now sits in an explicit cutaway layer between the tank and its floating mechanisms. The lock camera looks toward the high-water end, so the boat and gates remain visible. Rim rails paint over floor seams. Gate plank seams use the visible face, not a painter's-order bias.

The fair-drop comparison uses a straight-on camera: equal starting and landing heights are visually aligned. Both loads share one clock, mass and height. Only canopy area changes. Falling assemblies use transforms, and the paddle boat translates independently of the fixed water tray. Static hull and wheel geometry is cached.

The independent screenshot review found the lock boat too easy to confuse with a timber fitting. The final version enlarges it, strengthens its hull outline and adds a small cargo parcel. The robot cord has a longer taut path, thicker rust ink and a wooden T-grip rather than a tiny vertical peg. Its marker fades after use deliberately. The whole model and large action button remain touch targets, not just the grip. The home speech control is moved clear of Leo's face in portrait and phone layouts.

## Verification and verdict

- 26 unit checks cover equal-load drag, bounded landing bounce, fixed medium comparison canopy, broadside paddle geometry, water-plane wakes, waterline-split gate leaves, opposite wheel/travel direction, conserved water, gate interlocks, finite drawing paths, fixed anchors, paint layers, both languages and all 100 audio files.
- Chrome and WebKit test all 24 lessons, narration sequencing, actual new SK/EN playback, touch, keyboard, +/− canopy resizing, simultaneous drops, moving wakes, reversed travel, rapid-tap protection and the complete lock sequence. Reduced motion preserves the final poses and four deliberate lock operations.
- All twelve new resting lessons and three rope lessons have zero floating line ends and clean consoles with the Anatomy line checker. Motion states and junctions are captured separately at 4×.
- Landscape, portrait, compact tablet and 390 px phone screenshots are in ignored `artifacts/six-*`. Reproduce them with `node scripts/capture-expansion.mjs`.
- In a Chrome run with 4× CPU throttling, 95th-percentile animation callback work was 2.5 ms for the parachute, 15 ms for the paddle boat and 9 ms for the filling lock. This measures script work, not physical iPad frame rate.
- The general Anatomy shape-recorder audit has not been retrofitted to this scene renderer. These are educational illustrations, not collision-certified engineering reconstructions. Physical iPad Safari and a child play-test remain manual checks.

Verdict: implemented and browser-verified locally. The published baseline is unchanged. No push or deployment was performed for this pass.

## Feedback pass: water, comparison and landing

### Target and north star

Keep the approved ink-on-paper tablet museum. The mechanism should make the concept visible without more labels or extra explanation.

### Before evidence

`artifacts/water-before-boat.png`, `water-before-parachute.png` and `water-before-lock.png` capture the routes in Peter's feedback at 1180×740. His lock close-up exposed opaque dry-looking gates below the water surface.

### Ranked findings

1. Broken: the single paddle's broad face lay along its travel, so it cut through water edge-first. Water marks were too faint to explain propulsion.
2. Confusing: boat reversal used the same single button as forward travel. Canopy sizing had a hidden drag gesture and no fixed comparison.
3. Broken: lock mechanisms were painted after the entire water volume, making submerged wood look dry.
4. Unfinished: baskets stopped abruptly on contact. Portrait artwork could intercept a newly added direction button.

### Changes made

The blade is rotated 90 degrees and split at its immersion depth. Curved blue wakes come from actual paddle motion and reverse with the push. They fade when the mechanism settles and never animate at idle. The final boat lesson has explicit Back and Forward controls. Leo's reversal discovery requires both directions.

The last parachute lesson keeps a medium canopy on the left. Large +/− buttons resize only the right one, across five sizes. Both loads share one release clock and height; controls are locked during the fall. Two small dissipating rebounds finish before discovery narration. Reduced motion skips the rebound. The changed instruction is rerecorded in native Slovak and English.

Gate leaves, plank seams, posts and sluice mechanisms split at the waterline on the camera-facing side. Their immersed sections use a blue-tinted wood palette; the upper rails stay dry. The split follows rising water, including every full-lock phase. Action rows paint above the portrait so all visible controls remain tappable.

### After evidence and checks

`node scripts/capture-water.mjs` reproduces moving wakes, fair comparisons, bounce and all lock phases, plus phone/portrait layouts and 4× blade/gate details. The independent visual pass confirmed broadside paddle faces, clear direction buttons, legible comparison controls and submerged gate tint. Its wake contrast concern prompted a darker, wider wake and an active phone capture. The new browser matrix also checks the element actually receiving each action-button tap.

All 26 unit tests pass. All fifteen new/cord resting views have zero floating line ends. Chrome and WebKit cover the changed interactions and narration. Physical iPad Safari and a child play-test remain manual checks.

### Verdict: pass

The requested interactions and waterlines are visible in the rendered browser. Local changes only, not pushed or deployed. This is a simplified cutaway with tinted submerged parts, not a general transparent-fluid ray tracer or a collision-certified reconstruction.

## Primary sources

- [Museo Scienza: parachute, IGB-423](https://collezioni-online.museoscienza.org/detail/IT-MUST-NTR001-008405/paracadute). Square pyramid, wooden structure, cloth and cord.
- [Leonardo3: paddle boat](https://www.leonardo3.net/en/l3-research-center/l3-collection/paddle-boat-1297.html). Arm-powered designs, the pedal variant and a shared wheel speed.
- [Museo Leonardiano: canal bridge with basins](https://museoleonardiano.it/en/opera/canal-bridge-with-basins/). Miter gates, small floodgates and gradual equalization.
- [NASA Glenn: size effects on drag](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/size-effects-on-drag/). At the same speed and drag coefficient, force is proportional to reference area.
- [NASA JPL: parachute design](https://www.jpl.nasa.gov/edu/resources/lesson-plan/parachute-design/). Equal payloads and testing canopy changes.
- [NASA: aeronautics for pre-K](https://www.nasa.gov/wp-content/uploads/2015/06/aero_with_you_when_you_fly.pdf). Parachute comparison activity, page 48.
- [NAEYC: water play](https://www.naeyc.org/our-work/families/play-in-puddle), [age-appropriate toys](https://www.naeyc.org/resources/topics/play/toys/).
