import { act, render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
vi.mock('@react-three/fiber', () => ({ Canvas: props => <div data-testid="canvas" data-loop={props.frameloop} /> }));
vi.mock('@react-three/drei', () => ({ Environment: () => null, Lightformer: () => null, PerformanceMonitor: () => null }));
vi.mock('../components/three/RoboticMascot', () => ({ default: () => null }));
vi.mock('../components/three/AIEnvironment', () => ({ NeuralNetwork: () => null, DataFlowSystem: () => null, HolographicRewards: () => null }));
vi.mock('../components/three/SceneChoreography', () => ({ default: () => null }));
vi.mock('../components/three/SceneEffects', () => ({ default: () => null }));
import ThreeScene from '../components/three/ThreeScene';
describe('scene accessibility and lifecycle controls', () => {
  it('pauses/resumes and stops its frame loop when hidden', async () => {
    const user = userEvent.setup();
    render(<ThreeScene reduced={false} />);
    expect(screen.getByTestId('canvas').getAttribute('data-loop')).toBe('always');
    await user.click(screen.getByRole('button', { name: 'Pause robotic scene' }));
    expect(screen.getByTestId('canvas').getAttribute('data-loop')).toBe('demand');
    await user.click(screen.getByRole('button', { name: 'Wave to the robot' }));
    expect(screen.getByTestId('canvas').getAttribute('data-loop')).toBe('always');
    await user.click(screen.getByRole('button', { name: 'Pause robotic scene' }));
    await user.click(screen.getByRole('button', { name: 'Resume robotic scene' }));
    act(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); fireEvent(document, new Event('visibilitychange')); });
    expect(screen.getByTestId('canvas').getAttribute('data-loop')).toBe('demand');
    act(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); fireEvent(document, new Event('visibilitychange')); });
    expect(screen.getByTestId('canvas').getAttribute('data-loop')).toBe('always');
    await user.click(screen.getByRole('button', { name: 'Recenter robotic scene' }));
  });
  it('uses static artwork instead of a GPU loop for reduced motion', () => {
    render(<ThreeScene reduced />);
    expect(screen.queryByTestId('canvas')).toBeNull();
    expect(screen.getByRole('img', { name: /friendly purple robotic mascot with white LED eyes/i })).toBeTruthy();
  });
});
