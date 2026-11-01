import * as THREE from 'three-studio';
import { portals } from '../../../data/eventContent';
import { getModuleOwner } from '../../../data/studioModules';
import { floorControlPlane } from './studioRoomProjection';

// Floor routes only: the walls stay clear around the individual 3D letters.
// All colors live in the shared studio canvas, so click-to-color stays in sync.
export function createRoomPatterns(root) {
  const group = new THREE.Group(); group.name = 'room-data-patterns'; root.add(group);
  const lineGeometry = new THREE.BufferGeometry(), nodeGeometry = new THREE.BufferGeometry();
  const lineMaterial = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: .23, depthWrite: false, toneMapped: false });
  const nodeMaterial = new THREE.PointsMaterial({ vertexColors: true, size: .014, transparent: true, opacity: .38, depthWrite: false, toneMapped: false });
  lineMaterial.userData.architecture = nodeMaterial.userData.architecture = true;
  group.add(new THREE.LineSegments(lineGeometry, lineMaterial), new THREE.Points(nodeGeometry, nodeMaterial));
  const pulseGeometry = new THREE.BufferGeometry();
  pulseGeometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));
  const pulseMaterial = new THREE.PointsMaterial({ color: '#66baff', size: .032, transparent: true, opacity: .85, depthWrite: false, toneMapped: false });
  pulseMaterial.userData.architecture = true;
  const pulse = new THREE.Points(pulseGeometry, pulseMaterial); pulse.name = 'room-module-data-signal'; pulse.visible = false; pulse.frustumCulled = false;
  group.add(pulse);
  let routes = new Map(), selected = null, startedAt = null, lastTime = 0;
  const movingPoint = new THREE.Vector3();
  const paintColor = color => new THREE.Color(color).convertSRGBToLinear().toArray();
  const upload = (geometry, positions, colors) => {
    for (const [name, values] of [['position', positions], ['color', colors]]) {
      const attribute = geometry.getAttribute(name);
      if (attribute) { attribute.array.set(values); attribute.needsUpdate = true; }
      else geometry.setAttribute(name, new THREE.Float32BufferAttribute(values, 3));
    }
    geometry.computeBoundingSphere();
  };
  return {
    updateProjection({ aspect }) {
      const positions = [], colors = [], nodes = [], nodeColors = [];
      const segment = (a, b, color = '#91a7b8') => { positions.push(...a, ...b); const c = paintColor(color); colors.push(...c, ...c); };
      const node = (p, color = '#91a7b8') => { nodes.push(...p); nodeColors.push(...paintColor(color)); };
      // Shared floor spine branches towards the eight separate command blocks.
      const plane = floorControlPlane(aspect), floorY = -.496;
      const start = [aspect * .035, floorY, .85], spine = aspect * .145;
      segment(start, [spine, floorY, .85]);
      segment([spine, floorY, 1.43], [spine, floorY, -.10]);
      routes = new Map();
      portals.forEach((portal, index) => {
        const owner = getModuleOwner(portal.id);
        const x = plane.origin[0] + plane.horizontal[0] * (index % 2 * 324 + 148) / 620;
        const z = plane.origin[2] + plane.vertical[2] * (Math.floor(index / 2) * 166 + 71) / 640;
        const corner = [spine, floorY, z], end = [x, floorY, z];
        if (index % 2 === 0) node(corner, owner.color);
        segment(corner, end, owner.color);
        routes.set(portal.id, [start, [spine, floorY, .85], corner, end].map(p => new THREE.Vector3(...p)));
      });
      upload(lineGeometry, positions, colors); upload(nodeGeometry, nodes, nodeColors);
    },
    setInteraction(signal) {
      const next = signal?.id || null;
      if (selected !== next) { selected = next; startedAt = lastTime; }
      pulse.visible = !!routes.get(selected);
      const owner = getModuleOwner(selected);
      if (owner) pulseMaterial.color.set(owner.color).convertSRGBToLinear();
    },
    update(time) {
      lastTime = time;
      const route = routes.get(selected);
      if (!route || startedAt === null) return;
      // One short travelling signal per selection, no continuous scan loop.
      const progress = (time - startedAt) / 1.15;
      pulse.visible = progress >= 0 && progress < 1;
      if (!pulse.visible) return;
      const scaled = Math.min(progress * 3, 2.999), index = Math.floor(scaled);
      const point = movingPoint.copy(route[index]).lerp(route[index + 1], scaled - index);
      pulseGeometry.attributes.position.setXYZ(0, point.x, point.y, point.z);
      pulseGeometry.attributes.position.needsUpdate = true;
    },
  };
}
