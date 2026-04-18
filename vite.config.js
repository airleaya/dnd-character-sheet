import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/vue')) return 'vendor-vue'
          if (id.includes('node_modules/vuedraggable')) return 'vendor-dnd'
          if (id.includes('/src/data/spells/')) return 'spell-data'
          if (id.includes('/src/data/libraries/')) return 'library-data'
          if (id.includes('/src/components/sheet/spellbook/')) return 'spellbook-ui'
          if (id.includes('/src/components/sheet/library/')) return 'library-ui'
        },
      },
    },
  },
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
