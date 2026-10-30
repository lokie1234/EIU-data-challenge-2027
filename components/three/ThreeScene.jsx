'use client';
import { Component, Suspense, useEffect, useState, useSyncExternalStore } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import { eventContent as c } from '../../data/eventContent';
import RoboticMascot from './RoboticMascot';
import { NeuralNetwork, DataFlowSystem, HolographicRewards } from './AIEnvironment';
import SceneChoreography from './SceneChoreography';
import SceneEffects from './SceneEffects';
import SceneFallback from './SceneFallback';
import Icon from '../ui/Icon';
class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <SceneFallback /> : this.props.children; }
}
const subscribeCompact = callback => {
 const media = window.matchMedia('(max-width: 900px)');media.addEventListener('change', callback);
 return () => media.removeEventListener('change', callback);
};
export default function ThreeScene({ active, reduced, variation = 0, onInteract }) {
  const [paused, setPaused] = useState(false), [visible, setVisible] = useState(true), [reset, setReset] = useState(0), [dpr, setDpr] = useState(1.4);
  const compact = useSyncExternalStore(subscribeCompact, () => window.matchMedia('(max-width: 900px)').matches, () => true);
  useEffect(() => { const sync = () => setVisible(!document.hidden);document.addEventListener('visibilitychange', sync);return () => document.removeEventListener('visibilitychange', sync); }, []);
  const running = visible && !paused && !reduced;
  return <div className="three-scene"><div className="canvas-wrapper" role="img" aria-label="Friendly ceramic robot with expressive LED eyes, intelligence core and connected demonstration-data nodes">
    {reduced ? <SceneFallback /> : <SceneBoundary><Canvas fallback={<SceneFallback />} camera={{ position: [0, .15, 5.9], fov: 43 }} dpr={[.8, compact ? 1 : dpr]} frameloop={running ? 'always' : 'demand'} gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}>
      <ambientLight intensity={.75} /><directionalLight position={[3, 5, 6]} intensity={3} color="#F5F8FF" /><pointLight position={[-3, 0, 2]} intensity={7} color="#60EFFF" />
      <PerformanceMonitor onDecline={() => setDpr(.9)} flipflops={1} onFallback={() => setDpr(.9)} />
      <Suspense fallback={null}>
        <Environment resolution={128} frames={1}><Lightformer intensity={3} position={[0, 4, 4]} scale={[5, 3, 1]} /><Lightformer intensity={3} color="#C5B4FF" position={[-4, 1, 2]} rotation={[0, Math.PI / 3, 0]} scale={[2, 6, 1]} /><Lightformer intensity={3} color="#A3F5FF" position={[4, 0, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[2, 5, 1]} /></Environment>
        <RoboticMascot active={active} running={running} resetToken={reset} onInteract={onInteract} />
        <NeuralNetwork active={active} running={running} compact={compact} /><DataFlowSystem active={active} variation={variation} running={running} />
        <HolographicRewards active={active} variation={variation} running={running} /><gridHelper args={[12, 24, "#243F56", "#152838"]} position={[0, -1.7, -1.2]} visible={["format", "timeline"].includes(active)} material-transparent material-opacity={.14} /><SceneChoreography active={active} resetToken={reset} /><SceneEffects enabled={!compact && dpr > 1} />
      </Suspense>
    </Canvas></SceneBoundary>}
  </div><div className="scene-tools">{!reduced && <><button className="icon-button" onClick={() => setPaused(!paused)} aria-label={paused ? c.labels.motionOff : c.labels.motionOn} aria-pressed={paused}><Icon name={paused ? 'Play' : 'Pause'} size={15} /></button><button className="icon-button" onClick={() => setReset(value => value + 1)} aria-label={c.labels.reset}><Icon name="RotateCcw" size={15} /></button></>}{reduced && <span className="technical-label">STATIC ROBOT / REDUCED MOTION</span>}</div></div>;
}
