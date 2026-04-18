// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import { nextTick } from 'vue';
import App from '../src/App.vue';
import { useCharacterStore } from '../src/stores/characterStore';
import { useActiveSheetStore } from '../src/stores/activeSheet';
import { createDefaultCharacter } from '../src/utils/characterMigration';

type CloseHandler = (() => void | Promise<void>) | null;

const createLocalStorageMock = () => {
  const storage = new Map<string, string>();

  return {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => {
      storage.clear();
    },
  };
};

describe('App root shell smoke', () => {
  let pinia: Pinia;
  let wrapper: VueWrapper | null = null;
  let closeHandler: CloseHandler;

  const mountApp = () => {
    wrapper = mount(App, {
      global: {
        plugins: [pinia],
        stubs: {
          GlobalTooltip: { template: '<div data-test="global-tooltip" />' },
          GlobalFeedback: { template: '<div data-test="global-feedback" />' },
          AppLayout: { template: '<div data-test="app-layout"><slot /></div>' },
          HeaderInfo: { template: '<div data-test="header-info" />' },
          StatsAndSkills: { template: '<div data-test="stats-and-skills" />' },
          CombatPanel: { template: '<div data-test="combat-panel" />' },
          ActionsPanel: { template: '<div data-test="actions-panel" />' },
          EquipmentSlots: { template: '<div data-test="equipment-slots" />' },
          InventoryPanel: { template: '<div data-test="inventory-panel" />' },
          SpellbookPanel: {
            props: ['isOpen'],
            template: '<div data-test="spellbook-panel" :data-open="String(isOpen)" />',
          },
        },
      },
    });

    return wrapper;
  };

  beforeEach(() => {
    closeHandler = null;
    pinia = createPinia();
    setActivePinia(pinia);

    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true,
    });

    Object.defineProperty(window, 'electronAPI', {
      value: {
        onAppWillClose: vi.fn((callback: () => void | Promise<void>) => {
          closeHandler = callback;
        }),
        confirmClose: vi.fn(async () => undefined),
      },
      configurable: true,
    });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    closeHandler = null;
    vi.restoreAllMocks();
  });

  it('mounts the root shell, renders the empty state, and bootstraps init', async () => {
    const characterStore = useCharacterStore();
    const activeSheet = useActiveSheetStore();
    const initSpy = vi.spyOn(characterStore, 'init').mockResolvedValue(undefined);

    activeSheet.character = null;
    activeSheet.ui.isSpellbookOpen = false;

    mountApp();
    await nextTick();

    expect(initSpy).toHaveBeenCalledTimes(1);
    expect(wrapper?.find('[data-test="global-tooltip"]').exists()).toBe(true);
    expect(wrapper?.find('[data-test="global-feedback"]').exists()).toBe(true);
    expect(wrapper?.find('[data-test="app-layout"]').exists()).toBe(true);
    expect(wrapper?.find('.empty-state').exists()).toBe(true);
    expect(typeof closeHandler).toBe('function');
  });

  it('renders the main read-only shell when a character is already loaded', async () => {
    const characterStore = useCharacterStore();
    const activeSheet = useActiveSheetStore();
    vi.spyOn(characterStore, 'init').mockResolvedValue(undefined);

    activeSheet.character = createDefaultCharacter('app-shell-1');
    activeSheet.ui.isSpellbookOpen = false;

    mountApp();
    await nextTick();

    expect(wrapper?.find('.sheet-container').exists()).toBe(true);
    expect(wrapper?.find('.empty-state').exists()).toBe(false);
    expect(wrapper?.find('[data-test="header-info"]').exists()).toBe(true);
    expect(wrapper?.find('[data-test="stats-and-skills"]').exists()).toBe(true);
    expect(wrapper?.find('[data-test="combat-panel"]').exists()).toBe(true);
    expect(wrapper?.find('[data-test="actions-panel"]').exists()).toBe(true);
    expect(wrapper?.find('[data-test="equipment-slots"]').exists()).toBe(true);
    expect(wrapper?.find('[data-test="inventory-panel"]').exists()).toBe(true);
  });

  it('keeps the spellbook shell mounted after the first open', async () => {
    const characterStore = useCharacterStore();
    const activeSheet = useActiveSheetStore();
    vi.spyOn(characterStore, 'init').mockResolvedValue(undefined);

    activeSheet.character = createDefaultCharacter('app-shell-2');
    activeSheet.ui.isSpellbookOpen = true;

    mountApp();
    await nextTick();

    expect(wrapper?.find('[data-test="spellbook-panel"]').attributes('data-open')).toBe('true');

    activeSheet.ui.isSpellbookOpen = false;
    await nextTick();

    expect(wrapper?.find('[data-test="spellbook-panel"]').exists()).toBe(true);
    expect(wrapper?.find('[data-test="spellbook-panel"]').attributes('data-open')).toBe('false');
  });
});
