import type { DataPackFile, DataPackId, DataPackSettings, RuntimeDataPack } from '../types/DataPack';
import type { LibraryItem } from '../types/Library';
import type { SpellDefinition } from '../types/Spell';

export const DATA_PACK_SCHEMA_VERSION = 1;
export const DEFAULT_DATA_PACK_ID = 'dnd5e-default';
export const DEFAULT_DATA_PACK_EXPORT_ID = 'dnd5e-output';
export const DATA_PACK_EXTENSION = '.dndpack.json';

export const createDefaultDataPackSettings = (): DataPackSettings => ({
  enabledPackIds: [DEFAULT_DATA_PACK_ID],
  packOrder: [DEFAULT_DATA_PACK_ID],
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isSafePackId = (id: string): boolean =>
  /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(id) && !id.includes('..');

const requireString = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${label} 必须是非空字符串`);
  }
  return value.trim();
};

const assertUniqueIds = (entries: unknown[], label: string): void => {
  const seen = new Set<string>();

  entries.forEach((entry, index) => {
    if (!isRecord(entry)) {
      throw new Error(`${label}[${index}] 必须是对象`);
    }

    const id = requireString(entry.id, `${label}[${index}].id`);
    if (seen.has(id)) {
      throw new Error(`${label} 中存在重复 id：${id}`);
    }
    seen.add(id);
  });
};

export const validateDataPackFile = (value: unknown): DataPackFile => {
  if (!isRecord(value)) {
    throw new Error('数据包必须是 JSON 对象');
  }

  if (!isRecord(value.manifest)) {
    throw new Error('数据包缺少 manifest');
  }

  const schemaVersion = value.manifest.schemaVersion;
  if (schemaVersion !== DATA_PACK_SCHEMA_VERSION) {
    throw new Error(`仅支持 schemaVersion ${DATA_PACK_SCHEMA_VERSION}`);
  }

  const id = requireString(value.manifest.id, 'manifest.id');
  if (!isSafePackId(id)) {
    throw new Error('manifest.id 只能包含字母、数字、点、下划线和短横线，且不能包含路径片段');
  }

  const name = requireString(value.manifest.name, 'manifest.name');
  const version = requireString(value.manifest.version, 'manifest.version');

  const items = value.items;
  const spells = value.spells;
  const traits = value.traits;

  if (items !== undefined && !Array.isArray(items)) throw new Error('items 必须是数组');
  if (spells !== undefined && !Array.isArray(spells)) throw new Error('spells 必须是数组');
  if (traits !== undefined && !Array.isArray(traits)) throw new Error('traits 必须是数组');

  assertUniqueIds((items ?? []) as unknown[], 'items');
  assertUniqueIds((spells ?? []) as unknown[], 'spells');
  assertUniqueIds((traits ?? []) as unknown[], 'traits');

  return {
    manifest: {
      schemaVersion: DATA_PACK_SCHEMA_VERSION,
      id,
      name,
      version,
      author: typeof value.manifest.author === 'string' ? value.manifest.author : undefined,
      description: typeof value.manifest.description === 'string' ? value.manifest.description : undefined,
      createdAt: typeof value.manifest.createdAt === 'string' ? value.manifest.createdAt : undefined,
      updatedAt: typeof value.manifest.updatedAt === 'string' ? value.manifest.updatedAt : undefined,
      tags: Array.isArray(value.manifest.tags)
        ? value.manifest.tags.filter((tag): tag is string => typeof tag === 'string')
        : undefined,
    },
    items: (items ?? []) as LibraryItem[],
    spells: (spells ?? []) as SpellDefinition[],
    traits: (traits ?? []) as DataPackFile['traits'],
  };
};

export const runtimeEntryId = (packId: DataPackId, localId: string): string =>
  packId === DEFAULT_DATA_PACK_ID ? localId : `${packId}:${localId}`;

export const toRuntimeDataPack = (
  dataPackFile: DataPackFile,
  enabled: boolean,
  builtin = false
): RuntimeDataPack => {
  const packId = dataPackFile.manifest.id;

  return {
    id: packId,
    name: dataPackFile.manifest.name,
    version: dataPackFile.manifest.version,
    builtin,
    enabled,
    sourceKind: builtin ? 'builtin' : 'imported',
    manifest: dataPackFile.manifest,
    itemMenuName: dataPackFile.manifest.name,
    spellMenuName: dataPackFile.manifest.name,
    items: (dataPackFile.items ?? []).map(item => ({
      ...item,
      id: runtimeEntryId(packId, item.id),
      source: item.source ?? dataPackFile.manifest.name,
    })),
    spells: (dataPackFile.spells ?? []).map(spell => ({
      ...spell,
      id: runtimeEntryId(packId, spell.id),
      source: spell.source ?? dataPackFile.manifest.name,
      classes: Array.isArray(spell.classes) ? spell.classes : [],
    })),
    traits: dataPackFile.traits ?? [],
  };
};

export const normalizeDataPackSettings = (
  settings: Partial<DataPackSettings> | undefined,
  knownPackIds: DataPackId[]
): DataPackSettings => {
  const knownSet = new Set(knownPackIds);
  const defaults = createDefaultDataPackSettings();
  const incomingEnabled = Array.isArray(settings?.enabledPackIds)
    ? settings.enabledPackIds
    : defaults.enabledPackIds;
  const incomingOrder = Array.isArray(settings?.packOrder)
    ? settings.packOrder
    : defaults.packOrder;

  const enabledPackIds = incomingEnabled.filter((id, index, list) =>
    knownSet.has(id) && list.indexOf(id) === index
  );
  const packOrder = [
    ...incomingOrder.filter((id, index, list) => knownSet.has(id) && list.indexOf(id) === index),
    ...knownPackIds.filter(id => !incomingOrder.includes(id)),
  ];

  return { enabledPackIds, packOrder };
};

export const buildExportableDefaultDataPack = (pack: RuntimeDataPack): DataPackFile => ({
  manifest: {
    ...pack.manifest,
    id: DEFAULT_DATA_PACK_EXPORT_ID,
    name: 'DND 5E默认数据导出包',
    version: pack.version,
    description: '从内置 DND 5E 默认数据导出的第三方数据包副本',
  },
  items: pack.items,
  spells: pack.spells,
  traits: pack.traits,
});
