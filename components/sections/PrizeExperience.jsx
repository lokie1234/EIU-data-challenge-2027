'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { competition2026 as data } from '../../data/competition2026';
import { Details, SourceCredit } from './ContentMeta';
export default function PrizeExperience({ onVariation }) {
  const [selected, setSelected] = useState(null);
  const [reveal, setReveal] = useState(0);
  const item = selected === null ? null : data.prizes[selected];
  return <div className="vault-experience"><p className="archive-warning">2026 REWARD ARCHIVE · No 2027 prize values announced.</p><div className="reward-podiums">{data.prizes.map((prize, i) => <motion.button key={prize.id} className={`reward-podium podium-${i}`} aria-pressed={selected === i} onClick={() => { setSelected(i); setReveal(value => value + 1); onVariation?.(i); }} whileHover={{ y: -7, rotateY: i === 1 ? 5 : -5 }} whileTap={{ scale: .98 }}><span className="vault-rank">0{i + 1}</span><span className="holographic-trophy" aria-hidden="true"><i /><b /><em /></span><strong>{prize.heading}</strong><span className="prize-amount">{prize.shortAmount}<small>VND</small></span><span className="vault-reveal-label">{selected === i ? 'VAULT UNLOCKED' : 'REVEAL REWARD ↗'}</span></motion.button>)}</div><AnimatePresence>{item && <motion.div className="vault-result" key={`${item.id}-${reveal}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}><div className="reward-burst" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <motion.i key={i} initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: Math.cos(i / 10 * Math.PI * 2) * 110, y: Math.sin(i / 10 * Math.PI * 2) * 55, opacity: 0 }} transition={{ duration: .65 }} />)}</div><b>{item.amount} VND · {item.heading}</b><p>{item.details[0]}</p><SourceCredit item={item} /></motion.div>}</AnimatePresence><div className="recognition-list">{data.recognition.map(award => <article key={award.id}><h3>{award.heading}</h3><p>{award.summary}</p><Details item={award} label="Award conditions & allocation notes" /><SourceCredit item={award} /></article>)}</div></div>;
}
