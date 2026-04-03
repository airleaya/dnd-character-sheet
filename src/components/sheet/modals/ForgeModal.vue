<script setup lang="ts">
import { ref, watch } from 'vue'
import { useForge } from '../../../composables/useForge';
import EditableText from '../../common/EditableText.vue';
import EditableTextarea from '../../common/EditableTextarea.vue';

// 获取状态和方法
const { draftItem, draftData, forgeMode, save, close } = useForge();

// 记录鼠标按下时是否在遮罩层上
const isMouseDownOnBackdrop = ref(false);

// 数据安全层（未保存修改的拦截确认）
const initialStateStr = ref('');

// 监听 draftItem 的引用变化（通常在打开弹窗或切换编辑物品时发生赋值）
// 注意这里只监听引用，不加 deep，这样就能正好捕获初始状态，而不会在每次输入时被覆盖
watch(() => draftItem.value, (newVal) => {
  if (newVal) {
    initialStateStr.value = JSON.stringify(newVal);
  } else {
    initialStateStr.value = '';
  }
});

// 安全关闭逻辑
const safeClose = () => {
  if (draftItem.value) {
    const currentStr = JSON.stringify(draftItem.value);
    // 比对当前状态与初始快照
    if (currentStr !== initialStateStr.value) {
      if (!window.confirm('检测到未保存的更改，确认要舍弃并退出吗？')) {
        return; // 用户点击了“取消”，终止关闭动作
      }
    }
  }
  close(); // 执行真正的关闭
};

const onBackdropMousedown = () => {
  isMouseDownOnBackdrop.value = true;
};

const onBackdropMouseup = () => {
  // 只有当 mousedown 和 mouseup 都在遮罩层上时，才执行关闭操作
  if (isMouseDownOnBackdrop.value) {
    safeClose(); 
  }
  // 无论如何，松开鼠标后重置状态
  isMouseDownOnBackdrop.value = false;
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div class="modal-backdrop" v-if="draftItem" @mousedown.self="onBackdropMousedown" @mouseup.self="onBackdropMouseup">
        
        <div class="modal-content">
          
          <div class="modal-header">
            <div class="title-group">
              <span class="emoji">🔨</span>
              <h3>{{ forgeMode === 'create' ? '打造新物品' : '改造物品' }}</h3>
            </div>
            <button class="btn-close" @click="safeClose" title="关闭 (Esc)">×</button>
          </div>

          <div class="modal-body custom-scrollbar">
            
            <div class="form-section highlight">
               <div class="form-row main-name">
                 <label>物品名称</label>
                 <EditableText v-model="draftItem!.name" class="input-lg" placeholder="输入物品名称..." />
               </div>
               
               <div class="stats-grid">
                 <div class="field">
                   <label>重量 (lb)</label>
                   <input type="number" v-model.number="draftItem!.weight" step="0.1" class="input-std">
                 </div>
                 <div class="field">
                   <label>数量</label>
                   <input type="number" v-model.number="draftItem!.quantity" min="1" class="input-std">
                 </div>
                 
                 <div class="field cost-field">
                    <label>价值</label>
                    <div class="cost-input-group">
                      <input 
                        type="number" 
                        v-model.number="(draftData as any).cost.value" 
                        placeholder="0" 
                        class="input-std"
                      >
                      <select v-model="(draftData as any).cost.unit" class="unit-select">
                        <option value="gp">gp</option>
                        <option value="sp">sp</option>
                        <option value="cp">cp</option>
                      </select>
                    </div>
                 </div>
               </div>
            </div>

            <div class="form-section">
              <label>物品描述 / 备注</label>
              <EditableTextarea 
                :model-value="draftItem!.description ?? ''" 
                @update:model-value="val => draftItem!.description = val"
                :rows="6"
                class="desc-area"
              />
            </div>

            <hr class="divider" />

            <div v-if="draftItem!.type === 'weapon'" class="form-section type-specific weapon">
              <div class="section-header">
                <h4>⚔️ 战斗属性</h4>
              </div>
              <div class="row-2">
                <div class="field">
                  <label>伤害骰 (Damage)</label>
                  <input type="text" v-model="(draftData as any).damage" placeholder="1d8" class="input-std">
                </div>
                <div class="field">
                  <label>伤害类型</label>
                  <input type="text" v-model="(draftData as any).damageType" placeholder="slashing" class="input-std">
                </div>
              </div>
              <div class="field mt-2">
                <label>属性 (Properties)</label>
                <div class="tags-container">
                   <span v-for="p in (draftData as any).properties" :key="p" class="tag">{{ p }}</span>
                   <span class="hint" v-if="!(draftData as any).properties?.length">暂无特殊属性</span>
                </div>
              </div>
            </div>

            <div v-if="draftItem!.type === 'armor'" class="form-section type-specific armor">
              <div class="section-header">
                <h4>🛡️ 防御属性</h4>
              </div>
              <div class="row-2">
                <div class="field">
                  <label>AC (防御等级)</label>
                  <input type="number" v-model.number="(draftData as any).ac" class="input-std">
                </div>
                <div class="field">
                  <label>护甲类型</label>
                  <select v-model="(draftData as any).armorType" class="input-std">
                    <option value="light">轻甲</option>
                    <option value="medium">中甲</option>
                    <option value="heavy">重甲</option>
                    <option value="shield">盾牌</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="safeClose">取消 (Esc)</button>
            <button class="btn-save" @click="save">保存更改</button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
/* 1. 背景遮罩层 
  必须 fixed 铺满全屏，负责模糊背景和点击关闭
*/
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  z-index: 2000;
  
  /* Flex 布局确保内容居中 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 2. 模态框主体卡片
  移除原来的 fixed 定位，改由 backdrop 居中
  增加宽度到 600px (原为自适应或挤压)
*/
.modal-content {
  background: #fff;
  width: 780px; /* 增大宽度 */
  max-width: 95vw;
  //max-height: 85vh;
  height: 85vh;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止圆角被子元素破坏 */
  animation: popIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.modal-header {
  padding: 18px 25px;
  background: #2c3e50;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  
  .title-group {
    display: flex; align-items: center; gap: 12px;
    h3 { margin: 0; font-size: 1.2rem; letter-spacing: 0.5px; font-weight: 600; }
    .emoji { font-size: 1.5rem; }
  }
  .btn-close { 
    background: none; border: none; color: #bdc3c7; font-size: 2rem; line-height: 1; cursor: pointer; padding: 0;
    &:hover { color: #fff; }
  }
}

.modal-body {
  padding: 30px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: #fdfdfd;
}

/* 表单区域通用样式 */
.form-section {
  display: flex; flex-direction: column; gap: 10px;
  
  &.highlight {
    background: #f1f2f6;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #e1e2e6;
  }
  
  &.type-specific {
    position: relative;
    padding: 20px;
    border-radius: 8px;
    background: #fff8f3;
    border: 1px solid #ffeaa7;
    
    &.weapon { border-left: 4px solid #d35400; }
    &.armor { border-left: 4px solid #2980b9; background: #f0f8ff; border-color: #d6eaf8; }
    
    h4 { margin: 0 0 10px 0; color: #555; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 1px; }
  }

  label {
    font-size: 0.75rem;
    color: #7f8c8d;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }
}

/* 输入框统一样式 */
.input-std, .unit-select {
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s;
  background: #fff;
  
  &:focus {
    border-color: #d35400;
    outline: none;
    box-shadow: 0 0 0 3px rgba(211, 84, 0, 0.1);
  }
}

.main-name .input-lg {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  border: none;
  border-bottom: 2px solid #ced4da;
  border-radius: 0;
  padding: 5px 0;
  background: transparent;
  width: 100%;
  
  &:focus {
    border-bottom-color: #d35400;
    box-shadow: none;
  }
}

/* 网格布局优化 */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1.8fr; /* 价值栏稍微宽一点 */
  gap: 20px;
  align-items: start;

  /* ⚡️ 修复换行问题：强制所有字段都是上下结构 */
  .field {
    display: flex;
    flex-direction: column; /* 确保 Label 永远在 Input 上方 */
    gap: 5px;
  }
  
  /* ⚡️ 修复宽度问题：缩短数字输入框 */
  /* 只影响第一层级的 input，不影响 text 等其他类型 */
  .field input[type="number"] {
    width: 100%;       /* 填满父容器 */
    max-width: 100px;  /* 但最大不超过 100px */
  }
}

/* 价值字段的特殊组合样式 */
.cost-input-group {
  display: flex;
  gap: 5px;
  
  input { 
    /* 缩短价值输入框 */
    min-width: 60px; 
    max-width: 90px; /* 特别限制价值输入框的宽度 */
  }
  select { 
    width: 70px; flex-shrink: 0; cursor: pointer; background-color: #f8f9fa; 
  }
}

.row-2 {
  display: flex; gap: 20px;
  .field { flex: 1; display: flex; flex-direction: column; gap: 5px; }
}

.tags-container {
  display: flex; flex-wrap: wrap; gap: 8px;
  min-height: 34px; align-items: center;
  .tag { 
    background: #e9ecef; color: #2c3e50; padding: 4px 10px; 
    border-radius: 15px; font-size: 0.85rem; font-weight: 500;
  }
  .hint { color: #bdc3c7; font-style: italic; font-size: 0.9rem; }
}

.divider { border: 0; border-top: 1px dashed #dcdde1; margin: 10px 0; }

.modal-footer {
  padding: 20px 30px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
  
  button {
    padding: 10px 24px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    font-size: 0.95rem;
    transition: transform 0.1s, box-shadow 0.2s;
    
    &:active { transform: translateY(1px); }
  }
  
  .btn-cancel { 
    background: #fff; border: 1px solid #ced4da; color: #495057; 
    &:hover { background: #f1f3f5; }
  }
  
  .btn-save { 
    background: #d35400; color: white; box-shadow: 0 4px 6px rgba(211, 84, 0, 0.2);
    &:hover { background: #e67e22; box-shadow: 0 6px 8px rgba(211, 84, 0, 0.3); }
  }
}

/* 动画 */
@keyframes popIn {
  0% { opacity: 0; transform: scale(0.95) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>