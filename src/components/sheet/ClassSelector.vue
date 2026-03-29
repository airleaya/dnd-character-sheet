<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useActiveSheetStore } from '../../stores/activeSheet';
import { CLASS_DICTIONARY, SUBCLASS_DICTIONARY } from '../../data/rules/classes';

const store = useActiveSheetStore();

// 挂载时确保数据格式正确
onMounted(() => {
  store.ensureClassesFormat();
});

const classesData = computed(() => store.character?.profile.classes || []);

// 获取对应主职的可用子职列表
const getAvailableSubclasses = (classId: string) => {
  return SUBCLASS_DICTIONARY.filter(sub => sub.classId === classId);
};

// 简单的字典映射查找
const getClassName = (id: string) => CLASS_DICTIONARY.find(c => c.id === id)?.name || '未选择职业';
const getSubclassName = (id: string | null) => {
  if (!id) return '';
  return SUBCLASS_DICTIONARY.find(s => s.id === id)?.name || '';
};

// 控制下拉框的显示状态与搜索词
const activeDropdown = ref<{ index: number, type: 'class' | 'subclass' } | null>(null);
const searchQuery = ref('');

const openDropdown = (index: number, type: 'class' | 'subclass') => {
  activeDropdown.value = { index, type };
  searchQuery.value = ''; // 每次打开清空搜索
};

const closeDropdown = () => {
  // 延迟关闭，以允许点击事件先生效
  setTimeout(() => {
    activeDropdown.value = null;
  }, 150);
};

// 过滤后的选项
const filteredOptions = computed(() => {
  if (!activeDropdown.value) return [];
  const { index, type } = activeDropdown.value;
  const currentRecord = classesData.value[index];
  
  let options = type === 'class' ? CLASS_DICTIONARY : getAvailableSubclasses(currentRecord.classId);
  
  if (searchQuery.value) {
    options = options.filter(opt => opt.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
  }
  return options;
});

const selectOption = (index: number, type: 'class' | 'subclass', id: string) => {
  store.updateClassRecord(index, type === 'class' ? 'classId' : 'subclassId', id);
  activeDropdown.value = null;
};
</script>

<template>
  <div class="class-selector-container" v-if="classesData.length">
    <div v-for="(record, index) in classesData" :key="index" class="class-row">
      
      <div class="dropdown-wrapper">
        <button class="selector-btn" @click="openDropdown(index, 'class')" @blur="closeDropdown">
          {{ record.classId ? getClassName(record.classId) : '请选择职业' }}
        </button>
        
        <div class="dropdown-menu" v-if="activeDropdown?.index === index && activeDropdown?.type === 'class'">
          <input v-model="searchQuery" class="search-input" placeholder="搜索职业..." @click.stop />
          <ul class="options-list">
            <li v-for="opt in filteredOptions" :key="opt.id" @click.stop="selectOption(index, 'class', opt.id)">
              {{ opt.name }}
            </li>
            <li v-if="!filteredOptions.length" class="empty-text">无结果</li>
          </ul>
        </div>
      </div>

      <template v-if="record.classId">
        <button 
          v-if="!record.subclassId" 
          class="subclass-expand-btn"
          title="选择子职"
          @click="openDropdown(index, 'subclass')"
        >
          + 子职
        </button>

        <div class="dropdown-wrapper" v-if="record.subclassId || (activeDropdown?.index === index && activeDropdown?.type === 'subclass')">
          <span class="divider">-</span>
          <button class="selector-btn subclass" @click="openDropdown(index, 'subclass')" @blur="closeDropdown">
            {{ record.subclassId ? getSubclassName(record.subclassId) : '请选择子职' }}
          </button>
          
          <div class="dropdown-menu" v-if="activeDropdown?.index === index && activeDropdown?.type === 'subclass'">
            <input v-model="searchQuery" class="search-input" placeholder="搜索子职..." @click.stop />
            <ul class="options-list">
              <li v-for="opt in filteredOptions" :key="opt.id" @click.stop="selectOption(index, 'subclass', opt.id)">
                {{ opt.name }}
              </li>
              <li v-if="!filteredOptions.length" class="empty-text">无结果</li>
            </ul>
          </div>
        </div>
      </template>

      <button v-if="index > 0" class="btn-remove" @click="store.removeClassRecord(index)" title="移除兼职">×</button>
    </div>

    <button class="btn-multiclass" @click="store.addClassRecord()">+ 兼职</button>
  </div>
</template>

<style scoped lang="scss">
.class-selector-container {
  display: flex; flex-direction: column; gap: 4px; position: relative;
}
.class-row {
  display: flex; align-items: center; gap: 4px; position: relative;
}
.dropdown-wrapper {
  position: relative;
}
.selector-btn {
  background: transparent; border: 1px solid transparent; border-bottom: 1px dashed #7f8c8d;
  font-size: 1rem; color: #2c3e50; cursor: pointer; padding: 2px 4px; font-weight: bold;
  &:hover { background: #f8f9fa; border-radius: 4px; }
  &.subclass { font-weight: normal; color: #555; }
}
.subclass-expand-btn {
  background: #ecf0f1; border: none; border-radius: 4px; font-size: 0.7rem; padding: 2px 6px;
  cursor: pointer; color: #7f8c8d; transition: all 0.2s;
  &:hover { background: #bdc3c7; color: #2c3e50; }
}
.divider { color: #95a5a6; margin: 0 2px; }
.btn-remove {
  background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 1.2rem;
  line-height: 1; padding: 0 4px; opacity: 0.6;
  &:hover { opacity: 1; }
}
.btn-multiclass {
  align-self: flex-start; background: none; border: 1px dashed #bdc3c7; border-radius: 4px;
  font-size: 0.75rem; color: #7f8c8d; padding: 2px 8px; cursor: pointer; margin-top: 2px;
  &:hover { border-color: #3498db; color: #3498db; }
}
/* 下拉菜单样式 */
.dropdown-menu {
  position: absolute; top: 100%; left: 0; background: white; border: 1px solid #ccc;
  border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 100;
  width: max-content; min-width: 150px; display: flex; flex-direction: column;
}
.search-input {
  border: none; border-bottom: 1px solid #eee; padding: 6px 8px; outline: none; font-size: 0.85rem;
}
.options-list {
  list-style: none; margin: 0; padding: 0; max-height: 200px; overflow-y: auto;
  li { padding: 6px 10px; font-size: 0.9rem; cursor: pointer; transition: background 0.1s; }
  li:hover { background: #f0f4f8; }
  .empty-text { color: #999; text-align: center; cursor: default; }
}
</style>