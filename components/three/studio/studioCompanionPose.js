import * as THREE from 'three-studio';
import { solveArm } from './studioRig';

const down = new THREE.Vector3(0, -1, 0);
const handRotation = new THREE.Quaternion(), parentRotation = new THREE.Quaternion();
const upperRotation = new THREE.Quaternion(), lowerRotation = new THREE.Quaternion();
const point = new THREE.Vector3(), direction = new THREE.Vector3();

// Stagger the bodies so the short chibi arm can wrap behind the partner's back.
// Keep the inside arm there while the outside arms and
// expressive faces remain interactive. Only joint transforms are changed.
export function poseShoulderHug(green, pink, time = 0) {
  // Head and expression ownership stays with the conversation controller.
  const { rightShoulder: shoulder, rightElbow: elbow, rightWrist: wrist } = green.masterBody;
  const partner = pink.masterBody.leftShoulder;
  shoulder.position.x = .315;
  partner.position.x = -.315;
  partner.rotation.set(.08, 0, -.08);
  pink.masterBody.leftElbow.rotation.set(-.12, 0, 0);
  const back = pink.root.getObjectByName('master-backpack-orchid');
  back.updateWorldMatrix(true, true);
  // The wrist stays behind the back, with the fingers pointing forward onto
  // the backpack's rear face, rather than pushing through the side of a sleeve.
  point.set(-.16, -.10, .0815);
  back.localToWorld(point);
  shoulder.parent.worldToLocal(point);
  back.getWorldQuaternion(handRotation);
  shoulder.parent.getWorldQuaternion(parentRotation);
  handRotation.premultiply(parentRotation.invert());
  point.sub(new THREE.Vector3(0, -.0785, -.101).applyQuaternion(handRotation));
  const joint = solveArm(shoulder.position, point, 1);
  upperRotation.setFromUnitVectors(down, direction.copy(joint).sub(shoulder.position).normalize());
  lowerRotation.setFromUnitVectors(down, direction.copy(point).sub(joint).normalize());
  shoulder.quaternion.copy(upperRotation);
  elbow.quaternion.copy(upperRotation).invert().multiply(lowerRotation);
  wrist.quaternion.copy(lowerRotation).invert().multiply(handRotation);
  green.masterBody.fingers.right.forEach(finger => { finger.rotation.x = 0; });
}



