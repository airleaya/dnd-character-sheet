<script setup lang="ts">
import { ref } from 'vue';
import { useForge } from '../../composables/useForge';
import { getGlobalDragPayload } from '../../utils/inventoryDropUtils';

const { handleDropData } = useForge();

// 视觉状态
const isHovering = ref(false);

// 1. 强行接管进入事件
const onDragEnter = (e: DragEvent) => {
  isHovering.value = true;
};

// 2. 强行接管悬停事件 (最关键的一步)
const onDragOver = (e: DragEvent) => {
  // 注意：模板里的 .prevent.stop 已经做了大部分工作
  // 但我们这里必须显式设置 dropEffect，否则浏览器不知道显示什么图标
  if (e.dataTransfer) {
    // 强制告诉浏览器：这是一个“复制”操作，请显示绿色加号或手型
    e.dataTransfer.dropEffect = 'move';
  }
  isHovering.value = true;
};

const onDragLeave = (e: DragEvent) => {
  isHovering.value = false;
};

const onDrop = (e: DragEvent) => {
  isHovering.value = false;

  // 即使有 .stop，这里也可以再保险一次
  const globalData = getGlobalDragPayload();
  const nativeData = e.dataTransfer?.getData('text/plain');
  
  // 优先信赖全局变量 (Electron环境下最稳)
  const data = globalData || nativeData;

  if (data) {
    handleDropData(data);
  }
};
</script>

<template>
  <div 
    class="forge-drop-zone"
    :class="{ 'is-active': isHovering }"
    @dragenter.prevent.stop="onDragEnter"
    @dragover.prevent.stop="onDragOver"
    @dragleave.prevent.stop="onDragLeave"
    @drop.prevent.stop="onDrop"
  >
    <div class="icon">🔨</div>
    <div class="text">
      <strong>铁匠铺</strong>
      <span>拖拽物品至此进行<br>改造或创建</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.forge-drop-zone {
  height: 100px; 
  margin-top: auto; 
  border-top: 1px solid #333;
  background: #181818;
  display: flex; align-items: center; justify-content: center; gap: 15px;
  color: #666;
  transition: all 0.2s;
  user-select: none; /* 防止选中文字干扰拖拽 */

  /* 悬停视觉反馈 */
  &.is-active {
    background: #251e1e;
    border-top-color: #d35400;
    color: #d35400;
    
    .icon { transform: rotate(-15deg) scale(1.1); filter: none; }
    .text strong { color: #d35400; }
  }

  /* 🛡️ CSS 穿透：防止鼠标松开在文字上导致事件目标偏移 
     这在 Electron 中非常重要
  */
  .icon, .text {
    pointer-events: none;
  }
}
</style>