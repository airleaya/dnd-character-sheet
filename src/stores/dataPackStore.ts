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
  isValidDataPackId,
  makeUniqueLocalId,
  normalizeDataPackSettings,
  stripRuntimePrefix,
} from '../utils/dataPackUtils';
import {
  filterRuntimePackByVisibility,
  getEntryUnlockGroupId,
  isEntryPublic,
  resolveUnlockGroupIdsByPassphrase,
  summarizeDataPackVisibility,
} from '../utils/dataPackVisibility';
import { getRuntimeLibraryItemById, getRuntimeSpellById } from '../data/dataPacks/runtimeDataPacks';
import { createRendererLogger } from '../utils/rendererLogger';
import type { DataPackFile, DataPackManifest, DataPackMenuGroup, DataPackSettings, RuntimeDataPack } from '../types/DataPack';
import type { LibraryItem } from '../types/Library';
import type { SpellDefinition } from '../types/Spell';

const logger = createRendererLogger('stores/dataPackStore');

const applyPackRuntime = (packs: RuntimeDataPack[]) => {
  setRuntimeDataPacks(packs);
};

const summarizeDraftPack = (packFile: DataPackFile) => ({
  packId: packFile.manifest.id,
  packName: packFile.manifest.name,
  itemCount: packFile.items?.length ?? 0,
  spellCount: packFile.spells?.length ?? 0,
  traitCount: packFile.traits?.length ?? 0,
  unlockGroupCount: packFile.editorMeta?.unlockGroups?.length ?? packFile.editorMeta?.encryptionGroups?.length ?? 0,
  hasEditLock: Boolean(packFile.editorMeta?.editLock?.enabled),
});

type MakerDragDiagnostic = {
  id: number;
  timestamp: string;
  step: string;
  status: 'info' | 'ok' | 'warn' | 'error';
  message: string;
  details?: Record<string, unknown>;
};

export const useDataPackStore = defineStore('dataPack', () => {
  const packs = ref<RuntimeDataPack[]>([DEFAULT_DND5E_DATA_PACK]);
  const settings = ref<DataPackSettings>(createDefaultDataPackSettings());
  const isLoaded = ref(false);
  const isBusy = ref(false);
  const isMakerOpen = ref(false);
  const activeDraftPack = ref<DataPackFile | null>(null);
  const draftDirty = ref(false);
  const ignoreUnlockInMaker = ref(false);
  const unlockedGroupIdsByPack = ref<Record<string, string[]>>({});
  const makerLibraryTab = ref<'items' | 'spells'>('items');
  const makerItemWorkbenchRequest = ref<{
    runtimeItemId: string;
    target: 'forge' | 'enchant';
    token: number;
  } | null>(null);
  const makerWorkbenchDropCandidate = ref<{
    runtimeItemId: string;
    target: 'forge' | 'enchant';
    updatedAt: number;
    source: string;
  } | null>(null);
  const makerDragDiagnostics = ref<MakerDragDiagnostic[]>([]);
  let makerDragDiagnosticSeq = 0;

  const feedback = useUiFeedbackStore();

  const clonePlain = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

  const recordMakerDragDiagnostic = (
    step: string,
    status: MakerDragDiagnostic['status'],
    message: string,
    details?: Record<string, unknown>
  ) => {
    makerDragDiagnosticSeq += 1;
    makerDragDiagnostics.value = [
      {
        id: makerDragDiagnosticSeq,
        timestamp: new Date().toISOString(),
        step,
        status,
        message,
        details,
      },
      ...makerDragDiagnostics.value,
    ].slice(0, 40);
  };

  const clearMakerDragDiagnostics = () => {
    makerDragDiagnostics.value = [];
  };

  const hashText = async (value: string, salt: string): Promise<string> => {
    const payload = `${salt}:${value}`;
    if (globalThis.crypto?.subtle) {
      const bytes = new TextEncoder().encode(payload);
      const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
      return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
    }
    return btoa(unescape(encodeURIComponent(payload)));
  };

  const getLocalEditorHash = async (): Promise<string | undefined> => {
    const result = await window.electronAPI?.getLocalEditorIdHash?.();
    return result?.success ? result.data : undefined;
  };

  const orderedDataPacks = computed(() => {
    const packMap = new Map(packs.value.map(pack => [pack.id, pack]));
    const ordered = settings.value.packOrder
      .map(id => packMap.get(id))
      .filter((pack): pack is RuntimeDataPack => Boolean(pack));
    const appended = packs.value.filter(pack => !settings.value.packOrder.includes(pack.id));
    return [...ordered, ...appended];
  });

  const rawEnabledDataPacks = computed(() =>
    orderedDataPacks.value
      .filter(pack => settings.value.enabledPackIds.includes(pack.id))
      .map(pack => ({ ...pack, enabled: true }))
  );

  const getUnlockedGroupIdSet = (packId: string): Set<string> =>
    new Set(unlockedGroupIdsByPack.value[packId] ?? []);

  const shouldIgnoreUnlockForRuntime = () => isMakerOpen.value && ignoreUnlockInMaker.value;

  const enabledDataPacks = computed(() =>
    rawEnabledDataPacks.value.map(pack =>
      filterRuntimePackByVisibility(pack, getUnlockedGroupIdSet(pack.id), shouldIgnoreUnlockForRuntime())
    )
  );

  const syncRuntimePacks = () => {
    applyPackRuntime(orderedDataPacks.value.map(pack => {
      const enabled = settings.value.enabledPackIds.includes(pack.id);
      const visiblePack = filterRuntimePackByVisibility(
        { ...pack, enabled },
        getUnlockedGroupIdSet(pack.id),
        shouldIgnoreUnlockForRuntime()
      );
      return { ...visiblePack, enabled };
    }));
  };

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
    unlockedGroupIdsByPack.value = Object.fromEntries(
      Object.entries(unlockedGroupIdsByPack.value)
        .filter(([packId]) => knownIds.includes(packId))
        .map(([packId, groupIds]) => [packId, groupIds.filter((id, index, list) => list.indexOf(id) === index)])
    );
    packs.value = nextPacks.map(pack => ({
      ...pack,
      enabled: settings.value.enabledPackIds.includes(pack.id),
    }));
    syncRuntimePacks();
  };

  const init = async () => {
    if (isLoaded.value) return;

    if (!window.electronAPI?.readDataPackState) {
      setState([DEFAULT_DND5E_DATA_PACK], createDefaultDataPackSettings());
      isLoaded.value = true;
      logger.warn('Data pack state API unavailable; using builtin default pack only');
      return;
    }

    isBusy.value = true;
    try {
      const result = await window.electronAPI.readDataPackState();
      if (!result.success) throw new Error(result.error);
      setState(result.data.packs, result.data.settings);
      isLoaded.value = true;
      logger.info('Data pack state loaded', {
        packCount: result.data.packs.length,
        enabledCount: result.data.settings.enabledPackIds.length,
      });
    } catch (e) {
      setState([DEFAULT_DND5E_DATA_PACK], createDefaultDataPackSettings());
      logger.error('Failed to load data pack state; using builtin default pack only', e);
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
      logger.warn('Data pack settings API unavailable; settings only updated in memory', {
        enabledCount: normalized.enabledPackIds.length,
        orderCount: normalized.packOrder.length,
      });
      return;
    }

    const result = await window.electronAPI.updateDataPackSettings(normalized);
    if (!result.success) throw new Error(result.error);
    setState(packs.value, result.data);
    logger.info('Data pack settings persisted', {
      enabledCount: result.data.enabledPackIds.length,
      orderCount: result.data.packOrder.length,
    });
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
    logger.info('Data pack enabled state changed', {
      packId,
      enabled: enabled.has(packId),
    });
  };

  const getPackVisibilitySummary = (packId: string) => {
    const pack = packs.value.find(entry => entry.id === packId);
    if (!pack) return undefined;
    return summarizeDataPackVisibility(pack, getUnlockedGroupIdSet(pack.id), shouldIgnoreUnlockForRuntime());
  };

  const unlockByPassphrase = (passphrase: string) => {
    const trimmed = passphrase.trim();
    if (!trimmed) {
      logger.warn('Ignored empty data pack unlock passphrase');
      return [];
    }

    const results: Array<{
      packId: string;
      packName: string;
      unlockedGroupCount: number;
      unlockedItemCount: number;
      unlockedSpellCount: number;
      unlockedTraitCount: number;
      alreadyUnlocked: boolean;
    }> = [];

    packs.value.forEach(pack => {
      if (!settings.value.enabledPackIds.includes(pack.id)) return;
      const matchedGroupIds = resolveUnlockGroupIdsByPassphrase(pack, trimmed);
      if (matchedGroupIds.length === 0) return;

      const before = getUnlockedGroupIdSet(pack.id);
      const next = new Set(before);
      matchedGroupIds.forEach(groupId => next.add(groupId));
      unlockedGroupIdsByPack.value = {
        ...unlockedGroupIdsByPack.value,
        [pack.id]: Array.from(next),
      };

      const unlockedGroups = new Set(matchedGroupIds);
      results.push({
        packId: pack.id,
        packName: pack.name,
        unlockedGroupCount: matchedGroupIds.length,
        unlockedItemCount: pack.items.filter(item =>
          !isEntryPublic(item) && unlockedGroups.has(getEntryUnlockGroupId(item) ?? '')
        ).length,
        unlockedSpellCount: pack.spells.filter(spell =>
          !isEntryPublic(spell) && unlockedGroups.has(getEntryUnlockGroupId(spell) ?? '')
        ).length,
        unlockedTraitCount: pack.traits.filter(trait =>
          !isEntryPublic(trait) && unlockedGroups.has(getEntryUnlockGroupId(trait) ?? '')
        ).length,
        alreadyUnlocked: matchedGroupIds.every(groupId => before.has(groupId)),
      });
    });

    syncRuntimePacks();
    logger.info('Data pack passphrase unlock attempted', {
      matchedPackCount: results.length,
      unlockedPackIds: results.map(result => result.packId),
      unlockedGroupCount: results.reduce((sum, result) => sum + result.unlockedGroupCount, 0),
    });
    if (results.length === 0) {
      feedback.showToast('没有匹配的口令内容', 'warning', 3200);
    } else {
      feedback.showToast(`已解锁 ${results.length} 个数据包中的非公开内容`, 'success', 3200);
    }
    return results;
  };

  const clearPackUnlocks = (packId: string) => {
    const existing = unlockedGroupIdsByPack.value[packId] ?? [];
    if (existing.length === 0) return 0;
    const next = { ...unlockedGroupIdsByPack.value };
    delete next[packId];
    unlockedGroupIdsByPack.value = next;
    syncRuntimePacks();
    logger.info('Data pack runtime unlocks cleared', {
      packId,
      clearedGroupCount: existing.length,
    });
    feedback.showToast('已重新锁定该数据包的非公开内容', 'success', 2800);
    return existing.length;
  };

  const clearAllUnlocks = () => {
    const clearedPackCount = Object.keys(unlockedGroupIdsByPack.value).length;
    const clearedGroupCount = Object.values(unlockedGroupIdsByPack.value)
      .reduce((sum, groupIds) => sum + groupIds.length, 0);
    if (clearedGroupCount === 0) return { clearedPackCount: 0, clearedGroupCount: 0 };
    unlockedGroupIdsByPack.value = {};
    syncRuntimePacks();
    logger.info('All data pack runtime unlocks cleared', {
      clearedPackCount,
      clearedGroupCount,
    });
    feedback.showToast('已清空本次运行的全部数据包解锁状态', 'success', 3200);
    return { clearedPackCount, clearedGroupCount };
  };

  const getUnlockedGroupCount = (packId: string) =>
    unlockedGroupIdsByPack.value[packId]?.length ?? 0;

  const setIgnoreUnlockInMaker = (enabled: boolean) => {
    ignoreUnlockInMaker.value = enabled;
    syncRuntimePacks();
    logger.info('Data pack maker unlock filter override changed', { enabled });
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
    logger.info('Data pack order changed', { packId, direction, fromIndex: index, toIndex: target });
  };

  const importPack = async () => {
    if (!window.electronAPI?.importDataPack) {
      logger.warn('Import data pack API unavailable');
      return;
    }
    isBusy.value = true;
    try {
      const result = await window.electronAPI.importDataPack();
      if (!result.success) throw new Error(result.error);
      if (result.data) {
        logger.info('Data pack imported', result.data);
        feedback.showToast(`已导入数据包：${result.data.name}`, 'success');
        await refresh();
      }
    } catch (e) {
      logger.error('Failed to import data pack', e);
      feedback.showToast(`导入失败：${e instanceof Error ? e.message : String(e)}`, 'danger', 4200);
    } finally {
      isBusy.value = false;
    }
  };

  const exportPack = async (packId: string) => {
    if (!window.electronAPI?.exportDataPack) {
      logger.warn('Export data pack API unavailable', { packId });
      return;
    }
    const result = await window.electronAPI.exportDataPack(packId);
    if (!result.success) {
      logger.warn('Failed to export data pack', { packId, error: result.error });
      feedback.showToast(`导出失败：${result.error}`, 'danger', 4200);
      return;
    }
    logger.info('Data pack exported', { packId, builtin: packId === DEFAULT_DATA_PACK_ID });
    feedback.showToast(packId === DEFAULT_DATA_PACK_ID ? '已导出默认数据包副本' : '已导出数据包', 'success');
  };

  const deletePack = async (packId: string) => {
    if (packId === DEFAULT_DATA_PACK_ID) {
      logger.warn('Ignored delete request for builtin data pack', { packId });
      return;
    }
    const confirmed = await feedback.confirm({
      title: '删除数据包',
      message: '删除后需要重新导入才能恢复。是否继续？',
      tone: 'danger',
      confirmText: '删除',
    });
    if (!confirmed) {
      logger.info('Data pack delete cancelled by user', { packId });
      return;
    }
    if (!window.electronAPI?.deleteDataPack) {
      logger.warn('Delete data pack API unavailable', { packId });
      return;
    }

    const result = await window.electronAPI.deleteDataPack(packId);
    if (!result.success) {
      logger.warn('Failed to delete data pack', { packId, error: result.error });
      feedback.showToast(`删除失败：${result.error}`, 'danger', 4200);
      return;
    }
    logger.info('Data pack deleted', { packId });
    feedback.showToast('已删除数据包', 'success');
    await refresh();
  };

  const canEditDraftWithLock = async (packFile: DataPackFile): Promise<boolean> => {
    const lock = packFile.editorMeta?.editLock;
    if (!lock?.enabled) return true;

    if (lock.localOnly) {
      const localHash = await getLocalEditorHash();
      if (!localHash || localHash !== lock.localEditorIdHash) {
        logger.warn('Data pack edit blocked by local-only edit lock', { packId: packFile.manifest.id });
        await feedback.alert({
          title: '不能编辑数据包',
          message: '该数据包设置为仅创建它的本机可编辑。本机可以使用、导出或复制其中内容，但不能进入编辑模式。',
          tone: 'warning',
        });
        return false;
      }
    }

    if (lock.passwordHash) {
      const input = window.prompt(lock.hint ? `请输入编辑密码（提示：${lock.hint}）` : '请输入编辑密码');
      if (input === null) {
        logger.info('Data pack edit password prompt cancelled', { packId: packFile.manifest.id });
        return false;
      }
      const inputHash = await hashText(input, lock.salt ?? '');
      if (inputHash !== lock.passwordHash) {
        logger.warn('Data pack edit blocked by invalid password', { packId: packFile.manifest.id });
        feedback.showToast('编辑密码错误', 'danger');
        return false;
      }
    }

    logger.info('Data pack edit lock passed', {
      packId: packFile.manifest.id,
      hasPassword: Boolean(lock.passwordHash),
      localOnly: Boolean(lock.localOnly),
    });
    return true;
  };

  const openMaker = async (packId: string) => {
    if (packId === DEFAULT_DATA_PACK_ID) {
      logger.warn('Ignored maker open request for builtin data pack', { packId });
      return;
    }
    if (!window.electronAPI?.readEditableDataPack) {
      logger.warn('Read editable data pack API unavailable', { packId });
      return;
    }
    isBusy.value = true;
    try {
      const result = await window.electronAPI.readEditableDataPack(packId);
      if (!result.success) throw new Error(result.error);
      if (!(await canEditDraftWithLock(result.data))) return;
      activeDraftPack.value = clonePlain(result.data);
      draftDirty.value = false;
      isMakerOpen.value = true;
      logger.info('Data pack maker opened', summarizeDraftPack(result.data));
    } catch (e) {
      logger.error('Failed to open data pack maker', e, { packId });
      feedback.showToast(`无法打开制作器：${e instanceof Error ? e.message : String(e)}`, 'danger', 4200);
    } finally {
      isBusy.value = false;
    }
  };

  const createDraftPack = async (
    manifest: DataPackManifest,
    options: { password?: string; passwordHint?: string; localOnly?: boolean } = {}
  ) => {
    if (!isValidDataPackId(manifest.id) || manifest.id === DEFAULT_DATA_PACK_ID) {
      logger.warn('Rejected invalid data pack draft id', { packId: manifest.id });
      feedback.showToast('数据包 ID 不合法或为保留 ID', 'danger');
      return;
    }
    if (packs.value.some(pack => pack.id === manifest.id)) {
      logger.warn('Rejected duplicate data pack draft id', { packId: manifest.id });
      feedback.showToast(`已存在同 ID 数据包：${manifest.id}`, 'danger');
      return;
    }

    const salt = options.password ? crypto.randomUUID() : undefined;
    const localEditorIdHash = options.localOnly ? await getLocalEditorHash() : undefined;
    const draft: DataPackFile = {
      manifest: {
        ...manifest,
        schemaVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      editorMeta: (options.password || options.localOnly) ? {
        editLock: {
          enabled: true,
          salt,
          passwordHash: options.password && salt ? await hashText(options.password, salt) : undefined,
          hint: options.passwordHint,
          localOnly: options.localOnly,
          localEditorIdHash,
        },
      } : undefined,
      items: [],
      spells: [],
      traits: [],
    };

    activeDraftPack.value = draft;
    draftDirty.value = true;
    isMakerOpen.value = true;
    logger.info('Data pack draft created', summarizeDraftPack(draft));
    await saveDraftPack('create');
  };

  const saveDraftPack = async (mode: 'create' | 'update' = 'update'): Promise<boolean> => {
    if (!activeDraftPack.value) {
      logger.warn('Save draft requested without an active data pack draft');
      feedback.showToast('当前没有可保存的数据包草稿', 'warning');
      return false;
    }
    if (!window.electronAPI?.saveEditableDataPack) {
      logger.warn('Save editable data pack API unavailable', summarizeDraftPack(activeDraftPack.value));
      feedback.showToast('当前运行环境不支持保存数据包', 'danger', 4200);
      return false;
    }

    const previousUpdatedAt = activeDraftPack.value.manifest.updatedAt;
    activeDraftPack.value.manifest.updatedAt = new Date().toISOString();

    try {
      const payload = clonePlain(activeDraftPack.value);
      const result = await window.electronAPI.saveEditableDataPack(payload, mode);
      if (!result.success) {
        logger.warn('Data pack draft save failed', {
          ...summarizeDraftPack(activeDraftPack.value),
          mode,
          error: result.error,
        });
        activeDraftPack.value.manifest.updatedAt = previousUpdatedAt;
        feedback.showToast(`保存失败：${result.error}`, 'danger', 4200);
        return false;
      }
      activeDraftPack.value = clonePlain(result.data);
      draftDirty.value = false;
      logger.info('Data pack draft saved', {
        ...summarizeDraftPack(result.data),
        mode,
      });
      feedback.showToast('数据包已保存', 'success');
      await refresh();
      return true;
    } catch (e) {
      activeDraftPack.value.manifest.updatedAt = previousUpdatedAt;
      logger.error('Failed to save draft data pack', e, {
        packId: activeDraftPack.value.manifest.id,
        mode,
      });
      feedback.showToast(`保存失败：${e instanceof Error ? e.message : String(e)}`, 'danger', 4200);
      return false;
    }
  };

  const closeMaker = async () => {
    if (draftDirty.value) {
      const confirmed = await feedback.confirm({
        title: '关闭制作器',
        message: '当前数据包有未保存修改，确认关闭吗？',
        tone: 'warning',
      });
      if (!confirmed) {
        logger.info('Data pack maker close cancelled due to dirty draft', {
          packId: activeDraftPack.value?.manifest.id,
        });
        return;
      }
    }
    logger.info('Data pack maker closed', {
      packId: activeDraftPack.value?.manifest.id,
      wasDirty: draftDirty.value,
    });
    isMakerOpen.value = false;
    ignoreUnlockInMaker.value = false;
    activeDraftPack.value = null;
    draftDirty.value = false;
    syncRuntimePacks();
  };

  const markDraftDirty = () => {
    draftDirty.value = true;
  };

  const setMakerLibraryTab = (tab: 'items' | 'spells') => {
    makerLibraryTab.value = tab;
  };

  const requestMakerItemWorkbench = (runtimeItemId: string, target: 'forge' | 'enchant') => {
    makerLibraryTab.value = 'items';
    makerItemWorkbenchRequest.value = {
      runtimeItemId,
      target,
      token: Date.now(),
    };
    recordMakerDragDiagnostic('store.request-maker-workbench', 'ok', 'Right sidebar drop routed to maker', {
      runtimeItemId,
      target,
    });
  };

  const armMakerWorkbenchDropCandidate = (
    runtimeItemId: string,
    target: 'forge' | 'enchant',
    source: string
  ) => {
    const previous = makerWorkbenchDropCandidate.value;
    makerWorkbenchDropCandidate.value = {
      runtimeItemId,
      target,
      updatedAt: Date.now(),
      source,
    };

    if (
      previous?.runtimeItemId !== runtimeItemId ||
      previous?.target !== target ||
      previous?.source !== source
    ) {
      recordMakerDragDiagnostic('store.arm-drop-candidate', 'info', 'Drop target armed for dragend fallback', {
        runtimeItemId,
        target,
        source,
      });
    }
  };

  const clearMakerWorkbenchDropCandidate = () => {
    makerWorkbenchDropCandidate.value = null;
  };

  const resolveMakerWorkbenchDropFromDragEnd = () => {
    if (!isMakerOpen.value) return false;

    const candidate = makerWorkbenchDropCandidate.value;
    if (!candidate) {
      recordMakerDragDiagnostic('store.dragend-fallback', 'warn', 'Drag ended, but no maker workbench candidate was armed');
      return false;
    }

    const ageMs = Date.now() - candidate.updatedAt;
    if (ageMs > 2000) {
      recordMakerDragDiagnostic('store.dragend-fallback', 'warn', 'Drag ended after candidate expired', {
        runtimeItemId: candidate.runtimeItemId,
        target: candidate.target,
        source: candidate.source,
        ageMs,
      });
      makerWorkbenchDropCandidate.value = null;
      return false;
    }

    recordMakerDragDiagnostic('store.dragend-fallback', 'ok', 'No drop event fired; using dragend fallback to activate maker', {
      runtimeItemId: candidate.runtimeItemId,
      target: candidate.target,
      source: candidate.source,
      ageMs,
    });
    makerWorkbenchDropCandidate.value = null;
    requestMakerItemWorkbench(candidate.runtimeItemId, candidate.target);
    return true;
  };

  const ensureEditorMeta = () => {
    if (!activeDraftPack.value) return undefined;
    activeDraftPack.value.editorMeta ??= {};
    return activeDraftPack.value.editorMeta;
  };

  const ensureMenuGroups = (domain: 'items' | 'spells'): DataPackMenuGroup[] => {
    const editorMeta = ensureEditorMeta();
    if (!editorMeta) return [];
    editorMeta.menuGroups ??= {};
    editorMeta.menuGroups[domain] ??= [];
    return editorMeta.menuGroups[domain]!;
  };

  const ensureEncryptionGroups = () => {
    const editorMeta = ensureEditorMeta();
    if (!editorMeta) return [];
    editorMeta.encryptionGroups ??= [];
    return editorMeta.encryptionGroups;
  };

  const syncEntryUnlockVisibility = (
    entry: { encryptionGroupId?: string; visibility?: { public: boolean; unlockGroupId?: string } },
    groupId?: string
  ) => {
    entry.encryptionGroupId = groupId || undefined;
    entry.visibility = groupId
      ? { public: false, unlockGroupId: groupId }
      : { public: true };
  };

  const mergeMenuGroups = (domain: 'items' | 'spells', sourceGroups: DataPackMenuGroup[] | undefined) => {
    if (!sourceGroups?.length) return;
    const targetGroups = ensureMenuGroups(domain);
    sourceGroups.forEach(sourceGroup => {
      let targetGroup = targetGroups.find(group => group.name === sourceGroup.name);
      if (!targetGroup) {
        targetGroup = {
          id: makeUniqueLocalId(sourceGroup.id || sourceGroup.name, targetGroups.map(group => group.id)),
          name: sourceGroup.name,
          children: [],
        };
        targetGroups.push(targetGroup);
      }

      const targetChildren = targetGroup.children ?? (targetGroup.children = []);
      sourceGroup.children?.forEach(sourceChild => {
        if (!targetChildren.some(child => child.name === sourceChild.name)) {
          targetChildren.push({
            id: makeUniqueLocalId(sourceChild.id || sourceChild.name, targetChildren.map(child => child.id)),
            name: sourceChild.name,
          });
        }
      });
    });
  };

  const addMenuGroup = (domain: 'items' | 'spells', name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const groups = ensureMenuGroups(domain);
    if (groups.some(group => group.name === trimmed)) return;
    groups.push({ id: makeUniqueLocalId(trimmed, groups.map(group => group.id)), name: trimmed, children: [] });
    draftDirty.value = true;
    logger.info('Data pack menu group added', {
      packId: activeDraftPack.value?.manifest.id,
      domain,
      groupName: trimmed,
    });
  };

  const addMenuSubgroup = (domain: 'items' | 'spells', parentId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const parent = ensureMenuGroups(domain).find(group => group.id === parentId);
    if (!parent) return;
    parent.children ??= [];
    if (parent.children.some(child => child.name === trimmed)) return;
    parent.children.push({ id: makeUniqueLocalId(trimmed, parent.children.map(child => child.id)), name: trimmed });
    draftDirty.value = true;
    logger.info('Data pack menu subgroup added', {
      packId: activeDraftPack.value?.manifest.id,
      domain,
      parentId,
      subgroupName: trimmed,
    });
  };

  const removeMenuGroup = (domain: 'items' | 'spells', groupId: string) => {
    const groups = ensureMenuGroups(domain);
    const target = groups.find(group => group.id === groupId);
    const editorMeta = ensureEditorMeta();
    if (!target || !editorMeta?.menuGroups) return;
    editorMeta.menuGroups[domain] = groups.filter(group => group.id !== groupId);
    draftDirty.value = true;
    logger.info('Data pack menu group removed', {
      packId: activeDraftPack.value?.manifest.id,
      domain,
      groupId,
      groupName: target.name,
    });
  };

  const ensureMenuGroupForAssignment = (
    domain: 'items' | 'spells',
    category: string | undefined,
    subcategory?: string
  ) => {
    const groupName = category?.trim();
    const subgroupName = subcategory?.trim();
    if (!groupName) return;

    const groups = ensureMenuGroups(domain);
    let group = groups.find(entry => entry.name === groupName);
    let changed = false;

    if (!group) {
      group = {
        id: makeUniqueLocalId(groupName, groups.map(entry => entry.id)),
        name: groupName,
        children: [],
      };
      groups.push(group);
      changed = true;
    }

    if (subgroupName && subgroupName !== groupName) {
      group.children ??= [];
      if (!group.children.some(child => child.name === subgroupName)) {
        group.children.push({
          id: makeUniqueLocalId(subgroupName, group.children.map(child => child.id)),
          name: subgroupName,
        });
        changed = true;
      }
    }

    if (changed) {
      draftDirty.value = true;
      logger.info('Data pack menu group synced from editor assignment', {
        packId: activeDraftPack.value?.manifest.id,
        domain,
        groupName,
        subgroupName,
      });
    }
  };

  const ensureItemAssignmentGroups = (item: LibraryItem) => {
    ensureMenuGroupForAssignment('items', item.displayCategory, item.displaySubcategory);
  };

  const addEncryptionGroup = (name: string, description = '') => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const groups = ensureEncryptionGroups();
    if (groups.some(group => group.name === trimmed)) return;
    groups.push({
      id: makeUniqueLocalId(trimmed, groups.map(group => group.id)),
      name: trimmed,
      description: description.trim() || undefined,
      lockedByDefault: true,
    });
    const editorMeta = ensureEditorMeta();
    if (editorMeta) {
      editorMeta.unlockGroups ??= [];
      const group = groups[groups.length - 1];
      if (group && !editorMeta.unlockGroups.some(entry => entry.id === group.id)) {
        editorMeta.unlockGroups.push({
          id: group.id,
          passphrase: group.name,
          description: group.description,
          hint: group.description,
        });
      }
    }
    draftDirty.value = true;
    logger.info('Data pack unlock group added', {
      packId: activeDraftPack.value?.manifest.id,
      groupId: groups[groups.length - 1]?.id,
      hasDescription: Boolean(description.trim()),
    });
  };

  const updateEncryptionGroup = (groupId: string, updates: { name?: string; description?: string }) => {
    if (!activeDraftPack.value) return;
    const groups = ensureEncryptionGroups();
    const group = groups.find(entry => entry.id === groupId);
    const editorMeta = ensureEditorMeta();
    if (!group || !editorMeta) return;

    const nextName = updates.name?.trim();
    if (nextName && !groups.some(entry => entry.id !== groupId && entry.name === nextName)) {
      group.name = nextName;
    }
    if (updates.description !== undefined) {
      group.description = updates.description.trim() || undefined;
    }

    editorMeta.unlockGroups ??= [];
    let unlockGroup = editorMeta.unlockGroups.find(entry => entry.id === groupId);
    if (!unlockGroup) {
      unlockGroup = {
        id: group.id,
        passphrase: group.name,
      };
      editorMeta.unlockGroups.push(unlockGroup);
    }
    unlockGroup.passphrase = group.name;
    unlockGroup.description = group.description;
    unlockGroup.hint = group.description;
    draftDirty.value = true;
    logger.info('Data pack unlock group updated', {
      packId: activeDraftPack.value.manifest.id,
      groupId,
      hasDescription: Boolean(group.description),
    });
  };

  const removeEncryptionGroup = (groupId: string) => {
    if (!activeDraftPack.value) return;
    const groups = ensureEncryptionGroups();
    const target = groups.find(group => group.id === groupId);
    const editorMeta = ensureEditorMeta();
    if (!editorMeta) return;
    editorMeta.encryptionGroups = groups.filter(group => group.id !== groupId);
    editorMeta.unlockGroups = editorMeta.unlockGroups?.filter(group => group.id !== groupId);
    activeDraftPack.value.items?.forEach(item => {
      if (item.encryptionGroupId === groupId || item.visibility?.unlockGroupId === groupId) {
        syncEntryUnlockVisibility(item, undefined);
      }
    });
    activeDraftPack.value.spells?.forEach(spell => {
      if (spell.encryptionGroupId === groupId || spell.visibility?.unlockGroupId === groupId) {
        syncEntryUnlockVisibility(spell, undefined);
      }
    });
    activeDraftPack.value.traits?.forEach(trait => {
      if (trait.encryptionGroupId === groupId || trait.visibility?.unlockGroupId === groupId) {
        syncEntryUnlockVisibility(trait, undefined);
      }
    });
    draftDirty.value = true;
    logger.info('Data pack unlock group removed', {
      packId: activeDraftPack.value.manifest.id,
      groupId,
      existed: Boolean(target),
    });
  };

  const assignDraftSpellUnlockGroup = (spellId: string, groupId?: string) => {
    const spell = activeDraftPack.value?.spells?.find(entry => entry.id === spellId);
    if (!spell) return;
    syncEntryUnlockVisibility(spell, groupId);
    draftDirty.value = true;
    logger.info('Data pack spell unlock group assigned', {
      packId: activeDraftPack.value?.manifest.id,
      spellId,
      groupId: groupId || 'public',
    });
  };

  const assignDraftTraitUnlockGroup = (traitId: string, groupId?: string) => {
    const trait = activeDraftPack.value?.traits?.find(entry => entry.id === traitId);
    if (!trait) return;
    syncEntryUnlockVisibility(trait, groupId);
    draftDirty.value = true;
    logger.info('Data pack trait unlock group assigned', {
      packId: activeDraftPack.value?.manifest.id,
      traitId,
      groupId: groupId || 'public',
    });
  };

  const importItemToDraft = (runtimeItemId: string, target?: 'forge' | 'enchant') => {
    if (!activeDraftPack.value) {
      logger.warn('Import item requested without an active data pack draft', { runtimeItemId, target });
      return;
    }
    const source = getRuntimeLibraryItemById(runtimeItemId);
    if (!source) {
      logger.warn('Runtime item not found for data pack draft import', { runtimeItemId, target });
      feedback.showToast('未找到要导入的物品', 'danger');
      recordMakerDragDiagnostic('store.import-item', 'error', 'Runtime item not found', { runtimeItemId, target });
      return;
    }
    const items = activeDraftPack.value.items ?? (activeDraftPack.value.items = []);
    const item = clonePlain(source) as LibraryItem;
    item.id = makeUniqueLocalId(stripRuntimePrefix(item.id), items.map(entry => entry.id));
    item.source = activeDraftPack.value.manifest.name;
    items.push(item);
    draftDirty.value = true;
    logger.info('Item copied into data pack draft', {
      packId: activeDraftPack.value.manifest.id,
      runtimeItemId,
      localItemId: item.id,
      itemName: item.name,
      target,
      draftItemCount: items.length,
    });
    feedback.showToast(target === 'enchant' ? `已复制到附魔入口：${item.name}` : `已复制到铁匠台：${item.name}`, 'success');
    recordMakerDragDiagnostic('store.import-item', 'ok', 'Item copied into active draft pack', {
      runtimeItemId,
      localItemId: item.id,
      itemName: item.name,
      target,
      draftItemCount: items.length,
    });
    return item;
  };

  const importSpellToDraft = (runtimeSpellId: string) => {
    if (!activeDraftPack.value) {
      logger.warn('Import spell requested without an active data pack draft', { runtimeSpellId });
      return;
    }
    const source = getRuntimeSpellById(runtimeSpellId);
    if (!source) {
      logger.warn('Runtime spell not found for data pack draft import', { runtimeSpellId });
      feedback.showToast('未找到要导入的法术', 'danger');
      return;
    }
    const spells = activeDraftPack.value.spells ?? (activeDraftPack.value.spells = []);
    const spell = clonePlain(source) as SpellDefinition;
    spell.id = makeUniqueLocalId(stripRuntimePrefix(spell.id), spells.map(entry => entry.id));
    spell.source = activeDraftPack.value.manifest.name;
    spells.push(spell);
    draftDirty.value = true;
    logger.info('Spell copied into data pack draft', {
      packId: activeDraftPack.value.manifest.id,
      runtimeSpellId,
      localSpellId: spell.id,
      spellName: spell.name,
      draftSpellCount: spells.length,
    });
    feedback.showToast(`已复制到法术编辑占位：${spell.name}`, 'success');
  };

  const importPackContentsToDraft = (sourcePackId: string) => {
    if (!activeDraftPack.value) {
      logger.warn('Import pack contents requested without an active data pack draft', { sourcePackId });
      return;
    }
    if (sourcePackId === activeDraftPack.value.manifest.id) {
      logger.warn('Ignored self import for data pack draft', { sourcePackId });
      return;
    }
    const sourcePack = packs.value.find(pack => pack.id === sourcePackId);
    if (!sourcePack) {
      logger.warn('Source data pack not found for draft content import', { sourcePackId });
      return;
    }

    const draftItems = activeDraftPack.value.items ?? (activeDraftPack.value.items = []);
    const draftSpells = activeDraftPack.value.spells ?? (activeDraftPack.value.spells = []);
    const draftTraits = activeDraftPack.value.traits ?? (activeDraftPack.value.traits = []);
    const sourceMeta = sourcePack.editorMeta;
    const beforeCounts = {
      itemCount: draftItems.length,
      spellCount: draftSpells.length,
      traitCount: draftTraits.length,
    };

    sourcePack.items.forEach(source => {
      const item = clonePlain(source) as LibraryItem;
      item.id = makeUniqueLocalId(stripRuntimePrefix(item.id), draftItems.map(entry => entry.id));
      item.source = activeDraftPack.value?.manifest.name;
      draftItems.push(item);
    });

    sourcePack.spells.forEach(source => {
      const spell = clonePlain(source) as SpellDefinition;
      spell.id = makeUniqueLocalId(stripRuntimePrefix(spell.id), draftSpells.map(entry => entry.id));
      spell.source = activeDraftPack.value?.manifest.name;
      draftSpells.push(spell);
    });

    sourcePack.traits.forEach(source => {
      const trait = clonePlain(source);
      trait.id = makeUniqueLocalId(stripRuntimePrefix(trait.id), draftTraits.map(entry => entry.id));
      draftTraits.push(trait);
    });

    mergeMenuGroups('items', sourceMeta?.menuGroups?.items);
    mergeMenuGroups('spells', sourceMeta?.menuGroups?.spells);
    if (sourceMeta?.encryptionGroups?.length) {
      const groups = ensureEncryptionGroups();
      sourceMeta.encryptionGroups.forEach(sourceGroup => {
        if (!groups.some(group => group.name === sourceGroup.name)) {
          groups.push({
            ...clonePlain(sourceGroup),
            id: makeUniqueLocalId(sourceGroup.id, groups.map(group => group.id)),
          });
        }
      });
    }
    if (sourceMeta?.unlockGroups?.length) {
      const editorMeta = ensureEditorMeta();
      if (editorMeta) {
        editorMeta.unlockGroups ??= [];
        sourceMeta.unlockGroups.forEach(sourceGroup => {
          if (!editorMeta.unlockGroups?.some(group => group.passphrase === sourceGroup.passphrase)) {
            editorMeta.unlockGroups?.push({
              ...clonePlain(sourceGroup),
              id: makeUniqueLocalId(sourceGroup.id, editorMeta.unlockGroups.map(group => group.id)),
            });
          }
        });
      }
    }

    draftDirty.value = true;
    logger.info('Data pack contents imported into draft', {
      targetPackId: activeDraftPack.value.manifest.id,
      sourcePackId,
      importedItemCount: draftItems.length - beforeCounts.itemCount,
      importedSpellCount: draftSpells.length - beforeCounts.spellCount,
      importedTraitCount: draftTraits.length - beforeCounts.traitCount,
    });
    feedback.showToast(`已导入 ${sourcePack.name} 的内容快照`, 'success');
  };

  const updateDraftEditLock = async (options: { enabled: boolean; password?: string; hint?: string; localOnly?: boolean }) => {
    if (!activeDraftPack.value) {
      logger.warn('Edit lock update requested without an active data pack draft');
      return;
    }
    if (!options.enabled) {
      if (activeDraftPack.value.editorMeta) {
        activeDraftPack.value.editorMeta.editLock = undefined;
      }
      draftDirty.value = true;
      logger.info('Data pack edit lock disabled', { packId: activeDraftPack.value.manifest.id });
      return;
    }

    const salt = options.password ? crypto.randomUUID() : undefined;
    const editorMeta = ensureEditorMeta();
    if (!editorMeta) return;
    editorMeta.editLock = {
      enabled: true,
      salt,
      passwordHash: options.password && salt ? await hashText(options.password, salt) : undefined,
      hint: options.hint,
      localOnly: options.localOnly,
      localEditorIdHash: options.localOnly ? await getLocalEditorHash() : undefined,
    };
    draftDirty.value = true;
    logger.info('Data pack edit lock updated', {
      packId: activeDraftPack.value.manifest.id,
      hasPassword: Boolean(options.password),
      hasHint: Boolean(options.hint),
      localOnly: Boolean(options.localOnly),
    });
  };

  const openReservedEditor = async (pack: RuntimeDataPack) => {
    if (pack.builtin) {
      logger.warn('Ignored reserved editor request for builtin data pack', { packId: pack.id });
      return;
    }
    await openMaker(pack.id);
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
    isMakerOpen,
    activeDraftPack,
    draftDirty,
    ignoreUnlockInMaker,
    unlockedGroupIdsByPack,
    makerLibraryTab,
    makerItemWorkbenchRequest,
    makerWorkbenchDropCandidate,
    makerDragDiagnostics,
    orderedDataPacks,
    enabledDataPacks,
    itemLibraryItems,
    spellLibraryItems,
    traitEntries,
    init,
    refresh,
    togglePackEnabled,
    getPackVisibilitySummary,
    unlockByPassphrase,
    clearPackUnlocks,
    clearAllUnlocks,
    getUnlockedGroupCount,
    setIgnoreUnlockInMaker,
    movePack,
    importPack,
    exportPack,
    deletePack,
    openReservedEditor,
    openMaker,
    createDraftPack,
    saveDraftPack,
    closeMaker,
    markDraftDirty,
    setMakerLibraryTab,
    requestMakerItemWorkbench,
    armMakerWorkbenchDropCandidate,
    clearMakerWorkbenchDropCandidate,
    resolveMakerWorkbenchDropFromDragEnd,
    recordMakerDragDiagnostic,
    clearMakerDragDiagnostics,
    addMenuGroup,
    addMenuSubgroup,
    removeMenuGroup,
    ensureMenuGroupForAssignment,
    ensureItemAssignmentGroups,
    addEncryptionGroup,
    updateEncryptionGroup,
    removeEncryptionGroup,
    assignDraftSpellUnlockGroup,
    assignDraftTraitUnlockGroup,
    importItemToDraft,
    importSpellToDraft,
    importPackContentsToDraft,
    updateDraftEditLock,
    getItemGroups,
    getSpellGroups,
  };
});
