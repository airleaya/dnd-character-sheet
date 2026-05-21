<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue';
import draggable from 'vuedraggable';
import { useDataPackStore } from '../../../stores/dataPackStore';
import { useLibraryFilter } from '../../../composables/useLibraryFilter';
import { formatCost } from '../../../utils/currencyUtils';
import { clearGlobalDragPayload, setupDragData } from '../../../utils/inventoryDropUtils';
import { DEFAULT_DATA_PACK_ID } from '../../../utils/dataPackUtils';
import { getEntryUnlockGroupId, getNormalizedUnlockGroups } from '../../../utils/dataPackVisibility';
import { formatMagicItemName, getMagicInventoryStyle } from '../../../utils/magicItems';
import type {
  ArmorDefinition,
  ArmorType,
  LibraryItem,
  WeaponCategory,
  WeaponDefinition,
  WeaponPropertyKey
} from '../../../types/Library';
import type { DataPackItemCategoryGroup, DataPackItemSubGroup } from '../../../types/DataPack';
import type { LibraryCloneDragElement } from '../../../utils/inventoryDropUtils';

const props = defineProps<{
  searchQuery: string;
}>();

const emit = defineEmits<{
  (e: 'hover-item', item: LibraryItem, event: MouseEvent): void;
  (e: 'move-item', event: MouseEvent): void;
  (e: 'leave-item'): void;
}>();

const queryRef = toRef(props, 'searchQuery');
const dataPackStore = useDataPackStore();
const { filteredList } = useLibraryFilter(dataPackStore.itemLibraryItems, queryRef);

const expandedState = ref<Record<string, boolean>>({ 'dnd5e-default': true });
const passphraseGroupedPackIds = ref<Record<string, boolean>>({});
const weaponCategoryFilter = ref<WeaponCategory | null>(null);
const armorTypeFilter = ref<ArmorType | null>(null);

const visibleItemIds = computed(() => new Set(filteredList.value.map(item => item.id)));

const buildPassphraseGroups = (packId: string, ids: Set<string>) => {
  const pack = dataPackStore.enabledDataPacks.find(entry => entry.id === packId);
  if (!pack) return [];

  const unlockGroupById = new Map(
    getNormalizedUnlockGroups(pack.editorMeta).map(group => [group.id, group.passphrase])
  );
  const grouped = new Map<string, { id: string; title: string; items: LibraryItem[] }>();
  const visibleItems = pack.items.filter(item => ids.has(item.id));

  visibleItems.forEach(item => {
    const groupId = getEntryUnlockGroupId(item);
    const key = groupId ? `unlock:${groupId}` : 'public';
    const title = groupId ? unlockGroupById.get(groupId) ?? '已解锁口令' : '公开内容';
    if (!grouped.has(key)) {
      grouped.set(key, { id: `${packId}:passphrase:${key}`, title, items: [] });
    }
    grouped.get(key)!.items.push(item);
  });

  return Array.from(grouped.values()).filter(group => group.items.length > 0);
};

const libraryTree = computed(() => {
  const packsById = new Map(dataPackStore.enabledDataPacks.map(pack => [pack.id, pack]));
  const ids = visibleItemIds.value;

  return dataPackStore.getItemGroups(ids).map(packGroup => {
    const pack = packsById.get(packGroup.packId);
    const passphraseGroups = buildPassphraseGroups(packGroup.packId, ids);
    const hasPassphraseGroups = Boolean(pack && getNormalizedUnlockGroups(pack.editorMeta).length > 0);

    return {
      ...packGroup,
      hasPassphraseGroups,
      passphraseMode: Boolean(passphraseGroupedPackIds.value[packGroup.packId]) && hasPassphraseGroups,
      passphraseGroups,
    };
  });
});

const isVisible = (key: string) => !!expandedState.value[key] || props.searchQuery.length > 0;
const toggleExpand = (key: string) => { expandedState.value[key] = !expandedState.value[key]; };
const togglePassphraseGrouping = (packId: string) => {
  passphraseGroupedPackIds.value = {
    ...passphraseGroupedPackIds.value,
    [packId]: !passphraseGroupedPackIds.value[packId],
  };
};

watch(
  libraryTree,
  groups => {
    groups.forEach(pack => {
      if (pack.packId !== DEFAULT_DATA_PACK_ID && expandedState.value[pack.packId] === undefined) {
        expandedState.value[pack.packId] = true;
      }

      pack.categoryGroups.forEach(category => {
        if (pack.packId !== DEFAULT_DATA_PACK_ID && expandedState.value[category.id] === undefined) {
          expandedState.value[category.id] = true;
        }
      });

      pack.passphraseGroups.forEach(group => {
        if (pack.packId !== DEFAULT_DATA_PACK_ID && expandedState.value[group.id] === undefined) {
          expandedState.value[group.id] = true;
        }
      });
    });
  },
  { immediate: true }
);
const isWeaponSubGroup = (category: DataPackItemCategoryGroup, sub: DataPackItemSubGroup) =>
  category.label === '装备' && sub.title === '武器';
const isArmorSubGroup = (category: DataPackItemCategoryGroup, sub: DataPackItemSubGroup) =>
  category.label === '装备' && sub.title === '护甲';

const weaponCategoryOptions: Array<{ value: WeaponCategory; label: string }> = [
  { value: 'simple_melee', label: '简近' },
  { value: 'simple_ranged', label: '简远' },
  { value: 'martial_melee', label: '军近' },
  { value: 'martial_ranged', label: '军远' }
];

const armorTypeOptions: Array<{ value: ArmorType; label: string }> = [
  { value: 'light', label: '轻甲' },
  { value: 'medium', label: '中甲' },
  { value: 'heavy', label: '重甲' }
];

const toggleWeaponCategoryFilter = (category: WeaponCategory) => {
  weaponCategoryFilter.value = weaponCategoryFilter.value === category ? null : category;
};

const toggleArmorTypeFilter = (type: ArmorType) => {
  armorTypeFilter.value = armorTypeFilter.value === type ? null : type;
};

const isArmorItem = (item: LibraryItem): item is ArmorDefinition =>
  item.type === 'armor' && 'armorType' in item;

const filteredSubItems = (category: DataPackItemCategoryGroup, sub: DataPackItemSubGroup) => {
  if (isWeaponSubGroup(category, sub) && weaponCategoryFilter.value) {
    return sub.items.filter((item) => item.type === 'weapon' && item.category === weaponCategoryFilter.value);
  }

  if (isArmorSubGroup(category, sub) && armorTypeFilter.value) {
    return sub.items.filter((item) => isArmorItem(item) && item.armorType === armorTypeFilter.value);
  }

  return sub.items;
};

const cloneItem = (item: LibraryItem): LibraryCloneDragElement => ({ libraryId: item.id });

const onNativeDragStart = (e: DragEvent, item: LibraryItem) => {
  emit('leave-item');
  setupDragData(e, 'library-item', item.id, false);
  dataPackStore.recordMakerDragDiagnostic('library.dragstart', 'ok', 'Library item dragstart fired', {
    itemId: item.id,
    itemName: item.name,
    dataTransferTypes: e.dataTransfer ? Array.from(e.dataTransfer.types) : [],
    makerOpen: dataPackStore.isMakerOpen,
  });
};

const onDragEnd = () => {
  clearGlobalDragPayload();
  dataPackStore.recordMakerDragDiagnostic('library.dragend', 'info', 'Library item dragend fired; global payload cleanup scheduled', {
    makerOpen: dataPackStore.isMakerOpen,
  });
  dataPackStore.resolveMakerWorkbenchDropFromDragEnd();
};

const weaponPropertyLabels: Record<WeaponPropertyKey, string> = {
  ammunition: '弹药',
  finesse: '灵巧',
  heavy: '重型',
  light: '轻型',
  loading: '装填',
  reach: '触及',
  special: '特殊',
  thrown: '投掷',
  two_handed: '双手',
  versatile: '两用'
};

const isWeaponItem = (item: LibraryItem): item is WeaponDefinition =>
  item.type === 'weapon' && 'properties' in item && Array.isArray(item.properties);

const getLibraryItemStyle = (item: LibraryItem) => getMagicInventoryStyle(item);
const getLibraryItemNameStyle = (item: LibraryItem) =>
  item.magic?.isMagic ? { color: item.magic.visuals?.nameColor || getLibraryItemStyle(item)?.color } : undefined;

const getBadges = (item: LibraryItem) => {
  const badges: Array<{ text: string; color: 'blue' | 'orange' | 'cyan' | 'red' | 'green' | 'purple' }> = [];

  if (item.magic?.isMagic) badges.push({ text: '魔法', color: 'purple' });
  if (item.source) badges.push({ text: item.source, color: 'blue' });
  if ('capacityVolume' in item && item.capacityVolume) badges.push({ text: '容器', color: 'orange' });
  if ('contents' in item && item.contents) badges.push({ text: '套组', color: 'orange' });
  if (item.type === 'pack') badges.push({ text: `总重 ${item.weight} lb`, color: 'cyan' });
  if ('isAmmunition' in item && item.isAmmunition) badges.push({ text: '弹药', color: 'orange' });
  if ('ac' in item && item.ac) badges.push({ text: `AC ${item.ac}`, color: 'cyan' });
  if ('damage' in item && item.damage) badges.push({ text: item.damage, color: 'red' });
  if (isWeaponItem(item)) {
    item.properties.forEach((property) => {
      badges.push({ text: weaponPropertyLabels[property] ?? property, color: 'green' });
    });
  }
  if (item.descriptionBlocks?.some((block) => block.type === 'table')) badges.push({ text: '表格', color: 'cyan' });

  return badges;
};
</script>

<template>
  <div class="items-panel">
    <div v-for="pack in libraryTree" :key="pack.packId" class="main-group">
      <div class="main-group-header" @click="toggleExpand(pack.packId)" :class="{ 'is-open': isVisible(pack.packId) }">
        <div class="header-content"><span class="arrow-icon">&gt;</span>{{ pack.label }}</div>
        <button
          v-if="pack.hasPassphraseGroups"
          type="button"
          class="passphrase-toggle"
          :class="{ active: pack.passphraseMode }"
          title="Passphrase grouping"
          @click.stop="togglePassphraseGrouping(pack.packId)"
        >
          Key
        </button>
      </div>
      <div v-show="isVisible(pack.packId) && pack.passphraseMode">
        <div v-for="group in pack.passphraseGroups" :key="group.id" class="category-group">
          <div class="category-header passphrase-header" @click="toggleExpand(group.id)" :class="{ 'is-open': isVisible(group.id) }">
            <div class="header-left"><span class="arrow-icon">&gt;</span>{{ group.title }}</div>
            <span class="count">{{ group.items.length }}</span>
          </div>
          <div v-show="isVisible(group.id)">
            <draggable
              :list="group.items"
              :group="{ name: 'library', pull: 'clone', put: false }"
              :clone="cloneItem"
              item-key="id"
              class="item-list"
            >
              <template #item="{ element }">
                <div
                  class="library-item"
                  :class="{ magic: element.magic?.isMagic }"
                  :style="getLibraryItemStyle(element)"
                  draggable="true"
                  @mouseenter="emit('hover-item', element, $event)"
                  @mousemove="emit('move-item', $event)"
                  @mouseleave="emit('leave-item')"
                  @dragstart="onNativeDragStart($event, element)"
                  @dragend="onDragEnd"
                >
                  <div class="item-row">
                    <span class="item-name" :style="getLibraryItemNameStyle(element)">
                      {{ formatMagicItemName(element) }}
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
      <div v-show="isVisible(pack.packId) && !pack.passphraseMode">
        <div v-for="category in pack.categoryGroups" :key="category.id" class="category-group">
          <div class="category-header" @click="toggleExpand(category.id)" :class="{ 'is-open': isVisible(category.id) }">
            <div class="header-left"><span class="arrow-icon">&gt;</span>{{ category.label }}</div>
          </div>
          <div v-show="isVisible(category.id)">
            <div v-for="sub in category.subGroups" :key="sub.title" class="sub-group">
              <div class="sticky-sub-header" @click="toggleExpand(`${category.id}_${sub.title}`)" :class="{ 'is-open': isVisible(`${category.id}_${sub.title}`) }">
                <div class="header-left"><span class="arrow-icon">&gt;</span>{{ sub.title }}</div>
                <div v-if="isWeaponSubGroup(category, sub)" class="weapon-filter" @click.stop>
                  <button
                    v-for="option in weaponCategoryOptions"
                    :key="option.value"
                    type="button"
                    class="weapon-filter-button"
                    :class="{ active: weaponCategoryFilter === option.value }"
                    @click="toggleWeaponCategoryFilter(option.value)"
                  >
                    {{ option.label }}
                  </button>
                </div>
                <div v-if="isArmorSubGroup(category, sub)" class="weapon-filter" @click.stop>
                  <button
                    v-for="option in armorTypeOptions"
                    :key="option.value"
                    type="button"
                    class="weapon-filter-button"
                    :class="{ active: armorTypeFilter === option.value }"
                    @click="toggleArmorTypeFilter(option.value)"
                  >
                    {{ option.label }}
                  </button>
                </div>
                <span class="count">{{ filteredSubItems(category, sub).length }}</span>
              </div>
              <div v-show="isVisible(`${category.id}_${sub.title}`)">
                <draggable
                  :list="filteredSubItems(category, sub)"
                  :group="{ name: 'library', pull: 'clone', put: false }"
                  :clone="cloneItem"
                  item-key="id"
                  class="item-list"
                >
                  <template #item="{ element }">
                    <div
                      class="library-item"
                      :class="{ magic: element.magic?.isMagic }"
                      :style="getLibraryItemStyle(element)"
                      draggable="true"
                      @mouseenter="emit('hover-item', element, $event)"
                      @mousemove="emit('move-item', $event)"
                      @mouseleave="emit('leave-item')"
                      @dragstart="onNativeDragStart($event, element)"
                      @dragend="onDragEnd"
                    >
                      <div class="item-row">
                        <span class="item-name" :style="getLibraryItemNameStyle(element)">
                          {{ formatMagicItemName(element) }}
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
      </div>
    </div>
    <div v-if="libraryTree.length === 0" class="empty-state">未找到匹配物品</div>
  </div>
</template>

<style scoped lang="scss">
.items-panel {
  --main-group-sticky-height: 46px;
}

.main-group-header {
  position: sticky; top: 0; z-index: 20; min-height: var(--main-group-sticky-height);
  padding: 14px 12px; margin-top: 1px; background-color: var(--color-library-main-header-bg); border-bottom: 1px solid var(--color-library-border); border-left: 4px solid var(--color-library-main-header-accent);
  font-size: 0.95rem; font-weight: 800; color: var(--color-library-main-header-text); text-transform: uppercase; letter-spacing: 1px; cursor: pointer; user-select: none; transition: all 0.2s;
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  &:hover { background-color: var(--color-library-main-header-hover-bg); color: var(--color-library-text-strong); }
  .header-content { display: flex; align-items: center; gap: 8px; }
  .arrow-icon { font-size: 0.75rem; color: var(--color-library-main-header-arrow); transition: transform 0.2s ease; display: inline-block; }
  &.is-open { background-color: var(--color-library-main-header-open-bg); border-left-color: var(--color-library-accent); border-bottom-color: var(--color-library-accent); color: var(--color-library-accent); .arrow-icon { transform: rotate(90deg); color: var(--color-library-accent); } }
}

.passphrase-toggle {
  border: 1px solid var(--color-library-magic-border);
  background: var(--color-library-magic-bg);
  color: var(--color-library-magic-text);
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: none;
  cursor: pointer;
  &:hover { border-color: var(--color-library-magic-border-strong); background: var(--color-library-magic-bg-hover); color: var(--color-library-text-strong); }
  &.active { border-color: var(--color-library-magic-text); background: var(--color-library-magic-bg-active); color: var(--color-library-text-strong); }
}

.sticky-sub-header {
  position: sticky; top: calc(var(--main-group-sticky-height) + 34px); z-index: 15; background-color: var(--color-library-sub-header-bg); border-left: 4px solid var(--color-library-sub-header-bg); padding: 8px 12px 8px 34px;
  font-size: 0.85rem; font-weight: bold; color: var(--color-library-sub-header-text); border-bottom: 1px solid var(--color-library-border); display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none; transition: background-color 0.2s;
  &:hover { background-color: var(--color-library-sub-header-hover-bg); color: var(--color-library-text-strong); }
  .header-left { display: flex; align-items: center; gap: 6px; }
  .arrow-icon { font-size: 0.7rem; transition: transform 0.2s; }
  &.is-open { color: var(--color-library-sub-header-open-text); background-color: var(--color-library-sub-header-open-bg); .arrow-icon { transform: rotate(90deg); } }
  .count { font-size: 0.7rem; color: var(--color-library-count-text); background: var(--color-library-count-bg); padding: 1px 6px; border-radius: 8px; }
}

.category-header {
  position: sticky; top: var(--main-group-sticky-height); z-index: 17; background-color: var(--color-library-category-bg); border-left: 4px solid var(--color-library-category-accent); padding: 9px 12px 9px 22px;
  font-size: 0.88rem; font-weight: 800; color: var(--color-library-category-text); border-bottom: 1px solid var(--color-library-border); display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none;
  &:hover { background-color: var(--color-library-category-hover-bg); color: var(--color-library-text-strong); }
  .header-left { display: flex; align-items: center; gap: 6px; }
  .arrow-icon { font-size: 0.7rem; transition: transform 0.2s; }
  &.is-open { color: var(--color-library-category-open); border-left-color: var(--color-library-category-open); .arrow-icon { transform: rotate(90deg); } }
}

.category-header.passphrase-header {
  color: var(--color-library-magic-text);
  border-left-color: var(--color-library-magic-border);
  .count { font-size: 0.7rem; color: var(--color-library-magic-count); background: var(--color-library-magic-count-bg); padding: 1px 6px; border-radius: 8px; }
  &.is-open { color: var(--color-library-magic-text-strong); border-left-color: var(--color-library-magic-text); }
}

.weapon-filter { display: flex; gap: 4px; margin-left: auto; margin-right: 8px; }
.weapon-filter-button {
  border: 1px solid var(--color-library-border); background: var(--color-library-filter-bg); color: var(--color-library-text-muted); font-size: 0.68rem; line-height: 1; padding: 4px 6px; border-radius: 4px; cursor: pointer;
  &:hover { color: var(--color-library-main-header-text); border-color: var(--color-library-text-empty); background: var(--color-library-filter-hover-bg); }
  &.active { color: var(--color-library-filter-active-text); border-color: var(--color-library-filter-active-border); background: var(--color-library-filter-active-bg); }
}

.library-item { background-color: var(--color-library-item-bg); border-bottom: 1px solid var(--color-library-item-border); padding: 10px 14px; cursor: grab; transition: background 0.1s; &:hover { background-color: var(--color-library-item-hover-bg); } }
.library-item.magic { border-left: 3px solid var(--color-library-magic-border-strong); box-shadow: inset 0 0 0 1px var(--color-library-item-magic-shadow); }
.item-row { display: flex; justify-content: space-between; gap: 8px; }
.item-name { color: var(--color-library-item-name); font-size: 0.9rem; font-weight: 500; min-width: 0; }
.item-name small { display: block; color: currentColor; opacity: 0.62; font-size: 0.7rem; margin-top: 2px; }
.item-cost { color: var(--color-library-item-cost); font-size: 0.8rem; font-family: monospace; white-space: nowrap; }

.badges-row { margin-top: 4px; display: flex; gap: 4px; flex-wrap: wrap; }
.badge { font-size: 0.65rem; padding: 2px 5px; border-radius: 3px; background: var(--color-library-badge-bg); color: var(--color-library-badge-text); }
.badge.blue { color: var(--color-library-badge-blue-text); background: var(--color-library-badge-blue-bg); }
.badge.orange { color: var(--color-library-badge-orange-text); background: var(--color-library-badge-orange-bg); }
.badge.cyan { color: var(--color-library-badge-cyan-text); background: var(--color-library-badge-cyan-bg); }
.badge.red { color: var(--color-library-badge-red-text); background: var(--color-library-badge-red-bg); }
.badge.green { color: var(--color-library-badge-green-text); background: var(--color-library-badge-green-bg); }
.badge.purple { color: var(--color-library-badge-purple-text); background: var(--color-library-badge-purple-bg); }
.empty-state { padding: 40px; text-align: center; color: var(--color-library-text-empty); }
</style>
