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

  it('shows enchantment trait details in the inventory tooltip', async () => {
    const store = useActiveSheetStore();
    const character = createDefaultCharacter('tooltip-magic-traits');
    const item = createGear(1);
    item.name = '霜刃';
    item.type = 'weapon';
    item.magic = {
      isMagic: true,
      magicBonus: 1,
      rarity: 'rare',
      attunement: { requires: true, condition: '需要战士同调', attuned: false },
      visuals: {
        inventoryBackground: '#442266',
        attackBackground: '#663322',
        nameColor: '#ffeeaa',
      },
      selectedTraitIds: ['frost'],
      customTraits: [
        {
          id: 'frost',
          source: 'custom',
          type: 'damage',
          name: '寒霜',
          description: '命中时爆发寒气。',
          activationMode: 'always',
          participatesInDamage: true,
          damageDice: '1d6',
          damageBonus: 2,
          damageType: 'cold',
        },
      ],
    };
    character.inventory = [item];
    store.character = character;

    const wrapper = mountInventoryPanel();
    await wrapper.find('.item-row').trigger('mouseenter', { clientX: 20, clientY: 20 });

    expect(wrapper.text()).toContain('魔法属性');
    expect(wrapper.text()).toContain('魔法加值');
    expect(wrapper.text()).toContain('+1');
    expect(wrapper.text()).toContain('稀有 (rare)');
    expect(wrapper.text()).toContain('需要 · 未同调');
    expect(wrapper.text()).toContain('需要战士同调');
    expect(wrapper.findAll('.color-swatch')).toHaveLength(3);
    expect(wrapper.text()).toContain('附魔词条');
    expect(wrapper.text()).toContain('寒霜');
    expect(wrapper.text()).toContain('命中时爆发寒气。');
    expect(wrapper.text()).toContain('伤害：1d6 +2 寒冷 (Cold)');
  });
});
