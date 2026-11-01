import * as THREE from 'three-studio';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry';

const down = new THREE.Vector3(0, -1, 0);
const shoulderPoint = new THREE.Vector3(), wristPoint = new THREE.Vector3();
const upperDirection = new THREE.Vector3(), lowerDirection = new THREE.Vector3();
const upperRotation = new THREE.Quaternion(), lowerRotation = new THREE.Quaternion();
const handRotation = new THREE.Quaternion(), rootRotation = new THREE.Quaternion(), keyboardRotation = new THREE.Quaternion();
const handOffset = new THREE.Vector3();

export function solveArm(shoulder, wrist, side, upper = .185, lower = .235) {
  const direction = wrist.clone().sub(shoulder);
  const distance = Math.min(direction.length(), upper + lower - .0001);
  direction.normalize();
  const along = (upper * upper - lower * lower + distance * distance) / (2 * distance);
  const height = Math.sqrt(Math.max(0, upper * upper - along * along));
  const bend = new THREE.Vector3(side, -.08, .35);
  bend.addScaledVector(direction, -bend.dot(direction)).normalize();
  return shoulder.clone().addScaledVector(direction, along).addScaledVector(bend, height);
}

export function typingContact(side, time) {
  const phase = time * 15 + (side < 0 ? 0 : 2.1);
  const strike = Math.max(0, Math.sin(phase)) ** 6;
  return { x: side * .108, y: .4275 + (1 - strike) * .002, z: -.38, strike };
}

export function poseTypingArm(root, shoulder, elbow, wrist, fingers, side, time, keys, keyboard) {
  const contact = typingContact(side, time);
  shoulderPoint.copy(shoulder.position);
  wristPoint.set(contact.x, contact.y, contact.z);
  handRotation.identity();
  const angle = -.05 - contact.strike * .40;
  if (keyboard) {
    // Key tops -> world -> robot space: includes both workstation and robot scale.
    root.updateWorldMatrix(true, true);
    keyboard.updateWorldMatrix(true, true);
    wristPoint.set(side * .108, .032 - contact.strike * .006 + .001, .072);
    keyboard.localToWorld(wristPoint);
    root.worldToLocal(wristPoint);
    root.getWorldQuaternion(rootRotation);
    keyboard.getWorldQuaternion(keyboardRotation);
    handRotation.copy(rootRotation).invert().multiply(keyboardRotation);
    handOffset.set(0, .068 + .0105 * Math.cos(angle) - .056 * Math.sin(angle), .045 + .056 * Math.cos(angle) + .0105 * Math.sin(angle));
    wristPoint.add(handOffset.applyQuaternion(handRotation));
  }
  const elbowPoint = solveArm(shoulderPoint, wristPoint, side);
  upperDirection.copy(elbowPoint).sub(shoulderPoint).normalize();
  lowerDirection.copy(wristPoint).sub(elbowPoint).normalize();
  upperRotation.setFromUnitVectors(down, upperDirection);
  lowerRotation.setFromUnitVectors(down, lowerDirection);
  shoulder.quaternion.copy(upperRotation);
  elbow.quaternion.copy(upperRotation).invert().multiply(lowerRotation);
  wrist.quaternion.copy(lowerRotation).invert().multiply(handRotation);
  fingers.forEach(finger => {
    finger.rotation.x = angle;
  });
  // The rear row sits beneath the fingertips; depress only the hand's key range.
  const start = side < 0 ? 58 : 64;
  for (let i = start; i < Math.min(start + 4, keys.length); i++) {
    keys[i].position.y = .024 - contact.strike * .006;
  }
}

export function addSeatedLegs(root, materials) {
  const hanging = [];
  const box = (name, size, position, material, radius = .035, parent = root) => {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(...size, 3, radius), material);
    mesh.name = name;
    mesh.position.set(...position);
    mesh.castShadow = true;
    parent.add(mesh);
  };
  for (const side of [-1, 1]) {
    const x = side * .13;
    box(`seated-thigh-${side}`, [.17, .13, .32], [x, .07, -.16], materials.whitePlastic);
    const knee = new THREE.Mesh(new THREE.SphereGeometry(.075, 20, 16), materials.greyAlloy);
    knee.position.set(x, .025, -.34);
    root.add(knee);
    const leg = new THREE.Group();
    leg.name = `dangling-leg-${side}`;
    leg.position.set(x, .025, -.34);
    root.add(leg); hanging.push(leg);
    box(`seated-shin-${side}`, [.135, .18, .145], [0, -.09, 0], materials.whitePlastic, .035, leg);
    const ankle = new THREE.Mesh(new THREE.SphereGeometry(.055, 16, 12), materials.greyAlloy);
    ankle.position.set(0, -.205, 0);
    leg.add(ankle);
    box(`seated-boot-${side}`, [.19, .18, .29], [0, -.275, -.065], materials.orangePlastic, .05, leg);
    box(`seated-sole-${side}`, [.19, .025, .29], [0, -.3525, -.065], materials.darkMetal, .01, leg);
  }
  return hanging;
}

export function updateCableBuffer(geometry, curve) {
  const segments = 24, radial = 14;
  const frames = curve.computeFrenetFrames(segments, false);
  const point = new THREE.Vector3();
  const position = geometry.attributes.position, normal = geometry.attributes.normal;
  for (let i = 0; i <= segments; i++) {
    curve.getPointAt(i / segments, point);
    for (let j = 0; j <= radial; j++) {
      const angle = j / radial * Math.PI * 2;
      const nx = -Math.cos(angle) * frames.normals[i].x + Math.sin(angle) * frames.binormals[i].x;
      const ny = -Math.cos(angle) * frames.normals[i].y + Math.sin(angle) * frames.binormals[i].y;
      const nz = -Math.cos(angle) * frames.normals[i].z + Math.sin(angle) * frames.binormals[i].z;
      const index = i * (radial + 1) + j;
      position.setXYZ(index, point.x + .023 * nx, point.y + .023 * ny, point.z + .023 * nz);
      normal.setXYZ(index, nx, ny, nz);
    }
  }
  position.needsUpdate = true;
  normal.needsUpdate = true;
}
