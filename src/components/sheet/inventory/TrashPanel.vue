<script setup lang="ts">
import draggable from 'vuedraggable';
import { useActiveSheetStore } from '../../../stores/activeSheet';

const store = useActiveSheetStore();

// 处理垃圾箱变动
const handleTrashChange = (evt: any) => {
  // 监听 "added" 事件 (当物品从背包拖进垃圾箱时)
  if (evt.added) {
    const { element } = evt.added;
    
    // 核心逻辑：
    // 因为背包是 "clone" (复制) 模式，所以物品进垃圾箱时，
    // 我们必须手动调用 removeItem 把背包里的“原件”删掉。
    // 这样就实现了“移动到垃圾箱”的效果。
    if (element.instanceId) {
      store.removeItem(element.instanceId);
    }
  }
};
</script>

<template>
  <div class="trash-panel">
    <div class="panel-header">
      <h3>🗑️ 垃圾箱</h3>
      <span class="tip">刷新页面自动清空</span>
    </div>

    <draggable
      v-model="store.trash"
      :group="{ name: 'trash', put: ['inventory'], pull: true }"
      item-key="instanceId"
      class="trash-list"
      @change="handleTrashChange"
      ghost-class="ghost"
    >
      <template #item="{ element }">
        <div class="trash-item">
          <span class="icon">🗑️</span>
          <span class="name">{{ element.name }}</span>
          <span class="qty" v-if="element.quantity > 1">x{{ element.quantity }}</span>
        </div>
      </template>
      
      <template #header>
        <div v-if="store.trash.length === 0" class="empty-tip">
          拖拽物品到此处删除
        </div>
      </template>
    </draggable>
  </div>
</template>

<style scoped lang="scss">
.trash-panel {
  margin-top: 1rem;
  background: #fff0f0; /* 浅红背景 */
  border: 2px dashed #ffcdd2;
  border-radius: 6px;

  .panel-header {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    background: #ffcdd2;
    border-radius: 4px 4px 0 0;
    color: #c0392b;
    h3 { margin: 0; font-size: 1rem; }
    .tip { font-size: 0.75rem; opacity: 0.8; }
  }

  .trash-list {
    min-height: 60px;
    padding: 0.5rem;
    position: relative;
  }

  .empty-tip {
    text-align: center;
    color: #e57373;
    font-size: 0.8rem;
    padding: 1rem;
    font-style: italic;
  }

  .trash-item {
    display: flex;
    align-items: center;
    background: #fff;
    border: 1px solid #ffcdd2;
    margin-bottom: 4px;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.85rem;
    color: #c62828;
    text-decoration: line-through; /* 删除线 */
    opacity: 0.8;
    cursor: grab;

    .icon { margin-right: 6px; }
    .name { flex: 1; font-weight: bold; }
    .qty { font-size: 0.75rem; color: #999; }
    
    &:hover {
      opacity: 1;
      background: #ffebee;
      text-decoration: none; /* 悬停时取消删除线 */
    }
  }

  .ghost {
    opacity: 0.5;
    background: #ef9a9a;
  }
}
</style>