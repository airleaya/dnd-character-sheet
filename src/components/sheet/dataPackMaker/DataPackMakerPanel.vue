<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useDataPackStore } from '../../../stores/dataPackStore';
import { useForge } from '../../../composables/useForge';
import { useEnchanting } from '../../../composables/useEnchanting';
import { getDragPayloadFromEvent } from '../../../utils/inventoryDropUtils';
import { formatMagicItemName, getMagicInventoryStyle } from '../../../utils/magicItems';
import { makeUniqueLocalId } from '../../../utils/dataPackUtils';
import { formatCost } from '../../../utils/currencyUtils';
import type { DataPackTraitDefinition } from '../../../types/DataPack';
import type { ItemCost, LibraryItem, ShopCatalogEntry } from '../../../types/Library';
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
const isShopCatalogEditorOpen = ref(false);
const shopCatalogDraft = reactive({
  editingItemId: '',
  name: '商品清单',
  description: '',
  weight: 0,
  costValue: 0,
  costUnit: 'gp' as ItemCost['unit'],
  search: '',
  selectedPackIds: [] as string[],
  entries: [] as ShopCatalogEntry[],
});
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
const globalUnlockPassphrase = computed(() => pack.value?.editorMeta?.globalUnlockPassphrase ?? '');
const unlockGroupStats = computed(() => store.getDraftUnlockGroupStats());
const visibilityIssues = computed(() => store.getDraftVisibilityIssues());
const getUnlockGroupStat = (groupId: string) =>
  unlockGroupStats.value.find(stat => stat.groupId === groupId);
const getDraftItemStyle = (item: LibraryItem) => getMagicInventoryStyle(item);
const getDraftItemNameStyle = (item: LibraryItem) =>
  item.magic?.isMagic ? { color: item.magic.visuals?.nameColor || getDraftItemStyle(item)?.color } : undefined;
const getDraftItemDisplayName = (item: LibraryItem) => formatMagicItemName(item);
const isShopCatalogItem = (item?: LibraryItem) => Boolean(item?.shopCatalog);
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

const allCatalogCandidateItems = computed(() => {
  const byId = new Map<string, LibraryItem>();
  const enabledPackIds = new Set(shopCatalogDraft.selectedPackIds);

  store.orderedDataPacks.forEach(dataPack => {
    if (!enabledPackIds.has(dataPack.id)) return;
    dataPack.items.forEach(item => {
      byId.set(item.id, item);
    });
  });

  if (!pack.value || enabledPackIds.has(pack.value.manifest.id)) {
    items.value.forEach(item => {
      byId.set(item.id, item);
    });
  }

  return Array.from(byId.values()).filter(item => !isShopCatalogItem(item));
});

const filteredCatalogCandidateItems = computed(() => {
  const query = shopCatalogDraft.search.trim().toLowerCase();
  if (!query) return allCatalogCandidateItems.value;
  return allCatalogCandidateItems.value.filter(item =>
    [
      item.name,
      item.englishName,
      item.id,
      item.displayCategory,
      item.displaySubcategory,
      item.source,
    ]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(query))
  );
});

const catalogPackSources = computed(() => {
  const sources = store.orderedDataPacks.map(dataPack => ({
    id: dataPack.id,
    name: dataPack.name,
    itemCount: dataPack.items.filter(item => !isShopCatalogItem(item)).length,
  }));

  if (pack.value && !sources.some(source => source.id === pack.value?.manifest.id)) {
    sources.unshift({
      id: pack.value.manifest.id,
      name: `${pack.value.manifest.name}（当前草稿）`,
      itemCount: items.value.filter(item => !isShopCatalogItem(item)).length,
    });
  }

  return sources;
});

const syncCatalogSelectedPackIds = () => {
  const validIds = catalogPackSources.value.map(source => source.id);
  const selected = shopCatalogDraft.selectedPackIds.filter(id => validIds.includes(id));
  shopCatalogDraft.selectedPackIds = selected.length > 0 ? selected : validIds;
};

watch(catalogPackSources, syncCatalogSelectedPackIds, { immediate: true });

const toggleCatalogPackSource = (packId: string, checked: boolean) => {
  const selected = new Set(shopCatalogDraft.selectedPackIds);
  if (checked) {
    selected.add(packId);
  } else {
    selected.delete(packId);
  }
  shopCatalogDraft.selectedPackIds = Array.from(selected);
};

const setAllCatalogPackSources = (enabled: boolean) => {
  shopCatalogDraft.selectedPackIds = enabled ? catalogPackSources.value.map(source => source.id) : [];
};

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

const clonePlain = <T,>(value: T): T =>
  value === undefined || value === null ? value : JSON.parse(JSON.stringify(value)) as T;

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
  if (!pack.value) {
    store.recordMakerDragDiagnostic('maker.forge-save', 'error', 'Forge save returned without an active draft pack', {
      itemId,
      itemName: inventoryItem.name,
    });
    return;
  }
  const index = items.value.findIndex(item => item.id === itemId);
  if (index < 0) {
    store.recordMakerDragDiagnostic('maker.forge-save', 'error', 'Forge save returned for an item no longer in draft pack', {
      itemId,
      itemName: inventoryItem.name,
      draftItemCount: items.value.length,
    });
    return;
  }
  const before = items.value[index];
  const updated = inventoryItemToLibraryItem(items.value[index], inventoryItem);
  pack.value.items = items.value.map((item, itemIndex) => itemIndex === index ? updated : item);
  store.ensureItemAssignmentGroups(updated);
  selectedItemIndex.value = index;
  store.markDraftDirty();
  store.recordMakerDragDiagnostic('maker.forge-save', 'ok', 'Forge save wrote item back into active draft pack', {
    itemId,
    beforeName: before.name,
    afterName: updated.name,
    beforeDescriptionLength: before.description?.length ?? 0,
    afterDescriptionLength: updated.description?.length ?? 0,
    displayCategory: updated.displayCategory,
    displaySubcategory: updated.displaySubcategory,
    encryptionGroupId: updated.encryptionGroupId,
    draftDirty: store.draftDirty,
    draftItemCount: pack.value.items?.length ?? 0,
  });
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
  if (await onWorkbenchDraftItemDrop(target)) return;
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

const getEntryUnlockGroupId = (entry?: { encryptionGroupId?: string; visibility?: { unlockGroupId?: string } }) =>
  entry?.visibility?.unlockGroupId ?? entry?.encryptionGroupId ?? '';

const sortedCatalogEntries = computed(() =>
  [...shopCatalogDraft.entries].sort((a, b) => {
    const categoryCompare = a.category.localeCompare(b.category, 'zh-CN');
    if (categoryCompare !== 0) return categoryCompare;
    return a.name.localeCompare(b.name, 'zh-CN');
  })
);

const setCatalogDraftFromItem = (item?: LibraryItem) => {
  shopCatalogDraft.editingItemId = item?.id ?? '';
  shopCatalogDraft.name = item?.name ?? '商品清单';
  shopCatalogDraft.description = item?.shopCatalog?.description ?? item?.description ?? '';
  shopCatalogDraft.weight = item?.weight ?? 0;
  shopCatalogDraft.costValue = item?.cost?.value ?? 0;
  shopCatalogDraft.costUnit = item?.cost?.unit ?? 'gp';
  shopCatalogDraft.search = '';
  shopCatalogDraft.entries = clonePlain(item?.shopCatalog?.entries ?? []);
  syncCatalogSelectedPackIds();
};

const resetCatalogDraft = () => {
  setCatalogDraftFromItem();
  isShopCatalogEditorOpen.value = false;
};

const openShopCatalogEditor = (item?: LibraryItem) => {
  activeSection.value = 'items';
  isShopCatalogEditorOpen.value = true;
  setCatalogDraftFromItem(item);
};

const getCatalogEntryCategory = (item: LibraryItem) =>
  item.displayCategory && item.displaySubcategory
    ? `${item.displayCategory} / ${item.displaySubcategory}`
    : item.displayCategory ?? item.displaySubcategory ?? item.type;

const addItemToCatalogDraft = (item: LibraryItem) => {
  if (shopCatalogDraft.entries.some(entry => entry.itemId === item.id)) return;
  shopCatalogDraft.entries.push({
    itemId: item.id,
    name: getDraftItemDisplayName(item),
    price: clonePlain(item.cost ?? { value: 0, unit: 'gp' }),
    category: getCatalogEntryCategory(item),
    note: '',
    source: item.source,
  });
};

const removeItemFromCatalogDraft = (itemId: string) => {
  shopCatalogDraft.entries = shopCatalogDraft.entries.filter(entry => entry.itemId !== itemId);
};

const buildShopCatalogDescriptionBlocks = (): LibraryItem['descriptionBlocks'] => {
  const blocks: LibraryItem['descriptionBlocks'] = [];
  if (shopCatalogDraft.description.trim()) {
    blocks.push({ type: 'paragraph', text: shopCatalogDraft.description });
  }
  blocks.push({
    type: 'table',
    caption: shopCatalogDraft.name.trim() || '商品清单',
    columns: ['类别', '名称', '价格', '备注'],
    rows: sortedCatalogEntries.value.map(entry => [
      entry.category,
      entry.name,
      formatCost(entry.price),
      entry.note ?? '',
    ]),
  });
  return blocks;
};

const ensureTradeGoodCatalogGroup = () => {
  store.ensureMenuGroupForAssignment('items', '贸易品', '商品清单');
};

const saveShopCatalog = () => {
  if (!pack.value) return;
  const now = new Date().toISOString();
  const catalogName = shopCatalogDraft.name.trim() || '商品清单';
  const catalogDescription = shopCatalogDraft.description;
  const catalogData = {
    title: catalogName,
    description: catalogDescription,
    entries: sortedCatalogEntries.value.map(entry => clonePlain(entry)),
    updatedAt: now,
  };
  const catalogItem: LibraryItem = {
    id: shopCatalogDraft.editingItemId || makeUniqueLocalId('shop_catalog', items.value.map(item => item.id)),
    name: catalogName,
    englishName: '',
    type: 'treasure',
    source: pack.value.manifest.name,
    category: 'trade_good',
    subcategory: 'shop_catalog',
    displayCategory: '贸易品',
    displaySubcategory: '商品清单',
    cost: { value: Number(shopCatalogDraft.costValue) || 0, unit: shopCatalogDraft.costUnit },
    weight: Number(shopCatalogDraft.weight) || 0,
    description: catalogDescription,
    descriptionBlocks: buildShopCatalogDescriptionBlocks(),
    shopCatalog: catalogData,
    magic: { isMagic: false },
  } as LibraryItem;

  const existingIndex = items.value.findIndex(item => item.id === catalogItem.id);
  pack.value.items = existingIndex >= 0
    ? items.value.map((item, index) => index === existingIndex ? catalogItem : item)
    : [...items.value, catalogItem];

  ensureTradeGoodCatalogGroup();
  selectedItemIndex.value = pack.value.items.findIndex(item => item.id === catalogItem.id);
  store.markDraftDirty();
  store.recordMakerDragDiagnostic('maker.shop-catalog', 'ok', 'Shop catalog saved into active draft pack', {
    packId: pack.value.manifest.id,
    itemId: catalogItem.id,
    itemName: catalogItem.name,
    entryCount: catalogData.entries.length,
  });
  isShopCatalogEditorOpen.value = true;
  setCatalogDraftFromItem(catalogItem);
};

const getCandidateSelected = (itemId: string) =>
  shopCatalogDraft.entries.some(entry => entry.itemId === itemId);

const setSpellUnlockGroup = (spell: SpellDefinition, value: string) => {
  store.assignDraftSpellUnlockGroup(spell.id, value || undefined);
};

const setTraitUnlockGroup = (trait: DataPackTraitDefinition, value: string) => {
  store.assignDraftTraitUnlockGroup(trait.id, value || undefined);
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

const openForgeEditorForDraftItemCopy = (item: LibraryItem) => {
  if (!pack.value) return;
  const copiedItem = clonePlain(item) as LibraryItem;
  copiedItem.id = makeUniqueLocalId(item.id, items.value.map(entry => entry.id));
  copiedItem.source = pack.value.manifest.name;
  pack.value.items = [...items.value, copiedItem];
  selectedItemIndex.value = pack.value.items.length - 1;
  store.ensureItemAssignmentGroups(copiedItem);
  store.markDraftDirty();
  store.recordMakerDragDiagnostic('maker.copy-forge', 'ok', 'Draft item copied for forge editing', {
    sourceItemId: item.id,
    copiedItemId: copiedItem.id,
    itemName: copiedItem.name,
    draftItemCount: pack.value.items.length,
  });
  openForgeEditorForDraftItem(copiedItem);
};

const onContentItemDragStart = (event: DragEvent, itemId: string) => {
  draggedContentItemId.value = itemId;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copyMove';
    event.dataTransfer.setData('application/x-dnd-maker-item-id', itemId);
    event.dataTransfer.setData('text/plain', JSON.stringify({ type: 'maker-draft-item', id: itemId }));
  }
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

const onWorkbenchDraftItemDrop = async (target: 'forge' | 'enchant') => {
  if (!pack.value || !draggedContentItemId.value) return false;
  const item = items.value.find(entry => entry.id === draggedContentItemId.value);
  if (!item) return false;
  hoveringWorkbench.value = null;
  draggedContentItemId.value = '';
  if (target === 'forge') {
    openForgeEditorForDraftItemCopy(item);
  } else {
    openEnchantEditorForDraftItem(item);
  }
  return true;
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
  store.recordMakerDragDiagnostic('maker.header-save', 'info', 'Data-pack maker header save clicked', {
    packId: pack.value?.manifest.id,
    draftDirty: store.draftDirty,
    itemCount: items.value.length,
    spellCount: spells.value.length,
    traitCount: traits.value.length,
  });
  try {
    const saved = await store.saveDraftPack('update');
    store.recordMakerDragDiagnostic(
      'maker.header-save',
      saved ? 'ok' : 'error',
      saved ? 'Data-pack maker header save finished' : 'Data-pack maker header save returned false',
      {
        packId: pack.value?.manifest.id,
        draftDirty: store.draftDirty,
        itemCount: items.value.length,
        runtimePackCount: store.packs.length,
        enabledPackIds: store.settings.enabledPackIds,
      }
    );
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
        <label class="unlock-override">
          <input
            type="checkbox"
            :checked="store.ignoreUnlockInMaker"
            @change="store.setIgnoreUnlockInMaker(($event.target as HTMLInputElement).checked)"
          />
          编辑时忽视口令
        </label>
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
      <button :class="{ active: activeSection === 'groups' }" @click="activeSection = 'groups'">分组 / 口令分组</button>
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
        <div class="shop-catalog-card">
          <strong>商品清单生成</strong>
          <span>建立可修改的商品清单物品，可选当前数据包或其他数据包的物品，并按类别整理价格与备注。</span>
          <button type="button" @click="openShopCatalogEditor()">新建商品清单</button>
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
        <section class="shop-catalog-editor" v-if="isShopCatalogEditorOpen">
          <header class="shop-catalog-editor-title">
            <div>
              <h3>商品清单编辑器</h3>
              <p class="hint">清单会保存为贸易品 / 商品清单分类下的物品；描述和每条备注会保留换行。</p>
            </div>
            <button type="button" class="ghost small" @click="resetCatalogDraft">收起 / 重置</button>
          </header>
          <div class="catalog-fields">
            <label>清单名<input v-model="shopCatalogDraft.name" /></label>
            <label>重量<input type="number" v-model.number="shopCatalogDraft.weight" /></label>
            <label>价格
              <span class="catalog-cost-row">
                <input type="number" v-model.number="shopCatalogDraft.costValue" />
                <select v-model="shopCatalogDraft.costUnit">
                  <option value="cp">cp</option>
                  <option value="sp">sp</option>
                  <option value="ep">ep</option>
                  <option value="gp">gp</option>
                  <option value="pp">pp</option>
                </select>
              </span>
            </label>
            <label class="catalog-description">描述<textarea v-model="shopCatalogDraft.description" placeholder="输入商品清单说明、店铺背景、购买规则等。"></textarea></label>
          </div>

          <div class="catalog-picker">
            <section>
              <h4>可选物品</h4>
              <div class="catalog-source-filter">
                <div class="catalog-source-actions">
                  <strong>来源数据包</strong>
                  <button type="button" class="small" @click="setAllCatalogPackSources(true)">全选</button>
                  <button type="button" class="small ghost" @click="setAllCatalogPackSources(false)">全不选</button>
                </div>
                <label v-for="source in catalogPackSources" :key="source.id" class="catalog-source-option">
                  <input
                    type="checkbox"
                    :checked="shopCatalogDraft.selectedPackIds.includes(source.id)"
                    @change="toggleCatalogPackSource(source.id, ($event.target as HTMLInputElement).checked)"
                  />
                  <span>{{ source.name }}（{{ source.itemCount }}）</span>
                </label>
              </div>
              <input v-model="shopCatalogDraft.search" placeholder="搜索名称 / ID / 分类 / 来源" />
              <div class="catalog-candidates">
                <button
                  v-for="item in filteredCatalogCandidateItems.slice(0, 80)"
                  :key="item.id"
                  type="button"
                  class="catalog-candidate"
                  :disabled="getCandidateSelected(item.id)"
                  @click="addItemToCatalogDraft(item)"
                >
                  <strong>{{ getDraftItemDisplayName(item) }}</strong>
                  <span>{{ getCatalogEntryCategory(item) }} / {{ formatCost(item.cost) }}</span>
                </button>
              </div>
            </section>

            <section>
              <h4>已选物品（按类别排序）</h4>
              <div class="catalog-selected">
                <article v-for="entry in sortedCatalogEntries" :key="entry.itemId" class="catalog-entry">
                  <div class="catalog-entry-head">
                    <strong>{{ entry.name }}</strong>
                    <span>{{ entry.category }} / {{ formatCost(entry.price) }}</span>
                    <button type="button" class="danger small" @click="removeItemFromCatalogDraft(entry.itemId)">移除</button>
                  </div>
                  <div class="catalog-entry-fields">
                    <label>展示名<input v-model="entry.name" /></label>
                    <label>类别<input v-model="entry.category" /></label>
                    <label>价格
                      <span class="catalog-cost-row">
                        <input type="number" v-model.number="entry.price!.value" />
                        <select v-model="entry.price!.unit">
                          <option value="cp">cp</option>
                          <option value="sp">sp</option>
                          <option value="ep">ep</option>
                          <option value="gp">gp</option>
                          <option value="pp">pp</option>
                        </select>
                      </span>
                    </label>
                  </div>
                  <label>备注<textarea v-model="entry.note" placeholder="可填写库存、折扣、购买限制等。"></textarea></label>
                </article>
                <p v-if="sortedCatalogEntries.length === 0" class="hint">尚未选择商品。</p>
              </div>
            </section>
          </div>

          <div class="catalog-actions">
            <button type="button" @click="saveShopCatalog">{{ shopCatalogDraft.editingItemId ? '保存商品清单修改' : '生成商品清单物品' }}</button>
          </div>
        </section>
        <section v-if="contentGroups.length > 0" class="content-groups">
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
                    :class="{ active: selectedItem?.id === item.id, magic: item.magic?.isMagic }"
                    :style="getDraftItemStyle(item)"
                    draggable="true"
                    @dragstart="onContentItemDragStart($event, item.id)"
                    @dragend="onContentItemDragEnd"
                    @dragover.prevent
                    @drop.prevent.stop="moveContentItemToGroup(subgroup.category, subgroup.subcategory, item.id)"
                    @click="selectedItemIndex = items.findIndex(entry => entry.id === item.id)"
                  >
                    <span class="drag-handle">⋮⋮</span>
                    <div class="content-item-main">
                      <strong :style="getDraftItemNameStyle(item)">{{ getDraftItemDisplayName(item) }}</strong>
                      <small>{{ item.type }} / {{ item.source || pack.manifest.name }}</small>
                    </div>
                    <div class="content-item-actions">
                      <button type="button" class="small" @click.stop="openForgeEditorForDraftItem(item)">DIY 编辑</button>
                      <button type="button" class="small" @click.stop="openForgeEditorForDraftItemCopy(item)">复制到铁匠台</button>
                      <button type="button" class="small" @click.stop="openEnchantEditorForDraftItem(item)">附魔</button>
                      <button v-if="isShopCatalogItem(item)" type="button" class="small" @click.stop="openShopCatalogEditor(item)">修改清单</button>
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
        <label>口令分组
          <select :value="getEntryUnlockGroupId(selectedSpell)" @change="setSpellUnlockGroup(selectedSpell, ($event.target as HTMLSelectElement).value)">
            <option value="">公开</option>
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
        <select :value="getEntryUnlockGroupId(trait)" @change="setTraitUnlockGroup(trait, ($event.target as HTMLSelectElement).value)">
          <option value="">公开</option>
          <option v-for="group in encryptionGroups" :key="group.id" :value="group.id">{{ group.name }}</option>
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
        <h2>口令分组</h2>
        <p class="hint">口令本身就是分组名。加入该分组的物品、法术或词条默认非公开；PL 输入匹配口令后会持续显示该组内容。当前不做强密码学加密。</p>
        <label class="global-passphrase">
          全局口令（可选，输入后该数据包全部公开）
          <input
            :value="globalUnlockPassphrase"
            placeholder="留空则不启用全局口令"
            @change="store.updateDraftGlobalUnlockPassphrase(($event.target as HTMLInputElement).value)"
          />
        </label>
        <div class="inline-form">
          <input v-model="newEncryptionGroupName" placeholder="口令 / 分组名" />
          <input v-model="newEncryptionGroupDescription" placeholder="描述（可选）" />
          <button type="button" @click="addEncryptionGroup">新增口令分组</button>
        </div>
        <div v-for="group in encryptionGroups" :key="group.id" class="managed-group">
          <input :value="group.name" @change="store.updateEncryptionGroup(group.id, { name: ($event.target as HTMLInputElement).value })" />
          <button type="button" class="danger small" @click="store.removeEncryptionGroup(group.id)">删除</button>
          <input :value="group.description ?? ''" placeholder="描述（可选）" @change="store.updateEncryptionGroup(group.id, { description: ($event.target as HTMLInputElement).value })" />
          <small>
            内容统计：物品 {{ getUnlockGroupStat(group.id)?.itemCount ?? 0 }} /
            法术 {{ getUnlockGroupStat(group.id)?.spellCount ?? 0 }} /
            词条 {{ getUnlockGroupStat(group.id)?.traitCount ?? 0 }}
          </small>
        </div>
        <div v-if="visibilityIssues.length > 0" class="visibility-issues">
          <strong>口令分组校验警告：{{ visibilityIssues.length }}</strong>
          <span v-for="issue in visibilityIssues.slice(0, 4)" :key="`${issue.code}:${issue.entryKind}:${issue.entryId}:${issue.groupId}`">
            {{ issue.message }}
          </span>
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
      <p class="hint">编辑锁不是内容加密；数据包仍为明文。口令分组只控制应用内可见性，直接阅读数据包 JSON 仍可能看到全部内容。</p>
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
.header-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.unlock-override {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  border: 1px solid rgba(90, 118, 96, 0.28);
  background: rgba(255, 255, 255, 0.42);
  border-radius: 999px;
  padding: 6px 9px;
  color: #536052;
  font-size: 0.78rem;
}
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
.shop-catalog-card { margin-top: 10px; border: 1px solid #e2d2ad; border-radius: 12px; padding: 10px; display: grid; gap: 7px; color: #604d23; background: #fff9e9; }
.shop-catalog-card span { line-height: 1.45; font-size: 0.86rem; }
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
.trait-row { display: grid; grid-template-columns: 1fr 160px 180px; gap: 8px; padding: 10px; border: 1px solid #e0e5df; border-radius: 10px; }
.trait-row textarea { grid-column: 1 / -1; }
.groups-panel { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.group-card { background: white; border: 1px solid #d8ded8; border-radius: 14px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
.group-card.encrypted { grid-column: 1 / -1; border-color: #c7b4df; background: #fcf8ff; }
.global-passphrase { max-width: 360px; }
.inline-form { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.inline-form input, .inline-form select { min-width: 180px; }
.managed-group { border: 1px solid #e3e8e3; border-radius: 10px; padding: 9px; display: grid; grid-template-columns: 1fr auto; gap: 5px 8px; align-items: center; }
.managed-group small { grid-column: 1 / -1; color: #788178; }
.visibility-issues { grid-column: 1 / -1; display: grid; gap: 5px; border: 1px solid #e4b46a; background: #fff8e9; color: #7a5520; border-radius: 10px; padding: 10px; font-size: 0.84rem; }
.visibility-issues span { line-height: 1.35; }
.hint { color: #7b847b; font-size: 0.85rem; }
.empty-panel { display: flex; align-items: center; justify-content: center; color: #778077; min-height: 280px; }
.empty-panel.compact { min-height: 180px; }
.shop-catalog-editor { display: grid; gap: 12px; margin-bottom: 14px; padding: 12px; border: 1px solid #dfc27b; border-radius: 14px; background: #fffaf0; }
.shop-catalog-editor-title { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; }
.shop-catalog-editor h3, .shop-catalog-editor h4 { margin: 0; }
.catalog-fields { display: grid; grid-template-columns: minmax(180px, 1fr) 120px 180px; gap: 10px; }
.catalog-description { grid-column: 1 / -1; }
.catalog-cost-row { display: grid; grid-template-columns: minmax(0, 1fr) 74px; gap: 6px; }
.catalog-picker { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); gap: 12px; }
.catalog-picker section { display: grid; align-content: start; gap: 8px; }
.catalog-source-filter { display: grid; gap: 6px; padding: 8px; border: 1px solid #ead9a8; border-radius: 10px; background: rgba(255, 255, 255, 0.56); }
.catalog-source-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.catalog-source-actions strong { margin-right: auto; }
.catalog-source-option { flex-direction: row; align-items: center; font-weight: 700; font-size: 0.82rem; }
.catalog-candidates, .catalog-selected { display: grid; gap: 7px; max-height: 360px; overflow: auto; padding-right: 4px; }
.catalog-candidate { text-align: left; display: grid; gap: 2px; background: white; }
.catalog-candidate:disabled { opacity: 0.55; }
.catalog-candidate span, .catalog-entry-head span { color: #746b58; font-size: 0.78rem; }
.catalog-entry { display: grid; gap: 7px; padding: 9px; border: 1px solid #ead9a8; border-radius: 10px; background: white; }
.catalog-entry-head { display: grid; grid-template-columns: minmax(0, 1fr) minmax(140px, auto) auto; gap: 8px; align-items: center; }
.catalog-entry-fields { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 170px; gap: 8px; }
.catalog-entry textarea { min-height: 58px; }
.catalog-actions { display: flex; justify-content: flex-end; }
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
.content-item-card.magic { border-color: rgba(126, 83, 183, 0.42); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2); }
.content-item-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.content-item-main small { color: currentColor; opacity: 0.72; }
.content-item-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 5px; }
.drag-handle { color: #9ba89b; font-weight: 900; letter-spacing: -0.18em; cursor: grab; }
@media (max-width: 900px) { .maker-grid, .groups-panel, .catalog-picker, .catalog-fields, .catalog-entry-fields { grid-template-columns: 1fr; } .group-card.encrypted { grid-column: auto; } .maker-header { flex-direction: column; } }
</style>
