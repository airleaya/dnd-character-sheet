// @vitest-environment jsdom

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import LibraryTooltip from '../src/components/sidebar/LibraryTooltip.vue';

describe('LibraryTooltip UI', () => {
  it('shows container capacity on the item display card', () => {
    const wrapper = mount(LibraryTooltip, {
      props: {
        type: 'item',
        position: { x: 20, y: 20 },
        item: {
          name: '背包',
          type: 'container',
          weight: 5,
          cost: { value: 2, unit: 'gp' },
          capacityWeight: 30,
          capacityVolume: '1立方尺',
          description: '这是来自冒险装备的背包物品。',
        },
      },
    });

    expect(wrapper.text()).toContain('容量: 30 lb；1立方尺');
  });

  it('keeps source volume-only container capacity text intact', () => {
    const wrapper = mount(LibraryTooltip, {
      props: {
        type: 'item',
        position: { x: 20, y: 20 },
        item: {
          name: '粗腰桶',
          type: 'container',
          weight: 70,
          cost: { value: 2, unit: 'gp' },
          capacityVolume: '40加仑液体，4立方尺固体',
          description: '这是来自容器的粗腰桶物品。',
        },
      },
    });

    expect(wrapper.text()).toContain('容量: 40加仑液体，4立方尺固体');
  });

  it('marks item descriptions as line-break preserving', () => {
    const wrapper = mount(LibraryTooltip, {
      props: {
        type: 'item',
        position: { x: 20, y: 20 },
        item: {
          name: '自定义卷轴',
          type: 'consumable',
          weight: 0,
          cost: { value: 0, unit: 'gp' },
          description: '第一行描述\n第二行描述',
        },
      },
    });

    const description = wrapper.find('.desc-paragraph');
    expect(description.classes()).toContain('preserve-user-lines');
    expect(description.element.textContent).toBe('第一行描述\n第二行描述');
  });

  it('applies magic visual style to item library tooltip headers', () => {
    const wrapper = mount(LibraryTooltip, {
      props: {
        type: 'item',
        position: { x: 20, y: 20 },
        item: {
          name: '星辉短剑',
          type: 'weapon',
          category: 'simple_melee',
          damage: '1d4',
          damageType: 'piercing',
          properties: [],
          weight: 1,
          cost: { value: 0, unit: 'gp' },
          description: '',
          magic: {
            isMagic: true,
            magicBonus: 1,
            visuals: {
              inventoryBackground: '#3a175f',
              nameColor: '#ffe0a3',
            },
          },
        },
      },
    });

    const header = wrapper.get('.card-header');
    expect(header.classes()).toContain('magic');
    expect(header.attributes('style')).toContain('background-color: rgb(58, 23, 95)');
    expect(wrapper.text()).toContain('星辉短剑+1');
  });

  it('caps library tooltip height to the viewport for internal scrolling', () => {
    const originalHeight = window.innerHeight;
    Object.defineProperty(window, 'innerHeight', { value: 240, configurable: true });
    const wrapper = mount(LibraryTooltip, {
      props: {
        type: 'item',
        position: { x: 20, y: 20 },
        item: {
          name: '长文本卷轴',
          type: 'consumable',
          weight: 0,
          cost: { value: 0, unit: 'gp' },
          description: Array.from({ length: 50 }, (_, index) => `line ${index}`).join('\n'),
        },
      },
    });

    expect(wrapper.get('.item-tooltip-card').attributes('style')).toContain('max-height: 216px');
    Object.defineProperty(window, 'innerHeight', { value: originalHeight, configurable: true });
  });

  it('shows detailed magic trait effects for enchanted library items', () => {
    const wrapper = mount(LibraryTooltip, {
      props: {
        type: 'item',
        position: { x: 20, y: 20 },
        item: {
          name: '寒霜长剑',
          type: 'weapon',
          category: 'martial_melee',
          damage: '1d8',
          damageType: 'slashing',
          properties: [],
          weight: 3,
          cost: { value: 0, unit: 'gp' },
          description: '',
          magic: {
            isMagic: true,
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
          },
        },
      },
    });

    expect(wrapper.text()).toContain('附魔词条');
    expect(wrapper.text()).toContain('寒霜');
    expect(wrapper.text()).toContain('命中时爆发寒气。');
    expect(wrapper.text()).toContain('伤害：1d6 +2 寒冷 (Cold)');
  });

  it('prefers edited third-party pack descriptions over stale imported description blocks', () => {
    const wrapper = mount(LibraryTooltip, {
      props: {
        type: 'item',
        position: { x: 20, y: 20 },
        item: {
          id: 'custom-pack:quarterstaff',
          name: '古老附魔的长棍-光',
          type: 'weapon',
          category: 'simple_melee',
          damage: '1d6',
          damageType: 'bludgeoning',
          properties: ['versatile'],
          weight: 4,
          cost: { value: 289, unit: 'gp' },
          description: '由明大师携带到岛上的橡木硬化手杖。\n这是自定义描述。',
          descriptionBlocks: [
            { type: 'paragraph', text: '这是来自PHB玩家手册的武器物品。' },
            { type: 'paragraph', text: '简单近战武器，两用。' },
          ],
        },
      },
    });

    expect(wrapper.text()).toContain('由明大师携带到岛上的橡木硬化手杖。');
    expect(wrapper.text()).toContain('这是自定义描述。');
    expect(wrapper.text()).not.toContain('这是来自PHB玩家手册的武器物品。');
  });
});
