import { nextTick, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { useCombatLogic } from '../src/stores/sheet/useCombatLogic';
import { createDefaultCharacter, normalizeCharacterData } from '../src/utils/characterMigration';
import type { InventoryItem, WeaponData } from '../src/types/Item';

const createWeaponItem = (
  instanceId: string,
  {
    templateId = 'dagger',
    name = 'Dagger',
    quantity = 1,
  }: {
    templateId?: string;
    name?: string;
    quantity?: number;
  } = {},
  dataOverrides: Partial<WeaponData> = {}
): InventoryItem => ({
  instanceId,
  templateId,
  name,
  description: '',
  weight: 1,
  quantity,
  type: 'weapon',
  data: {
    category: 'simple_melee',
    damage: '1d4',
    damageType: 'piercing',
    properties: ['finesse', 'light', 'thrown'],
    range: '20/60',
    ...dataOverrides,
  },
});

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

  it('starts new characters with an empty attack selection while keeping the catalog available', () => {
    const character = ref(createDefaultCharacter('combat-4'));
    const logic = useCombatLogic(character, vi.fn(), ref(2));

    expect(character.value.selectedAttackKeys).toEqual([]);
    expect(logic.selectedAttacks.value).toEqual([]);
    expect(logic.attackCatalog.value.length).toBeGreaterThan(0);
  });

  it('migrates legacy hiddenAttacks into selectedAttackKeys', async () => {
    const character = ref(createDefaultCharacter('combat-5'));
    character.value.attackSelectionInitialized = false;
    character.value.hiddenAttacks = ['unarmed'];
    const save = vi.fn();

    const logic = useCombatLogic(character, save, ref(2));
    await nextTick();

    expect(character.value.attackSelectionInitialized).toBe(true);
    expect(character.value.selectedAttackKeys).toEqual([]);
    expect(logic.selectedAttacks.value).toEqual([]);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('dedupes identical weapon instances into one catalog entry per attack path', () => {
    const character = ref(createDefaultCharacter('combat-6'));
    character.value.proficiencies.weapons = ['simple'];
    character.value.inventory.push(createWeaponItem('dagger-1'));
    character.value.inventory.push(createWeaponItem('dagger-2'));

    const logic = useCombatLogic(character, vi.fn(), ref(2));
    const daggerBaseEntries = logic.attackCatalog.value.filter(
      entry =>
        entry.sourceType === 'weapon' &&
        entry.attackMode === 'base' &&
        entry.handMode === 'one_hand'
    );

    expect(daggerBaseEntries).toHaveLength(2);
    expect(daggerBaseEntries.map(entry => entry.abilityPath)).toEqual(['str', 'dex']);
    daggerBaseEntries.forEach(entry => {
      expect(entry.rawKeys).toHaveLength(2);
    });
  });

  it('keeps strength and dexterity finesse paths separate even when the visible result matches', () => {
    const character = ref(createDefaultCharacter('combat-7'));
    character.value.stats.str = 16;
    character.value.stats.dex = 16;
    character.value.proficiencies.weapons = ['martial'];
    character.value.inventory.push(
      createWeaponItem(
        'rapier-1',
        { templateId: 'rapier', name: 'Rapier' },
        {
          category: 'martial_melee',
          damage: '1d8',
          damageType: 'piercing',
          properties: ['finesse'],
          range: '5',
        }
      )
    );

    const logic = useCombatLogic(character, vi.fn(), ref(2));
    const rapierBaseEntries = logic.attackCatalog.value.filter(
      entry =>
        entry.sourceType === 'weapon' &&
        entry.attackMode === 'base' &&
        entry.handMode === 'one_hand'
    );

    expect(rapierBaseEntries).toHaveLength(2);
    expect(rapierBaseEntries.map(entry => entry.abilityPath)).toEqual(['str', 'dex']);
    expect(new Set(rapierBaseEntries.map(entry => entry.catalogKey)).size).toBe(2);
    expect(new Set(rapierBaseEntries.map(entry => entry.hit)).size).toBe(1);
    expect(new Set(rapierBaseEntries.map(entry => entry.damage)).size).toBe(1);
  });

  it('preserves user selection order in selectedAttacks', () => {
    const character = ref(createDefaultCharacter('combat-8'));
    character.value.proficiencies.weapons = ['martial'];
    character.value.inventory.push(
      createWeaponItem(
        'rapier-1',
        { templateId: 'rapier', name: 'Rapier' },
        {
          category: 'martial_melee',
          damage: '1d8',
          damageType: 'piercing',
          properties: ['finesse'],
          range: '5',
        }
      )
    );
    const save = vi.fn();
    const logic = useCombatLogic(character, save, ref(2));

    const keys = logic.attackCatalog.value.slice(0, 3).map(entry => entry.catalogKey);
    expect(keys).toHaveLength(3);

    logic.selectAttack(keys[2]);
    logic.selectAttack(keys[0]);
    logic.selectAttack(keys[1]);

    expect(character.value.selectedAttackKeys).toEqual([keys[2], keys[0], keys[1]]);
    expect(logic.selectedAttacks.value.map(entry => entry.catalogKey)).toEqual([
      keys[2],
      keys[0],
      keys[1],
    ]);
    expect(save).toHaveBeenCalledTimes(3);
  });

  it('reorders selected attacks through the combat logic API', () => {
    const character = ref(createDefaultCharacter('combat-reorder-attacks'));
    character.value.proficiencies.weapons = ['martial'];
    character.value.inventory.push(
      createWeaponItem(
        'rapier-1',
        { templateId: 'rapier', name: 'Rapier' },
        {
          category: 'martial_melee',
          damage: '1d8',
          damageType: 'piercing',
          properties: ['finesse'],
          range: '5',
        }
      )
    );
    const save = vi.fn();
    const logic = useCombatLogic(character, save, ref(2));

    const keys = logic.attackCatalog.value.slice(0, 3).map(entry => entry.catalogKey);
    keys.forEach(key => logic.selectAttack(key));
    save.mockClear();

    logic.reorderSelectedAttacks([keys[2]!, keys[0]!, keys[1]!]);

    expect(character.value.selectedAttackKeys).toEqual([keys[2], keys[0], keys[1]]);
    expect(logic.selectedAttacks.value.map(entry => entry.catalogKey)).toEqual([
      keys[2],
      keys[0],
      keys[1],
    ]);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('exposes hit and damage bonus breakdowns for attack tooltips', () => {
    const character = ref(createDefaultCharacter('combat-9'));
    character.value.stats.str = 16;
    character.value.proficiencies.weapons = ['simple'];
    character.value.inventory.push(
      createWeaponItem('club-1', { templateId: 'club', name: 'Club' }, {
        category: 'simple_melee',
        damage: '1d4',
        damageType: 'bludgeoning',
        properties: ['light'],
        range: '5',
      })
    );

    const logic = useCombatLogic(character, vi.fn(), ref(2));
    const clubBase = logic.attackCatalog.value.find(
      entry => entry.sourceType === 'weapon' && entry.attackMode === 'base'
    );
    const clubOffhand = logic.attackCatalog.value.find(
      entry => entry.sourceType === 'weapon' && entry.attackMode === 'offhand'
    );

    expect(clubBase?.bonusBreakdown).toEqual({
      abilityModifier: 3,
      proficiencyBonus: 2,
      proficiencyApplied: true,
      hitBonus: 5,
      damageBonus: 3,
      damageAbilityModifier: 3,
      offhandDamagePenalty: false,
    });
    expect(clubOffhand?.bonusBreakdown).toEqual({
      abilityModifier: 3,
      proficiencyBonus: 2,
      proficiencyApplied: true,
      hitBonus: 5,
      damageBonus: 0,
      damageAbilityModifier: 0,
      offhandDamagePenalty: true,
    });
  });

  it('adds jack of all trades to initiative for eligible bards', () => {
    const character = ref(createDefaultCharacter('combat-jack-initiative'));
    character.value.profile.level = 5;
    character.value.profile.classes = [{ classId: 'b', subclassId: null, level: 2 }];
    character.value.stats.dex = 14;

    const logic = useCombatLogic(character, vi.fn(), ref(3));

    expect(logic.initiative.value).toBe('+3');
    expect(logic.initiativeJackOfAllTrades.value).toBe(true);

    character.value.profile.classes[0]!.level = 1;

    expect(logic.initiative.value).toBe('+2');
    expect(logic.initiativeJackOfAllTrades.value).toBe(false);
  });

  it('adds jack of all trades to initiative for single-class bards without class level data', () => {
    const character = ref(createDefaultCharacter('combat-jack-initiative-main'));
    character.value.profile.level = 2;
    character.value.profile.classes = [{ classId: 'b', subclassId: null }];
    character.value.stats.dex = 14;

    const logic = useCombatLogic(character, vi.fn(), ref(2));

    expect(logic.initiative.value).toBe('+3');
  });

  it('normalizes old characters with the default unarmed strike', () => {
    const character = normalizeCharacterData({ id: 'legacy-unarmed' });

    expect(character.unarmedStrikes).toEqual([
      {
        id: 'unarmed_default',
        name: '徒手打击',
        tags: ['none'],
        hitAbility: 'str',
        damageDice: '1',
        damageAbility: 'str',
        damageType: 'bludgeoning',
        isMagic: false,
      },
    ]);
  });

  it('builds the default unarmed strike from character unarmed strike config', () => {
    const character = ref(createDefaultCharacter('combat-unarmed-default'));
    character.value.stats.str = 16;

    const logic = useCombatLogic(character, vi.fn(), ref(2));
    const unarmed = logic.attackCatalog.value.find(entry => entry.sourceType === 'unarmed');

    expect(unarmed?.name).toBe('👊 徒手打击');
    expect(unarmed?.hit).toBe('+5');
    expect(unarmed?.damage).toBe('1 +3 钝击');
    expect(unarmed?.unarmedTags).toEqual(['none']);
    expect(unarmed?.isMagicAttack).toBe(false);
  });

  it('supports custom unarmed strike hit, damage, type, tags, and magic display data', () => {
    const character = ref(createDefaultCharacter('combat-unarmed-custom'));
    character.value.stats.dex = 18;
    character.value.stats.wis = 14;
    character.value.unarmedStrikes = [
      {
        id: 'astral-arm',
        name: '星界之臂',
        tags: ['astral_arms'],
        hitAbility: 'wis',
        damageDice: '1d8',
        damageAbility: 'dex',
        damageType: 'force',
        isMagic: true,
      },
    ];

    const logic = useCombatLogic(character, vi.fn(), ref(3));
    const unarmed = logic.attackCatalog.value.find(entry => entry.sourceType === 'unarmed');

    expect(unarmed?.hit).toBe('+5');
    expect(unarmed?.damage).toBe('1d8 +4 力场');
    expect(unarmed?.abilityPath).toBe('wis');
    expect(unarmed?.damageAbilityPath).toBe('dex');
    expect(unarmed?.unarmedTags).toEqual(['astral_arms']);
    expect(unarmed?.isMagicAttack).toBe(true);
  });

  it('prevents duplicate unarmed strike results while allowing different tags', () => {
    const character = ref(createDefaultCharacter('combat-unarmed-duplicate'));
    const save = vi.fn();
    const logic = useCombatLogic(character, save, ref(2));

    expect(
      logic.addUnarmedStrike({
        id: 'same-result',
        name: 'Same Result',
        tags: ['none'],
        hitAbility: 'str',
        damageDice: '1',
        damageAbility: 'str',
        damageType: 'bludgeoning',
        isMagic: false,
      })
    ).toBe(false);

    expect(
      logic.addUnarmedStrike({
        id: 'tagged-result',
        name: 'Tagged Result',
        tags: ['natural_weapon'],
        hitAbility: 'str',
        damageDice: '1',
        damageAbility: 'str',
        damageType: 'bludgeoning',
        isMagic: false,
      })
    ).toBe(true);

    expect(character.value.unarmedStrikes.map(strike => strike.id)).toEqual([
      'unarmed_default',
      'tagged-result',
    ]);
  });

  it('restores the default unarmed strike when the last one is deleted', () => {
    const character = ref(createDefaultCharacter('combat-unarmed-delete'));
    const save = vi.fn();
    const logic = useCombatLogic(character, save, ref(2));

    expect(logic.deleteUnarmedStrike('unarmed_default')).toBe(true);

    expect(character.value.unarmedStrikes).toHaveLength(1);
    expect(character.value.unarmedStrikes[0]?.id).toBe('unarmed_default');
  });

  it('keeps an edited selected unarmed strike visible after its catalog key changes', () => {
    const character = ref(createDefaultCharacter('combat-unarmed-selected-edit'));
    const save = vi.fn();
    const logic = useCombatLogic(character, save, ref(2));
    const originalKey = logic.attackCatalog.value.find(entry => entry.sourceType === 'unarmed')!.catalogKey;

    logic.selectAttack(originalKey);
    expect(logic.selectedAttacks.value).toHaveLength(1);

    expect(logic.updateUnarmedStrike('unarmed_default', { damageDice: '1d4' })).toBe(true);

    expect(logic.selectedAttacks.value).toHaveLength(1);
    expect(logic.selectedAttacks.value[0]?.damage).toBe('1d4 钝击');
  });
});
