'use client';
import { motion } from 'motion/react';
export default function RoboticTransition({ id, reduced }) {
  if (reduced) return null;
  return <motion.div key={id} className="robotic-transition" aria-hidden="true" initial={{ clipPath: 'inset(0 100% 0 0)', opacity: .8 }} animate={{ clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)', 'inset(0 0% 0 100%)'], opacity: [0, .45, 0] }} transition={{ duration: .65, times: [0, .4, 1] }}><span /><i /><b>RECONFIGURING INTELLIGENCE / {id.toUpperCase()}</b></motion.div>;
}
