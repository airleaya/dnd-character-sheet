<script setup lang="ts">
import { ref, computed } from 'vue'; // 👈 记得引入 computed
import draggable from 'vuedraggable';
import { useActiveSheetStore } from '../../stores/activeSheet';
import type { AbilityKey } from '../../types/Library'; // 👈 假如路径不对请调整，用于类型提示

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close']);
const store = useActiveSheetStore();

// ==========================================
// 1. 关键施法属性设置 & 自动计算逻辑 (修复部分)
// ==========================================

const abilityOptions = [
  { value: 'int', label: '智力 (Int) - 法师/艺灵' },
  { value: 'wis', label: '感知 (Wis) - 牧师/德鲁伊' },
  { value: 'cha', label: '魅力 (Cha) - 术士/诗人/邪术师' },
];

// 计算属性：绑定当前的关键属性
const currentCastingAbility = computed({
  get: () => store.character?.spells.spellcastingAbility || 'int',
  set: (newAbility: string) => {
    if (!store.character) return;
    
    // 1. 更新关键属性字段
    store.character.spells.spellcastingAbility = newAbility as AbilityKey;
    
    // 2. 触发自动计算 (DC 和 攻击加值)
    recalculateSpellStats();
  }
});

// 🔧 核心算法：重新计算 DC 和 攻击加值
const recalculateSpellStats = () => {
  const char = store.character;
  if (!char) return;

  const abilityKey = char.spells.spellcastingAbility;
  const level = char.profile.level;

  // A. 获取属性调整值 ( (属性值 - 10) / 2 向下取整 )
  const score = char.stats[abilityKey];
  const mod = Math.floor((score - 10) / 2);

  // B. 获取熟练加值 ( 1-4级+2, 5-8级+3 ... 公式: ceil(level/4) + 1 )
  const prof = Math.ceil(level / 4) + 1;

  // C. 写入数据
  // DC = 8 + 熟练 + 调整值
  char.spells.spellSaveDC = 8 + prof + mod;
  
  // Atk = 熟练 + 调整值
  char.spells.spellAttackMod = prof + mod;

  console.log(`已更新施法属性: ${abilityKey}, DC: ${char.spells.spellSaveDC}, Atk: +${char.spells.spellAttackMod}`);
};

// ==========================================
// 交互反馈系统 (Toast)
// ==========================================
const toast = ref({ show: false, message: '', type: 'success' }); // type: 'success' | 'warning'
let toastTimer: any = null;

const showToast = (msg: string, type: 'success' | 'warning' = 'success') => {
  toast.value = { show: true, message: msg, type };
  
  // 清除旧定时器
  if (toastTimer) clearTimeout(toastTimer);
  
  // 1.5秒后自动消失
  toastTimer = setTimeout(() => {
    toast.value.show = false;
  }, 1500);
};

// ==========================================
// 2. 原有的拖拽与逻辑
// ==========================================
const dropList = ref([]);

const onMove = (evt: any) => {
  return true;
};

const handleDrop = (evt: any) => {
  if (evt.added) {
    const element = evt.added.element;
    const spellId = element.spellId;

    // 立即清空 dropList，防止虚拟物品残留显示
    // 我们的 UI 是通过 store 渲染的，不是通过 dropList
    dropList.value = [];

    if (spellId) {
      // 根据返回值判断反馈
      const isSuccess = store.learnSpell(spellId);      
      if (isSuccess) {
        showToast(`成功抄录：${element.name || '新法术'}`, 'success');
      } else {
        // ⚠️ 失败反馈：不弹窗，只显示 Toast
        showToast(`你已经学会 ${element.name || '这个法术'} 了`, 'warning');
      }
    }else {
      showToast('错误：无效的法术数据', 'warning');
    }
  }
};

const isPrepared = (id: string) => store.character?.spells.prepared.includes(id);
const togglePrep = (id: string) => store.togglePreparedSpell(id);
const forget = (id: string) => {
  if (confirm('确定要遗忘这个法术吗？')) store.forgetSpell(id);
};

const updateSlotsMax = (level: number, delta: number) => {
  const currentMax = store.character?.spells.slots.max[level] || 0;
  store.updateSpellSlotMax(level, currentMax + delta);
};

const getSlotMax = (level: number) => {
  return store.character?.spells.slots.max[level] || 0;
};
</script>

<template>
  <Teleport to="body">
    <div 
      class="spellbook-overlay" 
      v-if="isOpen" 
      @click.self="$emit('close')"
    >
      <div class="book-frame">
        <Transition name="fade-slide">
          <div v-if="toast.show" class="book-toast" :class="toast.type">
            <span class="toast-icon">{{ toast.type === 'success' ? '✨' : '⚠️' }}</span>
            {{ toast.message }}
          </div>
        </Transition>
        <div class="book-spine"></div>
        <div class="book-pages">
          
          <div class="page-header">
            <div class="header-left">
              <h2>法术研习 Spellbook</h2>
              <p class="flavor-text">已抄录 {{ store.allKnownSpells.length }} 个法术</p>
            </div>

            <div class="config-bar">
              <div class="ability-selector">
                 <label>关键属性:</label>
                 <select v-model="currentCastingAbility" class="select-ability">
                   <option v-for="opt in abilityOptions" :key="opt.value" :value="opt.value">
                     {{ opt.label }}
                   </option>
                 </select>
              </div>

               <button class="btn-close" @click="$emit('close')">关闭 (Esc)</button>
            </div>
          </div>

          <div class="page-content custom-scrollbar">
            <draggable
              v-model="dropList"
              group="spells"
              item-key="id"
              class="drag-area"
              :move="onMove"
              @change="handleDrop"
              ghost-class="ghost-card"
            >
              <template #item="{ element }">
                <div class="debug-item">ID: {{ element.spellId }}</div>
              </template>

              <template #header>
                <div class="spells-layout">
                  <div v-if="store.allKnownSpells.length === 0" class="empty-state">
                    <h3>请将法术拖入下方红色区域 👇</h3>
                  </div>

                  <div v-else v-for="group in store.spellbookGroups" :key="group.level" class="spell-level-section">
                    <div class="section-header">
                      <h3>{{ group.label }}</h3>
                      
                      <div v-if="group.level > 0" class="slot-config">
                        <span class="config-label">法术位:</span>
                        <div class="stepper">
                          <button class="btn-step" @click="updateSlotsMax(group.level, -1)" :disabled="getSlotMax(group.level) <= 0">−</button>
                          <span class="slot-val">{{ getSlotMax(group.level) }}</span>
                          <button class="btn-step" @click="updateSlotsMax(group.level, 1)">+</button>
                        </div>
                      </div>
                    </div>
                    
                    <div class="cards-grid">
                      <div 
                        v-for="spell in group.spells" 
                        :key="spell.id" 
                        class="spell-paper-card"
                        :class="{ 'is-prepared': isPrepared(spell.id) || spell.level === 0 }"
                      >
                        <div class="prep-indicator"></div>

                        <div class="card-inner">
                          <div class="card-top">
                            <span class="spell-name">{{ spell.name }}</span>
                            
                            <div v-if="spell.level > 0" class="prep-toggle">
                              <label class="switch-label">
                                <input 
                                  type="checkbox" 
                                  :checked="isPrepared(spell.id)" 
                                  @change="togglePrep(spell.id)"
                                >
                                <span class="slider-round"></span>
                              </label>
                              <span class="prep-text">{{ isPrepared(spell.id) ? '已准备' : '未准备' }}</span>
                            </div>
                            <div v-else class="cantrip-tag">✨ 常用</div>
                          </div>
                          
                          <div class="card-footer">
                            <span class="level-badge" v-if="spell.level > 0">{{ spell.level }}环</span>
                            <span class="level-badge" v-else>戏法</span>
                            <button class="btn-forget" @click="forget(spell.id)" title="遗忘">🗑️</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
/* ... 原有样式保持不变 ... */
.drag-area {
  min-height: 150px;
  border: 2px dashed #e74c3c;
  background-color: rgba(231, 76, 60, 0.05);
  padding: 10px;
  margin-bottom: 20px;
}
.debug-item { display: none; }
.spellbook-overlay {
  position: fixed; top: 0; left: 0; width: calc(100vw - 320px); height: 100vh;
  background: rgba(0, 0, 0, 0.75); z-index: 2000;
  display: flex; justify-content: center; align-items: center;
}
.book-frame {
  width: 90%; max-width: 1000px; height: 90vh;
  background: #fdfbf7; border-radius: 4px;
  display: flex; box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  overflow: hidden;
}
.book-pages {
  flex: 1; display: flex; flex-direction: column;
  color: #3d3d3d; font-family: 'Georgia', serif;
}
.page-header {
  padding: 16px 32px; background: #f4f1ea; border-bottom: 1px solid #dcd6cb;
  display: flex; justify-content: space-between; align-items: center;
  .header-left h2 { margin: 0; font-size: 1.5rem; color: #4e342e; }
}

/* 👇👇👇 新增样式的部分 👇👇👇 */
.config-bar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ability-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #555;
  
  label { font-weight: bold; }
  
  .select-ability {
    padding: 4px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #fff;
    color: #333;
    font-family: inherit;
    cursor: pointer;
    
    &:hover { border-color: #999; }
    &:focus { outline: 2px solid #9b59b6; border-color: transparent; }
  }
}

.page-content { flex: 1; overflow-y: auto; padding: 32px; }
.spell-level-section { margin-bottom: 24px; }
.section-header {
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 2px solid #e0e0e0; margin: 0 0 10px 0; padding-bottom: 4px;
  h3 { margin: 0; border: none; padding: 0; color: #7f8c8d; font-size: 1.1rem; }
}
.slot-config {
  display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #7f8c8d;
}
.config-label { font-weight: bold; }
.stepper {
  display: flex; align-items: center; background: #eee; border-radius: 4px; overflow: hidden; border: 1px solid #ddd;
  .btn-step {
    border: none; background: #fff; width: 24px; height: 24px; cursor: pointer; font-weight: bold; color: #555; transition: background 0.1s;
    &:hover:not(:disabled) { background: #e0e0e0; color: #000; }
    &:disabled { color: #ccc; cursor: not-allowed; }
  }
  .slot-val {
    min-width: 24px; text-align: center; font-weight: bold; color: #2c3e50; background: #fdfbf7; line-height: 24px;
  }
}
.cards-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;
}
.spell-paper-card {
  background: #fdfbf7; border: 1px solid #dcd6cb; border-radius: 6px; 
  position: relative; transition: all 0.2s ease-in-out; overflow: hidden;
  opacity: 0.6; filter: grayscale(80%);
  &:hover { opacity: 0.9; }
  &.is-prepared {
    opacity: 1; filter: grayscale(0%); background: #fff; border-color: #9b59b6; 
    box-shadow: 0 4px 12px rgba(155, 89, 182, 0.15); transform: translateY(-2px);
    .prep-indicator { background: #9b59b6; }
  }
}
.prep-indicator {
  position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: #ccc; transition: background 0.2s;
}
.card-inner { padding: 12px 12px 12px 18px; }
.card-top {
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; height: 40px;
}
.spell-name { font-weight: bold; font-size: 0.95rem; color: #2c3e50; line-height: 1.2; }
.prep-toggle { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.switch-label {
  position: relative; display: inline-block; width: 32px; height: 18px;
  input { opacity: 0; width: 0; height: 0; }
  .slider-round {
    position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
    background-color: #bdc3c7; transition: .4s; border-radius: 34px;
    &:before {
      position: absolute; content: ""; height: 14px; width: 14px; left: 2px; bottom: 2px;
      background-color: white; transition: .4s; border-radius: 50%;
    }
  }
  input:checked + .slider-round { background-color: #9b59b6; }
  input:checked + .slider-round:before { transform: translateX(14px); }
}
.prep-text { font-size: 0.65rem; color: #7f8c8d; font-weight: bold; }
.cantrip-tag { font-size: 0.7rem; color: #27ae60; background: #e8f8f5; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
.card-footer {
  display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 6px; border-top: 1px dashed #eee;
}
.level-badge { font-size: 0.8rem; font-weight: bold; color: #95a5a6; }
.btn-forget { border: none; background: none; cursor: pointer; opacity: 0.4; &:hover { opacity: 1; color: #e74c3c; } }
.btn-close { padding: 5px 15px; cursor: pointer; }

/* [ADD] 吐司样式 */
.book-toast {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 30px;
  background: rgba(44, 62, 80, 0.95);
  color: #fff;
  font-size: 0.9rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 200; /* 在书页内容之上 */
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  pointer-events: none; /* 让鼠标穿透，不影响操作 */

  &.success { border: 1px solid #27ae60; color: #e8f8f5; }
  &.warning { border: 1px solid #e67e22; color: #fef5e7; background: rgba(160, 64, 0, 0.9); }
}

/* 简单的 Vue Transition 动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px); /* 从上方滑入/滑出 */
}
</style>