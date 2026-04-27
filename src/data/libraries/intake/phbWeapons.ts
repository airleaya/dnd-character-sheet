import type { ItemIntakeAudit, ItemIntakeEntry } from '../itemIntake';
import type { AmmoTypeKey, WeaponCategory, WeaponPropertyKey } from '../../../types/Library';

const WEAPON_SOURCE = 'PHB玩家手册';
const WEAPON_CHECK_DATE = '2026-04-27';

const WEAPON_USEFUL_FIELDS = [
  '中英文名称',
  '武器类别',
  '价格',
  '伤害',
  '伤害类型',
  '重量',
  '属性',
  '射程',
  '两用伤害',
  '弹药类型',
  '特殊规则'
];

const DAMAGE_TYPE_LABELS = {
  bludgeoning: '钝击',
  piercing: '穿刺',
  slashing: '挥砍'
} as const;

const PROPERTY_LABELS: Record<WeaponPropertyKey, string> = {
  ammunition: '弹药',
  finesse: '灵巧',
  heavy: '重型',
  light: '轻型',
  loading: '装填',
  reach: '触及',
  special: '特殊',
  thrown: '投掷',
  two_handed: '双手',
  versatile: '两用'
};

interface WeaponDraft {
  id: string;
  name: string;
  englishName: string;
  category: WeaponCategory;
  cost: { value: number; unit: 'cp' | 'sp' | 'gp' };
  damage: string;
  damageType: keyof typeof DAMAGE_TYPE_LABELS;
  weight: number;
  properties: WeaponPropertyKey[];
  range?: string;
  versatileDamage?: string;
  requiredAmmoType?: AmmoTypeKey;
  specialEffect?: string;
}

const weaponAudit = (weapon: WeaponDraft): ItemIntakeAudit => ({
  sourceMatched: true,
  checkedAt: WEAPON_CHECK_DATE,
  summary: `已核对 ${weapon.name} 的名称、类别、价格、伤害、重量、属性${weapon.range ? '、射程' : ''}${weapon.versatileDamage ? '、两用伤害' : ''}${weapon.specialEffect ? '、特殊规则' : ''}，均与原文一致。`,
  issues: []
});

const describeProperties = (weapon: WeaponDraft) => {
  if (weapon.properties.length === 0) return '－';

  return weapon.properties
    .map((property) => {
      if ((property === 'ammunition' || property === 'thrown') && weapon.range) {
        return `${PROPERTY_LABELS[property]}（射程${weapon.range}）`;
      }
      if (property === 'versatile' && weapon.versatileDamage) {
        return `${PROPERTY_LABELS[property]}（${weapon.versatileDamage}）`;
      }
      return PROPERTY_LABELS[property];
    })
    .join('，');
};

const weapon = (draft: WeaponDraft): ItemIntakeEntry => {
  const damageText = draft.damage === '—'
    ? '—'
    : `${draft.damage}${DAMAGE_TYPE_LABELS[draft.damageType]}`;

  return {
    id: `weapon_${draft.id}`,
    source: WEAPON_SOURCE,
    status: 'normalized',
    rawText: `${draft.name}${draft.englishName}。${draft.cost.value} ${draft.cost.unit}；${damageText}；${draft.weight === 0 ? '—' : `${draft.weight}磅`}；${describeProperties(draft)}。`,
    understanding: `${draft.category} 武器条目，记录武器表中的价格、伤害、重量与属性。`,
    usefulFields: WEAPON_USEFUL_FIELDS,
    notes: draft.specialEffect ? '特殊规则来自 PHB“特殊武器”段落。' : undefined,
    parsed: {
      id: draft.id,
      name: `${draft.name} (${draft.englishName})`,
      type: 'weapon',
      category: draft.category,
      cost: draft.cost,
      damage: draft.damage,
      damageType: draft.damageType,
      weight: draft.weight,
      properties: draft.properties,
      range: draft.range,
      versatileDamage: draft.versatileDamage,
      requiredAmmoType: draft.requiredAmmoType,
      specialEffect: draft.specialEffect,
      description: draft.specialEffect ?? `PHB武器表中的${draft.name}。`
    },
    audit: weaponAudit(draft)
  };
};

export const PHB_WEAPON_INTAKE: ItemIntakeEntry[] = [
  weapon({ id: 'club', name: '短棒', englishName: 'Club', category: 'simple_melee', cost: { value: 1, unit: 'sp' }, damage: '1d4', damageType: 'bludgeoning', weight: 2, properties: ['light'] }),
  weapon({ id: 'dagger', name: '匕首', englishName: 'Dagger', category: 'simple_melee', cost: { value: 2, unit: 'gp' }, damage: '1d4', damageType: 'piercing', weight: 1, properties: ['finesse', 'light', 'thrown'], range: '20/60' }),
  weapon({ id: 'greatclub', name: '巨棒', englishName: 'Greatclub', category: 'simple_melee', cost: { value: 2, unit: 'sp' }, damage: '1d8', damageType: 'bludgeoning', weight: 10, properties: ['two_handed'] }),
  weapon({ id: 'handaxe', name: '手斧', englishName: 'Handaxe', category: 'simple_melee', cost: { value: 5, unit: 'gp' }, damage: '1d6', damageType: 'slashing', weight: 2, properties: ['light', 'thrown'], range: '20/60' }),
  weapon({ id: 'javelin', name: '标枪', englishName: 'Javelin', category: 'simple_melee', cost: { value: 5, unit: 'sp' }, damage: '1d6', damageType: 'piercing', weight: 2, properties: ['thrown'], range: '30/120' }),
  weapon({ id: 'light_hammer', name: '轻锤', englishName: 'Light Hammer', category: 'simple_melee', cost: { value: 2, unit: 'gp' }, damage: '1d4', damageType: 'bludgeoning', weight: 2, properties: ['light', 'thrown'], range: '20/60' }),
  weapon({ id: 'mace', name: '硬头锤', englishName: 'Mace', category: 'simple_melee', cost: { value: 5, unit: 'gp' }, damage: '1d6', damageType: 'bludgeoning', weight: 4, properties: [] }),
  weapon({ id: 'quarterstaff', name: '长棍', englishName: 'Quarterstaff', category: 'simple_melee', cost: { value: 2, unit: 'sp' }, damage: '1d6', damageType: 'bludgeoning', weight: 4, properties: ['versatile'], versatileDamage: '1d8' }),
  weapon({ id: 'sickle', name: '镰刀', englishName: 'Sickle', category: 'simple_melee', cost: { value: 1, unit: 'gp' }, damage: '1d4', damageType: 'slashing', weight: 2, properties: ['light'] }),
  weapon({ id: 'spear', name: '矛', englishName: 'Spear', category: 'simple_melee', cost: { value: 1, unit: 'gp' }, damage: '1d6', damageType: 'piercing', weight: 3, properties: ['thrown', 'versatile'], range: '20/60', versatileDamage: '1d8' }),

  weapon({ id: 'light_crossbow', name: '轻弩', englishName: 'Light Crossbow', category: 'simple_ranged', cost: { value: 25, unit: 'gp' }, damage: '1d8', damageType: 'piercing', weight: 5, properties: ['ammunition', 'loading', 'two_handed'], range: '80/320', requiredAmmoType: 'bolt' }),
  weapon({ id: 'dart', name: '飞镖', englishName: 'Dart', category: 'simple_ranged', cost: { value: 5, unit: 'cp' }, damage: '1d4', damageType: 'piercing', weight: 0.25, properties: ['finesse', 'thrown'], range: '20/60' }),
  weapon({ id: 'shortbow', name: '短弓', englishName: 'Shortbow', category: 'simple_ranged', cost: { value: 25, unit: 'gp' }, damage: '1d6', damageType: 'piercing', weight: 2, properties: ['ammunition', 'two_handed'], range: '80/320', requiredAmmoType: 'arrow' }),
  weapon({ id: 'sling', name: '投石索', englishName: 'Sling', category: 'simple_ranged', cost: { value: 1, unit: 'sp' }, damage: '1d4', damageType: 'bludgeoning', weight: 0, properties: ['ammunition'], range: '30/120', requiredAmmoType: 'bullet' }),

  weapon({ id: 'battleaxe', name: '战斧', englishName: 'Battleaxe', category: 'martial_melee', cost: { value: 10, unit: 'gp' }, damage: '1d8', damageType: 'slashing', weight: 4, properties: ['versatile'], versatileDamage: '1d10' }),
  weapon({ id: 'flail', name: '链枷', englishName: 'Flail', category: 'martial_melee', cost: { value: 10, unit: 'gp' }, damage: '1d8', damageType: 'bludgeoning', weight: 2, properties: [] }),
  weapon({ id: 'glaive', name: '长柄刀', englishName: 'Glaive', category: 'martial_melee', cost: { value: 20, unit: 'gp' }, damage: '1d10', damageType: 'slashing', weight: 6, properties: ['heavy', 'reach', 'two_handed'] }),
  weapon({ id: 'greataxe', name: '巨斧', englishName: 'Greataxe', category: 'martial_melee', cost: { value: 30, unit: 'gp' }, damage: '1d12', damageType: 'slashing', weight: 7, properties: ['heavy', 'two_handed'] }),
  weapon({ id: 'greatsword', name: '巨剑', englishName: 'Greatsword', category: 'martial_melee', cost: { value: 50, unit: 'gp' }, damage: '2d6', damageType: 'slashing', weight: 6, properties: ['heavy', 'two_handed'] }),
  weapon({ id: 'halberd', name: '戟', englishName: 'Halberd', category: 'martial_melee', cost: { value: 20, unit: 'gp' }, damage: '1d10', damageType: 'slashing', weight: 6, properties: ['heavy', 'reach', 'two_handed'] }),
  weapon({ id: 'lance', name: '骑枪', englishName: 'Lance', category: 'martial_melee', cost: { value: 10, unit: 'gp' }, damage: '1d12', damageType: 'piercing', weight: 6, properties: ['reach', 'special'], specialEffect: '使用一把长枪攻击5尺范围内目标时具有劣势。另外，当你不在骑乘状态时一根长枪需要两只手使用。' }),
  weapon({ id: 'longsword', name: '长剑', englishName: 'Longsword', category: 'martial_melee', cost: { value: 15, unit: 'gp' }, damage: '1d8', damageType: 'slashing', weight: 3, properties: ['versatile'], versatileDamage: '1d10' }),
  weapon({ id: 'maul', name: '巨锤', englishName: 'Maul', category: 'martial_melee', cost: { value: 10, unit: 'gp' }, damage: '2d6', damageType: 'bludgeoning', weight: 10, properties: ['heavy', 'two_handed'] }),
  weapon({ id: 'morningstar', name: '钉头锤', englishName: 'Morningstar', category: 'martial_melee', cost: { value: 15, unit: 'gp' }, damage: '1d8', damageType: 'piercing', weight: 4, properties: [] }),
  weapon({ id: 'pike', name: '长矛', englishName: 'Pike', category: 'martial_melee', cost: { value: 5, unit: 'gp' }, damage: '1d10', damageType: 'piercing', weight: 18, properties: ['heavy', 'reach', 'two_handed'] }),
  weapon({ id: 'rapier', name: '刺剑', englishName: 'Rapier', category: 'martial_melee', cost: { value: 25, unit: 'gp' }, damage: '1d8', damageType: 'piercing', weight: 2, properties: ['finesse'] }),
  weapon({ id: 'scimitar', name: '弯刀', englishName: 'Scimitar', category: 'martial_melee', cost: { value: 25, unit: 'gp' }, damage: '1d6', damageType: 'slashing', weight: 3, properties: ['finesse', 'light'] }),
  weapon({ id: 'shortsword', name: '短剑', englishName: 'Shortsword', category: 'martial_melee', cost: { value: 10, unit: 'gp' }, damage: '1d6', damageType: 'piercing', weight: 2, properties: ['finesse', 'light'] }),
  weapon({ id: 'trident', name: '三叉戟', englishName: 'Trident', category: 'martial_melee', cost: { value: 5, unit: 'gp' }, damage: '1d6', damageType: 'piercing', weight: 4, properties: ['thrown', 'versatile'], range: '20/60', versatileDamage: '1d8' }),
  weapon({ id: 'war_pick', name: '战镐', englishName: 'War Pick', category: 'martial_melee', cost: { value: 5, unit: 'gp' }, damage: '1d8', damageType: 'piercing', weight: 2, properties: [] }),
  weapon({ id: 'warhammer', name: '战锤', englishName: 'Warhammer', category: 'martial_melee', cost: { value: 15, unit: 'gp' }, damage: '1d8', damageType: 'bludgeoning', weight: 2, properties: ['versatile'], versatileDamage: '1d10' }),
  weapon({ id: 'whip', name: '鞭', englishName: 'Whip', category: 'martial_melee', cost: { value: 2, unit: 'gp' }, damage: '1d4', damageType: 'slashing', weight: 3, properties: ['finesse', 'reach'] }),

  weapon({ id: 'blowgun', name: '吹箭筒', englishName: 'Blowgun', category: 'martial_ranged', cost: { value: 10, unit: 'gp' }, damage: '1', damageType: 'piercing', weight: 1, properties: ['ammunition', 'loading'], range: '25/100', requiredAmmoType: 'needle' }),
  weapon({ id: 'hand_crossbow', name: '手弩', englishName: 'Hand Crossbow', category: 'martial_ranged', cost: { value: 75, unit: 'gp' }, damage: '1d6', damageType: 'piercing', weight: 3, properties: ['ammunition', 'light', 'loading'], range: '30/120', requiredAmmoType: 'bolt' }),
  weapon({ id: 'heavy_crossbow', name: '重弩', englishName: 'Heavy Crossbow', category: 'martial_ranged', cost: { value: 50, unit: 'gp' }, damage: '1d10', damageType: 'piercing', weight: 18, properties: ['ammunition', 'heavy', 'loading', 'two_handed'], range: '100/400', requiredAmmoType: 'bolt' }),
  weapon({ id: 'longbow', name: '长弓', englishName: 'Longbow', category: 'martial_ranged', cost: { value: 50, unit: 'gp' }, damage: '1d8', damageType: 'piercing', weight: 2, properties: ['ammunition', 'heavy', 'two_handed'], range: '150/600', requiredAmmoType: 'arrow' }),
  weapon({ id: 'net', name: '捕网', englishName: 'Net', category: 'martial_ranged', cost: { value: 1, unit: 'gp' }, damage: '—', damageType: 'bludgeoning', weight: 3, properties: ['special', 'thrown'], range: '5/15', specialEffect: '一只被捕网命中的大型或更小体型生物将被束缚，束缚状态持续至该生物解脱。捕网不能影响无形体生物，以及巨型或更大体型的生物。一个生物可以用动作进行一次DC10的力量检定，以解脱自己或其触及范围内另一生物的束缚状态。对网造成5点挥砍伤害（AC10）同样可以解脱生物的束缚状态而不伤害及生物本身，并以此摧毁捕网进而终止束缚效应。当用捕网以一个动作、附赠动作或反应进行攻击时，你只能攻击一次，而不论你正常情况下可发动攻击的次数。' })
];
