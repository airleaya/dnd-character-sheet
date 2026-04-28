import type { Character, CharacterClassRecord } from '../types/Character';

export const BARD_CLASS_ID = 'b';

export const getEffectiveClassLevel = (
  classRecord: CharacterClassRecord,
  characterLevel: number,
  classCount: number
): number => {
  if (typeof classRecord.level === 'number') {
    return classRecord.level;
  }

  return classCount === 1 ? characterLevel : 1;
};

export const characterHasJackOfAllTrades = (character: Character): boolean =>
  character.profile.classes.some((classRecord) =>
    classRecord.classId === BARD_CLASS_ID &&
    getEffectiveClassLevel(
      classRecord,
      character.profile.level,
      character.profile.classes.length
    ) >= 2
  );

export const getJackOfAllTradesBonus = (character: Character, proficiencyBonus: number): number =>
  characterHasJackOfAllTrades(character) ? Math.floor(proficiencyBonus / 2) : 0;
