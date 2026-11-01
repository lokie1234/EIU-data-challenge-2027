import { act, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import StrokeText from '../components/animations/StrokeText';

const originalBBox = Object.getOwnPropertyDescriptor(SVGElement.prototype, 'getBBox');
let glyphWidth;
beforeEach(() => {
  glyphWidth = 1600;
  Object.defineProperty(SVGElement.prototype, 'getBBox', {
    configurable: true,
    value: () => ({ x: 0, y: -120, width: glyphWidth, height: 150 }),
  });
});
afterEach(() => {
  vi.restoreAllMocks(); vi.unstubAllGlobals();
  if (originalBBox) Object.defineProperty(SVGElement.prototype, 'getBBox', originalBBox);
  else delete SVGElement.prototype.getBBox;
});

it('keeps its measured viewBox stable when the responsive host resizes', async () => {
  const observers = [];
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe(element) { this.element = element; }
    disconnect() { this.element = null; }
  });
  const { container } = render(<StrokeText text="EIU Data Challenge 2027" />);
  const svg = container.querySelector('svg');
  const viewBox = svg.getAttribute('viewBox');

  // Browser text hinting may shift the measured glyph width after scaling.
  // Feeding that difference back into the viewBox used to restart the reveal.
  await act(async () => {
    glyphWidth += 1;
    observers.forEach(observer => {
      if (observer.element) observer.callback([{ target: observer.element }]);
    });
    window.dispatchEvent(new Event('resize'));
  });
  expect(svg.getAttribute('viewBox')).toBe(viewBox);
  const wipe = container.querySelector('clipPath rect');
  expect(Number(wipe.getAttribute('width'))).toBeGreaterThan(1600);
});

it('finishes drawing and opens the fill clip with motion enabled', async () => {
  vi.spyOn(window, 'matchMedia').mockImplementation(query => ({ matches: false, media: query }));
  const { container } = render(<StrokeText text="EIU Data Challenge 2027" drawDuration={0.01} fillDelay={0} stagger={0} />);
  await waitFor(() => {
    const wipe = container.querySelector('clipPath rect');
    expect(Number(wipe.getAttribute('width'))).toBeGreaterThan(1600);
    expect(parseFloat(container.querySelector('[data-stroke-char]').style.strokeDashoffset)).toBe(0);
  });
});

it('uses sharp colored-pencil hatch patterns for the main title', () => {
  const { container } = render(<StrokeText text="EIU Data Challenge 2027" pencil />);
  expect(container.querySelectorAll('pattern')).toHaveLength(4);
  const fills = [...container.querySelectorAll('[data-fill-char]')].map(char => char.style.fill);
  expect(new Set(fills).size).toBe(4);
  expect(fills.every(fill => fill.startsWith('url('))).toBe(true);
  expect(container.querySelector('feGaussianBlur')).toBeNull();
});
