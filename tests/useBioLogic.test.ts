import { ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { useBioLogic } from '../src/stores/sheet/useBioLogic';
import { createDefaultCharacter } from '../src/utils/characterMigration';

describe('useBioLogic expertise', () => {
  it('applies double proficiency bonus to expert skills', () => {
    const character = ref(createDefaultCharacter('expertise-bio-1'));
    character.value.profile.level = 5;
    character.value.stats.wis = 14;
    character.value.skillProficiencies.perception = true;
    character.value.expertise.skills = ['perception'];

    const logic = useBioLogic(character, vi.fn());
    const perception = logic.skills.value.find((skill) => skill.key === 'perception');

    expect(perception?.expertise).toBe(true);
    expect(perception?.mod).toBe('+8');
    expect(logic.passivePerception.value).toBe(18);
  });

  it('only allows expertise for proficient skills and tools', () => {
    const character = ref(createDefaultCharacter('expertise-bio-2'));
    const save = vi.fn();
    const logic = useBioLogic(character, save);

    logic.toggleSkillExpertise('perception');
    logic.toggleToolExpertise('盗贼工具');

    expect(character.value.expertise.skills).toEqual([]);
    expect(character.value.expertise.tools).toEqual([]);
    expect(save).not.toHaveBeenCalled();

    character.value.skillProficiencies.perception = true;
    character.value.proficiencies.tools.push('盗贼工具');

    logic.toggleSkillExpertise('perception');
    logic.toggleToolExpertise('盗贼工具');

    expect(character.value.expertise.skills).toEqual(['perception']);
    expect(character.value.expertise.tools).toEqual(['盗贼工具']);
    expect(save).toHaveBeenCalledTimes(2);
  });

  it('removes linked expertise when a proficiency is removed', () => {
    const character = ref(createDefaultCharacter('expertise-bio-3'));
    character.value.skillProficiencies.perception = true;
    character.value.expertise.skills = ['perception'];
    character.value.proficiencies.tools = ['盗贼工具'];
    character.value.expertise.tools = ['盗贼工具'];

    const logic = useBioLogic(character, vi.fn());

    logic.toggleSkill('perception');
    logic.removeProficiencyList('tools', 0);

    expect(character.value.skillProficiencies.perception).toBe(false);
    expect(character.value.expertise.skills).toEqual([]);
    expect(character.value.proficiencies.tools).toEqual([]);
    expect(character.value.expertise.tools).toEqual([]);
  });
});

describe('useBioLogic jack of all trades', () => {
  it('adds half proficiency bonus to non-proficient skills for level 2 bards', () => {
    const character = ref(createDefaultCharacter('jack-bio-1'));
    character.value.profile.level = 5;
    character.value.profile.classes = [{ classId: 'b', subclassId: null, level: 2 }];
    character.value.stats.dex = 14;
    character.value.skillProficiencies.stealth = false;

    const logic = useBioLogic(character, vi.fn());
    const stealth = logic.skills.value.find((skill) => skill.key === 'stealth');

    expect(logic.hasJackOfAllTrades.value).toBe(true);
    expect(stealth?.jackOfAllTrades).toBe(true);
    expect(stealth?.mod).toBe('+3');
  });

  it('does not apply jack of all trades to proficient or expert skills', () => {
    const character = ref(createDefaultCharacter('jack-bio-2'));
    character.value.profile.level = 5;
    character.value.profile.classes = [{ classId: 'b', subclassId: null, level: 2 }];
    character.value.stats.wis = 14;
    character.value.skillProficiencies.perception = true;
    character.value.expertise.skills = ['perception'];

    const logic = useBioLogic(character, vi.fn());
    const perception = logic.skills.value.find((skill) => skill.key === 'perception');

    expect(perception?.jackOfAllTrades).toBe(false);
    expect(perception?.expertise).toBe(true);
    expect(perception?.mod).toBe('+8');
  });

  it('allows more than two classes but never more class records than character level', () => {
    const character = ref(createDefaultCharacter('jack-bio-3'));
    character.value.profile.level = 3;
    character.value.profile.classes = [{ classId: 'a', subclassId: null, level: 3 }];

    const logic = useBioLogic(character, vi.fn());

    logic.addClassRecord();
    logic.addClassRecord();
    logic.addClassRecord();

    expect(character.value.profile.classes).toHaveLength(3);
    expect(character.value.profile.classes.map((record) => record.level ?? 1)).toEqual([1, 1, 1]);
  });
});
