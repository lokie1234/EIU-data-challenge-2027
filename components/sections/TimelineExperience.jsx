'use client';
import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { competition2026 as data } from '../../data/competition2026';
import useReducedMotion from '../../hooks/useReducedMotion';
import { Details, SourceCredit } from './ContentMeta';
export default function TimelineExperience({ onVariation }) {
  const [selected, setSelected] = useState(0);
  const refs = useRef([]);
  const reduced = useReducedMotion();
  const choose = next => { setSelected(next); onVariation?.(next); refs.current[next]?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'nearest', inline: 'center' }); };
  const item = data.milestones[selected];
  return <div className="time-experience"><div className="time-coordinate"><b>2026</b><span>HISTORICAL COORDINATES<br />Not the 2027 schedule</span><span className="scanner-indicator">SCANNING / {item.order}</span></div><div className="time-track" role="tablist" aria-label="Historical milestones">{data.milestones.map((milestone, i) => <button key={milestone.id} ref={node => { refs.current[i] = node; }} role="tab" id={`milestone-${i}`} aria-selected={selected === i} aria-controls="milestone-details" tabIndex={selected === i ? 0 : -1} onClick={() => choose(i)} onKeyDown={event => {
    const next = ['ArrowRight', 'ArrowDown'].includes(event.key) ? (i + 1) % data.milestones.length : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? (i + data.milestones.length - 1) % data.milestones.length : event.key === 'Home' ? 0 : event.key === 'End' ? data.milestones.length - 1 : null;
    if (next !== null) { event.preventDefault(); choose(next); refs.current[next]?.focus({ preventScroll: true }); }
  }}><span className="milestone-date">{milestone.date}</span><span className="time-node">{selected === i && <motion.i layoutId="timeline-scanner" transition={{ type: 'spring', stiffness: 220, damping: 25 }} />}{milestone.order}</span><strong>{milestone.heading}</strong></button>)}</div><div id="milestone-details" role="tabpanel" aria-labelledby={`milestone-${selected}`} tabIndex={0}><AnimatePresence mode="wait"><motion.article key={item.id} className="time-detail" initial={{ opacity: 0, y: 18, filter: 'blur(3px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -10 }}><span>{item.date} / 2026</span><h3>{item.heading}</h3><p>{item.summary}</p><Details item={item} label="Dates, updates & source caveats" /><SourceCredit item={item} /></motion.article></AnimatePresence></div><div className="local-controls"><button disabled={!selected} onClick={() => choose(selected - 1)}>← Earlier</button><span>{selected + 1} / {data.milestones.length}</span><button disabled={selected === data.milestones.length - 1} onClick={() => choose(selected + 1)}>Later →</button></div></div>;
}
