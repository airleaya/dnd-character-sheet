import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { DEFAULT_DND5E_DATA_PACK } from '../data/dataPacks/defaultDnd5ePack';
import {
  getItemLibraryDataPackGroups,
  getSpellLibraryDataPackGroups,
  setRuntimeDataPacks,
} from '../data/dataPacks/runtimeDataPacks';
import { useUiFeedbackStore } from './uiFeedback';
import {
  DEFAULT_DATA_PACK_ID,
  createDefaultDataPackSettings,
  normalizeDataPackSettings,
} from '../utils/dataPackUtils';
import type { DataPackSettings, RuntimeDataPack } from '../types/DataPack';

const applyPackRuntime = (packs: RuntimeDataPack[]) => {
  setRuntimeDataPacks(packs);
};

export const useDataPackStore = defineStore('dataPack', () => {
  const packs = ref<RuntimeDataPack[]>([DEFAULT_DND5E_DATA_PACK]);
  const settings = ref<DataPackSettings>(createDefaultDataPackSettings());
  const isLoaded = ref(false);
  const isBusy = ref(false);

  const feedback = useUiFeedbackStore();

  const orderedDataPacks = computed(() => {
    const packMap = new Map(packs.value.map(pack => [pack.id, pack]));
    const ordered = settings.value.packOrder
      .map(id => packMap.get(id))
      .filter((pack): pack is RuntimeDataPack => Boolean(pack));
    const appended = packs.value.filter(pack => !settings.value.packOrder.includes(pack.id));
    return [...ordered, ...appended];
  });

  const enabledDataPacks = computed(() =>
    orderedDataPacks.value
      .filter(pack => settings.value.enabledPackIds.includes(pack.id))
      .map(pack => ({ ...pack, enabled: true }))
  );

  const itemLibraryItems = computed(() =>
    enabledDataPacks.value.flatMap(pack => pack.items)
  );

  const spellLibraryItems = computed(() =>
    enabledDataPacks.value.flatMap(pack => pack.spells)
  );

  const traitEntries = computed(() =>
    enabledDataPacks.value.flatMap(pack =>
      pack.traits.map(trait => ({ packId: pack.id, sourceName: pack.name, trait }))
    )
  );

  const setState = (nextPacks: RuntimeDataPack[], nextSettings: DataPackSettings) => {
    const knownIds = nextPacks.map(pack => pack.id);
    settings.value = normalizeDataPackSettings(nextSettings, knownIds);
    packs.value = nextPacks.map(pack => ({
      ...pack,
      enabled: settings.value.enabledPackIds.includes(pack.id),
    }));
    applyPackRuntime(packs.value);
  };

  const init = async () => {
    if (isLoaded.value) return;

    if (!window.electronAPI?.readDataPackState) {
      setState([DEFAULT_DND5E_DATA_PACK], createDefaultDataPackSettings());
      isLoaded.value = true;
      return;
    }

    isBusy.value = true;
    try {
      const result = await window.electronAPI.readDataPackState();
      if (!result.success) throw new Error(result.error);
      setState(result.data.packs, result.data.settings);
      isLoaded.value = true;
    } catch (e) {
      setState([DEFAULT_DND5E_DATA_PACK], createDefaultDataPackSettings());
      feedback.showToast(`数据包读取失败：${e instanceof Error ? e.message : String(e)}`, 'warning', 4000);
    } finally {
      isBusy.value = false;
    }
  };

  const refresh = async () => {
    isLoaded.value = false;
    await init();
  };

  const persistSettings = async (nextSettings: DataPackSettings) => {
    const knownIds = packs.value.map(pack => pack.id);
    const normalized = normalizeDataPackSettings(nextSettings, knownIds);

    if (!window.electronAPI?.updateDataPackSettings) {
      setState(packs.value, normalized);
      return;
    }

    const result = await window.electronAPI.updateDataPackSettings(normalized);
    if (!result.success) throw new Error(result.error);
    setState(packs.value, result.data);
  };

  const togglePackEnabled = async (packId: string) => {
    const enabled = new Set(settings.value.enabledPackIds);
    if (enabled.has(packId)) {
      enabled.delete(packId);
    } else {
      enabled.add(packId);
    }

    await persistSettings({
      ...settings.value,
      enabledPackIds: Array.from(enabled),
    });
  };

  const movePack = async (packId: string, direction: -1 | 1) => {
    if (packId === DEFAULT_DATA_PACK_ID) return;
    const packOrder = [...settings.value.packOrder];
    const index = packOrder.indexOf(packId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= packOrder.length) return;
    if (packOrder[target] === DEFAULT_DATA_PACK_ID) return;

    [packOrder[index], packOrder[target]] = [packOrder[target], packOrder[index]];
    await persistSettings({ ...settings.value, packOrder });
  };

  const importPack = async () => {
    if (!window.electronAPI?.importDataPack) return;
    isBusy.value = true;
    try {
      const result = await window.electronAPI.importDataPack();
      if (!result.success) throw new Error(result.error);
      if (result.data) {
        feedback.showToast(`已导入数据包：${result.data.name}`, 'success');
        await refresh();
      }
    } catch (e) {
      feedback.showToast(`导入失败：${e instanceof Error ? e.message : String(e)}`, 'danger', 4200);
    } finally {
      isBusy.value = false;
    }
  };

  const exportPack = async (packId: string) => {
    if (!window.electronAPI?.exportDataPack) return;
    const result = await window.electronAPI.exportDataPack(packId);
    if (!result.success) {
      feedback.showToast(`导出失败：${result.error}`, 'danger', 4200);
      return;
    }
    feedback.showToast(packId === DEFAULT_DATA_PACK_ID ? '已导出默认数据包副本' : '已导出数据包', 'success');
  };

  const deletePack = async (packId: string) => {
    if (packId === DEFAULT_DATA_PACK_ID) return;
    const confirmed = await feedback.confirm({
      title: '删除数据包',
      message: '删除后需要重新导入才能恢复。是否继续？',
      tone: 'danger',
      confirmText: '删除',
    });
    if (!confirmed || !window.electronAPI?.deleteDataPack) return;

    const result = await window.electronAPI.deleteDataPack(packId);
    if (!result.success) {
      feedback.showToast(`删除失败：${result.error}`, 'danger', 4200);
      return;
    }
    feedback.showToast('已删除数据包', 'success');
    await refresh();
  };

  const openReservedEditor = async (pack: RuntimeDataPack) => {
    if (pack.builtin) return;
    await feedback.alert({
      title: '编辑入口预留',
      message: '第三方数据包编辑器将在后续 GM 制作器阶段实装；当前版本只预留入口，不修改源数据包。',
      tone: 'info',
    });
  };

  const getItemGroups = (visibleIds?: Set<string>) =>
    getItemLibraryDataPackGroups(visibleIds, enabledDataPacks.value);

  const getSpellGroups = (visibleIds?: Set<string>) =>
    getSpellLibraryDataPackGroups(visibleIds, enabledDataPacks.value);

  return {
    packs,
    settings,
    isLoaded,
    isBusy,
    orderedDataPacks,
    enabledDataPacks,
    itemLibraryItems,
    spellLibraryItems,
    traitEntries,
    init,
    refresh,
    togglePackEnabled,
    movePack,
    importPack,
    exportPack,
    deletePack,
    openReservedEditor,
    getItemGroups,
    getSpellGroups,
  };
});
