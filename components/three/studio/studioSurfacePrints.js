import * as THREE from 'three-studio';
import { portals } from '../../../data/eventContent';
import { getModuleOwner } from '../../../data/studioModules';
import { floorControlPlane, projectSurfaceTransform } from './studioRoomProjection';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry';
import { createGlyphTitle } from './studioGlyphTitle';
export function createSurfacePrints(root, { onModuleTransform, deferGeometry = false, highDetail = typeof window !== 'undefined' && window.innerWidth > 1024 } = {}) {
  const waitingForFonts = document.fonts?.status === 'loading';
  let disposed = false, selected = null, active = false;
  const canvas = (width, height) => Object.assign(document.createElement('canvas'), { width, height });
  const floorCanvas = canvas(highDetail ? 2048 : 1024, highDetail ? 2048 : 1024);
  const texture = source => {
    const map = new THREE.CanvasTexture(source);
    map.encoding = THREE.sRGBEncoding; map.anisotropy = highDetail ? 8 : 2;
    map.generateMipmaps = true; map.minFilter = THREE.LinearMipmapLinearFilter;
    return map;
  };
  const planeGeometry = () => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0], 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 1, 1, 0, 0, 1, 0], 2));
    geometry.setIndex([0, 2, 1, 2, 3, 1]);
    return geometry;
  };
  const ink = map => {
    const material = new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
    material.userData.architecture = true;
    return material;
  };
  const glyphTitle = createGlyphTitle(root, { deferGeometry }), title = glyphTitle.group;

  // Eight separate physical blocks, sharing one label atlas and one body draw.
  const modules = new THREE.Group(); modules.name = 'room-floor-command-blocks'; root.add(modules);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: '#e3ebf1', roughness: .8, metalness: .05 });
  bodyMaterial.userData.architecture = true;
  const bodies = new THREE.InstancedMesh(new RoundedBoxGeometry(1, 1, 1, 2, .035), bodyMaterial, 8);
  bodies.name = 'floor-command-bodies'; bodies.frustumCulled = false;
  modules.add(bodies);
  const shadowCanvas = canvas(64, 64), shadowCtx = shadowCanvas.getContext('2d');
  const gradient = shadowCtx.createRadialGradient(32, 32, 8, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(32,54,76,.45)'); gradient.addColorStop(1, 'rgba(32,54,76,0)');
  shadowCtx.fillStyle = gradient; shadowCtx.fillRect(0, 0, 64, 64);
  const haloMaterial = ink(texture(shadowCanvas)); haloMaterial.opacity = .4;
  const halos = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), haloMaterial, 8);
  halos.name = 'floor-command-contact-halos'; halos.frustumCulled = false; modules.add(halos);
  const labelMaterial = ink(texture(floorCanvas));
  const labels = portals.map((portal, index) => {
    const geometry = planeGeometry(), uv = geometry.attributes.uv;
    const x = index % 2 * 324, y = Math.floor(index / 2) * 166;
    for (let vertex = 0; vertex < uv.count; vertex++) uv.setXY(vertex, (x + uv.getX(vertex) * 296) / 620, 1 - (y + (1 - uv.getY(vertex)) * 142) / 640);
    const label = new THREE.Mesh(geometry, labelMaterial);
    label.name = `floor-command-label-${portal.id}`; label.matrixAutoUpdate = false; modules.add(label);
    return { mesh: label, id: portal.id, lift: .016, base: new THREE.Color(getModuleOwner(portal.id).color).convertSRGBToLinear() };
  });
  let floorPlane, projection, clipFromRoom;
  const matrix = new THREE.Matrix4(), quaternion = new THREE.Quaternion(), position = new THREE.Vector3(), scale = new THREE.Vector3(), tint = new THREE.Color();
  const white = new THREE.Color('#ffffff');
  const floorRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
  const place = (mesh, plane) => {
    const [x, y, z] = plane.origin, [hx, hy, hz] = plane.horizontal, [vx, vy, vz] = plane.vertical;
    const normal = new THREE.Vector3(hx, hy, hz).cross(new THREE.Vector3(vx, vy, vz)).normalize();
    mesh.matrix.set(hx, vx, normal.x, x, hy, vy, normal.y, y, hz, vz, normal.z, z, 0, 0, 0, 1);
    mesh.matrixWorldNeedsUpdate = true;
  };
  const updateBlocks = (time, delta, force = false) => {
    if (!floorPlane) return;
    const [x, , z] = floorPlane.origin, width = floorPlane.horizontal[0], depth = -floorPlane.vertical[2];
    let changed = force;
    labels.forEach((label, index) => {
      const engaged = label.id === selected, target = engaged ? active ? .007 : .048 : .016;
      const next = THREE.MathUtils.lerp(label.lift, target, 1 - Math.exp(-12 * delta));
      if (!force && Math.abs(next - label.lift) < .00001) return;
      label.lift = next; changed = true;
      const left = x + width * (index % 2 * 324) / 620, top = z - depth * (Math.floor(index / 2) * 166) / 640;
      const w = width * 296 / 620, d = depth * 142 / 640;
      position.set(left + w / 2, -.5 + label.lift, top - d / 2);
      scale.set(w, .028, d); bodies.setMatrixAt(index, matrix.compose(position, quaternion, scale));
      tint.copy(label.base).lerp(white, engaged ? .68 : .86); bodies.setColorAt(index, tint);
      const topPlane = { origin: [left, -.5 + label.lift + .0145, top], horizontal: [w, 0, 0], vertical: [0, 0, -d] };
      place(label.mesh, topPlane);
      if (clipFromRoom) onModuleTransform?.(label.id, projectSurfaceTransform(clipFromRoom, topPlane, projection.viewportWidth, projection.viewportHeight, 296, 142));
      position.set(left + w / 2, -.499, top - d / 2); scale.set(w * 1.18, d * 1.16, 1);
      halos.setMatrixAt(index, matrix.compose(position, floorRotation, scale));
    });
    if (changed) { bodies.instanceMatrix.needsUpdate = true; bodies.instanceColor.needsUpdate = true; halos.instanceMatrix.needsUpdate = true; }
    haloMaterial.opacity = .36 + Math.sin(time * 1.4) * .04;
  };

  const paint = () => {
    if (disposed) return;
    const font = getComputedStyle(document.documentElement).getPropertyValue('--display').trim() || 'sans-serif';
    const ctx = floorCanvas.getContext('2d'); ctx.clearRect(0, 0, floorCanvas.width, floorCanvas.height); ctx.save(); ctx.scale(floorCanvas.width / 620, floorCanvas.height / 640);
    portals.forEach((portal, index) => {
      const owner = getModuleOwner(portal.id), x = index % 2 * 324, y = Math.floor(index / 2) * 166;
      ctx.strokeStyle = '#405b70'; ctx.lineWidth = 2; ctx.strokeRect(x + 3, y + 3, 290, 136);
      ctx.fillStyle = owner.color; ctx.fillRect(x + 3, y + 3, 290, 5);
      ctx.textBaseline = 'top'; ctx.fillStyle = '#40596d'; ctx.font = `600 17px ${font}`;
      ctx.fillText(`${portal.number} / ${owner.label.toUpperCase()}`, x + 18, y + 19);
      ctx.font = `700 32px ${font}`; ctx.fillStyle = '#17344b';
      const lines = portal.label === 'Challenge format' ? ['Challenge', 'format'] : [portal.label];
      lines.forEach((line, row) => ctx.fillText(line, x + 18, y + 55 + row * 34, 260));
      ctx.fillStyle = owner.color; ctx.fillRect(x + 256, y + 117, 22, 3);
    });
    ctx.restore(); labelMaterial.map.needsUpdate = true;
  };
  paint(); if (waitingForFonts) document.fonts.ready.then(paint);
  return {
    title,
    buildStages: glyphTitle.buildStages,
    updateProjection(next) {
      projection = next;
      clipFromRoom = next.clipFromRoom ? new THREE.Matrix4().fromArray(next.clipFromRoom) : null;
      glyphTitle.updateProjection(next); modules.visible = projection.viewportWidth > 1024;
      floorPlane = floorControlPlane(projection.aspect); updateBlocks(0, 0, true);
    },
    update(time, delta) {
      if (disposed) return;
      glyphTitle.update(time);
      if (modules.visible) updateBlocks(time, delta);
    },
    setInteraction(signal) { selected = signal?.id || null; active = signal?.mode === 'active'; },
    dispose() { disposed = true; glyphTitle.buildStages.return?.(); },
  };
}
