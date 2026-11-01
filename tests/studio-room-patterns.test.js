import { expect, it } from 'vitest';
import * as THREE from 'three-studio';
import { createRoomPatterns } from '../components/three/studio/studioRoomPatterns';

it('keeps only floor routes, leaves walls bare and does not upload idle buffers', () => {
  const root = new THREE.Group(), patterns = createRoomPatterns(root);
  patterns.updateProjection({ aspect: 1.6 });
  const group = root.getObjectByName('room-data-patterns');
  expect(group.children).toHaveLength(3);
  const lines = group.children[0], nodes = group.children[1];
  expect(lines.geometry.attributes.position.count).toBeLessThan(180);
  expect(nodes.geometry.attributes.position.count).toBeLessThan(40);
  expect(lines.material.vertexColors).toBe(true);
  const positions = lines.geometry.attributes.position;
  const values = Array.from({ length: positions.count }, (_, i) => new THREE.Vector3().fromBufferAttribute(positions, i));
  expect(values.every(p => Math.abs(p.y + .496) < 1e-5)).toBe(true);
  const version = positions.version;
  for (let i = 0; i < 60; i++) patterns.update(i / 60);
  expect(positions.version).toBe(version);
  const geometry = lines.geometry;
  patterns.updateProjection({ aspect: 2 });
  expect(lines.geometry).toBe(geometry);
  expect(lines.geometry.attributes.position).toBe(positions);
});

it('sends one short data signal on selection and stops it on release', () => {
  const root = new THREE.Group(), patterns = createRoomPatterns(root);
  patterns.updateProjection({ aspect: 1.6 });
  const pulse = root.getObjectByName('room-module-data-signal');
  expect(pulse.visible).toBe(false);
  patterns.setInteraction({ id: 'about' }); patterns.update(.4);
  expect(pulse.visible).toBe(true);
  expect(pulse.geometry.attributes.position.version).toBeGreaterThan(0);
  patterns.update(2);
  expect(pulse.visible).toBe(false);
  patterns.setInteraction({ id: 'register' }); patterns.update(2.2);
  expect(pulse.visible).toBe(true);
  patterns.setInteraction(null);
  expect(pulse.visible).toBe(false);
});
