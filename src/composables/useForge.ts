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
      console.error('💥 [Forge Logic] Invalid drag payload:', jsonStr);
      return;
    }

    try {
      // 2. 分支判断
      if (parsedPayload.type === 'library-item') {

        console.log('👉 [Branch] Hit: library-item. ID:', parsedPayload.id);
        
        const newItem = createItemFromLibrary(parsedPayload.id);

        
        if (newItem) {
          console.log('✅ [Success] Item Created:', newItem.name);
          draftItem.value = newItem; 
          forgeMode.value = 'create';
          ensureCostStructure(); // ✅ 确保新物品有价格结构
        } else {
                    console.error('❌ [Error] createItemFromLibrary returned null! ID:', parsedPayload.id);
          // 调试：如果是测试ID，强行创建一个
          if (parsedPayload.id === 'TEST-ID') {

             console.warn('⚠️ Force creating TEST ITEM');
                          draftItem.value = {
               instanceId: 'test-inst',
               templateId: 'test',
               name: '测试物品',
               type: 'gear',
               weight: 1,
               quantity: 1,
               data: {}
             };
             forgeMode.value = 'create';
             ensureCostStructure(); // ✅ 确保新物品有价格结构
          }
        }

            } else if (parsedPayload.type === 'inventory-item') {
        console.log('👉 [Branch] Hit: inventory-item. InstanceId:', parsedPayload.instanceId);
        
        const original = store.character?.inventory.find(i => i.instanceId === parsedPayload.instanceId);

        
        if (original) {
          console.log('✅ [Success] Found existing item:', original.name);
          draftItem.value = JSON.parse(JSON.stringify(original));
          forgeMode.value = 'edit';
          ensureCostStructure(); // ✅ 确保新物品有价格结构
        } else {
          // 🔴 之前的问题很可能在这里：找不到 ID 就静默失败了
                    console.error('❌ [Error] Item not found in inventory! InstanceId:', parsedPayload.instanceId);

          console.log('👀 Current Inventory IDs:', store.character?.inventory.map(i => i.instanceId));
        }

            } else {
        // 🔴 兜底日志：如果 type 不对，这里会报错
        console.error('❌ [Branch] Unknown payload shape:', parsedPayload);
      }


    } catch (e) {
      console.error('💥 [Forge Logic] Fatal JSON Parse Error:', e);
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
