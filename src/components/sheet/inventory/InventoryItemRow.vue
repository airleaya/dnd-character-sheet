<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { useActiveSheetStore } from '../../../stores/activeSheet';
import { useUiFeedbackStore } from '../../../stores/uiFeedback';
import draggable from 'vuedraggable';
import {
  calcRealIndex,
  isInventoryInstanceDragElement,
  isLibraryCloneDragElement,
  setupDragData,
} from '../../../utils/inventoryDropUtils';
import { formatContainerCapacity } from '../../../utils/containerCapacity';
import { getRuntimeLibraryItemById } from '../../../data/dataPacks/runtimeDataPacks';
import {
  formatMagicItemName,
  getMagicInventoryStyle,
  requiresAttunement,
  isAttuned,
  resolveMagicTraitsForItem,
} from '../../../utils/magicItems';
import type { InventoryDragChangeEvent } from '../../../utils/inventoryDropUtils';

import type { InventoryItem } from '../../../types/Item';

type InventoryTooltipApi = {
  onEnter: (item: InventoryItem, event: MouseEvent) => void;
  onLeave: () => void;
};



const props = defineProps<{
  item: InventoryItem;
}>();

const store = useActiveSheetStore();
const feedback = useUiFeedbackStore();
const isExpanded = ref(false);

const ignoresContentWeight = (item: InventoryItem) => 'ignoreContentWeight' in item.data && item.data.ignoreContentWeight === true;

const tooltipApi = inject<InventoryTooltipApi>('inventoryTooltip', {
  onEnter: () => {},
  onLeave: () => {}
});

// ---------------------------------------------
// 1. 堆叠与代理逻辑 (Proxy Logic)
// ---------------------------------------------

// 获取容器内容
const childItems = computed({
  get: () => store.getContainerContents(props.item.instanceId),
  set: () => { /* draggable 写入 */ }
});

const hangingItems = computed({
  get: () => {
    const item = store.getContainerHangingItem(props.item.instanceId);
    return item ? [item] : [];
  },
  set: () => { /* draggable 写入由 change 事件处理 */ }
});

const hasHangingSlot = computed(() => props.item.type === 'container' && props.item.templateId === 'backpack');
const containerContentItems = computed(() => [...childItems.value, ...hangingItems.value]);

// 判断当前物品是否“可堆叠” (控制 +/- 按钮是否显示)
const isStackable = computed(() => props.item.type !== 'container' || containerContentItems.value.length === 0);

const formatPreviewItem = (item: InventoryItem): string =>
  item.quantity > 1 ? `${item.name} x${item.quantity}` : item.name;

const containerPreviewLabel = computed(() => {
  const children = childItems.value;
  const hanging = hangingItems.value;

  if (children.length === 0 && hanging.length === 0) {
    return '空';
  }

  const parts = children.map(formatPreviewItem);
  if (hanging.length > 0) {
    parts.push(`悬挂 ${formatPreviewItem(hanging[0])}`);
  }

  return parts.join('，');
});

const containerCapacityLabel = computed(() => formatContainerCapacity(props.item));
const templateName = computed(() => getRuntimeLibraryItemById(props.item.templateId)?.name ?? '');
const shouldShowTemplateName = computed(
  () => Boolean(templateName.value) && templateName.value !== props.item.name
);
const displayName = computed(() => formatMagicItemName(props.item));
const itemRowStyle = computed(() => getMagicInventoryStyle(props.item));
const itemNameStyle = computed(() =>
  props.item.magic?.isMagic
    ? { color: props.item.magic.visuals?.nameColor || itemRowStyle.value?.color }
    : undefined
);
const needsAttunement = computed(() => requiresAttunement(props.item));
const attuned = computed(() => isAttuned(props.item));
const magicTraits = computed(() => resolveMagicTraitsForItem(props.item));
const visibleMagicTraits = computed(() => magicTraits.value.slice(0, 3));

// 核心逻辑：通用容器代理
// 如果任意容器内只有 1 种内容物，则“穿透”控制该内容物数量
const proxyTargetItem = computed(() => {
  if (props.item.type !== 'container') {
    return null;
  }

  const contents = containerContentItems.value;
  if (contents.length === 1) {
    return contents[0];
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

const handleToggleAttunement = () => {
  const success = store.toggleItemAttunement(props.item.instanceId);
  if (!success && !attuned.value) {
    feedback.showToast('同调上限为 3 件物品', 'warning');
  }
};

// ---------------------------------------------
// 2. 重量与交互逻辑
// ---------------------------------------------

const containerSelfWeight = computed(() => props.item.weight * props.item.quantity);

const containerContentWeight = computed(() => {
  if (ignoresContentWeight(props.item)) {
    return 0;
  }

  return containerContentItems.value.reduce((sum: number, item: InventoryItem) => sum + store.getItemWeight(item), 0);
});

const containerWeightLabel = computed(() => {
  return `${containerSelfWeight.value.toFixed(1)} + ${containerContentWeight.value.toFixed(1)}`;
});

const onDropIntoContainer = (evt: InventoryDragChangeEvent) => {
  const currentChildren = store.getContainerContents(props.item.instanceId);
  const insertIndex = calcRealIndex(currentChildren, evt, store.character!.inventory);

  if (evt.added) {
    const newItem = evt.added.element;
    if (isLibraryCloneDragElement(newItem)) {
      store.addItem(newItem.libraryId, insertIndex, props.item.instanceId);
    } else if (isInventoryInstanceDragElement(newItem)) {
      store.moveItemToContainer(newItem.instanceId, props.item.instanceId, insertIndex);
    }
  } else if (evt.moved) {
    const movedItem = evt.moved.element;
    if (isInventoryInstanceDragElement(movedItem)) {
      store.reorderItem(movedItem.instanceId, insertIndex);
    }
  }
};

const onDropIntoHangingSlot = (evt: InventoryDragChangeEvent) => {
  if (!hasHangingSlot.value || hangingItems.value.length > 0) return;

  if (evt.added) {
    const newItem = evt.added.element;
    if (isLibraryCloneDragElement(newItem)) {
      store.addItem(newItem.libraryId, undefined, props.item.instanceId, 'hanging');
    } else if (isInventoryInstanceDragElement(newItem)) {
      store.moveItemToContainerSlot(newItem.instanceId, props.item.instanceId, 'hanging');
    }
  }
};


const onDragStart = (e: DragEvent, item: InventoryItem) => {
  setupDragData(e, 'inventory-item', item.instanceId);
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
      :style="itemRowStyle"
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
        <span class="name-stack">
          <span class="name-text" :style="itemNameStyle">{{ displayName }}</span>
          <span v-if="shouldShowTemplateName" class="template-name">（{{ templateName }}）</span>
        </span>
        
        <span v-if="item.type === 'container'" class="container-badge">
          <span class="container-capacity">容量：{{ containerCapacityLabel }}</span>
          <span>({{ containerPreviewLabel }})</span>
        </span>
        <span v-else-if="visibleMagicTraits.length" class="enchant-tags">
          <span v-for="trait in visibleMagicTraits" :key="trait.id" class="enchant-tag">
            {{ trait.name }}
          </span>
          <span v-if="magicTraits.length > visibleMagicTraits.length" class="enchant-more">
            +{{ magicTraits.length - visibleMagicTraits.length }}
          </span>
        </span>
      </div>

      <div class="col-weight">
        <span
          v-if="item.type === 'container'"
          :title="`自重 ${containerSelfWeight.toFixed(1)} lb + 内容 ${containerContentWeight.toFixed(1)} lb`"
        >
          {{ containerWeightLabel }} lb
        </span>
        <span v-else>{{ (item.weight * item.quantity).toFixed(2) }} lb</span>
      </div>

      <div class="col-qty">
        <div 
          v-if="needsAttunement"
          class="attune-control"
          @click.stop
        >
          <button
            type="button"
            class="btn-attune"
            :class="{ active: attuned }"
            :title="attuned ? '取消同调' : '同调该物品'"
            @click="handleToggleAttunement"
          >
            {{ attuned ? '已同调' : '同调' }}
          </button>
        </div>

        <div
          v-else-if="isStackable || proxyTargetItem"
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
          <InventoryItemRow 
          :item="element" 
          @dragstart="onDragStart($event, element)"
          />
        </template>
        
        <template #header>
          <div v-if="childItems.length === 0" class="empty-slot">
            <span>📭 拖拽物品至此存放</span>
          </div>
        </template>
      </draggable>

      <div v-if="hasHangingSlot" class="hanging-slot-shell">
        <div class="hanging-slot-label">
          <span class="hanging-dot"></span>
          <span>悬挂栏</span>
          <small>额外 1 格</small>
        </div>
        <draggable
          v-model="hangingItems"
          :group="{ name: 'inventory', put: ['library', 'inventory', 'equipment'] }"
          item-key="instanceId"
          class="hanging-drag-area"
          @change="onDropIntoHangingSlot"
          ghost-class="ghost"
        >
          <template #item="{ element }">
            <InventoryItemRow
              :item="element"
              @dragstart="onDragStart($event, element)"
            />
          </template>

          <template #header>
            <div v-if="hangingItems.length === 0" class="hanging-empty-slot">
              <span>挂一件物品</span>
            </div>
          </template>
        </draggable>
      </div>
    </div>

  </div>
</template>

<style scoped lang="scss">
/* ---------------------------------
   🎨 全新明亮 UI 主题 (Modern Light)
   --------------------------------- */

.inventory-row-wrapper {
  border-bottom: 1px solid var(--color-inventory-row-divider); /* 浅灰分隔线 */
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.item-row {
  display: flex;
  align-items: center;
  padding: 6px 4px;
  background: var(--color-inventory-row-bg); /* 纯白背景 */
  color: var(--color-inventory-row-text);      /* 深灰文字 */
  transition: background 0.1s;
  cursor: default;
  height: 36px; /* 固定高度，更整齐 */

  &:hover {
    background: var(--color-inventory-row-hover); /* 悬停微灰 */
  }

  /* 容器背景微调，区分层级 */
  &.is-container {
    background: var(--color-inventory-container-bg);
    border-left: 3px solid var(--color-inventory-container-border); /* 左侧加个条展示它是容器 */
    padding-left: 1px; /* 补偿 border 宽度 */
    
    &:hover { background: var(--color-inventory-container-hover); }
  }

  /* 代理模式 (箭袋) 高亮 */
  &.is-proxy .qty-val {
    color: var(--color-inventory-proxy-text); /* 蓝色数字提示这是内部数量 */
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
  background: none; border: none; cursor: pointer; color: var(--color-inventory-icon-muted); padding: 4px; display: flex;
  &:hover { color: var(--color-inventory-icon-hover); }
  .icon-arrow { font-size: 0.7rem; transition: transform 0.2s; display: inline-block; }
  .icon-arrow.open { transform: rotate(90deg); }
}

.col-name { 
  flex: 1; 
  display: flex; 
  align-items: center; 
  overflow: hidden;
  min-width: 0;
  padding-right: 8px;

  .name-stack {
    min-width: 0;
    display: inline-flex;
    align-items: baseline;
    gap: 4px;
    overflow: hidden;
  }

  .name-text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .template-name {
    flex-shrink: 0;
    color: var(--color-inventory-icon-muted);
    font-size: 0.72rem;
    font-weight: 500;
  }

  .container-badge {
    display: flex;
    gap: 6px;
    align-items: center;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.75rem;
    color: var(--color-inventory-meta-text);
    margin-left: 6px;
    font-style: italic;
  }

  .container-capacity {
    flex-shrink: 0;
    color: var(--color-inventory-meta-strong);
    font-style: normal;
    font-weight: 600;
  }

  .enchant-tags {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    margin-left: 6px;
    overflow: hidden;
  }

  .enchant-tag,
  .enchant-more {
    flex-shrink: 0;
    border: 1px solid var(--content-magic-item-badge-border-default);
    border-radius: 999px;
    padding: 1px 6px;
    background: var(--content-magic-item-badge-bg-default);
    color: var(--content-magic-item-badge-text-default);
    font-size: 0.68rem;
    font-weight: 700;
    line-height: 1.3;
  }

  .enchant-more {
    color: var(--content-magic-item-muted-default);
  }
}

.col-weight { 
  width: 112px; 
  text-align: right; 
  font-family: monospace; 
  color: var(--color-inventory-meta-text);
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
  background: var(--color-inventory-qty-bg);
  border: 1px solid var(--color-inventory-qty-border);
  border-radius: 4px;
  overflow: hidden; /* 让子元素贴合圆角 */
  box-shadow: 0 1px 2px var(--color-inventory-qty-shadow);

  .btn-mini {
    width: 22px;
    height: 22px;
    border: none;
    background: var(--color-inventory-qty-button-bg);
    color: var(--color-inventory-qty-button-text);
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.1s;

    &:hover { background: var(--color-inventory-qty-button-hover); color: var(--color-inventory-qty-button-hover-text); }
    &:active { background: var(--color-inventory-qty-button-active); }
    
    &.minus { border-right: 1px solid var(--color-inventory-qty-divider); }
    &.plus { border-left: 1px solid var(--color-inventory-qty-divider); }
  }

  .qty-val {
    min-width: 24px;
    text-align: center;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-inventory-qty-text);
    padding: 0 4px;
  }
}

.qty-static {
  color: var(--color-inventory-meta-text);
  font-size: 0.85rem;
  padding-right: 6px;
}

.attune-control {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.btn-attune {
  border: 1px solid var(--content-magic-item-border-default);
  border-radius: 999px;
  background: var(--magic-item-bg, var(--content-magic-item-bg-default));
  color: var(--magic-item-text, var(--content-magic-item-text-default));
  font-size: 0.76rem;
  font-weight: 800;
  padding: 4px 9px;
  cursor: pointer;

  &.active {
    background: var(--magic-item-text, var(--content-magic-item-text-default));
    border-color: var(--magic-item-text, var(--content-magic-item-text-default));
    color: var(--color-inventory-magic-active-text);
  }
}

/* --- 操作列 --- */
.col-actions { 
  width: 36px; 
  display: flex; 
  justify-content: center; 
}
.btn-del { 
  border: none; background: none; color: var(--color-inventory-icon-muted); cursor: pointer;
  padding: 4px; display: flex; align-items: center;
  &:hover { color: var(--color-action-danger-bg); background: var(--color-inventory-delete-hover-bg); border-radius: 4px; }
}

/* --- 嵌套区域 --- */
.container-contents {
  padding-left: 24px; /* 缩进 */
  background: var(--color-inventory-nested-bg); /* 内部稍微区分 */
  border-top: 1px solid var(--color-inventory-qty-divider);
  box-shadow: inset 0 2px 4px var(--color-inventory-nested-shadow);
}

.nested-drag-area { min-height: 10px; }

.hanging-slot-shell {
  margin: 6px 8px 8px 30px;
  border: 1px dashed var(--color-inventory-hanging-border);
  border-left: 3px solid var(--color-inventory-hanging-accent);
  border-radius: 6px;
  background: var(--color-inventory-hanging-bg);
  overflow: hidden;
}

.hanging-slot-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  color: var(--color-inventory-hanging-text);
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--color-inventory-hanging-label-bg);

  small {
    margin-left: auto;
    color: var(--color-inventory-hanging-muted);
    font-weight: 500;
  }
}

.hanging-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-inventory-hanging-accent);
  box-shadow: 0 0 0 3px var(--color-inventory-hanging-dot-shadow);
}

.hanging-drag-area { min-height: 30px; }

.hanging-empty-slot {
  margin: 6px;
  padding: 8px;
  color: var(--color-inventory-hanging-empty-text);
  font-size: 0.78rem;
  text-align: center;
  border-radius: 4px;
  background: var(--color-inventory-hanging-empty-bg);
}

.hanging-badge {
  margin-left: 5px;
  color: var(--color-inventory-hanging-text);
  font-style: normal;
  font-weight: 600;
}

.empty-slot {
  padding: 12px;
  color: var(--color-inventory-empty-text);
  font-size: 0.8rem;
  text-align: center;
  border: 1px dashed var(--color-inventory-qty-border);
  margin: 6px;
  border-radius: 4px;
  background: var(--color-inventory-empty-bg);
}

.ghost { opacity: 0.6; background: var(--color-inventory-row-ghost-bg); border: 1px dashed var(--color-inventory-row-ghost-border); }
</style>
