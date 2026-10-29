import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import HeroScene from './landing/HeroScene';

// Original EIU landing scene, isolated from the learning app's authentication.
function LandingScene() {
  const mouseRef = useRef({ x: 0, y: 0 });
  const [paused, setPaused] = useState(document.body.dataset.screen !== 'intro');
  const [hovered, setHovered] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const onScreen = () => setPaused(document.body.dataset.screen !== 'intro');
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    const cta = document.querySelector('.hero [data-explore]');
    const enter = () => setHovered(true);
    const leave = () => setHovered(false);
    document.addEventListener('challenge-screen-change', onScreen);
    window.addEventListener('pointermove', onPointer, { passive: true });
    cta?.addEventListener('pointerenter', enter);
    cta?.addEventListener('pointerleave', leave);
    cta?.addEventListener('focus', enter);
    cta?.addEventListener('blur', leave);
    return () => {
      document.removeEventListener('challenge-screen-change', onScreen);
      window.removeEventListener('pointermove', onPointer);
      cta?.removeEventListener('pointerenter', enter);
      cta?.removeEventListener('pointerleave', leave);
      cta?.removeEventListener('focus', enter);
      cta?.removeEventListener('blur', leave);
    };
  }, []);
  if (unavailable) return null;
  return <HeroScene mouseRef={mouseRef} stage={7} enter paused={paused}
    isCtaHovered={hovered} robotState={hovered ? 'lookingAtAccess' : 'idle'}
    onReady={() => document.body.classList.add('scene-ready')}
    onUnavailable={() => { document.body.classList.remove('scene-ready'); setUnavailable(true); }} />;
}

const container = document.getElementById('landing-scene');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let sceneRoot: ReturnType<typeof createRoot> | undefined;
function syncScene() {
  if (!container) return;
  if (reduced.matches) {
    sceneRoot?.unmount(); sceneRoot = undefined;
    document.body.classList.remove('scene-ready');
  } else if (!sceneRoot) {
    sceneRoot = createRoot(container);
    sceneRoot.render(<LandingScene />);
  }
}
reduced.addEventListener('change', syncScene);
syncScene();
