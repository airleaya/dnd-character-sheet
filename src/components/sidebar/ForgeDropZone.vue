<script setup lang="ts">
import { useForge } from '../../composables/useForge';

const { handleDropData } = useForge();

const onDragOver = (e: DragEvent) => {
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
};

const onDrop = (e: DragEvent) => {
  e.preventDefault();
  const data = e.dataTransfer?.getData('text/plain');
  if (data) handleDropData(data);
};
</script>

<template>
  <div 
    class="forge-drop-zone"
    @dragover="onDragOver"
    @drop="onDrop"
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

  .icon { font-size: 2.5rem; filter: grayscale(1); transition: transform 0.2s; }
  .text { 
    font-size: 0.85rem; line-height: 1.4; 
    strong { display: block; color: #aaa; font-size: 0.95rem; margin-bottom: 2px; }
  }

  &:hover, &[dragover] {
    background: #201815;
    color: #d35400;
    border-top-color: #d35400;
    .icon { filter: none; transform: rotate(-15deg) scale(1.1); }
    .text strong { color: #d35400; }
  }
}
</style>