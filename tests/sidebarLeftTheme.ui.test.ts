// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import { isProxy, nextTick } from 'vue';
import SidebarLeft from '../src/components/layout/SidebarLeft.vue';
import { useActiveSheetStore } from '../src/stores/activeSheet';
import { useCharacterStore } from '../src/stores/characterStore';
import { createDefaultCharacter } from '../src/utils/characterMigration';
import { APP_THEME_STORAGE_KEY, initializeAppTheme } from '../src/utils/appTheme';
import {
  CHARACTER_PACKAGE_FORMAT,
  CHARACTER_PACKAGE_VERSION,
  type CharacterPackagePayload,
} from '../src/types/CharacterPackage';

type ElectronApiMock = NonNullable<typeof window>['electronAPI'];

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

describe('SidebarLeft theme switcher', () => {
  let pinia: Pinia;
  let wrapper: VueWrapper | null = null;

  const mountSidebar = () => {
    wrapper = mount(SidebarLeft, {
      global: {
        plugins: [pinia],
      },
    });
    return wrapper;
  };

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    localStorage.clear();
    delete document.documentElement.dataset.theme;
    Object.defineProperty(window, 'focus', {
      value: vi.fn(),
      configurable: true,
    });

    const electronApi: Partial<ElectronApiMock> = {
      setZoomFactor: vi.fn(),
      selectDirectory: vi.fn(async () => null),
      exportCharacter: vi.fn(async () => ({ success: true, data: null } as const)),
      exportCharacterPackage: vi.fn(async () => ({ success: true, data: 'Hero_Lv1.json' } as const)),
      saveCharacter: vi.fn(async () => ({ success: true, data: null } as const)),
      importCharacterPackage: vi.fn(async (bytes, newCharacterId) => {
        const payload = JSON.parse(new TextDecoder().decode(bytes)) as CharacterPackagePayload;
        return {
          success: true,
          data: {
            ...payload.character,
            id: newCharacterId,
          },
        } as const;
      }),
      writeLog: vi.fn(async () => ({ success: true, data: null } as const)),
    };

    Object.defineProperty(window, 'electronAPI', {
      value: electronApi,
      configurable: true,
    });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    localStorage.clear();
    delete document.documentElement.dataset.theme;
    vi.restoreAllMocks();
  });

  it('shows the stored theme and persists user theme changes', async () => {
    localStorage.setItem(APP_THEME_STORAGE_KEY, 'night');
    initializeAppTheme();

    mountSidebar();
    await nextTick();

    const options = wrapper!.findAll('.theme-option');
    expect(options).toHaveLength(4);
    expect(options[0]!.text()).toBe('经典');
    expect(options[1]!.text()).toBe('夜间');
    expect(options[2]!.text()).toBe('拜占庭');
    expect(options[3]!.text()).toBe('蕾米莉亚');
    expect(options[1]!.classes()).toContain('active');
    expect(options[1]!.attributes('aria-pressed')).toBe('true');

    await options[0]!.trigger('click');
    await nextTick();

    expect(document.documentElement.dataset.theme).toBe('classic');
    expect(localStorage.getItem(APP_THEME_STORAGE_KEY)).toBe('classic');
    expect(options[0]!.classes()).toContain('active');

    await options[1]!.trigger('click');
    await nextTick();

    expect(document.documentElement.dataset.theme).toBe('night');
    expect(localStorage.getItem(APP_THEME_STORAGE_KEY)).toBe('night');

    await options[2]!.trigger('click');
    await nextTick();

    expect(document.documentElement.dataset.theme).toBe('byzantine');
    expect(localStorage.getItem(APP_THEME_STORAGE_KEY)).toBe('byzantine');

    await options[3]!.trigger('click');
    await nextTick();

    expect(document.documentElement.dataset.theme).toBe('remilia');
    expect(localStorage.getItem(APP_THEME_STORAGE_KEY)).toBe('remilia');
  });

  it('exports a plain character payload for Electron package backup', async () => {
    const electronApi = window.electronAPI as ElectronApiMock;
    const selectDirectory = vi.mocked(electronApi.selectDirectory);
    const exportCharacterPackage = vi.mocked(electronApi.exportCharacterPackage!);
    selectDirectory.mockResolvedValue('E:/exports');

    const activeStore = useActiveSheetStore();
    const character = createDefaultCharacter('export-ipc-1');
    character.profile.name = 'Export Hero';
    activeStore.character = character;

    mountSidebar();
    await nextTick();

    await wrapper!.get('.btn-export').trigger('click');

    expect(exportCharacterPackage).toHaveBeenCalledTimes(1);
    const [, exportedCharacter] = exportCharacterPackage.mock.calls[0]!;
    expect(exportedCharacter).not.toBe(activeStore.character);
    expect(isProxy(exportedCharacter)).toBe(false);
    expect(exportedCharacter.profile.name).toBe('Export Hero');
  });

  it('shows character avatars in the sidebar list', async () => {
    const characterStore = useCharacterStore();
    const character = createDefaultCharacter('sidebar-avatar-1');
    character.profile.name = 'Avatar Hero';
    character.profile.avatarUrl = 'blob:test-avatar';
    characterStore._characterCache.set(character.id, character);
    characterStore._filenameMap.set(character.id, `${character.id}.json`);
    characterStore.characterList.push({
      id: character.id,
      name: character.profile.name,
      playerName: character.profile.playerName,
      race: character.profile.race,
      level: character.profile.level,
      classes: character.profile.classes,
      avatar: character.profile.avatar,
      avatarUrl: character.profile.avatarUrl,
    });

    mountSidebar();
    await nextTick();

    const avatar = wrapper!.get('.sidebar-character-avatar');
    expect(avatar.find('img').attributes('src')).toBe('blob:test-avatar');
  });

  it('previews a backup json before importing it', async () => {
    const electronApi = window.electronAPI as ElectronApiMock;
    const saveCharacter = vi.mocked(electronApi.saveCharacter);
    const activeStore = useActiveSheetStore();
    const loadCharacter = vi.spyOn(activeStore, 'loadCharacter');
    const character = createDefaultCharacter('backup-source-1');
    character.profile.name = 'Import Preview Hero';
    character.profile.level = 7;
    character.profile.race = 'Tiefling';
    const payload: CharacterPackagePayload = {
      manifest: {
        format: CHARACTER_PACKAGE_FORMAT,
        version: CHARACTER_PACKAGE_VERSION,
        exportedAt: 123,
        characterId: character.id,
        preview: {
          name: character.profile.name,
          level: character.profile.level,
          race: character.profile.race,
        },
        assets: [],
      },
      character,
      embeddedAssets: [],
    };
    const file = new File([JSON.stringify(payload)], 'Import_Preview_Hero_Lv7.json', {
      type: 'application/json',
    });

    mountSidebar();
    await nextTick();

    const input = wrapper!.get('input[type="file"]').element as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      value: [file],
      configurable: true,
    });
    await wrapper!.get('input[type="file"]').trigger('change');
    await flushPromises();
    await nextTick();

    expect(wrapper!.get('.import-preview-modal h4').text()).toBe('Import Preview Hero');
    expect(saveCharacter).not.toHaveBeenCalled();

    await wrapper!.get('.import-preview-actions .primary-button').trigger('click');
    await flushPromises();
    await flushPromises();
    await nextTick();

    await vi.waitFor(() => {
      expect(saveCharacter).toHaveBeenCalledTimes(1);
    });
    const [filename, content] = saveCharacter.mock.calls[0]!;
    expect(filename).toMatch(/\.json$/);
    const saved = JSON.parse(content) as { profile: { name: string; level: number; race: string } };
    expect(saved.profile).toMatchObject({
      name: 'Import Preview Hero',
      level: 7,
      race: 'Tiefling',
    });
    expect(loadCharacter).toHaveBeenCalledWith(expect.any(String));
    expect(wrapper!.find('.import-preview-modal').exists()).toBe(false);
  });
});
