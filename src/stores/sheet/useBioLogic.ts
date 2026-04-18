import { computed } from 'vue';
import type { Ref } from 'vue';
import type {
  AbilityScores,
  Character,
  CharacterBio,
  CharacterClassRecord,
  CharacterProfile,
} from '../../types/Character';
import { SKILL_DEFINITIONS, XP_TABLE } from '../../data/rules/dndRules';
import { ALIGNMENT_MIGRATION_MAP } from '../../data/rules/alignment';

type SkillDefinitionKey = keyof typeof SKILL_DEFINITIONS;
type SkillSummary = {
  key: SkillDefinitionKey;
  label: string;
  attr: Uppercase<keyof AbilityScores>;
  mod: string;
  rawMod: number;
  profLevel: boolean;
};
type FixedProficiencyCategory = 'armor' | 'weapons';
type DynamicProficiencyCategory = 'tools' | 'languages';

const formatModifier = (value: number): string => {
  return value >= 0 ? `+${value}` : `${value}`;
};

const getAllocatedClassLevels = (classes: CharacterClassRecord[]): number => {
  return classes.reduce((sum, classRecord) => sum + (classRecord.level ?? 1), 0);
};

export function useBioLogic(character: Ref<Character | null>, save: () => void) {
  const proficiencyBonus = computed<number>(() => {
    if (!character.value) return 2;
    return Math.ceil(character.value.profile.level / 4) + 1;
  });

  const skills = computed<SkillSummary[]>(() => {
    if (!character.value) return [];

    const currentCharacter = character.value;
    const pb = proficiencyBonus.value;

    return (Object.entries(SKILL_DEFINITIONS) as [
      SkillDefinitionKey,
      (typeof SKILL_DEFINITIONS)[SkillDefinitionKey],
    ][]).map(([key, definition]) => {
      const attrKey = definition.attr as keyof AbilityScores;
      const attrValue = currentCharacter.stats[attrKey];
      const attrMod = Math.floor((attrValue - 10) / 2);
      const isProficient = Boolean(currentCharacter.skillProficiencies[key]);
      const total = attrMod + (isProficient ? pb : 0);

      return {
        key,
        label: definition.label,
        attr: definition.attr.toUpperCase() as Uppercase<keyof AbilityScores>,
        mod: formatModifier(total),
        rawMod: total,
        profLevel: isProficient,
      };
    });
  });

  const passivePerception = computed<number>(() => {
    const perception = skills.value.find((skill) => skill.key === 'perception');
    return 10 + (perception?.rawMod ?? 0);
  });

  const nextLevelXp = computed<number | null>(() => {
    if (!character.value) return null;

    const currentLevel = character.value.profile.level;
    if (currentLevel >= 20) return null;

    const nextStage = XP_TABLE.find((entry) => entry.level === currentLevel + 1);
    return nextStage?.xp ?? null;
  });

  const currentLevelBaseXp = computed<number>(() => {
    if (!character.value) return 0;

    const currentLevel = character.value.profile.level;
    const currentStage = XP_TABLE.find((entry) => entry.level === currentLevel);
    return currentStage?.xp ?? 0;
  });

  const updateBio = <K extends keyof CharacterBio>(field: K, value: CharacterBio[K]): void => {
    if (!character.value) return;

    character.value.bio[field] = value;
    save();
  };

  const updateProfile = <K extends keyof Character['profile']>(
    field: K,
    value: Character['profile'][K]
  ): void => {
    if (!character.value) return;

    character.value.profile[field] = value;
    save();
  };

  const ensureClassesFormat = (): void => {
    if (!character.value) return;

    const profile: CharacterProfile = character.value.profile;
    if (typeof profile.alignment !== 'string') return;

    const cleanAlignment = profile.alignment.trim().toLowerCase();
    const migratedAlignment = ALIGNMENT_MIGRATION_MAP[cleanAlignment];
    if (migratedAlignment === undefined) return;

    profile.alignment = migratedAlignment;
    save();
  };

  const addClassRecord = (): void => {
    if (!character.value) return;

    ensureClassesFormat();
    const profile = character.value.profile;
    const totalAllocated = getAllocatedClassLevels(profile.classes);

    if (totalAllocated >= profile.level) {
      const mainClass = profile.classes[0];
      const mainClassLevel = mainClass.level ?? 1;

      if (mainClassLevel <= 1) {
        console.warn('角色总等级不足，无法分配新兼职');
        return;
      }

      mainClass.level = mainClassLevel - 1;
    }

    profile.classes.push({ classId: '', subclassId: null, level: 1 });
    save();
  };

  const removeClassRecord = (index: number): void => {
    if (!character.value) return;
    if (character.value.profile.classes.length <= 1) return;

    character.value.profile.classes.splice(index, 1);
    save();
  };

  const updateClassRecord = (
    index: number,
    field: 'classId' | 'subclassId',
    value: string | null
  ): void => {
    if (!character.value) return;

    const record = character.value.profile.classes[index];
    if (!record) return;

    if (field === 'classId') {
      record.classId = value ?? '';
      record.subclassId = null;
    } else {
      record.subclassId = value;
    }

    save();
  };

  const updateClassLevel = (index: number, delta: 1 | -1): void => {
    if (!character.value) return;

    const profile = character.value.profile;
    const record = profile.classes[index];
    if (!record) return;

    const totalAllocated = getAllocatedClassLevels(profile.classes);
    const currentLevel = record.level ?? 1;

    if (delta === 1) {
      if (totalAllocated < profile.level) {
        record.level = currentLevel + 1;
      }
    } else if (currentLevel > 1) {
      record.level = currentLevel - 1;
    }

    save();
  };

  const updateStat = (statName: keyof Character['stats'], value: number): void => {
    if (!character.value) return;

    character.value.stats[statName] = value;
    save();
  };

  const toggleSkill = (skillKey: SkillDefinitionKey): void => {
    if (!character.value) return;

    const current = Boolean(character.value.skillProficiencies[skillKey]);
    character.value.skillProficiencies[skillKey] = !current;
    save();
  };

  const toggleSavingThrow = (attrKey: keyof AbilityScores): void => {
    if (!character.value) return;

    const current = Boolean(character.value.savingThrows[attrKey]);
    character.value.savingThrows[attrKey] = !current;
    save();
  };

  const toggleProficiency = (category: FixedProficiencyCategory, key: string): void => {
    if (!character.value) return;

    const list = character.value.proficiencies[category];
    const index = list.indexOf(key);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(key);
    }

    save();
  };

  const addProficiencyList = (category: DynamicProficiencyCategory, value: string): void => {
    if (!character.value) return;

    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    const list = character.value.proficiencies[category];
    if (!list.includes(trimmedValue)) {
      list.push(trimmedValue);
      save();
    }
  };

  const removeProficiencyList = (category: DynamicProficiencyCategory, index: number): void => {
    if (!character.value) return;

    character.value.proficiencies[category].splice(index, 1);
    save();
  };

  const addExperience = (amount: number): void => {
    if (!character.value) return;

    character.value.profile.xp += amount;
    if (character.value.profile.xp < 0) {
      character.value.profile.xp = 0;
    }

    let newLevel = 1;
    for (let i = XP_TABLE.length - 1; i >= 0; i -= 1) {
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

  const resetExperience = (): void => {
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
    currentLevelBaseXp,
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
    resetExperience,
  };
}