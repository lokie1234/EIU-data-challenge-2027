'use client';
import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import useReducedMotion from '../../hooks/useReducedMotion';
// Local, bounded adaptation of the React Bits magnetic-interaction pattern.
export default function MagneticButton({ children, className = '', ...props }) {
  const bounds = useRef(null);
  const reduced = useReducedMotion();
  const targetX = useMotionValue(0), targetY = useMotionValue(0);
  const x = useSpring(targetX, { stiffness: 260, damping: 20 }), y = useSpring(targetY, { stiffness: 260, damping: 20 });
  return <span className="magnetic-wrap" onPointerEnter={event => { bounds.current = event.currentTarget.getBoundingClientRect(); }} onPointerMove={event => {
    if (reduced || event.pointerType === 'touch' || !bounds.current) return;
    targetX.set((event.clientX - bounds.current.left - bounds.current.width / 2) * .12);
    targetY.set((event.clientY - bounds.current.top - bounds.current.height / 2) * .15);
  }} onPointerLeave={() => { targetX.set(0); targetY.set(0); }}><motion.button className={`magnetic-button ${className}`} style={{ x, y }} whileTap={{ scale: .97 }} {...props}>{children}</motion.button></span>;
}
