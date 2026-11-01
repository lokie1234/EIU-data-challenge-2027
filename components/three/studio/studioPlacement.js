import * as THREE from 'three-studio';

export const seatedPlacement = { x: .20, y: .5705, z: .94, chairZ: 1.10 };
export const clearance = .035;

export function worldBounds(object) {
  object.updateWorldMatrix(true, true);
  return new THREE.Box3().setFromObject(object);
}

export function meshBounds(root) {
  root.updateWorldMatrix(true, true);
  const boxes = [];
  root.traverse(object => {
    if (object.isMesh && !object.userData.studioContour) {
      const box = new THREE.Box3();
      const vertex = new THREE.Vector3();
      const positions = object.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        vertex.fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld);
        box.expandByPoint(vertex);
      }
      boxes.push(box);
    }
  });
  return boxes;
}

export function penetrates(a, b, tolerance = .00001) {
  return ['x', 'y', 'z'].every(axis => Math.min(a.max[axis], b.max[axis]) - Math.max(a.min[axis], b.min[axis]) > tolerance);
}

// Narrow phase for conservative AABB hits (notably a round head beside a tilted
// chair back). Segment/triangle tests use the actual indexed mesh surfaces.
export function surfacesIntersect(first, second) {
  first.updateWorldMatrix(true, false);
  second.updateWorldMatrix(true, false);
  const sphereMissesBox = (sphere, box) => {
    if (sphere.geometry.type !== 'SphereGeometry' || box.geometry.type !== 'BoxGeometry') return false;
    sphere.geometry.computeBoundingSphere(); box.geometry.computeBoundingBox();
    const bound = sphere.geometry.boundingSphere.clone().applyMatrix4(sphere.matrixWorld);
    const local = box.worldToLocal(bound.center.clone());
    box.geometry.boundingBox.clampPoint(local, local);
    box.localToWorld(local);
    return local.distanceToSquared(bound.center) > bound.radius * bound.radius;
  };
  if (sphereMissesBox(first, second) || sphereMissesBox(second, first)) return false;
  const triangles = mesh => {
    const { position } = mesh.geometry.attributes;
    const index = mesh.geometry.index;
    const count = index ? index.count : position.count;
    const result = [];
    for (let i = 0; i < count; i += 3) {
      const points = [0, 1, 2].map(j => new THREE.Vector3().fromBufferAttribute(position, index ? index.getX(i + j) : i + j).applyMatrix4(mesh.matrixWorld));
      result.push({ points, box: new THREE.Box3().setFromPoints(points) });
    }
    return result;
  };
  first.updateWorldMatrix(true, false);
  second.updateWorldMatrix(true, false);
  const left = triangles(first), right = triangles(second);
  const ray = new THREE.Ray(), direction = new THREE.Vector3(), hit = new THREE.Vector3();
  const crosses = (edges, face) => {
    for (let i = 0; i < 3; i++) {
      direction.copy(edges[(i + 1) % 3]).sub(edges[i]);
      const length = direction.length();
      if (length < .000001) continue;
      ray.set(edges[i], direction.divideScalar(length));
      if (ray.intersectTriangle(...face, false, hit)) {
        const distance = hit.distanceTo(edges[i]);
        if (distance > .00001 && distance < length - .00001) return true;
      }
    }
    return false;
  };
  const build = items => {
    const box = new THREE.Box3();
    items.forEach(item => box.union(item.box));
    if (items.length <= 12) return { box, items, count: items.length };
    const size = box.getSize(new THREE.Vector3());
    const axis = size.x > size.y && size.x > size.z ? 'x' : size.y > size.z ? 'y' : 'z';
    items.sort((a, b) => a.box.min[axis] + a.box.max[axis] - b.box.min[axis] - b.box.max[axis]);
    const middle = Math.floor(items.length / 2);
    return { box, count: items.length, left: build(items.slice(0, middle)), right: build(items.slice(middle)) };
  };
  const visit = (a, b) => {
    if (!a.box.intersectsBox(b.box)) return false;
    if (a.items && b.items) {
      for (const first of a.items) for (const second of b.items) {
        if (first.box.intersectsBox(second.box) && (crosses(first.points, second.points) || crosses(second.points, first.points))) return true;
      }
      return false;
    }
    if (!a.items && (b.items || a.count >= b.count)) return visit(a.left, b) || visit(a.right, b);
    return visit(a, b.left) || visit(a, b.right);
  };
  return visit(build(left), build(right));
}

// Conservative whole-character bounds reserve space for the complete silhouette.
// Furniture uses per-mesh bounds so empty space underneath the table stays empty.
export function separateStandingRobot(root, obstacles, direction = 'x', measure = () => worldBounds(root)) {
  const origin = root.position.clone(), bounds = measure();
  const padded = obstacles.map(box => box.clone().expandByScalar(clearance));
  if (!padded.some(box => penetrates(bounds, box))) return;
  const xs = new Set([0]), zs = new Set([0]);
  for (const box of padded) {
    if (box.max.x < bounds.min.x || box.max.y <= bounds.min.y || box.min.y >= bounds.max.y) continue;
    xs.add(Math.max(0, box.max.x - bounds.min.x + .00001));
    zs.add(box.max.z - bounds.min.z + .00001); zs.add(box.min.z - bounds.max.z - .00001);
  }
  let best = null;
  const candidate = new THREE.Box3(), delta = new THREE.Vector3();
  const probe = (x, z) => {
    const cost = x * x + z * z;
    if (best && cost >= best.cost) return;
    candidate.copy(bounds).translate(delta.set(x, 0, z));
    if (padded.some(box => penetrates(candidate, box))) return;
    best = { x, z, cost };
  };
  // Find an inexpensive valid upper bound first. Then only inspect boundary
  // pairs that can improve it, instead of the full O(meshes²) candidate grid.
  const sortedX = [...xs].sort((a,b) => a-b), sortedZ = [...zs].sort((a,b) => Math.abs(a)-Math.abs(b));
  for (const x of sortedX) { probe(x, 0); if (best) break; }
  for (const z of sortedZ) probe(0, z);
  for (const x of sortedX) {
    if (best && x*x >= best.cost) break;
    for (const z of sortedZ) {
      if (best && x*x+z*z >= best.cost) break;
      probe(x, z);
    }
  }
  if (!best) throw new Error(`Unable to place ${root.name} with clearance along ${direction}`);
  const offset = new THREE.Vector3(best.x, 0, best.z);
  if (root.parent) {
    const worldOrigin = root.parent.getWorldPosition(new THREE.Vector3());
    root.parent.worldToLocal(offset.add(worldOrigin));
  }
  root.position.copy(origin).add(offset);
  // Recalculate world bounds after moving, rather than keeping stale matrices.
  root.updateWorldMatrix(true, true);
}

