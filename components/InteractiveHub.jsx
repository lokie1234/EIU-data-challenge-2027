'use client';
import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { LayoutGroup, MotionConfig } from 'motion/react';
import { eventContent as c, getPortal } from '../data/eventContent';
import useReducedMotion from '../hooks/useReducedMotion';
import useExperienceController from './experience/ExperienceController';
import IntelligentNavigation from './experience/IntelligentNavigation';
import ExperienceShell from './experience/ExperienceShell';
import MagneticButton from './animations/MagneticButton';
import EntranceSequence from './animation/EntranceSequence';
import SceneFallback from './three/SceneFallback';
import { SourceAudit } from './sections/ContentMeta';
const Scene = dynamic(() => import('./three/ThreeScene'), { ssr: false, loading: () => <SceneFallback loading /> });
export default function InteractiveHub() {
 const scope = useRef(null);
 const controller = useExperienceController();
 const reduced = useReducedMotion();
 const sceneModule = controller.active || controller.hovered;
 const portal = getPortal(sceneModule);
 const explore = () => { const button = document.querySelector('.command-module');button?.focus();button?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'nearest' }); };
 return <MotionConfig reducedMotion="user"><LayoutGroup id="intelligence-lab"><div className={`lab-experience accent-${portal?.accent || 'cyan'}`} ref={scope} data-module={sceneModule || 'idle'}>
   <EntranceSequence scope={scope} reduced={reduced} />
   <a href="#portals" className="skip-link">{c.labels.skip}</a>
   <div className="lab-atmosphere" aria-hidden="true"><div className="technical-grid" /><span className="lab-aura" /><span className="lab-scanline" /></div>
   <header className="floating-header" data-intro="header"><button className="lab-brand" onClick={controller.close} aria-label="Return to intelligence lab"><span className="lab-logo" aria-hidden="true"><i /><i /><i /></span><span>EIU DATA CHALLENGE<small>INTELLIGENCE LAB / 2027 CONCEPT</small></span></button><div className="header-system"><i /><span>HUMAN CURIOSITY. MACHINE PRECISION.</span></div><MagneticButton className="header-cta" onClick={event => controller.open('register', event)}>Enter the portal <span>↗</span></MagneticButton></header>
   <main><section className="intelligence-stage" aria-labelledby="lab-title"><div className="lab-heading"><div className="technical-label" data-intro="eyebrow"><i /> FROM DATA TO INTELLIGENCE</div><h1 id="lab-title"><span className="text-mask"><span data-intro="headline">DATA IS <em>EVERYWHERE.</em></span></span><span className="text-mask"><span data-intro="headline"><em>INTELLIGENCE</em> CHANGES EVERYTHING.</span></span></h1></div>
     <div className="lab-scene" data-intro="scene"><Scene active={sceneModule} variation={controller.variation} reduced={reduced} onInteract={() => controller.open(controller.hovered || 'about')} /></div>
     <div className="lab-side-note" data-intro="copy"><span className="technical-label">THINK. ANALYZE. TRANSFORM.</span><p>Human ideas.<br />Connected intelligence.<br />Real business possibilities.</p></div>
     <div className="robot-system-status" aria-live="polite"><span /><span>{portal ? `MODULE ${portal.number} / ${portal.label.toUpperCase()}` : 'SYSTEM READY / AWAITING CURIOSITY'}</span></div>
     <IntelligentNavigation active={controller.active} hovered={controller.hovered} onOpen={controller.open} onHover={controller.setHovered} />
     <div className="lab-instructions" data-intro="copy"><span>MOVE TO CONNECT</span><span>HOVER TO DISCOVER</span><span>SELECT TO TRANSFORM</span></div>
   </section><div className="discovery-ribbon"><span className="technical-label">AN INTERACTIVE ROBOTICS + BUSINESS ANALYTICS EXPERIENCE</span><button onClick={explore}>Explore the command system <span>↓</span></button><span>DEMO ANALYTICS / NOT LIVE EVENT DATA</span></div></main>
   <footer className="lab-footer"><span>2027 DESIGN CONCEPT <i>×</i> VERIFIED 2026 ARCHIVE</span><a href="mailto:contact@eiudatachallenge.com">Contact the event ↗</a><SourceAudit /></footer>
   <ExperienceShell active={controller.active} onOpen={controller.open} onClose={controller.close} opener={controller.opener} onVariation={controller.setVariation} />
 </div></LayoutGroup></MotionConfig>;
}
