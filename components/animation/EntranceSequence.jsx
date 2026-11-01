'use client';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { eventContent as c } from '../../data/eventContent';
gsap.registerPlugin(useGSAP);
export default function EntranceSequence({ scope, reduced, enabled = true }) {
  useGSAP(() => {
    if (reduced || !enabled) return;
    const q = gsap.utils.selector(scope);
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: c.motion.cinematic } });
    tl.from(q('[data-intro="scene"]'), { opacity: 0, duration: .7 }, 0);
  }, { scope, dependencies: [reduced, enabled], revertOnUpdate: true });
  return null;
}
