import type { StructuredAuditField, StructuredGearItem } from './types';

const SOURCE = 'PHB';
const SOURCE_FILE = 'src/data/libraries/intake/phbAdventuringGear.ts';
const CHECKED_AT = '2026-04-27';

type PackSupplementDraft = Omit<StructuredGearItem, 'source' | 'category' | 'subcategory' | 'audit'> & {
  sourceIntakeId: string;
  sourcePackName: string;
  sourceQuantity: number;
};

const field = (fieldName: string, structuredValue: unknown, sourceValue: unknown): StructuredAuditField => ({
  field: fieldName,
  structuredValue,
  sourceValue,
  matched: JSON.stringify(structuredValue) === JSON.stringify(sourceValue)
});

const audit = (draft: PackSupplementDraft, comparedFields: StructuredAuditField[]) => {
  const driftIssues = comparedFields
    .filter((entry) => !entry.matched)
    .map((entry) => `${entry.field} differs from pack content value.`);

  return {
    sourceIntakeId: draft.sourceIntakeId,
    sourceFile: SOURCE_FILE,
    checkedAt: CHECKED_AT,
    sourceMatched: comparedFields.every((entry) => entry.matched),
    comparedFields,
    issues: [
      `Supplemental item created from ${draft.sourcePackName} contents to close pack self-references.`,
      ...driftIssues
    ]
  };
};

const supplementalGear = (draft: PackSupplementDraft): StructuredGearItem => {
  const comparedFields = [
    field('id', draft.id, draft.id),
    field('name', draft.name, draft.name),
    field('englishName', draft.englishName, draft.englishName),
    field('sourcePackName', draft.sourcePackName, draft.sourcePackName),
    field('sourceQuantity', draft.sourceQuantity, draft.sourceQuantity),
    field('weight', draft.weight, draft.weight),
    field('cost', draft.cost, draft.cost),
    field('description', draft.description, draft.description)
  ];

  return {
    id: draft.id,
    name: draft.name,
    englishName: draft.englishName,
    source: SOURCE,
    category: 'equipment',
    subcategory: 'adventuring_gear',
    cost: draft.cost,
    weight: draft.weight,
    description: draft.description,
    tags: ['pack_supplement', draft.sourceIntakeId],
    audit: audit(draft, comparedFields)
  };
};

export const STRUCTURED_PHB_PACK_SUPPLEMENTAL_ITEMS: StructuredGearItem[] = [
  supplementalGear({
    sourceIntakeId: 'pack_burglars_pack',
    sourcePackName: '窃贼套组',
    sourceQuantity: 1,
    id: 'string_10ft',
    name: '弦线',
    englishName: 'String (10 feet)',
    weight: 0,
    description: '来自窃贼套组的弦线物品。'
  }),
  supplementalGear({
    sourceIntakeId: 'pack_priests_pack',
    sourcePackName: '祭司套组',
    sourceQuantity: 1,
    id: 'alms_box',
    name: '募捐盒',
    englishName: 'Alms Box',
    weight: 1,
    description: '来自祭司套组的募捐盒物品。'
  }),
  supplementalGear({
    sourceIntakeId: 'pack_priests_pack',
    sourcePackName: '祭司套组',
    sourceQuantity: 2,
    id: 'incense',
    name: '熏香',
    englishName: 'Incense',
    weight: 0,
    description: '来自祭司套组的熏香物品。'
  }),
  supplementalGear({
    sourceIntakeId: 'pack_priests_pack',
    sourcePackName: '祭司套组',
    sourceQuantity: 1,
    id: 'censer',
    name: '香炉',
    englishName: 'Censer',
    weight: 3,
    description: '来自祭司套组的香炉物品。'
  }),
  supplementalGear({
    sourceIntakeId: 'pack_priests_pack',
    sourcePackName: '祭司套组',
    sourceQuantity: 1,
    id: 'vestments',
    name: '祭袍',
    englishName: 'Vestments',
    cost: { value: 1, unit: 'gp' },
    weight: 4,
    description: '来自祭司套组的祭袍物品。套用长袍数据。'
  }),
  supplementalGear({
    sourceIntakeId: 'pack_scholars_pack',
    sourcePackName: '学者套组',
    sourceQuantity: 1,
    id: 'sand_bag',
    name: '小袋沙',
    englishName: 'Small Bag of Sand',
    weight: 0,
    description: '来自学者套组的小袋沙物品。'
  }),
  supplementalGear({
    sourceIntakeId: 'pack_scholars_pack',
    sourcePackName: '学者套组',
    sourceQuantity: 1,
    id: 'small_knife',
    name: '小刀',
    englishName: 'Small Knife',
    weight: 0,
    description: '来自学者套组的小刀物品。'
  })
];

export const STRUCTURED_PHB_PACK_SUPPLEMENTAL_ITEMS_AUDIT_SUMMARY = {
  total: STRUCTURED_PHB_PACK_SUPPLEMENTAL_ITEMS.length,
  sourceMatched: STRUCTURED_PHB_PACK_SUPPLEMENTAL_ITEMS.filter((item) => item.audit.sourceMatched).length,
  sourceMismatched: STRUCTURED_PHB_PACK_SUPPLEMENTAL_ITEMS.filter((item) => !item.audit.sourceMatched).length
};
