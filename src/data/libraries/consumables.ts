// src/data/libraries/consumables.ts
import type { ConsumableDefinition } from '../../types/Library';

export const CONSUMABLE_LIBRARY: ConsumableDefinition[] = [
  // ===================================
  // 🧪 药水 (Potions)
  // ===================================
  {
    id: 'potion_healing',
    name: '治疗药水 (Potion of Healing)',
    type: 'consumable',
    cost: { value: 50, unit: 'gp' },
    weight: 0.5,
    activation: '1 Action',
    effectDescription: '回复 2d4 + 2 HP',
    // ✅ 补充：喂食规则
    description: '红色的液体。你也可以消耗一个动作将其喂给昏迷的角色，使其回复 2d4 + 2 点生命值。',
    rarity: 'Common'
  },
  {
    id: 'potion_healing_greater',
    name: '强效治疗药水 (Potion of Healing, Greater)',
    type: 'consumable',
    cost: { value: 150, unit: 'gp' }, // 根据 XGE 常见售价表调整
    weight: 0.5,
    activation: '1 Action',
    effectDescription: '回复 4d4 + 4 HP',
    description: '回复 4d4 + 4 点生命值。喂给他人也需要一个动作。',
    rarity: 'Uncommon'
  },
  {
    id: 'potion_invisibility',
    name: '隐形药水 (Potion of Invisibility)',
    type: 'consumable',
    // ✅ 修正：大幅上调价格，符合 Very Rare 稀有度 (DMG p.135)
    cost: { value: 5000, unit: 'gp' }, 
    weight: 0.5,
    activation: '1 Action',
    effectDescription: '获得隐形状态，持续1小时',
    description: '喝下后你变得隐形。攻击或施法会结束该效果。',
    rarity: 'Very Rare'
  },
  {
    id: 'vial_acid',
    name: '强酸 (Acid, Vial)',
    type: 'consumable',
    cost: { value: 25, unit: 'gp' },
    weight: 1,
    activation: '1 Action',
    effectDescription: '远程攻击 (20尺)，造成 2d6 酸性伤害',
    // ✅ 补充：明确是临时武器攻击
    description: '作为一个动作，你可以像泼洒水一样泼洒这些强酸，或者将其连同瓶子一起投掷至至多 20 尺远。此时需进行一次远程攻击（视为一把临时武器）。',
    rarity: 'Common'
  },
  {
    id: 'vial_holy_water',
    name: '圣水 (Holy Water, Flask)',
    type: 'consumable',
    cost: { value: 25, unit: 'gp' },
    weight: 1,
    activation: '1 Action',
    effectDescription: '对邪魔/亡灵造成 2d6 光耀伤害',
    description: '作为一个动作，你可以像泼洒水一样泼洒这些圣水，或者将其连同瓶子一起投掷至至多 20 尺远。此时需进行一次远程攻击（视为一把临时武器）。',
    rarity: 'Common'
  },

  // ===================================
  // 🍖 生存物资 (Survival)
  // ===================================
  {
    id: 'rations',
    name: '口粮 (Rations, 1 day)',
    type: 'consumable',
    cost: { value: 5, unit: 'sp' },
    weight: 2,
    activation: 'Special', 
    effectDescription: '恢复体力，避免力竭',
    description: '包含干肉、干果、饼干等，足够一个人一天的伙食。',
    rarity: 'Common'
  },
  {
    id: 'torch',
    name: '火把 (Torch)',
    type: 'consumable',
    cost: { value: 1, unit: 'cp' },
    weight: 1,
    activation: '1 Action',
    effectDescription: '提供 1小时 20/40尺 光照',
    description: '燃烧1小时，提供20尺明亮光照和20尺微光光照。如果作为简易近战武器攻击，造成1点火焰伤害。',
    rarity: 'Common'
  },
  {
    id: 'oil',
    name: '灯油 (Oil, flask)',
    type: 'consumable',
    cost: { value: 1, unit: 'sp' },
    weight: 1,
    activation: '1 Action',
    effectDescription: '投掷覆盖(+5易伤) / 铺地燃烧',
    // ✅ 修正：准确描述“覆盖 -> 点燃”机制
    description: '作为简易远程武器攻击(20尺)。命中后目标被油覆盖(不造成即时伤害)，若该目标在油干涸(1分钟)前受到火焰伤害，则额外受到5点火焰伤害。也可以倒在地上(5尺方格)点燃，持续2轮，进入或在该区域结束回合造成5点火焰伤害。',
    rarity: 'Common'
  },

  // ===================================
  // 🏹 弹药 (Ammunition)
  // ===================================
  {
    id: 'arrows',
    name: '箭矢 (Arrows)',
    type: 'consumable',
    cost: { value: 1, unit: 'gp' },
    weight: 0.05,
    activation: 'None',
    isAmmunition: true,
    effectDescription: '短弓/长弓弹药',
    description: '20支装在箭袋里的箭。击中后你可以花费1分钟搜索战场以回收一半的弹药。',
    rarity: 'Common'
  },
  {
    id: 'bolts',
    name: '弩矢 (Crossbow Bolts)',
    type: 'consumable',
    cost: { value: 1, unit: 'gp' },
    weight: 0.075,
    activation: 'None',
    isAmmunition: true,
    effectDescription: '弩类武器弹药',
    description: '20支弩矢。',
    rarity: 'Common'
  },
  {
    id: 'bullets',
    name: '弹丸 (Sling Bullets)',
    type: 'consumable',
    cost: { value: 4, unit: 'cp' },
    weight: 1.5,
    activation: 'None',
    isAmmunition: true,
    effectDescription: '投石索弹药',
    description: '20颗铅制小球。',
    rarity: 'Common'
  },
  {
    id: 'healer_kit',
    name: '医疗包 (Healer\'s Kit)',
    type: 'consumable',
    cost: { value: 5, unit: 'gp' },
    weight: 3,
    activation: '1 Action',
    
    // ✅ 10次使用机会
    maxCharges: 10,
    
    effectDescription: '稳定濒死生物',
    description: '这个皮包里装有绷带、药膏和夹板。你可以消耗1次使用次数来稳定一个生命值为0的生物，不再需要进行感知(医药)检定。',
    rarity: 'Common'
  },
  {
    id: 'caltrops',
    name: '铁蒺藜/撒菱 (Caltrops, bag of 20)',
    type: 'consumable',
    cost: { value: 1, unit: 'gp' },
    weight: 2,
    activation: '1 Action',
    effectDescription: '覆盖5尺区域 (DC 15 敏捷豁免)',
    description: '用一个动作撒在5尺见方的区域。进入区域的生物需通过 DC 15 敏捷豁免，否则停止移动并受到 1点穿刺伤害，直到恢复至少1点生命值前移动速度减慢10尺。',
    rarity: 'Common'
  },
  {
    id: 'ball_bearings',
    name: '滚珠 (Ball bearings, bag of 1,000)',
    type: 'consumable',
    cost: { value: 1, unit: 'gp' },
    weight: 2,
    activation: '1 Action',
    // 同样，规则通常指一次性撒完覆盖10尺区域
    effectDescription: '覆盖10尺区域 (DC 15 敏捷检定)',
    description: '用一个动作撒在10尺见方的区域。穿越区域需半速，否则进行 DC 15 敏捷(特技)检定，失败则倒地。',
    rarity: 'Common'
  },
  {
    id: 'basic_poison',
    name: '基础毒药 (Poison, Basic)',
    type: 'consumable',
    cost: { value: 100, unit: 'gp' },
    weight: 0,
    activation: '1 Action',
    effectDescription: '涂抹武器 (DC 10 体质豁免 / 1d4 毒素)',
    description: '你可以用该毒药涂抹一把挥砍或穿刺武器，或三枚弹药。涂抹动作需一个动作。毒素保留1分钟。击中后目标需进行 DC 10 体质豁免，失败受 1d4 毒素伤害。',
    rarity: 'Common'
  },
  // ===================================
  // 其他 (Others)
  // ===================================
  {
    id: 'candle',
    name: '蜡烛 (Candle)',
    type: 'consumable',
    cost: { value: 1, unit: 'cp' },
    weight: 0,
    activation: '1 Action',
    effectDescription: '提供 1小时 5/10尺 光照',
    description: '提供1小时的5尺明亮光照和5尺微光光照。',
    rarity: 'Common'
  },
  {
    id: 'chalk',
    name: '粉笔 (Chalk, 1 piece)',
    type: 'consumable',
    cost: { value: 1, unit: 'cp' },
    weight: 0,
    activation: '1 Action',
    effectDescription: '用于标记',
    description: '用于在石质表面做标记。',
    rarity: 'Common'
  },
  {
    id: 'parchment',
    name: '羊皮纸 (Parchment, one sheet)',
    type: 'consumable',
    cost: { value: 1, unit: 'sp' },
    weight: 0,
    activation: 'None',
    effectDescription: '书写材料',
    description: '一张坚韧的羊皮纸。',
    rarity: 'Common'
  },
    {
    id: 'paper',
    name: '纸 (Paper, one sheet)',
    type: 'consumable',
    cost: { value: 2, unit: 'sp' },
    weight: 0,
    activation: 'None',
    effectDescription: '书写材料',
    description: '一张纸。',
    rarity: 'Common'
  }
];