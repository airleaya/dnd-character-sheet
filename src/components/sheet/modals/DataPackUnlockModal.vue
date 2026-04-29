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
  background: rgba(5, 8, 12, 0.62);
}

.unlock-modal {
  width: min(460px, 94vw);
  color: #eaf0f6;
  background: #171b21;
  border: 1px solid rgba(126, 160, 196, 0.34);
  border-radius: 18px;
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.48);
  overflow: hidden;
}

.unlock-header {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #223044, #171b21 68%);

  h2 { margin: 0 0 6px; }
  p { margin: 0; color: #aab7c4; font-size: 0.86rem; line-height: 1.45; }
  .eyebrow { color: #92c7ff; font-weight: 900; letter-spacing: 0.16em; font-size: 0.72rem; }
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 1.35rem;
  cursor: pointer;
}

.unlock-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 10px;
  align-items: end;
  padding: 18px 20px;

  label { display: flex; flex-direction: column; gap: 6px; color: #c6d1dc; font-weight: 800; }
  input {
    border: 1px solid #3a4653;
    border-radius: 9px;
    background: #222934;
    color: #fff;
    padding: 9px 10px;
  }
  button {
    border: 1px solid rgba(93, 173, 226, 0.5);
    border-radius: 9px;
    background: rgba(93, 173, 226, 0.16);
    color: #cdeaff;
    padding: 9px 13px;
    cursor: pointer;
  }
  button:disabled { opacity: 0.42; cursor: not-allowed; }
  .clear-btn {
    border-color: rgba(236, 112, 99, 0.4);
    background: rgba(236, 112, 99, 0.11);
    color: #ffc5be;
  }
}

.result-list {
  display: grid;
  gap: 8px;
  padding: 0 20px 20px;

  h3 { margin: 0 0 2px; font-size: 0.95rem; color: #dbe8f5; }
}

.result-card {
  display: grid;
  gap: 4px;
  padding: 10px;
  border: 1px solid rgba(130, 224, 170, 0.24);
  border-radius: 10px;
  background: rgba(130, 224, 170, 0.08);

  span { color: #b7c4ce; font-size: 0.82rem; }
}

.result-card.warning {
  border-color: rgba(236, 112, 99, 0.25);
  background: rgba(236, 112, 99, 0.08);
}

.hint {
  margin: 0;
  padding: 0 20px 18px;
  color: #7f8d9b;
  font-size: 0.8rem;
}

.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }
</style>
