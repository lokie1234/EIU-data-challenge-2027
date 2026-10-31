import * as THREE from 'three';

function roundedOutline(width, height, radius, path = new THREE.Shape()) {
  const x = width / 2, y = height / 2, r = radius;
  path.moveTo(-x + r, -y);
  path.lineTo(x - r, -y); path.quadraticCurveTo(x, -y, x, -y + r);
  path.lineTo(x, y - r); path.quadraticCurveTo(x, y, x - r, y);
  path.lineTo(-x + r, y); path.quadraticCurveTo(-x, y, -x, y - r);
  path.lineTo(-x, -y + r); path.quadraticCurveTo(-x, -y, -x + r, -y);
  path.closePath();
  return path;
}

export function createFaceGeometry() {
  const width = 1.6, height = 1.38, radius = .38, columns = 40, rows = 36;
  const positions = [], uv = [], indices = [];
  // Interior vertices give the glass an actual curved surface, rather than a flat polygon.
  for (let row = 0; row <= rows; row++) {
    const y = (row / rows - .5) * height;
    const cornerY = Math.max(0, Math.abs(y) - (height / 2 - radius));
    const halfWidth = width / 2 - radius + Math.sqrt(Math.max(0, radius * radius - cornerY * cornerY));
    for (let column = 0; column <= columns; column++) {
      const x = (column / columns * 2 - 1) * halfWidth;
      const bulge = .035 * (1 - (x / (width / 2)) ** 2) * (1 - (y / (height / 2)) ** 2);
      positions.push(x, y, .025 + bulge);
      uv.push(x / width + .5, y / height + .5);
      if (row < rows && column < columns) {
        const a = row * (columns + 1) + column, b = a + columns + 1;
        indices.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function createBezelGeometry() {
  const outline = roundedOutline(1.76, 1.53, .43);
  outline.holes.push(roundedOutline(1.58, 1.36, .37, new THREE.Path()));
  return new THREE.ExtrudeGeometry(outline, { depth: .065, bevelEnabled: true, bevelThickness: .018, bevelSize: .018, bevelSegments: 3, curveSegments: 16 });
}

export function createSoftBodyGeometry() {
  const profile = new THREE.SplineCurve([
    new THREE.Vector2(0, -.42), new THREE.Vector2(.16, -.4),
    new THREE.Vector2(.25, -.31), new THREE.Vector2(.29, -.12),
    new THREE.Vector2(.32, .09), new THREE.Vector2(.29, .24),
    new THREE.Vector2(.2, .34), new THREE.Vector2(0, .36),
  ]).getPoints(36).map(point => new THREE.Vector2(Math.max(0, point.x), point.y));
  return new THREE.LatheGeometry(profile, 40);
}

export function createFlipperGeometry() {
  const geometry = new THREE.SphereGeometry(1, 28, 24);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    const taper = .82 - y * .16;
    positions.setXYZ(i, positions.getX(i) * .19 * taper, y * .37 - .23, positions.getZ(i) * .19 * taper + .04 * (1 - y));
  }
  geometry.computeVertexNormals();
  return geometry;
}
