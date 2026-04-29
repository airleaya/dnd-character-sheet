import type { LibraryItem } from './Library';
import type { SpellDefinition } from './Spell';

export type DataPackId = string;
export type SpellGroupingMode = 'level' | 'school' | 'class';

export interface RuntimeDataPack {
  id: DataPackId;
  name: string;
  version: string;
  builtin: boolean;
  enabled: boolean;
  itemMenuName: string;
  spellMenuName: string;
  items: LibraryItem[];
  spells: SpellDefinition[];
}

export interface DataPackItemSubGroup {
  title: string;
  items: LibraryItem[];
}

export interface DataPackItemCategoryGroup {
  id: string;
  label: string;
  subGroups: DataPackItemSubGroup[];
}

export interface DataPackItemGroup {
  packId: DataPackId;
  label: string;
  categoryGroups: DataPackItemCategoryGroup[];
}

export interface DataPackSpellSubGroup {
  title: string;
  spells: SpellDefinition[];
}

export interface DataPackSpellBranch {
  mode: SpellGroupingMode;
  label: string;
  groups: DataPackSpellSubGroup[];
}

export interface DataPackSpellGroup {
  packId: DataPackId;
  label: string;
  branches: DataPackSpellBranch[];
}
