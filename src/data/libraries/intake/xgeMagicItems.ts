import type { ItemIntakeAudit, ItemIntakeEntry } from '../itemIntake';

const XGE_MAGIC_ITEM_SOURCE = 'XGE珊娜萨的万事指南';
const XGE_MAGIC_ITEM_CHECK_DATE = '2026-04-27';

type XgeMagicParsedType = 'armor' | 'weapon' | 'consumable' | 'gear';

interface XgeMagicItemDraft {
  id: string;
  name: string;
  englishName?: string;
  itemLine: string;
  parsedType: XgeMagicParsedType;
  rarity: 'Common';
  attunement?: string | boolean;
  activation?: string;
  duration?: string;
  charges?: string;
  effect: string;
  auditIssues?: string[];
}

const XGE_MAGIC_ITEM_USEFUL_FIELDS = [
  '来源',
  '名称',
  '魔法物品类型',
  '稀有度',
  '同调需求',
  '激活方式',
  '持续时间',
  '充能',
  '规则效果'
];

const audit = (draft: XgeMagicItemDraft): ItemIntakeAudit => ({
  sourceMatched: !draft.auditIssues?.length,
  checkedAt: XGE_MAGIC_ITEM_CHECK_DATE,
  summary: `已核对 ${draft.name} 的类型、稀有度、同调需求和规则效果。`,
  issues: draft.auditIssues ?? []
});

const magicItem = (draft: XgeMagicItemDraft): ItemIntakeEntry => ({
  id: `xge_magic_item_${draft.id}`,
  source: XGE_MAGIC_ITEM_SOURCE,
  status: 'normalized',
  rawText: `${draft.name}${draft.englishName ? draft.englishName : ''}。${draft.itemLine}。${draft.effect}`,
  understanding: 'XGE魔法物品条目；显式作为魔法物品收录，不纳入默认普通物品讨论范围。',
  usefulFields: XGE_MAGIC_ITEM_USEFUL_FIELDS,
  notes: draft.auditIssues?.length ? '原文存在疑似错字、排版或译名问题，已按条目语义规范化并在审核中留痕。' : undefined,
  parsed: {
    id: draft.id,
    name: draft.englishName ? `${draft.name} (${draft.englishName})` : draft.name,
    type: draft.parsedType,
    rarity: draft.rarity,
    magicItemType: draft.itemLine,
    attunement: draft.attunement,
    activation: draft.activation,
    duration: draft.duration,
    charges: draft.charges,
    effectDescription: draft.effect,
    description: draft.effect,
    tags: ['magic_item', 'xge', 'common']
  },
  audit: audit(draft)
});

export const XGE_MAGIC_ITEM_INTAKE: ItemIntakeEntry[] = [
  magicItem({ id: 'gleaming_armor', name: '闪烁甲', englishName: 'Gleaming Armor', itemLine: '盔甲（任何中甲或者重甲），普通', parsedType: 'armor', rarity: 'Common', effect: '这件盔甲永远不会被弄脏。' }),
  magicItem({ id: 'bead_of_nourishment', name: '食物珠', englishName: 'Bead of Nourishment', itemLine: '奇物，普通', parsedType: 'consumable', rarity: 'Common', activation: '放在舌尖', effect: '没有味道的海绵状凝胶珠子会在舌尖溶解，并提供一天份的食物营养。' }),
  magicItem({ id: 'bead_of_refreshment', name: '鲜水珠', englishName: 'Bead of Refreshment', itemLine: '奇物，普通', parsedType: 'consumable', rarity: 'Common', effect: '没有味道的海绵状凝胶珠子在液体中溶解，并把液体转化成一品脱新鲜且冰冷的饮用水。无法影响魔法液体或毒药之类的有害物质。' }),
  magicItem({ id: 'boots_of_false_tracks', name: '伪迹靴', englishName: 'Boots of False Tracks', itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', effect: '只有类人生物可以穿着。穿着时，可以选择留下另一种类人生物的足迹。' }),
  magicItem({ id: 'candle_of_the_deep', name: '深渊蜡烛', englishName: 'Candle of the Deep', itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', effect: '蜡烛的火焰遇水不会熄灭，并像正常蜡烛一样发出光和热。' }),
  magicItem({ id: 'cast_off_armor', name: '速脱甲', englishName: 'Cast-Off Armor', itemLine: '盔甲（轻甲、中甲或重甲），普通', parsedType: 'armor', rarity: 'Common', activation: '1 Action', effect: '你可以用一个动作脱下这套盔甲。' }),
  magicItem({ id: 'charlatans_die', name: '骗子骰', englishName: "Charlatan's Die", itemLine: '奇物，普通（需调谐）', parsedType: 'gear', rarity: 'Common', attunement: true, effect: '当你掷这枚六面骰时，可以控制其数字。' }),
  magicItem({ id: 'cloak_of_billowing', name: '翻腾斗篷', englishName: 'Cloak of Billowing', itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', activation: 'Bonus Action', effect: '穿着时，可以用附赠动作让斗篷剧烈翻腾。' }),
  magicItem({ id: 'cloak_of_many_fashions', name: '万众时尚斗篷', englishName: 'Cloak of Many Fashions', itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', activation: 'Bonus Action', effect: '穿着时，可以用附赠动作改变斗篷的款式、颜色和外表品质。重量不变，且仍然只是斗篷；即使复制其他魔法斗篷外观，也不会获得其魔法属性。', auditIssues: ['原文“改变其款式，颜色，款式和外表的品质”重复“款式”，按语义摘取为款式、颜色和外表品质。'] }),
  magicItem({ id: 'clockwork_amulet', name: '发条护身符', englishName: 'Clockwork Amulet', itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', effect: '铜制护身符连接着数个互相咬合的齿轮，魔法来自机械境。把耳朵放在护身符上的生物能听到模糊滴答声和呼呼声。佩戴时进行一次攻击检定，可以放弃掷骰并在骰值上取10。使用后直到下一个黎明前不能再次使用。', auditIssues: ['原文“机械镜”疑为“机械境/Mechanus”；“护法”疑为“护身符”，按语义规范化。'] }),
  magicItem({ id: 'clothes_of_mending', name: '修补之衣', englishName: 'Clothes of Mending', itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', effect: '这件简洁的旅行者服饰会像戏法似的修复自身日常磨损和破洞。已被损毁的部分不能以此法恢复。' }),
  magicItem({ id: 'dark_shard_amulet', name: '黑暗碎片护符', englishName: 'Dark Shard Amulet', itemLine: '奇物，普通（需邪术师调谐）', parsedType: 'gear', rarity: 'Common', attunement: 'warlock', effect: '由邪术师宗主领域的一块独立且具有恢复力的异位面物质碎片制成。佩戴时可作为邪术师法术的法器。还可尝试施展一个不知晓的邪术师戏法，须通过DC10智力（奥术）检定；成功则施展，失败则戏法失败且施法动作照常消耗。无论结果如何，直到完成长休前不能再次使用。' }),
  magicItem({ id: 'dread_helm', name: '恐怖头盔', englishName: 'Dread Helm', itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', effect: '戴着这个令人害怕的钢铁头盔时，你的眼睛闪烁红光。' }),
  magicItem({ id: 'ear_horn_of_hearing', name: '助听器', englishName: 'Ear Horn of Hearing', itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', effect: '戴在耳朵上时，这个号角会压制耳聋状态的影响，使你可以正常听到。' }),
  magicItem({ id: 'enduring_spellbook', name: '耐久法术书', englishName: 'Enduring Spellbook', itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', effect: '这本法术书及其书页内容不会被火焰损毁，也不会被水泡烂；此外，法术书不会因年岁变烂。' }),
  magicItem({ id: 'ersatz_eye', name: '义眼', englishName: 'Ersatz Eye', itemLine: '奇物，普通（需调谐）', parsedType: 'gear', rarity: 'Common', attunement: true, effect: '这只人造眼会替代失去或移除的一只真眼。只要义眼仍植入你的眼眶，就不能被你以外的人移除；你可以透过它视物，如同正常眼睛。' }),
  magicItem({ id: 'hat_of_vermin', name: '杂虫帽', englishName: 'Hat of Vermin', itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', activation: '1 Action', charges: '3，黎明恢复全部', duration: '1小时或HP归零', effect: '帽子有3发充能。戴着时，可用动作消耗1发并说出命令语，召唤蝙蝠、青蛙或老鼠。召唤生物魔法般出现并尽力远离你，既不友好也不敌对，不受你控制，表现如普通生物，1小时后或HP归零时消失。每天黎明恢复所有消耗的充能。' }),
  magicItem({ id: 'hat_of_wizardry', name: '巫术帽', englishName: 'Hat of Wizardry', itemLine: '奇物，普通（需法师调谐）', parsedType: 'gear', rarity: 'Common', attunement: 'wizard', effect: '老旧圆锥帽，饰有金色新月和星星。戴着时，可作为法器；还可尝试施展一个不知晓的法师戏法，须通过DC10智力（奥术）检定。成功则施展，失败则戏法失败且施法动作照常消耗。无论结果如何，直到完成长休前不能再次使用。' }),
  magicItem({ id: 'hewards_handy_spice_pouch', name: '霍华德便利香料包', englishName: "Heward's Handy Spice Pouch", itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', activation: '1 Action', charges: '10，黎明恢复1d6+4', effect: '这个用带子系住的小包出现时为空且有10发充能。携带时可用动作消耗1发充能，说出任何一种非魔法食物调味料，并从中取出一点该调味料；一点足够料理单份食物。黎明恢复1d6+4发充能。' }),
  magicItem({ id: 'horn_of_silent_alarm', name: '静报号角', englishName: 'Horn of Silent Alarm', itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', activation: '1 Action', charges: '4，黎明恢复1d4', effect: '号角有4发充能。用动作消耗1发吹响时，一个你选择的生物能听到嘟嘟声，前提是该生物在600尺内且不耳聋。每天黎明恢复1d4发已消耗充能。' }),
  magicItem({ id: 'instrument_of_illusions', name: '幻象乐器', englishName: 'Instrument of Illusions', itemLine: '奇物，普通（需调谐）', parsedType: 'gear', rarity: 'Common', attunement: true, duration: '演奏期间', effect: '演奏音乐时，可在乐器周围5尺半径球体内创造无害、虚无缥缈的视觉效应；若你是吟游诗人，半径提高到15尺。视觉效应可包括发光音符、舞蹈形体、蝴蝶或落雪。魔法效果无触感也无声音，显然是幻象；停止演奏后结束。' }),
  magicItem({ id: 'instrument_of_scribing', name: '撰写乐器', englishName: 'Instrument of Scribing', itemLine: '奇物，普通（需调谐）', parsedType: 'gear', rarity: 'Common', attunement: true, activation: '1 Action while playing', charges: '3，黎明恢复全部', duration: '24小时', effect: '乐器有3发充能。演奏时，可用动作消耗1发，在30尺内可见的非魔法物体或表面写下一道信息，最长6个字，使用你知道的语言。若你是吟游诗人，可额外写7个字，并可选择令其发光，使其在非魔法黑暗中可见。文字24小时后消失。每天黎明恢复全部消耗的充能。', auditIssues: ['原文结尾写作“这个号角每天黎明恢复”，按上下文规范化为该乐器恢复充能。'] }),
  magicItem({ id: 'lock_of_trickery', name: '骗术锁', englishName: 'Lock of Trickery', itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', effect: '外观看似普通锁且只有一把钥匙。锁内的魔法变相齿轮拒斥固执窃贼；在这把锁上进行的敏捷检定具有劣势。' }),
  magicItem({ id: 'moon_touched_sword', name: '触月剑', englishName: 'Moon-Touched Sword', itemLine: '武器（任意剑），普通', parsedType: 'weapon', rarity: 'Common', effect: '在黑暗中，出鞘剑锋泄出月光，创造15尺半径明亮光照和额外15尺半径微光光照。' }),
  magicItem({ id: 'mystery_key', name: '神秘钥匙', englishName: 'Mystery Key', itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', effect: '钥匙上端有一个问号运转。此钥匙有5%几率打开任何它被插入的锁；若它打开了什么，就会消失。' }),
  magicItem({ id: 'orb_of_direction', name: '方向球', englishName: 'Orb of Direction', itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', activation: '1 Action', effect: '持有时，可用动作探知哪个方向是北。此特性只在物质位面有用。' }),
  magicItem({ id: 'orb_of_time', name: '时间球', englishName: 'Orb of Time', itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', activation: '1 Action', effect: '持有时，可用动作探知外面是早上、中午、傍晚还是午夜。此特性只在物质位面有用。' }),
  magicItem({ id: 'perfume_of_bewitching', name: '迷醉香水', englishName: 'Perfume of Bewitching', itemLine: '奇物，普通', parsedType: 'consumable', rarity: 'Common', activation: '1 Action', duration: '1小时', effect: '小瓶中有足够一人使用的魔法香水。可用动作施于自身，持续1小时。期间，你对挑战等级1或更低的类人生物进行所有魅力检定时具有优势。受影响生物不会注意到自己受魔法影响。' }),
  magicItem({ id: 'pipe_of_smoke_monsters', name: '怪物烟斗', englishName: 'Pipe of Smoke Monsters', itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', activation: '1 Action while smoking', effect: '用烟斗抽烟时，可用动作呼出膨胀烟雾，变成一个单独生物的形状，如龙、呋噜怪或沼喉怪。形状必须小到能装进1尺立方空间，数秒后失去形态并变回烟雾。' }),
  magicItem({ id: 'pole_of_angling', name: '钓竿', englishName: 'Pole of Angling', itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', activation: '1 Action command word', effect: '持握这根10尺长杆时，可用动作说出命令词，使其变为附带鱼钩、鱼线和鱼饵的鱼竿。再次说出命令语会使其变回正常10尺长杆。' }),
  magicItem({ id: 'pole_of_collapsing', name: '压缩杆', englishName: 'Pole of Collapsing', itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', activation: '1 Action command word', effect: '持握这根10尺长杆时，可用动作说出命令词，使其缩小为便于储藏的1尺小棒。可用动作说出另一个命令语使小棒变回长杆；但小棒最多只能延长到空间允许的程度。' }),
  magicItem({ id: 'pot_of_awakening', name: '启蒙花盆', englishName: 'Pot of Awakening', itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', duration: '30日', effect: '可在这个10磅黏土花盆里种植普通植物并让其生长30天。时间结束后，该灌木魔法般变成启蒙灌木；灌木启蒙时，根会破坏并摧毁花盆。该植物对你友善，没有你的命令时什么都不会做。' }),
  magicItem({ id: 'rope_of_mending', name: '修补绳', englishName: 'Rope of Mending', itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', activation: '1 Action command word', effect: '可把这根50尺长绳切成任意数量的更短小段，然后用动作说出命令语让小段重新结合为一体。这些小段必须互相接触且不得另作他用。若其中一段被摧毁或遗失，修补绳会永久短一截。', auditIssues: ['原文“匿失”疑为“遗失”，按语义规范化。'] }),
  magicItem({ id: 'ruby_of_the_war_mage', name: '战法红石', englishName: 'Ruby of the War Mage', itemLine: '奇物，普通（需施法者调谐）', parsedType: 'gear', rarity: 'Common', attunement: 'spellcaster', effect: '直径1寸、刻有可怖符文的红宝石，允许你使用一件简易或军用武器作为法器。要启动此特性，必须将红宝石按压附在武器上至少10分钟；之后除非你用动作分离或武器被摧毁，否则红宝石不会离开，反魔场也不能使其掉落。你与红宝石解除调谐后，它会从武器上掉下。' }),
  magicItem({ id: 'shield_of_expression', name: '表情盾', englishName: 'Shield of Expression', itemLine: '奇物，普通', parsedType: 'armor', rarity: 'Common', activation: 'Bonus Action', effect: '盾牌正面有一张脸。持握时，可用附赠动作改变盾牌的表情。' }),
  magicItem({ id: 'smoldering_armor', name: '焖燃盔甲', englishName: 'Smoldering Armor', itemLine: '盔甲（任何），普通', parsedType: 'armor', rarity: 'Common', effect: '穿着时，几束无害无味的烟雾从盔甲里升起。' }),
  magicItem({ id: 'staff_of_adornment', name: '饰品法杖', englishName: 'Staff of Adornment', itemLine: '法杖，普通', parsedType: 'gear', rarity: 'Common', effect: '持握时，若在法杖顶端放置一个不超过1磅的物体，该物体会在法杖顶端1寸处缓慢漂浮并环绕，直到被移除或法杖不再由你控制。同一时间最多有三样物品漂浮在顶端周围。持握法杖时，可选择令一个物品缓慢旋转或变回静置状态。' }),
  magicItem({ id: 'staff_of_birdcalls', name: '鸟鸣法杖', englishName: 'Staff of Birdcalls', itemLine: '法杖，普通', parsedType: 'gear', rarity: 'Common', activation: '1 Action', charges: '10，黎明恢复1d6+4', effect: '木质法杖饰有鸟雕像。持握时，可用动作消耗1发充能，创造60尺内可听到的鸟类声音之一：麻雀、乌鸦、鸭、鸡、鹅、潜鸟、火鸡、海鸥、夜枭或老鹰。每天黎明恢复1d6+4发。充能耗尽时骰d20，若为1，法杖在无害鸟形云雾中爆炸并永远消失。' }),
  magicItem({ id: 'staff_of_flowers', name: '鲜花法杖', englishName: 'Staff of Flowers', itemLine: '法杖，普通', parsedType: 'gear', rarity: 'Common', activation: '1 Action', charges: '10，黎明恢复1d6+4', effect: '木质法杖有10发充能。持握时，可用动作消耗1发，使5尺内一块地面或土壤上开出一朵花；若未指定特定花朵，则开出微香雏菊。花无害且非魔法，会像正常花朵一样成长。每天黎明恢复1d6+4发。充能耗尽时骰d20，若为1，法杖变成一堆花瓣并永远消失。', auditIssues: ['原文“法杖将在变成一堆花瓣”缺少谓语衔接，按语义摘取为变成花瓣并消失。'] }),
  magicItem({ id: 'talking_doll', name: '说话玩偶', englishName: 'Talking Doll', itemLine: '奇物，普通（需调谐）', parsedType: 'gear', rarity: 'Common', attunement: true, effect: '当毛绒玩偶在你周围5尺内时，你可花费短休教它说六个短句，每句最多6个字，并分别设置触发可见条件。可用新短句替换旧短句。触发条件必须发生在玩偶5尺内。与玩偶解除调谐时，短句消失。' }),
  magicItem({ id: 'tankard_of_sobriety', name: '清醒杯', englishName: 'Tankard of Sobriety', itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', effect: '大酒杯一侧雕刻着坚毅的脸。你可以饮用麦芽酒、葡萄酒或其他非魔法酒精饮料而不会醉。对魔法液体或毒药之类有害物质无效。' }),
  magicItem({ id: 'unbreakable_arrow', name: '不破箭矢', englishName: 'Unbreakable Arrow', itemLine: '武器（箭矢），普通', parsedType: 'weapon', rarity: 'Common', effect: '这支箭矢不会被破坏，除非它处于反魔场中。' }),
  magicItem({ id: 'veterans_cane', name: '老兵手杖', englishName: "Veteran's Cane", itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', activation: 'Bonus Action command word', effect: '当你拄着这根助步杖并用附赠动作说出命令词时，它会变成一把非魔法的普通长剑。' }),
  magicItem({ id: 'walloping_ammunition', name: '冲击弹', englishName: 'Walloping Ammunition', itemLine: '武器（任何弹药），普通', parsedType: 'weapon', rarity: 'Common', effect: '这种弹药会掀起冲击。被该弹药击中的生物必须通过DC10力量豁免，否则倒地。' }),
  magicItem({ id: 'wand_of_conducting', name: '指挥棒', englishName: 'Wand of Conducting', itemLine: '魔杖，普通', parsedType: 'gear', rarity: 'Common', activation: '1 Action', charges: '3，黎明恢复全部', effect: '魔杖有3发充能。持握时，可用动作挥舞并消耗1发充能创造一段管弦乐，音乐在60尺内可听到，并在你停止挥舞后消失。每天黎明恢复全部消耗的充能。充能耗尽时骰d20，若为1，伴随一阵哀恸的低音兼次中音大号声，魔杖碎成灰烬并被破坏。' }),
  magicItem({ id: 'wand_of_pyrotechnics', name: '烟火魔杖', englishName: 'Wand of Pyrotechnics', itemLine: '魔杖，普通', parsedType: 'gear', rarity: 'Common', activation: '1 Action', charges: '7，黎明恢复1d6+1', effect: '魔杖有7发充能。持握时，可用动作消耗1发，在60尺内可见一点创造一束无害且多彩的光亮迸发，并伴随300尺内可听见的爆裂声。光亮如火炬但只持续一瞬。每天黎明恢复1d6+1发。充能耗尽时骰d20，若为1，魔杖迸发无害烟火表演并被破坏。', auditIssues: ['原文“三百吃尺”疑为“三百尺”，按语义规范化。'] }),
  magicItem({ id: 'wand_of_scowls', name: '愁苦之棒', englishName: 'Wand of Scowls', itemLine: '魔杖，普通', parsedType: 'gear', rarity: 'Common', activation: '1 Action', charges: '3，黎明恢复全部', duration: '1分钟', effect: '魔杖有3发充能。持握时，可用动作消耗1发并指定一个类人生物为目标；目标须通过DC10魅力豁免，否则被强制愁苦1分钟。每天黎明恢复全部消耗的充能。充能耗尽时骰d20，若为1，魔杖变成欢笑之棒。' }),
  magicItem({ id: 'wand_of_smiles', name: '欢笑之棒', englishName: 'Wand of Smiles', itemLine: '魔杖，普通', parsedType: 'gear', rarity: 'Common', activation: '1 Action', charges: '3，黎明恢复全部', duration: '1分钟', effect: '魔杖有3发充能。持握时，可用动作消耗1发并指定一个类人生物为目标；目标须通过DC10魅力豁免，否则被强制微笑1分钟。每天黎明恢复全部消耗的充能。充能耗尽时骰d20，若为1，魔杖变成愁苦之棒。' })
];
