// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import InventoryItemRow from '../src/components/sheet/inventory/InventoryItemRow.vue';
import { useActiveSheetStore } from '../src/stores/activeSheet';
import { createDefaultCharacter } from '../src/utils/characterMigration';
import type { InventoryItem } from '../src/types/Item';

const createContainer = (instanceId: string, name = 'Backpack'): InventoryItem => ({
  instanceId,
  templateId: 'backpack',
  name,
  description: '',
  weight: 5,
  quantity: 1,
  type: 'container',
  data: {
    capacityVolume: '30 lb',
  },
});

const createGear = (
  instanceId: string,
  name: string,
  parentId: string,
  quantity = 1,
  containerSlot?: InventoryItem['containerSlot']
): InventoryItem => ({
  instanceId,
  templateId: instanceId,
  name,
  description: '',
  weight: 1,
  quantity,
  type: 'gear',
  parentId,
  containerSlot,
  data: {},
});

const mountRow = (item: InventoryItem) =>
  mount(InventoryItemRow, {
    props: { item },
    global: {
      stubs: {
        draggable: {
          props: ['modelValue'],
          template: '<div><slot name="header" /><slot v-for="element in modelValue" name="item" :element="element" /></div>',
        },
      },
    },
  });

describe('InventoryItemRow container content preview', () => {
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

  it('renders every contained item in the row preview while leaving overflow to CSS ellipsis', () => {
    const store = useActiveSheetStore();
    const character = createDefaultCharacter('container-preview-full');
    const container = createContainer('container-1');
    const arrow = createGear('arrow-1', 'Arrow', container.instanceId, 20);
    const vial = createGear('vial-1', 'Vial', container.instanceId);
    const bow = createGear('bow-1', 'Bow', container.instanceId);
    character.inventory = [container, arrow, vial, bow];
    store.character = character;

    const wrapper = mountRow(container);
    const badge = wrapper.find('.container-badge');

    expect(badge.text()).toContain('Arrow x20');
    expect(badge.text()).toContain('Vial');
    expect(badge.text()).toContain('Bow');
    expect(badge.text()).not.toContain('另');
    expect(wrapper.find('.qty-static').text()).toBe('--');
    expect(wrapper.find('.btn-mini.plus').exists()).toBe(false);
  });

  it('shows quantity controls for ordinary non-consumable items', async () => {
    const store = useActiveSheetStore();
    const character = createDefaultCharacter('ordinary-item-stackable');
    const sword = createGear('sword-1', 'Longsword', '', 1);
    sword.parentId = undefined;
    sword.type = 'weapon';
    character.inventory = [sword];
    store.character = character;

    const wrapper = mountRow(sword);

    expect(wrapper.find('.qty-val').text()).toBe('1');

    await wrapper.find('.btn-mini.plus').trigger('click');

    expect(sword.quantity).toBe(2);
    expect(wrapper.find('.qty-val').text()).toBe('2');
  });

  it('shows self quantity controls for empty containers', async () => {
    const store = useActiveSheetStore();
    const character = createDefaultCharacter('empty-container-stackable');
    const container = createContainer('container-empty');
    character.inventory = [container];
    store.character = character;

    const wrapper = mountRow(container);

    expect(wrapper.find('.container-badge').text()).toContain('空');
    expect(wrapper.find('.qty-val').text()).toBe('1');

    await wrapper.find('.btn-mini.plus').trigger('click');

    expect(container.quantity).toBe(2);
    expect(wrapper.find('.qty-val').text()).toBe('2');
  });

  it('proxies quantity controls only when the container has exactly one content item', async () => {
    const store = useActiveSheetStore();
    const character = createDefaultCharacter('container-proxy-single');
    const container = createContainer('container-2');
    const vial = createGear('vial-2', 'Vial', container.instanceId, 2);
    character.inventory = [container, vial];
    store.character = character;

    const wrapper = mountRow(container);

    expect(wrapper.find('.container-badge').text()).toContain('Vial x2');
    expect(wrapper.find('.qty-val').text()).toBe('2');

    await wrapper.find('.btn-mini.plus').trigger('click');

    expect(vial.quantity).toBe(3);
    expect(container.quantity).toBe(1);
    expect(wrapper.find('.qty-val').text()).toBe('3');
  });

  it('counts hanging-slot items when deciding whether quantity proxying is ambiguous', () => {
    const store = useActiveSheetStore();
    const character = createDefaultCharacter('container-proxy-hanging');
    const container = createContainer('container-3');
    const arrow = createGear('arrow-3', 'Arrow', container.instanceId, 20);
    const bow = createGear('bow-3', 'Bow', container.instanceId, 1, 'hanging');
    character.inventory = [container, arrow, bow];
    store.character = character;

    const wrapper = mountRow(container);
    const badgeText = wrapper.find('.container-badge').text();

    expect(badgeText).toContain('Arrow x20');
    expect(badgeText).toContain('悬挂 Bow');
    expect(wrapper.find('.qty-static').text()).toBe('--');
    expect(wrapper.find('.btn-mini.plus').exists()).toBe(false);
  });
});
