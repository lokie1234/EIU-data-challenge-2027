'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import * as THREE from 'three';
import { eventContent as c, getPortal } from '../../data/eventContent';
gsap.registerPlugin(useGSAP);

function RobotArm({ side, armRef, forearmRef, materials: m }) {
  return <group position={[side * .56, -.13, 0]} ref={armRef}>
    <mesh material={m.joint}><sphereGeometry args={[.14, 20, 16]} /></mesh>
    <RoundedBox args={[.2, .35, .24]} radius={.06} position={[0, -.24, 0]} material={m.shell} />
    <mesh position={[side * .105, -.22, 0]} rotation={[0, 0, Math.PI / 2]} material={m.trim}><cylinderGeometry args={[.065, .065, .025, 24]} /></mesh>
    <group position={[0, -.45, 0]} ref={forearmRef}>
      <mesh material={m.joint}><sphereGeometry args={[.1, 16, 12]} /></mesh>
      <RoundedBox args={[.19, .29, .22]} radius={.05} position={[0, -.18, .035]} material={m.shell} />
      <RoundedBox args={[.1, .1, .012]} radius={.015} position={[0, -.16, .152]} material={m.trim} />
      <RoundedBox args={[.18, .14, .14]} radius={.035} position={[0, -.38, .04]} material={m.joint} />
      {[-1, 0, 1].map(i => <group key={i} position={[i * .055, -.46, .065]} rotation={[-.24, 0, 0]}><mesh material={m.shell}><capsuleGeometry args={[.023, .07, 4, 8]} /></mesh><mesh position={[0, -.053, .014]} material={m.joint}><sphereGeometry args={[.025, 8, 8]} /></mesh></group>)}
    </group>
  </group>;
}

export default function RoboticMascot({ active, running, resetToken, onInteract }) {
  const entrance = useRef(null), rig = useRef(null), head = useRef(null), eyes = useRef(null);
  const left = useRef(null), right = useRef(null), leftElbow = useRef(null), rightElbow = useRef(null);
  const leftEye = useRef(null), rightEye = useRef(null), core = useRef(null);
  const gesture = useRef(0);
  const color = useMemo(() => new THREE.Color(), []);
  const materials = useMemo(() => ({
    shell: new THREE.MeshPhysicalMaterial({ color: '#E8EFF8', metalness: .36, roughness: .2, clearcoat: 1, clearcoatRoughness: .12 }),
    joint: new THREE.MeshPhysicalMaterial({ color: '#24334B', metalness: .83, roughness: .23, clearcoat: .4 }),
    trim: new THREE.MeshPhysicalMaterial({ color: '#9B7CFF', metalness: .65, roughness: .18, clearcoat: 1 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#070E1C', metalness: .4, roughness: .09, clearcoat: 1, clearcoatRoughness: .05 }),
  }), []);
  useGSAP(() => {
    if (entrance.current) gsap.fromTo(entrance.current.scale, { x: .7, y: .7, z: .7 }, { x: 1.2, y: 1.2, z: 1.2, duration: 1, ease: 'back.out(1.1)' });
    return () => { document.body.style.cursor = ""; Object.values(materials).forEach(m => m.dispose()); };
  }, []);
  useGSAP(() => { gesture.current = 1; }, { dependencies: [active, resetToken] });
  useFrame(({ clock, pointer }, delta) => {
    if (!running || !rig.current) return;
    const dt = Math.min(delta, .05), t = clock.getElapsedTime();
    const portal = getPortal(active);
    const accent = c.theme[portal?.accent || 'cyan'];
    gesture.current = Math.max(0, gesture.current - dt * 1.3);
    rig.current.position.y = Math.sin(t * 1.1) * .045;
    rig.current.rotation.y = THREE.MathUtils.damp(rig.current.rotation.y, pointer.x * .13, 3, dt);
    rig.current.rotation.z = Math.sin(t * .7) * .012;
    head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, pointer.x * .3 + (active === 'faq' ? -.12 : 0), 7, dt);
    head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, -pointer.y * .17 + (active === 'format' ? .1 : 0), 7, dt);
    head.current.rotation.z = THREE.MathUtils.damp(head.current.rotation.z, active === 'about' ? -.09 : 0, 4, dt);
    eyes.current.position.x = pointer.x * .035;
    const blink = (t % 5.2) > 5.06 ? .1 : 1;
    leftEye.current.scale.y = THREE.MathUtils.damp(leftEye.current.scale.y, blink, 35, dt);
    rightEye.current.scale.y = THREE.MathUtils.damp(rightEye.current.scale.y, blink, 35, dt);
    const spread = ['why-join', 'partners', 'prizes'].includes(active) ? .48 : .08;
    left.current.rotation.z = THREE.MathUtils.damp(left.current.rotation.z, -spread - gesture.current * .14, 6, dt);
    right.current.rotation.z = THREE.MathUtils.damp(right.current.rotation.z, active === 'register' ? 1.7 : spread + gesture.current * .28, 6, dt);
    leftElbow.current.rotation.x = -.25 + Math.sin(t * .9) * .025;
    rightElbow.current.rotation.x = THREE.MathUtils.damp(rightElbow.current.rotation.x, active === 'faq' ? -1.2 : active === 'format' ? -.95 : -.35, 6, dt);
    if (active === 'register') right.current.rotation.x = Math.sin(t * 3) * .16;
    else right.current.rotation.x = THREE.MathUtils.damp(right.current.rotation.x, 0, 5, dt);
    if (core.current) {
      core.current.color.lerp(color.set(accent), 1 - Math.exp(-dt * 3));
      core.current.emissive.copy(core.current.color);
      core.current.emissiveIntensity = 1.1 + Math.sin(t * 2) * .15 + gesture.current * .4;
    }
  });
  return <group ref={entrance} scale={1.2}><group ref={rig} onPointerOver={() => { document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = ""; }} onClick={event => { event.stopPropagation(); gesture.current = 1; onInteract?.(); }}>
    <group ref={head} position={[0, .54, 0]}>
      <RoundedBox args={[1.2, .79, .7]} radius={.24} smoothness={5} material={materials.shell} />
      <RoundedBox args={[1.055, .44, .14]} radius={.15} position={[0, -.02, .35]} material={materials.glass} />
      <group ref={eyes} position={[0, -.015, .435]}>
        {[-.235, .235].map((x, i) => <group key={x} position={[x, .015, 0]} ref={i ? rightEye : leftEye}><RoundedBox args={[.125, .19, .025]} radius={.052} smoothness={4}><meshBasicMaterial color="#A0F7FF" toneMapped={false} /></RoundedBox></group>)}
        <mesh position={[0, -.12, 0]}><boxGeometry args={[.105, .012, .012]} /><meshBasicMaterial color="#60EFFF" toneMapped={false} /></mesh>
      </group>
      {[-1, 1].map(side => <group key={side} position={[side * .65, 0, -.04]} rotation={[0, 0, Math.PI / 2]}><mesh material={materials.joint}><cylinderGeometry args={[.145, .145, .09, 32]} /></mesh><mesh position={[0, side * .06, 0]} material={materials.trim}><cylinderGeometry args={[.105, .105, .025, 24]} /></mesh></group>)}
      <mesh position={[.35, .51, -.08]} material={materials.joint}><capsuleGeometry args={[.018, .2, 4, 8]} /></mesh>
      <mesh position={[.35, .64, -.08]}><sphereGeometry args={[.04, 16, 12]} /><meshStandardMaterial color="#60EFFF" emissive="#60EFFF" emissiveIntensity={1.8} toneMapped={false} /></mesh>
      <RoundedBox args={[.32, .035, .035]} radius={.01} position={[-.22, .3, .315]} material={materials.trim} />
    </group>
    <mesh position={[0, .05, 0]} material={materials.joint}><cylinderGeometry args={[.19, .22, .18, 24]} /></mesh>
    <RoundedBox args={[.91, .78, .61]} radius={.19} position={[0, -.37, 0]} material={materials.shell} />
    <RoundedBox args={[.62, .44, .035]} radius={.09} position={[0, -.36, .318]} material={materials.joint} />
    <mesh position={[0, -.33, .36]} material={materials.trim}><torusGeometry args={[.153, .025, 12, 48]} /></mesh>
    <mesh position={[0, -.33, .36]}><sphereGeometry args={[.115, 24, 20]} /><meshStandardMaterial ref={core} color="#60EFFF" emissive="#60EFFF" emissiveIntensity={1.4} metalness={.25} roughness={.18} toneMapped={false} /></mesh>
    <mesh position={[0, -.79, 0]} material={materials.joint}><cylinderGeometry args={[.28, .2, .16, 24]} /></mesh>
    {[-.2, .2].map(x => <group key={x} position={[x, -.94, 0]}><mesh material={materials.trim}><cylinderGeometry args={[.12, .15, .15, 24]} /></mesh><mesh position={[0, -.085, 0]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[.105, 24]} /><meshBasicMaterial color="#60EFFF" transparent opacity={.45} toneMapped={false} /></mesh></group>)}
    <RobotArm side={-1} armRef={left} forearmRef={leftElbow} materials={materials} />
    <RobotArm side={1} armRef={right} forearmRef={rightElbow} materials={materials} />
  </group></group>;
}
