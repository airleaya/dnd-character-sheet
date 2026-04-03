<script setup lang="ts">
import { computed } from 'vue';
import { useActiveSheetStore } from '../../../stores/activeSheet';
import EditableText from '../../common/EditableText.vue';
import type { Character } from '../../../types/Character';
import { useCharacterStore } from '../../../stores/characterStore';
import type { AbilityScores } from '../../../types/Character';

const store = useActiveSheetStore();

const attributes: { key: keyof Character['stats']; label: string }[] = [
  { key: 'str', label: '力量' },
  { key: 'dex', label: '敏捷' },
  { key: 'con', label: '体质' },
  { key: 'int', label: '智力' },
  { key: 'wis', label: '感知' },
  { key: 'cha', label: '魅力' },
];

const getMod = (val: number) => {
  const m = Math.floor((val - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
};

// 【新增】计算豁免检定加值
const getSaveMod = (attrKey: string) => {
  // 0. 安全检查：如果 character还没加载，直接返回 0
  if (!store.character) return '+0';

  // 1. 【修复核心报错】
  // 不再使用 typeof store.character... 
  // 而是直接告诉 TS："这个 key 是 AbilityScores 接口的键之一"
  const key = attrKey as keyof AbilityScores;

  // 2. 获取属性调整值 (baseMod)
  // 假设你有一个 getMod 函数处理属性值到调整值的转换
  const val = store.character.stats[key]; 
  const baseMod = Math.floor((val - 10) / 2); // 或者调用你的 getMod(val)

  // 3. 获取熟练度 (布尔值)
  // ?. 防止 undefined, || false 确保得到布尔值
  const isProf = store.character.savingThrows?.[key] || false;

  // 4. 计算总值 (三元运算符处理布尔值)
  const total = baseMod + (isProf ? store.proficiencyBonus : 0);

  return total >= 0 ? `+${total}` : `${total}`;
};

const adjustStat = (key: keyof Character['stats'], delta: number) => {
  if (!store.character) return;
  const currentVal = store.character.stats[key];
  const newVal = Math.max(1, currentVal + delta);
  store.updateStat(key, newVal);
};

const groupedSkills = computed(() => {
  // @ts-ignore
  if (!store.skills) return {};
  const groups: Record<string, any[]> = {};
  
  // @ts-ignore
  store.skills.forEach((skill: any) => {
    const attrKey = skill.attr.toLowerCase();
    if (!groups[attrKey]) groups[attrKey] = [];
    groups[attrKey].push(skill);
  });
  return groups;
});
</script>

<template>
  <div class="stats-grid-container" v-if="store.character">
    
    <div 
      v-for="attr in attributes" 
      :key="attr.key" 
      class="attr-card"
    >
      <div class="card-header">
        <div class="attr-mod">{{ getMod(store.character.stats[attr.key]) }}</div>
        <div class="header-controls">
          <span class="attr-label">{{ attr.label }}</span>
          <div class="val-stepper">
            <button class="btn-step" @click="adjustStat(attr.key, -1)">-</button>
            <span class="attr-val-box">
              <EditableText 
                 :model-value="store.character.stats[attr.key]"
                 @update:model-value="v => store.updateStat(attr.key, Number(v))"
              />
            </span>
            <button class="btn-step" @click="adjustStat(attr.key, 1)">+</button>
          </div>
        </div>
      </div>

      <div class="card-body">
        
        <div 
          class="saving-throw-row"
          :class="{ 'proficient': store.character.savingThrows?.[attr.key] }"
          @click="store.toggleSavingThrow(attr.key)"
        >
          <div class="st-left">
            <div class="prof-diamond" :class="{ filled: store.character.savingThrows?.[attr.key] }"></div>
            <span class="st-name">豁免</span>
          </div>
          <div class="st-mod">
            {{ getSaveMod(attr.key) }}
          </div>
        </div>

        <div class="divider"></div>

        <div v-if="!groupedSkills[attr.key]?.length" class="empty-skill">- 无技能 -</div>
        
        <div 
          v-for="skill in groupedSkills[attr.key]" 
          :key="skill.key" 
          class="skill-row"
          :class="{ 'proficient': skill.profLevel > 0 }"
          @click="store.toggleSkill(skill.key)"
        >
          <div class="skill-left">
            <div class="prof-dot" :class="{ filled: skill.profLevel > 0 }"></div>
            <span class="skill-name">{{ skill.label }}</span>
          </div>
          <div class="skill-mod">{{ skill.mod }}</div>
        </div>
      </div>

      <div v-if="attr.key === 'wis'" class="card-footer">
        <div class="passive-row">
          <span class="lbl">👁️ 被动觉察</span>
          <span class="val">{{ store.passivePerception }}</span>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped lang="scss">
/* ... 之前的容器和Header样式保持不变 (你可以直接复制上面的，这里省略重复部分以节省篇幅) ... */
.stats-grid-container {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 5px;
}

.attr-card {
  background: white;
  border: 1px solid #dfe6e9;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  min-width: 110px;
}

.card-header {
  background-color: #2c3e50;
  color: white;
  padding: 0.5rem;
  text-align: center;
  
  .attr-mod {
    font-size: 2rem;
    font-weight: 900;
    line-height: 1.1;
    margin-bottom: 4px;
  }
  .header-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .attr-label { font-size: 0.75rem; color: #bdc3c7; letter-spacing: 1px; }
  .val-stepper {
    display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.2); padding: 2px 4px; border-radius: 12px;
    .btn-step { background: none; border: none; color: #bdc3c7; font-weight: bold; cursor: pointer; font-size: 1rem; padding: 0 4px; line-height: 1; &:hover { color: white; transform: scale(1.2); } }
    .attr-val-box { color: white; font-weight: bold; min-width: 20px; text-align: center; }
  }
}

/* --- Body 样式新增 --- */
.card-body {
  flex: 1;
  padding: 0; /* 去掉内边距，让行撑满 */
  background: #fdfdfd;

  .divider { height: 1px; background: #e0e0e0; margin: 0 5px; }

  /* 豁免检定行样式 */
  .saving-throw-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 10px;
    cursor: pointer;
    background: #f4f6f7; /* 稍微深一点的背景，区分于技能 */
    font-weight: bold;
    color: #2c3e50;
    border-bottom: 1px solid #e0e0e0;
    
    &:hover { background: #e3e8ea; }
    
    &.proficient {
      background: #2c3e50; /* 熟练时变深色背景 */
      color: white; /* 文字变白 */
      
      .prof-diamond { border-color: white; background: white; }
    }
  }

  .st-left { display: flex; align-items: center; gap: 8px; }
  .st-name { font-size: 0.85rem; letter-spacing: 1px; }
  .st-mod { font-family: monospace; }
  
  /* 菱形图标 (区别于技能的圆形) */
  .prof-diamond {
    width: 8px; height: 8px;
    border: 1px solid #7f8c8d;
    transform: rotate(45deg);
    transition: all 0.2s;
    &.filled { background: #2c3e50; border-color: #2c3e50; }
  }
}

/* 技能列表样式 (复用之前的) */
.empty-skill { text-align: center; color: #bdc3c7; font-size: 0.8rem; padding: 10px 0; font-style: italic; }
.skill-row {
  display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; cursor: pointer; border-bottom: 1px solid #f0f0f0; transition: background 0.1s;
  &:last-child { border-bottom: none; }
  &:hover { background-color: #ecf0f1; }
  &.proficient { background-color: #e8f6f3; .skill-mod { font-weight: bold; color: #27ae60; } .skill-name { font-weight: 600; color: #2c3e50; } }
}
.skill-left { display: flex; align-items: center; gap: 8px; }
.skill-name { font-size: 0.85rem; color: #7f8c8d; }
.skill-mod { font-size: 0.9rem; color: #95a5a6; font-family: monospace; }
.prof-dot { width: 10px; height: 10px; border: 1px solid #bdc3c7; border-radius: 50%; &.filled { background-color: #2c3e50; border-color: #2c3e50; } }

.card-footer { background: #ecf0f1; border-top: 1px solid #dfe6e9; padding: 8px; .passive-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; font-weight: bold; color: #2c3e50; .val { background: white; padding: 1px 6px; border-radius: 4px; border: 1px solid #bdc3c7; } } }
</style>