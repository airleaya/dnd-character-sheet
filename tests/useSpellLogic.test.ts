import { ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { useSpellLogic } from '../src/stores/sheet/useSpellLogic';
import { createDefaultCharacter } from '../src/utils/characterMigration';

describe('useSpellLogic', () => {
  it('groups known spells while only exposing prepared spells in battle groups', () => {
    const character = ref(createDefaultCharacter('spell-1'));
    character.value.spells.known = ['fire_bolt', 'magic_missile', 'shield'];
    character.value.spells.prepared = ['magic_missile'];
    character.value.spells.slots.current[1] = 1;
    character.value.spells.slots.max[1] = 3;

    const logic = useSpellLogic(character, vi.fn(), ref(2));

    expect(logic.spellbookGroups.value.map((group) => group.level)).toEqual([0, 1]);
    expect(logic.spellbookGroups.value[1]?.slots).toEqual({ current: 1, max: 3 });
    expect(logic.battleSpells.value.map((spell) => spell.id)).toEqual(['fire_bolt', 'magic_missile']);
    expect(logic.battleGroups.value.map((group) => group.level)).toEqual([0, 1]);
  });

  it('learns a spell once and records the casting source', () => {
    const character = ref(createDefaultCharacter('spell-2'));
    const save = vi.fn();
    const logic = useSpellLogic(character, save, ref(2));

    const firstLearn = logic.learnSpell('shield', 'secondary');
    const duplicateLearn = logic.learnSpell('shield', 'primary');

    expect(firstLearn).toBe(true);
    expect(duplicateLearn).toBe(false);
    expect(character.value.spells.known).toEqual(['shield']);
    expect(character.value.spells.spellSources.shield).toBe('secondary');
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('recovers spell slots and clamps pact slots to their max', () => {
    const character = ref(createDefaultCharacter('spell-3'));
    const save = vi.fn();
    character.value.spells.slots.current = [0, 0, 1, 0, 0, 0, 0, 0, 0, 0];
    character.value.spells.slots.max = [0, 4, 3, 0, 0, 0, 0, 0, 0, 0];
    character.value.spells.pactSlots = { level: 2, current: 1, max: 2 };
    const logic = useSpellLogic(character, save, ref(2));

    logic.updatePactSlotMax(1, 3);
    logic.recoverAllSlots();

    expect(character.value.spells.pactSlots).toEqual({ level: 3, current: 1, max: 1 });
    expect(character.value.spells.slots.current).toEqual([0, 4, 3, 0, 0, 0, 0, 0, 0, 0]);
    expect(save).toHaveBeenCalledTimes(2);
  });

  it('exposes charged equipment traits as equipment spell actions with independent counters', () => {
    const character = ref(createDefaultCharacter('spell-equipment-traits'));
    character.value.inventory.push({
      instanceId: 'wand-1',
      templateId: 'wand',
      name: '紫杉魔杖',
      description: '',
      weight: 1,
      quantity: 1,
      type: 'gear',
      magic: {
        isMagic: true,
        selectedTraitIds: ['spark'],
        customTraits: [
          {
            id: 'spark',
            source: 'custom',
            type: 'plain',
            name: '火花',
            description: '放出一枚无害火花。',
            activationMode: 'charged',
            participatesInDamage: false,
            charges: { current: 2, max: 3, resetCondition: '每日黎明' },
          },
        ],
        visuals: {
          inventoryBackground: '#ffeeaa',
          nameColor: '#771122',
        },
      },
      data: {},
    });
    const save = vi.fn();
    const logic = useSpellLogic(character, save, ref(2));

    expect(logic.equipmentTraitActions.value).toHaveLength(1);
    expect(logic.equipmentTraitActions.value[0]).toMatchObject({
      itemId: 'wand-1',
      traitId: 'spark',
      name: '火花',
      itemName: '紫杉魔杖',
      charges: { current: 2, max: 3, resetCondition: '每日黎明' },
      style: { backgroundColor: '#ffeeaa', color: '#771122' },
    });

    logic.updateEquipmentTraitCharge('wand-1', 'spark', 1);

    expect(character.value.inventory[0]?.magic?.customTraits?.[0]?.charges?.current).toBe(1);
    expect(save).toHaveBeenCalledTimes(1);
  });
});
