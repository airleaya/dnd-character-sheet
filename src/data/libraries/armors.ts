import type { ArmorDefinition } from '../../types/Library';

export const ARMOR_LIBRARY: ArmorDefinition[] = [
  // ============================================
  // 🟢 轻甲 (Light Armor)
  // ============================================
  {
    id: 'padded',
    name: '布甲 (Padded)',
    type: 'armor',
    armorType: 'light',
    ac: 11,
    dexBonusMax: undefined, // 无上限
    stealthDis: true,       // ⚠️ 隐匿劣势: 是
    donTime: '1分钟',
    doffTime: '1分钟',
    cost: { value: 5, unit: 'gp' },
    weight: 8,
    description: '布甲由多层绗缝的布料和棉絮衬里构成。'
  },
  {
    id: 'leather',
    name: '皮甲 (Leather)',
    type: 'armor',
    armorType: 'light',
    ac: 11,
    dexBonusMax: undefined,
    stealthDis: false,
    donTime: '1分钟',
    doffTime: '1分钟',
    cost: { value: 10, unit: 'gp' },
    weight: 10,
    description: '该护甲的护胸和护肩由通过油煮硬化的皮子制成。护甲的其余部分则由更软更灵活的材料制作。'
  },
  {
    id: 'studded_leather',
    name: '镶钉皮甲 (Studded Leather)',
    type: 'armor',
    armorType: 'light',
    ac: 12,
    dexBonusMax: undefined,
    stealthDis: false,
    donTime: '1分钟',
    doffTime: '1分钟',
    cost: { value: 45, unit: 'gp' },
    weight: 13,
    description: '该护甲由坚固而强韧的皮革制成，其表面用紧密的铆钉和金属片进行加固。'
  },

  // ============================================
  // 🟡 中甲 (Medium Armor)
  // ============================================
  {
    id: 'hide',
    name: '兽皮甲 (Hide)',
    type: 'armor',
    armorType: 'medium',
    ac: 12,
    dexBonusMax: 2, // ⚠️ 敏捷上限: 2
    stealthDis: false,
    donTime: '5分钟',
    doffTime: '1分钟',
    cost: { value: 10, unit: 'gp' },
    weight: 12,
    description: '一种由厚毛皮制作的粗糙护甲。常见使用人群包括：野蛮人部落、邪恶类人生物以及其它缺少资源制作更好护甲的人。'
  },
  {
    id: 'chain_shirt',
    name: '链甲衫 (Chain Shirt)',
    type: 'armor',
    armorType: 'medium',
    ac: 13,
    dexBonusMax: 2,
    stealthDis: false,
    donTime: '5分钟',
    doffTime: '1分钟',
    cost: { value: 50, unit: 'gp' },
    weight: 20,
    description: '该护甲由互相锁接的金属环组成，通常穿着于布衣或皮衣的夹层之间。这种护甲为穿着者的上半身提供了适中的保护，且锁环间相互碰撞的声音也可以被外层衣服减弱。'
  },
  {
    id: 'scale_mail',
    name: '鳞甲 (Scale Mail)',
    type: 'armor',
    armorType: 'medium',
    ac: 14,
    dexBonusMax: 2,
    stealthDis: true, // ⚠️ 隐匿劣势: 是
    donTime: '5分钟',
    doffTime: '1分钟',
    cost: { value: 50, unit: 'gp' },
    weight: 45,
    description: '该护甲由一件皮外套和护胫（可能附有护腕）组合而成，其防护部分由相叠的铁片覆盖，结构有如鱼的鳞片。该护甲同时还附有护手。'
  },
  {
    id: 'breastplate',
    name: '胸甲 (Breastplate)',
    type: 'armor',
    armorType: 'medium',
    ac: 14,
    dexBonusMax: 2,
    stealthDis: false,
    donTime: '5分钟',
    doffTime: '1分钟',
    cost: { value: 400, unit: 'gp' },
    weight: 20,
    description: '该护甲主要由皮条固定的金属护胸组成。尽管它并没有为四肢提供额外的防护，但其在保全穿着者行动自由度的同时，为其生命器官提供了十分有效的保护。'
  },
  {
    id: 'half_plate',
    name: '半身板甲 (Half Plate)',
    type: 'armor',
    armorType: 'medium',
    ac: 15,
    dexBonusMax: 2,
    stealthDis: true, // ⚠️ 隐匿劣势: 是
    donTime: '5分钟',
    doffTime: '1分钟',
    cost: { value: 750, unit: 'gp' },
    weight: 40,
    description: '半身板甲主要由覆盖穿着者身体大部分的铸模金属板组成。不过，其腿部防护则只有由皮条系住的简单护胫。'
  },

  // ============================================
  // 🔴 重甲 (Heavy Armor)
  // ============================================
  {
    id: 'ring_mail',
    name: '环甲 (Ring Mail)',
    type: 'armor',
    armorType: 'heavy',
    ac: 14,
    dexBonusMax: 0, // ⚠️ 不加敏捷
    stealthDis: true,
    donTime: '10分钟',
    doffTime: '5分钟',
    cost: { value: 30, unit: 'gp' },
    weight: 40,
    description: '该护甲是将重金属环扣缝进内层的特制皮甲。金属环可以加强护甲对剑斧劈砍的抵抗力。环甲比链甲低一级，而通常只被那些无力支付更好护甲的人所使用。'
  },
  {
    id: 'chain_mail',
    name: '链甲 (Chain Mail)',
    type: 'armor',
    armorType: 'heavy',
    ac: 16,
    dexBonusMax: 0,
    strReq: 13, // 💪 力量需求: 13
    stealthDis: true,
    donTime: '10分钟',
    doffTime: '5分钟',
    cost: { value: 75, unit: 'gp' },
    weight: 55,
    description: '该护甲由互相锁接的金属环缀成。链甲还包括在甲衬下面穿戴的一层织物衬里，用以阻挡擦伤并减缓击打的冲击。该护甲同时还附有护手。'
  },
  {
    id: 'splint',
    name: '条板甲 (Splint)',
    type: 'armor',
    armorType: 'heavy',
    ac: 17,
    dexBonusMax: 0,
    strReq: 15, // 💪 力量需求: 15
    stealthDis: true,
    donTime: '10分钟',
    doffTime: '5分钟',
    cost: { value: 200, unit: 'gp' },
    weight: 60,
    description: '该护甲主要由铆接在皮革内里的竖直金属条组成，其整体覆盖在布料衣物外，而关节部位则由灵活的链甲部件提供保护。'
  },
  {
    id: 'plate',
    name: '板甲 (Plate)',
    type: 'armor',
    armorType: 'heavy',
    ac: 18,
    dexBonusMax: 0,
    strReq: 15, // 💪 力量需求: 15
    stealthDis: true,
    donTime: '10分钟',
    doffTime: '5分钟',
    cost: { value: 1500, unit: 'gp' },
    weight: 65,
    description: '板甲由覆盖全身，且相互连接的模铸金属板组成。一套板甲包括护手、重皮靴、一顶附面甲的头盔以及在护甲底层的厚重的布甲。其锁扣和皮带结构可以将护甲重量分配到身体各处。'
  },

  // ============================================
  // 🛡️ 盾牌 (Shield)
  // ============================================
  {
    id: 'shield',
    name: '盾牌 (Shield)',
    type: 'armor',
    armorType: 'shield',
    ac: 2,
    dexBonusMax: undefined,
    stealthDis: false,
    donTime: '1个动作',
    doffTime: '1个动作',
    cost: { value: 10, unit: 'gp' },
    weight: 6,
    description: '盾牌通常由木材或金属制成，可以单手进行持用。持用一面盾牌可以令你的护甲等级加 2。不过同一时间里你只能从一面盾牌中受益。'
  }
];