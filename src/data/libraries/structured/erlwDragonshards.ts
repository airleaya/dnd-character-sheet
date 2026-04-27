import { ERLW_TREASURE_MAGIC_ITEM_INTAKE } from '../intake/erlwTreasureMagicItems';
import type { ItemIntakeEntry } from '../itemIntake';
import type { StructuredAuditField, StructuredSpecialMaterialItem } from './types';

const SOURCE = 'ERLW';
const SOURCE_FILE = 'src/data/libraries/intake/erlwTreasureMagicItems.ts';
const CHECKED_AT = '2026-04-27';

type DragonshardParsed = NonNullable<ItemIntakeEntry['parsed']> & {
  id: 'dragonshards';
  name: string;
  tables: {
    types: Array<[string, string, string, string]>;
  };
};

const DRAGONSHARD_IDS: Record<string, string> = {
  '艾伯伦龙晶': 'eberron_dragonshard',
  '开伯尔龙晶': 'khyber_dragonshard',
  '西伯瑞斯龙晶': 'siberys_dragonshard'
};

const hasDragonshardTable = (entry: ItemIntakeEntry): entry is ItemIntakeEntry & { parsed: DragonshardParsed } => {
  const tables = entry.parsed?.tables as { types?: unknown } | undefined;

  return entry.parsed?.id === 'dragonshards' && Array.isArray(tables?.types);
};

const dragonshardSource = ERLW_TREASURE_MAGIC_ITEM_INTAKE.find(hasDragonshardTable);

const splitBilingualName = (value: string) => {
  const match = /^(.+?)\s+([A-Za-z].*)$/.exec(value);

  return {
    name: match?.[1] ?? value,
    englishName: match?.[2]
  };
};

const field = (fieldName: string, structuredValue: unknown, sourceValue: unknown): StructuredAuditField => ({
  field: fieldName,
  structuredValue,
  sourceValue,
  matched: JSON.stringify(structuredValue) === JSON.stringify(sourceValue)
});

const audit = (comparedFields: StructuredAuditField[], issues: string[] = []) => {
  const driftIssues = comparedFields
    .filter((entry) => !entry.matched)
    .map((entry) => `${entry.field} differs from intake value.`);

  return {
    sourceIntakeId: dragonshardSource?.id ?? 'erlw_dragonshard_dragonshards',
    sourceFile: SOURCE_FILE,
    checkedAt: CHECKED_AT,
    sourceMatched: comparedFields.every((entry) => entry.matched),
    comparedFields,
    issues: [...issues, ...driftIssues]
  };
};

const dragonshard = (row: [string, string, string, string]): StructuredSpecialMaterialItem => {
  const [rawName, sourceEnvironment, appearance, uses] = row;
  const names = splitBilingualName(rawName);
  const id = DRAGONSHARD_IDS[names.name] ?? names.englishName?.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') ?? names.name;
  const comparedFields = [
    field('name', names.name, splitBilingualName(rawName).name),
    field('englishName', names.englishName, splitBilingualName(rawName).englishName),
    field('source', SOURCE, SOURCE),
    field('category', 'special_material', 'special_material'),
    field('subcategory', 'dragonshard', 'dragonshard'),
    field('sourceEnvironment', sourceEnvironment, row[1]),
    field('appearance', appearance, row[2]),
    field('uses', uses, row[3])
  ];

  return {
    id,
    name: names.name,
    englishName: names.englishName,
    source: SOURCE,
    category: 'special_material',
    subcategory: 'dragonshard',
    description: uses,
    tags: ['erlw', 'dragonshard', 'non_magic_material'],
    sourceEnvironment,
    appearance,
    uses,
    audit: audit(comparedFields)
  };
};

export const STRUCTURED_ERLW_DRAGONSHARDS: StructuredSpecialMaterialItem[] =
  dragonshardSource?.parsed.tables.types.map((row) => dragonshard(row)) ?? [];

export const STRUCTURED_ERLW_DRAGONSHARDS_AUDIT_SUMMARY = {
  total: STRUCTURED_ERLW_DRAGONSHARDS.length,
  sourceMatched: STRUCTURED_ERLW_DRAGONSHARDS.filter((item) => item.audit.sourceMatched).length,
  sourceMismatched: STRUCTURED_ERLW_DRAGONSHARDS.filter((item) => !item.audit.sourceMatched).length,
  sourceDragonshardEntries: dragonshardSource ? 1 : 0,
  skippedMagicAndRuleEntries: ERLW_TREASURE_MAGIC_ITEM_INTAKE.length - (dragonshardSource ? 1 : 0)
};
