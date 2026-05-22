<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { useUiFeedbackStore } from '../../stores/uiFeedback';

const feedback = useUiFeedbackStore();

const dialogToneLabel = computed(() => {
  switch (feedback.dialog?.tone) {
    case 'danger':
      return '危险操作';
    case 'warning':
      return '请确认';
    case 'success':
      return '操作完成';
    default:
      return '提示';
  }
});

const toastToneIcon = computed(() => {
  switch (feedback.toast?.tone) {
    case 'success':
      return '✓';
    case 'warning':
      return '!';
    case 'danger':
      return '×';
    default:
      return 'i';
  }
});

const handleKeydown = (event: KeyboardEvent) => {
  if (!feedback.dialog) return;

  if (event.key === 'Escape') {
    feedback.resolveDialog(false);
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="feedback-fade">
      <div v-if="feedback.dialog" class="feedback-overlay" @click.self="feedback.resolveDialog(false)">
        <div class="feedback-dialog" :class="`tone-${feedback.dialog.tone}`" role="dialog" aria-modal="true">
          <div class="dialog-accent"></div>
          <div class="dialog-body">
            <div class="dialog-kicker">{{ dialogToneLabel }}</div>
            <h3 class="dialog-title">{{ feedback.dialog.title }}</h3>
            <p class="dialog-message">{{ feedback.dialog.message }}</p>
            <div class="dialog-actions">
              <button
                v-if="feedback.dialog.showCancel"
                class="btn-secondary"
                @click="feedback.resolveDialog(false)"
              >
                {{ feedback.dialog.cancelText }}
              </button>
              <button class="btn-primary" :class="`tone-${feedback.dialog.tone}`" @click="feedback.resolveDialog(true)">
                {{ feedback.dialog.confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="toast-pop">
      <div v-if="feedback.toast" class="feedback-toast" :class="`tone-${feedback.toast.tone}`">
        <span class="toast-icon">{{ toastToneIcon }}</span>
        <span class="toast-message">{{ feedback.toast.message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.feedback-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-overlay);
  backdrop-filter: blur(6px);
}

.feedback-dialog {
  width: min(460px, calc(100vw - 32px));
  background: var(--color-surface-dialog);
  color: var(--color-text-dialog);
  border-radius: 18px;
  box-shadow: 0 24px 60px var(--color-shadow-modal);
  overflow: hidden;
  border: 1px solid var(--color-border-dialog);
}

.dialog-accent {
  height: 8px;
  background: var(--color-feedback-accent-info);
}

.feedback-dialog.tone-danger .dialog-accent {
  background: var(--color-feedback-accent-danger);
}

.feedback-dialog.tone-warning .dialog-accent {
  background: var(--color-feedback-accent-warning);
}

.feedback-dialog.tone-success .dialog-accent {
  background: var(--color-feedback-accent-success);
}

.dialog-body {
  padding: 22px 24px 20px;
}

.dialog-kicker {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-dialog-muted);
}

.dialog-title {
  margin: 8px 0 10px;
  font-size: 1.3rem;
  line-height: 1.2;
}

.dialog-message {
  margin: 0;
  white-space: pre-line;
  line-height: 1.55;
  color: var(--color-text-dialog-message);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.dialog-actions button {
  border: none;
  border-radius: 999px;
  padding: 10px 18px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, filter 0.15s ease;
}

.dialog-actions button:hover {
  filter: brightness(1.03);
}

.dialog-actions button:active {
  transform: translateY(1px);
}

.btn-secondary {
  background: var(--color-feedback-secondary-bg);
  color: var(--color-feedback-secondary-text);
}

.btn-primary {
  background: var(--color-feedback-primary-bg);
  color: var(--color-feedback-primary-text);
}

.btn-primary.tone-warning {
  background: var(--color-feedback-warning-bg);
}

.btn-primary.tone-danger {
  background: var(--color-feedback-danger-bg);
}

.btn-primary.tone-success {
  background: var(--color-feedback-success-bg);
}

.feedback-toast {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 3100;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: min(360px, calc(100vw - 32px));
  padding: 12px 16px;
  border-radius: 14px;
  color: var(--color-feedback-primary-text);
  box-shadow: 0 18px 36px var(--color-shadow-elevated);
  background: var(--color-feedback-primary-bg);
}

.feedback-toast.tone-success {
  background: var(--color-feedback-toast-success-bg);
}

.feedback-toast.tone-warning {
  background: var(--color-feedback-toast-warning-bg);
}

.feedback-toast.tone-danger {
  background: var(--color-feedback-toast-danger-bg);
}

.toast-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-feedback-toast-icon-bg);
  font-weight: 700;
}

.toast-message {
  line-height: 1.4;
}

.feedback-fade-enter-active,
.feedback-fade-leave-active,
.toast-pop-enter-active,
.toast-pop-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.feedback-fade-enter-from,
.feedback-fade-leave-to,
.toast-pop-enter-from,
.toast-pop-leave-to {
  opacity: 0;
}

.feedback-fade-enter-from .feedback-dialog,
.feedback-fade-leave-to .feedback-dialog {
  transform: translateY(10px) scale(0.98);
}

.toast-pop-enter-from,
.toast-pop-leave-to {
  transform: translateY(10px);
}
</style>
