import { computed } from 'vue';
import type { Ref } from 'vue';
import type { Character, Wallet } from '../../types/Character';
import type { ContainerData, InventoryItem } from '../../types/Item';
import type { CurrencyUnit } from '../../types/Library';
import { createItemFromLibrary } from '../../utils/itemFactory';
import { CURRENCY_RATES } from '../../data/rules/currency';
import { PACK_LIBRARY } from '../../data/libraries/packs';

const STACKABLE_ITEM_IDS = new Set(['arrows', 'bolts', 'dart']);
const AMMO_BUNDLE_QUANTITY = 20;

type ContainerInventoryItem = InventoryItem & { data: ContainerData };

const isContainerItem = (item: InventoryItem): item is ContainerInventoryItem => {
  return item.type === 'container';
};

const ignoresContentWeight = (item: InventoryItem): boolean => {
  return isContainerItem(item) && item.data.ignoreContentWeight === true;
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

  const getContainerContents = computed<(containerId: string) => InventoryItem[]>(() => {
    return (containerId: string): InventoryItem[] => {
      if (!character.value) return [];
      return character.value.inventory.filter((item) => item.parentId === containerId);
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

  const createNewItem = (libraryId: string, quantity: number, parentId?: string, index?: number): void => {
    const newItem = createItemFromLibrary(libraryId);
    if (!newItem || !character.value) return;

    newItem.quantity = quantity;
    newItem.parentId = parentId;

    if (typeof index === 'number') {
      character.value.inventory.splice(index, 0, newItem);
    } else {
      character.value.inventory.push(newItem);
    }

    save();
  };

  const addOrMerge = (libraryId: string, quantity: number, targetParentId?: string): void => {
    if (!character.value) return;

    const canStack = STACKABLE_ITEM_IDS.has(libraryId);
    if (!canStack) {
      createNewItem(libraryId, quantity, targetParentId);
      return;
    }

    const existingItem = character.value.inventory.find(
      (item) => item.templateId === libraryId && item.parentId === targetParentId
    );

    if (!existingItem) {
      createNewItem(libraryId, quantity, targetParentId);
      return;
    }

    existingItem.quantity += quantity;
    save();
  };

  const addPack = (packId: string, index?: number, parentId?: string): void => {
    const packDefinition = PACK_LIBRARY.find((pack) => pack.id === packId);
    if (!packDefinition || !character.value) return;

    let targetContainerId = parentId;

    if (packDefinition.containerId) {
      const containerItem = createItemFromLibrary(packDefinition.containerId);
      if (containerItem) {
        containerItem.parentId = parentId;

        if (typeof index === 'number') {
          character.value.inventory.splice(index, 0, containerItem);
        } else {
          character.value.inventory.push(containerItem);
        }

        targetContainerId = containerItem.instanceId;
      }
    }

    packDefinition.contents.forEach((content) => {
      addOrMerge(content.id, content.quantity, targetContainerId);
    });

    save();
  };

  const addItem = (libraryId: string, index?: number, parentId?: string): void => {
    if (!character.value) return;

    if (PACK_LIBRARY.some((pack) => pack.id === libraryId)) {
      addPack(libraryId, index, parentId);
      return;
    }

    if (libraryId === 'arrows' || libraryId === 'bolts') {
      let targetContainerId = parentId;

      if (!targetContainerId) {
        const existingQuiver = character.value.inventory.find((item) => item.templateId === 'quiver');
        if (existingQuiver) {
          targetContainerId = existingQuiver.instanceId;
        } else {
          const newQuiver = createItemFromLibrary('quiver');
          if (newQuiver) {
            character.value.inventory.push(newQuiver);
            targetContainerId = newQuiver.instanceId;
          }
        }
      }

      addOrMerge(libraryId, AMMO_BUNDLE_QUANTITY, targetContainerId);
      return;
    }

    if (libraryId === 'dart' && typeof index === 'undefined') {
      addOrMerge(libraryId, 1, parentId);
      return;
    }

    addOrMerge(libraryId, 1, parentId);
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

    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    item.quantity = newQuantity;
    save();
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

  const moveItemToContainer = (itemId: string, containerId: string, targetIndex?: number): void => {
    if (!character.value || itemId === containerId) return;

    const item = character.value.inventory.find((entry) => entry.instanceId === itemId);
    if (!item) return;

    item.parentId = containerId;
    reinsertItem(item, targetIndex);
    save();
  };

  const moveItemToRoot = (itemId: string, targetIndex?: number): void => {
    if (!character.value) return;

    const item = character.value.inventory.find((entry) => entry.instanceId === itemId);
    if (!item) return;

    item.parentId = undefined;
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
    rootInventory,
    getContainerContents,
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
    moveItemToContainer,
    moveItemToRoot,
    reorderItem,
  };
}