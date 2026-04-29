import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DATA_PACK_EXPORT_ID,
  buildExportableDefaultDataPack,
  normalizeDataPackSettings,
  toRuntimeDataPack,
  validateDataPackFile,
} from '../src/utils/dataPackUtils';
import { DEFAULT_DND5E_DATA_PACK } from '../src/data/dataPacks/defaultDnd5ePack';
import type { DataPackFile } from '../src/types/DataPack';

const minimalPack: DataPackFile = {
  manifest: {
    schemaVersion: 1,
    id: 'homebrew',
    name: '家规包',
    version: '1.0.0',
  },
  items: [
    {
      id: 'longsword',
      name: '家规长剑',
      type: 'weapon',
      cost: { value: 0, unit: 'gp' },
      weight: 3,
      description: '',
      category: 'martial_melee',
      damage: '1d8',
      damageType: 'slashing',
      properties: [],
    },
  ],
  spells: [],
  traits: [
    {
      id: 'glimmer',
      name: '微光',
      kind: 'custom',
      payload: { note: 'reserved' },
    },
  ],
  editorMeta: {
    menuGroups: {
      items: [{ id: 'magic', name: '魔法物品', children: [{ id: 'weapon', name: '武器' }] }],
      spells: [{ id: 'forbidden', name: '禁术', children: [{ id: 'ritual', name: '仪式' }] }],
    },
    encryptionGroups: [{ id: 'gm-only', name: 'GM 可见', lockedByDefault: true }],
  },
};

describe('data pack utilities', () => {
  it('validates manifest and preserves the reserved trait interface', () => {
    const pack = validateDataPackFile(minimalPack);

    expect(pack.manifest.id).toBe('homebrew');
    expect(pack.traits?.[0]).toMatchObject({
      id: 'glimmer',
      kind: 'custom',
      payload: { note: 'reserved' },
    });
    expect(pack.editorMeta?.menuGroups?.items?.[0]?.name).toBe('魔法物品');
    expect(pack.editorMeta?.encryptionGroups?.[0]?.id).toBe('gm-only');
  });

  it('rejects duplicate local ids inside the same section', () => {
    expect(() =>
      validateDataPackFile({
        ...minimalPack,
        items: [minimalPack.items![0]!, minimalPack.items![0]!],
      })
    ).toThrow('重复 id');
  });

  it('namespaces third-party runtime entries without mutating default ids', () => {
    const runtimePack = toRuntimeDataPack(minimalPack, true);
    const defaultRuntimePack = toRuntimeDataPack(
      {
        manifest: DEFAULT_DND5E_DATA_PACK.manifest,
        items: DEFAULT_DND5E_DATA_PACK.items.slice(0, 1),
        spells: [],
        traits: [],
      },
      true,
      true
    );

    expect(runtimePack.items[0]?.id).toBe('homebrew:longsword');
    expect(runtimePack.editorMeta?.encryptionGroups?.[0]?.name).toBe('GM 可见');
    expect(defaultRuntimePack.items[0]?.id).toBe(DEFAULT_DND5E_DATA_PACK.items[0]?.id);
  });

  it('exports the builtin default pack as a third-party output id', () => {
    const exported = buildExportableDefaultDataPack(DEFAULT_DND5E_DATA_PACK);

    expect(exported.manifest.id).toBe(DEFAULT_DATA_PACK_EXPORT_ID);
    expect(exported.items?.length).toBeGreaterThan(0);
    expect(exported.spells?.length).toBeGreaterThan(0);
  });

  it('normalizes settings against known pack ids', () => {
    expect(
      normalizeDataPackSettings(
        {
          enabledPackIds: ['dnd5e-default', 'missing', 'homebrew'],
          packOrder: ['homebrew'],
        },
        ['dnd5e-default', 'homebrew']
      )
    ).toEqual({
      enabledPackIds: ['dnd5e-default', 'homebrew'],
      packOrder: ['homebrew', 'dnd5e-default'],
    });
  });
});
