import * as THREE from 'three-studio';
import { ROOM_ASPECT, ROOM_DEPTH } from './studioRoomProjection';
import { createSurfacePrints } from './studioSurfacePrints';
import { createRoomPatterns } from './studioRoomPatterns';
import { createWallIridescence } from './studioWallIridescence';

// Open, seamless architecture with no bookcases, console or demonstration board.
export function createStudioRoom(scene, options) {
  const root = new THREE.Group(); root.name = 'studio-room'; root.matrixAutoUpdate = false;
  scene.add(root);
  const prints = createSurfacePrints(root, options);
  const patterns = createRoomPatterns(root);

  // Seamless white plaster: real planes share the actors' depth and camera.
  // No tile grid, scan shader or additional full-screen GPU canvas.
  const architecture = new THREE.Group(); root.add(architecture);
  let wallEffect;
  const surface = (name, color, w, h, x, y, z, rx = 0, ry = 0) => {
    const material = new THREE.MeshStandardMaterial({ color, roughness: 1, metalness: 0, side: THREE.DoubleSide });
    material.userData.architecture = true;
    if (name === 'room-white-left-wall') wallEffect = createWallIridescence(material);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
    mesh.name = name; mesh.position.set(x, y, z); mesh.rotation.set(rx, ry, 0);
    mesh.receiveShadow = true; architecture.add(mesh);
    return mesh;
  };
  surface('room-white-floor', '#ffffff', ROOM_ASPECT, ROOM_DEPTH + 2, 0, -.5, (ROOM_DEPTH - 2) / 2, -Math.PI / 2);
  surface('room-white-back-wall', '#ffffff', ROOM_ASPECT, 2.5, 0, .75, ROOM_DEPTH);
  const iridescenceWall = surface('room-white-left-wall', '#ffffff', ROOM_DEPTH + 2, 2.5, -ROOM_ASPECT / 2, .75, (ROOM_DEPTH - 2) / 2, 0, Math.PI / 2);
  surface('room-white-right-wall', '#ffffff', ROOM_DEPTH + 2, 2.5, ROOM_ASPECT / 2, .75, (ROOM_DEPTH - 2) / 2, 0, -Math.PI / 2);
  return {
    root,
    buildStages: prints.buildStages,
    updateProjection(projection) {
      root.matrix.fromArray(projection.toWorld); root.matrixWorldNeedsUpdate = true;
      architecture.scale.x = projection.aspect / ROOM_ASPECT;
      prints.updateProjection(projection);
      patterns.updateProjection(projection);
    },
    update(time, delta) { prints.update(time, delta); patterns.update(time); wallEffect.update(time, delta); },
    iridescenceWall,
    setWallPointer: wallEffect.setPointer,
    clickWall: wallEffect.click,
    title: prints.title,
    setInteraction(signal) { prints.setInteraction(signal); patterns.setInteraction(signal); if (signal) wallEffect.setPointer(null); },
    dispose() { prints.dispose(); wallEffect.dispose(); },
  };
}
