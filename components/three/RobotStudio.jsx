'use client';
import { useEffect, useRef, useState } from 'react';
import SceneFallback from './SceneFallback';

let studioModule;
const loadStudio = () => studioModule ||= import('./studio/createRobotStudio').catch(error => { studioModule = null; throw error; });
// Start fetching during client module evaluation instead of after the effect.
// Reduced-motion clients never need the GPU bundle.
if (typeof window !== 'undefined' && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) loadStudio().catch(() => {});

export default function RobotStudio({ reduced, paused = false, colored = false, onReady, moduleInteraction = null }) {
  const host = useRef(null);
  const runtime = useRef(null);
  const playback = useRef({ paused, inView: true });
  const [failed, setFailed] = useState(false);
  const readyCallback = useRef(onReady);
  const notified = useRef(false);
  const moduleSignal = useRef(moduleInteraction);
  useEffect(() => {
    moduleSignal.current = moduleInteraction;
    runtime.current?.setModuleInteraction?.(moduleInteraction);
  }, [moduleInteraction]);
  useEffect(() => { readyCallback.current = onReady; }, [onReady]);
  useEffect(() => {
    playback.current.paused = paused;
    runtime.current?.setRunning(!paused && playback.current.inView && !document.hidden);
  }, [paused]);
  useEffect(() => {
    const notifyReady = () => {
      if (notified.current) return;
      notified.current = true;
      readyCallback.current?.();
    };
    if (reduced || failed) { notifyReady(); return; }
    let cancelled = false;
    const setupAbort = new AbortController();
    let timeout;
    const failBoot = () => {
      if (cancelled) return;
      if (document.hidden) { timeout = setTimeout(failBoot, 20000); return; }
      cancelled = true;
      setupAbort.abort();
      runtime.current?.setRunning(false);
      setFailed(true);
    };
    timeout = setTimeout(failBoot, 20000);
    const sync = () => runtime.current?.setRunning(!document.hidden && playback.current.inView && !playback.current.paused);
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      playback.current.inView = entries[0]?.isIntersecting ?? true;
      sync();
    });
    const resize = new ResizeObserver(() => runtime.current?.resize());
    if (host.current) { observer?.observe(host.current); resize.observe(host.current); }
    document.addEventListener('visibilitychange', sync);
    loadStudio().then(async ({ createRobotStudio }) => {
      if (cancelled || !host.current) return;
      const engine = await createRobotStudio(host.current, { incremental: true, signal: setupAbort.signal, onVisible() {
        if (cancelled) return;
        clearTimeout(timeout);
        notifyReady();
      } });
      if (cancelled) { engine.dispose(); return; }
      runtime.current = engine;
      runtime.current.setModuleInteraction?.(moduleSignal.current);
      sync();
    }).catch(error => {
      if (!cancelled) { clearTimeout(timeout); console.error('Unable to initialize the robot studio:', error); setFailed(true); }
    });
    return () => {
      cancelled = true;
      setupAbort.abort();
      clearTimeout(timeout);
      observer?.disconnect(); resize.disconnect();
      document.removeEventListener('visibilitychange', sync);
      runtime.current?.dispose(); runtime.current = null;
    };
  }, [reduced, failed]);
  if (reduced || failed) return <SceneFallback colored={colored} failed={failed} />;
  return <div ref={host} className="robot-studio-model" data-colorized={colored} role="img" aria-label="Four pencil robots enter together, beginning in grayscale and revealing color on the first click; Blue looks toward its friends, Green and Pink shake their heads, and Orange points upward" />;
}
