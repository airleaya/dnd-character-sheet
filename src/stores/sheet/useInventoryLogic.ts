import { computed } from 'vue';
import type { Ref } from 'vue';
import type { Character } from '../../types/Character';
import type { InventoryItem } from '../../types/Item';
import { createItemFromLibrary } from '../../utils/itemFactory';
import { CURRENCY_RATES } from '../../data/rules/currency';
import { PACK_LIBRARY } from '../../data/libraries/packs';

// 纯函数：递归计算重量
function computeItemWeightRecursive(item: any, allItems: any[]): number {
  let w = (item.weight || 0) * (item.quantity || 1);
  if (item.type === 'container') {
    const data = item.data || {};
    if (data.ignoreContentWeight) return w;
    const children = allItems.filter(child => child.parentId === item.instanceId);
    const childrenWeight = children.reduce((acc, child) => {
      return acc + computeItemWeightRecursive(child, allItems);
    }, 0);
    return w + childrenWeight;
  }
  return w;
}

export function useInventoryLogic(
  character: Ref<Character | null>,
  trash: Ref<InventoryItem[]>,
  save: () => void
) {
  // ==========================================
  // 🧠 Getters (计算属性)
  // ==========================================

  const totalInventoryWeight = computed(() => {
    if (!character.value) return 0;
    const inventory = character.value.inventory;
    const roots = inventory.filter(i => !i.parentId);
    const total = roots.reduce((sum, item) => {
      return sum + computeItemWeightRecursive(item, inventory);
    }, 0);
    return parseFloat(total.toFixed(2));
  });

  const totalWeight = computed(() => totalInventoryWeight.value);

  const getItemWeight = computed(() => (item: any): number => {
    if (!character.value) return 0;
    const val = computeItemWeightRecursive(item, character.value.inventory);
    return parseFloat(val.toFixed(2));
  });

  const carryingCapacity = computed(() => {
    if (!character.value) return 0;
    return character.value.stats.str * 15;
  });

  const rootInventory = computed(() => {
    if (!character.value) return [];
    return character.value.inventory.filter(i => !i.parentId);
  });

  const getContainerContents = computed(() => (containerId: string) => {
    if (!character.value) return [];
    return character.value.inventory.filter(i => i.parentId === containerId);
  });

  // ==========================================
  // 🛠️ Actions - 经济系统 (Wallet)
  // ==========================================

  const initWalletIfMissing = () => {
    if (character.value && !character.value.wallet) {
      character.value.wallet = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
    }
  };

  const modifyCurrency = (type: keyof typeof CURRENCY_RATES, amount: number): boolean => {
    if (!character.value) return false;
    initWalletIfMissing();
    const wallet = character.value!.wallet;

    let highPoolPP = wallet.pp; 
    let lowPoolCP = 
      (wallet.gp * CURRENCY_RATES.gp) +
      (wallet.ep * CURRENCY_RATES.ep) +
      (wallet.sp * CURRENCY_RATES.sp) +
      (wallet.cp * CURRENCY_RATES.cp);

    if (type === 'pp') {
      highPoolPP += amount;
    } else {
      lowPoolCP += amount * CURRENCY_RATES[type];
    }

    while (lowPoolCP < 0) {
      if (highPoolPP > 0) {
        highPoolPP -= 1;
        lowPoolCP += CURRENCY_RATES.pp;
      } else {
        break;
      }
    }

    while (highPoolPP < 0) {
      const cost = CURRENCY_RATES.pp;
      if (lowPoolCP >= cost) {
        lowPoolCP -= cost;
        highPoolPP += 1;
      } else {
        break;
      }
    }

    if (lowPoolCP < 0 || highPoolPP < 0) return false;

    wallet.pp = highPoolPP;
    let remaining = lowPoolCP;

    wallet.gp = Math.floor(remaining / CURRENCY_RATES.gp);
    remaining %= CURRENCY_RATES.gp;
    wallet.ep = 0; 
    wallet.sp = Math.floor(remaining / CURRENCY_RATES.sp);
    remaining %= CURRENCY_RATES.sp;
    wallet.cp = remaining;

    save();
    return true;
  };

  const updateWallet = (type: 'cp' | 'sp' | 'ep' | 'gp' | 'pp', value: number) => {
    if (!character.value) return;
    if (!character.value.wallet) {
      character.value.wallet = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
    }
    character.value.wallet[type] = value;
    save();
  };

  // ==========================================
  // 📦 Actions - 物品系统 (Inventory)
  // ==========================================

  const _createNewItem = (libraryId: string, quantity: number, parentId?: string, index?: number) => {
    const newItem = createItemFromLibrary(libraryId);
    if (!newItem) return;

    newItem.quantity = quantity;
    newItem.parentId = parentId;

    if (typeof index === 'number') {
      character.value!.inventory.splice(index, 0, newItem);
    } else {
      character.value!.inventory.push(newItem);
    }
    save();
  };

  const _addOrMerge = (libraryId: string, quantity: number, targetParentId?: string) => {
    if (!character.value) return;

    const STACKABLE_IDS = ['arrows', 'bolts', 'dart'];
    const canStack = STACKABLE_IDS.includes(libraryId);

    if (!canStack) {
      _createNewItem(libraryId, quantity, targetParentId);
      return;
    }

    const existingItem = character.value.inventory.find(
      i => i.templateId === libraryId && i.parentId === targetParentId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      save();
    } else {
      _createNewItem(libraryId, quantity, targetParentId);
    }
  };

  const _addPack = (packId: string, index?: number, parentId?: string) => {
    const packDef = PACK_LIBRARY.find(p => p.id === packId);
    if (!packDef) return;

    let targetContainerId = parentId;

    if (packDef.containerId) {
      const containerItem = createItemFromLibrary(packDef.containerId);
      if (containerItem) {
        containerItem.parentId = parentId;
        if (typeof index === 'number') {
          character.value!.inventory.splice(index, 0, containerItem);
        } else {
          character.value!.inventory.push(containerItem);
        }
        targetContainerId = containerItem.instanceId; 
      }
    }

    packDef.contents.forEach(content => {
      _addOrMerge(content.id, content.quantity, targetContainerId);
    });
    save();
  };

  const addItem = (libraryId: string, index?: number, parentId?: string) => {
    if (!character.value) return;

    if (PACK_LIBRARY.some(p => p.id === libraryId)) {
      _addPack(libraryId, index, parentId);
      return;
    }

    if (libraryId === 'arrows' || libraryId === 'bolts') {
      const AMMO_BUNDLE_QTY = 20;
      let targetContainerId = parentId;
      
      if (!targetContainerId) {
        const existingQuiver = character.value.inventory.find(i => i.templateId === 'quiver');
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
      _addOrMerge(libraryId, AMMO_BUNDLE_QTY, targetContainerId);
      return;
    }

    if (libraryId === 'dart') {
      if (typeof index === 'undefined') {
         _addOrMerge(libraryId, 1, parentId);
         return;
      }
    }

    _addOrMerge(libraryId, 1, parentId);
  };

  const removeItem = (instanceId: string) => {
    if (!character.value) return;
    character.value.inventory = character.value.inventory.filter(i => i.instanceId !== instanceId);
    character.value.equippedIds = character.value.equippedIds.filter(id => id !== instanceId);
    save();
  };

  const moveItemToTrash = (instanceId: string) => {
    if (!character.value) return;
    const item = character.value.inventory.find(i => i.instanceId === instanceId);
    if (item) {
      trash.value.push(item);
      removeItem(instanceId);
    }
  };

  const emptyTrash = () => {
    trash.value = [];
  };

  const updateInventoryItem = (newItem: InventoryItem) => {
    if (!character.value) return;
    const index = character.value.inventory.findIndex(i => i.instanceId === newItem.instanceId);
    if (index > -1) {
      character.value.inventory[index] = newItem;
      save();
    }
  };

  const updateEquippedList = (newIds: string[]) => {
    if (!character.value) return;
    character.value.equippedIds = [...new Set(newIds)];
    save();
  };

  const updateItemQuantity = (instanceId: string, delta: number) => {
    if (!character.value) return;
    const item = character.value.inventory.find(i => i.instanceId === instanceId);
    if (item) {
      const newQty = item.quantity + delta;
      if (newQty < 1) return;
      item.quantity = newQty;
      save();
    }
  };

  // --- 移动与排序 ---
  const _reinsertItem = (item: any, index?: number) => {
    if (!character.value) return;
    const oldIndex = character.value.inventory.indexOf(item);
    if (oldIndex > -1) {
      character.value.inventory.splice(oldIndex, 1);
    }
    let finalIndex = (typeof index === 'number') ? index : character.value.inventory.length;
    if (oldIndex > -1 && oldIndex < finalIndex) {
      finalIndex--;
    }
    character.value.inventory.splice(finalIndex, 0, item);
  };

  const moveItemToContainer = (itemId: string, containerId: string, targetIndex?: number) => {
    if (!character.value) return;
    if (itemId === containerId) return;
    const item = character.value.inventory.find(i => i.instanceId === itemId);
    if (item) {
      item.parentId = containerId;
      _reinsertItem(item, targetIndex);
      save();
    }
  };

  const moveItemToRoot = (itemId: string, targetIndex?: number) => {
    if (!character.value) return;
    const item = character.value.inventory.find(i => i.instanceId === itemId);
    if (item) {
      item.parentId = undefined;
      _reinsertItem(item, targetIndex);
      save();
    }
  };

  const reorderItem = (itemId: string, targetIndex: number) => {
    if (!character.value) return;
    const item = character.value.inventory.find(i => i.instanceId === itemId);
    if (item) {
      _reinsertItem(item, targetIndex);
      save();
    }
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
    reorderItem
  };
}