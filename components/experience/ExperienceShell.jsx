'use client';
import { useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { portals, getPortal, eventContent as c } from '../../data/eventContent';
import { historicalNotice, previewNotice } from '../../data/contentSources';
import useReducedMotion from '../../hooks/useReducedMotion';
import Icon from '../ui/Icon';
import RoboticTransition from './RoboticTransition';
import AboutExperience from '../sections/AboutExperience';
import WhyJoinExperience from '../sections/WhyJoinExperience';
import ChallengeExperience from '../sections/ChallengeExperience';
import TimelineExperience from '../sections/TimelineExperience';
import PrizeExperience from '../sections/PrizeExperience';
import FAQExperience from '../sections/FAQExperience';
import PartnersExperience from '../sections/PartnersExperience';
import RegisterExperience from '../sections/RegisterExperience';
const experiences = { about: AboutExperience, 'why-join': WhyJoinExperience, format: ChallengeExperience, timeline: TimelineExperience, prizes: PrizeExperience, faq: FAQExperience, partners: PartnersExperience, register: RegisterExperience };
export default function ExperienceShell({ active, onOpen, onClose, opener, onVariation }) {
  const reduced = useReducedMotion();
  const scroll = useRef(null);
  const portal = getPortal(active);
  const index = portals.findIndex(item => item.id === active);
  const Body = experiences[active];
  const select = (id, event) => { onOpen(id, event); scroll.current?.scrollTo({ top: 0, behavior: 'instant' }); };
  return <Dialog.Root open={Boolean(portal)} onOpenChange={open => { if (!open) onClose(); }}><AnimatePresence>{portal && <Dialog.Portal forceMount>
    <Dialog.Overlay forceMount asChild><motion.div className="lab-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .2 }} /></Dialog.Overlay>
    <div className="experience-positioner"><Dialog.Content forceMount asChild onCloseAutoFocus={event => { event.preventDefault(); (opener.current || document.querySelector('.command-module'))?.focus({ preventScroll: true }); }}>
      <motion.article layout className={`experience-window experience-${active} accent-${portal.accent}`} initial={reduced ? { opacity: 0 } : { opacity: 0, scale: .92, y: 35, rotateX: 4 }} animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }} exit={{ opacity: 0, scale: reduced ? 1 : .97, y: reduced ? 0 : 20 }} transition={{ type: 'spring', stiffness: 230, damping: 28 }}>
        <div className="experience-topline"><span><i />{active === 'register' ? previewNotice : historicalNotice}</span><Dialog.Close className="icon-button" aria-label={c.labels.close}><Icon name="X" size={20} /></Dialog.Close></div>
        <nav className="experience-module-switcher" aria-label="Switch intelligence module">{portals.map(p => <button key={p.id} title={p.label} aria-label={`${p.number}. ${p.label}`} aria-current={p.id === active ? 'true' : undefined} onClick={event => select(p.id, event)}><Icon name={p.icon} size={16} /><span>{p.label}</span></button>)}</nav>
        <div className="experience-scroll" ref={scroll}><RoboticTransition id={active} reduced={reduced} /><AnimatePresence mode={reduced ? "sync" : "popLayout"} initial={false}><motion.div key={active} initial={{ opacity: 0, x: reduced ? 0 : 25, clipPath: 'inset(0 0 0 0)' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduced ? 0 : -20, clipPath: reduced ? 'inset(0 0 0 0)' : 'inset(0 0 0 100%)' }} transition={{ duration: reduced ? 0 : .22 }}>
          <header className="experience-heading"><motion.span className="experience-symbol" layoutId={`portal-symbol-${active}`}><Icon name={portal.icon} size={28} /></motion.span><div><span className="technical-label">MODULE {portal.number} / {portal.label}</span><Dialog.Title>{portal.title}</Dialog.Title><Dialog.Description>{portal.teaser}</Dialog.Description></div></header>
          <Body onOpen={select} onVariation={onVariation} />
        </motion.div></AnimatePresence></div>
        <footer className="section-controls"><button onClick={event => select(portals[(index + 7) % 8].id, event)}><Icon name="ArrowLeft" size={17} /><span>Previous</span></button><span>{portal.number} / 08 <b>{portal.label}</b></span><button onClick={event => select(portals[(index + 1) % 8].id, event)}><span>Next module</span><Icon name="ArrowRight" size={17} /></button></footer>
      </motion.article>
    </Dialog.Content></div>
  </Dialog.Portal>}</AnimatePresence></Dialog.Root>;
}
