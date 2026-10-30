# EIU Data Challenge — Intelligence Lab

## Latest direction

Continue this existing Next.js App Router / React / JavaScript and JSX / plain CSS project. Latest user direction supersedes the earlier abstract data-core design: **From Data to Intelligence / Think. Analyze. Transform.**

Use the new procedural ceramic/metal robotic mascot, neural/data environment and eight spatial AI command modules. Do not restore the old standalone server, copied EIU branding, TypeScript scene, desk/drone scene, generic torus or bottom card dock unless explicitly requested.

UI is English. Communicate briefly in Vietnamese and provide http://localhost:2027.

## Content integrity

- data/eventContent.js defines the unconfirmed 2027 concept, commands, accents and labels.
- data/competition2026.js preserves historical facts and detailed conditions.
- data/contentSources.js records source URLs and verification outcomes.
- Never relabel 2026 dates, rules, rewards or providers as official 2027 information.
- Retain Round 2's dedicated update vs homepage discrepancy, ambiguous workshop date, and failed-source notes.
- Contact email is supplied in the brief; contact/registration pages timed out.
- Provider names in Partners are historical voucher providers, not confirmed 2027 sponsors. No invented logos.
- FAQ is deterministic search, not a backend AI chatbot. Charts are demonstration data.
- No fake registration forms, APIs, auth, database, personal-data storage or publishing.

## Architecture

- InteractiveHub.jsx composes the lab; ExperienceController.js preserves hash/history and hover/active state.
- IntelligentNavigation.jsx provides keyboard/touch-accessible spatial commands and mobile controls.
- ExperienceShell.jsx shares only accessible modal infrastructure. Eight components under components/sections/ have distinctive layouts/interactions.
- Preserve focus return, Escape/outside dismissal, panel scrolling, previous/next and direct chapter switching.
- Reduced-motion section switching must never wait on an exiting animation.
- RoboticMascot, AIEnvironment, SceneChoreography and SceneEffects own 3D systems. ThreeScene is dynamically client-loaded.
- Keep GPU work limited: low particle count, adaptive DPR, compact-device bloom disabled, hidden-tab pause, static reduced-motion/WebGL fallback.
- GSAP owns entrance wrappers/robot entrance scale/camera position. Motion owns UI transitions. Frame updates own the inner robotic rig. Do not overlap property ownership.
- Reuse locally hosted Space Grotesk, Inter and JetBrains Mono. Keep licenses.

## Working rules and commands

Work only inside this project; never touch the parent course or its secrets/data. Do not open a browser or capture screenshots unless requested. Local draft only.

The current briefs authorize dependency installation, lint, automated interaction tests and production build.

```powershell
npm install
npm run dev
npm run lint
npm test
npm run build
```

The active local server is http://localhost:2027, loopback only. Reuse it and do not stop other projects. Node 26 is recommended for installed test tooling; see README for runtime/tooling versions.

Tests use jsdom and mock the GPU canvas. Do not claim visual/WebGL validation from those tests. Report actual build/lint/test results.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
