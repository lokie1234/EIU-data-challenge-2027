'use client';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
export default function SceneEffects({ enabled }) {
  return enabled ? <EffectComposer multisampling={0} enableNormalPass={false}><Bloom intensity={.24} luminanceThreshold={1.25} luminanceSmoothing={.4} mipmapBlur /></EffectComposer> : null;
}
