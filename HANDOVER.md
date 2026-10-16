# 🪶 Leo

## Current state

English/Slovak tablet museum. Three machines, four interactive lessons each, 52 bundled recordings. Artistic Leo is approved. Native Slovak Lukáš must not be replaced with an English multilingual narrator.

Three screenshot polish passes unify controls and centre the title, action and steps. Concave gear side edges render below their tops, tooth vertices are unique, and spring stages share one camera. Platform ordering, knight boots and visor are corrected. Proof and limitations: [docs/POLISH.md](docs/POLISH.md).

## Shipping

GitHub: `virpo/leo`. Netlify: `leo-virpo`, team `virpo`. Public fallback: https://leo-virpo.netlify.app/. Corrected custom domain: `leo.virpo.io`. It is attached; Namecheap still needs the CNAME in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

Source is pushed to `main`. Netlify CLI production deployment works. Automatic Git deployment is not connected. Vercel’s separate `echt` identity blocked the committed build, so the existing authenticated Netlify account is the shipping host. No author identity or access policy was changed.

Run `npm run check`, `npm run check:browser`, `npm run build`. Browser checks use localhost:5174 by default; set `LEO_TEST_URL` for production. Full-resolution QA files and old portraits remain locally in ignored `artifacts/`. No physical iPad has been tested.
