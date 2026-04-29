<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useDataPackStore } from '../../../stores/dataPackStore';
import { useForge } from '../../../composables/useForge';
import { useEnchanting } from '../../../composables/useEnchanting';
import { getDragPayloadFromEvent } from '../../../utils/inventoryDropUtils';
import type { DataPackTraitDefinition } from '../../../types/DataPack';
import type { LibraryItem } from '../../../types/Library';
import type { InventoryItem } from '../../../types/Item';
import type { SpellDefinition } from '../../../types/Spell';

const store = useDataPackStore();
const { openForgeForItem } = useForge();
const { openEnchantingForItem } = useEnchanting();
const activeSection = ref<'items' | 'spells' | 'traits' | 'groups' | 'meta'>('items');
const selectedItemIndex = ref(0);
const selectedSpellIndex = ref(0);
const sourcePackId = ref('');
const activeItemWorkbench = ref<'forge' | 'enchant'>('forge');
const hoveringWorkbench = ref<'forge' | 'enchant' | null>(null);
const newItemGroupName = ref('');
const newItemSubgroupName = ref('');
const newItemSubgroupParentId = ref('');
const newSpellGroupName = ref('');
const newSpellSubgroupName = ref('');
const newSpellSubgroupParentId = ref('');
const newEncryptionGroupName = ref('');
const newEncryptionGroupDescription = ref('');
const draggedContentItemId = ref('');
const draggedContentGroupKey = ref('');
const isSavingDraft = ref(false);
const lockDraft = reactive({
  enabled: false,
  password: '',
  hint: '',
  localOnly: false,
});

const pack = computed(() => store.activeDraftPack);
const items = computed(() => pack.value?.items ?? []);
const spells = computed(() => pack.value?.spells ?? []);
const traits = computed(() => pack.value?.traits ?? []);
const selectedItem = computed(() => items.value[selectedItemIndex.value] as LibraryItem | undefined);
const selectedSpell = computed(() => spells.value[selectedSpellIndex.value] as SpellDefinition | undefined);
const importablePacks = computed(() =>
  store.orderedDataPacks.filter(entry => entry.id !== pack.value?.manifest.id)
);
const itemMenuGroups = computed(() => pack.value?.editorMeta?.menuGroups?.items ?? []);
const spellMenuGroups = computed(() => pack.value?.editorMeta?.menuGroups?.spells ?? []);
const encryptionGroups = computed(() => pack.value?.editorMeta?.encryptionGroups ?? []);
const contentGroups = computed(() => {
  const groups: Array<{
    category: string;
    subgroups: Array<{ key: string; category: string; subcategory: string; items: LibraryItem[] }>;
  }> = [];
  const categoryMap = new Map<string, typeof groups[number]>();

  items.value.forEach(item => {
    const category = item.displayCategory || item.type || '未分组';
    const subcategory = item.displaySubcategory || item.type || '未分组';
    let group = categoryMap.get(category);
    if (!group) {
      group = { category, subgroups: [] };
      categoryMap.set(category, group);
      groups.push(group);
    }
    let subgroup = group.subgroups.find(entry => entry.subcategory === subcategory);
    if (!subgroup) {
      subgroup = {
        key: `${category}::${subcategory}`,
        category,
        subcategory,
        items: [],
      };
      group.subgroups.push(subgroup);
    }
    subgroup.items.push(item);
  });

  return groups;
});

watch(pack, next => {
  const lock = next?.editorMeta?.editLock;
  lockDraft.enabled = lock?.enabled ?? false;
  lockDraft.password = '';
  lockDraft.hint = lock?.hint ?? '';
  lockDraft.localOnly = lock?.localOnly ?? false;
}, { immediate: true });

const markDirty = () => store.markDraftDirty();
const switchLibraryTab = (tab: 'items' | 'spells') => {
  activeSection.value = tab;
  store.setMakerLibraryTab(tab);
};

const clonePlain = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const libraryItemToInventoryItem = (item: LibraryItem): InventoryItem => {
  const {
    id,
    name,
    type,
    weight,
    description,
    descriptionBlocks,
    magic,
    multiplicity,
    acquisitionRule,
    audit,
    ...data
  } = item;
  void multiplicity;
  void acquisitionRule;
  void audit;

  return {
    instanceId: `draft-${id}`,
    templateId: id,
    name,
    type,
    weight,
    quantity: 1,
    description,
    descriptionBlocks: clonePlain(descriptionBlocks),
    magic: clonePlain(magic),
    data: clonePlain(data),
  };
};

const inventoryItemToLibraryItem = (original: LibraryItem, item: InventoryItem): LibraryItem => {
  const data = clonePlain(item.data) as Partial<LibraryItem>;
  return {
    ...clonePlain(original),
    ...data,
    id: original.id,
    name: item.name,
    type: item.type,
    weight: item.weight,
    description: item.description ?? '',
    descriptionBlocks: clonePlain(item.descriptionBlocks),
    magic: clonePlain(item.magic),
  } as LibraryItem;
};

const updateDraftItemFromInventory = (itemId: string, inventoryItem: InventoryItem) => {
  if (!pack.value) return;
  const index = items.value.findIndex(item => item.id === itemId);
  if (index < 0) return;
  const updated = inventoryItemToLibraryItem(items.value[index], inventoryItem);
  pack.value.items = items.value.map((item, itemIndex) => itemIndex === index ? updated : item);
  selectedItemIndex.value = index;
  store.markDraftDirty();
};

const openForgeEditorForDraftItem = (item: LibraryItem) => {
  activeItemWorkbench.value = 'forge';
  selectedItemIndex.value = items.value.findIndex(entry => entry.id === item.id);
  openForgeForItem(libraryItemToInventoryItem(item), 'edit', updated => {
    updateDraftItemFromInventory(item.id, updated);
  }, { dataPackMaker: true });
};

const openEnchantEditorForDraftItem = (item: LibraryItem) => {
  activeItemWorkbench.value = 'enchant';
  selectedItemIndex.value = items.value.findIndex(entry => entry.id === item.id);
  openEnchantingForItem(libraryItemToInventoryItem(item), 'button', updated => {
    updateDraftItemFromInventory(item.id, updated);
  }, { dataPackMaker: true });
};

const importItemIntoWorkbench = async (runtimeItemId: string, target: 'forge' | 'enchant') => {
  store.clearMakerWorkbenchDropCandidate();
  activeSection.value = 'items';
  activeItemWorkbench.value = target;
  const importedItem = store.importItemToDraft(runtimeItemId, target);
  await nextTick();
  const importedIndex = importedItem
    ? items.value.findIndex(item => item.id === importedItem.id)
    : -1;
  selectedItemIndex.value = importedIndex >= 0 ? importedIndex : Math.max(0, items.value.length - 1);
  if (importedItem) {
    if (target === 'enchant') {
      openEnchantEditorForDraftItem(importedItem);
    } else {
      openForgeEditorForDraftItem(importedItem);
    }
  }
};

watch(
  () => store.makerItemWorkbenchRequest,
  request => {
    if (!request) return;
    void importItemIntoWorkbench(request.runtimeItemId, request.target);
  }
);

const onWorkbenchDragEnter = (target: 'forge' | 'enchant') => {
  hoveringWorkbench.value = target;
};

const onWorkbenchDragOver = (event: DragEvent, target: 'forge' | 'enchant') => {
  event.preventDefault();
  event.stopPropagation();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy';
  }
  hoveringWorkbench.value = target;
  const payload = getDragPayloadFromEvent(event);
  if (payload?.type === 'library-item') {
    store.armMakerWorkbenchDropCandidate(payload.id, target, 'maker-card');
  }
};

const onWorkbenchDragLeave = (target: 'forge' | 'enchant') => {
  if (hoveringWorkbench.value === target) {
    hoveringWorkbench.value = null;
  }
};

type MakerDragEvent = DragEvent & {
  __makerWorkbenchDropHandled?: boolean;
};

const activateItemWorkbenchFromDrop = async (event: DragEvent, target: 'forge' | 'enchant') => {
  event.preventDefault();
  event.stopPropagation();
  hoveringWorkbench.value = null;
  const payload = getDragPayloadFromEvent(event);
  if (payload?.type === 'library-item') {
    await importItemIntoWorkbench(payload.id, target);
  }
};

const onItemDrop = async (event: MakerDragEvent, target: 'forge' | 'enchant') => {
  event.__makerWorkbenchDropHandled = true;
  await activateItemWorkbenchFromDrop(event, target);
};

const getWorkbenchTargetFromEvent = (event: DragEvent): 'forge' | 'enchant' | null => {
  const target = event.target instanceof Element
    ? event.target.closest<HTMLElement>('[data-maker-workbench]')
    : null;
  const workbench = target?.dataset.makerWorkbench;
  return workbench === 'forge' || workbench === 'enchant' ? workbench : null;
};

const onDocumentDragOver = (event: DragEvent) => {
  const target = getWorkbenchTargetFromEvent(event);
  if (!target) return;
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy';
  }
  hoveringWorkbench.value = target;
  const payload = getDragPayloadFromEvent(event);
  if (payload?.type === 'library-item') {
    store.armMakerWorkbenchDropCandidate(payload.id, target, 'maker-document');
  }
};

const onDocumentDrop = (event: MakerDragEvent) => {
  if (event.__makerWorkbenchDropHandled) return;
  const target = getWorkbenchTargetFromEvent(event);
  if (!target) return;
  event.__makerWorkbenchDropHandled = true;
  void activateItemWorkbenchFromDrop(event, target);
};

onMounted(() => {
  document.addEventListener('dragover', onDocumentDragOver, true);
  document.addEventListener('drop', onDocumentDrop, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('dragover', onDocumentDragOver, true);
  document.removeEventListener('drop', onDocumentDrop, true);
});

const onNativeSpellDrop = (event: DragEvent) => {
  event.preventDefault();
  const rawSpellId = event.dataTransfer?.getData('application/x-dnd-spell-id');
  if (rawSpellId) {
    activeSection.value = 'spells';
    store.importSpellToDraft(rawSpellId);
    selectedSpellIndex.value = Math.max(0, spells.value.length - 1);
  }
};

const addNormalGroup = (domain: 'items' | 'spells') => {
  if (domain === 'items') {
    store.addMenuGroup('items', newItemGroupName.value);
    newItemGroupName.value = '';
    return;
  }
  store.addMenuGroup('spells', newSpellGroupName.value);
  newSpellGroupName.value = '';
};

const addNormalSubgroup = (domain: 'items' | 'spells') => {
  if (domain === 'items') {
    store.addMenuSubgroup('items', newItemSubgroupParentId.value, newItemSubgroupName.value);
    newItemSubgroupName.value = '';
    return;
  }
  store.addMenuSubgroup('spells', newSpellSubgroupParentId.value, newSpellSubgroupName.value);
  newSpellSubgroupName.value = '';
};

const addEncryptionGroup = () => {
  store.addEncryptionGroup(newEncryptionGroupName.value, newEncryptionGroupDescription.value);
  newEncryptionGroupName.value = '';
  newEncryptionGroupDescription.value = '';
};

const addTrait = () => {
  if (!pack.value) return;
  const id = `trait-${Date.now()}`;
  const trait: DataPackTraitDefinition = {
    id,
    name: '新词条',
    kind: 'custom',
    description: '',
  };
  pack.value.traits = [...(pack.value.traits ?? []), trait];
  store.markDraftDirty();
};

const removeSelectedItem = () => {
  if (!pack.value) return;
  pack.value.items = items.value.filter((_, index) => index !== selectedItemIndex.value);
  selectedItemIndex.value = 0;
  store.markDraftDirty();
};

const removeSelectedSpell = () => {
  if (!pack.value) return;
  pack.value.spells = spells.value.filter((_, index) => index !== selectedSpellIndex.value);
  selectedSpellIndex.value = 0;
  store.markDraftDirty();
};

const removeDraftItem = (itemId: string) => {
  if (!pack.value) return;
  pack.value.items = items.value.filter(item => item.id !== itemId);
  selectedItemIndex.value = Math.max(0, Math.min(selectedItemIndex.value, pack.value.items.length - 1));
  store.markDraftDirty();
};

const onContentItemDragStart = (itemId: string) => {
  draggedContentItemId.value = itemId;
};

const onContentItemDragEnd = () => {
  draggedContentItemId.value = '';
};

const moveContentItemToGroup = (
  category: string,
  subcategory: string,
  beforeItemId?: string
) => {
  if (!pack.value || !draggedContentItemId.value) return;
  const source = [...items.value];
  const sourceIndex = source.findIndex(item => item.id === draggedContentItemId.value);
  if (sourceIndex < 0) return;
  const [moving] = source.splice(sourceIndex, 1);
  moving.displayCategory = category;
  moving.displaySubcategory = subcategory;

  let insertIndex = beforeItemId ? source.findIndex(item => item.id === beforeItemId) : -1;
  if (insertIndex < 0) {
    insertIndex = source.reduce((lastIndex, item, index) => {
      const itemCategory = item.displayCategory || item.type || '未分组';
      const itemSubcategory = item.displaySubcategory || item.type || '未分组';
      return itemCategory === category && itemSubcategory === subcategory ? index + 1 : lastIndex;
    }, source.length);
  }

  source.splice(insertIndex, 0, moving);
  pack.value.items = source;
  selectedItemIndex.value = source.findIndex(item => item.id === moving.id);
  draggedContentItemId.value = '';
  store.markDraftDirty();
};

const onContentGroupDragStart = (key: string) => {
  draggedContentGroupKey.value = key;
};

const onContentGroupDragEnd = () => {
  draggedContentGroupKey.value = '';
};

const moveContentGroupBefore = (targetKey: string) => {
  if (!pack.value || !draggedContentGroupKey.value || draggedContentGroupKey.value === targetKey) return;
  const chunks = contentGroups.value.flatMap(group => group.subgroups).map(subgroup => ({
    key: subgroup.key,
    items: subgroup.items,
  }));
  const movingIndex = chunks.findIndex(chunk => chunk.key === draggedContentGroupKey.value);
  const targetIndex = chunks.findIndex(chunk => chunk.key === targetKey);
  if (movingIndex < 0 || targetIndex < 0) return;

  const [moving] = chunks.splice(movingIndex, 1);
  chunks.splice(movingIndex < targetIndex ? targetIndex - 1 : targetIndex, 0, moving);
  pack.value.items = chunks.flatMap(chunk => chunk.items);
  draggedContentGroupKey.value = '';
  store.markDraftDirty();
};

const saveLock = async () => {
  await store.updateDraftEditLock({
    enabled: lockDraft.enabled,
    password: lockDraft.password.trim() || undefined,
    hint: lockDraft.hint.trim() || undefined,
    localOnly: lockDraft.localOnly,
  });
  lockDraft.password = '';
};

const saveDraftFromHeader = async () => {
  if (isSavingDraft.value) return;
  isSavingDraft.value = true;
  try {
    await store.saveDraftPack('update');
  } finally {
    isSavingDraft.value = false;
  }
};

</script>

<template>
  <section v-if="pack" class="maker">
    <header class="maker-header">
      <div>
        <p class="eyebrow">GM 数据包制作器</p>
        <h1>{{ pack.manifest.name }}</h1>
        <p class="meta">ID: {{ pack.manifest.id }}（创建后不可修改） · 版本 {{ pack.manifest.version }}</p>
      </div>
      <div class="header-actions">
        <button type="button" :class="{ active: activeSection === 'items' }" @click="switchLibraryTab('items')">物品制作</button>
        <button type="button" :class="{ active: activeSection === 'spells' }" @click="switchLibraryTab('spells')">法术制作</button>
        <button type="button" :disabled="isSavingDraft" @click="saveDraftFromHeader">
          {{ isSavingDraft ? '保存中...' : '保存' }}
        </button>
        <button type="button" class="ghost" @click="store.closeMaker">关闭制作器</button>
      </div>
    </header>

    <nav class="maker-tabs">
      <button :class="{ active: activeSection === 'items' }" @click="switchLibraryTab('items')">物品 / 工作台</button>
      <button :class="{ active: activeSection === 'spells' }" @click="switchLibraryTab('spells')">法术编辑（占位）</button>
      <button :class="{ active: activeSection === 'traits' }" @click="activeSection = 'traits'">词条编辑（占位）</button>
      <button :class="{ active: activeSection === 'groups' }" @click="activeSection = 'groups'">分组 / 加密分组</button>
      <button :class="{ active: activeSection === 'meta' }" @click="activeSection = 'meta'">元数据 / 编辑锁</button>
    </nav>

    <section class="import-strip">
      <span>从其他数据包导入快照</span>
      <select v-model="sourcePackId">
        <option value="">选择来源数据包</option>
        <option v-for="source in importablePacks" :key="source.id" :value="source.id">
          {{ source.name }}（物品 {{ source.items.length }} / 法术 {{ source.spells.length }} / 词条 {{ source.traits.length }}）
        </option>
      </select>
      <button type="button" :disabled="!sourcePackId" @click="store.importPackContentsToDraft(sourcePackId)">
        导入到当前数据包
      </button>
    </section>



    <div v-if="activeSection === 'items'" class="maker-grid maker-grid-content">
      <aside class="list-panel workbench-panel">
        <div class="drop-grid">
          <div
            class="drop-card"
            data-maker-workbench="forge"
            :class="{ hovering: hoveringWorkbench === 'forge' }"
            @dragenter.prevent.stop="onWorkbenchDragEnter('forge')"
            @dragover.prevent.stop="onWorkbenchDragOver($event, 'forge')"
            @dragleave.prevent.stop="onWorkbenchDragLeave('forge')"
            @drop.prevent.stop="onItemDrop($event, 'forge')"
          >
            <strong>铁匠台</strong>
            <span>拖拽物品到这里，复制到当前数据包并唤起 DIY 物品窗口。</span>
          </div>
          <div
            class="drop-card purple"
            data-maker-workbench="enchant"
            :class="{ hovering: hoveringWorkbench === 'enchant' }"
            @dragenter.prevent.stop="onWorkbenchDragEnter('enchant')"
            @dragover.prevent.stop="onWorkbenchDragOver($event, 'enchant')"
            @dragleave.prevent.stop="onWorkbenchDragLeave('enchant')"
            @drop.prevent.stop="onItemDrop($event, 'enchant')"
          >
            <strong>附魔台</strong>
            <span>拖拽物品到这里，复制到当前数据包并唤起附魔窗口。</span>
          </div>
        </div>
        <div class="workbench-hint">
          <strong>编辑方式</strong>
          <span>点击内容区物品上的“DIY 编辑”或“附魔”按钮，会打开已有的物品/附魔窗口。</span>
        </div>
      </aside>

      <main class="content-panel">
        <div class="editor-top">
          <div>
            <h2>数据包内容物</h2>
            <p class="hint">按普通一二级分组展示；拖拽物品可排序或移动到其他分组，拖拽分组标题可调整分组顺序。</p>
          </div>
        </div>

        <div v-if="contentGroups.length === 0" class="empty-panel compact">从右侧物品库拖拽物品到铁匠台或附魔台。</div>
        <section v-else class="content-groups">
          <article v-for="group in contentGroups" :key="group.category" class="content-category">
            <header class="content-category-title">
              <span>{{ group.category }}</span>
              <small>{{ group.subgroups.reduce((sum, sub) => sum + sub.items.length, 0) }} 件</small>
            </header>

            <div class="content-subgroups">
              <section
                v-for="subgroup in group.subgroups"
                :key="subgroup.key"
                class="content-subgroup"
                @dragover.prevent
                @drop.prevent="moveContentItemToGroup(subgroup.category, subgroup.subcategory)"
              >
                <header
                  class="content-subgroup-title"
                  draggable="true"
                  @dragstart="onContentGroupDragStart(subgroup.key)"
                  @dragend="onContentGroupDragEnd"
                  @dragover.prevent
                  @drop.prevent.stop="moveContentGroupBefore(subgroup.key)"
                >
                  <span class="drag-handle">⋮⋮</span>
                  <strong>{{ subgroup.subcategory }}</strong>
                  <small>{{ subgroup.items.length }} 件</small>
                </header>

                <div class="content-items">
                  <article
                    v-for="item in subgroup.items"
                    :key="item.id"
                    class="content-item-card"
                    :class="{ active: selectedItem?.id === item.id }"
                    draggable="true"
                    @dragstart="onContentItemDragStart(item.id)"
                    @dragend="onContentItemDragEnd"
                    @dragover.prevent
                    @drop.prevent.stop="moveContentItemToGroup(subgroup.category, subgroup.subcategory, item.id)"
                    @click="selectedItemIndex = items.findIndex(entry => entry.id === item.id)"
                  >
                    <span class="drag-handle">⋮⋮</span>
                    <div class="content-item-main">
                      <strong>{{ item.name }}</strong>
                      <small>{{ item.type }} / {{ item.source || pack.manifest.name }}</small>
                    </div>
                    <div class="content-item-actions">
                      <button type="button" class="small" @click.stop="openForgeEditorForDraftItem(item)">DIY 编辑</button>
                      <button type="button" class="small" @click.stop="openEnchantEditorForDraftItem(item)">附魔</button>
                      <button type="button" class="danger small" @click.stop="removeDraftItem(item.id)">删除</button>
                    </div>
                  </article>
                </div>
              </section>
            </div>
          </article>
        </section>
      </main>
    </div>

    <div v-else-if="activeSection === 'spells'" class="maker-grid">
      <aside class="list-panel">
        <div class="drop-card blue" @dragover.prevent @drop="onNativeSpellDrop">
          <strong>法术编辑入口</strong>
          <span>从右侧法术库拖拽法术到这里，复制为当前数据包法术。编辑器正文后续实装。</span>
        </div>
        <button
          v-for="(spell, index) in spells"
          :key="spell.id"
          type="button"
          class="entry"
          :class="{ active: selectedSpellIndex === index }"
          @click="selectedSpellIndex = index"
        >
          {{ spell.name }}<small>{{ spell.level === 0 ? '戏法' : `${spell.level}环` }}</small>
        </button>
      </aside>
      <main class="editor-panel" v-if="selectedSpell">
        <div class="editor-top">
          <h2>法术编辑（占位）</h2>
          <button type="button" class="danger" @click="removeSelectedSpell">删除法术</button>
        </div>
        <label>ID<input :value="selectedSpell.id" disabled /></label>
        <label>名称<input v-model="selectedSpell.name" @input="markDirty" /></label>
        <label>一级菜单（普通分组）<input v-model="selectedSpell.libraryCategory" list="spell-category-list" @input="markDirty" /></label>
        <label>二级菜单（普通分组）<input v-model="selectedSpell.librarySubcategory" list="spell-subcategory-list" @input="markDirty" /></label>
        <datalist id="spell-category-list">
          <option v-for="group in spellMenuGroups" :key="group.id" :value="group.name" />
        </datalist>
        <datalist id="spell-subcategory-list">
          <template v-for="group in spellMenuGroups" :key="group.id">
            <option v-for="child in group.children ?? []" :key="child.id" :value="child.name" />
          </template>
        </datalist>
        <label>加密分组
          <select v-model="selectedSpell.encryptionGroupId" @change="markDirty">
            <option value="">公开 / 不加入加密分组</option>
            <option v-for="group in encryptionGroups" :key="group.id" :value="group.id">{{ group.name }}</option>
          </select>
        </label>
        <label>描述<textarea v-model="selectedSpell.description" @input="markDirty"></textarea></label>
        <div class="placeholder-box">法术字段完整编辑器将在后续版本展开；当前可复制、命名、归类和保存。</div>
      </main>
      <main v-else class="empty-panel">从右侧法术库拖拽法术到法术编辑入口。</main>
    </div>

    <div v-else-if="activeSection === 'traits'" class="editor-panel single">
      <div class="editor-top">
        <h2>词条编辑（占位）</h2>
        <button type="button" @click="addTrait">新增词条</button>
      </div>
      <div v-for="trait in traits" :key="trait.id" class="trait-row">
        <input v-model="trait.name" @input="markDirty" />
        <select v-model="trait.kind" @change="markDirty">
          <option value="custom">自定义</option>
          <option value="enchantment">附魔</option>
          <option value="item_trait">物品词条</option>
          <option value="spell_trait">法术词条</option>
          <option value="class_feature">职业特性</option>
          <option value="rule_note">规则备注</option>
        </select>
        <textarea v-model="trait.description" placeholder="描述" @input="markDirty"></textarea>
      </div>
    </div>

    <div v-else-if="activeSection === 'groups'" class="groups-panel">
      <section class="group-card">
        <h2>物品普通分组（一二级菜单）</h2>
        <div class="inline-form">
          <input v-model="newItemGroupName" placeholder="新增一级菜单" />
          <button type="button" @click="addNormalGroup('items')">新增</button>
        </div>
        <div class="inline-form">
          <select v-model="newItemSubgroupParentId">
            <option value="">选择一级菜单</option>
            <option v-for="group in itemMenuGroups" :key="group.id" :value="group.id">{{ group.name }}</option>
          </select>
          <input v-model="newItemSubgroupName" placeholder="新增二级菜单" />
          <button type="button" @click="addNormalSubgroup('items')">新增子菜单</button>
        </div>
        <div v-for="group in itemMenuGroups" :key="group.id" class="managed-group">
          <strong>{{ group.name }}</strong>
          <button type="button" class="danger small" @click="store.removeMenuGroup('items', group.id)">删除</button>
          <small>{{ (group.children ?? []).map(child => child.name).join(' / ') || '暂无子菜单' }}</small>
        </div>
      </section>

      <section class="group-card">
        <h2>法术普通分组（一二级菜单）</h2>
        <div class="inline-form">
          <input v-model="newSpellGroupName" placeholder="新增一级菜单" />
          <button type="button" @click="addNormalGroup('spells')">新增</button>
        </div>
        <div class="inline-form">
          <select v-model="newSpellSubgroupParentId">
            <option value="">选择一级菜单</option>
            <option v-for="group in spellMenuGroups" :key="group.id" :value="group.id">{{ group.name }}</option>
          </select>
          <input v-model="newSpellSubgroupName" placeholder="新增二级菜单" />
          <button type="button" @click="addNormalSubgroup('spells')">新增子菜单</button>
        </div>
        <div v-for="group in spellMenuGroups" :key="group.id" class="managed-group">
          <strong>{{ group.name }}</strong>
          <button type="button" class="danger small" @click="store.removeMenuGroup('spells', group.id)">删除</button>
          <small>{{ (group.children ?? []).map(child => child.name).join(' / ') || '暂无子菜单' }}</small>
        </div>
      </section>

      <section class="group-card encrypted">
        <h2>加密分组（阶段四预留）</h2>
        <p class="hint">当前仅记录物品/法术所属加密分组，不执行内容加密；阶段四会基于这些分组做密码解锁。</p>
        <div class="inline-form">
          <input v-model="newEncryptionGroupName" placeholder="加密分组名" />
          <input v-model="newEncryptionGroupDescription" placeholder="描述（可选）" />
          <button type="button" @click="addEncryptionGroup">新增加密分组</button>
        </div>
        <div v-for="group in encryptionGroups" :key="group.id" class="managed-group">
          <strong>{{ group.name }}</strong>
          <button type="button" class="danger small" @click="store.removeEncryptionGroup(group.id)">删除</button>
          <small>{{ group.description || '无描述' }}</small>
        </div>
      </section>
    </div>

    <div v-else class="editor-panel single">
      <h2>元数据</h2>
      <label>ID<input :value="pack.manifest.id" disabled /></label>
      <label>名称<input v-model="pack.manifest.name" @input="markDirty" /></label>
      <label>版本<input v-model="pack.manifest.version" @input="markDirty" /></label>
      <label>作者<input v-model="pack.manifest.author" @input="markDirty" /></label>
      <label>简介<textarea v-model="pack.manifest.description" @input="markDirty"></textarea></label>

      <h2>编辑锁</h2>
      <label class="check"><input type="checkbox" v-model="lockDraft.enabled" /> 启用编辑锁</label>
      <label class="check"><input type="checkbox" v-model="lockDraft.localOnly" /> 仅本 PC 用户可编辑</label>
      <label>新密码<input v-model="lockDraft.password" type="password" placeholder="留空则不设置密码" /></label>
      <label>密码提示<input v-model="lockDraft.hint" /></label>
      <button type="button" @click="saveLock">应用编辑锁设置</button>
      <p class="hint">编辑锁不是内容加密；数据包仍为明文。真正分级加密将在后续阶段实现。</p>
    </div>
  </section>
</template>

<style scoped lang="scss">
.maker { min-height: 100%; color: #20252b; }
.maker-header {
  display: flex; justify-content: space-between; gap: 16px; padding: 18px 20px; border-radius: 16px;
  background: linear-gradient(135deg, #f2eadb, #d7e5df); border: 1px solid rgba(70, 80, 70, 0.18);
  h1 { margin: 0; font-size: 1.5rem; }
  .eyebrow { margin: 0 0 4px; font-weight: 800; letter-spacing: 0.12em; color: #6a5632; }
  .meta { margin: 6px 0 0; color: #66706a; }
}
.header-actions { display: flex; align-items: center; gap: 8px; }
button { border: 1px solid #95a38d; background: #fffdf6; color: #263126; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-weight: 700; }
button:disabled { cursor: not-allowed; opacity: 0.58; }
button.active { background: #263126; color: white; }
button.ghost { background: transparent; }
button.danger { border-color: #c86f66; color: #9c3026; }
button.small { padding: 4px 7px; font-size: 0.78rem; }
.maker-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0; button.active { background: #263126; color: white; } }
.import-strip {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 10px 12px; margin-bottom: 14px;
  background: #eef4ef; border: 1px solid #d8ded8; border-radius: 12px; color: #536052; font-weight: 800;
  select { min-width: 260px; }
}
.maker-grid { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 14px; }
.maker-grid-content { grid-template-columns: 330px minmax(0, 1fr); }
.list-panel, .editor-panel, .empty-panel { background: white; border: 1px solid #d8ded8; border-radius: 14px; padding: 14px; }
.content-panel { background: white; border: 1px solid #d8ded8; border-radius: 14px; padding: 14px; min-height: 520px; }
.workbench-panel { align-self: start; }
.workbench-hint { border: 1px solid #dbe5db; border-radius: 12px; padding: 10px; display: grid; gap: 5px; color: #596359; background: #f8fbf6; }
.workbench-hint span { line-height: 1.5; }
.drop-grid { display: grid; gap: 10px; margin-bottom: 12px; }
.drop-card { border: 2px dashed #b78945; background: #fff8e7; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 5px; color: #6a4a1f; transition: transform 0.15s ease, box-shadow 0.15s ease; }
.drop-card.hovering { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(183, 137, 69, 0.22); background: #fff1c7; }
.drop-card.purple { border-color: #9a79bd; background: #f2e9ff; color: #573777; }
.drop-card.purple.hovering { box-shadow: 0 8px 20px rgba(154, 121, 189, 0.24); background: #eadbff; }
.drop-card.blue { border-color: #5c8fbd; background: #eaf5ff; color: #2b5e89; margin-bottom: 12px; }
.entry { width: 100%; margin-bottom: 6px; text-align: left; display: flex; flex-direction: column; gap: 3px; }
.entry.active { background: #263126; color: white; }
.entry small { opacity: 0.72; }
.editor-panel { display: flex; flex-direction: column; gap: 10px; }
.editor-panel.single { max-width: 760px; }
.editor-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
label { display: flex; flex-direction: column; gap: 4px; font-weight: 800; color: #566056; }
label.check { flex-direction: row; align-items: center; }
input, textarea, select { border: 1px solid #cfd8cf; border-radius: 8px; padding: 8px 10px; font: inherit; }
textarea { min-height: 96px; resize: vertical; }
.placeholder-box { border: 1px dashed #9a79bd; color: #5d4775; background: #faf6ff; border-radius: 10px; padding: 12px; }
.trait-row { display: grid; grid-template-columns: 1fr 160px; gap: 8px; padding: 10px; border: 1px solid #e0e5df; border-radius: 10px; }
.trait-row textarea { grid-column: 1 / -1; }
.groups-panel { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.group-card { background: white; border: 1px solid #d8ded8; border-radius: 14px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
.group-card.encrypted { grid-column: 1 / -1; border-color: #c7b4df; background: #fcf8ff; }
.inline-form { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.inline-form input, .inline-form select { min-width: 180px; }
.managed-group { border: 1px solid #e3e8e3; border-radius: 10px; padding: 9px; display: grid; grid-template-columns: 1fr auto; gap: 5px 8px; align-items: center; }
.managed-group small { grid-column: 1 / -1; color: #788178; }
.hint { color: #7b847b; font-size: 0.85rem; }
.empty-panel { display: flex; align-items: center; justify-content: center; color: #778077; min-height: 280px; }
.empty-panel.compact { min-height: 180px; }
.content-groups { display: grid; gap: 14px; }
.content-category { border: 1px solid #e0e6df; border-radius: 12px; overflow: hidden; background: #fbfdfa; }
.content-category-title { display: flex; justify-content: space-between; align-items: center; padding: 9px 12px; background: #edf3ea; color: #354333; font-weight: 900; }
.content-category-title small, .content-subgroup-title small { color: #718071; }
.content-subgroups { display: grid; gap: 10px; padding: 10px; }
.content-subgroup { border: 1px dashed #cbd8c8; border-radius: 12px; padding: 8px; background: #fff; }
.content-subgroup-title { display: flex; align-items: center; gap: 8px; padding: 5px 6px 9px; color: #55614f; cursor: grab; }
.content-items { display: grid; gap: 7px; }
.content-item-card { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 9px; align-items: center; padding: 9px; border: 1px solid #dde6db; border-radius: 10px; background: #fbfcfa; cursor: grab; }
.content-item-card.active { border-color: #263126; box-shadow: 0 0 0 2px rgba(38, 49, 38, 0.12); }
.content-item-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.content-item-main small { color: #798379; }
.content-item-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 5px; }
.drag-handle { color: #9ba89b; font-weight: 900; letter-spacing: -0.18em; cursor: grab; }
@media (max-width: 900px) { .maker-grid, .groups-panel { grid-template-columns: 1fr; } .group-card.encrypted { grid-column: auto; } .maker-header { flex-direction: column; } }
</style>
