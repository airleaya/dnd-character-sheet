<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import draggable from 'vuedraggable';
import { ITEM_LIBRARY } from '../../../data/libraries/itemLibrary';
import { useLibraryFilter } from '../../../composables/useLibraryFilter';
import { formatCost } from '../../../utils/currencyUtils';
import { clearGlobalDragPayload, setupDragData } from '../../../utils/inventoryDropUtils';
import type { LibraryItem } from '../../../types/Library';
import type { LibraryCloneDragElement } from '../../../utils/inventoryDropUtils';

const props = defineProps<{
  searchQuery: string;
}>();

const emit = defineEmits<{
  (e: 'hover-item', item: LibraryItem, event: MouseEvent): void;
  (e: 'move-item', event: MouseEvent): void;
  (e: 'leave-item'): void;
}>();

interface SubGroup {
  title: string;
  items: LibraryItem[];
}

interface MainGroup {
  id: string;
  label: string;
  subGroups: SubGroup[];
}

const queryRef = toRef(props, 'searchQuery');
const { filteredList } = useLibraryFilter(ITEM_LIBRARY, queryRef);

const libraryTree = computed<MainGroup[]>(() => {
  const categoryMap = new Map<string, Map<string, LibraryItem[]>>();

  for (const item of filteredList.value) {
    const category = item.displayCategory ?? item.type;
    const subcategory = item.displaySubcategory ?? item.type;

    if (!categoryMap.has(category)) {
      categoryMap.set(category, new Map());
    }

    const subgroups = categoryMap.get(category)!;
    if (!subgroups.has(subcategory)) {
      subgroups.set(subcategory, []);
    }

    subgroups.get(subcategory)!.push(item);
  }

  return Array.from(categoryMap.entries()).map(([label, subgroups]) => ({
    id: label,
    label,
    subGroups: Array.from(subgroups.entries()).map(([title, items]) => ({ title, items }))
  }));
});

const expandedState = ref<Record<string, boolean>>({});

const isVisible = (key: string) => !!expandedState.value[key] || props.searchQuery.length > 0;
const toggleExpand = (key: string) => { expandedState.value[key] = !expandedState.value[key]; };

const cloneItem = (item: LibraryItem): LibraryCloneDragElement => ({ libraryId: item.id });

const onNativeDragStart = (e: DragEvent, item: LibraryItem) => {
  emit('leave-item');
  setupDragData(e, 'library-item', item.id, false);
};

const onDragEnd = () => {
  clearGlobalDragPayload();
};

const getBadges = (item: LibraryItem) => {
  const badges: Array<{ text: string; color: 'blue' | 'orange' | 'cyan' | 'red' }> = [];

  if (item.source) badges.push({ text: item.source, color: 'blue' });
  if ('capacityVolume' in item && item.capacityVolume) badges.push({ text: '容器', color: 'orange' });
  if ('contents' in item && item.contents) badges.push({ text: '套组', color: 'orange' });
  if ('isAmmunition' in item && item.isAmmunition) badges.push({ text: '弹药', color: 'orange' });
  if ('ac' in item && item.ac) badges.push({ text: `AC ${item.ac}`, color: 'cyan' });
  if ('damage' in item && item.damage) badges.push({ text: item.damage, color: 'red' });
  if (item.descriptionBlocks?.some((block) => block.type === 'table')) badges.push({ text: '表格', color: 'cyan' });

  return badges;
};
</script>

<template>
  <div class="items-panel">
    <div v-for="group in libraryTree" :key="group.id" class="main-group">
      <div class="main-group-header" @click="toggleExpand(group.id)" :class="{ 'is-open': isVisible(group.id) }">
        <div class="header-content"><span class="arrow-icon">▶</span>{{ group.label }}</div>
      </div>
      <div v-show="isVisible(group.id)">
        <div v-for="sub in group.subGroups" :key="sub.title" class="sub-group">
          <div class="sticky-sub-header" @click="toggleExpand(`${group.id}_${sub.title}`)" :class="{ 'is-open': isVisible(`${group.id}_${sub.title}`) }">
            <div class="header-left"><span class="arrow-icon">▶</span>{{ sub.title }}</div>
            <span class="count">{{ sub.items.length }}</span>
          </div>
          <div v-show="isVisible(`${group.id}_${sub.title}`)">
            <draggable
              :list="sub.items"
              :group="{ name: 'library', pull: 'clone', put: false }"
              :clone="cloneItem"
              item-key="id"
              class="item-list"
            >
              <template #item="{ element }">
                <div
                  class="library-item"
                  draggable="true"
                  @mouseenter="emit('hover-item', element, $event)"
                  @mousemove="emit('move-item', $event)"
                  @mouseleave="emit('leave-item')"
                  @dragstart="onNativeDragStart($event, element)"
                  @dragend="onDragEnd"
                >
                  <div class="item-row">
                    <span class="item-name">
                      {{ element.name }}
                      <small v-if="element.englishName">{{ element.englishName }}</small>
                    </span>
                    <span class="item-cost">{{ formatCost(element.cost) }}</span>
                  </div>
                  <div class="badges-row" v-if="getBadges(element).length > 0">
                    <span v-for="(b, i) in getBadges(element)" :key="i" class="badge" :class="b.color">{{ b.text }}</span>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>
    </div>
    <div v-if="libraryTree.length === 0" class="empty-state">未找到匹配物品</div>
  </div>
</template>

<style scoped lang="scss">
.main-group-header {
  padding: 14px 12px; margin-top: 1px; background-color: #252525; border-bottom: 1px solid #333; border-left: 4px solid #555;
  font-size: 0.95rem; font-weight: 800; color: #ddd; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; user-select: none; transition: all 0.2s;
  &:hover { background-color: #2d2d2d; color: #fff; }
  .header-content { display: flex; align-items: center; gap: 8px; }
  .arrow-icon { font-size: 0.75rem; color: #888; transition: transform 0.2s ease; display: inline-block; }
  &.is-open { background-color: #2c2c2c; border-left-color: #42b983; border-bottom-color: #42b983; color: #42b983; .arrow-icon { transform: rotate(90deg); color: #42b983; } }
}

.sticky-sub-header {
  position: sticky; top: 0; z-index: 10; background-color: #222; border-left: 4px solid transparent; padding: 8px 12px 8px 24px;
  font-size: 0.85rem; font-weight: bold; color: #aaa; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none; transition: background-color 0.2s;
  &:hover { background-color: #2a2a2a; color: #fff; }
  .header-left { display: flex; align-items: center; gap: 6px; }
  .arrow-icon { font-size: 0.7rem; transition: transform 0.2s; }
  &.is-open { color: #eee; background-color: #282828; .arrow-icon { transform: rotate(90deg); } }
  .count { font-size: 0.7rem; color: #666; background: #1a1a1a; padding: 1px 6px; border-radius: 8px; }
}

.library-item { background-color: #1e1e1e; border-bottom: 1px solid #282828; padding: 10px 14px; cursor: grab; transition: background 0.1s; &:hover { background-color: #2d2d2d; } }
.item-row { display: flex; justify-content: space-between; gap: 8px; }
.item-name { color: #ccc; font-size: 0.9rem; font-weight: 500; min-width: 0; }
.item-name small { display: block; color: #777; font-size: 0.7rem; margin-top: 2px; }
.item-cost { color: #d4ac0d; font-size: 0.8rem; font-family: monospace; white-space: nowrap; }

.badges-row { margin-top: 4px; display: flex; gap: 4px; flex-wrap: wrap; }
.badge { font-size: 0.65rem; padding: 2px 5px; border-radius: 3px; background: #333; color: #aaa; }
.badge.blue { color: #5dade2; background: rgba(93, 173, 226, 0.1); }
.badge.orange { color: #eb984e; background: rgba(235, 152, 78, 0.1); }
.badge.cyan { color: #48c9b0; background: rgba(72, 201, 176, 0.1); }
.badge.red { color: #ec7063; background: rgba(236, 112, 99, 0.1); }
.empty-state { padding: 40px; text-align: center; color: #555; }
</style>
