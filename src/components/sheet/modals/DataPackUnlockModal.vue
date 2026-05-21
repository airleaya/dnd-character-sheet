<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDataPackStore } from '../../../stores/dataPackStore';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = useDataPackStore();
const passphrase = ref('');
const results = ref<ReturnType<typeof store.unlockByPassphrase>>([]);
const clearResult = ref<{ clearedPackCount: number; clearedGroupCount: number } | null>(null);
const hasAnyUnlockProgress = computed(() =>
  store.orderedDataPacks.some(pack => store.getUnlockedGroupCount(pack.id) > 0 || store.isPackAllPublic(pack.id))
);

const submit = () => {
  results.value = store.unlockByPassphrase(passphrase.value);
  clearResult.value = null;
  passphrase.value = '';
};

const clearAll = () => {
  clearResult.value = store.clearAllUnlocks();
  results.value = [];
};
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="props.isOpen" class="unlock-backdrop" @click.self="emit('close')">
      <section class="unlock-modal" role="dialog" aria-modal="true" aria-label="数据包口令解锁">
        <header class="unlock-header">
          <div>
            <p class="eyebrow">数据包</p>
            <h2>口令解锁</h2>
            <p>输入 GM 提供的口令后，对应数据包中的非公开物品、法术或词条会持续可见；全局口令会让该包全部公开。</p>
          </div>
          <button type="button" class="close-btn" @click="emit('close')">×</button>
        </header>

        <form class="unlock-form" @submit.prevent="submit">
          <label>
            口令
            <input v-model="passphrase" type="password" autocomplete="off" placeholder="输入口令" />
          </label>
          <button type="submit" :disabled="!passphrase.trim()">解锁</button>
          <button type="button" class="clear-btn" :disabled="!hasAnyUnlockProgress" @click="clearAll">
            清空口令进度
          </button>
        </form>

        <div v-if="results.length > 0" class="result-list">
          <h3>本次解锁内容</h3>
          <article v-for="result in results" :key="result.packId" class="result-card">
            <strong>{{ result.packName }}</strong>
            <span>
              {{ result.alreadyUnlocked ? '已解锁过' : '新增解锁' }}
              {{ result.globalUnlock ? '全局公开' : `${result.unlockedGroupCount} 组` }}：
              物品 {{ result.unlockedItemCount }}，
              法术 {{ result.unlockedSpellCount }}，
              词条 {{ result.unlockedTraitCount }}
            </span>
          </article>
        </div>

        <div v-else-if="clearResult" class="result-list">
          <article class="result-card warning">
            <strong>已重新锁定</strong>
            <span>清空 {{ clearResult.clearedPackCount }} 个数据包、{{ clearResult.clearedGroupCount }} 个口令组的解锁状态。</span>
          </article>
        </div>

        <p v-else class="hint">快捷键：同时按住 Shift + K + L 可打开本窗口。</p>
      </section>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.unlock-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--color-data-pack-unlock-backdrop-bg);
}

.unlock-modal {
  width: min(460px, 94vw);
  color: var(--color-data-pack-unlock-modal-text);
  background: var(--color-data-pack-unlock-modal-bg);
  border: 1px solid var(--color-data-pack-unlock-modal-border);
  border-radius: 18px;
  box-shadow: 0 28px 80px var(--color-data-pack-unlock-modal-shadow);
  overflow: hidden;
}

.unlock-header {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 20px;
  background: var(--color-data-pack-unlock-header-bg);

  h2 { margin: 0 0 6px; }
  p { margin: 0; color: var(--color-data-pack-unlock-header-muted); font-size: 0.86rem; line-height: 1.45; }
  .eyebrow { color: var(--color-data-pack-unlock-eyebrow); font-weight: 900; letter-spacing: 0.16em; font-size: 0.72rem; }
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: var(--color-data-pack-close-bg);
  color: var(--color-data-pack-close-text);
  font-size: 1.35rem;
  cursor: pointer;
}

.unlock-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 10px;
  align-items: end;
  padding: 18px 20px;

  label { display: flex; flex-direction: column; gap: 6px; color: var(--color-data-pack-unlock-label); font-weight: 800; }
  input {
    border: 1px solid var(--color-data-pack-unlock-field-border);
    border-radius: 9px;
    background: var(--color-data-pack-unlock-field-bg);
    color: var(--color-data-pack-field-text);
    padding: 9px 10px;
  }
  button {
    border: 1px solid var(--color-data-pack-unlock-action-border);
    border-radius: 9px;
    background: var(--color-data-pack-unlock-action-bg);
    color: var(--color-data-pack-unlock-action-text);
    padding: 9px 13px;
    cursor: pointer;
  }
  button:disabled { opacity: 0.42; cursor: not-allowed; }
  .clear-btn {
    border-color: var(--color-data-pack-unlock-danger-border);
    background: var(--color-data-pack-unlock-danger-bg);
    color: var(--color-data-pack-unlock-danger-text);
  }
}

.result-list {
  display: grid;
  gap: 8px;
  padding: 0 20px 20px;

  h3 { margin: 0 0 2px; font-size: 0.95rem; color: var(--color-data-pack-unlock-result-title); }
}

.result-card {
  display: grid;
  gap: 4px;
  padding: 10px;
  border: 1px solid var(--color-data-pack-unlock-result-border);
  border-radius: 10px;
  background: var(--color-data-pack-unlock-result-bg);

  span { color: var(--color-data-pack-unlock-result-text); font-size: 0.82rem; }
}

.result-card.warning {
  border-color: var(--color-data-pack-unlock-warning-border);
  background: var(--color-data-pack-unlock-warning-bg);
}

.hint {
  margin: 0;
  padding: 0 20px 18px;
  color: var(--color-data-pack-unlock-hint);
  font-size: 0.8rem;
}

.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }
</style>
