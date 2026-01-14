<script setup lang="ts">
import { ref } from 'vue';
import { useCharacterStore } from '../../stores/characterStore';
import { useActiveSheetStore } from '../../stores/activeSheet';

const charStore = useCharacterStore();
const activeStore = useActiveSheetStore();
const fileInput = ref<HTMLInputElement | null>(null); // 文件输入框引用

// 新建角色并自动打开
// ✅ 修改：加上 async
const handleCreate = async () => {
  // ✅ 修改：加上 await，等待创建完成拿到 ID 字符串
  const newId = await charStore.createNewCharacter();
  
  // 此时 newId 是 string，不再是 Promise，可以安全传入
  activeStore.loadCharacter(newId);
};

// 切换角色
const handleSelect = (id: string) => {
  activeStore.loadCharacter(id);
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

// 处理文件选择
const onFileSelected = (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (!files || files.length === 0) return;

  const file = files[0];
  const reader = new FileReader();
  
  // ✅ 修改点 1: 在回调函数前加上 async
  reader.onload = async (evt) => {
    const content = evt.target?.result as string;
    if (content) {
      // ✅ 修改点 2: 加上 await，等待导入完成并获取真正的 ID 字符串
      const newId = await charStore.importCharacter(content);
      
      if (newId) {
        activeStore.loadCharacter(newId); // 现在 newId 是 string 了，不再报错
        alert('导入成功！');
      } else {
        alert('导入失败：文件格式不正确');
      }
    }
    // 清空 input，允许再次选择同名文件
    if (fileInput.value) fileInput.value.value = ''; 
  };
  
  reader.readAsText(file);
};

// ✅ 新增：手动保存处理
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
</script>

<template>
  <aside class="sidebar-left">
    <div class="header">
      <h2>我的角色</h2>
      <button @click="handleCreate" class="btn-create" title="新建空白角色卡">+ 新建卡</button>
    </div>

    <ul class="char-list">
      <li 
        v-for="char in charStore.characterList" 
        :key="char.id"
        :class="{ active: activeStore.character?.id === char.id }"
        @click="handleSelect(char.id)"
      >
        <div class="char-row">
          <div class="char-info">
            <div class="char-name">{{ char.name }}</div>
            <div class="char-meta">Lv.{{ char.level }} {{ char.race }} {{ char.class }}</div>
          </div>
          <button class="btn-delete" @click="handleDelete($event, char.id, char.name)" title="删除">×</button>
        </div>
      </li>
    </ul>

    <div class="footer-tools">
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
      <input type="file" ref="fileInput" accept=".json" style="display: none" @change="onFileSelected" />
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

  .footer-tools {
    padding: 1rem; border-top: 1px solid #34495e; background: #233140;
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
}
</style>