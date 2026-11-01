import { expect, it, vi } from 'vitest';
import { runStudioSetup } from '../components/three/studio/studioSetup';

it('yields between construction stages so the loader can paint', async () => {
  const calls = [];
  function* stages() { calls.push('geometry'); yield; calls.push('materials'); yield; return 'ready'; }
  const afterPaint = vi.fn(async () => { calls.push('paint'); });
  expect(await runStudioSetup(stages(), { afterPaint })).toBe('ready');
  expect(calls).toEqual(['geometry', 'paint', 'materials', 'paint']);
});

it('cancels pending construction before another stage runs', async () => {
  const abort = new AbortController(), abandoned = vi.fn(), finished = vi.fn();
  function* stages() { try { yield; finished(); } finally { abandoned(); } }
  await expect(runStudioSetup(stages(), { signal: abort.signal, afterPaint: async () => abort.abort() })).rejects.toMatchObject({ name: 'AbortError' });
  expect(abandoned).toHaveBeenCalledOnce();
  expect(finished).not.toHaveBeenCalled();
});

it('releases pending setup immediately when aborted while waiting for a frame', async () => {
  const raf = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(42);
  const cancel = vi.spyOn(window, 'cancelAnimationFrame');
  const abort = new AbortController(), finished = vi.fn();
  function* stages() { yield; finished(); }
  const pending = runStudioSetup(stages(), { signal: abort.signal });
  abort.abort();
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  expect(cancel).toHaveBeenCalledWith(42);
  expect(finished).not.toHaveBeenCalled();
  raf.mockRestore(); cancel.mockRestore();
});
