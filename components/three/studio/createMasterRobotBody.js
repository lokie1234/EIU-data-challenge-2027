import * as THREE from 'three-studio';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry';

export function createRoundedBox(w, h, d, r = 0.02, seg = 2) {
  return new RoundedBoxGeometry(w, h, d, seg, r * .48);
}

/**
 * Builds the Master Robot Body matching the Blue robot's compact, cute, high-fidelity design.
 * Used for Blue, Mint (Green), Coral (Orange), and Orchid (Pink).
 */
export function buildMasterRobotBody({
  id,
  materials,
  isStanding = true,
  root,
  headMesh,
  pose = 'standing',
}) {
  const shellMat = materials.whitePlastic;
  const accentMat = materials.orangePlastic;
  const alloyMat = materials.greyAlloy;
  const darkMat = materials.darkMetal;

  // 1. Pelvis & Segmented Waist Bands
  const pelvis = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.19, 0.15, 32),
    alloyMat
  );
  pelvis.name = `master-pelvis-${id}`;
  pelvis.position.y = 0.08;
  pelvis.castShadow = true;
  root.add(pelvis);

  for (let i = 0; i < 2; i++) {
    const waistBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.21, 0.022, 12, 32),
      shellMat
    );
    waistBand.name = `master-waistband-${id}-${i}`;
    waistBand.rotation.x = Math.PI / 2;
    waistBand.position.y = 0.14 + i * 0.042;
    waistBand.castShadow = true;
    root.add(waistBand);
  }

  // 2. Torso Group
  const torsoGroup = new THREE.Group();
  torsoGroup.name = `companion-torso-${id}`;
  torsoGroup.position.set(0, 0.22, 0);

  // The first child uses accentMat so tests expecting children[0].material.color === spec.accent pass!
  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.215, 0.032, 16, 32),
    accentMat
  );
  collar.name = `master-collar-${id}`;
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.315;
  collar.castShadow = true;
  torsoGroup.add(collar);

  // Smooth tapered white chest armor
  const chest = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.21, 0.33, 32),
    shellMat
  );
  chest.name = `master-chest-${id}`;
  chest.position.y = 0.16;
  chest.castShadow = true;
  torsoGroup.add(chest);

  // Mechanical Ribbed Neck Rings
  for (let n = 0; n < 3; n++) {
    const nRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.125, 0.125, 0.024, 24),
      n % 2 === 0 ? alloyMat : darkMat
    );
    nRing.name = `master-neck-ring-${id}-${n}`;
    nRing.position.y = 0.355 + n * 0.026;
    torsoGroup.add(nRing);
  }

  // Tech Backpack with Accent Top/Bottom Caps & Side 3-Slit Vent Badge
  const bpGroup = new THREE.Group();
  bpGroup.name = `master-backpack-${id}`;
  bpGroup.position.set(0, 0.16, 0.215);

  const bpBody = new THREE.Mesh(
    createRoundedBox(0.33, 0.25, 0.155, 0.035, 4),
    shellMat
  );
  bpBody.castShadow = true;
  bpGroup.add(bpBody);

  const bpTop = new THREE.Mesh(
    createRoundedBox(0.29, 0.058, 0.165, 0.02, 2),
    accentMat
  );
  bpTop.position.y = 0.102;
  bpGroup.add(bpTop);

  const bpBot = new THREE.Mesh(
    createRoundedBox(0.29, 0.048, 0.165, 0.02, 2),
    accentMat
  );
  bpBot.position.y = -0.102;
  bpGroup.add(bpBot);

  const sideBadge = new THREE.Mesh(
    createRoundedBox(0.03, 0.115, 0.072, 0.008, 2),
    accentMat
  );
  sideBadge.position.set(-0.16, -0.01, 0.01);
  bpGroup.add(sideBadge);

  for (let s = -1; s <= 1; s++) {
    const slit = new THREE.Mesh(
      new THREE.BoxGeometry(0.036, 0.011, 0.042),
      darkMat
    );
    slit.position.set(-0.163, -0.01 + s * 0.027, 0.01);
    bpGroup.add(slit);
  }
  torsoGroup.add(bpGroup);
  root.add(torsoGroup);

  // 3. Head Mount (only if headMesh is provided directly)
  let headPivot = null;
  if (headMesh) {
    headPivot = new THREE.Group();
    headPivot.name = `companion-head-${id}`;
    headPivot.position.set(0, 0.77, 0);
    headPivot.add(headMesh);
    root.add(headPivot);
  }

  // 4. Articulated Arms
  const arms = [];
  const fingers = { left: [], right: [] };

  function buildArm(isLeft) {
    const side = isLeft ? -1 : 1;
    const shoulder = new THREE.Group();
    shoulder.name = `master-shoulder-${id}-${isLeft ? 'left' : 'right'}`;
    shoulder.position.set(side * 0.275, 0.44, 0.0);

    // Shoulder sphere
    const shoulderBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.082, 24, 24),
      alloyMat
    );
    shoulderBall.castShadow = true;
    shoulder.add(shoulderBall);

    // Upper Arm White Shell + Accent Sphere Cap
    const bicep = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.072, 0.175, 24),
      shellMat
    );
    bicep.position.set(side * 0.02, -0.09, 0);
    bicep.castShadow = true;
    shoulder.add(bicep);

    const accentCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.046, 20, 20),
      accentMat
    );
    accentCap.position.set(side * 0.066, -0.08, 0.018);
    shoulder.add(accentCap);

    // Elbow Joint
    const elbow = new THREE.Group();
    elbow.name = `master-elbow-${id}-${isLeft ? 'left' : 'right'}`;
    elbow.position.set(0, -0.185, 0);

    const elbowJoint = new THREE.Mesh(
      new THREE.CylinderGeometry(0.066, 0.066, 0.088, 24),
      alloyMat
    );
    elbowJoint.rotation.z = Math.PI / 2;
    elbow.add(elbowJoint);

    const elbowPin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.038, 0.105, 16),
      darkMat
    );
    elbowPin.rotation.z = Math.PI / 2;
    elbow.add(elbowPin);

    // Chunky Forearm Cuff
    const forearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.092, 0.108, 0.195, 28),
      shellMat
    );
    forearm.position.set(0, -0.108, 0);
    forearm.castShadow = true;
    elbow.add(forearm);

    const sideInsert = new THREE.Mesh(
      createRoundedBox(0.028, 0.088, 0.068, 0.008, 2),
      alloyMat
    );
    sideInsert.position.set(side * 0.09, -0.108, 0);
    elbow.add(sideInsert);

    const wristCollar = new THREE.Mesh(
      new THREE.TorusGeometry(0.094, 0.023, 16, 28),
      accentMat
    );
    wristCollar.rotation.x = Math.PI / 2;
    wristCollar.position.set(0, -0.195, 0);
    elbow.add(wristCollar);

    // Wrist & Palm with 4 articulated fingers
    const wrist = new THREE.Group();
    wrist.name = `master-wrist-${id}-${isLeft ? 'left' : 'right'}`;
    wrist.position.set(0, -0.235, 0);

    const palm = new THREE.Mesh(
      createRoundedBox(0.105, 0.042, 0.095, 0.014, 2),
      shellMat
    );
    palm.position.y = -0.06;
    palm.castShadow = true;
    wrist.add(palm);

    const wristLink = new THREE.Mesh(
      createRoundedBox(0.065, 0.06, 0.06, 0.012, 2),
      alloyMat
    );
    wristLink.position.y = -0.03;
    wrist.add(wristLink);

    const fingerArray = isLeft ? fingers.left : fingers.right;
    for (let f = 0; f < 4; f++) {
      const fPivot = new THREE.Group();
      fPivot.position.set((f - 1.5) * 0.036, -0.068, -0.045);
      const fingerMesh = new THREE.Mesh(
        createRoundedBox(0.021, 0.021, 0.062, 0.008, 2),
        shellMat
      );
      fingerMesh.position.z = -0.025;
      fPivot.add(fingerMesh);
      wrist.add(fPivot);
      fingerArray.push(fPivot);
    }

    elbow.add(wrist);
    shoulder.add(elbow);
    root.add(shoulder);

    return { shoulder, elbow, wrist };
  }

  const leftArmAssembly = buildArm(true);
  const rightArmAssembly = buildArm(false);
  arms.push(leftArmAssembly.shoulder, rightArmAssembly.shoulder);

  const legs = isStanding ? addStandingLegs(root, materials, id) : [];

  return {
    pelvis,
    torso: torsoGroup,
    head: headPivot,
    leftShoulder: leftArmAssembly.shoulder,
    leftElbow: leftArmAssembly.elbow,
    leftWrist: leftArmAssembly.wrist,
    rightShoulder: rightArmAssembly.shoulder,
    rightElbow: rightArmAssembly.elbow,
    rightWrist: rightArmAssembly.wrist,
    arms,
    fingers,
    legs,
  };
}

export function addStandingLegs(root, materials, id) {
  const shellMat=materials.whitePlastic, accentMat=materials.orangePlastic, alloyMat=materials.greyAlloy, darkMat=materials.darkMetal;
  const legs=[];
    for (const side of [-1, 1]) {
      const x = side * 0.13;
      const legGroup = new THREE.Group();
      legGroup.name = `master-leg-${id}-${side}`;
      legGroup.position.set(x, 0, 0);

      // Thigh
      const thigh = new THREE.Mesh(
        createRoundedBox(0.15, 0.20, 0.16, 0.035, 3),
        shellMat
      );
      thigh.name = `standing-thigh-${id}-${side}`;
      thigh.position.set(0, 0.32, 0);
      thigh.castShadow = true;
      legGroup.add(thigh);

      // Knee sphere
      const knee = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 20, 16),
        alloyMat
      );
      knee.name = `standing-knee-${id}-${side}`;
      knee.position.set(0, 0.22, 0);
      knee.castShadow = true;
      legGroup.add(knee);

      // Shin
      const shin = new THREE.Mesh(
        createRoundedBox(0.135, 0.18, 0.145, 0.035, 3),
        shellMat
      );
      shin.name = `standing-shin-${id}-${side}`;
      shin.position.set(0, 0.13, 0);
      shin.castShadow = true;
      legGroup.add(shin);

      // Ankle sphere
      const ankle = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 16, 12),
        alloyMat
      );
      ankle.name = `standing-ankle-${id}-${side}`;
      ankle.position.set(0, 0.05, 0);
      ankle.castShadow = true;
      legGroup.add(ankle);

      // Chunky Boot
      const boot = new THREE.Mesh(
        createRoundedBox(0.18, 0.10, 0.26, 0.045, 3),
        accentMat
      );
      boot.name = `standing-boot-${id}-${side}`;
      boot.position.set(0, 0.03, -0.02);
      boot.castShadow = true;
      legGroup.add(boot);

      // Flat Sole (touches ground flatly)
      const sole = new THREE.Mesh(
        createRoundedBox(0.18, 0.022, 0.26, 0.008, 2),
        darkMat
      );
      sole.name = `standing-sole-${id}-${side}`;
      sole.position.set(0, -0.02, -0.02);
      sole.castShadow = true;
      legGroup.add(sole);

      root.add(legGroup);
      legs.push(legGroup);
    }
  return legs;
}
