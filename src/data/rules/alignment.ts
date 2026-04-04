// 定义阵营 1-9 的标准映射字典
export const ALIGNMENT_DICT: Record<number, string> = {
  1: '守序善良',
  2: '中立善良',
  3: '混乱善良',
  4: '守序中立',
  5: '绝对中立',
  6: '混乱中立',
  7: '守序邪恶',
  8: '中立邪恶',
  9: '混乱邪恶'
};

// 用于旧存档兼容的数据清洗字典 (全小写匹配)
export const ALIGNMENT_MIGRATION_MAP: Record<string, number> = {
  '守序善良': 1, 'lawful good': 1, 'lg': 1,
  '中立善良': 2, 'neutral good': 2, 'ng': 2,
  '混乱善良': 3, 'chaotic good': 3, 'cg': 3,
  '守序中立': 4, 'lawful neutral': 4, 'ln': 4,
  '绝对中立': 5, '中立': 5, 'true neutral': 5, 'n': 5,
  '混乱中立': 6, 'chaotic neutral': 6, 'cn': 6,
  '守序邪恶': 7, 'lawful evil': 7, 'le': 7,
  '中立邪恶': 8, 'neutral evil': 8, 'ne': 8,
  '混乱邪恶': 9, 'chaotic evil': 9, 'ce': 9
};