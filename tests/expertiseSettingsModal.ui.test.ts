// @vitest-environment jsdom

import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import ExpertiseSettingsModal from '../src/components/sheet/modals/ExpertiseSettingsModal.vue';
import { useActiveSheetStore } from '../src/stores/activeSheet';
import { createDefaultCharacter } from '../src/utils/characterMigration';

describe('ExpertiseSettingsModal UI', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('shows proficient skills, proficient tools, and custom expertise entries', () => {
    const store = useActiveSheetStore();
    store.character = createDefaultCharacter('expertise-modal-1');
    store.character.skillProficiencies.perception = true;
    store.character.proficiencies.tools = ['盗贼工具'];
    store.character.expertise.custom = ['异界文献'];

    const wrapper = mount(ExpertiseSettingsModal, {
      props: { isOpen: true },
      global: {
        stubs: {
          teleport: true,
          transition: true,
        },
      },
    });

    expect(wrapper.text()).toContain('觉察');
    expect(wrapper.text()).toContain('盗贼工具');
    expect(wrapper.text()).toContain('异界文献');
  });
});
