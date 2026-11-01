import { expect, it } from 'vitest';
import * as THREE from 'three-studio';
import { addSeatedLegs, solveArm, typingContact, poseTypingArm } from '../components/three/studio/studioRig';

it('keeps both articulated hands on their keyboard targets without stretching the arm bones', () => {
  for (const side of [-1, 1]) {
    const root = new THREE.Group(), shoulder = new THREE.Group(), elbow = new THREE.Group(), wrist = new THREE.Group();
    shoulder.position.set(side * .275, .44, 0);
    elbow.position.y = -.185;
    wrist.position.y = -.235;
    root.add(shoulder); shoulder.add(elbow); elbow.add(wrist);
    for (let time = 0; time < 6; time += .075) {
      const target = typingContact(side, time);
      const point = new THREE.Vector3(target.x, target.y, target.z);
      const joint = solveArm(shoulder.position, point, side);
      expect(joint.distanceTo(shoulder.position)).toBeCloseTo(.185, 8);
      expect(joint.distanceTo(point)).toBeCloseTo(.235, 8);
      poseTypingArm(root, shoulder, elbow, wrist, [], side, time, [], null);
      expect(wrist.getWorldPosition(new THREE.Vector3()).distanceTo(point)).toBeLessThan(.000001);
      expect(target.strike).toBeGreaterThanOrEqual(0);
      expect(target.strike).toBeLessThanOrEqual(1);
    }
  }
});

it('supports the hips on the seat while short chibi legs hang above the floor', () => {
  const root = new THREE.Group(); root.position.set(.36, .57, .86);
  const material = new THREE.MeshStandardMaterial();
  addSeatedLegs(root, { whitePlastic: material, greyAlloy: material, orangePlastic: material, darkMetal: material });
  root.updateMatrixWorld(true);
  for (const side of [-1, 1]) {
    const sole = new THREE.Box3().setFromObject(root.getObjectByName(`seated-sole-${side}`));
    const thigh = new THREE.Box3().setFromObject(root.getObjectByName(`seated-thigh-${side}`));
    expect(sole.min.y).toBeCloseTo(.23, 6);
    expect(thigh.min.y).toBeCloseTo(.575, 6);
  }
  root.traverse(object => object.geometry?.dispose()); material.dispose();
});

it('brings the striking fingertip to the depressed key surface and lifts it between strikes', () => {
  const gap = (time, press) => {
    const contact = typingContact(-1, time);
    const angle = -.05 - press * .40;
    const fingerBottom = .57 + contact.y - .068 - .0105 * Math.cos(angle) + .056 * Math.sin(angle);
    const keyTop = .8715 + .024 - press * .008 + .008;
    return fingerBottom - keyTop;
  };
  expect(gap(0, 0)).toBeGreaterThan(.01);
  expect(Math.abs(gap(Math.PI / 30, 1))).toBeLessThan(.001);
});
