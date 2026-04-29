import { computed } from 'vue';
import type { Ref } from 'vue';
import type { Character, Wallet } from '../../types/Character';
import type { ContainerData, InventoryItem } from '../../types/Item';
import type { CurrencyUnit, LibraryItem, PackDefinition } from '../../types/Library';
import { createItemFromLibrary } from '../../utils/itemFactory';
import { CURRENCY_RATES } from '../../data/rules/currency';
import { getLibraryItemById } from '../../data/libraries/itemLibrary';
import { isAttuned, requiresAttunement } from '../../utils/magicItems';

type ContainerInventoryItem = InventoryItem & { data: ContainerData };

const isContainerItem = (item: InventoryItem): item is ContainerInventoryItem => {
  return item.type === 'container';
};

const ignoresContentWeight = (item: InventoryItem): boolean => {
  return isContainerItem(item) && item.data.ignoreContentWeight === true;
};

const isContainerDefinition = (item: LibraryItem | undefined): boolean => item?.type === 'container';

const canMergeLibraryDefinition = (item: LibraryItem | undefined): boolean => {
  const mode = item?.multiplicity?.mode;
  return mode === 'split' || mode === 'split_grouped' || mode === 'split_custom_rule';
};

const hasInstanceMagicOrCustomization = (item: InventoryItem): boolean => {
  const magic = item.magic;
  if (!magic) return false;

  return Boolean(
    magic.isMagic ||
    magic.magicBonus !== undefined ||
    magic.rarity !== undefined ||
    magic.attunement?.requires ||
    magic.attunement?.attuned ||
    magic.enchantmentEffects?.length ||
    magic.selectedTraitIds?.length ||
    magic.customTraits?.length ||
    magic.isCursed
  );
};

const isPristineMergeTarget = (item: InventoryItem, definition: LibraryItem | undefined): boolean => {
  if (!definition) return false;
  return (
    item.type === definition.type &&
    item.name === definition.name &&
    item.description === definition.description &&
    !hasInstanceMagicOrCustomization(item)
  );
};

function computeItemWeightRecursive(item: InventoryItem, allItems: InventoryItem[]): number {
  const weight = (item.weight ?? 0) * (item.quantity ?? 1);

  if (!isContainerItem(item)) {
    return weight;
  }

  if (ignoresContentWeight(item)) {
    return weight;
  }

  const children = allItems.filter((child) => child.parentId === item.instanceId);
  const childrenWeight = children.reduce((acc, child) => {
    return acc + computeItemWeightRecursive(child, allItems);
  }, 0);

  return weight + childrenWeight;
}

export function useInventoryLogic(
  character: Ref<Character | null>,
  trash: Ref<InventoryItem[]>,
  save: () => void
) {
  const totalInventoryWeight = computed<number>(() => {
    if (!character.value) return 0;

    const inventory = character.value.inventory;
    const roots = inventory.filter((item) => !item.parentId);
    const total = roots.reduce((sum, item) => {
      return sum + computeItemWeightRecursive(item, inventory);
    }, 0);

    return parseFloat(total.toFixed(2));
  });

  const totalWeight = computed<number>(() => totalInventoryWeight.value);

  const getItemWeight = computed<(item: InventoryItem) => number>(() => {
    return (item: InventoryItem): number => {
      if (!character.value) return 0;

      const value = computeItemWeightRecursive(item, character.value.inventory);
      return parseFloat(value.toFixed(2));
    };
  });

  const carryingCapacity = computed<number>(() => {
    if (!character.value) return 0;
    return character.value.stats.str * 15;
  });

  const rootInventory = computed<InventoryItem[]>(() => {
    if (!character.value) return [];
    return character.value.inventory.filter((item) => !item.parentId);
  });

  const attunedMagicItemCount = computed<number>(() => {
    if (!character.value) return 0;
    return character.value.inventory.filter(isAttuned).length;
  });

const getContainerContents = computed<(containerId: string) => InventoryItem[]>(() => {
  return (containerId: string): InventoryItem[] => {
    if (!character.value) return [];
    return character.value.inventory.filter((item) => item.parentId === containerId && item.containerSlot !== 'hanging');
  };
});

const getContainerHangingItem = computed<(containerId: string) => InventoryItem | undefined>(() => {
  return (containerId: string): InventoryItem | undefined => {
    if (!character.value) return undefined;
    return character.value.inventory.find((item) => item.parentId === containerId && item.containerSlot === 'hanging');
  };
});

  const initWalletIfMissing = (): void => {
    // 钱包字段已由 migration 统一补齐，此处保留空实现以兼容现有调用。
  };

  const modifyCurrency = (type: CurrencyUnit, amount: number): boolean => {
    if (!character.value) return false;

    const wallet = character.value.wallet;
    let highPoolPP = wallet.pp;
    let lowPoolCP =
      wallet.gp * CURRENCY_RATES.gp +
      wallet.ep * CURRENCY_RATES.ep +
      wallet.sp * CURRENCY_RATES.sp +
      wallet.cp * CURRENCY_RATES.cp;

    if (type === 'pp') {
      highPoolPP += amount;
    } else {
      lowPoolCP += amount * CURRENCY_RATES[type];
    }

    while (lowPoolCP < 0) {
      if (highPoolPP <= 0) break;
      highPoolPP -= 1;
      lowPoolCP += CURRENCY_RATES.pp;
    }

    while (highPoolPP < 0) {
      if (lowPoolCP < CURRENCY_RATES.pp) break;
      lowPoolCP -= CURRENCY_RATES.pp;
      highPoolPP += 1;
    }

    if (lowPoolCP < 0 || highPoolPP < 0) {
      return false;
    }

    const nextWallet: Wallet = {
      pp: highPoolPP,
      gp: 0,
      ep: 0,
      sp: 0,
      cp: 0,
    };

    let remaining = lowPoolCP;
    nextWallet.gp = Math.floor(remaining / CURRENCY_RATES.gp);
    remaining %= CURRENCY_RATES.gp;
    nextWallet.sp = Math.floor(remaining / CURRENCY_RATES.sp);
    remaining %= CURRENCY_RATES.sp;
    nextWallet.cp = remaining;

    character.value.wallet = nextWallet;
    save();
    return true;
  };

  const updateWallet = (type: CurrencyUnit, value: number): void => {
    if (!character.value) return;

    character.value.wallet[type] = value;
    save();
  };

  const createNewItem = (libraryId: string, quantity: number, parentId?: string, index?: number, containerSlot?: InventoryItem['containerSlot']): InventoryItem | undefined => {
    const newItem = createItemFromLibrary(libraryId);
    if (!newItem || !character.value) return undefined;

    newItem.quantity = quantity;
    newItem.parentId = parentId;
    newItem.containerSlot = containerSlot;

    if (typeof index === 'number') {
      character.value.inventory.splice(index, 0, newItem);
    } else {
      character.value.inventory.push(newItem);
    }

    save();
    return newItem;
  };

  const reinsertItem = (item: InventoryItem, index?: number): void => {
    if (!character.value) return;

    const oldIndex = character.value.inventory.indexOf(item);
    if (oldIndex > -1) {
      character.value.inventory.splice(oldIndex, 1);
    }

    const targetIndex = typeof index === 'number' ? index : character.value.inventory.length;
    const finalIndex = oldIndex > -1 && oldIndex < targetIndex ? targetIndex - 1 : targetIndex;
    character.value.inventory.splice(finalIndex, 0, item);
  };

  const addOrMerge = (
    libraryId: string,
    quantity: number,
    targetParentId?: string,
    targetContainerSlot?: InventoryItem['containerSlot'],
    index?: number
  ): InventoryItem | undefined => {
    if (!character.value) return undefined;

    const definition = getLibraryItemById(libraryId);
    const isContainer = isContainerDefinition(definition);
    const allowMerge = canMergeLibraryDefinition(definition);

    const existingItem = character.value.inventory.find(
      (item) =>
        allowMerge &&
        item.templateId === libraryId &&
        item.parentId === targetParentId &&
        item.containerSlot === targetContainerSlot &&
        isPristineMergeTarget(item, definition) &&
        (!isContainer || !character.value?.inventory.some((child) => child.parentId === item.instanceId))
    );

    if (!existingItem) {
      return createNewItem(libraryId, quantity, targetParentId, index, targetContainerSlot);
    }

    existingItem.quantity += quantity;
    if (typeof index === 'number') {
      reinsertItem(existingItem, index);
    }
    save();
    return existingItem;
  };

  const addPack = (packId: string, index?: number, parentId?: string): void => {
    const packDefinition = getLibraryItemById(packId) as PackDefinition | undefined;
    if (!packDefinition || !character.value) return;

    let targetContainerId = parentId;

    if (packDefinition.containerId) {
      const containerItem = createItemFromLibrary(packDefinition.containerId);
      if (containerItem) {
        containerItem.parentId = parentId;
        containerItem.name = `${containerItem.name}（${packDefinition.name}）`;

        if (typeof index === 'number') {
          character.value.inventory.splice(index, 0, containerItem);
        } else {
          character.value.inventory.push(containerItem);
        }

        targetContainerId = containerItem.instanceId;
      }
    }

    packDefinition.contents.forEach((content) => {
      if (packDefinition.containerId && content.id === packDefinition.containerId) {
        return;
      }

      const contentSlot =
        packDefinition.containerId === 'backpack' && content.id === 'hempen_rope_50ft' && targetContainerId
          ? 'hanging'
          : undefined;

      addOrMerge(content.id, content.quantity, targetContainerId, contentSlot);
    });

    save();
  };

  const addByAcquisitionRule = (
    libraryId: string,
    index?: number,
    parentId?: string,
    containerSlot?: InventoryItem['containerSlot']
  ): boolean => {
    const definition = getLibraryItemById(libraryId);
    const creates = definition?.acquisitionRule?.creates;
    if (!character.value || !creates?.length) {
      return false;
    }

    const createdContainersByTemplateId = new Map<string, InventoryItem>();
    let reordered = false;

    creates.forEach((create, createIndex) => {
      const targetContainer = create.containerId
        ? createdContainersByTemplateId.get(create.containerId)
        : undefined;
      const targetParentId = targetContainer?.instanceId ?? (create.containerId ? undefined : parentId);
      const targetContainerSlot = create.containerId
        ? create.containerSlot
        : (createIndex === 0 ? containerSlot : create.containerSlot);
      const targetIndex = createIndex === 0 ? index : undefined;
      const created = addOrMerge(create.itemId, create.quantity, targetParentId, targetContainerSlot);

      if (created?.type === 'container') {
        createdContainersByTemplateId.set(create.itemId, created);
      }

      if (targetIndex !== undefined && created && character.value) {
        const currentIndex = character.value.inventory.indexOf(created);
        if (currentIndex >= 0 && currentIndex !== targetIndex) {
          character.value.inventory.splice(currentIndex, 1);
          character.value.inventory.splice(targetIndex, 0, created);
          reordered = true;
        }
      }
    });

    if (reordered) {
      save();
    }

    return true;
  };

  const addItem = (libraryId: string, index?: number, parentId?: string, containerSlot?: InventoryItem['containerSlot']): void => {
    if (!character.value) return;

    if (containerSlot === 'hanging' && parentId && getContainerHangingItem.value(parentId)) {
      return;
    }

    if (getLibraryItemById(libraryId)?.type === 'pack') {
      addPack(libraryId, index, parentId);
      return;
    }

    if (addByAcquisitionRule(libraryId, index, parentId, containerSlot)) {
      return;
    }

    if (libraryId === 'dart' && typeof index === 'undefined') {
      addOrMerge(libraryId, 1, parentId, containerSlot, index);
      return;
    }

    addOrMerge(libraryId, 1, parentId, containerSlot, index);
  };

  const removeItem = (instanceId: string): void => {
    if (!character.value) return;

    character.value.inventory = character.value.inventory.filter((item) => item.instanceId !== instanceId);
    character.value.equippedIds = character.value.equippedIds.filter((id) => id !== instanceId);
    save();
  };

  const moveItemToTrash = (instanceId: string): void => {
    if (!character.value) return;

    const item = character.value.inventory.find((entry) => entry.instanceId === instanceId);
    if (!item) return;

    trash.value.push(item);
    removeItem(instanceId);
  };

  const emptyTrash = (): void => {
    trash.value = [];
  };

  const updateInventoryItem = (newItem: InventoryItem): void => {
    if (!character.value) return;

    const index = character.value.inventory.findIndex((item) => item.instanceId === newItem.instanceId);
    if (index < 0) return;

    if (requiresAttunement(newItem)) {
      newItem.quantity = 1;
    }
    character.value.inventory[index] = newItem;
    save();
  };

  const updateEquippedList = (newIds: string[]): void => {
    if (!character.value) return;

    character.value.equippedIds = [...new Set(newIds)];
    save();
  };

  const updateItemQuantity = (instanceId: string, delta: number): void => {
    if (!character.value) return;

    const item = character.value.inventory.find((entry) => entry.instanceId === instanceId);
    if (!item) return;
    if (requiresAttunement(item)) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    item.quantity = newQuantity;
    save();
  };

  const toggleItemAttunement = (instanceId: string): boolean => {
    if (!character.value) return false;

    const item = character.value.inventory.find((entry) => entry.instanceId === instanceId);
    if (!item || !requiresAttunement(item)) return false;

    if (!item.magic!.attunement!.attuned && attunedMagicItemCount.value >= 3) {
      return false;
    }

    item.magic!.attunement!.attuned = !item.magic!.attunement!.attuned;
    item.quantity = 1;
    save();
    return true;
  };

  const moveItemToContainer = (itemId: string, containerId: string, targetIndex?: number): void => {
    if (!character.value || itemId === containerId) return;

    const item = character.value.inventory.find((entry) => entry.instanceId === itemId);
    if (!item) return;

    item.parentId = containerId;
    item.containerSlot = undefined;
    reinsertItem(item, targetIndex);
    save();
  };

  const moveItemToContainerSlot = (itemId: string, containerId: string, containerSlot: InventoryItem['containerSlot']): void => {
    if (!character.value || itemId === containerId) return;
    if (containerSlot === 'hanging' && getContainerHangingItem.value(containerId)) return;

    const item = character.value.inventory.find((entry) => entry.instanceId === itemId);
    if (!item) return;

    item.parentId = containerId;
    item.containerSlot = containerSlot;
    reinsertItem(item);
    save();
  };

  const moveItemToRoot = (itemId: string, targetIndex?: number): void => {
    if (!character.value) return;

    const item = character.value.inventory.find((entry) => entry.instanceId === itemId);
    if (!item) return;

    item.parentId = undefined;
    item.containerSlot = undefined;
    reinsertItem(item, targetIndex);
    save();
  };

  const reorderItem = (itemId: string, targetIndex: number): void => {
    if (!character.value) return;

    const item = character.value.inventory.find((entry) => entry.instanceId === itemId);
    if (!item) return;

    reinsertItem(item, targetIndex);
    save();
  };

  return {
    totalWeight,
    totalInventoryWeight,
    getItemWeight,
    carryingCapacity,
    attunedMagicItemCount,
    rootInventory,
    getContainerContents,
    getContainerHangingItem,
    initWalletIfMissing,
    modifyCurrency,
    updateWallet,
    addItem,
    removeItem,
    moveItemToTrash,
    emptyTrash,
    updateInventoryItem,
    updateEquippedList,
    updateItemQuantity,
    toggleItemAttunement,
    moveItemToContainer,
    moveItemToContainerSlot,
    moveItemToRoot,
    reorderItem,
  };
}
