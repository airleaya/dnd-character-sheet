<script setup lang="ts">
import { ref, computed, toRef } from 'vue';
import draggable from 'vuedraggable';
import { useLibraryFilter } from '../../composables/useLibraryFilter';
import { formatCost } from '../../utils/currencyUtils';

// 导入所有数据源
import { WEAPON_LIBRARY } from '../../data/libraries/weapons';
import { ARMOR_LIBRARY } from '../../data/libraries/armors';
import { GEAR_LIBRARY } from '../../data/libraries/gears';
import { CONTAINER_LIBRARY } from '../../data/libraries/containers';
import { TOOL_LIBRARY } from '../../data/libraries/tools';
import { CONSUMABLE_LIBRARY } from '../../data/libraries/consumables';
import { TREASURE_LIBRARY } from '../../data/libraries/treasures';
import { PACK_LIBRARY } from '../../data/libraries/packs';
import { setupDragData } from '../../utils/inventoryDropUtils';

const props = defineProps<{
  searchQuery: string;
}>();

const emit = defineEmits<{
  (e: 'hover-item', item: any, event: MouseEvent): void;
  (e: 'move-item', event: MouseEvent): void;
  (e: 'leave-item'): void;
}>();

// 使用 Composable 过滤各个列表
// 注意：我们需要先传入 query 的 Ref
const queryRef = toRef(props, 'searchQuery');

const { filteredList: weapons } = useLibraryFilter(WEAPON_LIBRARY, queryRef);
const { filteredList: armors } = useLibraryFilter(ARMOR_LIBRARY, queryRef);
const { filteredList: gears } = useLibraryFilter(GEAR_LIBRARY, queryRef);
const { filteredList: containers } = useLibraryFilter(CONTAINER_LIBRARY, queryRef);
const { filteredList: packs } = useLibraryFilter(PACK_LIBRARY, queryRef);
const { filteredList: tools } = useLibraryFilter(TOOL_LIBRARY, queryRef);
const { filteredList: consumables } = useLibraryFilter(CONSUMABLE_LIBRARY, queryRef);
const { filteredList: treasures } = useLibraryFilter(TREASURE_LIBRARY, queryRef);

// 分组逻辑
interface SubGroup { title: string; items: any[]; }
interface MainGroup { id: string; label: string; subGroups: SubGroup[]; }

const libraryTree = computed<MainGroup[]>(() => {
  const weaponGroups = [
    { title: '简易近战', items: weapons.value.filter(i => i.category === 'simple_melee') },
    { title: '简易远程', items: weapons.value.filter(i => i.category === 'simple_ranged') },
    { title: '军用近战', items: weapons.value.filter(i => i.category === 'martial_melee') },
    { title: '军用远程', items: weapons.value.filter(i => i.category === 'martial_ranged') },
  ].filter(g => g.items.length > 0);

  const armorGroups = [
    { title: '轻甲', items: armors.value.filter(i => i.armorType === 'light') },
    { title: '中甲', items: armors.value.filter(i => i.armorType === 'medium') },
    { title: '重甲', items: armors.value.filter(i => i.armorType === 'heavy') },
    { title: '盾牌', items: armors.value.filter(i => i.armorType === 'shield') },
  ].filter(g => g.items.length > 0);

  const gearGroups = [
    { title: '冒险装备', items: gears.value },
    { title: '容器 & 背包', items: containers.value },
    { title: '初始套组', items: packs.value },
    { title: '工具 & 套件', items: tools.value },
  ].filter(g => g.items.length > 0);

  const consumableGroups = [
    { title: '药水 & 炼金', items: consumables.value.filter(i => i.id.startsWith('potion') || i.id.startsWith('vial') || i.id === 'oil') },
    { title: '弹药', items: consumables.value.filter(i => i.isAmmunition) },
    { title: '其他物资', items: consumables.value.filter(i => !i.isAmmunition && !i.id.startsWith('potion') && !i.id.startsWith('vial') && i.id !== 'oil') },
  ].filter(g => g.items.length > 0);

  const treasureGroups = [
    { title: '宝石', items: treasures.value.filter(i => i.id.startsWith('gem')) },
    { title: '艺术品', items: treasures.value.filter(i => i.id.startsWith('art')) },
    { title: '贸易货品', items: treasures.value.filter(i => i.id.endsWith('bar')) },
  ].filter(g => g.items.length > 0);

  return [
    { id: 'weapon', label: '⚔️ 武器库', subGroups: weaponGroups },
    { id: 'armor', label: '🛡️ 防具库', subGroups: armorGroups },
    { id: 'gear', label: '🎒 杂物箱', subGroups: gearGroups },
    { id: 'consumable', label: '🧪 消耗品', subGroups: consumableGroups },
    { id: 'treasure', label: '💎 藏宝库', subGroups: treasureGroups },
  ].filter(main => main.subGroups.length > 0);
});

// 展开/折叠状态 (现在状态被隔离在组件内部，这很好)
const expandedState = ref<Record<string, boolean>>({});

const isVisible = (key: string) => !!expandedState.value[key] || props.searchQuery.length > 0;
const toggleExpand = (key: string) => { expandedState.value[key] = !expandedState.value[key]; };

// 拖拽辅助
const cloneItem = (item: any) => ({ libraryId: item.id });

// const handleDragStart = () => emit('leave-item');

const onNativeDragStart = (e: DragEvent, item: any) => {
  emit('leave-item'); // 保留原来的功能：拖拽开始时关闭 tooltip
  setupDragData(e, 'library-item', item.id); // 新增功能：写入数据
};

// 徽章逻辑
const getBadges = (item: any) => {
  const badges = [];
  if (item.charges) badges.push({ text: `${item.charges}次`, color: 'blue' });
  if (item.capacityVolume) badges.push({ text: '容器', color: 'orange' });
  if (item.ac) badges.push({ text: `AC ${item.ac}`, color: 'cyan' });
  if (item.damage) badges.push({ text: item.damage, color: 'red' });
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
                <div class="library-item" 
                    @mouseenter="emit('hover-item', element, $event)" 
                    @mousemove="emit('move-item', $event)" 
                    @mouseleave="emit('leave-item')"
                    @dragstart="onNativeDragStart($event, element)"
                    >
                  <div class="item-row">
                    <span class="item-name">{{ element.name }}</span>
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
/* 复制并保留原有的列表样式，去除不相关的样式 */
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
.item-row { display: flex; justify-content: space-between; }
.item-name { color: #ccc; font-size: 0.9rem; font-weight: 500; }
.item-cost { color: #d4ac0d; font-size: 0.8rem; font-family: monospace; }

.badges-row { margin-top: 4px; display: flex; gap: 4px; }
.badge { font-size: 0.65rem; padding: 2px 5px; border-radius: 3px; background: #333; color: #aaa; }
.badge.blue { color: #5dade2; background: rgba(93, 173, 226, 0.1); }
.badge.orange { color: #eb984e; background: rgba(235, 152, 78, 0.1); }
.badge.cyan { color: #48c9b0; background: rgba(72, 201, 176, 0.1); }
.badge.red { color: #ec7063; background: rgba(236, 112, 99, 0.1); }
.empty-state { padding: 40px; text-align: center; color: #555; }
</style>