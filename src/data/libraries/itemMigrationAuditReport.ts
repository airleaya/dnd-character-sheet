import { STRUCTURED_MUNDANE_ITEM_LIBRARY } from './structured';
import { BLANK_ITEM_TEMPLATE_COUNT, ITEM_LIBRARY, ITEM_LIBRARY_BY_ID } from './itemLibrary';

export type ItemMigrationAuditStatus = 'passed' | 'failed';

export interface ItemMigrationAuditRecord {
  sourceIntakeId: string;
  sourceFile: string;
  structuredId: string;
  runtimeId: string;
  name: string;
  source: string;
  category: string;
  subcategory?: string;
  runtimeType: string;
  auditStatus: ItemMigrationAuditStatus;
  mappedFields: string[];
  notes: string[];
}

const runtimeById = ITEM_LIBRARY_BY_ID;

export const ITEM_MIGRATION_AUDIT_REPORT: ItemMigrationAuditRecord[] =
  STRUCTURED_MUNDANE_ITEM_LIBRARY.map((structuredItem) => {
    const runtimeItem = runtimeById.get(structuredItem.id);
    const comparedFields = structuredItem.audit.comparedFields.map((field) => field.field);
    const notes = [
      ...structuredItem.audit.issues,
      ...(runtimeItem ? [] : ['未找到对应的运行时物品。'])
    ];

    return {
      sourceIntakeId: structuredItem.audit.sourceIntakeId,
      sourceFile: structuredItem.audit.sourceFile,
      structuredId: structuredItem.id,
      runtimeId: runtimeItem?.id ?? '',
      name: structuredItem.name,
      source: structuredItem.source,
      category: structuredItem.category,
      subcategory: structuredItem.subcategory,
      runtimeType: runtimeItem?.type ?? 'missing',
      auditStatus: structuredItem.audit.sourceMatched && Boolean(runtimeItem) ? 'passed' : 'failed',
      mappedFields: comparedFields,
      notes
    };
  });

export const ITEM_MIGRATION_AUDIT_SUMMARY = {
  total: ITEM_MIGRATION_AUDIT_REPORT.length,
  passed: ITEM_MIGRATION_AUDIT_REPORT.filter((record) => record.auditStatus === 'passed').length,
  failed: ITEM_MIGRATION_AUDIT_REPORT.filter((record) => record.auditStatus === 'failed').length,
  missingRuntimeItems: ITEM_MIGRATION_AUDIT_REPORT.filter((record) => !record.runtimeId).length,
  uniqueSourceFiles: new Set(ITEM_MIGRATION_AUDIT_REPORT.map((record) => record.sourceFile)).size
};

export const ITEM_MIGRATION_AUDIT_MARKDOWN = [
  '# 物品库迁移审计报告',
  '',
  `- 总条目数：${ITEM_MIGRATION_AUDIT_SUMMARY.total}`,
  `- 审计通过：${ITEM_MIGRATION_AUDIT_SUMMARY.passed}`,
  `- 审计失败：${ITEM_MIGRATION_AUDIT_SUMMARY.failed}`,
  `- 缺失运行时条目：${ITEM_MIGRATION_AUDIT_SUMMARY.missingRuntimeItems}`,
  '',
  '| 源文本ID | 结构化ID | 运行时ID | 名称 | 来源 | 分类 | 运行时类型 | 审计 | 备注 |',
  '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ...ITEM_MIGRATION_AUDIT_REPORT.map((record) =>
    [
      record.sourceIntakeId,
      record.structuredId,
      record.runtimeId,
      record.name,
      record.source,
      [record.category, record.subcategory].filter(Boolean).join('/'),
      record.runtimeType,
      record.auditStatus,
      record.notes.join('；')
    ].map((cell) => String(cell).replace(/\|/g, '\\|')).join(' | ')
  ).map((row) => `| ${row} |`)
].join('\n');

if (ITEM_LIBRARY.length !== STRUCTURED_MUNDANE_ITEM_LIBRARY.length + BLANK_ITEM_TEMPLATE_COUNT) {
  throw new Error('Item migration audit report count does not match runtime library count.');
}
