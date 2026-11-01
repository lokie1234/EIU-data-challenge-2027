import { expect, it, vi } from 'vitest';
import * as THREE from 'three-studio';
import { createWallIridescence, IRIDESCENCE_WALL_SETTINGS } from '../components/three/studio/studioWallIridescence';

it('uses the installed Iridescence shader on the opaque wall with its own angled UVs', () => {
  const material = new THREE.MeshStandardMaterial();
  const effect = createWallIridescence(material);
  const shader = { uniforms: {}, vertexShader: THREE.ShaderLib.standard.vertexShader, fragmentShader: THREE.ShaderLib.standard.fragmentShader };
  material.onBeforeCompile(shader);
  expect(IRIDESCENCE_WALL_SETTINGS.color).toBe('#8099cc');
  expect(shader.uniforms.uBrightness.value).toBe(1.5);
  expect(shader.uniforms.uDetail.value).toBe(8);
  expect(shader.uniforms.uRotation.value).toBeLessThan(0);
  expect(shader.fragmentShader).toContain('vec4 studioIridescence(vec2 vUv)');
  expect(shader.fragmentShader).toContain('a += cos(fi - d - a * uv.x * uWarp)');
  expect(shader.fragmentShader).not.toContain('#version 300 es');
  expect(shader.fragmentShader).not.toContain('outColor =');
  expect(shader.vertexShader).toContain('vec2(1.0 - uv.x, uv.y)');
  expect(material.transparent).toBe(false);
  expect(material.depthWrite).toBe(true);
  effect.dispose(); material.iridescenceField.dispose(); material.dispose();
});

it('only uploads its small interaction field when stirred and bounds click swirls', () => {
  const material = new THREE.MeshStandardMaterial(), effect = createWallIridescence(material);
  const texture = material.iridescenceField, version = texture.version;
  for (let i = 0; i < 60; i++) effect.update(i / 60, 1 / 60);
  expect(texture.version).toBe(version);
  effect.setPointer(new THREE.Vector2(.7, .5));
  effect.setPointer(new THREE.Vector2(.65, .55));
  effect.update(1, 1 / 60);
  expect(texture.version).toBeGreaterThan(version);
  expect(effect.uniforms.uPointer.value.x).toBeCloseTo(.35);
  for (let i = 0; i < 20; i++) effect.click(new THREE.Vector2(.7, .5));
  effect.update(1.2, .05);
  expect(effect.uniforms.uSwirls.value).toHaveLength(6);
  expect(effect.uniforms.uSwirls.value.every(value => value.w > 0)).toBe(true);
  effect.update(5, .05);
  expect(effect.uniforms.uSwirls.value.every(value => value.w === 0)).toBe(true);
  const changedVersion = texture.version;
  effect.dispose(); effect.setPointer(new THREE.Vector2(.2, .3)); effect.update(6, .05);
  expect(texture.version).toBe(changedVersion);
  const dispose = vi.spyOn(texture, 'dispose'); texture.dispose();
  expect(dispose).toHaveBeenCalledOnce(); material.dispose();
});
