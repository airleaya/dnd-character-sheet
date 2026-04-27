import type { ItemIntakeAudit, ItemIntakeEntry } from '../itemIntake';

const ARMOR_SOURCE = 'PHB玩家手册';
const ARMOR_CHECK_DATE = '2026-04-27';

const ARMOR_USEFUL_FIELDS = [
  '中英文名称',
  '护甲类别',
  '价格',
  'AC',
  '力量需求',
  '隐匿',
  '重量',
  '装着时间',
  '卸除时间',
  '描述'
];

const armorAudit = (summary: string): ItemIntakeAudit => ({
  sourceMatched: true,
  checkedAt: ARMOR_CHECK_DATE,
  summary,
  issues: []
});

export const PHB_ARMOR_INTAKE: ItemIntakeEntry[] = [
  {
    id: 'armor_padded',
    source: ARMOR_SOURCE,
    status: 'normalized',
    rawText: '布甲Padded。5 gp；AC 11＋敏捷调整值；隐匿劣势；8磅。轻甲装着1分钟，卸除1分钟。描述：布甲由数层布料与棉料的衬里构成。',
    understanding: '轻甲条目，基础 AC 11，可加入完整敏捷调整值，隐匿劣势。',
    usefulFields: ARMOR_USEFUL_FIELDS,
    parsed: {
      id: 'padded',
      name: '布甲 (Padded)',
      type: 'armor',
      armorType: 'light',
      cost: { value: 5, unit: 'gp' },
      ac: 11,
      stealthDis: true,
      weight: 8,
      donTime: '1分钟',
      doffTime: '1分钟',
      description: '布甲由数层布料与棉料的衬里构成。'
    },
    audit: armorAudit('已核对名称、类别、价格、AC、隐匿、重量和着卸甲时间，均与原文一致。')
  },
  {
    id: 'armor_leather',
    source: ARMOR_SOURCE,
    status: 'normalized',
    rawText: '皮甲Leather。10 gp；AC 11＋敏捷调整值；隐匿－；10磅。轻甲装着1分钟，卸除1分钟。描述：护胸和护肩由油煮硬化的皮子制成，其余部分由更软更灵活的材料制作。',
    understanding: '轻甲条目，基础 AC 11，可加入完整敏捷调整值，无隐匿劣势。',
    usefulFields: ARMOR_USEFUL_FIELDS,
    parsed: {
      id: 'leather',
      name: '皮甲 (Leather)',
      type: 'armor',
      armorType: 'light',
      cost: { value: 10, unit: 'gp' },
      ac: 11,
      stealthDis: false,
      weight: 10,
      donTime: '1分钟',
      doffTime: '1分钟',
      description: '该护甲的护胸和护肩由通过油煮硬化的皮子制成。护甲的其余部分则由更软更灵活的材料制作。'
    },
    audit: armorAudit('已核对名称、类别、价格、AC、隐匿、重量和着卸甲时间，均与原文一致。')
  },
  {
    id: 'armor_studded_leather',
    source: ARMOR_SOURCE,
    status: 'normalized',
    rawText: '镶钉皮甲Studded Leather。45 gp；AC 12＋敏捷调整值；隐匿－；13磅。轻甲装着1分钟，卸除1分钟。描述：由坚固而柔韧的皮革制成，表面由紧密的铆钉和尖刺加固。',
    understanding: '轻甲条目，基础 AC 12，可加入完整敏捷调整值，无隐匿劣势。',
    usefulFields: ARMOR_USEFUL_FIELDS,
    parsed: {
      id: 'studded_leather',
      name: '镶钉皮甲 (Studded Leather)',
      type: 'armor',
      armorType: 'light',
      cost: { value: 45, unit: 'gp' },
      ac: 12,
      stealthDis: false,
      weight: 13,
      donTime: '1分钟',
      doffTime: '1分钟',
      description: '该护甲由坚固而柔韧的皮革制成，其表面由紧密的铆钉和尖刺进行加固。'
    },
    audit: armorAudit('已核对名称、类别、价格、AC、隐匿、重量和着卸甲时间，均与原文一致。')
  },
  {
    id: 'armor_hide',
    source: ARMOR_SOURCE,
    status: 'normalized',
    rawText: '兽皮甲Hide。10 gp；AC 12＋敏捷调整值(最大2)；隐匿－；12磅。中甲装着5分钟，卸除1分钟。描述：由厚毛皮制作的粗糙护甲。',
    understanding: '中甲条目，基础 AC 12，敏捷调整值最多 +2，无隐匿劣势。',
    usefulFields: ARMOR_USEFUL_FIELDS,
    parsed: {
      id: 'hide',
      name: '兽皮甲 (Hide)',
      type: 'armor',
      armorType: 'medium',
      cost: { value: 10, unit: 'gp' },
      ac: 12,
      dexBonusMax: 2,
      stealthDis: false,
      weight: 12,
      donTime: '5分钟',
      doffTime: '1分钟',
      description: '一种由厚毛皮制作的粗糙护甲。常见使用人群包括：野蛮人部落、邪恶类人生物以及其它缺少资源制作更好护甲的人。'
    },
    audit: armorAudit('已核对名称、类别、价格、AC、敏捷上限、隐匿、重量和着卸甲时间，均与原文一致。')
  },
  {
    id: 'armor_chain_shirt',
    source: ARMOR_SOURCE,
    status: 'normalized',
    rawText: '链甲衫Chain Shirt。50 gp；AC 13＋敏捷调整值(最大2)；隐匿－；20磅。中甲装着5分钟，卸除1分钟。描述：互相锁接的金属环组成，通常着装于布衣或皮衣的夹层之间。',
    understanding: '中甲条目，基础 AC 13，敏捷调整值最多 +2，无隐匿劣势。',
    usefulFields: ARMOR_USEFUL_FIELDS,
    parsed: {
      id: 'chain_shirt',
      name: '链甲衫 (Chain Shirt)',
      type: 'armor',
      armorType: 'medium',
      cost: { value: 50, unit: 'gp' },
      ac: 13,
      dexBonusMax: 2,
      stealthDis: false,
      weight: 20,
      donTime: '5分钟',
      doffTime: '1分钟',
      description: '该护甲由互相锁接的金属环组成，通常着装于布衣或皮衣的夹层之间。这种护甲为着装者的上半身提供了适中的保护，且锁环间相互碰撞的声音也可以被外层衣服减弱。'
    },
    audit: armorAudit('已核对名称、类别、价格、AC、敏捷上限、隐匿、重量和着卸甲时间，均与原文一致。')
  },
  {
    id: 'armor_scale_mail',
    source: ARMOR_SOURCE,
    status: 'normalized',
    rawText: '鳞甲Scale Mail。50 gp；AC 14＋敏捷调整值(最大2)；隐匿劣势；45磅。中甲装着5分钟，卸除1分钟。描述：皮外套和护胫组合，防护部分由相叠的铁片覆盖。',
    understanding: '中甲条目，基础 AC 14，敏捷调整值最多 +2，隐匿劣势。',
    usefulFields: ARMOR_USEFUL_FIELDS,
    parsed: {
      id: 'scale_mail',
      name: '鳞甲 (Scale Mail)',
      type: 'armor',
      armorType: 'medium',
      cost: { value: 50, unit: 'gp' },
      ac: 14,
      dexBonusMax: 2,
      stealthDis: true,
      weight: 45,
      donTime: '5分钟',
      doffTime: '1分钟',
      description: '该护甲由一件皮外套和护胫（可能附有护裙）组合而成，其防护部分由相叠的铁片覆盖，结构有如鱼的鳞片。此护甲同时还附有护手。'
    },
    audit: armorAudit('已核对名称、类别、价格、AC、敏捷上限、隐匿、重量和着卸甲时间，均与原文一致。')
  },
  {
    id: 'armor_breastplate',
    source: ARMOR_SOURCE,
    status: 'normalized',
    rawText: '胸甲Breastplate。400 gp；AC 14＋敏捷调整值(最大2)；隐匿－；20磅。中甲装着5分钟，卸除1分钟。描述：由皮条固定的金属护胸组成。',
    understanding: '中甲条目，基础 AC 14，敏捷调整值最多 +2，无隐匿劣势。',
    usefulFields: ARMOR_USEFUL_FIELDS,
    parsed: {
      id: 'breastplate',
      name: '胸甲 (Breastplate)',
      type: 'armor',
      armorType: 'medium',
      cost: { value: 400, unit: 'gp' },
      ac: 14,
      dexBonusMax: 2,
      stealthDis: false,
      weight: 20,
      donTime: '5分钟',
      doffTime: '1分钟',
      description: '该护甲主要由皮条固定的金属护胸组成。尽管它并没有为四肢提供额外的防护，但其在保证着装者活动自由度的同时，为其生命器官提供了十分有效的保护效果。'
    },
    audit: armorAudit('已核对名称、类别、价格、AC、敏捷上限、隐匿、重量和着卸甲时间，均与原文一致。')
  },
  {
    id: 'armor_half_plate',
    source: ARMOR_SOURCE,
    status: 'normalized',
    rawText: '半身板甲Half Plate。750 gp；AC 15＋敏捷调整值(最大2)；隐匿劣势；40磅。中甲装着5分钟，卸除1分钟。描述：覆盖身体大部分的铸模金属板，腿部为简单护胫。',
    understanding: '中甲条目，基础 AC 15，敏捷调整值最多 +2，隐匿劣势。',
    usefulFields: ARMOR_USEFUL_FIELDS,
    parsed: {
      id: 'half_plate',
      name: '半身板甲 (Half Plate)',
      type: 'armor',
      armorType: 'medium',
      cost: { value: 750, unit: 'gp' },
      ac: 15,
      dexBonusMax: 2,
      stealthDis: true,
      weight: 40,
      donTime: '5分钟',
      doffTime: '1分钟',
      description: '半身板甲主要由覆盖着装者身体大部分的铸模金属板组成。不过，其腿部防护则只有由皮条系住的简单护胫。'
    },
    audit: armorAudit('已核对名称、类别、价格、AC、敏捷上限、隐匿、重量和着卸甲时间，均与原文一致。')
  },
  {
    id: 'armor_ring_mail',
    source: ARMOR_SOURCE,
    status: 'normalized',
    rawText: '环甲Ring Mail。30 gp；AC 14；隐匿劣势；40磅。重甲装着10分钟，卸除5分钟。描述：将重金属环扣缝进内层的特殊皮甲。',
    understanding: '重甲条目，固定 AC 14，不加入敏捷调整值，隐匿劣势。',
    usefulFields: ARMOR_USEFUL_FIELDS,
    parsed: {
      id: 'ring_mail',
      name: '环甲 (Ring Mail)',
      type: 'armor',
      armorType: 'heavy',
      cost: { value: 30, unit: 'gp' },
      ac: 14,
      dexBonusMax: 0,
      stealthDis: true,
      weight: 40,
      donTime: '10分钟',
      doffTime: '5分钟',
      description: '该护甲是将重金属环扣缝进内层的特殊皮甲。金属环可以加强护甲对剑斧挥击的抵抗力。环甲比链甲低一级，而通常只被那些无力支付更好护甲的人所使用。'
    },
    audit: armorAudit('已核对名称、类别、价格、AC、力量需求、隐匿、重量和着卸甲时间；dexBonusMax=0 来自原文重甲规则。')
  },
  {
    id: 'armor_chain_mail',
    source: ARMOR_SOURCE,
    status: 'normalized',
    rawText: '链甲Chain Mail。75 gp；AC 16；力量13；隐匿劣势；55磅。重甲装着10分钟，卸除5分钟。描述：互相锁接的金属环编成，并有织物衬里。',
    understanding: '重甲条目，固定 AC 16，力量需求 13，隐匿劣势。',
    usefulFields: ARMOR_USEFUL_FIELDS,
    parsed: {
      id: 'chain_mail',
      name: '链甲 (Chain Mail)',
      type: 'armor',
      armorType: 'heavy',
      cost: { value: 75, unit: 'gp' },
      ac: 16,
      dexBonusMax: 0,
      strReq: 13,
      stealthDis: true,
      weight: 55,
      donTime: '10分钟',
      doffTime: '5分钟',
      description: '该护甲由互相锁接的金属环编成。链甲还包括在甲胄下面穿戴的一层织物衬里，用以阻止擦伤并减缓挥击的冲击。此护甲同时还附有护手。'
    },
    audit: armorAudit('已核对名称、类别、价格、AC、力量需求、隐匿、重量和着卸甲时间；dexBonusMax=0 来自原文重甲规则。')
  },
  {
    id: 'armor_splint',
    source: ARMOR_SOURCE,
    status: 'normalized',
    rawText: '板条甲Splint。200 gp；AC 17；力量15；隐匿劣势；60磅。重甲装着10分钟，卸除5分钟。描述：铆接着竖直金属窄条的皮革内里，关节由链甲部件保护。',
    understanding: '重甲条目，固定 AC 17，力量需求 15，隐匿劣势。',
    usefulFields: ARMOR_USEFUL_FIELDS,
    parsed: {
      id: 'splint',
      name: '板条甲 (Splint)',
      type: 'armor',
      armorType: 'heavy',
      cost: { value: 200, unit: 'gp' },
      ac: 17,
      dexBonusMax: 0,
      strReq: 15,
      stealthDis: true,
      weight: 60,
      donTime: '10分钟',
      doffTime: '5分钟',
      description: '该护甲主要由铆接着竖直金属窄条的皮革内里组成，其整体覆盖在布料衣物外，而关节部位则由灵活的链甲部件提供保护。'
    },
    audit: armorAudit('已核对名称、类别、价格、AC、力量需求、隐匿、重量和着卸甲时间；dexBonusMax=0 来自原文重甲规则。')
  },
  {
    id: 'armor_plate',
    source: ARMOR_SOURCE,
    status: 'normalized',
    rawText: '板甲Plate。1,500 gp；AC 18；力量15；隐匿劣势；65磅。重甲装着10分钟，卸除5分钟。描述：覆盖全身且相互连接的模铸金属板。',
    understanding: '重甲条目，固定 AC 18，力量需求 15，隐匿劣势。',
    usefulFields: ARMOR_USEFUL_FIELDS,
    parsed: {
      id: 'plate',
      name: '板甲 (Plate)',
      type: 'armor',
      armorType: 'heavy',
      cost: { value: 1500, unit: 'gp' },
      ac: 18,
      dexBonusMax: 0,
      strReq: 15,
      stealthDis: true,
      weight: 65,
      donTime: '10分钟',
      doffTime: '5分钟',
      description: '板甲由覆盖全身，且相互连接的模铸金属板组成。一套板甲包括护手、重皮靴、一顶附面甲的头盔以及在护甲底层的厚重的布甲。其锁扣和皮带结构可以将护甲重量分配到身体各处。'
    },
    audit: armorAudit('已核对名称、类别、价格、AC、力量需求、隐匿、重量和着卸甲时间；dexBonusMax=0 来自原文重甲规则。')
  },
  {
    id: 'armor_shield',
    source: ARMOR_SOURCE,
    status: 'normalized',
    rawText: '盾牌Shield。10 gp；AC +2；隐匿－；6磅。盾牌装着1动作，卸除1动作。描述：通常由木材或金属制成，单手持用，同一时间只能从一面盾牌中受益。',
    understanding: '盾牌条目，作为防具提供 AC +2，同一时间只能从一面盾牌受益。',
    usefulFields: ARMOR_USEFUL_FIELDS,
    parsed: {
      id: 'shield',
      name: '盾牌 (Shield)',
      type: 'armor',
      armorType: 'shield',
      cost: { value: 10, unit: 'gp' },
      ac: 2,
      stealthDis: false,
      weight: 6,
      donTime: '1动作',
      doffTime: '1动作',
      description: '盾牌通常由木材或金属制成，可以单手进行持用。持用一面盾牌可以令你的护甲等级加2。不过同一时间里你只能从一面盾牌中受益。'
    },
    audit: armorAudit('已核对名称、类别、价格、AC 加值、隐匿、重量和着卸盾时间，均与原文一致。')
  }
];
