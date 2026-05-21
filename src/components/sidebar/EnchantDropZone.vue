<script setup lang="ts">
import { ref } from 'vue';
import { useEnchanting } from '../../composables/useEnchanting';
import { getDragPayloadFromEvent } from '../../utils/inventoryDropUtils';
import { useDataPackStore } from '../../stores/dataPackStore';

const { openEnchantingWithDropData } = useEnchanting();
const dataPackStore = useDataPackStore();
const isHovering = ref(false);

const onDragEnter = () => {
  isHovering.value = true;
  dataPackStore.recordMakerDragDiagnostic('right-enchant.dragenter', 'info', 'Pointer entered right-sidebar enchant zone', {
    makerOpen: dataPackStore.isMakerOpen,
  });
};

let lastDragOverDiagnosticAt = 0;

const onDragOver = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
  isHovering.value = true;
  const now = Date.now();
  if (now - lastDragOverDiagnosticAt > 800) {
    lastDragOverDiagnosticAt = now;
    dataPackStore.recordMakerDragDiagnostic('right-enchant.dragover', 'info', 'Right-sidebar enchant dragover is firing', {
      makerOpen: dataPackStore.isMakerOpen,
      dataTransferTypes: event.dataTransfer ? Array.from(event.dataTransfer.types) : [],
    });
  }
};

const onDragLeave = () => {
  isHovering.value = false;
};

const onDrop = (event: DragEvent) => {
  isHovering.value = false;
  const payload = getDragPayloadFromEvent(event);
  dataPackStore.recordMakerDragDiagnostic('right-enchant.drop', payload ? 'ok' : 'warn', payload ? 'Right-sidebar enchant resolved drop payload' : 'Right-sidebar enchant could not resolve drop payload', {
    makerOpen: dataPackStore.isMakerOpen,
    payloadType: payload?.type,
    payloadId: payload?.type === 'library-item' ? payload.id : undefined,
    dataTransferTypes: event.dataTransfer ? Array.from(event.dataTransfer.types) : [],
  });
  if (!payload) return;
  if (dataPackStore.isMakerOpen && payload.type === 'library-item') {
    dataPackStore.recordMakerDragDiagnostic('right-enchant.route-maker', 'ok', 'Routing right-sidebar enchant drop into maker', {
      itemId: payload.id,
    });
    dataPackStore.requestMakerItemWorkbench(payload.id, 'enchant');
    return;
  }
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
  border-top: 1px solid var(--color-library-drop-border);
  background: var(--color-library-drop-enchant-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: var(--color-library-drop-enchant-text);
  transition: all 0.2s;
  user-select: none;

  &.is-active {
    background: var(--color-library-drop-enchant-active-bg);
    border-top-color: var(--color-library-drop-enchant-active);
    color: var(--color-library-drop-enchant-active);

    .icon {
      transform: scale(1.12) rotate(8deg);
    }

    .text strong {
      color: var(--color-library-drop-enchant-active);
    }
  }

  .icon,
  .text {
    pointer-events: none;
  }
}
</style>
