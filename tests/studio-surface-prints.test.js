import { afterEach, expect, it, vi } from 'vitest';
import * as THREE from 'three-studio';
import { createSurfacePrints } from '../components/three/studio/studioSurfacePrints';
import { configureStudioRoom, floorControlPlane } from '../components/three/studio/studioRoomProjection';

afterEach(() => vi.restoreAllMocks());

it('keeps printed ink depth-tested on the same planes as the accessible controls', () => {
  const ctx = Object.fromEntries(['clearRect', 'fillText', 'strokeText', 'fillRect', 'strokeRect', 'save', 'scale', 'translate', 'beginPath', 'rect', 'clip', 'restore'].map(name => [name, vi.fn()]));
  ctx.createRadialGradient = () => ({ addColorStop() {} });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);
  const onModuleTransform = vi.fn();
  const root = new THREE.Group(), prints = createSurfacePrints(root, { onModuleTransform, highDetail: true });
  const layout = configureStudioRoom(new THREE.PerspectiveCamera(), [new THREE.Vector3(-3, 0, -2), new THREE.Vector3(3, 3, 2)], { left: 0, top: 150, width: 950, height: 750 }, 1440, 900);
  prints.updateProjection(layout);
  expect(onModuleTransform).toHaveBeenCalledTimes(8);
  expect(root.children).toHaveLength(2);
  const atlas = root.getObjectByName('floor-command-label-about').material.map;
  expect(atlas.image.width).toBe(2048);
  expect(atlas.generateMipmaps).toBe(true);
  expect(atlas.anisotropy).toBe(8);
  expect(ctx.strokeRect).toHaveBeenCalledTimes(8);
  const floor = floorControlPlane(1.6);
  const top = { origin: [floor.origin[0], -.4695, floor.origin[2]], horizontal: [floor.horizontal[0] * 296 / 620, 0, 0], vertical: [0, 0, floor.vertical[2] * 142 / 640] };
  for (const [name, plane] of [['floor-command-label-about', top]]) {
    const mesh = root.getObjectByName(name);
    expect(mesh.material.transparent).toBe(true);
    expect(mesh.material.depthTest).toBe(true);
    expect(mesh.material.depthWrite).toBe(false);
    for (const [u, v] of [[0, 0], [1, 1]]) {
      const vertex = new THREE.Vector3(u, v, 0).applyMatrix4(mesh.matrix);
      const expected = new THREE.Vector3().fromArray(plane.origin).addScaledVector(new THREE.Vector3().fromArray(plane.horizontal), u).addScaledVector(new THREE.Vector3().fromArray(plane.vertical), v);
      expect(vertex.distanceTo(expected)).toBeLessThan(1e-10);
    }
  }
  ctx.clearRect.mockClear();
  prints.setInteraction({ id: 'about' });
  const label = root.getObjectByName('floor-command-label-about');
  prints.update(1, .1);
  expect(label.matrix.elements[13]).toBeGreaterThan(top.origin[1]);
  const transform = onModuleTransform.mock.calls.filter(([id]) => id === 'about').at(-1)[1];
  const hitArea = new THREE.Vector3().applyMatrix4(new THREE.Matrix4().fromArray(transform.slice(9, -1).split(',').map(Number)));
  const clip = new THREE.Vector4(label.matrix.elements[12], label.matrix.elements[13], label.matrix.elements[14], 1).applyMatrix4(new THREE.Matrix4().fromArray(layout.clipFromRoom));
  expect(hitArea.x).toBeCloseTo((1 + clip.x / clip.w) * 720, 7);
  expect(hitArea.y).toBeCloseTo((1 - clip.y / clip.w) * 450, 7);
  expect(ctx.clearRect).not.toHaveBeenCalled();
  prints.setInteraction({ id: 'about' });
  prints.update(1.1, .1);
  expect(ctx.clearRect).not.toHaveBeenCalled();
  prints.dispose();
  prints.setInteraction(null);
  expect(ctx.clearRect).not.toHaveBeenCalled();
  prints.updateProjection({ aspect: .5, viewportWidth: 390 });
  expect(root.children.every(mesh => !mesh.visible)).toBe(true);
});

