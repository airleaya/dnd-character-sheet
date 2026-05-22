export const APP_THEME_STORAGE_KEY = 'dnd_app_theme';

export const APP_THEME_OPTIONS = [
  { id: 'classic', label: '经典' },
  { id: 'night', label: '夜间' },
  { id: 'byzantine', label: '拜占庭' },
  { id: 'remilia', label: '蕾米莉亚' },
] as const;

export type AppThemeId = typeof APP_THEME_OPTIONS[number]['id'];

const DEFAULT_APP_THEME: AppThemeId = 'classic';

export const isAppThemeId = (value: unknown): value is AppThemeId =>
  APP_THEME_OPTIONS.some(option => option.id === value);

const getStorage = (): Storage | undefined => {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
};

const getDocumentRoot = (): HTMLElement | undefined =>
  typeof document === 'undefined' ? undefined : document.documentElement;

export const readStoredAppTheme = (): AppThemeId => {
  const stored = getStorage()?.getItem(APP_THEME_STORAGE_KEY);
  return isAppThemeId(stored) ? stored : DEFAULT_APP_THEME;
};

export const getCurrentAppTheme = (): AppThemeId => {
  const rootTheme = getDocumentRoot()?.dataset.theme;
  return isAppThemeId(rootTheme) ? rootTheme : readStoredAppTheme();
};

export const applyAppTheme = (theme: AppThemeId): AppThemeId => {
  const root = getDocumentRoot();
  if (root) {
    root.dataset.theme = theme;
  }
  return theme;
};

export const setAppTheme = (theme: AppThemeId): AppThemeId => {
  const nextTheme = applyAppTheme(theme);
  getStorage()?.setItem(APP_THEME_STORAGE_KEY, nextTheme);
  return nextTheme;
};

export const initializeAppTheme = (): AppThemeId => applyAppTheme(readStoredAppTheme());
