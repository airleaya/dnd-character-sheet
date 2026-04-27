import { describe, expect, it } from 'vitest';
import { getLibraryItemById } from '../src/data/libraries/itemLibrary';
import { LEGACY_ITEM_ID_MIGRATION, migrateItemTemplateId } from '../src/data/libraries/itemIdMigration';
import { normalizeCharacterData, type LegacyCharacterData } from '../src/utils/characterMigration';

describe('item library legacy inventory migration', () => {
  it('maps every declared legacy id to an existing new library item', () => {
    for (const [legacyId, runtimeId] of Object.entries(LEGACY_ITEM_ID_MIGRATION)) {
      expect(getLibraryItemById(runtimeId), `${legacyId} -> ${runtimeId}`).toBeTruthy();
      expect(migrateItemTemplateId(legacyId)).toBe(runtimeId);
    }
  });

  it('migrates representative old inventory ids and preserves unresolved custom items', () => {
    const migrated = normalizeCharacterData({
      id: 'legacy-inventory-audit',
      inventory: [
        {
          instanceId: 'legacy-pack',
          templateId: 'pack_burglar',
          name: '旧窃贼套组',
          weight: 0,
          quantity: 1,
          type: 'pack',
          data: {}
        },
        {
          instanceId: 'legacy-tool',
          templateId: 'alchemist_supplies',
          name: '旧炼金工具',
          weight: 8,
          quantity: 1,
          type: 'tool',
          data: {}
        },
        {
          instanceId: 'custom-homebrew',
          templateId: 'homebrew_item',
          name: '自定义物品',
          weight: 1,
          quantity: 1,
          type: 'misc',
          data: {}
        }
      ]
    } satisfies LegacyCharacterData);

    expect(migrated.inventory[0].templateId).toBe('burglars_pack');
    expect(migrated.inventory[0].data).not.toHaveProperty('migrationAudit');
    expect(migrated.inventory[1].templateId).toBe('alchemists_supplies');
    expect(migrated.inventory[1].data).not.toHaveProperty('migrationAudit');
    expect(migrated.inventory[2].templateId).toBe('homebrew_item');
    expect(migrated.inventory[2].data).toHaveProperty('migrationAudit');
  });
});
