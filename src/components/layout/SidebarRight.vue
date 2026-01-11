<script setup lang="ts">
import { ref } from 'vue';

// 引入拆分后的组件
import LibraryItemsPanel from '../sheet/LibraryItemsPanel.vue';
import LibrarySpellsPanel from '../sheet/LibrarySpellsPanel.vue';
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

// 计算 Tooltip 位置
const updateTooltipPos = (e: MouseEvent) => {
  // 提示框宽度约 320px，放置在鼠标左侧
  tooltipPos.value = {
    x: e.clientX - 340, 
    y: e.clientY + 10 
  };
};

// 统一处理来自子组件的 Hover 事件
const onHoverItem = (item: any, e: MouseEvent, type: 'item' | 'spell') => {
  hoveredItem.value = item;
  currentTooltipType.value = type;
  updateTooltipPos(e);
};

const onMoveItem = (e: MouseEvent) => {
  if (hoveredItem.value) {
    updateTooltipPos(e);
  }
};

const onLeaveItem = () => {
  hoveredItem.value = null;
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
        @move-item="onMoveItem"
        @leave-item="onLeaveItem"
      />

      <LibrarySpellsPanel 
        v-if="activeTab === 'spells'"
        :search-query="searchQuery"
        @hover-item="(item, e) => onHoverItem(item, e, 'spell')"
        @move-item="onMoveItem"
        @leave-item="onLeaveItem"
      />

      <div v-if="activeTab === 'features'" class="empty-state">🚧 开发中...</div>
    </div>

    <ForgeDropZone/>

    <Transition name="fade">
      <LibraryTooltip 
        v-if="hoveredItem"
        :item="hoveredItem"
        :position="tooltipPos"
        :type="currentTooltipType"
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