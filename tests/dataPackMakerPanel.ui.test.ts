// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import DataPackMakerPanel from '../src/components/sheet/dataPackMaker/DataPackMakerPanel.vue';
import { useDataPackStore } from '../src/stores/dataPackStore';
import type { DataPackFile } from '../src/types/DataPack';

const createDraftPack = (): DataPackFile => ({
  manifest: {
    schemaVersion: 1,
    id: 'homebrew',
    name: '自定义数据包',
    version: '1.0.0',
  },
  items: [],
  spells: [],
  traits: [],
});

describe('DataPackMakerPanel', () => {
  let pinia: Pinia;
  let wrapper: VueWrapper | null = null;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);

    Object.defineProperty(window, 'electronAPI', {
      value: {
        writeLog: vi.fn(async () => ({ success: true, data: null })),
      },
      configurable: true,
    });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    vi.restoreAllMocks();
  });

  it('routes the header save button to draft data-pack saving', async () => {
    const store = useDataPackStore();
    store.activeDraftPack = createDraftPack();
    const saveSpy = vi.spyOn(store, 'saveDraftPack').mockResolvedValue(true);

    wrapper = mount(DataPackMakerPanel, {
      global: {
        plugins: [pinia],
      },
    });

    const saveButton = wrapper
      .findAll('.header-actions button')
      .find(button => button.text() === '保存');

    expect(saveButton).toBeTruthy();
    await saveButton!.trigger('click');

    expect(saveSpy).toHaveBeenCalledWith('update');
  });
});
