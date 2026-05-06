import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useForge } from '../src/composables/useForge';
import { useActiveSheetStore } from '../src/stores/activeSheet';
import { useDataPackStore } from '../src/stores/dataPackStore';
import { createDefaultCharacter } from '../src/utils/characterMigration';
import type { InventoryItem } from '../src/types/Item';
import type { ItemType } from '../src/types/Library';

const createElectronApiMock = () => ({
  saveCharacter: async () => ({ success: true as const, data: null }),
  loadAllCharacters: async () => ({ success: true as const, data: [] }),
  deleteCharacter: async () => ({ success: true as const, data: null }),
  onAppWillClose: () => undefined,
  confirmClose: async () => undefined,
  setZoomFactor: () => undefined,
  selectDirectory: async () => null,
  exportCharacter: async () => ({ success: true as const, data: null }),
  writeLog: async () => ({ success: true as const, data: null }),
});

const createBaseItem = (): InventoryItem => ({
  instanceId: 'forge-item-1',
  templateId: 'custom-template',
  name: 'Old Gear',
  description: 'old note',
  weight: 1,
  quantity: 1,
  type: 'gear',
  magic: { isMagic: false },
  data: {
    cost: { value: 1, unit: 'gp' },
  },
});

describe('useForge', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    Object.defineProperty(globalThis, 'window', {
      value: { electronAPI: createElectronApiMock() },
      configurable: true,
    });
    useForge().close();
  });

  it('allows changing an item into a weapon and toggling weapon properties', () => {
    const forge = useForge();

    forge.handleDropData(JSON.stringify({ type: 'library-item', id: 'TEST-ID' }));
    forge.updateItemType('weapon');
    forge.toggleWeaponProperty('finesse');
    forge.toggleWeaponProperty('light');

    expect(forge.draftItem.value?.type).toBe('weapon');
    expect(forge.draftData.value).toMatchObject({
      type: 'weapon',
      category: 'simple_melee',
      damage: '1d4',
      damageType: 'bludgeoning',
      range: '5 尺',
    });
    expect(forge.draftData.value.properties).toEqual(['finesse', 'light']);
  });

  it('saves type and type-specific property changes back to inventory items', () => {
    const activeSheet = useActiveSheetStore();
    const character = createDefaultCharacter('forge-character');
    character.inventory.push(createBaseItem());
    activeSheet.character = character;

    const forge = useForge();
    forge.handleDropData(JSON.stringify({ type: 'inventory-item', instanceId: 'forge-item-1' }));
    forge.updateItemType('armor');
    forge.draftItem.value!.name = 'Forged Armor';
    forge.draftData.value.ac = 17;
    forge.draftData.value.armorType = 'heavy';
    forge.save();

    const savedItem = activeSheet.character.inventory[0]!;
    expect(savedItem.name).toBe('Forged Armor');
    expect(savedItem.type).toBe('armor');
    expect(savedItem.data).toMatchObject({
      type: 'armor',
      name: 'Forged Armor',
      ac: 17,
      armorType: 'heavy',
    });
  });

  it('changes the selected template id without overwriting the custom item name', () => {
    const activeSheet = useActiveSheetStore();
    activeSheet.character = createDefaultCharacter('forge-template-select');
    const forge = useForge();

    forge.handleDropData(JSON.stringify({ type: 'library-item', id: 'TEST-ID' }));
    forge.draftItem.value!.name = '影牙';
    forge.draftItem.value!.templateId = 'dagger';
    forge.save();

    const savedItem = activeSheet.character?.inventory.at(-1);

    expect(savedItem?.name).toBe('影牙');
    expect(savedItem?.templateId).toBe('dagger');
  });

  it('saves all shared editable fields through the data-pack maker override', () => {
    const forge = useForge();
    const saveSpy = vi.fn();
    const item = createBaseItem();

    forge.openForgeForItem(item, 'edit', saveSpy, { dataPackMaker: true });
    forge.draftItem.value!.name = '多行说明道具';
    forge.draftItem.value!.description = '第一行\n第二行\n第三行';
    forge.draftItem.value!.weight = 2.5;
    forge.draftItem.value!.quantity = 4;
    forge.draftData.value.cost = { value: 123, unit: 'sp' };
    forge.draftData.value.displayCategory = '战斗道具';
    forge.draftData.value.displaySubcategory = '消耗品';
    forge.draftData.value.source = '测试包';
    forge.draftData.value.englishName = 'Line Keeper';
    forge.draftData.value.tags = ['utility', 'homebrew'];

    forge.save();

    expect(saveSpy).toHaveBeenCalledTimes(1);
    const saved = saveSpy.mock.calls[0][0] as InventoryItem;
    expect(saved).toMatchObject({
      name: '多行说明道具',
      description: '第一行\n第二行\n第三行',
      weight: 2.5,
      quantity: 4,
      type: 'gear',
    });
    expect(saved.data).toMatchObject({
      name: '多行说明道具',
      description: '第一行\n第二行\n第三行',
      weight: 2.5,
      cost: { value: 123, unit: 'sp' },
      displayCategory: '战斗道具',
      displaySubcategory: '消耗品',
      source: '测试包',
      englishName: 'Line Keeper',
      tags: ['utility', 'homebrew'],
    });
  });

  it.each([
    {
      type: 'weapon' as const,
      expected: {
        category: 'simple_melee',
        damage: '1d4',
        damageType: 'bludgeoning',
        properties: [],
        range: '5 尺',
        requiredAmmoType: 'none',
      },
    },
    {
      type: 'armor' as const,
      expected: {
        armorType: 'light',
        ac: 11,
        donTime: '1 分钟',
        doffTime: '1 分钟',
      },
    },
    {
      type: 'tool' as const,
      expected: {
        baseAbility: 'dex',
      },
    },
    {
      type: 'consumable' as const,
      expected: {
        isAmmunition: false,
        ammoType: 'none',
      },
    },
    {
      type: 'container' as const,
      expected: {
        capacityWeight: 0,
        capacityVolume: '',
        ignoreContentWeight: false,
      },
    },
  ])('creates safe default structure when switching to $type', ({ type, expected }) => {
    const forge = useForge();

    forge.handleDropData(JSON.stringify({ type: 'library-item', id: 'TEST-ID' }));
    forge.updateItemType(type);

    expect(forge.draftItem.value?.type).toBe(type);
    expect(forge.draftData.value).toMatchObject({
      type,
      ...expected,
    });
  });

  it.each(['gear', 'treasure', 'pack', 'misc'] satisfies ItemType[])(
    'saves shared fields for non-specialized type %s',
    (type) => {
      const forge = useForge();
      const saveSpy = vi.fn();

      forge.openForgeForItem(createBaseItem(), 'edit', saveSpy, { dataPackMaker: true });
      forge.updateItemType(type);
      forge.draftItem.value!.name = `${type}-item`;
      forge.draftItem.value!.description = `desc-${type}`;
      forge.draftData.value.cost = { value: 7, unit: 'gp' };
      forge.draftData.value.displayCategory = '普通分组';
      forge.draftData.value.displaySubcategory = type;
      forge.save();

      const saved = saveSpy.mock.calls[0][0] as InventoryItem;
      expect(saved.type).toBe(type);
      expect(saved.name).toBe(`${type}-item`);
      expect(saved.description).toBe(`desc-${type}`);
      expect(saved.data).toMatchObject({
        type,
        name: `${type}-item`,
        description: `desc-${type}`,
        displayCategory: '普通分组',
        displaySubcategory: type,
      });
    }
  );

  it('saves a complete weapon edit combination', () => {
    const forge = useForge();
    const saveSpy = vi.fn();

    forge.openForgeForItem(createBaseItem(), 'edit', saveSpy, { dataPackMaker: true });
    forge.updateItemType('weapon');
    forge.draftItem.value!.name = '雷鸣长弓';
    forge.draftData.value.category = 'martial_ranged';
    forge.draftData.value.damage = '1d8';
    forge.draftData.value.damageType = 'thunder';
    forge.draftData.value.range = '150/600 尺';
    forge.draftData.value.versatileDamage = '';
    forge.draftData.value.requiredAmmoType = 'arrow';
    forge.toggleWeaponProperty('ammunition');
    forge.toggleWeaponProperty('two_handed');
    forge.draftData.value.specialEffect = '命中后发出雷鸣。\n此文本应保留换行。';
    forge.save();

    const saved = saveSpy.mock.calls[0][0] as InventoryItem;
    expect(saved.data).toMatchObject({
      type: 'weapon',
      category: 'martial_ranged',
      damage: '1d8',
      damageType: 'thunder',
      range: '150/600 尺',
      requiredAmmoType: 'arrow',
      properties: ['ammunition', 'two_handed'],
      specialEffect: '命中后发出雷鸣。\n此文本应保留换行。',
    });
  });

  it('saves a complete armor edit combination', () => {
    const forge = useForge();
    const saveSpy = vi.fn();

    forge.openForgeForItem(createBaseItem(), 'edit', saveSpy, { dataPackMaker: true });
    forge.updateItemType('armor');
    forge.draftItem.value!.name = '秘银板甲';
    forge.draftData.value.ac = 18;
    forge.draftData.value.armorType = 'heavy';
    forge.draftData.value.dexBonusMax = 0;
    forge.draftData.value.strReq = 15;
    forge.draftData.value.stealthDis = false;
    forge.draftData.value.donTime = '10 分钟';
    forge.draftData.value.doffTime = '5 分钟';
    forge.save();

    const saved = saveSpy.mock.calls[0][0] as InventoryItem;
    expect(saved.data).toMatchObject({
      type: 'armor',
      ac: 18,
      armorType: 'heavy',
      dexBonusMax: 0,
      strReq: 15,
      stealthDis: false,
      donTime: '10 分钟',
      doffTime: '5 分钟',
    });
  });

  it('saves tool, consumable, and container specialized fields after cross-type changes', () => {
    const forge = useForge();
    const saveSpy = vi.fn();

    forge.openForgeForItem(createBaseItem(), 'edit', saveSpy, { dataPackMaker: true });
    forge.updateItemType('weapon');
    forge.updateItemType('tool');
    forge.draftData.value.baseAbility = 'int';
    forge.updateItemType('consumable');
    forge.draftData.value.activation = '1 动作';
    forge.draftData.value.maxCharges = 3;
    forge.draftData.value.charges = 1;
    forge.draftData.value.isAmmunition = true;
    forge.draftData.value.ammoType = 'bolt';
    forge.draftData.value.effectDescription = '第一段效果\n第二段效果';
    forge.updateItemType('container');
    forge.draftData.value.capacityWeight = 120;
    forge.draftData.value.capacityVolume = '4 立方尺';
    forge.draftData.value.maxItems = 20;
    forge.draftData.value.ignoreContentWeight = true;
    forge.save();

    const saved = saveSpy.mock.calls[0][0] as InventoryItem;
    expect(saved.type).toBe('container');
    expect(saved.data).toMatchObject({
      type: 'container',
      capacityWeight: 120,
      capacityVolume: '4 立方尺',
      maxItems: 20,
      ignoreContentWeight: true,
    });
  });

  it('preserves data-pack assignment fields when applying a different template', () => {
    const forge = useForge();
    const saveSpy = vi.fn();
    const item = createBaseItem();
    item.data = {
      cost: { value: 1, unit: 'gp' },
      displayCategory: '战斗道具',
      displaySubcategory: '消耗品',
      encryptionGroupId: 'secret',
      visibility: { public: false, unlockGroupId: 'secret' },
      source: '自定义数据包',
    };

    forge.openForgeForItem(item, 'edit', saveSpy, { dataPackMaker: true });
    forge.updateItemTemplate('longsword');
    forge.save();

    const saved = saveSpy.mock.calls[0][0] as InventoryItem;
    expect(saved.templateId).toBe('longsword');
    expect(saved.type).toBe('weapon');
    expect(saved.data).toMatchObject({
      displayCategory: '战斗道具',
      displaySubcategory: '消耗品',
      encryptionGroupId: 'secret',
      visibility: { public: false, unlockGroupId: 'secret' },
      source: '自定义数据包',
    });
  });

  it('can save an item with optional description blocks and magic left undefined', () => {
    const forge = useForge();
    const saveSpy = vi.fn();
    const item = createBaseItem();
    item.descriptionBlocks = undefined;
    item.magic = undefined;

    forge.openForgeForItem(item, 'edit', saveSpy, { dataPackMaker: true });
    forge.save();

    expect(saveSpy).toHaveBeenCalledTimes(1);
    const saved = saveSpy.mock.calls[0][0] as InventoryItem;
    expect(saved.descriptionBlocks).toBeUndefined();
    expect(saved.magic).toEqual({
      isMagic: false,
      attunement: { requires: false },
    });
  });

  it('records save diagnostics and keeps the modal open when a data-pack override fails', () => {
    const forge = useForge();
    const dataPackStore = useDataPackStore();
    const saveSpy = vi.fn(() => {
      throw new Error('boom');
    });

    forge.openForgeForItem(createBaseItem(), 'edit', saveSpy, { dataPackMaker: true });
    forge.save();

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(forge.draftItem.value).not.toBeNull();
    expect(dataPackStore.makerDragDiagnostics.map(entry => entry.step)).toContain('forge.save-override');
    expect(dataPackStore.makerDragDiagnostics[0]?.status).toBe('error');
  });
});
