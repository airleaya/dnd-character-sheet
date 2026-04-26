import { PHB_ADVENTURING_GEAR_INTAKE } from '../intake/phbAdventuringGear';
import type { ItemIntakeEntry } from '../itemIntake';
import type {
  StructuredAuditField,
  StructuredContainerItem,
  StructuredConsumableItem,
  StructuredGearItem,
  StructuredPackContent,
  StructuredPackItem
} from './types';

const SOURCE = 'PHB';
const SOURCE_FILE = 'src/data/libraries/intake/phbAdventuringGear.ts';
const CHECKED_AT = '2026-04-27';

type AdventuringGearItem =
  | StructuredGearItem
  | StructuredContainerItem
  | StructuredConsumableItem
  | StructuredPackItem;

type ParsedGear = NonNullable<ItemIntakeEntry['parsed']> & {
  id: string;
  name: string;
  type: string;
  activation?: string;
  effectDescription?: string;
  capacityWeight?: number;
  capacityVolume?: string;
  maxItems?: number;
  isAmmunition?: boolean;
  ammoType?: 'arrow' | 'bolt' | 'bullet' | 'needle';
  contents?: Array<{ id: string; quantity: number; note?: string }>;
};

const SUPPLEMENTAL_PACK_CONTENT_NAMES: Record<string, string> = {
  alms_box: '募捐盒',
  censer: '香炉',
  disguise_kit: '易容工具',
  incense: '熏香',
  sand_bag: '小袋沙',
  small_knife: '小刀',
  string_10ft: '弦线',
  vestments: '祭袍'
};

const isParsedGear = (entry: ItemIntakeEntry): entry is ItemIntakeEntry & { parsed: ParsedGear } =>
  Boolean(entry.parsed?.id && entry.parsed?.name && entry.parsed?.type);

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

const buildAudit = (
  sourceIntakeId: string,
  comparedFields: StructuredAuditField[],
  issues: string[] = []
) => {
  const driftIssues = comparedFields
    .filter((entry) => !entry.matched)
    .map((entry) => `${entry.field} differs from intake value.`);

  return {
    sourceIntakeId,
    sourceFile: SOURCE_FILE,
    checkedAt: CHECKED_AT,
    sourceMatched: comparedFields.every((entry) => entry.matched) && driftIssues.length === 0,
    comparedFields,
    issues: [...issues, ...driftIssues]
  };
};

const packContentNameLookup = () => {
  const names: Record<string, string> = { ...SUPPLEMENTAL_PACK_CONTENT_NAMES };

  for (const entry of PHB_ADVENTURING_GEAR_INTAKE) {
    if (!isParsedGear(entry)) {
      continue;
    }

    names[entry.parsed.id] = splitDisplayName(entry.parsed.name).name;
  }

  return names;
};

const makeBaseFields = (entry: ItemIntakeEntry & { parsed: ParsedGear }) => {
  const names = splitDisplayName(entry.parsed.name);

  return {
    id: entry.parsed.id,
    name: names.name,
    englishName: names.englishName,
    source: SOURCE,
    cost: entry.parsed.cost,
    weight: entry.parsed.weight,
    description: entry.parsed.description,
    tags: entry.parsed.tags
  };
};

const makeBaseAuditFields = (
  entry: ItemIntakeEntry & { parsed: ParsedGear },
  base: ReturnType<typeof makeBaseFields>
) => [
  field('id', base.id, entry.parsed.id),
  field('name', base.name, splitDisplayName(entry.parsed.name).name),
  field('englishName', base.englishName, splitDisplayName(entry.parsed.name).englishName),
  field('source', base.source, SOURCE),
  field('cost', base.cost, entry.parsed.cost),
  field('weight', base.weight, entry.parsed.weight),
  field('description', base.description, entry.parsed.description),
  field('tags', base.tags, entry.parsed.tags)
];

const asContainer = (entry: ItemIntakeEntry & { parsed: ParsedGear }): StructuredContainerItem => {
  const base = makeBaseFields(entry);
  const capacity = {
    weight: entry.parsed.capacityWeight,
    volume: entry.parsed.capacityVolume,
    items: entry.parsed.maxItems === undefined ? undefined : String(entry.parsed.maxItems)
  };
  const hasCapacity = capacity.weight !== undefined || capacity.volume !== undefined || capacity.items !== undefined;
  const comparedFields = [
    ...makeBaseAuditFields(entry, base),
    field('subcategory', 'container', 'container'),
    field('capacity.weight', capacity.weight, entry.parsed.capacityWeight),
    field('capacity.volume', capacity.volume, entry.parsed.capacityVolume),
    field('capacity.items', capacity.items, entry.parsed.maxItems === undefined ? undefined : String(entry.parsed.maxItems)),
    field('rules', entry.parsed.effectDescription, entry.parsed.effectDescription)
  ];

  return {
    ...base,
    category: 'equipment',
    subcategory: 'container',
    capacity: hasCapacity ? capacity : undefined,
    rules: entry.parsed.effectDescription,
    audit: buildAudit(entry.id, comparedFields)
  };
};

const asConsumable = (entry: ItemIntakeEntry & { parsed: ParsedGear }): StructuredConsumableItem => {
  const base = makeBaseFields(entry);
  const effect = entry.parsed.effectDescription ?? entry.parsed.description ?? entry.rawText;
  const comparedFields = [
    ...makeBaseAuditFields(entry, base),
    field('subcategory', 'consumable', 'consumable'),
    field('activation', entry.parsed.activation, entry.parsed.activation),
    field('effect', effect, entry.parsed.effectDescription ?? entry.parsed.description ?? entry.rawText),
    field('isAmmunition', entry.parsed.isAmmunition, entry.parsed.isAmmunition),
    field('ammoType', entry.parsed.ammoType, entry.parsed.ammoType)
  ];

  return {
    ...base,
    category: 'equipment',
    subcategory: 'consumable',
    activation: entry.parsed.activation,
    effect,
    isAmmunition: entry.parsed.isAmmunition,
    ammoType: entry.parsed.ammoType,
    audit: buildAudit(entry.id, comparedFields)
  };
};

const asPack = (
  entry: ItemIntakeEntry & { parsed: ParsedGear },
  contentNames: Record<string, string>
): StructuredPackItem => {
  const base = makeBaseFields(entry);
  const contents: StructuredPackContent[] = (entry.parsed.contents ?? []).map((content) => ({
    itemId: content.id,
    name: contentNames[content.id] ?? content.id,
    quantity: content.quantity
  }));
  const comparedFields = [
    ...makeBaseAuditFields(entry, base),
    field('subcategory', 'pack', 'pack'),
    field(
      'contents',
      contents.map((content) => ({ id: content.itemId, quantity: content.quantity })),
      (entry.parsed.contents ?? []).map((content) => ({ id: content.id, quantity: content.quantity }))
    ),
    field(
      'contentNotes',
      (entry.parsed.contents ?? []).filter((content) => content.note).map((content) => ({ id: content.id, note: content.note })),
      (entry.parsed.contents ?? []).filter((content) => content.note).map((content) => ({ id: content.id, note: content.note }))
    )
  ];

  return {
    ...base,
    category: 'equipment',
    subcategory: 'pack',
    contents,
    audit: buildAudit(entry.id, comparedFields)
  };
};

const asGear = (entry: ItemIntakeEntry & { parsed: ParsedGear }): StructuredGearItem => {
  const base = makeBaseFields(entry);
  const issues = entry.parsed.type === 'tool'
    ? ['Intake type is tool, but this PHB adventuring gear batch keeps it under adventuring_gear to avoid duplicating the PHB tools batch.']
    : [];
  const comparedFields = [
    ...makeBaseAuditFields(entry, base),
    field('intakeType', entry.parsed.type, entry.parsed.type),
    field('subcategory', 'adventuring_gear', 'adventuring_gear'),
    field('activation', entry.parsed.activation, entry.parsed.activation),
    field('rules', entry.parsed.effectDescription, entry.parsed.effectDescription)
  ];

  return {
    ...base,
    category: 'equipment',
    subcategory: 'adventuring_gear',
    activation: entry.parsed.activation,
    rules: entry.parsed.effectDescription,
    audit: buildAudit(entry.id, comparedFields, issues)
  };
};

const contentNames = packContentNameLookup();

export const STRUCTURED_PHB_ADVENTURING_GEAR: AdventuringGearItem[] = PHB_ADVENTURING_GEAR_INTAKE
  .filter(isParsedGear)
  .map((entry) => {
    if (entry.parsed.type === 'container') {
      return asContainer(entry);
    }

    if (entry.parsed.type === 'consumable') {
      return asConsumable(entry);
    }

    if (entry.parsed.type === 'pack') {
      return asPack(entry, contentNames);
    }

    return asGear(entry);
  });

export const STRUCTURED_PHB_ADVENTURING_GEAR_AUDIT_SUMMARY = {
  total: STRUCTURED_PHB_ADVENTURING_GEAR.length,
  sourceMatched: STRUCTURED_PHB_ADVENTURING_GEAR.filter((item) => item.audit.sourceMatched).length,
  sourceMismatched: STRUCTURED_PHB_ADVENTURING_GEAR.filter((item) => !item.audit.sourceMatched).length,
  intakeTotal: PHB_ADVENTURING_GEAR_INTAKE.length
};
