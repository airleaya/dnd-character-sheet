<script setup lang="ts">
import SidebarLeft from './SidebarLeft.vue';
import SidebarRight from './SidebarRight.vue';
import ForgeModal from '../sheet/ForgeModal.vue';
</script>

<template>
  <div class="app-layout">
    <SidebarLeft />
    
    <main class="main-sheet">
      <slot></slot>
    </main>

    <SidebarRight />

    <ForgeModal/>
  </div>
</template>

<style scoped lang="scss">
.app-layout {
  display: flex;
  height: 100vh; /* 占满整个屏幕高度 */
  width: 100vw;
  overflow: hidden; /* 防止出现双重滚动条 */

  .main-sheet {
    flex: 1; /* 占据剩余所有宽度 */
    background-color: #f5f6fa;
    overflow-y: auto; /* 只有中间可以滚动 */
    padding: 2rem;
  }
}
</style>