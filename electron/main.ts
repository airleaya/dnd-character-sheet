import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import type { Character } from '../src/types/Character'
import type { ItemMagicTrait } from '../src/types/Library'
import type {
  DataPackExportOptions,
  DataPackFile,
  DataPackImportResult,
  DataPackSaveMode,
  DataPackSettings,
  DataPackState,
  DataPackUnlockProgress,
} from '../src/types/DataPack'
import type { IpcFailureResult, IpcResult, IpcVoidResult } from '../src/types/electron'
import { normalizeLogEntry } from '../src/utils/logging'
import {
  DATA_PACK_EXTENSION,
  DEFAULT_DATA_PACK_ID,
  buildExportableDefaultDataPack,
  createDefaultDataPackSettings,
  normalizeDataPackSettings,
  stripDataPackUnlockProgress,
  toRuntimeDataPack,
  validateDataPackFile,
} from '../src/utils/dataPackUtils'
import { DEFAULT_DND5E_DATA_PACK } from '../src/data/dataPacks/defaultDnd5ePack'
import { createMainLogger, initializeLogging, writeLogEntry } from './logger'

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

const createErrorResult = (error: unknown): IpcFailureResult => ({
  success: false,
  error: toErrorMessage(error),
});

const logger = createMainLogger('electron/main');

const getLegacySavesDir = (): string => path.join(process.cwd(), 'saves');
const getLegacyUserDataSavesDir = (): string => path.join(getUserDataRoot(), 'saves');
const getLegacyUserDataDataPacksRoot = (): string => path.join(getUserDataRoot(), 'data-packs');
const getLegacyStorageRoot = (): string => path.join(getUserDataRoot(), 'storage');
const getLegacyStorageSavesDir = (): string => path.join(getLegacyStorageRoot(), 'characters');
const getLegacyStorageDataPacksRoot = (): string => path.join(getLegacyStorageRoot(), 'data-packs');
const getLegacyWindowConfigPath = (): string => path.join(process.cwd(), 'window-config.json');
const getUserDataRoot = (): string => app.getPath('userData');
const getStorageRoot = (): string => path.join(getUserDataRoot(), 'dnd_5e_characters');
const getSavesDir = (): string => path.join(getStorageRoot(), 'characters');
const getWindowConfigPath = (): string => path.join(getUserDataRoot(), 'window-config.json');
const getDataPacksRoot = (): string => path.join(getStorageRoot(), 'data-packs');
const getImportedDataPacksDir = (): string => path.join(getDataPacksRoot(), 'imported');
const getDataPackSettingsPath = (): string => path.join(getDataPacksRoot(), 'data-pack-settings.json');
const getLocalEditorIdPath = (): string => path.join(getDataPacksRoot(), 'local-editor-id');
const getMagicTraitsRoot = (): string => path.join(getStorageRoot(), 'magic-traits');
const getCustomMagicTraitsPath = (): string => path.join(getMagicTraitsRoot(), 'custom-magic-traits.json');

const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const directoryHasJsonFiles = (dirPath: string): boolean => {
  if (!fs.existsSync(dirPath)) return false;
  return fs.readdirSync(dirPath).some(file => file.endsWith('.json'));
};

const directoryHasDataPackFiles = (dirPath: string): boolean => {
  const importedDir = path.join(dirPath, 'imported');
  return fs.existsSync(importedDir) && fs.readdirSync(importedDir).some(file => file.endsWith(DATA_PACK_EXTENSION));
};

const copyDirectoryContents = (sourceDir: string, targetDir: string): void => {
  if (!fs.existsSync(sourceDir)) return;

  ensureDirectoryExists(targetDir);
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryContents(sourcePath, targetPath);
      continue;
    }

    if (!fs.existsSync(targetPath)) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
};

const migrateLegacyStorageIfNeeded = (): void => {
  const savesDir = getSavesDir();
  const legacySavesDir = getLegacySavesDir();
  const windowConfigPath = getWindowConfigPath();
  const legacyWindowConfigPath = getLegacyWindowConfigPath();

  ensureDirectoryExists(savesDir);
  ensureDirectoryExists(getImportedDataPacksDir());

  if (!directoryHasJsonFiles(savesDir)) {
    if (directoryHasJsonFiles(getLegacyStorageSavesDir())) {
      copyDirectoryContents(getLegacyStorageSavesDir(), savesDir);
    } else if (directoryHasJsonFiles(getLegacyUserDataSavesDir())) {
      copyDirectoryContents(getLegacyUserDataSavesDir(), savesDir);
    } else if (directoryHasJsonFiles(legacySavesDir)) {
      copyDirectoryContents(legacySavesDir, savesDir);
    }
  }

  if (!directoryHasDataPackFiles(getDataPacksRoot())) {
    if (directoryHasDataPackFiles(getLegacyStorageDataPacksRoot())) {
      copyDirectoryContents(getLegacyStorageDataPacksRoot(), getDataPacksRoot());
    } else if (directoryHasDataPackFiles(getLegacyUserDataDataPacksRoot())) {
      copyDirectoryContents(getLegacyUserDataDataPacksRoot(), getDataPacksRoot());
    }
  }

  if (!fs.existsSync(windowConfigPath) && fs.existsSync(legacyWindowConfigPath)) {
    ensureDirectoryExists(path.dirname(windowConfigPath));
    fs.copyFileSync(legacyWindowConfigPath, windowConfigPath);
  }
};

let win: BrowserWindow | null = null
let isReadyToQuit = false;

// 读取窗口状态辅助函数
const loadWindowState = () => {
  const candidatePaths = [getWindowConfigPath(), getLegacyWindowConfigPath()];

  try {
    for (const configPath of candidatePaths) {
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      }
    }
  } catch (e) {
    logger.error('Failed to load window state', e);
  }
  return null; 
};

// 保存窗口状态辅助函数
const saveWindowState = () => {
  if (!win) return;
  try {
    const bounds = win.getBounds();
    const configPath = getWindowConfigPath();
    ensureDirectoryExists(path.dirname(configPath));
    fs.writeFileSync(configPath, JSON.stringify(bounds));
  } catch (e) {
    logger.error('Failed to save window state', e);
  }
};

const safeDataPackFileName = (packId: string): string => `${packId}${DATA_PACK_EXTENSION}`;
const getImportedDataPackPath = (packId: string): string => path.join(getImportedDataPacksDir(), safeDataPackFileName(packId));
const getDataPackPathInRoot = (rootDir: string, packId: string): string =>
  path.join(rootDir, 'imported', safeDataPackFileName(packId));
const getLegacyDataPackRoots = (): string[] => [getLegacyStorageDataPacksRoot(), getLegacyUserDataDataPacksRoot()];

const findExistingDataPackPath = (packId: string): string | undefined =>
  [getDataPacksRoot(), ...getLegacyDataPackRoots()]
    .map(root => getDataPackPathInRoot(root, packId))
    .find(filePath => fs.existsSync(filePath));

const ensureEditableDataPackInCurrentStorage = (packId: string): string | undefined => {
  const currentPath = getImportedDataPackPath(packId);
  if (fs.existsSync(currentPath)) return currentPath;

  const legacyPath = getLegacyDataPackRoots()
    .map(root => getDataPackPathInRoot(root, packId))
    .find(filePath => fs.existsSync(filePath));
  if (!legacyPath) return undefined;

  ensureDirectoryExists(getImportedDataPacksDir());
  fs.copyFileSync(legacyPath, currentPath);
  return currentPath;
};

const readJsonFile = (filePath: string): unknown => JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const normalizeCustomMagicTraitsForStorage = (value: unknown): ItemMagicTrait[] => {
  if (!Array.isArray(value)) return [];
  const traits = new Map<string, ItemMagicTrait>();
  value.forEach(entry => {
    if (!entry || typeof entry !== 'object') return;
    const trait = entry as Partial<ItemMagicTrait>;
    if (typeof trait.id !== 'string' || !trait.id.trim()) return;
    if (typeof trait.name !== 'string' || !trait.name.trim()) return;
    traits.set(trait.id, {
      id: trait.id,
      source: 'custom',
      type: trait.type === 'damage' || trait.type === 'spell' || trait.type === 'defense' ? trait.type : 'plain',
      name: trait.name,
      description: typeof trait.description === 'string' ? trait.description : '',
      activationMode: trait.activationMode === 'charged' ? 'charged' : 'always',
      participatesInDamage: trait.participatesInDamage === true,
      damageDice: typeof trait.damageDice === 'string' ? trait.damageDice : undefined,
      damageBonus: typeof trait.damageBonus === 'number' ? trait.damageBonus : undefined,
      damageType: typeof trait.damageType === 'string' ? trait.damageType : undefined,
      spellId: typeof trait.spellId === 'string' ? trait.spellId : undefined,
      spellExtraDescription: typeof trait.spellExtraDescription === 'string' ? trait.spellExtraDescription : undefined,
      charges:
        trait.charges && typeof trait.charges === 'object'
          ? {
              current: typeof trait.charges.current === 'number' ? trait.charges.current : 0,
              max: typeof trait.charges.max === 'number' ? trait.charges.max : 0,
              resetCondition: typeof trait.charges.resetCondition === 'string' ? trait.charges.resetCondition : undefined,
              resetFormula: typeof trait.charges.resetFormula === 'string' ? trait.charges.resetFormula : undefined,
            }
          : undefined,
    });
  });
  return Array.from(traits.values());
};

const readCustomMagicTraits = (): ItemMagicTrait[] => {
  ensureDirectoryExists(getMagicTraitsRoot());
  const filePath = getCustomMagicTraitsPath();
  if (!fs.existsSync(filePath)) return [];
  return normalizeCustomMagicTraitsForStorage(readJsonFile(filePath));
};

const writeCustomMagicTraits = (traits: ItemMagicTrait[]): ItemMagicTrait[] => {
  const normalized = normalizeCustomMagicTraitsForStorage(traits);
  ensureDirectoryExists(getMagicTraitsRoot());
  fs.writeFileSync(getCustomMagicTraitsPath(), JSON.stringify(normalized, null, 2), 'utf-8');
  logger.info('Custom magic traits saved to local storage', { traitCount: normalized.length });
  return normalized;
};

const summarizeDataPackFile = (dataPack: DataPackFile) => ({
  packId: dataPack.manifest.id,
  packName: dataPack.manifest.name,
  itemCount: dataPack.items?.length ?? 0,
  spellCount: dataPack.spells?.length ?? 0,
  traitCount: dataPack.traits?.length ?? 0,
  encryptionGroupCount: dataPack.editorMeta?.encryptionGroups?.length ?? 0,
  hasEditLock: Boolean(dataPack.editorMeta?.editLock?.enabled),
});

const sha256 = (value: string): string => crypto.createHash('sha256').update(value).digest('hex');

const getLocalEditorIdHash = (): string => {
  ensureDirectoryExists(getDataPacksRoot());
  const editorIdPath = getLocalEditorIdPath();
  if (!fs.existsSync(editorIdPath)) {
    fs.writeFileSync(editorIdPath, crypto.randomUUID(), 'utf-8');
  }
  return sha256(fs.readFileSync(editorIdPath, 'utf-8').trim());
};

const readImportedDataPackFiles = (): DataPackFile[] => {
  const importedDir = getImportedDataPacksDir();
  ensureDirectoryExists(importedDir);

  return fs.readdirSync(importedDir)
    .filter(file => file.endsWith(DATA_PACK_EXTENSION))
    .map(file => validateDataPackFile(readJsonFile(path.join(importedDir, file))));
};

const readDataPackSettings = (knownPackIds: string[]): DataPackSettings => {
  const settingsPath = getDataPackSettingsPath();

  if (!fs.existsSync(settingsPath)) {
    return normalizeDataPackSettings(createDefaultDataPackSettings(), knownPackIds);
  }

  try {
    return normalizeDataPackSettings(readJsonFile(settingsPath) as Partial<DataPackSettings>, knownPackIds);
  } catch (e) {
    logger.warn('Failed to read data pack settings, using defaults', { error: toErrorMessage(e) });
    return normalizeDataPackSettings(createDefaultDataPackSettings(), knownPackIds);
  }
};

const writeDataPackSettings = (settings: DataPackSettings, knownPackIds: string[]): DataPackSettings => {
  const normalized = normalizeDataPackSettings(settings, knownPackIds);
  ensureDirectoryExists(getDataPacksRoot());
  fs.writeFileSync(getDataPackSettingsPath(), JSON.stringify(normalized, null, 2), 'utf-8');
  return normalized;
};

const readDataPackState = (): DataPackState => {
  const importedFiles = readImportedDataPackFiles();
  const knownPackIds = [DEFAULT_DATA_PACK_ID, ...importedFiles.map(file => file.manifest.id)];
  const settings = readDataPackSettings(knownPackIds);
  const enabledIds = new Set(settings.enabledPackIds);
  const importedPacks = importedFiles.map(file => toRuntimeDataPack(file, enabledIds.has(file.manifest.id), false));
  const defaultPack = {
    ...DEFAULT_DND5E_DATA_PACK,
    enabled: enabledIds.has(DEFAULT_DATA_PACK_ID),
  };
  const packMap = new Map([defaultPack, ...importedPacks].map(pack => [pack.id, pack]));
  const packs = settings.packOrder
    .map(packId => packMap.get(packId))
    .filter((pack): pack is typeof defaultPack => Boolean(pack));

  return { packs, settings };
};

const normalizeUnlockProgressForStorage = (progress?: DataPackUnlockProgress): DataPackUnlockProgress | undefined => {
  if (!progress) return undefined;
  const unlockedGroupIds = Array.isArray(progress.unlockedGroupIds)
    ? progress.unlockedGroupIds.filter((id, index, list) => typeof id === 'string' && id && list.indexOf(id) === index)
    : [];
  const allPublic = progress.allPublic === true;
  if (!allPublic && unlockedGroupIds.length === 0) return undefined;
  return {
    allPublic,
    unlockedGroupIds,
    updatedAt: typeof progress.updatedAt === 'string' ? progress.updatedAt : new Date().toISOString(),
  };
};

const updateDataPackUnlockProgress = (packId: string, progress?: DataPackUnlockProgress): void => {
  if (packId === DEFAULT_DATA_PACK_ID) throw new Error('默认数据包不能写入口令进度');
  const filePath = ensureEditableDataPackInCurrentStorage(packId);
  if (!filePath) throw new Error(`未找到数据包：${packId}`);
  const dataPack = validateDataPackFile(readJsonFile(filePath));
  dataPack.editorMeta ??= {};
  const normalized = normalizeUnlockProgressForStorage(progress);
  if (normalized) {
    dataPack.editorMeta.unlockProgress = normalized;
  } else {
    dataPack.editorMeta.unlockProgress = undefined;
  }
  fs.writeFileSync(filePath, JSON.stringify(dataPack, null, 2), 'utf-8');
  logger.info('Data pack unlock progress updated', {
    packId,
    unlockedGroupCount: normalized?.unlockedGroupIds?.length ?? 0,
    allPublic: normalized?.allPublic === true,
  });
};

const getExportableDataPack = (packId: string, options: DataPackExportOptions = {}): DataPackFile => {
  if (packId === DEFAULT_DATA_PACK_ID) {
    return buildExportableDefaultDataPack({
      ...DEFAULT_DND5E_DATA_PACK,
      version: '0.14.2',
      manifest: {
        ...DEFAULT_DND5E_DATA_PACK.manifest,
        version: '0.14.2',
      },
    });
  }

  const imported = readImportedDataPackFiles().find(file => file.manifest.id === packId);
  if (!imported) throw new Error(`未找到数据包：${packId}`);
  return options.resetUnlockProgress === false ? imported : stripDataPackUnlockProgress(imported);
};

const readEditableDataPackFile = (packId: string): DataPackFile => {
  if (packId === DEFAULT_DATA_PACK_ID) throw new Error('默认数据包不能编辑');
  const filePath = ensureEditableDataPackInCurrentStorage(packId);
  if (!filePath) throw new Error(`未找到数据包：${packId}`);
  return validateDataPackFile(readJsonFile(filePath));
};

const saveEditableDataPackFile = (packFile: DataPackFile, mode: DataPackSaveMode): DataPackFile => {
  const dataPack = validateDataPackFile(packFile);
  if (dataPack.manifest.id === DEFAULT_DATA_PACK_ID) throw new Error('默认数据包不能编辑');

  ensureDirectoryExists(getImportedDataPacksDir());
  const filePath = ensureEditableDataPackInCurrentStorage(dataPack.manifest.id) ?? getImportedDataPackPath(dataPack.manifest.id);
  const exists = fs.existsSync(filePath);

  if (mode === 'create' && exists) {
    throw new Error(`已存在同 id 数据包：${dataPack.manifest.id}`);
  }
  if (mode === 'update' && !exists) {
    logger.warn('Editable data pack missing in current storage; saving it as a recovered pack', {
      packId: dataPack.manifest.id,
      legacyPath: findExistingDataPackPath(dataPack.manifest.id),
    });
  }

  if (mode === 'update' && exists) {
    const existing = validateDataPackFile(readJsonFile(filePath));
    if (existing.manifest.id !== dataPack.manifest.id) {
      throw new Error('数据包 id 创建后不可修改');
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(dataPack, null, 2), 'utf-8');
  logger.info('Editable data pack saved to local storage', {
    ...summarizeDataPackFile(dataPack),
    mode,
  });

  const importedFiles = readImportedDataPackFiles();
  const knownPackIds = [DEFAULT_DATA_PACK_ID, ...importedFiles.map(file => file.manifest.id)];
  const settings = readDataPackSettings(knownPackIds);
  writeDataPackSettings({
    enabledPackIds: settings.enabledPackIds.includes(dataPack.manifest.id)
      ? settings.enabledPackIds
      : [...settings.enabledPackIds, dataPack.manifest.id],
    packOrder: settings.packOrder.includes(dataPack.manifest.id)
      ? settings.packOrder
      : [...settings.packOrder, dataPack.manifest.id],
  }, knownPackIds);

  return dataPack;
};

const createWindow = () => {
  //创建前先读取状态
  const state = loadWindowState();

  win = new BrowserWindow({
    //优先使用保存的宽高和位置，否则使用默认值
    width: state?.width || 1280,
    height: state?.height || 800,
    x: state?.x, 
    y: state?.y,
    minWidth: 1024, // 最小限制
    minHeight: 600,

    webPreferences: {
      // 现在 __dirname 是原生支持的，直接用
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  win.on('close', (e) => {
    if (!isReadyToQuit) {
      e.preventDefault(); 

      //在关闭流程触发时，保存当前窗口状态
      saveWindowState();

      win?.webContents.send('app-will-close');
      // 3秒超时强制关闭保险
      setTimeout(() => {
        if (!isReadyToQuit) {
          isReadyToQuit = true;
          win?.close();
        }
      }, 3000);
    }
  });
}

app.whenReady().then(() => {
  initializeLogging(getUserDataRoot());
  ipcMain.handle('write-log', async (_event, entry): Promise<IpcVoidResult> => {
    try {
      writeLogEntry(normalizeLogEntry(entry));
      return { success: true, data: null };
    } catch (e) {
      logger.error('Renderer log write failed', e);
      return createErrorResult(e);
    }
  });

  ipcMain.handle('read-custom-magic-traits', async (): Promise<IpcResult<ItemMagicTrait[]>> => {
    try {
      const traits = readCustomMagicTraits();
      logger.info('Custom magic traits read', { traitCount: traits.length });
      return { success: true, data: traits };
    } catch (e) {
      logger.error('Failed to read custom magic traits', e);
      return createErrorResult(e);
    }
  });

  ipcMain.handle('save-custom-magic-traits', async (_event, traits: ItemMagicTrait[]): Promise<IpcResult<ItemMagicTrait[]>> => {
    try {
      return { success: true, data: writeCustomMagicTraits(traits) };
    } catch (e) {
      logger.error('Failed to save custom magic traits', e);
      return createErrorResult(e);
    }
  });

  ipcMain.handle('read-data-pack-state', async (): Promise<IpcResult<DataPackState>> => {
    try {
      const state = readDataPackState();
      logger.info('Data pack state read', {
        packCount: state.packs.length,
        enabledCount: state.settings.enabledPackIds.length,
      });
      return { success: true, data: state };
    } catch (e) {
      logger.error('Failed to read data pack state', e);
      return createErrorResult(e);
    }
  });

  ipcMain.handle('import-data-pack', async (): Promise<IpcResult<DataPackImportResult | null>> => {
    try {
      if (!win) return { success: true, data: null };

      const result = await dialog.showOpenDialog(win, {
        title: '导入数据包',
        properties: ['openFile'],
        filters: [{ name: 'DND 数据包', extensions: ['dndpack.json', 'json'] }],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { success: true, data: null };
      }

      const dataPack = validateDataPackFile(readJsonFile(result.filePaths[0]));
      if (dataPack.manifest.id === DEFAULT_DATA_PACK_ID) {
        throw new Error('该数据包 id 为保留 id，不能导入');
      }

      const importedFiles = readImportedDataPackFiles();
      if (importedFiles.some(file => file.manifest.id === dataPack.manifest.id)) {
        throw new Error(`已存在同 id 数据包：${dataPack.manifest.id}`);
      }

      ensureDirectoryExists(getImportedDataPacksDir());
      fs.writeFileSync(
        path.join(getImportedDataPacksDir(), safeDataPackFileName(dataPack.manifest.id)),
        JSON.stringify(dataPack, null, 2),
        'utf-8'
      );
      logger.info('Data pack imported into local storage', summarizeDataPackFile(dataPack));

      const knownPackIds = [DEFAULT_DATA_PACK_ID, ...importedFiles.map(file => file.manifest.id), dataPack.manifest.id];
      const settings = readDataPackSettings(knownPackIds);
      writeDataPackSettings({
        enabledPackIds: [...settings.enabledPackIds, dataPack.manifest.id],
        packOrder: [...settings.packOrder.filter(id => id !== dataPack.manifest.id), dataPack.manifest.id],
      }, knownPackIds);

      return {
        success: true,
        data: {
          packId: dataPack.manifest.id,
          name: dataPack.manifest.name,
          itemCount: dataPack.items?.length ?? 0,
          spellCount: dataPack.spells?.length ?? 0,
          traitCount: dataPack.traits?.length ?? 0,
        },
      };
    } catch (e) {
      logger.error('Failed to import data pack', e);
      return createErrorResult(e);
    }
  });

  ipcMain.handle('export-data-pack', async (_event, packId: string, options?: DataPackExportOptions): Promise<IpcVoidResult> => {
    try {
      if (!win) return { success: true, data: null };

      const dataPack = getExportableDataPack(packId, options);
      const result = await dialog.showSaveDialog(win, {
        title: '导出数据包',
        defaultPath: safeDataPackFileName(dataPack.manifest.id),
        filters: [{ name: 'DND 数据包', extensions: ['dndpack.json'] }],
      });

      if (result.canceled || !result.filePath) {
        return { success: true, data: null };
      }

      fs.writeFileSync(result.filePath, JSON.stringify(dataPack, null, 2), 'utf-8');
      logger.info('Data pack exported', {
        ...summarizeDataPackFile(dataPack),
        fileName: path.basename(result.filePath),
        resetUnlockProgress: options?.resetUnlockProgress !== false,
      });
      return { success: true, data: null };
    } catch (e) {
      logger.error('Failed to export data pack', e, { packId });
      return createErrorResult(e);
    }
  });

  ipcMain.handle('delete-data-pack', async (_event, packId: string): Promise<IpcVoidResult> => {
    try {
      if (packId === DEFAULT_DATA_PACK_ID) {
        throw new Error('默认数据包不能删除');
      }

      const filePath = path.join(getImportedDataPacksDir(), safeDataPackFileName(packId));
      const resolvedDir = path.resolve(getImportedDataPacksDir());
      const resolvedFile = path.resolve(filePath);
      if (!resolvedFile.startsWith(resolvedDir + path.sep)) {
        throw new Error('非法数据包路径');
      }

      if (fs.existsSync(resolvedFile)) {
        fs.unlinkSync(resolvedFile);
      }
      logger.info('Data pack deleted from local storage', { packId });

      const remainingIds = [DEFAULT_DATA_PACK_ID, ...readImportedDataPackFiles().map(file => file.manifest.id)];
      const settings = readDataPackSettings(remainingIds);
      writeDataPackSettings(settings, remainingIds);
      return { success: true, data: null };
    } catch (e) {
      logger.error('Failed to delete data pack', e, { packId });
      return createErrorResult(e);
    }
  });

  ipcMain.handle('update-data-pack-settings', async (_event, settings: DataPackSettings): Promise<IpcResult<DataPackSettings>> => {
    try {
      const knownPackIds = [DEFAULT_DATA_PACK_ID, ...readImportedDataPackFiles().map(file => file.manifest.id)];
      const normalized = writeDataPackSettings(settings, knownPackIds);
      logger.info('Data pack settings updated', {
        enabledCount: normalized.enabledPackIds.length,
        orderCount: normalized.packOrder.length,
      });
      return { success: true, data: normalized };
    } catch (e) {
      logger.error('Failed to update data pack settings', e);
      return createErrorResult(e);
    }
  });

  ipcMain.handle('update-data-pack-unlock-progress', async (
    _event,
    packId: string,
    progress?: DataPackUnlockProgress
  ): Promise<IpcVoidResult> => {
    try {
      updateDataPackUnlockProgress(packId, progress);
      return { success: true, data: null };
    } catch (e) {
      logger.error('Failed to update data pack unlock progress', e, { packId });
      return createErrorResult(e);
    }
  });

  ipcMain.handle('read-editable-data-pack', async (_event, packId: string): Promise<IpcResult<DataPackFile>> => {
    try {
      const dataPack = readEditableDataPackFile(packId);
      logger.info('Editable data pack read', summarizeDataPackFile(dataPack));
      return { success: true, data: dataPack };
    } catch (e) {
      logger.error('Failed to read editable data pack', e, { packId });
      return createErrorResult(e);
    }
  });

  ipcMain.handle('save-editable-data-pack', async (_event, packFile: DataPackFile, mode: DataPackSaveMode): Promise<IpcResult<DataPackFile>> => {
    try {
      return { success: true, data: saveEditableDataPackFile(packFile, mode) };
    } catch (e) {
      logger.error('Failed to save editable data pack', e, { packId: packFile?.manifest?.id, mode });
      return createErrorResult(e);
    }
  });

  ipcMain.handle('get-local-editor-id-hash', async (): Promise<IpcResult<string>> => {
    try {
      return { success: true, data: getLocalEditorIdHash() };
    } catch (e) {
      logger.error('Failed to get local editor id hash', e);
      return createErrorResult(e);
    }
  });

  migrateLegacyStorageIfNeeded();
  createWindow()

  // --- IPC 监听保持不变 ---
  ipcMain.handle('save-character', async (_event, filename: string, content: string): Promise<IpcVoidResult> => {
    try {
      const savesDir = getSavesDir();
      ensureDirectoryExists(savesDir);
      const filePath = path.join(savesDir, filename);
      fs.writeFileSync(filePath, content, 'utf-8');
      return { success: true, data: null };
    } catch (e) {
      logger.error('Save failed', e, { filename });
      return createErrorResult(e);
    }
  });

  ipcMain.handle('load-all-characters', async (): Promise<IpcResult<Character[]>> => {
    try {
      const preferredSavesDir = getSavesDir();
      const activeSavesDir = [preferredSavesDir, getLegacyStorageSavesDir(), getLegacyUserDataSavesDir(), getLegacySavesDir()]
        .find(directoryHasJsonFiles) ?? preferredSavesDir;

      ensureDirectoryExists(preferredSavesDir);
      const files = fs.existsSync(activeSavesDir)
        ? fs.readdirSync(activeSavesDir).filter(f => f.endsWith('.json'))
        : [];

      const characters = files
        .map(file => {
          try {
            const content = fs.readFileSync(path.join(activeSavesDir, file), 'utf-8');
            return JSON.parse(content) as Character;
          } catch {
            return null;
          }
        })
        .filter((character): character is Character => character !== null);

      return { success: true, data: characters };
    } catch (e) {
      return createErrorResult(e);
    }
  });

  ipcMain.handle('delete-character', async (_event, filename: string): Promise<IpcVoidResult> => {
    try {
      const filePath = path.join(getSavesDir(), filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return { success: true, data: null };
    } catch (e) {
      return createErrorResult(e);
    }
  });

  // -------------------------------------------------------------
  // 批量导出相关 API
  // 1. 打开文件夹选择对话框
  ipcMain.handle('select-directory', async () => {
    if (!win) return null;
    const result = await dialog.showOpenDialog(win, {
      title: '选择导出文件夹',
      properties: ['openDirectory', 'createDirectory']
    });
    
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0]; // 返回用户选中的目录路径
  });

  // 2. 导出文件到指定目录 (允许写入任意路径)
  ipcMain.handle('export-character', async (_event, dirPath: string, filename: string, content: string): Promise<IpcVoidResult> => {
    try {
      const fullPath = path.join(dirPath, filename);
      fs.writeFileSync(fullPath, content, 'utf-8');
      return { success: true, data: null };
    } catch (e) {
      logger.error('Export failed', e, { dirPath, filename });
      return createErrorResult(e);
    }
  });
  //-----------------------------------------

  ipcMain.handle('app-can-close', () => {
    isReadyToQuit = true;
    win?.close();
  });
})
