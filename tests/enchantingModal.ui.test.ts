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
    expect(weapon.magic?.visuals?.inventoryBackground).toBe('#dcc2ff');
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

  it('propagates custom trait edits to every item selecting that trait', async () => {
    const store = useActiveSheetStore();
    const character = createDefaultCharacter('enchant-modal-linked-trait');
    const weapon = createWeapon();
    const secondWeapon: InventoryItem = {
      ...createWeapon(),
      instanceId: 'enchant-target-2',
      name: 'Second Dagger',
      magic: { isMagic: false },
    };
    character.customMagicTraits = [
      {
        id: 'custom-fire',
        source: 'custom',
        type: 'damage',
        name: 'Flame',
        description: 'Old description',
        activationMode: 'always',
        participatesInDamage: true,
        damageDice: '1d6',
        damageBonus: 0,
        damageType: 'fire',
      },
    ];
    character.inventory = [weapon, secondWeapon];
    store.character = character;

    const wrapper = mountModal();
    useEnchanting().openEnchantingForItem(weapon);
    useEnchanting().toggleTraitSelection('custom-fire');
    useEnchanting().openEnchantingForItem(secondWeapon);
    useEnchanting().toggleTraitSelection('custom-fire');
    await nextTick();

    await wrapper.find('[data-test="enchant-tab-manage"]').trigger('click');
    const firstTraitEditor = wrapper.find('.saved-trait-edit');
    await firstTraitEditor.find('[data-test="edit-trait-name"]').setValue('Flame Revised');
    await firstTraitEditor.find('[data-test="edit-trait-dice"]').setValue('2d6');
    await firstTraitEditor.trigger('change');

    expect(weapon.magic?.customTraits?.[0]).toMatchObject({
      name: 'Flame Revised',
      damageDice: '2d6',
    });
    expect(secondWeapon.magic?.customTraits?.[0]).toMatchObject({
      name: 'Flame Revised',
      damageDice: '2d6',
    });
  });

  it('renders selectable magic traits as compact badges with hover detail text', async () => {
    const store = useActiveSheetStore();
    const character = createDefaultCharacter('enchant-modal-badges');
    const weapon = createWeapon();
    character.customMagicTraits = [
      {
        id: 'custom-glow',
        source: 'custom',
        type: 'plain',
        name: 'Glimmer',
        description: 'Soft light aura.',
        activationMode: 'always',
        participatesInDamage: false,
      },
    ];
    character.inventory = [weapon];
    store.character = character;

    const wrapper = mountModal();
    useEnchanting().openEnchantingForItem(weapon);
    await nextTick();

    await wrapper.find('[data-test="enchant-tab-traits"]').trigger('click');

    expect(wrapper.find('.trait-badge').exists()).toBe(true);
    expect(wrapper.findAll('.trait-hover-card').some(card => card.text().includes('Soft light aura.'))).toBe(true);
    expect(wrapper.find('.btn-edit-trait').exists()).toBe(true);
  });
});
