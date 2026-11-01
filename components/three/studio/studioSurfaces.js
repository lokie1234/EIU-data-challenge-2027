import * as THREE from 'three-studio';
import { applyPencilMaterial } from './studioPencil';

export function createVisorGeometry(width = .76, height = .46, radius = .15, offset = .018) {
  const columns = 32, rows = 20, positions = [], uv = [], indices = [];
  for (let row = 0; row <= rows; row++) {
    const y = (row / rows - .5) * height;
    const cornerY = Math.max(0, Math.abs(y) - (height / 2 - radius));
    const half = width / 2 - radius + Math.sqrt(Math.max(0, radius * radius - cornerY * cornerY));
    for (let column = 0; column <= columns; column++) {
      const x = (column / columns * 2 - 1) * half;
      const headY = y - .065;
      const z = -Math.sqrt(Math.max(.004, .455 ** 2 - (x / 1.06) ** 2 - (headY / .98) ** 2)) * 1.04 - offset;
      positions.push(x, headY, z);
      uv.push(x / width + .5, y / height + .5);
      if (row < rows && column < columns) {
        const a = row * (columns + 1) + column, b = a + columns + 1;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}

export function createDeskTopGeometry() {
  const w = 1.3, d = .73, r = .14;
  const shape = new THREE.Shape();
  shape.moveTo(-w + r, -d);
  shape.lineTo(w - r, -d); shape.quadraticCurveTo(w, -d, w, -d + r);
  shape.lineTo(w, d - r); shape.quadraticCurveTo(w, d, w - r, d);
  shape.lineTo(-w + r, d); shape.quadraticCurveTo(-w, d, -w, d - r);
  shape.lineTo(-w, -d + r); shape.quadraticCurveTo(-w, -d, -w + r, -d);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: .045, bevelEnabled: true, bevelThickness: .005, bevelSize: .006, bevelSegments: 3, curveSegments: 10 });
  geometry.rotateX(-Math.PI / 2); geometry.translate(0, -.0225, 0);
  return geometry;
}

export function createMonitorScreenGeometry(width = 1.15, height = .64, depth = .039) {
  const positions = [], uv = [], indices = [], columns = 48;
  for (let row = 0; row <= 1; row++) for (let column = 0; column <= columns; column++) {
    const u = column / columns, x = (u - .5) * width;
    positions.push(x, (row - .5) * height, depth + .10 * (x / .575) ** 2);
    uv.push(u, row);
    if (!row && column < columns) {
      const a = column, b = a + columns + 1;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}

export function createMonitorHousingGeometry() {
  // The housing and display share the same curve and subdivision density.
  // A sparsely bent box otherwise cuts across the animated display surface.
  const front = createMonitorScreenGeometry(1.23, .72, .0375);
  const positions = [...front.attributes.position.array];
  const count = front.attributes.position.count;
  for (let i = 0; i < count; i++) positions.push(front.attributes.position.getX(i), front.attributes.position.getY(i), front.attributes.position.getZ(i) - .075);
  const indices = [...front.index.array];
  for (let i = 0; i < front.index.count; i += 3) indices.push(front.index.getX(i + 2) + count, front.index.getX(i + 1) + count, front.index.getX(i) + count);
  const edge = (a, b) => indices.push(a, a + count, b, b, a + count, b + count);
  for (let i = 0; i < 48; i++) { edge(i + 1, i); edge(49 + i, 50 + i); }
  edge(0, 49); edge(97, 48);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices); geometry.computeVertexNormals(); front.dispose();
  return geometry;
}

export function calibrateStudioMaterials(scene) {
  const seen = new Set();
  scene.traverse(object => {
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (!material || seen.has(material)) continue;
      seen.add(material);
      // r128 does not convert CSS/hex albedo colors into linear light itself.
      if (!material.userData.studioLinear) {
        material.color?.convertSRGBToLinear();
        material.userData.studioLinear = true;
      }
      if (material.map) { material.map.encoding = THREE.sRGBEncoding; material.map.needsUpdate = true; }
      if (!material.userData.architecture) applyPencilMaterial(material, { detail: !!material.map && material.isMeshBasicMaterial });
      if (material.isMeshBasicMaterial) material.toneMapped = false;
      material.needsUpdate = true;
    }
  });
}
