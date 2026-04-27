import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const REVIEW_PATH = 'src/data/libraries/structured/pluralItemReview.md';

describe('plural item review file', () => {
  it('records the first-round plural item candidates and review options', () => {
    const content = readFileSync(REVIEW_PATH, 'utf8');

    for (const option of ['复数组合', '数据拆分', '数据拆分但成组生成', '数据拆分且额外生成规则']) {
      expect(content).toContain(option);
    }

    for (const itemId of [
      'arrows',
      'crossbow_bolts',
      'blowgun_needles',
      'sling_bullets',
      'ball_bearings',
      'caltrops',
      'iron_spikes_10',
      'rations'
    ]) {
      expect(content).toContain(itemId);
    }

    expect(content).toContain('状态：用户审定已结束');
    expect(content).toContain('pluralItemMigrationReport.md');
  });
});
