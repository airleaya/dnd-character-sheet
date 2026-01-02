<script setup lang="ts">
import { useTooltipStore } from '../../stores/tooltip';
const store = useTooltipStore();
</script>

<template>
  <div 
    class="global-tooltip" 
    v-if="store.visible"
    :style="{ top: store.y + 15 + 'px', left: store.x + 15 + 'px' }"
  >
    <div class="tooltip-title" v-if="store.data.title">{{ store.data.title }}</div>
    <div class="tooltip-content">{{ store.data.content }}</div>
  </div>
</template>

<style scoped>
.global-tooltip {
  position: fixed;
  z-index: 9999; /* 永远置顶 */
  pointer-events: none; /* 让鼠标穿透，不会导致闪烁 */
  
  background: rgba(44, 62, 80, 0.95); /* 深色半透明背景 */
  color: #ecf0f1;
  border: 1px solid #34495e;
  border-radius: 4px;
  padding: 8px 12px;
  max-width: 300px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  
  font-size: 0.85rem;
  line-height: 1.4;
  backdrop-filter: blur(2px); /* 磨砂玻璃效果 */
}

.tooltip-title {
  font-weight: bold;
  font-size: 0.95rem;
  color: #f1c40f; /* 金色标题 */
  margin-bottom: 4px;
  border-bottom: 1px solid rgba(255,255,255,0.2);
  padding-bottom: 2px;
}
</style>