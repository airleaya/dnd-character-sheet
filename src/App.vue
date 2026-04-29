<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import AppLayout from './components/layout/AppLayout.vue';
import HeaderInfo from './components/sheet/bio/HeaderInfo.vue';
import StatsAndSkills from './components/sheet/bio/StatsAndSkills.vue';
import CombatPanel from './components/sheet/combat/CombatPanel.vue';
import ActionsPanel from './components/sheet/combat/ActionsPanel.vue';
import EquipmentSlots from './components/sheet/inventory/EquipmentSlots.vue';
import InventoryPanel from './components/sheet/inventory/InventoryPanel.vue';
import DataPackMakerPanel from './components/sheet/dataPackMaker/DataPackMakerPanel.vue';
import DataPackUnlockModal from './components/sheet/modals/DataPackUnlockModal.vue';
import GlobalFeedback from './components/ui/GlobalFeedback.vue';
import GlobalTooltip from './components/ui/GlobalTooltip.vue';
import { useCharacterStore } from './stores/characterStore';
import { useActiveSheetStore } from './stores/activeSheet';
import { useDataPackStore } from './stores/dataPackStore';

const SpellbookPanel = defineAsyncComponent(() => import('./components/sheet/spellbook/SpellbookPanel.vue'));

const charStore = useCharacterStore();
const activeStore = useActiveSheetStore();
const dataPackStore = useDataPackStore();
const hasOpenedSpellbook = ref(false);
const isUnlockModalOpen = ref(false);
const pressedUnlockKeys = new Set<string>();

watch(
  () => activeStore.ui.isSpellbookOpen,
  isOpen => {
    if (isOpen) {
      hasOpenedSpellbook.value = true;
    }
  },
  { immediate: true }
);

const shouldRenderSpellbook = computed(
  () => activeStore.ui.isSpellbookOpen || hasOpenedSpellbook.value
);

onMounted(() => {
  dataPackStore.init();
  charStore.init();
  window.addEventListener('keydown', handleGlobalKeydown);
  window.addEventListener('keyup', handleGlobalKeyup);

  if (window.electronAPI) {
    window.electronAPI.onAppWillClose(async () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      if (activeStore.character) {
        await charStore.saveCharacterData(activeStore.character);
      }

      await window.electronAPI.confirmClose();
    });
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
  window.removeEventListener('keyup', handleGlobalKeyup);
});

const normalizeShortcutKey = (event: KeyboardEvent) => event.key.toLowerCase();

const handleGlobalKeydown = (event: KeyboardEvent) => {
  pressedUnlockKeys.add(normalizeShortcutKey(event));
  if (event.shiftKey && pressedUnlockKeys.has('k') && pressedUnlockKeys.has('l')) {
    event.preventDefault();
    isUnlockModalOpen.value = true;
    pressedUnlockKeys.clear();
  }
};

const handleGlobalKeyup = (event: KeyboardEvent) => {
  pressedUnlockKeys.delete(normalizeShortcutKey(event));
  if (!event.shiftKey) pressedUnlockKeys.delete('shift');
};
</script>

<template>
  <GlobalTooltip />
  <GlobalFeedback />
  <DataPackUnlockModal
    :is-open="isUnlockModalOpen"
    @close="isUnlockModalOpen = false"
  />
  <AppLayout>
    <DataPackMakerPanel v-if="dataPackStore.isMakerOpen" />

    <div v-else-if="activeStore.character" class="sheet-container">
      <HeaderInfo />
      <StatsAndSkills />
      <CombatPanel />
      <ActionsPanel />
      <EquipmentSlots />

      <hr />
      <div class="inventory-placeholder">
        <InventoryPanel />
      </div>
    </div>

    <div v-else class="empty-state">
      <h2>请从左侧选择或新建一个角色</h2>
    </div>

    <SpellbookPanel
      v-if="shouldRenderSpellbook"
      :is-open="activeStore.ui.isSpellbookOpen"
      @close="activeStore.toggleSpellbook(false)"
    />
  </AppLayout>
</template>

<style>
.sheet-container {
  width: min(100%, 1240px);
  margin: 0 auto;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  min-height: 800px;
  display: flex;
  flex-direction: column;
  overflow-x: clip;
}

.inventory-placeholder {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border: 1px dashed #ced4da;
  border-radius: 4px;
}

.sheet-container :deep(.actions-panel) {
  overflow-x: hidden;
}

.sheet-container :deep(.panel-column) {
  min-width: 0;
}

.sheet-container :deep(.attack-card .row-main),
.sheet-container :deep(.attack-card .row-sub),
.sheet-container :deep(.spell-dashboard-mini),
.sheet-container :deep(.group-header),
.sheet-container :deep(.spell-card .card-top),
.sheet-container :deep(.card-detail .spell-meta-header) {
  flex-wrap: wrap;
}

.sheet-container :deep(.spell-card .spell-name),
.sheet-container :deep(.attack-card .atk-name),
.sheet-container :deep(.card-detail .desc-text),
.sheet-container :deep(.card-detail .stat-cell .val) {
  min-width: 0;
  overflow-wrap: anywhere;
}

.empty-state {
  display: flex;
  width: 100%;
  min-height: 100%;
  justify-content: center;
  align-items: center;
  color: #7f8c8d;
  padding: 1.5rem;
}

@media (max-width: 980px) {
  .sheet-container :deep(.actions-panel) {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .sheet-container :deep(.card-detail .spell-stats-grid) {
    grid-template-columns: 1fr;
  }
}
</style>
