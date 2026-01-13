import { ref, computed } from 'vue';
import { useActiveSheetStore } from '../stores/activeSheet';
import { createItemFromLibrary } from '../utils/itemFactory';
import type { InventoryItem } from '../types/Item';

// --- 全局单例状态 ---
const draftItem = ref<InventoryItem | null>(null);
const forgeMode = ref<'create' | 'edit'>('create');

export function useForge() {
  const store = useActiveSheetStore();
  const draftData = computed(() => draftItem.value?.data as any || {});

  const handleDropData = (jsonStr: string) => {
    try {
      // 1. 解析数据
      let payload = JSON.parse(jsonStr);

      // 🛑 防御性修复：防止双重序列化 (Double Serialization)
      // 如果解析出来还是字符串，说明被 JSON.stringify 了两次，我们需要再 parse 一次
      if (typeof payload === 'string') {
        console.warn('⚠️ [Forge Logic] Payload is string, re-parsing...');
        try {
           payload = JSON.parse(payload);
           console.log('🔨 [Forge Logic] 2b. Re-parsed Payload:', payload);
        } catch (e) {
           console.error('💥 [Forge Logic] Re-parse failed:', e);
           return;
        }
      }

      // 2. 分支判断
      if (payload.type === 'library-item') {
        console.log('👉 [Branch] Hit: library-item. ID:', payload.id);
        
        const newItem = createItemFromLibrary(payload.id);
        
        if (newItem) {
          console.log('✅ [Success] Item Created:', newItem.name);
          draftItem.value = newItem; 
          forgeMode.value = 'create';
        } else {
          console.error('❌ [Error] createItemFromLibrary returned null! ID:', payload.id);
          // 调试：如果是测试ID，强行创建一个
          if (payload.id === 'TEST-ID') {
             console.warn('⚠️ Force creating TEST ITEM');
             draftItem.value = { 
               instanceId: 'test-inst', templateId: 'test', name: '测试物品', type: 'gear', weight: 1, quantity: 1, data: {} 
             } as any;
             forgeMode.value = 'create';
          }
        }

      } else if (payload.type === 'inventory-item') {
        console.log('👉 [Branch] Hit: inventory-item. InstanceId:', payload.instanceId);
        
        const original = store.character?.inventory.find(i => i.instanceId === payload.instanceId);
        
        if (original) {
          console.log('✅ [Success] Found existing item:', original.name);
          draftItem.value = JSON.parse(JSON.stringify(original));
          forgeMode.value = 'edit';
        } else {
          // 🔴 之前的问题很可能在这里：找不到 ID 就静默失败了
          console.error('❌ [Error] Item not found in inventory! InstanceId:', payload.instanceId);
          console.log('👀 Current Inventory IDs:', store.character?.inventory.map(i => i.instanceId));
        }

      } else {
        // 🔴 兜底日志：如果 type 不对，这里会报错
        console.error('❌ [Branch] Unknown payload type:', payload.type);
      }

    } catch (e) {
      console.error('💥 [Forge Logic] Fatal JSON Parse Error:', e);
    }
  };

    // --- 动作：保存 ---
  const save = () => {
    if (!draftItem.value) return;

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

/*

export function useForge() {
  const store = useActiveSheetStore();

  // 辅助计算属性，方便模板安全访问 data
  const draftData = computed(() => draftItem.value?.data as any || {});

  // --- 动作：处理拖拽放入 ---
  const handleDropData = (jsonStr: string) => {
    try {
      const payload = JSON.parse(jsonStr);

      if (payload.type === 'library-item') {
        // 来自资料库 -> 新建模式
        const newItem = createItemFromLibrary(payload.id);
        if (newItem) {
          draftItem.value = newItem; 
          forgeMode.value = 'create';
        }
      } else if (payload.type === 'inventory-item') {
        // 来自背包 -> 编辑模式
        const original = store.character?.inventory.find(i => i.instanceId === payload.instanceId);
        if (original) {
          // 深拷贝数据，防止编辑时直接污染 Store
          draftItem.value = JSON.parse(JSON.stringify(original));
          forgeMode.value = 'edit';
        }
      }
    } catch (e) {
      console.error('Forge parse error:', e);
    }
  };

  // --- 动作：保存 ---
  const save = () => {
    if (!draftItem.value) return;

    if (forgeMode.value === 'create') {
      store.character?.inventory.push(draftItem.value);
      store.save();
    } else {
      store.updateInventoryItem(draftItem.value);
    }
    close();
  };

  // --- 动作：关闭 ---
  const close = () => {
    draftItem.value = null;
  };

  return {
    draftItem,
    draftData,
    forgeMode,
    handleDropData,
    save,
    close
  };
}

*/