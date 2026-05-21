<script setup lang="ts">
import { ref, computed } from 'vue';
import { useActiveSheetStore } from '../../../stores/activeSheet';
import { 
  ARMOR_PROFICIENCIES, 
  WEAPON_PROFICIENCIES, 
  TOOL_PROFICIENCIES,
  COMMON_LANGUAGES 
} from '../../../data/rules/proficiencies';
import { WEAPON_LIBRARY } from '../../../data/libraries/weapons';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();
const store = useActiveSheetStore();

const newTool = ref('');
const newLang = ref('');
const newWeaponKey = ref('');

// 安全访问辅助函数
const hasArmor = (key: string) => store.character?.proficiencies?.armor?.includes(key);
const hasWeapon = (key: string) => store.character?.proficiencies?.weapons?.includes(key);

// 计算属性：获取当前已选的“特定武器” (排除 simple/martial)
const specificWeaponProficiencies = computed(() => {
  const list = store.character?.proficiencies?.weapons || [];
  const categories = ['simple', 'martial'];
  return list.filter(k => !categories.includes(k));
});

// 辅助：获取武器显示名称
const getWeaponName = (key: string) => {
  const def = WEAPON_LIBRARY.find(w => w.id === key);
  return def ? def.name : key;
};

// 动作：添加特定武器
const addSpecificWeapon = () => {
  if (newWeaponKey.value) {
    store.toggleProficiency('weapons', newWeaponKey.value);
    newWeaponKey.value = '';
  }
};

// 动作：移除特定武器
const removeSpecificWeapon = (key: string) => {
  store.toggleProficiency('weapons', key);
};

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

//武器下拉选单变更
const onWeaponPresetChange = (e: Event) => {
  const val = (e.target as HTMLSelectElement).value;
  if (val) newWeaponKey.value = val;
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
              
              <h4 style="margin-top: 15px;">特定武器熟练</h4>
              <div class="tag-list" v-if="specificWeaponProficiencies.length > 0">
                <span 
                  v-for="key in specificWeaponProficiencies" :key="key" 
                  class="tag"
                >
                  {{ getWeaponName(key) }}
                  <span class="tag-remove" @click="removeSpecificWeapon(key)">×</span>
                </span>
              </div>
              <div class="input-row">
                <select class="select-preset full-width" @change="onWeaponPresetChange" :value="newWeaponKey">
                  <option value="">-- 添加特定武器 --</option>
                  <option 
                    v-for="w in WEAPON_LIBRARY" 
                    :key="w.id" 
                    :value="w.id"
                    :disabled="hasWeapon(w.id)"
                  >
                    {{ w.name }}
                  </option>
                </select>
                <button class="btn-add" @click="addSpecificWeapon" :disabled="!newWeaponKey">+</button>
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
                  :class="{ expertise: store.isToolExpertise(t) }"
                >
                  {{ t }}
                  <span v-if="store.isToolExpertise(t)" class="expertise-mark">专精</span>
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
  background: var(--color-character-settings-backdrop-bg); /* 纯色半透明，修复卡顿 */
  z-index: 1000;
  display: flex; justify-content: center; align-items: center;
}

.modal-content {
  background: var(--color-character-settings-panel-bg); width: 450px;
  max-width: 90vw; border-radius: 8px; box-shadow: 0 10px 25px var(--color-character-settings-shadow);
  display: flex; flex-direction: column; overflow: hidden; animation: slideUp 0.3s ease-out;
}

.modal-header {
  padding: 15px 20px; background: var(--color-character-settings-header-bg); border-bottom: 1px solid var(--color-character-settings-header-border);
  display: flex; justify-content: space-between; align-items: center;
  h3 { margin: 0; font-size: 1.1rem; color: var(--color-character-settings-title); }
  .btn-close { border: var(--color-character-settings-close-border); background: var(--color-character-settings-close-bg); font-size: 1.5rem; cursor: pointer; color: var(--color-character-settings-close-text); &:hover{ color: var(--color-character-settings-close-hover-text); } }
}

.modal-body { padding: 20px; display: flex; flex-direction: column; gap: 20px; }

.section { h4 { margin: 0 0 10px 0; font-size: 0.9rem; color: var(--color-character-settings-section-title); text-transform: uppercase; letter-spacing: 0.5px; } }

.toggle-group {
  display: flex; gap: 8px; flex-wrap: wrap;
  .btn-toggle {
    border: 1px solid var(--color-character-settings-toggle-border); background: var(--color-character-settings-toggle-bg); color: var(--color-character-settings-toggle-text);
    padding: 6px 12px; border-radius: 20px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s;
    &:hover { border-color: var(--color-character-settings-toggle-hover-border); }
    &.active { background: var(--color-character-settings-primary-active-bg); color: var(--color-character-settings-primary-active-text); border-color: var(--color-character-settings-primary-active-border); box-shadow: 0 2px 5px var(--color-character-settings-primary-shadow); }
  }
}

.divider { border: 0; border-top: 1px dashed var(--color-character-settings-divider); margin: 0; }

.tag-list {
  display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;
  .tag {
    background: var(--color-character-settings-tag-bg); color: var(--color-character-settings-tag-text); padding: 4px 10px; border-radius: 4px; font-size: 0.9rem;
    display: flex; align-items: center; gap: 6px;
    &.lang { background: var(--color-character-settings-lang-bg); color: var(--color-character-settings-lang-text); }
    &.expertise {
      background: var(--color-character-settings-expertise-bg);
      color: var(--color-character-settings-expertise-text);
      border: 1px solid var(--color-character-settings-expertise-border);
      font-weight: 700;
    }
    .expertise-mark { font-size: 0.68rem; color: var(--color-character-settings-expertise-mark); font-weight: 900; }
    .tag-remove { cursor: pointer; font-weight: bold; color: var(--color-character-settings-tag-remove); &:hover{ color: var(--color-character-settings-tag-remove-hover); } }
  }
}

.input-row {
  display: flex; gap: 6px;
  .select-preset {
    max-width: 140px;
    border: 1px solid var(--color-character-settings-field-border); border-radius: 4px; font-size: 0.85rem; color: var(--color-character-settings-field-text);
    outline: none;
    cursor: pointer;
    //支持全宽模式
    &.full-width {
      flex: 1;
      max-width: none;
    }
  }
  input { flex: 1; padding: 6px 10px; border: 1px solid var(--color-character-settings-field-border); border-radius: 4px; outline: none; &:focus { border-color: var(--color-character-settings-field-focus); } }
  .btn-add { background: var(--color-character-settings-add-bg); border: 1px solid var(--color-character-settings-field-border); border-radius: 4px; width: 32px; cursor: pointer; &:hover { background: var(--color-character-settings-add-hover-bg); } }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
