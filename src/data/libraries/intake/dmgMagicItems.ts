import type { ItemIntakeAudit, ItemIntakeEntry } from '../itemIntake';

const MAGIC_ITEM_SOURCE = 'DMG城主手册';
const MAGIC_ITEM_CHECK_DATE = '2026-04-27';

type MagicParsedType = 'armor' | 'weapon' | 'consumable' | 'container' | 'gear';

interface MagicItemDraft {
  id: string;
  name: string;
  englishName: string;
  itemLine: string;
  parsedType: MagicParsedType;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary' | 'Varies';
  attunement?: string | boolean;
  weight?: number;
  activation?: string;
  duration?: string;
  effect: string;
  appearance?: string;
  tables?: Record<string, unknown>;
  notes?: string;
  auditIssues?: string[];
}

const MAGIC_ITEM_USEFUL_FIELDS = [
  '来源',
  '中英文名称',
  '魔法物品类型',
  '稀有度',
  '同调需求',
  '激活方式',
  '持续时间',
  '规则效果',
  '子表',
  '外观描述'
];

const audit = (name: string, issues: string[] = []): ItemIntakeAudit => ({
  sourceMatched: issues.length === 0,
  checkedAt: MAGIC_ITEM_CHECK_DATE,
  summary: `已核对 ${name} 的名称、类型行、稀有度、同调需求和规则效果。`,
  issues
});

const magicItem = (draft: MagicItemDraft): ItemIntakeEntry => ({
  id: `magic_item_${draft.id}`,
  source: MAGIC_ITEM_SOURCE,
  status: 'normalized',
  rawText: `${draft.name}${draft.englishName}。${draft.itemLine}。${draft.effect}${draft.appearance ? ` ${draft.appearance}` : ''}`,
  understanding: 'DMG魔法物品条目，作为物品库中的魔法装备、奇物、魔药、戒指、法杖、魔杖或武器数据。',
  usefulFields: MAGIC_ITEM_USEFUL_FIELDS,
  notes: draft.notes ?? (draft.auditIssues?.length ? '原文存在疑似拼写或排版问题，已按条目含义规范化并在审核中留痕。' : undefined),
  parsed: {
    id: draft.id,
    name: `${draft.name} (${draft.englishName})`,
    type: draft.parsedType,
    rarity: draft.rarity,
    weight: draft.weight ?? 0,
    magicItemType: draft.itemLine,
    attunement: draft.attunement,
    activation: draft.activation,
    duration: draft.duration,
    effectDescription: draft.effect,
    appearance: draft.appearance,
    tables: draft.tables,
    description: `${draft.effect}${draft.appearance ? ` ${draft.appearance}` : ''}`,
    tags: ['magic_item', draft.rarity.toLowerCase()]
  },
  audit: audit(draft.name, draft.auditIssues)
});

export const DMG_MAGIC_ITEM_INTAKE: ItemIntakeEntry[] = [
  magicItem({
    id: 'potion_of_climbing',
    name: '攀爬药水',
    englishName: 'Potion of Climbing',
    itemLine: '魔药，普通',
    parsedType: 'consumable',
    rarity: 'Common',
    weight: 0.5,
    activation: 'Drink',
    duration: '1小时',
    effect: '饮用后获得等同于步行速度的攀爬速度；期间攀爬时进行的力量（运动）检定具有优势。',
    appearance: '药水分离成类似岩层的褐色、银色和灰色三层，即使摇晃也不会混合。'
  }),
  magicItem({
    id: 'adamantine_armor',
    name: '精金护甲',
    englishName: 'Adamantine Armor',
    itemLine: '护甲（中型或重型，非兽皮甲），非普通',
    parsedType: 'armor',
    rarity: 'Uncommon',
    effect: '护甲以精金强化。着装该护甲时，任何命中你的重击都会改为普通命中。'
  }),
  magicItem({
    id: 'alchemy_jug',
    name: '炼金壶',
    englishName: 'Alchemy Jug',
    itemLine: '奇物，非普通',
    parsedType: 'gear',
    rarity: 'Uncommon',
    weight: 12,
    activation: '1 Action',
    effect: '陶制壶看似可承装1加仑液体，但无论空满都重12磅。你可以用一个动作命令它产生一种指定液体，并用一个动作以2加仑/分钟倒出。直到次日黎明前，无法再生成超过该液体上限的液体或改为另一种液体。',
    tables: {
      liquids: [
        ['强酸', '8盎司'],
        ['基础毒药', '1/2盎司'],
        ['啤酒', '4加仑'],
        ['蜂蜜', '1加仑'],
        ['蛋黄酱', '2加仑'],
        ['油', '1夸脱'],
        ['醋', '2加仑'],
        ['淡水', '8加仑'],
        ['咸水', '12加仑'],
        ['葡萄酒', '1加仑']
      ]
    }
  }),
  magicItem({
    id: 'amulet_of_proof_against_detection_and_location',
    name: '反侦护符',
    englishName: 'Amulet of Proof Against Detection and Location',
    itemLine: '奇物，非普通（需同调）',
    parsedType: 'gear',
    rarity: 'Uncommon',
    attunement: true,
    effect: '着装此护符时，你不会被预言魔法发现，无法被指定为这类魔法的目标，魔法制造的探测器也无法觉察到你。'
  }),
  magicItem({
    id: 'bag_of_holding',
    name: '次元袋',
    englishName: 'Bag of Holding',
    itemLine: '奇物，非普通',
    parsedType: 'container',
    rarity: 'Uncommon',
    weight: 15,
    activation: '1 Action to retrieve item',
    effect: '袋内空间深约4尺、袋口直径约2尺，可容纳至多500磅且体积不超过64立方尺的东西；无论内容物为何总重15磅。超载、戳破或撕裂会使袋子破裂并摧毁，内容物散落到星界位面。内外翻转会安全倒出内容物。需呼吸生物可存活10除以生物数量分钟，至少1分钟。放入霍华德便利袋、次元洞或类似物品内会同时摧毁两件物品，并打开通往星界位面的单向门。'
  }),
  magicItem({
    id: 'bag_of_tricks',
    name: '魔术袋',
    englishName: 'Bag of Tricks',
    itemLine: '奇物，非普通',
    parsedType: 'gear',
    rarity: 'Uncommon',
    weight: 0.5,
    activation: '1 Action',
    effect: '普通布袋有灰色、铁锈色和棕褐色三种版本。用动作取出毛绒物件并扔至多20尺，落地后按对应d8表变成生物。生物友善，在次日黎明或生命值降至0时消散。可用附赠动作命令它。抽出三件毛绒物件后，要到下次黎明才能再用。',
    tables: {
      gray: ['鼬鼠', '巨鼠', '獾', '野猪', '黑豹', '巨獾', '凶暴狼', '巨驼鹿'],
      rust: ['老鼠', '猫头鹰', '獒', '山羊', '巨山羊', '巨野猪', '狮子', '棕熊'],
      tan: ['豺', '猿', '狒狒', '斧嘴鸟', '黑熊', '巨鼬', '巨鬣狗', '老虎']
    }
  }),
  magicItem({ id: 'boots_of_elvenkind', name: '精灵之靴', englishName: 'Boots of Elvenkind', itemLine: '奇物，非普通', parsedType: 'gear', rarity: 'Uncommon', effect: '着装这双靴子时，无论在何种表面移动都不会发出脚步声。进行有关无声移动的敏捷（隐匿）检定时具有优势。' }),
  magicItem({ id: 'boots_of_striding_and_springing', name: '跳跑之靴', englishName: 'Boots of Striding and Springing', itemLine: '奇物，非普通（需同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: true, effect: '着装时步行速度变为30尺，除非原本更快；速度不会因受阻或穿着护甲而减慢。跳跃距离变为通常三倍，但不能超过剩余移动距离。' }),
  magicItem({ id: 'boots_of_the_winterlands', name: '雪地之靴', englishName: 'Boots of the Winterlands', itemLine: '奇物，非普通（需同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: true, effect: '获得冷冻伤害抗性；忽略冰雪困难地形对移动的影响；可无额外保护忍受-50华氏度，穿厚重衣服可忍受-100华氏度。', appearance: '这双加绒靴子温暖且舒适。' }),
  magicItem({ id: 'bracers_of_archery', name: '射手护腕', englishName: 'Bracers of Archery', itemLine: '奇物，非普通（需同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: true, effect: '着装时获得长弓和短弓熟练项。使用这些武器发动远程攻击时，其伤害掷骰获得+2加值。' }),
  magicItem({ id: 'brooch_of_shielding', name: '护盾胸针', englishName: 'Brooch of Shielding', itemLine: '奇物，非普通（需同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: true, effect: '着装时获得力场伤害抗性，并免疫魔法飞弹的伤害。' }),
  magicItem({ id: 'broom_of_flying', name: '飞天扫帚', englishName: 'Broom of Flying', itemLine: '奇物，非普通', parsedType: 'gear', rarity: 'Uncommon', weight: 3, activation: 'Command Word', effect: '骑上并说出命令语后，扫帚悬浮并载你飞行，飞行速度50尺。最多搭载400磅，超过200磅时飞行速度降至30尺，着陆后停止悬浮。可命令它飞往1里内熟悉地点；若在1里内，可用另一命令语召回。' }),
  magicItem({ id: 'cap_of_water_breathing', name: '水下呼吸帽', englishName: 'Cap of Water Breathing', itemLine: '奇物，非普通', parsedType: 'gear', rarity: 'Uncommon', activation: '1 Action command word', effect: '在水下着装时，可用动作说出命令语，在头部周围创造可呼吸空气泡。空气泡持续至再次说出命令语、摘掉帽子或离开水下。' }),
  magicItem({ id: 'circlet_of_blasting', name: '爆裂头饰', englishName: 'Circlet of Blasting', itemLine: '奇物，非普通', parsedType: 'gear', rarity: 'Uncommon', activation: '1 Action', effect: '着装后可用动作施展灼热射线，攻击加值+5。直到次日黎明前无法再次以此方式使用。' }),
  magicItem({ id: 'cloak_of_elvenkind', name: '精灵斗篷', englishName: 'Cloak of Elvenkind', itemLine: '奇物，非普通（需同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: true, activation: '1 Action to raise/lower hood', effect: '着装并拉起兜帽后，斗篷变换颜色提供伪装。试图看到你的感知（察觉）检定具有劣势，且你使用敏捷（隐匿）躲藏时具有优势。' }),
  magicItem({ id: 'cloak_of_protection', name: '防护斗篷', englishName: 'Cloak of Protection', itemLine: '奇物，非普通（需同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: true, effect: '着装后，你的AC和豁免获得+1加值。' }),
  magicItem({ id: 'cloak_of_the_manta_ray', name: '蝠鲼斗篷', englishName: 'Cloak of the Manta Ray', itemLine: '奇物，非普通', parsedType: 'gear', rarity: 'Uncommon', activation: '1 Action to raise/lower hood', effect: '着装并拉起兜帽后，获得60尺游泳速度，并能在水下呼吸。' }),
  magicItem({
    id: 'decanter_of_endless_water',
    name: '无尽水瓶',
    englishName: 'Decanter of Endless Water',
    itemLine: '奇物，非普通',
    parsedType: 'gear',
    rarity: 'Uncommon',
    weight: 2,
    activation: '1 Action',
    effect: '拔出瓶塞并说出命令语，可流出淡水或咸水，直到下一回合开始停止。溪流产生1加仑水；泉源产生5加仑水；井喷产生30加仑水并形成30尺高、1尺宽水柱。握持时可用附赠动作对30尺内生物喷射，目标DC13力量豁免失败受1d4钝击伤害并倒地；也可打翻或推开不超过200磅且未被着装或携带的物件15尺。',
    tables: { commands: [['溪流', '1加仑'], ['泉源', '5加仑'], ['井喷', '30加仑，附带喷射效果']] }
  }),
  magicItem({
    id: 'deck_of_illusions',
    name: '幻象牌组',
    englishName: 'Deck of Illusions',
    itemLine: '奇物，非普通',
    parsedType: 'gear',
    rarity: 'Uncommon',
    activation: '1 Action',
    effect: '完整牌组有34张卡，作为宝藏获得时通常缺少1d20-1张。随机抽牌并扔到30尺内地面，会形成对应幻象生物直到被解除或卡牌被移动。幻象无法造成伤害；DC15智力（调查）可识破。幻象终止后，该卡牌失效。',
    tables: {
      cards: [
        ['红心A', '红龙'], ['红心K', '骑士和四个卫兵'], ['红心Q', '魅魔或梦魔'], ['红心J', '德鲁伊'], ['红心10', '云巨人'], ['红心9', '双头巨人'], ['红心8', '熊地精'], ['红心2', '地精'],
        ['方块A', '眼魔'], ['方块K', '大法师和法师学徒'], ['方块Q', '夜鬼婆'], ['方块J', '刺客'], ['方块10', '火巨人'], ['方块9', '食人魔巫师'], ['方块8', '豺狼人'], ['方块2', '狗头人'],
        ['黑桃A', '巫妖'], ['黑桃K', '祭司和两名侍僧'], ['黑桃Q', '美杜莎'], ['黑桃J', '老兵'], ['黑桃10', '霜巨人'], ['黑桃9', '巨魔'], ['黑桃8', '大地精'], ['黑桃2', '地精'],
        ['梅花A', '铁魔像'], ['梅花K', '强盗头目和三名强盗'], ['梅花Q', '欲魔'], ['梅花J', '狂战士'], ['梅花10', '山丘巨人'], ['梅花9', '食人魔'], ['梅花8', '兽人'], ['梅花2', '狗头人'], ['王牌（2张）', '你（牌组的持有者）']
      ]
    }
  }),
  magicItem({ id: 'driftglobe', name: '漂浮之球', englishName: 'Driftglobe', itemLine: '奇物，非普通', parsedType: 'gear', rarity: 'Uncommon', weight: 1, activation: 'Command Word / 1 Action', effect: '60尺内可命令它施展光亮术或日光术；日光术使用一次后直到次日黎明前无法再次使用。可用动作命令球体飞到空中，漂浮在离地不超过5尺处，并在你离开60尺范围时沿最短路径跟随。' }),
  magicItem({ id: 'dust_of_disappearance', name: '无踪粉', englishName: 'Dust of Disappearance', itemLine: '奇物，非普通', parsedType: 'consumable', rarity: 'Uncommon', activation: '1 Action', duration: '2d4分钟', effect: '一小包粉末，足够使用一次。用动作洒向空中，使你和周围10尺内的生物及物件隐身2d4分钟。粉末使用即消耗；受影响生物攻击或施法时其隐形终止。' }),
  magicItem({ id: 'dust_of_dryness', name: '干燥粉', englishName: 'Dust of Dryness', itemLine: '奇物，非普通', parsedType: 'consumable', rarity: 'Uncommon', activation: '1 Action', effect: '小包内有1d6+4把粉末。将一把洒到水面上，可把15尺立方区域的水变成弹珠大小小球。生物可用动作摔碎小球释放水分。身体大部分由水组成的元素生物接触粉末时须DC13体质豁免，失败受10d6黯蚀伤害，成功减半。' }),
  magicItem({ id: 'dust_of_sneezing_and_choking', name: '喷嚏粉', englishName: 'Dust of Sneezing and Choking', itemLine: '奇物，非普通', parsedType: 'consumable', rarity: 'Uncommon', activation: '1 Action', effect: '粉末足够使用一次，看起来像无踪粉，鉴定术也会给出无踪粉结果。洒向空中后，你和周围30尺内需要呼吸的生物须DC15体质豁免，失败则因喷嚏无法呼吸，陷入失能并窒息；每回合结束可重试，次级复原术也可终止。' }),
  magicItem({ id: 'elemental_gem', name: '元素宝石', englishName: 'Elemental Gem', itemLine: '奇物，非普通', parsedType: 'consumable', rarity: 'Uncommon', activation: '1 Action', effect: '用动作打碎宝石，效应等同于召唤元素生物，召唤出由宝石种类决定的元素。打碎后宝石失去魔力。', tables: { gems: [['蓝色蓝宝石', '气元素'], ['黄钻石', '土元素'], ['红刚玉', '火元素'], ['祖母绿', '水元素']] } }),
  magicItem({ id: 'eversmoking_bottle', name: '无尽烟壶', englishName: 'Eversmoking Bottle', itemLine: '奇物，非普通', parsedType: 'gear', rarity: 'Uncommon', weight: 1, activation: '1 Action', effect: '带铅塞黄铜瓶会渗出烟雾。拔塞后浓重云雾扩散到60尺半径，区域重度遮蔽；每1分钟半径扩大10尺，至120尺。关闭后云雾10分钟后消散；和风1分钟吹散，强风1轮吹散。' }),
  magicItem({ id: 'eyes_of_charming', name: '魅惑镜片', englishName: 'Eyes of Charming', itemLine: '奇物，非普通（需同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: true, activation: '1 Action', effect: '水晶镜片有3发充能。着装时，若你和30尺内一名类人生物互相可见，可用动作消耗1发充能对它施展魅惑人类（DC13）。每日黎明恢复消耗充能。' }),
  magicItem({ id: 'eyes_of_minute_seeing', name: '微视镜片', englishName: 'Eyes of Minute Seeing', itemLine: '奇物，非普通', parsedType: 'gear', rarity: 'Uncommon', effect: '着装时可更清晰观察周边1尺内物体。在此范围内，为搜索区域或研究物件所作、依赖视力的智力（调查）检定具有优势。' }),
  magicItem({ id: 'eyes_of_the_eagle', name: '鹰眼镜片', englishName: 'Eyes of the Eagle', itemLine: '奇物，非普通（需同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: true, effect: '着装时，依赖视力进行的感知（察觉）检定具有优势。视野清晰时，可在很远处看清小至2尺的生物或物件细节。' }),
  magicItem({ id: 'gauntlets_of_ogre_power', name: '食人魔力量护手', englishName: 'Gauntlets of Ogre Power', itemLine: '奇物，非普通（需同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: true, effect: '着装时力量值变为19。如果未着装时力量已经大于或等于19，则护手无效。' }),
  magicItem({ id: 'gem_of_brightness', name: '光彩夺目宝石', englishName: 'Gem of Brightness', itemLine: '奇物，非普通', parsedType: 'gear', rarity: 'Uncommon', activation: '1 Action', effect: '棱形宝石有50发充能。第一命令语发出30尺明亮光照和30尺微光，不消耗充能，可用附赠动作关闭。第二命令语消耗1发，向60尺内生物发出光束，DC15体质豁免失败目盲1分钟。第三命令语消耗5发，以自身为原点对30尺锥状范围产生同类目盲豁免。耗尽充能后变为价值50gp普通宝石。' }),
  magicItem({ id: 'gloves_of_missile_snaring', name: '辟矢夺箭手套', englishName: 'Gloves of Missile Snaring', itemLine: '奇物，非普通（需同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: true, activation: 'Reaction', effect: '着装且至少空着一只手时，远程武器攻击命中你可用反应减少1d10+敏捷调整值伤害。若伤害降至0，可选择抓住尺寸足够的抛掷物。' }),
  magicItem({ id: 'gloves_of_swimming_and_climbing', name: '运动健将手套', englishName: 'Gloves of Swimming and Climbing', itemLine: '奇物，非普通（需同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: true, effect: '着装时，攀爬和游泳不会消耗额外移动力。进行攀爬与游泳相关的力量（运动）检定时获得+5加值。' }),
  magicItem({ id: 'gloves_of_thievery', name: '窃贼手套', englishName: 'Gloves of Thievery', itemLine: '奇物，非普通', parsedType: 'gear', rarity: 'Uncommon', effect: '着装到手上时隐形。着装时，敏捷（巧手）检定以及为开锁进行的敏捷检定获得+5加值。' }),
  magicItem({ id: 'goggles_of_night', name: '夜视镜', englishName: 'Goggles of Night', itemLine: '奇物，非普通', parsedType: 'gear', rarity: 'Uncommon', effect: '着装这副暗色护目镜时，获得60尺黑暗视觉；若已有黑暗视觉，则范围再扩大60尺。' }),
  magicItem({ id: 'hat_of_disguise', name: '易容帽', englishName: 'Hat of Disguise', itemLine: '奇物，非普通（需同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: true, activation: '1 Action', effect: '着装时，可用动作随意施展易容术，效应持续至帽子被摘下。' }),
  magicItem({ id: 'headband_of_intellect', name: '智力头带', englishName: 'Headband of Intellect', itemLine: '奇物，非普通（需同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: true, effect: '着装时智力值变为19。如果未着装时智力已经大于或等于19，则头带无效。' }),
  magicItem({ id: 'helm_of_comprehending_languages', name: '通晓语言头盔', englishName: 'Helm of Comprehending Languages', itemLine: '奇物，非普通', parsedType: 'gear', rarity: 'Uncommon', activation: '1 Action', effect: '着装时，可用动作随意施展通晓语言。' }),
  magicItem({ id: 'helm_of_telepathy', name: '心灵感应头盔', englishName: 'Helm of Telepathy', itemLine: '奇物，非普通（需同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: true, activation: '1 Action / Bonus Action', effect: '着装时可用动作施展侦测思想（豁免DC13）。保持专注期间，可用附赠动作向聚焦生物发送心灵通信，目标也可用附赠动作回复。聚焦期间还可用动作对该生物施展暗示术（豁免DC13），此功能直到次日黎明前无法再次启动。' }),
  magicItem({ id: 'immovable_rod', name: '不动权杖', englishName: 'Immovable Rod', itemLine: '权杖，非普通', parsedType: 'gear', rarity: 'Uncommon', activation: '1 Action', effect: '铁制权杖一端有按钮。用动作按下按钮后固定在原地，即使违反重力，直到再次用动作按下按钮。最多负载8000磅，超过则效应关闭并掉落。生物可用动作进行DC30力量检定，成功则移动权杖至多10尺。' }),
  magicItem({ id: 'javelin_of_lightning', name: '闪电标枪', englishName: 'Javelin of Lightning', itemLine: '武器（标枪），非普通', parsedType: 'weapon', rarity: 'Uncommon', activation: 'Command Word on throw', effect: '这把标枪是魔法武器。投掷并说出命令语时，变为5尺宽闪电束向120尺内目标飞去。直线上除你和目标外的生物须DC13敏捷豁免，失败受4d6闪电伤害，成功减半。到达目标后变回标枪并发动远程攻击，命中时造成标枪伤害外加4d6闪电伤害。此属性直到次日黎明前无法再次启动。', auditIssues: ['原文英文写作“Javelin of Lighting”，根据中文“闪电标枪”和规则效果规范化为“Javelin of Lightning”。'] }),
  magicItem({ id: 'keoghtoms_ointment', name: '卡夫统灵药', englishName: "Keoghtom's Ointment", itemLine: '奇物，非普通', parsedType: 'consumable', rarity: 'Uncommon', weight: 0.5, activation: '1 Action', effect: '直径3寸玻璃瓶中有1d4+1剂隐约有芦荟气味的混合剂。用动作吞下或外敷一剂，为生物恢复2d8+2生命值，并解除毒素和治愈任何疾病。' }),
  magicItem({ id: 'lantern_of_revealing', name: '显像提灯', englishName: 'Lantern of Revealing', itemLine: '奇物，非普通', parsedType: 'gear', rarity: 'Uncommon', activation: 'Use / 1 Action to lower hood', effect: '带罩提灯点燃时提供30尺明亮光照和30尺微光，1品脱油可燃烧6小时。明亮光照范围内隐形生物或物件显形。可用动作降下灯罩，使提灯仅在5尺内提供微光。' }),
  magicItem({ id: 'mariners_armor', name: '水手护甲', englishName: "Mariner's Armor", itemLine: '护甲（轻型，中型或重型），非普通', parsedType: 'armor', rarity: 'Uncommon', effect: '着装时获得等同于步行速度的游泳速度。当你在水下以0生命值开始回合时，护甲使你向水面上升60尺。', appearance: '护甲表面带着鱼贝纹饰。' }),
  magicItem({ id: 'medallion_of_thoughts', name: '读心勋章', englishName: 'Medallion of Thoughts', itemLine: '奇物，非普通（需同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: true, activation: '1 Action', effect: '勋章有3发充能。着装时可用动作消耗1发充能使用侦测思想（DC13）。每天黎明恢复1d3发充能。' }),
  magicItem({ id: 'mithral_armor', name: '秘银甲', englishName: 'Mithral Armor', itemLine: '护甲（中型或重型，非兽皮甲），非普通', parsedType: 'armor', rarity: 'Uncommon', effect: '秘银链甲衫或胸甲可以穿在普通衣物下面。一些护甲会使敏捷（隐匿）检定具有劣势或有力量要求，但秘银版本没有这些特性。' }),
  magicItem({ id: 'necklace_of_adaptation', name: '适应项链', englishName: 'Necklace of Adaptation', itemLine: '奇物，非普通（需同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: true, effect: '着装时可在任何环境中正常呼吸，并且对抗有害气体时进行的豁免具有优势。' }),
  magicItem({ id: 'oil_of_slipperiness', name: '滑溜之油', englishName: 'Oil of Slipperiness', itemLine: '魔药，非普通', parsedType: 'consumable', rarity: 'Uncommon', activation: '10 minutes or 1 Action', duration: '8小时', effect: '可用10分钟涂抹于一个中型或更小生物及其着装携带装备上，体型每大一级需多一瓶。受影响生物获得行动自如效应，持续8小时。也可用动作泼在10平方尺地面上，如油腻术并持续8小时。', appearance: '粘稠黑色油膏装在容器中显得浓重，倒出时迅速流动。' }),
  magicItem({ id: 'pearl_of_power', name: '法力再生珍珠', englishName: 'Pearl of Power', itemLine: '奇物，非普通（需施法者同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: 'spellcaster', activation: '1 Action', effect: '珍珠在你身上时，可用动作说出命令语恢复一个已消耗法术位。若已消耗法术位为4环或更高，则恢复为3环。使用后直到次日黎明前无法再次启动。' }),
  magicItem({ id: 'periapt_of_health', name: '保健护符', englishName: 'Periapt of Health', itemLine: '奇物，非普通', parsedType: 'gear', rarity: 'Uncommon', effect: '着装时免疫所有疾病。若此前已感染疾病，疾病效应在着装期间被压制。' }),
  magicItem({ id: 'periapt_of_wound_closure', name: '愈合护符', englishName: 'Periapt of Wound Closure', itemLine: '奇物，非普通（需同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: true, effect: '着装时，如果你在自己回合开始时处于濒死状态，直接转为伤势稳定。此外，掷生命骰恢复生命值时恢复数值加倍。' }),
  magicItem({ id: 'philter_of_love', name: '迷情媚药', englishName: 'Philter of Love', itemLine: '魔药，非普通', parsedType: 'consumable', rarity: 'Uncommon', activation: 'Drink', duration: '1小时', effect: '饮用后10分钟内，你被你看见的第一名生物魅惑。魅惑持续1小时。若该生物物种和性别符合你的取向，被魅惑期间你将其视为真爱。', appearance: '漂浮着气泡的玫瑰色液体中有一个心形气泡，不仔细观察很难发现。' }),
  magicItem({ id: 'pipes_of_haunting', name: '颤栗乐笙', englishName: 'Pipes of Haunting', itemLine: '奇物，非普通', parsedType: 'gear', rarity: 'Uncommon', activation: '1 Action', effect: '必须拥有乐器熟练项才能使用。有3发充能。用动作吹奏并消耗1发，周围30尺内每名生物须DC15感知豁免，否则对你恐慌1分钟。可让范围内对你无敌意者自动成功。失败者每回合结束可重试；成功者24小时内免疫。每天黎明恢复1d3发充能。' }),
  magicItem({ id: 'pipes_of_the_sewers', name: '唤鼠乐笙', englishName: 'Pipes of the Sewers', itemLine: '奇物，非普通（需同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: true, activation: '1 Action / Bonus Action', effect: '必须拥有乐器熟练项才能使用。同调时普通老鼠和巨鼠对你态度冷漠。有3发充能。可吹奏后用附赠动作消耗1到3发充能，每发召唤1个鼠群（若半里内有足够老鼠）。每天黎明恢复1d3发。也可用吹奏与30尺内未受控制鼠群进行魅力对抗感知，胜利则在持续吹奏期间控制鼠群。' }),
  magicItem({ id: 'potion_of_animal_friendship', name: '化兽为友药水', englishName: 'Potion of Animal Friendship', itemLine: '魔药，非普通', parsedType: 'consumable', rarity: 'Uncommon', activation: 'Drink', duration: '1小时', effect: '饮用后1小时内，可以任意施展化兽为友（DC13）。', appearance: '搅动浑浊液体可看到残渣：鱼鳞、蜂鸟舌头、猫爪或松鼠毛。' }),
  magicItem({ id: 'potion_of_fire_breath', name: '火焰吐息药水', englishName: 'Potion of Fire Breath', itemLine: '魔药，非普通', parsedType: 'consumable', rarity: 'Uncommon', activation: 'Drink / Bonus Action', duration: '三次喷吐或1小时', effect: '饮用后，可用附赠动作向30尺内一个目标喷火。目标DC13敏捷豁免，失败受4d6火焰伤害，成功减半。效应在喷出三次火焰或1小时后终止。', appearance: '橙色药水不停闪烁，瓶中无药水部分充满烟雾，打开容器时烟雾飘出。' }),
  magicItem({ id: 'potion_of_growth', name: '成长药水', englishName: 'Potion of Growth', itemLine: '魔药，非普通', parsedType: 'consumable', rarity: 'Uncommon', activation: 'Drink', duration: '1d4小时', effect: '饮用后获得变巨/缩小术的“变巨”效应，持续1d4小时且无需专注。', appearance: '药水中红色成分不断从小球散开染红周围液体，然后又聚合；摇晃也不会打断。' }),
  magicItem({ id: 'potion_of_poison', name: '剧毒药水', englishName: 'Potion of Poison', itemLine: '魔药，非普通', parsedType: 'consumable', rarity: 'Uncommon', activation: 'Drink', effect: '看起来、闻起来和尝起来像治疗药水或其他增益药水，实际是幻术伪装的毒药；鉴定术可发现本质。饮用后受3d6毒素伤害并须DC13体质豁免，否则中毒。中毒期间每回合开始受3d6毒素伤害，每回合结束可重试；成功后之后每回合毒素伤害减少1d6，降至0时终止。' }),
  magicItem({ id: 'potion_of_resistance', name: '抗性药水', englishName: 'Potion of Resistance', itemLine: '魔药，非普通', parsedType: 'consumable', rarity: 'Uncommon', activation: 'Drink', duration: '1小时', effect: '饮用时获得对某种伤害类型的抗性，持续1小时。DM可选择或按表随机。', tables: { damageTypes: ['强酸', '冷冻', '火焰', '力场', '闪电', '黯蚀', '毒素', '心灵', '光耀', '雷鸣'] } }),
  magicItem({ id: 'potion_of_water_breathing', name: '水下呼吸药水', englishName: 'Potion of Water Breathing', itemLine: '魔药，非普通', parsedType: 'consumable', rarity: 'Uncommon', activation: 'Drink', duration: '1小时', effect: '饮用后可以在水下呼吸，持续1小时。', appearance: '浑浊的绿色药水闻起来有海水味，其中漂浮着一个水母形状的气泡。' }),
  magicItem({ id: 'quiver_of_ehlonna', name: '艾罗娜的箭袋', englishName: 'Quiver of Ehlonna', itemLine: '奇物，非普通', parsedType: 'container', rarity: 'Uncommon', weight: 2, effect: '箭袋有三个连接异次元空间的口袋，无论存放多少东西重量不超过2磅。最小口袋容纳60支箭、弩矢或类似物；中等口袋容纳18支标枪或类似物；最大口袋容纳六件长条物件，如弓、法杖、矛等。可像普通箭袋或剑鞘一样取物。' }),
  magicItem({ id: 'ring_of_jumping', name: '跳跃戒指', englishName: 'Ring of Jumping', itemLine: '戒指，非普通（需同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: true, activation: 'Bonus Action', effect: '着装时，可随意以附赠动作施展跳跃术，但只能以自身为目标。' }),
  magicItem({ id: 'ring_of_mind_shielding', name: '心灵护盾戒指', englishName: 'Ring of Mind Shielding', itemLine: '戒指，非普通（需同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: true, activation: '1 Action', effect: '着装时免疫其他生物对你使用的读心、测谎、侦测阵营、侦测生物类型；只有你同意时其他生物才能与你建立心灵感应。可用动作令戒指隐形或显形。若你死亡时戴着戒指，灵魂可注入戒指并通过心灵感应和着装者交流。' }),
  magicItem({ id: 'ring_of_swimming', name: '善泳戒指', englishName: 'Ring of Swimming', itemLine: '戒指，非普通', parsedType: 'gear', rarity: 'Uncommon', effect: '着装时获得40尺游泳速度。' }),
  magicItem({ id: 'ring_of_warmth', name: '温暖戒指', englishName: 'Ring of Warmth', itemLine: '戒指，非普通（需同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: true, effect: '着装时对冷冻伤害具有抗性。你自身及着装或携带物件都不受最低-50华氏度低温影响。' }),
  magicItem({ id: 'ring_of_water_walking', name: '水行戒指', englishName: 'Ring of Water Walking', itemLine: '戒指，非普通', parsedType: 'gear', rarity: 'Uncommon', effect: '着装时，可以在液体表面站立和行走，如同在坚实地面上一般。' }),
  magicItem({ id: 'robe_of_useful_items', name: '杂货法袍', englishName: 'Robe of Useful Items', itemLine: '奇物，非普通', parsedType: 'gear', rarity: 'Uncommon', activation: '1 Action', effect: '长袍上有各种补丁。穿着时可用动作撕下一块补丁，令其变成象征物件；所有补丁撕下后变为普通衣物。固定补丁各2个：匕首、点燃且装满燃料的牛眼提灯、钢镜、10尺长杆、50尺麻绳、麻布袋。另有4d4个其他补丁，由DM选择或随机决定。', tables: { patches: [['01-08', '装有100金币的钱袋'], ['09-15', '价值500金币的银柜'], ['16-22', '至多10尺长宽且一面有门闩的铁门'], ['23-30', '10枚各价值100金币的宝石'], ['31-44', '24尺长木梯'], ['45-51', '乘用马及鞍囊'], ['52-59', '每边10尺的立方陷坑'], ['60-68', '4瓶治疗药水'], ['69-75', '12尺长划艇'], ['76-83', '写有1个1环到3环法术的法术卷轴'], ['84-90', '2只獒犬'], ['91-96', '2尺x4尺、最多2尺深的窗户'], ['97-00', '便携式攻城锤']] } }),
  magicItem({ id: 'rope_of_climbing', name: '攀爬绳', englishName: 'Rope of Climbing', itemLine: '奇物，非普通', parsedType: 'gear', rarity: 'Uncommon', weight: 3, activation: '1 Action / Bonus Action', effect: '60尺丝质绳索，重3磅，可承受3000磅。握住一端并用动作说出命令语可活化；可用附赠动作命令另一端移动、绑住、松绑、打结、解结或卷起。打结后每隔1尺一个大结，长度缩短为50尺，但用其攀爬具有优势。绳索AC20、20生命值，至少剩1点时每5分钟恢复1点；降至0则摧毁。' }),
  magicItem({ id: 'saddle_of_the_cavalier', name: '铁骑马鞍', englishName: 'Saddle of the Cavalier', itemLine: '奇物，非普通', parsedType: 'gear', rarity: 'Uncommon', effect: '骑乘配有该马鞍的坐骑时，只要你保持清醒，就不会在非自愿情况下解除骑乘状态。所有对你坐骑发动的攻击检定具有劣势。' }),
  magicItem({ id: 'sending_stones', name: '传讯石', englishName: 'Sending Stones', itemLine: '奇物，非普通', parsedType: 'gear', rarity: 'Uncommon', activation: '1 Action', effect: '两块雕刻相配的光滑石头。碰触一块时，可用动作施展短讯术，目标为另一块石头的携带者。若另一块未被携带，会得知该信息且短讯术不被浪费。使用后直到次日黎明前无法再次启动。一块被摧毁时，另一块失去魔法。' }),
  magicItem({ id: 'sentinel_shield', name: '警戒之盾', englishName: 'Sentinel Shield', itemLine: '护甲（盾牌），非普通', parsedType: 'armor', rarity: 'Uncommon', effect: '持握此盾牌时，你的先攻检定和感知（察觉）检定具有优势。', appearance: '盾牌上绘制一个眼睛图案。' }),
  magicItem({ id: 'slippers_of_spider_climbing', name: '蛛行便鞋', englishName: 'Slippers of Spider Climbing', itemLine: '奇物，非普通（需同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: true, effect: '着装时可在垂直平面移动，也可松开双手倒挂天花板。获得等于步行速度的攀爬速度。但不能在滑溜平面如冰或油覆盖平面上行走。' }),
  magicItem({ id: 'staff_of_the_adder', name: '蝰蛇法杖', englishName: 'Staff of the Adder', itemLine: '法杖，非普通（需牧师、德鲁伊或邪术师同调）', parsedType: 'weapon', rarity: 'Uncommon', attunement: 'cleric, druid, or warlock', activation: 'Bonus Action', duration: '1分钟', effect: '可用附赠动作说出命令语，使法杖头部活化为毒蛇1分钟；可用另一个附赠动作还原。蛇头攻击视为你熟练，近战触及5尺；命中造成1d6穿刺伤害，目标DC15体质豁免失败再受3d6毒素伤害。活化蛇头可被攻击，AC15、20生命值；降至0时法杖摧毁，未摧毁时恢复非活化状态会恢复所有失去生命值。' }),
  magicItem({ id: 'staff_of_the_python', name: '巨蟒法杖', englishName: 'Staff of the Python', itemLine: '法杖，非普通（需牧师、德鲁伊或邪术师同调）', parsedType: 'weapon', rarity: 'Uncommon', attunement: 'cleric, druid, or warlock', activation: '1 Action / Bonus Action', effect: '用动作说出命令语并扔到10尺内地面，法杖变为巨蟒并听从指挥，以自身先攻行动。你可在60尺内且未失能时精神命令它。用附赠动作再次说命令语可变回法杖。巨蟒生命值降至0时死亡，法杖也摧毁；若未降至0，恢复法杖形态时恢复所有失去生命值。' }),
  magicItem({ id: 'stone_of_good_luck', name: '幸运石', englishName: 'Stone of Good Luck (Luckstone)', itemLine: '奇物，非普通（需同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: true, effect: '把这块光亮的玛瑙带在身上时，你在属性检定和豁免获得+1加值。' }),
  magicItem({ id: 'sword_of_vengeance', name: '复仇之剑', englishName: 'Sword of Vengeance', itemLine: '武器（任意剑），非普通（需同调）', parsedType: 'weapon', rarity: 'Uncommon', attunement: true, effect: '用该魔法武器发动攻击检定和伤害掷骰时获得+1加值。诅咒：同调者总是带着剑，不愿分开；同调期间用其他武器攻击检定和伤害掷骰具有劣势。持握该剑时，战斗中受伤必须DC15感知豁免，失败则必须持续攻击伤害你的生物，直到生命值降至0或无法进入近战攻击距离。可用常见方式解除诅咒，或用放逐术驱逐复仇精魂，使其变为普通+1武器。' }),
  magicItem({ id: 'trident_of_fish_command', name: '唤鱼三叉戟', englishName: 'Trident of Fish Command', itemLine: '武器（三叉戟），非普通（需同调）', parsedType: 'weapon', rarity: 'Uncommon', attunement: true, activation: '1 Action', effect: '该三叉戟是魔法武器，有3发充能。持握时可用动作消耗1发充能，对一只有天生游泳速度的野兽施展支配野兽（DC15）。每天黎明恢复1d3发已消耗充能。' }),
  magicItem({ id: 'wand_of_magic_detection', name: '搜魔魔杖', englishName: 'Wand of Magic Detection', itemLine: '魔杖，非普通', parsedType: 'gear', rarity: 'Uncommon', activation: '1 Action', effect: '有3发充能，每天黎明恢复1d3发。持握时可用动作消耗1发充能施展侦测魔法。' }),
  magicItem({ id: 'wand_of_magic_missiles', name: '魔法飞弹魔杖', englishName: 'Wand of Magic Missiles', itemLine: '魔杖，非普通', parsedType: 'gear', rarity: 'Uncommon', activation: '1 Action', effect: '有7发充能，每天黎明恢复1d6+1发。充能耗尽时骰d20，若为1则化为灰烬。持握时可用动作消耗1发或更多充能施展魔法飞弹；1环消耗1发，每多1发法术环数提高一阶。' }),
  magicItem({ id: 'wand_of_secrets', name: '探秘魔杖', englishName: 'Wand of Secrets', itemLine: '魔杖，非普通', parsedType: 'gear', rarity: 'Uncommon', activation: '1 Action', effect: '有3发充能，每天黎明恢复1d3发。持握时可用动作消耗1发充能，侦测周围30尺内密门或陷阱；若范围内有，魔杖跳动并指向最近者。' }),
  magicItem({ id: 'wand_of_web', name: '蛛网魔杖', englishName: 'Wand of Web', itemLine: '魔杖，非普通（需施法者同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: 'spellcaster', activation: '1 Action', effect: '有7发充能，每天黎明恢复1d6+1发。充能耗尽时骰d20，若为1则化为灰烬。持握时可用动作消耗1发充能施展蛛网术（豁免DC15）。' }),
  magicItem({ id: 'weapon_of_warning', name: '警戒武器', englishName: 'Weapon of Warning', itemLine: '武器（任意），非普通（需同调）', parsedType: 'weapon', rarity: 'Uncommon', attunement: true, effect: '持有此魔法武器时，先攻检定具有优势。除非因非魔法睡眠以外原因陷入失能，否则你和周围30尺内同伴不会被突袭。战斗开始时若你或范围内同伴处于自然睡眠，该武器也会将其唤醒。' }),
  magicItem({ id: 'wind_fan', name: '造风之扇', englishName: 'Wind Fan', itemLine: '奇物，非普通', parsedType: 'gear', rarity: 'Uncommon', activation: '1 Action', effect: '持握时可用动作施展造风术（豁免DC13）。使用后，在次日黎明前每次再次启动都会累加20%的失败概率；失败时扇子被撕裂成无魔法废纸。' }),
  magicItem({ id: 'winged_boots', name: '飞翼之靴', englishName: 'Winged Boots', itemLine: '奇物，非普通（需同调）', parsedType: 'gear', rarity: 'Uncommon', attunement: true, duration: '最多4小时飞行时间', effect: '着装时获得等同于步行速度的飞行速度。可连续或间断飞行4小时，以分钟计。飞行期间耗尽时间则每轮下落30尺直到着陆。停止使用12小时会恢复2小时使用时间。' }),
  magicItem({ id: 'amulet_of_the_planes', name: '位面护符', englishName: 'Amulet of the Planes', itemLine: '奇物，极珍稀（需同调）', parsedType: 'gear', rarity: 'Very Rare', attunement: true, activation: '1 Action', effect: '着装时可用动作点名一处熟悉的另一存在位面地点，然后进行DC15智力检定。成功则施展异界传送；失败则你和15尺内每个生物与物件一起传送到随机地点。d100为1-60时传送到点名位面的随机地点，61-100时随机传送到一个存在位面。' }),
  magicItem({ id: 'animated_shield', name: '活化盾', englishName: 'Animated Shield', itemLine: '护甲（盾牌），极珍稀（需同调）', parsedType: 'armor', rarity: 'Very Rare', attunement: true, activation: 'Bonus Action command word', duration: '1分钟', effect: '持握盾牌时可用附赠动作说出命令语使其活化。盾牌飞起悬浮在你空间中保护你，如同你正持用它，同时解放双手。持续1分钟，或直到你失能、死亡或用附赠动作终止；若你有空手则落回手中，否则掉地。' }),
  magicItem({ id: 'arrow_of_slaying', name: '屠杀箭', englishName: 'Arrow of Slaying', itemLine: '武器（箭），极珍稀', parsedType: 'weapon', rarity: 'Very Rare', effect: '专门用于杀死某类生物的魔法弹药。关联生物受到箭伤害时，必须DC17体质豁免，失败额外受6d10穿刺伤害，成功减半。造成额外伤害后立即变成非魔法箭。也存在弩矢等类似弹药。' }),
  magicItem({ id: 'bag_of_devouring', name: '吞噬袋', englishName: 'Bag of Devouring', itemLine: '奇物，极珍稀', parsedType: 'container', rarity: 'Very Rare', effect: '表面像次元袋，实为巨大异次元生物的进食口。完整放入的动物或植物被吞噬并永久消失；活物部分伸入时有50%概率被拖入。袋中生物可用动作DC15力量检定逃脱，外部生物可用动作DC20力量检定拉出。袋中开始回合的生物被吞噬并摧毁躯体。无生命物件可存放至多1立方尺，且每日一次吐到DM决定的另一位面。被戳破或撕裂时摧毁，内容物传送至星界随机地点。' }),
  magicItem({ id: 'candle_of_invocation', name: '祈神蜡烛', englishName: 'Candle of Invocation', itemLine: '奇物，极珍稀（需同调）', parsedType: 'consumable', rarity: 'Very Rare', attunement: true, activation: '1 Action', duration: '最多4小时', effect: '每支蜡烛为一位神祇定制并具有相同阵营。点燃后魔力激活，可燃烧共4小时，按分钟扣除。燃烧时发出30尺微光；范围内阵营相同生物的攻击、豁免、属性检定具有优势；阵营相同的牧师和德鲁伊施展1环法术无需消耗法术位。开始点燃时也可对其施展异界之门并立即摧毁蜡烛。', tables: { alignment: [['1-2', '混乱邪恶'], ['3-4', '混乱中立'], ['5-7', '混乱善良'], ['8-9', '中立邪恶'], ['10-11', '绝对中立'], ['12-13', '中立善良'], ['14-15', '守序邪恶'], ['16-17', '守序中立'], ['18-20', '守序善良']] } }),
  magicItem({ id: 'carpet_of_flying', name: '飞毯', englishName: 'Carpet of Flying', itemLine: '奇物，极珍稀', parsedType: 'gear', rarity: 'Very Rare', activation: '1 Action command word', effect: '用动作说出命令语可令飞毯起飞或悬停。只要你在30尺内，它按口令移动。载重上限为表中数值两倍，超过正常载重时飞行速度减半。', tables: { sizes: [['01-20', '3尺x5尺', '200磅', '80尺'], ['21-55', '4尺x6尺', '400磅', '60尺'], ['56-80', '5尺x7尺', '600磅', '40尺'], ['81-100', '6尺x9尺', '800磅', '30尺']] } }),
  magicItem({ id: 'cloak_of_arachnida', name: '节肢斗篷', englishName: 'Cloak of Arachnida', itemLine: '奇物，极珍稀（需同调）', parsedType: 'gear', rarity: 'Very Rare', attunement: true, activation: '1 Action', effect: '着装后获得毒素伤害抗性、等同步行速度的攀爬速度、可在垂直平面和天花板移动，不会被蛛网困住且将蛛网视为困难地形。可用动作施展蛛网术（DC13），覆盖范围为普通蛛网术两倍，直到次日黎明前无法再次使用。', appearance: '黑色丝绸服饰，上有银色丝线网状花纹。' }),
  magicItem({ id: 'dancing_sword', name: '舞空剑', englishName: 'Dancing Sword', itemLine: '武器（任意剑），极珍稀（需同调）', parsedType: 'weapon', rarity: 'Very Rare', attunement: true, activation: 'Bonus Action', effect: '可用附赠动作将魔法剑抛到空中并说出命令语。剑悬浮、飞行至多30尺并攻击5尺内生物，使用你的攻击检定和属性调整值。悬浮时可用附赠动作令其在30尺范围内飞行至多30尺并攻击。攻击四次后会飞回手中；无空手则落在脚边。路径阻塞、被抓住或你离开超过30尺时停止悬浮。' }),
  magicItem({ id: 'demon_armor', name: '恶魔护甲', englishName: 'Demon Armor', itemLine: '护甲（板甲），极珍稀（需同调）', parsedType: 'armor', rarity: 'Very Rare', attunement: true, effect: '着装后AC获得+2加值，并能理解和说深渊语。利爪铁护手使徒手打击视为魔法武器并造成挥砍伤害，相关攻击和伤害掷骰+1。诅咒：除非移除诅咒或类似魔法，否则无法卸下；对恶魔的攻击检定，以及对抗恶魔法术和特殊能力的豁免具有劣势。' }),
  magicItem({ id: 'dragon_scale_mail', name: '龙鳞甲', englishName: 'Dragon Scale Mail', itemLine: '护甲（鳞甲），极珍稀（需同调）', parsedType: 'armor', rarity: 'Very Rare', attunement: true, activation: '1 Action', effect: '以某种龙鳞制成。着装时AC+1，对抗骇人威仪和龙吐息武器的豁免具有优势，并根据龙鳞种类获得一种伤害抗性。还可用动作感知30里内同位面、与鳞片提供者类型相同且最近的龙类方向与距离；直到次日黎明前无法再次使用。', tables: { dragonResistance: [['黑龙', '强酸'], ['蓝龙', '闪电'], ['黄铜龙', '火焰'], ['青铜龙', '闪电'], ['赤铜龙', '强酸'], ['金龙', '火焰'], ['绿龙', '毒素'], ['红龙', '火焰'], ['银龙', '冷冻'], ['白龙', '冷冻']] } }),
  magicItem({ id: 'dwarven_plate', name: '矮人板甲', englishName: 'Dwarven Plate', itemLine: '护甲（板甲），极珍稀', parsedType: 'armor', rarity: 'Very Rare', activation: 'Reaction', effect: '着装时AC获得+2加值。当某效应将要违背你意愿使你在地面上移动时，可用反应减少被移动距离至多10尺。' }),
  magicItem({ id: 'dwarven_thrower', name: '矮人飞锤', englishName: 'Dwarven Thrower', itemLine: '武器（战锤），极珍稀（需矮人同调）', parsedType: 'weapon', rarity: 'Very Rare', attunement: 'dwarf', effect: '用该魔法武器攻击和伤害掷骰+3。具有投掷属性，射程20/60。远程攻击命中时额外造成1d8伤害，若目标为巨人则额外伤害为2d8。攻击后立即飞回手中。' }),
  magicItem({ id: 'efreeti_bottle', name: '火巨灵囚瓶', englishName: 'Efreeti Bottle', itemLine: '奇物，极珍稀', parsedType: 'gear', rarity: 'Very Rare', weight: 1, activation: '1 Action', effect: '彩绘黄铜瓶重1磅。用动作拔塞后浓烟溢出，回合结束时烟雾与无害火焰消失，一名火巨灵出现在30尺内未占据空间。首次打开时DM掷骰决定效应。', tables: { firstOpening: [['01-10', '火巨灵攻击你，5轮后消失，瓶子失去魔力'], ['11-90', '火巨灵服务1小时后回瓶，24小时内不能再次开；前三次同效应，第四次逃走并失去魔力'], ['91-00', '火巨灵可施展三次祈愿术，1小时后或第三次后消失，瓶子失去魔力']] } }),
  magicItem({ id: 'frost_brand', name: '霜铭', englishName: 'Frost Brand', itemLine: '武器（任意剑），极珍稀（需同调）', parsedType: 'weapon', rarity: 'Very Rare', attunement: true, effect: '用此魔法剑命中时，目标额外受1d6冷冻伤害。握持时对火焰伤害具有抗性。严寒环境中剑刃发光，提供10尺明亮和10尺微光。拔出时可选择熄灭30尺内所有非魔法火焰，每小时一次。' }),
  magicItem({ id: 'helm_of_brilliance', name: '光辉头盔', englishName: 'Helm of Brilliance', itemLine: '奇物，极珍稀（需同调）', parsedType: 'gear', rarity: 'Very Rare', attunement: true, activation: '1 Action', effect: '头盔镶有1d10钻石、2d10红宝石、3d10火蛋白石和4d10蛋白石。摘下宝石会化为尘埃；宝石全失后头盔失去魔力。可用动作消耗相应宝石施展昼明术、火球术、虹光喷射或火墙术（DC18）。有钻石时30尺内有不死生物会发出30尺微光，范围内不死生物回合开始受1d6光耀伤害。有红宝石时火焰抗性。有火蛋白石时可令武器燃焰，命中额外1d6火焰。若因火焰法术豁免失败受伤，d20为1时宝石迸射，60尺内生物DC17敏捷豁免失败受等同剩余宝石数的光耀伤害，随后头盔和宝石摧毁。', tables: { gems: [['蛋白石', '昼明术'], ['火蛋白石', '火球术'], ['钻石', '虹光喷射'], ['红宝石', '火墙术']] } }),
  magicItem({ id: 'horseshoes_of_a_zephyr', name: '西风马蹄铁', englishName: 'Horseshoes of a Zephyr', itemLine: '奇物，极珍稀', parsedType: 'gear', rarity: 'Very Rare', effect: '四个为一套。马或类似生物同时着装四个时，悬浮在离地4尺高度并如平地移动，可穿过或站在非固体或不稳定平面上，如水或岩浆。无视困难地形且不留足迹，也能以正常速度连续移动12小时而不会因强行军疲乏。', auditIssues: ['原文出现“dorced march”，按语义规范化为“forced march/强行军”。'] }),
  magicItem({ id: 'manual_of_bodily_health', name: '强身手册', englishName: 'Manual of Bodily Health', itemLine: '奇物，极珍稀', parsedType: 'gear', rarity: 'Very Rare', duration: '48小时研读，至多6日内完成', effect: '若在6日或更少时间内花费48小时研读并实践，体质属性和体质上限均增加2。之后手册失去魔力，直到一个世纪后恢复。' }),
  magicItem({ id: 'manual_of_gainful_exercise', name: '健体手册', englishName: 'Manual of Gainful Exercise', itemLine: '奇物，极珍稀', parsedType: 'gear', rarity: 'Very Rare', duration: '48小时研读，至多6日内完成', effect: '若在6日或更少时间内花费48小时研读并实践，力量属性和力量上限均增加2。之后手册失去魔力，直到一个世纪后恢复。' }),
  magicItem({ id: 'manual_of_golems', name: '魔像手册', englishName: 'Manual of Golems', itemLine: '奇物，极珍稀', parsedType: 'gear', rarity: 'Very Rare', effect: '记载制造某种魔像所需知识和符咒。只有拥有至少2个5环法术位的施法者才能解读并使用；无法解读者阅读时受6d6心灵伤害。制造需表中时间和材料费用，期间手册需在手边且不能受打扰。魔像完工后手册被魔焰吞噬，将灰烬洒在魔像上使其获得生命并服从命令。', tables: { golems: [['1-5', '粘土魔像', '30日', '65,000 gp'], ['6-17', '肉身魔像', '60日', '50,000 gp'], ['18', '钢铁魔像', '120日', '100,000 gp'], ['19-20', '石魔像', '90日', '80,000 gp']] } }),
  magicItem({ id: 'manual_of_quickness_of_action', name: '灵巧手册', englishName: 'Manual of Quickness of Action', itemLine: '奇物，极珍稀', parsedType: 'gear', rarity: 'Very Rare', duration: '48小时研读，至多6日内完成', effect: '若在6日或更少时间内花费48小时研读并实践，敏捷属性和敏捷上限均增加2。之后手册失去魔力，直到一个世纪后恢复。' }),
  magicItem({ id: 'mirror_of_life_trapping', name: '摄心镜', englishName: 'Mirror of Life Trapping', itemLine: '奇物，极珍稀', parsedType: 'gear', rarity: 'Very Rare', weight: 50, activation: '1 Action command word', effect: '镜子重50磅，AC11、10生命值、钝击易伤。挂在垂直平面时，可在5尺内用动作命令激活或关闭。激活时，除你外30尺内从镜中看到自己的生物须DC15魅力豁免，失败则与装备一起被困入十二个异次元空间之一；了解本质者豁免优势，构装自动成功。空间中被囚者不老化且无需饮食睡眠。镜满时新囚犯会随机释放旧囚犯。打碎镜子释放所有囚犯。你可用动作说出姓名或空间编号交流，或用另一命令语释放囚犯。' }),
  magicItem({ id: 'nine_lives_stealer', name: '九转夺命剑', englishName: 'Nine Lives Stealer', itemLine: '武器（任意剑），极珍稀（需同调）', parsedType: 'weapon', rarity: 'Very Rare', attunement: true, effect: '攻击和伤害掷骰+2。有1d8+1发充能。用此剑对生命值不足100的生物造成重击时，目标须DC15体质豁免，否则立即因生命力被吸干而死；不死和构装免疫。若因此杀死生物，消耗1发充能。充能用尽后失去该属性。' }),
  magicItem({ id: 'nolzurs_marvelous_pigments', name: '诺泽尔的惊奇颜料', englishName: "Nolzur's Marvelous Pigments", itemLine: '奇物，极珍稀', parsedType: 'consumable', rarity: 'Very Rare', weight: 1, effect: '通常1d4罐和画笔装在精美木盒中，共重1磅。可把二维平面上画出的东西变为三维实体。每罐可涂满1000平方尺，创造至多10000立方尺的无生命物件或地形；每100平方尺需10分钟。不能创造价值超过25 gp的东西，尝试时只会产生看似真实但由廉价材料构成的物件。画出能量时会在完成瞬间消散且不造成伤害。' }),
  magicItem({ id: 'oathbow', name: '誓仇弓', englishName: 'Oathbow', itemLine: '武器（长弓），极珍稀（需同调）', parsedType: 'weapon', rarity: 'Very Rare', attunement: true, effect: '弯弓搭箭时以精灵语低语。远程攻击时可说出命令使目标成为仇敌，直到其死亡或七日后黎明。一次只能有一名仇敌，仇敌死后次日黎明后可重选。对仇敌攻击具有优势，目标不受非全身掩护收益，超出常规射程不造成劣势；命中额外3d6穿刺伤害。仇敌存活期间，用其他武器攻击具有劣势。' }),
  magicItem({ id: 'oil_of_sharpness', name: '锐锋之油', englishName: 'Oil of Sharpness', itemLine: '魔药，极珍稀', parsedType: 'consumable', rarity: 'Very Rare', activation: '1 minute', duration: '1小时', effect: '透明胶状油膏中掺有极细银色碎片。可涂抹于一把挥砍或穿刺武器，或5发造成挥砍或穿刺伤害的弹药上。操作1分钟后，受影响武器或弹药的攻击和伤害掷骰获得+3加值，持续1小时。' }),
  magicItem({ id: 'potion_of_flying', name: '飞行药水', englishName: 'Potion of Flying', itemLine: '魔药，极珍稀', parsedType: 'consumable', rarity: 'Very Rare', activation: 'Drink', duration: '1小时', effect: '饮用后获得等同于步行速度的飞行速度并可以悬浮，持续1小时。效应终止时若仍在空中且无其他飞行手段，则坠落。', appearance: '透明液体漂浮在容器顶部，其中含有些许云雾状白色杂质。' }),
  magicItem({ id: 'potion_of_invisibility', name: '隐身药水', englishName: 'Potion of Invisibility', itemLine: '魔药，极珍稀', parsedType: 'consumable', rarity: 'Very Rare', activation: 'Drink', duration: '1小时', effect: '饮用后隐形1小时，着装或携带物也一起隐形。攻击或施法会提前终止隐形。', appearance: '容器看起来是空的，但仍能感觉其中保存着液体。' }),
  magicItem({ id: 'potion_of_longevity', name: '延寿药水', englishName: 'Potion of Longevity', itemLine: '魔药，极珍稀', parsedType: 'consumable', rarity: 'Very Rare', activation: 'Drink', effect: '饮用后生理年龄减少1d6+6岁，但不能小于13岁。此后每次再次饮用都会累加10%概率令你增加而非减少1d6+6岁。', appearance: '琥珀色药水中悬浮蝎尾、蝰蛇牙、死蜘蛛和一颗反常跳动的小心脏；打开时这些成分消失。' }),
  magicItem({ id: 'potion_of_speed', name: '加速药水', englishName: 'Potion of Speed', itemLine: '魔药，极珍稀', parsedType: 'consumable', rarity: 'Very Rare', activation: 'Drink', duration: '1分钟', effect: '饮用后获得加速术效应，持续1分钟且无需专注。', appearance: '黄色药水中混杂黑色杂质，并有漩涡不断自行旋转。' }),
  magicItem({ id: 'potion_of_vitality', name: '活力药水', englishName: 'Potion of Vitality', itemLine: '魔药，极珍稀', parsedType: 'consumable', rarity: 'Very Rare', activation: 'Drink', duration: '24小时', effect: '饮用后消除所有力竭状态，并治愈影响你的任何疾病或毒素。此后24小时内，使用生命骰恢复生命值时都恢复生命骰最大值。', appearance: '深红色药水有节奏地发出微光，让人联想到心脏跳动。' }),
  magicItem({ id: 'ring_of_regeneration', name: '再生戒指', englishName: 'Ring of Regeneration', itemLine: '戒指，极珍稀（需同调）', parsedType: 'gear', rarity: 'Very Rare', attunement: true, effect: '着装时，只要尚有至少1点生命值，每10分钟恢复1d6生命值。失去肢体时，若能在1d6+1日内保持至少1点生命值，肢体会重新长出并恢复功能。' }),
  magicItem({ id: 'ring_of_shooting_stars', name: '流星戒指', englishName: 'Ring of Shooting Stars', itemLine: '戒指，极珍稀（需在夜晚的户外同调）', parsedType: 'gear', rarity: 'Very Rare', attunement: 'outdoors at night', activation: '1 Action / Bonus Action', effect: '黑暗或微光中可随意施展舞光术和光亮术。戒指有6发充能，每天黎明恢复1d6发。可消耗1发施展妖火；消耗2发创造1到4个闪电球，专注至多1分钟，可用附赠动作移动，靠近生物时释放闪电；也可消耗1到3发产生流星，每发在60尺内地点爆发，15尺范围内生物DC15敏捷豁免，失败受5d4火焰，成功减半。', tables: { ballLightning: [['4', '2d4'], ['3', '2d6'], ['2', '5d4'], ['1', '4d12']] } }),
  magicItem({ id: 'ring_of_telekinesis', name: '心灵遥控戒指', englishName: 'Ring of Telekinesis', itemLine: '戒指，极珍稀（需同调）', parsedType: 'gear', rarity: 'Very Rare', attunement: true, activation: '1 Action', effect: '着装时可以随意施展心灵遥控，但只能以未被着装或携带的物件为目标。' }),
  magicItem({ id: 'robe_of_scintillating_colors', name: '虹光法袍', englishName: 'Robe of Scintillating Colors', itemLine: '奇物，极珍稀（需同调）', parsedType: 'gear', rarity: 'Very Rare', attunement: true, activation: '1 Action', effect: '法袍有3发充能，每天黎明恢复1d3发。可用动作消耗1发令长袍显现耀眼图像直到下回合结束，提供30尺明亮和30尺微光。能看到你的生物对你攻击具有劣势；处于明亮光照内且能看到你的生物须DC15感知豁免，失败震慑直到效应终止。' }),
  magicItem({ id: 'robe_of_stars', name: '星辰法袍', englishName: 'Robe of Stars', itemLine: '奇物，极珍稀（需同调）', parsedType: 'gear', rarity: 'Very Rare', attunement: true, activation: '1 Action', effect: '着装时豁免+1。前襟有六枚较大星星，可用动作取下一枚施展5环魔法飞弹；每天黄昏1d6颗已消耗星星重新出现。也可用动作使你和携带物进入星界，直到再用动作回到原位面。' }),
  magicItem({ id: 'rod_of_absorption', name: '吸收权杖', englishName: 'Rod of Absorption', itemLine: '权杖，极珍稀（需同调）', parsedType: 'gear', rarity: 'Very Rare', attunement: true, activation: 'Reaction', effect: '持握时可用反应吸收一个仅以你为目标的法术。法术不生效，其环阶能量被权杖吸收。权杖从制成到毁灭最多储存50环能量，满后不能再吸收。与其同调时知道已吸收和当前储存能量。施法者可将储存能量转化为至高5环且不高于自身最高环的法术位来施展已准备或知晓法术。新发现权杖通常已储存1d10环。无法继续吸收且能量用尽时变为普通物品。' }),
  magicItem({ id: 'rod_of_alertness', name: '警示权杖', englishName: 'Rod of Alertness', itemLine: '权杖，极珍稀（需同调）', parsedType: 'gear', rarity: 'Very Rare', attunement: true, activation: '1 Action', effect: '持握时感知（察觉）和先攻检定具有优势。可用动作施展侦测善恶、侦测魔法、侦测毒性和疾病、识破隐形。可用动作将柄插入地面，放出60尺明亮和60尺微光，明亮区内你和友善生物AC与豁免+1，并可感知敌意隐形生物位置；持续10分钟或直到拔起，至次日黎明前无法再次启动。' }),
  magicItem({ id: 'rod_of_security', name: '庇护权杖', englishName: 'Rod of Security', itemLine: '权杖，极珍稀', parsedType: 'gear', rarity: 'Very Rare', activation: '1 Action', effect: '持握时可用动作启动，将你和至多199名可见且自愿生物传送到异位面乐园。乐园环境由你定义，有足够食物和水。每度过1小时，每名访问者如使用1枚生命骰般恢复生命值；生物不老化。停留时间为200天除以生物数量向下取整。到时或你用动作解除时返回原处或最近未占据空间。10日后才能再次启动。' }),
  magicItem({ id: 'scimitar_of_speed', name: '急速弯刀', englishName: 'Scimitar of Speed', itemLine: '武器（弯刀），极珍稀（需同调）', parsedType: 'weapon', rarity: 'Very Rare', attunement: true, activation: 'Bonus Action', effect: '用该魔法武器攻击和伤害掷骰+2。另外，你在每个自己回合里可以用附赠动作以该弯刀发动一次攻击。' }),
  magicItem({ id: 'spellguard_shield', name: '抗法盾', englishName: 'Spellguard Shield', itemLine: '护甲（盾牌），极珍稀（需同调）', parsedType: 'armor', rarity: 'Very Rare', attunement: true, effect: '持握此盾牌时，你对抗法术和其他魔法效应的豁免具有优势，而对你发动的法术攻击检定具有劣势。' }),
  magicItem({ id: 'staff_of_fire', name: '火焰法杖', englishName: 'Staff of Fire', itemLine: '法杖，极珍稀（需德鲁伊、术士、邪术师或法师同调）', parsedType: 'weapon', rarity: 'Very Rare', attunement: 'druid, sorcerer, warlock, or wizard', activation: '1 Action', effect: '持握时对火焰伤害具有抗性。有10发充能，可用动作消耗充能施展燃烧之手（1）、火球术（3）、火墙术（4），使用自身法术豁免DC。每天黎明恢复1d6+4发；充能耗尽时d20为1则化为灰烬毁灭。' }),
  magicItem({ id: 'staff_of_frost', name: '冰霜法杖', englishName: 'Staff of Frost', itemLine: '法杖，极珍稀（需德鲁伊、术士、邪术师或法师同调）', parsedType: 'weapon', rarity: 'Very Rare', attunement: 'druid, sorcerer, warlock, or wizard', activation: '1 Action', effect: '持握时对冷冻伤害具有抗性。有10发充能，可用动作消耗充能施展云雾术（1）、冰风暴（4）、冰墙术（4）、寒冰锥（5），使用自身法术豁免DC。每天黎明恢复1d6+4发；充能耗尽时d20为1则被摧毁并化为一滩水。' }),
  magicItem({ id: 'staff_of_power', name: '威力法杖', englishName: 'Staff of Power', itemLine: '法杖，极珍稀（需术士、邪术师或法师同调）', parsedType: 'weapon', rarity: 'Very Rare', attunement: 'sorcerer, warlock, or wizard', activation: '1 Action', effect: '魔法长棍，攻击和伤害+2；持握时AC、豁免和法术攻击+2。有20发充能，每天黎明恢复2d8+4发。充能耗尽时d20为1则失去除攻击/伤害+2外所有属性，20则恢复1d8+2发。近战命中可消耗1发造成额外1d6力场。可消耗充能施展魔法飞弹、衰弱射线、浮空术、寒冰锥、5环火球术、怪物定身术、5环闪电束、力场墙、法术无效结界。可用动作折断释放复仇打击，50%传送到随机位面避开爆炸，否则自身受16×剩余充能力场伤害；30尺内其他生物DC17敏捷豁免，按距离受8/6/4×剩余充能力场伤害，成功减半。', tables: { retributiveStrike: [['10尺或更近', '8×剩余充能'], ['11-20尺', '6×剩余充能'], ['21-30尺', '4×剩余充能']] } }),
  magicItem({ id: 'staff_of_striking', name: '强袭法杖', englishName: 'Staff of Striking', itemLine: '法杖，极珍稀（需同调）', parsedType: 'weapon', rarity: 'Very Rare', attunement: true, effect: '可作魔法长棍，攻击和伤害+3。有10发充能。近战攻击命中时可消耗至多3发，每发使目标额外受1d6力场伤害。每天黎明恢复1d6+4发；充能耗尽时d20为1则变为非魔法长棍。' }),
  magicItem({ id: 'staff_of_thunder_and_lightning', name: '雷霆法杖', englishName: 'Staff of Thunder and Lightning', itemLine: '法杖，极珍稀（需同调）', parsedType: 'weapon', rarity: 'Very Rare', attunement: true, activation: '1 Action or on hit', effect: '可作魔法长棍，攻击和伤害+2。属性各自使用后直到次日黎明前无法再次启动：电闪，近战命中额外2d6闪电；雷鸣，近战命中时300尺可闻雷鸣，目标DC17敏捷豁免失败震慑到你下回合结束；闪电击，用动作射出5尺宽120尺长闪电，路径生物DC17敏捷豁免失败受9d6闪电，成功减半；雷霆，用动作发出600尺可闻雷鸣，60尺内除你外生物DC17体质豁免失败受2d6雷鸣并耳聋1分钟，成功半伤不耳聋；雷电，用动作同时启动闪电击和雷霆，只消耗雷电使用次数。', auditIssues: ['原文小标题写作“Thinderclap”和“Thinder and Lightning”，根据中文“雷霆/雷电”和物品英文规范化为“Thunderclap/Thunder and Lightning”。'] }),
  magicItem({ id: 'sword_of_sharpness', name: '锐锋之剑', englishName: 'Sword of Sharpness', itemLine: '武器（任意造成挥砍伤害的剑），极珍稀（需同调）', parsedType: 'weapon', rarity: 'Very Rare', attunement: true, activation: 'Command Word', effect: '命中物件时武器伤害掷骰直接取满。攻击生物并投出20时，目标额外受14点挥砍伤害；再骰d20若仍为20，可切掉目标一条肢体，或切掉无肢体生物躯体一部分。可说出命令语使剑发光，提供10尺明亮和10尺微光，再次命令或收起可熄灭。' }),
  magicItem({ id: 'tome_of_clear_thought', name: '静思卷册', englishName: 'Tome of Clear Thought', itemLine: '奇物，极珍稀', parsedType: 'gear', rarity: 'Very Rare', duration: '48小时研读，至多6日内完成', effect: '若在至多6日内花费累计48小时研究并训练，智力和智力上限提高2。此后卷册失去魔力，直到一个世纪后恢复。' }),
  magicItem({ id: 'tome_of_leadership_and_influence', name: '统御卷册', englishName: 'Tome of Leadership and Influence', itemLine: '奇物，极珍稀', parsedType: 'gear', rarity: 'Very Rare', duration: '48小时研读，至多6日内完成', effect: '若在至多6日内花费累计48小时研究并训练，魅力和魅力上限提高2。此后卷册失去魔力，直到一个世纪后恢复。' }),
  magicItem({ id: 'tome_of_understanding', name: '通晓卷册', englishName: 'Tome of Understanding', itemLine: '奇物，极珍稀', parsedType: 'gear', rarity: 'Very Rare', duration: '48小时研读，至多6日内完成', effect: '若在至多6日内花费累计48小时研究并训练，感知和感知上限提高2。此后卷册失去魔力，直到一个世纪后恢复。' }),
  magicItem({ id: 'wand_of_polymorph', name: '变形魔杖', englishName: 'Wand of Polymorph', itemLine: '魔杖，极珍稀（需施法者同调）', parsedType: 'gear', rarity: 'Very Rare', attunement: 'spellcaster', activation: '1 Action', effect: '有7发充能，每天黎明恢复1d6+1发。充能耗尽时d20为1则化为灰烬毁灭。持握时可用动作消耗1发充能施展变形术（豁免DC15）。' })
];

DMG_MAGIC_ITEM_INTAKE.push(
  magicItem({ id: 'apparatus_of_kwalish', name: '夸力许装置', englishName: 'Apparatus of Kwalish', itemLine: '奇物，传说', parsedType: 'gear', rarity: 'Legendary', weight: 500, activation: '1 Action / levers', effect: '外观像500磅密封大铁桶，DC20智力（调查）可发现隐藏把手；扳动后打开可容纳两名中型或更小生物的舱门。装置可变成类似巨大龙虾的大型物件：AC20，HP200，速度30尺、游泳30尺（腿和尾巴未展开时为0），免疫毒素与心灵伤害。作为交通工具需驾驶员，舱门关闭时气密水密；空气可供一个生物呼吸10小时并由舱内生物平摊。可漂浮或潜至900尺，超过深度每分钟受2d6钝击伤害。舱内生物可用动作同时操作至多两个拉杆。', tables: { levers: [['1', '伸展腿和尾巴', '收起腿和尾巴，速度降为0且无法获得速度加成'], ['2', '打开前窗', '关闭前窗'], ['3', '打开侧舷窗', '关闭侧舷窗'], ['4', '伸展两只钳爪', '收起钳爪'], ['5', '每只钳爪近战武器攻击，命中+8，触及5尺，7(2d6)钝击', '每只钳爪近战武器攻击，命中+8，触及5尺，目标被擒抱，逃脱DC15'], ['6', '向前步行或游泳', '向后步行或游泳'], ['7', '左转90度', '右转90度'], ['8', '眼状部件发光，30尺明亮+30尺微光', '关闭发光部件'], ['9', '液体中下沉至多20尺', '液体中上浮至多20尺'], ['10', '解封并打开后方舱门', '关闭并密封后方舱门']] }, auditIssues: ['原文“提供30尺半径的明亮光照以其其外30尺半径”疑为“以及其外30尺半径”，按语义摘取。'] }),
  magicItem({ id: 'armor_of_invulnerability', name: '坚不可摧护甲', englishName: 'Armor of Invulnerability', itemLine: '护甲（板甲），传说（需同调）', parsedType: 'armor', rarity: 'Legendary', attunement: true, activation: '1 Action', duration: '10分钟', effect: '着装时对非魔法伤害具有抗性。可用动作使自己免疫非魔法伤害，持续10分钟或直到不再着装该护甲。使用后直到次日黎明前无法再次启动。' }),
  magicItem({ id: 'cloak_of_invisibility', name: '隐身斗篷', englishName: 'Cloak of Invisibility', itemLine: '奇物，传说（需同调）', parsedType: 'gear', rarity: 'Legendary', attunement: true, activation: '1 Action', duration: '至多2小时，按分钟扣除', effect: '拉起兜帽使自己以及着装和携带物隐形；褪下兜帽显形。褪下或拉起兜帽需要动作。效应最多持续2小时，使用满后暂时失效；停止使用12小时恢复1小时使用时间。' }),
  magicItem({ id: 'cubic_gate', name: '异界之门魔方', englishName: 'Cubic Gate', itemLine: '奇物，传说', parsedType: 'gear', rarity: 'Legendary', activation: '1 Action', effect: '3寸立方体，六面各对应一个位面，其中之一为物质位面，其余由DM决定。按一下面可施展异界之门并开启通往对应位面的传送门；连续按两次同一面可施展异界传送（豁免DC17）把目标传送到对应位面。3发充能，每次使用消耗1发，每天黎明恢复1d3发。' }),
  magicItem({ id: 'deck_of_many_things', name: '万象无常牌', englishName: 'Deck of Many Things', itemLine: '奇物，传说', parsedType: 'gear', rarity: 'Legendary', activation: 'Declare and draw cards', effect: '象牙或羊皮纸卡牌，通常75%为13张，有时为22张。抽卡前声明数量，正常抽出的卡立即生效；两张之间间隔不得超过1小时，未抽够时剩余声明卡会自行飞出并同时生效。抽出的牌会消散，除愚者或小丑外会重新出现在牌组中。包含平衡、彗星、城堡、蛇发女妖、命运三女神、火焰、愚者、宝石、白痴、小丑、钥匙、骑士、月亮、浪人、废墟、头骨、星辰、太阳、利爪、王座、大臣、虚空等效果，并附死亡化身资料与树敌说明。', tables: { cards: [['方块A', '大臣 Vizier'], ['方块K', '太阳 Sun'], ['方块Q', '月亮 Moon'], ['方块J', '星辰 Star'], ['方块2', '彗星 Comet*'], ['红心A', '命运三女神 The Fates*'], ['红心K', '王座 Throne'], ['红心Q', '钥匙 Key'], ['红心J', '骑士 Knight'], ['红心2', '宝石 Gem*'], ['梅花A', '利爪 Talons*'], ['梅花K', '虚空 The Void'], ['梅花Q', '火焰 Flames'], ['梅花J', '头骨 Skull'], ['梅花2', '白痴 Idiot*'], ['黑桃A', '城堡 Donjon*'], ['黑桃K', '废墟 Ruin'], ['黑桃Q', '蛇发女妖 Euryale'], ['黑桃J', '浪人 Rogue'], ['黑桃2', '平衡 Balance*'], ['小王', '愚者 Fool*'], ['大王', '小丑 Jester']] }, notes: '该条目包含大量卡牌子效果、死亡化身怪物资料和“关于树敌”DM说明，作为复杂传说奇物合并保留在同一条记录的 tables/effect 中。' }),
  magicItem({ id: 'defender', name: '防御者', englishName: 'Defender', itemLine: '武器（任意剑），传说（需同调）', parsedType: 'weapon', rarity: 'Legendary', attunement: true, effect: '攻击检定和伤害掷骰+3。每个自己回合第一次用此剑攻击时，可把全部或部分加值转移到AC而非用于本回合攻击；改变持续到下一回合开始，必须握持此剑才能获得AC加值。' }),
  magicItem({ id: 'efreeti_chain', name: '火巨灵链甲', englishName: 'Efreeti Chain', itemLine: '护甲（链甲），传说（需同调）', parsedType: 'armor', rarity: 'Legendary', attunement: true, effect: '着装时AC+3，免疫火焰伤害，可以说和理解原初语，并可像在坚实地面上一样行走于熔岩上。' }),
  magicItem({ id: 'hammer_of_thunderbolts', name: '雷神之锤', englishName: 'Hammer of Thunderbolts', itemLine: '武器（巨锤），传说', parsedType: 'weapon', rarity: 'Legendary', attunement: 'requires belt of giant strength and gauntlets of ogre power', activation: 'Thrown attack / charge', effect: '魔法巨锤，攻击和伤害+1。巨人杀手属性需同调，且必须同时着装巨人之力腰带和食人魔力量护手；卸下任一件则同调终止。持握并同调时力量+4，可超过20但不超过30；攻击巨人投出20时，巨人须DC17体质豁免，失败立即死亡。5发充能，同调后可消耗1发进行远程武器攻击，视为投掷射程20/60尺；命中时300尺可闻雷鸣，目标及其30尺内生物DC17体质豁免失败震慑到你下回合结束。每天黎明恢复1d4发。', auditIssues: ['原文“gauntlets of orge power”疑为“gauntlets of ogre power”，按物品名规范化。'] }),
  magicItem({ id: 'holy_avenger', name: '神圣复仇者', englishName: 'Holy Avenger', itemLine: '武器（任意剑），传说（需圣武士同调）', parsedType: 'weapon', rarity: 'Legendary', attunement: 'paladin', effect: '攻击和伤害+3。命中邪魔或不死生物时额外造成2d10光耀伤害。持握时在周围产生10尺灵光，范围内你和友方生物对抗法术和其他魔法效应的豁免具有优势；若圣武士等级17级或更高，半径增至30尺。' }),
  magicItem({ id: 'iron_flask', name: '收妖瓶', englishName: 'Iron Flask', itemLine: '奇物，传说', parsedType: 'container', rarity: 'Legendary', activation: '1 Action', effect: '带黄铜瓶塞的铁瓶。可选择60尺内可见且非当前位面生物，命令其DC17感知豁免，失败被困入瓶中；曾被此瓶囚禁过则豁免有优势。最多容纳一名生物，被困者无需呼吸饮食且不衰老。拔塞释放后，该生物1小时内对你和同伴友善并服从命令，之后按自身意愿和阵营行动。鉴定术可知瓶中有无生物，但打开瓶塞才能确定具体生物。', tables: { contents: [['01-50', '无'], ['51', '奥登罗斯魔 arcanaloth'], ['52', '魔裔 cambion'], ['53-54', '土巨灵 dao'], ['55-66', '恶魔，类型1至6'], ['67', '梵天神侍 deva'], ['68-72', '魔鬼，高等或次等'], ['73-76', '气巨灵或火巨灵'], ['77-78', '元素任意'], ['79-80', '吉斯扬基骑士或泽锡修士'], ['81-90', '隐形追猎者、水巨灵、麦泽罗斯魔、夜鬼婆、尼卡罗斯魔'], ['91-00', '异界神使、火蜥蜴、史拉蟾、炽天神使、魅魔/梦魔、乌特罗斯魔、索尔石怪']] } }),
  magicItem({ id: 'luck_blade', name: '吉兆之刃', englishName: 'Luck Blade', itemLine: '武器（任意剑），传说（需同调）', parsedType: 'weapon', rarity: 'Legendary', attunement: true, activation: 'No action / 1 Action', effect: '攻击和伤害+1；只要带着剑，豁免也+1。幸运：可无动作重骰一次攻击检定、属性检定或豁免，必须接受新结果，直到次日黎明前不能再用。许愿：有1d4-1发充能，持握时可用动作消耗1发施展祈愿术，直到次日黎明前不能再用；充能耗尽后失去此属性。' }),
  magicItem({ id: 'plate_armor_of_etherealness', name: '以太化板甲', englishName: 'Plate Armor of Etherealness', itemLine: '护甲（板甲），传说（需同调）', parsedType: 'armor', rarity: 'Legendary', attunement: true, activation: '1 Action command word', duration: '10分钟', effect: '着装时可用动作说出命令语，获得以太化效应，持续10分钟，或直到再次用动作说出命令语，或脱下护甲。使用后直到次日黎明前无法再次启动。' }),
  magicItem({ id: 'ring_of_djinni_summoning', name: '召唤气巨灵戒指', englishName: 'Ring of Djinni Summoning', itemLine: '戒指，传说（需同调）', parsedType: 'gear', rarity: 'Legendary', attunement: true, activation: '1 Action command word', duration: '专注，至多1小时', effect: '着装时可从气元素位面召唤一名特定气巨灵，出现在120尺内指定未占据空间。需专注维持，至多1小时或直到其HP降至0，然后返回位面。气巨灵对你和同伴友善并服从命令；无命令时只保护自己。遣返后需等待24小时再召唤；若气巨灵死亡，戒指变为非魔法物品。' }),
  magicItem({ id: 'ring_of_elemental_command', name: '命令元素戒指', englishName: 'Ring of Elemental Command', itemLine: '戒指，传说（需同调）', parsedType: 'gear', rarity: 'Legendary', attunement: true, activation: '1 Action / charges', effect: '戒指连接四个元素位面之一，由DM决定或随机。着装时对来自连接位面的元素攻击具有优势，元素对你的攻击具有劣势，并按位面获得气、土、火或水元素命令属性。戒指5发充能，每天黎明恢复1d4+1发；戒指施法DC17。各版本可消耗2发对对应元素施展支配怪物，并提供语言、移动或抗性等属性；若同调期间参与杀死对应元素，则解锁更强抗性/免疫、移动能力及额外法术。', tables: { variants: ['Ring of Air Elemental Command', 'Ring of Earth Elemental Command', 'Ring of Fire Elemental Command', 'Ring of Water Elemental Command'] }, auditIssues: ['原文“Ring of WaterElemental Command”缺少空格，规范化为“Ring of Water Elemental Command”。', '原文“create or destory water”疑为“create or destroy water”，按法术名语义规范化。'] }),
  magicItem({ id: 'ring_of_invisibility', name: '隐身戒指', englishName: 'Ring of Invisibility', itemLine: '戒指，传说（需同调）', parsedType: 'gear', rarity: 'Legendary', attunement: true, activation: '1 Action / Bonus Action', effect: '着装时可用动作进入隐形，着装或携带物一起隐形。隐形持续到发动攻击、施展法术或戒指被摘下；也可用附赠动作解除。' }),
  magicItem({ id: 'ring_of_spell_turning', name: '法术反转戒指', englishName: 'Ring of Spell Turning', itemLine: '戒指，传说（需同调）', parsedType: 'gear', rarity: 'Legendary', attunement: true, effect: '着装时，对任何仅以你为目标而非区域的法术进行豁免具有优势。若该法术为7环或更低且你的豁免骰出20，则法术对你无效且目标变为原施法者，使用原施法者资料决定环阶、DC、攻击加值和施法关键属性。' }),
  magicItem({ id: 'ring_of_three_wishes', name: '三愿戒指', englishName: 'Ring of Three Wishes', itemLine: '戒指，传说', parsedType: 'gear', rarity: 'Legendary', activation: '1 Action', effect: '有3发充能。着装时可用动作消耗1发施展祈愿术。充能用尽后变为非魔法物品。' }),
  magicItem({ id: 'robe_of_the_archmagi', name: '大法师法袍', englishName: 'Robe of the Archmagi', itemLine: '奇物，传说（需术士、邪术师或法师同调）', parsedType: 'gear', rarity: 'Legendary', attunement: 'sorcerer, warlock, or wizard with matching alignment', effect: '白、灰或黑色精制长袍，颜色对应善良、中立或邪恶，不能与阵营不符的法袍同调。着装时：不着装护甲时基础AC为15+敏捷调整值；对抗法术和其他魔法效果的豁免具有优势；法术豁免DC和法术攻击加值+2。' }),
  magicItem({ id: 'rod_of_lordly_might', name: '王者权杖', englishName: 'Rod of Lordly Might', itemLine: '权杖，传说（需同调）', parsedType: 'weapon', rarity: 'Legendary', attunement: true, activation: 'Bonus Action / 1 Action / on hit', effect: '顶端有尖刺，也是一把魔法硬头锤，攻击和伤害+3。六个按钮可用附赠动作启动，变为焰舌、+3战斧、+3矛、至多50尺爬杆、手持战斗攻城锤，或指示地磁北极并告知地下深度/地上高度。另有每日一次属性：近战命中时吸取生命，目标DC17体质豁免失败额外受4d6黯蚀且你恢复一半伤害；近战命中时麻痹，目标DC17力量豁免失败麻痹1分钟并每回合结束重试；用动作惊惧30尺内可见生物，DC17感知豁免失败对你恐慌1分钟并每回合结束重试。' }),
  magicItem({ id: 'rod_of_resurrection', name: '复活权杖', englishName: 'Rod of Resurrection', itemLine: '权杖，传说（需牧师、德鲁伊或圣武士同调）', parsedType: 'gear', rarity: 'Legendary', attunement: 'cleric, druid, or paladin', activation: '1 Action', effect: '5发充能。持握时可用动作施展医疗术（1充能）或复活术（5充能）。每天黎明恢复1发；充能耗尽时骰d20，若为1则在强光中消失。' }),
  magicItem({ id: 'scarab_of_protection', name: '防护圣甲虫', englishName: 'Scarab of Protection', itemLine: '奇物，传说（需同调）', parsedType: 'gear', rarity: 'Legendary', attunement: true, activation: 'Reaction', effect: '手握1轮后浮现铭文揭示魔法本质。携带时对法术豁免具有优势。圣甲虫有12发充能；若你对抗死灵系法术或不死生物造成的有害效应时豁免失败，可用反应消耗1发使豁免成功。充能耗尽后化为灰烬。' }),
  magicItem({ id: 'sovereign_glue', name: '至尊胶', englishName: 'Sovereign Glue', itemLine: '奇物，传说', parsedType: 'consumable', rarity: 'Legendary', activation: '1 minute', effect: '白浊粘稠物，可把任意两件物体永久粘合。必须储存在内壁涂满滑溜之油的瓶或罐中；新发现容器通常有1d6+1盎司。每盎司覆盖1平方尺，1分钟后凝固。凝固后只能用万溶剂、滑溜之油或祈愿术分开。' }),
  magicItem({ id: 'sphere_of_annihilation', name: '湮灭法球', englishName: 'Sphere of Annihilation', itemLine: '奇物，传说', parsedType: 'gear', rarity: 'Legendary', activation: '1 Action', effect: '2尺直径黑色球体，是多元宇宙中的空洞，由魔法场维持稳定。毁灭任何穿过它或被它穿过的物质；神器通常不受影响。接触但未完全毁灭或吞噬者受4d10力场伤害。未受控制时静止；60尺内可用动作进行DC25智力（奥秘）检定，成功则按5×智力调整值尺数移动（至少5尺），失败则向你移动10尺。进入生物空间时目标DC13敏捷豁免失败受4d10力场伤害。可与其他控制者进行智力（奥秘）对抗夺取控制。接触位面传送门或异位面空间时按d100决定摧毁、穿过/进入或产生空间裂缝传送至随机位面。', tables: { planarContact: [['01-50', '法球被摧毁'], ['51-85', '法球穿过位面传送门或进入异位面空间'], ['86-00', '空间裂缝出现，将法球和180尺内生物物件送到随机存在位面']] } }),
  magicItem({ id: 'staff_of_the_magi', name: '贤者法杖', englishName: 'Staff of the Magi', itemLine: '法杖，传说（需术士、邪术师或法师同调）', parsedType: 'weapon', rarity: 'Legendary', attunement: 'sorcerer, warlock, or wizard', activation: '1 Action / Reaction', effect: '可作魔法长棍，攻击和伤害+3；持握时法术攻击+2。50发充能，每天黎明恢复4d6+2发；充能耗尽时d20为20则恢复1d12+1发。法术吸收：对抗法术豁免有优势；当其他生物施展仅以你为目标的法术时，可用反应吸收并消除该法术，法杖获得等同环阶的充能；若超过50发则爆炸并视为复仇打击。可消耗充能施展炽焰法球、隐形术、敲击术、蛛网术、解除魔法、冰风暴、火墙术、穿墙术、心灵遥控、召唤元素生物、7环火球术、7环闪电束、异界传送；也可随意施展秘法锁、侦测魔法、变巨/缩小术、光亮术、法师之手、防护善恶。可折断释放复仇打击，规则同威力法杖。', auditIssues: ['原文“pretection from evil and good”疑为“protection from evil and good”，按法术名规范化。', '原文小标题“Restributive Strike”疑为“Retributive Strike”，按规则名规范化。'] }),
  magicItem({ id: 'sword_of_answering', name: '应答之剑', englishName: 'Sword of Answering', itemLine: '武器（长剑），传说（需阵营与剑相同的生物同调）', parsedType: 'weapon', rarity: 'Legendary', attunement: 'matching alignment', activation: 'Reaction', effect: '灰鹰世界中已知仅九把，均为最终遗言弗拉格拉克的仿制品，名字、阵营和柄端宝石各异。攻击和伤害+3。持握时可用反应对触及范围内任何对你造成伤害的生物发动一次攻击；该攻击具有优势，且伤害忽略目标任何伤害免疫或抗性。', tables: { swords: [['解答者 Answer', '混乱善良', '祖母绿'], ['还击者 Back Talker', '混乱邪恶', '黑玉'], ['定论者 Concluder', '守序中立', '紫晶'], ['讥讽者 Last Quip', '混乱中立', '电气石'], ['驳斥者 Rebutter', '中立善良', '黄玉'], ['答复者 Replier', '绝对中立', '橄榄石'], ['反驳者 Retorter', '守序善良', '蓝晶'], ['潜伏者 Scather', '守序邪恶', '石榴石'], ['毁灭者 Squelcher', '中立邪恶', '尖晶石']] } }),
  magicItem({ id: 'talisman_of_pure_good', name: '纯善护符', englishName: 'Talisman of Pure Good', itemLine: '奇物，传说（需善良阵营生物同调）', parsedType: 'gear', rarity: 'Legendary', attunement: 'good-aligned creature', activation: '1 Action', effect: '至善象征。非善非恶生物接触受6d6光耀伤害，邪恶生物受8d6光耀伤害；若回合结束仍握持或携带则再次受伤。善良牧师或圣武士可作为圣徽，持握或佩戴时法术攻击+2。7发充能；可用动作消耗1发指定120尺内地面上可见邪恶生物，目标DC20敏捷豁免失败则坠入火焰裂隙尸骨无存。充能耗尽后化为金光尘埃。' }),
  magicItem({ id: 'talisman_of_the_sphere', name: '法球护符', englishName: 'Talisman of the Sphere', itemLine: '奇物，传说（需同调）', parsedType: 'gear', rarity: 'Legendary', attunement: true, activation: '1 Action', effect: '持握时，为操控湮灭法球所作的智力（奥秘）检定可以加上双倍熟练加值。若你回合开始时正操纵湮灭法球，可用动作将法球升起10尺外加10×智力调整值尺数。' }),
  magicItem({ id: 'talisman_of_ultimate_evil', name: '至恶护符', englishName: 'Talisman of Ultimate Evil', itemLine: '奇物，传说（需邪恶阵营生物同调）', parsedType: 'gear', rarity: 'Legendary', attunement: 'evil-aligned creature', activation: '1 Action', effect: '至恶象征。非善非恶生物接触受6d6黯蚀伤害，善良生物受8d6黯蚀伤害；若回合结束仍握持或携带则再次受伤。邪恶牧师或圣武士可作为圣徽，持握或佩戴时法术攻击+2。7发充能；可用动作消耗1发指定120尺内地面上可见善良生物，目标DC20敏捷豁免失败则坠入火焰裂隙尸骨无存。充能耗尽后化为恶臭粘液。' }),
  magicItem({ id: 'tome_of_the_stilled_tongue', name: '静语卷册', englishName: 'Tome of the Stilled Tongue', itemLine: '奇物，传说（需法师同调）', parsedType: 'gear', rarity: 'Legendary', attunement: 'wizard', activation: 'Bonus Action', effect: '厚重皮革卷册，封面钉着风干舌头，共有5本。可作为法术书和法器。持握时可用附赠动作施展一个记录在书中的法术，无需言语、姿势构材，也无需消耗法术位；直到次日黎明前无法再次启动。与卷册同调时可移除封面舌头，永久抹消书中记录的所有法术。维克那会留意使用者，并可在书中写入午夜出现、阅读后消失的密文。' }),
  magicItem({ id: 'universal_solvent', name: '万溶剂', englishName: 'Universal Solvent', itemLine: '奇物，传说', parsedType: 'consumable', rarity: 'Legendary', activation: '1 Action', effect: '乳白色液体，散发浓烈酒精气味。可用动作倒在触及范围内表面，立即溶解接触到的至多1立方尺粘合剂，包括至尊胶。' }),
  magicItem({ id: 'vorpal_sword', name: '斩首剑', englishName: 'Vorpal Sword', itemLine: '武器（任意造成挥砍伤害的剑），传说（需同调）', parsedType: 'weapon', rarity: 'Legendary', attunement: true, effect: '攻击和伤害+3，并忽略挥砍抗性。命中有头生物且投出20时，砍下一颗头；若目标无法无头生存则死亡。免疫挥砍、无头、不需要头、有传奇动作或DM认为太大而无法斩首的生物免疫斩首，但额外受6d8挥砍伤害。' }),
  magicItem({ id: 'well_of_many_worlds', name: '诸界之井', englishName: 'Well of Many Worlds', itemLine: '奇物，传说', parsedType: 'gear', rarity: 'Legendary', activation: '1 Action', duration: '使用后1d8小时冷却', effect: '丝绸般柔软的精致黑布，折叠时手帕大小，展开为半径6尺圆形。可用动作展开并放在坚实表面上，产生通往另一个位面的双向传送门；每次展开时由DM决定连接位面。可用动作抓住边缘折叠关闭传送门。使用后1d8小时内无法再次启动。' })
);

DMG_MAGIC_ITEM_INTAKE.push(
  magicItem({ id: 'ammunition_plus', name: '弹药，+1、+2或+3', englishName: 'Ammunition, +1, +2, or +3', itemLine: '武器（任何弹药），非普通（+1），珍稀（+2），极珍稀（+3）', parsedType: 'weapon', rarity: 'Varies', effect: '使用此魔法弹药发动攻击检定和伤害掷骰时获得加值，加值取决于弹药稀有度。此弹药一旦击中目标即不再具有魔法效果。', tables: { bonusByRarity: [['+1', '非普通'], ['+2', '珍稀'], ['+3', '极珍稀']] } }),
  magicItem({ id: 'armor_plus', name: '护甲，+1、+2或+3', englishName: 'Armor, +1, +2, or +3', itemLine: '护甲（轻型、中型或重型），珍稀（+1），极珍稀（+2），传说（+3）', parsedType: 'armor', rarity: 'Varies', effect: '着装该护甲时AC获得加值，加值取决于护甲稀有度。', tables: { bonusByRarity: [['+1', '珍稀'], ['+2', '极珍稀'], ['+3', '传说']] } }),
  magicItem({ id: 'belt_of_giant_strength', name: '巨人之力腰带', englishName: 'Belt of Giant Strength', itemLine: '奇物，多种稀有度（需同调）', parsedType: 'gear', rarity: 'Varies', attunement: true, effect: '着装时力量值变为腰带赋予的数值；若未着装时力量值已经大于或等于该数值，则物品无效。共有六种，稀有度各异，石巨人和霜巨人版本外形不同但效果相同。', tables: { variants: [['山丘巨人 hill', '力量21', '珍稀'], ['石巨人 stone / 霜巨人 frost', '力量23', '极珍稀'], ['火巨人 fire', '力量25', '极珍稀'], ['云巨人 cloud', '力量27', '传说'], ['风暴巨人 storm', '力量29', '传说']] }, auditIssues: ['原文“clound”疑为“cloud”，按巨人类型规范化。'] }),
  magicItem({ id: 'crystal_ball', name: '水晶球', englishName: 'Crystal Ball', itemLine: '奇物，极珍稀或传说（需同调）', parsedType: 'gear', rarity: 'Varies', attunement: true, activation: '1 Action', effect: '水晶球通常直径6寸。接触水晶球时，可用它施展探知（豁免DC17）。普通水晶球为极珍稀；读心、心灵感应和真知变体为传说级，并在探知传感器附近提供额外能力。', tables: { variants: [['Crystal Ball', '极珍稀', '施展探知，DC17'], ['Crystal Ball of Mind Reading', '传说', '探知期间可用动作对传感器30尺内可见生物施展侦测思想，无需专注，探知终止则一并终止'], ['Crystal Ball of Telepathy', '传说', '探知期间可与传感器30尺内可见生物心灵感应；可用动作经传感器施展暗示术，DC17，无需专注，探知终止则一并终止；使用后探知能力到次日黎明前无法再启动'], ['Crystal Ball of True Seeing', '传说', '探知期间对传感器周围120尺拥有真实视觉']] }, auditIssues: ['原文“Crystal Ball of Minf Reading”疑为“Crystal Ball of Mind Reading”，按物品名规范化。'] }),
  magicItem({ id: 'figurine_of_wondrous_power', name: '异能塑像', englishName: 'Figurine of Wondrous Power', itemLine: '奇物，稀有度依塑像种类而不同', parsedType: 'gear', rarity: 'Varies', activation: '1 Action command word', effect: '小型野兽雕像。用动作说出命令语并投到60尺内未被占据且空间足够的位置时，会变为活体生物。生物对你和同伴友善，理解你的语言并按口头命令行动；无命令时只保护自己。持续时间结束、HP降至0，或你用动作碰触并说命令语时变回雕像；之后需按种类等待冷却。', tables: { variants: [['青铜狮鹫 Bronze Griffon', '珍稀', '狮鹫，至多6小时，冷却5日'], ['乌木苍蝇 Ebony Fly', '珍稀', '巨苍蝇坐骑，至多12小时，冷却2日'], ['黄金狮子 Golden Lions', '珍稀', '成对制造，每只变狮子，至多1小时，各自冷却7日'], ['象牙山羊 Ivory Goats', '珍稀', '三只一组：旅行山羊、苦工山羊、惊骇山羊'], ['大理石象 Marble Elephant', '珍稀', '象，至多24小时，冷却7日'], ['黑曜石驹 Obsidian Steed', '极珍稀', '梦魇，至多24小时，冷却5日；善良阵营使用时有10%概率无视命令并可能传送至哈迪斯'], ['玛瑙犬 Onyx Dog', '珍稀', '獒犬，至多6小时，智力8，会通用语，60尺黑暗视觉并可见隐形，冷却7日'], ['蛇纹石猫头鹰 Serpentine Owl', '珍稀', '巨猫头鹰，至多8小时，同位面内可与你心灵感应，冷却2日'], ['白银渡鸦 Silver Raven', '非普通', '渡鸦，至多12小时，可随意对其施展动物信使，冷却2日']], giantFly: { size: '大型野兽', ac: 11, hp: '19 (3d10+3)', speed: '30尺，飞行60尺', abilities: { str: 14, dex: 13, con: 13, int: 2, wis: 10, cha: 3 }, senses: '黑暗视觉60尺，被动察觉10' } }, auditIssues: ['原文“animal messager”疑为“animal messenger”，按法术名规范化。'] }),
  magicItem({ id: 'horn_of_valhalla', name: '瓦尔哈拉号角', englishName: 'Horn of Valhalla', itemLine: '奇物，珍稀（白银或黄铜）、极珍稀（青铜）、传说（黑铁）', parsedType: 'gear', rarity: 'Varies', activation: '1 Action', duration: '1小时', effect: '用动作吹响号角，约瑟园战士英灵出现在60尺内，使用狂战士资料。HP降至0或1小时后返回约瑟园。使用后冷却7日。若不满足对应号角前提条件而吹响，召唤出的英灵会攻击你；若满足条件，则对你和同伴友善并听命。', tables: { variants: [['01-40', '白银 Silver', '2d4+2狂战士', '无', '珍稀'], ['41-75', '黄铜 Brass', '3d4+3狂战士', '所有简易武器熟练项', '珍稀'], ['76-90', '青铜 Bronze', '4d4+4狂战士', '所有中型护甲熟练项', '极珍稀'], ['91-00', '黑铁 Iron', '5d4+5狂战士', '所有军用武器熟练项', '传说']] } }),
  magicItem({ id: 'instrument_of_the_bards', name: '吟游诗人乐器', englishName: 'Instrument of the Bards', itemLine: '奇物，多种稀有度（需吟游诗人同调）', parsedType: 'gear', rarity: 'Varies', attunement: 'bard', activation: '1 Action', effect: '精品魔法乐器，共七种。未同调生物尝试弹奏时须DC15感知豁免，失败受2d4心灵伤害。可用动作演奏并施展乐器法术；某一法术被施展后直到次日黎明前不能再由该乐器施展。法术使用你的法术豁免DC和施法关键属性。用乐器施展或以乐器为法器施展、且目标豁免失败会被魅惑的法术时，目标豁免具有劣势。', tables: { commonSpells: ['飞行术', '隐形术', '浮空术', '防护善恶'], variants: [['Anstruth harp 安斯翠瑟竖琴', '极珍稀', '操控天气、5环疗伤术、荆棘之墙'], ['Canaith mandolin 藤蔓曼陀林', '珍稀', '3环疗伤术、解除魔法、防护能量（仅闪电）'], ['Cli lyre 聆听者七弦琴', '珍稀', '塑石术、火墙术、风墙术'], ['Doss lute 安眠鲁特琴', '非普通', '化兽为友、防护能量（仅火焰）、防护毒素'], ['Fochlucan bandore 佛克路坎三弦琴', '非普通', '纠缠术、妖火、橡棍术、动物交谈'], ['Mac-Fuimidh cittern 麦克-弗瑞米西特琴', '非普通', '树肤术、疗伤术、云雾术'], ['Ollamh harp 奥莱姆竖琴', '传说', '困惑术、操控天气、火焰风暴']] }, auditIssues: ['原文“Oiiamh harp”疑为“Ollamh harp”，按物品名规范化。'] }),
  magicItem({ id: 'ioun_stone', name: '艾恩石', englishName: 'Ioun Stone', itemLine: '奇物，多种稀有度（需同调）', parsedType: 'gear', rarity: 'Varies', attunement: true, activation: '1 Action', effect: '用动作将艾恩石抛到空中后，它环绕你的头部并距离1d3尺移动，提供对应增益。其他生物需用动作抓住或网住它才能分离，需成功对AC24的攻击检定或DC24敏捷（体操）检定；你可用动作抓住并收起。每颗石头AC24、HP10、对所有伤害有抗性，环绕时仍视为由你着装。', tables: { variants: [['吸收 Absorption', '极珍稀', '淡紫色椭圆；反应无效化可见生物施展、只以你为目标且不超过4环的法术；累计20环后耗尽'], ['机敏 Agility', '极珍稀', '深红色球形；敏捷+2，最高20'], ['警觉 Awareness', '珍稀', '深蓝色菱形；不会被突袭'], ['坚韧 Fortitude', '极珍稀', '粉色菱形；体质+2，最高20'], ['高等吸收 Greater Absorption', '传说', '淡紫绿大理石纹椭圆；反应无效化不超过8环的对应法术；累计50环后耗尽'], ['洞悉 Insight', '极珍稀', '荧蓝球形；感知+2，最高20'], ['才智 Intellect', '极珍稀', '绯红和蓝色大理石纹球形；智力+2，最高20'], ['统御 Leadership', '极珍稀', '粉色和绿色大理石纹球形；魅力+2，最高20'], ['精通 Mastery', '传说', '淡绿色棱晶；熟练加值+1'], ['防护 Protection', '珍稀', '灰玫瑰色棱晶；AC+1'], ['再生 Regeneration', '传说', '珍珠白纺锤形；每经过1小时且至少1HP时恢复15HP'], ['储法 Reserve', '珍稀', '亮紫色棱晶；可储存总计不超过3环法术，新发现时储存DM选定的1d4-1环法术'], ['力量 Strength', '极珍稀', '浅蓝色菱形；力量+2，最高20'], ['维生 Sustenance', '珍稀', '透明纺锤形；无需饮食也能生存']] } }),
  magicItem({ id: 'potion_of_giant_strength', name: '巨人之力药水', englishName: 'Potion of Giant Strength', itemLine: '魔药，多种稀有度', parsedType: 'consumable', rarity: 'Varies', activation: 'Drink', duration: '1小时', effect: '饮用后力量值变为药水赋予的数值，持续1小时；若力量值已经大于或等于该数值，则无效。透明药液中漂着一点对应巨人的指甲碎片，霜巨人和石巨人版本效果相同。', tables: { variants: [['山丘巨人', '力量21', '非普通'], ['霜巨人/石巨人', '力量23', '珍稀'], ['火巨人', '力量25', '珍稀'], ['云巨人', '力量27', '极珍稀'], ['风暴巨人', '力量29', '传说']] } }),
  magicItem({ id: 'potion_of_healing', name: '治疗药水', englishName: 'Potion of Healing', itemLine: '魔药，多种稀有度', parsedType: 'consumable', rarity: 'Varies', activation: 'Drink', effect: '饮用后根据药水稀有度恢复生命值。无论效果如何，红色药水在摇晃时都会微微发亮。', tables: { variants: [['治疗药水', '普通', '2d4+2'], ['高等治疗药水 greater', '非普通', '4d4+4'], ['强效治疗药水 superior', '珍稀', '8d4+8'], ['极效治疗药水 supreme', '极珍稀', '10d4+20']] } }),
  magicItem({ id: 'rod_of_the_pact_keeper', name: '契约掌控者权杖', englishName: 'Rod of the Pact Keeper', itemLine: '权杖，非普通（+1），珍稀（+2），极珍稀（+3）（需邪术师同调）', parsedType: 'gear', rarity: 'Varies', attunement: 'warlock', activation: '1 Action', effect: '持握时，你施展邪术师法术的法术攻击检定与豁免DC获得由权杖稀有度决定的加值。此外，可用动作恢复1个邪术师法术位；必须完成一次长休才能再次使用此属性。', tables: { bonusByRarity: [['+1', '非普通'], ['+2', '珍稀'], ['+3', '极珍稀']] } }),
  magicItem({ id: 'shield_plus', name: '盾牌，+1、+2或+3', englishName: 'Shield, +1, +2, or +3', itemLine: '护甲（盾牌），非普通（+1），珍稀（+2），极珍稀（+3）', parsedType: 'armor', rarity: 'Varies', effect: '持握此盾牌时，在盾牌本身的AC加值基础上获得额外加值。加值取决于盾牌稀有度。', tables: { bonusByRarity: [['+1', '非普通'], ['+2', '珍稀'], ['+3', '极珍稀']] } }),
  magicItem({ id: 'spell_scroll', name: '法术卷轴', englishName: 'Spell Scroll', itemLine: '卷轴，多种稀有度', parsedType: 'consumable', rarity: 'Varies', activation: 'Read scroll', effect: '每张卷轴以神秘暗语记录一道法术。若法术属于你的职业法术列表，你可阅读卷轴并施展该法术且无需材料构材；否则无法理解。施法仍需正常施法时间。施法后文字消散、卷轴化尘；施法被打断时卷轴不消失。若法术在职业列表内但环阶超过你目前可施展水平，需以施法关键属性通过DC为10+法术环阶的属性检定，失败则法术消失且不生效。法师法术可如抄录法术书般抄录，抄录者须通过DC10+法术环阶的智力（奥秘）检定；无论成功与否卷轴都被摧毁。', tables: { spellLevel: [['戏法', '普通', 'DC13', '+5'], ['1环', '普通', 'DC13', '+5'], ['2环', '非普通', 'DC13', '+5'], ['3环', '非普通', 'DC15', '+7'], ['4环', '珍稀', 'DC15', '+7'], ['5环', '珍稀', 'DC17', '+9'], ['6环', '极珍稀', 'DC17', '+9'], ['7环', '极珍稀', 'DC18', '+10'], ['8环', '极珍稀', 'DC18', '+10'], ['9环', '传说', 'DC19', '+11']] } }),
  magicItem({ id: 'wand_of_the_war_mage', name: '战法师魔杖，+1、+2或+3', englishName: 'Wand of the War Mage, +1, +2, or +3', itemLine: '魔杖，非普通（+1），珍稀（+2），极珍稀（+3）（需施法者同调）', parsedType: 'gear', rarity: 'Varies', attunement: 'spellcaster', effect: '持握时法术攻击检定获得加值，加值取决于魔杖稀有度。另外，你在使用法术攻击时忽略半身掩蔽状态。', tables: { bonusByRarity: [['+1', '非普通'], ['+2', '珍稀'], ['+3', '极珍稀']] } }),
  magicItem({ id: 'weapon_plus', name: '武器，+1、+2或+3', englishName: 'Weapon, +1, +2, or +3', itemLine: '武器（任意），非普通（+1），珍稀（+2），极珍稀（+3）', parsedType: 'weapon', rarity: 'Varies', effect: '用此魔法武器发动攻击检定和伤害掷骰时获得加值，加值取决于武器稀有度。', tables: { bonusByRarity: [['+1', '非普通'], ['+2', '珍稀'], ['+3', '极珍稀']] } })
);

