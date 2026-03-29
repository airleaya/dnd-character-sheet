<script setup lang="ts">
import { ref, inject } from 'vue';
import draggable from 'vuedraggable';
import { useActiveSheetStore } from '../../../stores/activeSheet';

const store = useActiveSheetStore();

// 接收父组件提供的 Toast 方法
const showToast = inject<((msg: string, type?: 'success' | 'warning') => void)>('showToast');

// ==========================================
// 1. 拖拽与学习逻辑
// ==========================================
const dropList = ref([]);
// 新增：决定拖入法术时标记为何种来源
const learningSource = ref<'primary' | 'secondary'>('primary');

const onMove = (evt: any) => {
  return true;
};

const handleDrop = (evt: any) => {
  if (evt.added) {
    const element = evt.added.element;
    const spellId = element.spellId;

    // 立即清空，防止虚拟物品残留
    dropList.value = [];

    if (spellId) {
      // 传入当前的来源标记 (主职/兼职)
      const isSuccess = store.learnSpell(spellId, learningSource.value);      
      if (isSuccess && showToast) {
        const sourceText = learningSource.value === 'primary' ? '主职' : '兼职';
        showToast(`成功抄录 (${sourceText})：${element.name || '新法术'}`, 'success');
      } else if (showToast) {
        showToast(`你已经学会 ${element.name || '这个法术'} 了`, 'warning');
      }
    } else if (showToast) {
      showToast('错误：无效的法术数据', 'warning');
    }
  }
};

// ==========================================
// 2. 卡片交互逻辑
// ==========================================
const isPrepared = (id: string) => store.character?.spells.prepared.includes(id);

const togglePrep = (id: string) => store.togglePreparedSpell(id);

const forget = (id: string) => {
  if (confirm('确定要遗忘这个法术吗？')) store.forgetSpell(id);
};

// 获取法术来源文本用于UI展示
const getSpellSourceLabel = (id: string) => {
  if (!store.character?.spells.spellSources) return '主职';
  const source = store.character.spells.spellSources[id] || 'primary';
  return source === 'primary' ? '主职' : '兼职';
};
</script>

<template>
  <div class="right-panel-container custom-scrollbar">
    
    <div class="panel-header">
      <div class="header-left">
        <h2 class="title">已习得法术</h2>
        <p class="flavor-text">共 {{ store.allKnownSpells.length }} 个法术</p>
      </div>
      
      <div class="source-toggle" v-if="store.character?.spells.secondaryCastingAbility">
        <span class="toggle-label">拖入学习为:</span>
        <div class="radio-group">
          <label class="radio-btn" :class="{ active: learningSource === 'primary' }">
            <input type="radio" v-model="learningSource" value="primary"> 主职
          </label>
          <label class="radio-btn" :class="{ active: learningSource === 'secondary' }">
            <input type="radio" v-model="learningSource" value="secondary"> 兼职
          </label>
        </div>
      </div>
    </div>

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
            <h3>请从左侧法术库将法术拖入此区域 👇</h3>
            <p>支持按环阶自动分组，学习后可在此准备/遗忘。</p>
          </div>

          <div v-else v-for="group in store.spellbookGroups" :key="group.level" class="spell-level-section">
            <div class="section-header">
              <h3>{{ group.label }}</h3>
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
                    <div class="footer-left">
                      <span class="level-badge" v-if="spell.level > 0">{{ spell.level }}环</span>
                      <span class="level-badge" v-else>戏法</span>
                      <span class="source-badge" v-if="store.character?.spells.secondaryCastingAbility" :class="store.character.spells.spellSources?.[spell.id] || 'primary'">
                        {{ getSpellSourceLabel(spell.id) }}
                      </span>
                    </div>
                    
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
</template>

<style scoped lang="scss">
.right-panel-container {
  height: 100%;
  padding: 24px 32px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* 头部 */
.panel-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  border-bottom: 1px solid #dcd6cb; padding-bottom: 12px; margin-bottom: 20px;
  
  .title { margin: 0; font-size: 1.5rem; color: #4e342e; }
  .flavor-text { margin: 4px 0 0 0; font-size: 0.9rem; color: #7f8c8d; }
}

/* 学习来源切换器 */
.source-toggle {
  display: flex; align-items: center; gap: 8px; font-size: 0.85rem;
  .toggle-label { font-weight: bold; color: #555; }
  .radio-group {
    display: flex; background: #eee; border-radius: 4px; overflow: hidden; border: 1px solid #ccc;
    .radio-btn {
      padding: 4px 10px; cursor: pointer; color: #777; transition: all 0.2s;
      input { display: none; }
      &:hover { background: #e0e0e0; }
      &.active { background: #9b59b6; color: #fff; font-weight: bold; }
    }
  }
}

/* 拖拽区与列表 */
.drag-area {
  flex: 1; min-height: 200px; padding-bottom: 40px;
  border: 2px dashed transparent; transition: border 0.3s;
  /* 当拖拽物体悬浮时可以通过 ghost-class 给提示，这里提供基础占位 */
}
.debug-item { display: none; }

.empty-state {
  text-align: center; padding: 40px 20px; border: 2px dashed #e74c3c;
  background-color: rgba(231, 76, 60, 0.05); border-radius: 8px; color: #c0392b;
  h3 { margin-bottom: 8px; }
  p { color: #7f8c8d; font-size: 0.9rem; }
}

/* 分组样式 */
.spell-level-section { margin-bottom: 24px; }
.section-header {
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 2px solid #e0e0e0; margin: 0 0 12px 0; padding-bottom: 4px;
  h3 { margin: 0; border: none; padding: 0; color: #7f8c8d; font-size: 1.1rem; }
}

/* 卡片网格 */
.cards-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;
}

/* 法术卡片 (复用原有的漂亮样式) */
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
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; min-height: 40px;
}
.spell-name { font-weight: bold; font-size: 0.95rem; color: #2c3e50; line-height: 1.2; padding-right: 8px; }

/* 准备开关 */
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

/* 卡片底部 */
.card-footer {
  display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 6px; border-top: 1px dashed #eee;
}
.footer-left { display: flex; align-items: center; gap: 8px; }
.level-badge { font-size: 0.8rem; font-weight: bold; color: #95a5a6; }

/* 来源徽章 */
.source-badge {
  font-size: 0.7rem; padding: 2px 6px; border-radius: 10px; font-weight: bold;
  &.primary { background: #e3f2fd; color: #1976d2; border: 1px solid #bbdefb; }
  &.secondary { background: #fce4ec; color: #c2185b; border: 1px solid #f8bbd0; }
}

.btn-forget { border: none; background: none; cursor: pointer; opacity: 0.4; &:hover { opacity: 1; color: #e74c3c; } }
</style>