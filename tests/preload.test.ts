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
      exportCharacterPackage: (dirPath: string, character: unknown) => Promise<unknown>;
      importCharacterPackage: (bytes: Uint8Array, newCharacterId: string) => Promise<unknown>;
      saveCharacterAvatar: (
        characterId: string,
        bytes: Uint8Array,
        dimensions?: { width: number; height: number },
        previousAssetId?: string
      ) => Promise<unknown>;
      readCharacterAvatar: (characterId: string, assetId: string, size?: string) => Promise<unknown>;
      saveCharacterAvatarRendition: (
        characterId: string,
        assetId: string,
        size: string,
        bytes: Uint8Array,
        dimensions?: { width: number; height: number }
      ) => Promise<unknown>;
      deleteCharacterAvatar: (characterId: string, assetId?: string) => Promise<unknown>;
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
    await api.exportCharacterPackage('E:/exports', { id: 'hero' });
    await api.importCharacterPackage(new Uint8Array([1]), 'new-hero');
    await api.saveCharacterAvatar('hero', new Uint8Array([2]), { width: 640, height: 852 }, 'old-avatar');
    await api.readCharacterAvatar('hero', 'avatar', 'large');
    await api.saveCharacterAvatarRendition('hero', 'avatar', 'small', new Uint8Array([3]), { width: 80, height: 106 });
    await api.deleteCharacterAvatar('hero', 'avatar');
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
    expect(invoke).toHaveBeenNthCalledWith(9, 'export-character-package', 'E:/exports', { id: 'hero' });
    expect(invoke).toHaveBeenNthCalledWith(10, 'import-character-package', new Uint8Array([1]), 'new-hero');
    expect(invoke).toHaveBeenNthCalledWith(
      11,
      'save-character-avatar',
      'hero',
      new Uint8Array([2]),
      { width: 640, height: 852 },
      'old-avatar'
    );
    expect(invoke).toHaveBeenNthCalledWith(12, 'read-character-avatar', 'hero', 'avatar', 'large');
    expect(invoke).toHaveBeenNthCalledWith(
      13,
      'save-character-avatar-rendition',
      'hero',
      'avatar',
      'small',
      new Uint8Array([3]),
      { width: 80, height: 106 }
    );
    expect(invoke).toHaveBeenNthCalledWith(14, 'delete-character-avatar', 'hero', 'avatar');
    expect(invoke).toHaveBeenNthCalledWith(15, 'write-log', {
      level: 'info',
      scope: 'renderer',
      namespace: 'test',
      message: 'hello',
    });
  });
});
