import { expect, it } from 'vitest';
import * as THREE from 'three-studio';
import { calibrateStudioMaterials, createVisorGeometry, createDeskTopGeometry, createMonitorScreenGeometry, createMonitorHousingGeometry } from '../components/three/studio/studioSurfaces';
import { getStudioInteraction } from '../components/three/studio/robotExpressions';

it('keeps the housing behind every sampled portion of the animated screen', () => {
  const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  const screen = new THREE.Mesh(createMonitorScreenGeometry(), material);
  const housing = new THREE.Mesh(createMonitorHousingGeometry(), material);
  const ray = new THREE.Raycaster();
  for (let i = 0; i <= 24; i++) {
    ray.set(new THREE.Vector3(-.57 + i * 1.14 / 24, .1, 1), new THREE.Vector3(0, 0, -1));
    const displayHit = ray.intersectObject(screen)[0];
    const shellHit = ray.intersectObject(housing)[0];
    expect(displayHit).toBeTruthy(); expect(shellHit).toBeTruthy();
    expect(shellHit.distance - displayHit.distance).toBeGreaterThan(.001);
  }
  screen.geometry.dispose(); housing.geometry.dispose(); material.dispose();
});

it('maps the monitor left to right on its outward-facing surface', () => {
  const geometry = createMonitorScreenGeometry();
  const { position, uv, normal } = geometry.attributes;
  expect(position.getX(0)).toBeLessThan(position.getX(48));
  expect(uv.getX(0)).toBe(0);
  expect(uv.getX(48)).toBe(1);
  expect(uv.getY(0)).toBe(0);
  expect(uv.getY(49)).toBe(1);
  for (let i = 0; i < normal.count; i++) expect(normal.getZ(i)).toBeGreaterThan(0);
  geometry.dispose();
});

it('keeps the redesigned desktop at the existing prop contact height', () => {
  const geometry = createDeskTopGeometry();
  geometry.computeBoundingBox();
  expect(geometry.boundingBox.max.y + 1.14 - .32).toBeCloseTo(.8475, 6);
  expect(geometry.boundingBox.max.y - geometry.boundingBox.min.y).toBeCloseTo(.055, 6);
  geometry.dispose();
});

it('keeps the entire curved visor outside the helmet surface', () => {
  const geometry = createVisorGeometry();
  const p = geometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const helmet = -Math.sqrt(Math.max(.004, .455 ** 2 - (x / 1.06) ** 2 - (y / .98) ** 2)) * 1.04;
    expect(z).toBeLessThan(helmet - .017);
    expect(Number.isFinite(geometry.attributes.normal.getZ(i))).toBe(true);
  }
  geometry.dispose();
});

it('converts authored colors to linear light once and tags color textures as sRGB', () => {
  const scene = new THREE.Scene();
  const texture = new THREE.Texture();
  const material = new THREE.MeshStandardMaterial({ color: '#4266d5', map: texture });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(), material);
  scene.add(mesh);
  const expected = material.color.clone().convertSRGBToLinear();
  calibrateStudioMaterials(scene);
  calibrateStudioMaterials(scene);
  expect(material.color.r).toBeCloseTo(expected.r, 8);
  expect(material.color.g).toBeCloseTo(expected.g, 8);
  expect(material.color.b).toBeCloseTo(expected.b, 8);
  expect(texture.encoding).toBe(THREE.sRGBEncoding);
  expect(material.envMapIntensity).toBe(.025);
  expect(material.metalness).toBe(0);
  expect(material.roughness).toBeGreaterThan(.9);
  mesh.geometry.dispose(); material.dispose(); texture.dispose();
});

it('changes emotions and reciprocal gestures through the shared interaction cycle', () => {
  expect(getStudioInteraction(1).mainEmotion).toBe('focused');
  expect(getStudioInteraction(7).mainEmotion).toBe('curious');
  expect(getStudioInteraction(11).mainEmotion).toBe('attentive');
  expect(getStudioInteraction(16).mainEmotion).toBe('happy');
  expect(getStudioInteraction(7).wave).toBe(1);
  expect(getStudioInteraction(11).point).toBe(1);
  expect(getStudioInteraction(16).stretch).toBe(1);
  expect(getStudioInteraction(1).mainYaw).not.toBe(getStudioInteraction(7).mainYaw);
});
