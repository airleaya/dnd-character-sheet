import { computed } from 'vue';
import type { Ref } from 'vue';
import type { Character } from '../../types/Character';
import { SPELL_LIBRARY } from '../../data/spells/index';
import type { SpellDefinition } from '../../types/Spell';

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

// 纯函数：分组逻辑
function groupSpellsByLevel(spells: SpellDefinition[], slots: any): SpellGroup[] {
  const groups: SpellGroup[] = [];
  // 0环
  const cantrips = spells.filter(s => s.level === 0);
  if (cantrips.length > 0) {
    groups.push({ level: 0, label: '🔮 戏法', spells: cantrips, slots: null });
  }
  // 1-9环
  for (let i = 1; i <= 9; i++) {
    const levelSpells = spells.filter(s => s.level === i);
    const maxSlots = slots.max[i] || 0;
    if (levelSpells.length > 0 || maxSlots > 0) {
      groups.push({
        level: i,
        label: `${i} 环法术`,
        spells: levelSpells,
        slots: { current: slots.current[i] || 0, max: maxSlots }
      });
    }
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
    return character.value.spells.known
      .map(id => SPELL_LIBRARY.find(s => s.id === id))
      .filter(s => !!s) as SpellDefinition[];
  });

  const spellbookGroups = computed<SpellGroup[]>(() => {
    if (!character.value) return [];
    return groupSpellsByLevel(allKnownSpells.value, character.value.spells.slots);
  });

  // 获取战斗视图法术 (仅已准备 + 戏法)
  const battleSpells = computed<SpellDefinition[]>(() => {
    if (!character.value) return [];
    const { known, prepared } = character.value.spells;
    const knownObjs = known
      .map(id => SPELL_LIBRARY.find(s => s.id === id))
      .filter(s => !!s) as SpellDefinition[];

    return knownObjs.filter(s => {
      if (s.level === 0) return true; // 戏法总是可见
      return prepared.includes(s.id); // 其他必须已准备
    });
  });

  const battleGroups = computed<SpellGroup[]>(() => {
    if (!character.value) return [];
    return groupSpellsByLevel(battleSpells.value, character.value.spells.slots);
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
    return allIds
      .map(id => SPELL_LIBRARY.find(s => s.id === id))
      .filter(s => !!s) as SpellDefinition[];
  });

  // 分组显示的法术书 (核心 Getter)
  const groupedSpells = computed<SpellGroup[]>(() => {
    if (!character.value) return [];
    return groupSpellsByLevel(mySpells.value, character.value.spells.slots);
  });

  // ==========================================
  // 🛠️ Actions (操作方法)
  // ==========================================

  const learnSpell = (spellId: string, source: 'primary' | 'secondary' = 'primary'): boolean => {
    if (!character.value) return false;
    if (!character.value.spells.known.includes(spellId)) {
      character.value.spells.known.push(spellId);
      if (!character.value.spells.spellSources) {
        character.value.spells.spellSources = {};
      }
      character.value.spells.spellSources[spellId] = source;
      save();
      return true;
    }
    return false;
  };

  const togglePreparedSpell = (spellId: string) => {
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

  const forgetSpell = (spellId: string) => {
    if (!character.value) return;
    character.value.spells.known = character.value.spells.known.filter(id => id !== spellId);
    character.value.spells.prepared = character.value.spells.prepared.filter(id => id !== spellId);
    save();
  };

  const unprepareSpell = (spellId: string) => {
    if (!character.value) return;
    character.value.spells.prepared = character.value.spells.prepared.filter(id => id !== spellId);
    save();
  };

  const updateSpellSlot = (level: number, newVal: number) => {
    if (!character.value) return;
    if (newVal < 0) newVal = 0;
    if (newVal > character.value.spells.slots.max[level]) {
      newVal = character.value.spells.slots.max[level];
    }
    character.value.spells.slots.current[level] = newVal;
    save();
  };

  const updateSpellSlotMax = (level: number, newMax: number) => {
    if (!character.value) return;
    if (newMax < 0) newMax = 0;
    if (newMax > 99) newMax = 99;
    character.value.spells.slots.max[level] = newMax;
    if (character.value.spells.slots.current[level] > newMax) {
      character.value.spells.slots.current[level] = newMax;
    }
    save();
  };

  const updatePactSlot = (newVal: number) => {
    if (!character.value || !character.value.spells.pactSlots) return;
    const pact = character.value.spells.pactSlots;
    if (newVal < 0) newVal = 0;
    if (newVal > pact.max) newVal = pact.max;
    pact.current = newVal;
    save();
  };

  const updatePactSlotMax = (newMax: number, newLevel?: number) => {
    if (!character.value) return;
    if (!character.value.spells.pactSlots) {
      character.value.spells.pactSlots = { level: 1, current: 0, max: 0 };
    }
    const pact = character.value.spells.pactSlots;
    if (newMax < 0) newMax = 0;
    pact.max = newMax;
    if (newLevel !== undefined) {
      pact.level = newLevel;
    }
    if (pact.current > pact.max) {
      pact.current = pact.max;
    }
    save();
  };

  const recoverAllSlots = () => {
    if (!character.value) return;
    const slots = character.value.spells.slots;
    for (let i = 1; i < slots.max.length; i++) {
      slots.current[i] = slots.max[i];
    }
    save();
  };

  const updateSpellConfig = (path: string, value: any) => {
    if (!character.value) return;
    if (path === 'ability') character.value.spells.spellcastingAbility = value;
    save();
  };

  return {
    allKnownSpells,
    spellbookGroups,
    battleSpells,
    battleGroups,
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
    updatePactSlot,
    updatePactSlotMax,
    recoverAllSlots,
    updateSpellConfig
  };
}