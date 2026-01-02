// src/data/dndRules.ts

// 1. 技能与其依赖属性的映射表
export const SKILL_DEFINITIONS: Record<string, { label: string; attr: string }> = {
  acrobatics: { label: '杂技', attr: 'dex' },
  animal_handling: { label: '驯兽', attr: 'wis' },
  arcana: { label: '奥秘', attr: 'int' },
  athletics: { label: '运动', attr: 'str' },
  deception: { label: '欺瞒', attr: 'cha' },
  history: { label: '历史', attr: 'int' },
  insight: { label: '洞悉', attr: 'wis' },
  intimidation: { label: '威吓', attr: 'cha' },
  investigation: { label: '调查', attr: 'int' },
  medicine: { label: '医药', attr: 'wis' },
  nature: { label: '自然', attr: 'int' },
  perception: { label: '觉察', attr: 'wis' },
  performance: { label: '表演', attr: 'cha' },
  persuasion: { label: '游说', attr: 'cha' },
  religion: { label: '宗教', attr: 'int' },
  sleight_of_hand: { label: '巧手', attr: 'dex' },
  stealth: { label: '隐匿', attr: 'dex' },
  survival: { label: '求生', attr: 'wis' },
};

// // 2. 熟练等级枚举
// export const PROFICIENCY_LEVEL = {
//   NONE: 0,   // 不熟练
//   PROF: 2,   // 熟练 (Proficient)
// };

// 定义 XP 等级表 (保持不变)
const XP_TABLE = [
  { level: 1, xp: 0 },
  { level: 2, xp: 300 },
  { level: 3, xp: 900 },
  { level: 4, xp: 2700 },
  { level: 5, xp: 6500 },
  { level: 6, xp: 14000 },
  { level: 7, xp: 23000 },
  { level: 8, xp: 34000 },
  { level: 9, xp: 48000 },
  { level: 10, xp: 64000 },
  { level: 11, xp: 85000 },
  { level: 12, xp: 100000 },
  { level: 13, xp: 120000 },
  { level: 14, xp: 140000 },
  { level: 15, xp: 165000 },
  { level: 16, xp: 195000 },
  { level: 17, xp: 225000 },
  { level: 18, xp: 265000 },
  { level: 19, xp: 305000 },
  { level: 20, xp: 355000 }
];

export { XP_TABLE };

const SCHOOL_MAP: Record<string, string> = {
  abjuration: '防护',
  conjuration: '咒法',
  divination: '预言',
  enchantment: '惑控',
  evocation: '塑能',
  illusion: '幻术',
  necromancy: '死灵',
  transmutation: '变化',
};

// 辅助函数：获取学派中文名
const getSchoolLabel = (schoolId: string) => {
  return SCHOOL_MAP[schoolId] || schoolId;
};

export { SCHOOL_MAP, getSchoolLabel };