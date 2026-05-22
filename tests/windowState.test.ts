import { describe, expect, it, vi } from 'vitest';
import { resolveWindowStateToSave, type WindowStateSource } from '../electron/windowState';

describe('window state persistence', () => {
  it('saves current bounds while the window is not maximized', () => {
    const getBounds = vi.fn(() => ({ x: 80, y: 90, width: 1280, height: 800 }));
    const getNormalBounds = vi.fn(() => ({ x: 10, y: 20, width: 1024, height: 640 }));
    const source: WindowStateSource = {
      isMaximized: () => false,
      getBounds,
      getNormalBounds,
    };

    expect(resolveWindowStateToSave(source)).toEqual({
      x: 80,
      y: 90,
      width: 1280,
      height: 800,
      isMaximized: false,
    });
    expect(getBounds).toHaveBeenCalledTimes(1);
    expect(getNormalBounds).not.toHaveBeenCalled();
  });

  it('saves normal bounds while the window is maximized', () => {
    const getBounds = vi.fn(() => ({ x: 0, y: 0, width: 1920, height: 1080 }));
    const getNormalBounds = vi.fn(() => ({ x: 120, y: 80, width: 1280, height: 800 }));
    const source: WindowStateSource = {
      isMaximized: () => true,
      getBounds,
      getNormalBounds,
    };

    expect(resolveWindowStateToSave(source)).toEqual({
      x: 120,
      y: 80,
      width: 1280,
      height: 800,
      isMaximized: true,
    });
    expect(getBounds).not.toHaveBeenCalled();
    expect(getNormalBounds).toHaveBeenCalledTimes(1);
  });
});
