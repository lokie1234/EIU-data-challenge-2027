'use client';
import { useGSAP } from '@gsap/react';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
gsap.registerPlugin(useGSAP);
const views = { about: [-.3, .25, 6], 'why-join': [.45, .3, 6.5], format: [-.5, .2, 6.6], timeline: [.6, .15, 6.7], prizes: [-.35, .35, 6.1], faq: [.25, .15, 5.8], partners: [.45, .4, 6.6], register: [0, .1, 5.6] };
export default function SceneChoreography({ active, resetToken }) {
  const { camera, invalidate } = useThree();
  useGSAP(() => {
    const [x, y, z] = views[active] || [0, .65, 5.9];
    gsap.to(camera.position, { x, y, z, duration: .85, ease: 'power3.inOut', onUpdate: invalidate });
    return () => gsap.killTweensOf(camera.position);
  }, { dependencies: [active, resetToken], revertOnUpdate: true });
  useFrame(() => camera.lookAt(0, 0, 0));
  return null;
}
