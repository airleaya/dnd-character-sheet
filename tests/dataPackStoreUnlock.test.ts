// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useDataPackStore } from '../src/stores/dataPackStore';
import type { DataPackFile, RuntimeDataPack } from '../src/types/DataPack';

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
    globalUnlockPassphrase: 'open-all',
  },
  itemMenuName: 'Campaign Pack',
  spellMenuName: 'Campaign Pack',
  items: [
    {
      id: 'campaign:torch',
      name: 'Torch',
      type: 'gear',
      weight: 1,
      description: '',
    },
    {
      id: 'campaign:secret-blade',
      name: 'Secret Blade',
      type: 'weapon',
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

describe('data pack passphrase unlock store', () => {
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

  it('keeps locked content out of the right sidebar until the passphrase matches', () => {
    const store = useDataPackStore();
    store.packs = [createPack()];
    store.settings = { enabledPackIds: ['campaign'], packOrder: ['campaign'] };

    expect(store.itemLibraryItems.map(item => item.id)).toEqual(['campaign:torch']);

    expect(store.unlockByPassphrase('wrong')).toEqual([]);
    expect(store.itemLibraryItems.map(item => item.id)).toEqual(['campaign:torch']);

    const results = store.unlockByPassphrase('dragon');

    expect(results).toMatchObject([
      {
        packId: 'campaign',
        unlockedItemCount: 1,
        unlockedSpellCount: 0,
        unlockedTraitCount: 0,
        globalUnlock: false,
      },
    ]);
    expect(store.itemLibraryItems.map(item => item.id)).toEqual(['campaign:torch', 'campaign:secret-blade']);
    expect(window.electronAPI.updateDataPackUnlockProgress).toHaveBeenCalledWith('campaign', expect.objectContaining({
      unlockedGroupIds: ['dragon-door'],
      allPublic: false,
    }));
  });

  it('persists global passphrase unlocks as all-public progress', () => {
    const store = useDataPackStore();
    store.packs = [createPack()];
    store.settings = { enabledPackIds: ['campaign'], packOrder: ['campaign'] };

    const results = store.unlockByPassphrase('open-all');

    expect(results).toMatchObject([
      {
        packId: 'campaign',
        globalUnlock: true,
        unlockedItemCount: 1,
      },
    ]);
    expect(store.isPackAllPublic('campaign')).toBe(true);
    expect(store.getPackPublicInfoSummary('campaign')).toEqual({ publicCount: 2, totalCount: 2 });
    expect(store.itemLibraryItems.map(item => item.id)).toEqual(['campaign:torch', 'campaign:secret-blade']);
    expect(window.electronAPI.updateDataPackUnlockProgress).toHaveBeenCalledWith('campaign', expect.objectContaining({
      allPublic: true,
    }));
  });

  it('shows all content while the maker ignore-passphrase switch is enabled', () => {
    const store = useDataPackStore();
    store.packs = [createPack()];
    store.settings = { enabledPackIds: ['campaign'], packOrder: ['campaign'] };
    store.isMakerOpen = true;

    expect(store.itemLibraryItems.map(item => item.id)).toEqual(['campaign:torch']);

    store.setIgnoreUnlockInMaker(true);

    expect(store.itemLibraryItems.map(item => item.id)).toEqual(['campaign:torch', 'campaign:secret-blade']);
  });

  it('uses the active maker draft as the right-sidebar library source before saving', () => {
    const store = useDataPackStore();
    store.packs = [createPack()];
    store.settings = { enabledPackIds: ['campaign'], packOrder: ['campaign'] };
    store.isMakerOpen = true;
    store.activeDraftPack = {
      manifest: {
        schemaVersion: 1,
        id: 'campaign',
        name: 'Campaign Pack',
        version: '1.0.0',
      },
      items: [
        {
          id: 'torch',
          name: 'Torch',
          type: 'gear',
          weight: 1,
          description: 'Draft-side edited description.',
        },
      ],
      spells: [],
      traits: [],
    } satisfies DataPackFile;

    expect(store.itemLibraryItems).toHaveLength(1);
    expect(store.itemLibraryItems[0]).toMatchObject({
      id: 'campaign:torch',
      description: 'Draft-side edited description.',
    });

    store.activeDraftPack.items![0].description = 'Unsaved hover description.';
    store.markDraftDirty();

    expect(store.itemLibraryItems[0]?.description).toBe('Unsaved hover description.');
  });

  it('can relock one pack or clear all persisted unlocks without changing pack data', () => {
    const store = useDataPackStore();
    store.packs = [createPack()];
    store.settings = { enabledPackIds: ['campaign'], packOrder: ['campaign'] };

    store.unlockByPassphrase('dragon');
    expect(store.getUnlockedGroupCount('campaign')).toBe(1);
    expect(store.itemLibraryItems.map(item => item.id)).toContain('campaign:secret-blade');

    expect(store.clearPackUnlocks('campaign')).toBe(1);
    expect(store.getUnlockedGroupCount('campaign')).toBe(0);
    expect(store.itemLibraryItems.map(item => item.id)).toEqual(['campaign:torch']);

    store.unlockByPassphrase('dragon');
    expect(store.clearAllUnlocks()).toEqual({ clearedPackCount: 1, clearedGroupCount: 1 });
    expect(store.itemLibraryItems.map(item => item.id)).toEqual(['campaign:torch']);
    expect(store.packs[0]?.items.map(item => item.id)).toEqual(['campaign:torch', 'campaign:secret-blade']);
  });
});
