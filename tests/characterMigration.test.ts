import { describe, expect, it } from 'vitest';
import {
  createDefaultCharacter,
  normalizeCharacterData,
  type LegacyCharacterData,
} from '../src/utils/characterMigration';

describe('characterMigration', () => {
  it('creates a stable default character shape', () => {
    const character = createDefaultCharacter('hero-1');

    expect(character.id).toBe('hero-1');
    expect(character.profile.level).toBe(1);
    expect(character.profile.classes).toEqual([{ classId: '', subclassId: null, level: 1 }]);
    expect(character.combat.hitDice).toEqual({ d6: { current: 1, max: 1 } });
    expect(character.spells.pactSlots).toEqual({ level: 1, current: 0, max: 0 });
    expect(character.spells.spellSources).toEqual({});
  });

  it('migrates legacy hit dice fields and fills missing defaults', () => {
    const legacyData = {
      id: 'legacy-1',
      profile: {
        name: 'Legacy Hero',
        classes: [],
      },
      combat: {
        hpCurrent: 7,
        hpMax: 12,
        hitDiceType: 'd8',
        hitDiceCurrent: 2,
        hitDiceMax: 4,
      },
      spells: {
        known: ['magic-missile'],
      },
    } as unknown as LegacyCharacterData;
    const migrated = normalizeCharacterData(legacyData);

    expect(migrated.profile.name).toBe('Legacy Hero');
    expect(migrated.profile.classes).toEqual([{ classId: '', subclassId: null, level: 1 }]);
    expect(migrated.combat.hitDice).toEqual({ d8: { current: 2, max: 4 } });
    expect(migrated.spells.known).toEqual(['magic-missile']);
    expect(migrated.spells.pactSlots).toEqual({ level: 1, current: 0, max: 0 });
    expect(migrated.wallet).toEqual({ cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 });
  });
});
