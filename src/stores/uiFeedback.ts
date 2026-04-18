import { defineStore } from 'pinia';
import { ref } from 'vue';

export type FeedbackTone = 'info' | 'success' | 'warning' | 'danger';

type ToastState = {
  id: number;
  message: string;
  tone: FeedbackTone;
};

type DialogState = {
  title: string;
  message: string;
  tone: FeedbackTone;
  confirmText: string;
  cancelText: string;
  showCancel: boolean;
};

type ConfirmOptions = {
  title?: string;
  message: string;
  tone?: FeedbackTone;
  confirmText?: string;
  cancelText?: string;
};

type AlertOptions = {
  title?: string;
  message: string;
  tone?: FeedbackTone;
  confirmText?: string;
};

let toastTimer: ReturnType<typeof setTimeout> | null = null;
let dialogResolver: ((value: boolean) => void) | null = null;
let toastId = 0;

export const useUiFeedbackStore = defineStore('uiFeedback', () => {
  const toast = ref<ToastState | null>(null);
  const dialog = ref<DialogState | null>(null);

  const dismissToast = () => {
    toast.value = null;
    if (toastTimer) {
      clearTimeout(toastTimer);
      toastTimer = null;
    }
  };

  const showToast = (message: string, tone: FeedbackTone = 'info', duration = 2200) => {
    toastId += 1;
    toast.value = { id: toastId, message, tone };

    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    toastTimer = setTimeout(() => {
      dismissToast();
    }, duration);
  };

  const resolveDialog = (value: boolean) => {
    const resolver = dialogResolver;
    dialogResolver = null;
    dialog.value = null;
    resolver?.(value);
  };

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    if (dialogResolver) {
      resolveDialog(false);
    }

    dialog.value = {
      title: options.title ?? '请确认操作',
      message: options.message,
      tone: options.tone ?? 'warning',
      confirmText: options.confirmText ?? '确认',
      cancelText: options.cancelText ?? '取消',
      showCancel: true,
    };

    return new Promise<boolean>(resolve => {
      dialogResolver = resolve;
    });
  };

  const alert = async (options: AlertOptions): Promise<void> => {
    if (dialogResolver) {
      resolveDialog(false);
    }

    dialog.value = {
      title: options.title ?? '提示',
      message: options.message,
      tone: options.tone ?? 'info',
      confirmText: options.confirmText ?? '知道了',
      cancelText: '取消',
      showCancel: false,
    };

    await new Promise<boolean>(resolve => {
      dialogResolver = resolve;
    });
  };

  return {
    toast,
    dialog,
    dismissToast,
    showToast,
    resolveDialog,
    confirm,
    alert,
  };
});
