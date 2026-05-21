<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ALIGNMENT_DICT } from '../../../data/rules/alignment';

const props = defineProps<{
  modelValue?: string | number; // 接收1-9的数字、字符串数字，或 undefined
}>();

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const pickerRef = ref<HTMLElement | null>(null);

// 计算当前应显示的文本
const currentText = computed(() => {
  const alignmentId = Number(props.modelValue);
  if (!alignmentId || !ALIGNMENT_DICT[alignmentId]) {
    return '选择阵营';
  }
  return ALIGNMENT_DICT[alignmentId];
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
            :class="{ active: Number(props.modelValue) === Number(id) }"
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
  background: var(--color-character-alignment-trigger-bg);
  color: var(--color-character-alignment-trigger-text);
  border: none;
  border-radius: 6px;
  font-size: 0.75rem; /* 更小的字号 */
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px var(--color-character-tool-shadow);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 5px var(--color-character-tool-hover-shadow);
    filter: brightness(0.98); /* 稍微变暗一点点反馈悬停 */
  }
}

/* 浮窗样式：相对触发按钮定位 */
.alignment-popover {
  position: absolute;
  top: calc(100% + 8px); /* 位于按钮正下方，向下偏移 8px */
  left: 0;
  background: var(--color-character-alignment-popover-bg);
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 16px var(--color-character-alignment-shadow);
  z-index: 100;
  width: 260px; /* 固定宽度确保 3x3 布局完美呈现 */
  border: 1px solid var(--color-character-alignment-popover-border);
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
  background-color: var(--color-character-alignment-option-bg);
  border: 1px solid var(--color-character-alignment-option-border);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem; /* 统一小字号 */
  color: var(--color-character-alignment-option-text);
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    background-color: var(--color-character-alignment-option-hover-bg);
    color: var(--color-character-alignment-option-hover-text);
  }

  /* 选中状态：使用主色调高亮 */
  &.active {
    background-color: var(--color-character-alignment-active-bg);
    border-color: var(--color-character-alignment-active-border);
    color: var(--color-character-alignment-active-text);
    font-weight: bold;
    box-shadow: inset 0 0 0 1px var(--color-character-alignment-active-shadow);
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
