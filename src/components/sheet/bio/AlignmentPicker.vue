<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ALIGNMENT_DICT } from '../../../data/rules/alignment';

const props = defineProps<{
  modelValue?: number; // 接收1-9的数字，或undefined
}>();

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const pickerRef = ref<HTMLElement | null>(null);

// 计算当前应显示的文本
const currentText = computed(() => {
  if (!props.modelValue || !ALIGNMENT_DICT[props.modelValue]) {
    return '选择阵营';
  }
  return ALIGNMENT_DICT[props.modelValue];
});

// 处理用户选择
const selectAlignment = (id: number) => {
  emit('update:modelValue', id);
  isOpen.value = false; // 选择后自动关闭
};

// 切换浮窗状态
const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};

// 处理点击外部关闭浮窗
const handleClickOutside = (event: MouseEvent) => {
  if (isOpen.value && pickerRef.value && !pickerRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  // 延迟绑定，避免组件刚挂载时的点击事件直接触发关闭
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside);
  }, 0);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="alignment-picker-wrapper" ref="pickerRef">
    
    <button class="alignment-trigger" @click="toggleOpen" :title="currentText">
      {{ currentText }}
    </button>

    <Transition name="fade">
      <div v-if="isOpen" class="alignment-popover">
        <div class="alignment-grid">
          <div 
            v-for="(label, id) in ALIGNMENT_DICT" 
            :key="id"
            class="grid-item"
            :class="{ active: props.modelValue === Number(id) }"
            @click="selectAlignment(Number(id))"
          >
            {{ label }}
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped lang="scss">
.alignment-picker-wrapper {
  position: relative;
  display: inline-block;
}

/* 触发按钮样式：小号圆角矩阵，风格同右侧工具栏 */
.alignment-trigger {
  height: 26px; /* 比右侧按钮的 34px 更小 */
  padding: 0 10px;
  background: #ecf0f1;
  color: #2c3e50;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem; /* 更小的字号 */
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.15);
    filter: brightness(0.98); /* 稍微变暗一点点反馈悬停 */
  }
}

/* 浮窗样式：相对触发按钮定位 */
.alignment-popover {
  position: absolute;
  top: calc(100% + 8px); /* 位于按钮正下方，向下偏移 8px */
  left: 0;
  background: #ffffff;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  z-index: 100;
  width: 260px; /* 固定宽度确保 3x3 布局完美呈现 */
  border: 1px solid #ecf0f1;
}

/* 3x3 网格布局 */
.alignment-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px; /* 减小格子间距 */
}

/* 单个阵营格子样式 */
.grid-item {
  padding: 8px 4px;
  text-align: center;
  background-color: #f8f9fa;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem; /* 统一小字号 */
  color: #7f8c8d;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    background-color: #ecf0f1;
    color: #2c3e50;
  }

  /* 选中状态：使用主色调高亮 */
  &.active {
    background-color: #e8f4fd;
    border-color: #3498db;
    color: #2980b9;
    font-weight: bold;
    box-shadow: inset 0 0 0 1px rgba(52, 152, 219, 0.2);
  }
}

/* 浮窗出现的简单淡入动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>