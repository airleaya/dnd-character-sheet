<script setup lang="ts">
import { computed } from 'vue';
import { useActiveSheetStore } from '../../stores/activeSheet';
import EditableText from '../common/EditableText.vue';
import EditableTextarea from '../common/EditableTextarea.vue';

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['close']);

const store = useActiveSheetStore();
const bio = computed(() => store.character?.bio);

// 辅助更新函数
const update = (field: string, val: string) => {
  // @ts-ignore: 简单的类型推断忽略
  store.updateBio(field, val);
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div class="modal-backdrop" v-if="isOpen && bio" @click.self="emit('close')">
        <div class="modal-content bio-modal">
          <div class="modal-header">
            <h3>📝 角色设定与生平</h3>
            <button class="btn-close" @click="emit('close')">×</button>
          </div>

          <div class="modal-body">
            
            <div class="section appearance-grid">
              <div class="field-box">
                <label>年龄</label>
                <EditableText :model-value="bio.age" @update:model-value="v => update('age', String(v))" />
              </div>
              <div class="field-box">
                <label>身高</label>
                <EditableText :model-value="bio.height" @update:model-value="v => update('height', String(v))" />
              </div>
              <div class="field-box">
                <label>体重</label>
                <EditableText :model-value="bio.weight" @update:model-value="v => update('weight', String(v))" />
              </div>
              <div class="field-box">
                <label>瞳色</label>
                <EditableText :model-value="bio.eyes" @update:model-value="v => update('eyes', String(v))" />
              </div>
              <div class="field-box">
                <label>肤色</label>
                <EditableText :model-value="bio.skin" @update:model-value="v => update('skin', String(v))" />
              </div>
              <div class="field-box">
                <label>发色</label>
                <EditableText :model-value="bio.hair" @update:model-value="v => update('hair', String(v))" />
              </div>
            </div>

            <hr class="divider">

            <div class="section personality-grid">
              <div class="card">
                <h4>个性特点 (Personality Traits)</h4>
                <EditableTextarea :model-value="bio.personalityTraits" @update:model-value="v => update('personalityTraits', v)" :rows="3" />
              </div>
              <div class="card">
                <h4>理想 (Ideals)</h4>
                <EditableTextarea :model-value="bio.ideals" @update:model-value="v => update('ideals', v)" :rows="3" />
              </div>
              <div class="card">
                <h4>牵绊 (Bonds)</h4>
                <EditableTextarea :model-value="bio.bonds" @update:model-value="v => update('bonds', v)" :rows="3" />
              </div>
              <div class="card">
                <h4>缺点 (Flaws)</h4>
                <EditableTextarea :model-value="bio.flaws" @update:model-value="v => update('flaws', v)" :rows="3" />
              </div>
            </div>

            <hr class="divider">

            <div class="section">
              <h4>📖 角色背景故事 (Backstory)</h4>
              <EditableTextarea :model-value="bio.backstory" @update:model-value="v => update('backstory', v)" :rows="6" placeholder="书写你的传奇..." />
            </div>

            <div class="section row-split">
              <div class="half">
                <h4>🌟 特性与特质 (Features & Traits)</h4>
                <EditableTextarea :model-value="bio.featureText" @update:model-value="v => update('featureText', v)" :rows="5" placeholder="记录种族特性、专长或其他被动能力..." />
              </div>
              <div class="half">
                <h4>💰 财宝与笔记 (Treasure)</h4>
                <EditableTextarea :model-value="bio.treasureNotes" @update:model-value="v => update('treasureNotes', v)" :rows="5" placeholder="记录非物品类的财富，如地契、信件等..." />
              </div>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
/* 复用 ProficiencySettingsModal 的大部分样式，稍作调整 */
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.6); z-index: 1000;
  display: flex; justify-content: center; align-items: center;
}

.modal-content.bio-modal {
  background: white; 
  width: 800px; /* 比熟练项面板宽 */
  max-width: 95vw; 
  max-height: 90vh; /* 防止过高 */
  border-radius: 8px; 
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  display: flex; flex-direction: column;
}

.modal-header {
  padding: 15px 20px; background: #f8f9fa; border-bottom: 1px solid #eee;
  display: flex; justify-content: space-between; align-items: center;
  h3 { margin: 0; font-size: 1.1rem; color: #2c3e50; }
  .btn-close { border: none; background: none; font-size: 1.5rem; cursor: pointer; color: #999; &:hover{ color: #333; } }
}

.modal-body { 
  padding: 20px; 
  overflow-y: auto; /* 内容过多时滚动 */
  flex: 1;
  display: flex; flex-direction: column; gap: 20px;
}

/* 布局样式 */
.divider { border: 0; border-top: 1px dashed #eee; margin: 0; }

.section h4 { 
  margin: 0 0 8px 0; font-size: 0.85rem; color: #7f8c8d; text-transform: uppercase; letter-spacing: 0.5px; border-left: 3px solid #3498db; padding-left: 6px;
}

/* Appearance Grid */
.appearance-grid {
  display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;
  @media (max-width: 600px) { grid-template-columns: repeat(3, 1fr); }
  
  .field-box {
    display: flex; flex-direction: column; align-items: center;
    background: #fdfdfd; padding: 6px; border-radius: 4px; border: 1px solid #f1f3f5;
    label { font-size: 0.7rem; color: #999; margin-bottom: 4px; }
  }
}

/* Personality Grid */
.personality-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 15px;
  @media (max-width: 600px) { grid-template-columns: 1fr; }

  .card {
    background: #fff; border: 1px solid #eee; border-radius: 6px; padding: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  }
}

/* Row Split */
.row-split {
  display: flex; gap: 20px;
  .half { flex: 1; }
  @media (max-width: 600px) { flex-direction: column; }
}

/* Modal Animation */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>