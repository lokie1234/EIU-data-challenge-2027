import { expect, it } from 'vitest';
import * as THREE from 'three-studio';
import { createCompanionRobots } from '../components/three/studio/createCompanionRobots';
import { mainRobotPalette, companionSpecs } from '../components/three/studio/studioPalette';

it('creates three seated companions with individual chairs, shared heads and independent metallic paint', () => {
  const materials = {
    helmetMapped: new THREE.MeshStandardMaterial({ map: new THREE.Texture() }),
    whitePlastic: new THREE.MeshStandardMaterial({ color: mainRobotPalette.shell }),
    orangePlastic: new THREE.MeshStandardMaterial({ color: mainRobotPalette.accent }),
    greyAlloy: new THREE.MeshStandardMaterial(),
    darkMetal: new THREE.MeshStandardMaterial(),
  };
  const head = new THREE.Group(), torso = new THREE.Group(), arm = new THREE.Group();
  const geometry = new THREE.SphereGeometry(.455, 12, 8);
  head.position.y = .77;
  head.add(new THREE.Mesh(geometry, materials.helmetMapped));
  torso.add(new THREE.Mesh(new THREE.BoxGeometry(.3, .3, .3), materials.orangePlastic));

  const buddies = createCompanionRobots({
    head,
    torso,
    leftArm: arm,
    rightArm: arm,
    materials,
    helmetTexture: () => new THREE.Texture()
  });

  expect(buddies.group.children).toHaveLength(3);
  expect(new Set([mainRobotPalette.accent, ...companionSpecs.map(spec => spec.accent)]).size).toBe(4);

  const headMaterials = [];
  for (const spec of companionSpecs) {
    const root = buddies.group.getObjectByName(`companion-robot-${spec.id}`);
    root.updateMatrixWorld(true);
    // Soles rest directly on the ground at y = 0 without foot pedestals or trays
    expect(new THREE.Box3().setFromObject(root).min.y).toBeGreaterThan(.15);
    expect(root.userData.pose).toBe(spec.pose);

    // All 3 robots have articulated standing legs and soles
    expect(root.getObjectByName('seated-sole-1')).toBeTruthy();
    expect(buddies.chairs.getObjectByName('companion-chair-'+spec.id)).toBeTruthy();

    const helmet = root.getObjectByName(`companion-head-${spec.id}`).children[0];
    expect(helmet.geometry).toBe(geometry);
    expect(helmet.material).not.toBe(materials.helmetMapped);
    expect(helmet.material.map).not.toBe(materials.helmetMapped.map);
    headMaterials.push(helmet.material);
    expect(`#${root.getObjectByName(`companion-torso-${spec.id}`).children[0].material.color.getHexString()}`).toBe(spec.accent);
  }

  expect(new Set(headMaterials).size).toBe(3);
  expect(`#${materials.orangePlastic.color.getHexString()}`).toBe(mainRobotPalette.accent);

  buddies.update(3);
  expect(buddies.group.children.every(root => root.position.y > .6)).toBe(true);

  buddies.layout();
  const positions = buddies.group.children.map(root => root.position.clone());
  for (let time = 0; time < 8; time += .08) {
    buddies.update(time, .08, { x: 1, y: -1 });
    buddies.group.children.forEach((root, index) => {
      expect(root.position.equals(positions[index])).toBe(true);
      expect(new THREE.Box3().setFromObject(root).min.y).toBeGreaterThan(.15);
    });
  }

  const geometries = new Set(), allMaterials = new Set(Object.values(materials));
  buddies.group.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) allMaterials.add(object.material);
  });
  geometries.forEach(value => value.dispose());
  allMaterials.forEach(value => {
    value.map?.dispose();
    value.dispose();
  });
});
