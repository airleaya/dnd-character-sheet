<script setup lang="ts">
import { onMounted } from 'vue';
import AppLayout from './components/layout/AppLayout.vue';
import { useCharacterStore } from './stores/characterStore';
import { useActiveSheetStore } from './stores/activeSheet';
import HeaderInfo from './components/sheet/bio/HeaderInfo.vue';
import InventoryPanel from './components/sheet/inventory/InventoryPanel.vue';
import CombatPanel from './components/sheet/combat/CombatPanel.vue';
import ActionsPanel from './components/sheet/combat/ActionsPanel.vue';
import EquipmentSlots from './components/sheet/inventory/EquipmentSlots.vue';
import StatsAndSkills from './components/sheet/bio/StatsAndSkills.vue';
import GlobalTooltip from './components/ui/GlobalTooltip.vue'; // 引入组件
import SpellbookPanel from './components/sheet/spellbook/SpellbookPanel.vue';

const charStore = useCharacterStore();
const activeStore = useActiveSheetStore();

// 初始化：应用启动时读取本地存储
onMounted(() => {
  // 1. 初始化读取
  charStore.init();

  // 2. 👇👇👇 注册关闭监听 👇👇👇
  if (window.electronAPI) {
    window.electronAPI.onAppWillClose(async () => {
      console.log('正在执行退出前保存...');

      // A. 强制让当前输入框失去焦点 (Force Blur)
      // 这会让正在输入的 EditableText 触发 change 事件并写入 Store
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      // B. 确保 Store 里的最新数据写入硬盘
      // 如果 activeStore 有选中的角色，再次强制保存一次
      if (activeStore.character) {
        await charStore.saveCharacterData(activeStore.character);
      }

      // C. 通知主进程：保存完了，关吧！
      await window.electronAPI.confirmClose();
    });
  }
});
</script>

<template>
  <GlobalTooltip /> <!-- 全局提示组件 -->
  <AppLayout>
    <div v-if="activeStore.character" class="sheet-container">
      
      <HeaderInfo />

      <StatsAndSkills />
      
      <CombatPanel />

      <ActionsPanel />

      <EquipmentSlots />

      <hr>
      <div class="inventory-placeholder">
        <InventoryPanel />
      </div>

    </div>
    
    <div v-else class="empty-state">
      <h2>⬅️ 请从左侧选择或新建一个角色</h2>
    </div>

    <SpellbookPanel 
      :is-open="activeStore.ui.isSpellbookOpen" 
      @close="activeStore.toggleSpellbook(false)"
    />
  </AppLayout>
</template>

<style>
/* 全局重置样式 */
body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  box-sizing: border-box;
  background-color: #f0f2f5;
}

*, *::before, *::after {
  box-sizing: inherit;
}

.sheet-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  min-height: 800px; /* 像一张A4纸 */
  display: flex;
  flex-direction: column;
}

.combat-placeholder, .inventory-placeholder {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border: 1px dashed #ced4da;
  border-radius: 4px;
}

.combat-row {
  margin: 0.5rem 0;
  font-weight: bold;
  color: #2c3e50;
}

.empty-state {
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
  color: #7f8c8d;
}
</style>