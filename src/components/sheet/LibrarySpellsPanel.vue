<script setup lang="ts">
import { ref, computed, toRef } from 'vue';
import draggable from 'vuedraggable';
import { useLibraryFilter } from '../../composables/useLibraryFilter';
import { useActiveSheetStore } from '../../stores/activeSheet';
// 数据源
import { SPELL_LIBRARY } from '../../data/spells/index';

const props = defineProps<{
  searchQuery: string;
}>();

const emit = defineEmits<{
  (e: 'hover-item', item: any, event: MouseEvent): void;
  (e: 'move-item', event: MouseEvent): void;
  (e: 'leave-item'): void;
}>();

//初始化 Store 并创建检查函数
const store = useActiveSheetStore();
const isKnown = (spellId: string) => store.allKnownSpells.some(s => s.id === spellId);

// 1. 过滤逻辑
const queryRef = toRef(props, 'searchQuery');
const { filteredList: spells } = useLibraryFilter(SPELL_LIBRARY, queryRef);

// 2. 分组逻辑 (戏法 - 9环)
interface SubGroup { title: string; items: any[]; }
interface MainGroup { id: string; label: string; subGroups: SubGroup[]; }

const spellLibraryTree = computed<MainGroup[]>(() => {
  const groups: SubGroup[] = [];
  
  // 戏法 (Level 0)
  const cantrips = spells.value.filter(s => s.level === 0);
  if (cantrips.length > 0) groups.push({ title: '🔮 戏法 (Cantrips)', items: cantrips });

  // 1-9 环
  for (let i = 1; i <= 9; i++) {
    const levelSpells = spells.value.filter(s => s.level === i);
    if (levelSpells.length > 0) {
      groups.push({ title: `${i} 环法术`, items: levelSpells });
    }
  }

  return [
    { id: 'spells_root', label: '📜 法术全书', subGroups: groups }
  ].filter(main => main.subGroups.length > 0);
});

// 3. 展开/折叠状态
const expandedState = ref<Record<string, boolean>>({
  'spells_root': true
});
const isVisible = (key: string) => !!expandedState.value[key] || props.searchQuery.length > 0;
const toggleExpand = (key: string) => { expandedState.value[key] = !expandedState.value[key]; };

// 4. 拖拽逻辑：必须生成唯一 ID
const cloneSpell = (spell: any) => {
  const dragId = `drag_${spell.id}_${Date.now()}`;
  return { 
    id: dragId, 
    spellId: spell.id, 
    type: 'spell_drop' 
  };
};

const handleDragStart = () => emit('leave-item');

// 5. 徽章显示逻辑
const getSpellBadges = (spell: any) => {
  const badges = [];
  let time = spell.castingTime;
  if (time.includes('动作')) time = '1A';
  if (time.includes('附赠')) time = 'BA';
  if (time.includes('反应')) time = 'R';
  badges.push({ text: time, color: 'blue' });

  if (spell.concentration) badges.push({ text: 'C', color: 'orange' });
  if (spell.ritual) badges.push({ text: 'R', color: 'cyan' });
  
  const comps = [];
  if (spell.components.v) comps.push('V');
  if (spell.components.s) comps.push('S');
  if (spell.components.m) comps.push('M');
  if (comps.length) badges.push({ text: comps.join(''), color: 'gray' });

  return badges;
};
</script>

<template>
  <div class="spells-panel">
    <div v-for="group in spellLibraryTree" :key="group.id" class="main-group">
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
              :group="{ name: 'spells', pull: 'clone', put: false }" 
              :clone="cloneSpell" 
              item-key="id" 
              @start="handleDragStart"
              class="item-list"
            >
              <template #item="{ element }">
                <div class="library-item spell-item"
                :class="{ 'is-learned': isKnown(element.id) }"
                @mouseenter="emit('hover-item', element, $event)" 
                @mousemove="emit('move-item', $event)" 
                @mouseleave="emit('leave-item')">
                  <div class="item-row">
                    <span class="item-name">
                      {{ element.name }}
                      <span v-if="isKnown(element.id)" class="learned-mark">✓</span>
                    </span>
                    <span class="item-cost level-tag">{{ element.level === 0 ? '戏法' : `${element.level}环` }}</span>
                  </div>
                  <div class="badges-row">
                    <span v-for="(b, i) in getSpellBadges(element)" :key="i" class="badge" :class="b.color">{{ b.text }}</span>
                  </div>
                </div>
              </template>
            </draggable>
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
/* 已学会的样式：稍微变暗，且显示绿色标记 */
.library-item.is-learned {
  opacity: 0.6;
  background-color: #1a1a1a;
  .item-name { color: #7f8c8d; }
  .level-tag { color: #555; }
  .badge { opacity: 0.5; }
}
.learned-mark {
  color: #27ae60;
  font-weight: bold;
  margin-left: 6px;
}
.spell-item { border-left: 2px solid transparent; &:hover { border-left-color: #9b59b6; } }

.item-row { display: flex; justify-content: space-between; }
.item-name { color: #ccc; font-size: 0.9rem; font-weight: 500; }
.level-tag { color: #9b59b6; font-weight: bold; font-family: monospace; font-size: 0.8rem; }

.badges-row { margin-top: 4px; display: flex; gap: 4px; }
.badge { font-size: 0.65rem; padding: 2px 5px; border-radius: 3px; background: #333; color: #aaa; }
.badge.blue { color: #5dade2; background: rgba(93, 173, 226, 0.1); }
.badge.orange { color: #eb984e; background: rgba(235, 152, 78, 0.1); }
.badge.cyan { color: #48c9b0; background: rgba(72, 201, 176, 0.1); }
.badge.gray { color: #999; background: rgba(255, 255, 255, 0.1); }

.empty-state { padding: 40px; text-align: center; color: #555; }
</style>