// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useDataPackStore } from '../src/stores/dataPackStore';
import type { RuntimeDataPack } from '../src/types/DataPack';

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
      },
    ]);
    expect(store.itemLibraryItems.map(item => item.id)).toEqual(['campaign:torch', 'campaign:secret-blade']);
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
});

