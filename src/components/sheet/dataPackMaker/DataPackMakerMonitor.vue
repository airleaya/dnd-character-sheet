<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDataPackStore } from '../../../stores/dataPackStore';

const store = useDataPackStore();
const isOpen = ref(false);
const copyState = ref<'idle' | 'copied' | 'failed'>('idle');

const pack = computed(() => store.activeDraftPack);
const items = computed(() => pack.value?.items ?? []);
const spells = computed(() => pack.value?.spells ?? []);
const traits = computed(() => pack.value?.traits ?? []);

const selectedItem = computed(() => items.value[0]);

const getMonitorPayload = () => JSON.stringify({
  copiedAt: new Date().toISOString(),
  activePackId: pack.value?.manifest.id,
  draftDirty: store.draftDirty,
  itemCount: items.value.length,
  spellCount: spells.value.length,
  traitCount: traits.value.length,
  selectedItem: selectedItem.value
    ? {
        id: selectedItem.value.id,
        name: selectedItem.value.name,
        type: selectedItem.value.type,
        displayCategory: selectedItem.value.displayCategory,
        displaySubcategory: selectedItem.value.displaySubcategory,
        encryptionGroupId: selectedItem.value.encryptionGroupId,
        visibility: selectedItem.value.visibility,
        descriptionLength: selectedItem.value.description?.length ?? 0,
      }
    : null,
  runtimePacks: store.packs.map(runtimePack => ({
    id: runtimePack.id,
    name: runtimePack.name,
    enabled: runtimePack.enabled,
    itemCount: runtimePack.items.length,
    spellCount: runtimePack.spells.length,
  })),
  settings: store.settings,
  diagnostics: store.makerDragDiagnostics,
}, null, 2);

const copyMonitorPayload = async () => {
  copyState.value = 'idle';
  try {
    await navigator.clipboard.writeText(getMonitorPayload());
    copyState.value = 'copied';
  } catch {
    copyState.value = 'failed';
  }
};
</script>

<template>
  <div v-if="store.isMakerOpen" class="maker-monitor-floating" :class="{ open: isOpen }">
    <button type="button" class="monitor-toggle" @click="isOpen = !isOpen">
      {{ isOpen ? '隐藏监视' : '行为监视' }}
    </button>

    <section v-if="isOpen" class="monitor-panel">
      <header>
        <div>
          <strong>数据包编辑器行为监视</strong>
          <span>记录铁匠台保存、数据包保存、拖拽导入等关键前端事件。</span>
        </div>
        <div class="monitor-actions">
          <button type="button" @click="copyMonitorPayload">一键复制</button>
          <button type="button" @click="store.clearMakerDragDiagnostics">清空</button>
        </div>
      </header>
      <p v-if="copyState === 'copied'" class="copy-state ok">已复制监视信息。</p>
      <p v-else-if="copyState === 'failed'" class="copy-state error">复制失败，请手动选中下方内容复制。</p>
      <textarea class="monitor-copy-box" readonly :value="getMonitorPayload()" />
      <div class="monitor-events">
        <article v-for="entry in store.makerDragDiagnostics" :key="entry.id" :class="['monitor-event', entry.status]">
          <div class="monitor-event-top">
            <strong>{{ entry.step }}</strong>
            <span>{{ entry.status }}</span>
            <small>{{ new Date(entry.timestamp).toLocaleTimeString() }}</small>
          </div>
          <p>{{ entry.message }}</p>
          <pre v-if="entry.details">{{ JSON.stringify(entry.details, null, 2) }}</pre>
        </article>
        <p v-if="store.makerDragDiagnostics.length === 0" class="empty-monitor">暂无行为记录。</p>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.maker-monitor-floating {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 2800;
  display: grid;
  justify-items: end;
  gap: 8px;
  pointer-events: none;
}

.maker-monitor-floating > * {
  pointer-events: auto;
}

.monitor-toggle,
.monitor-actions button {
  border: 1px solid #91a4b7;
  background: #fffdf6;
  color: #24313d;
  border-radius: 999px;
  padding: 8px 13px;
  cursor: pointer;
  font-weight: 800;
  box-shadow: 0 10px 22px rgba(28, 38, 48, 0.16);
}

.monitor-panel {
  display: grid;
  gap: 10px;
  width: min(720px, calc(100vw - 36px));
  max-height: min(72vh, 680px);
  overflow: auto;
  padding: 12px;
  border: 1px solid #91a4b7;
  border-radius: 14px;
  background: linear-gradient(135deg, #f7fbff, #eef5f1);
  color: #24313d;
  box-shadow: 0 18px 42px rgba(28, 38, 48, 0.28);
}

.monitor-panel header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.monitor-panel header div:first-child {
  display: grid;
  gap: 3px;
}

.monitor-panel header span {
  color: #637282;
  font-size: 0.86rem;
}

.monitor-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.copy-state {
  margin: 0;
  font-weight: 800;
}

.copy-state.ok { color: #267a43; }
.copy-state.error { color: #a33b2c; }

.monitor-copy-box {
  min-height: 110px;
  max-height: 210px;
  overflow: auto;
  font-family: ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', monospace;
  font-size: 0.78rem;
  white-space: pre;
}

.monitor-events {
  display: grid;
  gap: 8px;
  max-height: 320px;
  overflow: auto;
}

.monitor-event {
  border: 1px solid #d8e0e8;
  border-left-width: 5px;
  border-radius: 10px;
  padding: 8px;
  background: white;
}

.monitor-event.ok { border-left-color: #3f9b57; }
.monitor-event.warn { border-left-color: #d4952f; }
.monitor-event.error { border-left-color: #c74d3d; }
.monitor-event.info { border-left-color: #5d83b3; }

.monitor-event-top {
  display: flex;
  gap: 8px;
  align-items: center;
}

.monitor-event-top span {
  text-transform: uppercase;
  font-size: 0.72rem;
  font-weight: 900;
  color: #637282;
}

.monitor-event-top small {
  margin-left: auto;
  color: #7d8995;
}

.monitor-event p {
  margin: 6px 0;
  color: #465462;
}

.monitor-event pre {
  margin: 0;
  overflow: auto;
  background: #f4f7f8;
  border-radius: 8px;
  padding: 7px;
  font-size: 0.76rem;
}

.empty-monitor {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 90px;
  color: #778077;
}
</style>
