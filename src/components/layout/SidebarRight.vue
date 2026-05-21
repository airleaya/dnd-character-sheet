<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, ref, watch } from 'vue';
import type { ComponentPublicInstance } from 'vue';
import type { LibraryItem } from '../../types/Library';
import type { SpellDefinition } from '../../types/Spell';

// 引入拆分后的组件
import LibraryTooltip from '../sidebar/LibraryTooltip.vue';
import ForgeDropZone from '../sidebar/ForgeDropZone.vue';
import EnchantDropZone from '../sidebar/EnchantDropZone.vue';
import DataPackManagerModal from '../sheet/modals/DataPackManagerModal.vue';
import { useDataPackStore } from '../../stores/dataPackStore';

const LibraryItemsPanel = defineAsyncComponent(() => import('../sheet/library/LibraryItemsPanel.vue'));
const LibrarySpellsPanel = defineAsyncComponent(() => import('../sheet/library/LibrarySpellsPanel.vue'));

// 状态管理
type RootTab = 'items' | 'spells' | 'features';
type TooltipType = 'item' | 'spell';

type HoveredLibraryItem = LibraryItem | SpellDefinition;

const activeTab = ref<RootTab>('items');
const searchQuery = ref('');
const hasVisitedSpellsTab = ref(false);
const isDataPackManagerOpen = ref(false);
const dataPackStore = useDataPackStore();

const shouldRenderItemsPanel = computed(() => activeTab.value === 'items');
const shouldRenderSpellsPanel = computed(() => activeTab.value === 'spells' || hasVisitedSpellsTab.value);

// --- Tooltip 坐标与状态逻辑 ---
const hoveredItem = ref<HoveredLibraryItem | null>(null);
const tooltipPos = ref({ x: 0, y: 0 });
// 用来告诉 Tooltip 组件现在显示的是法术还是物品
const currentTooltipType = ref<TooltipType>('item');

//获取 DOM 元素的引用
const sidebarRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<ComponentPublicInstance | null>(null); // 用于访问 Tooltip 组件的 $el

// 计算 Tooltip 位置
// 将计算位置移动到onhoveritem中实现
// const updateTooltipPos = (e: MouseEvent) => {
//   // 提示框宽度约 320px，放置在鼠标左侧
//   tooltipPos.value = {
//     x: e.clientX - 340, 
//     y: e.clientY + 10 
//   };
// };

// 定义一个定时器变量，用于管理“延时关闭”
let closeTimer: NodeJS.Timeout | null = null;


// 统一处理来自子组件的 Hover 事件
const onHoverItem = async (item: HoveredLibraryItem, e: MouseEvent, type: TooltipType) => {
  // 如果之前准备关闭，现在又移回来了（或者移到了另一个项），立刻取消关闭
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
  // --- 1. 基础定位计算 ---
  
  // 常量定义
  const GAP = 14; // 空隙
  const TOOLTIP_WIDTH = 320; // 必须与 LibraryTooltip.vue 中的 CSS 宽度一致

  // X轴：吸附在侧边栏左侧
  // 获取侧边栏的实时位置（比写死 320px 更稳健）
  const sidebarRect = sidebarRef.value?.getBoundingClientRect();
  const sidebarLeft = sidebarRect ? sidebarRect.left : (window.innerWidth - 320);
  
  const finalX = sidebarLeft - TOOLTIP_WIDTH - GAP;

  // Y轴：初始跟随鼠标 (稍作偏移，避免鼠标正好挡住第一行字)
  let finalY = e.clientY - 20;

  // --- 2. 激活渲染 ---
  hoveredItem.value = item;
  currentTooltipType.value = type;
  tooltipPos.value = { x: finalX, y: finalY };

  // --- 3. 垂直方向边界修正 (NextTick) ---
  await nextTick(); // 等待 Vue 将 Tooltip 渲染进 DOM

  const tooltipEl = tooltipRef.value?.$el;
  if (tooltipEl) {
    const rect = tooltipEl.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // 如果底部超出了屏幕
    if (rect.bottom > windowHeight - GAP) {
      // 强制将底部吸附到屏幕底部 (保留 GAP)
      finalY = windowHeight - rect.height - GAP;
      
      // 更新位置
      tooltipPos.value = { x: finalX, y: finalY };
    }
  }
};

// const onMoveItem = (e: MouseEvent) => {
//   if (hoveredItem.value) {
//     updateTooltipPos(e);
//   }
// };

//鼠标离开列表项 -> 启动延时关闭
const onLeaveItem = () => {
  if (closeTimer) clearTimeout(closeTimer);
  
  // 给 250ms 的宽限期，让用户有时间把鼠标从“列表”移动到“悬浮窗”上
  closeTimer = setTimeout(() => {
    hoveredItem.value = null;
    closeTimer = null;
  }, 250); 
};

// 鼠标进入悬浮窗 -> 续命
const cancelClose = () => {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
};

// 鼠标离开悬浮窗 -> 再次启动关闭
const scheduleClose = () => {
  // 同样给一点缓冲，防止手抖滑出边界
  onLeaveItem();
};

const setActiveTab = (tab: RootTab) => {
  activeTab.value = tab;

  if (tab === 'spells') {
    hasVisitedSpellsTab.value = true;
  }
};

watch(
  () => dataPackStore.makerLibraryTab,
  tab => {
    if (!dataPackStore.isMakerOpen) return;
    setActiveTab(tab);
  }
);
</script>

<template>
  <div ref="sidebarRef" class="sidebar-right">
    
    <div class="root-tabs">
      <button class="root-tab-btn" :class="{ active: activeTab === 'items' }" @click="setActiveTab('items')">📦 物品</button>
      <button class="root-tab-btn" :class="{ active: activeTab === 'spells' }" @click="setActiveTab('spells')">✨ 法术</button>
      <button class="root-tab-btn" :class="{ active: activeTab === 'features' }" @click="setActiveTab('features')">🏷️ 词条</button>
    </div>

    <div class="search-header">
      <input 
        v-model="searchQuery" 
        type="text" 
        :placeholder="`🔍 搜索${activeTab === 'items' ? '物品' : activeTab === 'spells' ? '法术' : '...'}`" 
      />
    </div>

    <div class="scroll-container">
      
      <LibraryItemsPanel
        v-if="shouldRenderItemsPanel"
        :search-query="searchQuery"
        @hover-item="(item, e) => onHoverItem(item, e, 'item')"
        @leave-item="onLeaveItem"
      />

      <LibrarySpellsPanel
        v-if="shouldRenderSpellsPanel"
        v-show="activeTab === 'spells'"
        :search-query="searchQuery"
        @hover-item="(item, e) => onHoverItem(item, e, 'spell')"
        @leave-item="onLeaveItem"
      />

      <div v-if="activeTab === 'features'" class="empty-state">🚧 开发中...</div>
    </div>

    <EnchantDropZone />
    <ForgeDropZone/>
    <button type="button" class="data-pack-entry" @click="isDataPackManagerOpen = true">
      🧩 数据包
    </button>

    <DataPackManagerModal
      :is-open="isDataPackManagerOpen"
      @close="isDataPackManagerOpen = false"
    />

    <Transition name="fade">
      <LibraryTooltip 
        v-if="hoveredItem"
        ref="tooltipRef" 
        :item="hoveredItem"
        :position="tooltipPos"
        :type="currentTooltipType"
        @mouseenter="cancelClose"
        @mouseleave="scheduleClose"
      />
    </Transition>

  </div>
</template>

<style scoped lang="scss">
.sidebar-right {
  display: flex; flex-direction: column; width: 320px; min-width: 320px;
  background-color: var(--color-library-bg); border-left: 1px solid var(--color-library-border); color: var(--color-library-text); height: 100%;
}

.root-tabs {
  display: flex; border-bottom: 1px solid var(--color-library-border); background: var(--color-library-bg-deep); flex-shrink: 0;
  .root-tab-btn {
    flex: 1; background: transparent; border: none; color: var(--color-library-text-muted); padding: 14px 0;
    font-weight: bold; cursor: pointer; border-bottom: 3px solid transparent;
    &:hover { background: var(--color-library-bg-hover); color: var(--color-library-text-strong); }
    &.active { color: var(--color-library-accent); border-bottom-color: var(--color-library-accent); background: var(--color-library-bg-active); }
  }
}

.search-header {
  padding: 10px; background: var(--color-library-bg); border-bottom: 1px solid var(--color-library-border-subtle);
  input {
    width: 100%; padding: 8px 10px; background: var(--color-library-control-bg); border: 1px solid var(--color-library-control-border);
    border-radius: 4px; color: var(--color-library-text-strong); box-sizing: border-box; outline: none;
    &:focus { border-color: var(--color-library-accent); }
  }
}

.scroll-container {
  flex: 1; overflow-y: auto;
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: var(--color-library-control-border); border-radius: 2px; }
}

.empty-state { padding: 40px; text-align: center; color: var(--color-library-text-empty); }

.data-pack-entry {
  flex-shrink: 0;
  margin: 8px 10px 10px;
  border: 1px solid var(--color-library-data-pack-border);
  background: var(--color-library-data-pack-bg);
  color: var(--color-library-data-pack-text);
  border-radius: 8px;
  padding: 9px 10px;
  font-weight: 800;
  cursor: pointer;

  &:hover {
    border-color: var(--color-library-data-pack-border-hover);
    background: var(--color-library-data-pack-hover-bg);
  }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
