import { expect, it } from 'vitest';
import * as THREE from 'three-studio';
import { createWalkingRig } from '../components/three/studio/studioLocomotion';
import { worldBounds } from '../components/three/studio/studioPlacement';

it('bends hips, knees and ankles while keeping a support foot planted, then lifts a foot to climb', () => {
  const root = new THREE.Group(); root.scale.setScalar(.9); root.position.y = .426 * .9;
  const material = new THREE.MeshStandardMaterial();
  const rig = createWalkingRig(root, { whitePlastic: material, orangePlastic: material, greyAlloy: material, darkMetal: material }, 'test');
  let greatestBend = 0, greatestLift = 0;
  for (let time = 0; time < 2; time += .025) {
    rig.update(time); root.updateMatrixWorld(true);
    const heights = rig.group.children.map(hip => {
      const knee = hip.children.find(child => child.name.startsWith('entry-knee'));
      const foot = knee.children.find(child => child.name.startsWith('entry-ankle'));
      expect(knee.position.length()).toBeCloseTo(.20, 8);
      expect(foot.position.length()).toBeCloseTo(.17, 8);
      expect(foot.getWorldQuaternion(new THREE.Quaternion()).angleTo(new THREE.Quaternion())).toBeLessThan(.000001);
      greatestBend = Math.max(greatestBend, knee.quaternion.angleTo(new THREE.Quaternion()));
      return worldBounds(foot).min.y;
    });
    heights.forEach(height => expect(height).toBeGreaterThan(-.000001));
    expect(Math.min(...heights)).toBeCloseTo(0, 6);
    greatestLift = Math.max(greatestLift, ...heights);
  }
  expect(greatestBend).toBeGreaterThan(.8);
  expect(greatestLift).toBeGreaterThan(.06);
  root.position.y += .12; rig.update(1, .5); root.updateMatrixWorld(true);
  expect(worldBounds(rig.group).min.y).toBeGreaterThan(.08);
  rig.dispose(); material.dispose();
});
