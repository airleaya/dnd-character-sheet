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
});
