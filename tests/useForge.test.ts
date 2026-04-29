import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useForge } from '../src/composables/useForge';
import { useActiveSheetStore } from '../src/stores/activeSheet';
import { createDefaultCharacter } from '../src/utils/characterMigration';
import type { InventoryItem } from '../src/types/Item';

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
});
