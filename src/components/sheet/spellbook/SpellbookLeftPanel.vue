<script setup lang="ts">
import { computed } from 'vue';
import { useActiveSheetStore } from '../../../stores/activeSheet';
import type { AbilityKey } from '../../../types/Library';
import { CLASS_DICTIONARY } from '../../../data/rules/classes';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = useActiveSheetStore();

// 格式化职业和角色名称的计算属性
const formattedClasses = computed(() => {
  const classes = store.character?.profile?.classes;
  if (!classes || !Array.isArray(classes) || classes.length === 0) {
    return '未知职业';
  }
  // 遍历职业数组，仅映射主职名称并拼接等级
  return classes.map(c => {
    const classDef = CLASS_DICTIONARY.find(cls => cls.id === c.classId);
    const className = classDef ? classDef.name : '未知';
    return `${className} ${c.level}`;
  }).join(' / ');
});

const characterName = computed(() => {
  if (!store.character) return '未命名';
  // 优先展示角色名，其次玩家名，兜底未命名
  return store.character.profile.name || store.character.profile.playerName || '未命名';
});

// ==========================================
// 1. 施法属性配置
// ==========================================
const abilityOptions = [
  { value: 'int', label: '智力 (Int) - 法师/奇械' },
  { value: 'wis', label: '感知 (Wis) - 牧师/德鲁伊/游侠' },
  { value: 'cha', label: '魅力 (Cha) - 术士/诗人/圣武/邪术' },
];

// 主施法属性
const primaryAbility = computed({
  get: () => store.character?.spells.spellcastingAbility || 'int',
  set: (val: string) => {
    if (!store.character) return;
    store.character.spells.spellcastingAbility = val as AbilityKey;
    store.save();
  }
});

// 副施法属性 (兼职)
const secondaryAbility = computed({
  get: () => store.character?.spells.secondaryCastingAbility || '',
  set: (val: string) => {
    if (!store.character) return;
    store.character.spells.secondaryCastingAbility = val ? (val as AbilityKey) : undefined;
    store.save();
  }
});

// ==========================================
// 2. 常规法术位配置 (1-9环)
// ==========================================
const getSlotMax = (level: number) => store.character?.spells.slots.max[level] || 0;
const updateSlotMax = (level: number, delta: number) => {
  store.updateSpellSlotMax(level, getSlotMax(level) + delta);
};

// ==========================================
// 3. 邪术师契约魔法配置
// ==========================================
const pactMax = computed(() => store.character?.spells.pactSlots?.max || 0);
const pactLevel = computed(() => store.character?.spells.pactSlots?.level || 1);

const updatePactMax = (delta: number) => {
  store.updatePactSlotMax(pactMax.value + delta);
};

const updatePactLevel = (delta: number) => {
  let newVal = pactLevel.value + delta;
  if (newVal < 1) newVal = 1;
  if (newVal > 5) newVal = 5; // 契约法术位最高 5 环
  store.updatePactSlotMax(pactMax.value, newVal);
};
</script>

<template>
  <div class="left-panel-container custom-scrollbar">
    
    <div class="panel-header">
      <div class="char-info">
        <h2 class="title">法术研习</h2>
        <template v-if="store.character">
          <p class="subtitle">{{ formattedClasses || '未知职业' }}</p>
          <p class="subtitle">{{ characterName || '未命名' }}</p>
        </template>
      </div>
      <button class="btn-close" @click="emit('close')" title="关闭 (Esc)">✖</button>
    </div>

    <div class="section-block">
      <h3 class="section-title">施法能力 Casting Ability</h3>
      
      <div class="ability-card">
        <div class="ability-title">主职属性</div>
        <div class="ability-body">
          <select v-model="primaryAbility" class="select-ability">
            <option v-for="opt in abilityOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <div class="stats-row">
            <div class="stat-box">
              <span class="stat-label">法术豁免 DC</span>
              <span class="stat-value">{{ store.calculatedSpellSaveDC }}</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">法术攻击加值</span>
              <span class="stat-value">+{{ store.calculatedSpellAttackMod }}</span>
            </div>
          </div>
        </div>
        </div>

      <div class="ability-card secondary">
        <div class="ability-title">兼职属性</div>
        <div class="ability-body">
          <select v-model="secondaryAbility" class="select-ability">
            <option value="">-- 无兼职施法 --</option>
            <option v-for="opt in abilityOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <div class="stats-row" v-if="secondaryAbility">
            <div class="stat-box">
              <span class="stat-label">副职豁免 DC</span>
              <span class="stat-value">{{ store.secondaryCalculatedSpellSaveDC }}</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">副职攻击加值</span>
              <span class="stat-value">+{{ store.secondaryCalculatedSpellAttackMod }}</span>
            </div>
          </div>
        </div>
        </div>
    </div>
    
        <!-- 邪术师相关设定尚未整理好，暂时不展示。 -->
    <div class="section-block warlock-block" v-if="false">
      <h3 class="section-title pact-title">契约魔法 Pact Magic (邪术师)</h3>
      <div class="slot-rows">
        <div class="slot-row">
          <span class="slot-label">法术位环阶 (1-5)</span>
          <div class="stepper">
            <button class="btn-step" @click="updatePactLevel(-1)" :disabled="pactLevel <= 1">−</button>
            <span class="slot-val">{{ pactLevel }}</span>
            <button class="btn-step" @click="updatePactLevel(1)" :disabled="pactLevel >= 5">+</button>
          </div>
        </div>
        <div class="slot-row">
          <span class="slot-label">法术位数量 (Max)</span>
          <div class="stepper">
            <button class="btn-step" @click="updatePactMax(-1)" :disabled="pactMax <= 0">−</button>
            <span class="slot-val">{{ pactMax }}</span>
            <button class="btn-step" @click="updatePactMax(1)">+</button>
          </div>
        </div>
      </div>
    </div>

    <div class="section-block slots-block">
      <h3 class="section-title">法术位上限 Spell Slots Max</h3>
      <p class="helper-text">无论当前是否拥有该环阶法术，均在此配置最大可用槽位。</p>
      
      <div class="slots-grid">
        <div v-for="level in 9" :key="level" class="slot-item">
          <span class="level-badge">{{ level }} 环</span>
          <div class="stepper compact">
            <button class="btn-step" @click="updateSlotMax(level, -1)" :disabled="getSlotMax(level) <= 0">−</button>
            <span class="slot-val">{{ getSlotMax(level) }}</span>
            <button class="btn-step" @click="updateSlotMax(level, 1)">+</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped lang="scss">
.left-panel-container {
  height: 100%;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 头部 */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2px solid var(--color-spellbook-border);
  padding-bottom: 12px;
  
  .title { margin: 0; font-size: 1.6rem; color: var(--color-spellbook-title); }
  .subtitle { margin: 4px 0 0 0; font-size: 0.9rem; color: var(--color-spellbook-subtitle); font-style: italic; }
  
  .btn-close {
    background: none; border: none; font-size: 1.2rem; color: var(--color-spellbook-helper); cursor: pointer;
    &:hover { color: var(--color-action-danger-bg); }
  }
}

/* 通用区块 */
.section-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  margin: 0;
  font-size: 1.1rem;
  color: var(--color-spellbook-section-title);
  border-bottom: 1px solid var(--color-spellbook-border-subtle);
  padding-bottom: 4px;
}

/* 施法属性卡片 */
.ability-card {
  background: var(--color-spellbook-card-bg);
  border: 1px solid var(--color-spellbook-border);
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 2px 4px var(--color-spellbook-card-shadow);

  &.secondary { background: var(--color-spellbook-card-secondary-bg); border-style: dashed; }
}
.ability-title {
  font-weight: bold;
  font-size: 0.95rem;
  color: var(--color-spellbook-label);
  padding-bottom: 8px; /* 标题与分割线的间距 */
  margin-bottom: 12px; /* 分割线与下方内容的间距 */
  border-bottom: 1px solid var(--color-spellbook-border-subtle); /* 作为优雅的分割线 */
}

.ability-body {
  display: flex;
  flex-direction: column;
  gap: 12px; /* 下拉框与下方数据面板的间距 */
}

.select-ability {
  width: 100%; /* 独占一行，充满容器宽度 */
  padding: 6px 8px; /* 增加一点内边距，提升点击手感 */
  border: 1px solid var(--color-spellbook-input-border);
  border-radius: 4px;
  background: var(--color-spellbook-input-bg);
  font-family: inherit;
  color: var(--color-spellbook-input-text);
  &:focus { outline: 2px solid var(--color-spellbook-focus); border-color: var(--color-spellbook-drop-border); }
}

.stats-row {
  display: flex; gap: 12px;
}

.stat-box {
  flex: 1; background: var(--color-spellbook-stat-bg); padding: 8px; border-radius: 4px; text-align: center; display: flex; flex-direction: column; gap: 4px; border: 1px solid var(--color-spellbook-stat-border);
  .stat-label { font-size: 0.75rem; color: var(--color-spellbook-subtitle); font-weight: bold; }
  .stat-value { font-size: 1.2rem; font-weight: bold; color: var(--color-spellbook-stat-value); }
}

/* 契约魔法区 */
.warlock-block {
  background: var(--color-spellbook-arcane-bg); padding: 12px; border-radius: 6px; border: 1px solid var(--color-spellbook-arcane-border);
  .pact-title { color: var(--color-spellbook-stat-value); border-bottom-color: var(--color-spellbook-arcane-border); }
}

.slot-rows { display: flex; flex-direction: column; gap: 10px; }
.slot-row { display: flex; justify-content: space-between; align-items: center; }
.slot-label { font-size: 0.9rem; font-weight: bold; color: var(--color-spellbook-label); }

/* 步进器 (复用之前面板的样式) */
.stepper {
  display: flex; align-items: center; background: var(--color-spellbook-stepper-bg); border-radius: 4px; overflow: hidden; border: 1px solid var(--color-spellbook-stepper-border);
  .btn-step {
    border: none; background: var(--color-spellbook-card-bg); width: 28px; height: 28px; cursor: pointer; font-weight: bold; color: var(--color-spellbook-label); transition: background 0.1s;
    &:hover:not(:disabled) { background: var(--color-spellbook-stepper-hover-bg); color: var(--color-spellbook-stepper-hover-text); }
    &:disabled { color: var(--color-spellbook-stepper-disabled); cursor: not-allowed; }
  }
  .slot-val { min-width: 28px; text-align: center; font-weight: bold; color: var(--color-spellbook-section-title); background: var(--color-spellbook-page-bg); line-height: 28px; }
  
  &.compact {
    .btn-step { width: 22px; height: 22px; line-height: 22px; }
    .slot-val { min-width: 22px; line-height: 22px; font-size: 0.9rem; }
  }
}

/* 法术位网格 */
.helper-text { margin: 0; font-size: 0.8rem; color: var(--color-spellbook-helper); }
.slots-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.slot-item {
  display: flex; justify-content: space-between; align-items: center; background: var(--color-spellbook-card-bg); padding: 6px 8px; border: 1px solid var(--color-spellbook-border); border-radius: 4px;
  .level-badge { font-size: 0.85rem; font-weight: bold; color: var(--color-actions-card-subtext); }
}
</style>
