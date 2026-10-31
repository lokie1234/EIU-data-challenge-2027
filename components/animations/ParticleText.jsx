'use client';
import { useEffect, useRef } from 'react';
import useReducedMotion from '../../hooks/useReducedMotion';

export default function ParticleText({
  text, particleSize = 2.2, density = 4, color = 'currentColor', highlightColor = '#ff5a36',
  highlightMode = 'motion', shape = 'circle', intro = 'gather', scatter = 190,
  gatherDuration = 1600, stagger = 420, clickBurst = false, burstStrength = 1,
  pointerRepel = 42, repelRadius = 120, idleDrift = .8, trigger = 'mount',
  fontSize = 'clamp(3.5rem, 13vw, 9rem)', fontWeight = 800, fontFamily = 'inherit', glow = false,
}) {
  const hostRef = useRef(null), canvasRef = useRef(null), textRef = useRef(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const host = hostRef.current, canvas = canvasRef.current, label = textRef.current;
    let frame = 0, disposed = false, points = [], ctx, width = 0, height = 0, start = 0, last = 0, elapsed = 0;
    let visible = true, initialized = false;
    const pointer = { x: -10000, y: -10000 };
    const hash = n => { const value = Math.sin(n * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value); };
    const canRun = () => !disposed && !reduced && visible && !document.hidden && points.length > 0;
    const draw = now => {
      frame = 0;
      if (!canRun()) { last = 0; return; }
      if (last && now - last < 1000 / 30) { frame = requestAnimationFrame(draw); return; }
      const dt = last ? Math.min((now - last) / 1000, .05) : 1 / 30;
      last = now; elapsed += dt * 1000;
      ctx.clearRect(0, 0, width, height);
      const time = elapsed / 1000;
      for (let i = 0; i < points.length; i++) {
        const p = points[i], beforeX = p.x, beforeY = p.y;
        const progress = Math.min(1, Math.max(0, (elapsed - start - p.delay) / Math.max(1, gatherDuration)));
        const ease = 1 - (1 - progress) ** 3;
        const drift = progress === 1 ? idleDrift : 0;
        let tx = p.tx + Math.sin(time * .8 + p.phase) * drift;
        let ty = p.ty + Math.cos(time * .7 + p.phase) * drift;
        if (intro === 'gather' && progress < 1) {
          tx = p.sx + (p.tx - p.sx) * ease; ty = p.sy + (p.ty - p.sy) * ease;
        }
        const dx = tx - pointer.x, dy = ty - pointer.y, distance = Math.hypot(dx, dy);
        if (distance < repelRadius && distance > .01) {
          const force = (1 - distance / repelRadius) ** 2 * pointerRepel;
          tx += dx / distance * force; ty += dy / distance * force;
        }
        p.vx *= Math.exp(-dt * 7); p.vy *= Math.exp(-dt * 7);
        const follow = 1 - Math.exp(-dt * 14);
        p.x += (tx - p.x) * follow + p.vx * dt;
        p.y += (ty - p.y) * follow + p.vy * dt;
        const moving = Math.hypot(p.x - beforeX, p.y - beforeY) > .45;
        ctx.fillStyle = highlightMode === 'motion' && moving ? highlightColor : p.color;
        if (shape === 'circle') { ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill(); }
        else ctx.fillRect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
      }
      frame = requestAnimationFrame(draw);
    };
    const resume = () => { if (canRun() && !frame) { last = 0; frame = requestAnimationFrame(draw); } };
    const resize = () => {
      if (disposed) return;
      const rect = host.getBoundingClientRect();
      width = Math.floor(rect.width); height = Math.floor(rect.height);
      if (!width || !height) return;
      host.dataset.ready = 'false';
      label.style.fontSize = fontSize;
      const style = getComputedStyle(label), baseSize = parseFloat(style.fontSize);
      const naturalWidth = label.getBoundingClientRect().width;
      let size = Math.min(baseSize, baseSize * (width - 20) / Math.max(1, naturalWidth), height * .62);
      label.style.fontSize = `${size}px`;
      if (reduced) return;
      ctx = canvas.getContext('2d');
      if (!ctx) return;
      const sample = document.createElement('canvas');
      sample.width = width; sample.height = height;
      const mask = sample.getContext('2d', { willReadFrequently: true });
      if (!mask) return;
      const family = style.fontFamily;
      mask.font = `${fontWeight} ${size}px ${family}`;
      const measured = mask.measureText(text).width;
      if (measured > width - 20) size *= (width - 20) / measured;
      label.style.fontSize = `${size}px`;
      mask.font = `${fontWeight} ${size}px ${family}`;
      mask.textAlign = 'center'; mask.textBaseline = 'middle'; mask.fillStyle = '#fff';
      mask.fillText(text, width / 2, height / 2);
      const pixels = mask.getImageData(0, 0, width, height).data;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const fill = color === 'currentColor' ? getComputedStyle(host).color : color;
      // Cap work independently of screen size while retaining a dense text silhouette.
      const step = Math.max(1.5, Math.min(density, size / 18), Math.sqrt(width * height / 18000));
      points = [];
      for (let y = 0; y < height; y += step) for (let x = 0; x < width; x += step) {
        if (pixels[(Math.floor(y) * width + Math.floor(x)) * 4 + 3] < 128) continue;
        const i = points.length, angle = hash(i + 1) * Math.PI * 2, radius = hash(i + 77) * scatter;
        const sx = x + Math.cos(angle) * radius, sy = y + Math.sin(angle) * radius;
        const gather = !initialized && intro === 'gather';
        points.push({ tx: x, ty: y, sx: gather ? sx : x, sy: gather ? sy : y, x: gather ? sx : x, y: gather ? sy : y, vx: 0, vy: 0, delay: gather ? hash(i + 21) * stagger : -gatherDuration, phase: hash(i + 3) * Math.PI * 2, radius: Math.max(.6, Math.min(particleSize / 2, step * .43)), color: fill });
      }
      start = elapsed; initialized = true;
      host.dataset.ready = points.length ? 'true' : 'false';
      resume();
    };
    const move = event => {
      const rect = host.getBoundingClientRect();
      pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top;
    };
    const leave = () => { pointer.x = -10000; pointer.y = -10000; };
    const burst = event => {
      if (!clickBurst || reduced) return;
      move(event);
      points.forEach((p, i) => {
        const dx = p.x - pointer.x, dy = p.y - pointer.y, distance = Math.hypot(dx, dy);
        const angle = distance > 1 ? Math.atan2(dy, dx) : hash(i) * Math.PI * 2;
        const force = Math.max(35, 210 - distance * .25) * burstStrength;
        p.vx += Math.cos(angle) * force; p.vy += Math.sin(angle) * force;
      });
      if (event.pointerType === 'touch') leave();
      resume();
    };
    const visibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; last = 0; }
      else resume();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    const intersection = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (!visible) { cancelAnimationFrame(frame); frame = 0; last = 0; }
      else resume();
    }) : null;
    intersection?.observe(host);
    host.addEventListener('pointermove', move);
    host.addEventListener('pointerleave', leave);
    host.addEventListener('pointerdown', burst);
    document.addEventListener('visibilitychange', visibility);
    resize();
    document.fonts?.ready.then(() => { if (!disposed) resize(); });
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); intersection?.disconnect();
      host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', leave); host.removeEventListener('pointerdown', burst);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [text, particleSize, density, color, highlightColor, highlightMode, shape, intro, scatter, gatherDuration, stagger, clickBurst, burstStrength, pointerRepel, repelRadius, idleDrift, trigger, fontSize, fontWeight, fontFamily, glow, reduced]);
  return <span className="particle-text" ref={hostRef}>
    <span className="particle-text-fallback" ref={textRef} style={{ fontSize: `min(${fontSize}, 6vw)`, fontWeight, fontFamily }}>{text}</span>
    <canvas ref={canvasRef} aria-hidden="true" style={{ filter: glow ? 'drop-shadow(0 0 2px currentColor)' : 'none' }} />
  </span>;
}
