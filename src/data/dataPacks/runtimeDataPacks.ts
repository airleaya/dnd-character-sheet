import { getSchoolLabel } from '../rules/dndRules';
import { DEFAULT_DND5E_DATA_PACK } from './defaultDnd5ePack';
import type {
  DataPackItemGroup,
  DataPackSpellBranch,
  DataPackSpellGroup,
  DataPackSpellSubGroup,
  RuntimeDataPack,
} from '../../types/DataPack';
import type { LibraryItem } from '../../types/Library';
import type { SpellClassKey, SpellDefinition } from '../../types/Spell';

export const RUNTIME_DATA_PACKS: RuntimeDataPack[] = [DEFAULT_DND5E_DATA_PACK];

export const getEnabledDataPacks = (): RuntimeDataPack[] =>
  RUNTIME_DATA_PACKS.filter(pack => pack.enabled);

export const SPELL_CLASS_LABELS: Record<SpellClassKey, string> = {
  bard: '吟游诗人',
  cleric: '牧师',
  druid: '德鲁伊',
  paladin: '圣武士',
  ranger: '游侠',
  sorcerer: '术士',
  warlock: '邪术师',
  wizard: '法师',
};

const levelLabel = (level: number): string => {
  if (level === 0) return '戏法';
  if (Number.isInteger(level) && level >= 1 && level <= 9) return `${level}环`;
  return '无环级数据';
};

const sortSpellGroups = (groups: DataPackSpellSubGroup[], order: string[]) => {
  const orderMap = new Map(order.map((label, index) => [label, index]));
  return groups.sort((a, b) => {
    const aOrder = orderMap.get(a.title) ?? Number.MAX_SAFE_INTEGER;
    const bOrder = orderMap.get(b.title) ?? Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.title.localeCompare(b.title, 'zh-CN');
  });
};

const groupSpellsBy = (
  spells: SpellDefinition[],
  resolveLabels: (spell: SpellDefinition) => string[],
  order: string[]
): DataPackSpellSubGroup[] => {
  const groups = new Map<string, SpellDefinition[]>();

  spells.forEach(spell => {
    resolveLabels(spell).forEach(label => {
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label)!.push(spell);
    });
  });

  return sortSpellGroups(
    Array.from(groups.entries()).map(([title, entries]) => ({ title, spells: entries })),
    order
  );
};

export const buildSpellLevelGroups = (spells: SpellDefinition[]): DataPackSpellSubGroup[] =>
  groupSpellsBy(
    spells,
    spell => [levelLabel(typeof spell.level === 'number' ? spell.level : -1)],
    ['戏法', ...Array.from({ length: 9 }, (_, index) => `${index + 1}环`), '无环级数据']
  );

export const buildSpellSchoolGroups = (spells: SpellDefinition[]): DataPackSpellSubGroup[] =>
  groupSpellsBy(
    spells,
    spell => [spell.school ? getSchoolLabel(spell.school) : '无学派数据'],
    ['防护', '咒法', '预言', '惑控', '塑能', '幻术', '死灵', '变化', '无学派数据']
  );

export const buildSpellClassGroups = (spells: SpellDefinition[]): DataPackSpellSubGroup[] =>
  groupSpellsBy(
    spells,
    spell => {
      const classes = Array.isArray(spell.classes) ? spell.classes : [];
      if (classes.length === 0) return ['无职业数据'];
      return classes.map(classKey => SPELL_CLASS_LABELS[classKey] ?? '无职业数据');
    },
    [...Object.values(SPELL_CLASS_LABELS), '无职业数据']
  );

export const getItemLibraryDataPackGroups = (visibleIds?: Set<string>): DataPackItemGroup[] =>
  getEnabledDataPacks()
    .map(pack => {
      const categoryMap = new Map<string, Map<string, LibraryItem[]>>();
      const items = visibleIds ? pack.items.filter(item => visibleIds.has(item.id)) : pack.items;

      items.forEach(item => {
        const category = item.displayCategory ?? item.type;
        const subcategory = item.displaySubcategory ?? item.type;

        if (!categoryMap.has(category)) categoryMap.set(category, new Map());
        const subgroups = categoryMap.get(category)!;
        if (!subgroups.has(subcategory)) subgroups.set(subcategory, []);
        subgroups.get(subcategory)!.push(item);
      });

      return {
        packId: pack.id,
        label: pack.itemMenuName,
        categoryGroups: Array.from(categoryMap.entries()).map(([label, subgroups]) => ({
          id: `${pack.id}:${label}`,
          label,
          subGroups: Array.from(subgroups.entries()).map(([title, entries]) => ({ title, items: entries })),
        })),
      };
    })
    .filter(group => group.categoryGroups.length > 0);

export const getSpellLibraryDataPackGroups = (visibleIds?: Set<string>): DataPackSpellGroup[] =>
  getEnabledDataPacks()
    .map(pack => {
      const spells = visibleIds ? pack.spells.filter(spell => visibleIds.has(spell.id)) : pack.spells;
      const allBranches: DataPackSpellBranch[] = [
        { mode: 'level', label: '按环级', groups: buildSpellLevelGroups(spells) },
        { mode: 'school', label: '按学派', groups: buildSpellSchoolGroups(spells) },
        { mode: 'class', label: '按职业', groups: buildSpellClassGroups(spells) },
      ];

      return {
        packId: pack.id,
        label: pack.spellMenuName,
        branches: allBranches.filter(branch => branch.groups.length > 0),
      };
    })
    .filter(group => group.branches.length > 0);
