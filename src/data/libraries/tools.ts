// src/data/libraries/tools.ts
import type { ToolDefinition } from '../../types/Library';

export const TOOL_LIBRARY: ToolDefinition[] = [
  // ===================================
  // 🎭 乐器 (Musical Instruments) -> 魅力
  // ===================================
  {
    id: 'lute',
    name: '鲁特琴 (Lute)',
    type: 'tool',
    cost: { value: 35, unit: 'gp' },
    weight: 2,
    baseAbility: 'cha', // ✅ 默认关联魅力
    description: '一把漂亮的弦乐器，吟游诗人的最爱。',
    rarity: 'Common'
  },
  {
    id: 'flute',
    name: '长笛 (Flute)',
    type: 'tool',
    cost: { value: 2, unit: 'gp' },
    weight: 1,
    baseAbility: 'cha',
    description: '木制或金属制的管乐器。',
    rarity: 'Common'
  },
  {
    id: 'drum',
    name: '手鼓 (Drum)',
    type: 'tool',
    cost: { value: 6, unit: 'gp' },
    weight: 3,
    baseAbility: 'cha',
    description: '敲击乐器，常用于行军或仪式。',
    rarity: 'Common'
  },

  // ===================================
  // 🛠️ 工匠工具 (Artisan's Tools) -> 敏捷/智力/力量
  // ===================================
  {
    id: 'thieves_tools',
    name: '盗贼工具 (Thieves\' Tools)',
    type: 'tool',
    cost: { value: 25, unit: 'gp' },
    weight: 1,
    baseAbility: 'dex', // ✅ 核心：开锁用敏捷
    description: '包含一把小锉刀、一套撬锁工具、一面柄上安着把手的小镜子、一把剪刀和一把钳子。熟练项允许你在解除陷阱和开锁时加上熟练加值。',
    rarity: 'Common'
  },
  {
    id: 'alchemist_supplies',
    name: '炼金工具 (Alchemist\'s Supplies)',
    type: 'tool',
    cost: { value: 50, unit: 'gp' },
    weight: 8,
    baseAbility: 'int', // ✅ 炼金通常用智力
    description: '包含两个玻璃烧杯、一个金属架、一个玻璃棒、一把研钵和研杵、以及一袋普通的炼金原料（包括盐、铁粉和纯水）。',
    rarity: 'Common'
  },
  {
    id: 'smith_tools',
    name: '铁匠工具 (Smith\'s Tools)',
    type: 'tool',
    cost: { value: 20, unit: 'gp' },
    weight: 8,
    baseAbility: 'str', // ✅ 打铁用力量
    description: '包含锤子、钳子、炭火、类似模具的东西，以及其他用于修理和制作金属物品的工具。',
    rarity: 'Common'
  },
  {
    id: 'tinker_tools',
    name: '修补匠工具 (Tinker\'s Tools)',
    type: 'tool',
    cost: { value: 50, unit: 'gp' },
    weight: 10,
    baseAbility: 'dex', // ✅ 精细操作用敏捷
    description: '设计用来修理各种破损的物品，包含各种极小的工具。',
    rarity: 'Common'
  },
  {
    id: 'woodcarver_tools',
    name: '木雕工具 (Woodcarver\'s Tools)',
    type: 'tool',
    cost: { value: 1, unit: 'gp' },
    weight: 5,
    baseAbility: 'dex',
    description: '包含一把小刀、一把凿子和一把小锯子。',
    rarity: 'Common'
  },

  // ===================================
  // 🌿 其他套件
  // ===================================
  {
    id: 'disguise_kit',
    name: '伪装工具包 (Disguise Kit)',
    type: 'tool',
    cost: { value: 25, unit: 'gp' },
    weight: 3,
    baseAbility: 'cha', // ✅ 伪装通常也是为了骗人
    description: '包含化妆品、染发剂、小道具以及一些衣物。',
    rarity: 'Common'
  },
  {
    id: 'poisoner_kit',
    name: '制毒工具包 (Poisoner\'s Kit)',
    type: 'tool',
    cost: { value: 50, unit: 'gp' },
    weight: 2,
    baseAbility: 'int', // ✅ 制作毒药是智力活
    description: '包含玻璃瓶、化学品和其他制作毒药必要的工具。',
    rarity: 'Common'
  },
  {
    id: 'herbalism_kit',
    name: '草药工具包 (Herbalism Kit)',
    type: 'tool',
    cost: { value: 5, unit: 'gp' },
    weight: 3,
    baseAbility: 'wis', // ✅ 识别草药通常用感知(医药)
    description: '包含各种用于采集草药的仪器（如修枝剪）、研钵和研杵，以及若干袋子和瓶子。制作抗毒剂和治疗药水需要此熟练项。',
    rarity: 'Common'
  },
  {
    id: 'navigator_tools',
    name: '航海工具 (Navigator\'s Tools)',
    type: 'tool',
    cost: { value: 25, unit: 'gp' },
    weight: 2,
    baseAbility: 'wis', // ✅ 生存/导航通常用感知
    description: '包含六分仪、指南针、卡尺、尺子、羊皮纸、墨水和羽毛笔。',
    rarity: 'Common'
  }
];