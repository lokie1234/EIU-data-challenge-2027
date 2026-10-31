'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import * as THREE from 'three';
import { getRobotPose, stepSpring } from './robotMotion';
import { createFaceGeometry, createBezelGeometry, createSoftBodyGeometry, createFlipperGeometry } from './robotGeometry';

gsap.registerPlugin(useGSAP);

function makeDisplayTexture() {
  const size = 128, pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4;
    const value = x % 3 === 1 && y % 3 === 1 ? 38 + ((x * 17 + y * 31) % 68) : 3;
    pixels[i] = value; pixels[i + 1] = value + 2; pixels[i + 2] = value + 5; pixels[i + 3] = 255;
  }
  const texture = new THREE.DataTexture(pixels, size, size);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function makeEye() {
  const shape = new THREE.Shape();
  shape.moveTo(-.16, -.07);
  shape.bezierCurveTo(-.165, .01, -.17, .125, 0, .13);
  shape.bezierCurveTo(.17, .125, .165, .01, .16, -.07);
  shape.quadraticCurveTo(0, -.015, -.16, -.07);
  return shape;
}

function Flipper({ side, pivot, material, geometry }) {
  return <group ref={pivot} position={[side * .32, -.32, .025]} rotation={[.1, 0, side * .2]}>
    <mesh geometry={geometry} material={material} />
  </group>;
}

export default function RoboticMascot({ active, running, resetToken, greetToken = 0, onInteract }) {
  const entrance = useRef(null), rig = useRef(null), head = useRef(null), eyes = useRef(null);
  const left = useRef(null), right = useRef(null), leftEye = useRef(null), rightEye = useRef(null);
  const feet = useRef([]), glow = useRef(null);
  const state = useRef({ time: 0, greeting: 0, hover: false, bounce: { position: 0, velocity: 0 } });
  const resources = useMemo(() => {
    const texture = makeDisplayTexture();
    return {
      texture, eye: makeEye(), face: createFaceGeometry(), frame: createBezelGeometry(), body: createSoftBodyGeometry(), flipper: createFlipperGeometry(),
      shell: new THREE.MeshPhysicalMaterial({ color: '#812ce2', metalness: .3, roughness: .24, clearcoat: 1, clearcoatRoughness: .14 }),
      graphite: new THREE.MeshPhysicalMaterial({ color: '#19171d', metalness: .2, roughness: .32, clearcoat: .85, clearcoatRoughness: .22 }),
      bezel: new THREE.MeshPhysicalMaterial({ color: '#29282b', metalness: .45, roughness: .3, clearcoat: .5 }),
      screen: new THREE.MeshPhysicalMaterial({ map: texture, emissiveMap: texture, emissive: '#cbcfdd', emissiveIntensity: .22, color: '#9b9ba8', metalness: .08, roughness: .46, clearcoat: .25 }),
      silver: new THREE.MeshStandardMaterial({ color: '#c9ccd9', metalness: .85, roughness: .27 }),
    };
  }, []);
  useEffect(() => () => {
    resources.texture.dispose();
    ['face', 'frame', 'body', 'flipper'].forEach(key => resources[key].dispose());
    ['shell', 'graphite', 'bezel', 'screen', 'silver'].forEach(key => resources[key].dispose());
  }, [resources]);
  useGSAP(() => {
    const tween = gsap.fromTo(entrance.current.scale, { x: .8, y: .8, z: .8 }, { x: 1.05, y: 1.05, z: 1.05, duration: 1.15, ease: 'back.out(1.4)' });
    return () => tween.kill();
  }, []);
  useEffect(() => {
    if (greetToken) { state.current.greeting = 2.6; state.current.bounce.velocity = 1.6; }
  }, [greetToken]);
  useEffect(() => { state.current.bounce.velocity = resetToken ? 1.2 : .65; }, [active, resetToken]);
  useFrame(({ pointer }, delta) => {
    if (!running || !rig.current) return;
    const s = state.current, dt = Math.min(delta, .05);
    s.time += dt;
    s.greeting = Math.max(0, s.greeting - dt);
    stepSpring(s.bounce, 0, dt);
    const pose = getRobotPose({ time: s.time, active, pointerX: pointer.x, pointerY: pointer.y, greeting: s.greeting, hovered: s.hover });
    const damp = (current, target, speed = 7) => THREE.MathUtils.damp(current, target, speed, dt);
    rig.current.position.y = pose.float + s.bounce.position;
    rig.current.rotation.set(0, damp(rig.current.rotation.y, pose.bodyYaw, 3), pose.sway);
    head.current.rotation.set(damp(head.current.rotation.x, pose.headPitch), damp(head.current.rotation.y, pose.headYaw), damp(head.current.rotation.z, pose.headTilt, 5));
    eyes.current.position.x = damp(eyes.current.position.x, pose.gazeX, 12);
    eyes.current.position.y = damp(eyes.current.position.y, pose.gazeY, 12);
    leftEye.current.scale.y = damp(leftEye.current.scale.y, pose.leftEye, 32);
    rightEye.current.scale.y = damp(rightEye.current.scale.y, pose.rightEye, 32);
    right.current.rotation.z = damp(right.current.rotation.z, pose.rightArm, 9);
    left.current.rotation.z = damp(left.current.rotation.z, pose.leftArm, 7);
    right.current.rotation.x = damp(right.current.rotation.x, pose.armForward);
    left.current.rotation.x = damp(left.current.rotation.x, pose.armForward * .5);
    feet.current.forEach((foot, i) => { if (foot) foot.rotation.x = Math.sin(s.time * 1.8 + i * .8) * .065; });
    glow.current.emissiveIntensity = .7 + Math.sin(s.time * 2) * .1 + (s.greeting > 0 ? .35 : 0);
  });
  const greet = event => { event.stopPropagation(); state.current.greeting = 2.6; state.current.bounce.velocity = 1.6; };
  return <group>
    <group ref={entrance} scale={1.05} position={[0, .12, 0]}>
      <group ref={rig} onPointerOver={event => { event.stopPropagation(); state.current.hover = true; }} onPointerOut={() => { state.current.hover = false; }} onClick={greet} onDoubleClick={event => { event.stopPropagation(); onInteract?.(); }}>
        <group ref={head} position={[0, .48, 0]} rotation={[.025, -.1, -.025]}>
          <RoundedBox args={[1.88, 1.67, 1.35]} radius={.4} smoothness={6} material={resources.shell} />
          <mesh geometry={resources.frame} position={[0, -.015, .654]} material={resources.bezel} />
          <mesh geometry={resources.face} position={[0, -.015, .714]} material={resources.screen} />
          <group ref={eyes} position={[0, .025, .798]}>
            {[-.222, .222].map((x, i) => <group key={x} ref={i ? rightEye : leftEye} position={[x, .12, 0]}><mesh><shapeGeometry args={[resources.eye, 20]} /><meshBasicMaterial color="#fffaf5" toneMapped={false} side={THREE.DoubleSide} /></mesh></group>)}
          </group>
          {[-1, 1].map(side => <group key={side} position={[side * .94, -.06, -.12]} rotation={[0, 0, Math.PI / 2]}>
            <mesh material={resources.graphite}><cylinderGeometry args={[.19, .19, .12, 32]} /></mesh>
            <mesh position={[0, side * .068, 0]} material={resources.silver}><cylinderGeometry args={[.125, .125, .025, 24]} /></mesh>
            <mesh position={[0, side * .085, 0]} material={resources.graphite}><cylinderGeometry args={[.084, .084, .024, 24]} /></mesh>
            <mesh position={[0, side * .101, 0]} rotation={[Math.PI / 2, 0, 0]}><boxGeometry args={[.085, .025, .008]} /><meshBasicMaterial color="#e5d2ff" /></mesh>
          </group>)}
          {[-1, 1].map(side => <mesh key={side} position={[side * .51, .825, -.2]} rotation={[0, 0, -side * .32]} material={resources.silver}><capsuleGeometry args={[.054, .095, 4, 12]} /></mesh>)}
          {[-.25, -.08, .09].map(z => <mesh key={z} position={[0, .827, z]} material={resources.shell}><boxGeometry args={[.66, .012, .013]} /></mesh>)}
          {[-1, 1].map(side => <group key={side} position={[side * .948, .19, -.25]} rotation={[0, 0, -.2]}>{[-.07, 0, .07].map(y => <mesh key={y} position={[0, y, 0]} material={resources.bezel}><boxGeometry args={[.012, .018, .19]} /></mesh>)}</group>)}
        </group>
        <mesh geometry={resources.body} position={[0, -.61, -.035]} scale={[1, 1, .86]} material={resources.graphite} />
        <Flipper side={-1} pivot={left} material={resources.graphite} geometry={resources.flipper} />
        <Flipper side={1} pivot={right} material={resources.graphite} geometry={resources.flipper} />
        {[-1, 1].map((side, i) => <group key={side} ref={node => { feet.current[i] = node; }} position={[side * .17, -.91, .015]} rotation={[0, 0, side * .12]}><mesh position={[0, -.12, .045]} scale={[.155, .225, .205]} material={resources.graphite}><sphereGeometry args={[1, 28, 20]} /></mesh></group>)}
      </group>
    </group>
    <group rotation={[0, -.28, 0]}>
      <RoundedBox args={[1.35, .52, 1.12]} radius={.035} position={[0, -1.45, -.02]} material={resources.shell} />
      <RoundedBox args={[1.36, .025, 1.13]} radius={.01} position={[0, -1.178, -.02]}><meshStandardMaterial ref={glow} color="#c372ff" emissive="#a044ff" emissiveIntensity={.8} metalness={.25} roughness={.32} /></RoundedBox>
    </group>
  </group>;
}
