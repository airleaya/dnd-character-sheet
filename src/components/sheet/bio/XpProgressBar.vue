<script setup lang="ts">
import { ref, computed } from 'vue';
import { useActiveSheetStore } from '../../../stores/activeSheet';
import { useUiFeedbackStore } from '../../../stores/uiFeedback';

const store = useActiveSheetStore();
const feedback = useUiFeedbackStore();
const character = computed(() => store.character);
const xpInput = ref<number | ''>('');

const xpPercentage = computed(() => {
  if (!character.value) return 0;
  const current = character.value.profile.xp || 0;
  const next = store.nextLevelXp;
  if (!next) return 100;

  const base = store.currentLevelBaseXp || 0;
  if (current <= base) return 0;
  if (current >= next) return 100;

  return ((current - base) / (next - base)) * 100;
});

const fmt = (num: number | undefined) => num?.toLocaleString() ?? '0';

const handleAddXp = () => {
  const val = Number(xpInput.value);
  if (!val || val <= 0) return;
  store.addExperience(val);
  xpInput.value = '';
};

const handleResetXp = async () => {
  const confirmed = await feedback.confirm({
    title: '重置 XP',
    message: '确定要重置 XP 吗？\nXP 将变为 0，等级将变为 1。此操作无法撤销。',
    tone: 'danger',
    confirmText: '确认重置',
  });
  if (confirmed) {
    store.resetExperience();
  }
};
</script>

<template>
  <div class="xp-wrapper" v-if="character">
    <div class="xp-header">
      <div class="xp-text">
        <span class="label">XP</span>
        <span class="current">{{ fmt(character.profile.xp) }}</span>
        <span class="divider">/</span>
        <span class="next">{{ store.nextLevelXp ? fmt(store.nextLevelXp) : 'MAX' }}</span>
      </div>
      <div class="xp-adder">
        <input
          type="number"
          v-model.number="xpInput"
          placeholder="Add XP"
          @keyup.enter="handleAddXp"
        />
        <button class="btn-add" @click="handleAddXp" title="增加 XP">+</button>
        <button class="btn-reset" @click="handleResetXp" title="重置 XP">↺</button>
      </div>
    </div>
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: xpPercentage + '%' }"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.xp-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.xp-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;

  .xp-text {
    min-width: 0;
    font-size: 0.9rem;
    color: #2c3e50;
    font-weight: 600;
    overflow-wrap: anywhere;

    .label {
      margin-right: 6px;
      color: #95a5a6;
      text-transform: uppercase;
      font-size: 0.75rem;
    }

    .divider {
      margin: 0 4px;
      color: #bdc3c7;
      font-weight: normal;
    }

    .next {
      color: #7f8c8d;
      font-weight: normal;
    }
  }

  .xp-adder {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: flex-end;
    -webkit-app-region: no-drag;

    input {
      -webkit-app-region: no-drag;
      pointer-events: auto;
      width: 96px;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 4px 6px;
      font-size: 0.85rem;
      outline: none;
      transition: border-color 0.2s;

      &:focus {
        border-color: #3498db;
      }
    }

    button {
      -webkit-app-region: no-drag;
      pointer-events: auto;
      border: none;
      border-radius: 4px;
      width: 28px;
      height: 28px;
      cursor: pointer;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s;
      font-weight: bold;

      &:hover {
        opacity: 0.85;
      }
    }

    .btn-add {
      background: #2ecc71;
    }

    .btn-reset {
      background: #e74c3c;
    }
  }
}

.progress-track {
  width: 100%;
  height: 8px;
  background-color: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3498db, #2ecc71);
    border-radius: 4px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

@media (max-width: 720px) {
  .xp-header {
    align-items: stretch;

    .xp-adder {
      justify-content: flex-start;
    }
  }
}
</style>
