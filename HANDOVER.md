# 🪶 Leo

## Current state

English/Slovak tablet museum. Six machines, four interactive lessons each, 100 bundled recordings. Artistic Leo is approved. Native Slovak Lukáš must not be replaced with an English multilingual narrator.

Three screenshot polish passes unify controls and centre the title, action and steps. Concave gear side edges render below their tops, tooth vertices are unique, and spring stages share one camera. Platform ordering, knight boots and visor are corrected. Proof and limitations: [docs/POLISH.md](docs/POLISH.md).

Touch does not interrupt narration. `src/lesson-guide.js` sequences an introduction and one discovery after both audio and manipulation settle. Explicit pause, mute and navigation cancel pending speech. Spring discovery requires a full winding. Home / Domov is a separate control. The full screw rocks on a grounded foot twice, then returns to rest. Springs tighten around fixed outer anchors and tint with stored energy. See [the interaction pass](docs/INTERACTION.md).

The expansion adds parachute drag/fair tests, a reversible paddle boat and a four-action canal lock. Six choices fit one screen. Robot cords are longer, highlighted and easier to see; markers fade after use. The lock boat has a stronger silhouette and cargo. Research, architecture and proof: [docs/EXPANSION.md](docs/EXPANSION.md).

Latest feedback pass: broadside paddle, stronger stroke-driven wakes, explicit Back/Forward controls, basket landing bounce, +/− canopy sizing beside a fixed medium reference, and waterline-split blue gate parts. Updated SK/EN parachute instructions. Action controls sit above the portrait in portrait mode. See `scripts/capture-water.mjs` and the feedback section in the expansion report.

Release check adds correct, screen-scaled paddle dragging and arrow keys, alternating strokes, no boat reset during rapid taps, and an explicit Again state. Invalid step links and invalid saved language values recover safely. Release report: [docs/RELEASE.md](docs/RELEASE.md).

Six-machine release candidate is validated and ready for production deployment. All work since the three-machine baseline is included in this release.

## Shipping

The repository is open source. Original code, text, documentation and illustrations
are MIT licensed. Preserve the third-party licenses and narration exclusion in
`NOTICE.md`. The npm package stays private to prevent accidental npm publishing.

GitHub: `virpo/leo`. Netlify: `leo-virpo`, team `virpo`. Public fallback: https://leo-virpo.netlify.app/. Custom domain: `leo.virpo.io`. DNS and normal HTTPS validation work as checked on 2026-10-18. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

Source is pushed to `main`. Netlify CLI production deployment works. Automatic Git deployment is not connected. Vercel’s separate `echt` identity blocked the committed build, so the existing authenticated Netlify account is the shipping host. No author identity or access policy was changed.

Run `npm run check`, `npm run check:browser`, `npm run check:ux`, `npm run check:experiments`, `npm run check:release`, `npm run build`. Browser checks use localhost:5174 by default; set `LEO_TEST_URL` for the built preview or production. Full-resolution QA files and old portraits remain locally in ignored `artifacts/`. No physical iPad has been tested.
