import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DATA_PACK_EXPORT_ID,
  buildExportableDefaultDataPack,
  normalizeDataPackSettings,
  toRuntimeDataPack,
  validateDataPackFile,
} from '../src/utils/dataPackUtils';
import {
  filterRuntimePackByVisibility,
  collectVisibilityIssues,
  getNormalizedUnlockGroups,
  isEntryPublic,
  resolveUnlockGroupIdsByPassphrase,
  summarizeUnlockGroupStats,
  summarizeDataPackVisibility,
} from '../src/utils/dataPackVisibility';
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

  it('treats missing visibility as public and legacy encryption groups as locked unlock groups', () => {
    const runtimePack = toRuntimeDataPack({
      ...minimalPack,
      items: [
        minimalPack.items![0]!,
        {
          ...minimalPack.items![0]!,
          id: 'secret-sword',
          name: 'Secret Sword',
          encryptionGroupId: 'gm-only',
        },
      ],
      spells: [
        {
          id: 'secret-spell',
          name: 'Secret Spell',
          source: 'homebrew',
          encryptionGroupId: 'gm-only',
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
    }, true);

    expect(isEntryPublic(runtimePack.items[0]!)).toBe(true);
    expect(isEntryPublic(runtimePack.items[1]!)).toBe(false);
    expect(getNormalizedUnlockGroups(runtimePack.editorMeta)).toEqual([
      {
        id: 'gm-only',
        passphrase: 'GM 可见',
        hint: undefined,
        description: undefined,
      },
    ]);
    expect(resolveUnlockGroupIdsByPassphrase(runtimePack, 'GM 可见')).toEqual(['gm-only']);
    expect(filterRuntimePackByVisibility(runtimePack, new Set()).items.map(item => item.id)).toEqual([
      'homebrew:longsword',
    ]);
    expect(filterRuntimePackByVisibility(runtimePack, new Set(['gm-only'])).items.map(item => item.id)).toContain(
      'homebrew:secret-sword'
    );
    expect(summarizeDataPackVisibility(runtimePack, new Set())).toMatchObject({
      publicItems: 1,
      lockedItems: 1,
      lockedSpells: 1,
      unlockGroupCount: 1,
    });
    expect(summarizeUnlockGroupStats(runtimePack)).toEqual([
      {
        groupId: 'gm-only',
        passphrase: 'GM 可见',
        itemCount: 1,
        spellCount: 1,
        traitCount: 0,
        totalCount: 2,
      },
    ]);
  });

  it('reports visibility metadata issues without exposing entry payloads', () => {
    const runtimePack = toRuntimeDataPack({
      ...minimalPack,
      editorMeta: {
        unlockGroups: [
          { id: 'same-a', passphrase: 'same' },
          { id: 'same-b', passphrase: 'same' },
        ],
      },
      items: [
        {
          ...minimalPack.items![0]!,
          id: 'orphan',
          visibility: { public: false, unlockGroupId: 'missing-group' },
        },
        {
          ...minimalPack.items![0]!,
          id: 'no-group',
          visibility: { public: false },
        },
      ],
    }, true);

    expect(collectVisibilityIssues(runtimePack).map(issue => issue.code)).toEqual([
      'duplicate_passphrase',
      'missing_unlock_group',
      'non_public_without_group',
    ]);
  });
});
