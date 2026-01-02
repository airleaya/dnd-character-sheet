<script setup lang="ts">
import { ref, nextTick } from 'vue';

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
  rows?: number; // 默认行数
}>();

const emit = defineEmits(['update:modelValue', 'change']);

const isEditing = ref(false);
const inputRef = ref<HTMLTextAreaElement | null>(null);

const startEdit = () => {
  isEditing.value = true;
  nextTick(() => inputRef.value?.focus());
};

const finishEdit = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  isEditing.value = false;
  emit('update:modelValue', target.value);
  emit('change', target.value);
};
</script>

<template>
  <div class="editable-area-container">
    <textarea
      v-if="isEditing"
      ref="inputRef"
      :value="modelValue"
      :rows="rows || 3"
      @blur="finishEdit"
      class="edit-textarea"
    ></textarea>
    
    <div 
      v-else 
      class="display-text" 
      :class="{ 'empty': !modelValue }"
      @click="startEdit"
    >
      {{ modelValue || placeholder || '点击编辑...' }}
    </div>
  </div>
</template>

<style scoped>
.editable-area-container {
  width: 100%;
  cursor: text;
}

.display-text {
  white-space: pre-wrap; /* 保留换行符 */
  min-height: 2rem;
  padding: 8px;
  border: 1px dashed transparent;
  border-radius: 4px;
  transition: all 0.2s;
  color: #2c3e50;
  line-height: 1.5;
}

.display-text:hover {
  background-color: #f8f9fa;
  border-color: #bdc3c7;
}

.display-text.empty {
  color: #95a5a6;
  font-style: italic;
}

.edit-textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #3498db;
  border-radius: 4px;
  font-family: inherit;
  font-size: inherit;
  resize: vertical; /* 允许垂直拖拽调整高度 */
  outline: none;
  background: white;
  line-height: 1.5;
  display: block;
}
</style>