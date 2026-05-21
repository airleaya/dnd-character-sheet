<script setup lang="ts">
import { ref, computed } from 'vue';
import { useActiveSheetStore } from '../../../stores/activeSheet';
import { useUiFeedbackStore } from '../../../stores/uiFeedback';
import EditableText from '../../common/EditableText.vue';
import type { Character, CombatStats } from '../../../types/Character';

const store = useActiveSheetStore();
const feedback = useUiFeedbackStore();
const char = computed(() => store.character);
const combat = computed(() => store.character?.combat);

// AC 编辑状态控制
const isEditingAC = ref(false);

const acOptions = [
  { value: 'default', label: '默认 (10+敏)' },
  { value: 'barbarian', label: '野蛮人 (10+敏+体)' },
  { value: 'monk', label: '武僧 (10+敏+感)' },
  { value: 'draconic', label: '天生 (13+敏)' },
];

//更新护甲模式
const updateACMode = (e: Event) => {
  const val = (e.target as HTMLSelectElement).value as CombatStats['acMode'];
  store.updateCombatStat('acMode', val);
  isEditingAC.value = false; // 选完自动关闭
};

//护甲模式设置的切换函数
const toggleACEdit = () => {
  isEditingAC.value = !isEditingAC.value;
};

// 定义生命骰选项
const hitDiceOptions = ['d6', 'd8', 'd10', 'd12', 'd20'];

// HP 操作数值
const hpInput = ref<number | ''>('');

// 通用更新函数
const update = <K extends keyof Character['combat']>(field: K, val: Character['combat'][K]) => {
  store.updateCombatStat(field, val);
};

// 生命骰更新处理
const isEditingHitDice = ref(false);

const toggleHitDiceEdit = () => {
  isEditingHitDice.value = !isEditingHitDice.value;
};

// 获取激活的生命骰（只显示 max > 0 的类型）
const activeHitDice = computed(() => {
  if (!combat.value) return [];
  return Object.entries(combat.value.hitDice)
    .filter(([, data]) => data.max > 0)
    .map(([type, data]) => ({ type, ...data }));
});


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
const handleFullHeal = async () => {
  const confirmed = await feedback.confirm({
    title: '回满生命值',
    message: '确定要一键回满 HP 吗？',
    tone: 'warning',
    confirmText: '立即回满',
  });
  if (confirmed) {
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

      <div class="stat-box ac-box" :class="{ 'is-magic-ac': !!store.armorClassMagicStyle }">
        <div
         class="label toggle-btn"
          @click="toggleACEdit"
           title="点击切换 配置模式/查看模式"
         >
          护甲等级 
          <span class="gear-icon" v-if="!isEditingAC">
            {{ isEditingAC ? '↩' : '⚙️' }}
          </span>
        </div>
        
        <div class="value shield-shape" v-if="isEditingAC">
           <select 
             class="ac-select" 
             :value="combat.acMode || 'default'"
             @change="updateACMode"
             @blur="isEditingAC = false"
           >
             <option v-for="opt in acOptions" :key="opt.value" :value="opt.value">
               {{ opt.label }}
             </option>
           </select>
        </div>

        <div class="value shield-shape" v-else :style="store.armorClassMagicStyle" @click="isEditingAC = true">
          {{ store.armorClass }}
        </div>

        <div v-if="store.armorClassMagicBadges.length" class="ac-magic-badges">
          <span
            v-for="badge in store.armorClassMagicBadges"
            :key="badge.id"
            class="ac-magic-badge"
            :style="badge.style"
            :title="`${badge.itemName}：${badge.description || badge.name}`"
          >
            {{ badge.name }}
          </span>
        </div>
      </div>
      
      <div class="stat-box">
        <div class="label">先攻</div>
        <div class="value initiative-value">
          <span>{{ store.initiative }}</span>
          <span
            v-if="store.initiativeJackOfAllTrades"
            class="jack-chip"
            title="万事通加成已计入先攻"
          >
            万
          </span>
        </div>
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
          <div 
            class="res-label header-row toggle-btn" 
            @click="toggleHitDiceEdit"
            title="点击切换 配置模式/查看模式"
          >
            <span>生命骰</span>
            <span class="gear-icon" :class="{ active: isEditingHitDice }">
              {{ isEditingHitDice ? '↩' : '⚙️' }}
            </span>
          </div>
          
          <div class="hd-list" v-if="!isEditingHitDice">
            <div v-if="activeHitDice.length === 0" class="empty-hint">暂无可用生命骰</div>
            <div class="hd-controls" v-for="hd in activeHitDice" :key="hd.type">
              <span class="hd-type-badge">{{ hd.type }}</span>
              <div class="hd-btn-group">
                                <button @click="store.changeHitDiceCurrent(hd.type, -1)" :disabled="hd.current <= 0">-</button>
                <span class="hd-val">{{ hd.current }} / {{ hd.max }}</span>
                <button @click="store.changeHitDiceCurrent(hd.type, 1)" :disabled="hd.current >= hd.max">+</button>

              </div>
            </div>
          </div>

          <div class="hd-list edit-mode" v-else>
             <div class="hd-edit-row" v-for="d in hitDiceOptions" :key="d">
                <span class="hd-type-badge">{{ d }}</span>
                <span class="hd-max-edit">
                  最大: 
                  <EditableText 
                                        :model-value="combat.hitDice[d]?.max || 0" 
                    @update:model-value="v => store.setHitDiceMax(d, Number(v))"

                  />
                </span>
             </div>
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
  background: var(--color-combat-panel-bg);
  border: 1px solid var(--color-combat-panel-border);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.divider {
  border: 0;
  border-top: 1px solid var(--color-combat-divider);
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
    border: 1px solid var(--color-combat-stat-border);
    border-radius: 6px;
    padding: 8px 4px;
    background: var(--color-combat-stat-bg);

    //交互样式
    &.ac-box {
      // cursor: pointer;
      transition: background 0.2s;

      &.is-magic-ac {
        border-color: var(--color-combat-magic-ac-border);
        box-shadow: inset 0 0 0 1px var(--color-combat-magic-ac-shadow);
      }
      
      &:hover {
        background: var(--color-combat-stat-hover);
        .gear-icon { opacity: 1; }
      }
    }
    /* 基础样式：作用于所有标题 (护甲、先攻、速度) */
.label { 
  font-size: 0.75rem; 
  color: var(--color-combat-label);
  text-transform: uppercase; 
  
  /* 特殊样式：仅作用于拥有 toggle-btn 类的标题 (只有护甲有这个类) */
  &.toggle-btn { 
    cursor: pointer;          /* 鼠标变手型 */
    user-select: none;        /* 防止双击选中文字 */
    display: flex;            /* 开启 Flex 布局 */
    align-items: center;      /* 垂直居中 */
    justify-content: center;  /* 水平居中 */
    gap: 4px;                 /* 文字和图标间距 */
    
    &:hover { 
      color: var(--color-combat-label-hover);            /* 悬停加深颜色 */
    }
  }
}

    //齿轮图标默认半透明
    .gear-icon {
      font-size: 0.8rem;
      opacity: 0.3;
      transition: all 0.2s;
      
      /* 激活状态下常亮且变色 */
      &.active {
        opacity: 1;
        color: var(--color-combat-edit-active); /* 橙色提示正在编辑 */
        transform: rotate(-90deg); /* 给个小动画提示状态变化 */
      }
    }

    .value { font-size: 1.5rem; font-weight: bold; color: var(--color-combat-value);cursor: pointer; }

    .initiative-value {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }

    .jack-chip {
      min-width: 16px;
      height: 15px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--color-combat-jack-text);
      background: var(--color-combat-jack-bg);
      border: 1px solid var(--color-combat-jack-border);
      border-radius: 2px;
      padding: 0 3px;
      font-size: 0.68rem;
      font-weight: 900;
      line-height: 1;
    }
    
    .shield-shape {
      /* 简单的盾牌形状 CSS */
      display: flex; align-items: center; justify-content: center;
      width: 40px; height: 46px;
      background: var(--color-combat-shield-bg);
      clip-path: polygon(50% 0, 100% 20%, 100% 80%, 50% 100%, 0 80%, 0 20%);

      //确保下拉框不溢出盾牌
      overflow: hidden;
    }

    .ac-magic-badges {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 3px;
      margin-top: 4px;
      max-width: 100%;
    }

    .ac-magic-badge {
      max-width: 84px;
      border-radius: 999px;
      padding: 1px 6px;
      font-size: 0.62rem;
      font-weight: 900;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      border: 1px solid var(--color-combat-magic-badge-border);
      box-shadow: 0 1px 2px var(--color-combat-magic-badge-shadow);
    }

    // [ADD] 下拉框样式
    .ac-select {
      width: 100%;
      height: 100%;
      font-size: 0.6rem; /* 字体要极小才能塞进盾牌里，或者只显示简写 */
      border: none;
      background: var(--color-combat-control-transparent-bg);
      text-align: center;
      outline: none;
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
  background: var(--color-combat-hp-track-bg);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px var(--color-combat-hp-track-shadow);
  
  .hp-bar-fill {
    height: 100%;
    background: var(--color-combat-hp-fill-danger); /* 默认红色 */
    transition: width 0.3s ease;
  }
  /* 血量健康时显示绿色 */
  &:has(.hp-bar-fill[style*="width: 100%"]),
  &:has(.hp-bar-fill[style*="width: 9"]),
  &:has(.hp-bar-fill[style*="width: 8"]),
  &:has(.hp-bar-fill[style*="width: 7"]),
  &:has(.hp-bar-fill[style*="width: 6"]),
  &:has(.hp-bar-fill[style*="width: 5"]) {
     .hp-bar-fill { background: var(--color-combat-hp-fill-safe); }
  }

  .hp-text {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.9rem; font-weight: bold;
    color: var(--color-combat-hp-text);
    text-shadow: 0 0 2px var(--color-combat-hp-text-shadow);
    
    .sep { margin: 0 4px; }
    .temp { color: var(--color-combat-hp-temp); margin-left: 4px; }
  }
}

.hp-controls {
  display: flex;
  gap: 6px;
  
  input {
    width: 50px; flex: 1;
    border: 1px solid var(--color-combat-input-border); border-radius: 4px;
    padding: 0 4px; text-align: center;
  }
  
  .btn-group {
    display: flex; gap: 2px;
    button {
      border: none; cursor: pointer; color: var(--color-text-inverse);
      padding: 4px 8px; font-size: 0.8rem;
      border-radius: 4px;
      &:first-child { border-top-right-radius: 0; border-bottom-right-radius: 0; }
      &:last-child { border-top-left-radius: 0; border-bottom-left-radius: 0; }
      &:not(:first-child):not(:last-child) { border-radius: 0; }
    }
    .btn-dmg { background: var(--color-combat-damage-bg); &:hover{background: var(--color-combat-damage-hover);} }
    .btn-heal { background: var(--color-combat-heal-bg); &:hover{background: var(--color-combat-heal-hover);} }
    .btn-temp { background: var(--color-combat-temp-bg); &:hover{background: var(--color-combat-temp-hover);} }
  }
  
  .btn-full {
    background: none; border: 1px solid var(--color-combat-full-border);
    color: var(--color-combat-damage-bg); border-radius: 4px; cursor: pointer;
    &:hover { background: var(--color-combat-full-hover-bg); }
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
  .res-label { font-size: 0.75rem; color: var(--color-combat-resource-label); margin-bottom: 4px; font-weight: bold; }
}

/* 死亡豁免 */
.save-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 2px;
  .sub-label { font-size: 0.7rem; }
  .circles { display: flex; gap: 4px; }
  .circle {
    width: 12px; height: 12px; border-radius: 50%;
    border: 1px solid var(--color-combat-death-circle-border); cursor: pointer;
    &.success.active { background: var(--color-combat-heal-bg); border-color: var(--color-combat-heal-bg); }
    &.failure.active { background: var(--color-combat-damage-bg); border-color: var(--color-combat-damage-bg); }
  }
}

.resource-item.hit-dice {
  .toggle-btn {
    cursor: pointer;
    user-select: none;
    display: flex;
    align-items: center;
    &:hover { color: var(--color-combat-label-hover); }
  }
  .gear-icon {
    font-size: 0.8rem; opacity: 0.3; transition: all 0.2s;
    &.active { opacity: 1; color: var(--color-combat-edit-active); transform: rotate(-90deg); }
  }
  .hd-list {
    display: flex; flex-direction: column; gap: 4px; margin-top: 4px;
  }
  .hd-edit-row {
    display: flex; align-items: center; justify-content: space-between;
    background: var(--color-combat-hit-dice-edit-bg); border: 1px dashed var(--color-combat-input-border); border-radius: 4px; padding: 2px 6px;
    font-size: 0.8rem;
  }
  .hd-type-badge {
    font-weight: bold; color: var(--color-combat-hit-dice-type); width: 28px;
    font-size: 0.85rem; text-transform: uppercase;
  }
  .empty-hint { font-size: 0.75rem; color: var(--color-combat-resource-label); text-align: center; padding: 4px; }
}

/* 生命骰控制区 */
.hd-controls {
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  background: var(--color-combat-hit-dice-bg);
  border-radius: 4px; 
  padding: 2px 6px;

  .hd-btn-group {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  button { 
    width: 20px; 
    height: 20px; 
    border: none; 
    background: var(--color-combat-hit-dice-button-bg);
    cursor: pointer; 
    border-radius: 2px;
    display: flex;
    align-items: center; 
    justify-content: center;
    padding-bottom: 2px;

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      pointer-events: none;
    }
  }

  .hd-val { 
    font-size: 0.9rem; 
    font-weight: bold; 
    display: flex;
    align-items: center;
    min-width: 36px;
    justify-content: center;
  }
}


/* 激励 */
.insp-slots {
  display: flex; gap: 8px;
  .insp-star {
    font-size: 1.2rem; color: var(--color-combat-inspiration-off); cursor: pointer;
    &.active { color: var(--color-combat-inspiration-on); text-shadow: 0 1px 2px var(--color-combat-inspiration-shadow); }
  }
}

/* 力竭 */
.ex-track {
  display: flex; gap: 2px;
  .ex-level {
    flex: 1; height: 8px; background: var(--color-combat-exhaustion-bg); border-radius: 2px; cursor: pointer;
    &.active { background: var(--color-combat-exhaustion-active); }
  }
}

/* 状态 */
.cond-input {
  width: 100%; border: 1px solid var(--color-combat-divider); resize: none;
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
  background: var(--color-combat-control-transparent-bg);
  color: var(--color-combat-label);
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  margin: 0;
  text-align: right;
  outline: none;
}
.hd-type-select:hover {
  color: var(--color-combat-label-hover);
  text-decoration: underline;
}
</style>
