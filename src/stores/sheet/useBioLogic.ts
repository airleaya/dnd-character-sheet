import { computed } from 'vue';
import type { Ref } from 'vue';
import type { Character } from '../../types/Character';
import { SKILL_DEFINITIONS, XP_TABLE } from '../../data/rules/dndRules';

export function useBioLogic(character: Ref<Character | null>, save: () => void) {
  // ==========================================
  // 🧠 Getters (计算属性)
  // ==========================================

  // --- 熟练加值 (PB) ---
  const proficiencyBonus = computed(() => {
    if (!character.value) return 2;
    // 公式: ceil(level / 4) + 1
    return Math.ceil(character.value.profile.level / 4) + 1;
  });

  // --- 技能列表计算引擎 ---
  const skills = computed(() => {
    if (!character.value) return [];
    const char = character.value;
    const pb = proficiencyBonus.value;

    return Object.entries(SKILL_DEFINITIONS).map(([key, def]) => {
      // 1. 找对应属性的调整值
      const attrVal = char.stats[def.attr as keyof typeof char.stats];
      const attrMod = Math.floor((attrVal - 10) / 2);
      
      // 2. 找熟练等级
      const isProficient = !!char.skillProficiencies[key];
      
      // 3. 计算最终值：熟练则加 PB，否则不加
      const total = attrMod + (isProficient ? pb : 0);
      
      return {
        key: key,
        label: def.label,
        attr: def.attr.toUpperCase(),
        mod: total >= 0 ? `+${total}` : `${total}`,
        rawMod: total,
        profLevel: isProficient
      };
    });
  });

  // --- 被动觉察 (Passive Perception) ---
  const passivePerception = computed(() => {
    const perception = skills.value.find((s: any) => s.key === 'perception');
    return 10 + (perception ? perception.rawMod : 0);
  });

  // --- 升级所需经验值 ---
  const nextLevelXp = computed(() => {
    if (!character.value) return null;
    const currentLevel = character.value.profile.level;
    if (currentLevel >= 20) return null;

    const nextStage = XP_TABLE.find(x => x.level === currentLevel + 1);
    return nextStage ? nextStage.xp : null;
  });

  // ==========================================
  // 🛠️ Actions (操作方法)
  // ==========================================

  // 更新 Bio 数据的通用方法
  const updateBio = (field: keyof import('../../types/Character').CharacterBio, value: string) => {
    if (!character.value) return;
    character.value.bio[field] = value;
    save();
  };

  // 更新角色基础信息 (Profile) 的通用方法
  const updateProfile = (field: string, value: any) => {
    if (!character.value) return;
    (character.value.profile as any)[field] = value;
    save();
  };

  // 更新属性 (例如把 strength 改成 18)
  const updateStat = (statName: keyof Character['stats'], value: number) => {
    if (!character.value) return;
    character.value.stats[statName] = value;
    save();
  };

  // 切换技能熟练度
  const toggleSkill = (skillKey: string) => {
    if (!character.value) return;
    if (!character.value.skillProficiencies) {
      character.value.skillProficiencies = {};
    }
    const current = !!character.value.skillProficiencies[skillKey];
    character.value.skillProficiencies[skillKey] = !current;
    save();
  };

  // 切换豁免熟练度
  const toggleSavingThrow = (attrKey: string) => {
    if (!character.value) return;
    if (!character.value.savingThrows) {
      character.value.savingThrows = {
        str: false, dex: false, con: false, int: false, wis: false, cha: false
      };
    }
    const key = attrKey as keyof typeof character.value.stats;
    const current = !!character.value.savingThrows[key];
    character.value.savingThrows[key] = !current;
    save();
  };

  // 切换固定熟练项 (护甲/武器)
  const toggleProficiency = (category: 'armor' | 'weapons', key: string) => {
    if (!character.value) return;
    const list = character.value.proficiencies[category];
    const idx = list.indexOf(key);
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push(key);
    }
    save();
  };

  // 添加动态熟练项 (工具/语言)
  const addProficiencyList = (category: 'tools' | 'languages', val: string) => {
    if (!character.value || !val.trim()) return;
    if (!character.value.proficiencies) {
      character.value.proficiencies = { armor: [], weapons: [], tools: [], languages: [] };
    }
    if (!character.value.proficiencies[category]) {
      character.value.proficiencies[category] = [];
    }
    const list = character.value.proficiencies[category];
    if (!list.includes(val)) {
      list.push(val);
      save();
    }
  };

  // 移除动态熟练项
  const removeProficiencyList = (category: 'tools' | 'languages', index: number) => {
    if (!character.value) return;
    character.value.proficiencies[category].splice(index, 1);
    save();
  };

  // 增加 XP (包含自动升级逻辑)
  const addExperience = (amount: number) => {
    if (!character.value) return;

    character.value.profile.xp += amount;
    if (character.value.profile.xp < 0) character.value.profile.xp = 0;

    let newLevel = 1;
    for (let i = XP_TABLE.length - 1; i >= 0; i--) {
      if (character.value.profile.xp >= XP_TABLE[i].xp) {
        newLevel = XP_TABLE[i].level;
        break;
      }
    }

    if (character.value.profile.level !== newLevel) {
      character.value.profile.level = newLevel;
    }
    save();
  };

  // 重置 XP
  const resetExperience = () => {
    if (!character.value) return;
    character.value.profile.xp = 0;
    character.value.profile.level = 1;
    save();
  };

  return {
    proficiencyBonus,
    skills,
    passivePerception,
    nextLevelXp,
    updateBio,
    updateProfile,
    updateStat,
    toggleSkill,
    toggleSavingThrow,
    toggleProficiency,
    addProficiencyList,
    removeProficiencyList,
    addExperience,
    resetExperience
  };
}