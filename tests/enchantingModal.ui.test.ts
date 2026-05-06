// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import EnchantingModal from '../src/components/sheet/modals/EnchantingModal.vue';
import { useEnchanting } from '../src/composables/useEnchanting';
import { useActiveSheetStore } from '../src/stores/activeSheet';
import { useCustomMagicTraitStore } from '../src/stores/customMagicTraitStore';
import { useDataPackStore } from '../src/stores/dataPackStore';
import { createDefaultCharacter } from '../src/utils/characterMigration';
import type { InventoryItem } from '../src/types/Item';
import type { ItemMagicTrait, LibraryItem } from '../src/types/Library';

const createElectronApiMock = () => ({
  saveCharacter: vi.fn().mockResolvedValue({ success: true, data: null }),
  loadAllCharacters: vi.fn().mockResolvedValue({ success: true, data: [] }),
  deleteCharacter: vi.fn().mockResolvedValue({ success: true, data: null }),
  writeLog: vi.fn().mockResolvedValue({ success: true, data: null }),
  readCustomMagicTraits: vi.fn().mockResolvedValue({ success: true, data: [] }),
  saveCustomMagicTraits: vi.fn(async (traits: ItemMagicTrait[]) => ({ success: true, data: traits })),
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

const flushAsync = () => new Promise(resolve => window.setTimeout(resolve, 0));

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
    await flushAsync();

    const traitStore = useCustomMagicTraitStore();
    expect(traitStore.traits).toHaveLength(1);
    expect(traitStore.traits[0]).toMatchObject({
      name: '寒霜',
      damageDice: '1d6',
      participatesInDamage: true,
    });
    expect(store.character.customMagicTraits).toEqual([]);
    expect(weapon.magic?.selectedTraitIds).toEqual([traitStore.traits[0]?.id]);
    expect(weapon.magic?.customTraits?.[0]).toMatchObject({
      name: '寒霜',
      damageDice: '1d6',
      participatesInDamage: true,
    });
    expect(wrapper.text()).toContain('寒霜');
  });

  it('preserves custom trait description line breaks when saving and showing hover detail', async () => {
    const store = useActiveSheetStore();
    const character = createDefaultCharacter('enchant-modal-line-breaks');
    const weapon = createWeapon();
    character.inventory = [weapon];
    store.character = character;

    const wrapper = mountModal();
    useEnchanting().openEnchantingForItem(weapon);
    await nextTick();

    const description = '第一行规则\n第二行规则\n第三行规则';
    await wrapper.find('[data-test="enchant-tab-create"]').trigger('click');
    await wrapper.find('[data-test="custom-trait-name"]').setValue('换行词条');
    await wrapper.find('[data-test="custom-trait-description"]').setValue(description);
    await wrapper.find('[data-test="save-custom-trait"]').trigger('click');
    await flushAsync();

    const traitStore = useCustomMagicTraitStore();
    expect(traitStore.traits[0]?.description).toBe(description);
    expect(weapon.magic?.customTraits?.[0]?.description).toBe(description);

    await wrapper.find('[data-test="enchant-tab-traits"]').trigger('click');
    const hoverCard = wrapper.findAll('.trait-hover-card').find(card => card.text().includes('换行词条'));
    expect(hoverCard?.find('p.preserve-user-lines').element.textContent).toBe(description);
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
    await flushAsync();

    const traitStore = useCustomMagicTraitStore();
    expect(traitStore.traits[0]).toMatchObject({
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
    await flushAsync();

    expect(traitStore.traits[1]).toMatchObject({
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

  it('propagates custom trait edits to data-pack draft items selecting that trait', async () => {
    const store = useActiveSheetStore();
    const dataPackStore = useDataPackStore();
    const traitStore = useCustomMagicTraitStore();
    store.character = createDefaultCharacter('enchant-modal-data-pack-trait');
    await traitStore.upsertTrait({
      id: 'custom-light-wave',
      source: 'custom',
      type: 'plain',
      name: '光暗波动',
      description: '旧描述',
      activationMode: 'always',
      participatesInDamage: false,
    });
    const oldSnapshot: ItemMagicTrait = {
      id: 'custom-light-wave',
      source: 'custom',
      type: 'plain',
      name: '光暗波动',
      description: '旧描述',
      activationMode: 'always',
      participatesInDamage: false,
    };
    const draftItem = {
      id: 'ancient-staff-light',
      name: '古老附魔的长棍-光',
      type: 'weapon',
      cost: { value: 289, unit: 'gp' },
      weight: 4,
      description: '',
      category: 'simple_melee',
      damage: '1d6',
      damageType: 'bludgeoning',
      properties: ['versatile'],
      magic: {
        isMagic: true,
        selectedTraitIds: ['custom-light-wave'],
        customTraits: [oldSnapshot],
      },
    } as LibraryItem;
    dataPackStore.activeDraftPack = {
      manifest: {
        schemaVersion: 1,
        id: 'homebrew',
        name: '不朽精神数据包',
        version: '1.0.0',
      },
      items: [draftItem],
      spells: [],
      traits: [],
    };
    dataPackStore.isMakerOpen = true;

    const wrapper = mountModal();
    useEnchanting().openEnchantingForItem(createWeapon(), 'button', undefined, { dataPackMaker: true });
    await nextTick();

    await wrapper.find('[data-test="enchant-tab-manage"]').trigger('click');
    const firstTraitEditor = wrapper.find('.saved-trait-edit');
    await firstTraitEditor.find('[data-test="edit-trait-name"]').setValue('光暗波动·改');
    await firstTraitEditor.find('textarea').setValue('新描述会同步到所有选择该词条的物品。');
    await firstTraitEditor.trigger('change');
    await flushAsync();

    expect(dataPackStore.activeDraftPack.items?.[0].magic?.customTraits).toHaveLength(1);
    expect(dataPackStore.activeDraftPack.items?.[0].magic?.customTraits?.[0]).toMatchObject({
      id: 'custom-light-wave',
      name: '光暗波动·改',
      description: '新描述会同步到所有选择该词条的物品。',
    });
    expect(dataPackStore.draftDirty).toBe(true);
  });

  it('removing a custom trait from the reusable library keeps item-bound snapshots', async () => {
    const store = useActiveSheetStore();
    const character = createDefaultCharacter('enchant-modal-retained-snapshot');
    const weapon = createWeapon();
    character.customMagicTraits = [
      {
        id: 'custom-ice',
        source: 'custom',
        type: 'damage',
        name: 'Ice',
        description: 'Frozen edge.',
        activationMode: 'always',
        participatesInDamage: true,
        damageDice: '1d4',
        damageBonus: 0,
        damageType: 'cold',
      },
    ];
    character.inventory = [weapon];
    store.character = character;

    const wrapper = mountModal();
    useEnchanting().openEnchantingForItem(weapon);
    useEnchanting().toggleTraitSelection('custom-ice');
    await nextTick();

    await wrapper.find('[data-test="enchant-tab-manage"]').trigger('click');
    await wrapper.find('.btn-delete-trait').trigger('click');
    await flushAsync();

    expect(store.character.customMagicTraits).toEqual([]);
    expect(weapon.magic?.selectedTraitIds).toEqual(['custom-ice']);
    expect(weapon.magic?.customTraits?.[0]).toMatchObject({
      id: 'custom-ice',
      name: 'Ice',
      damageDice: '1d4',
    });
    expect(wrapper.text()).toContain('Ice');
  });

  it('maps item-bound selected trait snapshots into the trait selection list', async () => {
    const store = useActiveSheetStore();
    const character = createDefaultCharacter('enchant-modal-item-bound-selection');
    const weapon = createWeapon();
    weapon.magic = {
      isMagic: true,
      selectedTraitIds: ['deleted-custom-spark'],
      customTraits: [
        {
          id: 'deleted-custom-spark',
          source: 'custom',
          type: 'plain',
          name: 'Remembered Spark',
          description: 'This trait only exists on the item snapshot.',
          activationMode: 'always',
          participatesInDamage: false,
        },
      ],
    };
    character.customMagicTraits = [];
    character.inventory = [weapon];
    store.character = character;

    const wrapper = mountModal();
    useEnchanting().openEnchantingForItem(weapon);
    await nextTick();

    await wrapper.find('[data-test="enchant-tab-traits"]').trigger('click');
    await nextTick();

    const matchingBadge = wrapper.findAll('.trait-badge').find(badge => badge.text().includes('Remembered Spark'));
    expect(matchingBadge).toBeTruthy();
    expect(matchingBadge?.classes()).toContain('selected');
    expect(matchingBadge?.find('input[type="checkbox"]').element).toMatchObject({ checked: true });
    expect(matchingBadge?.text()).toContain('This trait only exists on the item snapshot.');
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
