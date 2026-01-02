// src/directives/vTooltip.ts
import type { Directive } from 'vue';
import { useTooltipStore } from '../stores/tooltip';
import { WEAPON_PROPERTIES } from '../data/rules/weaponProperties';

// 简单的字典映射类型
const DICTIONARIES: Record<string, any> = {
  ...WEAPON_PROPERTIES
  // 未来可以在这里解构合并更多的字典，比如 法术字典、状态字典
};

export const vTooltip: Directive = {
  mounted(el, binding) {
    const store = useTooltipStore();

    // 鼠标移入：显示
    el.addEventListener('mouseenter', (e: MouseEvent) => {
      const key = binding.value; // 获取 v-tooltip="'key'" 里的值
      
      let title = '';
      let content = '';

      // 1. 尝试查字典
      if (typeof key === 'string' && DICTIONARIES[key]) {
        const entry = DICTIONARIES[key];
        title = entry.label;      // e.g. "灵巧"
        content = entry.description; // e.g. "使用该武器攻击时..."
      } 
      // 2. 如果字典查不到，就直接显示传入的文本
      else if (typeof key === 'string') {
        content = key;
      }
      // 3. 也支持直接传入对象 v-tooltip="{title:'标题', content:'内容'}"
      else if (typeof key === 'object') {
        title = key.title;
        content = key.content;
      }

      if (content || title) {
        store.show({ title, content }, e.clientX, e.clientY);
      }
    });

    // 鼠标移动：跟随
    el.addEventListener('mousemove', (e: MouseEvent) => {
      store.updatePosition(e.clientX, e.clientY);
    });

    // 鼠标移出：隐藏
    el.addEventListener('mouseleave', () => {
      store.hide();
    });
  }
};