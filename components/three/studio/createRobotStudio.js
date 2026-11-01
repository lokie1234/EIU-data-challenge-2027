// Adapted from the user-provided 3d_chibi_robot_coder_animation (1).html.
// Authored geometry/textures are retained; React owns lifecycle, not an iframe.
import * as THREE from 'three-studio';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry';
import gsap from 'gsap';
import { addSeatedLegs, poseTypingArm, updateCableBuffer } from './studioRig';
import { mainRobotPalette } from './studioPalette';
import { createCompanionRobots } from './createCompanionRobots';
import { createVisorGeometry, calibrateStudioMaterials, createDeskTopGeometry } from './studioSurfaces';
import { createStudioMonitor, detailPcCase } from './studioHardware';
import { addStudioContours } from './studioContours';
import { drawRobotFace, getStudioInteraction } from './robotExpressions';
import { createRobotController } from './robotControllers';
import { seatedPlacement } from './studioPlacement';
import { createStudioEntrance, STUDIO_ENTRANCE_DURATION, BLUE_SEATED_AT } from './studioEntrance';
import { createStudioGrounding } from './studioGrounding';
import { createModuleResponse } from './studioModuleResponse';
import { configureStudioRoom } from './studioRoomProjection';
import { createStudioRoom } from './studioRoom';
import { runStudioSetup } from './studioSetup';

export function createRobotStudio(container, { onVisible, useBakedBounds = true, incremental = false, signal } = {}) {
const startupMetrics = {};
const timed = (name, operation) => { const start = performance.now(); const result = operation(); startupMetrics[name] = performance.now() - start; return result; };
const createCanvas = (width, height) => Object.assign(document.createElement('canvas'), { width, height });
let keyboard, companions, deskGroup, chairGroup, pcGroup, monitorGroup, pcAnimationController;
let blueController, mainFaceDisplay;
let entrance, grounding, room, moduleResponse, framingPoints, conversationStarted = false;
let firstRevealSent = false;
let hangingLegs = [];
const constructionMaterials = new Set();
const moduleSlots = new Map();
let lastResizeKey;
const cableCurve = new THREE.CatmullRomCurve3(Array.from({length:4}, () => new THREE.Vector3()));
const cableOffset1 = new THREE.Vector3(-.08, -.10, .06), cableOffset2 = new THREE.Vector3(0, -.06, .08);
let frame = 0, elapsed = 0, previous = 0, running = false, disposed = false;
let lastPaint = -Infinity;
function createFaceDisplay() {
    const canvas = createCanvas(512, 256);
    const ctx = canvas.getContext('2d');
    drawRobotFace(ctx, 0, 'attentive');
    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = 4;
    return { ctx, texture, lastPaint: 0 };
}

function createHelmetTexture(palette = mainRobotPalette, resolution = 1024) {
    const canvas = document.createElement('canvas');
    canvas.width = resolution;
    canvas.height = resolution / 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(resolution / 2048, resolution / 2048);

    // Base glossy ceramic white
    ctx.fillStyle = palette.shell;
    ctx.fillRect(0, 0, 2048, 1024);

    // Top Orange Crown Cap with clean panel seam line
    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(2048, 0);
    ctx.lineTo(2048, 320);
    for (let x = 2048; x >= 0; x -= 32) {
        // Smooth contour dipping slightly at the front and back
        const normX = (x / 2048) * Math.PI * 2;
        const y = 310 + Math.cos(normX) * 55;
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Subtle dark seam groove along the orange crown border
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.35)';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Lower Back Grey Technical Nape Plate
    ctx.fillStyle = palette.trim;
    ctx.fillRect(0, 740, 2048, 284);
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, 740);
    ctx.lineTo(2048, 740);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;
    return tex;
}

// 2.3 Detailed Chibi Robot Illustration on Ceramic Mug
function createMugGraphicTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 1024, 512);

    // Center position facing the viewer
    const cx = 512, cy = 250;

    // Outline shadow
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(cx, cy - 35, 78, 0, Math.PI * 2);
    ctx.fill();

    // Helmet White & Orange
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy - 35, 72, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(cx, cy - 35, 72, Math.PI * 1.15, Math.PI * 1.85);
    ctx.fill();

    // Ear cups
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.roundRect(cx - 88, cy - 55, 20, 44, 8);
    ctx.roundRect(cx + 68, cy - 55, 20, 44, 8);
    ctx.fill();

    // Visor screen
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(cx - 52, cy - 62, 104, 56, 22);
    ctx.fill();

    // Glowing Cyan Eyes
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(cx - 22, cy - 34, 12, 0, Math.PI * 2);
    ctx.arc(cx + 22, cy - 34, 12, 0, Math.PI * 2);
    ctx.fill();

    // Robot Torso (Blue/White/Orange)
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(cx - 42, cy + 36, 84, 68, 16);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(cx - 26, cy + 48, 52, 44, 10);
    ctx.fill();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(cx, cy + 70, 10, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    return tex;
}

// 2.4 Open Spiral Notebook Pages with Robot Blueprints & Diagrams
function createNotebookPageTexture(isLeftPage) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#fcfcfd';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle grid/ruled lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    for (let y = 45; y < 480; y += 26) {
        ctx.beginPath();
        ctx.moveTo(28, y);
        ctx.lineTo(484, y);
        ctx.stroke();
    }

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    if (isLeftPage) {
        // Robot character blueprint sketch as seen in reference photo
        ctx.beginPath();
        ctx.arc(165, 165, 58, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeRect(125, 145, 80, 38);
        ctx.strokeRect(130, 230, 70, 65);
        // Callout lines
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(265, 115, 160, 18);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(265, 150, 140, 10);
        ctx.fillRect(265, 172, 120, 10);
        ctx.fillRect(90, 340, 320, 12);
        ctx.fillRect(90, 368, 260, 12);
    } else {
        // UI wireframe & architecture notes
        ctx.strokeRect(70, 75, 160, 110);
        ctx.strokeRect(260, 75, 160, 110);
        ctx.beginPath();
        ctx.moveTo(90, 155);
        ctx.lineTo(135, 105);
        ctx.lineTo(175, 135);
        ctx.lineTo(210, 95);
        ctx.stroke();

        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = i === 0 ? '#f97316' : '#475569';
            ctx.fillRect(70, 225 + i * 46, 340 - (i % 3) * 55, 10);
            ctx.fillRect(70, 245 + i * 46, 240, 8);
        }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    return tex;
}

// 2.5 Sticky Note Handwritten Scribbles Texture
function createStickyNoteTexture(bgHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (let r = 0; r < 4; r++) {
        ctx.beginPath();
        const y = 60 + r * 42;
        ctx.moveTo(36, y);
        ctx.bezierCurveTo(85, y - 8, 140, y + 8, 195 - (r % 2) * 45, y - 3);
        ctx.stroke();
    }
    return new THREE.CanvasTexture(canvas);
}

// ============================================================================
// 3. SCENE, CAMERA & STUDIO LIGHTING SETUP
// ============================================================================
let scene, camera, renderer;

let typingSpeed = 1.0;

// Robot Rig Hierarchy
let robotRoot = new THREE.Group();
let robotTorso = new THREE.Group();
let robotHead = new THREE.Group();
let leftShoulder = new THREE.Group();
let leftElbow = new THREE.Group();
let leftWrist = new THREE.Group();
let leftFingers = [];

let rightShoulder = new THREE.Group();
let rightElbow = new THREE.Group();
let rightWrist = new THREE.Group();
let rightFingers = [];

// Dynamic Headphone-to-Backpack Cable
let headphoneCableMesh = null;
let headphoneAnchorLocal = new THREE.Vector3(-0.50, -0.08, 0.04); // On left earcup
let backpackAnchorLocal = new THREE.Vector3(-0.08, 0.14, 0.25);  // On backpack

// Animated Textures & Peripheral Refs
let monitorCtx, monitorTexture;
let kbRgbCtx, kbRgbTexture;
let faceCtx, faceTexture;
let keycapMeshes = [];
let pcFanRotors = [];
let argbMaterials = [];
let mouseGroupRef = null;

// Custom head gesture override


function createRoundedBox(w, h, d, r, segs = 4) {
    return new RoundedBoxGeometry(w, h, d, segs, Math.min(r * .48, w / 2, h / 2, d / 2));
}

function* init() {
    

    scene = new THREE.Scene();
    scene.background = null;

    // Tighter studio telephoto FOV (30 deg) for authentic isometric product render perspective
    camera = new THREE.PerspectiveCamera(30, container.clientWidth / Math.max(container.clientHeight, 1), 0.1, 100);
    camera.position.set(4.55, 3.38, 4.18);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .9;
    container.appendChild(renderer.domElement);

    // Matte pencil surfaces use the studio lights; no reflection cube-map bake.


    setupStudioLighting();

    const mats = createMaterials();
    Object.values(mats).forEach(material => constructionMaterials.add(material));
    yield;
    timed('buildDeskAndAccessories', () => buildDeskAndAccessories(mats));
    yield;
    timed('buildMonitorAndGamingPC', () => buildMonitorAndGamingPC(mats));
    yield;
    timed('buildArticulatedChibiRobot', () => buildArticulatedChibiRobot(mats));
    yield;
    timed('buildErgonomicGamingChair', () => buildErgonomicGamingChair(mats));
    yield;
    const primary = new THREE.Group();
    primary.name = 'primary-workstation';
    scene.children.filter(object => !object.isLight && object.name !== 'studio-shadow-floor').forEach(object => primary.add(object));
    primary.scale.setScalar(1.12);
    primary.position.set(-.285, 0, .254);
    scene.add(primary);
    companions = timed('companions', () => createCompanionRobots({ head: robotHead, torso: robotTorso, leftArm: leftShoulder, rightArm: rightShoulder, materials: mats, helmetTexture: createHelmetTexture, faceTexture, createFaceDisplay, chair: chairGroup }));
    scene.add(companions.group);
    const composition = new THREE.Group();
    composition.name = 'studio-composition';
    composition.add(primary, companions.group, companions.chairs);
    composition.scale.setScalar(2);
    scene.add(composition);
    yield;
    // Double the complete physical composition while preserving its lighting.
    scene.children.filter(object => object.isLight).forEach(light => {
        light.position.multiplyScalar(2);
        if (light.distance) light.distance *= 2;
        if (light.shadow?.camera?.isOrthographicCamera) {
            for (const side of ['left', 'right', 'top', 'bottom', 'far']) light.shadow.camera[side] *= 2;
            light.shadow.camera.updateProjectionMatrix();
        }
    });
    timed('placement', () => companions.layout([primary], { useBakedBounds }));
    yield;
    grounding = createStudioGrounding(scene, [chairGroup, ...companions.chairs.children], deskGroup);
    moduleResponse = createModuleResponse({ blue: blueController, ...companions.controllers });
    room = createStudioRoom(scene, { deferGeometry: incremental, onModuleTransform(id, transform) {
        if (!moduleSlots.has(id)) moduleSlots.set(id, container.closest?.('.lab-experience')?.querySelector(`[data-module-id="${id}"]`)?.closest('.module-slot'));
        moduleSlots.get(id)?.style.setProperty('--module-transform', transform);
    } });
    yield* room.buildStages;
    const stage = new THREE.Group(); stage.name = 'studio-actors';
    scene.add(stage); stage.add(composition);
    calibrateStudioMaterials(scene);
    addStudioContours(primary);
    companions.group.children.forEach(robot => addStudioContours(robot, 8));
    companions.chairs.children.forEach(chair => addStudioContours(chair, 6));
    yield;


}

function setupStudioLighting() {
    const hemi = new THREE.HemisphereLight(0xffffff, 0xd5e0ec, .38);
    scene.add(hemi);

    // Main Studio Softbox Key Light
    const keyLight = new THREE.DirectionalLight(0xfffcf5, 1.0);
    keyLight.position.set(4.8, 8.2, 4.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = container.clientWidth < 600 ? 512 : 1024;
    keyLight.shadow.mapSize.height = container.clientWidth < 600 ? 512 : 1024;
    keyLight.shadow.camera.near = 1.0;
    keyLight.shadow.camera.far = 45.0;
    const d = 12.0;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);

    // Rim Light from Left/Back to highlight monitor & PC edges
    const rimLight = new THREE.DirectionalLight(0xe0f2fe, .32);
    rimLight.position.set(-5.0, 4.0, -3.0);
    scene.add(rimLight);

    // Screen Cyan Illumination on Desk & Robot
    const screenGlow = new THREE.PointLight(0x38bdf8, .25, 2.4);
    screenGlow.position.set(-.62, 1.33, -.15);
    scene.add(screenGlow);

    // PC ARGB Neon Illumination
    const pcGlow = new THREE.PointLight(0xe879f9, .22, 2.0);
    pcGlow.position.set(.77, 1.33, -.45);
    scene.add(pcGlow);
}

// ============================================================================
// 4. STUDIO PBR MATERIALS
// ============================================================================
function createMaterials() {
    return {
        helmetMapped: new THREE.MeshStandardMaterial({
            map: createHelmetTexture(),
            roughness: 0.25,
            metalness: 0.04
        }),
        whitePlastic: new THREE.MeshStandardMaterial({
            color: mainRobotPalette.shell,
            roughness: 0.24,
            metalness: 0.04
        }),
        orangePlastic: new THREE.MeshStandardMaterial({
            color: mainRobotPalette.accent,
            roughness: 0.28,
            metalness: 0.05
        }),
        greyAlloy: new THREE.MeshStandardMaterial({
            color: mainRobotPalette.trim,
            roughness: 0.42,
            metalness: 0.35
        }),
        darkMetal: new THREE.MeshStandardMaterial({
            color: mainRobotPalette.dark,
            roughness: 0.45,
            metalness: 0.45
        }),
        cableSleeved: new THREE.MeshStandardMaterial({
            color: 0x748d9c,
            roughness: 0.38,
            metalness: 0.22
        }),
        deskSurface: new THREE.MeshPhysicalMaterial({ color: 0xb6c7dc, roughness: .40, metalness: .12, clearcoat: .32 }),
        frameViolet: new THREE.MeshPhysicalMaterial({ color: 0xaaa1ce, roughness: .28, metalness: .30, clearcoat: .6 }),
        frameCyan: new THREE.MeshPhysicalMaterial({ color: 0x91c3c1, roughness: .30, metalness: .22, clearcoat: .5 }),
        frameCoral: new THREE.MeshStandardMaterial({ color: 0xedb488, roughness: .36, metalness: .12 }),
        framePearl: new THREE.MeshPhysicalMaterial({ color: 0xe8e4f3, roughness: .30, metalness: .18, clearcoat: .4 }),
        deskMatDark: new THREE.MeshStandardMaterial({
            color: 0x52647d,
            roughness: 0.82,
            metalness: 0.04
        }),
        pcBlack: new THREE.MeshStandardMaterial({
            color: 0x4f5970,
            roughness: 0.36,
            metalness: 0.45
        }),
        glassSide: new THREE.MeshPhysicalMaterial({
            color: 0x9db7c6,
            transparent: true,
            opacity: .18,
            roughness: 0.04,
            metalness: 0.1,
            reflectivity: 0.95
        }),
        chairWhite: new THREE.MeshStandardMaterial({color:0xe2e5e8,roughness:.28,metalness:.88}),
        chairBlack: new THREE.MeshStandardMaterial({color:0x15191f,roughness:.28,metalness:.88}),
        chairGrey: new THREE.MeshStandardMaterial({color:0x68717b,roughness:.25,metalness:.88}),
        chairAccent: new THREE.MeshStandardMaterial({color:mainRobotPalette.accent,roughness:.97,metalness:0}),
        chairOrange: new THREE.MeshStandardMaterial({
            color: 0x6986bd,
            roughness: 0.46,
            metalness: 0.03
        }),
        chairCharcoal: new THREE.MeshStandardMaterial({
            color: 0x2b434c,
            roughness: 0.5,
            metalness: 0.18
        })
    };
}

// ============================================================================
// 5. DESK ARCHITECTURE & CLEARLY LAYERED DESK PROPS
// ============================================================================
function buildDeskAndAccessories(mats) {
    deskGroup = new THREE.Group();
    deskGroup.name = 'studio-desk';
    deskGroup.position.y = -.32;

    // Invisible Shadow Floor
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(80, 80),
        new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.28, transparent: true, depthWrite: false, toneMapped: false })
    );
    floor.name = "studio-shadow-floor";
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // One thin desktop; no second rim or legacy cantilever assembly underneath.
    const tableTop = new THREE.Mesh(
        createDeskTopGeometry(),
        mats.deskSurface
    );
    tableTop.name = "studio-desktop";
    tableTop.position.set(-0.20, 1.14, -0.12);
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    deskGroup.add(tableTop);
    const deskEdge = new THREE.Mesh(createDeskTopGeometry(), mats.frameCyan);
    deskEdge.name = 'desktop-cyan-edge';
    deskEdge.scale.set(1.004, .236, 1.004);
    deskEdge.position.set(-.20, 1.106, -.12);
    deskGroup.add(deskEdge);

    // Two inset, splayed trestles leave the chair and dangling feet clear.
    const beam = (name, from, to, width, material) => {
        const start = new THREE.Vector3(...from), end = new THREE.Vector3(...to);
        const mesh = new THREE.Mesh(createRoundedBox(width, start.distanceTo(end), width, .006, 2), material);
        mesh.name = name;
        mesh.position.copy(start).add(end).multiplyScalar(.5);
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.sub(start).normalize());
        mesh.castShadow = true; deskGroup.add(mesh);
    };
    for (const x of [-1.26, .98]) {
        beam('desk-trestle-top', [x, 1.0875, -.62], [x, 1.0875, .38], .05, mats.frameViolet);
        for (const side of [-1, 1]) {
            const z = -.12 + side * .50;
            beam('desk-splayed-leg', [x, .35, z + side * .07], [x, 1.075, z], .06, mats.frameViolet);
            const shoe = new THREE.Mesh(createRoundedBox(.085, .035, .10, .006, 2), mats.frameCoral);
            shoe.name = 'desk-adjustable-foot'; shoe.position.set(x, .3375, z + side * .07); deskGroup.add(shoe);
        }
    }

    // 2. Large Keyboard Desk Pad with Dark Stitched Border
    const kbPad = new THREE.Mesh(
        createRoundedBox(.62, 0.008, 0.28, 0.004, 2),
        mats.deskMatDark
    );
    kbPad.position.set(seatedPlacement.x, 1.1715, .45);
    kbPad.rotation.y = 0;
    kbPad.receiveShadow = true;
    deskGroup.add(kbPad);

    // 3. Separate Mouse Pad (Positioned upper-left of keyboard pad as in photo)
    const mousePad = new THREE.Mesh(
        createRoundedBox(0.16, 0.008, 0.22, 0.004, 2),
        mats.frameViolet
    );
    mousePad.name = 'mouse-pad';
    mousePad.position.set(.59, 1.1715, .45);
    mousePad.rotation.y = 0;
    mousePad.receiveShadow = true;
    deskGroup.add(mousePad);

    // 4. White Ceramic Mug with Chibi Robot Print (Bottom-Left Foreground)
    const mugGroup = new THREE.Group();
    mugGroup.position.set(-0.90, 1.168, 0.27);
    mugGroup.rotation.y = -0.72; // Oriented so the printed robot graphic faces the 45° camera!

    const mugCyl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.082, 0.076, 0.168, 36),
        new THREE.MeshStandardMaterial({ map: createMugGraphicTexture(), roughness: 0.16 })
    );
    mugCyl.position.y = 0.084;
    mugCyl.castShadow = true;
    mugGroup.add(mugCyl);

    const mugInside = new THREE.Mesh(
        new THREE.CircleGeometry(0.073, 28),
        new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.25 })
    );
    mugInside.rotation.x = -Math.PI / 2;
    mugInside.position.y = 0.162;
    mugGroup.add(mugInside);

    const mugHandle = new THREE.Mesh(
        new THREE.TorusGeometry(0.048, 0.013, 14, 28, Math.PI),
        mats.frameCoral
    );
    mugHandle.rotation.z = Math.PI / 2;
    mugHandle.position.set(-0.076, 0.084, 0); // Handle on left side as in photo
    mugHandle.castShadow = true;
    mugGroup.add(mugHandle);
    deskGroup.add(mugGroup);

    // 5. Three Hanging Sticky Notes on Front Oak Edge (Yellow, Green, Pink)
    const edgeNotes = [
        { x: -0.84, color: '#fef08a', tilt: -0.03 },
        { x: -0.69, color: '#86efac', tilt: 0.02 },
        { x: -0.54, color: '#f472b6', tilt: -0.02 }
    ];
    edgeNotes.forEach(item => {
        const nGroup = new THREE.Group();
        nGroup.position.set(item.x, 1.13, 0.612);
        nGroup.rotation.z = item.tilt;

        const nMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(0.115, 0.145),
            new THREE.MeshStandardMaterial({
                map: createStickyNoteTexture(item.color),
                roughness: 0.7,
                side: THREE.DoubleSide
            })
        );
        nMesh.position.y = -0.045;
        nMesh.rotation.x = 0.06;
        nGroup.add(nMesh);
        deskGroup.add(nGroup);
    });

    // 6. Flat Sticky Notes on Desk Surface (Pink, Lime, Yellow, Cyan, Orange)
    const surfaceNotes = [-1.05, -.90, -.75, -.60, -.45].map((x, i) => ({x, z:.10, color:['#ff86bc','#83e5bd','#ffc66e','#b496ff','#6edee9'][i], rot: .07 * (i % 2 ? 1 : -1)}));
    surfaceNotes.forEach(sn => {
        const pad = new THREE.Mesh(
            new THREE.BoxGeometry(0.112, 0.009, 0.112),
            new THREE.MeshStandardMaterial({
                map: createStickyNoteTexture(sn.color),
                roughness: 0.65
            })
        );
        pad.position.set(sn.x, 1.171, sn.z);
        pad.rotation.y = sn.rot;
        pad.castShadow = true;
        deskGroup.add(pad);
    });

    // 7. Open Spiral Notebook at Front Corner (Blue Left Stack, Orange Right Stack)
    const notebook = new THREE.Group();
    notebook.position.set(-.70, 1.176, .42);
    notebook.rotation.y = 0;

    const leftCover = new THREE.Mesh(
        createRoundedBox(0.24, 0.016, 0.30, 0.004, 2),
        new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.45 })
    );
    leftCover.position.set(-0.124, 0, 0);
    notebook.add(leftCover);

    const leftPageBlock = new THREE.Mesh(
        createRoundedBox(0.228, 0.024, 0.286, 0.004, 2),
        new THREE.MeshStandardMaterial({ map: createNotebookPageTexture(true), roughness: 0.55 })
    );
    leftPageBlock.position.set(-0.120, 0.015, 0);
    leftPageBlock.castShadow = true;
    notebook.add(leftPageBlock);

    const rightCover = new THREE.Mesh(
        createRoundedBox(0.24, 0.016, 0.30, 0.004, 2),
        new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.45 })
    );
    rightCover.position.set(0.124, 0, 0);
    notebook.add(rightCover);

    const rightPageBlock = new THREE.Mesh(
        createRoundedBox(0.228, 0.026, 0.286, 0.004, 2),
        new THREE.MeshStandardMaterial({ map: createNotebookPageTexture(false), roughness: 0.55 })
    );
    rightPageBlock.position.set(0.120, 0.016, 0);
    rightPageBlock.castShadow = true;
    notebook.add(rightPageBlock);

    for (let r = -0.12; r <= 0.12; r += 0.022) {
        const coil = new THREE.Mesh(
            new THREE.TorusGeometry(0.015, 0.0024, 8, 16),
            mats.greyAlloy
        );
        coil.rotation.y = Math.PI / 2;
        coil.position.set(0, 0.028, r);
        notebook.add(coil);
    }
    deskGroup.add(notebook);

    // 8. Two Detailed Pencils (Blue & Yellow with Wood Tip & Pink Eraser)
    function createPencil(colorHex, x, z, rotY) {
        const pGroup = new THREE.Group();
        pGroup.position.set(x, 1.175, z);
        pGroup.rotation.y = rotY;

        const shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.0065, 0.0065, 0.18, 8),
            new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4 })
        );
        shaft.rotation.z = Math.PI / 2;
        pGroup.add(shaft);

        const tipCone = new THREE.Mesh(
            new THREE.ConeGeometry(0.0065, 0.025, 8),
            new THREE.MeshStandardMaterial({ color: 0xfde68a })
        );
        tipCone.rotation.z = -Math.PI / 2;
        tipCone.position.x = 0.102;
        pGroup.add(tipCone);

        const eraser = new THREE.Mesh(
            new THREE.CylinderGeometry(0.0065, 0.0065, 0.018, 12),
            new THREE.MeshStandardMaterial({ color: 0xf472b6 })
        );
        eraser.rotation.z = Math.PI / 2;
        eraser.position.x = -0.098;
        pGroup.add(eraser);

        return pGroup;
    }
    deskGroup.add(createPencil(0x3b82f6, -.055, .26, .18));
    deskGroup.add(createPencil(0xf59e0b, -.045, .30, .18));

    // 9. White 6-Key Macro Pad / Mini Keypad with Colored Keycaps
    const keypadGroup = new THREE.Group();
    keypadGroup.position.set(-1.2, 1.174, .43);
    keypadGroup.rotation.y = 0.28;

    const kpBase = new THREE.Mesh(
        createRoundedBox(0.105, 0.015, 0.135, 0.005, 2),
        mats.whitePlastic
    );
    kpBase.castShadow = true;
    keypadGroup.add(kpBase);

    const kpColors = [0x94a3b8, 0x38bdf8, 0xf97316, 0x94a3b8, 0xcbd5e1, 0xef4444];
    for (let kr = 0; kr < 3; kr++) {
        for (let kc = 0; kc < 2; kc++) {
            const kBtn = new THREE.Mesh(
                new THREE.BoxGeometry(0.032, 0.008, 0.028),
                new THREE.MeshStandardMaterial({ color: kpColors[(kr * 2 + kc) % kpColors.length] })
            );
            kBtn.position.set((kc - 0.5) * 0.042, 0.010, (kr - 1) * 0.036);
            keypadGroup.add(kBtn);
        }
    }
    deskGroup.add(keypadGroup);

    // 10. Cute Mini Orange Chibi Toy Figure (Left of Mug)
    const miniToy = new THREE.Group();
    miniToy.position.set(-1.08, 1.168, 0.23);
    miniToy.rotation.y = 0.55;
    const mtBody = new THREE.Mesh(new THREE.SphereGeometry(0.026, 16, 16), mats.orangePlastic);
    mtBody.position.y = 0.026;
    miniToy.add(mtBody);
    const mtHead = new THREE.Mesh(new THREE.SphereGeometry(0.035, 20, 20), mats.orangePlastic);
    mtHead.position.y = 0.072;
    miniToy.add(mtHead);
    const mtVisor = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.022, 0.02), mats.pcBlack);
    mtVisor.position.set(0, 0.072, 0.026);
    miniToy.add(mtVisor);
    deskGroup.add(miniToy);

    // 11. Scattered Toy Bricks & Mini Mecha Figure near Monitor Stand
    const legoColors = [0xef4444, 0x22c55e, 0xdc2626, 0x16a34a];
    for (let b = 0; b < 4; b++) {
        const brick = new THREE.Mesh(
            new THREE.BoxGeometry(0.036, 0.026, 0.052),
            new THREE.MeshStandardMaterial({ color: legoColors[b], roughness: 0.25 })
        );
        brick.position.set(-1.28 + b * 0.042, 1.18, 0.02 + (b % 2) * 0.045);
        brick.rotation.y = b * 0.5;
        brick.castShadow = true;
        deskGroup.add(brick);
    }

    // Tiny White/Red Action Figure next to bricks
    const mechaFig = new THREE.Group();
    mechaFig.position.set(-0.67, 1.168, -0.02);
    mechaFig.rotation.y = 0.4;
    const mfTorso = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.055, 0.028), mats.whitePlastic);
    mfTorso.position.y = 0.03;
    mechaFig.add(mfTorso);
    const mfCrest = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.03, 0.032), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
    mfCrest.position.y = 0.068;
    mechaFig.add(mfCrest);
    deskGroup.add(mechaFig);

    scene.add(deskGroup);
}

// ============================================================================
// 6. CURVED MONITOR, GLASS PC CASE, MECHANICAL KEYBOARD & WIRED MOUSE
// ============================================================================
function buildMonitorAndGamingPC(mats) {
    const monCanvas = createCanvas(1440, 810);
    monitorCtx = monCanvas.getContext('2d');
    monitorTexture = new THREE.CanvasTexture(monCanvas);
    monitorTexture.minFilter = THREE.LinearFilter;
    monitorTexture.anisotropy = 4;
    monitorTexture.encoding = THREE.sRGBEncoding;
    monitorGroup = createStudioMonitor(mats, monitorTexture);
    scene.add(monitorGroup);

    // --- B. TEMPERED GLASS GAMING PC TOWER (Center-Back, Clear View of Glass & 3 Front Fans) ---
    pcGroup = new THREE.Group();
    pcGroup.name = "right-desktop-pc";
    pcGroup.position.set(.77, 1.22, -.47);
    pcGroup.rotation.y = 2.6;

    const pcW = 0.35, pcH = 0.68, pcD = 0.56;

    // Chassis Top, Bottom, Back & Right Motherboard Wall
    const topCap = new THREE.Mesh(createRoundedBox(pcW, 0.032, pcD, 0.01, 2), mats.frameViolet);
    topCap.name = 'pc-violet-roof';
    topCap.position.y = pcH / 2;
    pcGroup.add(topCap);

    const botCap = new THREE.Mesh(createRoundedBox(pcW, 0.032, pcD, 0.01, 2), mats.frameCyan);
    botCap.name = 'pc-cyan-base';
    botCap.position.y = -pcH / 2;
    pcGroup.add(botCap);

    // 4 Rubber Case Feet
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([fx, fz]) => {
        const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.018, 0.025, 12), mats.pcBlack);
        foot.position.set(fx * (pcW / 2 - 0.04), -pcH / 2 - 0.02, fz * (pcD / 2 - 0.05));
        pcGroup.add(foot);
    });

    const moboWall = new THREE.Mesh(new THREE.BoxGeometry(0.022, pcH, pcD), mats.framePearl);
    moboWall.position.x = pcW / 2 - 0.011;
    moboWall.castShadow = true;
    pcGroup.add(moboWall);

    const rearWall = new THREE.Mesh(new THREE.BoxGeometry(pcW, pcH, 0.02), mats.frameViolet);
    rearWall.position.z = -pcD / 2 + 0.01;
    pcGroup.add(rearWall);

    const psuCover = new THREE.Mesh(new THREE.BoxGeometry(pcW - 0.04, 0.14, pcD - 0.04), mats.frameCyan);
    psuCover.position.set(0, -pcH / 2 + 0.08, 0);
    pcGroup.add(psuCover);

    // ARGB Dual-Ring Fan Builder
    function createARGBFan(x, y, z) {
        const fanUnit = new THREE.Group();
        fanUnit.position.set(x, y, z);

        const outerHaloMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        argbMaterials.push(outerHaloMat);
        const haloRing = new THREE.Mesh(new THREE.TorusGeometry(0.078, 0.014, 16, 32), outerHaloMat);
        fanUnit.add(haloRing);

        const rotor = new THREE.Group();
        const hubMat = new THREE.MeshBasicMaterial({ color: 0xf472b6 });
        argbMaterials.push(hubMat);
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 16), hubMat);
        hub.rotation.x = Math.PI / 2;
        rotor.add(hub);

        const bladeMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.78,
            roughness: 0.2
        });
        for (let i = 0; i < 7; i++) {
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.016, 0.004), bladeMat);
            const a = (i / 7) * Math.PI * 2;
            blade.position.set(Math.cos(a) * 0.04, Math.sin(a) * 0.04, 0);
            blade.rotation.z = a + 0.4;
            blade.rotation.y = 0.35;
            rotor.add(blade);
        }
        fanUnit.add(rotor);
        pcFanRotors.push(rotor);
        return fanUnit;
    }

    // 3 Front Intake ARGB Fans + 1 Rear Exhaust Fan
    for (let i = 0; i < 3; i++) {
        pcGroup.add(createARGBFan(0, -0.18 + i * 0.19, pcD / 2 - 0.024));
    }
    pcGroup.add(createARGBFan(-0.02, 0.16, -pcD / 2 + 0.04));

    // AIO Liquid Cooler CPU Block & White Glowing Squircle
    const aioPump = new THREE.Mesh(createRoundedBox(0.085, 0.085, 0.04, 0.02, 2), mats.pcBlack);
    aioPump.position.set(0.08, 0.14, -0.04);
    pcGroup.add(aioPump);

    const aioLed = new THREE.Mesh(
        new THREE.TorusGeometry(0.028, 0.006, 12, 24),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    aioLed.rotation.y = -Math.PI / 2;
    aioLed.position.set(0.036, 0.14, -0.04);
    pcGroup.add(aioLed);

    // 4x RGB DDR5 RAM Sticks
    for (let r = 0; r < 4; r++) {
        const rMat = new THREE.MeshBasicMaterial({ color: 0xc084fc });
        argbMaterials.push(rMat);
        const stick = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.09, 0.008), rMat);
        stick.position.set(0.05, 0.14, 0.03 + r * 0.015);
        pcGroup.add(stick);
    }

    // GPU with Glowing Neon Edge Bar
    const gpu = new THREE.Mesh(createRoundedBox(0.18, 0.055, 0.34, 0.008, 2), mats.pcBlack);
    gpu.position.set(0.03, -0.04, -0.02);
    pcGroup.add(gpu);

    const gpuBar = new THREE.Mesh(
        new THREE.BoxGeometry(0.009, 0.015, 0.28),
        new THREE.MeshBasicMaterial({ color: 0x4ade80 })
    );
    gpuBar.position.set(-0.061, -0.03, -0.02);
    pcGroup.add(gpuBar);

    // Tempered Glass Panels + Black Structural Pillars
    const leftGlass = new THREE.Mesh(new THREE.BoxGeometry(0.01, pcH - 0.04, pcD - 0.04), mats.glassSide);
    leftGlass.position.set(-pcW / 2 + 0.005, 0, 0);
    pcGroup.add(leftGlass);

    const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(pcW - 0.03, pcH - 0.04, 0.01), mats.glassSide);
    frontGlass.position.set(0, 0, pcD / 2 - 0.005);
    pcGroup.add(frontGlass);

    pcAnimationController = detailPcCase(pcGroup, mats, { fanRotors: pcFanRotors, argbMaterials, createCanvas });
    scene.add(pcGroup);

    // --- C. RGB MECHANICAL KEYBOARD ---
    const kbGroup = new THREE.Group();
    keyboard = kbGroup;
    kbGroup.name = "typing-keyboard";
    kbGroup.position.set(seatedPlacement.x, .8715, .45);
    kbGroup.rotation.y = 0;

    const rgbCanvas = createCanvas(512, 256);
    kbRgbCtx = rgbCanvas.getContext('2d');
    kbRgbTexture = new THREE.CanvasTexture(rgbCanvas);

    const kbFrame = new THREE.Mesh(createRoundedBox(0.55, 0.032, 0.22, 0.008, 2), mats.frameViolet);
    kbFrame.castShadow = true;
    kbGroup.add(kbFrame);

    const rgbBackplate = new THREE.Mesh(
        new THREE.PlaneGeometry(0.52, 0.19),
        new THREE.MeshBasicMaterial({ map: kbRgbTexture })
    );
    rgbBackplate.rotation.x = -Math.PI / 2;
    rgbBackplate.position.y = 0.017;
    kbGroup.add(rgbBackplate);

    const rows = 5, cols = 14;
    const keyGeo = new THREE.BoxGeometry(0.030, 0.016, 0.030);
    const keyMat = new THREE.MeshStandardMaterial({ color: 0x1e222a, roughness: 0.35 });

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const key = new THREE.Mesh(keyGeo, keyMat);
            key.name = `typing-key-${r}-${c}`;
            key.position.set((c - cols / 2 + 0.5) * 0.036, 0.024, (r - rows / 2 + 0.5) * 0.036);
            kbGroup.add(key);
            keycapMeshes.push(key);
        }
    }
    scene.add(kbGroup);

    // --- D. GAMING MOUSE WITH RGB STRIP & DESK CABLE ---
    mouseGroupRef = new THREE.Group();
    mouseGroupRef.name = 'studio-mouse';
    mouseGroupRef.position.set(.59, .884, .45);
    mouseGroupRef.rotation.y = 0;

    const mShell = new THREE.Mesh(new THREE.SphereGeometry(0.052, 24, 24), mats.framePearl);
    mShell.scale.set(0.85, 0.52, 1.35);
    mShell.castShadow = true;
    mouseGroupRef.add(mShell);

    const mLed = new THREE.Mesh(
        new THREE.TorusGeometry(0.042, 0.004, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0xec4899 })
    );
    mLed.rotation.x = Math.PI / 2;
    mLed.scale.set(0.88, 1.35, 1);
    mLed.position.y = 0.005;
    mouseGroupRef.add(mLed);
    argbMaterials.push(mLed.material);

    scene.add(mouseGroupRef);

    // Mouse Wire Snaking on Desk (Visible between mouse pad and monitor in reference photo)
    const mouseWireCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(.59, 1.178, .38),
        new THREE.Vector3(.62, 1.178, .25),
        new THREE.Vector3(.47, 1.178, .08),
        new THREE.Vector3(.60, 1.178, -.12)
    ]);
    const mouseWire = new THREE.Mesh(
        new THREE.TubeGeometry(mouseWireCurve, 20, 0.0045, 8, false),
        mats.pcBlack
    );
    mouseWire.position.y = -.32;
    scene.add(mouseWire);
}

// ============================================================================
// 7. ARTICULATED CHIBI ROBOT (UV-MAPPED HELMET, DYNAMIC CABLE & FINGERS)
// ============================================================================
function buildArticulatedChibiRobot(mats) {
    robotRoot.name = "studio-seated-robot";
    robotRoot.userData.robotId = "blue";
    robotRoot.scale.setScalar(0.9); // Restored Blue Robot size to visually approved larger size (0.72 / 0.8 = 0.900)
    robotRoot.position.set(seatedPlacement.x, seatedPlacement.y, seatedPlacement.z);
    robotRoot.rotation.y = 0; // Facing the keyboard & curved monitor

    // --- 1. WAIST & SEGMENTED LOWER TORSO ---
    const pelvis = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.19, 0.15, 32),
        mats.greyAlloy
    );
    pelvis.name = "supported-pelvis";
    pelvis.position.y = 0.08;
    robotRoot.add(pelvis);

    for (let i = 0; i < 2; i++) {
        const waistBand = new THREE.Mesh(
            new THREE.TorusGeometry(0.21, 0.022, 12, 32),
            mats.whitePlastic
        );
        waistBand.rotation.x = Math.PI / 2;
        waistBand.position.y = 0.14 + i * 0.042;
        robotRoot.add(waistBand);
    }

    // --- 2. UPPER TORSO & DETAILED BACKPACK ---
    robotTorso.name = "studio-robot-torso";
    robotTorso.position.set(0, 0.22, 0);

    const chest = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.21, 0.33, 32),
        mats.whitePlastic
    );
    chest.position.y = 0.16;
    chest.castShadow = true;
    robotTorso.add(chest);

    const collar = new THREE.Mesh(
        new THREE.TorusGeometry(0.215, 0.032, 16, 32),
        mats.orangePlastic
    );
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.315;
    robotTorso.add(collar);

    // Mechanical Ribbed Neck
    for (let n = 0; n < 3; n++) {
        const nRing = new THREE.Mesh(
            new THREE.CylinderGeometry(0.125, 0.125, 0.024, 24),
            n % 2 === 0 ? mats.greyAlloy : mats.darkMetal
        );
        nRing.position.y = 0.355 + n * 0.026;
        robotTorso.add(nRing);
    }

    // Tech Backpack with Orange Top/Bottom Caps & Side 3-Slit Vent Badge
    const bpGroup = new THREE.Group();
    bpGroup.position.set(0, 0.16, 0.215);

    const bpBody = new THREE.Mesh(
        createRoundedBox(0.33, 0.25, 0.155, 0.035, 4),
        mats.whitePlastic
    );
    bpBody.castShadow = true;
    bpGroup.add(bpBody);

    const bpTop = new THREE.Mesh(
        createRoundedBox(0.29, 0.058, 0.165, 0.02, 2),
        mats.orangePlastic
    );
    bpTop.position.y = 0.102;
    bpGroup.add(bpTop);

    const bpBot = new THREE.Mesh(
        createRoundedBox(0.29, 0.048, 0.165, 0.02, 2),
        mats.orangePlastic
    );
    bpBot.position.y = -0.102;
    bpGroup.add(bpBot);

    // Side Orange Vent Badge with 3 Dark Slits (Facing camera on left side of backpack)
    const sideBadge = new THREE.Mesh(
        createRoundedBox(0.03, 0.115, 0.072, 0.008, 2),
        mats.orangePlastic
    );
    sideBadge.position.set(-0.16, -0.01, 0.01);
    bpGroup.add(sideBadge);

    for (let s = -1; s <= 1; s++) {
        const slit = new THREE.Mesh(
            new THREE.BoxGeometry(0.036, 0.011, 0.042),
            mats.darkMetal
        );
        slit.position.set(-0.163, -0.01 + s * 0.027, 0.01);
        bpGroup.add(slit);
    }

    robotTorso.add(bpGroup);
    robotRoot.add(robotTorso);

    // --- 3. CHIBI HEAD WITH SEAMLESS UV HELMET, CONCENTRIC SIDE ARCH & HEADPHONES ---
    robotHead.name = "studio-robot-head";
    robotHead.position.set(0, 0.77, 0);

    const hRad = 0.455;
    const helmetSphere = new THREE.Mesh(
        new THREE.SphereGeometry(hRad, 64, 64),
        mats.helmetMapped
    );
    helmetSphere.scale.set(1.06, 0.98, 1.04);
    helmetSphere.castShadow = true;
    robotHead.add(helmetSphere);

    // Orange Arch Trim around Ear Cups (Signature curved orange stripe on side of head)
    for (let side of [-1, 1]) {
        const arch = new THREE.Mesh(
            new THREE.TorusGeometry(0.215, 0.032, 16, 36, Math.PI * 1.12),
            mats.orangePlastic
        );
        arch.position.set(side * 0.375, -0.02, -0.015);
        arch.rotation.y = side * Math.PI / 2;
        arch.rotation.z = -0.18;
        robotHead.add(arch);
    }

    // Animated LED Face Visor on Front of Head
    const display = createFaceDisplay();
    mainFaceDisplay = display;
    faceCtx = display.ctx;
    faceTexture = display.texture;
    const bezel = new THREE.Mesh(createVisorGeometry(.805, .505, .165, .008), mats.darkMetal);
    bezel.name = 'robot-visor-bezel';
    robotHead.add(bezel);
    const visorMesh = new THREE.Mesh(createVisorGeometry(), new THREE.MeshBasicMaterial({ map: faceTexture, toneMapped: false }));
    visorMesh.name = 'robot-emotion-display';
    robotHead.add(visorMesh);

    // Thick Sculpted Orange Headphones
    const headband = new THREE.Mesh(
        new THREE.TorusGeometry(0.495, 0.046, 20, 48, Math.PI * 1.04),
        mats.orangePlastic
    );
    headband.rotation.y = Math.PI / 2;
    headband.rotation.x = -0.04;
    headband.scale.set(1.0, 0.96, 1.04);
    headband.castShadow = true;
    robotHead.add(headband);

    for (let side of [-1, 1]) {
        const cupGroup = new THREE.Group();
        cupGroup.position.set(side * 0.485, -0.045, 0.01);

        // White Cushion Ring
        const cushion = new THREE.Mesh(
            new THREE.CylinderGeometry(0.162, 0.162, 0.055, 32),
            mats.whitePlastic
        );
        cushion.rotation.z = Math.PI / 2;
        cupGroup.add(cushion);

        // Orange Outer Ear Cup
        const cupBody = new THREE.Mesh(
            new THREE.CylinderGeometry(0.148, 0.132, 0.075, 32),
            mats.orangePlastic
        );
        cupBody.rotation.z = Math.PI / 2;
        cupGroup.add(cupBody);
        cupBody.position.x = side * 0.038;

        // Rounded Dome Cap
        const dome = new THREE.Mesh(
            new THREE.SphereGeometry(0.108, 24, 16),
            mats.orangePlastic
        );
        dome.scale.set(0.45, 1, 1);
        dome.position.x = side * 0.072;
        cupGroup.add(dome);

        robotHead.add(cupGroup);
    }

    robotRoot.add(robotHead);

    // --- 4. ARTICULATED ARMS & INDEPENDENT FINGERS ---
    function createArmAssembly(isLeft) {
        const side = isLeft ? -1 : 1;
        const shoulder = isLeft ? leftShoulder : rightShoulder;
        const elbow = isLeft ? leftElbow : rightElbow;
        const wrist = isLeft ? leftWrist : rightWrist;
        const fingerArr = isLeft ? leftFingers : rightFingers;

        shoulder.position.set(side * 0.275, 0.44, 0.0);

        // Shoulder Ball
        shoulder.add(new THREE.Mesh(new THREE.SphereGeometry(0.082, 24, 24), mats.greyAlloy));

        // Upper Arm White Shell + Orange Circular Cap
        const bicep = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.072, 0.175, 24),
            mats.whitePlastic
        );
        bicep.position.set(side * 0.02, -0.09, 0);
        bicep.castShadow = true;
        shoulder.add(bicep);

        const orangeCap = new THREE.Mesh(
            new THREE.SphereGeometry(0.046, 20, 20),
            mats.orangePlastic
        );
        orangeCap.position.set(side * 0.066, -0.08, 0.018);
        shoulder.add(orangeCap);

        // Elbow Joint
        elbow.position.set(0, -.185, 0);
        const elbowJoint = new THREE.Mesh(
            new THREE.CylinderGeometry(0.066, 0.066, 0.088, 24),
            mats.greyAlloy
        );
        elbowJoint.rotation.z = Math.PI / 2;
        elbow.add(elbowJoint);

        const elbowPin = new THREE.Mesh(
            new THREE.CylinderGeometry(0.038, 0.038, 0.105, 16),
            mats.darkMetal
        );
        elbowPin.rotation.z = Math.PI / 2;
        elbow.add(elbowPin);

        // Chunky Forearm Cuff (White Barrel + Grey Side Insert + Orange Wrist Collar)
        const forearm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.092, 0.108, 0.195, 28),
            mats.whitePlastic
        );
        forearm.position.set(0, -0.108, 0);
        forearm.castShadow = true;
        elbow.add(forearm);

        const sideInsert = new THREE.Mesh(
            createRoundedBox(0.028, 0.088, 0.068, 0.008, 2),
            mats.greyAlloy
        );
        sideInsert.position.set(side * 0.09, -0.108, 0);
        elbow.add(sideInsert);

        const wristCollar = new THREE.Mesh(
            new THREE.TorusGeometry(0.094, 0.023, 16, 28),
            mats.orangePlastic
        );
        wristCollar.rotation.x = Math.PI / 2;
        wristCollar.position.set(0, -0.195, 0);
        elbow.add(wristCollar);

        // Hand & 4 Independently Articulated Fingers
        wrist.name = isLeft ? "left-typing-hand" : "right-typing-hand";
        wrist.position.set(0, -.235, 0);
        const palm = new THREE.Mesh(
            createRoundedBox(0.105, 0.042, 0.095, 0.014, 2),
            mats.whitePlastic
        );
        palm.name = isLeft ? "left-palm" : "right-palm";
        palm.position.y = -.06;
        wrist.add(palm);
        const wristLink = new THREE.Mesh(createRoundedBox(.065, .06, .06, .012, 2), mats.greyAlloy);
        wristLink.position.y = -.03;
        wrist.add(wristLink);

        for (let f = 0; f < 4; f++) {
            const fPivot = new THREE.Group();
            fPivot.name = `typing-finger-${side}-${f}`;
            fPivot.position.set((f - 1.5) * .036, -.068, -.045);

            const fingerMesh = new THREE.Mesh(
                createRoundedBox(0.021, 0.021, 0.062, 0.008, 2),
                mats.whitePlastic
            );
            fingerMesh.position.z = -0.025;
            fingerMesh.rotation.x = 0;
            fPivot.add(fingerMesh);

            wrist.add(fPivot);
            fingerArr.push(fPivot);
        }

        elbow.add(wrist);
        shoulder.add(elbow);
        robotRoot.add(shoulder);
    }

    createArmAssembly(true);
    createArmAssembly(false);

    leftShoulder.rotation.set(0.54, 0.16, -0.24);
    leftElbow.rotation.set(-1.24, -0.18, 0.20);

    rightShoulder.rotation.set(0.54, -0.16, 0.24);
    rightElbow.rotation.set(-1.24, 0.18, -0.20);

    // --- 5. REAL-TIME DYNAMIC CABLE (CONNECTS HEADPHONE TO BACKPACK) ---
    const initialCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.48, 0.70, 0.04),
        new THREE.Vector3(-0.43, 0.52, 0.16),
        new THREE.Vector3(-0.27, 0.41, 0.26),
        new THREE.Vector3(-0.08, 0.37, 0.25)
    ]);
    headphoneCableMesh = new THREE.Mesh(
        new THREE.TubeGeometry(initialCurve, 24, 0.023, 14, false),
        mats.cableSleeved
    );
    headphoneCableMesh.castShadow = true;
    headphoneCableMesh.frustumCulled = false;
    robotRoot.add(headphoneCableMesh);

    hangingLegs = addSeatedLegs(robotRoot, mats);

    blueController = createRobotController({
        id: 'blue',
        root: robotRoot,
        head: robotHead,
        torso: robotTorso,
        leftShoulder,
        leftElbow,
        leftWrist,
        rightShoulder,
        rightElbow,
        rightWrist,
        face: mainFaceDisplay,
        baseRotation: { x: 0, y: 0.52, z: 0 },
        actionDuration: 2.2,
    });

    scene.add(robotRoot);
}

// Updates the headphone cable geometry smoothly when the robot turns its head
function updateDynamicHeadphoneCable() {
    if (!headphoneCableMesh) return;
    const points = cableCurve.points;
    points[0].copy(headphoneAnchorLocal).applyEuler(robotHead.rotation).add(robotHead.position);
    points[3].copy(backpackAnchorLocal).applyEuler(robotTorso.rotation).add(robotTorso.position);
    points[1].copy(points[0]).lerp(points[3], .35).add(cableOffset1);
    points[2].copy(points[0]).lerp(points[3], .72).add(cableOffset2);
    cableCurve.updateArcLengths();
    updateCableBuffer(headphoneCableMesh.geometry, cableCurve);
}

// ============================================================================
// 8. SCULPTED ORANGE & CHARCOAL GAMING CHAIR (WITH ARMRESTS & CUTOUTS)
// ============================================================================
function buildErgonomicGamingChair(mats) {
    chairGroup = new THREE.Group();
    chairGroup.name = "gaming-chair";
    chairGroup.position.set(seatedPlacement.x, 0, seatedPlacement.chairZ);
    chairGroup.rotation.y = 0;

    // Seat Cushion
    const seat = new THREE.Mesh(
        createRoundedBox(0.68, 0.11, 0.64, 0.025, 4),
        mats.chairAccent
    );
    seat.name = "chair-seat-cushion";
    seat.position.set(0, .52, -.05);
    seat.castShadow = true;
    chairGroup.add(seat);
    const seatChassis = new THREE.Mesh(createRoundedBox(.66, .016, .61, .004, 2), mats.chairBlack);
    seatChassis.name = 'chair-graphite-seat-chassis';
    seatChassis.position.set(0, .455, -.05);
    chairGroup.add(seatChassis);

    // T-Shaped Armrests on Left & Right of Seat
    for (let side of [-1, 1]) {
        const armPost = new THREE.Mesh(
            createRoundedBox(0.04, 0.24, 0.06, 0.01, 2),
            mats.chairBlack
        );
        armPost.position.set(side * .38, .62, -.02);
        chairGroup.add(armPost);

        const armPad = new THREE.Mesh(
            createRoundedBox(0.09, 0.032, 0.26, 0.012, 2),
            mats.chairWhite
        );
        armPad.position.set(side * .38, .74, -.02);
        armPad.castShadow = true;
        chairGroup.add(armPad);
    }

    // Sculpted Racing Backrest
    const backRest = new THREE.Group();
    backRest.name = "chair-backrest";
    backRest.position.set(0, .56, .37);
    backRest.rotation.x = .18;

    const backCenter = new THREE.Mesh(
        createRoundedBox(0.55, .904, 0.11, 0.025, 4),
        mats.chairBlack
    );
    backCenter.name = "chair-back-panel";
    backCenter.position.y = .442;
    backCenter.castShadow = true;
    backRest.add(backCenter);
    // A real notch receives the colored headrest. The previous full-height
    // black panel shared its front/rear planes with the cap, causing z-fighting.
    for (const side of [-1, 1]) {
        const shoulder = new THREE.Mesh(createRoundedBox(.093, .156, .11, .006, 2), mats.chairBlack);
        shoulder.name = `chair-black-shoulder-${side}`;
        shoulder.position.set(side * .2285, .972, 0);
        backRest.add(shoulder);
    }
    for (const side of [-1, 1]) {
        const edge = new THREE.Mesh(createRoundedBox(.018, .78, .008, .002, 2), mats.chairWhite);
        edge.name = 'chair-white-back-edge';
        edge.position.set(side * .22, .49, .061);
        backRest.add(edge);
    }

    // Angled Shoulder Bolsters
    for (let side of [-1, 1]) {
        const wing = new THREE.Mesh(
            createRoundedBox(0.14, 0.85, 0.13, 0.035, 3),
            mats.chairAccent
        );
        wing.position.set(side * 0.26, 0.46, -0.02);
        wing.rotation.z = side * 0.08;
        wing.rotation.y = -side * 0.25;
        wing.castShadow = true;
        backRest.add(wing);

        const darkTrim = new THREE.Mesh(
            createRoundedBox(0.055, 0.96, 0.12, 0.02, 2),
            mats.chairBlack
        );
        darkTrim.position.set(side * 0.31, 0.48, -0.01);
        darkTrim.rotation.z = side * 0.08;
        backRest.add(darkTrim);

        // Harness Cutout Holes near Headrest
        const grommet = new THREE.Mesh(
            createRoundedBox(0.085, 0.15, 0.125, 0.02, 2),
            mats.chairBlack
        );
        grommet.position.set(side * 0.105, 0.82, 0);
        grommet.rotation.z = side * 0.12;
        backRest.add(grommet);

        const holeVoid = new THREE.Mesh(
            new THREE.BoxGeometry(0.048, 0.11, 0.132),
            mats.chairBlack
        );
        holeVoid.position.set(side * 0.105, 0.82, 0);
        holeVoid.rotation.z = side * 0.12;
        backRest.add(holeVoid);

        // Lower Side Recliner Hinges
        const hinge = new THREE.Mesh(
            createRoundedBox(0.072, 0.24, 0.16, 0.025, 2),
            mats.chairBlack
        );
        hinge.position.set(side * 0.33, 0.04, -0.03);
        backRest.add(hinge);

        const bolt = new THREE.Mesh(
            new THREE.CylinderGeometry(0.055, 0.055, 0.09, 20),
            mats.chairBlack
        );
        bolt.rotation.z = Math.PI / 2;
        bolt.position.set(side * 0.34, 0.0, -0.03);
        backRest.add(bolt);
    }

    const topCrown = new THREE.Mesh(
        createRoundedBox(0.36, 0.24, 0.11, 0.05, 4),
        mats.chairAccent
    );
    topCrown.position.set(0, 1.02, 0);
    topCrown.name = 'chair-color-headrest';
    backRest.add(topCrown);

    chairGroup.add(backRest);

    // Gas Lift & 5-Star Base
    const lift = new THREE.Mesh(
        new THREE.CylinderGeometry(.045, .055, .405, 20),
        mats.chairBlack
    );
    lift.position.set(0, .2625, -.02);
    lift.name = 'chair-gas-lift';
    chairGroup.add(lift);

    for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const leg = new THREE.Mesh(
            createRoundedBox(0.06, 0.045, 0.38, 0.015, 2),
            mats.chairBlack
        );
        leg.position.set(Math.sin(a) * 0.18, 0.08, -0.02 + Math.cos(a) * 0.18);
        leg.name = `chair-star-leg-${i}`;
        leg.rotation.y = a;
        chairGroup.add(leg);

        const caster = new THREE.Mesh(
            new THREE.CylinderGeometry(0.035, 0.035, 0.03, 16),
            mats.chairBlack
        );
        caster.rotation.z = Math.PI / 2;
        caster.name = `chair-caster-${i}`;
        caster.position.set(Math.sin(a) * 0.34, 0.035, -0.02 + Math.cos(a) * 0.34);
        chairGroup.add(caster);
    }

    for (const side of [-1, 1]) {
        const from = new THREE.Vector3(side * .26, .52, .25);
        const to = new THREE.Vector3(side * .26, .63, .39);
        const rail = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, from.distanceTo(to), 12), mats.chairBlack);
        rail.position.copy(from).add(to).multiplyScalar(.5);
        rail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
        chairGroup.add(rail);
    }
    scene.add(chairGroup);
}

// ============================================================================
// 9. REAL-TIME MONITOR IDE, KEYBOARD RGB & ROBOT EXPRESSIVE VISOR
// ============================================================================
const codeLines = [
    "import { ChibiRig, InverseKinematics } from '@studio/robotics';",
    "import { WebGLRenderer, ACESFilmicToneMapping } from 'three';",
    "",
    "export class NeuralCoderPipeline {",
    "  private readonly servoHz: number = 240;",
    "  private activeTask: string = 'COMPILING_SHADERS';",
    "",
    "  public executeFrame(clockTime: number): void {",
    "    const focusPoint = this.trackCurvedDisplay(clockTime);",
    "    InverseKinematics.solveHands(focusPoint, this.servoHz);",
    "    this.streamTelemetryMetrics({ fps: 60, tempC: 42.5 });",
    "  }",
    "}"
];

function updateMonitorCanvas(t) {
    const ctx = monitorCtx;
    const w = 1440, h = 810;

    ctx.fillStyle = '#0b101e';
    ctx.fillRect(0, 0, w, h);

    // Top Window Titlebar
    ctx.fillStyle = '#070a14';
    ctx.fillRect(0, 0, w, 34);
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(22, 17, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(42, 17, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(62, 17, 6, 0, Math.PI * 2); ctx.fill();
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#a5b8d5'; ctx.fillText('INTELLIGENCE LAB / WORKSPACE', 94, 23);
    ctx.fillStyle = '#8fe1c5'; ctx.fillText('DEMO DATA', 1300, 23);

    // Left File Tree Explorer
    ctx.fillStyle = '#080c17';
    ctx.fillRect(0, 34, 195, h - 34);
    for (let i = 0; i < 20; i++) {
        ctx.fillStyle = i === 4 ? '#38bdf8' : '#475569';
        ctx.fillRect(26 + (i % 3) * 14, 62 + i * 34, 95 - (i % 4) * 16, 9);
    }

    // Center-Left Scrolling Code Pane +Bottom Terminal Split
    ctx.save();
    ctx.beginPath();
    ctx.rect(205, 42, 690, 520);
    ctx.clip();

    ctx.font = 'bold 20px Consolas, monospace';
    const scrollY = (t * 42 * typingSpeed) % 390;

    for (let i = 0; i < 34; i++) {
        const line = codeLines[i % codeLines.length];
        const y = 78 + i * 30 - scrollY;
        if (y > 40 && y < 560) {
            ctx.fillStyle = '#475569';
            ctx.fillText(String(i + 1).padStart(2, '0'), 220, y);

            if (line.includes('import') || line.includes('export') || line.includes('class')) {
                ctx.fillStyle = '#f472b6';
            } else if (line.includes('const') || line.includes('this.')) {
                ctx.fillStyle = '#38bdf8';
            } else if (line.includes('public') || line.includes('private')) {
                ctx.fillStyle = '#819bdb';
            } else {
                ctx.fillStyle = '#e2e8f0';
            }
            ctx.fillText(line, 268, y);
        }
    }
    ctx.restore();

    // Lower Center Terminal Output Pane (Matching the split window in reference photo)
    ctx.fillStyle = '#0f1629';
    ctx.fillRect(205, 575, 690, 215);
    ctx.font = '16px Consolas, monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText("> Exploring patterns in sample data...", 225, 610);
    ctx.fillStyle = '#a7f3d0';
    ctx.fillText("> Notebook ready / demonstration analytics", 225, 642);
    ctx.fillStyle = '#fde047';
    ctx.fillText(`> Session: ${t.toFixed(1)}s | Think. Analyze. Transform.`, 225, 674);

    // Right Analytics Column (3 Distinct Graphs Matching Reference Photo)
    const gx = 915, gw = 500;
    ctx.fillStyle = '#11182c';
    ctx.fillRect(gx, 42, gw, 235);
    ctx.fillRect(gx, 292, gw, 235);
    ctx.fillRect(gx, 542, gw, 248);
    ctx.font = 'bold 16px monospace'; ctx.fillStyle = '#a5b8d5';
    ctx.fillText('01 / SIGNAL OVER TIME', gx + 20, 67);
    ctx.fillText('02 / FEATURE ACTIVITY', gx + 20, 317);
    ctx.fillText('03 / SAMPLE DISTRIBUTION', gx + 20, 567);

    // Chart 1: Multi-Layer Pink/Orange/Yellow Smooth Area Wave
    ctx.beginPath();
    ctx.moveTo(gx + 16, 262);
    for (let x = 0; x <= gw - 32; x += 14) {
        const y = 145 + Math.sin(x * 0.018 + t * 2.6) * 42 + Math.cos(x * 0.01 - t) * 24;
        ctx.lineTo(gx + 16 + x, y);
    }
    ctx.lineTo(gx + gw - 16, 262);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 85, 0, 262);
    grad.addColorStop(0, 'rgba(244, 114, 182, 0.90)');
    grad.addColorStop(0.55, 'rgba(250, 204, 21, 0.70)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0.20)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Chart 2: Rainbow Spectrum Equalizer Bars
    const barCount = 40;
    for (let b = 0; b < barCount; b++) {
        const bh = Math.abs(Math.sin(b * 0.35 + t * 5.2)) * 125 + (Math.sin(b * 1.7 + t) + 1) * 12 + 14;
        ctx.fillStyle = b % 3 === 0 ? '#f472b6' : (b % 2 === 0 ? '#facc15' : '#38bdf8');
        ctx.fillRect(gx + 22 + b * 11.5, 512 - bh, 7.5, bh);
    }

    // Chart 3: Cyan/Emerald Bell Curve Topology
    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= gw - 40; x += 10) {
        const bell = Math.exp(-Math.pow((x - 210) / 85, 2)) * 135;
        const ripple = Math.sin(x * 0.08 + t * 4.5) * 14;
        const py = 760 - bell - ripple;
        if (x === 0) ctx.moveTo(gx + 20 + x, py);
        else ctx.lineTo(gx + 20 + x, py);
    }
    ctx.stroke();

    monitorTexture.needsUpdate = true;
}

function updateKeyboardAndVisor(t) {
    // Rainbow RGB Wave on Keyboard
    const kCtx = kbRgbCtx;
    const grad = kCtx.createLinearGradient(0, 0, 512, 0);
    for (let i = 0; i <= 5; i++) {
        const hue = ((t * 65) + i * 60) % 360;
        grad.addColorStop(i / 5, `hsl(${hue}, 95%, 55%)`);
    }
    kCtx.fillStyle = grad;
    kCtx.fillRect(0, 0, 512, 256);
    kbRgbTexture.needsUpdate = true;

    // Robot Glowing Visor Face (Handled by blueController or fallback)
    if (!blueController) {
        const interaction = getStudioInteraction(t);
        drawRobotFace(faceCtx, t, interaction.mainEmotion, interaction.mainGaze);
        faceTexture.needsUpdate = true;
    }
}

// ============================================================================
// 10. MAIN ANIMATION LOOP (HEAD SCAN, FINGER ARTICULATION, CABLE & FANS)
// ============================================================================

let lastTextureTick = 0;

const raycaster = new THREE.Raycaster();
const mouseVec = new THREE.Vector2();

function getRobotAtPointer(event, wallClick = false) {
    if (!renderer || !camera || !container) return null;
    const canvasRect = renderer.domElement.getBoundingClientRect();
    const rect = canvasRect.width ? canvasRect : container.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return null;
    mouseVec.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouseVec, camera);

    const candidates = [];
    if (elapsed >= STUDIO_ENTRANCE_DURATION) {
        if (robotRoot) candidates.push(robotRoot);
        if (companions?.group) candidates.push(companions.group);
    }
    if (room?.iridescenceWall) candidates.push(room.iridescenceWall);

    const hits = raycaster.intersectObjects(candidates, true);
    if (hits.length === 0) { room?.setWallPointer(null); return null; }
    if (hits[0].object === room?.iridescenceWall) {
        room.setWallPointer(hits[0].uv);
        if (wallClick) room.clickWall(hits[0].uv);
        return null;
    }
    room?.setWallPointer(null);

    let obj = hits[0].object;
    while (obj) {
        if (obj === robotRoot) return 'blue';
        if (obj.userData?.robotId) return obj.userData.robotId;
        obj = obj.parent;
    }
    return null;
}

const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
let pendingPointer = null, hoveredRobot = null, pendingWallClick = false;
function onPointerMove(event) {
    if (typeof window === 'undefined') return;
    const x = (event.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
    const y = -(event.clientY / Math.max(window.innerHeight, 1)) * 2 + 1;
    pointer.targetX = Math.max(-1, Math.min(1, x));
    pointer.targetY = Math.max(-1, Math.min(1, y));
    if (moduleResponse?.hasSelection()) return;
    pendingPointer = { clientX: event.clientX, clientY: event.clientY };
}

function updatePointerTarget() {
    if (!pendingPointer || moduleResponse?.hasSelection()) return;
    const hitId = getRobotAtPointer(pendingPointer, pendingWallClick);
    pendingPointer = null; pendingWallClick = false;
    if (hitId === hoveredRobot) return;
    hoveredRobot = hitId;
    if (hitId === 'blue') {
        blueController?.onHover(true);
        companions?.onHover(null);
        if (container?.style) container.style.cursor = 'pointer';
    } else if (hitId) {
        blueController?.onHover(false);
        companions?.onHover(hitId, true);
        if (container?.style) container.style.cursor = 'pointer';
    } else {
        blueController?.onHover(false);
        companions?.onHover(null);
        if (container?.style) container.style.cursor = 'default';
    }
}

function onPointerClick(event) {
    const hitId = getRobotAtPointer(event);
    if (hitId === 'blue') {
        blueController?.onClick();
    } else if (hitId) {
        companions?.onClick(hitId);
    }
}

function onWallPointerDown(event) {
    if (event.target?.closest?.('button, a, [role="dialog"]') || moduleResponse?.hasSelection()) return;
    pendingPointer = { clientX: event.clientX, clientY: event.clientY };
    pendingWallClick = true;
}

function onPointerLeave() {
    pointer.targetX = 0;
    pointer.targetY = 0;
    pendingPointer = null; hoveredRobot = null;
    pendingWallClick = false; room?.setWallPointer(null);
    if (moduleResponse?.hasSelection()) return;
    blueController?.onHover(false);
    companions?.onHover(null);
    if (container?.style) container.style.cursor = 'default';
}

if (typeof window !== 'undefined') {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onWallPointerDown, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    if (container?.addEventListener) {
        container.addEventListener('click', onPointerClick);
    }
}



function resize({ draw = true } = {}) {
    if (disposed || !renderer) return;
    const width = Math.max(container.clientWidth, 1), height = Math.max(container.clientHeight, 1);
    const rect = container.getBoundingClientRect();
    const viewportWidth = Math.max(window.innerWidth, rect.left + width);
    const viewportHeight = Math.max(window.innerHeight, rect.top + height);
    const resizeKey = [width, height, rect.left, rect.top, viewportWidth, viewportHeight, window.devicePixelRatio].join(':');
    if (lastResizeKey === resizeKey) return;
    lastResizeKey = resizeKey;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 600 ? 1.35 : 1.5, Math.sqrt(3000000 / (viewportWidth * viewportHeight))));
    renderer.setSize(viewportWidth, viewportHeight, false);
    const stage = scene.getObjectByName('studio-actors');
    if (!framingPoints) {
        const composition = scene.getObjectByName('studio-composition');
        scene.updateMatrixWorld(true);
        framingPoints = [];
        composition.traverse(object => {
            if (!object.geometry || object.userData.studioContour) return;
            object.geometry.computeBoundingBox();
            const bounds = object.geometry.boundingBox;
            for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
                framingPoints.push(new THREE.Vector3(x, y, z).applyMatrix4(object.matrixWorld));
            }
        });
    }
    const projection = configureStudioRoom(camera, framingPoints, { left: rect.left, top: rect.top, width, height }, viewportWidth, viewportHeight);
    gsap.set(stage.scale, { x: projection.scale, y: projection.scale, z: projection.scale });
    gsap.set(stage.position, { x: projection.position[0], y: 0, z: projection.position[2] });
    room.updateProjection(projection);
    const experience = container.closest?.('.lab-experience');
    experience?.style.setProperty('--floor-transform', projection.floorTransform);
    experience?.setAttribute('data-wall-projected', 'true');
    grounding.update();
    if (draw) renderer.render(scene, camera);
}
function animate(now) {
    frame = 0;
    if (!running || disposed) return;
    if (now - lastPaint < 1000 / 60 - .5) { frame = requestAnimationFrame(animate); return; }
    lastPaint = now;
    const delta = Math.min(Math.max((now - previous) / 1000 || 1 / 60, 0), .05);
    previous = now;
    elapsed += delta;
    const t = elapsed;
    updatePointerTarget();
    pointer.x += (pointer.targetX - pointer.x) * 0.06;
    pointer.y += (pointer.targetY - pointer.y) * 0.06;
    const entering = t < STUDIO_ENTRANCE_DURATION;
    if (!entering && !conversationStarted) {
        blueController.reset(); companions.resetControllers(); conversationStarted = true;
        moduleResponse.start();
    }
    const playTime = entering ? t : t - STUDIO_ENTRANCE_DURATION;

    // Keep the checked seated configuration stable from the first frame.
    robotRoot.position.set(seatedPlacement.x, seatedPlacement.y, seatedPlacement.z);
    robotRoot.rotation.set(0, 0, 0);
    blueController?.update(playTime, delta, pointer);
    const typingSpeed = blueController?.getState() === 'action' ? 2.4 : 1;
    if (t >= BLUE_SEATED_AT) {
        poseTypingArm(robotRoot, leftShoulder, leftElbow, leftWrist, leftFingers, -1, playTime * typingSpeed, keycapMeshes, keyboard);
        poseTypingArm(robotRoot, rightShoulder, rightElbow, rightWrist, rightFingers, 1, playTime * typingSpeed, keycapMeshes, keyboard);
    }
    hangingLegs.forEach(leg => leg.rotation.set(0, 0, 0));

    updateDynamicHeadphoneCable();
    companions.update(playTime, { entering }, pointer);
    entrance.update(t);
    room.update(t, delta);
    grounding.update();

    // Active PC Component Animations (Fans, Radiator, GPU Fans & Impeller)
    pcFanRotors.forEach((rotor, i) => {
        const speed = (14.0 + (i % 5) * 1.8) * delta;
        if (rotor.position.y > 0.25 || rotor.position.y < -0.05) {
            rotor.rotation.y -= speed;
        } else if (rotor.rotation.x !== undefined && Math.abs(rotor.position.y - 0.24) < 0.02) {
            rotor.rotation.x -= speed;
        } else {
            rotor.rotation.z -= speed;
        }
    });

    // Dynamic PC Case controller (OLED temp display, RAM RGB cascade, GPU lighting)
    pcAnimationController?.update?.(t, delta);
    argbMaterials.forEach((mat, i) => mat.color.setHSL((t * .08 + i * .15) % 1, .7, .55));

    if (t - lastTextureTick > .08) {
        updateMonitorCanvas(t);
        updateKeyboardAndVisor(t);
        lastTextureTick = t;
    }
    renderer.render(scene, camera);
    if (!firstRevealSent && deskGroup.visible && chairGroup.visible) {
        firstRevealSent = true;
        onVisible?.();
    }
    frame = requestAnimationFrame(animate);
}
function* setup() {
    yield* init();
    updateMonitorCanvas(0);
    updateKeyboardAndVisor(0);
    updateDynamicHeadphoneCable();
    poseTypingArm(robotRoot, leftShoulder, leftElbow, leftWrist, leftFingers, -1, 0, keycapMeshes, keyboard);
    poseTypingArm(robotRoot, rightShoulder, rightElbow, rightWrist, rightFingers, 1, 0, keycapMeshes, keyboard);
    blueController.update(0, .016);
    companions.update(0, .016);
    resize({ draw: false });
    yield;
    entrance = timed('entrance', () => createStudioEntrance({ primary: scene.getObjectByName('primary-workstation'), blue: robotRoot, chair: chairGroup, companions, shoulders: [leftShoulder, rightShoulder], elbows: [leftElbow, rightElbow], wrists: [leftWrist, rightWrist], legs: hangingLegs, fingers: [leftFingers,rightFingers], keys: keycapMeshes, keyboard }));
    entrance.update(0);
    grounding.update();
    yield;
    renderer.render(scene, camera);
}
const api = {
    get scene() { return scene; }, get camera() { return camera; }, get renderer() { return renderer; }, startupMetrics,
    setModuleInteraction(signal) {
        hoveredRobot = null; pendingPointer = null; pendingWallClick = false;
        moduleResponse.set(signal);
        room?.setInteraction(signal);
    },
    resize,
    setRunning(value) {
        if (disposed || running === value) return;
        running = value;
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        if (running) { previous = performance.now(); lastPaint = -Infinity; frame = requestAnimationFrame(animate); }
    },
    dispose,
};
if (incremental) {
    const stages = setup();
    return runStudioSetup(stages, { signal, onStage(ms) {
        startupMetrics.longestSetupStageMs = Math.max(startupMetrics.longestSetupStageMs || 0, ms);
    } }).then(() => api).catch(error => { dispose(); throw error; });
}
try { for (const _step of setup()) void _step; } catch (error) { dispose(); throw error; }
return api;
function dispose() {
        disposed = true; running = false;
        entrance?.dispose();
        room?.dispose();
        if (typeof window !== 'undefined') {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerdown', onWallPointerDown);
            window.removeEventListener('pointerleave', onPointerLeave);
        }
        if (container?.removeEventListener) {
            container.removeEventListener('click', onPointerClick);
        }
        if (frame) cancelAnimationFrame(frame);
        const geometries = new Set(), materials = new Set(constructionMaterials), textures = new Set();
        scene?.traverse(object => {
            if (object.geometry) geometries.add(object.geometry);
            for (const material of (Array.isArray(object.material) ? object.material : [object.material])) {
                if (!material) continue;
                materials.add(material);
                Object.values(material).forEach(value => { if (value?.isTexture) textures.add(value); });
            }
        });
        materials.forEach(material => Object.values(material).forEach(value => { if (value?.isTexture) textures.add(value); }));
        geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
        scene?.clear(); renderer?.renderLists.dispose(); renderer?.dispose(); renderer?.forceContextLoss();
        renderer?.domElement.remove();
        const experience = container.closest?.('.lab-experience');
        experience?.style.removeProperty('--floor-transform');
        experience?.removeAttribute('data-wall-projected');
        moduleSlots.forEach(slot => slot?.style.removeProperty('--module-transform')); moduleSlots.clear();
}
}






