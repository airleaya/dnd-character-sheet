import type { ItemIntakeAudit, ItemIntakeEntry } from '../itemIntake';

const GEMSTONE_SOURCE = 'DMG城主手册';
const GEMSTONE_CHECK_DATE = '2026-04-27';

interface GemstoneDraft {
  roll: number;
  value: number;
  die: string;
  name: string;
  englishName: string;
  description: string;
}

const GEMSTONE_USEFUL_FIELDS = [
  '来源',
  '价值档位',
  '骰表',
  '骰点',
  '中英文名称',
  '外观描述'
];

const gemstoneAudit = (draft: GemstoneDraft): ItemIntakeAudit => ({
  sourceMatched: true,
  checkedAt: GEMSTONE_CHECK_DATE,
  summary: `已核对 ${draft.name} 的价值、骰表编号、中英文名称和外观描述。`,
  issues: []
});

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

const gemstone = (draft: GemstoneDraft): ItemIntakeEntry => ({
  id: `gem_${draft.value}gp_${slugify(draft.englishName)}`,
  source: GEMSTONE_SOURCE,
  status: 'normalized',
  rawText: `价值${draft.value.toLocaleString()} gp的宝石 | ${draft.die}=${draft.roll} | ${draft.name}${draft.englishName}（${draft.description}）`,
  understanding: 'DMG宝石随机表条目，可作为宝物、贸易品或随机宝藏生成数据。',
  usefulFields: GEMSTONE_USEFUL_FIELDS,
  parsed: {
    id: `gem_${draft.value}gp_${slugify(draft.englishName)}`,
    name: `${draft.name} (${draft.englishName})`,
    type: 'treasure',
    cost: { value: draft.value, unit: 'gp' },
    weight: 0,
    description: draft.description,
    roll: draft.roll,
    die: draft.die,
    valueCategory: `${draft.value} gp`,
    tags: ['gemstone', `value_${draft.value}gp`]
  },
  audit: gemstoneAudit(draft)
});

const gems = (value: number, die: string, entries: Array<[number, string, string, string]>) =>
  entries.map(([roll, name, englishName, description]) => gemstone({ roll, value, die, name, englishName, description }));

export const DMG_GEMSTONE_INTAKE: ItemIntakeEntry[] = [
  ...gems(10, 'd12', [
    [1, '蓝铜矿', 'Azurite', '深蓝色斑驳纹理不透明宝石'],
    [2, '条纹玛瑙', 'Banded Agate', '棕色、蓝色、白色或红色条纹的透明宝石'],
    [3, '蓝水晶', 'Blue Quartz', '淡蓝色透明宝石'],
    [4, '眼纹玛瑙', 'Eye Agate', '灰色、白色、棕色、蓝色或绿色的半透明圆形宝石'],
    [5, '赭石', 'Hematite', '灰黑色不透明宝石'],
    [6, '天青石', 'Lapis Lazuli', '带黄斑的深浅蓝混色不透明宝石'],
    [7, '孔雀石', 'Malachite', '带条纹的深浅绿混色不透明宝石'],
    [8, '藓纹玛瑙', 'Moss Agate', '带灰色或绿色藓状斑点的粉色或黄白色透明宝石'],
    [9, '黑曜石', 'Obsidian', '黑色不透明宝石'],
    [10, '红纹石', 'Rhodochrosite', '浅粉色不透明宝石'],
    [11, '虎眼石', 'Tiger Eye', '棕色中部夹金的透明宝石'],
    [12, '绿松石', 'Turquoise', '浅青绿色不透明宝石']
  ]),
  ...gems(50, 'd12', [
    [1, '血石', 'Bloodstone', '带红斑的深灰色不透明宝石'],
    [2, '红玉髓', 'Carnelian', '橙色到棕红色的不透明宝石'],
    [3, '蓝玉髓', 'Chalcedony', '乳白色不透明宝石'],
    [4, '绿玉髓', 'Chrysoprase', '绿色不透明宝石'],
    [5, '黄水晶', 'Citrine', '浅黄褐色透明宝石'],
    [6, '碧玉', 'Jasper', '蓝色、黑色或褐色的不透明宝石'],
    [7, '月长石', 'Moonstone', '带淡蓝光芒的白色透明宝石'],
    [8, '缟玛瑙', 'Onyx', '黑白相间或纯黑、纯白色的不透明宝石'],
    [9, '石英', 'Quartz', '白色、烟灰色或黄色的透明宝石'],
    [10, '缠丝玛瑙', 'Sardonyx', '带红色和白色带状条纹的不透明宝石'],
    [11, '星光粉晶', 'Star Rose Quartz', '中央闪着白星的玫瑰色透明宝石'],
    [12, '锆石', 'Zircon', '淡青绿色的透明宝石']
  ]),
  ...gems(100, 'd10', [
    [1, '琥珀', 'Amber', '水金色到油金色的透明宝石'],
    [2, '紫晶', 'Amethyst', '深紫色的透明宝石'],
    [3, '金绿玉', 'Chrysoberyl', '黄绿色到淡绿色的透明宝石'],
    [4, '珊瑚', 'Coral', '深红色的不透明宝石'],
    [5, '石榴石', 'Garnet', '红色、棕绿色或紫色的透明宝石'],
    [6, '翡翠', 'Jade', '浅绿色、深绿色或白色的透明宝石'],
    [7, '黑玉', 'Jet', '深黑色的不透明宝石'],
    [8, '珍珠', 'Pearl', '带光泽的白色、黄色或粉红色不透明宝石'],
    [9, '尖晶石', 'Spinel', '红色、红褐色或深绿色的透明宝石'],
    [10, '电气石', 'Tourmaline', '淡绿色、蓝色、棕色或红色的透明宝石']
  ]),
  ...gems(500, 'd6', [
    [1, '紫翠玉', 'Alexandrite', '深绿色的透明宝石'],
    [2, '蓝晶', 'Aquamarine', '淡青绿色的透明宝石'],
    [3, '黑珍珠', 'Black Pearl', '纯黑色的不透明宝石'],
    [4, '蓝尖晶石', 'Blue Spinel', '深蓝色的透明宝石'],
    [5, '橄榄石', 'Peridot', '油橄榄绿色的透明宝石'],
    [6, '黄玉', 'Topaz', '金黄色的透明宝石']
  ]),
  ...gems(1000, 'd8', [
    [1, '黑蛋白石', 'Black Opal', '带黑影和金斑的深绿色透明宝石'],
    [2, '蓝色蓝宝石', 'Blue Sapphire', '蓝白色到中蓝色的透明宝石'],
    [3, '祖母绿', 'Emerald', '深翠绿色的透明宝石'],
    [4, '火蛋白石', 'Fire Opal', '火红色的透明宝石'],
    [5, '蛋白石', 'Opal', '带绿点和金点的淡蓝色透明宝石'],
    [6, '星彩红宝石', 'Star Ruby', '中央带白色星形的透明红宝石'],
    [7, '星彩蓝宝石', 'Star Sapphire', '中央带白色星形的透明蓝宝石'],
    [8, '黄色蓝宝石', 'Yellow Sapphire', '焰黄色或黄绿色的透明宝石']
  ]),
  ...gems(5000, 'd4', [
    [1, '黑蓝宝石', 'Black Sapphire', '闪耀高光带光泽的黑色半透明宝石'],
    [2, '钻石', 'Diamond', '蓝白色、鲜黄色、粉红色、棕色或蓝色的透明宝石'],
    [3, '红锆石', 'Jacinth', '焰橘色的透明宝石'],
    [4, '红宝石', 'Ruby', '红色到深红色的通透宝石']
  ])
];
