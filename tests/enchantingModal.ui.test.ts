// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import EnchantingModal from '../src/components/sheet/modals/EnchantingModal.vue';
import { useEnchanting } from '../src/composables/useEnchanting';
import { useActiveSheetStore } from '../src/stores/activeSheet';
import { createDefaultCharacter } from '../src/utils/characterMigration';
import type { InventoryItem } from '../src/types/Item';

const createElectronApiMock = () => ({
  saveCharacter: vi.fn().mockResolvedValue({ success: true, data: null }),
  loadAllCharacters: vi.fn().mockResolvedValue({ success: true, data: [] }),
  deleteCharacter: vi.fn().mockResolvedValue({ success: true, data: null }),
  writeLog: vi.fn().mockResolvedValue({ success: true, data: null }),
});

const createWeapon = (): InventoryItem => ({
  instanceId: 'enchant-target-1',
  templateId: 'dagger',
  name: '影牙',
  description: '',
  weight: 1,
  quantity: 1,
  type: 'weapon',
  magic: { isMagic: false },
  data: {
    category: 'simple_melee',
    damage: '1d4',
    damageType: 'piercing',
    properties: ['finesse', 'light'],
    range: '20/60',
  },
});

const mountModal = () =>
  mount(EnchantingModal, {
    global: {
      stubs: {
        Teleport: true,
        Transition: false,
      },
    },
  });

describe('EnchantingModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    Object.defineProperty(window, 'electronAPI', {
      value: createElectronApiMock(),
      configurable: true,
    });
    useEnchanting().closeEnchanting();
  });

  it('shares the selected target between entry points and the modal UI', async () => {
    const store = useActiveSheetStore();
    const character = createDefaultCharacter('enchant-modal-target');
    const weapon = createWeapon();
    character.inventory = [weapon];
    store.character = character;

    const wrapper = mountModal();
    useEnchanting().openEnchantingForItem(weapon);
    await nextTick();

    expect(wrapper.text()).toContain('影牙');
    expect(wrapper.text()).toContain('行囊预览');
    expect(weapon.magic?.visuals?.inventoryBackground).toBe('#f0e7ff');
  });

  it('creates a reusable custom damage trait and selects it for the current item', async () => {
    const store = useActiveSheetStore();
    const character = createDefaultCharacter('enchant-modal-create-trait');
    const weapon = createWeapon();
    character.inventory = [weapon];
    store.character = character;

    const wrapper = mountModal();
    useEnchanting().openEnchantingForItem(weapon);
    await nextTick();

    await wrapper.find('[data-test="enchant-tab-create"]').trigger('click');
    await wrapper.find('[data-test="custom-trait-type"]').setValue('damage');
    await nextTick();
    await wrapper.find('[data-test="custom-trait-name"]').setValue('寒霜');
    await wrapper.find('[data-test="custom-trait-participates"]').setValue(true);
    await wrapper.find('[data-test="custom-trait-dice"]').setValue('1d6');
    await wrapper.find('[data-test="save-custom-trait"]').trigger('click');

    expect(store.character.customMagicTraits).toHaveLength(1);
    expect(store.character.customMagicTraits[0]).toMatchObject({
      name: '寒霜',
      damageDice: '1d6',
      participatesInDamage: true,
    });
    expect(weapon.magic?.selectedTraitIds).toEqual([store.character.customMagicTraits[0]?.id]);
    expect(weapon.magic?.customTraits?.[0]).toMatchObject({
      name: '寒霜',
      damageDice: '1d6',
      participatesInDamage: true,
    });
    expect(wrapper.text()).toContain('寒霜');
  });

  it('creates plain charged and defense custom trait categories without exposing raw data', async () => {
    const store = useActiveSheetStore();
    const character = createDefaultCharacter('enchant-modal-new-categories');
    const weapon = createWeapon();
    character.inventory = [weapon];
    store.character = character;

    const wrapper = mountModal();
    useEnchanting().openEnchantingForItem(weapon);
    await nextTick();

    await wrapper.find('[data-test="enchant-tab-create"]').trigger('click');
    await wrapper.find('[data-test="custom-trait-type"]').setValue('plain');
    await wrapper.find('[data-test="custom-trait-activation"]').setValue('charged');
    await nextTick();
    await wrapper.find('[data-test="custom-trait-name"]').setValue('火花');
    await wrapper.find('[data-test="custom-trait-charges-current"]').setValue(1);
    await wrapper.find('[data-test="custom-trait-charges-max"]').setValue(3);
    await wrapper.find('[data-test="save-custom-trait"]').trigger('click');

    expect(store.character.customMagicTraits[0]).toMatchObject({
      type: 'plain',
      name: '火花',
      charges: { current: 1, max: 3 },
    });
    expect(wrapper.text()).toContain('普通');
    expect(wrapper.text()).not.toContain('"type"');

    await wrapper.find('[data-test="enchant-tab-create"]').trigger('click');
    await wrapper.find('[data-test="custom-trait-type"]').setValue('defense');
    await wrapper.find('[data-test="custom-trait-name"]').setValue('守御');
    await wrapper.find('[data-test="save-custom-trait"]').trigger('click');

    expect(store.character.customMagicTraits[1]).toMatchObject({
      type: 'defense',
      name: '守御',
    });
    expect(wrapper.text()).toContain('防御');
  });

  it('keeps selected item traits as snapshots when the reusable trait library changes', async () => {
    const store = useActiveSheetStore();
    const character = createDefaultCharacter('enchant-modal-decoupled-trait');
    const weapon = createWeapon();
    character.customMagicTraits = [
      {
        id: 'custom-fire',
        source: 'custom',
        type: 'damage',
        name: '烈焰',
        description: '旧描述',
        activationMode: 'always',
        participatesInDamage: true,
        damageDice: '1d6',
        damageBonus: 0,
        damageType: 'fire',
      },
    ];
    character.inventory = [weapon];
    store.character = character;

    mountModal();
    useEnchanting().openEnchantingForItem(weapon);
    useEnchanting().toggleTraitSelection('custom-fire');

    character.customMagicTraits[0]!.name = '烈焰改';
    character.customMagicTraits[0]!.damageDice = '2d6';

    expect(weapon.magic?.customTraits?.[0]).toMatchObject({
      name: '烈焰',
      damageDice: '1d6',
    });
  });
});
