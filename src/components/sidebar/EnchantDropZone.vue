<script setup lang="ts">
import { ref } from 'vue';
import { useEnchanting } from '../../composables/useEnchanting';
import { getDragPayloadFromEvent } from '../../utils/inventoryDropUtils';

const { openEnchantingWithDropData } = useEnchanting();
const isHovering = ref(false);

const onDragEnter = () => {
  isHovering.value = true;
};

const onDragOver = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
  isHovering.value = true;
};

const onDragLeave = () => {
  isHovering.value = false;
};

const onDrop = (event: DragEvent) => {
  isHovering.value = false;
  const payload = getDragPayloadFromEvent(event);
  if (!payload) return;
  openEnchantingWithDropData(JSON.stringify(payload));
};
</script>

<template>
  <div
    class="enchant-drop-zone"
    :class="{ 'is-active': isHovering }"
    @dragenter.prevent.stop="onDragEnter"
    @dragover.prevent.stop="onDragOver"
    @dragleave.prevent.stop="onDragLeave"
    @drop.prevent.stop="onDrop"
  >
    <div class="icon">✨</div>
    <div class="text">
      <strong>附魔台</strong>
      <span>拖拽物品至此进行<br>附魔制作</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.enchant-drop-zone {
  height: 88px;
  border-top: 1px solid #333;
  background: #171b23;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: #6f7890;
  transition: all 0.2s;
  user-select: none;

  &.is-active {
    background: #211f16;
    border-top-color: #f5c560;
    color: #f5c560;

    .icon {
      transform: scale(1.12) rotate(8deg);
    }

    .text strong {
      color: #f5c560;
    }
  }

  .icon,
  .text {
    pointer-events: none;
  }
}
</style>
