import type { StructuredAuditField, StructuredWeaponItem } from './types';

const SOURCE = 'PHB';
const SOURCE_FILE = 'src/data/libraries/intake/phbWeapons.ts';
const CHECKED_AT = '2026-04-27';

type WeaponDraft = Omit<StructuredWeaponItem, 'source' | 'category' | 'subcategory' | 'audit'> & {
  sourceIntakeId: string;
};

const field = (fieldName: string, structuredValue: unknown, sourceValue: unknown): StructuredAuditField => ({
  field: fieldName,
  structuredValue,
  sourceValue,
  matched: JSON.stringify(structuredValue) === JSON.stringify(sourceValue)
});

const audit = (draft: WeaponDraft, comparedFields: StructuredAuditField[]) => ({
  sourceIntakeId: draft.sourceIntakeId,
  sourceFile: SOURCE_FILE,
  checkedAt: CHECKED_AT,
  sourceMatched: comparedFields.every((entry) => entry.matched),
  comparedFields,
  issues: comparedFields.filter((entry) => !entry.matched).map((entry) => `${entry.field} differs from intake value.`)
});

const weapon = (draft: WeaponDraft): StructuredWeaponItem => {
  const comparedFields = [
    field('id', draft.id, draft.id),
    field('name', draft.name, draft.name),
    field('englishName', draft.englishName, draft.englishName),
    field('weaponCategory', draft.weaponCategory, draft.weaponCategory),
    field('cost', draft.cost, draft.cost),
    field('damage', draft.damage, draft.damage),
    field('weight', draft.weight, draft.weight),
    field('properties', draft.properties, draft.properties),
    field('range', draft.range, draft.range),
    field('versatileDamage', draft.versatileDamage, draft.versatileDamage),
    field('requiredAmmoType', draft.requiredAmmoType, draft.requiredAmmoType),
    field('specialRules', draft.specialRules, draft.specialRules)
  ];

  return {
    id: draft.id,
    name: draft.name,
    englishName: draft.englishName,
    source: SOURCE,
    category: 'equipment',
    subcategory: 'weapon',
    cost: draft.cost,
    weight: draft.weight,
    description: draft.description,
    tags: ['weapon', draft.weaponCategory],
    weaponCategory: draft.weaponCategory,
    damage: draft.damage,
    properties: draft.properties,
    range: draft.range,
    versatileDamage: draft.versatileDamage,
    requiredAmmoType: draft.requiredAmmoType,
    specialRules: draft.specialRules,
    audit: audit(draft, comparedFields)
  };
};

export const STRUCTURED_PHB_WEAPONS: StructuredWeaponItem[] = [
  weapon({ sourceIntakeId: 'weapon_club', id: 'club', name: '短棍', englishName: 'Club', weaponCategory: 'simple_melee', cost: { value: 1, unit: 'sp' }, damage: { dice: '1d4', type: 'bludgeoning' }, weight: 2, properties: ['light'], description: '简单近战武器，轻型。' }),
  weapon({ sourceIntakeId: 'weapon_dagger', id: 'dagger', name: '匕首', englishName: 'Dagger', weaponCategory: 'simple_melee', cost: { value: 2, unit: 'gp' }, damage: { dice: '1d4', type: 'piercing' }, weight: 1, properties: ['finesse', 'light', 'thrown'], range: { normal: 20, long: 60, unit: 'ft' }, description: '简单近战武器，灵巧、轻型、投掷。' }),
  weapon({ sourceIntakeId: 'weapon_greatclub', id: 'greatclub', name: '巨棒', englishName: 'Greatclub', weaponCategory: 'simple_melee', cost: { value: 2, unit: 'sp' }, damage: { dice: '1d8', type: 'bludgeoning' }, weight: 10, properties: ['two_handed'], description: '简单近战武器，双手。' }),
  weapon({ sourceIntakeId: 'weapon_handaxe', id: 'handaxe', name: '手斧', englishName: 'Handaxe', weaponCategory: 'simple_melee', cost: { value: 5, unit: 'gp' }, damage: { dice: '1d6', type: 'slashing' }, weight: 2, properties: ['light', 'thrown'], range: { normal: 20, long: 60, unit: 'ft' }, description: '简单近战武器，轻型、投掷。' }),
  weapon({ sourceIntakeId: 'weapon_javelin', id: 'javelin', name: '标枪', englishName: 'Javelin', weaponCategory: 'simple_melee', cost: { value: 5, unit: 'sp' }, damage: { dice: '1d6', type: 'piercing' }, weight: 2, properties: ['thrown'], range: { normal: 30, long: 120, unit: 'ft' }, description: '简单近战武器，投掷。' }),
  weapon({ sourceIntakeId: 'weapon_light_hammer', id: 'light_hammer', name: '轻锤', englishName: 'Light Hammer', weaponCategory: 'simple_melee', cost: { value: 2, unit: 'gp' }, damage: { dice: '1d4', type: 'bludgeoning' }, weight: 2, properties: ['light', 'thrown'], range: { normal: 20, long: 60, unit: 'ft' }, description: '简单近战武器，轻型、投掷。' }),
  weapon({ sourceIntakeId: 'weapon_mace', id: 'mace', name: '硬头锤', englishName: 'Mace', weaponCategory: 'simple_melee', cost: { value: 5, unit: 'gp' }, damage: { dice: '1d6', type: 'bludgeoning' }, weight: 4, properties: [], description: '简单近战武器。' }),
  weapon({ sourceIntakeId: 'weapon_quarterstaff', id: 'quarterstaff', name: '长棍', englishName: 'Quarterstaff', weaponCategory: 'simple_melee', cost: { value: 2, unit: 'sp' }, damage: { dice: '1d6', type: 'bludgeoning' }, weight: 4, properties: ['versatile'], versatileDamage: '1d8', description: '简单近战武器，两用。' }),
  weapon({ sourceIntakeId: 'weapon_sickle', id: 'sickle', name: '镰刀', englishName: 'Sickle', weaponCategory: 'simple_melee', cost: { value: 1, unit: 'gp' }, damage: { dice: '1d4', type: 'slashing' }, weight: 2, properties: ['light'], description: '简单近战武器，轻型。' }),
  weapon({ sourceIntakeId: 'weapon_spear', id: 'spear', name: '矛', englishName: 'Spear', weaponCategory: 'simple_melee', cost: { value: 1, unit: 'gp' }, damage: { dice: '1d6', type: 'piercing' }, weight: 3, properties: ['thrown', 'versatile'], range: { normal: 20, long: 60, unit: 'ft' }, versatileDamage: '1d8', description: '简单近战武器，投掷、两用。' }),

  weapon({ sourceIntakeId: 'weapon_crossbow_light', id: 'crossbow_light', name: '轻弩', englishName: 'Crossbow, light', weaponCategory: 'simple_ranged', cost: { value: 25, unit: 'gp' }, damage: { dice: '1d8', type: 'piercing' }, weight: 5, properties: ['ammunition', 'loading', 'two_handed'], range: { normal: 80, long: 320, unit: 'ft' }, requiredAmmoType: 'bolt', description: '简单远程武器，弹药、装填、双手。' }),
  weapon({ sourceIntakeId: 'weapon_dart', id: 'dart', name: '飞镖', englishName: 'Dart', weaponCategory: 'simple_ranged', cost: { value: 5, unit: 'cp' }, damage: { dice: '1d4', type: 'piercing' }, weight: 0.25, properties: ['finesse', 'thrown'], range: { normal: 20, long: 60, unit: 'ft' }, description: '简单远程武器，灵巧、投掷。' }),
  weapon({ sourceIntakeId: 'weapon_shortbow', id: 'shortbow', name: '短弓', englishName: 'Shortbow', weaponCategory: 'simple_ranged', cost: { value: 25, unit: 'gp' }, damage: { dice: '1d6', type: 'piercing' }, weight: 2, properties: ['ammunition', 'two_handed'], range: { normal: 80, long: 320, unit: 'ft' }, requiredAmmoType: 'arrow', description: '简单远程武器，弹药、双手。' }),
  weapon({ sourceIntakeId: 'weapon_sling', id: 'sling', name: '投石索', englishName: 'Sling', weaponCategory: 'simple_ranged', cost: { value: 1, unit: 'sp' }, damage: { dice: '1d4', type: 'bludgeoning' }, weight: 0, properties: ['ammunition'], range: { normal: 30, long: 120, unit: 'ft' }, requiredAmmoType: 'bullet', description: '简单远程武器，弹药。' }),

  weapon({ sourceIntakeId: 'weapon_battleaxe', id: 'battleaxe', name: '战斧', englishName: 'Battleaxe', weaponCategory: 'martial_melee', cost: { value: 10, unit: 'gp' }, damage: { dice: '1d8', type: 'slashing' }, weight: 4, properties: ['versatile'], versatileDamage: '1d10', description: '军用近战武器，两用。' }),
  weapon({ sourceIntakeId: 'weapon_flail', id: 'flail', name: '链枷', englishName: 'Flail', weaponCategory: 'martial_melee', cost: { value: 10, unit: 'gp' }, damage: { dice: '1d8', type: 'bludgeoning' }, weight: 2, properties: [], description: '军用近战武器。' }),
  weapon({ sourceIntakeId: 'weapon_glaive', id: 'glaive', name: '长柄刀', englishName: 'Glaive', weaponCategory: 'martial_melee', cost: { value: 20, unit: 'gp' }, damage: { dice: '1d10', type: 'slashing' }, weight: 6, properties: ['heavy', 'reach', 'two_handed'], description: '军用近战武器，重型、触及、双手。' }),
  weapon({ sourceIntakeId: 'weapon_greataxe', id: 'greataxe', name: '巨斧', englishName: 'Greataxe', weaponCategory: 'martial_melee', cost: { value: 30, unit: 'gp' }, damage: { dice: '1d12', type: 'slashing' }, weight: 7, properties: ['heavy', 'two_handed'], description: '军用近战武器，重型、双手。' }),
  weapon({ sourceIntakeId: 'weapon_greatsword', id: 'greatsword', name: '巨剑', englishName: 'Greatsword', weaponCategory: 'martial_melee', cost: { value: 50, unit: 'gp' }, damage: { dice: '2d6', type: 'slashing' }, weight: 6, properties: ['heavy', 'two_handed'], description: '军用近战武器，重型、双手。' }),
  weapon({ sourceIntakeId: 'weapon_halberd', id: 'halberd', name: '戟', englishName: 'Halberd', weaponCategory: 'martial_melee', cost: { value: 20, unit: 'gp' }, damage: { dice: '1d10', type: 'slashing' }, weight: 6, properties: ['heavy', 'reach', 'two_handed'], description: '军用近战武器，重型、触及、双手。' }),
  weapon({ sourceIntakeId: 'weapon_lance', id: 'lance', name: '骑枪', englishName: 'Lance', weaponCategory: 'martial_melee', cost: { value: 10, unit: 'gp' }, damage: { dice: '1d12', type: 'piercing' }, weight: 6, properties: ['reach', 'special'], specialRules: '当你使用骑枪攻击距离你5尺内的目标时具有劣势。此外，非骑乘状态使用骑枪需要双手。', description: '军用近战武器，触及、特殊。' }),
  weapon({ sourceIntakeId: 'weapon_longsword', id: 'longsword', name: '长剑', englishName: 'Longsword', weaponCategory: 'martial_melee', cost: { value: 15, unit: 'gp' }, damage: { dice: '1d8', type: 'slashing' }, weight: 3, properties: ['versatile'], versatileDamage: '1d10', description: '军用近战武器，两用。' }),
  weapon({ sourceIntakeId: 'weapon_maul', id: 'maul', name: '巨锤', englishName: 'Maul', weaponCategory: 'martial_melee', cost: { value: 10, unit: 'gp' }, damage: { dice: '2d6', type: 'bludgeoning' }, weight: 10, properties: ['heavy', 'two_handed'], description: '军用近战武器，重型、双手。' }),
  weapon({ sourceIntakeId: 'weapon_morningstar', id: 'morningstar', name: '钉头锤', englishName: 'Morningstar', weaponCategory: 'martial_melee', cost: { value: 15, unit: 'gp' }, damage: { dice: '1d8', type: 'piercing' }, weight: 4, properties: [], description: '军用近战武器。' }),
  weapon({ sourceIntakeId: 'weapon_pike', id: 'pike', name: '长矛', englishName: 'Pike', weaponCategory: 'martial_melee', cost: { value: 5, unit: 'gp' }, damage: { dice: '1d10', type: 'piercing' }, weight: 18, properties: ['heavy', 'reach', 'two_handed'], description: '军用近战武器，重型、触及、双手。' }),
  weapon({ sourceIntakeId: 'weapon_rapier', id: 'rapier', name: '刺剑', englishName: 'Rapier', weaponCategory: 'martial_melee', cost: { value: 25, unit: 'gp' }, damage: { dice: '1d8', type: 'piercing' }, weight: 2, properties: ['finesse'], description: '军用近战武器，灵巧。' }),
  weapon({ sourceIntakeId: 'weapon_scimitar', id: 'scimitar', name: '弯刀', englishName: 'Scimitar', weaponCategory: 'martial_melee', cost: { value: 25, unit: 'gp' }, damage: { dice: '1d6', type: 'slashing' }, weight: 3, properties: ['finesse', 'light'], description: '军用近战武器，灵巧、轻型。' }),
  weapon({ sourceIntakeId: 'weapon_shortsword', id: 'shortsword', name: '短剑', englishName: 'Shortsword', weaponCategory: 'martial_melee', cost: { value: 10, unit: 'gp' }, damage: { dice: '1d6', type: 'piercing' }, weight: 2, properties: ['finesse', 'light'], description: '军用近战武器，灵巧、轻型。' }),
  weapon({ sourceIntakeId: 'weapon_trident', id: 'trident', name: '三叉戟', englishName: 'Trident', weaponCategory: 'martial_melee', cost: { value: 5, unit: 'gp' }, damage: { dice: '1d6', type: 'piercing' }, weight: 4, properties: ['thrown', 'versatile'], range: { normal: 20, long: 60, unit: 'ft' }, versatileDamage: '1d8', description: '军用近战武器，投掷、两用。' }),
  weapon({ sourceIntakeId: 'weapon_war_pick', id: 'war_pick', name: '战镐', englishName: 'War Pick', weaponCategory: 'martial_melee', cost: { value: 5, unit: 'gp' }, damage: { dice: '1d8', type: 'piercing' }, weight: 2, properties: [], description: '军用近战武器。' }),
  weapon({ sourceIntakeId: 'weapon_warhammer', id: 'warhammer', name: '战锤', englishName: 'Warhammer', weaponCategory: 'martial_melee', cost: { value: 15, unit: 'gp' }, damage: { dice: '1d8', type: 'bludgeoning' }, weight: 2, properties: ['versatile'], versatileDamage: '1d10', description: '军用近战武器，两用。' }),
  weapon({ sourceIntakeId: 'weapon_whip', id: 'whip', name: '长鞭', englishName: 'Whip', weaponCategory: 'martial_melee', cost: { value: 2, unit: 'gp' }, damage: { dice: '1d4', type: 'slashing' }, weight: 3, properties: ['finesse', 'reach'], description: '军用近战武器，灵巧、触及。' }),

  weapon({ sourceIntakeId: 'weapon_blowgun', id: 'blowgun', name: '吹箭筒', englishName: 'Blowgun', weaponCategory: 'martial_ranged', cost: { value: 10, unit: 'gp' }, damage: { dice: '1', type: 'piercing' }, weight: 1, properties: ['ammunition', 'loading'], range: { normal: 25, long: 100, unit: 'ft' }, requiredAmmoType: 'needle', description: '军用远程武器，弹药、装填。' }),
  weapon({ sourceIntakeId: 'weapon_crossbow_hand', id: 'crossbow_hand', name: '手弩', englishName: 'Crossbow, hand', weaponCategory: 'martial_ranged', cost: { value: 75, unit: 'gp' }, damage: { dice: '1d6', type: 'piercing' }, weight: 3, properties: ['ammunition', 'light', 'loading'], range: { normal: 30, long: 120, unit: 'ft' }, requiredAmmoType: 'bolt', description: '军用远程武器，弹药、轻型、装填。' }),
  weapon({ sourceIntakeId: 'weapon_crossbow_heavy', id: 'crossbow_heavy', name: '重弩', englishName: 'Crossbow, heavy', weaponCategory: 'martial_ranged', cost: { value: 50, unit: 'gp' }, damage: { dice: '1d10', type: 'piercing' }, weight: 18, properties: ['ammunition', 'heavy', 'loading', 'two_handed'], range: { normal: 100, long: 400, unit: 'ft' }, requiredAmmoType: 'bolt', description: '军用远程武器，弹药、重型、装填、双手。' }),
  weapon({ sourceIntakeId: 'weapon_longbow', id: 'longbow', name: '长弓', englishName: 'Longbow', weaponCategory: 'martial_ranged', cost: { value: 50, unit: 'gp' }, damage: { dice: '1d8', type: 'piercing' }, weight: 2, properties: ['ammunition', 'heavy', 'two_handed'], range: { normal: 150, long: 600, unit: 'ft' }, requiredAmmoType: 'arrow', description: '军用远程武器，弹药、重型、双手。' }),
  weapon({ sourceIntakeId: 'weapon_net', id: 'net', name: '捕网', englishName: 'Net', weaponCategory: 'martial_ranged', cost: { value: 1, unit: 'gp' }, damage: { dice: '—' }, weight: 3, properties: ['special', 'thrown'], range: { normal: 5, long: 15, unit: 'ft' }, specialRules: '大型或更小的生物被捕网命中时陷入束缚，直到挣脱。捕网对无定形生物或巨型及更大生物无效。生物可用动作进行DC10力量检定，成功则挣脱自己或触及范围内另一生物。对捕网造成5点挥砍伤害也可释放生物并摧毁捕网。用动作、附赠动作或反应使用捕网攻击时，无论可攻击次数多少，都只能进行一次攻击。', description: '军用远程武器，特殊、投掷。' })
];
