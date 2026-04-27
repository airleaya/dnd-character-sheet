import { PHB_COMMERCE_TRINKET_INTAKE } from '../intake/phbCommerceTrinkets';
import type { ItemIntakeEntry } from '../itemIntake';
import type { StructuredAuditField, StructuredCommerceItem } from './types';

const SOURCE = 'PHB';
const SOURCE_FILE = 'src/data/libraries/intake/phbCommerceTrinkets.ts';
const CHECKED_AT = '2026-04-27';

type ParsedCommerce = NonNullable<ItemIntakeEntry['parsed']> & {
  id: string;
  name: string;
  commerceType: string;
  quantity?: string;
};

const CATEGORY_BY_COMMERCE_TYPE: Record<string, StructuredCommerceItem['category']> = {
  food_drink_lodging: 'service',
  lifestyle_expense: 'service',
  service: 'service',
  spellcasting_service: 'service',
  trade_good: 'trade_good',
  trinket: 'treasure'
};

const TRADE_GOOD_WEIGHT_LB = 1;

const isParsedCommerce = (entry: ItemIntakeEntry): entry is ItemIntakeEntry & { parsed: ParsedCommerce } =>
  Boolean(entry.parsed?.id && entry.parsed?.name && entry.parsed?.commerceType);

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

const categoryFor = (commerceType: string): StructuredCommerceItem['category'] =>
  CATEGORY_BY_COMMERCE_TYPE[commerceType] ?? 'treasure';

const weightFor = (entry: ItemIntakeEntry & { parsed: ParsedCommerce }): number =>
  entry.parsed.commerceType === 'trade_good'
    ? TRADE_GOOD_WEIGHT_LB
    : entry.parsed.weight ?? 0;

const commerceItem = (entry: ItemIntakeEntry & { parsed: ParsedCommerce }): StructuredCommerceItem => {
  const names = splitDisplayName(entry.parsed.name);
  const category = categoryFor(entry.parsed.commerceType);
  const weight = weightFor(entry);
  const comparedFields = [
    field('id', entry.parsed.id, entry.parsed.id),
    field('name', names.name, splitDisplayName(entry.parsed.name).name),
    field('englishName', names.englishName, splitDisplayName(entry.parsed.name).englishName),
    field('source', SOURCE, SOURCE),
    field('category', category, categoryFor(entry.parsed.commerceType)),
    field('commerceType', entry.parsed.commerceType, entry.parsed.commerceType),
    field('cost', entry.parsed.cost, entry.parsed.cost),
    field(
      'weight',
      weight,
      entry.parsed.commerceType === 'trade_good'
        ? TRADE_GOOD_WEIGHT_LB
        : entry.parsed.weight ?? 0
    ),
    field('quantity', entry.parsed.quantity, entry.parsed.quantity),
    field('description', entry.parsed.description, entry.parsed.description),
    field('tags', entry.parsed.tags, entry.parsed.tags)
  ];

  return {
    id: entry.parsed.id,
    name: names.name,
    englishName: names.englishName,
    source: SOURCE,
    category,
    subcategory: entry.parsed.commerceType,
    cost: entry.parsed.cost,
    weight,
    description: entry.parsed.description,
    tags: entry.parsed.tags,
    commerceType: entry.parsed.commerceType,
    quantity: entry.parsed.quantity,
    audit: audit(entry.id, comparedFields, entry.audit?.issues)
  };
};

export const STRUCTURED_PHB_COMMERCE_TRINKETS: StructuredCommerceItem[] = PHB_COMMERCE_TRINKET_INTAKE
  .filter(isParsedCommerce)
  .map((entry) => commerceItem(entry));

export const STRUCTURED_PHB_COMMERCE_TRINKETS_AUDIT_SUMMARY = {
  total: STRUCTURED_PHB_COMMERCE_TRINKETS.length,
  sourceMatched: STRUCTURED_PHB_COMMERCE_TRINKETS.filter((item) => item.audit.sourceMatched).length,
  sourceMismatched: STRUCTURED_PHB_COMMERCE_TRINKETS.filter((item) => !item.audit.sourceMatched).length,
  intakeTotal: PHB_COMMERCE_TRINKET_INTAKE.length
};
