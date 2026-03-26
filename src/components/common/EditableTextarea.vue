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


// 用于记录切换瞬间的临时高度，防止高度塌陷导致滚动条跳动
const tempMinHeight = ref<string>('auto');

// 计算并调整 textarea 的高度以完全包裹内容
const adjustHeight = (target: HTMLTextAreaElement) => {
  // 必须先重置为 auto，否则在删除文字时 scrollHeight 不会随之减小
  target.style.height = 'auto';
  // 赋值为实际内容的高度
  target.style.height = `${target.scrollHeight}px`;
};

// 接收点击事件，在切换状态前锁定高度
const startEdit = (e: MouseEvent) => {
  // 1. 获取当前展示框的实际高度，锁定外层容器，防止 DOM 卸载瞬间高度变为 0
  const target = e.currentTarget as HTMLElement;
  if (target) {
    tempMinHeight.value = `${target.offsetHeight}px`;
  }
  
  isEditing.value = true;
  
  nextTick(() => {
    if (inputRef.value) {
      adjustHeight(inputRef.value);
      inputRef.value.focus({ preventScroll: true });
      
      // 2. textarea 渲染完成并撑开了真实高度后，解除外层容器的高度锁定
      tempMinHeight.value = 'auto';
    }
  });
};

const finishEdit = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  isEditing.value = false;
  emit('update:modelValue', target.value);
  emit('change', target.value);
};
</script>

<template>
  <div class="editable-area-container" :style="{ minHeight: tempMinHeight }">
    <textarea
      v-if="isEditing"
      ref="inputRef"
      :value="modelValue"
      :rows="rows || 3"
      @blur="finishEdit"
      @input="(e) => adjustHeight(e.target as HTMLTextAreaElement)"
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
  /*resize: vertical; */
  resize: none; 
  overflow: hidden;
  outline: none;
  background: white;
  line-height: 1.5;
  display: block;
}
</style>