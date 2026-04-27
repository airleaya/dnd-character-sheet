<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  getTooltipViewportPosition,
  useTooltipStore,
} from '../../stores/tooltip';

const store = useTooltipStore();
const tooltipRef = ref<HTMLElement | null>(null);
const tooltipSize = ref({ width: 320, height: 0 });

const measureTooltip = () => {
  const rect = tooltipRef.value?.getBoundingClientRect();
  if (!rect) return;

  tooltipSize.value = {
    width: rect.width || 320,
    height: rect.height || 0,
  };
};

watch(
  () => [store.visible, store.data.title, store.data.content, store.data.sections?.length ?? 0],
  async ([visible]) => {
    if (!visible) return;
    await nextTick();
    measureTooltip();
  },
  { flush: 'post' }
);

const onWindowResize = () => {
  if (!store.visible) return;
  measureTooltip();
};

onMounted(() => {
  window.addEventListener('resize', onWindowResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize);
});

const tooltipStyle = computed(() => {
  if (typeof window === 'undefined') {
    return {
      top: `${store.y + 15}px`,
      left: `${store.x + 15}px`,
    };
  }

  const position = getTooltipViewportPosition({
    x: store.x,
    y: store.y,
    tooltipWidth: tooltipSize.value.width,
    tooltipHeight: tooltipSize.value.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  });

  return {
    top: `${position.top}px`,
    left: `${position.left}px`,
  };
});
</script>

<template>
  <div
    v-if="store.visible"
    ref="tooltipRef"
    class="global-tooltip"
    :style="tooltipStyle"
  >
    <div v-if="store.data.title" class="tooltip-title">{{ store.data.title }}</div>
    <div v-if="store.data.content" class="tooltip-content">{{ store.data.content }}</div>

    <div v-if="store.data.sections?.length" class="tooltip-sections">
      <section
        v-for="(section, index) in store.data.sections"
        :key="`${section.label || 'section'}-${index}`"
        class="tooltip-section"
      >
        <div v-if="section.label" class="section-label">{{ section.label }}</div>
        <ul class="section-list">
          <li v-for="item in section.items" :key="item" class="section-item">{{ item }}</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.global-tooltip {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  background: rgba(44, 62, 80, 0.95);
  color: #ecf0f1;
  border: 1px solid #34495e;
  border-radius: 4px;
  padding: 8px 12px;
  max-width: 320px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  font-size: 0.85rem;
  line-height: 1.4;
  backdrop-filter: blur(2px);
}

.tooltip-title {
  font-weight: bold;
  font-size: 0.95rem;
  color: #f1c40f;
  margin-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 2px;
}

.tooltip-sections {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tooltip-content + .tooltip-sections {
  margin-top: 8px;
}

.tooltip-section {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.section-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(241, 196, 15, 0.9);
}

.section-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.section-item {
  color: #ecf0f1;
}
</style>
