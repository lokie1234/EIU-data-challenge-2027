'use client';
import { motion } from 'motion/react';
import { portals } from '../../data/eventContent';
import Icon from '../ui/Icon';
export default function IntelligentNavigation({ active, hovered, onOpen, onHover }) {
  return <nav className="intelligent-navigation" id="portals" aria-label="AI command modules">
    <svg className="command-paths" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">{portals.map(portal => <motion.path key={portal.id} d={`M500 520Q${portal.x * 10} 520 ${portal.x * 10} ${portal.y * 10}`} fill="none" stroke="currentColor" className={`accent-${portal.accent}`} animate={{ pathLength: hovered === portal.id || active === portal.id ? 1 : .75, opacity: hovered === portal.id || active === portal.id ? .7 : .1 }} transition={{ duration: .35 }} />)}</svg>
    {portals.map(portal => <div key={portal.id} className={`command-position command-${portal.id} accent-${portal.accent}`} style={{ '--command-x': `${portal.x}%`, '--command-y': `${portal.y}%` }} data-intro="command">
      <motion.button className={`command-module shape-${portal.shape}`} aria-haspopup="dialog" aria-expanded={active === portal.id} onClick={event => onOpen(portal.id, event)} onPointerEnter={() => onHover(portal.id)} onPointerLeave={() => onHover(null)} onFocus={() => onHover(portal.id)} onBlur={() => onHover(null)} whileHover={{ y: -4 }} whileTap={{ scale: .95 }}>
        <motion.span layoutId={`portal-symbol-${portal.id}`} className="command-symbol"><Icon name={portal.icon} size={24} /><span className="command-scan" /></motion.span><span className="command-label"><strong>{portal.label}</strong></span><span className="command-arrow" aria-hidden="true">↗</span>
      </motion.button>
    </div>)}
  </nav>;
}
