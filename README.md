# EIU Data Challenge ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Intelligence Lab

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
- The dedicated Round 2 page lists uploads from 28 January through 14:00 on 4 February 2026. The homepage's older 21ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“31 January range is disclosed.
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
- **components/three/RobotStudio.jsx:** native React mount for the user's `3d_chibi_robot_coder_animation (1).html` scene. Only the model is mounted: no iframe, header, toolbar, audio controls or white background. The scene sits on the left of the desktop layout, with the heading and content navigation on the right. The page remains one viewport tall, with a static four-robot fallback for reduced motion or unavailable WebGL.
- **components/three/studio/createRobotStudio.js:** retains the authored procedural shapes with colored-pencil blue, green, orange and pink pigments, matte paper shading, crosshatching and crisp graphite outlines. The entire composition uses a uniform 2x scale and camera framing includes all four chairs. Canvas DPR is capped, texture animation is throttled, and offscreen/hidden scenes stop their frame loop.
- **components/three/studio/createCompanionRobots.js:** mint, coral and orchid sit on individual copies of the primary racing chair, with matching hip/cushion contacts and clear suspended feet. World-space motion bounds reserve each robot and chair before placement; resize never changes their size or position.
- **components/three/studio/robotExpressions.js:** white LED eyes on a black dot-matrix display switch between focused, attentive, curious, happy and sleepy expressions, with independent blink phases. The smile-shaped eye is one expression rather than the default pose.
- **components/three/studio/studioSurfaces.js:** the curved rounded visor sits outside the helmet surface to avoid the original intersecting sphere/z-fighting. Explicit sRGB textures, linear-light material colors and restrained environment reflections prevent the original washed-out palette. The primary workstation is uniformly enlarged, preserving its hand/keyboard and hip/seat contacts. The new desktop retains the original prop contact height.
- **components/three/studio/studioRig.js:** two-bone hand IK, independent finger/key presses, seated thighs and shorter, gently swinging legs with soles clear of the floor. The headphone cable updates its existing vertex buffer rather than replacing geometry every frame.
- **components/three/studio/studioHardware.js:** curved monitor housing, webcam and weighted stand, with an outward-facing screen and left-to-right UVs. The navy glass PC adds chassis posts, top ventilation, front USB/power controls, fasteners, motherboard, GPU cooling fins and liquid-cooling tubes. The animated screen shows code and labeled demonstration charts.
- **components/three/studio/studioContours.js:** thin outlines follow major moving parts with fixed per-group budgets. Metallic shells, bevels and silhouettes keep the monitor, PC, desk and four robots readable.
- **components/three/studio/studioEntrance.js:** a scene-clock GSAP sequence fades in the workstation; each chair turns outward, all four robots walk in, climb and sit together, then swivel toward the workstation. All four monochrome chairs appear before the robots enter. The 7.4-second introduction pauses with the scene and runs once per mount. Temporary walking geometry and fade materials are disposed after arrival.
- **components/three/studio/studioPencil.js:** all physical surfaces use nonmetallic matte shading, procedural paper grain and crossed pencil strokes. The initial grayscale presentation transitions to brighter colored pencil pigments across robots, matching chairs, workstation props, monitor and PC on the first page click. Textures on displays and supplied chair logos stay sharp; all chair bases are black.
- **components/three/studio/studioLocomotion.js:** articulated hip/knee/ankle IK alternates planted feet and lifted swing feet, with a deeper step during climbing. Chair approaches and swivels are reserved in world space.
- **components/three/studio/studioChairBranding.js:** uses the exact user-supplied transparent white PNG at `public/branding/eiu-logo-uploaded.png` on black front/rear backrest plaques of the three companion chairs. All four chairs share white/grey frames and black bases, with cushion and wing pigments matching their robot. The animated background has been removed.
- **components/three/studio/studioConversation.js:** an 18-second repeating conversation. BLUE looks away from the monitor toward GREEN/PINK before they shake their heads; BLUE then turns toward ORANGE before its upward pointing reply. Original companion headings are preserved. Hover/click take priority.
- **Three.js compatibility:** the `three-studio` npm alias preserves the source HTML's r128 renderer and material behavior. Its two MIT-licensed addons use the same alias, avoiding mixed-version materials. The unused R3F scene, old robot geometry/motion and their exclusive dependencies and tests have been removed.
- **components/animations/MagneticButton.jsx:** local bounded React Bits-inspired magnetic interaction.
- **components/animation/EntranceSequence.jsx:** scoped GSAP boot/hero/command reveal.
- **styles/lab.css:** spatial layout, eight experience styles, mobile adaptation.
- **styles/tokens.css:** local Space Grotesk, Inter, JetBrains Mono and design tokens.

## Library responsibilities

The native Three.js studio owns geometry, materials and frame-based animation. React owns mounting, visibility, reduced motion and disposal. GSAP owns entrance wrappers and camera framing. Motion owns command/button feedback, shared portal symbols, panel/section transitions and content controls. Radix supplies accessible modal behavior. Lucide supplies icons.

GSAP and Motion never animate the same element/property. The robot entrance scale is separate from the frame-driven inner rig. Fonts are local; there are no external models, textures or HDRI requests. Font and React Bits licenses remain in licenses/.

## Validation and limitations

npm test runs component/data tests in jsdom, including all eight dialogs, switching, Escape/focus return, outside dismissal, keyboard levels, timeline caveats, reward reveals, FAQ search, access-ticket state, scene pause/visibility controls and edition provenance.

The GPU canvas is mocked in DOM tests. Those tests do **not** verify shader output, visual quality or device performance. Geometry tests check the rounded torso and seated contact coordinates. Headless runtime checks can verify canvas initialization and scene state, without claiming visual validation. Current build/lint/test outcomes are reported in the delivery message.

## Initial load and color reveal

The full-page EIU Data Challenge 2027 loading curtain remains until the first rendered frame in which the desk and first chair have started appearing. Reduced-motion and failed-WebGL paths release it into the static illustration; an active-tab boot timeout prevents an indefinite curtain. The first page click reveals color, without rebuilding the scene or interrupting navigation. Neutral colors stay neutral while chromatic pigments are brightened selectively.

Startup avoids reflection-map baking for matte pencil surfaces, the redundant full-scene render before the entrance, 2048px helmet uploads and face painting during collision sampling. Geometry-signed baked pose bounds retain the complete sampling fallback. Clearance search prunes candidates using a valid upper bound instead of checking the full mesh-pair grid. Regression tests compare the optimized search with exhaustive results and baked envelopes with the full motion sweep.

A local jsdom run with a mocked renderer measured initial CPU construction at about 1693 ms before and 329 ms after the changes; initial canvas fillRect calls fell from 3,192,938 to 21,596, and full-object bounds measurements from 1680 to 12. These are CPU/operation counts, not browser load or WebGL timings. Set STUDIO_PROFILE=1 when running tests/studio-placement.test.js with --disableConsoleIntercept to print the per-stage CPU metrics.

The landing title is centered across the top of the single-viewport grid, with vector pencil hatching and graphite strokes. The scene camera applies a small lower-left offset constrained by measured frustum clearance. Chair headrests sit in a notched black back panel rather than overlapping coplanar faces, preventing rear-panel z-fighting. Chromatic model pigments receive a selective saturation boost while neutral frames and black bases remain neutral.

StudioGridBackdrop replaces the classroom and FaultyTerminal entirely with a full-viewport React Bits GridScan room. The old slogan/contact footer is removed. Its graphite-pressure shader, muted blue-gray lines, slow cyan scans, subtle reflection and reduced parallax complement the pencil materials. The foreground robot region and heading receive a light contrast veil. The static wireframe is hidden as soon as the GPU background renders; reduced-motion/WebGL fallback keeps it. No webcam or gyro is enabled, so no face-tracking scripts, model downloads or permission prompts are started. The renderer is stored under components/GridScan.jsx and GridScan.css, installed with the React Bits registry CLI; the optional webcam implementation and its styles load separately only when enabled.

GridScan caps output DPR at 1 and targets up to 60fps with phase-preserving pacing on 60/120/144Hz displays. Its internal room resolution adapts between 70?100% on desktop and 80?100% on compact devices when the shared GPU frame budget is exceeded; the output canvas, room geometry, scan duration and pointer coordinates stay unchanged. Compact viewports skip bloom. Desktop bloom, point lighting and reflections skip work when no scan/ping emits light. A single shared vertex shader, cached constant uniforms, deduplicated resize handling and one-time ready marker avoid repeated setup and DOM invalidation. Hidden/offscreen rendering pauses, cleanup deletes allocated GPU resources, and cleanup never forcibly loses the canvas context, preserving React StrictMode effect restarts. Its pointer listeners remain passive and the layer cannot intercept navigation input or change the one-page height. Tests exercise restart, resource disposal, visibility pause and disabled webcam behavior.

The robot camera uses a near-level elevation to place the model's ground horizon closer to GridScan's floor. GridScan is not adjusted in response to model placement. On narrow screens, extra model-camera framing space and a bottom anchor keep the outer chair bases within the visible floor instead of floating across the side walls. Real ShadowMaterial opacity is strengthened, and five instanced contact-shadow draws add soft grounding beneath the four chair bases/casters and four desk feet. All patches use the same model camera, a shared 128px texture and world floor at y=.003; they follow the chair rotations and entrance fades without entering the collision or camera-framing bounds. Their instance matrices upload only when the owning transform changes. Geometry tests preserve all placements, seated contacts, entrance clearance and viewport framing.


Navigation uses eight pencil-painted 3D control blocks with graphite outlines, visible colored side faces and recessed icons. Their four pigments match the corresponding robots: Blue handles About/FAQ, Green Why join/Prizes, Orange Challenge format/Timeline, and Pink Partners/Register. CSS owns the new block press and static focus/engaged indicators. The old command shapes, hover/tap scaling, staggered GSAP command entrance and shared icon flight are removed; dialog navigation, Escape, focus return and reduced-motion switching remain intact.

Pointer hover and keyboard focus are forwarded to the existing robot rig through `setModuleInteraction`; activation triggers the assigned robot's existing action. Navigation attention interrupts an autonomous action, has priority over canvas raycasting and queues safely until the walking/climbing entrance completes. Leaving or closing releases the selection, and normal autonomous behavior resumes. No renderer or geometry is rebuilt when switching controls. Tests cover the bridge, entrance queue, individual robot selection, activation, release and existing eight-dialog accessibility flows.


Cleanup removed unused Title3D/particle title variants, the unused RoomEnvironment helper, a legacy grayscale conversion utility, hidden fallback markup and 119 obsolete CSS rules (56,697 ? 44,358 source bytes). The active SVG fallback, local fonts/licenses and all eight content modules remain. Robot pointer picking is coalesced into one query per rendered frame, while navigation retains priority.

A 12-second local Chromium headless sample at 1280?800, with the four-robot scene running after entrance and software WebGL rendering, measured 3.36 ? 3.88 GridScan paints/sec, p95 intervals 320.2 ? 270.5 ms, average passes/frame 5 ? 3.91 and rasterized viewport pixels/frame 2,240,000 ? 1,585,811. These are software-rendered test measurements, not hardware Edge frame rates; rasterized pixel counts are a work estimate, not GPU timings. The full suite passes 54 tests, including cadence, duplicate resize, uniform caching, contact matrix caching and batched pointer picking regressions.

## Current white room and startup

The active studio uses one shared Three camera for the white architecture, four robots, a left-wall pencil title and eight separate floor command blocks. The bookcases, storage console, demonstration board and room plants have been removed. The enlarged wall title draws its graphite outline and wipes through bright blue/green/pink/orange pigments matching the robots. Both ink layers use the same full-string layout to prevent displaced letters. Animation starts once fonts are ready and plays once per scene, with no pointer replay. The desktop robot composition is anchored in the lower-left region with one shared scale and translation. Animation uses shader uniforms; hover does not repaint or upload the label atlas. Floor blocks share one instanced body draw, eight atlas labels and instanced soft contact halos. Hover/focus lifts a block, activation depresses it, and accessible HTML hit regions follow the animated surface projection. Compact and reduced-motion layouts retain their static/accessible controls.

React requests incremental scene construction between browser paints. Abort cancels pending frame waits and disposes partially built resources. Duplicate resize notifications skip unchanged framing. Entrance materials are updated once per shared material and restored as each fade completes, avoiding transparent rendering throughout the whole entrance. Scene rendering is capped at 60 fps; hidden/offscreen pause behavior remains.

A local jsdom geometry profile recorded approximately 307 ms for the previous single construction task. The staged implementation measured a longest CPU construction step of 51 ms in a subsequent warm run (279 ms including simulated scheduling). These are CPU/mock-canvas measurements, not browser load times, hardware GPU timings or FPS results. Browser screenshots and live WebGL rendering were not used for this change.

The four word-color paint fields have been replaced with React Bits Iridescence, installed using npx shadcn@latest add @react-bits/Iridescence-JS-CSS. The installed component and shared shader remain in components/Iridescence.jsx and components/iridescenceShader.js. The live studio adapts that exact shader to its existing left-wall material, with color #8099cc, brightness 1.5, detail 8 and rotation -12 degrees. Physical wall UVs, normal depth writing and the existing shared camera keep the effect on the angled wall behind the shallow white glyphs and black outlines. Mouse stirring, sheen and up to six bounded click swirls use the existing scene loop; no second renderer or animation loop is mounted. The 48-by-24 interaction texture uploads only while changing. Hidden/offscreen pause, reduced-motion/WebGL fallback and the grayscale-to-color first click stay under the existing studio lifecycle. The sharp command labels and floor data routes remain.