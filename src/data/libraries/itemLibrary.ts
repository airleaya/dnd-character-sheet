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
  text && text.trim() ? [{ type: 'paragraph', text }] : [];

const baseDescription = (item: StructuredBaseItem): string =>
  item.description || ('rules' in item && typeof item.rules === 'string' ? item.rules : undefined) || item.name;

const baseMeta = (item: StructuredBaseItem, blocks: ItemDescriptionBlock[]): RuntimeDisplayMeta => ({
  source: item.source,
  category: item.category,
  subcategory: item.subcategory,
  displayCategory: CATEGORY_LABELS[item.category] ?? item.category,
  displaySubcategory: item.subcategory ? (SUBCATEGORY_LABELS[item.subcategory] ?? item.subcategory) : undefined,
  descriptionBlocks: blocks.length > 0 ? blocks : textBlock(baseDescription(item))
});

const baseFields = (item: StructuredBaseItem, type: ItemType, blocks: ItemDescriptionBlock[]) => ({
  id: item.id,
  name: item.name,
  englishName: item.englishName,
  type,
  cost: item.cost,
  weight: item.weight ?? 0,
  description: baseDescription(item),
  magic: asMagicDefinition(item.magic),
  audit: item.audit,
  tags: item.tags,
  ...baseMeta(item, blocks)
});

const packBlocks = (item: StructuredPackItem): ItemDescriptionBlock[] => [
  ...textBlock(item.description),
  {
    type: 'table',
    caption: '套组内容',
    columns: ['物品', '数量'],
    rows: item.contents.map((content) => [content.name, String(content.quantity)])
  }
];

const toolBlocks = (item: StructuredToolItem): ItemDescriptionBlock[] => {
  const blocks = textBlock(item.description);
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
  const blocks = textBlock(item.description);

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
    ...textBlock(item.description),
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

const toRuntimeItem = (item: StructuredMundaneItem): LibraryItem => {
  if (isWeapon(item)) {
    return {
      ...baseFields(item, 'weapon', textBlock(item.description ?? item.specialRules)),
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
      ...baseFields(item, 'armor', textBlock(item.description)),
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
      ...baseFields(item, 'container', textBlock(item.description ?? item.rules)),
      capacityWeight: item.capacity?.weight,
      capacityVolume: item.capacity?.volume,
      maxItems: item.capacity?.items ? Number(item.capacity.items) : undefined,
      ignoreContentWeight: false
    } as ContainerDefinition;
  }

  if (isConsumable(item)) {
    return {
      ...baseFields(item, 'consumable', textBlock(item.description ?? item.effect)),
      activation: item.activation,
      effectDescription: item.effect,
      isAmmunition: item.isAmmunition,
      ammoType: item.ammoType
    } as ConsumableDefinition;
  }

  if (isPack(item)) {
    return {
      ...baseFields(item, 'pack', packBlocks(item)),
      containerId: item.containerId,
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
      ...baseFields(item, 'treasure', textBlock(item.description)),
      displayCategory: CATEGORY_LABELS.trade_good
    } as TreasureDefinition;
  }

  if (item.category === 'service') {
    return {
      ...baseFields(item, 'misc', textBlock(item.description)),
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
    ...baseFields(item, 'gear', textBlock(item.description))
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
