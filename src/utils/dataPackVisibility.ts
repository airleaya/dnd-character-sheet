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

