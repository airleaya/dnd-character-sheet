<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useDataPackStore } from '../../../stores/dataPackStore';
import { parseDragPayload } from '../../../utils/inventoryDropUtils';
import type { DataPackTraitDefinition } from '../../../types/DataPack';
import type { LibraryItem } from '../../../types/Library';
import type { SpellDefinition } from '../../../types/Spell';

const store = useDataPackStore();
const activeSection = ref<'items' | 'spells' | 'traits' | 'meta'>('items');
const selectedItemIndex = ref(0);
const selectedSpellIndex = ref(0);
const sourcePackId = ref('');
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

watch(pack, next => {
  const lock = next?.editorMeta?.editLock;
  lockDraft.enabled = lock?.enabled ?? false;
  lockDraft.password = '';
  lockDraft.hint = lock?.hint ?? '';
  lockDraft.localOnly = lock?.localOnly ?? false;
}, { immediate: true });

const markDirty = () => store.markDraftDirty();

const parseDrop = (event: DragEvent) => {
  event.preventDefault();
  const raw = event.dataTransfer?.getData('text/plain');
  return raw ? parseDragPayload(raw) : null;
};

const onItemDrop = (event: DragEvent, target: 'forge' | 'enchant') => {
  const payload = parseDrop(event);
  if (payload?.type === 'library-item') {
    store.importItemToDraft(payload.id, target);
    selectedItemIndex.value = Math.max(0, items.value.length - 1);
  }
};

const onNativeSpellDrop = (event: DragEvent) => {
  event.preventDefault();
  const rawSpellId = event.dataTransfer?.getData('application/x-dnd-spell-id');
  if (rawSpellId) {
    store.importSpellToDraft(rawSpellId);
  }
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
        <button type="button" @click="store.saveDraftPack('update')">保存</button>
        <button type="button" class="ghost" @click="store.closeMaker">关闭制作器</button>
      </div>
    </header>

    <nav class="maker-tabs">
      <button :class="{ active: activeSection === 'items' }" @click="activeSection = 'items'">物品 / 工作台</button>
      <button :class="{ active: activeSection === 'spells' }" @click="activeSection = 'spells'">法术编辑（占位）</button>
      <button :class="{ active: activeSection === 'traits' }" @click="activeSection = 'traits'">词条编辑（占位）</button>
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
          <div class="drop-card" @dragover.prevent @drop="onItemDrop($event, 'forge')">
            <strong>铁匠铺</strong>
            <span>拖拽物品到这里，复制到当前数据包并进入下方编辑。</span>
          </div>
          <div class="drop-card purple" @dragover.prevent @drop="onItemDrop($event, 'enchant')">
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
          <h2>铁匠铺编辑</h2>
          <button type="button" class="danger" @click="removeSelectedItem">删除物品</button>
        </div>
        <label>ID<input :value="selectedItem.id" disabled /></label>
        <label>名称<input v-model="selectedItem.name" @input="markDirty" /></label>
        <label>二级菜单<input v-model="selectedItem.displayCategory" placeholder="例如：自制魔法物品" @input="markDirty" /></label>
        <label>三级菜单<input v-model="selectedItem.displaySubcategory" placeholder="例如：武器" @input="markDirty" /></label>
        <label>来源<input v-model="selectedItem.source" @input="markDirty" /></label>
        <label>描述<textarea v-model="selectedItem.description" @input="markDirty"></textarea></label>
        <div class="placeholder-box">附魔编辑入口：当前版本作为内置占位，魔法加值、同调、视觉和词条仍保存在物品 magic 字段中。</div>
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
        <label>自定义二级菜单<input v-model="selectedSpell.libraryCategory" @input="markDirty" /></label>
        <label>自定义三级菜单<input v-model="selectedSpell.librarySubcategory" @input="markDirty" /></label>
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
button.ghost { background: transparent; }
button.danger { border-color: #c86f66; color: #9c3026; }
.maker-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0; button.active { background: #263126; color: white; } }
.import-strip {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 10px 12px; margin-bottom: 14px;
  background: #eef4ef; border: 1px solid #d8ded8; border-radius: 12px; color: #536052; font-weight: 800;
  select { min-width: 260px; }
}
.maker-grid { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 14px; }
.list-panel, .editor-panel, .empty-panel { background: white; border: 1px solid #d8ded8; border-radius: 14px; padding: 14px; }
.drop-grid { display: grid; gap: 10px; margin-bottom: 12px; }
.drop-card { border: 2px dashed #b78945; background: #fff8e7; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 5px; color: #6a4a1f; }
.drop-card.purple { border-color: #9a79bd; background: #f2e9ff; color: #573777; }
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
.hint { color: #7b847b; font-size: 0.85rem; }
.empty-panel { display: flex; align-items: center; justify-content: center; color: #778077; min-height: 280px; }
@media (max-width: 900px) { .maker-grid { grid-template-columns: 1fr; } .maker-header { flex-direction: column; } }
</style>
