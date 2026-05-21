<script setup lang="ts">
import { ref, computed, toRef, watch } from 'vue';
import draggable from 'vuedraggable';
import { useLibraryFilter } from '../../../composables/useLibraryFilter';
import { useActiveSheetStore } from '../../../stores/activeSheet';
import { useDataPackStore } from '../../../stores/dataPackStore';
import { DEFAULT_DATA_PACK_ID } from '../../../utils/dataPackUtils';
import type { SpellDefinition } from '../../../types/Spell';

const props = defineProps<{
  searchQuery: string;
}>();

const emit = defineEmits<{
  (e: 'hover-item', item: SpellDefinition, event: MouseEvent): void;
  (e: 'move-item', event: MouseEvent): void;
  (e: 'leave-item'): void;
}>();

//初始化 Store 并创建检查函数
const store = useActiveSheetStore();
const dataPackStore = useDataPackStore();
const isKnown = (spellId: string) => store.allKnownSpells.some(s => s.id === spellId);

// 1. 过滤逻辑
const queryRef = toRef(props, 'searchQuery');
const { filteredList: spells } = useLibraryFilter(dataPackStore.spellLibraryItems, queryRef);

const spellLibraryTree = computed(() =>
  dataPackStore.getSpellGroups(new Set(spells.value.map(spell => spell.id)))
);

// 3. 展开/折叠状态
const expandedState = ref<Record<string, boolean>>({
  'dnd5e-default': true,
  'dnd5e-default_level': true,
  'dnd5e-default_school': true,
  'dnd5e-default_class': true,
});
const isVisible = (key: string) => !!expandedState.value[key] || props.searchQuery.length > 0;
const toggleExpand = (key: string) => { expandedState.value[key] = !expandedState.value[key]; };

watch(
  spellLibraryTree,
  groups => {
    groups.forEach(pack => {
      if (pack.packId !== DEFAULT_DATA_PACK_ID && expandedState.value[pack.packId] === undefined) {
        expandedState.value[pack.packId] = true;
      }

      pack.branches.forEach(branch => {
        const branchKey = `${pack.packId}_${branch.mode}`;
        if (pack.packId !== DEFAULT_DATA_PACK_ID && expandedState.value[branchKey] === undefined) {
          expandedState.value[branchKey] = true;
        }
      });
    });
  },
  { immediate: true }
);

// 4. 拖拽逻辑：必须生成唯一 ID
const cloneSpell = (spell: SpellDefinition) => {
  const dragId = `drag_${spell.id}_${Date.now()}`;
  return { 
    id: dragId, 
    spellId: spell.id, 
    type: 'spell_drop' 
  };
};

const handleDragStart = () => emit('leave-item');
const onNativeDragStart = (event: DragEvent, spell: SpellDefinition) => {
  emit('leave-item');
  event.dataTransfer?.setData('application/x-dnd-spell-id', spell.id);
  event.dataTransfer?.setData('text/plain', JSON.stringify({ type: 'spell', id: spell.id }));
};

// 5. 徽章显示逻辑
const getSpellBadges = (spell: SpellDefinition) => {
  const badges: Array<{
    text: string;
    color: 'blue' | 'orange' | 'ritual' | 'gray';
    title?: string;
  }> = [];
  let time = spell.castingTime;
  if (time.includes('动作')) time = '1A';
  if (time.includes('附赠')) time = 'BA';
  if (time.includes('反应')) time = 'R';
  badges.push({ text: time, color: 'blue' });

  if (spell.concentration) badges.push({ text: 'C', color: 'orange' });
  if (spell.ritual) badges.push({ text: '仪式', color: 'ritual', title: '可作为仪式施放' });
  
  const comps: string[] = [];
  if (spell.components.v) comps.push('V');
  if (spell.components.s) comps.push('S');
  if (spell.components.m) comps.push('M');
  if (comps.length) badges.push({ text: comps.join(''), color: 'gray' });

  return badges;
};
</script>

<template>
  <div class="spells-panel">
    <div v-for="pack in spellLibraryTree" :key="pack.packId" class="main-group">
      <div class="main-group-header" @click="toggleExpand(pack.packId)" :class="{ 'is-open': isVisible(pack.packId) }">
        <div class="header-content"><span class="arrow-icon">▶</span>{{ pack.label }}</div>
      </div>
      <div v-show="isVisible(pack.packId)">
        <div v-for="branch in pack.branches" :key="branch.mode" class="branch-group">
          <div class="branch-header" @click="toggleExpand(`${pack.packId}_${branch.mode}`)" :class="{ 'is-open': isVisible(`${pack.packId}_${branch.mode}`) }">
            <div class="header-left"><span class="arrow-icon">▶</span>{{ branch.label }}</div>
          </div>
          <div v-show="isVisible(`${pack.packId}_${branch.mode}`)">
            <div v-for="sub in branch.groups" :key="sub.title" class="sub-group">
              <div class="sticky-sub-header" @click="toggleExpand(`${pack.packId}_${branch.mode}_${sub.title}`)" :class="{ 'is-open': isVisible(`${pack.packId}_${branch.mode}_${sub.title}`) }">
                <div class="header-left"><span class="arrow-icon">▶</span>{{ sub.title }}</div>
                <span class="count">{{ sub.spells.length }}</span>
              </div>
              <div v-show="isVisible(`${pack.packId}_${branch.mode}_${sub.title}`)">
                <draggable
                  :list="sub.spells"
                  :group="{ name: 'spells', pull: 'clone', put: false }"
                  :clone="cloneSpell"
                  item-key="id"
                  @start="handleDragStart"
                  class="item-list"
                >
                  <template #item="{ element }">
                    <div class="library-item spell-item"
                    draggable="true"
                    :class="{ 'is-learned': isKnown(element.id) }"
                    @mouseenter="emit('hover-item', element, $event)"
                    @mousemove="emit('move-item', $event)"
                    @mouseleave="emit('leave-item')"
                    @dragstart="onNativeDragStart($event, element)">
                      <div class="item-row">
                        <span class="item-name">
                          {{ element.name }}
                          <span v-if="isKnown(element.id)" class="learned-mark">✓</span>
                        </span>
                        <span class="item-cost level-tag">{{ element.level === 0 ? '戏法' : `${element.level}环` }}</span>
                      </div>
                      <div class="badges-row">
                        <span
                          v-for="(b, i) in getSpellBadges(element)"
                          :key="i"
                          class="badge"
                          :class="b.color"
                          :title="b.title"
                        >
                          {{ b.text }}
                        </span>
                      </div>
                    </div>
                  </template>
                </draggable>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="spellLibraryTree.length === 0" class="empty-state">未找到匹配法术</div>
  </div>
</template>

<style scoped lang="scss">
/* 复用样式，确保一致性 */
.main-group-header {
  padding: 14px 12px; margin-top: 1px; background-color: var(--color-spell-library-main-bg); border-bottom: 1px solid var(--color-spell-library-main-border); border-left: 4px solid var(--color-spell-library-main-accent);
  font-size: 0.95rem; font-weight: 800; color: var(--color-spell-library-main-text); text-transform: uppercase; letter-spacing: 1px; cursor: pointer; user-select: none; transition: all 0.2s;
  &:hover { background-color: var(--color-spell-library-hover-bg); color: var(--color-spell-library-hover-text); }
  .header-content { display: flex; align-items: center; gap: 8px; }
  .arrow-icon { font-size: 0.75rem; color: var(--color-spell-library-arrow); transition: transform 0.2s ease; display: inline-block; }
  &.is-open { background-color: var(--color-spell-library-open-bg); border-left-color: var(--color-spell-library-open-accent); border-bottom-color: var(--color-spell-library-open-accent); color: var(--color-spell-library-open-accent); .arrow-icon { transform: rotate(90deg); color: var(--color-spell-library-open-accent); } }
}

.sticky-sub-header {
  position: sticky; top: 34px; z-index: 10; background-color: var(--color-spell-library-sub-bg); border-left: 4px solid var(--color-spellbook-drop-border); padding: 8px 12px 8px 34px;
  font-size: 0.85rem; font-weight: bold; color: var(--color-spell-library-sub-text); border-bottom: 1px solid var(--color-spell-library-main-border); display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none; transition: background-color 0.2s;
  &:hover { background-color: var(--color-spell-library-sub-hover-bg); color: var(--color-spell-library-hover-text); }
  .header-left { display: flex; align-items: center; gap: 6px; }
  .arrow-icon { font-size: 0.7rem; transition: transform 0.2s; }
  &.is-open { color: var(--color-spell-library-sub-open-text); background-color: var(--color-spell-library-sub-open-bg); .arrow-icon { transform: rotate(90deg); } }
  .count { font-size: 0.7rem; color: var(--color-spell-library-count-text); background: var(--color-spell-library-count-bg); padding: 1px 6px; border-radius: 8px; }
}

.branch-header {
  position: sticky; top: 0; z-index: 12; background-color: var(--color-spell-library-branch-bg); border-left: 4px solid var(--color-spell-library-branch-accent); padding: 9px 12px 9px 22px;
  font-size: 0.88rem; font-weight: 800; color: var(--color-spell-library-branch-text); border-bottom: 1px solid var(--color-spell-library-main-border); display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none;
  &:hover { background-color: var(--color-spell-library-open-bg); color: var(--color-spell-library-hover-text); }
  .header-left { display: flex; align-items: center; gap: 6px; }
  .arrow-icon { font-size: 0.7rem; transition: transform 0.2s; }
  &.is-open { color: var(--color-spell-library-branch-open); border-left-color: var(--color-spell-library-branch-open); .arrow-icon { transform: rotate(90deg); } }
}

.library-item { background-color: var(--color-spell-library-item-bg); border-bottom: 1px solid var(--color-spell-library-item-border); padding: 10px 14px; cursor: grab; transition: background 0.1s; &:hover { background-color: var(--color-spell-library-item-hover-bg); } }
/* 已学会的样式：稍微变暗，且显示绿色标记 */
.library-item.is-learned {
  opacity: 0.6;
  background-color: var(--color-spell-library-learned-bg);
  .item-name { color: var(--color-spell-library-learned-name); }
  .level-tag { color: var(--color-spell-library-learned-tag); }
  .badge { opacity: 0.5; }
}
.learned-mark {
  color: var(--color-spell-library-learned-mark);
  font-weight: bold;
  margin-left: 6px;
}
.spell-item { border-left: 2px solid var(--color-spellbook-drop-border); &:hover { border-left-color: var(--color-spell-library-level); } }

.item-row { display: flex; justify-content: space-between; }
.item-name { color: var(--color-spell-library-item-name); font-size: 0.9rem; font-weight: 500; }
.level-tag { color: var(--color-spell-library-level); font-weight: bold; font-family: monospace; font-size: 0.8rem; }

.badges-row { margin-top: 4px; display: flex; gap: 4px; }
.badge { font-size: 0.65rem; padding: 2px 5px; border-radius: 3px; background: var(--color-spell-library-badge-bg); color: var(--color-spell-library-badge-text); }
.badge.blue { color: var(--color-spell-library-badge-blue-text); background: var(--color-spell-library-badge-blue-bg); }
.badge.orange { color: var(--color-spell-library-badge-orange-text); background: var(--color-spell-library-badge-orange-bg); }
.badge.ritual { color: var(--color-spell-library-badge-ritual-text); background: var(--color-spell-library-badge-ritual-bg); border: 1px solid var(--color-spell-library-badge-ritual-border); }
.badge.gray { color: var(--color-spell-library-badge-gray-text); background: var(--color-spell-library-badge-gray-bg); }

.empty-state { padding: 40px; text-align: center; color: var(--color-spell-library-empty-text); }
</style>
