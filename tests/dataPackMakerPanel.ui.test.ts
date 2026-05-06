// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import DataPackMakerPanel from '../src/components/sheet/dataPackMaker/DataPackMakerPanel.vue';
import DataPackMakerMonitor from '../src/components/sheet/dataPackMaker/DataPackMakerMonitor.vue';
import { useForge } from '../src/composables/useForge';
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
    useForge().close();
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

  it('keeps saved maker edits in the runtime library even when the pack is disabled', async () => {
    const store = useDataPackStore();
    store.packs = [];
    store.settings = {
      enabledPackIds: [],
      packOrder: [],
    };
    store.isMakerOpen = true;
    store.activeDraftPack = {
      ...createDraftPack(),
      items: [
        {
          id: 'resin',
          name: '原始精粹',
          type: 'consumable',
          cost: { value: 75, unit: 'gp' },
          weight: 0,
          description: '旧描述',
          displayCategory: '战斗道具',
          displaySubcategory: '消耗品',
        } as LibraryItem,
      ],
    };
    const saveEditableDataPack = vi.fn(async (packFile: DataPackFile) => ({
      success: true as const,
      data: packFile,
    }));

    Object.defineProperty(window, 'electronAPI', {
      value: {
        writeLog: vi.fn(async () => ({ success: true, data: null })),
        saveEditableDataPack,
      },
      configurable: true,
    });

    store.activeDraftPack.items![0].name = '不朽精粹';
    store.activeDraftPack.items![0].description = '新描述';

    await expect(store.saveDraftPack('update')).resolves.toBe(true);

    expect(store.packs).toHaveLength(1);
    expect(store.packs[0]?.id).toBe('homebrew');
    expect(store.packs[0]?.items).toHaveLength(1);
    const savedItem = store.packs[0]?.items.find(item => item.id === 'homebrew:resin');
    expect(savedItem).toMatchObject({
      id: 'homebrew:resin',
      name: '不朽精粹',
      description: '新描述',
    });
    expect(store.itemLibraryItems).toEqual([]);

    store.settings = {
      enabledPackIds: ['homebrew'],
      packOrder: ['homebrew'],
    };

    expect(store.itemLibraryItems[0]).toMatchObject({
      id: 'homebrew:resin',
      name: '不朽精粹',
      description: '新描述',
    });
  });

  it('shows a copyable floating maker behavior monitor for save diagnostics', async () => {
    const store = useDataPackStore();
    store.isMakerOpen = true;
    store.activeDraftPack = createDraftPack();
    store.recordMakerDragDiagnostic('forge.save-start', 'info', 'Forge save button invoked', {
      itemName: '不朽精粹',
    });
    const writeText = vi.fn(async () => undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    wrapper = mount(DataPackMakerMonitor, {
      global: {
        plugins: [pinia],
      },
    });

    await wrapper.find('.monitor-toggle').trigger('click');

    expect(wrapper.text()).toContain('数据包编辑器行为监视');
    expect(wrapper.text()).toContain('Forge save button invoked');
    expect(wrapper.find('.monitor-copy-box').exists()).toBe(true);

    await wrapper.find('.monitor-actions button').trigger('click');

    expect(writeText).toHaveBeenCalledTimes(1);
    const copiedText = writeText.mock.calls.at(0)?.at(0);
    expect(copiedText).toContain('forge.save-start');
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

  it('renders draft magic items with their configured visual style', () => {
    const store = useDataPackStore();
    store.activeDraftPack = {
      ...createDraftPack(),
      items: [
        {
          id: 'magic-sword',
          name: '月光长剑',
          type: 'weapon',
          cost: { value: 0, unit: 'gp' },
          weight: 3,
          description: '',
          displayCategory: '魔法装备',
          displaySubcategory: '武器',
          category: 'martial_melee',
          damage: '1d8',
          damageType: 'slashing',
          properties: [],
          magic: {
            isMagic: true,
            magicBonus: 1,
            visuals: {
              inventoryBackground: '#32165f',
              nameColor: '#f2d38b',
            },
          },
        } as LibraryItem,
      ],
    };

    wrapper = mount(DataPackMakerPanel, {
      global: {
        plugins: [pinia],
      },
    });

    const card = wrapper.get('.content-item-card');
    expect(card.classes()).toContain('magic');
    expect(card.attributes('style')).toContain('background-color: rgb(50, 22, 95)');
    expect(card.text()).toContain('月光长剑+1');
    expect(card.get('.content-item-main strong').attributes('style')).toContain('color: rgb(242, 211, 139)');
  });

  it('copies a draft item into a new draft entry before opening it in the forge', async () => {
    const store = useDataPackStore();
    store.isMakerOpen = true;
    store.activeDraftPack = {
      ...createDraftPack(),
      items: [
        {
          id: 'longsword',
          name: '长剑',
          type: 'weapon',
          cost: { value: 15, unit: 'gp' },
          weight: 3,
          description: '原始描述',
          displayCategory: '武器',
          displaySubcategory: '军用近战',
          category: 'martial_melee',
          damage: '1d8',
          damageType: 'slashing',
          properties: [],
        } as LibraryItem,
      ],
    };

    wrapper = mount(DataPackMakerPanel, {
      global: {
        plugins: [pinia],
      },
    });

    const copyButton = wrapper
      .findAll('.content-item-actions button')
      .find(button => button.text() === '复制到铁匠台');

    expect(copyButton).toBeTruthy();
    await copyButton!.trigger('click');

    expect(store.activeDraftPack.items).toHaveLength(2);
    expect(store.activeDraftPack.items?.[1]).toMatchObject({
      id: 'longsword-2',
      name: '长剑',
      source: store.activeDraftPack.manifest.name,
      displayCategory: '武器',
      displaySubcategory: '军用近战',
    });
    expect(store.activeDraftPack.items?.[1]).not.toBe(store.activeDraftPack.items?.[0]);
    expect(store.draftDirty).toBe(true);
    expect(useForge().draftItem.value).toMatchObject({
      templateId: 'longsword-2',
      name: '长剑',
    });
    expect(store.makerDragDiagnostics.some(entry => entry.step === 'maker.copy-forge')).toBe(true);
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

  it('stores a global unlock passphrase without exposing pack contents', () => {
    const store = useDataPackStore();
    store.activeDraftPack = createDraftPack();

    store.updateDraftGlobalUnlockPassphrase('open-all');

    expect(store.activeDraftPack.editorMeta?.globalUnlockPassphrase).toBe('open-all');
    expect(store.draftDirty).toBe(true);

    store.updateDraftGlobalUnlockPassphrase('   ');
    expect(store.activeDraftPack.editorMeta?.globalUnlockPassphrase).toBeUndefined();
  });
});
