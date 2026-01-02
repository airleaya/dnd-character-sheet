<script setup lang="ts">
import { ref } from 'vue';
import { useActiveSheetStore } from '../../stores/activeSheet';
import { 
  ARMOR_PROFICIENCIES, 
  WEAPON_PROFICIENCIES, 
  TOOL_PROFICIENCIES,
  COMMON_LANGUAGES 
} from '../../data/rules/proficiencies';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close']);
const store = useActiveSheetStore();

const newTool = ref('');
const newLang = ref('');

// 安全访问辅助函数
const hasArmor = (key: string) => store.character?.proficiencies?.armor?.includes(key);
const hasWeapon = (key: string) => store.character?.proficiencies?.weapons?.includes(key);

const toggleArmor = (key: string) => store.toggleProficiency('armor', key);
const toggleWeapon = (key: string) => store.toggleProficiency('weapons', key);

const addTool = () => {
  if (newTool.value) {
    store.addProficiencyList('tools', newTool.value);
    newTool.value = '';
  }
};
const removeTool = (idx: number) => store.removeProficiencyList('tools', idx);

const addLang = () => {
  if (newLang.value) {
    store.addProficiencyList('languages', newLang.value);
    newLang.value = '';
  }
};
const removeLang = (idx: number) => store.removeProficiencyList('languages', idx);

// ✅ 修复：改为专用处理函数，避免模板中 Ref 解包导致的 Crash
const onToolPresetChange = (e: Event) => {
  const val = (e.target as HTMLSelectElement).value;
  if (val) newTool.value = val;
};

const onLangPresetChange = (e: Event) => {
  const val = (e.target as HTMLSelectElement).value;
  if (val) newLang.value = val;
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div class="modal-backdrop" v-if="isOpen" @click.self="emit('close')">
        <div class="modal-content">
          <div class="modal-header">
            <h3>⚙️ 熟练项与语言</h3>
            <button class="btn-close" @click="emit('close')">×</button>
          </div>

          <div class="modal-body" v-if="store.character && store.character.proficiencies">
            
            <div class="section">
              <h4>护甲熟练</h4>
              <div class="toggle-group">
                <button 
                  v-for="item in ARMOR_PROFICIENCIES" :key="item.key"
                  class="btn-toggle"
                  :class="{ active: hasArmor(item.key) }"
                  @click="toggleArmor(item.key)"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>

            <div class="section">
              <h4>武器熟练</h4>
              <div class="toggle-group">
                <button 
                  v-for="item in WEAPON_PROFICIENCIES" :key="item.key"
                  class="btn-toggle"
                  :class="{ active: hasWeapon(item.key) }"
                  @click="toggleWeapon(item.key)"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>

            <hr class="divider" />

            <div class="section">
              <h4>语言</h4>
              <div class="tag-list">
                <span 
                  v-for="(l, idx) in store.character.proficiencies?.languages" :key="idx" 
                  class="tag lang"
                >
                  {{ l }}
                  <span class="tag-remove" @click="removeLang(idx)">×</span>
                </span>
              </div>
              <div class="input-row">
                <select class="select-preset" @change="onLangPresetChange">
                  <option value="">-- 选择语言 --</option>
                  <option v-for="l in COMMON_LANGUAGES" :key="l" :value="l">{{ l }}</option>
                </select>

                <input 
                  v-model="newLang" 
                  placeholder="或输入自定义..." 
                  @keyup.enter="addLang"
                />
                <button class="btn-add" @click="addLang">+</button>
              </div>
            </div>

            <div class="section">
              <h4>工具</h4>
              <div class="tag-list">
                <span 
                  v-for="(t, idx) in store.character.proficiencies?.tools" :key="idx" 
                  class="tag"
                >
                  {{ t }}
                  <span class="tag-remove" @click="removeTool(idx)">×</span>
                </span>
              </div>
              <div class="input-row">
                <select class="select-preset" @change="onToolPresetChange">
                  <option value="">-- 选择标准工具 --</option>
                  <option v-for="t in TOOL_PROFICIENCIES" :key="t" :value="t">{{ t }}</option>
                </select>

                <input 
                  v-model="newTool" 
                  placeholder="或输入自定义..." 
                  @keyup.enter="addTool"
                />
                <button class="btn-add" @click="addTool">+</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.6); /* 纯色半透明，修复卡顿 */
  z-index: 1000;
  display: flex; justify-content: center; align-items: center;
}

.modal-content {
  background: white; width: 450px;
  max-width: 90vw; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  display: flex; flex-direction: column; overflow: hidden; animation: slideUp 0.3s ease-out;
}

.modal-header {
  padding: 15px 20px; background: #f8f9fa; border-bottom: 1px solid #eee;
  display: flex; justify-content: space-between; align-items: center;
  h3 { margin: 0; font-size: 1.1rem; color: #2c3e50; }
  .btn-close { border: none; background: none; font-size: 1.5rem; cursor: pointer; color: #999; &:hover{ color: #333; } }
}

.modal-body { padding: 20px; display: flex; flex-direction: column; gap: 20px; }

.section { h4 { margin: 0 0 10px 0; font-size: 0.9rem; color: #7f8c8d; text-transform: uppercase; letter-spacing: 0.5px; } }

.toggle-group {
  display: flex; gap: 8px; flex-wrap: wrap;
  .btn-toggle {
    border: 1px solid #ddd; background: #fff; color: #666;
    padding: 6px 12px; border-radius: 20px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s;
    &:hover { border-color: #bbb; }
    &.active { background: #3498db; color: white; border-color: #2980b9; box-shadow: 0 2px 5px rgba(52, 152, 219, 0.3); }
  }
}

.divider { border: 0; border-top: 1px dashed #eee; margin: 0; }

.tag-list {
  display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;
  .tag {
    background: #f1f3f5; color: #333; padding: 4px 10px; border-radius: 4px; font-size: 0.9rem;
    display: flex; align-items: center; gap: 6px;
    &.lang { background: #e8f5e9; color: #2e7d32; }
    .tag-remove { cursor: pointer; font-weight: bold; color: #adb5bd; &:hover{ color: #e74c3c; } }
  }
}

.input-row {
  display: flex; gap: 6px;
  .select-preset {
    max-width: 140px;
    border: 1px solid #ddd; border-radius: 4px; font-size: 0.85rem; color: #555;
    outline: none;
    cursor: pointer;
  }
  input { flex: 1; padding: 6px 10px; border: 1px solid #ddd; border-radius: 4px; outline: none; &:focus { border-color: #3498db; } }
  .btn-add { background: #f1f3f5; border: 1px solid #ddd; border-radius: 4px; width: 32px; cursor: pointer; &:hover { background: #e9ecef; } }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>