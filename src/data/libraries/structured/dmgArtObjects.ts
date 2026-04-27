import { DMG_ART_OBJECT_INTAKE } from '../intake/dmgArtObjects';
import type { ItemIntakeEntry } from '../itemIntake';
import type { StructuredAuditField, StructuredTreasureItem } from './types';

const SOURCE = 'DMG';
const SOURCE_FILE = 'src/data/libraries/intake/dmgArtObjects.ts';
const CHECKED_AT = '2026-04-27';

type ParsedArtObject = NonNullable<ItemIntakeEntry['parsed']> & {
  id: string;
  name: string;
  roll: number;
  die: string;
  valueCategory: string;
};

const isParsedArtObject = (entry: ItemIntakeEntry): entry is ItemIntakeEntry & { parsed: ParsedArtObject } =>
  Boolean(entry.parsed?.id && entry.parsed?.name && entry.parsed?.roll && entry.parsed?.die);

const splitDisplayName = (displayName: string) => {
  const match = /^(.+?) \((.*)\)$/.exec(displayName);

  return {
    name: match?.[1] ?? displayName,
    englishName: match?.[2]
  };
};

const field = (fieldName: string, structuredValue: unknown, sourceValue: unknown): StructuredAuditField => ({
  field: fieldName,
  structuredValue,
  sourceValue,
  matched: JSON.stringify(structuredValue) === JSON.stringify(sourceValue)
});

const audit = (sourceIntakeId: string, comparedFields: StructuredAuditField[], issues: string[] = []) => {
  const driftIssues = comparedFields
    .filter((entry) => !entry.matched)
    .map((entry) => `${entry.field} differs from intake value.`);

  return {
    sourceIntakeId,
    sourceFile: SOURCE_FILE,
    checkedAt: CHECKED_AT,
    sourceMatched: comparedFields.every((entry) => entry.matched),
    comparedFields,
    issues: [...issues, ...driftIssues]
  };
};

const artObject = (entry: ItemIntakeEntry & { parsed: ParsedArtObject }): StructuredTreasureItem => {
  const names = splitDisplayName(entry.parsed.name);
  const comparedFields = [
    field('id', entry.parsed.id, entry.parsed.id),
    field('name', names.name, splitDisplayName(entry.parsed.name).name),
    field('englishName', names.englishName, splitDisplayName(entry.parsed.name).englishName),
    field('source', SOURCE, SOURCE),
    field('category', 'treasure', 'treasure'),
    field('subcategory', 'art_object', 'art_object'),
    field('cost', entry.parsed.cost, entry.parsed.cost),
    field('description', entry.parsed.description, entry.parsed.description),
    field('roll', entry.parsed.roll, entry.parsed.roll),
    field('die', entry.parsed.die, entry.parsed.die),
    field('valueCategory', entry.parsed.valueCategory, entry.parsed.valueCategory),
    field('tags', entry.parsed.tags, entry.parsed.tags)
  ];

  return {
    id: entry.parsed.id,
    name: names.name,
    englishName: names.englishName,
    source: SOURCE,
    category: 'treasure',
    subcategory: 'art_object',
    cost: entry.parsed.cost,
    weight: entry.parsed.weight,
    description: entry.parsed.description,
    tags: entry.parsed.tags,
    valueCategory: entry.parsed.valueCategory,
    roll: entry.parsed.roll,
    die: entry.parsed.die,
    audit: audit(entry.id, comparedFields, entry.audit?.issues)
  };
};

export const STRUCTURED_DMG_ART_OBJECTS: StructuredTreasureItem[] = DMG_ART_OBJECT_INTAKE
  .filter(isParsedArtObject)
  .map((entry) => artObject(entry));

export const STRUCTURED_DMG_ART_OBJECTS_AUDIT_SUMMARY = {
  total: STRUCTURED_DMG_ART_OBJECTS.length,
  sourceMatched: STRUCTURED_DMG_ART_OBJECTS.filter((item) => item.audit.sourceMatched).length,
  sourceMismatched: STRUCTURED_DMG_ART_OBJECTS.filter((item) => !item.audit.sourceMatched).length,
  intakeTotal: DMG_ART_OBJECT_INTAKE.length,
  documentedIssues: STRUCTURED_DMG_ART_OBJECTS.filter((item) => item.audit.issues.length).length
};
