// src/composables/useLibraryFilter.ts
import { computed } from 'vue';
import type { Ref } from 'vue';
import { getSchoolLabel } from '../data/rules/dndRules';

interface SearchableItem {
  id: string;
  name: string;
  englishName?: string;
  source?: string;
  displayCategory?: string;
  displaySubcategory?: string;
  school?: string;
}

export function useLibraryFilter<T extends SearchableItem>(list: T[], searchQuery: Ref<string>) {
  
  const filteredList = computed(() => {
    const q = searchQuery.value.toLowerCase().trim();
    if (!q) return list;

    return list.filter(item => {
      // 1. 基础匹配：名字或 ID
      const matchName = item.name.toLowerCase().includes(q);
      const matchId = item.id.toLowerCase().includes(q);
      const matchEnglishName = item.englishName?.toLowerCase().includes(q) ?? false;
      const matchSource = item.source?.toLowerCase().includes(q) ?? false;
      const matchCategory = item.displayCategory?.toLowerCase().includes(q) ?? false;
      const matchSubcategory = item.displaySubcategory?.toLowerCase().includes(q) ?? false;
      if (matchName || matchId || matchEnglishName || matchSource || matchCategory || matchSubcategory) return true;

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
