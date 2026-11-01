import { expect, it } from 'vitest';
import * as THREE from 'three-studio';
import { createRobotController } from '../components/three/studio/robotControllers';
import { getConversationCue } from '../components/three/studio/studioConversation';

function controller(id) {
  const root = new THREE.Group();
  const parts = Object.fromEntries(['head', 'torso', 'leftShoulder', 'leftElbow', 'leftWrist', 'rightShoulder', 'rightElbow', 'rightWrist'].map(name => [name, new THREE.Group()]));
  Object.values(parts).forEach(part => root.add(part));
  return createRobotController({ id, root, ...parts });
}

it('repeats coordinated autonomous actions for all four robots without user input', () => {
  const controllers = ['blue', 'coral', 'mint', 'orchid'].map(controller);
  const counts = [0, 0, 0, 0], previous = controllers.map(() => 'idle');
  for (let time = 0; time < 43; time += .05) {
    controllers.forEach((robot, index) => {
      robot.update(time, .05);
      if (robot.getState() === 'action' && previous[index] !== 'action') {
        expect(robot.root.userData.interactionSource).toBe('autonomous');
        counts[index]++;
      }
      previous[index] = robot.getState();
    });
  }
  counts.forEach(count => expect(count).toBeGreaterThanOrEqual(3));
});

it('prioritizes hover and click, then resumes autonomous interaction after inactivity', () => {
  const robot = controller('mint');
  robot.update(6, .05);
  robot.onHover(true);
  for (let time = 6.05; time < 25; time += .05) {
    robot.update(time, .05);
    expect(robot.getState()).toBe('hover');
  }
  robot.onClick();
  robot.update(25, .05);
  expect(robot.getState()).toBe('action');
  expect(robot.root.userData.interactionSource).toBe('user');
  robot.onHover(false);
  for (let time = 25.05; time < 43; time += .05) robot.update(time, .05);
  expect(robot.root.userData.interactionSource).toBe('autonomous');
});

it('turns BLUE first, then shakes GREEN/PINK heads without reversing them, and raises ORANGE arm', () => {
  const blue=controller('blue'), green=controller('mint'), pink=controller('orchid'), orange=controller('coral');
  expect(getConversationCue(2).pairLook).toBeGreaterThan(0);
  expect(getConversationCue(2).pairShake).toBe(0);
  blue.update(0,.05); expect(blue.head.rotation.y).toBeCloseTo(.52);
  blue.update(4,.05); expect(blue.head.rotation.y).toBeCloseTo(-1.2);
  green.update(4,.05); pink.update(4,.05);
  const previous=green.head.rotation.y;
  green.update(4.3,.05);
  expect(Math.abs(green.head.rotation.y-previous)).toBeGreaterThan(.1);
  expect(Math.abs(green.head.rotation.y)).toBeLessThan(.25);
  expect(Math.abs(pink.head.rotation.y)).toBeLessThan(.25);
  expect(getConversationCue(9.5).orangePoint).toBe(0);
  blue.update(12,.05); orange.update(12,.05);
  expect(blue.head.rotation.y).toBeCloseTo(-.15);
  expect(orange.rightShoulder.rotation.z).toBeGreaterThan(2);
  expect(orange.head.rotation.y).toBeCloseTo(1.15);
});

it('keeps GREEN and PINK arms resting during autonomous, hover and click gestures', () => {
  for (const id of ['mint','orchid']) {
    const robot = controller(id);
    for (const mode of ['idle','hover','click']) {
      robot.onHover(mode === 'hover');
      if (mode === 'click') robot.onClick();
      for (let time = 0; time < 20; time += .1) {
        robot.update(time,.1);
        expect(robot.leftShoulder.rotation.x).toBeCloseTo(1.1);
        expect(robot.rightShoulder.rotation.x).toBeCloseTo(1.1);
        expect(Math.abs(robot.leftShoulder.rotation.z)).toBeCloseTo(.22);
        expect(Math.abs(robot.rightShoulder.rotation.z)).toBeCloseTo(.22);
      }
    }
  }
});
