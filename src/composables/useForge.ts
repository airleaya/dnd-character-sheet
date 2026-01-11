import { ref, computed } from 'vue';
import { useActiveSheetStore } from '../stores/activeSheet';
import { createItemFromLibrary } from '../utils/itemFactory';
import type { InventoryItem } from '../types/Item';

// --- 全局单例状态 ---
const draftItem = ref<InventoryItem | null>(null);
const forgeMode = ref<'create' | 'edit'>('create');

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