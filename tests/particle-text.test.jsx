import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
vi.mock('../hooks/useReducedMotion', () => ({ default: () => false }));
import ParticleText from '../components/animations/ParticleText';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function sizedHost() {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    const width = this.classList.contains('particle-text-fallback') ? (parseFloat(this.style.fontSize) || 144) * 12.5 : 320;
    return { width, height: 90, left: 0, top: 0, right: width, bottom: 90 };
  });
  vi.spyOn(window, 'getComputedStyle').mockImplementation(() => ({ fontSize: '144px', fontFamily: 'Space Grotesk', color: '#ffffff' }));
}

it('fits the full title into a narrow container when canvas is unavailable', () => {
  sizedHost();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  const { container } = render(<ParticleText text="EIU Data Challenge 2027" />);
  const title = screen.getByText('EIU Data Challenge 2027');
  expect(parseFloat(title.style.fontSize)).toBe(24);
  expect(container.firstChild.dataset.ready).toBe('false');
  expect(container.querySelector('canvas').getAttribute('aria-hidden')).toBe('true');
});

it('runs the particle renderer and cancels its loop when hidden or unmounted', () => {
  sizedHost();
  const callbacks = new Map(); let nextId = 0;
  const request = vi.fn(callback => { callbacks.set(++nextId, callback); return nextId; });
  const cancel = vi.fn(id => callbacks.delete(id));
  vi.stubGlobal('requestAnimationFrame', request); vi.stubGlobal('cancelAnimationFrame', cancel);
  const pixels = new Uint8ClampedArray(320 * 90 * 4);
  for (let y = 30; y < 50; y++) for (let x = 40; x < 120; x++) pixels[(y * 320 + x) * 4 + 3] = 255;
  const context = { setTransform: vi.fn(), measureText: () => ({ width: 300 }), fillText: vi.fn(), getImageData: () => ({ data: pixels }), clearRect: vi.fn(), beginPath: vi.fn(), arc: vi.fn(), fill: vi.fn() };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
  const { container, unmount } = render(<ParticleText text="EIU Data Challenge 2027" clickBurst />);
  expect(container.firstChild.dataset.ready).toBe('true');
  expect(context.fillText).toHaveBeenCalledWith('EIU Data Challenge 2027', 160, 45);
  callbacks.get(1)(34);
  expect(context.arc).toHaveBeenCalled();
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
  fireEvent(document, new Event('visibilitychange'));
  expect(cancel).toHaveBeenCalled();
  const count = request.mock.calls.length;
  unmount();
  expect(request.mock.calls.length).toBe(count);
});
