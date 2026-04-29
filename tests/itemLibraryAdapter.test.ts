import { describe, expect, it } from 'vitest';
import { ITEM_LIBRARY, ITEM_LIBRARY_AUDIT_REPORT, getLibraryItemById } from '../src/data/libraries/itemLibrary';
import { normalizeCharacterData, type LegacyCharacterData } from '../src/utils/characterMigration';

describe('structured item library adapter', () => {
  it('uses the audited structured mundane library as the runtime source', () => {
    expect(ITEM_LIBRARY_AUDIT_REPORT.total).toBe(498);
    expect(ITEM_LIBRARY_AUDIT_REPORT.sourceMismatched).toBe(0);
    expect(ITEM_LIBRARY_AUDIT_REPORT.duplicateIds).toBe(0);
    expect(ITEM_LIBRARY_AUDIT_REPORT.magicItems).toBe(0);
    expect(ITEM_LIBRARY.every((item) => item.magic?.isMagic === false)).toBe(true);
  });

  it('adds blank templates for every runtime item type', () => {
    const templates = [
      ['blank_template_weapon', '武器模板', 'weapon'],
      ['blank_template_armor', '护甲模板', 'armor'],
      ['blank_template_gear', '冒险装备模板', 'gear'],
      ['blank_template_tool', '工具模板', 'tool'],
      ['blank_template_consumable', '消耗品模板', 'consumable'],
      ['blank_template_treasure', '财宝模板', 'treasure'],
      ['blank_template_container', '容器模板', 'container'],
      ['blank_template_pack', '套组模板', 'pack'],
      ['blank_template_misc', '其他模板', 'misc'],
    ] as const;

    templates.forEach(([id, name, type]) => {
      const template = getLibraryItemById(id);
      expect(template).toMatchObject({
        id,
        name,
        type,
        weight: 0,
        description: '',
        cost: { value: 0, unit: 'gp' },
        magic: { isMagic: false },
        tags: expect.arrayContaining(['blank_template']),
      });
    });

    expect(getLibraryItemById('blank_template_weapon')).toMatchObject({
      damage: '',
      damageType: 'damage_none',
      properties: [],
    });
    expect(getLibraryItemById('blank_template_armor')).toMatchObject({
      ac: 0,
      dexBonusMax: 0,
      strReq: 0,
    });
    expect(getLibraryItemById('blank_template_pack')).toMatchObject({
      contents: [],
    });
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

  it('uses 1 lb as the runtime weight for every trade good', () => {
    const tradeGoods = ITEM_LIBRARY.filter((item) => item.category === 'trade_good');

    expect(tradeGoods).toHaveLength(23);
    expect(tradeGoods.every((item) => item.weight === 1)).toBe(true);
  });

  it('preserves both capacity descriptions for containers that have them', () => {
    const backpack = getLibraryItemById('backpack');

    expect(backpack?.type).toBe('container');
    expect(backpack).toMatchObject({
      capacityWeight: 30,
      capacityVolume: '1立方尺'
    });
  });

  it('computes pack weight from resolved pack contents', () => {
    expect(getLibraryItemById('burglars_pack')?.weight).toBe(47.5);
    expect(getLibraryItemById('explorers_pack')?.weight).toBe(59);
    expect(getLibraryItemById('diplomats_pack')?.weight).toBe(36);
  });

  it('applies reviewed multiplicity and acquisition metadata without adding magic behavior', () => {
    const arrows = getLibraryItemById('arrows');
    const bolts = getLibraryItemById('crossbow_bolts');
    const ballBearings = getLibraryItemById('ball_bearings');
    const spikes = getLibraryItemById('iron_spikes_10');

    expect(arrows?.weight).toBe(1);
    expect(arrows?.cost).toEqual({ value: 1, unit: 'gp' });
    expect(arrows?.multiplicity?.mode).toBe('split_custom_rule');
    expect(arrows?.acquisitionRule?.creates).toEqual([
      { itemId: 'quiver', quantity: 1 },
      { itemId: 'arrows', quantity: 20, containerId: 'quiver' }
    ]);
    expect(arrows?.description).toContain('在本软件中获取该物品时');

    expect(bolts?.weight).toBe(1.5);
    expect(bolts?.acquisitionRule?.creates?.[0].itemId).toBe('crossbow_bolt_case');
    expect(ballBearings?.multiplicity?.mode).toBe('bundle');
    expect(ballBearings?.acquisitionRule?.creates?.[0].itemId).toBe('pouch');
    expect(spikes?.weight).toBe(5);
    expect(spikes?.multiplicity?.mode).toBe('split_grouped');
  });

  it('keeps table descriptions available for the UI renderer', () => {
    const burglarsPack = getLibraryItemById('burglars_pack');
    const alchemistsSupplies = getLibraryItemById('alchemists_supplies');

    expect(burglarsPack?.descriptionBlocks?.some((block) => block.type === 'table')).toBe(true);
    expect(alchemistsSupplies?.descriptionBlocks?.some((block) => block.type === 'table')).toBe(true);
  });

  it('prefixes descriptions with source provenance and preserves traced source details', () => {
    const acid = getLibraryItemById('acid_vial');
    const alchemistsSupplies = getLibraryItemById('alchemists_supplies');
    const almsBox = getLibraryItemById('alms_box');

    expect(acid?.description).toContain('这是来自PHB玩家手册的消耗品物品。');
    expect(acid?.description).toContain('强酸');
    expect(alchemistsSupplies?.description).toContain('这是来自PHB玩家手册的工匠工具物品。');
    expect(alchemistsSupplies?.descriptionBlocks?.some((block) => block.type === 'table')).toBe(true);
    expect(almsBox?.description).toContain('这是来自PHB玩家手册的冒险装备物品。');
    expect(almsBox?.description).toContain('原文未提供独立规则描述');
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
