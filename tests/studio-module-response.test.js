import { expect, it, vi } from 'vitest';
import { createModuleResponse } from '../components/three/studio/studioModuleResponse';

it('queues navigation through the entrance, responds only with the assigned robot and clears cleanly', () => {
  const controllers = Object.fromEntries(['blue', 'mint', 'coral', 'orchid'].map(id => [id, { root: { userData: {} }, onHover: vi.fn(), onClick: vi.fn() }]));
  const response = createModuleResponse(controllers);
  response.set({ id: 'timeline', mode: 'hover' });
  expect(response.hasSelection()).toBe(true);
  expect(controllers.coral.onHover).not.toHaveBeenCalled();
  response.start();
  expect(controllers.coral.onHover).toHaveBeenLastCalledWith(true, { interrupt: true });
  expect(controllers.coral.root.userData.moduleId).toBe('timeline');
  expect(controllers.blue.onHover).toHaveBeenLastCalledWith(false, { interrupt: false });
  response.set({ id: 'timeline', mode: 'active' });
  expect(controllers.coral.onClick).toHaveBeenCalledTimes(1);
  response.set({ id: 'timeline', mode: 'active' });
  expect(controllers.coral.onClick).toHaveBeenCalledTimes(1);
  response.set({ id: 'register', mode: 'active' });
  expect(controllers.orchid.onClick).toHaveBeenCalledTimes(1);
  expect(controllers.coral.onHover).toHaveBeenLastCalledWith(false, { interrupt: false });
  expect(controllers.coral.root.userData.moduleId).toBeNull();
  response.set(null);
  expect(response.hasSelection()).toBe(false);
  expect(controllers.orchid.onHover).toHaveBeenLastCalledWith(false, { interrupt: false });
  expect(controllers.mint.onClick).not.toHaveBeenCalled();
  response.set({ id: 'unrecognized', mode: 'active' });
  expect(response.hasSelection()).toBe(false);
});
