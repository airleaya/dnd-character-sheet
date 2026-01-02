// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia' // 1. 引入 Pinia
import App from './App.vue'
import { vTooltip } from './directives/vTooltip'; // 引入指令

// 如果你之前删除了 style.css 文件，请确保没有下面这行 import './style.css'
// 如果你只是清空了 style.css 的内容但文件还在，可以保留下面这行（或者干脆删掉也行）
// import './style.css' 

const app = createApp(App)

// ✅ 注册全局指令
app.directive('tooltip', vTooltip);

app.use(createPinia()) // 2. 告诉 Vue 使用 Pinia
app.mount('#app')