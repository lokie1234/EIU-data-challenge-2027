import { describe, expect, it } from 'vitest';
import { getRobotPose, stepSpring } from '../components/three/robotMotion';
import { portals } from '../data/eventContent';

describe('interactive robot motion', () => {
  it('keeps spring motion consistent at 30 and 120 frames per second', () => {
    const simulate = fps => {
      const spring = { position: 0, velocity: 1.6 };
      for (let i = 0; i < fps / 2; i++) stepSpring(spring, 0, 1 / fps);
      return spring;
    };
    expect(simulate(30).position).toBeCloseTo(simulate(120).position, 5);
    expect(simulate(30).velocity).toBeCloseTo(simulate(120).velocity, 5);
  });
  it('bounds a long frame and settles without residual drift', () => {
    const spring = { position: .2, velocity: 1.6 };
    stepSpring(spring, 0, 30);
    expect(Math.abs(spring.position)).toBeLessThan(.3);
    for (let i = 0; i < 600; i++) stepSpring(spring, 0, 1 / 60);
    expect(Math.abs(spring.position)).toBeLessThan(.0001);
    expect(Math.abs(spring.velocity)).toBeLessThan(.0001);
  });
  it('clamps pointer tracking and turns toward the selected spatial command', () => {
    const left = getRobotPose({ time: 1, active: 'about' });
    const right = getRobotPose({ time: 1, active: 'timeline' });
    expect(left.headYaw).toBeLessThan(0);
    expect(right.headYaw).toBeGreaterThan(0);
    expect(getRobotPose({ time: 1, pointerX: 100, pointerY: -100 })).toEqual(getRobotPose({ time: 1, pointerX: 1, pointerY: -1 }));
  });
  it('waves for a greeting, returns to idle, and uses a thinking pose for FAQ', () => {
    const idle = getRobotPose({ time: 1 });
    const greeting = getRobotPose({ time: 1, greeting: 2 });
    const thinking = getRobotPose({ time: 1, active: 'faq' });
    expect(greeting.rightArm).toBeGreaterThan(2);
    expect(idle.rightArm).toBeLessThan(.3);
    expect(thinking.rightEye).toBeLessThan(thinking.leftEye);
    expect(thinking.headTilt).toBeLessThan(0);
  });
  it('keeps all module gestures finite and closes both eyes during a blink', () => {
    for (const portal of portals) {
      const pose = getRobotPose({ time: 6.02, active: portal.id });
      expect(Object.values(pose).every(Number.isFinite)).toBe(true);
      expect(pose.leftEye).toBe(.06);
      expect(pose.rightEye).toBe(.06);
    }
  });
});
