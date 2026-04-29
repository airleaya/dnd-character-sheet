import { describe, expect, it } from 'vitest';
import { getLibraryGroups, ITEM_LIBRARY_AUDIT_REPORT } from '../src/data/libraries/itemLibrary';
import {
  assertItemLibraryDeepAudit,
  ITEM_LIBRARY_DEEP_AUDIT_REPORT
} from '../src/data/libraries/itemLibraryDeepAudit';
import {
  ITEM_MIGRATION_AUDIT_REPORT,
  ITEM_MIGRATION_AUDIT_SUMMARY
} from '../src/data/libraries/itemMigrationAuditReport';

describe('item library deep audit', () => {
  it('keeps the structured runtime library fully auditable', () => {
    expect(() => assertItemLibraryDeepAudit()).not.toThrow();
    expect(ITEM_LIBRARY_AUDIT_REPORT.total).toBe(498);
    expect(ITEM_LIBRARY_DEEP_AUDIT_REPORT.issues).toEqual([]);
  });

  it('records one migration audit row for every runtime item', () => {
    expect(ITEM_MIGRATION_AUDIT_SUMMARY.total).toBe(489);
    expect(ITEM_MIGRATION_AUDIT_SUMMARY.failed).toBe(0);
    expect(ITEM_MIGRATION_AUDIT_SUMMARY.missingRuntimeItems).toBe(0);
    expect(ITEM_MIGRATION_AUDIT_REPORT.every((record) => record.sourceIntakeId && record.structuredId && record.runtimeId)).toBe(true);
  });

  it('uses Chinese labels for the second-level library directory', () => {
    const groups = getLibraryGroups();
    const labels = groups.flatMap((group) => [group.label, ...group.subGroups.map((subGroup) => subGroup.title)]);

    expect(labels).toContain('服务');
    expect(labels).toContain('生活开销');
    expect(labels).toContain('食物、饮料与住宿');
    expect(labels).toContain('雇佣服务');
    expect(labels).toContain('施法服务');
    expect(labels).toContain('贸易品');
    expect(labels).toContain('小饰品');
    expect(labels).not.toContain('lifestyle_expense');
    expect(labels).not.toContain('food_drink_lodging');
    expect(labels).not.toContain('service');
    expect(labels).not.toContain('spellcasting_service');
    expect(labels).not.toContain('trade_good');
    expect(labels).not.toContain('trinket');
  });
});
