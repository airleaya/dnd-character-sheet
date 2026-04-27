import type { ItemIntakeAudit, ItemIntakeEntry } from '../itemIntake';

const TOOL_SOURCE = 'PHB玩家手册';
const TOOL_CHECK_DATE = '2026-04-27';

type ToolGroup = '工匠工具' | '赌具' | '乐器' | '通用工具';

interface ToolDraft {
  id: string;
  name: string;
  englishName: string;
  group: ToolGroup;
  cost?: { value: number; unit: 'cp' | 'sp' | 'gp' };
  weight?: number;
  rawCost: string;
  rawWeight: string;
  description?: string;
  auditIssues?: string[];
}

const TOOL_USEFUL_FIELDS = [
  '中英文名称',
  '工具类别',
  '价格',
  '重量',
  '熟练项说明',
  '用途说明'
];

const GROUP_DESCRIPTIONS: Record<ToolGroup, string> = {
  工匠工具: '这种特殊的工具类包括各种门类匠艺的使用工具。各个种类的工匠工具之间互不关联，其熟练项只能对相应工具起效。',
  赌具: '这种工具类包括各种竞技游戏工具。各个种类的赌具之间互不关联，其熟练项只能对相应工具起效。',
  乐器: '拥有乐器熟练项的角色，在使用相应乐器进行演奏的属性检定时，可以将熟练加值加入检定结果中。各个种类的乐器之间互不关联。',
  通用工具: '拥有该工具熟练项的角色，在使用该工具进行相关属性检定时，可以将熟练加值加入检定结果中。'
};

const SPECIFIC_DESCRIPTIONS: Record<string, string> = {
  disguise_kit: '袋装的工具包里包含化妆品、染发剂以及一些可以物理性改变容貌的小道具。拥有易容工具熟练项的角色，在使用该工具进行视觉伪装的属性检定时，可以将熟练加值加入检定结果中。',
  forgery_kit: '盒装的工具包内装着纸和羊皮纸、笔墨、印章、封蜡、金银叶饰，以及其他用以伪造信用文书的用品。拥有文书伪造工具熟练项的角色，在使用该工具进行伪造实物式信用文书的属性检定时，可以将熟练加值加入检定结果中。',
  herbalism_kit: '一整副工具包里包含钳剪、杵磨、袋子、瓶子等器具，以供草药师制作药膏和药水。拥有草药工具熟练项的角色，在使用该工具进行鉴别或应用草药的属性检定时，可以将熟练加值加入检定结果中。你要拥有草药工具熟练项才可制作抗毒剂或治疗药水。',
  navigators_tools: '一整副领航工具被用于海上航行的导航工作。拥有领航工具熟练项的角色，在绘制航线、跟随航线，以及避免在海上迷失方向的属性检定时，可以将熟练加值加入检定结果中。',
  poisoners_kit: '一整副工具包里包含若干小瓶、各种化学品，以及其他用以制造毒药的必须用具。拥有制毒工具熟练项的角色，在使用该工具进行制造或使用毒药的属性检定时，可以将熟练加值加入检定结果中。',
  thieves_tools: '整套工具包括一把细锉刀、一套撬锁工具、一个附柄小镜、一把尖嘴剪和一把镊子。拥有盗贼工具熟练项的角色，在使用该工具进行解除陷阱或撬锁的属性检定时，可以将熟练加值加入检定结果中。'
};

const toolAudit = (draft: ToolDraft): ItemIntakeAudit => ({
  sourceMatched: !draft.auditIssues?.length,
  checkedAt: TOOL_CHECK_DATE,
  summary: `已核对 ${draft.name} 的名称、类别、价格、重量和工具说明。`,
  issues: draft.auditIssues ?? []
});

const tool = (draft: ToolDraft): ItemIntakeEntry => ({
  id: `tool_${draft.id}`,
  source: TOOL_SOURCE,
  status: 'parsed',
  rawText: `${draft.name}${draft.englishName ? ` ${draft.englishName}` : ''} | ${draft.rawCost} | ${draft.rawWeight}`,
  understanding: `${draft.group}条目，来自PHB工具表。`,
  usefulFields: TOOL_USEFUL_FIELDS,
  parsed: {
    id: draft.id,
    name: `${draft.name} (${draft.englishName})`,
    type: 'tool',
    cost: draft.cost,
    weight: draft.weight,
    description: draft.description ?? SPECIFIC_DESCRIPTIONS[draft.id] ?? GROUP_DESCRIPTIONS[draft.group],
    tags: [draft.group]
  },
  audit: toolAudit(draft)
});

export const PHB_TOOL_INTAKE: ItemIntakeEntry[] = [
  tool({ id: 'alchemists_supplies', name: '炼金工具', englishName: "Alchemist's Supplies", group: '工匠工具', cost: { value: 50, unit: 'gp' }, weight: 8, rawCost: '50 gp', rawWeight: '8磅' }),
  tool({ id: 'brewers_supplies', name: '酿酒工具', englishName: "Brewer's Supplies", group: '工匠工具', cost: { value: 20, unit: 'gp' }, weight: 9, rawCost: '20 gp', rawWeight: '9磅' }),
  tool({ id: 'calligraphers_supplies', name: '书法工具', englishName: "Calligrapher's Supplies", group: '工匠工具', cost: { value: 10, unit: 'gp' }, weight: 5, rawCost: '10 gp', rawWeight: '5磅' }),
  tool({ id: 'carpenters_tools', name: '木匠工具', englishName: "Carpenter's Tools", group: '工匠工具', cost: { value: 8, unit: 'gp' }, weight: 6, rawCost: '8 gp', rawWeight: '6磅' }),
  tool({ id: 'cartographers_tools', name: '制图工具', englishName: "Cartographer's Tools", group: '工匠工具', cost: { value: 15, unit: 'gp' }, weight: 6, rawCost: '15 gp', rawWeight: '6磅' }),
  tool({ id: 'cobblers_tools', name: '鞋匠工具', englishName: "Cobbler's Tools", group: '工匠工具', cost: { value: 5, unit: 'gp' }, weight: 5, rawCost: '5 gp', rawWeight: '5磅' }),
  tool({ id: 'cooks_utensils', name: '厨师工具', englishName: "Cook's Utensils", group: '工匠工具', cost: { value: 1, unit: 'gp' }, weight: 8, rawCost: '1 gp', rawWeight: '8磅' }),
  tool({ id: 'glassblowers_tools', name: '玻璃匠工具', englishName: "Glassblower's Tools", group: '工匠工具', cost: { value: 30, unit: 'gp' }, weight: 5, rawCost: '30 gp', rawWeight: '5磅' }),
  tool({ id: 'jewelers_tools', name: '珠宝匠工具', englishName: "Jeweler's Tools", group: '工匠工具', cost: { value: 25, unit: 'gp' }, weight: 2, rawCost: '25 gp', rawWeight: '2磅' }),
  tool({ id: 'leatherworkers_tools', name: '皮匠工具', englishName: "Leatherworker's Tools", group: '工匠工具', cost: { value: 5, unit: 'gp' }, weight: 5, rawCost: '5 gp', rawWeight: '5磅' }),
  tool({ id: 'masons_tools', name: '泥瓦匠工具', englishName: "Mason's Tools", group: '工匠工具', cost: { value: 10, unit: 'gp' }, weight: 8, rawCost: '10 gp', rawWeight: '8磅' }),
  tool({ id: 'painters_supplies', name: '画家工具', englishName: "Painter's Supplies", group: '工匠工具', cost: { value: 10, unit: 'gp' }, weight: 5, rawCost: '10 gp', rawWeight: '5磅' }),
  tool({ id: 'potters_tools', name: '陶匠工具', englishName: "Potter's Tools", group: '工匠工具', cost: { value: 10, unit: 'gp' }, weight: 3, rawCost: '10 gp', rawWeight: '3磅' }),
  tool({ id: 'smiths_tools', name: '铁匠工具', englishName: "Smith's Tools", group: '工匠工具', cost: { value: 20, unit: 'gp' }, weight: 8, rawCost: '20 gp', rawWeight: '8磅' }),
  tool({ id: 'tinkers_tools', name: '修补工具', englishName: "Tinker's Tools", group: '工匠工具', cost: { value: 50, unit: 'gp' }, weight: 10, rawCost: '50 gp', rawWeight: '10磅' }),
  tool({ id: 'weavers_tools', name: '织布工具', englishName: "Weaver's Tools", group: '工匠工具', cost: { value: 1, unit: 'gp' }, weight: 5, rawCost: '1 gp', rawWeight: '5磅' }),
  tool({ id: 'woodcarvers_tools', name: '木雕工具', englishName: "Woodcarver's Tools", group: '工匠工具', cost: { value: 1, unit: 'gp' }, weight: 5, rawCost: '1 gp', rawWeight: '5磅' }),
  tool({ id: 'disguise_kit', name: '易容工具', englishName: 'Disguise Kit', group: '通用工具', cost: { value: 25, unit: 'gp' }, weight: 3, rawCost: '25 gp', rawWeight: '3磅' }),
  tool({ id: 'forgery_kit', name: '文书伪造工具', englishName: 'Forgery Kit', group: '通用工具', cost: { value: 15, unit: 'gp' }, weight: 5, rawCost: '15 gp', rawWeight: '5磅' }),
  tool({ id: 'dice_set', name: '整副骰子', englishName: 'Dice Set', group: '赌具', cost: { value: 1, unit: 'sp' }, weight: 0, rawCost: '1 sp', rawWeight: '－' }),
  tool({ id: 'dragonchess_set', name: '整套龙棋', englishName: 'Dragonchess Set', group: '赌具', cost: { value: 5, unit: 'sp' }, weight: 0.5, rawCost: '5 sp', rawWeight: '1/2磅' }),
  tool({ id: 'playing_card_set', name: '整副纸牌', englishName: 'Playing Card Set', group: '赌具', cost: { value: 5, unit: 'sp' }, weight: 0, rawCost: '5 sp', rawWeight: '－' }),
  tool({ id: 'three_dragon_ante_set', name: '整副三龙牌', englishName: 'Three-Dragon Ante Set', group: '赌具', cost: { value: 5, unit: 'gp' }, weight: 3, rawCost: '5 gp', rawWeight: '3磅' }),
  tool({ id: 'herbalism_kit', name: '草药工具', englishName: 'Herbalism Kit', group: '通用工具', cost: { value: 5, unit: 'gp' }, weight: 3, rawCost: '5 gp', rawWeight: '3磅' }),
  tool({ id: 'bagpipes', name: '风笛', englishName: 'Bagpipes', group: '乐器', cost: { value: 30, unit: 'gp' }, weight: 6, rawCost: '30 gp', rawWeight: '6磅' }),
  tool({ id: 'drum', name: '鼓', englishName: 'Drum', group: '乐器', cost: { value: 6, unit: 'gp' }, weight: 3, rawCost: '6 gp', rawWeight: '3磅' }),
  tool({ id: 'dulcimer', name: '扬琴', englishName: 'Dulcimer', group: '乐器', cost: { value: 25, unit: 'gp' }, weight: 10, rawCost: '25 gp', rawWeight: '10磅' }),
  tool({ id: 'flute', name: '长笛', englishName: 'Flute', group: '乐器', cost: { value: 2, unit: 'gp' }, weight: 1, rawCost: '2 gp', rawWeight: '1磅' }),
  tool({ id: 'lute', name: '鲁特琴', englishName: 'Lute', group: '乐器', cost: { value: 35, unit: 'gp' }, weight: 2, rawCost: '35 gp', rawWeight: '2磅' }),
  tool({ id: 'lyre', name: '里拉琴', englishName: 'Lyre', group: '乐器', cost: { value: 30, unit: 'gp' }, weight: 2, rawCost: '30 gp', rawWeight: '2磅' }),
  tool({ id: 'horn', name: '角号', englishName: 'Horn', group: '乐器', cost: { value: 3, unit: 'gp' }, weight: 2, rawCost: '3 gp', rawWeight: '2磅' }),
  tool({ id: 'pan_flute', name: '排箫', englishName: 'Pan Flute', group: '乐器', cost: { value: 12, unit: 'gp' }, weight: 2, rawCost: '12 gp', rawWeight: '2磅' }),
  tool({ id: 'shawm', name: '芦笛', englishName: 'Shawm', group: '乐器', cost: { value: 2, unit: 'gp' }, weight: 1, rawCost: '2 gp', rawWeight: '1磅' }),
  tool({ id: 'viol', name: '提琴', englishName: 'Viol', group: '乐器', cost: { value: 30, unit: 'gp' }, weight: 1, rawCost: '30 gp', rawWeight: '1磅' }),
  tool({ id: 'navigators_tools', name: '领航工具', englishName: "Navigator's Tools", group: '通用工具', cost: { value: 25, unit: 'gp' }, weight: 2, rawCost: '25 gp', rawWeight: '2磅' }),
  tool({ id: 'poisoners_kit', name: '制毒工具', englishName: "Poisoner's Kit", group: '通用工具', cost: { value: 50, unit: 'gp' }, weight: 2, rawCost: '50 gp', rawWeight: '2磅' }),
  tool({ id: 'thieves_tools', name: '盗贼工具', englishName: "Thieves' Tools", group: '通用工具', cost: { value: 25, unit: 'gp' }, weight: 1, rawCost: '25 gp', rawWeight: '1磅' })
];
