import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import type { Character } from '../src/types/Character'
import type { IpcFailureResult, IpcResult, IpcVoidResult } from '../src/types/electron'

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

const createErrorResult = (error: unknown): IpcFailureResult => ({
  success: false,
  error: toErrorMessage(error),
});

const MAIN_LOG_PREFIX = '[electron/main]';

const getLegacySavesDir = (): string => path.join(process.cwd(), 'saves');
const getLegacyWindowConfigPath = (): string => path.join(process.cwd(), 'window-config.json');
const getUserDataRoot = (): string => app.getPath('userData');
const getSavesDir = (): string => path.join(getUserDataRoot(), 'saves');
const getWindowConfigPath = (): string => path.join(getUserDataRoot(), 'window-config.json');

const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const directoryHasJsonFiles = (dirPath: string): boolean => {
  if (!fs.existsSync(dirPath)) return false;
  return fs.readdirSync(dirPath).some(file => file.endsWith('.json'));
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

  if (!directoryHasJsonFiles(savesDir) && directoryHasJsonFiles(legacySavesDir)) {
    copyDirectoryContents(legacySavesDir, savesDir);
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
    console.error(`${MAIN_LOG_PREFIX} Failed to load window state`, e);
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
    console.error(`${MAIN_LOG_PREFIX} Failed to save window state`, e);
  }
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
    win.loadFile('dist/index.html')
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
      console.error(`${MAIN_LOG_PREFIX} Save failed`, e);
      return createErrorResult(e);
    }
  });

  ipcMain.handle('load-all-characters', async (): Promise<IpcResult<Character[]>> => {
    try {
      const preferredSavesDir = getSavesDir();
      const fallbackSavesDir = getLegacySavesDir();
      const activeSavesDir = directoryHasJsonFiles(preferredSavesDir)
        ? preferredSavesDir
        : fallbackSavesDir;

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
      console.error(`${MAIN_LOG_PREFIX} Export failed`, e);
      return createErrorResult(e);
    }
  });
  //-----------------------------------------

  ipcMain.handle('app-can-close', () => {
    isReadyToQuit = true;
    win?.close();
  });
})
