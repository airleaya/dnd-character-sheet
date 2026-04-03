<script setup lang="ts">
import { computed, ref } from 'vue';
import draggable from 'vuedraggable';
import { useActiveSheetStore } from '../../../stores/activeSheet';
import type { InventoryItem, ArmorData } from '../../../types/Item';

const store = useActiveSheetStore();
const rejectedItems = ref<InventoryItem[]>([]); 

// 汉化映射
const armorTypeMap: Record<string, string> = {
  light: '轻甲', medium: '中甲', heavy: '重甲', shield: '盾牌'
};

/**
 * 🛡️ 核心逻辑：熟练项检查
 * 检查当前物品的类型是否在角色的 proficiencies.armor 列表中
 */
const isProficient = (item: InventoryItem) => {
  
  if (item.type !== 'armor') return true;
  const data = item.data as ArmorData;
  const type = data.armorType;
  if (!store.character) return true;
    
  // 如果没有类型（或者是普通衣物），视为熟练
  if (!type) return true;

  // 检查是否包含
  return store.character.proficiencies.armor.includes(type);
};

// 获取显示的类型名称
const getArmorLabel = (item: InventoryItem) => {
  // 同理，非防具直接返回默认值
  if (item.type !== 'armor') return '防具';

  // 断言
  const data = item.data as ArmorData;
  const type = data.armorType;
  return armorTypeMap[type] || '防具';
};

/**
 * 🔄 双向绑定列表
 * 防具栏只是一个“投影”，它反映的是 inventory 中被 equippedIds 标记的那些物品
 */
const equippedList = computed({
  get() {
    if (!store.character) return [];
    // 遍历 ID 列表，去背包里找对应的真实物品对象
    return store.character.equippedIds
      .map(id => store.character!.inventory.find(i => i.instanceId === id))
      .filter(item => item !== undefined) as InventoryItem[];
  },
  set(newVal: InventoryItem[]) {
    // -------------------------------------------------------------
    // 1. 识别操作类型
    // -------------------------------------------------------------
    // 如果 newVal 比旧列表短，说明发生了【拖出卸下】
    // 如果 newVal 比旧列表长，说明发生了【拖入装备】
    // 如果长度一样但顺序变了，说明是【排序】（虽然防具栏排序意义不大）

    const currentIds = store.character?.equippedIds || [];
    
    // 提取新列表中的所有 ID
    const newIds = newVal.map(i => i.instanceId);

    // -------------------------------------------------------------
    // 2. 检查是否有非法物品混入 (仅针对新拖入的)
    // -------------------------------------------------------------
    const incomingItem = newVal.find(i => !currentIds.includes(i.instanceId));

    if (incomingItem) {
      // 这是一个新拖进来的物品，进行校验
      if (incomingItem.type === 'armor' && incomingItem.instanceId) {
        // 合法防具：直接更新 Store 中的 ID 列表
        store.updateEquippedList(newIds);
      } else {
        // 非法物品：拒绝（播放动画，且不更新 Store）
        playBounceAnimation(incomingItem);
        // Vue Draggable 会因为 Store 没更新而自动回弹，不需要额外操作
      }
    } else {
      // 没有新物品，说明是【移除】或者【排序】
      // 直接把新的 ID 列表同步给 Store 即可
      // 这一步实现了“拖出即卸下”
      store.updateEquippedList(newIds);
    }
  }
});

// 手动点击 "×" 按钮卸下
const handleRemove = (instanceId: string) => {
  const currentIds = store.character?.equippedIds || [];
  const newIds = currentIds.filter(id => id !== instanceId);
  store.updateEquippedList(newIds);
};

// 错误反馈动画
const playBounceAnimation = (item: InventoryItem) => {
  rejectedItems.value.push(item);
  setTimeout(() => {
    rejectedItems.value = rejectedItems.value.filter(i => i !== item);
  }, 1000);
};
</script>

<template>
  <div class="equipment-zone">
    <div class="zone-header">
      <div class="zone-label">🛡️ 防具栏 (Armor Class)</div>
      
      <div v-if="store.isWearingNonProficientArmor" class="global-warning">
        ⚠️ 穿着不熟练防具：劣势 & 禁法
      </div>
    </div>

    <draggable 
      v-model="equippedList" 
      :group="{ name: 'equipment', put: ['inventory'], pull: true }" 
      item-key="instanceId"
      class="equip-slots"
      ghost-class="ghost"
      :animation="200"
    >
      <template #item="{ element }">
        <div 
          class="equip-card" 
          :class="{ 'non-proficient': !isProficient(element) }"
          :title="!isProficient(element) ? '警告：你无法熟练使用此防具，检定将具有劣势' : ''"
        >
          <div class="icon">🛡️</div>
          
          <div class="card-content">
            <div class="name-row">
              <span class="name">{{ element.name }}</span>
              <span v-if="!isProficient(element)" class="warn-icon">⚠️</span>
            </div>
            <div class="meta-row">
              <span class="type-badge">{{ getArmorLabel(element) }}</span>
              <span class="ac-badge" v-if="element.data?.ac">AC {{ element.data.ac }}</span>
            </div>
          </div>

          <button class="btn-unequip" @click.stop="handleRemove(element.instanceId)" title="卸下">
            ×
          </button>
        </div>
      </template>
    </draggable>

    <div class="rejection-layer">
      <transition-group name="bounce">
        <div 
          v-for="item in rejectedItems" 
          :key="item.instanceId" 
          class="rejected-card"
        >
          🚫 {{ item.name }} (无法装备)
        </div>
      </transition-group>
    </div>
  </div>
</template>

<style scoped lang="scss">
.equipment-zone {
  background: #f8f9fa;
  border: 2px dashed #cfd8dc;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  position: relative; 
  min-height: 110px;
  transition: border-color 0.2s;

  &:hover {
    border-color: #90a4ae;
  }

  .zone-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.8rem;
  }

  .zone-label {
    font-size: 0.85rem;
    font-weight: 800;
    color: #546e7a;
    text-transform: uppercase;
  }

  /* 🔴 全局警告条样式 */
  .global-warning {
    font-size: 0.75rem;
    color: #c0392b;
    background: #fadbd8;
    padding: 3px 8px;
    border-radius: 4px;
    font-weight: bold;
    animation: flash 2s infinite;
    display: flex;
    align-items: center;
  }

  .equip-slots {
    min-height: 60px;
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
  }

  .equip-card {
    background: white;
    border: 1px solid #dee2e6;
    border-left: 3px solid #3498db; /* 默认熟练颜色: 蓝 */
    border-radius: 4px;
    padding: 6px 10px;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.03);
    cursor: grab;
    transition: all 0.2s;
    min-width: 180px;
    position: relative;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.08);
      .btn-unequip { opacity: 1; }
    }

    /* 🔴 不熟练时的卡片样式 */
    &.non-proficient {
      border-color: #e74c3c;
      border-left-color: #e74c3c;
      background-color: #fdedec; /* 浅红背景 */
      
      .name { color: #c0392b; }
      .icon { filter: grayscale(1) hue-rotate(300deg); } /* 图标变红 */
    }

    .card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .name-row {
      display: flex; align-items: center; gap: 4px;
      .name { font-weight: 600; font-size: 0.9rem; color: #2c3e50; }
      .warn-icon { font-size: 0.8rem; cursor: help; }
    }

    .meta-row {
      display: flex; gap: 6px; font-size: 0.75rem;
    }

    .type-badge { color: #7f8c8d; }

    .ac-badge {
      background: #34495e; color: white; padding: 0 4px; border-radius: 3px; font-weight: bold;
    }

    .btn-unequip {
      opacity: 0;
      background: none; border: none; color: #95a5a6; font-size: 1.2rem; cursor: pointer; padding: 0 4px; line-height: 1;
      transition: opacity 0.2s;
      &:hover { color: #e74c3c; }
    }
  }

  .ghost {
    opacity: 0.4;
    background: #ecf0f1;
    border: 2px dashed #bdc3c7;
  }
}

.rejection-layer {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none; overflow: hidden;
}

.rejected-card {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: #ffcdd2; color: #c62828;
  border: 1px solid #e57373;
  padding: 0.5rem 1rem; border-radius: 4px;
  font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 99;
}

.bounce-enter-active { animation: bounce-out 0.8s ease-in-out forwards; }
@keyframes bounce-out {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  20% { transform: translate(-50%, -50%) scale(1.2); }
  100% { transform: translate(200px, -200px) rotate(45deg) scale(0.5); opacity: 0; }
}
@keyframes flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
</style>

<!-- <style scoped lang="scss">
.equipment-zone {
  background: #e3f2fd;
  border: 2px dashed #90caf9;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
  position: relative; 
  min-height: 100px;

  .zone-label {
    font-size: 0.8rem;
    font-weight: bold;
    color: #1976d2;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
  }

  .equip-slots {
    min-height: 60px;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .equip-card {
    background: white;
    border: 1px solid #bbdefb;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    cursor: grab;

    .ac-badge {
      background: #2c3e50;
      color: white;
      font-size: 0.7rem;
      padding: 2px 4px;
      border-radius: 4px;
    }
  }

  .ghost {
    opacity: 0.5;
    background: #bbdefb;
    border: 2px dashed #1976d2;
  }
}

.rejection-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; 
  overflow: hidden;
}

.rejected-card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #ffcdd2;
  color: #c62828;
  border: 1px solid #e57373;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  z-index: 99;
}

.bounce-enter-active {
  animation: bounce-out 0.8s ease-in-out forwards;
}
.bounce-leave-active {
  transition: opacity 0.2s;
}
.bounce-leave-to {
  opacity: 0;
}

@keyframes bounce-out {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  20% {
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    transform: translate(200px, -200px) rotate(45deg) scale(0.5); 
    opacity: 0;
  }
}
</style> -->