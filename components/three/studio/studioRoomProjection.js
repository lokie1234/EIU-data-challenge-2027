import * as THREE from 'three-studio';
import gsap from 'gsap';

export const ROOM_HEIGHT = 8;
export const ROOM_ASPECT = 3.4;
export const ROOM_DEPTH = 3;
const EYE_DISTANCE = 1.25;
const forward = new THREE.Vector3(-5.4, 0, -1.4).normalize();
const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

// Elevated view exposes the keyboard and hand gestures without rotating rigs.
// Architecture, actors and the DOM wall controls share this camera.
export function configureStudioRoom(camera, points, rect, width, height) {
  const aspect = width / height;
  const toWorld = new THREE.Matrix4().set(
    right.x * ROOM_HEIGHT, 0, forward.x * ROOM_HEIGHT, 0,
    0, ROOM_HEIGHT, 0, ROOM_HEIGHT / 2,
    right.z * ROOM_HEIGHT, 0, forward.z * ROOM_HEIGHT, 0,
    0, 0, 0, 1,
  );
  camera.clearViewOffset(); camera.fov = 2 * Math.atan(.5 / EYE_DISTANCE) * 180 / Math.PI;
  camera.aspect = aspect;
  const eye = new THREE.Vector3(0, .66, -EYE_DISTANCE).applyMatrix4(toWorld);
  gsap.set(camera.position, { x: eye.x, y: eye.y, z: eye.z });
  camera.up.set(0, 1, 0); camera.lookAt(camera.position.clone().add(forward).add(new THREE.Vector3(0, -.55, 0)));
  camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);

  const bounds = new THREE.Box3();
  points.forEach(point => bounds.expandByPoint(new THREE.Vector3(point.dot(right) / ROOM_HEIGHT, point.y / ROOM_HEIGHT, point.dot(forward) / ROOM_HEIGHT)));
  const corners = [];
  for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) corners.push({ x, y, z });
  const desktop = width > 1024;
  const target = {
    left: Math.max(8, rect.left + 8),
    right: Math.min(width - 8, rect.left + rect.width - 8, desktop ? width * .55 : width),
    top: Math.max(rect.top + 8, desktop ? height * .38 : 0),
    bottom: desktop ? height * .975 : Math.min(height - 10, Math.max(rect.top + rect.height - 10, height * .69)),
  };
  const roomPoint = new THREE.Vector3();
  const project = (scale, xOffset, zOffset) => {
    const box = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };
    corners.forEach(p => {
      roomPoint.set(scale * p.x + xOffset, scale * p.y - .5, scale * p.z + zOffset).applyMatrix4(toWorld).project(camera);
      const x = (.5 + roomPoint.x / 2) * width;
      const y = (.5 - roomPoint.y / 2) * height;
      box.left = Math.min(box.left, x); box.right = Math.max(box.right, x);
      box.top = Math.min(box.top, y); box.bottom = Math.max(box.bottom, y);
    });
    return box;
  };
  const candidate = scale => {
    // Place the nearest floor point at the requested lower edge, accounting
    // for camera pitch instead of using the old horizontal-tunnel formula.
    let near = desktop ? -.25 : .04, far = ROOM_DEPTH - .06 - scale * (bounds.max.z - bounds.min.z);
    if (far < near) return null;
    for (let i = 0; i < 24; i++) {
      const mid = (near + far) / 2;
      const box = project(scale, 0, mid - scale * bounds.min.z);
      if (box.bottom > target.bottom) near = mid; else far = mid;
    }
    const z = (near + far) / 2 - scale * bounds.min.z;
    let low = -aspect / 2 + .025 - scale * bounds.min.x;
    let high = aspect / 2 - .025 - scale * bounds.max.x;
    if (low > high || scale * bounds.max.z + z > ROOM_DEPTH - .06) return null;
    const center = (target.left + target.right) / 2;
    for (let i = 0; i < 18; i++) {
      const mid = (low + high) / 2, box = project(scale, mid, z);
      if ((box.left + box.right) / 2 < center) low = mid; else high = mid;
    }
    const x = (low + high) / 2, box = project(scale, x, z);
    if (box.left < target.left || box.right > target.right || box.top < target.top || box.bottom > target.bottom + 1) return null;
    return { scale, x, z };
  };
  let low = .001, high = 4, result = candidate(low);
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2, fit = candidate(mid);
    if (fit) { low = mid; result = fit; } else high = mid;
  }
  const fit = (result && candidate(result.scale * .97)) || result || { scale: .1, x: 0, z: 1 };
  return {
    aspect, height: ROOM_HEIGHT, depth: ROOM_DEPTH, toWorld: toWorld.toArray(),
    scale: fit.scale, viewportWidth: width, viewportHeight: height,
    clipFromRoom: new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).multiply(toWorld).toArray(),
    floorTransform: projectFloorControls(camera, toWorld, aspect, width, height),
    position: right.clone().multiplyScalar(fit.x * ROOM_HEIGHT).addScaledVector(forward, fit.z * ROOM_HEIGHT).toArray(),
  };
}

// Both the printed texture and accessible hit areas use the exact same plane.
export function floorControlPlane(aspect) {
  return { origin: [aspect * .2, -.498, 1.55], horizontal: [aspect * .3 - .07, 0, 0], vertical: [0, 0, -1.7] };
}

export function titlePrintPlane(aspect) {
  // Slide towards the open end of the left wall, bringing the last words closer.
  return { origin: [-aspect / 2 + .0095, .06, -.08], horizontal: [0, 0, 2.65], vertical: [0, -.30, 0] };
}

// Keeping clip-space w produces true perspective, including hit testing.
export function projectFloorControls(camera, toWorld, aspect, width, height) {
  const viewProjection = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).multiply(toWorld);
  return projectSurfaceTransform(viewProjection, floorControlPlane(aspect), width, height, 620, 640);
}

export function projectSurfaceTransform(viewProjection, plane, width, height, surfaceWidth, surfaceHeight) {
  const origin = new THREE.Vector4(...plane.origin, 1).applyMatrix4(viewProjection);
  const horizontal = new THREE.Vector4(...plane.horizontal.map(value => value / surfaceWidth), 0).applyMatrix4(viewProjection);
  const vertical = new THREE.Vector4(...plane.vertical.map(value => value / surfaceHeight), 0).applyMatrix4(viewProjection);
  const column = p => [width / 2 * (p.x + p.w) / origin.w, height / 2 * (p.w - p.y) / origin.w, 0, p.w / origin.w];
  return `matrix3d(${[...column(horizontal), ...column(vertical), 0, 0, 1, 0, ...column(origin)].join(',')})`;
}
