'use client';
import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eventContent as c, getPortal } from '../../data/eventContent';

export function NeuralNetwork({ active, running, compact }) {
  const root = useRef(null), material = useRef(null), nodes = useRef(null), pulses = useRef([]);
  const tint = useMemo(() => new THREE.Color(), []);
  const positions = useMemo(() => Array.from({ length: compact ? 12 : 20 }, (_, i) => {
    const angle = i * Math.PI * 2 / (compact ? 12 : 20);
    return new THREE.Vector3(Math.cos(angle) * 2.05, Math.sin(angle) * 1.3, Math.sin(angle * 3) * .55 - .5);
  }), [compact]);
  const segments = useMemo(() => positions.flatMap((p, i) => [...p.toArray(), ...positions[(i + 3) % positions.length].toArray()]), [positions]);
  useFrame(({ clock }, delta) => {
    if (!running) return;
    const t = clock.getElapsedTime(), dt = Math.min(delta, .05);
    const emphasis = ['about', 'why-join', 'partners'].includes(active);
    root.current.rotation.y = Math.sin(t * .08) * .13;
    material.current.opacity = THREE.MathUtils.damp(material.current.opacity, emphasis ? .38 : .12, 3, dt);
    material.current.color.lerp(tint.set(c.theme[getPortal(active)?.accent || 'cyan']), 1 - Math.exp(-dt * 3));
    nodes.current.color.copy(material.current.color);
    pulses.current.forEach((pulse, i) => { if (pulse) pulse.position.lerpVectors(positions[i * 4], positions[(i * 4 + 3) % positions.length], (t * .16 + i * .2) % 1); });
  });
  return <group ref={root} name="neural-network"><lineSegments><bufferGeometry><bufferAttribute attach="attributes-position" args={[new Float32Array(segments), 3]} /></bufferGeometry><lineBasicMaterial ref={material} color="#60EFFF" transparent opacity={.12} depthWrite={false} /></lineSegments><points><bufferGeometry><bufferAttribute attach="attributes-position" args={[new Float32Array(positions.flatMap(p => p.toArray())), 3]} /></bufferGeometry><pointsMaterial ref={nodes} color="#60EFFF" size={compact ? .045 : .035} transparent opacity={.65} depthWrite={false} /></points>{[0, 1, 2].map(i => <mesh key={i} ref={node => { pulses.current[i] = node; }} scale={.035}><sphereGeometry args={[1, 8, 8]} /><meshBasicMaterial color="#D4FAFF" toneMapped={false} /></mesh>)}</group>;
}

export function DataFlowSystem({ active, variation, running }) {
  const chart = useRef(null), particles = useRef(null);
  const transform = useMemo(() => new THREE.Object3D(), []);
  const positions = useRef(new Float32Array(60));
  const geometry = useMemo(() => new THREE.BoxGeometry(.065, .065, .065), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({ clock }, delta) => {
    if (!running) return;
    const t = clock.getElapsedTime(), dt = Math.min(delta, .05);
    const structured = active === 'format' || active === 'timeline' || active === 'register';
    const target = active === 'format' ? .75 : active ? .3 : .15;
    chart.current.opacity = THREE.MathUtils.damp(chart.current.opacity, target, 3, Math.min(delta, .05));
    for (let i = 0; i < 20; i++) {
      const phase = (t * .1 + i / 20) % 1;
      const x = structured ? -2.1 + phase * 4.2 : Math.sin(i * 2.4) * 1.9;
      const y = structured ? -1.65 + Math.sin(phase * Math.PI) * .15 : Math.cos(i * 1.7 + t * .12) * .8 - .8;
      positions.current[i * 3] = THREE.MathUtils.damp(positions.current[i * 3], x, 3.5, dt);
      positions.current[i * 3 + 1] = THREE.MathUtils.damp(positions.current[i * 3 + 1], y, 3.5, dt);
      transform.position.set(positions.current[i * 3], positions.current[i * 3 + 1], -.7 + (i % 3) * .12);
      transform.rotation.set(0, t * .1, i);
      transform.scale.setScalar(structured && phase > .7 ? 1.4 : .8);
      transform.updateMatrix(); particles.current.setMatrixAt(i, transform.matrix);
    }
    particles.current.instanceMatrix.needsUpdate = true;
  });
  return <group name="demonstration-data-flow"><instancedMesh ref={particles} args={[geometry, undefined, 20]} frustumCulled={false}><meshBasicMaterial ref={chart} color="#60EFFF" transparent opacity={.15} depthWrite={false} /></instancedMesh><group position={[1.65, -.4, -.8]} rotation={[0, -.3, 0]} visible={['format', 'timeline'].includes(active)}>{[.25, .48, .37, .68, .6].map((height, i) => <mesh key={i} position={[i * .16, height / 2 - .5, 0]} scale={[.1, height + variation * .025, .08]}><boxGeometry /><meshStandardMaterial color={i > 2 ? '#C9FF5D' : '#60EFFF'} emissive={i > 2 ? '#C9FF5D' : '#60EFFF'} emissiveIntensity={.35} metalness={.35} roughness={.2} /></mesh>)}</group></group>;
}

export function HolographicRewards({ active, variation, running }) {
  const objects = useRef([]);
  useFrame(({ clock }, delta) => {
    if (!running || active !== 'prizes') return;
    objects.current.forEach((object, i) => {
      if (!object) return;
      const focus = variation % 3 === i;
      object.scale.setScalar(THREE.MathUtils.damp(object.scale.x, focus ? 1.12 : .82, 4, Math.min(delta, .05)));
      object.position.y = -1.25 + Math.sin(clock.getElapsedTime() * .8 + i) * .035;
    });
  });
  return <group visible={active === 'prizes'} name="holographic-reward-chamber">{[-1.5, 0, 1.5].map((x, i) => <group key={x} ref={node => { objects.current[i] = node; }} position={[x, -1.25, i === 1 ? -.85 : .2]}>
    <mesh><cylinderGeometry args={[.27, .29, .12, 32]} /><meshPhysicalMaterial color="#24354B" metalness={.75} roughness={.2} clearcoat={1} /></mesh>
    <mesh position={[0, .07, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.24, .012, 8, 40]} /><meshBasicMaterial color="#C9FF5D" toneMapped={false} /></mesh>
    <mesh position={[0, .24, 0]}><cylinderGeometry args={[.035, .055, .25, 16]} /><meshPhysicalMaterial color="#C5DEC0" metalness={.9} roughness={.15} /></mesh>
    <mesh position={[0, .44, 0]}><cylinderGeometry args={[.18, .055, .23, 32]} /><meshPhysicalMaterial color={i === 0 ? '#D9F3A2' : '#BED6E3'} metalness={.82} roughness={.17} clearcoat={1} /></mesh>
    {[-.18, .18].map(side => <mesh key={side} position={[side, .46, 0]}><torusGeometry args={[.075, .012, 8, 24]} /><meshPhysicalMaterial color="#BBD9BC" metalness={.9} roughness={.15} /></mesh>)}
  </group>)}</group>;
}
