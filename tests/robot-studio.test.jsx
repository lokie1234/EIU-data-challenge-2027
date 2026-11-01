import { act, render, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
const engine = vi.hoisted(() => ({ setRunning: vi.fn(), setModuleInteraction: vi.fn(), resize: vi.fn(), dispose: vi.fn() }));
const create = vi.hoisted(() => vi.fn());
vi.mock('../components/three/studio/createRobotStudio', () => ({ createRobotStudio: create }));
import RobotStudio from '../components/three/RobotStudio';
afterEach(() => { vi.clearAllMocks(); });

it('forwards module hover and activation to the existing engine without recreating the scene', async () => {
  create.mockReturnValue(engine);
  const { rerender } = render(<RobotStudio reduced={false} moduleInteraction={{ id: 'about', mode: 'hover' }} />);
  await waitFor(() => expect(engine.setModuleInteraction).toHaveBeenCalledWith({ id: 'about', mode: 'hover' }));
  rerender(<RobotStudio reduced={false} moduleInteraction={{ id: 'about', mode: 'active' }} />);
  expect(engine.setModuleInteraction).toHaveBeenLastCalledWith({ id: 'about', mode: 'active' });
  rerender(<RobotStudio reduced={false} />);
  expect(engine.setModuleInteraction).toHaveBeenLastCalledWith(null);
  expect(create).toHaveBeenCalledTimes(1);
});

it('mounts a native scene without an iframe or test controls, then pauses without rebuilding it', async () => {
  create.mockReturnValue(engine);
  const { container, rerender, unmount } = render(<RobotStudio reduced={false} />);
  await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
  expect(container.querySelector('iframe')).toBeNull();
  expect(container.querySelector('button')).toBeNull();
  expect(container.querySelector('.robot-studio-model')).toBeTruthy();
  rerender(<RobotStudio reduced={false} paused />);
  expect(engine.setRunning).toHaveBeenLastCalledWith(false);
  expect(create).toHaveBeenCalledTimes(1);
  unmount();
  expect(engine.dispose).toHaveBeenCalledTimes(1);
});

it('keeps reduced motion static and does not create a GPU renderer', () => {
  const { container } = render(<RobotStudio reduced />);
  expect(create).not.toHaveBeenCalled();
  expect(container.querySelector('.scene-fallback')).toBeTruthy();
  expect(container.querySelectorAll('use[href="#studio-static-bot"]')).toHaveLength(4);
});

it('signals readiness on the first visible frame and changes color without rebuilding', async () => {
  create.mockReturnValue(engine);
  const ready = vi.fn();
  const { container, rerender, unmount } = render(<RobotStudio reduced={false} onReady={ready} />);
  await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
  expect(ready).not.toHaveBeenCalled();
  expect(container.querySelector('.robot-studio-model').dataset.colorized).toBe('false');
  const visible = create.mock.calls[0][1].onVisible;
  act(() => { visible(); visible(); });
  expect(ready).toHaveBeenCalledTimes(1);
  rerender(<RobotStudio reduced={false} colored onReady={ready} />);
  expect(container.querySelector('.robot-studio-model').dataset.colorized).toBe('true');
  expect(create).toHaveBeenCalledTimes(1);
  unmount(); act(() => visible()); expect(ready).toHaveBeenCalledTimes(1);
});

it('releases the loader into a static view when GPU setup fails', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  create.mockImplementationOnce(() => { throw new Error('WebGL unavailable'); });
  const ready = vi.fn();
  const { container } = render(<RobotStudio reduced={false} onReady={ready} />);
  await waitFor(() => expect(container.querySelector('.scene-fallback')).toBeTruthy());
  expect(container.textContent).toContain('3D view unavailable');
  expect(ready).toHaveBeenCalledTimes(1);
  log.mockRestore();
});

it('aborts incremental setup and disposes an engine that resolves after unmount', async () => {
  let finish;
  create.mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
  const { unmount } = render(<RobotStudio reduced={false} />);
  await waitFor(() => expect(create).toHaveBeenCalledOnce());
  const options = create.mock.calls[0][1];
  expect(options.incremental).toBe(true);
  unmount();
  expect(options.signal.aborted).toBe(true);
  await act(async () => finish(engine));
  expect(engine.dispose).toHaveBeenCalledOnce();
});
