// src/composables/useLibraryFilter.ts
import { Ref, computed } from 'vue';
import { getSchoolLabel } from '../data/rules/dndRules';

// 定义一个基础的 Item 接口，确保有必要的字段
interface SearchableItem {
  id: string;
  name: string;
  school?: string; // 法术特有
  [key: string]: any;
}

export function useLibraryFilter(list: SearchableItem[], searchQuery: Ref<string>) {
  
  const filteredList = computed(() => {
    const q = searchQuery.value.toLowerCase().trim();
    if (!q) return list;

    return list.filter(item => {
      // 1. 基础匹配：名字或 ID
      const matchName = item.name.toLowerCase().includes(q);
      const matchId = item.id.toLowerCase().includes(q);
      if (matchName || matchId) return true;

      // 2. 针对法术的高级匹配：学派
      if (item.school) {
        // 匹配英文学派 ID (e.g. "evocation")
        if (item.school.toLowerCase().includes(q)) return true;
        
        // 匹配中文学派名 (e.g. "塑能")
        const cnSchool = getSchoolLabel(item.school);
        if (cnSchool && cnSchool.includes(q)) return true;
      }

      return false;
    });
  });

  return {
    filteredList
  };
}