import { expect, it } from 'vitest';
import * as THREE from 'three-studio';
import { createGlyphTitle, GLYPH_TITLE_TEXT } from '../components/three/studio/studioGlyphTitle';
import { titlePrintPlane } from '../components/three/studio/studioRoomProjection';

it('builds each non-space character as a solid glyph with open counters and no backing panel', () => {
  const root = new THREE.Group(), title = createGlyphTitle(root);
  title.updateProjection({ aspect: 1.6, viewportWidth: 1440 }); title.update(4);
  const letters = title.group.children.filter(object => object.isMesh);
  expect(letters.map(mesh => mesh.userData.character).join('')).toBe(GLYPH_TITLE_TEXT.replaceAll(' ', ''));
  expect(root.getObjectByName('room-title-raised-frame')).toBeUndefined();
  expect(root.getObjectByName('room-title-wall-contact-shadow')).toBeUndefined();
  const wallX = -.8;
  for (const mesh of letters) {
    expect(mesh.geometry.boundingBox.max.z - mesh.geometry.boundingBox.min.z).toBeGreaterThan(100);
    expect(mesh.castShadow).toBe(false);
    expect(mesh.material[0].color.getHex()).toBe(0xffffff);
    expect(mesh.material[0].map).toBe(null);
    expect(mesh.material[0].userData.pencilStyle).toBe(true);
    expect(mesh.visible).toBe(true);
    const bounds = mesh.geometry.boundingBox.clone().applyMatrix4(title.group.matrix);
    expect(bounds.min.x).toBeGreaterThan(wallX);
    expect(bounds.max.x - bounds.min.x).toBeGreaterThan(.007);
    expect(bounds.max.x - bounds.min.x).toBeLessThan(.009);
    expect(bounds.max.x).toBeCloseTo(titlePrintPlane(1.6).origin[0] + .008 * 2 / 102, 5);
  }
  const shadows = root.getObjectByName('title-letter-contact-shadows');
  expect(shadows.children).toHaveLength(letters.length);
  expect(shadows.children.every(mesh => mesh.visible)).toBe(true);
  const contours = title.group.children.filter(object => object.isLineSegments);
  expect(contours.every(line => line.material.color.getHex() === 0 && line.material.opacity === 1)).toBe(true);
  // Test the actual triangulation: the D counter stays open through its depth.
  const d = letters.find(mesh => mesh.userData.character === 'D');
  const local = new THREE.Mesh(d.geometry, d.material);
  const box = d.geometry.boundingBox, center = box.getCenter(new THREE.Vector3());
  const ray = new THREE.Raycaster(new THREE.Vector3(center.x, center.y, -10), new THREE.Vector3(0, 0, 1));
  expect(ray.intersectObject(local)).toHaveLength(0);
  ray.ray.origin.x = box.min.x + (box.max.x - box.min.x) * .25;
  expect(ray.intersectObject(local).length).toBeGreaterThan(0);
});

it('draws pencil contours before the color wipe once and keeps stronger grain in the shader', () => {
  const title = createGlyphTitle(new THREE.Group());
  const letters = title.group.children.filter(object => object.isMesh);
  const shader = { uniforms: {}, vertexShader: THREE.ShaderLib.standard.vertexShader, fragmentShader: THREE.ShaderLib.standard.fragmentShader };
  letters[0].material[0].onBeforeCompile(shader);
  expect(shader.fragmentShader).toContain('float hatchA');
  expect(shader.fragmentShader).toContain('paperGrain*0.099');
  expect(shader.fragmentShader).toContain('vTitleProgress > titleReveal');
  title.update(.8);
  expect(letters.every(mesh => !mesh.visible)).toBe(true);
  title.update(1.9);
  expect(letters[0].visible).toBe(true);
  expect(letters.at(-1).visible).toBe(false);
  title.update(4); title.update(30);
  expect(shader.uniforms.titleTime.value).toBe(2.75);
  expect(letters.every(mesh => mesh.visible)).toBe(true);
  expect(title.replayTitle).toBeUndefined();
});

it('constructs one character per setup stage and stops cleanly when cancelled', () => {
  const title = createGlyphTitle(new THREE.Group(), { deferGeometry: true });
  expect(title.group.children.filter(object => object.isMesh)).toHaveLength(0);
  title.buildStages.next();
  expect(title.group.children.filter(object => object.isMesh)).toHaveLength(1);
  title.buildStages.next();
  expect(title.group.children.filter(object => object.isMesh)).toHaveLength(2);
  title.buildStages.return();
  expect(title.buildStages.next().done).toBe(true);
});
