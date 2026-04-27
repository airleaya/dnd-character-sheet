import type { ItemIntakeAudit, ItemIntakeEntry } from '../itemIntake';

const ERLW_SOURCE = 'ERLW艾伯伦：从终末战争中崛起';
const ERLW_CHECK_DATE = '2026-04-27';

type ErlwCategory = 'dragonshard' | 'magic_item' | 'eldritch_machine' | 'crafting_rule';
type ErlwParsedType = 'gear' | 'weapon' | 'armor' | 'consumable' | 'treasure' | 'misc';

interface ErlwDraft {
  id: string;
  name: string;
  englishName?: string;
  category: ErlwCategory;
  itemLine?: string;
  parsedType: ErlwParsedType;
  rarity?: string;
  attunement?: string | boolean;
  activation?: string;
  duration?: string;
  charges?: string;
  effect: string;
  tables?: Record<string, unknown>;
  notes?: string;
  auditIssues?: string[];
}

const ERLW_USEFUL_FIELDS = [
  '来源',
  '类别',
  '名称',
  '魔法物品类型',
  '稀有度',
  '同调需求',
  '激活方式',
  '充能',
  '规则效果',
  '子表'
];

const audit = (draft: ErlwDraft): ItemIntakeAudit => ({
  sourceMatched: !draft.auditIssues?.length,
  checkedAt: ERLW_CHECK_DATE,
  summary: `已核对 ${draft.name} 的类别、类型、稀有度、同调需求和规则效果。`,
  issues: draft.auditIssues ?? []
});

const entry = (draft: ErlwDraft): ItemIntakeEntry => ({
  id: `erlw_${draft.category}_${draft.id}`,
  source: ERLW_SOURCE,
  status: 'parsed',
  rawText: `${draft.name}${draft.englishName ? draft.englishName : ''}。${draft.itemLine ?? draft.category}。${draft.effect}`,
  understanding: draft.category === 'magic_item'
    ? 'ERLW魔法物品条目；显式作为魔法物品收录，不纳入默认普通物品讨论范围。'
    : draft.category === 'dragonshard'
      ? 'ERLW龙晶宝藏/材料条目；龙晶不是魔法物品，而是充满魔法能量的水晶材料。'
      : draft.category === 'eldritch_machine'
        ? 'ERLW超凡奇械剧情装置条目；通常作为剧情道具而非可携带普通物品。'
        : 'ERLW魔法物品经济与制造规则条目。',
  usefulFields: ERLW_USEFUL_FIELDS,
  notes: draft.notes ?? (draft.auditIssues?.length ? '原文存在疑似错字或术语不一致，已按语义规范化并在审核中留痕。' : undefined),
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
    tables: draft.tables,
    tags: ['erlw', draft.category]
  },
  audit: audit(draft)
});

export const ERLW_TREASURE_MAGIC_ITEM_INTAKE: ItemIntakeEntry[] = [
  entry({
    id: 'dragonshards',
    name: '龙晶',
    englishName: 'Dragonshards',
    category: 'dragonshard',
    parsedType: 'treasure',
    effect: '龙晶并非魔法物品，而是充满魔法能量的水晶。它在艾伯伦世界中用于创造魔法物品、举行仪式和增幅龙纹力量，共分艾伯伦、开伯尔和西伯瑞斯三种。',
    tables: {
      types: [
        ['艾伯伦龙晶 Eberron dragonshard', '浅层土壤，常包裹水晶洞般岩壳；富矿多在夸巴拉和泽恩德瑞克丛林', '玫瑰色晶体，深部有流动深红漩涡，常提炼为发光粉末', '龙晶尘作为能源，可替代昂贵特殊材料耗材；用于制造魔法物品、闪电列车和元素飞艇动力'],
        ['开伯尔龙晶 Khyber dragonshard', '地脉深处，常近岩浆层，生长于洞穴墙壁', '深蓝或深紫，有闪烁纹路', '束缚魔法；用于元素束缚器、命匣、异界誓缚、诱捕或操控灵魂、死灵仪式'],
        ['西伯瑞斯龙晶 Siberys dragonshard', '自西伯瑞斯之环坠落，科瓦雷罕见，泽恩德瑞克较常见', '琥珀色，含闪烁金色纹理', '制造需要龙纹同调的魔法物品；大号可用于超凡奇械、神器和传奇物品']
      ]
    },
    notes: '译者注说明艾伯伦、开伯尔、西伯瑞斯对应创世神话三龙：大地、黄泉、天空。'
  }),
  entry({
    id: 'arcane_propulsion_arm',
    name: '喷流式奥能臂',
    englishName: 'Arcane Propulsion Arm',
    category: 'magic_item',
    itemLine: '奇物，极珍稀（同调生物须已丧失一只手或手臂）',
    parsedType: 'weapon',
    rarity: 'Very Rare',
    attunement: 'creature missing a hand or arm',
    activation: '1 Action to remove; thrown weapon attack',
    effect: '卡尼斯家族奇械师研发的假肢。同调时接在残缺手腕、肘部或肩膀上，并变成原先丧失肢体的样貌。假肢成为身体一部分，可用动作卸下，解除同调时自动脱卸，且无法违背意愿移除。它也是你熟练的魔法近战武器，造成1d8力场伤害，具有投掷20/60尺；投掷时脱离飞向目标，然后立即返回并重新连接。'
  }),
  entry({
    id: 'armblade',
    name: '臂刃',
    englishName: 'Armblade',
    category: 'magic_item',
    itemLine: '武器（任意单手近战武器），普通（需机关人同调）',
    parsedType: 'weapon',
    rarity: 'Common',
    attunement: 'warforged',
    activation: 'Bonus Action',
    effect: '附着在手臂上的魔法武器，维持同调时无法与你分离。同调期间必须一直贴着前臂。可用附赠动作从前臂弹出或收回；弹出时如同持有该武器，但这只手不能执行其他操作。'
  }),
  entry({
    id: 'belashyrra_beholder_crown',
    name: '贝拉希拉的眼魔王冠',
    englishName: "Belashyrra's Beholder Crown",
    category: 'magic_item',
    itemLine: '奇物，传奇（需同调）',
    parsedType: 'gear',
    rarity: 'Legendary',
    attunement: true,
    charges: '10，清晨恢复1d6+3',
    effect: '共生体王冠，由紫色石块雕刻，有十个眼梗状凸起。要同调，须一直戴在头上，让隐藏触手钻入头皮并扎根颅骨。戴着时可看穿120尺内魔法与非魔法黑暗。拥有10发充能，可施展魅惑人类、解离术、恐惧术、死亡一指、石化术、人类定身术、衰弱射线、睡眠术、缓慢术、心灵遥控，法术豁免DC16。共生体同调后无法脱下，也不能主动终止同调；成为能结束诅咒的法术目标时同调结束并分离。贝拉希拉与王冠同位面时可通过眼梗观察。'
  }),
  entry({ id: 'cleansing_stone', name: '清洁石', englishName: 'Cleansing Stone', category: 'magic_item', itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', activation: '1 Action', effect: '直径1英尺的球状石块，刻有魔法徽记。触摸时可用动作激活，去除你身上的污垢以及衣服上的污渍。常嵌在安黛尔公共广场基座或高端伽兰达旅店中。' }),
  entry({
    id: 'docent',
    name: '指导附件',
    englishName: 'Docent',
    category: 'magic_item',
    itemLine: '奇物，珍稀（需机关人同调）',
    parsedType: 'gear',
    rarity: 'Rare',
    attunement: 'warforged',
    effect: '小号金属球，直径约2寸，镶嵌龙晶。同调时须嵌入身体某处，如胸口或眼窝。它是智能魔法物品，任意阵营，智力16、感知14、魅力14，通过你的感官观察世界并以心灵念话交流。若你在0HP状态下结束回合，指导附件可进行+6感知（医疗）检定，成功则稳定你的伤势。它知晓通用语、巨人语和1d4种额外语言；可有一项+7技能加值；知晓侦测善恶或侦测魔法之一并可随意施放。其人格自主，关系不好时可能拒绝帮助。',
    tables: { randomTraits: [['语言', '通用语、巨人语、1d4种额外语言；不足六种时可通过你的感官学会新语言'], ['技能 d4', '1奥术、2历史、3调查、4自然，所选技能+7'], ['法术 d6', '1-2侦测善恶，3-6侦测魔法；由指导附件决定何时施放']] }
  }),
  entry({
    id: 'dyrrns_tentacle_whip',
    name: '迪恩的触手长鞭',
    englishName: "Dyrrn's Tentacle Whip",
    category: 'magic_item',
    itemLine: '武器（鞭子），极珍稀（需同调）',
    parsedType: 'weapon',
    rarity: 'Very Rare',
    attunement: true,
    activation: 'Bonus Action to draw or stow',
    effect: '共生体武器，坚韧鞭状肌肉，一端有锋利螯刺。同调时须缠绕手腕，卷须嵌入手臂且过程痛苦。攻击和伤害+2，但攻击异怪时具有劣势。命中额外造成1d6心灵伤害；攻击检定d20自然20时，目标震慑到其下一回合结束。可用附赠动作缩进手臂或抽出。共生体同调时不能被移除，也不能主动结束同调；成为能结束诅咒的法术目标时同调结束并分离。'
  }),
  entry({
    id: 'earworm',
    name: '耳虫',
    englishName: 'Earworm',
    category: 'magic_item',
    itemLine: '奇物，非普通（需同调）',
    parsedType: 'gear',
    rarity: 'Uncommon',
    attunement: true,
    charges: '4，清晨恢复1d4',
    effect: '共生体。同调时须贴在耳后皮肤，让它钻入头颅并吸附颅骨。埋入体内期间，你可以说、读、写深渊语。耳虫有4发充能，可施展侦测思想（2发，DC15）或不谐低语（1发，DC15）。每当用耳虫施展侦测思想时，它会把读取信息传给最近的异变魔或另一只耳虫，并继续接力直到传给异变魔。共生体同调时不能被移除，也不能主动结束同调；成为能结束诅咒的法术目标时同调结束并退出身体。',
    auditIssues: ['原文“直到成功穿给异变魔为止”疑为“传给异变魔”，按语义规范化。']
  }),
  entry({ id: 'everbright_lantern', name: '永明提灯', englishName: 'Everbright Lantern', category: 'magic_item', itemLine: '奇物，普通', parsedType: 'gear', rarity: 'Common', effect: '牛眼提灯内设置艾伯伦龙晶，发光方式类似不灭明炎。发出120尺锥形光芒，前60尺为明亮光照，后60尺为昏暗光照。' }),
  entry({ id: 'feather_token', name: '羽落硬币', englishName: 'Feather Token', category: 'magic_item', itemLine: '奇物，普通', parsedType: 'consumable', rarity: 'Common', effect: '刻有羽毛图像的小金属圆片。当你带着它摔落至少20尺时，改为以每轮60尺速度飘落并免受坠落伤害。着陆后魔法消散，圆片变为非魔法物品。' }),
  entry({
    id: 'finder_goggles',
    name: '探索者护目镜',
    englishName: 'Finder Goggles',
    category: 'magic_item',
    itemLine: '奇物，非普通（需持有探索龙纹的生物同调）',
    parsedType: 'gear',
    rarity: 'Uncommon',
    attunement: 'creature with Mark of Finding',
    activation: '1 Action',
    effect: '花哨护目镜，以西伯瑞斯龙晶作镜片。佩戴时，进行感知（洞察）检定可额外投掷d4并加入结果。也可用动作检查物品，确认上一个触摸它的生物的灵光：进行感知（洞察）检定，DC=13+该物品上次被触摸距今天数。成功则得知该生物类型，并可立即用护目镜施展生物定位术寻找它；此能力直到次日黎明前无法再用。'
  }),
  entry({
    id: 'glamerweave',
    name: '幻象织物',
    englishName: 'Glamerweave',
    category: 'magic_item',
    itemLine: '奇物，普通或非普通',
    parsedType: 'gear',
    rarity: 'Common or Uncommon',
    activation: 'Bonus Action',
    effect: '附有无害幻觉魔法的服装。普通版本穿着时可用附赠动作在布料上绘制活动幻象图纹。非普通版本可使幻象图纹飘出布料，如虚幻火焰或蝴蝶；穿着非普通版本时，可在魅力（表演）或魅力（游说）检定中额外投掷d4并加入结果，使用后直到次日黎明前不能再用。'
  }),
  entry({
    id: 'imbued_wood_focus',
    name: '蕴能木法器',
    englishName: 'Imbued Wood Focus',
    category: 'magic_item',
    itemLine: '奇物，普通（需同调）',
    parsedType: 'gear',
    rarity: 'Common',
    attunement: true,
    effect: '可为权杖、法杖或魔杖，由注满异位面能量的树木切割制成。施法者可将其作为施法法器。用它施展造成伤害的法术时，若法术伤害类型与蕴能木类别吻合，伤害检定额外+1。',
    tables: { woodTypes: [['费尼亚岑树', '火焰'], ['伊瑞安紫檀', '光耀'], ['奇斯瑞马疯木', '强酸或毒素'], ['拉玛尼亚橡树', '闪电或雷鸣'], ['玛伯尔黑檀', '黯蚀'], ['瑞西亚松树', '冷冻'], ['萨拉法斯桦木', '力场'], ['瑟瑞奥特鸡翅木', '心灵']] }
  }),
  entry({
    id: 'keycharm',
    name: '魔力钥匙',
    englishName: 'Keycharm',
    category: 'magic_item',
    itemLine: '奇物，普通（需持有警戒龙纹的生物同调）',
    parsedType: 'gear',
    rarity: 'Common',
    attunement: 'creature with Mark of Warding',
    effect: '昆达拉克家族制式小钥匙。施展警报术、秘法锁或守卫刻文时，可将法术效果与魔力钥匙连接；持有者可获悉警报术警报、打开秘法锁的锁，或避免触发守卫刻文。持有者不必同调，也可用动作终止与魔力钥匙连接的法术，但必须知道由你设置的终止命令词。'
  }),
  entry({
    id: 'kyrzins_ooze',
    name: '凯尔金的泥怪',
    englishName: "Kyrzin's Ooze",
    category: 'magic_item',
    itemLine: '奇物，极珍稀（需同调）',
    parsedType: 'gear',
    rarity: 'Very Rare',
    attunement: true,
    effect: '罐中乳白色共生体黏液。要同调须喝下黏液。获得毒素和强酸伤害抗性，并免疫中毒状态。可用动作说命令词，让身体获得泥怪不定形态1分钟，连同穿戴和携带装备可通过1寸宽空间且不视为挤入；使用后直到次日黎明前不能再用。也可用动作喷出30尺长、5尺宽强酸吐息，范围内生物DC15敏捷豁免，失败受36(8d8)强酸伤害，成功减半；使用后直到次日黎明前不能再用。共生体同调时不能被移除，也不能主动结束；结束诅咒法术可使其渗出身体。若你体内含泥怪时死亡，泥怪破体吞噬尸体并变成黑布丁怪，视为异变魔盟友。'
  }),
  entry({
    id: 'living_armor',
    name: '活体盔甲',
    englishName: 'Living Armor',
    category: 'magic_item',
    itemLine: '护甲（任意），极珍稀（需同调）',
    parsedType: 'armor',
    rarity: 'Very Rare',
    attunement: true,
    effect: '可怖共生体盔甲，外层黑色几丁质，下面是红亮肌腱和搏动血管。同调期间须一直穿着，让触手扎入体内。穿着时AC+1，并获得黯蚀、毒素和心灵伤害抗性。共生体同调时盔甲不能脱下，也不能主动结束；结束诅咒法术可使同调结束并分离。每次完成长休后，必须立即将剩余生命骰一半（向上取整）喂给盔甲，否则承受1级力竭。'
  }),
  entry({
    id: 'living_gloves',
    name: '活体手套',
    englishName: 'Living Gloves',
    category: 'magic_item',
    itemLine: '奇物，非普通（需同调）',
    parsedType: 'gear',
    rarity: 'Uncommon',
    attunement: true,
    effect: '活的共生体手套，由薄几丁质和肌腱构成并不断搏动。同调期间须一直戴着，让它与皮肤融为一体。同调时选择获得巧手、盗贼工具、一种工匠工具或一种乐器熟练项之一；使用所选熟练项进行属性检定时，可使用双倍熟练加值。共生体同调时手套不能脱下，也不能主动结束；结束诅咒法术可使同调结束，此时可脱下。'
  }),
  entry({
    id: 'orb_of_shielding',
    name: '护盾法球',
    englishName: 'Orb of Shielding',
    category: 'magic_item',
    itemLine: '奇物，普通（需同调）',
    parsedType: 'gear',
    rarity: 'Common',
    attunement: true,
    activation: 'Reaction',
    effect: '光滑球状水晶或矿石，材质调谐于某个异位面。施法者可作为施法法器。持有时若受到与法球材质调谐类型相同的伤害，可用反应将伤害减少1d4点，最低至0。',
    tables: { materials: [['费尼亚', '玄武岩', '火焰'], ['伊瑞安', '石英', '光耀'], ['奇斯瑞', '矽卡岩', '强酸或毒素'], ['拉玛尼亚', '燧石', '闪电或雷鸣'], ['玛伯尔', '黑曜石', '黯蚀'], ['瑞西亚', '页岩', '冷冻'], ['萨拉法斯', '角岩', '力场'], ['瑟瑞奥特', '大理石', '心灵']] }
  }),
  entry({
    id: 'prosthetic_limb',
    name: '义肢',
    englishName: 'Prosthetic Limb',
    category: 'magic_item',
    itemLine: '奇物，普通（需丧失至少一处肢体的生物同调）',
    parsedType: 'gear',
    rarity: 'Common',
    attunement: 'creature missing at least one limb',
    activation: '1 Action attach or remove',
    effect: '奇械义肢可替代被砍下的手、手臂、脚或腿。与你同调后，取代丧失肢体并成为身体一部分。你能用动作接上或卸下义肢，其他人无法脱下。若使用多个义肢，计算同调位时所有义肢视作一件魔法物品。'
  }),
  entry({
    id: 'scribing_pen',
    name: '抄录员之笔',
    englishName: 'Scribing Pen',
    category: 'magic_item',
    itemLine: '奇物，普通（需持有抄录龙纹的生物同调）',
    parsedType: 'gear',
    rarity: 'Common',
    attunement: 'creature with Mark of Scribing',
    effect: '可在任意平面上书写。墨迹可由你选择可见或隐形，但持有抄录龙纹的生物总能看见这些墨迹。拥有抄录龙纹的生物可用动作接触隐形墨迹使其对所有人显形。若用笔在生物身上写字，除非它是构装体，否则墨迹7天后淡去。'
  }),
  entry({
    id: 'shiftweave',
    name: '百变外套',
    englishName: 'Shiftweave',
    category: 'magic_item',
    itemLine: '奇物，普通',
    parsedType: 'gear',
    rarity: 'Common',
    activation: 'Bonus Action command word',
    effect: '制作时可设定最多五种不同服饰外观。穿着时，可用附赠动作说出命令词，将外观变为其蕴含的另一种外观。无论外观如何，始终只视为一件衣服；可变幻其他魔法服饰外貌，但不会获得其魔法特效。'
  }),
  entry({
    id: 'speaking_stone',
    name: '通讯石',
    englishName: 'Speaking Stone',
    category: 'magic_item',
    itemLine: '奇物，极珍稀',
    parsedType: 'gear',
    rarity: 'Very Rare',
    activation: '1 Action',
    effect: '西维斯家族通信站网络的关键。由西伯瑞斯龙晶雕刻，嵌入编号识别魔法徽记。持有抄录龙纹的侏儒可触摸通讯石并用动作施展短讯术，目标为另一颗通讯石，需知晓位置或徽记编号。目标通讯石5尺内生物都能听到信息，如同他们是短讯术目标。西维斯通信站通常有侏儒值班接听并抄写传入通讯。'
  }),
  entry({
    id: 'spellshard',
    name: '法术晶格',
    englishName: 'Spellshard',
    category: 'magic_item',
    itemLine: '奇物，普通',
    parsedType: 'gear',
    rarity: 'Common',
    activation: '1 Action',
    effect: '一握大小的抛光艾伯伦龙晶，功能类似书本，可存下最多相当于320页书的内容。制造时可为空或已有信息，也可设定口令以限制读取。握住晶格时，可用动作向其敞开意识，在脑海中阅读内容；后续读写需维持类似法术专注，读写时间与正常相同。思考特定短语或标题会将意识引向其首次出现位置。法师可将法术晶格作为法术书，在其中抄录法术花费与通常相同。'
  }),
  entry({
    id: 'ventilating_lungs',
    name: '生风铁肺',
    englishName: 'Ventilating Lungs',
    category: 'magic_item',
    itemLine: '奇物，珍稀（需同调）',
    parsedType: 'gear',
    rarity: 'Rare',
    attunement: true,
    activation: '1 Action',
    effect: '针对终末战争毒气制造的金属结节。同调时原肺消失，铁肺进入身体取代它。铁肺允许正常呼吸，此功能在反魔场中也不会被压制。未受反魔场或其他压制魔法影响时，铁肺还允许你在任何环境包括真空中呼吸，并在对抗有害气体的检定中具有优势。可用动作无成分施放造风术，视为由你施放，法术豁免DC15；使用后直到次日黎明前不能再用。解除同调时原来的肺重新出现。'
  }),
  entry({
    id: 'wand_sheath',
    name: '魔杖插槽',
    englishName: 'Wand Sheath',
    category: 'magic_item',
    itemLine: '奇物，普通（需机关人同调）',
    parsedType: 'gear',
    rarity: 'Common',
    attunement: 'warforged',
    activation: '1 Action insert wand; Bonus Action extend or retract',
    effect: '固定在手臂上的魔杖插槽。同调期间无法从你身上移除。可用动作将一柄魔杖插入，每次只能容纳一柄。可用附赠动作将插入的魔杖弹出或缩回；弹出时可正常使用它，如同持有该魔杖，但不占用手。若插槽内魔杖需要同调，必须先与之同调；魔杖插槽和其中魔杖在计算同调魔法物品数量时视为一件。移除魔杖时，你与魔杖的同调终止。'
  }),
  entry({
    id: 'wheel_of_wind_and_water',
    name: '风水轮',
    englishName: 'Wheel of Wind and Water',
    category: 'magic_item',
    itemLine: '奇物，非普通',
    parsedType: 'gear',
    rarity: 'Uncommon',
    effect: '一种船舵。安装在元素帆船或飞艇上时，允许持有风暴龙纹的生物通过心灵感应控制飞船内被束缚的元素。若安装在普通航船上，持有风暴龙纹的生物使用轮子时，可在船周围创造理想航行环境，使速度增加5英里/小时。'
  }),
  entry({
    id: 'eldritch_machines_overview',
    name: '超凡奇械',
    englishName: 'Eldritch Machines',
    category: 'eldritch_machine',
    parsedType: 'misc',
    effect: '超凡奇械是强大、庞大且难以移动的魔法装置，是魔法与工程学交织的奇迹，通常需要特殊构件和条件才能运转。它们一般作为剧情道具，可能是邪恶计划的最后一环，也可能是抵御魔王的最后防线。'
  }),
  entry({ id: 'creation_forge', name: '创造熔炉', englishName: 'Creation Forge', category: 'eldritch_machine', parsedType: 'misc', effect: '球形舱室，内有漂浮方尖碑。方尖碑创造机关人的灵魂，并将其置入新造机关人躯体。只有卡尼斯家族中持有龙纹的成员才能创造和维护。王座条约后科瓦雷创造熔炉应被废弃，但传说萨恩深处仍保留最后一个，甚至不止一个。' }),
  entry({ id: 'dimensional_seal', name: '位面封印', englishName: 'Dimensional Seal', category: 'eldritch_machine', parsedType: 'misc', effect: '巨大石板，绘有复杂符文和法印。辐射2英里半径隐形力场，阻止所有形式咒法系魔法，以及涉及传送或位面旅行的效果。常见于埃鲁登原野或阴影湿地，制造技术已失传；传说所有封印是整体，将异变魔束缚于开伯尔并阻断瑟瑞奥特与艾伯伦连接。' }),
  entry({ id: 'mabaran_resonator', name: '玛伯尔共鸣仪', englishName: 'Mabaran Resonator', category: 'eldritch_machine', parsedType: 'misc', effect: '从玛伯尔位面汲取力量，将无尽黑夜邪恶能量注入死者躯体。激活时，共鸣仪周围2英里内死亡的所有类人生物会在1分钟后转化为僵尸，并受掌控共鸣仪的生物操控。' }),
  entry({ id: 'masters_call', name: '主宰诏令', englishName: "Master's Call", category: 'eldritch_machine', parsedType: 'misc', activation: '1 Action', duration: '24小时', effect: '外观看似构装体废料，但力量强大。控制者可感知奇械周围10英里内所有机关人并知晓位置。可用动作向他们发送心灵传讯，属于惑控系魔法，每24小时最多一次。收到传讯的机关人须通过DC12感知检定，否则被迫服从其中一条命令；受影响机关人24小时后摆脱控制。' }),
  entry({ id: 'spell_sink', name: '术法静默仪', englishName: 'Spell Sink', category: 'eldritch_machine', parsedType: 'misc', activation: '1 Action', effect: '放射半径1到3英里的反魔场，效果同反魔场法术。操纵者可用动作展开或停止力场。形态取决于创造者，可为有生命的奇械或龙晶金属容器。术法虹吸器变体不仅中和魔法，还能吸收区域内魔法能量并储存，用以产生灾难性效果。' }),
  entry({ id: 'storm_spire', name: '风暴尖塔', englishName: 'Storm Spire', category: 'eldritch_machine', parsedType: 'misc', effect: '只能由持有风暴龙纹的生物操控。让林兰德家族拥有影响天气的力量，对居民可能是福音，也可能是收费的诅咒。' }),
  entry({
    id: 'common_magic_item_economy',
    name: '魔法物品日常化',
    englishName: 'Everyday Magic Items',
    category: 'crafting_rule',
    parsedType: 'misc',
    effect: '感谢龙晶，普通稀有度魔法物品在科瓦雷随处可见，包括《珊娜萨的万事指南》中的普通魔法物品。购买普通魔法物品时，DM决定库存，或让购物者进行集体智力（调查）检定寻找商店或摊位；城市DC10，小镇DC15，村庄DC20。失败后至少24小时才能在该社区再次尝试。价格可由DM设定，或使用随机价格2d4×10 gp；卷轴、药剂等消耗品价格减半。'
  }),
  entry({
    id: 'crafting_common_magic_items',
    name: '制造普通魔法物品',
    englishName: 'Crafting Common Magic Items',
    category: 'crafting_rule',
    parsedType: 'misc',
    effect: '艾伯伦通常使用DMG或XGE造物规则，但若得到龙晶，可更容易制造普通魔法物品。角色必须拥有奥术技能熟练，或拥有制造该物品非魔法版本所需工具熟练。施法者若熟练奥术，可抄录其所知法术卷轴，并须提供法术所需材料；戏法在抄录卷轴时视为1环法术。制造小时数可分散到多日，龙晶会被消耗。',
    tables: { crafting: [['法术卷轴（戏法）', '8小时', '15 gp'], ['治疗药水', '8小时', '25 gp'], ['其他普通魔法物品', '32小时', '50 gp'], ['消耗品修正', '时间和费用减半', '适用于类似卷轴和药水的消耗品']] }
  }),
  entry({
    id: 'eberron_crafting_complications',
    name: '艾伯伦制造难题',
    englishName: 'Eberron Crafting Complications',
    category: 'crafting_rule',
    parsedType: 'misc',
    effect: '若使用XGE物品制造规则制造非普通稀有度的魔法物品，制造过程可能遭遇难题。每耗费5个工作周（25天）制造魔法物品，就有10%概率遭遇难题。可使用艾伯伦制造难题表。',
    tables: { complications: [['1', '卡尼斯家族或另一个龙纹家族对你的工作产生兴趣，可能视你为威胁或青睐你的技术'], ['2', '事故创造临时显能区域'], ['3', '需要额外珍奇部件才能完成制作，必须冒险取得'], ['4', '位面运动干扰工作，工期延迟2d6天'], ['5', '活动引起金权会、密阁、翡翠利爪或砂主注意'], ['6', '制作的物品变成智能魔法物品']] }
  })
];
