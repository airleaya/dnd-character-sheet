<script setup lang="ts">
import { ref, nextTick, watch, onBeforeUnmount } from 'vue';

const props = defineProps<{
  modelValue: string | number; // 接收绑定的值
  width?: string; // 可选：控制宽度
}>();

const emit = defineEmits(['update:modelValue', 'change']);

const isEditing = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

// 用于判断点击是否发生在组件外部
const containerRef = ref<HTMLElement | null>(null);

// 本地编辑缓存，防止输入时受外部数据更新干扰
const editValue = ref<string | number>('');
// 保存锁，防止 @blur 和 Enter 键同时触发导致的重复提交
const isSaving = ref(false);

const startEdit = () => {
  // 防御：如果已经是编辑状态，不做任何操作
  if (isEditing.value) return;
  
  // 进入编辑时，将外部 Props 拷贝到本地缓存
  editValue.value = props.modelValue;
  
  isEditing.value = true;
  // 等待 DOM 更新后让输入框自动聚焦
  nextTick(() => inputRef.value?.focus());
};

const finishEdit = () => {
  if (isSaving.value || !isEditing.value) return;
  isSaving.value = true;
  
  isEditing.value = false;
  emit('update:modelValue', editValue.value); 
  emit('change', editValue.value);
  
  isSaving.value = false;
};

// 手动接管失去焦点的逻辑，绕过拖拽库的拦截
const handleClickOutside = (e: MouseEvent) => {
  if (isEditing.value && containerRef.value && !containerRef.value.contains(e.target as Node)) {
    finishEdit();
  }
};

// 动态绑定/解绑全局点击事件，避免性能浪费
watch(isEditing, (newVal) => {
  if (newVal) {
    // 延迟挂载，防止触发开启的那次点击立刻把它关掉
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);
  } else {
    document.removeEventListener('mousedown', handleClickOutside);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<template>
  <div 
    ref="containerRef"
    class="editable-container" 
    :style="{ width: width || 'auto' }"
    @click.stop="startEdit"
    @mousedown.stop
  >
    <input 
      v-if="isEditing"
      ref="inputRef"
      v-model="editValue"
      @blur="finishEdit"
      @keydown.enter="finishEdit"
      class="edit-input"
    />
    <span 
      v-else 
      class="display-text" 
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