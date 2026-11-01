import { expect, it } from 'vitest';
import * as THREE from 'three-studio';
import { configureStudioRoom, floorControlPlane, titlePrintPlane, ROOM_DEPTH } from '../components/three/studio/studioRoomProjection';

const points = [];
for (const x of [-3, 3]) for (const y of [0, 3.1]) for (const z of [-2, 2]) points.push(new THREE.Vector3(x, y, z));

it('keeps an elevated camera and the room depth independent of actor size', () => {
  const camera = new THREE.PerspectiveCamera();
  const layout = configureStudioRoom(camera, points, { left: 0, top: 150, width: 950, height: 750 }, 1440, 900);
  const direction = camera.getWorldDirection(new THREE.Vector3());
  expect(direction.y).toBeLessThan(-.45);
  expect(camera.position.y).toBeGreaterThan(layout.height);
  expect(layout.depth).toBe(ROOM_DEPTH);
  const cameraMatrix = camera.matrixWorld.toArray(), projection = camera.projectionMatrix.toArray();
  configureStudioRoom(camera, points.map(point => point.clone().multiplyScalar(1.6)), { left: 10, top: 230, width: 800, height: 650 }, 1440, 900);
  expect(camera.matrixWorld.toArray()).toEqual(cameraMatrix);
  expect(camera.projectionMatrix.toArray()).toEqual(projection);
});

it('fits actors inside the room walls and preserves their physical floor at y=0', () => {
  const camera = new THREE.PerspectiveCamera();
  const layout = configureStudioRoom(camera, points, { left: 0, top: 150, width: 950, height: 750 }, 1440, 900);
  const toRoom = new THREE.Matrix4().fromArray(layout.toWorld).invert();
  const offset = new THREE.Vector3().fromArray(layout.position);
  for (const point of points) {
    const world = point.clone().multiplyScalar(layout.scale).add(offset);
    const room = world.clone().applyMatrix4(toRoom);
    expect(Math.abs(room.x)).toBeLessThan(layout.aspect / 2);
    expect(room.z).toBeGreaterThan(-.251); expect(room.z).toBeLessThan(ROOM_DEPTH);
    if (point.y === 0) {
      expect(world.y).toBe(0);
      expect(room.y).toBeCloseTo(-.5, 9);
    }
  }
});

it.each([[1440, 900], [1920, 1080], [1100, 720], [390, 844]])('fits actors in the scene at %i × %i', (width, height) => {
  const camera = new THREE.PerspectiveCamera();
  const rect = { left: 0, top: 130, width: width > 1024 ? width * .64 : width, height: height - 160 };
  const layout = configureStudioRoom(camera, points, rect, width, height);
  for (const point of points) {
    const screen = point.clone().multiplyScalar(layout.scale).add(new THREE.Vector3().fromArray(layout.position)).project(camera);
    const x = (screen.x + 1) * width / 2, y = (1 - screen.y) * height / 2;
    expect(x).toBeGreaterThanOrEqual(8);
    expect(x).toBeLessThanOrEqual(rect.width - 8);
    expect(y).toBeGreaterThanOrEqual(rect.top + 8);
    expect(y).toBeLessThanOrEqual(height - 10);
  }
});

it('maps accessible hit areas to the printed floor corners without mirroring', () => {
  const width = 1440, height = 900, camera = new THREE.PerspectiveCamera();
  const layout = configureStudioRoom(camera, points, { left: 0, top: 150, width: 950, height: 750 }, width, height);
  const matrix = new THREE.Matrix4().fromArray(layout.floorTransform.slice(9, -1).split(',').map(Number));
  const toWorld = new THREE.Matrix4().fromArray(layout.toWorld);
  const corners = [];
  const plane = floorControlPlane(layout.aspect);
  for (const x of [0, 620]) for (const y of [0, 640]) {
    const html = new THREE.Vector3(x, y, 0).applyMatrix4(matrix);
    const wall = new THREE.Vector3().fromArray(plane.origin).addScaledVector(new THREE.Vector3().fromArray(plane.horizontal), x / 620).addScaledVector(new THREE.Vector3().fromArray(plane.vertical), y / 640).applyMatrix4(toWorld).project(camera);
    expect(html.x).toBeCloseTo((wall.x + 1) * width / 2, 7);
    expect(html.y).toBeCloseTo((1 - wall.y) * height / 2, 7);
    expect(html.x).toBeGreaterThan(width * .55);
    expect(html.x).toBeLessThan(width - 8);
    expect(html.y).toBeGreaterThan(20);
    expect(html.y).toBeLessThan(height - 8);
    corners.push(html);
  }
  expect(corners[2].x).toBeGreaterThan(corners[0].x);
  expect(corners[1].y).toBeGreaterThan(corners[0].y);
});

it('places title ink on the left wall facing along the room toward the robots', () => {
  const plane = titlePrintPlane(1.6);
  expect(plane.origin[0]).toBeCloseTo(-.8 + .0095, 6);
  expect(plane.horizontal[0]).toBe(0);
  expect(plane.horizontal[2]).toBeGreaterThan(2.6);
  expect(-plane.vertical[1]).toBeGreaterThanOrEqual(.3);
  expect(plane.vertical[1]).toBeLessThan(0);
});

it('anchors the complete desktop robot group in the lower-left region', () => {
  const camera = new THREE.PerspectiveCamera();
  const layout = configureStudioRoom(camera, points, { left: 0, top: 150, width: 950, height: 750 }, 1440, 900);
  const screen = points.map(point => point.clone().multiplyScalar(layout.scale).add(new THREE.Vector3().fromArray(layout.position)).project(camera));
  const xs = screen.map(point => (point.x + 1) * 720), ys = screen.map(point => (1 - point.y) * 450);
  expect(Math.max(...xs)).toBeLessThan(1440 * .55);
  expect(Math.min(...ys)).toBeGreaterThanOrEqual(900 * .38);
  expect(Math.max(...ys)).toBeGreaterThan(900 * .90);
});
