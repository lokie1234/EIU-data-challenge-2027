import { getPortal } from '../../data/eventContent';

// Bounded steps keep the secondary bounce stable across refresh rates.
export function stepSpring(spring, target, delta) {
  let remaining = Math.min(Math.max(delta, 0), .05);
  while (remaining > 0) {
    const dt = Math.min(remaining, 1 / 120);
    spring.velocity += ((target - spring.position) * 85 - spring.velocity * 12) * dt;
    spring.position += spring.velocity * dt;
    remaining -= dt;
  }
  return spring;
}

export function getRobotPose({ time: t, active, pointerX = 0, pointerY = 0, greeting = 0, hovered = false }) {
  const portal = getPortal(active);
  const px = Math.max(-1, Math.min(1, pointerX)), py = Math.max(-1, Math.min(1, pointerY));
  const waving = greeting > 0 || active === 'register';
  const open = ['why-join', 'partners', 'prizes'].includes(active);
  const thinking = active === 'faq' || active === 'format';
  const phase = t % 6.4;
  const blink = (phase > 5.96 && phase < 6.12) || (phase > 6.23 && phase < 6.31);
  const look = portal ? (portal.x - 50) / 50 : px;
  return {
    float: Math.sin(t * 1.6) * .026,
    sway: Math.sin(t * .85) * .018,
    bodyYaw: look * .1 - .28,
    headYaw: look * .24 + px * .06 - .035,
    headPitch: .025 - py * .11 + (thinking ? .09 : Math.sin(t * .8) * .015),
    headTilt: thinking ? -.13 : hovered ? -.1 : Math.sin(t * .9) * .025,
    gazeX: px * .035 + look * .02,
    gazeY: py * .025,
    leftEye: blink ? .06 : waving || open ? .82 : 1,
    rightEye: blink ? .06 : thinking ? .65 : waving || open ? .82 : 1,
    leftArm: open ? -.65 : -.16 - Math.sin(t * 1.6) * .035,
    rightArm: waving ? 2.3 + Math.sin(t * 10) * .24 : thinking ? .95 : open ? .65 : .16 + Math.sin(t * 1.6 + .7) * .035,
    armForward: waving ? -.35 : thinking ? -.55 : -.08,
  };
}
