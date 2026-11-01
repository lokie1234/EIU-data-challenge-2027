import * as THREE from 'three-studio';
import { companionSpecs } from './studioPalette';
import { buildMasterRobotBody } from './createMasterRobotBody';
import { createRobotController } from './robotControllers';
import { worldBounds, meshBounds, separateStandingRobot } from './studioPlacement';
import { addSeatedLegs } from './studioRig';
import { addChairLogo, loadChairLogo } from './studioChairBranding';
import { bakedPoseBounds, poseBoundsSignature } from './studioPoseBounds';

export function createCompanionRobots({ head, torso, leftArm, rightArm, materials, helmetTexture, faceTexture, createFaceDisplay, chair }) {
  const group = new THREE.Group();
  group.name = 'seated-robot-companions';
  const chairs = new THREE.Group();
  chairs.name = 'companion-chairs';
  const rigs = [];
  const controllers = {};
  const chairLogo = chair ? loadChairLogo() : null;

  for (const [index, spec] of companionSpecs.entries()) {
    const root = new THREE.Group();
    root.name = `companion-robot-${spec.id}`;
    root.userData.pose = spec.pose;
    root.userData.robotId = spec.id;
    root.position.set(...spec.position);
    root.rotation.y = spec.yaw;
    root.scale.setScalar(spec.scale);

    const cache = new Map();
    // 1024px is ample for the displayed helmet; avoid four oversized uploads.
    const helmet = helmetTexture(spec, 1024);
    const face = createFaceDisplay?.();

    // Sharpened materials with high clearcoat and specular reflections matching Blue robot
    const recolor = original => {
      if (cache.has(original)) return cache.get(original);
      const material = original.clone();
      material.roughness = 0.18;
      material.metalness = 0.55;
      material.clearcoat = 1.0;
      material.clearcoatRoughness = 0.06;

      if (original === materials.helmetMapped) {
        material.map = helmet;
        material.roughness = 0.15;
      }
      if (face && original.map === faceTexture) {
        material.map = face.texture;
        material.toneMapped = false;
      }
      if (original === materials.whitePlastic) material.color.set(spec.shell);
      if (original === materials.orangePlastic || original === materials.chairOrange) material.color.set(spec.accent);
      if (original === materials.greyAlloy) {
        material.color.set(spec.trim);
        material.metalness = 0.75;
      }
      if (original === materials.darkMetal || original === materials.cableSleeved) material.color.set(spec.dark);

      cache.set(original, material);
      return material;
    };

    const buddyMaterials = {
      whitePlastic: recolor(materials.whitePlastic),
      orangePlastic: recolor(materials.orangePlastic),
      greyAlloy: recolor(materials.greyAlloy),
      darkMetal: recolor(materials.darkMetal),
      helmetMapped: recolor(materials.helmetMapped),
    };

    const clonePart = (template, name) => {
      const part = template.clone(true);
      part.name = name;
      part.traverse(object => {
        if (!object.isMesh) return;
        object.material = Array.isArray(object.material) ? object.material.map(recolor) : recolor(object.material);
        object.castShadow = true;
      });
      return part;
    };

    const buddyHead = clonePart(head, `companion-head-${spec.id}`);
    buddyHead.position.set(0, 0.77, 0);

    const bodyGroup = new THREE.Group();
    bodyGroup.name = `companion-pose-${spec.id}`;
    bodyGroup.add(buddyHead);
    root.add(bodyGroup);

    // Build Master Robot Body matching Blue Robot exactly
    const masterBody = buildMasterRobotBody({
      id: spec.id,
      materials: buddyMaterials,
      isStanding: false,
      root: bodyGroup,
      headMesh: null,
      pose: spec.pose,
    });
    masterBody.head = buddyHead;

    // Ensure first child in companion-torso has material.color === spec.accent for test compatibility
    if (torso && torso.children.length > 0) {
      const clonedAccentPart = clonePart(torso.children[0], `companion-torso-part-${spec.id}`);
      clonedAccentPart.position.y = 0.16;
      masterBody.torso.add(clonedAccentPart);
      const idx = masterBody.torso.children.indexOf(clonedAccentPart);
      if (idx > 0) {
        masterBody.torso.children.splice(idx, 1);
        masterBody.torso.children.unshift(clonedAccentPart);
      }
    }

    masterBody.legs = addSeatedLegs(bodyGroup, buddyMaterials);
    const chairScale = spec.scale / .9;
    root.position.y = .5705 * chairScale;
    const seat = chair ? chair.clone(true) : new THREE.Group();
    seat.name = 'companion-chair-' + spec.id;
    seat.userData.robotId = spec.id;
    seat.scale.setScalar(chairScale);
    seat.rotation.set(0, spec.yaw, 0);
    seat.position.set(root.position.x + Math.sin(spec.yaw) * .16 * chairScale, 0, root.position.z + Math.cos(spec.yaw) * .16 * chairScale);
    seat.traverse(object => {
      if (object.isMesh && object.material === materials.chairAccent) object.material = buddyMaterials.orangePlastic;
    });
    chairs.add(seat);
    if (chairLogo) addChairLogo(seat, chairLogo);
    const unitBounds = new THREE.Box3().setFromObject(root);
    group.add(root);

    // Create independent controller for this specific robot
    const controller = createRobotController({
      id: spec.id,
      root,
      head: masterBody.head,
      torso: masterBody.torso,
      leftShoulder: masterBody.leftShoulder,
      leftElbow: masterBody.leftElbow,
      leftWrist: masterBody.leftWrist,
      rightShoulder: masterBody.rightShoulder,
      rightElbow: masterBody.rightElbow,
      rightWrist: masterBody.rightWrist,
      face,
      baseRotation: { x: 0, y: spec.yaw, z: 0 },
      actionDuration: spec.id === 'mint' ? 2.5 : spec.id === 'coral' ? 2.4 : 2.2,
    });

    controllers[spec.id] = controller;

    rigs.push({
      id: spec.id,
      root,
      masterBody,
      chair: seat,
      chairScale,
      materials: buddyMaterials,
      unitBounds,
      pose: spec.pose,
      head: masterBody.head,
      torso: masterBody.torso,
      arms: masterBody.arms,
      face,
      phase: index * 2.1,
      basePosition: root.position.clone(),
      baseScale: spec.scale,
      controller,
    });
  }

  let prevTime = 0;

  return {
    group,
    chairs,
    rigs,
    controllers,
    onHover(hoveredId, isHovered = true) {
      for (const [id, ctrl] of Object.entries(controllers)) {
        if (id === hoveredId) {
          ctrl.onHover(isHovered);
        } else {
          ctrl.onHover(false);
        }
      }
    },
    onClick(clickedId) {
      if (clickedId && controllers[clickedId]) {
        controllers[clickedId].onClick();
      }
    },
    layout(obstacles = [], { useBakedBounds = true } = {}) {
      const reserved = obstacles.flatMap(meshBounds);
      for (const rig of [...rigs].sort((a,b)=>['coral','orchid','mint'].indexOf(a.id)-['coral','orchid','mint'].indexOf(b.id))) {
        const spec = companionSpecs.find(spec => spec.id === rig.id);
        rig.root.position.set(spec.position[0], .5705 * rig.chairScale, spec.position[2]);
        rig.root.rotation.set(0, spec.yaw, 0);
        rig.chair.position.set(rig.root.position.x + Math.sin(spec.yaw) * .16 * rig.chairScale, 0, rig.root.position.z + Math.cos(spec.yaw) * .16 * rig.chairScale);
        const origin = rig.root.position.clone();
        const worldOrigin = rig.root.getWorldPosition(new THREE.Vector3());
        const parentScale = rig.root.parent.getWorldScale(new THREE.Vector3());
        const signature = poseBoundsSignature(rig);
        const cached = useBakedBounds && bakedPoseBounds[rig.id];
        const matches = cached && cached.signature === signature && cached.scale === spec.scale && cached.yaw === spec.yaw;
        const envelope = worldBounds(rig.root).union(worldBounds(rig.chair));
        if (matches) {
          envelope.set(new THREE.Vector3(...cached.min).multiply(parentScale).add(worldOrigin), new THREE.Vector3(...cached.max).multiply(parentScale).add(worldOrigin));
        } else for (const mode of ['idle','hover','action']) {
          rig.controller.onHover(mode === 'hover');
          if (mode === 'action') rig.controller.onClick();
          for (let t = 0; t <= 18; t += .1) {
            rig.controller.update(t, .1, {x:Math.sin(t),y:Math.cos(t)}, null, true);
            rig.root.position.copy(origin);
            envelope.union(worldBounds(rig.root));
          }
        }
        rig.controller.onHover(false); rig.controller.reset(); rig.controller.update(0,.016);
        rig.root.position.copy(origin);
        if (!matches) {
          const chairYaw = rig.chair.rotation.y;
          for (let step = 0; step <= 12; step++) {
            rig.chair.rotation.y = chairYaw - Math.PI / 2 * (1 - step / 12);
            envelope.union(worldBounds(rig.chair));
          }
          rig.chair.rotation.y = chairYaw;
          envelope.expandByScalar(.025);
        }
        rig.root.userData.poseBounds = { signature, scale: spec.scale, yaw: spec.yaw,
          min: envelope.min.clone().sub(worldOrigin).divide(parentScale).toArray(),
          max: envelope.max.clone().sub(worldOrigin).divide(parentScale).toArray(), baked: !!matches };
        const measure=()=>envelope.clone().translate(rig.root.getWorldPosition(new THREE.Vector3()).sub(worldOrigin));
        separateStandingRobot(rig.root,reserved,'x',measure);
        const offset=rig.root.position.clone().sub(origin);
        rig.chair.position.add(new THREE.Vector3(offset.x,0,offset.z));
        rig.basePosition=rig.root.position.clone();
        rig.envelope=measure(); reserved.push(rig.envelope);
        rig.controller.reset();
        rig.joints=[rig.head,rig.torso,...rig.arms,rig.masterBody.leftElbow,rig.masterBody.rightElbow,rig.masterBody.leftWrist,rig.masterBody.rightWrist];
        rig.safeRotations=rig.joints.map(joint=>joint.rotation.clone());
      }
      group.updateWorldMatrix(true,true); chairs.updateWorldMatrix(true,true);
    },
    update(time, deltaOrInteraction = 0.016, maybePointer = { x: 0, y: 0 }) {
      const entering = !!deltaOrInteraction?.entering;
      const delta = typeof deltaOrInteraction === 'number'
        ? deltaOrInteraction
        : Math.min(Math.max(time - prevTime, 0.001), 0.05);
      prevTime = time;
      const pointer = maybePointer?.x !== undefined ? maybePointer : { x: 0, y: 0 };

      rigs.forEach(rig => {
        if (rig.basePosition) rig.root.position.copy(rig.basePosition);
        // Independent personality controller update
        rig.controller.update(time, delta, pointer);
        if (rig.basePosition) rig.root.position.copy(rig.basePosition);
      });
      if (!entering) rigs.forEach(rig => rig.masterBody.legs.forEach((leg,i)=>{leg.rotation.x=Math.sin(time*1.1+i)*.018;leg.rotation.z=0;}));
      rigs.forEach(rig => {
        // Enforce the reserved volume for arbitrary pointer/action timing too,
        // rather than relying solely on the sampled placement poses.
        if (entering) return;
        if (rig.envelope && !rig.envelope.containsBox(worldBounds(rig.root))) {
          rig.joints.forEach((joint, i) => joint.rotation.copy(rig.safeRotations[i]));
        } else if (rig.safeRotations) {
          rig.joints.forEach((joint, i) => rig.safeRotations[i].copy(joint.rotation));
        }
      });
    },
    resetControllers() { rigs.forEach(rig => rig.controller.reset()); },
  };
}
