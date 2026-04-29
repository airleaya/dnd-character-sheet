import { computed } from 'vue';
import type { Ref } from 'vue';
import type { Character } from '../../types/Character';
import { SPELL_LIBRARY } from '../../data/spells/index';
import type { AbilityKey } from '../../types/Library';
import type { SpellDefinition } from '../../types/Spell';
import type { InventoryItem } from '../../types/Item';
import {
  formatMagicItemName,
  getMagicInventoryStyle,
  isAttuned,
  requiresAttunement,
  resolveMagicTraitsForItem,
} from '../../utils/magicItems';

type SpellSlots = Character['spells']['slots'];
type SpellSource = 'primary' | 'secondary';
type SpellConfigPath = 'ability';


// 定义法术分组的接口
export interface SpellGroup {
  level: number;
  label: string;
  spells: SpellDefinition[];
  slots: {
    current: number;
    max: number;
  } | null;
}

export interface EquipmentTraitAction {
  id: string;
  itemId: string;
  itemName: string;
  traitId: string;
  name: string;
  type: 'plain' | 'damage' | 'spell' | 'defense';
  description: string;
  spellName?: string;
  spellExtraDescription?: string;
  charges: {
    current: number;
    max: number;
    resetCondition?: string;
    resetFormula?: string;
  };
  style?: Record<string, string>;
}

const isDefinedSpell = (spell: SpellDefinition | undefined): spell is SpellDefinition => {
  return !!spell;
};

const canUseMagicItemEffects = (item: InventoryItem) => !requiresAttunement(item) || isAttuned(item);

const getSpellsByIds = (spellIds: string[]): SpellDefinition[] => {
  return spellIds
    .map((id) => SPELL_LIBRARY.find((spell) => spell.id === id))
    .filter(isDefinedSpell);
};

// 纯函数：分组逻辑
function groupSpellsByLevel(spells: SpellDefinition[], slots: SpellSlots): SpellGroup[] {
  const groups: SpellGroup[] = [];
  const cantrips = spells.filter((spell) => spell.level === 0);

  if (cantrips.length > 0) {
    groups.push({ level: 0, label: '🔮 戏法', spells: cantrips, slots: null });
  }

  for (let level = 1; level <= 9; level += 1) {
    const levelSpells = spells.filter((spell) => spell.level === level);
    const maxSlots = slots.max[level] ?? 0;
    if (levelSpells.length === 0 && maxSlots === 0) continue;

    groups.push({
      level,
      label: `${level} 环法术`,
      spells: levelSpells,
      slots: {
        current: slots.current[level] ?? 0,
        max: maxSlots,
      },
    });
  }

  return groups;
}


export function useSpellLogic(
  character: Ref<Character | null>,
  save: () => void,
  proficiencyBonus: Ref<number>
) {
  // ==========================================
  // 🧠 Getters (计算属性)
  // ==========================================

  // 获取所有已学会的法术 (映射对象)
    const allKnownSpells = computed<SpellDefinition[]>(() => {
    if (!character.value) return [];
    return getSpellsByIds(character.value.spells.known);
  });


  const spellbookGroups = computed<SpellGroup[]>(() => {
    if (!character.value) return [];
    return groupSpellsByLevel(allKnownSpells.value, character.value.spells.slots);
  });

  // 获取战斗视图法术 (仅已准备 + 戏法)
    const battleSpells = computed<SpellDefinition[]>(() => {
    if (!character.value) return [];

    const { known, prepared } = character.value.spells;
    const knownSpells = getSpellsByIds(known);

    return knownSpells.filter((spell) => {
      if (spell.level === 0) return true;
      return prepared.includes(spell.id);
    });
  });


  const battleGroups = computed<SpellGroup[]>(() => {
    if (!character.value) return [];
    return groupSpellsByLevel(battleSpells.value, character.value.spells.slots);
  });

  const equipmentTraitActions = computed<EquipmentTraitAction[]>(() => {
    if (!character.value) return [];

    return character.value.inventory.flatMap(item => {
      if (!canUseMagicItemEffects(item)) return [];
      const style = getMagicInventoryStyle(item);
      return resolveMagicTraitsForItem(item)
        .filter(trait => trait.charges && trait.charges.max > 0)
        .map(trait => {
          const spell = trait.spellId ? SPELL_LIBRARY.find(entry => entry.id === trait.spellId) : undefined;
          return {
            id: `${item.instanceId}:${trait.id}`,
            itemId: item.instanceId,
            itemName: formatMagicItemName(item),
            traitId: trait.id,
            name: trait.name || spell?.name || '装备附魔',
            type: trait.type,
            description: trait.description,
            spellName: spell?.name,
            spellExtraDescription: trait.spellExtraDescription,
            charges: {
              current: Math.max(0, Math.min(trait.charges!.current, trait.charges!.max)),
              max: trait.charges!.max,
              resetCondition: trait.charges!.resetCondition,
              resetFormula: trait.charges!.resetFormula,
            },
            style,
          };
        });
    });
  });

  // 施法关键属性调整值
  const spellAbilityMod = computed<number>(() => {
    if (!character.value) return 0;
    const key = character.value.spells.spellcastingAbility;
    const val = character.value.stats[key];
    return Math.floor((val - 10) / 2);
  });

  // 法术豁免 DC (8 + PB + Mod)
  const calculatedSpellSaveDC = computed<number>(() => {
    return 8 + proficiencyBonus.value + spellAbilityMod.value;
  });

  // 法术攻击加值 (PB + Mod)
  const calculatedSpellAttackMod = computed<number>(() => {
    return proficiencyBonus.value + spellAbilityMod.value;
  });

  // 副施法属性调整值
  const secondarySpellAbilityMod = computed<number>(() => {
    if (!character.value || !character.value.spells.secondaryCastingAbility) return 0;
    const key = character.value.spells.secondaryCastingAbility;
    const val = character.value.stats[key];
    return Math.floor((val - 10) / 2);
  });

  const secondaryCalculatedSpellSaveDC = computed<number>(() => {
    return 8 + proficiencyBonus.value + secondarySpellAbilityMod.value;
  });

  const secondaryCalculatedSpellAttackMod = computed<number>(() => {
    return proficiencyBonus.value + secondarySpellAbilityMod.value;
  });

  // 获取“已准备/已知”的法术列表合集
    const mySpells = computed<SpellDefinition[]>(() => {
    if (!character.value) return [];

    const { known, prepared } = character.value.spells;
    const allIds = Array.from(new Set([...known, ...prepared]));
    return getSpellsByIds(allIds);
  });


  // 分组显示的法术书 (核心 Getter)
  const groupedSpells = computed<SpellGroup[]>(() => {
    if (!character.value) return [];
    return groupSpellsByLevel(mySpells.value, character.value.spells.slots);
  });

  // ==========================================
  // 🛠️ Actions (操作方法)
  // ==========================================

    const learnSpell = (spellId: string, source: SpellSource = 'primary'): boolean => {
    if (!character.value) return false;
    if (character.value.spells.known.includes(spellId)) return false;

    character.value.spells.known.push(spellId);
    character.value.spells.spellSources[spellId] = source;
    save();
    return true;
  };


    const togglePreparedSpell = (spellId: string): void => {

    if (!character.value) return;
    const list = character.value.spells.prepared;
    const idx = list.indexOf(spellId);
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push(spellId);
    }
    save();
  };

    const forgetSpell = (spellId: string): void => {
    if (!character.value) return;

    character.value.spells.known = character.value.spells.known.filter((id) => id !== spellId);
    character.value.spells.prepared = character.value.spells.prepared.filter((id) => id !== spellId);
    delete character.value.spells.spellSources[spellId];
    save();
  };


    const unprepareSpell = (spellId: string): void => {

    if (!character.value) return;
    character.value.spells.prepared = character.value.spells.prepared.filter(id => id !== spellId);
    save();
  };

    const updateSpellSlot = (level: number, newValue: number): void => {
    if (!character.value) return;

    const maxValue = character.value.spells.slots.max[level] ?? 0;
    const safeValue = Math.max(0, Math.min(newValue, maxValue));
    character.value.spells.slots.current[level] = safeValue;
    save();
  };


    const updateSpellSlotMax = (level: number, newMax: number): void => {
    if (!character.value) return;

    const safeMax = Math.max(0, Math.min(newMax, 99));
    character.value.spells.slots.max[level] = safeMax;
    if (character.value.spells.slots.current[level] > safeMax) {
      character.value.spells.slots.current[level] = safeMax;
    }
    save();
  };

  const updateEquipmentTraitCharge = (itemId: string, traitId: string, newValue: number): void => {
    if (!character.value) return;

    const item = character.value.inventory.find(entry => entry.instanceId === itemId);
    if (!item?.magic?.customTraits) return;

    const trait = item.magic.customTraits.find(entry => entry.id === traitId);
    if (!trait?.charges) return;

    trait.charges.current = Math.max(0, Math.min(newValue, trait.charges.max));
    save();
  };


      const updatePactSlot = (newValue: number): void => {
    if (!character.value) return;

    const pact = character.value.spells.pactSlots;
    pact.current = Math.max(0, Math.min(newValue, pact.max));
    save();
  };


      const updatePactSlotMax = (newMax: number, newLevel?: number): void => {
    if (!character.value) return;

    const pact = character.value.spells.pactSlots;
    pact.max = Math.max(0, newMax);
    if (newLevel !== undefined) {
      pact.level = newLevel;
    }
    if (pact.current > pact.max) {
      pact.current = pact.max;
    }
    save();
  };


    const recoverAllSlots = (): void => {

    if (!character.value) return;
    const slots = character.value.spells.slots;
    for (let i = 1; i < slots.max.length; i++) {
      slots.current[i] = slots.max[i];
    }
    save();
  };

      const updateSpellConfig = (path: SpellConfigPath, value: AbilityKey): void => {
    if (!character.value) return;

    if (path === 'ability') {
      character.value.spells.spellcastingAbility = value;
      save();
    }
  };


  return {
    allKnownSpells,
    spellbookGroups,
    battleSpells,
    battleGroups,
    equipmentTraitActions,
    spellAbilityMod,
    calculatedSpellSaveDC,
    calculatedSpellAttackMod,
    secondarySpellAbilityMod,
    secondaryCalculatedSpellSaveDC,
    secondaryCalculatedSpellAttackMod,
    mySpells,
    groupedSpells,
    learnSpell,
    togglePreparedSpell,
    forgetSpell,
    unprepareSpell,
    updateSpellSlot,
    updateSpellSlotMax,
    updateEquipmentTraitCharge,
    updatePactSlot,
    updatePactSlotMax,
    recoverAllSlots,
        updateSpellConfig,
  };
}
