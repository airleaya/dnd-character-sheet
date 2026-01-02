<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { useActiveSheetStore } from '../../stores/activeSheet';
import draggable from 'vuedraggable';
import { calcRealIndex } from '../../utils/inventoryDropUtils';

const props = defineProps<{
  item: any; // 当前物品对象
}>();

const store = useActiveSheetStore();
const isExpanded = ref(false);

const tooltipApi = inject('inventoryTooltip', {
  onEnter: (item: any, e: MouseEvent) => {},
  onLeave: () => {}
});

// ---------------------------------------------
// 1. 堆叠与代理逻辑 (Proxy Logic)
// ---------------------------------------------

// 定义白名单：除了 consumable 类型外，还有哪些 ID 允许堆叠/调整数量
const STACKABLE_IDS = ['dart', 'rations', 'torch', 'oil'];

// 判断当前物品是否“可堆叠” (控制 +/- 按钮是否显示)
const isStackable = computed(() => {
  if (props.item.type === 'consumable') return true;
  if (props.item.data?.isAmmunition) return true;
  if (STACKABLE_IDS.includes(props.item.templateId)) return true;
  return false;
});

// 获取容器内容
const childItems = computed({
  get: () => store.getContainerContents(props.item.instanceId),
  set: (val) => { /* draggable 写入 */ }
});

// 🔥 核心逻辑：智能箭袋代理
// 如果是箭袋 (ignoreContentWeight=true)，且里面只有 1 种物品，则“穿透”控制内部物品
const proxyTargetItem = computed(() => {
  const data = props.item.data || {};
  
  // 必须是“忽略重量”的容器 (特征：箭袋/次元袋)
  if (props.item.type === 'container' && data.ignoreContentWeight) {
    const children = childItems.value;
    
    // 情况 A: 只有一个种类的物品 -> 代理它
    if (children.length === 1) {
      return children[0];
    }
    // 情况 B: 空或混合 -> 不代理，返回 null
    return null;
  }
  return null;
});

// 📊 最终显示的数值
const displayQuantity = computed(() => {
  // 如果处于代理模式，显示内部物品数量
  if (proxyTargetItem.value) {
    return proxyTargetItem.value.quantity;
  }
  // 否则显示自身数量
  return props.item.quantity;
});

// 🎮 处理 +/- 点击
const handleQuantityChange = (delta: number) => {
  // 如果处于代理模式，修改内部物品
  if (proxyTargetItem.value) {
    store.updateItemQuantity(proxyTargetItem.value.instanceId, delta);
  } else {
    // 否则修改自己
    store.updateItemQuantity(props.item.instanceId, delta);
  }
};

// ---------------------------------------------
// 2. 重量与交互逻辑
// ---------------------------------------------

const containerTotalWeight = computed(() => {
  const base = props.item.weight * props.item.quantity;
  const data = props.item.data || {};
  if (data.ignoreContentWeight) {
    return base.toFixed(1);
  }
  const contentWeight = childItems.value.reduce((sum: number, i: any) => sum + (i.weight * i.quantity), 0);
  return (base + contentWeight).toFixed(1);
});

const onDropIntoContainer = (evt: any) => {
  const currentChildren = store.getContainerContents(props.item.instanceId);
  const insertIndex = calcRealIndex(currentChildren, evt, store.character!.inventory);

  if (evt.added) {
    const newItem = evt.added.element;
    if (!newItem.instanceId) {
      store.addItem(newItem.libraryId, insertIndex, props.item.instanceId);
    } else {
      store.moveItemToContainer(newItem.instanceId, props.item.instanceId, insertIndex);
    }
  } else if (evt.moved) {
    store.reorderItem(evt.moved.element.instanceId, insertIndex);
  }
};

const handleDelete = () => {
  tooltipApi.onLeave();
  store.moveItemToTrash(props.item.instanceId);
};
</script>

<template>
  <div class="inventory-row-wrapper">
    
    <div 
      class="item-row" 
      :class="{ 
        'is-container': item.type === 'container',
        'is-proxy': !!proxyTargetItem /* 代理模式下给点特殊样式 */
      }"
      @mouseenter="tooltipApi.onEnter(item, $event)"
      @mouseleave="tooltipApi.onLeave()"
    >
      
      <div class="col-expand">
        <button 
          v-if="item.type === 'container'" 
          @click.stop="isExpanded = !isExpanded"
          class="btn-expand"
        >
          <span class="icon-arrow" :class="{ open: isExpanded }">▶</span>
        </button>
      </div>

      <div class="col-name">
        <span class="name-text">{{ item.name }}</span>
        
        <span v-if="item.type === 'container'" class="container-badge">
          <span v-if="childItems.length === 0">(空)</span>
          <span v-else-if="proxyTargetItem">({{ proxyTargetItem.name }})</span>
          <span v-else>(内含 {{ childItems.length }} 项)</span>
        </span>
      </div>

      <div class="col-weight">
        <span v-if="item.type === 'container'">{{ containerTotalWeight }} lb</span>
        <span v-else>{{ (item.weight * item.quantity).toFixed(2) }} lb</span>
      </div>

      <div class="col-qty">
        <div 
          v-if="isStackable || proxyTargetItem" 
          class="qty-controls"
          @click.stop
        >
          <button class="btn-mini minus" @click="handleQuantityChange(-1)">−</button>
          <span class="qty-val" :class="{ 'is-proxied': !!proxyTargetItem }">
            {{ displayQuantity }}
          </span>
          <button class="btn-mini plus" @click="handleQuantityChange(1)">+</button>
        </div>

        <div v-else class="qty-static">
          <span v-if="item.type === 'container' && !proxyTargetItem">--</span>
          <span v-else>x{{ item.quantity }}</span>
        </div>
      </div>

      <div class="col-actions">
         <button @click.stop="handleDelete" class="btn-del" title="移至废纸篓">
           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
         </button>
      </div>
    </div>

    <div v-if="item.type === 'container' && isExpanded" class="container-contents">
      <draggable 
        v-model="childItems"
        :group="{ name: 'inventory', put: ['library', 'inventory', 'equipment'] }"
        item-key="instanceId"
        class="nested-drag-area"
        @change="onDropIntoContainer"
        ghost-class="ghost"
      >
        <template #item="{ element }">
          <InventoryItemRow :item="element" />
        </template>
        
        <template #header>
          <div v-if="childItems.length === 0" class="empty-slot">
            <span>📭 拖拽物品至此存放</span>
          </div>
        </template>
      </draggable>
    </div>

  </div>
</template>

<style scoped lang="scss">
/* ---------------------------------
   🎨 全新明亮 UI 主题 (Modern Light)
   --------------------------------- */

.inventory-row-wrapper {
  border-bottom: 1px solid #e0e0e0; /* 浅灰分隔线 */
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.item-row {
  display: flex;
  align-items: center;
  padding: 6px 4px;
  background: #ffffff; /* 纯白背景 */
  color: #333333;      /* 深灰文字 */
  transition: background 0.1s;
  cursor: default;
  height: 36px; /* 固定高度，更整齐 */

  &:hover {
    background: #f1f3f5; /* 悬停微灰 */
  }

  /* 容器背景微调，区分层级 */
  &.is-container {
    background: #f8f9fa; 
    border-left: 3px solid #ced4da; /* 左侧加个条展示它是容器 */
    padding-left: 1px; /* 补偿 border 宽度 */
    
    &:hover { background: #e9ecef; }
  }

  /* 代理模式 (箭袋) 高亮 */
  &.is-proxy .qty-val {
    color: #2980b9; /* 蓝色数字提示这是内部数量 */
    font-weight: bold;
  }
}

/* --- 列布局 --- */

.col-expand { 
  width: 28px; 
  display: flex; 
  justify-content: center;
  align-items: center;
}
.btn-expand { 
  background: none; border: none; cursor: pointer; color: #adb5bd; padding: 4px; display: flex;
  &:hover { color: #495057; }
  .icon-arrow { font-size: 0.7rem; transition: transform 0.2s; display: inline-block; }
  .icon-arrow.open { transform: rotate(90deg); }
}

.col-name { 
  flex: 1; 
  display: flex; 
  align-items: center; 
  overflow: hidden;
  padding-right: 8px;

  .name-text { font-weight: 500; font-size: 0.9rem; }
  .container-badge { font-size: 0.75rem; color: #868e96; margin-left: 6px; font-style: italic; }
}

.col-weight { 
  width: 70px; 
  text-align: right; 
  font-family: monospace; 
  color: #868e96; 
  font-size: 0.85rem;
  margin-right: 12px;
}

/* --- 数量控制区 (核心) --- */
.col-qty { 
  width: 100px; 
  display: flex; 
  justify-content: flex-end; 
  align-items: center;
}

.qty-controls {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  overflow: hidden; /* 让子元素贴合圆角 */
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);

  .btn-mini {
    width: 22px;
    height: 22px;
    border: none;
    background: #f8f9fa;
    color: #495057;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.1s;

    &:hover { background: #e9ecef; color: #212529; }
    &:active { background: #dee2e6; }
    
    &.minus { border-right: 1px solid #f1f3f5; }
    &.plus { border-left: 1px solid #f1f3f5; }
  }

  .qty-val {
    min-width: 24px;
    text-align: center;
    font-size: 0.85rem;
    font-weight: 600;
    color: #343a40;
    padding: 0 4px;
  }
}

.qty-static {
  color: #868e96;
  font-size: 0.85rem;
  padding-right: 6px;
}

/* --- 操作列 --- */
.col-actions { 
  width: 36px; 
  display: flex; 
  justify-content: center; 
}
.btn-del { 
  border: none; background: none; color: #adb5bd; cursor: pointer; 
  padding: 4px; display: flex; align-items: center;
  &:hover { color: #e74c3c; background: rgba(231, 76, 60, 0.1); border-radius: 4px; }
}

/* --- 嵌套区域 --- */
.container-contents {
  padding-left: 24px; /* 缩进 */
  background: #fcfcfc; /* 内部稍微区分 */
  border-top: 1px solid #f1f3f5;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
}

.nested-drag-area { min-height: 10px; }

.empty-slot {
  padding: 12px;
  color: #adb5bd;
  font-size: 0.8rem;
  text-align: center;
  border: 1px dashed #dee2e6;
  margin: 6px;
  border-radius: 4px;
  background: rgba(0,0,0,0.01);
}

.ghost { opacity: 0.6; background: #e8f5e9; border: 1px dashed #42b983; }
</style>