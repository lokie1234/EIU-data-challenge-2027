'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { competition2026 as data } from '../../data/competition2026';
import { SourceCredit } from './ContentMeta';
export default function AboutExperience() {
  const [selected, setSelected] = useState(0);
  const ideas = ['Human curiosity', 'Data interpretation', 'Business decisions'];
  return <div className="manifesto-experience">
    <div className="manifesto-statement">{['Intelligence', 'begins with', 'a better question.'].map((line, i) => <span className="text-mask" key={line}><motion.span initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ delay: i * .08, duration: .5 }}>{line}</motion.span></span>)}<p>{data.overview.summary}</p><p>{data.overview.details[0]}</p></div>
    <div className="manifesto-neural"><svg viewBox="0 0 400 280" aria-hidden="true"><motion.path d="M70 60L200 145L330 65M70 225L200 145L330 230" fill="none" stroke="currentColor" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .9 }} /></svg><div className="neural-center">AI<span>× HUMAN</span></div>{ideas.map((idea, i) => <button key={idea} className={`idea-node idea-${i}`} aria-pressed={selected === i} onClick={() => setSelected(i)}><span>0{i + 1}</span>{idea}</button>)}<motion.p key={selected} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>{['Every major brings a useful way of seeing.', 'No-code reasoning turns observations into insight.', 'The goal: practical recommendations that people can use.'][selected]}</motion.p></div>
    <SourceCredit item={data.overview} />
  </div>;
}
