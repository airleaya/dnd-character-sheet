// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import HeaderInfo from '../src/components/sheet/bio/HeaderInfo.vue';
import { useActiveSheetStore } from '../src/stores/activeSheet';
import { useTooltipStore } from '../src/stores/tooltip';
import { createDefaultCharacter } from '../src/utils/characterMigration';

describe('HeaderInfo proficiency tooltip', () => {
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

  it('does not show skills or saving throws in the proficiency hover tooltip', async () => {
    const store = useActiveSheetStore();
    const character = createDefaultCharacter('header-proficiency-tooltip');
    character.skillProficiencies.perception = true;
    character.savingThrows.dex = true;
    character.proficiencies.armor = ['light'];
    character.proficiencies.weapons = ['simple'];
    character.proficiencies.tools = ['盗贼工具'];
    character.proficiencies.languages = ['通用语'];
    store.character = character;

    const wrapper = mount(HeaderInfo, {
      global: {
        stubs: {
          EditableText: true,
          ProficiencySettingsModal: true,
          ExpertiseSettingsModal: true,
          BioPanel: true,
          ClassSelector: true,
          XpProgressBar: true,
          AlignmentPicker: true,
        },
      },
    });

    await wrapper.get('.btn-settings').trigger('mouseenter', {
      clientX: 10,
      clientY: 20,
    });

    const tooltip = useTooltipStore();
    const labels = tooltip.data.sections?.map((section) => section.label);
    const flattenedItems = tooltip.data.sections?.flatMap((section) => section.items) ?? [];

    expect(labels).toEqual(['护甲', '武器', '工具', '语言']);
    expect(flattenedItems).not.toContain('察觉');
    expect(flattenedItems).not.toContain('敏捷豁免');
  });
});
