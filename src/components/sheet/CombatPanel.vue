<script setup lang="ts">
import { ref, computed } from 'vue';
import { useActiveSheetStore } from '../../stores/activeSheet';
import EditableText from '../common/EditableText.vue';

const store = useActiveSheetStore();
const char = computed(() => store.character);
const combat = computed(() => store.character?.combat);

// 定义生命骰选项
const hitDiceOptions = ['d6', 'd8', 'd10', 'd12', 'd20'];

// HP 操作数值
const hpInput = ref<number | ''>('');

// 通用更新函数
const update = (field: string, val: any) => {
  store.updateCombatStat(field as any, val);
};

// 生命骰更新处理
const handleHitDiceUpdate = (delta: number) => {
  if (!combat.value) return;
  
  const current = combat.value.hitDiceCurrent;
  const max = combat.value.hitDiceMax;
  
  // 计算新值
  let newVal = current + delta;
  
  // 限制范围
  if (newVal < 0) newVal = 0;
  if (newVal > max) newVal = max;
  
  // 只有值改变时才更新
  if (newVal !== current) {
    update('hitDiceCurrent', newVal);
  }
};

// HP 按钮处理
const handleDamage = () => {
  const val = Number(hpInput.value);
  if (val > 0) {
    store.applyDamage(val);
    hpInput.value = '';
  }
};
const handleHeal = () => {
  const val = Number(hpInput.value);
  if (val > 0) {
    store.applyHeal(val);
    hpInput.value = '';
  }
};
const handleTemp = () => {
  const val = Number(hpInput.value);
  if (val >= 0) {
    store.setTempHp(val);
    hpInput.value = '';
  }
};
const handleFullHeal = () => {
  if (confirm('确定要一键回满 HP 吗？')) {
    store.fullHeal();
  }
};

// 死亡豁免点击处理 (type: 'success' | 'failure', index: 1-3)
const toggleDeathSave = (type: 'success' | 'failure', index: number) => {
  if (!combat.value) return;
  const current = combat.value.deathSaves[type];
  
  // 逻辑：如果点击的是当前已点亮的最后一格，则取消它；否则设置到该格
  // 例如当前是2，点击第2格 -> 变为1；点击第3格 -> 变为3
  let newVal = index;
  if (current === index) {
    newVal = index - 1;
  }
  
  // 更新 store
  const newSaves = { ...combat.value.deathSaves, [type]: newVal };
  store.updateCombatStat('deathSaves', newSaves);
};

// 激励点击
const toggleInsp = (idx: number) => {
  store.toggleInspiration(idx);
};

// 力竭点击 (直接设置等级)
const setExhaustion = (level: number) => {
  if (!combat.value) return;
  // 如果点击当前等级，则取消一级；否则设置到该等级
  const current = combat.value.exhaustion || 0;
  const next = current === level ? level - 1 : level;
  store.updateCombatStat('exhaustion', next);
};

// 计算血条百分比
const hpPercent = computed(() => {
  if (!combat.value) return 0;
  const pct = (combat.value.hpCurrent / combat.value.hpMax) * 100;
  return Math.min(Math.max(pct, 0), 100);
});
</script>

<template>
  <div class="combat-panel" v-if="combat && char">
    
    <div class="stats-row">
      <div class="stat-box">
        <div class="label">护甲等级</div>
        <div class="value shield-shape">{{ store.armorClass }}</div>
      </div>
      
      <div class="stat-box">
        <div class="label">先攻</div>
        <div class="value">{{ store.initiative }}</div>
      </div>
      
      <div class="stat-box">
        <div class="label">速度</div>
        <div class="value editable">
          <EditableText 
            :model-value="combat.speed" 
            @update:model-value="v => update('speed', Number(v))"
            suffix=" ft"
          />
        </div>
      </div>
    </div>

    <hr class="divider" />

    <div class="hp-section">
      <div class="hp-bar-container">
        <div class="hp-bar-fill" :style="{ width: hpPercent + '%' }"></div>
        <div class="hp-text">
          <span class="curr">{{ combat.hpCurrent }}</span>
          <span class="sep">/</span>
          <span class="max">
             <EditableText 
              :model-value="combat.hpMax" 
              @update:model-value="v => update('hpMax', Number(v))"
            />
          </span>
          <span class="temp" v-if="combat.tempHp > 0">(+{{ combat.tempHp }})</span>
        </div>
      </div>

      <div class="hp-controls">
        <input type="number" v-model.number="hpInput" placeholder="数值" />
        <div class="btn-group">
          <button class="btn-dmg" @click="handleDamage">伤害</button>
          <button class="btn-heal" @click="handleHeal">治疗</button>
          <button class="btn-temp" @click="handleTemp">临时</button>
        </div>
        <button class="btn-full" @click="handleFullHeal" title="一键回满">❤</button>
      </div>
    </div>

    <hr class="divider" />

    <div class="resources-grid">
      
      <div class="col-left">
        <div class="resource-item death-saves">
          <div class="res-label">死亡豁免</div>
          <div class="save-row">
            <span class="sub-label">成功</span>
            <div class="circles">
              <div 
                v-for="i in 3" :key="'s'+i" 
                class="circle success"
                :class="{ active: combat.deathSaves.success >= i }"
                @click="toggleDeathSave('success', i)"
              ></div>
            </div>
          </div>
          <div class="save-row">
            <span class="sub-label">失败</span>
            <div class="circles">
              <div 
                v-for="i in 3" :key="'f'+i" 
                class="circle failure"
                :class="{ active: combat.deathSaves.failure >= i }"
                @click="toggleDeathSave('failure', i)"
              ></div>
            </div>
          </div>
        </div>

        <div class="resource-item hit-dice">
          <div class="res-label header-row">
            <span>生命骰</span>
            <select 
              class="hd-type-select"
              :value="combat.hitDiceType || 'd8'"
              @change="(e) => update('hitDiceType', (e.target as HTMLSelectElement).value)"
            >
              <option v-for="d in hitDiceOptions" :key="d" :value="d">{{ d }}</option>
            </select>
          </div>
          <div class="hd-controls">
            <button 
              @click="handleHitDiceUpdate(-1)"
              :disabled="combat.hitDiceCurrent <= 0"
            >-</button>
            
            <span class="hd-val">
              {{ combat.hitDiceCurrent }} / 
              <span class="hd-max-edit">
                <EditableText 
                  :model-value="combat.hitDiceMax" 
                  @update:model-value="v => update('hitDiceMax', Number(v))"
                />
              </span>
            </span>

            <button 
              @click="handleHitDiceUpdate(1)"
              :disabled="combat.hitDiceCurrent >= combat.hitDiceMax"
            >+</button>
          </div>
        </div>

      </div>
      <div class="col-right">
        <div class="resource-item inspiration">
          <div class="res-label">激励</div>
          <div class="insp-slots">
            <div 
              v-for="(isActive, idx) in (combat.inspiration || [false,false,false])" 
              :key="idx"
              class="insp-star"
              :class="{ active: isActive }"
              @click="toggleInsp(idx)"
            >★</div>
          </div>
        </div>

        <div class="resource-item exhaustion">
          <div class="res-label">力竭 ({{ combat.exhaustion || 0 }}级)</div>
          <div class="ex-track">
            <div 
              v-for="i in 6" :key="i"
              class="ex-level"
              :class="{ active: (combat.exhaustion || 0) >= i }"
              @click="setExhaustion(i)"
              :title="`设置力竭为 ${i} 级`"
            ></div>
          </div>
        </div>

        <div class="resource-item conditions">
          <div class="res-label">状态</div>
          <textarea 
            class="cond-input"
            :value="combat.conditions" 
            @input="(e) => update('conditions', (e.target as HTMLTextAreaElement).value)"
            placeholder="中毒, 倒地..."
            rows="2"
          ></textarea>
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped lang="scss">
.combat-panel {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.divider {
  border: 0;
  border-top: 1px solid #eee;
  margin: 0;
}

/* 第一行：AC/Init/Speed */
.stats-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;

  .stat-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 8px 4px;
    background: #f9f9f9;

    .label { font-size: 0.75rem; color: #666; text-transform: uppercase; }
    .value { font-size: 1.5rem; font-weight: bold; color: #333; }
    
    .shield-shape {
      /* 简单的盾牌形状 CSS */
      display: flex; align-items: center; justify-content: center;
      width: 40px; height: 46px;
      background: #e0e0e0;
      clip-path: polygon(50% 0, 100% 20%, 100% 80%, 50% 100%, 0 80%, 0 20%);
    }
  }
}

/* 第二行：HP */
.hp-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hp-bar-container {
  position: relative;
  height: 24px;
  background: #eee;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
  
  .hp-bar-fill {
    height: 100%;
    background: #e74c3c; /* 默认红色 */
    transition: width 0.3s ease;
  }
  /* 血量健康时显示绿色 */
  &:has(.hp-bar-fill[style*="width: 100%"]),
  &:has(.hp-bar-fill[style*="width: 9"]),
  &:has(.hp-bar-fill[style*="width: 8"]),
  &:has(.hp-bar-fill[style*="width: 7"]),
  &:has(.hp-bar-fill[style*="width: 6"]),
  &:has(.hp-bar-fill[style*="width: 5"]) {
     .hp-bar-fill { background: #27ae60; }
  }

  .hp-text {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.9rem; font-weight: bold;
    color: #333;
    text-shadow: 0 0 2px rgba(255,255,255,0.8);
    
    .sep { margin: 0 4px; }
    .temp { color: #2980b9; margin-left: 4px; }
  }
}

.hp-controls {
  display: flex;
  gap: 6px;
  
  input {
    width: 50px; flex: 1;
    border: 1px solid #ccc; border-radius: 4px;
    padding: 0 4px; text-align: center;
  }
  
  .btn-group {
    display: flex; gap: 2px;
    button {
      border: none; cursor: pointer; color: white;
      padding: 4px 8px; font-size: 0.8rem;
      border-radius: 4px;
      &:first-child { border-top-right-radius: 0; border-bottom-right-radius: 0; }
      &:last-child { border-top-left-radius: 0; border-bottom-left-radius: 0; }
      &:not(:first-child):not(:last-child) { border-radius: 0; }
    }
    .btn-dmg { background: #e74c3c; &:hover{background:#c0392b;} }
    .btn-heal { background: #27ae60; &:hover{background:#2ecc71;} }
    .btn-temp { background: #3498db; &:hover{background:#2980b9;} }
  }
  
  .btn-full {
    background: none; border: 1px solid #ddd;
    color: #e74c3c; border-radius: 4px; cursor: pointer;
    &:hover { background: #fff0f0; }
  }
}

/* 第三行：资源 */
.resources-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.resource-item {
  margin-bottom: 8px;
  .res-label { font-size: 0.75rem; color: #999; margin-bottom: 4px; font-weight: bold; }
}

/* 死亡豁免 */
.save-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 2px;
  .sub-label { font-size: 0.7rem; }
  .circles { display: flex; gap: 4px; }
  .circle {
    width: 12px; height: 12px; border-radius: 50%;
    border: 1px solid #ccc; cursor: pointer;
    &.success.active { background: #27ae60; border-color: #27ae60; }
    &.failure.active { background: #e74c3c; border-color: #e74c3c; }
  }
}

/* 生命骰 */
/* 生命骰控制区 */
.hd-controls {
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  background: #f5f5f5; 
  border-radius: 4px; 
  padding: 2px;

  button { 
    width: 20px; 
    height: 20px; 
    border: none; 
    background: #ddd; 
    cursor: pointer; 
    border-radius: 2px;
    display: flex;             /* 确保加减号居中 */
    align-items: center; 
    justify-content: center;
    padding-bottom: 2px;       /* 微调字符位置 */

    &:disabled {
    opacity: 0.3;          /* 变淡 */
    cursor: not-allowed;   /* 鼠标变成禁止符号 */
    pointer-events: none;  /* 禁止点击 */
  }
  }

  .hd-val { 
    font-size: 0.9rem; 
    font-weight: bold; 
    display: flex;             /* 让斜杠和数字横向排列 */
    align-items: center;
    gap: 4px;                  /* 增加 斜杠 与 前后数字 的间距 */
  }
  
  /* 新增：最大值编辑容器 */
  .hd-max-edit {
    min-width: 1.2em;          /* 给一个最小宽度，防止数字为空时点不到 */
    display: inline-flex;
    justify-content: center;
  }
}


/* 激励 */
.insp-slots {
  display: flex; gap: 8px;
  .insp-star {
    font-size: 1.2rem; color: #ddd; cursor: pointer;
    &.active { color: #f1c40f; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
  }
}

/* 力竭 */
.ex-track {
  display: flex; gap: 2px;
  .ex-level {
    flex: 1; height: 8px; background: #eee; border-radius: 2px; cursor: pointer;
    &.active { background: #8e44ad; }
  }
}

/* 状态 */
.cond-input {
  width: 100%; border: 1px solid #eee; resize: none;
  font-size: 0.8rem; padding: 4px; border-radius: 4px;
  box-sizing: border-box; /* 确保不溢出 */
}

/* [新增] 标题行样式，让 Select 并排 */
.res-label.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* [新增] 下拉菜单样式 */
.hd-type-select {
  font-size: 0.75rem;
  border: none;
  background: transparent;
  color: #666;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  margin: 0;
  text-align: right;
  outline: none;
}
.hd-type-select:hover {
  color: #333;
  text-decoration: underline;
}
</style>