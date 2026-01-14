// src/data/rules/proficiencies.ts

// ✅ 1. 引入类型定义，确保 Key 值与系统核心定义完全一致
import type { ArmorType, WeaponCategory } from '../../types/Library';

// 定义 UI 选项接口
interface ProficiencyOption<T extends string> {
  key: T;
  label: string;
}

// ✅ 2. 护甲列表 (强类型约束)
export const ARMOR_PROFICIENCIES: ProficiencyOption<ArmorType>[] = [
  { key: 'light', label: '轻甲' },
  { key: 'medium', label: '中甲' },
  { key: 'heavy', label: '重甲' },
  { key: 'shield', label: '盾牌' }
];

// ✅ 3. 武器列表 (这里我们简化为两大类，虽然 WeaponCategory 还有 ranged/melee 之分，但熟练项通常只分简易/军用)
// 我们需要手动映射一下，或者只定义 UI 用的 key
export const WEAPON_PROFICIENCIES: { key: string; label: string }[] = [
  { key: 'simple', label: '简易武器' },
  { key: 'martial', label: '军用武器' }
];

// ✅ 4. 【新增】标准工具列表 (D&D 5E SRD)
export const TOOL_PROFICIENCIES: string[] = [
  '盗贼工具 (Thieves\' Tools)',
  '草药工具 (Herbalism Kit)',
  '炼金工具 (Alchemist\'s Supplies)',
  '酿酒工具 (Brewer\'s Supplies)',
  '书法工具 (Calligrapher\'s Supplies)',
  '木匠工具 (Carpenter\'s Tools)',
  '制图工具 (Cartographer\'s Tools)',
  '皮匠工具 (Cobbler\'s Tools)',
  '厨师工具 (Cook\'s Utensils)',
  '玻璃匠工具 (Glassblower\'s Tools)',
  '珠宝匠工具 (Jeweler\'s Tools)',
  '制革工具 (Leatherworker\'s Tools)',
  '石匠工具 (Mason\'s Tools)',
  '画家工具 (Painter\'s Supplies)',
  '陶匠工具 (Potter\'s Tools)',
  '铁匠工具 (Smith\'s Tools)',
  '修补匠工具 (Tinker\'s Tools)',
  '织布工具 (Weaver\'s Tools)',
  '木雕工具 (Woodcarver\'s Tools)',
  '易容工具 (Disguise Kit)',
  '伪造工具 (Forgery Kit)',
  '赌博套件 (Gaming Set)',
  '乐器 (Musical Instrument)',
  '领航工具 (Navigator\'s Tools)',
  '毒药工具 (Poisoner\'s Kit)'
];

// 5. 常用语言
export const COMMON_LANGUAGES = [
  '通用语 (Common)', '矮人语 (Dwarvish)', '精灵语 (Elvish)', 
  '巨语 (Giant)', '侏儒语 (Gnomish)', '地精语 (Goblin)', 
  '半身人语 (Halfling)', '兽人语 (Orc)', 
  '深渊语 (Abyssal)', '天界语 (Celestial)', '龙语 (Draconic)', 
  '深普语 (Deep Speech)', '炼狱语 (Infernal)', '原初语 (Primordial)', 
  '色林语 (Sylvan)', '地下通用语 (Undercommon)'
];

export const WEAPON_CAT_MAP: Record<string, string> = {
  simple_melee: '简易近战武器',
  simple_ranged: '简易远程武器',
  martial_melee: '军用近战武器',
  martial_ranged: '军用远程武器',
};

export const ARMOR_TYPE_MAP: Record<string, string> = {
  light: '轻甲',
  medium: '中甲',
  heavy: '重甲',
  shield: '盾牌',
};