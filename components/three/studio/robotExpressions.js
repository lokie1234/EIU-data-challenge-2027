const ramp = (a, b, t) => {
  const value = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return value * value * (3 - 2 * value);
};

export function getStudioInteraction(time) {
  const t = ((time % 20) + 20) % 20;
  const wave = ramp(5, 5.6, t) * (1 - ramp(8.4, 9, t));
  const point = ramp(9, 9.6, t) * (1 - ramp(13.4, 14, t));
  const stretch = ramp(14, 14.6, t) * (1 - ramp(17.4, 18, t));
  return {
    wave, point, stretch,
    mainEmotion: wave > .2 ? 'curious' : stretch > .2 ? 'happy' : point > .2 ? 'attentive' : 'focused',
    mainYaw: wave * -.32 + point * .24 + stretch * -.18,
    mainNod: point * Math.sin(time * 3) * .055,
    mainGaze: wave * -.12 + point * .10 - stretch * .06,
  };
}

export function drawRobotFace(ctx, time, emotion = 'focused', gaze = 0) {
  const { width, height } = ctx.canvas;
  ctx.save();
  ctx.setTransform(width / 512, 0, 0, height / 256, 0, 0);
  ctx.fillStyle = '#080b11'; ctx.fillRect(0, 0, 512, 256);
  // A quiet physical LED matrix; the expression itself remains crisp white.
  ctx.fillStyle = '#26313d';
  for (let y = 8; y < 256; y += 8) for (let x = 8; x < 512; x += 8) ctx.fillRect(x, y, 1.2, 1.2);
  const phase = time % 6.2;
  const blinking = phase > 5.78 && phase < 5.94 || phase > 6.06 && phase < 6.14;
  const eyelid = blinking ? .07 : 1;
  const eye = (x, side) => {
    ctx.save();
    ctx.translate(x + gaze * 95, 126);
    ctx.scale(1, eyelid);
    ctx.fillStyle = '#fffaf4';
    ctx.beginPath();
    if (emotion === 'happy') {
      ctx.moveTo(-45, 15); ctx.bezierCurveTo(-45, -40, 45, -40, 45, 15);
      ctx.quadraticCurveTo(0, 3, -45, 15);
    } else if (emotion === 'curious') {
      const h = side < 0 ? 34 : 46;
      ctx.ellipse(0, 0, 34, h, side * .08, 0, Math.PI * 2);
    } else if (emotion === 'sleepy') {
      ctx.moveTo(-40, -2); ctx.quadraticCurveTo(0, 12, 40, -2);
      ctx.lineTo(39, 8); ctx.quadraticCurveTo(0, 21, -39, 8);
    } else if (emotion === 'attentive') {
      ctx.ellipse(0, 0, 36, 34, 0, 0, Math.PI * 2);
    } else {
      ctx.moveTo(-40, -17); ctx.quadraticCurveTo(0, -24, 40, -17);
      ctx.lineTo(38, 18); ctx.quadraticCurveTo(0, 26, -38, 18);
    }
    ctx.closePath(); ctx.fill(); ctx.restore();
  };
  eye(169, -1); eye(343, 1);
  ctx.restore();
}
