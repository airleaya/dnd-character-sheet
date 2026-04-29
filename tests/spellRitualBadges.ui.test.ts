// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import { defineComponent, nextTick } from 'vue';
import ActionsPanel from '../src/components/sheet/combat/ActionsPanel.vue';
import LibrarySpellsPanel from '../src/components/sheet/library/LibrarySpellsPanel.vue';
import { useActiveSheetStore } from '../src/stores/activeSheet';
import { createDefaultCharacter } from '../src/utils/characterMigration';
import type { Character } from '../src/types/Character';

type ElectronApiMock = NonNullable<typeof window>['electronAPI'];

const DraggableStub = defineComponent({
  name: 'DraggableStub',
  props: {
    list: {
      type: Array,
      required: true,
    },
  },
  template: '<div><slot v-for="element in list" name="item" :element="element" /></div>',
});

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

const buildRitualCaster = (): Character => {
  const character = createDefaultCharacter('ritual-badges-1');
  character.spells.known = ['alarm'];
  character.spells.prepared = ['alarm'];
  character.spells.slots.current[1] = 1;
  character.spells.slots.max[1] = 1;
  return character;
};

describe('spell ritual badges', () => {
  let pinia: Pinia;
  let wrapper: VueWrapper | null = null;
  let electronApi: ElectronApiMock;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);

    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true,
    });

    electronApi = {
      saveCharacter: async () => ({ success: true, data: null }),
      loadAllCharacters: async () => ({ success: true, data: [] }),
      deleteCharacter: async () => ({ success: true, data: null }),
      onAppWillClose: () => undefined,
      confirmClose: async () => undefined,
      setZoomFactor: () => undefined,
      selectDirectory: async () => null,
      exportCharacter: async () => ({ success: true, data: null }),
      writeLog: async () => ({ success: true, data: null }),
    };

    Object.defineProperty(window, 'electronAPI', {
      value: electronApi,
      configurable: true,
    });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    vi.restoreAllMocks();
  });

  it('shows a readable ritual badge in the spell library list', async () => {
    wrapper = mount(LibrarySpellsPanel, {
      props: {
        searchQuery: '警报术',
      },
      global: {
        plugins: [pinia],
        stubs: {
          draggable: DraggableStub,
        },
      },
    });
    await nextTick();

    expect(wrapper.text()).toContain('警报术');
    expect(wrapper.find('.badge.ritual').text()).toBe('仪式');
    expect(wrapper.find('.badge.ritual').attributes('title')).toBe('可作为仪式施放');
  });

  it('shows the ritual badge on combat spell cards before expansion', async () => {
    const activeSheet = useActiveSheetStore();
    activeSheet.character = buildRitualCaster();

    wrapper = mount(ActionsPanel, {
      global: {
        plugins: [pinia],
        stubs: {
          teleport: true,
          transition: true,
        },
      },
    });
    await nextTick();

    expect(wrapper.text()).toContain('警报术');
    expect(wrapper.find('.ritual-badge').text()).toBe('仪式');
    expect(wrapper.find('.card-detail').exists()).toBe(false);
  });
});
