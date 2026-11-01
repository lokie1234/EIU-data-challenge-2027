'use client';
import { useCallback, useMemo, useRef, useState } from 'react';
import { LayoutGroup, MotionConfig } from 'motion/react';
import { eventContent as c, getPortal } from '../data/eventContent';
import useReducedMotion from '../hooks/useReducedMotion';
import useExperienceController from './experience/ExperienceController';
import IntelligentNavigation from './experience/IntelligentNavigation';
import ExperienceShell from './experience/ExperienceShell';
import EntranceSequence from './animation/EntranceSequence';
import RobotStudio from './three/RobotStudio';
import StrokeText from './animations/StrokeText';
import StudioLoading from './animations/StudioLoading';
import StudioGridBackdrop from './illustrations/StudioGridBackdrop';

export default function InteractiveHub() {
  const scope = useRef(null);
  const [studioReady, setStudioReady] = useState(false);
  const [colored, setColored] = useState(false);
  const handleStudioReady = useCallback(() => setStudioReady(true), []);
  const controller = useExperienceController();
  const reduced = useReducedMotion();
  const sceneModule = controller.active || controller.hovered;
  const moduleInteraction = useMemo(() => sceneModule ? { id: sceneModule, mode: controller.active ? 'active' : 'hover' } : null, [sceneModule, controller.active]);
  const portal = getPortal(sceneModule);
  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup id="intelligence-lab">
        <div className={`lab-experience accent-${portal?.accent || 'violet'}`} ref={scope} data-module={sceneModule || 'idle'} data-colorized={colored} onClickCapture={() => setColored(true)}>
          <StudioGridBackdrop ready={studioReady} />
          {!studioReady && <StudioLoading />}
          <EntranceSequence scope={scope} reduced={reduced} enabled={studioReady} />
          <a href="#portals" className="skip-link" tabIndex={studioReady ? 0 : -1}>{c.labels.skip}</a>
          <main inert={!studioReady || undefined} aria-hidden={!studioReady}>
            <section className="intelligence-stage" aria-labelledby="lab-title">
              <div className="lab-heading">
                <h1 id="lab-title" aria-label="EIU Data Challenge 2027">
                  <StrokeText
                    text="EIU Data Challenge 2027"
                    className="lab-title-stroke"
                    strokeColor="#56515b"
                    fillColor="#95b4df"
                    strokeWidth={1.5}
                    pencil
                    fontSize={144}
                    fontWeight={800}
                    fontFamily="var(--display)"
                    letterSpacing={-5}
                    drawDuration={1.3}
                    fillDelay={0.15}
                    stagger={0.025}
                    fillMode="wipe"
                  />
                </h1>
              </div>
              <div className="lab-orbit">
                <div className="lab-scene" data-intro="scene">
                  <RobotStudio reduced={reduced} colored={colored} onReady={handleStudioReady} moduleInteraction={moduleInteraction} />
                </div>
                <IntelligentNavigation
                  active={controller.active}
                  hovered={controller.hovered}
                  onOpen={controller.open}
                  onHover={controller.setHovered}
                />
              </div>
            </section>
          </main>
          {studioReady && <ExperienceShell
            active={controller.active}
            onOpen={controller.open}
            onClose={controller.close}
            opener={controller.opener}
            onVariation={controller.setVariation}
          />}
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}
