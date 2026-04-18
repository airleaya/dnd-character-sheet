// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import { nextTick } from 'vue';
import GlobalFeedback from '../src/components/ui/GlobalFeedback.vue';
import { useUiFeedbackStore } from '../src/stores/uiFeedback';

describe('GlobalFeedback UI smoke', () => {
  let pinia: Pinia;
  let wrapper: VueWrapper | null = null;

  const mountFeedback = () => {
    wrapper = mount(GlobalFeedback, {
      global: {
        plugins: [pinia],
        stubs: {
          teleport: true,
          transition: true,
        },
      },
    });

    return wrapper;
  };

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  afterEach(() => {
    const feedback = useUiFeedbackStore();
    feedback.dismissToast();

    if (feedback.dialog) {
      feedback.resolveDialog(false);
    }

    wrapper?.unmount();
    wrapper = null;
    document.body.innerHTML = '';
    vi.useRealTimers();
  });

  it('renders a confirm dialog and resolves true from the primary action', async () => {
    const feedback = useUiFeedbackStore();
    mountFeedback();

    const decision = feedback.confirm({
      title: 'Delete hero',
      message: 'Delete this hero forever?',
      tone: 'danger',
      confirmText: 'Delete',
      cancelText: 'Keep',
    });

    await nextTick();

    expect(wrapper?.text()).toContain('Delete hero');
    expect(wrapper?.text()).toContain('Delete this hero forever?');
    expect(wrapper?.text()).toContain('Delete');
    expect(wrapper?.text()).toContain('Keep');

    await wrapper!.get('.btn-primary').trigger('click');

    await expect(decision).resolves.toBe(true);
    await nextTick();
    expect(wrapper!.find('.feedback-dialog').exists()).toBe(false);
  });

  it('closes the dialog on Escape and resolves false', async () => {
    const feedback = useUiFeedbackStore();
    mountFeedback();

    const decision = feedback.confirm({
      message: 'Cancel from keyboard?',
    });

    await nextTick();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    await expect(decision).resolves.toBe(false);
    await nextTick();
    expect(wrapper!.find('.feedback-dialog').exists()).toBe(false);
  });

  it('renders and auto-dismisses a toast', async () => {
    vi.useFakeTimers();
    const feedback = useUiFeedbackStore();
    mountFeedback();

    feedback.showToast('Character saved.', 'success', 1200);
    await nextTick();

    expect(wrapper?.find('.feedback-toast').exists()).toBe(true);
    expect(wrapper?.text()).toContain('Character saved.');
    expect(wrapper?.find('.feedback-toast').classes()).toContain('tone-success');

    vi.advanceTimersByTime(1200);
    await nextTick();

    expect(wrapper?.find('.feedback-toast').exists()).toBe(false);
  });
});
