<script setup lang="ts">
import SidebarLeft from './SidebarLeft.vue';
import SidebarRight from './SidebarRight.vue';
import ForgeModal from '../sheet/modals/ForgeModal.vue';
import EnchantingModal from '../sheet/modals/EnchantingModal.vue';
import DataPackMakerMonitor from '../sheet/dataPackMaker/DataPackMakerMonitor.vue';
</script>

<template>
  <div class="app-layout">
    <SidebarLeft />

    <main class="main-sheet">
      <slot></slot>
    </main>

    <SidebarRight />

    <ForgeModal />
    <EnchantingModal />
    <DataPackMakerMonitor />
  </div>
</template>

<style scoped lang="scss">
.app-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;

  .main-sheet {
    flex: 1;
    min-width: 0;
    background-color: #f5f6fa;
    overflow-y: auto;
    padding: 1.25rem;
  }
}
</style>
