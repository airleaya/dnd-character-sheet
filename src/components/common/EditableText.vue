<script setup lang="ts">
import { ref, nextTick } from 'vue';

const props = defineProps<{
  modelValue: string | number; // 接收绑定的值
  width?: string; // 可选：控制宽度
}>();

const emit = defineEmits(['update:modelValue', 'change']);

const isEditing = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

const startEdit = () => {
  isEditing.value = true;
  // 等待 DOM 更新后让输入框自动聚焦
  nextTick(() => inputRef.value?.focus());
};

const finishEdit = (e: Event) => {
  const target = e.target as HTMLInputElement;
  isEditing.value = false;
  // 通知父组件更新数据
  emit('update:modelValue', target.value); 
  emit('change', target.value);
};
</script>

<template>
  <div class="editable-container" :style="{ width: width || 'auto' }">
    <input 
      v-if="isEditing"
      ref="inputRef"
      :value="modelValue"
      @blur="finishEdit"
      @keydown.enter="finishEdit"
      class="edit-input"
    />
    <span 
      v-else 
      class="display-text" 
      @click="startEdit"
    >
      {{ modelValue || '---' }}
    </span>
  </div>
</template>

<style scoped>
.editable-container {
  display: inline-block;
  border-bottom: 1px dashed #bdc3c7; /* 虚线底边提示可编辑 */
  cursor: text;
  min-width: 30px;
  text-align: center;
}
.editable-container:hover {
  background-color: #eef2f3;
}
.edit-input {
  width: 100%;
  border: none;
  outline: 2px solid #3498db;
  font-family: inherit;
  font-size: inherit;
  text-align: inherit;
  background: white;
}
</style>