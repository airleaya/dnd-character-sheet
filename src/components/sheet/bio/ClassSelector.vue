<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useActiveSheetStore } from '../../../stores/activeSheet';
import { CLASS_DICTIONARY, SUBCLASS_DICTIONARY } from '../../../data/rules/classes';

const store = useActiveSheetStore();

// 创建一个容器引用，用于判断点击区域
const containerRef = ref<HTMLElement | null>(null);

// 监听全局点击事件：如果点击的目标不在当前组件内部，则关闭菜单
const handleClickOutside = (event: MouseEvent) => {
  if (activeDropdown.value && containerRef.value && !containerRef.value.contains(event.target as Node)) {
    activeDropdown.value = null;
  }
};

// 挂载时确保数据格式正确
onMounted(() => {
  store.ensureClassesFormat();
  // 挂载全局点击监听
  document.addEventListener('mousedown', handleClickOutside);
});

const classesData = computed(() => store.character?.profile.classes || []);

// 判断是否允许添加兼职的计算属性
const canAddMulticlass = computed(() => {
  if (!store.character) return false;
  
  // 1. 必须已经选择了主职
  if (classesData.value.length === 0 || !classesData.value[0]?.classId) return false;
  
  // 2. 维持原有的最多双职业限制
  if (classesData.value.length >= 2) return false;

  const profile = store.character.profile;
  const totalAlloc = totalAllocated.value;

  // 3. 核心判断：有未分配的总等级，或者主职等级 > 1（可以从中扣减出1级给兼职）
  if (totalAlloc < profile.level) return true; 
  
  const mainClassLevel = classesData.value[0]?.level || 1;
  return mainClassLevel > 1;
});

// 计算当前已分配的总等级，用于控制增减按钮的禁用状态
const totalAllocated = computed(() => {
  return classesData.value.reduce((sum, c) => sum + (c.level || 1), 0);
});

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

// 优化打开逻辑，支持点击同一个按钮时“切换/折叠”菜单
const openDropdown = (index: number, type: 'class' | 'subclass') => {
  if (activeDropdown.value?.index === index && activeDropdown.value?.type === type) {
    activeDropdown.value = null; // 如果已经打开，则关闭
  } else {
    activeDropdown.value = { index, type };
    searchQuery.value = ''; // 每次打开清空搜索
  }
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
  <div class="class-selector-container" ref="containerRef" v-if="classesData.length">
    <button 
      v-if="classesData.length === 0" 
      class="btn-multiclass-add" 
      @click="store.addClassRecord()"
    >
      + 添加主职业
    </button>
    <div 
      v-for="(record, index) in classesData" 
      :key="index" 
      class="class-badge-wrapper"
      :class="{ 'is-multiclass': index > 0 }"
    >
      
      <div v-if="!record.classId" class="dropdown-wrapper empty-state">
        <button class="selector-btn badge-btn empty-btn" @click="openDropdown(index, 'class')">
          + 选择职业
        </button>        
      </div>

      <div v-else class="class-badge">
        <button 
          v-if="index > 0" 
          class="badge-remove-control" 
          @click="store.removeClassRecord(index)" 
          title="移除兼职"
        >×</button>

        <div class="badge-main-info">
          <div class="dropdown-wrapper badge-top">
            <button class="selector-btn badge-btn class-name-btn" @click="openDropdown(index, 'class')">
              {{ getClassName(record.classId) }}
            </button>
          </div>

          <div class="badge-divider"></div>

          <div class="dropdown-wrapper badge-bottom" :class="{ 'is-empty': !record.subclassId }">
            <button class="selector-btn badge-btn subclass-name-btn" @click="openDropdown(index, 'subclass')">
              {{ record.subclassId ? getSubclassName(record.subclassId) : '+ 添加子职' }}
            </button>
          </div>
        </div>

        <div v-if="classesData.length > 1" class="badge-level-controls">
          <button class="level-btn up" @click.stop="store.updateClassLevel(index, 1)" :disabled="totalAllocated >= (store.character?.profile.level || 1)">▲</button>
          <span class="level-text">{{ record.level || 1 }}</span>
          <button class="level-btn down" @click.stop="store.updateClassLevel(index, -1)" :disabled="(record.level || 1) <= 1">▼</button>
        </div>
        </div>

      <div class="dropdown-menu" 
           v-if="activeDropdown?.index === index"
           :class="[
             activeDropdown.type === 'class' ? 'menu-class' : 'menu-subclass',
             { 'menu-multiclass': index > 0 }
           ]">
        <input v-model="searchQuery" class="search-input" :placeholder="activeDropdown.type === 'class' ? '搜索职业...' : '搜索子职...'" @click.stop />
        <ul class="options-list">
          <li v-for="opt in filteredOptions" :key="opt.id" @click.stop="selectOption(index, activeDropdown.type, opt.id)">
            {{ opt.name }}
          </li>
          <li v-if="!filteredOptions.length" class="empty-text">无结果</li>
        </ul>
      </div>

    </div>

    <button 
      v-if="canAddMulticlass"
      class="btn-multiclass-add" 
      @click="store.addClassRecord()"
    >
      + 兼职
    </button>
  </div>
</template>

<style scoped lang="scss">
.class-selector-container {
  display: flex; 
  flex-direction: row; /* 改为横向排列 */
  flex-wrap: wrap; /* 允许折行 */
  gap: 2px; 
  align-items: center; /* 垂直居中对齐气泡和按钮 */
}

.class-badge-wrapper {
  display: inline-flex;
  position: relative;
}

/* 核心气泡样式 */
.class-badge {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  background: #f8f9fa; 
  border: 1px solid #e9ecef;
  border-radius: 4px; 
  box-shadow: 0 1px 2px rgba(0,0,0,0.03); 
  position: relative;
  overflow: hidden; 
  min-width: 60px; 
}

/* 兼职气泡缩小 */
.is-multiclass .class-badge {
  transform: scale(0.9); /* 整体缩小以区分主次 */
  transform-origin: left center;
  background: #f1f2f6; /* 背景稍微再深一点点以区分主职 */
  margin-right: -6px; 
}

/* 区块 A：左侧悬浮响应移除按钮 */
.badge-remove-control {
  display: flex;
  align-items: center;
  justify-content: center;
  
  width: 14px; /* 极窄宽度 */
  padding: 0;
  margin: 0;
  
  background: transparent; /* 常态与气泡底色融为一体 */
  color: #bdc3c7; /* 常态低调淡灰色 */
  border: none;
  border-right: 1px solid rgba(0,0,0,0.05); /* 右侧极细的内部分割线 */
  
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: bold;
  line-height: 0; /* 消除行高干扰 */
  transition: all 0.2s ease; /* 添加平滑动画效果 */

  &:hover {
    background: #e74c3c; /* 悬浮时突变为警示红 */
    color: #ffffff;      /* 悬浮时突变为亮白色 */
    border-right-color: #e74c3c;
  }
}

/* 区块 B：主体信息区 */
.badge-main-info {
  display: flex;
  flex-direction: column;
  flex: 1; /* 占据剩余全部可用宽度 */
}

/* 区块 C：右侧等级控制区 */
.badge-level-controls {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #eef2f5;
  border-left: 1px solid #e9ecef;
  padding: 0; /* 严格去除上下左右所有 padding */
  width: 16px; /* 固定极窄宽度 */
  
  .level-btn {
    background: transparent;
    border: none;
    color: #7f8c8d;
    font-size: 0.5rem; /* 极限缩小的箭头 */
    cursor: pointer;
    padding: 0; 
    margin: 0;  
    height: 30%; /* 上下箭头各精确占据 30% 空间 */
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0; /* 消除行高干扰 */
    
    &:hover:not(:disabled) {
      color: #2c3e50;
      background: rgba(0,0,0,0.05);
    }
    &:disabled {
      opacity: 0.2;
      cursor: not-allowed;
    }
  }
  
  .level-text {
    font-size: 0.75rem; /* 紧凑的数字 */
    font-weight: bold;
    color: #2c3e50;
    margin: 0;
    padding: 0;
    height: 40%; /* 数字区域精确占据 40% 空间 */
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0; /* 消除行高干扰 */
  }
}


/* 气泡内部按钮通用样式 */
.badge-btn {
  width: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: center;
  transition: background-color 0.2s;
  margin: 0;
  outline: none;
  &:hover { background-color: rgba(0,0,0,0.03); }
}

/* 气泡上半部分 (职业) */
.badge-top {
  display: flex;
  align-items: center;
  justify-content: center;
  .class-name-btn {
    padding: 0 10px; 
    font-size: 0.9rem; 
    font-weight: 700;
    color: #2c3e50;
    line-height: 1.2;
  }
}

/* 气泡下半部分 (子职) */
.badge-bottom {
  border-top: 1px solid rgba(0,0,0,0.05); 
  
  display: flex;
  align-items: center;
  justify-content: center;

  .subclass-name-btn {
    padding: 0 10px; 
    font-size: 0.7rem; 
    color: #7f8c8d;
    line-height: 1.2;
  }
  
  /* 无子职的挤压状态 */
  &.is-empty {
    .subclass-name-btn {
      padding: 0 10px;
      font-size: 0.6rem; /* 极致缩小字号 */
      color: #bdc3c7;
      background: rgba(0,0,0,0.015); 
      &:hover { background: rgba(0,0,0,0.05); color: #95a5a6; }
    }
  }
}

/* 空状态按钮 (未选择主职时) */
.empty-state {
  .empty-btn {
    border: 1px dashed #bdc3c7;
    border-radius: 4px;
    padding: 2px 10px; /* 缩小空状态按钮 */
    font-size: 0.8rem;
    color: #7f8c8d;
    font-weight: bold;
    &:hover { border-color: #3498db; color: #3498db; background: #f0f8ff; }
  }
}

/* 添加兼职按钮 */
.btn-multiclass-add {
  background: none; border: 1px dashed #bdc3c7; border-radius: 6px;
  font-size: 0.8rem; color: #7f8c8d; padding: 4px 10px; cursor: pointer;
  transition: all 0.2s; height: max-content;
  &:hover { border-color: #3498db; color: #3498db; background: #f0f8ff; }
}

/* 下拉菜单样式保持原样，微调位置 */
.dropdown-wrapper { position: relative; width: 100%; }

.dropdown-menu {
  position: absolute; 
  top: 0; 
  right: calc(100% + 4px); 
  left: auto; 
  
  background: #ffffff;
  border: 1px solid #e9ecef; 
  border-right: 3px solid #2c3e50; 
  border-radius: 8px 4px 4px 8px;
  
  box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
  
  z-index: 100;
  width: 120px; 
  min-width: 120px; 
  display: flex; 
  flex-direction: column;
  transform-origin: top right; 
}

/* 动态匹配气泡内字体的样式 */
.menu-class .options-list li {
  font-size: 0.9rem; font-weight: 700; color: #2c3e50; 
}
.menu-subclass .options-list li {
  font-size: 0.7rem; color: #7f8c8d; 
}
.menu-multiclass {
  transform: scale(0.9); 
}

.search-input {
  border: none; 
  border-bottom: 1px solid #eee;     
  padding: 6px 12px; 
  outline: none; 
  font-size: 0.85rem; 
  width: 100%; 
  box-sizing: border-box;
  
  background: transparent;
  text-align: right; 
}

// 选项列表全局右对齐，并增加渐变 hover 效果
.options-list {
  list-style: none; margin: 0; padding: 0; max-height: 200px; overflow-y: auto; 
  text-align: right; /* 全局右对齐 */
  
  li { 
    padding: 6px 12px; 
    cursor: pointer; 
    transition: background 0.2s; 
  }
  
  li:hover { 
    background: #f0f4f8;
  }
  
  .empty-text { 
    color: #999; 
    cursor: default; 
    font-size: 0.8rem; 
    padding: 8px 12px; 
  }
}
</style>