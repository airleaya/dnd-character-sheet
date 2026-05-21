<script setup lang="ts">
import { computed } from 'vue';
import { useActiveSheetStore } from '../../../stores/activeSheet';
import EditableText from '../../common/EditableText.vue';
import type { AbilityScores, Character } from '../../../types/Character';

const store = useActiveSheetStore();
const character = computed(() => store.character);

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
const getSaveMod = (key: keyof AbilityScores) => {
  if (!character.value) return '+0';

  const val = character.value.stats[key];
  const baseMod = Math.floor((val - 10) / 2);
  const isProf = character.value.savingThrows[key];
  const total = baseMod + (isProf ? store.proficiencyBonus : 0);

  return total >= 0 ? `+${total}` : `${total}`;
};

const adjustStat = (key: keyof Character['stats'], delta: number) => {
  if (!character.value) return;
  const currentVal = character.value.stats[key];

  const newVal = Math.max(1, currentVal + delta);
  store.updateStat(key, newVal);
};

type SkillView = {
  key: string;
  label: string;
  attr: string;
  mod: string;
  rawMod: number;
  profLevel: boolean;
  expertise: boolean;
  jackOfAllTrades: boolean;
};

type GroupedSkills = Partial<Record<keyof AbilityScores, SkillView[]>>;

const groupedSkills = computed<GroupedSkills>(() => {
  const groups: GroupedSkills = {};

  store.skills.forEach((skill) => {
    const attrKey = skill.attr.toLowerCase() as keyof AbilityScores;
    const targetGroup = groups[attrKey] ?? [];
    targetGroup.push(skill);
    groups[attrKey] = targetGroup;
  });

  return groups;
});
</script>

<template>
    <div class="stats-grid-container" v-if="character">

    
    <div 
      v-for="attr in attributes" 
      :key="attr.key" 
      class="attr-card"
    >
      <div class="card-header">
                <div class="attr-mod">{{ getMod(character.stats[attr.key]) }}</div>

        <div class="header-controls">
          <span class="attr-label">{{ attr.label }}</span>
          <div class="val-stepper">
            <button class="btn-step" @click="adjustStat(attr.key, -1)">-</button>
            <span class="attr-val-box">
              <EditableText 
                                  :model-value="character.stats[attr.key]"

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
                    :class="{ 'proficient': character.savingThrows[attr.key] }"

          @click="store.toggleSavingThrow(attr.key)"
        >
          <div class="st-left">
                        <div class="prof-diamond" :class="{ filled: character.savingThrows[attr.key] }"></div>

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
          :class="{ proficient: skill.profLevel, expertise: skill.expertise, jack: skill.jackOfAllTrades }"
          @click="store.toggleSkill(skill.key)"
        >
          <div class="skill-left">
            <div class="prof-dot" :class="{ filled: skill.profLevel, expertise: skill.expertise }"></div>
            <span class="skill-name">{{ skill.label }}</span>
            <span v-if="skill.expertise" class="expertise-chip">专</span>
            <span v-else-if="skill.jackOfAllTrades" class="jack-chip">万</span>
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
  background: var(--color-character-stats-card-bg);
  border: 1px solid var(--color-character-stats-card-border);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 5px var(--color-character-stats-card-shadow);
  min-width: 110px;
}

.card-header {
  background-color: var(--color-character-stats-header-bg);
  color: var(--color-character-stats-header-text);
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
  .attr-label { font-size: 0.75rem; color: var(--color-character-stats-header-muted); letter-spacing: 1px; }
  .val-stepper {
    display: flex; align-items: center; gap: 4px; background: var(--color-character-stats-stepper-bg); padding: 2px 4px; border-radius: 12px;
    .btn-step { background: var(--color-character-stats-stepper-button-bg); border: var(--color-character-stats-stepper-button-border); color: var(--color-character-stats-header-muted); font-weight: bold; cursor: pointer; font-size: 1rem; padding: 0 4px; line-height: 1; &:hover { color: var(--color-character-stats-header-text); transform: scale(1.2); } }
    .attr-val-box { color: var(--color-character-stats-header-text); font-weight: bold; min-width: 20px; text-align: center; }
  }
}

/* --- Body 样式新增 --- */
.card-body {
  flex: 1;
  padding: 0; /* 去掉内边距，让行撑满 */
  background: var(--color-character-stats-body-bg);

  .divider { height: 1px; background: var(--color-character-stats-divider); margin: 0 5px; }

  /* 豁免检定行样式 */
  .saving-throw-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 10px;
    cursor: pointer;
    background: var(--color-character-stats-save-bg); /* 稍微深一点的背景，区分于技能 */
    font-weight: bold;
    color: var(--color-character-stats-save-text);
    border-bottom: 1px solid var(--color-character-stats-save-border);
    
    &:hover { background: var(--color-character-stats-save-hover-bg); }
    
    &.proficient {
      background: var(--color-character-stats-save-active-bg); /* 熟练时变深色背景 */
      color: var(--color-character-stats-save-active-text); /* 文字变白 */
      
      .prof-diamond { border-color: var(--color-character-stats-prof-marker-inverse); background: var(--color-character-stats-prof-marker-inverse); }
    }
  }

  .st-left { display: flex; align-items: center; gap: 8px; }
  .st-name { font-size: 0.85rem; letter-spacing: 1px; }
  .st-mod { font-family: monospace; }
  
  /* 菱形图标 (区别于技能的圆形) */
  .prof-diamond {
    width: 8px; height: 8px;
    border: 1px solid var(--color-character-stats-prof-marker-border);
    transform: rotate(45deg);
    transition: all 0.2s;
    &.filled { background: var(--color-character-stats-prof-marker-active-bg); border-color: var(--color-character-stats-prof-marker-active-border); }
  }
}

/* 技能列表样式 (复用之前的) */
.empty-skill { text-align: center; color: var(--color-character-stats-empty); font-size: 0.8rem; padding: 10px 0; font-style: italic; }
.skill-row {
  display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; cursor: pointer; border-bottom: 1px solid var(--color-character-skills-row-border); transition: background 0.1s;
  &:last-child { border-bottom: none; }
  &:hover { background-color: var(--color-character-skills-row-hover-bg); }
  &.proficient { background-color: var(--color-character-skills-row-proficient-bg); .skill-mod { font-weight: bold; color: var(--color-character-skills-row-proficient-accent); } .skill-name { font-weight: 600; color: var(--color-character-skills-row-proficient-text); } }
  &.expertise {
    background: var(--color-character-skills-row-expertise-bg);
    border-left: 3px solid var(--color-character-skills-row-expertise-accent);
    .skill-mod { color: var(--color-character-skills-row-expertise-accent); font-weight: 900; }
    .skill-name { color: var(--color-character-skills-row-expertise-accent); font-weight: 800; }
  }
}
.skill-left { display: flex; align-items: center; gap: 8px; }
.skill-name { font-size: 0.85rem; color: var(--color-character-skills-text); }
.skill-mod { font-size: 0.9rem; color: var(--color-character-skills-mod); font-family: monospace; }
.prof-dot {
  width: 10px;
  height: 10px;
  border: 1px solid var(--color-character-skills-prof-dot-border);
  border-radius: 50%;

  &.filled {
    background-color: var(--color-character-skills-prof-dot-filled-bg);
    border-color: var(--color-character-skills-prof-dot-filled-border);
  }

  &.expertise {
    background-color: var(--color-character-skills-row-expertise-accent);
    border-color: var(--color-character-skills-prof-dot-expertise-border);
    box-shadow: 0 0 0 3px var(--color-character-skills-prof-dot-expertise-shadow);
  }
}

.expertise-chip {
  font-size: 0.64rem;
  line-height: 1;
  color: var(--color-character-skills-expertise-chip-text);
  border: 1px solid var(--color-character-skills-row-expertise-accent);
  background: var(--color-character-skills-row-expertise-bg);
  border-radius: 3px;
  padding: 2px 4px;
  font-weight: 900;
}

.jack-chip {
  min-width: 16px;
  height: 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-character-skills-jack-text);
  background: var(--color-character-skills-jack-bg);
  border: 1px solid var(--color-character-skills-jack-border);
  border-radius: 2px;
  padding: 0 3px;
  font-size: 0.68rem;
  font-weight: 900;
  line-height: 1;
}

.card-footer { background: var(--color-character-stats-footer-bg); border-top: 1px solid var(--color-character-stats-footer-border); padding: 8px; .passive-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; font-weight: bold; color: var(--color-character-stats-footer-text); .val { background: var(--color-character-stats-footer-value-bg); padding: 1px 6px; border-radius: 4px; border: 1px solid var(--color-character-stats-footer-value-border); } } }
</style>
