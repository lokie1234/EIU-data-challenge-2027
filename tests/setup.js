import React from 'react';
import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
globalThis.React = React;
vi.mock('../components/three/studio/createRobotStudio', () => ({ createRobotStudio: (_host, { onVisible } = {}) => {
  queueMicrotask(() => onVisible?.());
  return { setRunning: vi.fn(), resize: vi.fn(), dispose: vi.fn() };
} }));
Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn(query => ({ matches: query.includes('prefers-reduced-motion'), media: query, onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() })) });
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
HTMLElement.prototype.scrollTo = vi.fn();
HTMLElement.prototype.scrollIntoView = vi.fn();
HTMLElement.prototype.hasPointerCapture = () => false;
HTMLElement.prototype.setPointerCapture = () => {};
HTMLElement.prototype.releasePointerCapture = () => {};
afterEach(() => { cleanup(); window.history.replaceState({}, '', '/'); });
