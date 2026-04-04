import { computed } from 'vue';
import type { Ref } from 'vue';
import type { Character } from '../../types/Character';
import { SKILL_DEFINITIONS, XP_TABLE } from '../../data/rules/dndRules';
import { ALIGNMENT_MIGRATION_MAP } from '../../data/rules/alignment';
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

  //职业与兼职管理逻辑
  // 数据清洗与旧存档兼容
  const ensureClassesFormat = () => {
    if (!character.value) return;
    const profile = character.value.profile as any;

    // 阵营历史数据清洗
    // 如果发现阵营是字符串，尝试使用字典将其转换为数字编码
    if (typeof profile.alignment === 'string') {
      const cleanStr = profile.alignment.trim().toLowerCase();
      profile.alignment = ALIGNMENT_MIGRATION_MAP[cleanStr] || undefined;
      save(); // 清洗后保存
    }

    // 如果不存在 classes 数组，说明是旧存档或新创建但未初始化的角色
    if (!profile.classes || !Array.isArray(profile.classes) || profile.classes.length === 0) {
      profile.classes = [];
      // 插入一个空的默认主职记录
      // 初始化时，将未分配的 level 默认等于角色总等级,同时确保空组时也进行初始化。
      profile.classes.push({ classId: '', subclassId: null, level: profile.level || 1 });
      // 抛弃旧的文本字段
      if ('class' in profile) {
        delete profile.class;
      }
      save();
    }
    // 遍历现有记录，兼容没有 level 字段的旧数据
    else {
      let modified = false;
      profile.classes.forEach((c: any, i: number) => {
        if (c.level === undefined) {
          c.level = i === 0 ? profile.level : 1; // 默认主职继承全部等级，兼职默认1级
          modified = true;
        }
      });
      if (modified) save();
    }
  };

  // 新增兼职
  const addClassRecord = () => {
    if (!character.value) return;
    ensureClassesFormat();
    // 新增兼职前的等级容量校验与自动扣减逻辑
    const profile = character.value.profile;
    const totalAllocated = profile.classes.reduce((sum: number, c: any) => sum + (c.level || 1), 0);
    
    if (totalAllocated >= profile.level) {
      // 尝试从主职业扣除 1 级给新兼职
      const mainClass = profile.classes[0];
      const mainClassLevel = mainClass?.level || 1; // 提取当前主职业等级，带有后备默认值

      if (mainClassLevel > 1 && mainClass) {
        mainClass.level = mainClassLevel - 1; // 安全赋值
      } else {
        console.warn('角色总等级不足，无法分配新兼职');
        return; // 阻止添加
      }
    }
    profile.classes.push({ classId: '', subclassId: null, level: 1 });
    save();
  };

  // 移除兼职
  const removeClassRecord = (index: number) => {
    if (!character.value || !character.value.profile.classes) return;
    // 强制保留至少一行作为主职
    if (character.value.profile.classes.length > 1) {
      character.value.profile.classes.splice(index, 1);
      save();
    }
  };

  // 更新具体的职业或子职
  const updateClassRecord = (index: number, field: 'classId' | 'subclassId', value: string | null) => {
    if (!character.value || !character.value.profile.classes) return;
    const record = character.value.profile.classes[index];
    if (!record) return;

    if (field === 'classId') {
      record.classId = value ?? '';
      // 核心逻辑：切换职业时，原有子职必须清空，防止出现“法师拥有狂战道途”的数据错乱
      record.subclassId = null;
    } else if (field === 'subclassId') {
      record.subclassId = value;
    }
    save();
  };

  // 更新职业等级
  const updateClassLevel = (index: number, delta: number) => {
    if (!character.value || !character.value.profile.classes) return;
    const profile = character.value.profile;
    const record = profile.classes[index];
    if (!record) return;

    const totalAllocated = profile.classes.reduce((sum: number, c: any) => sum + (c.level || 1), 0);
    const currentLevel = record.level || 1;

    if (delta === 1) {
      // 向上调节：检查是否有未分配等级 (总和必须小于角色总等级)
      if (totalAllocated < profile.level) {
        record.level = currentLevel + 1;
      }
    } else if (delta === -1) {
      // 向下调节：最低不能低于 1 级
      if (currentLevel > 1) {
        record.level = currentLevel - 1;
      }
    }
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
    ensureClassesFormat,
    addClassRecord,
    removeClassRecord,
    updateClassRecord,
    updateClassLevel,
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