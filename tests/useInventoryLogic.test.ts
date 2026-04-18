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

  it('creates a quiver and adds arrows as a 20-count bundle', () => {
    const character = ref(createDefaultCharacter('inventory-3'));
    const save = vi.fn();
    const logic = useInventoryLogic(character, ref([]), save);

    logic.addItem('arrows');

    const quiver = character.value.inventory.find((item) => item.templateId === 'quiver');
    const arrows = character.value.inventory.find((item) => item.templateId === 'arrows');

    expect(quiver).toBeTruthy();
    expect(arrows?.quantity).toBe(20);
    expect(arrows?.parentId).toBe(quiver?.instanceId);
    expect(save).toHaveBeenCalled();
  });
});
