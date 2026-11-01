import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
vi.mock('next/dynamic', () => ({ default: () => () => null }));
vi.mock('../hooks/useReducedMotion', () => ({ default: () => false }));
vi.mock('../components/animation/EntranceSequence', () => ({ default: () => null }));
import InteractiveHub from '../components/InteractiveHub';
it('never blocks category changes on an outgoing animation', async () => {
  const user = userEvent.setup();
  render(<InteractiveHub />);
  const navigation = await screen.findByRole('navigation', { name: 'AI command modules' });
  await user.click(within(navigation).getByRole('button', { name: /About/ }));
  const dialog = await screen.findByRole('dialog');
  await user.click(within(dialog).getByRole('button', { name: '04. Timeline' }));
  expect(await within(dialog).findByRole('heading', { name: 'Transformation timeline' })).toBeTruthy();
  await user.click(within(dialog).getByRole('button', { name: '08. Register' }));
  expect(await within(dialog).findByRole('heading', { name: 'The transformation gateway' })).toBeTruthy();
});
