import { ref, computed } from 'vue';
import { useActiveSheetStore } from '../stores/activeSheet';
import { createItemFromLibrary } from '../utils/itemFactory';
import { parseDragPayload } from '../utils/inventoryDropUtils';
import type { InventoryItem } from '../types/Item';
import type { ArmorType, CurrencyUnit } from '../types/Library';


export interface ForgeDraftData {
  cost: {
    value: number;
    unit: CurrencyUnit;
  };
  damage?: string;
  damageType?: string;
  properties?: string[];
  ac?: number;
  armorType?: ArmorType;
}


// --- 全局单例状态 ---

const draftItem = ref<InventoryItem | null>(null);
const forgeMode = ref<'create' | 'edit'>('create');

export function useForge() {
  const store = useActiveSheetStore();
  const draftData = computed<ForgeDraftData>(() => {
    if (!draftItem.value) {
      return {
        cost: { value: 0, unit: 'gp' },
      };
    }

    return draftItem.value.data as ForgeDraftData;
  });





  // 🛡️ 新增：最小化的数据补全函数
  const ensureCostStructure = () => {
    if (!draftItem.value) return;
    const data = draftData.value;

    
    // 如果 cost 不存在，或者格式不对，初始化它
    // 基于 Library.ts 的 ItemCost 定义: { value, unit }
    if (!('cost' in data) || !data.cost) {
      data.cost = { value: 0, unit: 'gp' };
    } else {
      // 兼容性检查：确保 value 存在 (防止 undefined 显示)
      if (typeof data.cost.value !== 'number') data.cost.value = 0;
      if (!data.cost.unit) data.cost.unit = 'gp';
    }

  };


  const handleDropData = (jsonStr: string) => {
    const parsedPayload = parseDragPayload(jsonStr);
    if (!parsedPayload) {
      console.error('[forge] Invalid drag payload');
      return;
    }

    try {
      // 2. 分支判断
      if (parsedPayload.type === 'library-item') {
        const newItem = createItemFromLibrary(parsedPayload.id);
        if (newItem) {
          draftItem.value = newItem;
          forgeMode.value = 'create';
          ensureCostStructure();
        } else {
          console.error(`[forge] Failed to create library item: ${parsedPayload.id}`);
          if (parsedPayload.id === 'TEST-ID') {
            draftItem.value = {
              instanceId: 'test-inst',
              templateId: 'test',
              name: '测试物品',
              type: 'gear',
              weight: 1,
              quantity: 1,
              data: {},
            };
            forgeMode.value = 'create';
            ensureCostStructure();
          }
        }
      } else if (parsedPayload.type === 'inventory-item') {
        const original = store.character?.inventory.find(i => i.instanceId === parsedPayload.instanceId);
        if (original) {
          draftItem.value = JSON.parse(JSON.stringify(original));
          forgeMode.value = 'edit';
          ensureCostStructure();
        } else {
          console.error(`[forge] Inventory item not found: ${parsedPayload.instanceId}`);
        }
      } else {
        console.error('[forge] Unknown drag payload shape');
      }
    } catch (e) {
      console.error('[forge] Failed to handle dropped item', e);
    }
  };

    // --- 动作：保存 ---
  const save = () => {
    if (!draftItem.value) return;

    ensureCostStructure(); // ✅ 确保新物品有价格结构

    if (forgeMode.value === 'create') {
      store.character?.inventory.push(draftItem.value);
      store.save();
    } else {
      store.updateInventoryItem(draftItem.value);
    }
    close();
  };

  // --- 动作：关闭 ---
  const close = () => { draftItem.value = null; };

  return {
    draftItem,
    draftData,
    forgeMode,
    handleDropData,
    save,
    close
  };
}
