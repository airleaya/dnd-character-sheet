import { ref } from 'vue';
import { useActiveSheetStore } from '../stores/activeSheet';
import { parseDragPayload } from '../utils/inventoryDropUtils';
import { createRendererLogger } from '../utils/rendererLogger';
import type { InventoryItem } from '../types/Item';
import type { ItemMagicTrait } from '../types/Library';
import { createEmptyCustomMagicTrait, PRESET_MAGIC_TRAITS } from '../data/rules/magicTraits';
import {
  attachMagicTraitSnapshot,
  detachMagicTraitSnapshot,
  ensureMagicDefinition,
} from '../utils/magicItems';
import { generateUUID } from '../utils/idGenerator';

type EnchantingEntrySource = 'button' | 'drop';

const isEnchantingOpen = ref(false);
const entrySource = ref<EnchantingEntrySource>('button');
const targetPayload = ref<ReturnType<typeof parseDragPayload> | null>(null);
const targetItem = ref<InventoryItem | null>(null);
const saveOverride = ref<((item: InventoryItem) => void) | null>(null);
const logger = createRendererLogger('composables/useEnchanting');

export function useEnchanting() {
  const activeSheet = useActiveSheetStore();

  const openEnchanting = (source: EnchantingEntrySource = 'button') => {
    entrySource.value = source;
    if (!targetItem.value) {
      targetPayload.value = null;
    }
    isEnchantingOpen.value = true;
  };

  const openEnchantingForItem = (
    item: InventoryItem,
    source: EnchantingEntrySource = 'button',
    onSave?: (item: InventoryItem) => void
  ) => {
    targetItem.value = item;
    saveOverride.value = onSave ?? null;
    targetPayload.value = {
      type: 'inventory-item',
      instanceId: item.instanceId,
    };
    ensureMagicDefinition(item);
    openEnchanting(source);
  };

  const openEnchantingWithDropData = (raw: string) => {
    const payload = parseDragPayload(raw);
    if (!payload) {
      logger.warn('Invalid enchantment drag payload');
      return;
    }

    targetPayload.value = payload;
    targetItem.value =
      payload.type === 'inventory-item'
        ? activeSheet.character?.inventory.find(item => item.instanceId === payload.instanceId) ?? null
        : null;
    if (targetItem.value) {
      ensureMagicDefinition(targetItem.value);
    }
    openEnchanting('drop');
  };

  const closeEnchanting = () => {
    isEnchantingOpen.value = false;
    targetPayload.value = null;
    targetItem.value = null;
    saveOverride.value = null;
  };

  const saveEnchanting = () => {
    if (targetItem.value) {
      const magic = ensureMagicDefinition(targetItem.value);
      if (magic.attunement?.requires) {
        targetItem.value.quantity = 1;
      } else if (magic.attunement) {
        magic.attunement.attuned = false;
      }
      if (saveOverride.value) {
        saveOverride.value(targetItem.value);
        closeEnchanting();
        return;
      }
      activeSheet.updateInventoryItem(targetItem.value);
    } else {
      activeSheet.save();
    }
    closeEnchanting();
  };

  const addCustomTrait = (patch?: Partial<ItemMagicTrait>): ItemMagicTrait | null => {
    if (!activeSheet.character) return null;

    const trait = {
      ...createEmptyCustomMagicTrait(`custom_magic_trait_${generateUUID()}`),
      ...patch,
      source: 'custom' as const,
    };

    activeSheet.character.customMagicTraits = [
      ...(activeSheet.character.customMagicTraits ?? []),
      trait,
    ];
    activeSheet.save();
    return trait;
  };

  const deleteCustomTrait = (traitId: string) => {
    if (!activeSheet.character) return;

    activeSheet.character.customMagicTraits = (activeSheet.character.customMagicTraits ?? []).filter(
      trait => trait.id !== traitId
    );
    activeSheet.save();
  };

  const findAvailableTrait = (traitId: string): ItemMagicTrait | undefined => {
    return [
      ...PRESET_MAGIC_TRAITS,
      ...(activeSheet.character?.customMagicTraits ?? []),
    ].find(trait => trait.id === traitId);
  };

  const toggleTraitSelection = (traitId: string) => {
    if (!targetItem.value) return;

    const magic = ensureMagicDefinition(targetItem.value);
    const selected = new Set(magic.selectedTraitIds ?? []);
    if (selected.has(traitId)) {
      detachMagicTraitSnapshot(targetItem.value, traitId);
    } else {
      const trait = findAvailableTrait(traitId);
      if (trait) {
        attachMagicTraitSnapshot(targetItem.value, trait);
      }
    }
  };

  return {
    isEnchantingOpen,
    entrySource,
    targetPayload,
    targetItem,
    openEnchanting,
    openEnchantingForItem,
    openEnchantingWithDropData,
    saveEnchanting,
    addCustomTrait,
    deleteCustomTrait,
    toggleTraitSelection,
    closeEnchanting,
  };
}
