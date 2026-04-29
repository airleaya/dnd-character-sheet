// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import { defineComponent, h, nextTick } from 'vue';
import ActionsPanel from '../src/components/sheet/combat/ActionsPanel.vue';
import { useActiveSheetStore } from '../src/stores/activeSheet';
import { createDefaultCharacter } from '../src/utils/characterMigration';
import type { Character } from '../src/types/Character';

type ElectronApiMock = NonNullable<typeof window>['electronAPI'];

const DraggableStub = defineComponent({
  name: 'DraggableStub',
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        { class: 'draggable-stub' },
        props.modelValue.map((element, index) => slots.item?.({ element, index }))
      );
  },
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

describe('ActionsPanel attack picker modal', () => {
  let pinia: Pinia;
  let wrapper: VueWrapper | null = null;
  let electronApi: ElectronApiMock;

  const mountPanel = () => {
    wrapper = mount(ActionsPanel, {
      global: {
        plugins: [pinia],
        stubs: {
          teleport: true,
          transition: true,
          draggable: DraggableStub,
        },
      },
    });

    return wrapper;
  };

  const buildCharacter = (): Character => {
    const character = createDefaultCharacter('actions-panel-1');
    character.proficiencies.weapons = ['simple'];
    character.inventory.push({
      instanceId: 'dagger-1',
      templateId: 'dagger',
      name: 'Dagger',
      description: '',
      weight: 1,
      quantity: 1,
      type: 'weapon',
      data: {
        category: 'simple_melee',
        damage: '1d4',
        damageType: 'piercing',
        properties: ['finesse', 'light', 'thrown'],
        range: '20/60',
      },
    });
    character.inventory.push({
      instanceId: 'club-1',
      templateId: 'club',
      name: 'Club',
      description: '',
      weight: 2,
      quantity: 1,
      type: 'weapon',
      data: {
        category: 'simple_melee',
        damage: '1d4',
        damageType: 'bludgeoning',
        properties: ['light'],
        range: '5',
      },
    });
    return character;
  };

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

  it('opens the picker modal and toggles attack selection by clicking the card', async () => {
    const activeSheet = useActiveSheetStore();
    activeSheet.character = buildCharacter();

    mountPanel();
    await nextTick();

    expect(activeSheet.attackCatalog.length).toBeGreaterThan(0);
    expect(wrapper?.find('[data-test="attack-picker-overlay"]').exists()).toBe(false);

    await wrapper!.get('[data-test="open-attack-picker"]').trigger('click');
    await nextTick();

    expect(wrapper?.find('[data-test="attack-picker-overlay"]').exists()).toBe(true);

    const firstKey = activeSheet.attackCatalog[0]!.catalogKey;
    await wrapper!.get(`[data-test="picker-card-${firstKey}"]`).trigger('click');
    await nextTick();

    expect(activeSheet.selectedAttackKeys).toEqual([firstKey]);
    expect(activeSheet.selectedAttacks).toHaveLength(1);

    await wrapper!.get('[data-test="picker-filter-selected"]').trigger('click');
    await nextTick();

    expect(wrapper!.findAll('[data-test^="picker-card-"]')).toHaveLength(1);
    expect(wrapper!.find(`[data-test="picker-card-${firstKey}"]`).exists()).toBe(true);

    await wrapper!.get('[data-test="picker-filter-unselected"]').trigger('click');
    await nextTick();

    expect(wrapper!.find(`[data-test="picker-card-${firstKey}"]`).exists()).toBe(false);
    expect(wrapper!.findAll('[data-test^="picker-card-"]').length).toBeGreaterThan(0);

    await wrapper!.get('[data-test="picker-filter-all"]').trigger('click');
    await nextTick();

    await wrapper!.get(`[data-test="picker-card-${firstKey}"]`).trigger('click');
    await nextTick();

    expect(activeSheet.selectedAttackKeys).toEqual([]);
    expect(activeSheet.selectedAttacks).toHaveLength(0);

    await wrapper!.get('[data-test="attack-picker-close"]').trigger('click');
    await nextTick();

    expect(wrapper?.find('[data-test="attack-picker-overlay"]').exists()).toBe(false);
  });

  it('closes the picker modal on Escape', async () => {
    const activeSheet = useActiveSheetStore();
    activeSheet.character = buildCharacter();

    mountPanel();
    await nextTick();

    await wrapper!.get('[data-test="open-attack-picker"]').trigger('click');
    await nextTick();

    expect(wrapper?.find('[data-test="attack-picker-overlay"]').exists()).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await nextTick();

    expect(wrapper?.find('[data-test="attack-picker-overlay"]').exists()).toBe(false);
  });

  it('opens the unarmed strike editor from the attack panel and picker modal', async () => {
    const activeSheet = useActiveSheetStore();
    activeSheet.character = buildCharacter();

    mountPanel();
    await nextTick();

    await wrapper!.get('[data-test="open-unarmed-editor"]').trigger('click');
    await nextTick();

    expect(wrapper?.find('[data-test="unarmed-editor-overlay"]').exists()).toBe(true);
    expect(wrapper?.text()).toContain('词条只是说明来源');
    expect(wrapper?.findAll('[data-test="unarmed-editor-row"]')).toHaveLength(1);

    await wrapper!.get('[data-test="add-unarmed-strike"]').trigger('click');
    await nextTick();

    expect(activeSheet.character?.unarmedStrikes.length).toBe(2);

    await wrapper!.get('[data-test="unarmed-editor-close"]').trigger('click');
    await nextTick();

    await wrapper!.get('[data-test="open-attack-picker"]').trigger('click');
    await nextTick();
    await wrapper!.get('[data-test="picker-open-unarmed-editor"]').trigger('click');
    await nextTick();

    expect(wrapper?.find('[data-test="unarmed-editor-overlay"]').exists()).toBe(true);
  });

  it('renders selected attacks with drag handles for manual ordering', async () => {
    const activeSheet = useActiveSheetStore();
    activeSheet.character = buildCharacter();

    mountPanel();
    await nextTick();

    const firstKey = activeSheet.attackCatalog[0]!.catalogKey;
    const secondKey = activeSheet.attackCatalog[1]!.catalogKey;
    activeSheet.selectAttack(firstKey);
    activeSheet.selectAttack(secondKey);
    await nextTick();

    expect(wrapper!.findAll('.attack-drag-handle')).toHaveLength(2);
    expect(wrapper!.find(`[data-test="selected-attack-${firstKey}"]`).exists()).toBe(true);
    expect(wrapper!.find(`[data-test="selected-attack-${secondKey}"]`).exists()).toBe(true);
  });
});
