# EIU Data Challenge — Intelligence Lab

A single-route Next.js experience built around a procedural robotic mascot, spatial command modules and eight distinct content experiences. Design concept: **From Data to Intelligence / Think. Analyze. Transform.**

The event identity is a **2027 unconfirmed concept**. Competition facts are explicitly labeled as **historical 2026 information**. No backend, AI service, database, authentication, registration form or personal-data submission exists.

## Run locally

Node **26 recommended** (tested on 26.8.2). The app runtime supports Node 20.9+, but the installed Vitest/jsdom development tools require Node 22.22.2+, 24.15+ or 26+.

```powershell
npm install
npm run dev
```

Open **http://localhost:2027**. The server binds only to 127.0.0.1.

```powershell
npm run lint
npm test
npm run build
npm start
```

Production uses the same port; stop this project's development server first. Only content route: /. Hashes preserve selected modules and browser history.

## Experiences

- **About / intelligence network:** neural idea controls and editorial masked reveals.
- **Why join / human + machine:** seven selectable skill nodes and connected pathways.
- **Format / analytics pipeline:** keyboard-accessible three-round selection, official historical details, progress states and previous/next controls.
- **Timeline / transformation journey:** horizontal desktop/vertical mobile milestone navigation, scanner, expanded source/date caveats.
- **Prizes / robotic reward vault:** interactive podiums, procedural 3D reward objects, user-triggered reveal burst, full award/voucher conditions.
- **FAQ / knowledge terminal:** deterministic search, categories and accessible answer reveals. It is not an AI chatbot.
- **Partners / intelligence ecosystem:** connected typography-only nodes for verified historical reward providers. These are not confirmed 2027 sponsors.
- **Register / transformation gateway:** flipping access ticket, clear coming-soon status and useful internal exploration actions. No fake signup.

## Data and provenance

- **data/eventContent.js:** 2027 concept identity, navigation modules, accent colors, labels and motion timings.
- **data/competition2026.js:** historical competition facts with IDs, categories, summaries, details, source URLs, edition years and verification status.
- **data/contentSources.js:** source audit, verification outcomes and edition labels.

Verified public sources on 30 October 2026:
[overview / FAQ / prizes](https://eiudatachallenge.com/),
[challenge structure](https://eiudatachallenge.com/challenge-structure/),
[Round 2 update](https://eiudatachallenge.com/round-2-teams/).

Important caveats retained in the UI:
- The dedicated Round 2 page lists uploads from 28 January through 14:00 on 4 February 2026. The homepage's older 21–31 January range is disclosed.
- The homepage workshop range is malformed. No corrected dates are invented.
- The registration/contact pages timed out; the final submission page required verification. These sources are not marked successfully verified.
- contact@eiudatachallenge.com was supplied in the brief, not independently verified from the unavailable contact page.
- The homepage groups video awards under a cash/voucher heading without a clear per-award allocation. This ambiguity is preserved.
- 2026 dates, prizes and rules are never presented as official 2027 information.

## Architecture

- **components/InteractiveHub.jsx:** main composition and dynamic client-only 3D loading.
- **components/experience/ExperienceController.js:** URL/hash state, hover previews, module changes and scene variation.
- **IntelligentNavigation.jsx:** spatial desktop command modules and deliberate mobile selector.
- **ExperienceShell.jsx:** shared Radix infrastructure with section-specific dimensions, composition and transitions; focus return, scroll locking, Escape/outside close.
- **components/sections/:** eight separate interactive content experiences and shared source/detail notes.
- **components/three/RoboticMascot.jsx:** procedural ceramic/metal robot, expressive eyes, pointer tracking and section-specific gestures.
- **AIEnvironment.jsx:** connected neural geometry, restrained pulses, data-to-pipeline transformation, labeled demo charts and 3D reward chamber.
- **SceneChoreography.jsx:** GSAP camera changes.
- **SceneEffects.jsx:** lightweight bloom, disabled on compact/low-performance rendering.
- **ThreeScene.jsx:** environment lighting, adaptive DPR, visibility pause, pause/recenter controls and WebGL/reduced-motion fallback.
- **components/animations/MagneticButton.jsx:** local bounded React Bits-inspired magnetic interaction.
- **components/animation/EntranceSequence.jsx:** scoped GSAP boot/hero/command reveal.
- **styles/lab.css:** spatial layout, eight experience styles, mobile adaptation.
- **styles/tokens.css:** local Space Grotesk, Inter, JetBrains Mono and design tokens.

## Library responsibilities

Three.js + R3F own geometry, materials and frame-based interaction. Drei supplies rounded geometry, procedural environment lighting and performance monitoring. GSAP handles cinematic wrappers, robot entrance and camera transitions. Motion owns command/button feedback, shared portal symbols, panel/section transitions and content controls. Radix supplies accessible modal behavior. Lucide supplies icons. React Three Postprocessing supplies controlled bloom.

GSAP and Motion never animate the same element/property. The robot entrance scale is separate from the frame-driven inner rig. Fonts are local; there are no external models, textures or HDRI requests. Font and React Bits licenses remain in licenses/.

## Validation and limitations

npm test runs component/data tests in jsdom, including all eight dialogs, switching, Escape/focus return, outside dismissal, keyboard levels, timeline caveats, reward reveals, FAQ search, access-ticket state, scene pause/visibility controls and edition provenance.

The GPU canvas is mocked in DOM tests. Those tests do **not** verify shader output, visual quality or device performance. No browser was opened and no screenshots were taken. Review the real 3D result at localhost. Current build/lint/test outcomes are reported in the delivery message.
