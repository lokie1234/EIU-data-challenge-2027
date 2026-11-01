// Run construction stages between paints instead of blocking the loader with
// one long task. Synchronous construction remains available for geometry tests.
export async function runStudioSetup(stages, { signal, afterPaint, onStage } = {}) {
  const wait = afterPaint || (() => new Promise(resolve => {
    let frame = 0, timer = 0;
    const done = () => {
      if (frame) cancelAnimationFrame(frame);
      if (timer) clearTimeout(timer);
      signal?.removeEventListener('abort', done);
      resolve();
    };
    signal?.addEventListener('abort', done, { once: true });
    if (signal?.aborted) { done(); return; }
    if (document.hidden) { timer = setTimeout(done, 0); return; }
    frame = requestAnimationFrame(() => { frame = 0; timer = setTimeout(done, 0); });
  }));
  for (;;) {
    if (signal?.aborted) { stages.return?.(); throw new DOMException('Studio setup cancelled', 'AbortError'); }
    const start = performance.now(), next = stages.next();
    onStage?.(performance.now() - start);
    if (next.done) return next.value;
    await wait();
  }
}
