import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import HeroScene from './landing/HeroScene';

// EIU data lab, isolated from the learning app's authentication.
function LandingScene() {
  const mouseRef = useRef({ x: 0, y: 0 });
  const [paused, setPaused] = useState(document.body.dataset.screen !== 'intro');
  const [hovered, setHovered] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => setReducedMotion(preference.matches);
    preference.addEventListener('change', onMotion);
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
      preference.removeEventListener('change', onMotion);
      document.removeEventListener('challenge-screen-change', onScreen);
      window.removeEventListener('pointermove', onPointer);
      cta?.removeEventListener('pointerenter', enter);
      cta?.removeEventListener('pointerleave', leave);
      cta?.removeEventListener('focus', enter);
      cta?.removeEventListener('blur', leave);
    };
  }, []);
  if (unavailable) return null;
  return <HeroScene mouseRef={mouseRef} stage={7} enter paused={paused || reducedMotion}
    isCtaHovered={hovered} robotState={hovered ? 'lookingAtAccess' : 'idle'}
    onReady={() => document.body.classList.add('scene-ready')}
    onUnavailable={() => { document.body.classList.remove('scene-ready'); setUnavailable(true); }} />;
}

const container = document.getElementById('landing-scene');
if (container) {
  createRoot(container).render(<LandingScene />);
}
