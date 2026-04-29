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
    capacityWeight: 30,
    capacityVolume: '1立方尺',
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
        writeLog: vi.fn().mockResolvedValue({ success: true, data: null }),
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

    expect(badge.text()).toContain('容量：30 lb；1立方尺');
    expect(badge.text()).toContain('Arrow x20');
    expect(badge.text()).toContain('Vial');
    expect(badge.text()).toContain('Bow');
    expect(badge.text()).not.toContain('另');
    expect(wrapper.find('.col-weight').text()).toBe('5.0 + 22.0 lb');
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
    expect(wrapper.find('.col-weight').text()).toBe('5.0 + 0.0 lb');
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

  it('shows ignored container content weight as zero in the decomposed weight label', () => {
    const store = useActiveSheetStore();
    const character = createDefaultCharacter('ignored-content-weight-label');
    const container = createContainer('quiver-1', 'Quiver');
    container.data = { ...container.data, ignoreContentWeight: true };
    const arrows = createGear('arrows-1', 'Arrow', container.instanceId, 20);
    character.inventory = [container, arrows];
    store.character = character;

    const wrapper = mountRow(container);

    expect(wrapper.find('.container-badge').text()).toContain('Arrow x20');
    expect(wrapper.find('.col-weight').text()).toBe('5.0 + 0.0 lb');
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

  it('shows custom item name with the Chinese template name as a light subtitle', () => {
    const store = useActiveSheetStore();
    const character = createDefaultCharacter('custom-template-subtitle');
    const dagger = createGear('custom-dagger-1', '影牙', '', 1);
    dagger.templateId = 'dagger';
    dagger.parentId = undefined;
    dagger.type = 'weapon';
    dagger.data = {
      category: 'simple_melee',
      damage: '1d4',
      damageType: 'piercing',
      properties: ['finesse', 'light', 'thrown'],
      range: '20/60',
    };
    character.inventory = [dagger];
    store.character = character;

    const wrapper = mountRow(dagger);

    expect(wrapper.find('.name-text').text()).toBe('影牙');
    expect(wrapper.find('.template-name').text()).toBe('（匕首）');
  });

  it('renders magic item default colors and explicit +0 in the display name', () => {
    const store = useActiveSheetStore();
    const character = createDefaultCharacter('magic-visual-row');
    const dagger = createGear('magic-dagger-row', '匕首', '', 1);
    dagger.parentId = undefined;
    dagger.type = 'weapon';
    dagger.templateId = 'dagger';
    dagger.magic = { isMagic: true, magicBonus: 0 };
    dagger.data = {
      category: 'simple_melee',
      damage: '1d4',
      damageType: 'piercing',
      properties: ['finesse', 'light', 'thrown'],
      range: '20/60',
    };
    character.inventory = [dagger];
    store.character = character;

    const wrapper = mountRow(dagger);
    const rowStyle = wrapper.find('.item-row').attributes('style') ?? '';
    const nameStyle = wrapper.find('.name-text').attributes('style') ?? '';

    expect(wrapper.find('.name-text').text()).toBe('匕首+0');
    expect(rowStyle).toContain('background-color: rgb(240, 231, 255)');
    expect(nameStyle).toContain('color: rgb(139, 30, 63)');
  });

  it('shows selected enchantment trait names on magic inventory rows', () => {
    const store = useActiveSheetStore();
    const character = createDefaultCharacter('magic-trait-row');
    const dagger = createGear('magic-trait-dagger', '影牙', '', 1);
    dagger.parentId = undefined;
    dagger.type = 'weapon';
    dagger.templateId = 'dagger';
    dagger.magic = {
      isMagic: true,
      selectedTraitIds: ['frost'],
      customTraits: [
        {
          id: 'frost',
          source: 'custom',
          type: 'damage',
          name: '寒霜',
          description: '附着寒霜。',
          activationMode: 'always',
          participatesInDamage: true,
          damageDice: '1d6',
          damageType: 'cold',
        },
      ],
    };
    character.inventory = [dagger];
    store.character = character;

    const wrapper = mountRow(dagger);

    expect(wrapper.find('.enchant-tag').text()).toBe('寒霜');
  });

  it('uses the quantity control slot for attunement and enforces the three-item cap', async () => {
    const store = useActiveSheetStore();
    const character = createDefaultCharacter('attunement-row');
    const target = createGear('attune-target', '同调戒指', '', 1);
    target.parentId = undefined;
    target.magic = { isMagic: true, attunement: { requires: true } };
    const attunedItems = [1, 2, 3].map(index => {
      const item = createGear(`attuned-${index}`, `同调${index}`, '', 1);
      item.parentId = undefined;
      item.magic = { isMagic: true, attunement: { requires: true, attuned: true } };
      return item;
    });
    character.inventory = [target, ...attunedItems];
    store.character = character;

    const wrapper = mountRow(target);

    expect(wrapper.find('.qty-controls').exists()).toBe(false);
    expect(wrapper.find('.btn-attune').text()).toBe('同调');
    expect(store.attunedMagicItemCount).toBe(3);

    await wrapper.find('.btn-attune').trigger('click');

    expect(target.magic?.attunement?.attuned).not.toBe(true);
    expect(store.attunedMagicItemCount).toBe(3);
  });
});
