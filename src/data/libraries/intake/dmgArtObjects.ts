import type { ItemIntakeAudit, ItemIntakeEntry } from '../itemIntake';

const ART_OBJECT_SOURCE = 'DMG城主手册';
const ART_OBJECT_CHECK_DATE = '2026-04-27';

interface ArtObjectDraft {
  roll: number;
  value: number;
  die: string;
  name: string;
  englishName: string;
  auditIssues?: string[];
}

const ART_OBJECT_USEFUL_FIELDS = [
  '来源',
  '价值档位',
  '骰表',
  '骰点',
  '中文描述',
  '英文核心物品名'
];

const artAudit = (draft: ArtObjectDraft): ItemIntakeAudit => ({
  sourceMatched: !draft.auditIssues?.length,
  checkedAt: ART_OBJECT_CHECK_DATE,
  summary: `已核对 ${draft.name} 的价值、骰表编号、中文描述和英文核心物品名。`,
  issues: draft.auditIssues ?? []
});

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

const artObject = (draft: ArtObjectDraft): ItemIntakeEntry => ({
  id: `art_${draft.value}gp_${draft.roll}_${slugify(draft.englishName)}`,
  source: ART_OBJECT_SOURCE,
  status: 'normalized',
  rawText: `价值${draft.value.toLocaleString()} gp的艺术品 | ${draft.die}=${draft.roll} | ${draft.name}${draft.englishName}`,
  understanding: 'DMG艺术品随机表条目，可作为宝物、收藏品或随机宝藏生成数据。',
  usefulFields: ART_OBJECT_USEFUL_FIELDS,
  notes: draft.auditIssues?.length ? '该价值档位的原文骰表与已提供条目数量不完全一致。' : undefined,
  parsed: {
    id: `art_${draft.value}gp_${draft.roll}_${slugify(draft.englishName)}`,
    name: `${draft.name} (${draft.englishName})`,
    type: 'treasure',
    cost: { value: draft.value, unit: 'gp' },
    weight: 0,
    description: draft.name,
    roll: draft.roll,
    die: draft.die,
    valueCategory: `${draft.value} gp`,
    tags: ['art_object', `value_${draft.value}gp`]
  },
  audit: artAudit(draft)
});

const artObjects = (value: number, die: string, entries: Array<[number, string, string, string?]>) =>
  entries.map(([roll, name, englishName, issue]) => artObject({
    roll,
    value,
    die,
    name,
    englishName,
    auditIssues: issue ? [issue] : undefined
  }));

const missingHighValueRowsIssue = '原文标题为“价值7,500 gp的艺术品 d10”，但本次输入只提供了1-8号条目；9-10号缺失，后续如补充需追加。';

export const DMG_ART_OBJECT_INTAKE: ItemIntakeEntry[] = [
  ...artObjects(25, 'd10', [
    [1, '银水壶', 'Ewer'],
    [2, '骨制雕像', 'Statuette'],
    [3, '金制小手镯', 'Bracelet'],
    [4, '金丝织制的法衣', 'Vestments'],
    [5, '由银丝缝制的黑天鹅绒面具', 'Mask'],
    [6, '点缀着银丝的铜制酒杯', 'Chalice'],
    [7, '成对的骨制骰子', 'Dice'],
    [8, '镶在彩绘木框中的小镜子', 'Mirror'],
    [9, '绣花丝绸手帕', 'Handkerchief'],
    [10, '内里画着彩绘肖像的金质链坠盒', 'Locket']
  ]),
  ...artObjects(250, 'd10', [
    [1, '镶有血石的金戒指', 'Ring'],
    [2, '象牙制雕像', 'Statuette'],
    [3, '金质大手镯', 'Bracelet'],
    [4, '带宝石坠饰的银项链', 'Necklace'],
    [5, '青铜王冠', 'Crown'],
    [6, '带金色刺绣的丝绸长袍', 'Robe'],
    [7, '造工精良的大壁毯', 'Tapestry'],
    [8, '镶有翡翠的黄铜马克杯', 'Mug'],
    [9, '装着绿松石动物塑像的盒子', 'Box'],
    [10, '带银金装饰的黄金鸟笼', 'Bird Cage']
  ]),
  ...artObjects(750, 'd10', [
    [1, '镶有月长石的银酒杯', 'Chalice'],
    [2, '剑柄上镶嵌着黑玉的钢质镀银长剑', 'Longsword'],
    [3, '由异国木材精雕而成，以锆石和象牙装饰的竖琴', 'Harp'],
    [4, '金质小型神像', 'Idol'],
    [5, '镶有红色石榴石作双眼的金龙形梳子', 'Comb'],
    [6, '压印着金箔并镶有紫晶的软木瓶塞', 'Cork'],
    [7, '柄端镶着黑珍珠的银金质仪式匕首', 'Dagger'],
    [8, '由白银和黄金制成的胸针', 'Brooch'],
    [9, '带黄金配件和嵌体的黑曜石雕像', 'Statuette'],
    [10, '涂成金色的战争面具', 'Mask']
  ]),
  ...artObjects(2500, 'd10', [
    [1, '镶有火蛋白石的纯金链条', 'Chain'],
    [2, '古老的油画杰作', 'Masterpiece Painting'],
    [3, '镶有众多月长石且由绣花丝绸和天鹅绒织造而成的披风', 'Mantle'],
    [4, '镶一枚蓝宝石的铂金手镯', 'Bracelet'],
    [5, '镶着碎宝石的绣花手套', 'Glove'],
    [6, '宝石脚镯', 'Anklet'],
    [7, '黄金音乐盒', 'Music Box'],
    [8, '镶有四颗蓝晶的黄金头饰', 'Circlet'],
    [9, '用蓝色蓝宝石和月长石来模仿眼睛的眼罩', 'Eye Patch'],
    [10, '串有小粒粉红珍珠的项链', 'Necklace']
  ]),
  ...artObjects(7500, 'd10', [
    [1, '镶有宝石的黄金王冠', 'Crown', missingHighValueRowsIssue],
    [2, '镶有宝石的铂金戒指', 'Ring', missingHighValueRowsIssue],
    [3, '镶有红宝石的小型黄金雕像', 'Statuette', missingHighValueRowsIssue],
    [4, '镶有祖母绿的金杯', 'Cup', missingHighValueRowsIssue],
    [5, '饰有铂金丝的黄金首饰盒', 'Jewelry Box', missingHighValueRowsIssue],
    [6, '涂成金色的儿童石棺', 'Sarcophagus', missingHighValueRowsIssue],
    [7, '翡翠游戏盘和纯金棋子', 'Playing Pieces', missingHighValueRowsIssue],
    [8, '镶有宝石的金丝象牙角杯', 'Drinking Horn', missingHighValueRowsIssue]
  ])
];
