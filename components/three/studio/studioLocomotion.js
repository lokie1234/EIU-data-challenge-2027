import * as THREE from 'three-studio';
import { addStandingLegs } from './createMasterRobotBody';

const down = new THREE.Vector3(0, -1, 0);
const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const u = clamp(value); return u * u * (3 - 2 * u); };

export function createWalkingRig(parent, materials, id) {
  const group = new THREE.Group();
  group.name = `entry-walking-legs-${id}`;
  group.position.y = -.415;
  parent.add(group);
  const hips = addStandingLegs(group, materials, `entry-${id}`);
  const legs = hips.map(hip => {
    const knee = new THREE.Group(), foot = new THREE.Group();
    knee.name = `entry-knee-${id}-${hip.position.x}`;
    foot.name = `entry-ankle-${id}-${hip.position.x}`;
    hip.position.y = .42;
    knee.position.y = -.20; foot.position.y = -.17;
    const parts = [...hip.children];
    hip.add(knee); knee.add(foot);
    for (const mesh of parts) {
      if (mesh.name.includes('shin')) { mesh.position.y -= .22; knee.add(mesh); }
      else if (['ankle','boot','sole'].some(name => mesh.name.includes(name))) { mesh.position.y -= .05; foot.add(mesh); }
      else mesh.position.y -= .42;
    }
    return { hip, knee, foot };
  });
  return {
    group,
    update(time, climb = 0) {
      group.updateWorldMatrix(true, true);
      const worldScale = group.getWorldScale(new THREE.Vector3()).y;
      const floor = .081 - group.getWorldPosition(new THREE.Vector3()).y / worldScale;
      legs.forEach(({ hip, knee, foot }, index) => {
        const phase = ((time / .72 + index * .5) % 1 + 1) % 1;
        const swing = phase >= .62;
        const u = swing ? (phase - .62) / .38 : phase / .62;
        const stride = swing ? .11 - .22 * smooth(u) : -.11 + .22 * u;
        const lift = swing ? Math.sin(u * Math.PI) * .09 : 0;
        const step = climb > 0 ? (index ? .23 : .12) * Math.sin(Math.PI * clamp(climb)) : 0;
        const target = new THREE.Vector3(0, Math.max(floor, .06) + lift + step - .42, stride);
        const distance = Math.min(.369, Math.max(.035, target.length()));
        target.normalize().multiplyScalar(distance);
        const direction = target.clone().normalize();
        const along = (.20 ** 2 - .17 ** 2 + distance ** 2) / (2 * distance);
        const height = Math.sqrt(Math.max(0, .20 ** 2 - along ** 2));
        const bend = new THREE.Vector3(0, 0, -1).addScaledVector(direction, direction.z).normalize();
        const joint = direction.clone().multiplyScalar(along).addScaledVector(bend, height);
        const upper = new THREE.Quaternion().setFromUnitVectors(down, joint.clone().normalize());
        const lower = new THREE.Quaternion().setFromUnitVectors(down, target.clone().sub(joint).normalize());
        hip.quaternion.copy(upper);
        knee.quaternion.copy(upper).invert().multiply(lower);
        foot.quaternion.copy(lower).invert();
      });
    },
    dispose() {
      group.traverse(mesh => mesh.geometry?.dispose());
      group.parent?.remove(group);
    },
  };
}
