import type { InventoryItem } from '../types/Item';
import type { ItemMagicDefinition, ItemMagicTrait } from '../types/Library';
import {
  DEFAULT_MAGIC_ATTACK_BACKGROUND,
  DEFAULT_MAGIC_INVENTORY_BACKGROUND,
  DEFAULT_MAGIC_NAME_COLOR,
  PRESET_MAGIC_TRAITS,
} from '../data/rules/magicTraits';
import { DAMAGE_TYPES } from '../data/rules/damageTypes';

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
  if (!item.magic.customTraits) {
    item.magic.customTraits = [];
  }
  item.magic.selectedTraitIds.forEach(traitId => {
    if (item.magic!.customTraits!.some(trait => trait.id === traitId)) return;
    const presetTrait = PRESET_MAGIC_TRAITS.find(trait => trait.id === traitId);
    if (presetTrait) {
      item.magic!.customTraits!.push(cloneMagicTrait(presetTrait));
    }
  });
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

export const attachMagicTraitSnapshot = (item: InventoryItem, trait: ItemMagicTrait) => {
  const magic = ensureMagicDefinition(item);
  const selected = new Set(magic.selectedTraitIds ?? []);
  selected.add(trait.id);
  magic.selectedTraitIds = Array.from(selected);

  const snapshot = cloneMagicTrait(trait);
  const existingIndex = magic.customTraits?.findIndex(entry => entry.id === trait.id) ?? -1;
  if (existingIndex >= 0) {
    magic.customTraits![existingIndex] = snapshot;
  } else {
    magic.customTraits = [...(magic.customTraits ?? []), snapshot];
  }
};

export const detachMagicTraitSnapshot = (item: InventoryItem, traitId: string) => {
  const magic = ensureMagicDefinition(item);
  magic.selectedTraitIds = (magic.selectedTraitIds ?? []).filter(id => id !== traitId);
  magic.customTraits = (magic.customTraits ?? []).filter(trait => trait.id !== traitId);
};

export const resolveMagicTraitsForItem = (item: InventoryItem): ItemMagicTrait[] => {
  if (!item.magic) return [];
  if (!item.magic.customTraits) {
    item.magic.customTraits = [];
  }
  const selectedIds = item.magic?.selectedTraitIds ?? [];
  if (selectedIds.length === 0) return [];

  selectedIds.forEach(traitId => {
    if (item.magic!.customTraits!.some(trait => trait.id === traitId)) return;
    const presetTrait = PRESET_MAGIC_TRAITS.find(trait => trait.id === traitId);
    if (presetTrait) {
      item.magic!.customTraits!.push(cloneMagicTrait(presetTrait));
    }
  });

  const traitMap = new Map<string, ItemMagicTrait>();
  item.magic?.customTraits?.forEach(trait => traitMap.set(trait.id, trait));

  return selectedIds
    .map(id => traitMap.get(id))
    .filter((trait): trait is ItemMagicTrait => trait !== undefined);
};

const resolveDamageTypeLabel = (rawType?: string) => {
  if (!rawType) return '';
  const typeKey = rawType.toLowerCase();
  const damageDef =
    typeKey in DAMAGE_TYPES ? DAMAGE_TYPES[typeKey as keyof typeof DAMAGE_TYPES] : undefined;
  return damageDef ? damageDef.label : rawType;
};

export const formatMagicTraitDamage = (trait: ItemMagicTrait): string => {
  if (trait.type !== 'damage' || !trait.participatesInDamage) return '';

  const dice = trait.damageDice?.trim() ?? '';
  const bonus =
    typeof trait.damageBonus === 'number' && Number.isFinite(trait.damageBonus)
      ? trait.damageBonus
      : 0;
  const bonusText = bonus > 0 ? `+${bonus}` : bonus < 0 ? `${bonus}` : '';
  const damageType = resolveDamageTypeLabel(trait.damageType);

  return [dice, bonusText, damageType].filter(Boolean).join(' ').trim();
};

export const formatMagicTraitMeta = (trait: ItemMagicTrait): string => {
  if (trait.type === 'spell') {
    const chargeText = trait.charges ? ` · ${trait.charges.current}/${trait.charges.max} 充能` : '';
    return `附带法术${chargeText}`;
  }

  if (trait.type === 'plain') {
    const chargeText = trait.charges ? ` · ${trait.charges.current}/${trait.charges.max} 充能` : '';
    return `普通词条${chargeText}`;
  }

  if (trait.type === 'defense') {
    const chargeText = trait.charges ? ` · ${trait.charges.current}/${trait.charges.max} 充能` : '';
    return `防御词条${chargeText}`;
  }

  const damage = formatMagicTraitDamage(trait);
  const mode = trait.activationMode === 'charged' ? '消耗充能' : '默认作用';
  const chargeText = trait.charges ? ` · ${trait.charges.current}/${trait.charges.max} 充能` : '';
  return [mode, damage].filter(Boolean).join(' · ') + chargeText;
};
