// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  APP_THEME_STORAGE_KEY,
  applyAppTheme,
  getCurrentAppTheme,
  initializeAppTheme,
  isAppThemeId,
  readStoredAppTheme,
  setAppTheme,
} from '../src/utils/appTheme';

describe('app theme utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  afterEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('recognizes only known UI theme ids', () => {
    expect(isAppThemeId('classic')).toBe(true);
    expect(isAppThemeId('night')).toBe(true);
    expect(isAppThemeId('byzantine')).toBe(true);
    expect(isAppThemeId('remilia')).toBe(true);
    expect(isAppThemeId('sepia')).toBe(false);
  });

  it('falls back to classic when stored theme is missing or invalid', () => {
    expect(readStoredAppTheme()).toBe('classic');

    localStorage.setItem(APP_THEME_STORAGE_KEY, 'unknown');

    expect(readStoredAppTheme()).toBe('classic');
  });

  it('initializes, applies, and persists the current theme', () => {
    localStorage.setItem(APP_THEME_STORAGE_KEY, 'night');

    expect(initializeAppTheme()).toBe('night');
    expect(document.documentElement.dataset.theme).toBe('night');
    expect(getCurrentAppTheme()).toBe('night');

    expect(setAppTheme('classic')).toBe('classic');
    expect(document.documentElement.dataset.theme).toBe('classic');
    expect(localStorage.getItem(APP_THEME_STORAGE_KEY)).toBe('classic');

    applyAppTheme('night');
    expect(getCurrentAppTheme()).toBe('night');

    expect(setAppTheme('byzantine')).toBe('byzantine');
    expect(document.documentElement.dataset.theme).toBe('byzantine');
    expect(localStorage.getItem(APP_THEME_STORAGE_KEY)).toBe('byzantine');

    expect(setAppTheme('remilia')).toBe('remilia');
    expect(document.documentElement.dataset.theme).toBe('remilia');
    expect(localStorage.getItem(APP_THEME_STORAGE_KEY)).toBe('remilia');
  });
});
