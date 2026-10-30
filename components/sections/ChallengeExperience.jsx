'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { competition2026 as data } from '../../data/competition2026';
import Icon from '../ui/Icon';
import { SourceCredit } from './ContentMeta';
export default function ChallengeExperience({ onVariation }) {
  const [level, setLevel] = useState(0);
  const choose = next => { setLevel(next); onVariation?.(next); };
  const item = data.rounds[level];
  return <div className="challenge-experience"><div className="transformation-pipeline" aria-label="Business analytics pipeline">{['Raw data', 'Exploration', 'Analysis', 'Insights', 'Decisions'].map((step, i) => <span key={step} data-active={i <= level * 2}><i />{step}{i < 4 && <b>→</b>}</span>)}</div><div className="level-selector" role="tablist" aria-label="2026 competition rounds">{data.rounds.map((round, i) => <button key={round.id} role="tab" id={`level-${i}`} aria-controls="level-content" aria-selected={i === level} tabIndex={i === level ? 0 : -1} onClick={() => choose(i)} onKeyDown={event => {
    const next = event.key === 'ArrowRight' ? (i + 1) % 3 : event.key === 'ArrowLeft' ? (i + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : null;
    if (next !== null) { event.preventDefault(); choose(next); document.getElementById(`level-${next}`)?.focus(); }
  }}><span className="level-symbol"><Icon name={round.symbol} size={30} /></span><small>LEVEL 0{i + 1}</small><strong>{round.heading}</strong><i className="level-connector" /></button>)}</div><div id="level-content" role="tabpanel" aria-labelledby={`level-${level}`} tabIndex={0}><AnimatePresence mode="wait"><motion.article key={item.id} className="level-detail" initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }} animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }} exit={{ opacity: 0, x: -20 }}><div><span className="technical-label">ANALYSIS PHASE / 0{level + 1}</span><h3>{item.heading}</h3><p>{item.summary}</p><div className="round-stats">{item.stats.map(stat => <span key={stat}>{stat}</span>)}</div></div><ul>{item.details.map(detail => <li key={detail}>{detail}</li>)}</ul><SourceCredit item={item} />{item.secondarySourceUrl && <a className="inline-source" href={item.secondarySourceUrl} target="_blank" rel="noreferrer">Qualification and judging criteria source ↗</a>}</motion.article></AnimatePresence></div><div className="local-controls"><button disabled={level === 0} onClick={() => choose(level - 1)}>← Previous level</button><span>0{level + 1} / 03</span><button disabled={level === 2} onClick={() => choose(level + 1)}>Next level →</button></div></div>;
}
