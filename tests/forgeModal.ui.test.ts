// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import ForgeModal from '../src/components/sheet/modals/ForgeModal.vue';
import { useForge } from '../src/composables/useForge';
import { useActiveSheetStore } from '../src/stores/activeSheet';
import { createDefaultCharacter } from '../src/utils/characterMigration';
import { createItemFromLibrary } from '../src/utils/itemFactory';
import type { InventoryItem } from '../src/types/Item';

const createElectronApiMock = () => ({
  saveCharacter: vi.fn().mockResolvedValue({ success: true, data: null }),
  loadAllCharacters: vi.fn().mockResolvedValue({ success: true, data: [] }),
  deleteCharacter: vi.fn().mockResolvedValue({ success: true, data: null }),
  writeLog: vi.fn().mockResolvedValue({ success: true, data: null }),
});

const createStructuredItem = (): InventoryItem => ({
  instanceId: 'forge-description-item',
  templateId: 'quarterstaff',
  name: 'Ancient Staff',
  description: 'Old description',
  descriptionBlocks: [{ type: 'paragraph', text: 'Old structured source block' }],
  weight: 4,
  quantity: 1,
  type: 'weapon',
  magic: { isMagic: true },
  data: {
    cost: { value: 289, unit: 'gp' },
    category: 'simple_melee',
    damage: '1d6',
    damageType: 'bludgeoning',
    properties: ['versatile'],
    versatileDamage: '1d8',
    range: '5 ft',
  },
});

const mountModal = () =>
  mount(ForgeModal, {
    attachTo: document.body,
    global: {
      stubs: {
        Teleport: true,
        Transition: false,
      },
    },
  });

describe('ForgeModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    Object.defineProperty(window, 'electronAPI', {
      value: createElectronApiMock(),
      configurable: true,
    });
    useForge().close();
  });

  it('clears old structured description blocks when the GM writes a custom description', async () => {
    const forge = useForge();
    forge.openForgeForItem(createStructuredItem(), 'edit');
    const wrapper = mountModal();

    await wrapper.find('.desc-area').trigger('click');
    await wrapper.find('.desc-area textarea').setValue('New custom description\nsecond line');
    await wrapper.find('.desc-area textarea').trigger('blur');

    expect(forge.draftItem.value?.description).toBe('New custom description\nsecond line');
    expect(forge.draftItem.value?.descriptionBlocks).toBeUndefined();
  });

  it('applies a selected potion template before saving data-pack maker edits', () => {
    const forge = useForge();
    const healingPotion = createItemFromLibrary('potion_healing');
    const oilFlask = createItemFromLibrary('oil_flask');
    expect(healingPotion).toBeTruthy();
    expect(oilFlask).toBeTruthy();
    const saveSpy = vi.fn();
    healingPotion!.data.displayCategory = 'Custom Potions';
    healingPotion!.data.displaySubcategory = 'Experiments';
    healingPotion!.data.encryptionGroupId = 'secret';
    healingPotion!.data.visibility = { public: false, unlockGroupId: 'secret' };
    healingPotion!.data.source = 'Test Pack';

    forge.openForgeForItem(healingPotion!, 'edit', saveSpy, { dataPackMaker: true });
    forge.updateItemTemplate('oil_flask');
    forge.save();

    expect(saveSpy).toHaveBeenCalledTimes(1);
    const saved = saveSpy.mock.calls[0][0] as InventoryItem;
    const savedData = saved.data as Record<string, unknown>;
    const oilData = oilFlask!.data as Record<string, unknown>;
    expect(saved.templateId).toBe('oil_flask');
    expect(saved.name).toBe(oilFlask!.name);
    expect(saved.description).toBe(oilFlask!.description);
    expect(savedData.effectDescription).toBe(oilData.effectDescription);
    expect(savedData.displayCategory).toBe('Custom Potions');
    expect(savedData.displaySubcategory).toBe('Experiments');
    expect(savedData.visibility).toEqual({ public: false, unlockGroupId: 'secret' });
  });

  it('persists field edits after clicking the save changes button', async () => {
    const activeSheet = useActiveSheetStore();
    const character = createDefaultCharacter('forge-save-button');
    const item = createStructuredItem();
    character.inventory.push(item);
    activeSheet.character = character;
    const forge = useForge();
    forge.openForgeForItem(item, 'edit');
    const wrapper = mountModal();

    await wrapper.find('.main-name .editable-container').trigger('click');
    const input = wrapper.find('.main-name input');
    (input.element as HTMLInputElement).focus();
    await input.setValue('Saved Staff');

    await wrapper.find('.btn-save').trigger('mousedown');
    await wrapper.find('.btn-save').trigger('click');
    await nextTick();

    expect(activeSheet.character.inventory[0]?.name).toBe('Saved Staff');
    expect(forge.draftItem.value).toBeNull();
  });
});
