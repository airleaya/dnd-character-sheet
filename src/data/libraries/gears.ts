// src/data/libraries/gears.ts
import type { GearDefinition } from '../../types/Library';

export const GEAR_LIBRARY: GearDefinition[] = [
  {
    id: 'bedroll',
    name: '铺盖卷 (Bedroll)',
    type: 'gear',
    cost: { value: 1, unit: 'gp' },
    weight: 7,
    description: '野外露营必备。你在长休时需要它来避免力竭。',
    rarity: 'Common'
  },
  {
    id: 'blanket',
    name: '毛毯 (Blanket)',
    type: 'gear',
    cost: { value: 5, unit: 'sp' },
    weight: 3,
    description: '一张厚实的保暖毯子。',
    rarity: 'Common'
  },
  {
    id: 'chain_10ft',
    name: '铁链 (Chain, 10 ft.)',
    type: 'gear',
    cost: { value: 5, unit: 'gp' },
    weight: 10,
    description: '一条10尺长的铁链。DC 20 力量检定可将其挣断。',
    rarity: 'Common'
  },
  {
    id: 'crowbar',
    name: '撬棍 (Crowbar)',
    type: 'gear',
    cost: { value: 2, unit: 'gp' },
    weight: 5,
    description: '使用撬棍可以让使用者在强行撬开物体的力量检定中具有优势。',
    rarity: 'Common'
  },
  {
    id: 'grappling_hook',
    name: '爪钩 (Grappling Hook)',
    type: 'gear',
    cost: { value: 2, unit: 'gp' },
    weight: 4,
    description: '系在绳子末端使用，可用于攀爬或钩取物体。',
    rarity: 'Common'
  },
  {
    id: 'hammer',
    name: '锤子 (Hammer)',
    type: 'gear',
    cost: { value: 1, unit: 'gp' },
    weight: 3,
    description: '一把单手锤，通常用于敲击岩钉。',
    rarity: 'Common'
  },
  {
    id: 'lantern_hooded',
    name: '遮光提灯 (Lantern, Hooded)',
    type: 'gear',
    cost: { value: 5, unit: 'gp' },
    weight: 2,
    description: '燃烧灯油。提供30尺明亮光照和30尺微光光照。你可以用一个动作降下挡板，将光照减少为5尺微光。',
    rarity: 'Common'
  },
  {
    id: 'lantern_bullseye',
    name: '牛眼提灯 (Lantern, Bullseye)',
    type: 'gear',
    cost: { value: 10, unit: 'gp' },
    weight: 2,
    description: '燃烧灯油。提供60尺锥状明亮光照和60尺锥状微光光照。你可以用一个动作降下挡板，将光照完全遮挡。',
    rarity: 'Common'
  },
  {
    id: 'holy_symbol_amulet',
    name: '圣徽：护身符 (Holy Symbol, Amulet)',
    type: 'gear',
    cost: { value: 5, unit: 'gp' },
    weight: 1,
    description: '挂在项链上的神圣护符。牧师和圣武士可以使用圣徽作为施法法器。',
    rarity: 'Common'
  },
  {
    id: 'holy_symbol_emblem',
    name: '圣徽：徽章 (Holy Symbol, Emblem)',
    type: 'gear',
    cost: { value: 5, unit: 'gp' },
    weight: 0,
    description: '刻在盾牌或护甲上的神圣徽记。牧师和圣武士可以使用圣徽作为施法法器。',
    rarity: 'Common'
  },
  {
    id: 'holy_symbol_reliquary',
    name: '圣徽：圣物箱 (Holy Symbol, Reliquary)',
    type: 'gear',
    cost: { value: 5, unit: 'gp' },
    weight: 2,
    description: '装有神圣遗物的小盒子。牧师和圣武士可以使用圣徽作为施法法器。',
    rarity: 'Common'
  },
  {
    id: 'lock',
    name: '锁 (Lock)',
    type: 'gear',
    cost: { value: 10, unit: 'gp' },
    weight: 1,
    description: '一把普通的铁锁，附带钥匙。',
    rarity: 'Common'
  },
  {
    id: 'manacles',
    name: '镣铐 (Manacles)',
    type: 'gear',
    cost: { value: 2, unit: 'gp' },
    weight: 6,
    description: '用于束缚小型或中型生物。挣脱 DC 20 (敏捷)，破坏 DC 20 (力量)。',
    rarity: 'Common'
  },
  {
    id: 'mess_kit',
    name: '餐具包 (Mess Kit)',
    type: 'gear',
    cost: { value: 2, unit: 'sp' },
    weight: 1,
    description: '包含简单的杯子、盘子和餐具。',
    rarity: 'Common'
  },
  {
    id: 'mirror_steel',
    name: '钢面镜 (Mirror, Steel)',
    type: 'gear',
    cost: { value: 5, unit: 'gp' },
    weight: 0.5,
    description: '一面抛光的钢镜，可用于观察转角或发送信号。',
    rarity: 'Common'
  },
  {
    id: 'piton',
    name: '岩钉 (Piton)',
    type: 'gear',
    cost: { value: 5, unit: 'cp' },
    weight: 0.25,
    description: '攀爬时敲入墙面的金属钉。',
    rarity: 'Common'
  },
  {
    id: 'pole_10ft',
    name: '10尺长杆 (Pole, 10-foot)',
    type: 'gear',
    cost: { value: 5, unit: 'cp' },
    weight: 7,
    description: '探查陷阱的利器。',
    rarity: 'Common'
  },
  {
    id: 'rope_hempen',
    name: '麻绳 (Rope, Hempen, 50 ft.)',
    type: 'gear',
    cost: { value: 1, unit: 'gp' },
    weight: 10,
    description: '50尺长的结实麻绳。HP 2, DC 17 力量检定可拉断。',
    rarity: 'Common'
  },
  {
    id: 'rope_silk',
    name: '丝绳 (Rope, Silk, 50 ft.)',
    type: 'gear',
    cost: { value: 10, unit: 'gp' },
    weight: 5,
    description: '50尺长的丝制绳索，比麻绳更轻且更坚固。HP 4, DC 17 力量检定可拉断。',
    rarity: 'Common'
  },
  {
    id: 'shovel',
    name: '铲子 (Shovel)',
    type: 'gear',
    cost: { value: 2, unit: 'gp' },
    weight: 5,
    description: '用于挖掘。如果当做武器使用，视为简易武器(1d4 钝击)。',
    rarity: 'Common'
  },
  {
    id: 'spyglass',
    name: '望远镜 (Spyglass)',
    type: 'gear',
    cost: { value: 1000, unit: 'gp' },
    weight: 1,
    description: '透过它观察物体时放大两倍。',
    rarity: 'Rare'
  },
  {
    id: 'tinderbox',
    name: '火绒盒 (Tinderbox)',
    type: 'gear',
    cost: { value: 5, unit: 'sp' },
    weight: 1,
    description: '包含打火石、火镰和易燃的火绒。点燃火把需要一个动作。',
    rarity: 'Common'
  },
  {
    id: 'bell',
    name: '铃铛 (Bell)',
    type: 'gear',
    cost: { value: 1, unit: 'gp' },
    weight: 0,
    description: '一个小铜铃，常配合细绳作为警报陷阱。',
    rarity: 'Common'
  },
  {
    id: 'string_10ft',
    name: '细绳 (String, 10 ft.)',
    type: 'gear',
    cost: { value: 1, unit: 'cp' }, // 价格微不足道，通常视为杂物
    weight: 0,
    description: '10尺长的细绳。',
    rarity: 'Common'
  },
  {
    id: 'ink_bottle',
    name: '墨水 (Ink, 1 ounce bottle)',
    type: 'gear', // 虽是消耗品，但通常按瓶买，用很久
    cost: { value: 10, unit: 'gp' },
    weight: 0,
    description: '一瓶黑色墨水，足够书写约500页。',
    rarity: 'Common'
  },
  {
    id: 'ink_pen',
    name: '羽毛笔 (Ink Pen)',
    type: 'gear',
    cost: { value: 2, unit: 'cp' },
    weight: 0,
    description: '木杆或鹅毛制成的笔。',
    rarity: 'Common'
  },
  {
    id: 'sealing_wax',
    name: '封蜡 (Sealing Wax)',
    type: 'gear',
    cost: { value: 5, unit: 'sp' },
    weight: 0,
    description: '用于密封卷轴或信件。',
    rarity: 'Common'
  },
  {
    id: 'soap',
    name: '肥皂 (Soap)',
    type: 'gear',
    cost: { value: 2, unit: 'cp' },
    weight: 0,
    description: '一块肥皂。',
    rarity: 'Common'
  },
  {
    id: 'lamp',
    name: '灯 (Lamp)',
    type: 'gear',
    cost: { value: 5, unit: 'sp' },
    weight: 1,
    description: '燃烧灯油。提供15尺明亮光照和额外30尺微光光照。',
    rarity: 'Common'
  },

  // --- 服饰与装扮 (Clothing & Appearance) ---
  {
    id: 'clothes_fine',
    name: '高档衣物 (Clothes, Fine)',
    type: 'gear',
    cost: { value: 15, unit: 'gp' },
    weight: 6,
    description: '这一套行头是用昂贵的布料、珍贵的皮毛以及天鹅绒剪裁制作的。',
    rarity: 'Common'
  },
  {
    id: 'costume',
    name: '戏服 (Costume)',
    type: 'gear',
    cost: { value: 5, unit: 'gp' },
    weight: 4,
    description: '用于在戏剧表演中装扮成不同角色的衣物。',
    rarity: 'Common'
  },
  {
    id: 'vestments',
    name: '祭袍 (Vestments)',
    type: 'gear',
    cost: { value: 5, unit: 'gp' }, // 依据 PHB 圣徽/法器通常价格区间估算
    weight: 4, // 估算重量
    description: '神职人员在仪式上穿着的法衣。',
    rarity: 'Common'
  },
  {
    id: 'perfume',
    name: '香水 (Perfume, vial)',
    type: 'gear',
    cost: { value: 5, unit: 'gp' },
    weight: 0,
    description: '一小瓶芬芳的香水。',
    rarity: 'Common'
  },

  // --- 职业与学术杂物 (Professional & Scholarly) ---
  {
    id: 'book_lore',
    name: '学识之书 (Book, Lore)',
    type: 'gear',
    cost: { value: 25, unit: 'gp' },
    weight: 5,
    description: '一本关于特定领域（如历史、奥秘或宗教）的书籍。',
    rarity: 'Common'
  },
  {
    id: 'censer',
    name: '香炉 (Censer)',
    type: 'gear',
    cost: { value: 5, unit: 'gp' }, // 估算值，PHB未单独列出，通常视为法器一部分
    weight: 1, // 估算
    description: '用于燃烧香块的金属容器，常用于宗教仪式。',
    rarity: 'Common'
  },
  {
    id: 'incense_block',
    name: '香块 (Incense, block)',
    type: 'gear',
    cost: { value: 1, unit: 'gp' }, // 常见仪式材料估价
    weight: 0,
    description: '一块芳香的树脂或草药混合物，燃烧时产生烟雾。',
    rarity: 'Common'
  },
  {
    id: 'sand_bag',
    name: '一袋沙子 (Sand, bag)',
    type: 'gear',
    cost: { value: 1, unit: 'cp' }, // 几乎免费，算作袋子钱
    weight: 1,
    description: '一小袋细沙，常用于干燥墨迹或用于某些学术研究。',
    rarity: 'Common'
  },
  {
    id: 'knife_small',
    name: '小刀 (Knife, small)',
    type: 'gear',
    cost: { value: 2, unit: 'gp' }, // 参考匕首价格
    weight: 0.5,
    description: '一把用于削羽毛笔或处理信件的小刀。若作为武器使用，视为匕首。',
    rarity: 'Common'
  }
];