<script setup lang="ts">
import { useForge } from '../../composables/useForge';
import EditableText from '../common/EditableText.vue';
import EditableTextarea from '../common/EditableTextarea.vue';

// 获取状态和方法
const { draftItem, draftData, forgeMode, save, close } = useForge();
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div class="modal-backdrop" v-if="draftItem" @click.self="close">
        <div class="modal-content forge-modal">
          
          <div class="modal-header">
            <div class="title-group">
              <span class="emoji">🔨</span>
              <h3>{{ forgeMode === 'create' ? '打造新物品' : '改造物品' }}</h3>
            </div>
            <button class="btn-close" @click="close">×</button>
          </div>

          <div class="modal-body custom-scrollbar">
            
            <div class="form-section highlight">
               <div class="form-row main-name">
                 <label>物品名称</label>
                 <EditableText v-model="draftItem!.name" class="input-lg" />
               </div>
               
               <div class="stats-grid">
                 <div class="field">
                   <label>重量 (lb)</label>
                   <input type="number" v-model.number="draftItem!.weight" step="0.1">
                 </div>
                 <div class="field">
                   <label>数量</label>
                   <input type="number" v-model.number="draftItem!.quantity" min="1">
                 </div>
                 <div class="field">
                    <label>价值</label>
                    <input type="text" v-model="(draftData as any).cost" placeholder="--">
                 </div>
               </div>
            </div>

            <div class="form-section">
              <label>物品描述 / 备注</label>
              <EditableTextarea 
                :model-value="draftItem!.description ?? ''" 
                @update:model-value="val => draftItem!.description = val"
                :rows="4" 
              />
            </div>

            <hr class="divider" />

            <div v-if="draftItem!.type === 'weapon'" class="form-section type-specific">
              <h4>⚔️ 战斗属性</h4>
              <div class="row-2">
                <div class="field">
                  <label>伤害骰 (Damage)</label>
                  <input type="text" v-model="(draftData as any).damage" placeholder="1d8">
                </div>
                <div class="field">
                  <label>伤害类型</label>
                  <input type="text" v-model="(draftData as any).damageType" placeholder="slashing">
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

            <div v-if="draftItem!.type === 'armor'" class="form-section type-specific">
              <h4>🛡️ 防御属性</h4>
              <div class="row-2">
                <div class="field">
                  <label>AC (防御等级)</label>
                  <input type="number" v-model.number="(draftData as any).ac">
                </div>
                <div class="field">
                  <label>护甲类型</label>
                  <select v-model="(draftData as any).armorType">
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
            <button class="btn-cancel" @click="close">取消 (Esc)</button>
            <button class="btn-save" @click="save">保存更改</button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
/* 模态框通用样式 */
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.7); z-index: 2000;
  display: flex; justify-content: center; align-items: center;
  backdrop-filter: blur(2px);
}

.forge-modal {
  background: #fff; width: 500px; max-width: 90vw;
  border-radius: 8px; overflow: hidden;
  box-shadow: 0 15px 50px rgba(0,0,0,0.3);
  display: flex; flex-direction: column;
  animation: popIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.modal-header {
  padding: 15px 20px; background: #2c3e50; color: #fff;
  display: flex; justify-content: space-between; align-items: center;
  
  .title-group {
    display: flex; align-items: center; gap: 10px;
    h3 { margin: 0; font-size: 1.1rem; letter-spacing: 1px; }
    .emoji { font-size: 1.4rem; }
  }
  .btn-close { 
    background: none; border: none; color: #95a5a6; font-size: 1.5rem; cursor: pointer;
    &:hover { color: #fff; }
  }
}

.modal-body {
  padding: 25px; max-height: 70vh; overflow-y: auto;
  display: flex; flex-direction: column; gap: 20px;
}

/* 表单样式 */
.form-section {
  display: flex; flex-direction: column; gap: 8px;
  
  &.highlight { background: #f8f9fa; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; }
  &.type-specific { border-left: 3px solid #d35400; padding-left: 15px; }
  
  label { font-size: 0.8rem; color: #7f8c8d; font-weight: bold; text-transform: uppercase; }
  
  input, select {
    padding: 8px 10px; border: 1px solid #ced4da; border-radius: 4px; font-size: 0.95rem;
    &:focus { border-color: #d35400; outline: none; box-shadow: 0 0 0 2px rgba(211, 84, 0, 0.1); }
  }

  .main-name .input-lg {
    font-size: 1.3rem; font-weight: bold; color: #2c3e50;
    border-bottom: 2px solid #ddd; padding-bottom: 5px;
  }
}

.stats-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;
}

.row-2 { display: flex; gap: 15px; .field { flex: 1; display: flex; flex-direction: column; gap: 5px; } }

.tags-container {
  display: flex; flex-wrap: wrap; gap: 5px;
  .tag { background: #e9ecef; color: #495057; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; }
  .hint { color: #adb5bd; font-style: italic; font-size: 0.85rem; }
}

.divider { border: 0; border-top: 1px dashed #dee2e6; margin: 5px 0; }

/* Footer Buttons */
.modal-footer {
  padding: 15px 20px; background: #f8f9fa; border-top: 1px solid #eee;
  display: flex; justify-content: flex-end; gap: 10px;
  
  button {
    padding: 8px 20px; border-radius: 4px; font-weight: bold; cursor: pointer; border: none; font-size: 0.9rem;
    transition: transform 0.1s;
    &:active { transform: translateY(1px); }
  }
  .btn-cancel { background: #e9ecef; color: #495057; &:hover { background: #dee2e6; } }
  .btn-save { background: #d35400; color: white; &:hover { background: #e67e22; } }
}

@keyframes popIn {
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>