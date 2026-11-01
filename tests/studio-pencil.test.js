import { expect, it } from 'vitest';
import * as THREE from 'three-studio';
import { applyPencilMaterial } from '../components/three/studio/studioPencil';

it('adds paper grain and crosshatching to the installed standard shader without metallic highlights', () => {
  const material = new THREE.MeshPhysicalMaterial({ metalness: 1, clearcoat: 1 });
  applyPencilMaterial(material);
  const shader = { fragmentShader: THREE.ShaderLib.standard.fragmentShader };
  material.onBeforeCompile(shader);
  expect(shader.fragmentShader).toContain('float paperGrain');
  expect(shader.fragmentShader).toContain('float hatchA');
  expect(shader.fragmentShader).toContain('float hatchB');
  expect(shader.fragmentShader.match(/#include <tonemapping_fragment>/g)).toHaveLength(1);
  expect(material.metalness).toBe(0); expect(material.clearcoat).toBe(0);
  expect(material.roughness).toBeGreaterThan(.9);
  material.dispose();
});

it('retains sharp display and logo textures without hatching over their text', () => {
  const material = new THREE.MeshBasicMaterial({ map: new THREE.Texture() });
  applyPencilMaterial(material, { monochrome: true, detail: true });
  const shader = { fragmentShader: THREE.ShaderLib.basic.fragmentShader };
  material.onBeforeCompile(shader);
  expect(shader.fragmentShader).toContain('pencilPigment = vec3(dot');
  expect(shader.fragmentShader).not.toContain('float paperGrain');
  expect(shader.fragmentShader).toContain('#include <map_fragment>');
  material.map.dispose(); material.dispose();
});
