import type { Character } from '../types/Character';
import type { InventoryItem } from '../types/Item';
import type { ItemMagicDefinition, ItemMagicTrait } from '../types/Library';
import {
  DEFAULT_MAGIC_ATTACK_BACKGROUND,
  DEFAULT_MAGIC_INVENTORY_BACKGROUND,
  DEFAULT_MAGIC_NAME_COLOR,
  PRESET_MAGIC_TRAITS,
} from '../data/rules/magicTraits';

export const ensureMagicDefinition = (item: InventoryItem): ItemMagicDefinition => {
  if (!item.magic) {
    item.magic = { isMagic: false };
  }
  if (!item.magic.attunement) {
    item.magic.attunement = { requires: false };
  }
  if (!item.magic.visuals) {
    item.magic.visuals = {};
  }
  item.magic.visuals.inventoryBackground =
    item.magic.visuals.inventoryBackground || DEFAULT_MAGIC_INVENTORY_BACKGROUND;
  item.magic.visuals.attackBackground =
    item.magic.visuals.attackBackground || DEFAULT_MAGIC_ATTACK_BACKGROUND;
  item.magic.visuals.nameColor = item.magic.visuals.nameColor || DEFAULT_MAGIC_NAME_COLOR;
  if (!item.magic.selectedTraitIds) {
    item.magic.selectedTraitIds = [];
  }
  return item.magic;
};

export const cloneMagicTrait = (trait: ItemMagicTrait): ItemMagicTrait => ({
  ...trait,
  charges: trait.charges ? { ...trait.charges } : undefined,
});

export const cloneMagicDefinition = (magic?: ItemMagicDefinition): ItemMagicDefinition => ({
  isMagic: magic?.isMagic ?? false,
  magicBonus: magic?.magicBonus,
  rarity: magic?.rarity,
  attunement: magic?.attunement ? { ...magic.attunement } : undefined,
  enchantmentEffects: magic?.enchantmentEffects ? [...magic.enchantmentEffects] : undefined,
  selectedTraitIds: magic?.selectedTraitIds ? [...magic.selectedTraitIds] : undefined,
  customTraits: magic?.customTraits ? magic.customTraits.map(cloneMagicTrait) : undefined,
  visuals: magic?.visuals ? { ...magic.visuals } : undefined,
  charges: magic?.charges ? { ...magic.charges } : undefined,
  isCursed: magic?.isCursed,
});

export const isMagicItem = (item: InventoryItem): boolean => item.magic?.isMagic === true;

export const requiresAttunement = (item: InventoryItem): boolean =>
  isMagicItem(item) && item.magic?.attunement?.requires === true;

export const isAttuned = (item: InventoryItem): boolean =>
  requiresAttunement(item) && item.magic?.attunement?.attuned === true;

export const getMagicBonus = (item: InventoryItem): number =>
  isMagicItem(item) && typeof item.magic?.magicBonus === 'number' && Number.isFinite(item.magic.magicBonus)
    ? item.magic.magicBonus
    : 0;

export const hasExplicitMagicBonus = (item: InventoryItem): boolean =>
  isMagicItem(item) && typeof item.magic?.magicBonus === 'number' && Number.isFinite(item.magic.magicBonus);

export const formatMagicItemName = (item: InventoryItem, baseName = item.name): string => {
  if (item.type !== 'weapon' || !hasExplicitMagicBonus(item)) {
    return baseName;
  }
  const bonus = item.magic!.magicBonus!;
  return `${baseName}${bonus >= 0 ? '+' : ''}${bonus}`;
};

export const getMagicInventoryStyle = (item: InventoryItem) => {
  if (!isMagicItem(item)) return undefined;

  return {
    backgroundColor: item.magic?.visuals?.inventoryBackground || DEFAULT_MAGIC_INVENTORY_BACKGROUND,
    color: item.magic?.visuals?.nameColor || DEFAULT_MAGIC_NAME_COLOR,
  };
};

export const getMagicAttackStyle = (item: InventoryItem) => {
  if (!isMagicItem(item)) return undefined;

  return {
    backgroundColor: item.magic?.visuals?.attackBackground || DEFAULT_MAGIC_ATTACK_BACKGROUND,
    color: item.magic?.visuals?.nameColor || DEFAULT_MAGIC_NAME_COLOR,
  };
};

export const resolveMagicTraitsForItem = (
  item: InventoryItem,
  character?: Pick<Character, 'customMagicTraits'>
): ItemMagicTrait[] => {
  const selectedIds = item.magic?.selectedTraitIds ?? [];
  if (selectedIds.length === 0) return [];

  const traitMap = new Map<string, ItemMagicTrait>();
  PRESET_MAGIC_TRAITS.forEach(trait => traitMap.set(trait.id, trait));
  character?.customMagicTraits?.forEach(trait => traitMap.set(trait.id, trait));
  item.magic?.customTraits?.forEach(trait => traitMap.set(trait.id, trait));

  return selectedIds
    .map(id => traitMap.get(id))
    .filter((trait): trait is ItemMagicTrait => trait !== undefined);
};
