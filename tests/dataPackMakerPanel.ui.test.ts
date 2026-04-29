// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import DataPackMakerPanel from '../src/components/sheet/dataPackMaker/DataPackMakerPanel.vue';
import { useDataPackStore } from '../src/stores/dataPackStore';
import type { DataPackFile } from '../src/types/DataPack';
import type { LibraryItem } from '../src/types/Library';

const createDraftPack = (): DataPackFile => ({
  manifest: {
    schemaVersion: 1,
    id: 'homebrew',
    name: '自定义数据包',
    version: '1.0.0',
  },
  items: [],
  spells: [],
  traits: [],
});

describe('DataPackMakerPanel', () => {
  let pinia: Pinia;
  let wrapper: VueWrapper | null = null;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);

    Object.defineProperty(window, 'electronAPI', {
      value: {
        writeLog: vi.fn(async () => ({ success: true, data: null })),
      },
      configurable: true,
    });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    vi.restoreAllMocks();
  });

  it('routes the header save button to draft data-pack saving', async () => {
    const store = useDataPackStore();
    store.activeDraftPack = createDraftPack();
    const saveSpy = vi.spyOn(store, 'saveDraftPack').mockResolvedValue(true);

    wrapper = mount(DataPackMakerPanel, {
      global: {
        plugins: [pinia],
      },
    });

    const saveButton = wrapper
      .findAll('.header-actions button')
      .find(button => button.text() === '保存');

    expect(saveButton).toBeTruthy();
    await saveButton!.trigger('click');

    expect(saveSpy).toHaveBeenCalledWith('update');
  });

  it('sends a plain cloneable draft payload through the save API', async () => {
    const store = useDataPackStore();
    store.activeDraftPack = createDraftPack();
    const saveEditableDataPack = vi.fn(async (packFile: DataPackFile) => {
      expect(() => structuredClone(packFile)).not.toThrow();
      expect(packFile).not.toBe(store.activeDraftPack);
      return { success: true as const, data: packFile };
    });

    Object.defineProperty(window, 'electronAPI', {
      value: {
        writeLog: vi.fn(async () => ({ success: true, data: null })),
        saveEditableDataPack,
      },
      configurable: true,
    });

    await expect(store.saveDraftPack('create')).resolves.toBe(true);

    expect(saveEditableDataPack).toHaveBeenCalledWith(expect.objectContaining({
      manifest: expect.objectContaining({ id: 'homebrew' }),
    }), 'create');
  });

  it('syncs editor-assigned item groups into the active data pack metadata', () => {
    const store = useDataPackStore();
    store.activeDraftPack = createDraftPack();

    store.ensureItemAssignmentGroups({
      id: 'custom-sword',
      name: '自定义剑',
      type: 'weapon',
      cost: { value: 0, unit: 'gp' },
      weight: 0,
      description: '',
      displayCategory: 'Magic Gear',
      displaySubcategory: 'Longswords',
    } as LibraryItem);

    expect(store.activeDraftPack.editorMeta?.menuGroups?.items).toEqual([
      {
        id: 'Magic-Gear',
        name: 'Magic Gear',
        children: [{ id: 'Longswords', name: 'Longswords' }],
      },
    ]);
    expect(store.draftDirty).toBe(true);
  });

  it('manages passphrase unlock groups and assigns spell visibility metadata', () => {
    const store = useDataPackStore();
    store.activeDraftPack = {
      ...createDraftPack(),
      spells: [
        {
          id: 'secret-spell',
          name: '秘密法术',
          level: 1,
          school: 'evocation',
          ritual: false,
          castingTime: '1 Action',
          range: 'Self',
          components: { v: true, s: false, m: null },
          concentration: false,
          duration: 'Instantaneous',
          attackType: 'none',
          description: '',
          classes: [],
        },
      ],
    };

    store.addEncryptionGroup('dragon', 'red door');
    const groupId = store.activeDraftPack.editorMeta?.encryptionGroups?.[0]?.id;

    expect(groupId).toBeTruthy();
    expect(store.activeDraftPack.editorMeta?.unlockGroups?.[0]).toMatchObject({
      id: groupId,
      passphrase: 'dragon',
      description: 'red door',
    });

    store.updateEncryptionGroup(groupId!, { name: 'wyrm', description: 'new hint' });
    store.assignDraftSpellUnlockGroup('secret-spell', groupId);

    expect(store.activeDraftPack.editorMeta?.unlockGroups?.[0]).toMatchObject({
      id: groupId,
      passphrase: 'wyrm',
      description: 'new hint',
    });
    expect(store.activeDraftPack.spells?.[0]).toMatchObject({
      encryptionGroupId: groupId,
      visibility: { public: false, unlockGroupId: groupId },
    });

    store.removeEncryptionGroup(groupId!);

    expect(store.activeDraftPack.spells?.[0]).toMatchObject({
      encryptionGroupId: undefined,
      visibility: { public: true },
    });
  });
});
