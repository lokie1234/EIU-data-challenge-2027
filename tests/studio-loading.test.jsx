import { act, fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
const bridge = vi.hoisted(() => ({ ready: null }));
vi.mock('../hooks/useReducedMotion', () => ({ default: () => false }));
vi.mock('../components/animation/EntranceSequence', () => ({ default: () => null }));
vi.mock('../components/three/RobotStudio', () => ({ default: ({ colored, onReady }) => {
  bridge.ready = onReady;
  return <div data-testid="studio" data-colorized={colored} />;
} }));
import InteractiveHub from '../components/InteractiveHub';

it('covers the whole landing until furniture is visible, then reveals color on the first click', () => {
  const { container } = render(<InteractiveHub />);
  expect(screen.getByRole('status', { name: 'Loading EIU Data Challenge 2027' })).toBeTruthy();
  expect(container.querySelector('main').hasAttribute('inert')).toBe(true);
  expect(screen.queryByRole('navigation', { name: 'AI command modules' })).toBeNull();
  expect(screen.getByTestId('studio').dataset.colorized).toBe('false');
  act(() => bridge.ready());
  expect(screen.queryByRole('status', { name: 'Loading EIU Data Challenge 2027' })).toBeNull();
  expect(container.querySelector('main').hasAttribute('inert')).toBe(false);
  expect(screen.getByRole('navigation', { name: 'AI command modules' })).toBeTruthy();
  fireEvent.mouseMove(container.querySelector('main'));
  expect(screen.getByTestId('studio').dataset.colorized).toBe('false');
  fireEvent.click(screen.getByRole('heading', { name: 'EIU Data Challenge 2027' }));
  expect(screen.getByTestId('studio').dataset.colorized).toBe('true');
});
