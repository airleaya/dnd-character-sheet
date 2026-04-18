import { ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { useCombatLogic } from '../src/stores/sheet/useCombatLogic';
import { createDefaultCharacter } from '../src/utils/characterMigration';

describe('useCombatLogic', () => {
  it('drops monk unarmored defense when a shield is equipped', () => {
    const character = ref(createDefaultCharacter('combat-1'));
    character.value.stats.dex = 16;
    character.value.stats.wis = 18;
    character.value.combat.acMode = 'monk';
    character.value.inventory.push({
      instanceId: 'shield-1',
      templateId: 'shield',
      name: 'Shield',
      description: '',
      weight: 6,
      quantity: 1,
      type: 'armor',
      data: {
        armorType: 'shield',
        ac: 2,
      },
    });
    character.value.equippedIds = ['shield-1'];

    const logic = useCombatLogic(character, vi.fn(), ref(2));

    expect(logic.armorClass.value).toBe(15);
  });

  it('clamps hit dice adjustments within the current max', () => {
    const character = ref(createDefaultCharacter('combat-2'));
    character.value.combat.hitDice = {
      d8: { current: 2, max: 4 },
    };
    const save = vi.fn();
    const logic = useCombatLogic(character, save, ref(2));

    logic.changeHitDiceCurrent('d8', 10);
    expect(character.value.combat.hitDice.d8.current).toBe(4);

    logic.changeHitDiceCurrent('d8', -10);
    expect(character.value.combat.hitDice.d8.current).toBe(0);
    expect(save).toHaveBeenCalledTimes(2);
  });

  it('fully heals and resets death saves together', () => {
    const character = ref(createDefaultCharacter('combat-3'));
    character.value.combat.hpCurrent = 1;
    character.value.combat.deathSaves = { success: 2, failure: 1 };
    const save = vi.fn();
    const logic = useCombatLogic(character, save, ref(2));

    logic.fullHeal();

    expect(character.value.combat.hpCurrent).toBe(character.value.combat.hpMax);
    expect(character.value.combat.deathSaves).toEqual({ success: 0, failure: 0 });
    expect(save).toHaveBeenCalledTimes(2);
  });

  it('builds finesse weapon attacks for strength, dexterity, and offhand usage', () => {
    const character = ref(createDefaultCharacter('combat-4'));
    character.value.stats.str = 14;
    character.value.stats.dex = 18;
    character.value.proficiencies.weapons = ['martial'];
    character.value.inventory.push({
      instanceId: 'rapier-1',
      templateId: 'rapier',
      name: 'Rapier',
      description: '',
      weight: 2,
      quantity: 1,
      type: 'weapon',
      data: {
        category: 'martial_melee',
        damage: '1d8',
        damageType: 'piercing',
        properties: ['finesse'],
      },
    });

    const logic = useCombatLogic(character, vi.fn(), ref(2));
    const rapierEntries = logic.attacks.value.filter((entry) => entry.baseId === 'rapier-1');

    expect(rapierEntries).toHaveLength(3);
    expect(rapierEntries.map((entry) => entry.id)).toEqual(['rapier-1_str', 'rapier-1_dex', 'rapier-1_off']);
    expect(rapierEntries.map((entry) => entry.hit)).toEqual(['+4', '+6', '+6']);
    expect(rapierEntries.map((entry) => entry.damage)).toEqual([
      '1d8 +2 穿刺 (Piercing)',
      '1d8 +4 穿刺 (Piercing)',
      '1d8  穿刺 (Piercing)',
    ]);
  });
});
