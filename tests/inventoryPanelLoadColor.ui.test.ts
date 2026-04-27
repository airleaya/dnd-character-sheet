// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import InventoryPanel from '../src/components/sheet/inventory/InventoryPanel.vue';
import { useActiveSheetStore } from '../src/stores/activeSheet';
import { createDefaultCharacter } from '../src/utils/characterMigration';
import type { InventoryItem } from '../src/types/Item';

const createGear = (weight: number): InventoryItem => ({
  instanceId: `gear-${weight}`,
  templateId: `gear-${weight}`,
  name: `Gear ${weight}`,
  description: '',
  weight,
  quantity: 1,
  type: 'gear',
  data: {},
});

const mountInventoryPanel = () =>
  mount(InventoryPanel, {
    global: {
      stubs: {
        draggable: {
          props: ['modelValue'],
          template: '<div><slot v-for="element in modelValue" name="item" :element="element" /></div>',
        },
        InventoryItemRow: true,
        TrashPanel: true,
        teleport: true,
        transition: true,
      },
    },
  });

describe('InventoryPanel carrying load color', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    Object.defineProperty(window, 'electronAPI', {
      value: {
        saveCharacter: vi.fn().mockResolvedValue({ success: true, data: null }),
        loadAllCharacters: vi.fn().mockResolvedValue({ success: true, data: [] }),
        deleteCharacter: vi.fn().mockResolvedValue({ success: true, data: null }),
      },
      configurable: true,
    });
  });

  it('marks the carrying header with the matching load class', () => {
    const store = useActiveSheetStore();
    const character = createDefaultCharacter('load-color-1');
    character.stats.str = 10;
    character.inventory = [createGear(80)];
    store.character = character;

    const wrapper = mountInventoryPanel();

    expect(wrapper.get('.carrying-load').classes()).toContain('load-yellow');
    expect(wrapper.get('.carrying-load').text()).toContain('80.0 / 150 lb');
  });

  it('uses red only after the load exceeds capacity', () => {
    const store = useActiveSheetStore();
    const character = createDefaultCharacter('load-color-2');
    character.stats.str = 10;
    character.inventory = [createGear(151)];
    store.character = character;

    const wrapper = mountInventoryPanel();

    expect(wrapper.get('.carrying-load').classes()).toContain('load-red');
  });
});
