# 🪶 Leonardo's Little Workshop

An independent, museum-inspired interactive notebook for ages 5–9, with visual cause and effect and optional narration for younger children.

## Three choices

Flying screw, wind-up cart, mechanical knight. Flight, vehicles and a friendly moving character offer different motivations and different mechanisms. NAEYC's age-and-stage toy guidance supports transportation, construction, pretend characters and exploratory play. These are design judgments, not a measured popularity ranking.

Four steps each, one cause and one visible result per step:

| Machine           | 1                     | 2                      | 3                               | 4                                                       |
| ----------------- | --------------------- | ---------------------- | ------------------------------- | ------------------------------------------------------- |
| Flying screw      | Turn a shaft          | Add a spiral sail      | Compare slow and fast rotation  | Test the complete idea, discover that it stays grounded |
| Wind-up car       | Roll a wheel and axle | Mesh two gears         | Store energy in a spring        | Release the spring to drive the cart                    |
| Mechanical knight | Bend a hinged arm     | Pull a cord to bend it | Redirect the pull with a pulley | Turn a crank to make the complete knight wave           |

## Anatomy drawing plan

Three Figure-sized objects, illustrated with the Anatomy projection and solid geometry kit. Opaque warm paper fills, fine brown ink, shaded volumes, purposeful construction details. Keep interactive targets large and text outside the mechanisms. No WebGL is needed. A single time-based model drives all moving parts and readouts. The notebook theme is deliberately light, including when the device uses dark mode.

Parts grouped before geometry:

- Screw: platform, rim, 9 deck planks, 8 rim pegs, four feet, mast, foot bearing, upper bearing, handle hub, four push bars, four handle grips, four mast braces, 16 fabric seams, spiral fabric panels, outer reed edge, 12 reed ribs, mast cap.
- Cart: two chassis rails, five crossmembers, deck slats, three wheels, six wheel rims, 18 wheel spokes, three axle hubs, two axles, six bearing blocks, two drive gears, 36 gear teeth, two spring drums, two springs, winding shaft, crank, grip, brake lever, steering fork, wheel pegs.
- Knight: plinth, four feet, two shoes, two ankles, two calves, two knee joints, two thighs, hip, belt, six torso plates, spine, neck, collar, helmet, visor, visor slots, two shoulder joints, two upper arms, two elbows, two forearms, two cuffs, two palms, ten fingers, two pulleys, pulley pins and brackets, two cords, crank wheel, crank grip, eight rivets.

## Accuracy

These are simplified educational models. The screw does not actually fly. A fixed pulley redirects force and does not create energy. Cart gearing uses a 12-tooth driver and a 24-tooth follower, with opposite rotations and a 2:1 angle ratio. Cart travel and wheel angle share one model. Knight mechanisms are explicitly described as a modern interpretation of Leonardo's sketches, not a surviving original robot.

## Sources

- [Museo Leonardiano: aerial screw](https://museoleonardiano.it/en/opera/aerial-screw/), linen sail, central mast and human-powered push bars.
- [Museo Galileo: cart and automata studies](https://teche.museogalileo.it/leonardo/foglio/index.html?lang=en&num=ATL.1623.1).
- [Leonardo3: robot soldier reconstruction](https://www.leonardo3.net/en/l3-research-center/l3-collection/robot-soldier-1294.html).
- [NAEYC: toys by age and stage](https://www.naeyc.org/resources/topics/play/toys/).

## Tablet revision

The notebook became a fixed-screen iPad exhibit after Peter's play-test feedback. Keep big titles, models and one large action. Leo explains by voice, not paragraphs. No footnotes, figure metadata, idle tours or automatic machines. Those Anatomy defaults are intentionally overridden by the child-first brief.

Leo began as a four-tone vector puppet, then became an original Renaissance-style pen-and-ink portrait after Peter asked for more artistry. The face stays expressive while the robe shading fades into the parchment. An isolated matching mouth frame moves only during actual speech. SK / EN changes the full interface and 52 bundled recordings. Slovak now uses native Lukáš, not the English-accented multilingual voice. English keeps Andrew.

The cart gears use a shared 20° involute profile and module, coplanar faces and a 2:1 opposite rotation ratio. The winding crank follows its shaft angle. The gear fill rule is nonzero; hollow wheel rims alone use evenodd. The former global evenodd fill created false holes in concave solid gears. Preview and lesson camera geometry have separate cache namespaces.

Landscape uses a large mechanism with Leo beside it. Portrait gives the mechanism the main column and keeps Leo near the action. The layout uses the dynamic usable viewport and cannot page-scroll. Home Screen metadata supports an iPad standalone view. Physical-device validation is still required.

## Quality tasks

- [x] Research, choose machines and define four steps per machine.
- [x] Build drawings, responsive notebook, narration and lesson progression.
- [x] Verify all twelve interactions, replay, persistence and keyboard navigation.
- [x] Inspect desktop, 390 px mobile, reduced motion and enlarged mechanism details.
- [x] Independent visual critique, repair visible issues, capture final evidence.
