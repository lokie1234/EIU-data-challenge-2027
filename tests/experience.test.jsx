import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { portals } from '../data/eventContent';
vi.mock('next/dynamic', () => ({ default: () => function MockScene({ onInteract }) { return <button onClick={onInteract}>Interact with robot</button>; } }));
vi.mock('../components/animation/EntranceSequence', () => ({ default: () => null }));
import InteractiveHub from '../components/InteractiveHub';

const open = async id => {
  const user = userEvent.setup();
  render(<InteractiveHub />);
  const nav = screen.getByRole('navigation', { name: 'AI command modules' });
  await user.click(within(nav).getByRole('button', { name: new RegExp(portals.find(p => p.id === id).label, 'i') }));
  const dialog = await screen.findByRole('dialog');
  return { user, dialog };
};
describe('AI command experience', () => {
  it.each(portals.map(p => [p.id, p.title]))('opens %s and closes with Escape, returning focus', async (id, title) => {
    const { user, dialog } = await open(id);
    expect(within(dialog).getByRole('heading', { name: title })).toBeTruthy();
    expect(window.location.hash).toBe(`#${id}`);
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(document.activeElement.getAttribute('aria-haspopup')).toBe('dialog'));
  });
  it('previews a command on keyboard focus', async () => {
    render(<InteractiveHub />);
    const button = within(screen.getByRole('navigation', { name: 'AI command modules' })).getByRole('button', { name: /Timeline/i });
    act(() => button.focus());
    expect(await screen.findByText('Travel through the historical 2026 season.')).toBeTruthy();
  });
  it('closes on outside click and traps keyboard focus while open', async () => {
    const { user, dialog } = await open('about');
    await user.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
    await user.click(document.querySelector('.lab-backdrop'));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
  it('selects a neural idea and a skill module', async () => {
    const { user, dialog } = await open('about');
    await user.click(within(dialog).getByRole('button', { name: /Business decisions/ }));
    expect(await within(dialog).findByText('The goal: practical recommendations that people can use.')).toBeTruthy();
    await user.click(within(dialog).getByRole('button', { name: '02. Why join' }));
    await within(dialog).findByRole('heading', { name: 'Human + machine' });
    await user.click(within(dialog).getByRole('button', { name: /Workshops/ }));
    expect(await within(dialog).findByRole('heading', { name: 'Workshops' })).toBeTruthy();
  });
  it('switches modules in one dialog with previous/next controls', async () => {
    const { user, dialog } = await open('about');
    await user.click(within(dialog).getByRole('button', { name: /Next module/ }));
    expect(await within(dialog).findByRole('heading', { name: 'Human + machine' })).toBeTruthy();
    await user.click(within(dialog).getByRole('button', { name: /Previous/ }));
    expect(await within(dialog).findByRole('heading', { name: 'The intelligence network' })).toBeTruthy();
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });
  it('opens a deep link and restores browser history', async () => {
    window.history.replaceState({}, '', '/#format');
    render(<InteractiveHub />);
    expect(await screen.findByRole('dialog')).toBeTruthy();
    act(() => { window.history.pushState({}, '', '#timeline'); window.dispatchEvent(new PopStateEvent('popstate')); });
    expect(await screen.findByRole('heading', { name: 'Transformation timeline' })).toBeTruthy();
    act(() => { window.history.replaceState({}, '', '#format'); window.dispatchEvent(new HashChangeEvent('hashchange')); });
    expect(await screen.findByRole('heading', { name: 'The analytics pipeline' })).toBeTruthy();
  });
  it('supports level keyboard navigation and actual round details', async () => {
    const { user, dialog } = await open('format');
    expect(within(dialog).getByText('30 questions')).toBeTruthy();
    const first = within(dialog).getByRole('tab', { name: /Online Test/ });
    act(() => first.focus());
    await user.keyboard('{ArrowRight}');
    expect(await within(dialog).findByText('150–180 sec')).toBeTruthy();
    expect(document.activeElement.id).toBe('level-1');
    await user.click(within(dialog).getByRole('button', { name: /Next level/ }));
    expect(await within(dialog).findByText('Judges’ Q&A')).toBeTruthy();
  });
  it('reveals updated historical dates and preserves the date discrepancy', async () => {
    const { user, dialog } = await open('timeline');
    await user.click(within(dialog).getByRole('tab', { name: /Round 2 update/ }));
    expect(await within(dialog).findByText('28 JAN–04 FEB / 2026')).toBeTruthy();
    await user.click(within(dialog).getByText('Dates, updates & source caveats'));
    expect(within(dialog).getByText(/homepage still lists 21–31 January/)).toBeTruthy();
  });
  it('unlocks a historical reward without presenting it as 2027', async () => {
    const { user, dialog } = await open('prizes');
    await user.click(within(dialog).getByRole('button', { name: /Champion/ }));
    expect(await within(dialog).findByText('5,000,000 VND · Champion')).toBeTruthy();
    expect(within(dialog).getByText(/No 2027 prize values announced/)).toBeTruthy();
    expect(within(dialog).getByText('45 FoodCity EIU vouchers')).toBeTruthy();
  });
  it('filters FAQ, expands an answer and resets an empty search', async () => {
    const { user, dialog } = await open('faq');
    const search = within(dialog).getByRole('textbox', { name: 'Search the question lab' });
    await user.type(search, 'incentives');
    await user.click(within(dialog).getByRole('button', { name: /What were the team incentives/ }));
    expect(await within(dialog).findByText(/capped at 5 points per team/)).toBeTruthy();
    await user.clear(search); await user.type(search, 'zzzzzz');
    expect(within(dialog).getByText(/No matching question/)).toBeTruthy();
    await user.click(within(dialog).getByRole('button', { name: 'Reset search' }));
    expect(search.value).toBe('');
  });
  it('selects verified provider names without inventing partner logos', async () => {
    const { user, dialog } = await open('partners');
    await user.click(within(dialog).getByRole('button', { name: /Gems Zone Pickleball/ }));
    expect(await within(dialog).findByRole('heading', { name: 'Gems Zone Pickleball' })).toBeTruthy();
    expect(within(dialog).getByText(/not a 2027 sponsor list/)).toBeTruthy();
  });
  it('flips the truthful registration ticket and offers no form', async () => {
    const { user, dialog } = await open('register');
    const ticket = within(dialog).getByRole('button', { name: 'Flip access ticket for status' });
    await user.click(ticket);
    expect(ticket.getAttribute('aria-pressed')).toBe('true');
    expect(within(dialog).getByText('Registration details coming soon.')).toBeTruthy();
    expect(dialog.querySelector('form')).toBeNull();
    expect(dialog.querySelector('input')).toBeNull();
  });
});
