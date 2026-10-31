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
import ParticleText from './animations/ParticleText';
const Scene = dynamic(() => import('./three/ThreeScene'), { ssr: false, loading: () => <SceneFallback loading /> });
export default function InteractiveHub() {
 const scope = useRef(null);
 const controller = useExperienceController();
 const reduced = useReducedMotion();
 const sceneModule = controller.active || controller.hovered;
 const portal = getPortal(sceneModule);
 return <MotionConfig reducedMotion="user"><LayoutGroup id="intelligence-lab"><div className={`lab-experience accent-${portal?.accent || 'violet'}`} ref={scope} data-module={sceneModule || 'idle'}>
   <EntranceSequence scope={scope} reduced={reduced} />
   <a href="#portals" className="skip-link">{c.labels.skip}</a>
   <div className="lab-atmosphere" aria-hidden="true"><div className="technical-grid" /><span className="lab-aura" /><span className="lab-scanline" /></div>
   <header className="floating-header" data-intro="header"><button className="lab-brand" onClick={controller.close} aria-label="Return to intelligence lab"><span className="lab-logo" aria-hidden="true"><i /><i /><i /></span><span>EIU DATA CHALLENGE<small>INTELLIGENCE LAB</small></span></button><MagneticButton className="header-cta" onClick={event => controller.open('register', event)}>Enter the portal <span>↗</span></MagneticButton></header>
   <main><section className="intelligence-stage" aria-labelledby="lab-title"><div className="lab-heading"><div className="technical-label" data-intro="eyebrow"><i /> FROM DATA TO INTELLIGENCE</div><h1 id="lab-title" aria-label="EIU Data Challenge 2027"><ParticleText text="EIU Data Challenge 2027" particleSize={2.2} density={4} color="currentColor" highlightColor="#ff5a36" highlightMode="motion" shape="circle" intro="gather" scatter={190} gatherDuration={1600} stagger={420} clickBurst burstStrength={1} pointerRepel={42} repelRadius={120} idleDrift={0.8} trigger="mount" fontSize="clamp(3.5rem, 13vw, 9rem)" fontWeight={800} fontFamily="inherit" glow /></h1></div>
     <div className="lab-orbit"><div className="lab-scene" data-intro="scene"><Scene active={sceneModule} variation={controller.variation} reduced={reduced} onInteract={() => controller.open(controller.hovered || 'about')} /></div>
     <IntelligentNavigation active={controller.active} hovered={controller.hovered} onOpen={controller.open} onHover={controller.setHovered} />
     </div>
   </section></main>
   <footer className="lab-footer"><span>THINK. ANALYZE. TRANSFORM.</span><a href="mailto:contact@eiudatachallenge.com">Contact the event ↗</a></footer>
   <ExperienceShell active={controller.active} onOpen={controller.open} onClose={controller.close} opener={controller.opener} onVariation={controller.setVariation} />
 </div></LayoutGroup></MotionConfig>;
}
