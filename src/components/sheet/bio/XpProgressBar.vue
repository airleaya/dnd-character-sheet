<script setup lang="ts">
import { ref, computed } from 'vue';
import { useActiveSheetStore } from '../../../stores/activeSheet';

const store = useActiveSheetStore();
const character = computed(() => store.character);
const xpInput = ref<number | ''>('');

// 计算经验值百分比，限制在 0-100 之间
const xpPercentage = computed(() => {
  if (!character.value) return 0;
  const current = character.value.profile.xp || 0;
  const next = store.nextLevelXp;
  if (!next) return 100; // 满级处理
  
  // 获取当前等级的起始XP阈值 (应对未导出或异常时的回退值为 0)
  const base = store.currentLevelBaseXp || 0;
  
  // 容错处理：如果当前XP由于某种原因低于本级基础要求
  if (current <= base) return 0;
  
  // 容错处理：如果当前XP已经达到或超过下级要求但未触发升级
  if (current >= next) return 100;
  
  // 计算区间进度：(当前值 - 本级起点) / (下级终点 - 本级起点)
  return ((current - base) / (next - base)) * 100;
});

const fmt = (num: number | undefined) => num?.toLocaleString() ?? '0';

const handleAddXp = () => {
  const val = Number(xpInput.value);
  if (!val || val <= 0) return;
  store.addExperience(val);
  xpInput.value = '';
};

const handleResetXp = () => {
  setTimeout(() => {
    if (confirm('⚠️ 警告：确定要重置 XP 吗？\n\nXP 将变为 0，等级将变为 1。此操作无法撤销！')) {
      store.resetExperience();
    }
  }, 10);
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
  align-items: flex-end; /* 让文字和输入框底部对齐 */
  
  .xp-text {
    font-size: 0.9rem; color: #2c3e50; font-weight: 600;
    .label { margin-right: 6px; color: #95a5a6; text-transform: uppercase; font-size: 0.75rem;}
    .divider { margin: 0 4px; color: #bdc3c7; font-weight: normal;}
    .next { color: #7f8c8d; font-weight: normal; }
  }

  .xp-adder {
    display: flex; gap: 6px;
    -webkit-app-region: no-drag;
    input { 
      -webkit-app-region: no-drag;
      pointer-events: auto;
      width: 90px; border: 1px solid #ddd; border-radius: 4px; padding: 4px 6px; 
      font-size: 0.85rem; outline: none; transition: border-color 0.2s; 
      &:focus { border-color: #3498db; } 
    }
    button { 
      -webkit-app-region: no-drag;
      pointer-events: auto;
      border: none; border-radius: 4px; width: 26px; height: 26px; 
      cursor: pointer; color: white; display: flex; align-items: center; justify-content: center; 
      transition: opacity 0.2s; font-weight: bold;
      &:hover { opacity: 0.8; } 
    }
    .btn-add { background: #2ecc71; }
    .btn-reset { background: #e74c3c; }
  }
}

.progress-track {
  width: 100%;
  height: 8px;
  background-color: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);

  .progress-fill {
    height: 100%;
    /* 使用平滑的渐变色 */
    background: linear-gradient(90deg, #3498db, #2ecc71);
    border-radius: 4px;
    /* 增加宽度变化的物理惯性动画 */
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
}
</style>