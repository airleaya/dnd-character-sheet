import type {
  DataPackEditorMeta,
  DataPackTraitDefinition,
  DataPackUnlockGroup,
  RuntimeDataPack,
} from '../types/DataPack';
import type { LibraryItem } from '../types/Library';
import type { SpellDefinition } from '../types/Spell';

export type VisibleDataPackEntry = LibraryItem | SpellDefinition | DataPackTraitDefinition;
export type DataPackVisibilitySummary = {
  publicItems: number;
  lockedItems: number;
  unlockedItems: number;
  publicSpells: number;
  lockedSpells: number;
  unlockedSpells: number;
  publicTraits: number;
  lockedTraits: number;
  unlockedTraits: number;
  unlockGroupCount: number;
};
export type DataPackUnlockGroupStats = {
  groupId: string;
  passphrase: string;
  itemCount: number;
  spellCount: number;
  traitCount: number;
  totalCount: number;
};
export type DataPackVisibilityIssue = {
  code: 'missing_unlock_group' | 'non_public_without_group' | 'duplicate_passphrase';
  severity: 'warning';
  message: string;
  entryKind?: 'item' | 'spell' | 'trait' | 'group';
  entryId?: string;
  groupId?: string;
  count?: number;
};

const clonePlain = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const getNormalizedUnlockGroups = (editorMeta?: DataPackEditorMeta): DataPackUnlockGroup[] => {
  const explicitGroups = editorMeta?.unlockGroups ?? [];
  const groups = new Map<string, DataPackUnlockGroup>();

  explicitGroups.forEach(group => {
    if (!group.id || !group.passphrase) return;
    groups.set(group.id, {
      id: group.id,
      passphrase: group.passphrase,
      hint: group.hint,
      description: group.description,
    });
  });

  (editorMeta?.encryptionGroups ?? []).forEach(group => {
    if (!group.id || groups.has(group.id)) return;
    groups.set(group.id, {
      id: group.id,
      passphrase: group.name,
      hint: group.description,
      description: group.description,
    });
  });

  return Array.from(groups.values());
};

export const getEntryUnlockGroupId = (entry: VisibleDataPackEntry): string | undefined =>
  entry.visibility?.unlockGroupId ?? entry.encryptionGroupId;

export const isEntryPublic = (entry: VisibleDataPackEntry): boolean => {
  if (entry.visibility) return entry.visibility.public !== false;
  return !entry.encryptionGroupId;
};

export const isEntryVisible = (
  entry: VisibleDataPackEntry,
  unlockedGroupIds: ReadonlySet<string>,
  ignoreUnlock = false
): boolean => {
  if (ignoreUnlock || isEntryPublic(entry)) return true;
  const groupId = getEntryUnlockGroupId(entry);
  return Boolean(groupId && unlockedGroupIds.has(groupId));
};

const countEntries = <T extends VisibleDataPackEntry>(
  entries: T[],
  unlockedGroupIds: ReadonlySet<string>,
  ignoreUnlock = false
) => {
  let publicCount = 0;
  let lockedCount = 0;
  let unlockedCount = 0;

  entries.forEach(entry => {
    if (isEntryPublic(entry)) {
      publicCount += 1;
      return;
    }
    if (isEntryVisible(entry, unlockedGroupIds, ignoreUnlock)) {
      unlockedCount += 1;
    } else {
      lockedCount += 1;
    }
  });

  return { publicCount, lockedCount, unlockedCount };
};

export const summarizeDataPackVisibility = (
  pack: RuntimeDataPack,
  unlockedGroupIds: ReadonlySet<string>,
  ignoreUnlock = false
): DataPackVisibilitySummary => {
  const itemCounts = countEntries(pack.items, unlockedGroupIds, ignoreUnlock);
  const spellCounts = countEntries(pack.spells, unlockedGroupIds, ignoreUnlock);
  const traitCounts = countEntries(pack.traits, unlockedGroupIds, ignoreUnlock);

  return {
    publicItems: itemCounts.publicCount,
    lockedItems: itemCounts.lockedCount,
    unlockedItems: itemCounts.unlockedCount,
    publicSpells: spellCounts.publicCount,
    lockedSpells: spellCounts.lockedCount,
    unlockedSpells: spellCounts.unlockedCount,
    publicTraits: traitCounts.publicCount,
    lockedTraits: traitCounts.lockedCount,
    unlockedTraits: traitCounts.unlockedCount,
    unlockGroupCount: getNormalizedUnlockGroups(pack.editorMeta).length,
  };
};

export const filterRuntimePackByVisibility = (
  pack: RuntimeDataPack,
  unlockedGroupIds: ReadonlySet<string>,
  ignoreUnlock = false
): RuntimeDataPack => ({
  ...pack,
  editorMeta: pack.editorMeta ? clonePlain(pack.editorMeta) : undefined,
  items: pack.items.filter(item => isEntryVisible(item, unlockedGroupIds, ignoreUnlock)),
  spells: pack.spells.filter(spell => isEntryVisible(spell, unlockedGroupIds, ignoreUnlock)),
  traits: pack.traits.filter(trait => isEntryVisible(trait, unlockedGroupIds, ignoreUnlock)),
});

export const resolveUnlockGroupIdsByPassphrase = (
  pack: RuntimeDataPack,
  passphrase: string
): string[] => {
  const normalized = passphrase.trim();
  if (!normalized) return [];

  return getNormalizedUnlockGroups(pack.editorMeta)
    .filter(group => group.passphrase === normalized)
    .map(group => group.id);
};

export const summarizeUnlockGroupStats = (
  pack: Pick<RuntimeDataPack, 'editorMeta' | 'items' | 'spells' | 'traits'>
): DataPackUnlockGroupStats[] => {
  const groups = getNormalizedUnlockGroups(pack.editorMeta);
  const stats = new Map<string, DataPackUnlockGroupStats>();

  groups.forEach(group => {
    stats.set(group.id, {
      groupId: group.id,
      passphrase: group.passphrase,
      itemCount: 0,
      spellCount: 0,
      traitCount: 0,
      totalCount: 0,
    });
  });

  const addEntry = (groupId: string | undefined, key: 'itemCount' | 'spellCount' | 'traitCount') => {
    if (!groupId) return;
    const stat = stats.get(groupId);
    if (!stat) return;
    stat[key] += 1;
    stat.totalCount += 1;
  };

  pack.items.forEach(item => {
    if (!isEntryPublic(item)) addEntry(getEntryUnlockGroupId(item), 'itemCount');
  });
  pack.spells.forEach(spell => {
    if (!isEntryPublic(spell)) addEntry(getEntryUnlockGroupId(spell), 'spellCount');
  });
  pack.traits.forEach(trait => {
    if (!isEntryPublic(trait)) addEntry(getEntryUnlockGroupId(trait), 'traitCount');
  });

  return Array.from(stats.values());
};

export const collectVisibilityIssues = (
  pack: Pick<RuntimeDataPack, 'editorMeta' | 'items' | 'spells' | 'traits'>
): DataPackVisibilityIssue[] => {
  const issues: DataPackVisibilityIssue[] = [];
  const groups = getNormalizedUnlockGroups(pack.editorMeta);
  const groupIds = new Set(groups.map(group => group.id));
  const passphraseCounts = new Map<string, number>();

  groups.forEach(group => {
    passphraseCounts.set(group.passphrase, (passphraseCounts.get(group.passphrase) ?? 0) + 1);
  });
  passphraseCounts.forEach((count, passphrase) => {
    if (count > 1) {
      issues.push({
        code: 'duplicate_passphrase',
        severity: 'warning',
        message: `有 ${count} 个口令分组使用了同一个口令。`,
        entryKind: 'group',
        count,
      });
    }
    void passphrase;
  });

  const checkEntry = (entry: VisibleDataPackEntry, entryKind: DataPackVisibilityIssue['entryKind']) => {
    if (isEntryPublic(entry)) return;
    const groupId = getEntryUnlockGroupId(entry);
    if (!groupId) {
      issues.push({
        code: 'non_public_without_group',
        severity: 'warning',
        message: '存在非公开内容未指定口令分组，将无法通过口令解锁。',
        entryKind,
        entryId: entry.id,
      });
      return;
    }
    if (!groupIds.has(groupId)) {
      issues.push({
        code: 'missing_unlock_group',
        severity: 'warning',
        message: '存在内容引用了不存在的口令分组，将无法通过口令解锁。',
        entryKind,
        entryId: entry.id,
        groupId,
      });
    }
  };

  pack.items.forEach(item => checkEntry(item, 'item'));
  pack.spells.forEach(spell => checkEntry(spell, 'spell'));
  pack.traits.forEach(trait => checkEntry(trait, 'trait'));

  return issues;
};
