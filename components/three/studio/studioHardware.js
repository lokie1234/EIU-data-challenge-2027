import * as THREE from 'three-studio';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry';
import { createMonitorScreenGeometry, createMonitorHousingGeometry } from './studioSurfaces';

export function createStudioMonitor(materials, texture) {
  const group = new THREE.Group(); group.name = 'studio-monitor';
  group.position.set(-.88, 1.32, -.26); group.rotation.y = 1.30;
  const box = (name, size, position, material, radius = .012) => {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(...size, 3, radius), material);
    mesh.name = name; mesh.position.set(...position); mesh.castShadow = true; group.add(mesh);
    return mesh;
  };
  box('monitor-stand-base', [.46, .032, .27], [0, -.455, -.005], materials.frameCyan);
  box('monitor-stand-neck', [.07, .34, .065], [0, -.27, -.045], materials.frameViolet);
  const hinge = new THREE.Mesh(new THREE.SphereGeometry(.045, 16, 12), materials.greyAlloy);
  hinge.position.set(0, -.10, -.07); group.add(hinge);
  const geometry = createMonitorHousingGeometry();
  const shell = new THREE.Mesh(geometry, materials.frameViolet);
  shell.name = 'monitor-curved-housing'; shell.position.y = .04; shell.castShadow = true; group.add(shell);
  const screen = new THREE.Mesh(createMonitorScreenGeometry(), new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide, toneMapped: false }));
  screen.name = 'monitor-readable-screen'; screen.position.y = .04; group.add(screen);
  for (const side of [-1, 1]) {
    box('monitor-cyan-cheek', [.022, .69, .032], [side * .612, .04, .139], materials.frameCyan);
    box('monitor-coral-corner', [.06, .025, .034], [side * .585, -.309, .14], materials.frameCoral);
  }
  box('monitor-pearl-chin', [1.08, .026, .018], [0, -.308, .137], materials.framePearl);
  const camera = new THREE.Mesh(new THREE.SphereGeometry(.009, 12, 8), materials.darkMetal);
  camera.name = 'monitor-webcam'; camera.position.set(0, .384, .044); group.add(camera);
  const power = new THREE.Mesh(new THREE.SphereGeometry(.0045, 8, 6), new THREE.MeshBasicMaterial({ color: '#8fe1c5' }));
  power.position.set(.53, -.30, .13); group.add(power);
  for (let i = 0; i < 6; i++) box('monitor-rear-vent', [.09, .008, .008], [-.34 + i * .135, -.24, -.04], materials.darkMetal, .003);
  return group;
}

export function detailPcCase(group, materials, options = {}) {
  const fanRotors = options.fanRotors || [];
  const argbMaterials = options.argbMaterials || [];
  const createCanvas = options.createCanvas || ((w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h }));

  const box = (name, size, position, material, radius = .005) => {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(...size, 2, radius * .48), material);
    mesh.name = name; mesh.position.set(...position); group.add(mesh); return mesh;
  };

  // Corner structural chassis posts
  for (const x of [-.168, .168]) {
    for (const z of [-.272, .272]) {
      box('pc-chassis-post', [.022, .66, .022], [x, 0, z], x < 0 ? materials.frameCyan : materials.frameCoral, .005);
    }
  }

  // Top ventilation slots
  const slotGeometry = new THREE.BoxGeometry(.25, .004, .008);
  const vents = new THREE.InstancedMesh(slotGeometry, materials.darkMetal, 14);
  vents.name = 'pc-top-ventilation';
  const transform = new THREE.Object3D();
  for (let i = 0; i < 14; i++) {
    transform.position.set(0, .357, -.22 + i * .034);
    transform.updateMatrix();
    vents.setMatrixAt(i, transform.matrix);
  }
  group.add(vents);

  // Front I/O strip
  box('pc-front-io-strip', [.27, .045, .014], [0, .285, .287], materials.frameCoral);
  for (let i = 0; i < 2; i++) {
    box('pc-usb-port', [.026, .012, .007], [-.075 + i * .044, .286, .297], materials.darkMetal, .002);
  }
  const typeC = box('pc-type-c-port', [.016, .008, .006], [.015, .286, .298], materials.greyAlloy, .002);
  const button = new THREE.Mesh(new THREE.CylinderGeometry(.013, .013, .008, 16), materials.greyAlloy);
  button.name = 'pc-power-button'; button.rotation.x = Math.PI / 2; button.position.set(.092, .286, .299); group.add(button);

  // Panel fasteners
  for (const x of [-.14, .14]) {
    for (const y of [-.29, .29]) {
      const screw = new THREE.Mesh(new THREE.SphereGeometry(.005, 8, 6), materials.greyAlloy);
      screw.name = 'pc-panel-fastener'; screw.position.set(x, y, .289); group.add(screw);
    }
  }

  // Motherboard PCB
  const board = new THREE.MeshStandardMaterial({ color: '#111827', metalness: .4, roughness: .4 });
  box('pc-motherboard', [.007, .48, .44], [.147, .05, 0], board, .003);

  // Motherboard Cyber Armor / Multi-Fin VRM Heatsinks
  const vrmMat = new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: .88, roughness: .18 });
  box('pc-vrm-top-heatsink', [.016, .055, .17], [.138, .22, -.06], vrmMat, .004);
  box('pc-vrm-side-heatsink', [.016, .15, .055], [.138, .14, -.14], vrmMat, .004);
  const chipsetMat = new THREE.MeshBasicMaterial({ color: '#06b6d4' });
  argbMaterials.push(chipsetMat);
  box('pc-chipset-rgb-badge', [.018, .068, .068], [.137, -.08, .08], chipsetMat, .004);

  // Dual M.2 NVMe SSD Thermal Armor Shields with laser-etched badges
  box('pc-m2-drive', [.010, .042, .135], [.138, -.12, -.10], materials.greyAlloy, .003);
  box('pc-m2-secondary', [.010, .036, .115], [.138, .03, .06], materials.greyAlloy, .003);

  // 4x HIGH-END DDR5 RGB GAMING RAM STICKS (with dynamic cascading lighting)
  const ramLeds = [];
  const ramHeatsinkMat = new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: .85, roughness: .22 });
  for (let r = 0; r < 4; r++) {
    const rZ = .025 + r * .016;
    // Heatsink body
    box(`pc-ram-heatsink-${r}`, [.009, .082, .013], [.138, .17, rZ], ramHeatsinkMat, .002);
    // Silver chamfer accent
    box(`pc-ram-accent-${r}`, [.010, .014, .013], [.137, .195, rZ], materials.greyAlloy, .001);
    // Top frosted ARGB lightbar
    const rLedMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    ramLeds.push(rLedMat);
    argbMaterials.push(rLedMat);
    box(`pc-ram-rgb-lightbar-${r}`, [.011, .012, .013], [.136, .212, rZ], rLedMat, .002);
  }

  // --- AIO LIQUID CPU COOLER WITH REAL-TIME OLED TELEMETRY DISPLAY ---
  const aioCanvas = createCanvas(256, 256);
  const aioCtx = aioCanvas.getContext('2d');
  const aioTexture = new THREE.CanvasTexture(aioCanvas);
  aioTexture.minFilter = THREE.LinearFilter;
  const aioScreenMat = new THREE.MeshBasicMaterial({ map: aioTexture, toneMapped: false });

  // AIO Pump Base & Bezel
  const aioBlock = box('pc-aio-pump-housing', [.032, .088, .088], [.132, .14, -.04], materials.pcBlack, .015);
  const aioBezel = new THREE.Mesh(new THREE.TorusGeometry(.038, .005, 16, 32), materials.greyAlloy);
  aioBezel.rotation.y = Math.PI / 2;
  aioBezel.position.set(.116, .14, -.04);
  group.add(aioBezel);

  // OLED Screen
  const aioScreenMesh = new THREE.Mesh(new THREE.CircleGeometry(.034, 32), aioScreenMat);
  aioScreenMesh.rotation.y = -Math.PI / 2;
  aioScreenMesh.position.set(.115, .14, -.04);
  group.add(aioScreenMesh);

  // AIO Liquid CPU Cooling Tubes with Chrome Compression Fittings
  for (const offset of [0, .026]) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(.115, .14, -.04 + offset),
      new THREE.Vector3(.07, .25, -.08 + offset),
      new THREE.Vector3(-.03, .27, -.17 + offset),
      new THREE.Vector3(-.07, .20, -.22 + offset)
    ]);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 18, .009, 10, false), materials.darkMetal);
    tube.name = 'pc-liquid-cooling-tube'; group.add(tube);

    const fitting = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .014, 16), materials.greyAlloy);
    fitting.rotation.z = Math.PI / 2;
    fitting.position.set(.115, .14, -.04 + offset);
    group.add(fitting);
  }

  // --- COOLANT FLOW INDICATOR / TURBINE WHEEL (Custom Loop Element) ---
  const flowHousingMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .35, roughness: .05, metalness: .1, transmission: .9 });
  const flowHousing = new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, .036, 16), flowHousingMat);
  flowHousing.rotation.z = Math.PI / 2;
  flowHousing.position.set(.02, .24, -.12);
  group.add(flowHousing);

  const flowImpeller = new THREE.Group();
  flowImpeller.position.set(.02, .24, -.12);
  const impellerMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
  argbMaterials.push(impellerMat);
  const impellerHub = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .028, 12), materials.darkMetal);
  impellerHub.rotation.z = Math.PI / 2;
  flowImpeller.add(impellerHub);
  for (let b = 0; b < 6; b++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(.003, .016, .024), impellerMat);
    const angle = (b / 6) * Math.PI * 2;
    blade.position.set(0, Math.sin(angle) * .009, Math.cos(angle) * .009);
    blade.rotation.x = angle + .4;
    flowImpeller.add(blade);
  }
  group.add(flowImpeller);
  fanRotors.push(flowImpeller);

  // --- HIGH-PERFORMANCE GAMING GRAPHICS CARD (TRIPLE ACTIVE FANS + CNC BACKPLATE + RGB LOGO) ---
  const gpuBackplateMat = new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: .9, roughness: .18 });
  box('pc-gpu-backplate', [.16, .007, .35], [.03, .004, -.02], gpuBackplateMat, .003);

  // Heatsink fins array
  for (let i = 0; i < 11; i++) {
    box('pc-gpu-heatsink-fin', [.018, .046, .008], [-.062, -.045, -.15 + i * .030], materials.greyAlloy, .002);
  }

  // Active Triple Spinning GPU Fans
  const gpuFanMat = new THREE.MeshBasicMaterial({ color: '#38bdf8' });
  argbMaterials.push(gpuFanMat);
  for (let f = 0; f < 3; f++) {
    const fZ = -.11 + f * .09;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.034, .005, 10, 24), gpuFanMat);
    ring.name = `pc-gpu-fan-ring-${f}`;
    ring.rotation.x = Math.PI / 2;
    ring.position.set(.03, -.072, fZ);
    group.add(ring);

    const gpuRotor = new THREE.Group();
    gpuRotor.position.set(.03, -.072, fZ);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(.013, .013, .008, 16), materials.darkMetal);
    gpuRotor.add(hub);
    const bladeMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: .35, metalness: .6 });
    for (let b = 0; b < 7; b++) {
      const gBlade = new THREE.Mesh(new THREE.BoxGeometry(.022, .004, .008), bladeMat);
      const ba = (b / 7) * Math.PI * 2;
      gBlade.position.set(Math.cos(ba) * .02, 0, Math.sin(ba) * .02);
      gBlade.rotation.y = ba + .35;
      gpuRotor.add(gBlade);
    }
    group.add(gpuRotor);
    fanRotors.push(gpuRotor);
  }

  // Illuminated "GEFORCE RTX 5090" / RGB side banner
  const rtxLogoMat = new THREE.MeshBasicMaterial({ color: '#4ade80' });
  argbMaterials.push(rtxLogoMat);
  box('pc-gpu-rtx-logo', [.008, .018, .14], [-.064, -.03, -.08], rtxLogoMat, .002);

  // Anodized Aluminum GPU Anti-Sag Support Bracket with RGB strip
  const sagBracketMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: .85, roughness: .25 });
  box('pc-gpu-sag-bracket-arm', [.012, .18, .012], [-.065, -.14, .12], sagBracketMat, .003);
  box('pc-gpu-sag-bracket-claw', [.032, .010, .024], [-.055, -.05, .12], sagBracketMat, .002);

  // Dual 8-Pin Sleeved PCIe Power Cables with illuminated cable combs
  const cableMat = new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: .35, metalness: .1 });
  for (let p = 0; p < 2; p++) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(.01, -.01, .06 + p * .022),
      new THREE.Vector3(-.02, .05, .07 + p * .022),
      new THREE.Vector3(-.04, .08, .12 + p * .022),
      new THREE.Vector3(-.05, -.08, .16 + p * .022)
    ]);
    const wire = new THREE.Mesh(new THREE.TubeGeometry(curve, 14, .005, 8, false), cableMat);
    wire.name = `pc-gpu-pcie-cable-${p}`;
    group.add(wire);

    // Cable comb clip
    const comb = box(`pc-gpu-comb-${p}`, [.016, .006, .012], [-.03, .065, .095 + p * .022], materials.greyAlloy, .002);
  }

  // Braided 24-Pin ATX Motherboard Cable Bundle with Cable Comb
  const atxCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(.14, .12, .15),
    new THREE.Vector3(.08, .12, .18),
    new THREE.Vector3(.02, .05, .20),
    new THREE.Vector3(-.02, -.10, .21)
  ]);
  const atxCable = new THREE.Mesh(new THREE.TubeGeometry(atxCurve, 16, .012, 10, false), cableMat);
  atxCable.name = 'pc-atx-24pin-cable';
  group.add(atxCable);
  box('pc-atx-comb', [.024, .008, .018], [.05, .085, .19], materials.greyAlloy, .002);

  // Top 240mm Radiator with Dual ARGB Exhaust Fans
  const radMat = new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: .8, roughness: .25 });
  box('pc-top-radiator', [.16, .026, .34], [0, .31, -.04], radMat, .003);

  const topFanHaloMat = new THREE.MeshBasicMaterial({ color: '#a855f7' });
  argbMaterials.push(topFanHaloMat);
  for (let tf = 0; tf < 2; tf++) {
    const fZ = -.11 + tf * .14;
    const topFanRing = new THREE.Mesh(new THREE.TorusGeometry(.055, .007, 12, 28), topFanHaloMat);
    topFanRing.name = `pc-top-fan-ring-${tf}`;
    topFanRing.rotation.x = Math.PI / 2;
    topFanRing.position.set(0, .285, fZ);
    group.add(topFanRing);

    const topRotor = new THREE.Group();
    topRotor.position.set(0, .285, fZ);
    const topHub = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, .01, 16), materials.darkMetal);
    topRotor.add(topHub);
    const bladeMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: .3 });
    for (let b = 0; b < 9; b++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(.038, .005, .012), bladeMat);
      const ba = (b / 9) * Math.PI * 2;
      blade.position.set(Math.cos(ba) * .03, 0, Math.sin(ba) * .03);
      blade.rotation.y = ba + .4;
      topRotor.add(blade);
    }
    group.add(topRotor);
    fanRotors.push(topRotor);
  }

  // PSU Shroud Cutout Window with Illuminated "1000W TITANIUM" Badge
  box('pc-psu-cutout-border', [.01, .06, .14], [-.161, -.26, -.05], materials.greyAlloy, .003);
  const psuBadgeMat = new THREE.MeshBasicMaterial({ color: '#f59e0b' });
  argbMaterials.push(psuBadgeMat);
  box('pc-psu-rgb-badge', [.008, .036, .09], [-.159, -.26, -.05], psuBadgeMat, .002);

  // Internal ARGB Mood Lighting Strip along top chassis rail
  const ledStripMat = new THREE.MeshBasicMaterial({ color: '#60efff' });
  argbMaterials.push(ledStripMat);
  box('pc-internal-led-strip', [.008, .006, .46], [-.155, .32, 0], ledStripMat, .002);

  // Side glass thumb screws
  for (const z of [-.21, .21]) {
    for (const y of [-.27, .27]) {
      const screw = new THREE.Mesh(new THREE.SphereGeometry(.006, 10, 8), materials.greyAlloy);
      screw.position.set(-.18, y, z); group.add(screw);
    }
  }

  // Live OLED Display and dynamic animation update handler
  return {
    update(time, delta) {
      // 1. Dynamic AIO LCD temperature telemetry HUD
      const ctx = aioCtx;
      if (ctx) {
        ctx.fillStyle = '#070b14';
        ctx.fillRect(0, 0, 256, 256);

        // Circular bezel guide
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(128, 128, 110, 0, Math.PI * 2);
        ctx.stroke();

        // Pulsing load arc
        const arcStart = time * 2.2;
        const temp = Math.round(41 + Math.sin(time * 1.2) * 3);
        const arcGrad = ctx.createLinearGradient(0, 0, 256, 256);
        arcGrad.addColorStop(0, '#38bdf8');
        arcGrad.addColorStop(0.5, '#a855f7');
        arcGrad.addColorStop(1, '#ec4899');
        ctx.strokeStyle = arcGrad;
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(128, 128, 96, arcStart, arcStart + Math.PI * 1.35);
        ctx.stroke();

        // Inner glowing temperature readout
        ctx.font = 'bold 64px Consolas, monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${temp}°C`, 128, 118);

        // Subtitle status
        ctx.font = 'bold 18px Consolas, monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('2800 RPM', 128, 168);

        aioTexture.needsUpdate = true;
      }

      // 2. RAM dynamic cascading RGB light wave
      ramLeds.forEach((mat, idx) => {
        const hue = (time * 0.45 + idx * 0.12) % 1;
        mat.color.setHSL(hue, 0.9, 0.58);
      });

      // 3. GPU RTX side banner color flow
      const rtxHue = (time * 0.25) % 1;
      rtxLogoMat.color.setHSL(rtxHue, 0.85, 0.55);
    }
  };
}
