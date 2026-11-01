import * as THREE from 'three-studio';

// Contact shadows share the model camera and world floor, not a CSS offset.
// Six patches per chair are instanced into one draw call.
export function createStudioGrounding(scene, chairs, desk) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const ink = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  ink.addColorStop(0, 'rgba(0,0,0,.7)');
  ink.addColorStop(.22, 'rgba(0,0,0,.52)');
  ink.addColorStop(.55, 'rgba(0,0,0,.2)');
  ink.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = ink;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  const geometry = new THREE.PlaneGeometry(1, 1);
  const group = new THREE.Group();
  group.name = 'studio-ground-contacts';
  scene.add(group);
  const rotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
  const matrix = new THREE.Matrix4(), position = new THREE.Vector3(), scale = new THREE.Vector3();
  const records = [];
  const add = (owner, patches, fadeMesh) => {
    const material = new THREE.MeshBasicMaterial({
      color: 0x000000, map: texture, transparent: true,
      opacity: .66, depthWrite: false, toneMapped: false,
    });
    const shadow = new THREE.InstancedMesh(geometry, material, patches.length);
    shadow.name = `contact-shadow-${owner.name}`;
    shadow.frustumCulled = false;
    shadow.renderOrder = 1;
    group.add(shadow);
    records.push({ owner, patches, shadow, fadeMesh, matrix: new THREE.Matrix4(), initialized: false });
  };
  chairs.forEach(chair => add(chair, [
    { target: chair.getObjectByName('chair-gas-lift'), size: 1.25 },
    ...Array.from({ length: 5 }, (_, i) => ({ target: chair.getObjectByName(`chair-caster-${i}`), size: .2 })),
  ], chair.getObjectByName('chair-seat-cushion')));
  const feet = [];
  desk.traverse(object => { if (object.name === 'desk-adjustable-foot') feet.push({ target: object, size: .23 }); });
  add(desk, feet, feet[0]?.target);
  return {
    update() {
      for (const record of records) {
        const { owner, patches, shadow, fadeMesh } = record;
        let visible = true;
        for (let parent = owner; parent; parent = parent.parent) visible &&= parent.visible;
        shadow.visible = visible;
        if (!visible) continue;
        shadow.material.opacity = .66 * (fadeMesh?.material?.opacity ?? 1);
        owner.updateWorldMatrix(true, false);
        if (record.initialized && record.matrix.equals(owner.matrixWorld)) continue;
        record.matrix.copy(owner.matrixWorld);
        record.initialized = true;
        patches.forEach(({ target, size }, index) => {
          target.getWorldPosition(position);
          target.getWorldScale(scale);
          const width = size * Math.max(scale.x, scale.z);
          position.y = .003 + index * .0005;
          scale.set(width, width, 1);
          matrix.compose(position, rotation, scale);
          shadow.setMatrixAt(index, matrix);
        });
        shadow.instanceMatrix.needsUpdate = true;
      }
    },
  };
}
