import { ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { useInventoryLogic } from '../src/stores/sheet/useInventoryLogic';
import { createDefaultCharacter } from '../src/utils/characterMigration';

describe('useInventoryLogic', () => {
  it('counts nested container weight unless the container ignores contents', () => {
    const character = ref(createDefaultCharacter('inventory-1'));
    character.value.inventory = [
      {
        instanceId: 'backpack-1',
        templateId: 'backpack',
        name: 'Backpack',
        description: '',
        weight: 5,
        quantity: 1,
        type: 'container',
        data: {
          ignoreContentWeight: false,
        },
      },
      {
        instanceId: 'rope-1',
        templateId: 'rope_hempen',
        name: 'Rope',
        description: '',
        weight: 2,
        quantity: 2,
        type: 'gear',
        parentId: 'backpack-1',
        data: {},
      },
    ];

    const logic = useInventoryLogic(character, ref([]), vi.fn());
    expect(logic.totalWeight.value).toBe(9);

    character.value.inventory[0].data = { ignoreContentWeight: true };
    expect(logic.totalWeight.value).toBe(5);
  });

  it('borrows from platinum when subtracting more gold than available', () => {
    const character = ref(createDefaultCharacter('inventory-2'));
    character.value.wallet = { pp: 1, gp: 0, ep: 0, sp: 0, cp: 0 };
    const save = vi.fn();
    const logic = useInventoryLogic(character, ref([]), save);

    const success = logic.modifyCurrency('gp', -2);

    expect(success).toBe(true);
    expect(character.value.wallet).toEqual({ pp: 0, gp: 8, ep: 0, sp: 0, cp: 0 });
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('stacks duplicate non-consumable items in the same inventory location', () => {
    const character = ref(createDefaultCharacter('inventory-2b'));
    const logic = useInventoryLogic(character, ref([]), vi.fn());

    logic.addItem('longsword');
    logic.addItem('longsword');

    const swords = character.value.inventory.filter((item) => item.templateId === 'longsword');
    expect(swords).toHaveLength(1);
    expect(swords[0].quantity).toBe(2);
  });

  it('creates dragged library items at the requested preview index', () => {
    const character = ref(createDefaultCharacter('inventory-drop-index'));
    const logic = useInventoryLogic(character, ref([]), vi.fn());

    logic.addItem('dagger');
    logic.addItem('club');
    logic.addItem('longsword', 1);

    expect(character.value.inventory.map((item) => item.templateId)).toEqual([
      'dagger',
      'longsword',
      'club',
    ]);
  });

  it('moves a merged stack to the requested preview index', () => {
    const character = ref(createDefaultCharacter('inventory-drop-merge-index'));
    const logic = useInventoryLogic(character, ref([]), vi.fn());

    logic.addItem('dagger');
    logic.addItem('club');
    logic.addItem('dagger', 2);

    expect(character.value.inventory.map((item) => item.templateId)).toEqual(['club', 'dagger']);
    expect(character.value.inventory.find((item) => item.templateId === 'dagger')?.quantity).toBe(2);
  });

  it('stacks empty containers but keeps containers with contents separate', () => {
    const character = ref(createDefaultCharacter('inventory-2c'));
    const logic = useInventoryLogic(character, ref([]), vi.fn());

    logic.addItem('backpack');
    logic.addItem('backpack');

    let backpacks = character.value.inventory.filter((item) => item.templateId === 'backpack');
    expect(backpacks).toHaveLength(1);
    expect(backpacks[0].quantity).toBe(2);

    logic.addItem('torch', undefined, backpacks[0].instanceId);
    logic.addItem('backpack');

    backpacks = character.value.inventory.filter((item) => item.templateId === 'backpack');
    expect(backpacks).toHaveLength(2);
    expect(backpacks.map((item) => item.quantity)).toEqual([2, 1]);
  });

  it('creates a fresh quiver and adds arrows through the acquisition rule', () => {
    const character = ref(createDefaultCharacter('inventory-3'));
    const save = vi.fn();
    const logic = useInventoryLogic(character, ref([]), save);

    logic.addItem('arrows');
    logic.addItem('arrows');

    const quivers = character.value.inventory.filter((item) => item.templateId === 'quiver');
    const arrowStacks = character.value.inventory.filter((item) => item.templateId === 'arrows');

    expect(quivers).toHaveLength(2);
    expect(arrowStacks.map((item) => item.quantity)).toEqual([20, 20]);
    expect(arrowStacks.map((item) => item.weight)).toEqual([0.05, 0.05]);
    expect(arrowStacks[0].parentId).toBe(quivers[0].instanceId);
    expect(arrowStacks[1].parentId).toBe(quivers[1].instanceId);
    expect(save).toHaveBeenCalled();
  });

  it('counts only quiver self weight while exposing a single ammunition stack inside it', () => {
    const character = ref(createDefaultCharacter('inventory-3b'));
    const logic = useInventoryLogic(character, ref([]), vi.fn());

    logic.addItem('arrows');

    const quiver = character.value.inventory.find((item) => item.templateId === 'quiver');
    const arrows = character.value.inventory.find((item) => item.templateId === 'arrows');

    expect(quiver).toBeTruthy();
    expect(quiver?.data).toHaveProperty('ignoreContentWeight', true);
    expect(arrows?.parentId).toBe(quiver?.instanceId);
    expect(logic.getContainerContents.value(quiver!.instanceId)).toEqual([arrows]);
    expect(logic.getItemWeight.value(quiver!)).toBe(quiver!.weight);
    expect(logic.totalWeight.value).toBe(quiver!.weight);

    logic.updateItemQuantity(arrows!.instanceId, 1);
    expect(arrows?.quantity).toBe(21);
    expect(logic.totalWeight.value).toBe(quiver!.weight);
  });

  it('uses reviewed custom acquisition containers for split ammunition and bundle gear', () => {
    const character = ref(createDefaultCharacter('inventory-3c'));
    const logic = useInventoryLogic(character, ref([]), vi.fn());

    logic.addItem('crossbow_bolts');
    logic.addItem('blowgun_needles');
    logic.addItem('sling_bullets');
    logic.addItem('ball_bearings');
    logic.addItem('caltrops');

    const boltCase = character.value.inventory.find((item) => item.templateId === 'crossbow_bolt_case');
    const bolts = character.value.inventory.find((item) => item.templateId === 'crossbow_bolts');
    expect(boltCase).toBeTruthy();
    expect(bolts?.quantity).toBe(20);
    expect(bolts?.parentId).toBe(boltCase?.instanceId);

    const pouches = character.value.inventory.filter((item) => item.templateId === 'pouch');
    expect(pouches).toHaveLength(4);
    expect(character.value.inventory.find((item) => item.templateId === 'blowgun_needles')?.quantity).toBe(50);
    expect(character.value.inventory.find((item) => item.templateId === 'sling_bullets')?.quantity).toBe(20);
    expect(character.value.inventory.find((item) => item.templateId === 'ball_bearings')?.parentId).toBe(pouches[2].instanceId);
    expect(character.value.inventory.find((item) => item.templateId === 'caltrops')?.parentId).toBe(pouches[3].instanceId);
  });

  it('creates reviewed split grouped items as a source-sized stack', () => {
    const character = ref(createDefaultCharacter('inventory-3d'));
    const logic = useInventoryLogic(character, ref([]), vi.fn());

    logic.addItem('iron_spikes_10');
    logic.addItem('iron_spikes_10');

    const spikes = character.value.inventory.find((item) => item.templateId === 'iron_spikes_10');
    expect(spikes?.quantity).toBe(20);
    expect(spikes?.weight).toBe(0.5);
    expect(logic.totalWeight.value).toBe(10);
  });

  it('keeps backpack hanging-slot items separate from normal contents', () => {
    const character = ref(createDefaultCharacter('inventory-4'));
    const save = vi.fn();
    const logic = useInventoryLogic(character, ref([]), save);

    logic.addItem('explorers_pack');

    const backpack = character.value.inventory.find((item) => item.templateId === 'backpack');
    expect(backpack).toBeTruthy();
    expect(backpack?.name).toBe('背包（探索套组）');

    const rope = character.value.inventory.find((item) => item.templateId === 'hempen_rope_50ft');
    expect(rope?.parentId).toBe(backpack?.instanceId);
    expect(rope?.containerSlot).toBe('hanging');
    expect(logic.getContainerHangingItem.value(backpack!.instanceId)?.instanceId).toBe(rope?.instanceId);
    expect(logic.getContainerContents.value(backpack!.instanceId).some((item) => item.instanceId === rope?.instanceId)).toBe(false);
  });

  it('renames non-backpack pack containers with the pack name', () => {
    const character = ref(createDefaultCharacter('inventory-5'));
    const save = vi.fn();
    const logic = useInventoryLogic(character, ref([]), save);

    logic.addItem('diplomats_pack');

    const chest = character.value.inventory.find((item) => item.templateId === 'chest');
    expect(chest).toBeTruthy();
    expect(chest?.name).toBe('箱子（大使套组）');

    const fineClothes = character.value.inventory.find((item) => item.templateId === 'clothes_fine');
    expect(fineClothes?.parentId).toBe(chest?.instanceId);
  });
});
