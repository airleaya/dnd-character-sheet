// @vitest-environment jsdom

import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LibraryItemsPanel from '../src/components/sheet/library/LibraryItemsPanel.vue';
import { useDataPackStore } from '../src/stores/dataPackStore';
import type { RuntimeDataPack } from '../src/types/DataPack';

vi.mock('vuedraggable', () => ({
  default: {
    name: 'Draggable',
    props: ['list', 'itemKey'],
    template: `
      <div class="item-list">
        <slot name="item" v-for="element in list" :element="element" />
      </div>
    `,
  },
}));

const createPack = (): RuntimeDataPack => ({
  id: 'campaign',
  name: 'Campaign Pack',
  version: '1.0.0',
  builtin: false,
  enabled: true,
  sourceKind: 'imported',
  manifest: {
    schemaVersion: 1,
    id: 'campaign',
    name: 'Campaign Pack',
    version: '1.0.0',
  },
  editorMeta: {
    encryptionGroups: [{ id: 'dragon-door', name: 'dragon', lockedByDefault: true }],
  },
  itemMenuName: 'Campaign Pack',
  spellMenuName: 'Campaign Pack',
  items: [
    {
      id: 'campaign:torch',
      name: 'Torch',
      type: 'gear',
      displayCategory: 'Gear',
      displaySubcategory: 'Adventuring Gear',
      weight: 1,
      description: '',
    },
    {
      id: 'campaign:secret-blade',
      name: 'Secret Blade',
      type: 'weapon',
      displayCategory: 'Equipment',
      displaySubcategory: 'Weapon',
      cost: { value: 0, unit: 'gp' },
      weight: 3,
      description: '',
      category: 'martial_melee',
      damage: '1d8',
      damageType: 'slashing',
      properties: [],
      encryptionGroupId: 'dragon-door',
    },
  ],
  spells: [],
  traits: [],
});

describe('LibraryItemsPanel passphrase grouping', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    Object.defineProperty(window, 'electronAPI', {
      value: {
        writeLog: vi.fn(async () => ({ success: true, data: null })),
        updateDataPackUnlockProgress: vi.fn(async () => ({ success: true, data: null })),
      },
      configurable: true,
    });
  });

  it('groups only visible unlocked items by passphrase after the pack key button is clicked', async () => {
    const store = useDataPackStore();
    store.packs = [createPack()];
    store.settings = { enabledPackIds: ['campaign'], packOrder: ['campaign'] };

    const wrapper = mount(LibraryItemsPanel, {
      props: { searchQuery: '' },
    });

    expect(wrapper.text()).toContain('Torch');
    expect(wrapper.text()).not.toContain('Secret Blade');
    expect(wrapper.find('.passphrase-toggle').exists()).toBe(true);

    await wrapper.find('.passphrase-toggle').trigger('click');

    expect(wrapper.text()).toContain('公开内容');
    expect(wrapper.text()).not.toContain('dragon');

    store.unlockByPassphrase('dragon');
    await wrapper.unmount();
    const unlockedWrapper = mount(LibraryItemsPanel, {
      props: { searchQuery: '' },
    });
    await unlockedWrapper.find('.passphrase-toggle').trigger('click');
    expect(unlockedWrapper.text()).toContain('Torch');
    expect(unlockedWrapper.text()).toContain('Secret Blade');
    expect(unlockedWrapper.text()).toContain('公开内容');
    expect(unlockedWrapper.text()).toContain('dragon');
  });
});
