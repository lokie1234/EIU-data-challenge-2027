import { type ReactNode, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import GuardianRobot3D from './GuardianRobot3D';

// One full-screen chart texture plus the shared PC display, with no text overlays.
function drawDashboard(ctx: CanvasRenderingContext2D, t: number, compact: boolean, index: number) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);
  if (compact) { ctx.fillStyle = '#0a1729'; ctx.fillRect(0, 0, w, h); }
  ctx.lineWidth = 1; ctx.strokeStyle = compact ? '#294157' : '#41658238';
  for (let i = 0; i <= 16; i++) {
    ctx.beginPath(); ctx.moveTo(i * w / 16, 0); ctx.lineTo(i * w / 16, h); ctx.stroke();
  }
  for (let i = 0; i <= 9; i++) {
    ctx.beginPath(); ctx.moveTo(0, i * h / 9); ctx.lineTo(w, i * h / 9); ctx.stroke();
  }
  ['#71c8dd', '#b09bd9', '#91bda9'].forEach((color, series) => {
    const points: [number, number][] = [];
    for (let i = 0; i <= 100; i++) {
      const value = .36 + series * .1 + Math.sin(i * .064 + t * .22 + series * 1.8) * .13 + Math.sin(i * .17 - t * .12 + series) * .055;
      points.push([i / 100 * w, h * value]);
    }
    ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.strokeStyle = color; ctx.lineWidth = compact ? 2 : 1.8; ctx.stroke();
    if (series === 0) {
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
      const fill = ctx.createLinearGradient(0, h * .2, 0, h); fill.addColorStop(0, '#71c8dd18'); fill.addColorStop(1, '#71c8dd00');
      ctx.fillStyle = fill; ctx.fill();
    }
  });
  for (let i = 0; i < 32; i++) {
    const height = h * (.045 + .12 * (.5 + .5 * Math.sin(i * .65 + t * .4 + index)));
    ctx.fillStyle = i % 3 === 0 ? '#c4adcf48' : '#7fbdbb38';
    ctx.fillRect(i * w / 32 + 4, h - height, w / 32 - 8, height);
  }
}

function Dashboard({ compact = false, index = 0, width = 6.5, height = 3.3 }: { compact?: boolean; index?: number; width?: number; height?: number }) {
  const last = useRef(-1);
  const { canvas, context, texture } = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = compact ? 512 : 1024; canvas.height = compact ? 320 : 520;
    const context = canvas.getContext('2d')!;
    drawDashboard(context, 0, compact, index);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    return { canvas, context, texture };
  }, [compact, index]);
  useEffect(() => () => { texture.dispose(); canvas.width = 1; canvas.height = 1; }, [texture, canvas]);
  useFrame(({ clock }) => {
    const tick = Math.floor(clock.elapsedTime * 30);
    if (tick === last.current) return;
    last.current = tick; drawDashboard(context, clock.elapsedTime, compact, index); texture.needsUpdate = true;
  });
  return <mesh><planeGeometry args={[width, height]} /><meshBasicMaterial map={texture} transparent={!compact} depthWrite={compact} opacity={compact ? 1 : .4} toneMapped={false} /></mesh>;
}

function Arrive({ children, enter, motion, delay = 0 }: { children: ReactNode; enter: boolean; motion: boolean; delay?: number }) {
  const group = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    if (!group.current) return;
    if (enter && motion) elapsed.current += Math.min(delta, .05);
    const t = motion ? THREE.MathUtils.clamp((elapsed.current - delay) / 1.65, 0, 1) : 1;
    const progress = 1 - Math.pow(1 - t, 3);
    group.current.position.y = -.24 * (1 - progress);
    group.current.scale.setScalar(.97 + .03 * progress);
  });
  return <group ref={group} position={[0, motion ? -.24 : 0, 0]} scale={motion ? .97 : 1}>{children}</group>;
}

function DesktopSurface() {
  return <group name="desktop-surface-only">
    <mesh position={[.13, -.39, .43]}>
      <boxGeometry args={[2.3, .065, .92]} /><meshStandardMaterial color="#102a40" metalness={.55} roughness={.3} />
    </mesh>
    <mesh position={[.13, -.353, .895]}>
      <boxGeometry args={[2.3, .012, .018]} /><meshStandardMaterial color="#b39159" metalness={.8} roughness={.25} />
    </mesh>
    <mesh position={[-.04, -.345, .3]}>
      <boxGeometry args={[.95, .025, .28]} /><meshStandardMaterial color="#082945" />
    </mesh>
    {[0, 1, 2].map(row => <group key={row}>
      {Array.from({ length: 14 }, (_, i) => <mesh key={i} position={[-.45 + i * .063, -.325, .21 + row * .07]}>
        <boxGeometry args={[.046, .014, .045]} /><meshStandardMaterial color={row === 2 ? '#b39159' : '#64879e'} metalness={.3} roughness={.4} />
      </mesh>)}
    </group>)}
    <mesh position={[.66, -.325, .34]} scale={[1, .42, 1.5]}>
      <sphereGeometry args={[.06, 16, 12]} /><meshStandardMaterial color="#b39159" />
    </mesh>
    <group position={[-.65, -.14, .67]}>
      <mesh><boxGeometry args={[.76, .43, .04]} /><meshStandardMaterial color="#b39159" metalness={.7} roughness={.25} /></mesh>
      <group position={[0, 0, .024]}><Dashboard compact width={.71} height={.38} /></group>
      <mesh position={[0, -.16, 0]}><boxGeometry args={[.035, .2, .045]} /><meshStandardMaterial color="#b39159" /></mesh>
    </group>
  </group>;
}

export default function DataLab3D({ enter, motion }: { hovered: boolean; enter: boolean; motion: boolean }) {
  const viewport = useThree(state => state.viewport);
  const mobile = useThree(state => state.size.width <= 760);
  const mouse = useRef({ x: 0, y: 0 });
  const scale = mobile
    ? Math.min(viewport.width * .86 / 1.6, viewport.height * .64 / 1.65)
    : Math.min(viewport.width * .48 / 1.8, viewport.height * .94 / 1.65);
  // Keep the desk level while the upper body leans left over the keyboard.
  return <>
    <group position={[0, 0, -3]}><Dashboard width={viewport.width * 1.31} height={viewport.height * 1.31} /></group>
    <group position={[viewport.width / 2 - scale * .58, -viewport.height * (mobile ? .2 : .12), -1.2]} scale={scale}>
      <Arrive enter={enter} motion={motion} delay={.08}>
        <DesktopSurface />
        <group rotation={[0, 0, .4]}>
          <GuardianRobot3D seated leaning mouseRef={mouse} stage={7} robotState="typing" enter={enter} />
        </group>
      </Arrive>
    </group>
  </>;
}
