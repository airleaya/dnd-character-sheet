<script setup lang="ts">
import { ref, provide } from 'vue'; // 👈 记得引入 computed
import SpellbookLeftPanel from './SpellbookLeftPanel.vue';
import SpellbookRightPanel from './SpellbookRightPanel.vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close']);

// ==========================================
// 交互反馈系统 (Toast) - 保持在父组件以覆盖全局
// ==========================================
const toast = ref({ show: false, message: '', type: 'success' }); // type: 'success' | 'warning'
let toastTimer: any = null;

const showToast = (msg: string, type: 'success' | 'warning' = 'success') => {
  toast.value = { show: true, message: msg, type };
  
  // 清除旧定时器
  if (toastTimer) clearTimeout(toastTimer);
  
  // 1.5秒后自动消失
  toastTimer = setTimeout(() => {
    toast.value.show = false;
  }, 1500);
};

provide('showToast', showToast);

</script>

<template>
  
  <Teleport to="body">
    <div 
      class="spellbook-overlay" 
      v-if="isOpen" 
      @click.self="$emit('close')"
    >
      <div class="book-frame">
        <Transition name="fade-slide">
          <div v-if="toast.show" class="book-toast" :class="toast.type">
            <span class="toast-icon">{{ toast.type === 'success' ? '✨' : '⚠️' }}</span>
            {{ toast.message }}
          </div>
        </Transition>
        <div class="book-spine"></div>
        
        <div class="book-layout">
          <div class="layout-left">
            <SpellbookLeftPanel @close="$emit('close')" />
          </div>
          
          <div class="layout-right">
            <SpellbookRightPanel />
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
// ==========================================
// 1. 保留：全局遮罩与弹窗基底
// ==========================================
.spellbook-overlay {
  position: fixed; 
  top: 0; 
  left: 0; 
  width: calc(100vw - 320px); 
  height: 100vh;
  background: rgba(0, 0, 0, 0.75); 
  z-index: 2000;
  display: flex; 
  justify-content: center; 
  align-items: center;
}

.book-frame {
  width: 90%; 
  max-width: 1200px; /* [MODIFY] 稍微加宽一点以适应左右分栏 */
  height: 90vh;
  background: transparent; /* [MODIFY] 背景色交给内部的 layout */
  border-radius: 8px;
  display: flex; 
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  overflow: hidden;
  position: relative;
}

// ==========================================
// 2. 新增：左右分栏布局系统
// ==========================================
.book-layout {
  flex: 1;
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #fdfbf7;
  color: #3d3d3d; 
  font-family: 'Georgia', serif;
}

.layout-left {
  width: 320px;
  min-width: 320px;
  border-right: 2px solid #dcd6cb;
  background: #f4f1ea;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 2px 0 10px rgba(0,0,0,0.05); /* 左侧向右的细微阴影，增加立体感 */
}

.layout-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fdfbf7;
}

// ==========================================
// 3. 保留：Toast 提示组件样式
// ==========================================
.book-toast {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 30px;
  background: rgba(44, 62, 80, 0.95);
  color: #fff;
  font-size: 0.9rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 200; /* 在书页内容之上 */
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  pointer-events: none; /* 让鼠标穿透，不影响操作 */

  &.success { border: 1px solid #27ae60; color: #e8f8f5; }
  &.warning { border: 1px solid #e67e22; color: #fef5e7; background: rgba(160, 64, 0, 0.9); }
}

// ==========================================
// 4. 保留：Vue Transition 动画
// ==========================================
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>