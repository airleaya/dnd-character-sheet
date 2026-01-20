<script setup lang="ts">
import { ref,onMounted,onUnmounted,nextTick } from 'vue';
import { useCharacterStore } from '../../stores/characterStore';
import { useActiveSheetStore } from '../../stores/activeSheet';

const charStore = useCharacterStore();
const activeStore = useActiveSheetStore();
const fileInput = ref<HTMLInputElement | null>(null); // 文件输入框引用

  // --- 🆕 批量操作状态 ---
const isBulkMode = ref(false);
const selectedIds = ref<Set<string>>(new Set());

// 切换批量模式
const toggleBulkMode = () => {
  isBulkMode.value = !isBulkMode.value;
  selectedIds.value.clear(); // 退出或进入时都清空选择
};

// 处理列表项点击
const handleItemClick = (id: string) => {
  if (isBulkMode.value) {
    // 批量模式：切换选中状态
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id);
    } else {
      selectedIds.value.add(id);
    }
  } else {
    // 普通模式：切换当前角色
    activeStore.loadCharacter(id);
  }
};

// 全选/反选
const toggleSelectAll = () => {
  if (selectedIds.value.size === charStore.characterList.length) {
    selectedIds.value.clear();
  } else {
    charStore.characterList.forEach(c => selectedIds.value.add(c.id));
  }
};

// --- 🆕 批量导出逻辑 ---
const handleBulkExport = async () => {
  const ids = Array.from(selectedIds.value);
  if (ids.length === 0) return alert('请先选择要导出的角色');

  // 1. 请求用户选择目标文件夹
  const targetDir = await window.electronAPI.selectDirectory();
  if (!targetDir) return; // 用户取消

  let successCount = 0;
  
  // 2. 循环导出
  for (const id of ids) {
    const char = charStore.getCharacterData(id);
    if (char) {
      // 生成文件名
      const safeName = (char.profile.name || '未命名').replace(/[\\/:*?"<>|]/g, '_');
      const filename = `${safeName}_Lv${char.profile.level}.json`;
      
      try {
        const json = JSON.stringify(char, null, 2);
        // 调用新 API 写入外部文件夹
        await window.electronAPI.exportCharacter(targetDir, filename, json);
        successCount++;
      } catch (e) {
        console.error(`导出 ${char.profile.name} 失败`, e);
      }
    }
  }

  alert(`✅ 已成功导出 ${successCount} 个角色到:\n${targetDir}`);
  isBulkMode.value = false; // 导出完成后退出批量模式
};

// --- 🆕 批量删除逻辑 ---
const handleBulkDelete = async () => {
  const ids = Array.from(selectedIds.value);
  const count = ids.length;
  if (count === 0) return;

  if (!confirm(`⚠️ 危险操作：确定要永久删除这 ${count} 个角色吗？\n此操作无法撤销！`)) {
    return;
  }

  // 循环删除
  for (const id of ids) {
    await charStore.deleteCharacter(id);
  }

  // 如果当前正在查看的角色被删除了，清空视图
  if (activeStore.character && ids.includes(activeStore.character.id)) {
    activeStore.character = null;
  }

  selectedIds.value.clear();
  // 保持批量模式，方便继续操作，或者根据偏好也可以退出
  // isBulkMode.value = false; 
};

// 🗑️ 删除角色
const handleDelete = (e: Event, id: string, name: string) => {
  e.stopPropagation(); // 防止触发 handleSelect
  if (confirm(`⚠️ 确定要永久删除角色 "${name}" 吗？此操作无法撤销。`)) {
    charStore.deleteCharacter(id);
    // 如果删除的是当前选中的角色，清空当前视图
    if (activeStore.character?.id === id) {
      activeStore.character = null;
    }
  }
};

// 新建角色并自动打开
// async
const handleCreate = async () => {
  // await，等待创建完成拿到 ID 字符串
  const newId = await charStore.createNewCharacter();
  
  // 此时 newId 是 string，不再是 Promise，可以安全传入
  activeStore.loadCharacter(newId);

  // 等待 DOM 渲染完成后，强制拉回焦点
  // 解决“点击输入框无反应”的问题
  await nextTick();
  window.focus();
};

// 切换角色
const handleSelect = (id: string) => {
  activeStore.loadCharacter(id);
};



// 📤 导出当前选中的角色 (增强版)
const handleExport = () => {
  // 1. 获取当前正在查看的角色对象
  const charInMemory = activeStore.character;
  
  if (!charInMemory) {
    alert('⚠️ 导出失败：当前没有选中的角色');
    return;
  }

  // 2. 尝试从 Store (LocalStorage) 导出
  let result = charStore.exportCharacter(charInMemory.id);

  // 3. 🚨 兜底逻辑：如果 LocalStorage 里找不到 (比如刚刚新建还未保存，或缓存丢失)
  // 我们直接把当前内存里的 activeStore.character 导出
  if (!result) {
    console.warn('LocalStorage 中未找到该角色，正在使用内存数据导出...');
    
    try {
      const json = JSON.stringify(charInMemory, null, 2);
      // 生成文件名
      const safeName = charInMemory.profile.name.replace(/[^a-z0-9\u4e00-\u9fa5\._\-]/gi, '_');
      const filename = `${safeName}_Lv${charInMemory.profile.level}.json`;
      
      result = { json, filename };
    } catch (e) {
      console.error(e);
      alert('❌ 导出发生严重错误，请查看控制台');
      return;
    }
  }

  // 4. 执行浏览器下载
  if (result) {
    const blob = new Blob([result.json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    
    // 兼容 Firefox
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url); // 释放内存
  } else {
    alert('❌ 导出失败：无法生成数据');
  }
};

// 📥 触发导入 (点击隐藏的 file input)
const triggerImport = () => {
  fileInput.value?.click();
};

// 🆕 辅助函数：将 FileReader 封装为 Promise，以便在循环中 await
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string || '');
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

// 🔄 重构：处理文件选择 (支持批量 + 防止卡死)
const onFileSelected = async (e: Event) => {
  const input = (e.target as HTMLInputElement);
  const files = input.files;
  
  // 如果没有选择文件，直接返回
  if (!files || files.length === 0) return;

  let successCount = 0;       // 成功计数
  let lastNewId: string | null = null; // 记录最后一个成功的ID

  // 1. 循环处理所有选中的文件
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      // 串行等待文件读取
      const content = await readFileAsText(file);
      if (content) {
        // 等待 Store 执行导入
        const newId = await charStore.importCharacter(content);
        if (newId) {
          successCount++;
          lastNewId = newId; // 更新最后一个 ID
        }
      }
    } catch (err) {
      console.error(`❌ 文件 "${file.name}" 导入失败:`, err);
      // 这里不中断循环，继续处理下一个文件
    }
  }

  // 2. 所有文件处理完毕后的收尾工作
  if (successCount > 0 && lastNewId) {
    await nextTick();
    
    // 自动加载最后一个导入的角色，给用户反馈
    activeStore.loadCharacter(lastNewId);
    
    // ⚠️ 核心修复：强制窗口重新获取焦点，防止输入框卡死
    // 放在循环结束后执行一次即可
    window.focus();
    
    console.log(`✅ 批量操作完成：成功导入 ${successCount} 个角色`);
  } else if (successCount === 0) {
    console.warn('⚠️ 没有角色被成功导入');
  }

  // 3. 清空 input，允许下次选择相同文件
  input.value = ''; 
};

// 手动保存处理
const handleSave = async () => {
  if (!activeStore.character) return;
  
  try {
    await charStore.saveCharacterData(activeStore.character);
    alert('✅ 保存成功！'); // 简单提示
  } catch (e) {
    console.error(e);
    alert('❌ 保存失败，请检查控制台。');
  }
};

// 缩放控制逻辑
const zoomLevel = ref(1.0); // 1.0 = 100%

// 设置缩放并保存到 LocalStorage
const applyZoom = (value: number) => {
  // 限制范围 0.6 (60%) ~ 1.5 (150%)
  const clamped = Math.min(Math.max(value, 0.6), 1.5);
  // 保留一位小数
  zoomLevel.value = Math.round(clamped * 10) / 10;
  
  // 调用 Electron API
  if (window.electronAPI && window.electronAPI.setZoomFactor) {
    window.electronAPI.setZoomFactor(zoomLevel.value);
  }

  localStorage.setItem('dnd_app_zoom', String(zoomLevel.value));
};

// 增量调整
const adjustZoom = (delta: number) => {
  applyZoom(zoomLevel.value + delta);
};

//Ctrl + 滚轮 监听处理函数 👇👇👇
const handleWheel = (e: WheelEvent) => {
  // 只有当 Ctrl 键被按住时才触发
  if (e.ctrlKey) {
    // 阻止浏览器默认的“页面缩放”或“滚动”行为
    e.preventDefault();

    // deltaY < 0 代表向上滚动（通常意为放大）
    // deltaY > 0 代表向下滚动（通常意为缩小）
    if (e.deltaY < 0) {
      adjustZoom(0.1);
    } else {
      adjustZoom(-0.1);
    }
  }
};

// 初始化：读取上次的缩放比例
onMounted(() => {
  const savedZoom = localStorage.getItem('dnd_app_zoom');
  if (savedZoom) {
    applyZoom(parseFloat(savedZoom));
  }
  //注册全局监听 (passive: false 是为了能使用 preventDefault)
  window.addEventListener('wheel', handleWheel, { passive: false });
});

//组件销毁时清理监听
onUnmounted(() => {
  window.removeEventListener('wheel', handleWheel);
});
</script>

<template>
  <aside class="sidebar-left">
    <div class="header">
      <h2>我的角色</h2>
      <button 
          class="btn-text" 
          :class="{ active: isBulkMode }"
          @click="toggleBulkMode"
        >
          {{ isBulkMode ? '完成' : '管理' }}
        </button>
      <button v-if="!isBulkMode" @click="handleCreate" class="btn-create" title="新建空白角色卡">+ 新建卡</button>
      <div v-else class="bulk-header">
        <span>已选: {{ selectedIds.size }}</span>
        <button class="btn-text-small" @click="toggleSelectAll">全选/无</button>
      </div>
    </div>

    <ul class="char-list">
      <li 
        v-for="char in charStore.characterList" 
        :key="char.id"
        :class="{ 
          active: !isBulkMode && activeStore.character?.id === char.id,
          selected: isBulkMode && selectedIds.has(char.id)
        }"
        @click="handleItemClick(char.id)"
      >
        <div class="char-row">
          <div v-if="isBulkMode" class="checkbox-wrapper">
             <input 
              type="checkbox" 
              :checked="selectedIds.has(char.id)"
              readonly 
            />
          </div>
          <div class="char-info">
            <div class="char-name">{{ char.name }}</div>
            <div class="char-meta">Lv.{{ char.level }} {{ char.race }} {{ char.class }}</div>
          </div>
          <button v-if="!isBulkMode" class="btn-delete" @click="handleDelete($event, char.id, char.name)" title="删除">×</button>
        </div>
      </li>
    </ul>
    <div class="footer-wrapper">
      
      <div class="zoom-bar">
        <button @click="adjustZoom(-0.1)" class="btn-zoom" title="缩小">-</button>
        <span class="zoom-display" title="当前缩放比例">{{ Math.round(zoomLevel * 100) }}%</span>
        <button @click="adjustZoom(0.1)" class="btn-zoom" title="放大">+</button>
        <button @click="applyZoom(1.0)" class="btn-zoom btn-reset" title="重置">↺</button>
      </div>

    <div class="footer-tools" v-if="!isBulkMode">
      <button 
        @click="handleSave" 
        class="btn-tool btn-save" 
        :disabled="!activeStore.character" 
        title="保存当前角色 (Ctrl+S)"
      >
        💾 保存
      </button>
      <button @click="handleExport" class="btn-tool btn-export" :disabled="!activeStore.character" title="导出当前角色为 JSON">
        📤 备份
      </button>
      <button @click="triggerImport" class="btn-tool btn-import" title="从 JSON 导入角色">
        📥 导入
      </button>
      <input 
        type="file" 
        ref="fileInput" 
        accept=".json" 
        multiple
        style="display: none"
        @change="onFileSelected" 
       />
    </div>
    <div class="footer-tools bulk-tools" v-else>
        <button 
          @click="handleBulkDelete" 
          class="btn-tool btn-danger" 
          :disabled="selectedIds.size === 0"
        >
          🗑️ 删除 ({{ selectedIds.size }})
        </button>
        <button 
          @click="handleBulkExport" 
          class="btn-tool btn-primary" 
          :disabled="selectedIds.size === 0"
        >
          📂 导出 ({{ selectedIds.size }})
        </button>
      </div>
  </div>
  </aside>
</template>

<style scoped lang="scss">
.sidebar-left {
  width: 260px;
  background-color: #2c3e50;
  color: #ecf0f1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #34495e;

  .header {
    padding: 1rem;
    border-bottom: 1px solid #34495e;
    flex-shrink: 0;
    
    h2 { font-size: 1.2rem; margin-bottom: 0.5rem; color: #ecf0f1; }
    
    .btn-create {
      width: 100%; padding: 0.6rem; background-color: #27ae60; color: white;
      border: none; cursor: pointer; border-radius: 4px; font-weight: bold;
      transition: background 0.2s;
      &:hover { background-color: #2ecc71; }
    }
  }

  .char-list {
    list-style: none; padding: 0; margin: 0;
    flex: 1; overflow-y: auto; /* 让列表占据剩余空间并滚动 */

    li {
      padding: 0.8rem 1rem; cursor: pointer; border-bottom: 1px solid #34495e; transition: background 0.2s;
      &:hover { background-color: #34495e; .btn-delete { opacity: 1; } }
      &.active { background-color: #2980b9; border-bottom-color: #3498db; }

      .char-row { display: flex; justify-content: space-between; align-items: center; }
      
      .char-name { font-weight: bold; font-size: 1rem; color: #fff; }
      .char-meta { font-size: 0.8rem; color: #bdc3c7; margin-top: 2px; }

      .btn-delete {
        opacity: 0; /* 平时隐藏 */
        background: none; border: none; color: #e74c3c; font-size: 1.5rem; cursor: pointer;
        padding: 0 4px; line-height: 1; transition: opacity 0.2s, transform 0.2s;
        &:hover { transform: scale(1.2); color: #ff6b6b; }
      }
    }
  }

  /* 新增：底部容器，背景色统一 */
  .footer-wrapper {
    flex-shrink: 0;
    border-top: 1px solid #34495e; 
    background: #233140;
  }

  /* 新增：缩放条样式 */
  .zoom-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 1rem 0; /* 顶部留空 */
    gap: 8px;

    .zoom-display {
      font-size: 0.9rem;
      font-family: monospace;
      color: #bdc3c7;
      min-width: 40px;
      text-align: center;
      user-select: none;
    }

    .btn-zoom {
      background: #34495e;
      border: 1px solid #455a64;
      color: #ecf0f1;
      border-radius: 4px;
      width: 24px;
      height: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover { background: #3e5871; border-color: #5dade2; }
      &.btn-reset { margin-left: auto; font-size: 0.8rem; }
    }
  }

  .footer-tools {
    padding: 1rem; border-top: none; background: #233140;
    display: flex; gap: 10px; flex-shrink: 0;

    .btn-tool {
      flex: 1; padding: 8px; border: 1px solid #455a64; border-radius: 4px;
      cursor: pointer; font-size: 0.9rem; color: #ecf0f1; background: #34495e;
      transition: all 0.2s;
      &:hover:not(:disabled) { background: #3e5871; border-color: #5dade2; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
      /* 给保存按钮加个特殊色（可选） */
      &.btn-save:hover:not(:disabled) { border-color: #f1c40f; color: #f1c40f; }
    }
  }

  .title-row {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;
  h2 { margin: 0; }
  .btn-text {
    background: none; border: 1px solid transparent; color: #bdc3c7; cursor: pointer; font-size: 0.8rem;
    padding: 2px 8px; border-radius: 4px;
    &:hover { color: white; background: rgba(255,255,255,0.1); }
    &.active { color: #f1c40f; border-color: #f1c40f; }
  }
  }

  .bulk-header {
    display: flex; justify-content: space-between; align-items: center; 
    font-size: 0.9rem; color: #bdc3c7; padding: 0.6rem 0;
    .btn-text-small { background: none; border: none; color: #3498db; cursor: pointer; font-size: 0.8rem; &:hover { text-decoration: underline; } }
  }

  .char-list li {
    /* 新增选中态样式 */
    &.selected { background-color: rgba(52, 152, 219, 0.2); }
    
    .checkbox-wrapper {
      margin-right: 10px; display: flex; align-items: center;
      input { cursor: pointer; width: 16px; height: 16px; }
    }
  }

  .bulk-tools {
    .btn-danger { color: #e74c3c; border-color: #c0392b; &:hover:not(:disabled) { background: #c0392b; color: white; } }
    .btn-primary { color: #3498db; border-color: #2980b9; &:hover:not(:disabled) { background: #2980b9; color: white; } }
  }
}
</style>