import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createDefaultCharacter } from '../src/utils/characterMigration';
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

describe('characterStore persistence flows', () => {
  let persistedFiles: Map<string, Character>;
  let electronApi: ElectronApiMock;

  beforeEach(() => {
    persistedFiles = new Map<string, Character>();
    setActivePinia(createPinia());

    const localStorageMock = createLocalStorageMock();
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
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

  it('persists edited characters by id filename and reloads them after init', async () => {
    const store = useCharacterStore();
    const character = createDefaultCharacter('persisted-1');
    character.profile.name = 'Reloaded Hero';
    character.profile.level = 4;

    await store.saveCharacterData(character);

    expect(persistedFiles.has('persisted-1.json')).toBe(true);
    expect(store.characterList[0]?.name).toBe('Reloaded Hero');

    setActivePinia(createPinia());
    const reloadedStore = useCharacterStore();
    await reloadedStore.init();

    expect(reloadedStore.characterList).toHaveLength(1);
    expect(reloadedStore.getCharacterData('persisted-1')?.profile.name).toBe('Reloaded Hero');
    expect(reloadedStore.getCharacterData('persisted-1')?.profile.level).toBe(4);
  });

  it('imports legacy characters into normalized persisted records with a new id', async () => {
    const store = useCharacterStore();
    const importedId = await store.importCharacter(
      JSON.stringify({
        id: 'legacy-source-id',
        profile: {
          name: 'Legacy Import',
          race: 'Human',
          classes: [],
          level: 2,
          xp: 300,
        },
        combat: {
          hpCurrent: 6,
          hpMax: 11,
          hitDiceType: 'd8',
          hitDiceCurrent: 1,
          hitDiceMax: 2,
        },
      })
    );

    expect(importedId).toBeTruthy();
    expect(importedId).not.toBe('legacy-source-id');
    expect(store.characterList).toHaveLength(1);

    const importedCharacter = store.getCharacterData(importedId!);
    expect(importedCharacter?.combat.hitDice).toEqual({ d8: { current: 1, max: 2 } });
    expect(persistedFiles.has(`${importedId}.json`)).toBe(true);
  });

  it('deletes persisted characters and removes them from groups', async () => {
    const store = useCharacterStore();
    const character = createDefaultCharacter('delete-1');
    character.profile.name = 'Delete Me';
    await store.saveCharacterData(character);

    store.groups = [
      {
        id: 'group-1',
        name: 'Group 1',
        characterIds: ['delete-1'],
        isExpanded: true,
      },
    ];

    await store.deleteCharacter('delete-1');

    expect(store.characterList).toHaveLength(0);
    expect(store.getCharacterData('delete-1')).toBeNull();
    expect(persistedFiles.has('delete-1.json')).toBe(false);
    expect(store.groups[0]?.characterIds).toEqual([]);
  });

  it('exports characters with a sanitized human-readable filename', async () => {
    const store = useCharacterStore();
    const character = createDefaultCharacter('export-1');
    character.profile.name = 'Mage:/?*';
    character.profile.level = 7;
    await store.saveCharacterData(character);

    const exported = store.exportCharacter('export-1');

    expect(exported?.filename).toBe('Mage_____Lv7.json');
    expect(JSON.parse(exported!.json).profile.name).toBe('Mage:/?*');
  });
});
