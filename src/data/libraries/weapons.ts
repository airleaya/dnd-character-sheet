import type { WeaponDefinition } from '../../types/Library';

export const WEAPON_LIBRARY: WeaponDefinition[] = [
  // ============================================
  // 🟢 简易近战武器 (Simple Melee Weapons)
  // ============================================
  {
    id: 'club',
    name: '短棒 (Club)',
    type: 'weapon',
    category: 'simple_melee',
    cost: { value: 1, unit: 'sp' }, // ✅ 1 sp
    damage: '1d4',
    damageType: 'bludgeoning',
    weight: 2,
    properties: ['light'],
    description: '一根削磨过的坚硬木棒，简单而有效。'
  },
  {
    id: 'dagger',
    name: '匕首 (Dagger)',
    type: 'weapon',
    category: 'simple_melee',
    cost: { value: 2, unit: 'gp' }, // ✅ 2 gp
    damage: '1d4',
    damageType: 'piercing',
    weight: 1,
    properties: ['finesse', 'light', 'thrown'],
    range: '20/60',
    description: '便于隐藏的短刀，盗贼的最爱。'
  },
  {
    id: 'greatclub',
    name: '大棒 (Greatclub)',
    type: 'weapon',
    category: 'simple_melee',
    cost: { value: 2, unit: 'sp' }, // ✅ 2 sp
    damage: '1d8',
    damageType: 'bludgeoning',
    weight: 10,
    properties: ['two_handed'],
    description: '体型巨大的木棒，通常由食人魔使用。'
  },
  {
    id: 'handaxe',
    name: '手斧 (Handaxe)',
    type: 'weapon',
    category: 'simple_melee',
    cost: { value: 5, unit: 'gp' }, // ✅ 5 gp
    damage: '1d6',
    damageType: 'slashing',
    weight: 2,
    properties: ['light', 'thrown'],
    range: '20/60',
    description: '既可用于砍伐，也可用于投掷。'
  },
  {
    id: 'javelin',
    name: '标枪 (Javelin)',
    type: 'weapon',
    category: 'simple_melee',
    cost: { value: 5, unit: 'sp' }, // ✅ 5 sp
    damage: '1d6',
    damageType: 'piercing',
    weight: 2,
    properties: ['thrown'],
    range: '30/120',
    description: '设计用于投掷的轻型长矛。'
  },
  {
    id: 'light_hammer',
    name: '轻锤 (Light Hammer)',
    type: 'weapon',
    category: 'simple_melee',
    cost: { value: 2, unit: 'gp' }, // ✅ 2 gp
    damage: '1d4',
    damageType: 'bludgeoning',
    weight: 2,
    properties: ['light', 'thrown'],
    range: '20/60',
    description: '工匠的工具，也是不错的副手武器。'
  },
  {
    id: 'mace',
    name: '硬头锤 (Mace)',
    type: 'weapon',
    category: 'simple_melee',
    cost: { value: 5, unit: 'gp' }, // ✅ 5 gp
    damage: '1d6',
    damageType: 'bludgeoning',
    weight: 4,
    properties: [],
    description: '顶端带有金属法兰的钝击武器，牧师的经典选择。'
  },
  {
    id: 'quarterstaff',
    name: '长棍 (Quarterstaff)',
    type: 'weapon',
    category: 'simple_melee',
    cost: { value: 2, unit: 'sp' }, // ✅ 2 sp
    damage: '1d6',
    damageType: 'bludgeoning',
    weight: 4,
    properties: ['versatile'],
    versatileDamage: '1d8',
    description: '一根平衡良好的硬木棍。'
  },
  {
    id: 'sickle',
    name: '镰刀 (Sickle)',
    type: 'weapon',
    category: 'simple_melee',
    cost: { value: 1, unit: 'gp' }, // ✅ 1 gp
    damage: '1d4',
    damageType: 'slashing',
    weight: 2,
    properties: ['light'],
    description: '原本是农具，德鲁伊常用于收割草药或敌人。'
  },
  {
    id: 'spear',
    name: '矛 (Spear)',
    type: 'weapon',
    category: 'simple_melee',
    cost: { value: 1, unit: 'gp' }, // ✅ 1 gp
    damage: '1d6',
    damageType: 'piercing',
    weight: 3,
    properties: ['thrown', 'versatile'],
    range: '20/60',
    versatileDamage: '1d8',
    description: '最常见的士兵武器，简单实用。'
  },

  // ============================================
  // 🟢 简易远程武器 (Simple Ranged Weapons)
  // ============================================
  {
    id: 'light_crossbow',
    name: '轻弩 (Light Crossbow)',
    type: 'weapon',
    category: 'simple_ranged',
    cost: { value: 25, unit: 'gp' }, // ✅ 25 gp
    damage: '1d8',
    damageType: 'piercing',
    weight: 5,
    properties: ['ammunition', 'two_handed', 'loading'],
    requiredAmmoType: 'bolt',
    range: '80/320',
    description: '拉力适中，配有曲柄装置。'
  },
  {
    id: 'dart',
    name: '飞镖 (Dart)',
    type: 'weapon',
    category: 'simple_ranged',
    cost: { value: 5, unit: 'cp' }, // ✅ 5 cp
    damage: '1d4',
    damageType: 'piercing',
    weight: 0.25,
    properties: ['finesse', 'thrown'],
    range: '20/60',
    description: '带有配重的投掷尖刺。'
  },
  {
    id: 'shortbow',
    name: '短弓 (Shortbow)',
    type: 'weapon',
    category: 'simple_ranged',
    cost: { value: 25, unit: 'gp' }, // ✅ 25 gp
    damage: '1d6',
    damageType: 'piercing',
    weight: 2,
    properties: ['ammunition', 'two_handed'],
    requiredAmmoType: 'arrow',
    range: '80/320',
    description: '常见于骑兵和猎人的轻型弓。'
  },
  {
    id: 'sling',
    name: '投石索 (Sling)',
    type: 'weapon',
    category: 'simple_ranged',
    cost: { value: 1, unit: 'sp' }, // ✅ 1 sp
    damage: '1d4',
    damageType: 'bludgeoning',
    weight: 0,
    properties: ['ammunition'],
    range: '30/120',
    description: '一条简单的皮带，能投射石块或金属弹丸。'
  },

  // ============================================
  // 🔴 军用近战武器 (Martial Melee Weapons)
  // ============================================
  {
    id: 'battleaxe',
    name: '战斧 (Battleaxe)',
    type: 'weapon',
    category: 'martial_melee',
    cost: { value: 10, unit: 'gp' }, // ✅ 10 gp
    damage: '1d8',
    damageType: 'slashing',
    weight: 4,
    properties: ['versatile'],
    versatileDamage: '1d10',
    description: '专为战斗设计的斧头，可单手或双手使用。'
  },
  {
    id: 'flail',
    name: '链枷 (Flail)',
    type: 'weapon',
    category: 'martial_melee',
    cost: { value: 10, unit: 'gp' }, // ✅ 10 gp
    damage: '1d8',
    damageType: 'bludgeoning',
    weight: 2,
    properties: [],
    description: '带刺的金属球通过链条连接在手柄上，能绕过盾牌。'
  },
  {
    id: 'glaive',
    name: '长刀 (Glaive)',
    type: 'weapon',
    category: 'martial_melee',
    cost: { value: 20, unit: 'gp' }, // ✅ 20 gp
    damage: '1d10',
    damageType: 'slashing',
    weight: 6,
    properties: ['heavy', 'reach', 'two_handed'],
    description: '柄端装有巨大刀刃的长柄武器。'
  },
  {
    id: 'greataxe',
    name: '巨斧 (Greataxe)',
    type: 'weapon',
    category: 'martial_melee',
    cost: { value: 30, unit: 'gp' }, // ✅ 30 gp
    damage: '1d12',
    damageType: 'slashing',
    weight: 7,
    properties: ['heavy', 'two_handed'],
    description: '野蛮人钟爱的重型武器，威力巨大。'
  },
  {
    id: 'greatsword',
    name: '巨剑 (Greatsword)',
    type: 'weapon',
    category: 'martial_melee',
    cost: { value: 50, unit: 'gp' }, // ✅ 50 gp
    damage: '2d6',
    damageType: 'slashing',
    weight: 6,
    properties: ['heavy', 'two_handed'],
    description: '巨大的双手剑，提供最稳定的高伤害。'
  },
  {
    id: 'halberd',
    name: '戟 (Halberd)',
    type: 'weapon',
    category: 'martial_melee',
    cost: { value: 20, unit: 'gp' }, // ✅ 20 gp
    damage: '1d10',
    damageType: 'slashing',
    weight: 6,
    properties: ['heavy', 'reach', 'two_handed'],
    description: '结合了斧头、矛尖和钩子的长柄武器。'
  },
  {
    id: 'lance',
    name: '骑枪 (Lance)',
    type: 'weapon',
    category: 'martial_melee',
    cost: { value: 10, unit: 'gp' }, // ✅ 10 gp
    damage: '1d12',
    damageType: 'piercing',
    weight: 6,
    properties: ['reach', 'special'],
    description: '马上作战的利器。非骑乘时必须双手使用。'
  },
  {
    id: 'longsword',
    name: '长剑 (Longsword)',
    type: 'weapon',
    category: 'martial_melee',
    cost: { value: 15, unit: 'gp' }, // ✅ 15 gp
    damage: '1d8',
    damageType: 'slashing',
    weight: 3,
    properties: ['versatile'],
    versatileDamage: '1d10',
    description: '经典的骑士武器。'
  },
  {
    id: 'maul',
    name: '巨锤 (Maul)',
    type: 'weapon',
    category: 'martial_melee',
    cost: { value: 10, unit: 'gp' }, // ✅ 10 gp
    damage: '2d6',
    damageType: 'bludgeoning',
    weight: 10,
    properties: ['heavy', 'two_handed'],
    description: '像大锤一样的重型钝器，能轻易粉碎骨头。'
  },
  {
    id: 'morningstar',
    name: '钉头锤 (Morningstar)',
    type: 'weapon',
    category: 'martial_melee',
    cost: { value: 15, unit: 'gp' }, // ✅ 15 gp
    damage: '1d8',
    damageType: 'piercing',
    weight: 4,
    properties: [],
    description: '带有尖刺金属头的重型短棒。'
  },
  {
    id: 'pike',
    name: '长矛 (Pike)',
    type: 'weapon',
    category: 'martial_melee',
    cost: { value: 5, unit: 'gp' }, // ✅ 5 gp
    damage: '1d10',
    damageType: 'piercing',
    weight: 18,
    properties: ['heavy', 'reach', 'two_handed'],
    description: '极长的长矛，通常用于方阵作战。'
  },
  {
    id: 'rapier',
    name: '刺剑 (Rapier)',
    type: 'weapon',
    category: 'martial_melee',
    cost: { value: 25, unit: 'gp' }, // ✅ 25 gp
    damage: '1d8',
    damageType: 'piercing',
    weight: 2,
    properties: ['finesse'],
    description: '细长而锋利的剑，依靠敏捷而非蛮力。'
  },
  {
    id: 'scimitar',
    name: '弯刀 (Scimitar)',
    type: 'weapon',
    category: 'martial_melee',
    cost: { value: 25, unit: 'gp' }, // ✅ 25 gp
    damage: '1d6',
    damageType: 'slashing',
    weight: 3,
    properties: ['finesse', 'light'],
    description: '弧形刀刃，适合双持和快速挥砍。'
  },
  {
    id: 'shortsword',
    name: '短剑 (Shortsword)',
    type: 'weapon',
    category: 'martial_melee',
    cost: { value: 10, unit: 'gp' }, // ✅ 10 gp
    damage: '1d6',
    damageType: 'piercing',
    weight: 2,
    properties: ['finesse', 'light'],
    description: '标准的副手武器。'
  },
  {
    id: 'trident',
    name: '三叉戟 (Trident)',
    type: 'weapon',
    category: 'martial_melee',
    cost: { value: 5, unit: 'gp' }, // ✅ 5 gp
    damage: '1d6',
    damageType: 'piercing',
    weight: 4,
    properties: ['thrown', 'versatile'],
    versatileDamage: '1d8',
    range: '20/60',
    description: '带有三个尖刺的叉，源自渔具。'
  },
  {
    id: 'war_pick',
    name: '战镐 (War Pick)',
    type: 'weapon',
    category: 'martial_melee',
    cost: { value: 5, unit: 'gp' }, // ✅ 5 gp
    damage: '1d8',
    damageType: 'piercing',
    weight: 2,
    properties: [],
    description: '专门用于穿透护甲的镐头。'
  },
  {
    id: 'warhammer',
    name: '战锤 (Warhammer)',
    type: 'weapon',
    category: 'martial_melee',
    cost: { value: 15, unit: 'gp' }, // ✅ 15 gp
    damage: '1d8',
    damageType: 'bludgeoning',
    weight: 2,
    properties: ['versatile'],
    versatileDamage: '1d10',
    description: '一头平整，一头尖锐的战斗用锤。'
  },
  {
    id: 'whip',
    name: '鞭 (Whip)',
    type: 'weapon',
    category: 'martial_melee',
    cost: { value: 2, unit: 'gp' }, // ✅ 2 gp
    damage: '1d4',
    damageType: 'slashing',
    weight: 3,
    properties: ['finesse', 'reach'],
    description: '虽伤害不高，但拥有极佳的攻击距离。'
  },

  // ============================================
  // 🔴 军用远程武器 (Martial Ranged Weapons)
  // ============================================
  {
    id: 'blowgun',
    name: '吹箭筒 (Blowgun)',
    type: 'weapon',
    category: 'martial_ranged',
    cost: { value: 10, unit: 'gp' }, // ✅ 10 gp
    damage: '1', // 特殊：只有1点伤害
    damageType: 'piercing',
    weight: 1,
    properties: ['ammunition', 'loading'],
    range: '25/100',
    description: '用于发射细针的管状武器，常配合毒药使用。'
  },
  {
    id: 'hand_crossbow',
    name: '手弩 (Hand Crossbow)',
    type: 'weapon',
    category: 'martial_ranged',
    cost: { value: 75, unit: 'gp' }, // ✅ 75 gp
    damage: '1d6',
    damageType: 'piercing',
    weight: 3,
    properties: ['ammunition', 'light', 'loading'],
    requiredAmmoType: 'bolt',
    range: '30/120',
    description: '可以单手射击的小型弩，工艺精湛。'
  },
  {
    id: 'heavy_crossbow',
    name: '重弩 (Heavy Crossbow)',
    type: 'weapon',
    category: 'martial_ranged',
    cost: { value: 50, unit: 'gp' }, // ✅ 50 gp
    damage: '1d10',
    damageType: 'piercing',
    weight: 18,
    properties: ['ammunition', 'heavy', 'loading', 'two_handed'],
    requiredAmmoType: 'bolt',
    range: '100/400',
    description: '拥有强大穿透力的远程武器，但装填缓慢。'
  },
  {
    id: 'longbow',
    name: '长弓 (Longbow)',
    type: 'weapon',
    category: 'martial_ranged',
    cost: { value: 50, unit: 'gp' }, // ✅ 50 gp
    damage: '1d8',
    damageType: 'piercing',
    weight: 2,
    properties: ['ammunition', 'heavy', 'two_handed'],
    requiredAmmoType: 'arrow',
    range: '150/600',
    description: '射程极远的巨型弓，需要强健的体魄拉开弓弦。'
  },
  {
    id: 'net',
    name: '捕网 (Net)',
    type: 'weapon',
    category: 'martial_ranged',
    cost: { value: 1, unit: 'gp' }, // ✅ 1 gp
    damage: '0', // 无伤害
    damageType: 'damage_none',
    weight: 3,
    properties: ['special', 'thrown'],
    range: '5/15',
    description: '用来束缚敌人的大网。'
  }
];