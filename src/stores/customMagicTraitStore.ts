import { defineStore } from 'pinia';
import { ref } from 'vue';
import { createEmptyCustomMagicTrait } from '../data/rules/magicTraits';
import { generateUUID } from '../utils/idGenerator';
import { cloneMagicTrait } from '../utils/magicItems';
import { createRendererLogger } from '../utils/rendererLogger';
import type { ItemMagicTrait } from '../types/Library';

const logger = createRendererLogger('stores/customMagicTraitStore');
const FALLBACK_STORAGE_KEY = 'dnd_custom_magic_traits';

const cloneTraits = (traits: ItemMagicTrait[]): ItemMagicTrait[] => traits.map(cloneMagicTrait);

const dedupeTraits = (traits: ItemMagicTrait[]): ItemMagicTrait[] => {
  const map = new Map<string, ItemMagicTrait>();
  traits.forEach(trait => {
    if (!trait.id) return;
    map.set(trait.id, cloneMagicTrait({ ...trait, source: 'custom' }));
  });
  return Array.from(map.values());
};

export const useCustomMagicTraitStore = defineStore('customMagicTraitStore', () => {
  const traits = ref<ItemMagicTrait[]>([]);
  const isLoaded = ref(false);
  const isBusy = ref(false);
  let loadPromise: Promise<void> | null = null;

  const persist = async () => {
    const payload = cloneTraits(traits.value);
    if (window.electronAPI?.saveCustomMagicTraits) {
      const result = await window.electronAPI.saveCustomMagicTraits(payload);
      if (!result.success) throw new Error(result.error);
      traits.value = dedupeTraits(result.data);
      return;
    }

    localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(payload));
  };

  const init = async () => {
    if (isLoaded.value) return;
    if (loadPromise) return loadPromise;
    isBusy.value = true;
    loadPromise = (async () => {
      if (window.electronAPI?.readCustomMagicTraits) {
        const result = await window.electronAPI.readCustomMagicTraits();
        if (!result.success) throw new Error(result.error);
        traits.value = dedupeTraits(result.data);
      } else {
        const raw = localStorage.getItem(FALLBACK_STORAGE_KEY);
        traits.value = raw ? dedupeTraits(JSON.parse(raw) as ItemMagicTrait[]) : [];
        logger.warn('Custom magic trait API unavailable; using browser fallback storage');
      }
      isLoaded.value = true;
      logger.info('Custom magic traits loaded', { traitCount: traits.value.length });
    })();
    try {
      await loadPromise;
    } catch (error) {
      logger.error('Failed to load custom magic traits', error);
      traits.value = [];
      isLoaded.value = true;
    } finally {
      isBusy.value = false;
      loadPromise = null;
    }
  };

  const addTrait = async (patch?: Partial<ItemMagicTrait>) => {
    await init();
    const trait = cloneMagicTrait({
      ...createEmptyCustomMagicTrait(`custom_magic_trait_${generateUUID()}`),
      ...patch,
      source: 'custom',
    });
    traits.value = dedupeTraits([...traits.value, trait]);
    await persist();
    logger.info('Custom magic trait persisted', { traitId: trait.id, traitCount: traits.value.length });
    return trait;
  };

  const upsertTrait = async (trait: ItemMagicTrait) => {
    await init();
    const nextTrait = cloneMagicTrait({ ...trait, source: 'custom' });
    const existing = traits.value.some(entry => entry.id === nextTrait.id);
    traits.value = dedupeTraits(existing
      ? traits.value.map(entry => (entry.id === nextTrait.id ? nextTrait : entry))
      : [...traits.value, nextTrait]);
    await persist();
    logger.info('Custom magic trait updated in permanent library', { traitId: nextTrait.id });
    return nextTrait;
  };

  const deleteTrait = async (traitId: string) => {
    await init();
    const before = traits.value.length;
    traits.value = traits.value.filter(trait => trait.id !== traitId);
    await persist();
    logger.info('Custom magic trait removed from permanent library', {
      traitId,
      removed: before !== traits.value.length,
      traitCount: traits.value.length,
    });
  };

  const mergeTraits = async (incomingTraits: ItemMagicTrait[]) => {
    await init();
    const before = traits.value.length;
    traits.value = dedupeTraits([...traits.value, ...incomingTraits]);
    if (traits.value.length !== before) {
      await persist();
      logger.info('Legacy character magic traits migrated into permanent library', {
        importedCount: traits.value.length - before,
        traitCount: traits.value.length,
      });
    }
  };

  return {
    traits,
    isLoaded,
    isBusy,
    init,
    addTrait,
    upsertTrait,
    deleteTrait,
    mergeTraits,
  };
});
