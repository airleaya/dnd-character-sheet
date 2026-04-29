import { describe, expect, it } from 'vitest';
import { DEFAULT_DND5E_DATA_PACK } from '../src/data/dataPacks/defaultDnd5ePack';
import {
  buildSpellClassGroups,
  getEnabledDataPacks,
  getItemLibraryDataPackGroups,
  getSpellLibraryDataPackGroups,
} from '../src/data/dataPacks/runtimeDataPacks';

describe('runtime data packs', () => {
  it('registers the default DND 5E data pack for items and spells', () => {
    expect(DEFAULT_DND5E_DATA_PACK).toMatchObject({
      id: 'dnd5e-default',
      builtin: true,
      enabled: true,
      itemMenuName: 'DND-5E物品仓库',
      spellMenuName: 'DND 5E法术全书',
    });
    expect(DEFAULT_DND5E_DATA_PACK.items.length).toBeGreaterThan(0);
    expect(DEFAULT_DND5E_DATA_PACK.spells.length).toBeGreaterThan(0);
    expect(getEnabledDataPacks().map(pack => pack.id)).toContain('dnd5e-default');
  });

  it('builds the item library as data pack / category / subcategory groups', () => {
    const groups = getItemLibraryDataPackGroups();
    const defaultPack = groups.find(group => group.packId === 'dnd5e-default');

    expect(defaultPack?.label).toBe('DND-5E物品仓库');
    expect(defaultPack?.categoryGroups.some(group => group.label === '装备')).toBe(true);
    expect(
      defaultPack?.categoryGroups
        .find(group => group.label === '空白模板')
        ?.subGroups.map(group => group.title)
    ).toContain('武器');
  });

  it('builds spell library branches for level, school, and class in parallel', () => {
    const groups = getSpellLibraryDataPackGroups();
    const defaultPack = groups.find(group => group.packId === 'dnd5e-default');

    expect(defaultPack?.label).toBe('DND 5E法术全书');
    expect(defaultPack?.branches.map(branch => branch.label)).toEqual(['按环级', '按学派', '按职业']);
    expect(defaultPack?.branches.find(branch => branch.mode === 'level')?.groups.map(group => group.title)).toContain('戏法');
    expect(defaultPack?.branches.find(branch => branch.mode === 'school')?.groups.map(group => group.title)).toContain('塑能');
    expect(defaultPack?.branches.find(branch => branch.mode === 'class')?.groups.map(group => group.title)).toContain('法师');
  });

  it('puts spells without class data under the no-class bucket', () => {
    const spell = {
      ...DEFAULT_DND5E_DATA_PACK.spells[0]!,
      id: 'no-class-fixture',
      classes: [],
    };

    expect(buildSpellClassGroups([spell])).toEqual([
      {
        title: '无职业数据',
        spells: [spell],
      },
    ]);
  });
});
