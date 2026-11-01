import { expect, it } from 'vitest';
import * as THREE from 'three-studio';
import { clearance, penetrates, separateStandingRobot, worldBounds } from '../components/three/studio/studioPlacement';

it('finds the same nearest clearance as the exhaustive candidate grid', () => {
  const geometry = new THREE.BoxGeometry(.7, 1, .8), material = new THREE.MeshBasicMaterial();
  let seed = 92;
  const random = () => { seed = Math.imul(seed, 1664525) + 1013904223 | 0; return (seed >>> 0) / 4294967296; };
  for (let sample = 0; sample < 30; sample++) {
    const root = new THREE.Mesh(geometry, material); root.position.y = .6;
    const bounds = worldBounds(root);
    const obstacles = Array.from({ length: 7 }, () => {
      const x = random() * 2 - 1, z = random() * 2 - 1;
      return new THREE.Box3(new THREE.Vector3(x, 0, z), new THREE.Vector3(x + .1 + random(), 1, z + .1 + random()));
    });
    const padded = obstacles.map(box => box.clone().expandByScalar(clearance));
    const xs = [0, ...padded.map(box => Math.max(0, box.max.x - bounds.min.x + .00001))];
    const zs = [0, ...padded.flatMap(box => [box.max.z - bounds.min.z + .00001, box.min.z - bounds.max.z - .00001])];
    let cost = Infinity;
    for (const x of xs) for (const z of zs) {
      if (x*x + z*z >= cost) continue;
      const candidate = bounds.clone().translate(new THREE.Vector3(x, 0, z));
      if (!padded.some(box => penetrates(candidate, box))) cost = x*x + z*z;
    }
    separateStandingRobot(root, obstacles);
    expect(root.position.x ** 2 + root.position.z ** 2).toBeCloseTo(cost, 8);
    padded.forEach(box => expect(penetrates(worldBounds(root), box)).toBe(false));
  }
  geometry.dispose(); material.dispose();
});
