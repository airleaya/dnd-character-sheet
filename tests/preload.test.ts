import { beforeEach, describe, expect, it, vi } from 'vitest';

const exposeInMainWorld = vi.fn();
const invoke = vi.fn();
const on = vi.fn();
const setZoomFactor = vi.fn();

vi.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld,
  },
  ipcRenderer: {
    invoke,
    on,
  },
  webFrame: {
    setZoomFactor,
  },
}));

describe('preload electronAPI contract', () => {
  beforeEach(() => {
    vi.resetModules();
    exposeInMainWorld.mockClear();
    invoke.mockClear();
    on.mockClear();
    setZoomFactor.mockClear();
  });

  it('exposes a renderer-safe electronAPI bridge', async () => {
    await import('../electron/preload');

    expect(exposeInMainWorld).toHaveBeenCalledTimes(1);
    expect(exposeInMainWorld).toHaveBeenCalledWith('electronAPI', expect.any(Object));
  });

  it('forwards API calls to ipcRenderer and webFrame', async () => {
    await import('../electron/preload');

    const api = exposeInMainWorld.mock.calls[0]?.[1] as {
      saveCharacter: (filename: string, content: string) => Promise<unknown>;
      loadAllCharacters: () => Promise<unknown>;
      deleteCharacter: (filename: string) => Promise<unknown>;
      readCharacterGroups: () => Promise<unknown>;
      saveCharacterGroups: (state: unknown) => Promise<unknown>;
      onAppWillClose: (callback: () => void) => void;
      confirmClose: () => Promise<unknown>;
      setZoomFactor: (factor: number) => void;
      selectDirectory: () => Promise<unknown>;
      exportCharacter: (dirPath: string, filename: string, content: string) => Promise<unknown>;
      writeLog: (entry: unknown) => Promise<unknown>;
    };

    const callback = vi.fn();
    await api.saveCharacter('hero.json', '{}');
    await api.loadAllCharacters();
    await api.deleteCharacter('hero.json');
    await api.readCharacterGroups();
    await api.saveCharacterGroups({ groups: [], ungroupedExpanded: true });
    api.onAppWillClose(callback);
    await api.confirmClose();
    api.setZoomFactor(1.25);
    await api.selectDirectory();
    await api.exportCharacter('E:/exports', 'hero.json', '{}');
    await api.writeLog({ level: 'info', scope: 'renderer', namespace: 'test', message: 'hello' });

    expect(invoke).toHaveBeenNthCalledWith(1, 'save-character', 'hero.json', '{}');
    expect(invoke).toHaveBeenNthCalledWith(2, 'load-all-characters');
    expect(invoke).toHaveBeenNthCalledWith(3, 'delete-character', 'hero.json');
    expect(invoke).toHaveBeenNthCalledWith(4, 'read-character-groups');
    expect(invoke).toHaveBeenNthCalledWith(5, 'save-character-groups', { groups: [], ungroupedExpanded: true });
    expect(on).toHaveBeenCalledWith('app-will-close', callback);
    expect(invoke).toHaveBeenNthCalledWith(6, 'app-can-close');
    expect(setZoomFactor).toHaveBeenCalledWith(1.25);
    expect(invoke).toHaveBeenNthCalledWith(7, 'select-directory');
    expect(invoke).toHaveBeenNthCalledWith(8, 'export-character', 'E:/exports', 'hero.json', '{}');
    expect(invoke).toHaveBeenNthCalledWith(9, 'write-log', {
      level: 'info',
      scope: 'renderer',
      namespace: 'test',
      message: 'hello',
    });
  });
});
