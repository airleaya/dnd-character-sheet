import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useActiveSheetStore } from '../src/stores/activeSheet';
import { useCharacterStore } from '../src/stores/characterStore';
import type { Character } from '../src/types/Character';

type ElectronApiMock = NonNullable<typeof window>['electronAPI'];

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const createLocalStorageMock = () => {
  const storage = new Map<string, string>();

  return {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => {
      storage.clear();
    },
  };
};

describe('activeSheet integration flow', () => {
  let persistedFiles: Map<string, Character>;
  let electronApi: ElectronApiMock;

  beforeEach(() => {
    persistedFiles = new Map<string, Character>();
    setActivePinia(createPinia());

    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true,
    });

    electronApi = {
      saveCharacter: async (filename, content) => {
        persistedFiles.set(filename, JSON.parse(content) as Character);
        return { success: true, data: null };
      },
      loadAllCharacters: async () => ({
        success: true,
        data: Array.from(persistedFiles.values()).map((character) => deepClone(character)),
      }),
      deleteCharacter: async (filename) => {
        persistedFiles.delete(filename);
        return { success: true, data: null };
      },
      onAppWillClose: () => undefined,
      confirmClose: async () => undefined,
      setZoomFactor: () => undefined,
      selectDirectory: async () => null,
      exportCharacter: async () => ({ success: true, data: null }),
    };

    Object.defineProperty(globalThis, 'window', {
      value: { electronAPI: electronApi },
      configurable: true,
    });
  });

  it('supports create, edit, save, reload, and delete through the combined store flow', async () => {
    const characterStore = useCharacterStore();
    const activeSheet = useActiveSheetStore();

    const createdId = await characterStore.createNewCharacter();
    activeSheet.loadCharacter(createdId);

    expect(activeSheet.character?.id).toBe(createdId);

    activeSheet.updateProfile('name', 'Integrated Hero');
    activeSheet.updateStat('dex', 16);
    activeSheet.addItem('arrows');
    activeSheet.learnSpell('shield');
    activeSheet.togglePreparedSpell('shield');

    const persistedCharacter = persistedFiles.get(`${createdId}.json`);
    expect(persistedCharacter?.profile.name).toBe('Integrated Hero');
    expect(persistedCharacter?.stats.dex).toBe(16);
    expect(persistedCharacter?.spells.known).toEqual(['shield']);
    expect(persistedCharacter?.spells.prepared).toEqual(['shield']);
    expect(persistedCharacter?.inventory.some((item) => item.templateId === 'quiver')).toBe(true);
    expect(
      persistedCharacter?.inventory.some(
        (item) => item.templateId === 'arrows' && item.quantity === 20 && Boolean(item.parentId)
      )
    ).toBe(true);

    setActivePinia(createPinia());
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true,
    });
    Object.defineProperty(globalThis, 'window', {
      value: { electronAPI: electronApi },
      configurable: true,
    });

    const reloadedCharacterStore = useCharacterStore();
    await reloadedCharacterStore.init();
    const reloadedActiveSheet = useActiveSheetStore();
    reloadedActiveSheet.loadCharacter(createdId);

    expect(reloadedActiveSheet.character?.profile.name).toBe('Integrated Hero');
    expect(reloadedActiveSheet.character?.stats.dex).toBe(16);
    expect(reloadedActiveSheet.character?.spells.known).toEqual(['shield']);
    expect(reloadedActiveSheet.character?.spells.prepared).toEqual(['shield']);

    await reloadedCharacterStore.deleteCharacter(createdId);
    expect(persistedFiles.has(`${createdId}.json`)).toBe(false);
    expect(reloadedCharacterStore.getCharacterData(createdId)).toBeNull();
  });
});
