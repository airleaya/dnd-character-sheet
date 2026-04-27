<script setup lang="ts">
import { computed, ref } from 'vue';
import { useActiveSheetStore } from '../../../stores/activeSheet';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = useActiveSheetStore();
const newCustomExpertise = ref('');

const proficientSkills = computed(() => store.skills.filter((skill) => skill.profLevel));
const proficientTools = computed(() => store.character?.proficiencies.tools ?? []);

const addCustom = () => {
  store.addCustomExpertise(newCustomExpertise.value);
  newCustomExpertise.value = '';
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div class="modal-backdrop" v-if="isOpen" @click.self="emit('close')">
        <div class="modal-content">
          <div class="modal-header">
            <h3>✦ 专精</h3>
            <button class="btn-close" @click="emit('close')">×</button>
          </div>

          <div class="modal-body" v-if="store.character">
            <div class="section">
              <h4>已熟练技能</h4>
              <div v-if="proficientSkills.length" class="toggle-group">
                <button
                  v-for="skill in proficientSkills"
                  :key="skill.key"
                  class="btn-toggle"
                  :class="{ active: skill.expertise }"
                  @click="store.toggleSkillExpertise(skill.key)"
                >
                  <span>{{ skill.label }}</span>
                  <span v-if="skill.expertise" class="mark">专精</span>
                </button>
              </div>
              <div v-else class="empty-note">暂无已熟练技能</div>
            </div>

            <div class="section">
              <h4>已熟练工具</h4>
              <div v-if="proficientTools.length" class="toggle-group">
                <button
                  v-for="tool in proficientTools"
                  :key="tool"
                  class="btn-toggle"
                  :class="{ active: store.isToolExpertise(tool) }"
                  @click="store.toggleToolExpertise(tool)"
                >
                  <span>{{ tool }}</span>
                  <span v-if="store.isToolExpertise(tool)" class="mark">专精</span>
                </button>
              </div>
              <div v-else class="empty-note">暂无已熟练工具</div>
            </div>

            <hr class="divider" />

            <div class="section">
              <h4>自定义专精</h4>
              <div v-if="store.character.expertise.custom.length" class="tag-list">
                <span
                  v-for="(entry, index) in store.character.expertise.custom"
                  :key="`${entry}-${index}`"
                  class="tag custom"
                >
                  {{ entry }}
                  <span class="tag-remove" @click="store.removeExpertiseList('custom', index)">×</span>
                </span>
              </div>
              <div class="input-row">
                <input
                  v-model="newCustomExpertise"
                  placeholder="输入自定义专精..."
                  @keyup.enter="addCustom"
                />
                <button class="btn-add" @click="addCustom">+</button>
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
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  width: 520px;
  max-width: 92vw;
  max-height: 86vh;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #2c3e50;
  }

  .btn-close {
    border: none;
    background: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #999;

    &:hover {
      color: #333;
    }
  }
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.section h4 {
  margin: 0 0 10px;
  font-size: 0.9rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.toggle-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-toggle {
  border: 1px solid #d7dde3;
  background: #fff;
  color: #566573;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.86rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.18s;

  &:hover {
    border-color: #8e44ad;
    color: #4a235a;
  }

  &.active {
    background: #f4ecf7;
    color: #6c3483;
    border-color: #8e44ad;
    box-shadow: 0 2px 5px rgba(142, 68, 173, 0.18);
  }
}

.mark {
  font-size: 0.68rem;
  font-weight: 800;
  color: #8e44ad;
}

.empty-note {
  color: #95a5a6;
  font-size: 0.86rem;
  font-style: italic;
}

.divider {
  border: 0;
  border-top: 1px dashed #eee;
  margin: 0;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.tag {
  background: #f4ecf7;
  color: #6c3483;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tag-remove {
  cursor: pointer;
  font-weight: bold;
  color: #af7ac5;

  &:hover {
    color: #e74c3c;
  }
}

.input-row {
  display: flex;
  gap: 6px;

  input {
    flex: 1;
    padding: 7px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    outline: none;

    &:focus {
      border-color: #8e44ad;
    }
  }
}

.btn-add {
  background: #f1f3f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 34px;
  cursor: pointer;

  &:hover {
    background: #e9ecef;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
