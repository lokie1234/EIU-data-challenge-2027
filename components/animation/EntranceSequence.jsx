'use client';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { eventContent as c } from '../../data/eventContent';
gsap.registerPlugin(useGSAP);
export default function EntranceSequence({ scope, reduced }) {
  useGSAP(() => {
    if (reduced) return;
    const q = gsap.utils.selector(scope);
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: c.motion.cinematic } });
    tl.from(q('[data-intro="header"]'), { opacity: 0, y: -12 }, 0)
      .from(q('[data-intro="eyebrow"]'), { opacity: 0, y: 10 }, .1)
      .from(q('[data-intro="headline"]'), { yPercent: 110, stagger: .085, duration: .95 }, .12)
      .from(q('[data-intro="scene"]'), { opacity: 0, scale: .94, duration: 1.2 }, .2)
      .from(q('[data-intro="copy"]'), { opacity: 0, y: 12, stagger: .09 }, .42)
      .from(q('[data-intro="command"]'), { opacity: 0, y: 15, stagger: .045 }, .55)
      ;
  }, { scope, dependencies: [reduced], revertOnUpdate: true });
  return null;
}
