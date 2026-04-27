import { describe, expect, it } from 'vitest';
import { getCarryingLoadTone } from '../src/utils/carryingLoad';

describe('getCarryingLoadTone', () => {
  it('classifies carrying load by capacity ratio', () => {
    expect(getCarryingLoadTone(49, 100)).toBe('normal');
    expect(getCarryingLoadTone(50, 100)).toBe('yellow');
    expect(getCarryingLoadTone(74, 100)).toBe('yellow');
    expect(getCarryingLoadTone(75, 100)).toBe('orange');
    expect(getCarryingLoadTone(100, 100)).toBe('orange');
    expect(getCarryingLoadTone(101, 100)).toBe('red');
  });

  it('handles zero capacity safely', () => {
    expect(getCarryingLoadTone(0, 0)).toBe('normal');
    expect(getCarryingLoadTone(1, 0)).toBe('red');
  });
});
