// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import CombatPanel from '../src/components/sheet/combat/CombatPanel.vue';
import { useActiveSheetStore } from '../src/stores/activeSheet';
import { createDefaultCharacter } from '../src/utils/characterMigration';

describe('CombatPanel jack of all trades initiative badge', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  it('shows the jack of all trades badge when initiative receives the bonus', () => {
    const activeSheet = useActiveSheetStore();
    const character = createDefaultCharacter('combat-panel-jack');
    character.profile.level = 5;
    character.profile.classes = [{ classId: 'b', subclassId: null, level: 2 }];
    character.stats.dex = 14;
    activeSheet.character = character;

    const wrapper = mount(CombatPanel, {
      global: {
        plugins: [pinia],
        stubs: {
          EditableText: true,
        },
      },
    });

    expect(wrapper.text()).toContain('+3');
    expect(wrapper.find('.jack-chip').exists()).toBe(true);
    expect(wrapper.find('.jack-chip').text()).toBe('万');
  });
});
