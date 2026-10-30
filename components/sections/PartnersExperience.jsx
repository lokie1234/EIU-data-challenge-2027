'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { competition2026 as data } from '../../data/competition2026';
import { SourceCredit, Details } from './ContentMeta';
export default function PartnersExperience() {
  const [selected, setSelected] = useState(0);
  const item = data.collaborators[selected];
  return <div className="collaboration-experience"><p className="archive-warning">Names verified as 2026 reward providers, not a 2027 sponsor list. No third-party logos are reproduced.</p><div className="collaboration-map"><svg viewBox="0 0 700 300" aria-hidden="true">{['M350 150L130 85', 'M350 150L565 90', 'M350 150L350 255'].map((d, i) => <motion.path key={d} d={d} fill="none" stroke="currentColor" animate={{ pathLength: selected === i ? 1 : .8, opacity: selected === i ? 1 : .2 }} />)}</svg><div className="collaboration-center">EIU<span>2026 ARCHIVE</span></div>{data.collaborators.map((partner, i) => <button className={`collaborator collaborator-${i}`} key={partner.id} aria-pressed={selected === i} onClick={() => setSelected(i)} onFocus={() => setSelected(i)}><span>NODE 0{i + 1}</span><strong>{partner.heading}</strong></button>)}</div><AnimatePresence mode="wait"><motion.article className="collaboration-detail" key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}><h3>{item.heading}</h3><p>{item.summary}</p><Details item={item} /><SourceCredit item={item} /></motion.article></AnimatePresence></div>;
}
