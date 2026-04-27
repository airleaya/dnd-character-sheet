import type { ItemIntakeAudit, ItemIntakeEntry } from '../itemIntake';

const GEAR_SOURCE = 'PHB玩家手册';
const GEAR_CHECK_DATE = '2026-04-27';

type CurrencyUnit = 'cp' | 'sp' | 'gp';
type IntakeItemType = 'gear' | 'tool' | 'consumable' | 'container' | 'pack';

interface GearDraft {
  id: string;
  name: string;
  englishName: string;
  type?: IntakeItemType;
  cost: { value: number; unit: CurrencyUnit };
  weight?: number;
  rawWeight: string;
  group?: string;
  description?: string;
  effectDescription?: string;
  activation?: string;
  capacityWeight?: number;
  capacityVolume?: string;
  maxItems?: number;
  isAmmunition?: boolean;
  ammoType?: 'arrow' | 'bolt' | 'bullet' | 'needle';
  auditIssues?: string[];
}

interface PackDraft {
  id: string;
  name: string;
  englishName: string;
  cost: { value: number; unit: CurrencyUnit };
  rawText: string;
  contents: Array<{ id: string; quantity: number; note?: string }>;
  auditIssues?: string[];
}

const GEAR_USEFUL_FIELDS = [
  '中英文名称',
  '类别',
  '价格',
  '重量',
  '规则说明',
  '激活方式',
  '效果',
  '容量',
  '套组内容'
];

const CONTAINER_CAPACITY: Record<string, Partial<GearDraft>> = {
  backpack: { capacityWeight: 30, capacityVolume: '1立方尺' },
  barrel: { capacityVolume: '40加仑液体，4立方尺固体' },
  basket: { capacityWeight: 40, capacityVolume: '2立方尺' },
  bottle_glass: { capacityVolume: '1又1/2品脱液体' },
  bucket: { capacityVolume: '3加仑液体，1/2立方尺固体' },
  chest: { capacityWeight: 300, capacityVolume: '12立方尺' },
  flask_tankard: { capacityVolume: '1品脱液体' },
  jug_pitcher: { capacityVolume: '1加仑液体' },
  iron_pot: { capacityVolume: '1加仑液体' },
  pouch: { capacityWeight: 6, capacityVolume: '1/5立方尺' },
  sack: { capacityWeight: 30, capacityVolume: '1立方尺' },
  vial: { capacityVolume: '4盎司液体' },
  waterskin: { capacityVolume: '4品脱液体' }
};

const DETAILS: Record<string, Partial<GearDraft>> = {
  acid_vial: {
    type: 'consumable',
    activation: '1 Action',
    effectDescription: '远程攻击，射程20尺；命中造成2d6强酸伤害。',
    description: '你可以用一个动作将这小瓶液体泼溅到身边5尺内的一个生物身上，或投到至多20尺远并打破它。两种情况都视为远程攻击，并将强酸视为临时武器。命中时，目标受到2d6点强酸伤害。'
  },
  alchemists_fire_flask: {
    type: 'consumable',
    activation: '1 Action',
    effectDescription: '远程攻击，射程20尺；命中后目标每回合开始受到1d4火焰伤害，动作DC10敏捷检定可扑灭。',
    description: '一种粘稠流体，接触空气会自燃。你可以用一个动作投到至多20尺远并打破它，视为远程攻击和临时武器。命中时，目标在每回合开始时受到1d4点火焰伤害；被命中生物可用动作进行DC10敏捷检定扑灭火焰。'
  },
  antitoxin_vial: {
    type: 'consumable',
    activation: 'Use',
    effectDescription: '1小时内对抗毒素的豁免检定具有优势；不影响不死生物或构装生物。',
    description: '喝下瓶内液体的生物在1小时内进行对抗毒素的豁免检定时具有优势。它无法为不死生物或构装生物提供任何增益。'
  },
  ball_bearings: {
    type: 'consumable',
    activation: '1 Action',
    effectDescription: '覆盖10尺方形区域；穿过者DC10敏捷豁免失败则倒地，半速通过无需豁免。',
    description: '你可以用一个动作将这些小金属珠洒出，覆盖一片边长10尺的方形区域。穿过区域的生物必须进行DC10敏捷豁免，失败则摔至倒地；半速穿过无需豁免。'
  },
  block_and_tackle: {
    description: '一组滑轮组，配有绕过轮组的绳索和系物钩子。它可以让你提起相当于正常举重四倍重量的物件。'
  },
  book: {
    description: '一本书可能写着诗歌、故事、地区学识、机械图、笔记，或任何其它能够用文字或图形表达的内容。载有法术的书是法术书。'
  },
  caltrops: {
    type: 'consumable',
    activation: '1 Action',
    effectDescription: '覆盖5尺方形区域；进入者DC15敏捷豁免失败则停止移动、受1点穿刺伤害，速度减少10尺直到恢复至少1点生命值。',
    description: '你可以用一个动作将一包铁蒺藜撒出，覆盖一块边长5尺的方形区域。进入该区域的生物必须进行DC15敏捷豁免，失败则停止移动并受到1点穿刺伤害；在恢复至少1点生命值前，步行速度减少10尺。半速穿过无需豁免。'
  },
  candle: {
    type: 'consumable',
    effectDescription: '提供5尺明亮光照和额外5尺微光，持续1小时。',
    description: '一只蜡烛可以为身边5尺半径范围提供明亮光照，以及该范围外5尺的微光光照。照明效果持续1小时。'
  },
  crossbow_bolt_case: { type: 'container', capacityVolume: '20支弩矢', maxItems: 20, description: '一只木匣能装二十支弩矢。' },
  map_scroll_case: { type: 'container', capacityVolume: '10张卷起的纸或5张卷起的羊皮纸', description: '一个圆柱形皮匣能够装上十张卷起的纸或是五张卷起的羊皮纸。' },
  chain_10ft: { description: '一根链条有10点生命值。它可以被一次成功的DC20力量检定挣断。' },
  climbers_kit: {
    type: 'tool',
    activation: '1 Action',
    effectDescription: '锚定自己；不会从锚定处摔落超过25尺，解除锚定前无法从锚定处向外攀爬超过25尺。',
    description: '一套攀爬工具包括特制岩钉、靴子包头、手套和系带。你可以用一个动作锚定自己。'
  },
  component_pouch: {
    type: 'gear',
    description: '材料包是一个防水皮质小包，其内有间格用以放置施展法术需要的材料成分和特殊物品。某些有特定价格的材料不包含在内。'
  },
  crowbar: { description: '在适当的地方使用撬棍时，可以让相应的力量检定具有优势。' },
  fishing_tackle: { type: 'tool', description: '一套渔具工具包中装有一根长杆、丝线、软木转轴、铅坠、天鹅绒饵以及窄眼网。' },
  healers_kit: {
    type: 'tool',
    activation: '1 Action',
    effectDescription: '10次使用次数；花费1次使用次数稳定一个生命值为0的生物，无需感知（医药）检定。',
    description: '医疗包中装有绷带、药膏和夹板。医疗包可以使用十次。你可以用一个动作并花费一次使用次数来稳定一个生命值为0的生物。'
  },
  holy_water_flask: {
    type: 'consumable',
    activation: '1 Action',
    effectDescription: '远程攻击，射程20尺；若目标为邪魔或不死生物，命中造成2d6光耀伤害。',
    description: '你可以用一个动作将圣水泼溅到身边5尺内的一个生物身上，或投到至多20尺远并打破它，视为远程攻击和临时武器。命中时，若目标是邪魔或不死生物，则受到2d6光耀伤害。'
  },
  hunting_trap: {
    activation: '1 Action',
    effectDescription: '踩上压板者DC13敏捷豁免失败则受1d4穿刺伤害并停止移动；DC13力量检定可解脱。',
    description: '使用动作设置后，陷阱形成锯齿钢圈并在生物踏上中央压板时闭合。豁免失败者受1d4穿刺伤害并停止移动，解脱前移动范围受链条长度限制。'
  },
  lamp: {
    activation: 'Use',
    effectDescription: '提供15尺明亮光照和额外30尺微光；每6小时消耗1扁瓶灯油。',
    description: '一只油灯可以为身边15尺半径范围提供明亮光照，以及该范围外30尺的微光光照。点亮的油灯每6小时消耗一扁瓶灯油。'
  },
  lantern_bullseye: {
    activation: 'Use',
    effectDescription: '前方60尺锥状明亮光照和额外60尺微光；每6小时消耗1扁瓶灯油。',
    description: '一盏牛眼提灯可以为前方60尺的锥状区域提供明亮光照，以及该范围外60尺的微光光照。点亮后每6小时消耗一扁瓶灯油。'
  },
  lantern_hooded: {
    activation: 'Use',
    effectDescription: '30尺明亮光照和额外30尺微光；每6小时消耗1扁瓶灯油；可用动作放下盖子改为5尺微光。',
    description: '一盏附盖提灯可以为身边30尺半径范围提供明亮光照，以及该范围外30尺的微光光照。点亮后每6小时消耗一扁瓶灯油。你可以使用一个动作放下盖子，使光照减弱为5尺范围微光。'
  },
  lock: { description: '每把锁与一把钥匙配套。不使用钥匙时，具有盗贼工具熟练项的生物可以通过一次成功的DC15敏捷检定撬开锁。DM可决定是否能以更高价格买到更好的锁。' },
  magnifying_glass: { description: '用于详细观察小物件，也可在明亮如阳光的光照下聚焦光来生火。进行估价或检查细小、精细物件时的属性检定可以获得优势。' },
  manacles: { description: '这些金属束具可以困住一只小型或中型生物。解开需DC20敏捷检定；破坏需DC20力量检定；不用钥匙时，具有盗贼工具熟练项者可通过DC15敏捷检定撬开。镣铐有15点生命值。' },
  mess_kit: { description: '一个野炊工具锡盒包括一只茶杯和一些简易餐具。盒子夹在一起，一面可作煎锅，另一面可作碟子或浅碗。' },
  oil_flask: {
    type: 'consumable',
    activation: '1 Action',
    effectDescription: '远程攻击，射程20尺；目标1分钟内受到火焰伤害时额外受5点火焰伤害；也可覆盖5尺方格并燃烧2轮。',
    description: '灯油通常装在1品脱陶土扁瓶中。可泼溅或投掷并视为远程攻击和临时武器。命中后目标被灯油洒满，1分钟内受到火焰伤害时额外受5点火焰伤害。也可泼在地面覆盖5尺方形区域，点燃后持续2轮。'
  },
  basic_poison_vial: {
    type: 'consumable',
    activation: '1 Action',
    effectDescription: '涂于一把挥砍或穿刺武器，或至多三发弹药；命中者DC10体质豁免失败受1d4毒素伤害；持续1分钟。',
    description: '你可以用一个动作将毒药涂于一把挥砍或穿刺武器，或者至多三发弹药上。涂毒武器或弹药命中时，目标必须进行DC10体质豁免，失败则受到1d4毒素伤害。'
  },
  potion_healing: {
    type: 'consumable',
    activation: '1 Action',
    effectDescription: '恢复2d4+2生命值。',
    description: '一种红色的魔力药剂，可以使饮用者恢复2d4+2的生命值。喝药或者喂人喝药需要使用一个动作。'
  },
  pouch: { type: 'container', maxItems: 50, description: '一个布料或皮革制成的小包可以装20发弹丸或50发吹矢，或者其他东西。用来装施法材料成分的小包则成为材料包。' },
  quiver: { type: 'container', maxItems: 20, capacityVolume: '20支箭', description: '一只箭袋可以盛装20支箭。' },
  portable_ram: { effectDescription: '破门的力量检定获得+4加值；若另一名角色协助，则该检定具有优势。', description: '你可以使用一具便携式攻城锤破门。此时破门的力量检定具有+4加值；若另一名角色协助，则该检定具有优势。' },
  rations: { type: 'consumable', description: '适合长途旅行携带的高能量干粮，包括牛肉干、干果、饼干和坚果等。' },
  hempen_rope_50ft: { description: '麻质绳索拥有2点生命值，且可以通过一次成功的DC17力量检定扯断。' },
  silk_rope_50ft: { description: '丝质绳索拥有2点生命值，且可以通过一次成功的DC17力量检定扯断。' },
  merchants_scale: { description: '一架天平包括一个小的衡平、一对托盘和一套共重2磅的砝码。它可以用来称量小物件的精细重量，以便估价。' },
  spellbook: { description: '硬皮封面的法术书是法师们的必须品，通常留有100张羊皮纸空书页以便记录法术。' },
  spyglass: { description: '从望远镜中观察到的物品能放大两倍。' },
  tent_two_person: { description: '一个简单轻便的双人帆布帐篷。' },
  tinderbox: { activation: '1 Action', effectDescription: '点燃火把或其他燃料物质外露的物件需要1动作；点燃其他物品需要1分钟。', description: '一个小巧的盒子里装有燧石、铁片和火绒，是常用的生火工具。' },
  torch: { type: 'consumable', effectDescription: '提供20尺明亮光照和额外20尺微光，持续1小时；也可作为近战攻击命中造成1点火焰伤害。', description: '一支火把可以为身边20尺半径范围提供明亮光照，以及其外20尺范围的微光光照。照明持续1小时。你还可以使用燃烧的火把发动近战攻击，命中造成1点火焰伤害。' }
};

const fociDescriptions: Record<string, string> = {
  arcane: '奥术法器是一件用来引导奥术法术的特殊物品。术士、邪术师或法师能将这样的物品用作施法法器。',
  druidic: '德鲁伊法器是一件用来引导德鲁伊法术的特殊物品。德鲁伊能将这样的物品用作其施法法器。',
  holy: '圣徽是某个神祇或神系的象征。牧师或圣武士能将圣徽用作施法法器；使用时必须握在手中、戴在身上可见处，或者装在盾上使用。'
};

const gearAudit = (draft: GearDraft): ItemIntakeAudit => ({
  sourceMatched: !draft.auditIssues?.length,
  checkedAt: GEAR_CHECK_DATE,
  summary: `已核对 ${draft.name} 的名称、价格、重量${draft.description || draft.effectDescription ? '和规则说明' : ''}${draft.capacityWeight || draft.capacityVolume ? '、容量' : ''}。`,
  issues: draft.auditIssues ?? []
});

const packAudit = (draft: PackDraft): ItemIntakeAudit => ({
  sourceMatched: !draft.auditIssues?.length,
  checkedAt: GEAR_CHECK_DATE,
  summary: `已核对 ${draft.name} 的名称、价格和套组内容。`,
  issues: draft.auditIssues ?? []
});

const gear = (draft: GearDraft): ItemIntakeEntry => {
  const capacity = CONTAINER_CAPACITY[draft.id] ?? {};
  const details = DETAILS[draft.id] ?? {};
  const merged = { ...draft, ...capacity, ...details, auditIssues: [...(draft.auditIssues ?? []), ...(capacity.auditIssues ?? []), ...(details.auditIssues ?? [])] };
  const itemType = merged.type ?? (merged.capacityWeight || merged.capacityVolume ? 'container' : 'gear');

  return {
    id: `gear_${draft.id}`,
    source: GEAR_SOURCE,
    status: 'parsed',
    rawText: `${draft.name}${draft.englishName ? ` ${draft.englishName}` : ''} | ${draft.cost.value} ${draft.cost.unit} | ${draft.rawWeight}`,
    understanding: `${draft.group ? `${draft.group}中的` : ''}${draft.name}条目，来自PHB冒险用品表。`,
    usefulFields: GEAR_USEFUL_FIELDS,
    notes: merged.auditIssues.length ? '存在需要最终复核的原文排版/字符问题。' : undefined,
    parsed: {
      id: draft.id,
      name: `${draft.name}${draft.englishName ? ` (${draft.englishName})` : ''}`,
      type: itemType,
      cost: draft.cost,
      weight: draft.weight,
      description: merged.description ?? `PHB冒险用品表中的${draft.name}。`,
      activation: merged.activation,
      effectDescription: merged.effectDescription,
      capacityWeight: merged.capacityWeight,
      capacityVolume: merged.capacityVolume,
      maxItems: merged.maxItems,
      isAmmunition: merged.isAmmunition,
      ammoType: merged.ammoType,
      tags: draft.group ? [draft.group] : undefined
    },
    audit: gearAudit(merged)
  };
};

const pack = (draft: PackDraft): ItemIntakeEntry => ({
  id: `pack_${draft.id}`,
  source: GEAR_SOURCE,
  status: 'parsed',
  rawText: draft.rawText,
  understanding: '装备套组条目，来自PHB装备套组段落。',
  usefulFields: GEAR_USEFUL_FIELDS,
  parsed: {
    id: draft.id,
    name: `${draft.name} (${draft.englishName})`,
    type: 'pack',
    cost: draft.cost,
    weight: 0,
    description: draft.rawText,
    contents: draft.contents
  },
  audit: packAudit(draft)
});

export const PHB_ADVENTURING_GEAR_INTAKE: ItemIntakeEntry[] = [
  gear({ id: 'abacus', name: '算盘', englishName: 'Abacus', cost: { value: 2, unit: 'gp' }, weight: 2, rawWeight: '2磅' }),
  gear({ id: 'acid_vial', name: '强酸', englishName: 'Acid (vial)', cost: { value: 25, unit: 'gp' }, weight: 1, rawWeight: '1磅' }),
  gear({ id: 'alchemists_fire_flask', name: '炽火胶', englishName: "Alchemist's Fire (flask)", cost: { value: 50, unit: 'gp' }, weight: 1, rawWeight: '1磅' }),
  gear({ id: 'arrows', name: '箭', englishName: 'Arrows (20)', group: '弹药', type: 'consumable', cost: { value: 1, unit: 'gp' }, weight: 1, rawWeight: '1磅', isAmmunition: true, ammoType: 'arrow' }),
  gear({ id: 'blowgun_needles', name: '吹矢', englishName: 'Blowgun Needles (50)', group: '弹药', type: 'consumable', cost: { value: 1, unit: 'gp' }, weight: 1, rawWeight: '1磅', isAmmunition: true, ammoType: 'needle' }),
  gear({ id: 'crossbow_bolts', name: '弩矢', englishName: 'Crossbow Bolts (20)', group: '弹药', type: 'consumable', cost: { value: 1, unit: 'gp' }, weight: 1.5, rawWeight: '1又1/2磅', isAmmunition: true, ammoType: 'bolt' }),
  gear({ id: 'sling_bullets', name: '投石索弹丸', englishName: 'Sling Bullets (20)', group: '弹药', type: 'consumable', cost: { value: 4, unit: 'cp' }, weight: 1.5, rawWeight: '1又1/2磅', isAmmunition: true, ammoType: 'bullet' }),
  gear({ id: 'antitoxin_vial', name: '抗毒剂', englishName: 'Antitoxin (vial)', cost: { value: 50, unit: 'gp' }, weight: 0, rawWeight: '－' }),
  gear({ id: 'crystal', name: '水晶', englishName: 'Crystal', group: '奥术法器', cost: { value: 10, unit: 'gp' }, weight: 1, rawWeight: '1磅', description: fociDescriptions.arcane }),
  gear({ id: 'orb', name: '法球', englishName: 'Orb', group: '奥术法器', cost: { value: 20, unit: 'gp' }, weight: 3, rawWeight: '3磅', description: fociDescriptions.arcane }),
  gear({ id: 'rod', name: '权杖', englishName: 'Rod', group: '奥术法器', cost: { value: 10, unit: 'gp' }, weight: 2, rawWeight: '2磅', description: fociDescriptions.arcane }),
  gear({ id: 'staff', name: '法杖', englishName: 'Staff', group: '奥术法器', cost: { value: 5, unit: 'gp' }, weight: 4, rawWeight: '4磅', description: fociDescriptions.arcane }),
  gear({ id: 'wand', name: '魔杖', englishName: 'Wand', group: '奥术法器', cost: { value: 10, unit: 'gp' }, weight: 1, rawWeight: '1磅', description: fociDescriptions.arcane }),
  gear({ id: 'backpack', name: '背包', englishName: 'Backpack', type: 'container', cost: { value: 2, unit: 'gp' }, weight: 5, rawWeight: '5磅' }),
  gear({ id: 'ball_bearings', name: '滚珠', englishName: 'Ball Bearings (bag of 1,000)', cost: { value: 1, unit: 'gp' }, weight: 2, rawWeight: '2磅' }),
  gear({ id: 'barrel', name: '粗腰桶', englishName: 'Barrel', type: 'container', cost: { value: 2, unit: 'gp' }, weight: 70, rawWeight: '70磅' }),
  gear({ id: 'basket', name: '篮子', englishName: 'Basket', type: 'container', cost: { value: 4, unit: 'sp' }, weight: 2, rawWeight: '2磅' }),
  gear({ id: 'bedroll', name: '铺盖', englishName: 'Bedroll', cost: { value: 1, unit: 'gp' }, weight: 7, rawWeight: '7磅' }),
  gear({ id: 'bell', name: '铃铛', englishName: 'Bell', cost: { value: 1, unit: 'gp' }, weight: 0, rawWeight: '－' }),
  gear({ id: 'blanket', name: '毯子', englishName: 'Blanket', cost: { value: 5, unit: 'sp' }, weight: 3, rawWeight: '3磅' }),
  gear({ id: 'block_and_tackle', name: '滑轮组', englishName: 'Block and Tackle', cost: { value: 5, unit: 'gp' }, weight: 5, rawWeight: '5磅' }),
  gear({ id: 'book', name: '书本', englishName: 'Book', cost: { value: 28, unit: 'gp' }, weight: 5, rawWeight: '5磅' }),
  gear({ id: 'bottle_glass', name: '玻璃瓶', englishName: 'Bottle, Glass', type: 'container', cost: { value: 2, unit: 'gp' }, weight: 2, rawWeight: '2磅' }),
  gear({ id: 'bucket', name: '吊桶', englishName: 'Bucket', type: 'container', cost: { value: 5, unit: 'cp' }, weight: 2, rawWeight: '2磅' }),
  gear({ id: 'caltrops', name: '铁蒺藜', englishName: 'Caltrops (bag of 20)', cost: { value: 1, unit: 'gp' }, weight: 2, rawWeight: '2磅' }),
  gear({ id: 'candle', name: '蜡烛', englishName: 'Candle', cost: { value: 1, unit: 'cp' }, weight: 0, rawWeight: '－' }),
  gear({ id: 'crossbow_bolt_case', name: '弩矢匣', englishName: 'Crossbow Bolt Case', cost: { value: 1, unit: 'gp' }, weight: 1, rawWeight: '1磅' }),
  gear({ id: 'map_scroll_case', name: '地图或卷轴匣', englishName: 'Map or Scroll Case', cost: { value: 1, unit: 'gp' }, weight: 1, rawWeight: '1磅' }),
  gear({ id: 'chain_10ft', name: '链条', englishName: 'Chain (10 feet)', cost: { value: 5, unit: 'gp' }, weight: 10, rawWeight: '10磅' }),
  gear({ id: 'chalk', name: '粉笔', englishName: 'Chalk (1 piece)', cost: { value: 1, unit: 'cp' }, weight: 0, rawWeight: '－' }),
  gear({ id: 'chest', name: '箱子', englishName: 'Chest', type: 'container', cost: { value: 5, unit: 'gp' }, weight: 25, rawWeight: '25磅' }),
  gear({ id: 'climbers_kit', name: '攀爬工具', englishName: "Climber's Kit", cost: { value: 25, unit: 'gp' }, weight: 12, rawWeight: '12磅' }),
  gear({ id: 'clothes_common', name: '普通服装', englishName: 'Clothes, Common', cost: { value: 5, unit: 'sp' }, weight: 3, rawWeight: '3磅' }),
  gear({ id: 'clothes_costume', name: '表演服装', englishName: 'Clothes, Costume', cost: { value: 5, unit: 'gp' }, weight: 4, rawWeight: '4磅' }),
  gear({ id: 'clothes_fine', name: '高档服装', englishName: 'Clothes, Fine', cost: { value: 15, unit: 'gp' }, weight: 6, rawWeight: '6磅' }),
  gear({ id: 'clothes_travelers', name: '旅行者服装', englishName: "Clothes, Traveler's", cost: { value: 2, unit: 'gp' }, weight: 4, rawWeight: '4磅' }),
  gear({ id: 'component_pouch', name: '材料包', englishName: 'Component Pouch', cost: { value: 25, unit: 'gp' }, weight: 2, rawWeight: '2磅' }),
  gear({ id: 'crowbar', name: '撬棍', englishName: 'Crowbar', cost: { value: 2, unit: 'gp' }, weight: 5, rawWeight: '5磅' }),
  gear({ id: 'sprig_of_mistletoe', name: '槲寄生枝条', englishName: 'Sprig of Mistletoe', group: '德鲁伊法器', cost: { value: 1, unit: 'gp' }, weight: 0, rawWeight: '－', description: fociDescriptions.druidic }),
  gear({ id: 'totem', name: '图腾', englishName: 'Totem', group: '德鲁伊法器', cost: { value: 1, unit: 'gp' }, weight: 0, rawWeight: '－', description: fociDescriptions.druidic }),
  gear({ id: 'wooden_staff', name: '木质法杖', englishName: 'Wooden Staff', group: '德鲁伊法器', cost: { value: 5, unit: 'gp' }, weight: 4, rawWeight: '4磅', description: fociDescriptions.druidic }),
  gear({ id: 'yew_wand', name: '紫杉魔杖', englishName: 'Yew Wand', group: '德鲁伊法器', cost: { value: 10, unit: 'gp' }, weight: 1, rawWeight: '1磅', description: fociDescriptions.druidic }),
  gear({ id: 'fishing_tackle', name: '渔具', englishName: 'Fishing Tackle', cost: { value: 1, unit: 'gp' }, weight: 4, rawWeight: '4磅' }),
  gear({ id: 'flask_tankard', name: '扁瓶或大杯', englishName: 'Flask or Tankard', type: 'container', cost: { value: 2, unit: 'cp' }, weight: 1, rawWeight: '1磅' }),
  gear({ id: 'grappling_hook', name: '爪钩', englishName: 'Grappling Hook', cost: { value: 2, unit: 'gp' }, weight: 4, rawWeight: '4磅' }),
  gear({ id: 'hammer', name: '锤子', englishName: 'Hammer', cost: { value: 1, unit: 'gp' }, weight: 3, rawWeight: '3磅' }),
  gear({ id: 'sledge_hammer', name: '大锤', englishName: 'Sledge Hammer', cost: { value: 2, unit: 'gp' }, weight: 10, rawWeight: '10磅' }),
  gear({ id: 'healers_kit', name: '医疗包', englishName: "Healer's Kit", cost: { value: 5, unit: 'gp' }, weight: 3, rawWeight: '3磅' }),
  gear({ id: 'holy_symbol_amulet', name: '圣徽：护符', englishName: 'Holy Symbol, Amulet', group: '圣徽', cost: { value: 5, unit: 'gp' }, weight: 1, rawWeight: '1磅', description: fociDescriptions.holy }),
  gear({ id: 'holy_symbol_emblem', name: '圣徽：徽章', englishName: 'Holy Symbol, Emblem', group: '圣徽', cost: { value: 5, unit: 'gp' }, weight: 0, rawWeight: '－', description: fociDescriptions.holy }),
  gear({ id: 'holy_symbol_reliquary', name: '圣徽：圣物匣', englishName: 'Holy Symbol, Reliquary', group: '圣徽', cost: { value: 5, unit: 'gp' }, weight: 2, rawWeight: '2磅', description: fociDescriptions.holy }),
  gear({ id: 'holy_water_flask', name: '圣水', englishName: 'Holy Water (flask)', cost: { value: 25, unit: 'gp' }, weight: 1, rawWeight: '1磅' }),
  gear({ id: 'hourglass', name: '沙漏', englishName: 'Hourglass', cost: { value: 25, unit: 'gp' }, weight: 1, rawWeight: '1磅' }),
  gear({ id: 'hunting_trap', name: '狩猎陷阱', englishName: 'Hunting Trap', cost: { value: 5, unit: 'gp' }, weight: 25, rawWeight: '25磅' }),
  gear({ id: 'ink_1oz', name: '墨水', englishName: 'Ink (1 ounce bottle)', cost: { value: 10, unit: 'gp' }, weight: 0, rawWeight: '－' }),
  gear({ id: 'ink_pen', name: '墨水笔', englishName: 'Ink Pen', cost: { value: 2, unit: 'cp' }, weight: 0, rawWeight: '－' }),
  gear({ id: 'jug_pitcher', name: '壶或罐', englishName: 'Jug or Pitcher', type: 'container', cost: { value: 2, unit: 'cp' }, weight: 4, rawWeight: '4磅' }),
  gear({ id: 'ladder_10ft', name: '爬梯', englishName: 'Ladder (10 feet)', cost: { value: 1, unit: 'sp' }, weight: 25, rawWeight: '25磅' }),
  gear({ id: 'lamp', name: '油灯', englishName: 'Lamp', cost: { value: 5, unit: 'sp' }, weight: 1, rawWeight: '1磅' }),
  gear({ id: 'lantern_bullseye', name: '牛眼提灯', englishName: 'Bullseye Lantern', cost: { value: 10, unit: 'gp' }, weight: 2, rawWeight: '2磅' }),
  gear({ id: 'lantern_hooded', name: '附盖提灯', englishName: 'Hooded Lantern', cost: { value: 5, unit: 'gp' }, weight: 2, rawWeight: '2磅' }),
  gear({ id: 'lock', name: '锁', englishName: 'Lock', cost: { value: 10, unit: 'gp' }, weight: 1, rawWeight: '1磅' }),
  gear({ id: 'magnifying_glass', name: '放大镜', englishName: 'Magnifying Glass', cost: { value: 100, unit: 'gp' }, weight: 0, rawWeight: '－' }),
  gear({ id: 'manacles', name: '镣铐', englishName: 'Manacles', cost: { value: 2, unit: 'gp' }, weight: 6, rawWeight: '6磅' }),
  gear({ id: 'mess_kit', name: '野炊工具', englishName: 'Mess Kit', cost: { value: 2, unit: 'sp' }, weight: 1, rawWeight: '1磅' }),
  gear({ id: 'steel_mirror', name: '钢面镜', englishName: 'Steel Mirror', cost: { value: 5, unit: 'gp' }, weight: 0.5, rawWeight: '1/2磅' }),
  gear({ id: 'oil_flask', name: '灯油', englishName: 'Oil (flask)', cost: { value: 1, unit: 'sp' }, weight: 1, rawWeight: '1磅' }),
  gear({ id: 'paper_sheet', name: '纸', englishName: 'Paper (one sheet)', cost: { value: 2, unit: 'sp' }, weight: 0, rawWeight: '－' }),
  gear({ id: 'parchment_sheet', name: '羊皮纸', englishName: 'Parchment (one sheet)', cost: { value: 1, unit: 'sp' }, weight: 0, rawWeight: '－' }),
  gear({ id: 'perfume_vial', name: '香水', englishName: 'Perfume (vial)', cost: { value: 5, unit: 'gp' }, weight: 0, rawWeight: '－' }),
  gear({ id: 'miners_pick', name: '矿工镐', englishName: "Miner's Pick", cost: { value: 2, unit: 'gp' }, weight: 10, rawWeight: '10磅' }),
  gear({ id: 'piton', name: '岩钉', englishName: 'Piton', cost: { value: 5, unit: 'cp' }, weight: 0.25, rawWeight: '1/4磅' }),
  gear({ id: 'basic_poison_vial', name: '基础毒药', englishName: 'Basic Poison (vial)', cost: { value: 100, unit: 'gp' }, weight: 0, rawWeight: '－' }),
  gear({ id: 'pole_10ft', name: '长杆', englishName: 'Pole (10 feet)', cost: { value: 5, unit: 'cp' }, weight: 7, rawWeight: '7磅' }),
  gear({ id: 'iron_pot', name: '铁壶', englishName: 'Iron Pot', type: 'container', cost: { value: 2, unit: 'gp' }, weight: 10, rawWeight: '10磅' }),
  gear({ id: 'potion_healing', name: '治疗药水', englishName: 'Potion of Healing', cost: { value: 50, unit: 'gp' }, weight: 0.5, rawWeight: '1/2磅' }),
  gear({ id: 'pouch', name: '小包', englishName: 'Pouch', type: 'container', cost: { value: 5, unit: 'sp' }, weight: 1, rawWeight: '1磅' }),
  gear({ id: 'quiver', name: '箭袋', englishName: 'Quiver', type: 'container', cost: { value: 1, unit: 'gp' }, weight: 1, rawWeight: '1磅' }),
  gear({ id: 'portable_ram', name: '便携式攻城锤', englishName: 'Portable Ram', cost: { value: 4, unit: 'gp' }, weight: 35, rawWeight: '35磅' }),
  gear({ id: 'rations', name: '口粮', englishName: 'Rations (1 day)', cost: { value: 5, unit: 'sp' }, weight: 2, rawWeight: '2磅' }),
  gear({ id: 'robes', name: '长袍', englishName: 'Robes', cost: { value: 1, unit: 'gp' }, weight: 4, rawWeight: '4磅' }),
  gear({ id: 'hempen_rope_50ft', name: '麻绳', englishName: 'Hempen Rope (50 feet)', cost: { value: 1, unit: 'gp' }, weight: 10, rawWeight: '10磅' }),
  gear({ id: 'silk_rope_50ft', name: '丝绳', englishName: 'Silk Rope (50 feet)', cost: { value: 10, unit: 'gp' }, weight: 5, rawWeight: '5磅' }),
  gear({ id: 'sack', name: '大袋子', englishName: 'Sack', type: 'container', cost: { value: 1, unit: 'cp' }, weight: 0.5, rawWeight: '1/2磅' }),
  gear({ id: 'merchants_scale', name: '商用天平', englishName: "Merchant's Scale", cost: { value: 5, unit: 'gp' }, weight: 3, rawWeight: '3磅' }),
  gear({ id: 'sealing_wax', name: '封蜡', englishName: 'Sealing Wax', cost: { value: 5, unit: 'sp' }, weight: 0, rawWeight: '－' }),
  gear({ id: 'shovel', name: '铲子', englishName: 'Shovel', cost: { value: 2, unit: 'gp' }, weight: 5, rawWeight: '5磅' }),
  gear({ id: 'signal_whistle', name: '信号笛', englishName: 'Signal Whistle', cost: { value: 5, unit: 'cp' }, weight: 0, rawWeight: '－' }),
  gear({ id: 'signet_ring', name: '玺戒', englishName: 'Signet Ring', cost: { value: 5, unit: 'gp' }, weight: 0, rawWeight: '－' }),
  gear({ id: 'soap', name: '肥皂', englishName: 'Soap', cost: { value: 2, unit: 'cp' }, weight: 0, rawWeight: '－' }),
  gear({ id: 'spellbook', name: '法术书', englishName: 'Spellbook', cost: { value: 50, unit: 'gp' }, weight: 3, rawWeight: '3磅' }),
  gear({ id: 'iron_spikes_10', name: '长铁钉', englishName: 'Iron Spikes (10)', cost: { value: 1, unit: 'gp' }, weight: 5, rawWeight: '5磅' }),
  gear({ id: 'spyglass', name: '望远镜', englishName: 'Spyglass', cost: { value: 1000, unit: 'gp' }, weight: 1, rawWeight: '1磅' }),
  gear({ id: 'tent_two_person', name: '双人帐篷', englishName: 'Two-Person Tent', cost: { value: 2, unit: 'gp' }, weight: 20, rawWeight: '20磅' }),
  gear({ id: 'tinderbox', name: '火绒盒', englishName: 'Tinderbox', cost: { value: 5, unit: 'sp' }, weight: 1, rawWeight: '1磅' }),
  gear({ id: 'torch', name: '火把', englishName: 'Torch', cost: { value: 1, unit: 'cp' }, weight: 1, rawWeight: '1磅' }),
  gear({ id: 'vial', name: '小瓶', englishName: 'Vial', type: 'container', cost: { value: 1, unit: 'gp' }, weight: 0, rawWeight: '－' }),
  gear({ id: 'waterskin', name: '水袋', englishName: 'Waterskin', type: 'container', cost: { value: 2, unit: 'sp' }, weight: 5, rawWeight: '5磅(盛满)' }),
  gear({ id: 'whetstone', name: '磨刀石', englishName: 'Whetstone', cost: { value: 1, unit: 'cp' }, weight: 1, rawWeight: '1磅' }),

  pack({ id: 'burglars_pack', name: '窃贼套组', englishName: "Burglar's Pack", cost: { value: 16, unit: 'gp' }, rawText: '包括一个背包、一包1000粒的滚珠、10尺弦线、一个铃铛、五支蜡烛、一根撬棍、一把锤子、十支岩钉、一盏附盖提灯、两支扁瓶灯油、五天份口粮、一个火绒盒、和一个水袋。背包外还挂着50尺麻绳。', contents: [{ id: 'backpack', quantity: 1 }, { id: 'ball_bearings', quantity: 1 }, { id: 'string_10ft', quantity: 1 }, { id: 'bell', quantity: 1 }, { id: 'candle', quantity: 5 }, { id: 'crowbar', quantity: 1 }, { id: 'hammer', quantity: 1 }, { id: 'piton', quantity: 10 }, { id: 'lantern_hooded', quantity: 1 }, { id: 'oil_flask', quantity: 2 }, { id: 'rations', quantity: 5 }, { id: 'tinderbox', quantity: 1 }, { id: 'waterskin', quantity: 1 }, { id: 'hempen_rope_50ft', quantity: 1, note: '挂在背包外' }] }),
  pack({ id: 'diplomats_pack', name: '大使套组', englishName: "Diplomat's Pack", cost: { value: 39, unit: 'gp' }, rawText: '包括一个箱子、两个地图或卷轴匣、一套高档服装、一瓶墨水、一支墨水笔、一盏油灯、两支扁瓶灯油、五张纸、一支小瓶香水、一块封蜡和一块肥皂。', contents: [{ id: 'chest', quantity: 1 }, { id: 'map_scroll_case', quantity: 2 }, { id: 'clothes_fine', quantity: 1 }, { id: 'ink_1oz', quantity: 1 }, { id: 'ink_pen', quantity: 1 }, { id: 'lamp', quantity: 1 }, { id: 'oil_flask', quantity: 2 }, { id: 'paper_sheet', quantity: 5 }, { id: 'perfume_vial', quantity: 1 }, { id: 'sealing_wax', quantity: 1 }, { id: 'soap', quantity: 1 }] }),
  pack({ id: 'dungeoneers_pack', name: '地城套组', englishName: "Dungeoneer's Pack", cost: { value: 12, unit: 'gp' }, rawText: '包括一个背包、一根撬棍、一把锤子、十支岩钉、十支火把、一个火绒盒、十天份口粮和一只水袋。背包外还挂着50尺麻绳。', contents: [{ id: 'backpack', quantity: 1 }, { id: 'crowbar', quantity: 1 }, { id: 'hammer', quantity: 1 }, { id: 'piton', quantity: 10 }, { id: 'torch', quantity: 10 }, { id: 'tinderbox', quantity: 1 }, { id: 'rations', quantity: 10 }, { id: 'waterskin', quantity: 1 }, { id: 'hempen_rope_50ft', quantity: 1, note: '挂在背包外' }] }),
  pack({ id: 'entertainers_pack', name: '艺人套组', englishName: "Entertainer's Pack", cost: { value: 40, unit: 'gp' }, rawText: '包括一个背包、一卷铺盖、两套表演服装、五支蜡烛、五天份口粮、一个水袋和一套易容工具。', contents: [{ id: 'backpack', quantity: 1 }, { id: 'bedroll', quantity: 1 }, { id: 'clothes_costume', quantity: 2 }, { id: 'candle', quantity: 5 }, { id: 'rations', quantity: 5 }, { id: 'waterskin', quantity: 1 }, { id: 'disguise_kit', quantity: 1 }] }),
  pack({ id: 'explorers_pack', name: '探索套组', englishName: "Explorer's Pack", cost: { value: 10, unit: 'gp' }, rawText: '包括一个背包、一卷铺盖、一套野炊工具、一个火绒盒、十支火把、十天份口粮和一个水袋。背包外还挂着50尺麻绳。', contents: [{ id: 'backpack', quantity: 1 }, { id: 'bedroll', quantity: 1 }, { id: 'mess_kit', quantity: 1 }, { id: 'tinderbox', quantity: 1 }, { id: 'torch', quantity: 10 }, { id: 'rations', quantity: 10 }, { id: 'waterskin', quantity: 1 }, { id: 'hempen_rope_50ft', quantity: 1, note: '挂在背包外' }] }),
  pack({ id: 'priests_pack', name: '祭司套组', englishName: "Priest's Pack", cost: { value: 19, unit: 'gp' }, rawText: '包括一个背包、一条毯子、十支蜡烛、一个火绒盒、一个募捐盒、两块熏香、一个香炉、祭袍、两天份口粮和一只水袋。', contents: [{ id: 'backpack', quantity: 1 }, { id: 'blanket', quantity: 1 }, { id: 'candle', quantity: 10 }, { id: 'tinderbox', quantity: 1 }, { id: 'alms_box', quantity: 1 }, { id: 'incense', quantity: 2 }, { id: 'censer', quantity: 1 }, { id: 'vestments', quantity: 1 }, { id: 'rations', quantity: 2 }, { id: 'waterskin', quantity: 1 }] }),
  pack({ id: 'scholars_pack', name: '学者套组', englishName: "Scholar's Pack", cost: { value: 40, unit: 'gp' }, rawText: '包括一个背包、一本学科书、一瓶墨水，一只墨水笔，十张羊皮纸，一小袋沙和一把小刀。', contents: [{ id: 'backpack', quantity: 1 }, { id: 'book', quantity: 1, note: '学科书' }, { id: 'ink_1oz', quantity: 1 }, { id: 'ink_pen', quantity: 1 }, { id: 'parchment_sheet', quantity: 10 }, { id: 'sand_bag', quantity: 1 }, { id: 'small_knife', quantity: 1 }] })
];
