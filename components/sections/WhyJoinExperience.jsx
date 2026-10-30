'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { competition2026 as data } from '../../data/competition2026';
import { SourceCredit } from './ContentMeta';
export default function WhyJoinExperience() {
  const [selected, setSelected] = useState(0);
  const item = data.benefits[selected];
  return <div className="skills-experience"><div className="skill-constellation"><svg viewBox="0 0 700 360" preserveAspectRatio="none" aria-hidden="true">{data.benefits.map((_, i) => { const angle = i / 7 * Math.PI * 2 - Math.PI / 2;return <motion.path key={i} d={`M350 180L${350 + Math.cos(angle) * 265} ${180 + Math.sin(angle) * 125}`} stroke="currentColor" fill="none" animate={{ opacity: selected === i ? 1 : .16, pathLength: selected === i ? 1 : .7 }} />;})}</svg><div className="skill-core"><span>HUMAN</span><b>+</b><span>MACHINE</span></div>{data.benefits.map((benefit, i) => <motion.button key={benefit.id} className={`skill-node skill-node-${i}`} aria-pressed={selected === i} onClick={() => setSelected(i)} onFocus={() => setSelected(i)} onPointerEnter={event => { if (event.pointerType !== 'touch') setSelected(i); }} whileHover={{ scale: 1.04 }}><span>0{i + 1}</span>{benefit.heading}</motion.button>)}</div><AnimatePresence mode="wait"><motion.article className="skill-detail" key={item.id} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}><span className="technical-label">SKILL MODULE / 0{selected + 1}</span><h3>{item.heading}</h3><p>{item.summary}</p><SourceCredit item={item} /></motion.article></AnimatePresence></div>;
}
