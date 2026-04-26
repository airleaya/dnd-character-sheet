import { describe, expect, it } from 'vitest';
import { ITEM_LIBRARY, ITEM_LIBRARY_AUDIT_REPORT, getLibraryItemById } from '../src/data/libraries/itemLibrary';
import { normalizeCharacterData, type LegacyCharacterData } from '../src/utils/characterMigration';

describe('structured item library adapter', () => {
  it('uses the audited structured mundane library as the runtime source', () => {
    expect(ITEM_LIBRARY_AUDIT_REPORT.total).toBe(489);
    expect(ITEM_LIBRARY_AUDIT_REPORT.sourceMismatched).toBe(0);
    expect(ITEM_LIBRARY_AUDIT_REPORT.duplicateIds).toBe(0);
    expect(ITEM_LIBRARY_AUDIT_REPORT.magicItems).toBe(0);
    expect(ITEM_LIBRARY.every((item) => item.magic?.isMagic === false)).toBe(true);
  });

  it('adapts representative item categories', () => {
    expect(getLibraryItemById('club')?.type).toBe('weapon');
    expect(getLibraryItemById('leather')?.type).toBe('armor');
    expect(getLibraryItemById('backpack')?.type).toBe('container');
    expect(getLibraryItemById('arrows')?.type).toBe('consumable');
    expect(getLibraryItemById('burglars_pack')?.type).toBe('pack');
    expect(getLibraryItemById('alchemists_supplies')?.type).toBe('tool');
    expect(getLibraryItemById('eberron_dragonshard')?.displayCategory).toBe('特殊材料');
  });

  it('keeps table descriptions available for the UI renderer', () => {
    const burglarsPack = getLibraryItemById('burglars_pack');
    const alchemistsSupplies = getLibraryItemById('alchemists_supplies');

    expect(burglarsPack?.descriptionBlocks?.some((block) => block.type === 'table')).toBe(true);
    expect(alchemistsSupplies?.descriptionBlocks?.some((block) => block.type === 'table')).toBe(true);
  });

  it('migrates old item ids without dropping unknown custom inventory', () => {
    const migrated = normalizeCharacterData({
      id: 'migration-test',
      inventory: [
        {
          instanceId: 'old-bolts',
          templateId: 'bolts',
          name: 'Legacy Bolts',
          weight: 1,
          quantity: 1,
          type: 'consumable',
          data: {}
        },
        {
          instanceId: 'custom',
          templateId: 'homebrew_item',
          name: 'Homebrew Item',
          weight: 1,
          quantity: 1,
          type: 'misc',
          data: {}
        }
      ]
    } satisfies LegacyCharacterData);

    expect(migrated.inventory[0].templateId).toBe('crossbow_bolts');
    expect(migrated.inventory[1].templateId).toBe('homebrew_item');
    expect(migrated.inventory[1].data).toHaveProperty('migrationAudit');
  });
});
