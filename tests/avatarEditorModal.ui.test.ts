// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AvatarEditorModal from '../src/components/sheet/bio/AvatarEditorModal.vue';

describe('AvatarEditorModal', () => {
  it('renders crop controls and all avatar size previews', () => {
    const wrapper = mount(AvatarEditorModal, {
      props: {
        isOpen: true,
        file: new File(['avatar'], 'avatar.webp', { type: 'image/webp' }),
      },
      global: {
        stubs: {
          Transition: false,
        },
      },
    });

    expect(wrapper.find('.crop-viewport').exists()).toBe(true);
    expect(wrapper.find('input[type="range"]').exists()).toBe(true);
    expect(wrapper.findAll('.preview-row')).toHaveLength(3);
    expect(wrapper.text()).toContain('large');
    expect(wrapper.text()).toContain('medium');
    expect(wrapper.text()).toContain('small');
  });

  it('emits close from the cancel action', async () => {
    const wrapper = mount(AvatarEditorModal, {
      props: {
        isOpen: true,
        file: null,
      },
    });

    const cancel = wrapper.findAll('button').find(button => button.text() === '取消');
    expect(cancel).toBeTruthy();
    await cancel!.trigger('click');

    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});
