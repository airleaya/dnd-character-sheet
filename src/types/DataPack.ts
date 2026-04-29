import type { LibraryItem } from './Library';
import type { SpellDefinition } from './Spell';

export type DataPackId = string;
export type SpellGroupingMode = 'level' | 'school' | 'class';
export type DataPackSourceKind = 'builtin' | 'imported';
export type DataPackTraitKind =
  | 'enchantment'
  | 'item_trait'
  | 'spell_trait'
  | 'class_feature'
  | 'rule_note'
  | 'custom';

export interface DataPackTraitEffect {
  type: string;
  target?: string;
  value?: unknown;
}

export interface DataPackTraitDefinition {
  id: string;
  name: string;
  kind: DataPackTraitKind;
  description?: string;
  tags?: string[];
  effects?: DataPackTraitEffect[];
  payload?: Record<string, unknown>;
}

export interface DataPackManifest {
  schemaVersion: 1;
  id: DataPackId;
  name: string;
  version: string;
  author?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
}

export interface DataPackFile {
  manifest: DataPackManifest;
  items?: LibraryItem[];
  spells?: SpellDefinition[];
  traits?: DataPackTraitDefinition[];
}

export interface DataPackSettings {
  enabledPackIds: DataPackId[];
  packOrder: DataPackId[];
}

export interface RuntimeDataPack {
  id: DataPackId;
  name: string;
  version: string;
  builtin: boolean;
  enabled: boolean;
  sourceKind: DataPackSourceKind;
  manifest: DataPackManifest;
  itemMenuName: string;
  spellMenuName: string;
  items: LibraryItem[];
  spells: SpellDefinition[];
  traits: DataPackTraitDefinition[];
}

export interface DataPackState {
  packs: RuntimeDataPack[];
  settings: DataPackSettings;
}

export interface DataPackImportResult {
  packId: DataPackId;
  name: string;
  itemCount: number;
  spellCount: number;
  traitCount: number;
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
