import {
  BLANK_ITEM_TEMPLATE_COUNT,
  ITEM_LIBRARY,
  ITEM_LIBRARY_AUDIT_REPORT,
  ITEM_LIBRARY_BY_ID,
  isBlankItemTemplate,
} from './itemLibrary';
import { STRUCTURED_MUNDANE_ITEM_LIBRARY } from './structured';
import type { StructuredBaseItem } from './structured/types';
import type { LibraryItem, PackDefinition } from '../../types/Library';

export interface PackWeightAuditRecord {
  packId: string;
  packName: string;
  sourceWeight: number;
  computedExpandedWeight: number;
  status: 'expanded_weight_explained' | 'source_weight_matches_expanded_weight';
}

export interface ItemLibraryDeepAuditReport {
  total: number;
  duplicateIds: string[];
  missingRequiredFields: string[];
  sourceMismatched: string[];
  magicItems: string[];
  nonMagicDefaultMissing: string[];
  missingPackReferences: string[];
  packWeightAudit: PackWeightAuditRecord[];
  tableDescriptionItems: string[];
  tableDescriptionMissing: string[];
  descriptionProvenanceMissing: string[];
  tracedDescriptionMissing: string[];
  issues: string[];
}

const REQUIRED_TABLE_ITEM_IDS = new Set([
  'burglars_pack',
  'diplomats_pack',
  'dungeoneers_pack',
  'entertainers_pack',
  'explorers_pack',
  'priests_pack',
  'scholars_pack',
  'alchemists_supplies',
  'brewers_supplies',
  'calligraphers_supplies',
  'carpenters_tools',
  'cartographers_tools',
  'cobblers_tools',
  'cooks_utensils',
  'leatherworkers_tools',
  'masons_tools',
  'painters_supplies',
  'poisoners_kit',
  'potters_tools',
  'smiths_tools',
  'thieves_tools',
  'tinkers_tools',
  'weavers_tools',
  'woodcarvers_tools',
  'eberron_dragonshard',
  'khyber_dragonshard',
  'siberys_dragonshard'
]);

const hasPriceRule = (item: LibraryItem): boolean =>
  Boolean(item.cost) ||
  item.type === 'misc' ||
  item.displayCategory === '服务' ||
  item.displayCategory === '特殊材料' ||
  item.displaySubcategory === '小饰品' ||
  item.tags?.includes('pack_supplement') ||
  item.id === 'barding';

const hasDescription = (item: LibraryItem): boolean =>
  Boolean(item.description?.trim()) || Boolean(item.descriptionBlocks?.length);

const tableItemIds = (items: LibraryItem[]): string[] =>
  items
    .filter((item) => item.descriptionBlocks?.some((block) => block.type === 'table'))
    .map((item) => item.id);

const STRUCTURED_ITEM_BY_ID = new Map(STRUCTURED_MUNDANE_ITEM_LIBRARY.map((item) => [item.id, item]));

const sourceDetail = (item: StructuredBaseItem): string =>
  item.description ||
  ('rules' in item && typeof item.rules === 'string' ? item.rules : undefined) ||
  item.name;

const buildDescriptionTraceAudit = (items: LibraryItem[]) => {
  const descriptionProvenanceMissing: string[] = [];
  const tracedDescriptionMissing: string[] = [];

  for (const item of items) {
    if (isBlankItemTemplate(item)) {
      continue;
    }

    const structuredItem = STRUCTURED_ITEM_BY_ID.get(item.id);

    if (!item.description.startsWith('这是来自')) {
      descriptionProvenanceMissing.push(item.id);
    }

    if (!structuredItem) {
      tracedDescriptionMissing.push(item.id);
      continue;
    }

    const detail = sourceDetail(structuredItem).trim();
    if (detail && !item.description.includes(detail)) {
      tracedDescriptionMissing.push(item.id);
    }
  }

  return { descriptionProvenanceMissing, tracedDescriptionMissing };
};

const buildPackWeightAudit = (packs: PackDefinition[]): PackWeightAuditRecord[] =>
  packs.map((pack) => {
    const computedExpandedWeight = pack.contents.reduce((total, content) => {
      const contentItem = ITEM_LIBRARY_BY_ID.get(content.id);
      const unitWeight =
        contentItem?.multiplicity &&
        ['split', 'split_grouped', 'split_custom_rule'].includes(contentItem.multiplicity.mode) &&
        contentItem.multiplicity.sourceQuantity > 0
          ? contentItem.weight / contentItem.multiplicity.sourceQuantity
          : contentItem?.weight ?? 0;

      return total + unitWeight * content.quantity;
    }, 0);

    return {
      packId: pack.id,
      packName: pack.name,
      sourceWeight: pack.weight,
      computedExpandedWeight,
      status:
        Math.abs(pack.weight - computedExpandedWeight) < 0.001
          ? 'source_weight_matches_expanded_weight'
          : 'expanded_weight_explained'
    };
  });

export const buildItemLibraryDeepAuditReport = (): ItemLibraryDeepAuditReport => {
  const seen = new Set<string>();
  const duplicateIds = new Set<string>();
  const missingRequiredFields: string[] = [];
  const sourceMismatched: string[] = [];
  const magicItems: string[] = [];
  const nonMagicDefaultMissing: string[] = [];
  const missingPackReferences: string[] = [];

  for (const item of ITEM_LIBRARY) {
    if (seen.has(item.id)) {
      duplicateIds.add(item.id);
    }
    seen.add(item.id);

    if (!item.id || !item.name || !item.type || !item.source || !item.displayCategory || !item.displaySubcategory) {
      missingRequiredFields.push(item.id || item.name || 'unknown item');
    }

    if (
      !isBlankItemTemplate(item) &&
      (!hasPriceRule(item) || typeof item.weight !== 'number' || !hasDescription(item))
    ) {
      missingRequiredFields.push(item.id);
    }

    if (item.audit && !item.audit.sourceMatched) {
      sourceMismatched.push(item.id);
    }

    if (item.magic?.isMagic) {
      magicItems.push(item.id);
    }

    if ((item.magic?.isMagic ?? false) !== false) {
      nonMagicDefaultMissing.push(item.id);
    }
  }

  const packs = ITEM_LIBRARY.filter((item): item is PackDefinition => item.type === 'pack');
  for (const pack of packs) {
    for (const content of pack.contents) {
      if (!ITEM_LIBRARY_BY_ID.has(content.id)) {
        missingPackReferences.push(`${pack.id} -> ${content.id}`);
      }
    }
  }

  const tableDescriptionItems = tableItemIds(ITEM_LIBRARY);
  const tableDescriptionMissing = [...REQUIRED_TABLE_ITEM_IDS].filter((id) => !tableDescriptionItems.includes(id));
  const { descriptionProvenanceMissing, tracedDescriptionMissing } = buildDescriptionTraceAudit(ITEM_LIBRARY);

  const issues = [
    ...[...duplicateIds].map((id) => `重复ID：${id}`),
    ...missingRequiredFields.map((id) => `缺失必要字段：${id}`),
    ...sourceMismatched.map((id) => `源文本审计不匹配：${id}`),
    ...magicItems.map((id) => `非魔法库中出现魔法物品：${id}`),
    ...nonMagicDefaultMissing.map((id) => `非魔法默认值缺失：${id}`),
    ...missingPackReferences.map((ref) => `套组引用缺失：${ref}`),
    ...tableDescriptionMissing.map((id) => `结构化表格描述缺失：${id}`),
    ...descriptionProvenanceMissing.map((id) => `描述来源前缀缺失：${id}`),
    ...tracedDescriptionMissing.map((id) => `描述原文细节迁移缺失：${id}`)
  ];

  return {
    total: ITEM_LIBRARY.length,
    duplicateIds: [...duplicateIds],
    missingRequiredFields,
    sourceMismatched,
    magicItems,
    nonMagicDefaultMissing,
    missingPackReferences,
    packWeightAudit: buildPackWeightAudit(packs),
    tableDescriptionItems,
    tableDescriptionMissing,
    descriptionProvenanceMissing,
    tracedDescriptionMissing,
    issues
  };
};

export const ITEM_LIBRARY_DEEP_AUDIT_REPORT = buildItemLibraryDeepAuditReport();

export const assertItemLibraryDeepAudit = (): void => {
  if (ITEM_LIBRARY_AUDIT_REPORT.total !== 489 + BLANK_ITEM_TEMPLATE_COUNT) {
    throw new Error(`物品库总数异常：${ITEM_LIBRARY_AUDIT_REPORT.total}`);
  }

  if (ITEM_LIBRARY_DEEP_AUDIT_REPORT.issues.length > 0) {
    throw new Error(`物品库深度审计失败：\n${ITEM_LIBRARY_DEEP_AUDIT_REPORT.issues.join('\n')}`);
  }
};
