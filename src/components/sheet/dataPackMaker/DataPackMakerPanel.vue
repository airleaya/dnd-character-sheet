<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useDataPackStore } from '../../../stores/dataPackStore';
import { getGlobalDragPayload, parseDragPayload } from '../../../utils/inventoryDropUtils';
import type { DataPackTraitDefinition } from '../../../types/DataPack';
import type { LibraryItem } from '../../../types/Library';
import type { SpellDefinition } from '../../../types/Spell';

const store = useDataPackStore();
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

const parseDrop = (event: DragEvent) => {
  event.preventDefault();
  const nativeData = event.dataTransfer?.getData('text/plain');
  const globalData = getGlobalDragPayload();
  const nativePayload = nativeData ? parseDragPayload(nativeData) : null;
  if (nativePayload) return nativePayload;
  return globalData ? parseDragPayload(globalData) : null;
};

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
};

const onWorkbenchDragLeave = (target: 'forge' | 'enchant') => {
  if (hoveringWorkbench.value === target) {
    hoveringWorkbench.value = null;
  }
};

const onItemDrop = (event: DragEvent, target: 'forge' | 'enchant') => {
  event.preventDefault();
  event.stopPropagation();
  hoveringWorkbench.value = null;
  const payload = parseDrop(event);
  if (payload?.type === 'library-item') {
    activeSection.value = 'items';
    activeItemWorkbench.value = target;
    store.importItemToDraft(payload.id, target);
    selectedItemIndex.value = Math.max(0, items.value.length - 1);
  }
};

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

const saveLock = async () => {
  await store.updateDraftEditLock({
    enabled: lockDraft.enabled,
    password: lockDraft.password.trim() || undefined,
    hint: lockDraft.hint.trim() || undefined,
    localOnly: lockDraft.localOnly,
  });
  lockDraft.password = '';
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
        <button type="button" @click="store.saveDraftPack('update')">保存</button>
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

    <div v-if="activeSection === 'items'" class="maker-grid">
      <aside class="list-panel">
        <div class="drop-grid">
          <div
            class="drop-card"
            :class="{ hovering: hoveringWorkbench === 'forge' }"
            @dragenter.prevent.stop="onWorkbenchDragEnter('forge')"
            @dragover.prevent.stop="onWorkbenchDragOver($event, 'forge')"
            @dragleave.prevent.stop="onWorkbenchDragLeave('forge')"
            @drop.prevent.stop="onItemDrop($event, 'forge')"
          >
            <strong>铁匠铺</strong>
            <span>拖拽物品到这里，复制到当前数据包并进入下方编辑。</span>
          </div>
          <div
            class="drop-card purple"
            :class="{ hovering: hoveringWorkbench === 'enchant' }"
            @dragenter.prevent.stop="onWorkbenchDragEnter('enchant')"
            @dragover.prevent.stop="onWorkbenchDragOver($event, 'enchant')"
            @dragleave.prevent.stop="onWorkbenchDragLeave('enchant')"
            @drop.prevent.stop="onItemDrop($event, 'enchant')"
          >
            <strong>附魔台</strong>
            <span>拖拽物品到这里，复制到当前数据包；附魔细节沿用物品魔法字段。</span>
          </div>
        </div>

        <button
          v-for="(item, index) in items"
          :key="item.id"
          type="button"
          class="entry"
          :class="{ active: selectedItemIndex === index }"
          @click="selectedItemIndex = index"
        >
          {{ item.name }}<small>{{ item.displayCategory || item.type }} / {{ item.displaySubcategory || item.type }}</small>
        </button>
      </aside>

      <main class="editor-panel" v-if="selectedItem">
        <div class="editor-top">
          <h2>{{ activeItemWorkbench === 'enchant' ? '附魔台编辑' : '铁匠铺编辑' }}</h2>
          <button type="button" class="danger" @click="removeSelectedItem">删除物品</button>
        </div>
        <label>ID<input :value="selectedItem.id" disabled /></label>
        <label>名称<input v-model="selectedItem.name" @input="markDirty" /></label>
        <label>一级菜单（普通分组）
          <input v-model="selectedItem.displayCategory" list="item-category-list" placeholder="例如：自制魔法物品" @input="markDirty" />
        </label>
        <label>二级菜单（普通分组）
          <input v-model="selectedItem.displaySubcategory" list="item-subcategory-list" placeholder="例如：武器" @input="markDirty" />
        </label>
        <datalist id="item-category-list">
          <option v-for="group in itemMenuGroups" :key="group.id" :value="group.name" />
        </datalist>
        <datalist id="item-subcategory-list">
          <template v-for="group in itemMenuGroups" :key="group.id">
            <option v-for="child in group.children ?? []" :key="child.id" :value="child.name" />
          </template>
        </datalist>
        <label>加密分组
          <select v-model="selectedItem.encryptionGroupId" @change="markDirty">
            <option value="">公开 / 不加入加密分组</option>
            <option v-for="group in encryptionGroups" :key="group.id" :value="group.id">{{ group.name }}</option>
          </select>
        </label>
        <label>来源<input v-model="selectedItem.source" @input="markDirty" /></label>
        <label>描述<textarea v-model="selectedItem.description" @input="markDirty"></textarea></label>
        <div class="placeholder-box">
          {{ activeItemWorkbench === 'enchant'
            ? '附魔台入口：当前版本开放魔法字段与加密分组装配位置，详细附魔面板后续继续增强。'
            : '铁匠铺入口：当前版本可编辑数据包物品基础字段、普通菜单分组与加密分组。' }}
        </div>
      </main>

      <main v-else class="empty-panel">从右侧物品库拖拽物品到铁匠铺或附魔台。</main>
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
.list-panel, .editor-panel, .empty-panel { background: white; border: 1px solid #d8ded8; border-radius: 14px; padding: 14px; }
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
@media (max-width: 900px) { .maker-grid, .groups-panel { grid-template-columns: 1fr; } .group-card.encrypted { grid-column: auto; } .maker-header { flex-direction: column; } }
</style>
