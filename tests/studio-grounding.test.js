import { expect, it, vi } from 'vitest';
import * as THREE from 'three-studio';
import { createStudioGrounding } from '../components/three/studio/studioGrounding';

it('keeps wheel and desk contact patches on the world floor while their owners move and fade', () => {
  const gradient = { addColorStop: vi.fn() };
  const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ createRadialGradient: () => gradient, fillRect() {} });
  const scene = new THREE.Scene(), chair = new THREE.Group(), desk = new THREE.Group();
  chair.name = 'test-chair'; desk.name = 'test-desk';
  chair.position.set(2, 0, 3); chair.scale.setScalar(2);
  const add = (parent, name, x, z) => {
    const object = new THREE.Object3D(); object.name = name; object.position.set(x, .035, z);
    parent.add(object); return object;
  };
  add(chair, 'chair-gas-lift', 0, 0);
  const wheels = Array.from({ length: 5 }, (_, i) => add(chair, `chair-caster-${i}`, Math.sin(i) * .34, Math.cos(i) * .34));
  const seat = add(chair, 'chair-seat-cushion', 0, 0); seat.material = { opacity: .25 };
  const foot = add(desk, 'desk-adjustable-foot', -.7, .4); foot.material = { opacity: 1 };
  scene.add(chair, desk);
  const contacts = createStudioGrounding(scene, [chair], desk);
  contacts.update();
  const group = scene.getObjectByName('studio-ground-contacts');
  expect(group.children).toHaveLength(2);
  expect(group.children[0].count).toBe(6);
  expect(group.children[0].material.opacity).toBeCloseTo(.165);
  const uploadVersion = group.children[0].instanceMatrix.version;
  contacts.update(); contacts.update();
  expect(group.children[0].instanceMatrix.version).toBe(uploadVersion);
  const matrix = new THREE.Matrix4(), point = new THREE.Vector3();
  const check = () => {
    group.children[0].getMatrixAt(1, matrix); point.setFromMatrixPosition(matrix);
    const wheel = wheels[0].getWorldPosition(new THREE.Vector3());
    expect(point.x).toBeCloseTo(wheel.x, 6); expect(point.z).toBeCloseTo(wheel.z, 6);
    expect(point.y).toBeCloseTo(.0035, 6);
  };
  check();
  chair.position.x += 3; chair.rotation.y = .8; contacts.update(); check();
  chair.visible = false; contacts.update(); expect(group.children[0].visible).toBe(false);
  expect(group.children[0].material.depthWrite).toBe(false);
  expect(group.children[0].material.map).toBe(group.children[1].material.map);
  expect(gradient.addColorStop).toHaveBeenCalledTimes(4);
  const textures = new Set();
  group.children.forEach(mesh => { mesh.geometry.dispose(); textures.add(mesh.material.map); mesh.material.dispose(); });
  textures.forEach(texture => texture.dispose());
  spy.mockRestore();
});
