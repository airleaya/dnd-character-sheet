import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'

// 🚨 删除之前添加的这两行 url 相关的代码
// import { fileURLToPath } from 'url'
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// ✅ 直接使用原生的 process.cwd() 和 __dirname，因为我们现在是 CommonJS 模式
const SAVE_DIR = path.join(process.cwd(), 'saves');

if (!fs.existsSync(SAVE_DIR)) {
  fs.mkdirSync(SAVE_DIR, { recursive: true });
}

let win: BrowserWindow | null = null
let isReadyToQuit = false;

const createWindow = () => {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      // ✅ 现在 __dirname 是原生支持的，直接用
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
        } catch (err) { return null; }
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

  ipcMain.handle('app-can-close', () => {
    isReadyToQuit = true;
    win?.close();
  });
})