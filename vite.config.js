import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'

export default defineConfig({
  plugins: [
    vue(),
    electron([
      {
        // 主进程入口
        entry: 'electron/main.ts',
      },
      {
        // 🚨 关键修复：显式添加预加载脚本入口
        entry: 'electron/preload.ts',
        onstart(options) {
          // 预加载脚本更新时通知主进程刷新
          options.reload()
        },
      },
    ]),
  ],
})