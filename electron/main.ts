import { app, BrowserWindow, ipcMain,dialog } from 'electron'
import path from 'path'
import fs from 'fs'

// 🚨 删除之前添加的这两行 url 相关的代码
// import { fileURLToPath } from 'url'
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// 直接使用原生的 process.cwd() 和 __dirname，因为我们现在是 CommonJS 模式
const SAVE_DIR = path.join(process.cwd(), 'saves');
// 定义窗口配置文件路径
const CONFIG_PATH = path.join(process.cwd(), 'window-config.json');


if (!fs.existsSync(SAVE_DIR)) {
  fs.mkdirSync(SAVE_DIR, { recursive: true });
}

let win: BrowserWindow | null = null
let isReadyToQuit = false;

// 读取窗口状态辅助函数
const loadWindowState = () => {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load window state:', e);
  }
  return null; 
};

// 保存窗口状态辅助函数
const saveWindowState = () => {
  if (!win) return;
  try {
    const bounds = win.getBounds(); // 包含 x, y, width, height
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(bounds));
  } catch (e) {
    console.error('Failed to save window state:', e);
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
  createWindow()

  // --- IPC 监听保持不变 ---
  ipcMain.handle('save-character', async (_event, filename, content) => {
    try {
      const filePath = path.join(SAVE_DIR, filename);
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('✅ Saved:', filePath);
      return { success: true };
    } catch (e) {
      console.error('Save Error:', e);
      return { success: false, error: e };
    }
  });

  ipcMain.handle('load-all-characters', async () => {
    try {
      const files = fs.readdirSync(SAVE_DIR).filter(f => f.endsWith('.json'));
      const characters = files.map(file => {
        try {
          const content = fs.readFileSync(path.join(SAVE_DIR, file), 'utf-8');
          return JSON.parse(content);
        } catch { return null; }
      }).filter(Boolean);
      return { success: true, data: characters };
    } catch (e) {
      return { success: false, error: e };
    }
  });

  ipcMain.handle('delete-character', async (_event, filename) => {
    try {
      const filePath = path.join(SAVE_DIR, filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return { success: true };
    } catch (e) { return { success: false, error: e }; }
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
  ipcMain.handle('export-character', async (_event, dirPath, filename, content) => {
    try {
      const fullPath = path.join(dirPath, filename);
      fs.writeFileSync(fullPath, content, 'utf-8');
      console.log('✅ Exported to:', fullPath);
      return { success: true };
    } catch (e) {
      console.error('Export Error:', e);
      return { success: false, error: e };
    }
  });
  //-----------------------------------------

  ipcMain.handle('app-can-close', () => {
    isReadyToQuit = true;
    win?.close();
  });
})