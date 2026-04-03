<script setup lang="ts">
import { ref, nextTick } from 'vue';

// 引入拆分后的组件
import LibraryItemsPanel from '../sheet/library/LibraryItemsPanel.vue';
import LibrarySpellsPanel from '../sheet/library/LibrarySpellsPanel.vue';
import LibraryTooltip from '../sidebar/LibraryTooltip.vue';
import ForgeDropZone from '../sidebar/ForgeDropZone.vue';

// 状态管理
type RootTab = 'items' | 'spells' | 'features';
const activeTab = ref<RootTab>('items');
const searchQuery = ref('');

// --- Tooltip 坐标与状态逻辑 ---
const hoveredItem = ref<any>(null);
const tooltipPos = ref({ x: 0, y: 0 });
// 用来告诉 Tooltip 组件现在显示的是法术还是物品
const currentTooltipType = ref<'item' | 'spell'>('item');

//获取 DOM 元素的引用
const sidebarRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<any>(null); // 用于访问 Tooltip 组件的 $el

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
const onHoverItem = async (item: any, e: MouseEvent, type: 'item' | 'spell') => {
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
</script>

<template>
  <div class="sidebar-right">
    
    <div class="root-tabs">
      <button class="root-tab-btn" :class="{ active: activeTab === 'items' }" @click="activeTab = 'items'">📦 物品</button>
      <button class="root-tab-btn" :class="{ active: activeTab === 'spells' }" @click="activeTab = 'spells'">✨ 法术</button>
      <button class="root-tab-btn" :class="{ active: activeTab === 'features' }" @click="activeTab = 'features'">🏷️ 词条</button>
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
        v-if="activeTab === 'items'"
        :search-query="searchQuery"
        @hover-item="(item, e) => onHoverItem(item, e, 'item')"
        @leave-item="onLeaveItem"
      />

      <LibrarySpellsPanel 
        v-if="activeTab === 'spells'"
        :search-query="searchQuery"
        @hover-item="(item, e) => onHoverItem(item, e, 'spell')"
        @leave-item="onLeaveItem"
      />

      <div v-if="activeTab === 'features'" class="empty-state">🚧 开发中...</div>
    </div>

    <ForgeDropZone/>

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
  background-color: #1e1e1e; border-left: 1px solid #333; color: #e0e0e0; height: 100%;
}

.root-tabs { 
  display: flex; border-bottom: 1px solid #333; background: #181818; flex-shrink: 0; 
  .root-tab-btn { 
    flex: 1; background: transparent; border: none; color: #888; padding: 14px 0; 
    font-weight: bold; cursor: pointer; border-bottom: 3px solid transparent; 
    &:hover { background: #252525; color: #fff; } 
    &.active { color: #42b983; border-bottom-color: #42b983; background: #222; } 
  } 
}

.search-header { 
  padding: 10px; background: #1e1e1e; border-bottom: 1px solid #2a2a2a; 
  input { 
    width: 100%; padding: 8px 10px; background: #2c2c2c; border: 1px solid #444; 
    border-radius: 4px; color: #fff; box-sizing: border-box; outline: none; 
    &:focus { border-color: #42b983; } 
  } 
}

.scroll-container { 
  flex: 1; overflow-y: auto; 
  &::-webkit-scrollbar { width: 5px; } 
  &::-webkit-scrollbar-thumb { background: #444; border-radius: 2px; } 
}

.empty-state { padding: 40px; text-align: center; color: #555; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>