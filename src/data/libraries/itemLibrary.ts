import { STRUCTURED_MUNDANE_ITEM_LIBRARY, STRUCTURED_ITEM_AUDIT_SUMMARY } from './structured';
import { STRUCTURED_XGE_TOOL_DESCRIPTIONS } from './structured/xgeToolDescriptions';
import type {
  StructuredArmorItem,
  StructuredBaseItem,
  StructuredContainerItem,
  StructuredConsumableItem,
  StructuredMundaneItem,
  StructuredPackItem,
  StructuredToolItem,
  StructuredTreasureItem,
  StructuredWeaponItem
} from './structured/types';
import type {
  ArmorDefinition,
  ConsumableDefinition,
  ContainerDefinition,
  GearDefinition,
  ItemDefinition,
  ItemDescriptionBlock,
  ItemMagicDefinition,
  ItemType,
  LibraryItem,
  PackDefinition,
  ToolDefinition,
  TreasureDefinition,
  WeaponDefinition
} from '../../types/Library';

type RuntimeDisplayMeta = {
  source?: string;
  category?: string;
  subcategory?: string;
  displayCategory?: string;
  displaySubcategory?: string;
  descriptionBlocks?: ItemDescriptionBlock[];
};

const CATEGORY_LABELS: Record<string, string> = {
  equipment: '装备',
  tool: '工具',
  transport: '交通',
  trade_good: '贸易品',
  service: '服务',
  treasure: '财宝',
  special_material: '特殊材料',
  misc: '其他'
};

const SUBCATEGORY_LABELS: Record<string, string> = {
  armor: '护甲',
  weapon: '武器',
  adventuring_gear: '冒险装备',
  container: '容器',
  consumable: '消耗品',
  pack: '套组',
  artisan_tool: '工匠工具',
  general_tool: '通用工具',
  gaming_set: '赌具',
  musical_instrument: '乐器',
  vehicle: '载具',
  mount: '坐骑',
  gemstone: '宝石',
  art_object: '艺术品',
  dragonshard: '龙晶',
  stabling: '寄养服务'
};

const TOOL_DETAIL_BY_ID = new Map(
  STRUCTURED_XGE_TOOL_DESCRIPTIONS.flatMap((detail) =>
    detail.linkedToolIds.map((toolId) => [toolId, detail] as const)
  )
);

const asMagicDefinition = (magic?: ItemMagicDefinition): ItemMagicDefinition => ({
  isMagic: magic?.isMagic ?? false,
  magicBonus: magic?.magicBonus,
  rarity: magic?.rarity,
  attunement: magic?.attunement ? { ...magic.attunement } : undefined,
  enchantmentEffects: magic?.enchantmentEffects ? [...magic.enchantmentEffects] : undefined,
  charges: magic?.charges ? { ...magic.charges } : undefined,
  isCursed: magic?.isCursed
});

const textBlock = (text?: string): ItemDescriptionBlock[] =>
  text
    ?.split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ type: 'paragraph' as const, text: line })) ?? [];

const CATEGORY_LABEL_OVERRIDES: Record<string, string> = {
  equipment: '装备',
  tool: '工具',
  transport: '交通',
  trade_good: '贸易品',
  service: '服务',
  treasure: '财宝',
  special_material: '特殊材料',
  misc: '其他'
};

const SUBCATEGORY_LABEL_OVERRIDES: Record<string, string> = {
  armor: '护甲',
  weapon: '武器',
  adventuring_gear: '冒险装备',
  container: '容器',
  consumable: '消耗品',
  pack: '套组',
  artisan_tool: '工匠工具',
  general_tool: '通用工具',
  gaming_set: '赌具',
  musical_instrument: '乐器',
  vehicle: '载具',
  mount: '坐骑',
  gemstone: '宝石',
  art_object: '艺术品',
  dragonshard: '龙晶',
  stabling: '寄养服务',
  lifestyle_expense: '生活开销',
  food_drink_lodging: '食物、饮料与住宿',
  service: '雇佣服务',
  spellcasting_service: '施法服务',
  trade_good: '贸易品',
  trinket: '小饰品'
};

const categoryLabel = (category: string): string =>
  CATEGORY_LABEL_OVERRIDES[category] ?? CATEGORY_LABELS[category] ?? category;

const subcategoryLabel = (subcategory?: string): string | undefined =>
  subcategory ? (SUBCATEGORY_LABEL_OVERRIDES[subcategory] ?? SUBCATEGORY_LABELS[subcategory] ?? subcategory) : undefined;

const SOURCE_LABELS: Record<string, string> = {
  PHB: 'PHB玩家手册',
  DMG: 'DMG地下城主指南',
  XGE: 'XGE珊娜萨的万事指南',
  ERLW: 'ERLW艾伯伦：从终末战争中崛起'
};

const sourceLabel = (source: string): string => SOURCE_LABELS[source] ?? source;

const itemKindLabel = (item: StructuredBaseItem, type?: ItemType): string =>
  subcategoryLabel(item.subcategory) ?? categoryLabel(item.category) ?? type ?? '物品';

const sourceIntro = (item: StructuredBaseItem, type?: ItemType): string =>
  `这是来自${sourceLabel(item.source)}的${itemKindLabel(item, type)}物品。`;

const sourceDetail = (item: StructuredBaseItem): string =>
  item.description ||
  ('rules' in item && typeof item.rules === 'string' ? item.rules : undefined) ||
  item.name;

const runtimeDescription = (item: StructuredBaseItem, type?: ItemType): string => {
  const detail = sourceDetail(item).trim();
  const intro = sourceIntro(item, type);
  const acquisitionText = item.acquisitionRule?.text ? `\n${item.acquisitionRule.text}` : '';

  return detail ? `${intro}\n${detail}${acquisitionText}` : `${intro}${acquisitionText}`;
};

const baseMeta = (
  item: StructuredBaseItem,
  description: string,
  extraBlocks: ItemDescriptionBlock[]
): RuntimeDisplayMeta => ({
  source: item.source,
  category: item.category,
  subcategory: item.subcategory,
  displayCategory: categoryLabel(item.category),
  displaySubcategory: subcategoryLabel(item.subcategory),
  descriptionBlocks: [...textBlock(description), ...extraBlocks]
});

const baseFields = (item: StructuredBaseItem, type: ItemType, extraBlocks: ItemDescriptionBlock[]) => {
  const description = runtimeDescription(item, type);

  return {
    id: item.id,
    name: item.name,
    englishName: item.englishName,
    type,
    cost: item.cost,
    weight: item.weight ?? 0,
    description,
    magic: asMagicDefinition(item.magic),
    multiplicity: item.multiplicity,
    acquisitionRule: item.acquisitionRule,
    audit: item.audit,
    tags: item.tags,
    ...baseMeta(item, description, extraBlocks)
  };
};

const packBlocks = (item: StructuredPackItem): ItemDescriptionBlock[] => [
  {
    type: 'table',
    caption: '套组内容',
    columns: ['物品', '数量'],
    rows: item.contents.map((content) => [content.name, String(content.quantity)])
  }
];

const toolBlocks = (item: StructuredToolItem): ItemDescriptionBlock[] => {
  const blocks: ItemDescriptionBlock[] = [];
  const detail = TOOL_DETAIL_BY_ID.get(item.id);

  if (!detail) {
    return blocks;
  }

  if (detail.components?.length) {
    blocks.push({ type: 'list', items: detail.components.map((component) => `组件：${component}`) });
  }

  if (detail.skills) {
    blocks.push({
      type: 'list',
      items: Object.entries(detail.skills).map(([skill, text]) => `${skill}：${text}`)
    });
  }

  if (detail.specialUses) {
    blocks.push({
      type: 'list',
      items: Object.entries(detail.specialUses).map(([use, text]) => `${use}：${text}`)
    });
  }

  if (detail.sampleDcs?.length) {
    blocks.push({
      type: 'table',
      caption: '难度示例',
      columns: ['用途', 'DC'],
      rows: detail.sampleDcs.map((sample) => [sample.task, String(sample.dc)])
    });
  }

  return blocks;
};

const treasureBlocks = (item: StructuredTreasureItem): ItemDescriptionBlock[] => {
  const blocks: ItemDescriptionBlock[] = [];

  if (item.roll !== undefined || item.valueCategory || item.die) {
    blocks.push({
      type: 'table',
      caption: '财宝表信息',
      columns: ['字段', '值'],
      rows: [
        ['掷骰', item.die ? `${item.die}${item.roll !== undefined ? ` = ${item.roll}` : ''}` : ''],
        ['价值档位', item.valueCategory ?? '']
      ].filter((row) => row[1])
    });
  }

  return blocks;
};

const specialMaterialBlocks = (item: StructuredBaseItem): ItemDescriptionBlock[] => {
  const rows = [
    ['来源环境', 'sourceEnvironment' in item && typeof item.sourceEnvironment === 'string' ? item.sourceEnvironment : ''],
    ['外观', 'appearance' in item && typeof item.appearance === 'string' ? item.appearance : ''],
    ['用途', 'uses' in item && typeof item.uses === 'string' ? item.uses : '']
  ].filter((row) => row[1]);

  return [
    ...(rows.length
      ? [{
          type: 'table' as const,
          caption: '材料信息',
          columns: ['字段', '说明'],
          rows
        }]
      : [])
  ];
};

const isWeapon = (item: StructuredMundaneItem): item is StructuredWeaponItem =>
  item.category === 'equipment' && item.subcategory === 'weapon' && 'weaponCategory' in item;

const isArmor = (item: StructuredMundaneItem): item is StructuredArmorItem =>
  item.category === 'equipment' && item.subcategory === 'armor' && 'armorKind' in item;

const isContainer = (item: StructuredMundaneItem): item is StructuredContainerItem =>
  item.category === 'equipment' && item.subcategory === 'container';

const isConsumable = (item: StructuredMundaneItem): item is StructuredConsumableItem =>
  item.category === 'equipment' && item.subcategory === 'consumable' && 'effect' in item;

const isPack = (item: StructuredMundaneItem): item is StructuredPackItem =>
  item.category === 'equipment' && item.subcategory === 'pack' && 'contents' in item;

const isTool = (item: StructuredMundaneItem): item is StructuredToolItem =>
  item.category === 'tool' && 'toolGroupName' in item;

const isTreasure = (item: StructuredMundaneItem): item is StructuredTreasureItem =>
  item.category === 'treasure' && ('valueCategory' in item || item.subcategory === 'gemstone' || item.subcategory === 'art_object');

const STRUCTURED_ITEM_BY_ID = new Map(STRUCTURED_MUNDANE_ITEM_LIBRARY.map((item) => [item.id, item]));

const inferPackContainerId = (item: StructuredPackItem): string | undefined => {
  const firstContentId = item.contents[0]?.itemId;
  return firstContentId === 'backpack' || firstContentId === 'chest' ? firstContentId : item.containerId;
};

const structuredInventoryUnitWeight = (item?: StructuredBaseItem): number => {
  if (!item) {
    return 0;
  }

  if (
    item.multiplicity &&
    ['split', 'split_grouped', 'split_custom_rule'].includes(item.multiplicity.mode) &&
    item.multiplicity.sourceQuantity > 0
  ) {
    return (item.weight ?? 0) / item.multiplicity.sourceQuantity;
  }

  return item.weight ?? 0;
};

const calculatePackWeight = (item: StructuredPackItem): number => {
  const weight = item.contents.reduce((total, content) => {
    const contentItem = STRUCTURED_ITEM_BY_ID.get(content.itemId);
    return total + structuredInventoryUnitWeight(contentItem) * content.quantity;
  }, 0);

  return Number(weight.toFixed(2));
};

const effectExtraBlocks = (description: string | undefined, effect: string | undefined): ItemDescriptionBlock[] =>
  effect && effect !== description ? [{ type: 'paragraph', text: `效果：${effect}` }] : [];

const toRuntimeItem = (item: StructuredMundaneItem): LibraryItem => {
  if (isWeapon(item)) {
    return {
      ...baseFields(
        item,
        'weapon',
        item.specialRules ? [{ type: 'paragraph', text: `特殊规则：${item.specialRules}` }] : []
      ),
      category: item.weaponCategory,
      damage: item.damage.dice,
      damageType: item.damage.type ?? 'bludgeoning',
      properties: item.properties,
      range: item.range ? `${item.range.normal}${item.range.long ? `/${item.range.long}` : ''} ${item.range.unit}` : undefined,
      versatileDamage: item.versatileDamage,
      specialEffect: item.specialRules,
      requiredAmmoType: item.requiredAmmoType
    } as WeaponDefinition;
  }

  if (isArmor(item)) {
    return {
      ...baseFields(item, 'armor', []),
      armorType: item.armorKind,
      ac: item.armorClass.base ?? item.armorClass.bonus ?? 0,
      dexBonusMax: item.armorClass.dexBonusMax,
      strReq: item.strengthRequirement,
      stealthDis: item.stealthDisadvantage,
      donTime: item.donTime,
      doffTime: item.doffTime
    } as ArmorDefinition;
  }

  if (isContainer(item)) {
    return {
      ...baseFields(item, 'container', effectExtraBlocks(item.description, item.rules)),
      capacityWeight: item.capacity?.weight,
      capacityVolume: item.capacity?.volume,
      maxItems: item.capacity?.items ? Number(item.capacity.items) : undefined,
      ignoreContentWeight: item.id === 'quiver'
    } as ContainerDefinition;
  }

  if (isConsumable(item)) {
    return {
      ...baseFields(item, 'consumable', effectExtraBlocks(item.description, item.effect)),
      activation: item.activation,
      effectDescription: item.effect,
      isAmmunition: item.isAmmunition,
      ammoType: item.ammoType
    } as ConsumableDefinition;
  }

  if (isPack(item)) {
    const containerId = item.containerId ?? inferPackContainerId(item);

    return {
      ...baseFields(item, 'pack', packBlocks(item)),
      weight: calculatePackWeight(item),
      containerId,
      contents: item.contents.map((content) => ({ id: content.itemId, quantity: content.quantity }))
    } as PackDefinition;
  }

  if (isTool(item)) {
    return {
      ...baseFields(item, 'tool', toolBlocks(item)),
      baseAbility: undefined
    } as ToolDefinition;
  }

  if (isTreasure(item)) {
    return {
      ...baseFields(item, 'treasure', treasureBlocks(item))
    } as TreasureDefinition;
  }

  if (item.category === 'trade_good') {
    return {
      ...baseFields(item, 'treasure', []),
      displayCategory: CATEGORY_LABELS.trade_good
    } as TreasureDefinition;
  }

  if (item.category === 'service') {
    return {
      ...baseFields(item, 'misc', []),
      displayCategory: CATEGORY_LABELS.service
    } as ItemDefinition;
  }

  if (item.category === 'special_material') {
    return {
      ...baseFields(item, 'treasure', specialMaterialBlocks(item)),
      displayCategory: CATEGORY_LABELS.special_material
    } as TreasureDefinition;
  }

  return {
    ...baseFields(item, 'gear', [])
  } as GearDefinition;
};

const validateRuntimeLibrary = (items: LibraryItem[]) => {
  const issues: string[] = [];
  const ids = new Set<string>();

  for (const item of items) {
    if (ids.has(item.id)) {
      issues.push(`Duplicate item id: ${item.id}`);
    }
    ids.add(item.id);

    if (!item.id || !item.name || !item.type || !item.displayCategory || !item.displaySubcategory) {
      issues.push(`Missing required runtime fields: ${item.id || item.name}`);
    }

    if (item.audit && !item.audit.sourceMatched) {
      issues.push(`Audit mismatch: ${item.id}`);
    }

    if (!item.description && !item.descriptionBlocks?.length) {
      issues.push(`Missing description: ${item.id}`);
    }

    if ((item.magic?.isMagic ?? false) !== false) {
      issues.push(`Mundane library contains magic item: ${item.id}`);
    }
  }

  for (const pack of items.filter((item): item is PackDefinition => item.type === 'pack')) {
    for (const content of pack.contents) {
      if (!ids.has(content.id)) {
        issues.push(`Pack ${pack.id} references missing item ${content.id}`);
      }
    }
  }

  if (STRUCTURED_ITEM_AUDIT_SUMMARY.sourceMismatched !== 0) {
    issues.push(`Structured source mismatches: ${STRUCTURED_ITEM_AUDIT_SUMMARY.sourceMismatched}`);
  }

  if (issues.length > 0) {
    throw new Error(`Item library validation failed:\n${issues.join('\n')}`);
  }
};

export const ITEM_LIBRARY: LibraryItem[] = STRUCTURED_MUNDANE_ITEM_LIBRARY.map(toRuntimeItem);

validateRuntimeLibrary(ITEM_LIBRARY);

export const ITEM_LIBRARY_BY_ID = new Map(ITEM_LIBRARY.map((item) => [item.id, item]));

export const ITEM_LIBRARY_AUDIT_REPORT = {
  total: ITEM_LIBRARY.length,
  sourceMatched: ITEM_LIBRARY.filter((item) => item.audit?.sourceMatched).length,
  sourceMismatched: ITEM_LIBRARY.filter((item) => item.audit && !item.audit.sourceMatched).length,
  duplicateIds: ITEM_LIBRARY.length - ITEM_LIBRARY_BY_ID.size,
  magicItems: ITEM_LIBRARY.filter((item) => item.magic?.isMagic).length,
  tableDescriptionItems: ITEM_LIBRARY.filter((item) =>
    item.descriptionBlocks?.some((block) => block.type === 'table')
  ).length
};

export const getLibraryItemById = (id: string): LibraryItem | undefined => ITEM_LIBRARY_BY_ID.get(id);

export const getLibraryGroups = () => {
  const groups = new Map<string, Map<string, LibraryItem[]>>();

  for (const item of ITEM_LIBRARY) {
    const category = item.displayCategory ?? item.category ?? item.type;
    const subcategory = item.displaySubcategory ?? item.subcategory ?? item.type;

    if (!groups.has(category)) {
      groups.set(category, new Map());
    }

    const subgroups = groups.get(category)!;
    if (!subgroups.has(subcategory)) {
      subgroups.set(subcategory, []);
    }

    subgroups.get(subcategory)!.push(item);
  }

  return Array.from(groups.entries()).map(([label, subgroups]) => ({
    id: label,
    label,
    subGroups: Array.from(subgroups.entries()).map(([title, items]) => ({ title, items }))
  }));
};
