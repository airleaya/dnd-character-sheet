// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import { nextTick } from 'vue';
import GlobalTooltip from '../src/components/ui/GlobalTooltip.vue';
import {
  getTooltipViewportPosition,
  useTooltipStore,
} from '../src/stores/tooltip';

describe('GlobalTooltip UI', () => {
  let pinia: Pinia;
  let wrapper: VueWrapper | null = null;

  const mountTooltip = () => {
    wrapper = mount(GlobalTooltip, {
      global: {
        plugins: [pinia],
      },
    });

    return wrapper;
  };

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  afterEach(() => {
    const tooltip = useTooltipStore();
    tooltip.hide();
    wrapper?.unmount();
    wrapper = null;
  });

  it('renders legacy text-only tooltip content', async () => {
    const tooltip = useTooltipStore();
    mountTooltip();

    tooltip.show({ title: 'Light', content: 'Use it with care.' }, 20, 40);
    await nextTick();

    expect(wrapper?.text()).toContain('Light');
    expect(wrapper?.text()).toContain('Use it with care.');
    expect(wrapper?.find('.tooltip-content').exists()).toBe(true);
  });

  it('marks tooltip text as line-break preserving for user-authored descriptions', async () => {
    const tooltip = useTooltipStore();
    mountTooltip();

    tooltip.show(
      {
        title: '自定义说明',
        content: '第一行\n第二行',
        sections: [{ label: '附加效果', items: ['效果一\n效果二'] }],
      },
      20,
      40
    );
    await nextTick();

    expect(wrapper?.find('.tooltip-content').classes()).toContain('preserve-user-lines');
    expect(wrapper?.find('.section-item').classes()).toContain('preserve-user-lines');
    expect(wrapper?.find('.tooltip-content').element.textContent).toBe('第一行\n第二行');
  });

  it('renders structured sections for attack detail tooltips', async () => {
    const tooltip = useTooltipStore();
    mountTooltip();

    tooltip.show(
      {
        title: 'Rapier (Dexterity)',
        sections: [
          { label: 'Attack Path', items: ['Ability: Dexterity', 'Mode: Base attack'] },
          { label: 'Tactical Info', items: ['Range: 5 ft', 'Properties: Finesse'] },
        ],
      },
      12,
      18
    );
    await nextTick();

    expect(wrapper?.text()).toContain('Rapier (Dexterity)');
    expect(wrapper?.text()).toContain('Attack Path');
    expect(wrapper?.text()).toContain('Ability: Dexterity');
    expect(wrapper?.text()).toContain('Tactical Info');
    expect(wrapper?.findAll('.tooltip-section')).toHaveLength(2);
  });

  it('clamps tooltip position within the viewport', () => {
    expect(
      getTooltipViewportPosition({
        x: 490,
        y: 390,
        tooltipWidth: 320,
        tooltipHeight: 280,
        viewportWidth: 500,
        viewportHeight: 400,
      })
    ).toEqual({ left: 168, top: 108 });

    expect(
      getTooltipViewportPosition({
        x: -30,
        y: -20,
        tooltipWidth: 180,
        tooltipHeight: 120,
        viewportWidth: 800,
        viewportHeight: 600,
      })
    ).toEqual({ left: 12, top: 12 });
  });
});
