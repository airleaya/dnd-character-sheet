// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import DataPackMakerPanel from '../src/components/sheet/dataPackMaker/DataPackMakerPanel.vue';
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

  it('generates and edits a shop catalog item from data-pack maker items', async () => {
    const store = useDataPackStore();
    store.isMakerOpen = true;
    store.packs = [
      {
        id: 'market-pack',
        name: 'market pack',
        version: '1.0.0',
        builtin: false,
        enabled: true,
        sourceKind: 'imported',
        manifest: { schemaVersion: 1, id: 'market-pack', name: 'market pack', version: '1.0.0' },
        itemMenuName: 'market pack',
        spellMenuName: 'market pack',
        items: [
          {
            id: 'market-pack:silk',
            name: 'silk',
            type: 'treasure',
            cost: { value: 10, unit: 'gp' },
            weight: 1,
            description: '',
            displayCategory: 'trade goods',
            displaySubcategory: 'trade goods',
            source: 'market pack',
          } as LibraryItem,
        ],
        spells: [],
        traits: [],
      },
    ];
    store.activeDraftPack = {
      ...createDraftPack(),
      items: [
        {
          id: 'longsword',
          name: 'longsword',
          type: 'weapon',
          cost: { value: 15, unit: 'gp' },
          weight: 3,
          description: '',
          displayCategory: 'equipment',
          displaySubcategory: 'weapon',
        } as LibraryItem,
      ],
    };

    wrapper = mount(DataPackMakerPanel, {
      global: {
        plugins: [pinia],
      },
    });

    await wrapper.find('.shop-catalog-card button').trigger('click');
    await wrapper.find('.shop-catalog-editor input').setValue('frontier caravan catalog');
    await wrapper.find('.catalog-description textarea').setValue('weekly restock\nrare goods require preorder');

    const candidates = wrapper.findAll('.catalog-candidate');
    expect(candidates.length).toBeGreaterThanOrEqual(2);
    await candidates.find(button => button.text().includes('longsword'))!.trigger('click');
    await candidates.find(button => button.text().includes('silk'))!.trigger('click');

    const selectedInputs = wrapper.findAll('.catalog-entry-fields input');
    await selectedInputs[0]!.setValue('catalog-only longsword');
    await selectedInputs[1]!.setValue('catalog-only category');
    await selectedInputs[2]!.setValue(99);
    const notes = wrapper.findAll('.catalog-entry textarea');
    await notes[0]!.setValue('one only\nnegotiable');
    await wrapper.find('.catalog-actions button').trigger('click');

    const catalog = store.activeDraftPack.items?.find(item => item.shopCatalog);
    expect(catalog).toMatchObject({
      id: 'shop_catalog',
      name: 'frontier caravan catalog',
      type: 'treasure',
      displayCategory: expect.any(String),
      displaySubcategory: expect.any(String),
      weight: 0,
      cost: { value: 0, unit: 'gp' },
      description: 'weekly restock\nrare goods require preorder',
    });
    expect(catalog?.shopCatalog?.entries.map(entry => entry.name)).toEqual(['catalog-only longsword', 'silk']);
    expect(catalog?.shopCatalog?.entries[0]).toMatchObject({
      category: 'catalog-only category',
      price: { value: 99, unit: 'gp' },
    });
    expect(store.activeDraftPack.items?.find(item => item.id === 'longsword')).toMatchObject({
      name: 'longsword',
      displayCategory: 'equipment',
      cost: { value: 15, unit: 'gp' },
    });
    expect(catalog?.descriptionBlocks?.find(block => block.type === 'table')).toMatchObject({
      caption: 'frontier caravan catalog',
      columns: expect.any(Array),
    });
    expect(catalog?.descriptionBlocks?.find(block => block.type === 'table' && block.rows.some(row => row.includes('one only\nnegotiable')))).toBeTruthy();
    expect(store.activeDraftPack.editorMeta?.menuGroups?.items).toEqual(expect.arrayContaining([
      expect.objectContaining({
        name: expect.any(String),
        children: expect.arrayContaining([expect.objectContaining({ name: expect.any(String) })]),
      }),
    ]));

    const editCatalogButton = wrapper.findAll('.content-item-actions button').find(button => button.text().length === 4 && !button.classes().includes('danger'));
    expect(editCatalogButton).toBeTruthy();
    await editCatalogButton!.trigger('click');
    await wrapper.find('.shop-catalog-editor input').setValue('revised catalog');
    await wrapper.find('.catalog-actions button').trigger('click');

    const editedCatalogs = store.activeDraftPack.items?.filter(item => item.shopCatalog);
    expect(editedCatalogs).toHaveLength(1);
    expect(editedCatalogs?.[0]?.name).toBe('revised catalog');
  });

  it('filters shop catalog candidates by repeatedly toggled data-pack sources', async () => {
    const store = useDataPackStore();
    store.isMakerOpen = true;
    store.packs = [
      {
        id: 'market-pack',
        name: 'market pack',
        version: '1.0.0',
        builtin: false,
        enabled: true,
        sourceKind: 'imported',
        manifest: { schemaVersion: 1, id: 'market-pack', name: 'market pack', version: '1.0.0' },
        itemMenuName: 'market pack',
        spellMenuName: 'market pack',
        items: [
          {
            id: 'market-pack:silk',
            name: 'silk',
            type: 'treasure',
            cost: { value: 10, unit: 'gp' },
            weight: 1,
            description: '',
            displayCategory: 'trade goods',
            displaySubcategory: 'trade goods',
            source: 'market pack',
          } as LibraryItem,
        ],
        spells: [],
        traits: [],
      },
    ];
    store.activeDraftPack = {
      ...createDraftPack(),
      items: [
        {
          id: 'longsword',
          name: 'longsword',
          type: 'weapon',
          cost: { value: 15, unit: 'gp' },
          weight: 3,
          description: '',
          displayCategory: 'equipment',
          displaySubcategory: 'weapon',
        } as LibraryItem,
      ],
    };

    wrapper = mount(DataPackMakerPanel, {
      global: {
        plugins: [pinia],
      },
    });

    await wrapper.find('.shop-catalog-card button').trigger('click');
    expect(wrapper.text()).toContain('longsword');
    expect(wrapper.text()).toContain('silk');

    const sourceChecks = wrapper.findAll('.catalog-source-option input');
    expect(sourceChecks).toHaveLength(2);
    await sourceChecks[1]!.setValue(false);
    expect(wrapper.text()).toContain('longsword');
    expect(wrapper.text()).not.toContain('silk / trade goods');

    await sourceChecks[0]!.setValue(false);
    await sourceChecks[1]!.setValue(true);
    expect(wrapper.text()).not.toContain('longsword / equipment');
    expect(wrapper.text()).toContain('silk');

    await wrapper.findAll('.catalog-source-actions button')[0]!.trigger('click');
    expect(wrapper.text()).toContain('longsword');
    expect(wrapper.text()).toContain('silk');
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
