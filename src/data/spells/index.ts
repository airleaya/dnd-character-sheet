// src/data/spells/index.ts

import { CANTRIPS } from './cantrips';
import type { SpellDefinition } from '../../types/Spell';
import { LEVEL_1_SPELLS } from './level1';
import { LEVEL_2_SPELLS } from './level2';
import { LEVEL_3_SPELLS } from './level3';
import { LEVEL_4_SPELLS } from './level4';
import { LEVEL_5_SPELLS } from './level5';
import { LEVEL_6_SPELLS } from './level6';
import { LEVEL_7_SPELLS } from './level7';
import { LEVEL_8_SPELLS } from './level8';
import { LEVEL_9_SPELLS } from './level9';

// 1. 合并所有法术
export const SPELL_LIBRARY: SpellDefinition[] = [
  ...CANTRIPS,
  ...LEVEL_1_SPELLS,
  ...LEVEL_2_SPELLS, // 添加二环
  ...LEVEL_3_SPELLS, // 添加三环
  ...LEVEL_4_SPELLS, // 4
  ...LEVEL_5_SPELLS, // 5 环
  ...LEVEL_6_SPELLS, // 6
  ...LEVEL_7_SPELLS, // 7
  ...LEVEL_8_SPELLS, // 8
  ...LEVEL_9_SPELLS, // 9
  // 未来有了 level2, level3 直接在这里 ...LEVEL_2_SPELLS 即可
];

// 2. 辅助函数：通过 ID 查找法术
export const getSpellById = (id: string): SpellDefinition | undefined => {
  return SPELL_LIBRARY.find(s => s.id === id);
};

// 3. 辅助函数：获取特定环阶的法术
export const getSpellsByLevel = (level: number): SpellDefinition[] => {
  return SPELL_LIBRARY.filter(s => s.level === level);
};