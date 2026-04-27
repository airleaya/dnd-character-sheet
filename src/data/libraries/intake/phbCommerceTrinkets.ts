import type { ItemIntakeAudit, ItemIntakeEntry } from '../itemIntake';

const SOURCE = 'PHB玩家手册';
const CHECK_DATE = '2026-04-27';

type Unit = 'cp' | 'sp' | 'gp';
type CommerceType = 'trade_good' | 'lifestyle_expense' | 'food_drink_lodging' | 'service' | 'spellcasting_service' | 'trinket';

interface CommerceDraft {
  id: string;
  name: string;
  englishName?: string;
  type: CommerceType;
  cost?: { value: number; unit: Unit };
  rawCost: string;
  quantity?: string;
  description?: string;
  auditIssues?: string[];
}

const USEFUL_FIELDS = [
  '中英文名称',
  '类别',
  '价格',
  '数量或单位',
  '描述',
  '服务/生活方式说明'
];

const audit = (name: string, issues: string[] = []): ItemIntakeAudit => ({
  sourceMatched: issues.length === 0,
  checkedAt: CHECK_DATE,
  summary: `已核对 ${name} 的名称、类别、价格/编号和描述。`,
  issues
});

const commerce = (draft: CommerceDraft): ItemIntakeEntry => ({
  id: `${draft.type}_${draft.id}`,
  source: SOURCE,
  status: 'parsed',
  rawText: `${draft.rawCost} | ${draft.quantity ? `${draft.quantity} ` : ''}${draft.name}${draft.englishName ? ` ${draft.englishName}` : ''}`,
  understanding: `${draft.type} 条目，来自PHB贸易商品、开支、服务或饰品章节。`,
  usefulFields: USEFUL_FIELDS,
  notes: draft.type === 'service' || draft.type === 'lifestyle_expense' || draft.type === 'spellcasting_service'
    ? '该条目是费用/服务参考，不应作为普通可携带物品直接加入背包。'
    : undefined,
  parsed: {
    id: draft.id,
    name: `${draft.name}${draft.englishName ? ` (${draft.englishName})` : ''}`,
    type: draft.type === 'trinket' ? 'treasure' : draft.type === 'food_drink_lodging' ? 'consumable' : 'treasure',
    cost: draft.cost,
    weight: 0,
    description: draft.description ?? `${draft.rawCost}${draft.quantity ? ` / ${draft.quantity}` : ''}`,
    quantity: draft.quantity,
    commerceType: draft.type,
    tags: [draft.type]
  },
  audit: audit(draft.name, draft.auditIssues)
});

const tradeGood = (id: string, name: string, englishName: string, rawCost: string, cost: { value: number; unit: Unit }, quantity: string) =>
  commerce({ id, name, englishName, type: 'trade_good', rawCost, cost, quantity });

const priced = (value: number, unit: Unit) => ({ value, unit });

const trinketDescriptions = [
  '一只风干的地精手臂',
  '一块月光下微微发光的水晶',
  '一枚来历不明的金币',
  '一本用你不知道的语言编写的日记',
  '一枚不会失去光泽的黄铜戒指',
  '一枚用玻璃制成的老旧象棋棋子',
  '一对用指骨制成的骰子，每枚骰子在六点的那一面都画着骷髅头的图样',
  '一尊梦魇般生物的塑像，靠近它睡觉时会让人产生不安的梦境',
  '一条绳制项链上面穿着四根风干的精灵手指',
  '某个你不明其所在的国度里一块地皮的地契',
  '用不明材料制成的一盎司重方块',
  '一只插满针的小布偶',
  '未知野兽的一颗牙齿',
  '一片不寻常的鳞片，可能来自于一条龙',
  '一根亮绿色的羽毛',
  '一张老旧的预言牌，其上的画像跟你很像',
  '一个内部充斥着旋转烟雾的玻璃球',
  '一枚1磅重，有着亮红外壳的蛋',
  '一根吹泡泡的管子',
  '一个玻璃罐其内装着一块浮在腌汁上的怪肉',
  '一个侏儒制的小音乐盒，能放出一首你隐约记得儿时听过的歌曲',
  '一只沾沾自喜的半身人的小木雕',
  '一个铭刻着奇怪符文的黄铜球',
  '一个多彩的石碟',
  '一个渡鸦的小银徽',
  '一只装有四十七枚类人生物牙齿的袋子，里面其中一枚是烂牙',
  '一块摸起来感觉温暖的黑曜石碎片',
  '一条简朴的皮质项链垂着一只龙骨爪',
  '一双旧袜子',
  '一本空白的书，其书页无法用墨水，粉笔，石墨或是任何其他物质书写',
  '一枚五角星形状的银徽章',
  '一把曾经为亲属所用的小刀',
  '一个装满指甲屑的玻璃小瓶',
  '一个长方形的金属装置，其中一端有两个凸起的小金属棒，弄湿时还会冒出火花',
  '一只适合人类尺寸，饰有亮片的白色手套',
  '一件有一百个小兜的背心',
  '一个没什么重量的小石块',
  '一幅画着一只地精的小草图',
  '一个空玻璃瓶，打开时能闻到香水的气味',
  '一枚宝石，除你以外的任何人都会将它看作一块煤',
  '从一面老旧军旗上撕下的一小块布',
  '某个失踪军团成员的一枚勋章',
  '一只没有击锤的小银铃',
  '一只侏儒制的油灯，其内有一只机械金丝雀',
  '一只底部刻成好像有无数只脚的小箱子',
  '一只死去的小妖精装在一个透彻的玻璃瓶中',
  '一只未打开的金属罐，里面听起来像是装满了液体、沙子、蜘蛛或是碎玻璃（由你决定）',
  '一个充满水的玻璃球里面有一只机械金鱼在游',
  '一把柄上刻有“M”字的银汤勺',
  '一只用金色木头制成的哨子',
  '一只跟你手差不多大的死亡圣甲虫',
  '两个玩具士兵，其中一个缺了头',
  '一个装满各种大小纽扣的小盒子',
  '一只无法被点亮的蜡烛',
  '一只没有门的小笼子',
  '一把老旧的钥匙',
  '一幅模糊不清的藏宝图',
  '一把破剑的剑柄',
  '一只兔子脚',
  '一只玻璃眼',
  '一枚刻有可怕人物形象的浮雕宝石',
  '一个硬币大小的银骷髅',
  '一面雪花石膏面具',
  '一块金字塔形的黏黏的黑色熏香，气味十分糟糕',
  '一顶可以带给穿戴者美梦的睡帽',
  '单独一枚骨质蒺藜',
  '一副没有镜片的金质单边眼睛框',
  '一个1寸大小的立方体，每面绘着不同的颜色',
  '来自某扇门的水晶把手',
  '一个装满粉色尘土的小袋子',
  '一首优美歌曲的乐谱，用音乐记号写在两张羊皮纸上',
  '一枚用真泪珠做成的泪珠耳环',
  '一只蛋壳，其上绘有令人不安的人类受苦场景',
  '一把打开时能看到一只睡猫的折扇',
  '一套骨烟斗',
  '一根四叶草，压在一本讨论规矩和礼仪的书中',
  '一张绘有复杂机械结构的羊皮纸',
  '一把华丽的剑鞘，但你至今尚未找到任何能装进去的剑',
  '一张邀请函，属于某个曾经发生命案的聚会',
  '一枚铜质五角星其中央蚀刻着一个老鼠头',
  '一条紫色的方手帕，其上绣着某名强力大法师的名字',
  '一座庙宇、城堡或是其它建筑物的半张平面图',
  '一块叠起的布，展开时会变成一顶独特的帽子',
  '一张存款收据，其属于某家遥远城市中的银行',
  '一本丢失了七页的日记',
  '一个空的银质鼻烟盒，其表面上的题字意思是“梦”',
  '一枚属于某个不明神祇的铁质圣徽',
  '一本讲述某个传奇英雄兴起衰落的故事书，其中最后的章节丢失了',
  '一小瓶龙血',
  '一支精灵设计的古箭',
  '一根永不会弯的针',
  '一枚矮人设计的华丽胸针',
  '一个空的红酒瓶，其上面有一枚漂亮的酒标写着：“美酒巫师庄园The Wizard of Wines Winery，红龙陨落之年Red Dragon Crush，331422-W”',
  '一块多彩釉质表面的马赛克瓦',
  '一只石化的老鼠',
  '一面装饰着龙骷髅和交叉骨头的黑色海盗旗',
  '一只不被观察就会活动的小金属蟹或蜘蛛',
  '一只装有荤油的玻璃罐其标签上写着“狮鹫油”',
  '一只陶底木盒内装着一条两头都长着脑袋的活蠕虫',
  '一只装有英雄骨灰的金属瓮'
];

const trinkets = trinketDescriptions.map((description, index) => {
  const roll = String(index + 1).padStart(2, '0');
  return commerce({
    id: `trinket_${roll}`,
    name: `饰品 ${roll}`,
    type: 'trinket',
    rawCost: `d100 ${roll}`,
    description
  });
});

export const PHB_COMMERCE_TRINKET_INTAKE: ItemIntakeEntry[] = [
  tradeGood('wheat_1lb', '小麦', 'Wheat', '1 cp', priced(1, 'cp'), '1磅'),
  tradeGood('flour_1lb', '面粉', 'Flour', '2 cp', priced(2, 'cp'), '1磅'),
  tradeGood('chicken', '鸡', 'Chicken', '2 cp', priced(2, 'cp'), '1只'),
  tradeGood('salt_1lb', '盐', 'Salt', '5 cp', priced(5, 'cp'), '1磅'),
  tradeGood('iron_1lb', '铁', 'Iron', '1 sp', priced(1, 'sp'), '1磅'),
  tradeGood('canvas_1sqyd', '帆布', 'Canvas', '1 sp', priced(1, 'sp'), '1平方码'),
  tradeGood('copper_1lb', '铜', 'Copper', '5 sp', priced(5, 'sp'), '1磅'),
  tradeGood('cotton_cloth_1sqyd', '棉布', 'Cotton Cloth', '5 sp', priced(5, 'sp'), '1平方码'),
  tradeGood('ginger_1lb', '姜', 'Ginger', '1 gp', priced(1, 'gp'), '1磅'),
  tradeGood('goat', '山羊', 'Goat', '1 gp', priced(1, 'gp'), '1头'),
  tradeGood('cinnamon_1lb', '肉桂', 'Cinnamon', '2 gp', priced(2, 'gp'), '1磅'),
  tradeGood('pepper_1lb', '胡椒', 'Pepper', '2 gp', priced(2, 'gp'), '1磅'),
  tradeGood('sheep', '绵羊', 'Sheep', '2 gp', priced(2, 'gp'), '1头'),
  tradeGood('cloves_1lb', '丁香', 'Cloves', '3 gp', priced(3, 'gp'), '1磅'),
  tradeGood('pig', '猪', 'Pig', '3 gp', priced(3, 'gp'), '1头'),
  tradeGood('silver_1lb', '白银', 'Silver', '5 gp', priced(5, 'gp'), '1磅'),
  tradeGood('linen_1sqyd', '亚麻', 'Linen', '5 gp', priced(5, 'gp'), '1平方码'),
  tradeGood('silk_1sqyd', '丝绸', 'Silk', '10 gp', priced(10, 'gp'), '1平方码'),
  tradeGood('cow', '奶牛', 'Cow', '10 gp', priced(10, 'gp'), '1头'),
  tradeGood('saffron_1lb', '藏红花', 'Saffron', '15 gp', priced(15, 'gp'), '1磅'),
  tradeGood('ox', '公牛', 'Ox', '15 gp', priced(15, 'gp'), '1头'),
  tradeGood('gold_1lb', '黄金', 'Gold', '50 gp', priced(50, 'gp'), '1磅'),
  tradeGood('platinum_1lb', '铂金', 'Platinum', '500 gp', priced(500, 'gp'), '1磅'),

  commerce({ id: 'lifestyle_wretched', name: '乞食', englishName: 'Wretched', type: 'lifestyle_expense', rawCost: '－', description: '过着非人的生活，没有住处，依靠施舍维生。' }),
  commerce({ id: 'lifestyle_squalid', name: '流浪', englishName: 'Squalid', type: 'lifestyle_expense', rawCost: '1 sp/日', cost: priced(1, 'sp'), description: '住在漏水马厩、泥地破屋或镇中最穷地区。' }),
  commerce({ id: 'lifestyle_poor', name: '穷困', englishName: 'Poor', type: 'lifestyle_expense', rawCost: '2 sp/日', cost: priced(2, 'sp'), description: '住在板间房或旅馆共用大厅，饮食粗简。' }),
  commerce({ id: 'lifestyle_modest', name: '俭朴', englishName: 'Modest', type: 'lifestyle_expense', rawCost: '1 gp/日', cost: priced(1, 'gp'), description: '脱离贫民窟，能保养武器装备，居住环境整齐干净。' }),
  commerce({ id: 'lifestyle_comfortable', name: '舒适', englishName: 'Comfortable', type: 'lifestyle_expense', rawCost: '2 gp/日', cost: priced(2, 'gp'), description: '较好的吃住环境，住在中产街区或优质旅馆私人房间。' }),
  commerce({ id: 'lifestyle_wealthy', name: '富裕', englishName: 'Wealthy', type: 'lifestyle_expense', rawCost: '4 gp/日', cost: priced(4, 'gp'), description: '享尽奢侈但未达富豪或王族程度，可有大房子或优质旅馆套间。' }),
  commerce({ id: 'lifestyle_aristocratic', name: '奢华', englishName: 'Aristocratic', type: 'lifestyle_expense', rawCost: '至少10 gp/日', cost: priced(10, 'gp'), description: '极尽奢华的生活方式，处于最有财势的人群中。' }),

  commerce({ id: 'ale_gallon', name: '麦酒', englishName: 'Ale, gallon', type: 'food_drink_lodging', rawCost: '2 sp', cost: priced(2, 'sp'), quantity: '每加仑' }),
  commerce({ id: 'ale_mug', name: '麦酒', englishName: 'Ale, mug', type: 'food_drink_lodging', rawCost: '4 cp', cost: priced(4, 'cp'), quantity: '每马克杯' }),
  commerce({ id: 'banquet_person', name: '筵席', englishName: 'Banquet', type: 'food_drink_lodging', rawCost: '10 gp', cost: priced(10, 'gp'), quantity: '每人' }),
  commerce({ id: 'bread_loaf', name: '一条面包', englishName: 'Loaf of Bread', type: 'food_drink_lodging', rawCost: '2 cp', cost: priced(2, 'cp') }),
  commerce({ id: 'cheese_hunk', name: '一块奶酪', englishName: 'Hunk of Cheese', type: 'food_drink_lodging', rawCost: '1 sp', cost: priced(1, 'sp') }),
  commerce({ id: 'meat_chunk', name: '一块肉', englishName: 'Chunk of Meat', type: 'food_drink_lodging', rawCost: '3 sp', cost: priced(3, 'sp') }),
  commerce({ id: 'wine_common_pitcher', name: '普通红酒', englishName: 'Common Wine, pitcher', type: 'food_drink_lodging', rawCost: '2 sp', cost: priced(2, 'sp'), quantity: '罐装' }),
  commerce({ id: 'wine_fine_bottle', name: '优质红酒', englishName: 'Fine Wine, bottle', type: 'food_drink_lodging', rawCost: '10 gp', cost: priced(10, 'gp'), quantity: '瓶装' }),
  commerce({ id: 'inn_squalid', name: '旅馆住宿：流浪', englishName: 'Inn Stay, Squalid', type: 'food_drink_lodging', rawCost: '7 cp/日', cost: priced(7, 'cp') }),
  commerce({ id: 'inn_poor', name: '旅馆住宿：穷困', englishName: 'Inn Stay, Poor', type: 'food_drink_lodging', rawCost: '1 sp/日', cost: priced(1, 'sp') }),
  commerce({ id: 'inn_modest', name: '旅馆住宿：俭朴', englishName: 'Inn Stay, Modest', type: 'food_drink_lodging', rawCost: '5 sp/日', cost: priced(5, 'sp') }),
  commerce({ id: 'inn_comfortable', name: '旅馆住宿：舒适', englishName: 'Inn Stay, Comfortable', type: 'food_drink_lodging', rawCost: '8 sp/日', cost: priced(8, 'sp') }),
  commerce({ id: 'inn_wealthy', name: '旅馆住宿：富裕', englishName: 'Inn Stay, Wealthy', type: 'food_drink_lodging', rawCost: '2 gp/日', cost: priced(2, 'gp') }),
  commerce({ id: 'inn_aristocratic', name: '旅馆住宿：奢华', englishName: 'Inn Stay, Aristocratic', type: 'food_drink_lodging', rawCost: '4 gp/日', cost: priced(4, 'gp') }),
  commerce({ id: 'meals_squalid', name: '餐膳：流浪', englishName: 'Meals, Squalid', type: 'food_drink_lodging', rawCost: '3 cp/日', cost: priced(3, 'cp') }),
  commerce({ id: 'meals_poor', name: '餐膳：穷困', englishName: 'Meals, Poor', type: 'food_drink_lodging', rawCost: '6 cp/日', cost: priced(6, 'cp') }),
  commerce({ id: 'meals_modest', name: '餐膳：俭朴', englishName: 'Meals, Modest', type: 'food_drink_lodging', rawCost: '3 sp/日', cost: priced(3, 'sp') }),
  commerce({ id: 'meals_comfortable', name: '餐膳：舒适', englishName: 'Meals, Comfortable', type: 'food_drink_lodging', rawCost: '5 sp/日', cost: priced(5, 'sp') }),
  commerce({ id: 'meals_wealthy', name: '餐膳：富裕', englishName: 'Meals, Wealthy', type: 'food_drink_lodging', rawCost: '8 sp/日', cost: priced(8, 'sp') }),
  commerce({ id: 'meals_aristocratic', name: '餐膳：奢华', englishName: 'Meals, Aristocratic', type: 'food_drink_lodging', rawCost: '2 gp/日', cost: priced(2, 'gp') }),

  commerce({ id: 'coach_between_towns', name: '计程客车：城际', englishName: 'Coach Cab, between towns', type: 'service', rawCost: '3 cp/里', cost: priced(3, 'cp') }),
  commerce({ id: 'coach_within_city', name: '计程客车：城内', englishName: 'Coach Cab, within a city', type: 'service', rawCost: '1 cp', cost: priced(1, 'cp') }),
  commerce({ id: 'hireling_skilled', name: '熟练雇工', englishName: 'Skilled Hireling', type: 'service', rawCost: '2 gp/日', cost: priced(2, 'gp'), description: '某些与熟练项相关的工作视为熟练雇工，表中工价只是下限。' }),
  commerce({ id: 'hireling_untrained', name: '新手雇工', englishName: 'Untrained Hireling', type: 'service', rawCost: '2 sp/日', cost: priced(2, 'sp'), description: '新手雇工只能从事不需要特定技能的工作，包括苦力、送货员、女仆等。' }),
  commerce({ id: 'messenger', name: '信使', englishName: 'Messenger', type: 'service', rawCost: '2 cp/里', cost: priced(2, 'cp') }),
  commerce({ id: 'road_gate_toll', name: '过路费', englishName: 'Road or Gate Toll', type: 'service', rawCost: '1 cp', cost: priced(1, 'cp') }),
  commerce({ id: 'ships_passage', name: '渡河费', englishName: "Ship's Passage", type: 'service', rawCost: '1 sp/里', cost: priced(1, 'sp') }),
  commerce({ id: 'spellcasting_common_1_2', name: '常见1环或2环施法服务', englishName: 'Common 1st- or 2nd-level Spellcasting Service', type: 'spellcasting_service', rawCost: '约10到50 gp，外加昂贵材料成分', description: '常见的1环或2环法术服务通常可在普通市镇找到，价格约10到50 gp，外加任何昂贵材料成分。更高环阶法术更难找到，可能要求服务交换。' }),

  ...trinkets
];
