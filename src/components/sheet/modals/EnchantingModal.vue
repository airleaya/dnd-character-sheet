<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useActiveSheetStore } from '../../../stores/activeSheet';
import { useDataPackStore } from '../../../stores/dataPackStore';
import { useEnchanting } from '../../../composables/useEnchanting';
import { DAMAGE_TYPE_OPTIONS } from '../../../data/rules/damageTypes';
import {
  DEFAULT_MAGIC_ATTACK_BACKGROUND,
  DEFAULT_MAGIC_INVENTORY_BACKGROUND,
  DEFAULT_MAGIC_NAME_COLOR,
  PRESET_MAGIC_TRAITS,
} from '../../../data/rules/magicTraits';
import { getRuntimeSpellById } from '../../../data/dataPacks/runtimeDataPacks';
import { formatMagicItemName, resolveMagicTraitsForItem } from '../../../utils/magicItems';
import type { ItemMagicTrait, ItemRarity } from '../../../types/Library';

type EnchantTab = 'basic' | 'traits' | 'create' | 'manage';
type DataPackAssignmentData = {
  displayCategory?: string;
  displaySubcategory?: string;
  visibility?: { public: boolean; unlockGroupId?: string };
  encryptionGroupId?: string;
};

const store = useActiveSheetStore();
const dataPackStore = useDataPackStore();
const {
  isEnchantingOpen,
  entrySource,
  targetPayload,
  targetItem,
  editorContext,
  saveEnchanting,
  addCustomTrait,
  deleteCustomTrait,
  toggleTraitSelection,
  closeEnchanting,
} = useEnchanting();

const activeTab = ref<EnchantTab>('basic');

const isDataPackMakerEditor = computed(() => editorContext.value?.dataPackMaker === true);
const dataPackMenuGroups = computed(() => dataPackStore.activeDraftPack?.editorMeta?.menuGroups?.items ?? []);
const dataPackEncryptionGroups = computed(() => dataPackStore.activeDraftPack?.editorMeta?.encryptionGroups ?? []);
const targetData = computed(() => targetItem.value?.data as DataPackAssignmentData | undefined);
const itemGroupCategoryOptions = computed(() => dataPackMenuGroups.value.map(group => group.name));
const itemGroupSubcategoryOptions = computed(() =>
  dataPackMenuGroups.value.flatMap(group => group.children?.map(child => child.name) ?? [])
);
const selectedDisplayCategory = computed({
  get: () => targetData.value?.displayCategory ?? '',
  set: (value: string) => {
    if (!targetData.value) return;
    targetData.value.displayCategory = value.trim() || undefined;
  },
});
const selectedDisplaySubcategory = computed({
  get: () => targetData.value?.displaySubcategory ?? '',
  set: (value: string) => {
    if (!targetData.value) return;
    targetData.value.displaySubcategory = value.trim() || undefined;
  },
});
const selectedEncryptionGroupId = computed({
  get: () => targetData.value?.visibility?.unlockGroupId ?? targetData.value?.encryptionGroupId ?? '',
  set: (value: string | undefined) => {
    if (!targetData.value) return;
    const groupId = value || undefined;
    targetData.value.encryptionGroupId = groupId;
    targetData.value.visibility = groupId
      ? { public: false, unlockGroupId: groupId }
      : { public: true };
  },
});
const traitKeyword = ref('');
const spellKeyword = ref('');

const rarityOptions: Array<{ value: ItemRarity; label: string }> = [
  { value: 'common', label: '普通 common' },
  { value: 'uncommon', label: '非普通 uncommon' },
  { value: 'rare', label: '稀有 rare' },
  { value: 'very_rare', label: '珍稀 very rare' },
  { value: 'legendary', label: '传奇 legendary' },
  { value: 'artifact', label: '神器 artifact' },
  { value: 'varies', label: '可变 varies' },
];

const tabs: Array<{ key: EnchantTab; label: string; note: string }> = [
  { key: 'basic', label: '基础', note: '加值 / 同调 / 视觉' },
  { key: 'traits', label: '选择词条', note: '为当前物品选择' },
  { key: 'create', label: '新建词条', note: '保存为可复用' },
  { key: 'manage', label: '管理词条', note: '修改或删除自定义词条' },
];

const traitTypeOptions: Array<{ value: ItemMagicTrait['type']; label: string; note: string }> = [
  { value: 'plain', label: '普通', note: '描述性词条，可带独立充能' },
  { value: 'damage', label: '伤害词条', note: '可参与武器伤害计算' },
  { value: 'spell', label: '附带法术', note: '关联一个法术并记录充能' },
  { value: 'defense', label: '防御词条', note: '同调后显示在 AC 面板' },
];

const customDraft = reactive({
  type: 'plain' as ItemMagicTrait['type'],
  name: '',
  description: '',
  activationMode: 'always' as ItemMagicTrait['activationMode'],
  participatesInDamage: false,
  damageDice: '',
  damageBonus: 0,
  damageType: 'damage_none',
  spellId: '',
  spellExtraDescription: '',
  chargesCurrent: 0,
  chargesMax: 0,
  resetCondition: '',
  resetFormula: '',
});

const allTraits = computed<ItemMagicTrait[]>(() => [
  ...PRESET_MAGIC_TRAITS,
  ...(store.character?.customMagicTraits ?? []),
]);

const selectedTraits = computed<ItemMagicTrait[]>(() => {
  return targetItem.value ? resolveMagicTraitsForItem(targetItem.value) : [];
});

const filteredTraits = computed(() => {
  const keyword = traitKeyword.value.trim().toLowerCase();
  if (!keyword) return allTraits.value;
  return allTraits.value.filter(trait =>
    `${trait.name} ${trait.description} ${trait.spellExtraDescription ?? ''}`.toLowerCase().includes(keyword)
  );
});

const filteredSpells = computed(() => {
  const keyword = spellKeyword.value.trim().toLowerCase();
  const spells = keyword
    ? dataPackStore.spellLibraryItems.filter(spell => `${spell.name} ${spell.id}`.toLowerCase().includes(keyword))
    : dataPackStore.spellLibraryItems;
  return spells.slice(0, 100);
});

const targetDisplayName = computed(() =>
  targetItem.value ? formatMagicItemName(targetItem.value) : '未选择物品'
);

const inventoryPreviewStyle = computed(() => ({
  backgroundColor: targetItem.value?.magic?.visuals?.inventoryBackground || DEFAULT_MAGIC_INVENTORY_BACKGROUND,
  color: targetItem.value?.magic?.visuals?.nameColor || DEFAULT_MAGIC_NAME_COLOR,
}));

const attackPreviewStyle = computed(() => ({
  backgroundColor: targetItem.value?.magic?.visuals?.attackBackground || DEFAULT_MAGIC_ATTACK_BACKGROUND,
  color: targetItem.value?.magic?.visuals?.nameColor || DEFAULT_MAGIC_NAME_COLOR,
}));

const isTraitSelected = (id: string) => targetItem.value?.magic?.selectedTraitIds?.includes(id) ?? false;

const getSpellName = (spellId?: string) => (spellId ? getRuntimeSpellById(spellId)?.name ?? spellId : '未指定法术');

const getTraitTypeLabel = (type: ItemMagicTrait['type']) =>
  traitTypeOptions.find(option => option.value === type)?.label ?? type;

const ensureVisualDefaults = () => {
  if (!targetItem.value?.magic) return;
  targetItem.value.magic.visuals = {
    inventoryBackground: targetItem.value.magic.visuals?.inventoryBackground || DEFAULT_MAGIC_INVENTORY_BACKGROUND,
    attackBackground: targetItem.value.magic.visuals?.attackBackground || DEFAULT_MAGIC_ATTACK_BACKGROUND,
    nameColor: targetItem.value.magic.visuals?.nameColor || DEFAULT_MAGIC_NAME_COLOR,
  };
};

const resetVisualDefaults = () => {
  if (!targetItem.value?.magic) return;
  targetItem.value.magic.visuals = {
    inventoryBackground: DEFAULT_MAGIC_INVENTORY_BACKGROUND,
    attackBackground: DEFAULT_MAGIC_ATTACK_BACKGROUND,
    nameColor: DEFAULT_MAGIC_NAME_COLOR,
  };
};

const clearMagicBonus = () => {
  if (!targetItem.value?.magic) return;
  targetItem.value.magic.magicBonus = undefined;
};

const ensureTraitCharges = (trait: ItemMagicTrait) => {
  if (!trait.charges) {
    trait.charges = { current: 0, max: 0 };
  }
  return trait.charges;
};

const syncTraitMode = (trait: ItemMagicTrait) => {
  if (trait.activationMode === 'charged' || trait.type === 'spell') {
    ensureTraitCharges(trait);
  }
};

const buildCharges = () =>
  customDraft.activationMode === 'charged' || customDraft.type === 'spell'
    ? {
        current: Number(customDraft.chargesCurrent || 0),
        max: Number(customDraft.chargesMax || 0),
        resetCondition: customDraft.resetCondition.trim() || undefined,
        resetFormula: customDraft.resetFormula.trim() || undefined,
      }
    : undefined;

const resetCustomDraft = () => {
  customDraft.name = '';
  customDraft.description = '';
  customDraft.damageDice = '';
  customDraft.damageBonus = 0;
  customDraft.spellId = '';
  customDraft.spellExtraDescription = '';
  customDraft.chargesCurrent = 0;
  customDraft.chargesMax = 0;
  customDraft.resetCondition = '';
  customDraft.resetFormula = '';
};

const saveNewCustomTrait = () => {
  const trait = addCustomTrait({
    type: customDraft.type,
    name: customDraft.name.trim() || '自定义魔法词条',
    description: customDraft.description.trim(),
    activationMode: customDraft.activationMode,
    participatesInDamage: customDraft.type === 'damage' && customDraft.participatesInDamage,
    damageDice: customDraft.type === 'damage' ? customDraft.damageDice.trim() : undefined,
    damageBonus: customDraft.type === 'damage' ? Number(customDraft.damageBonus || 0) : undefined,
    damageType: customDraft.type === 'damage' ? customDraft.damageType : undefined,
    spellId: customDraft.type === 'spell' ? customDraft.spellId || undefined : undefined,
    spellExtraDescription: customDraft.type === 'spell' ? customDraft.spellExtraDescription.trim() : undefined,
    charges: buildCharges(),
  });

  if (trait && targetItem.value) {
    toggleTraitSelection(trait.id);
    activeTab.value = 'traits';
  }

  resetCustomDraft();
};
</script>

<template>
  <Teleport to="body">
    <Transition name="enchant-fade">
      <div v-if="isEnchantingOpen" class="enchant-backdrop" @mousedown.self="closeEnchanting">
        <section class="enchant-panel" role="dialog" aria-modal="true" aria-label="附魔制作">
          <header class="enchant-header">
            <div>
              <span class="eyebrow">Enchanting Bench</span>
              <h3>附魔制作</h3>
            </div>
            <button class="btn-close" title="关闭" @click="closeEnchanting">×</button>
          </header>

          <div class="enchant-body">
            <aside class="enchant-sidebar">
              <div class="target-card" :class="{ empty: !targetItem }">
                <div class="rune-mark">✦</div>
                <div>
                  <strong>{{ targetDisplayName }}</strong>
                  <small>{{ targetItem ? targetItem.type : '拖拽物品或从 DIY 打开' }}</small>
                </div>
              </div>

              <div v-if="targetItem" class="preview-stack">
                <div class="preview-row" :style="inventoryPreviewStyle">
                  <span>{{ targetDisplayName }}</span>
                  <em>行囊预览</em>
                </div>
                <div class="preview-row attack" :style="attackPreviewStyle">
                  <span>{{ targetDisplayName }}</span>
                  <em>攻击项预览</em>
                </div>
              </div>

              <nav class="tab-nav" aria-label="附魔编辑分区">
                <button
                  v-for="tab in tabs"
                  :key="tab.key"
                  type="button"
                  :data-test="`enchant-tab-${tab.key}`"
                  :class="{ active: activeTab === tab.key }"
                  @click="activeTab = tab.key"
                >
                  <span>{{ tab.label }}</span>
                  <small>{{ tab.note }}</small>
                </button>
              </nav>

              <div class="selected-summary">
                <strong>已选词条 {{ selectedTraits.length }}</strong>
                <span v-if="selectedTraits.length === 0">暂无词条</span>
                <span v-for="trait in selectedTraits" :key="trait.id">{{ trait.name }}</span>
              </div>
            </aside>

            <main class="enchant-content">
              <section v-if="targetItem && isDataPackMakerEditor" class="form-section maker-assignment">
                <div class="section-title">
                  <h4>数据包归档</h4>
                  <p>从数据包编辑器进入时，可直接指定普通分组和口令分组。</p>
                </div>
                <div class="field-grid">
                  <label>
                    <span>分组</span>
                    <input
                      v-model="selectedDisplayCategory"
                      list="enchant-maker-category-list"
                      placeholder="可选择已有分组或输入新一级分组"
                    >
                    <datalist id="enchant-maker-category-list">
                      <option v-for="option in itemGroupCategoryOptions" :key="option" :value="option" />
                    </datalist>
                  </label>
                  <label>
                    <span>子分组</span>
                    <input
                      v-model="selectedDisplaySubcategory"
                      list="enchant-maker-subcategory-list"
                      placeholder="可选择已有子分组或输入新二级分组"
                    >
                    <datalist id="enchant-maker-subcategory-list">
                      <option v-for="option in itemGroupSubcategoryOptions" :key="option" :value="option" />
                    </datalist>
                  </label>
                  <label>
                    <span>口令分组</span>
                    <select v-model="selectedEncryptionGroupId">
                      <option value="">公开</option>
                      <option v-for="group in dataPackEncryptionGroups" :key="group.id" :value="group.id">
                        {{ group.name }}
                      </option>
                    </select>
                  </label>
                </div>
              </section>


              <div class="source-line">

                来源：{{ entrySource === 'drop' ? '右侧栏拖拽目标区' : '自定义物品按钮' }}
                <template v-if="targetPayload">
                  · 目标：{{ targetPayload.type === 'inventory-item' ? targetPayload.instanceId : targetPayload.id }}
                </template>
              </div>

              <div v-if="!targetItem" class="empty-state">
                <div class="empty-rune">✧</div>
                <h4>等待附魔目标</h4>
                <p>把行囊物品拖到右侧附魔台，或在自定义物品界面点击“附魔制作”。</p>
              </div>

              <template v-else>
                <section v-show="activeTab === 'basic'" class="form-section">
                  <div class="section-title">
                    <h4>基础附魔</h4>
                    <p>控制物品是否为魔法物品、加值是否显示、以及是否需要同调。</p>
                  </div>

                  <div class="check-row">
                    <label class="check-option">
                      <input type="checkbox" v-model="targetItem.magic!.isMagic" @change="ensureVisualDefaults">
                      <span>魔法物品</span>
                    </label>
                    <label class="check-option">
                      <input type="checkbox" v-model="targetItem.magic!.attunement!.requires">
                      <span>需要同调</span>
                    </label>
                  </div>

                  <div class="field-grid">
                    <label>
                      <span>魔法加值</span>
                      <input type="number" v-model.number="targetItem.magic!.magicBonus" placeholder="留空则不显示 +0">
                    </label>
                    <label>
                      <span>稀有度</span>
                      <select v-model="targetItem.magic!.rarity">
                        <option :value="undefined">未设置</option>
                        <option v-for="rarity in rarityOptions" :key="rarity.value" :value="rarity.value">
                          {{ rarity.label }}
                        </option>
                      </select>
                    </label>
                    <label class="full-field">
                      <span>同调条件</span>
                      <input type="text" v-model="targetItem.magic!.attunement!.condition" placeholder="例如：需要由法师同调">
                    </label>
                  </div>

                  <div class="quick-actions">
                    <button type="button" @click="clearMagicBonus">清除加值显示</button>
                    <button type="button" @click="resetVisualDefaults">恢复默认魔法视觉</button>
                  </div>

                  <div class="section-title visual-title">
                    <h4>魔法视觉</h4>
                    <p>未设置时使用浅紫色背景与深红色字体；这里可自由替换颜色。</p>
                  </div>
                  <div class="field-grid color-grid">
                    <label>
                      <span>行囊背景</span>
                      <input type="color" v-model="targetItem.magic!.visuals!.inventoryBackground">
                    </label>
                    <label>
                      <span>攻击项背景</span>
                      <input type="color" v-model="targetItem.magic!.visuals!.attackBackground">
                    </label>
                    <label>
                      <span>名字字体颜色</span>
                      <input type="color" v-model="targetItem.magic!.visuals!.nameColor">
                    </label>
                  </div>
                </section>

                <section v-show="activeTab === 'traits'" class="form-section">
                  <div class="section-title">
                    <h4>选择魔法词条</h4>
                    <p>选择的词条会绑定到当前物品；默认伤害词条参与攻击计算，充能/法术词条进入说明。</p>
                  </div>
                  <input class="search-input" type="search" v-model="traitKeyword" placeholder="搜索词条名或描述">
                  <div class="trait-list">
                    <label v-for="trait in filteredTraits" :key="trait.id" class="trait-option" :class="{ selected: isTraitSelected(trait.id) }">
                      <input type="checkbox" :checked="isTraitSelected(trait.id)" @change="toggleTraitSelection(trait.id)">
                      <span class="trait-main">
                        <strong>{{ trait.name }}</strong>
                        <small>
                          {{ trait.source === 'preset' ? '预设' : '自定义' }} ·
                          {{ trait.type === 'spell' ? `附带法术：${getSpellName(trait.spellId)}` : getTraitTypeLabel(trait.type) }} ·
                          {{ trait.activationMode === 'charged' ? '消耗充能' : '默认生效' }}
                        </small>
                        <em>{{ trait.description || trait.spellExtraDescription || '暂无描述' }}</em>
                      </span>
                      <span v-if="trait.type === 'damage' && trait.participatesInDamage" class="trait-pill">
                        {{ trait.damageDice || '无骰' }} {{ trait.damageBonus ? `+${trait.damageBonus}` : '' }}
                      </span>
                      <span v-else-if="trait.charges" class="trait-pill">
                        {{ trait.charges.current }}/{{ trait.charges.max }} 充能
                      </span>
                    </label>
                  </div>
                </section>

                <section v-show="activeTab === 'create'" class="form-section custom-trait-editor">
                  <div class="section-title">
                    <h4>新建自定义词条</h4>
                    <p>保存后会进入角色级词条库，并自动绑定到当前物品。</p>
                  </div>
                  <div class="field-grid">
                    <label>
                      <span>词条类别</span>
                      <select data-test="custom-trait-type" v-model="customDraft.type">
                        <option v-for="option in traitTypeOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                    </label>
                    <label>
                      <span>触发方式</span>
                      <select data-test="custom-trait-activation" v-model="customDraft.activationMode">
                        <option value="always">默认作用</option>
                        <option value="charged">消耗充能</option>
                      </select>
                    </label>
                  <label class="full-field">
                    <span>词条名</span>
                    <input data-test="custom-trait-name" type="text" v-model="customDraft.name" placeholder="例如：烈焰">
                  </label>
                    <label class="full-field">
                      <span>词条描述</span>
                      <textarea v-model="customDraft.description" rows="3" placeholder="描述该词条的规则文本"></textarea>
                    </label>
                  </div>

                  <div v-if="customDraft.type === 'damage'" class="field-grid nested-grid">
                    <label class="check-option full-field">
                      <input data-test="custom-trait-participates" type="checkbox" v-model="customDraft.participatesInDamage">
                      <span>参与每次攻击的伤害计算</span>
                    </label>
                    <label>
                      <span>伤害骰</span>
                      <input data-test="custom-trait-dice" type="text" v-model="customDraft.damageDice" placeholder="例如：1d6">
                    </label>
                    <label>
                      <span>伤害加值</span>
                      <input type="number" v-model.number="customDraft.damageBonus">
                    </label>
                    <label>
                      <span>伤害类型</span>
                      <select v-model="customDraft.damageType">
                        <option v-for="type in DAMAGE_TYPE_OPTIONS" :key="type.key" :value="type.key">{{ type.label }}</option>
                      </select>
                    </label>
                  </div>

                  <div v-else-if="customDraft.type === 'spell'" class="field-grid nested-grid">
                    <label class="full-field">
                      <span>搜索法术</span>
                      <input type="search" v-model="spellKeyword" placeholder="输入中文法术名搜索">
                    </label>
                    <label class="full-field">
                      <span>指定法术</span>
                      <select v-model="customDraft.spellId">
                        <option value="">未指定</option>
                        <option v-for="spell in filteredSpells" :key="spell.id" :value="spell.id">
                          {{ spell.name }}（{{ spell.level === 0 ? '戏法' : `${spell.level}环` }}）
                        </option>
                      </select>
                    </label>
                    <label class="full-field">
                      <span>法术额外描述</span>
                      <textarea v-model="customDraft.spellExtraDescription" rows="3" placeholder="记录该物品施展该法术时的额外规则"></textarea>
                    </label>
                  </div>

                  <div v-else class="trait-type-note">
                    {{ traitTypeOptions.find(option => option.value === customDraft.type)?.note }}
                  </div>

                  <div v-if="customDraft.activationMode === 'charged' || customDraft.type === 'spell'" class="field-grid nested-grid">
                    <label>
                      <span>当前充能</span>
                      <input data-test="custom-trait-charges-current" type="number" min="0" v-model.number="customDraft.chargesCurrent">
                    </label>
                    <label>
                      <span>最大充能</span>
                      <input data-test="custom-trait-charges-max" type="number" min="0" v-model.number="customDraft.chargesMax">
                    </label>
                    <label>
                      <span>恢复条件</span>
                      <input type="text" v-model="customDraft.resetCondition" placeholder="例如：每日黎明">
                    </label>
                    <label>
                      <span>恢复公式</span>
                      <input type="text" v-model="customDraft.resetFormula" placeholder="例如：1d3">
                    </label>
                  </div>

                  <button data-test="save-custom-trait" type="button" class="btn-add-trait" @click="saveNewCustomTrait">保存为可选词条</button>
                </section>

                <section v-show="activeTab === 'manage'" class="form-section custom-trait-editor">
                  <div class="section-title">
                    <h4>管理自定义词条</h4>
                    <p>这些词条保存在当前角色数据中，可被任意物品复用。</p>
                  </div>
                  <div v-if="!store.character?.customMagicTraits?.length" class="empty-inline">
                    尚未创建自定义词条。
                  </div>
                  <div v-for="trait in store.character?.customMagicTraits ?? []" :key="trait.id" class="saved-trait-edit">
                    <div class="saved-trait-head">
                      <strong>{{ trait.name || '未命名词条' }}</strong>
                      <button type="button" class="btn-delete-trait" @click="deleteCustomTrait(trait.id)">删除</button>
                    </div>
                    <div class="field-grid">
                      <label>
                        <span>词条名</span>
                        <input v-model="trait.name">
                      </label>
                      <label>
                        <span>词条类别</span>
                        <select v-model="trait.type" @change="syncTraitMode(trait)">
                          <option v-for="option in traitTypeOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                          </option>
                        </select>
                      </label>
                      <label>
                        <span>触发方式</span>
                        <select v-model="trait.activationMode" @change="syncTraitMode(trait)">
                          <option value="always">默认作用</option>
                          <option value="charged">消耗充能</option>
                        </select>
                      </label>
                      <label v-if="trait.type === 'damage'" class="check-option">
                        <input type="checkbox" v-model="trait.participatesInDamage">
                        <span>参与伤害</span>
                      </label>
                      <label v-if="trait.type === 'damage'">
                        <span>伤害骰</span>
                        <input v-model="trait.damageDice" placeholder="例如：1d6">
                      </label>
                      <label v-if="trait.type === 'damage'">
                        <span>伤害加值</span>
                        <input v-model.number="trait.damageBonus" type="number">
                      </label>
                      <label v-if="trait.type === 'damage'">
                        <span>伤害类型</span>
                        <select v-model="trait.damageType">
                          <option v-for="type in DAMAGE_TYPE_OPTIONS" :key="type.key" :value="type.key">{{ type.label }}</option>
                        </select>
                      </label>
                      <label v-if="trait.type === 'spell'" class="full-field">
                        <span>指定法术</span>
                        <select v-model="trait.spellId">
                          <option value="">未指定</option>
                          <option v-for="spell in dataPackStore.spellLibraryItems" :key="spell.id" :value="spell.id">
                            {{ spell.name }}（{{ spell.level === 0 ? '戏法' : `${spell.level}环` }}）
                          </option>
                        </select>
                      </label>
                      <label class="full-field">
                        <span>词条描述</span>
                        <textarea v-model="trait.description" rows="3"></textarea>
                      </label>
                      <label v-if="trait.type === 'spell'" class="full-field">
                        <span>法术额外描述</span>
                        <textarea v-model="trait.spellExtraDescription" rows="3"></textarea>
                      </label>
                    </div>

                    <div v-if="trait.activationMode === 'charged' || trait.type === 'spell'" class="field-grid nested-grid">
                      <label>
                        <span>当前充能</span>
                        <input type="number" min="0" v-model.number="ensureTraitCharges(trait).current">
                      </label>
                      <label>
                        <span>最大充能</span>
                        <input type="number" min="0" v-model.number="ensureTraitCharges(trait).max">
                      </label>
                      <label>
                        <span>恢复条件</span>
                        <input type="text" v-model="ensureTraitCharges(trait).resetCondition">
                      </label>
                      <label>
                        <span>恢复公式</span>
                        <input type="text" v-model="ensureTraitCharges(trait).resetFormula">
                      </label>
                    </div>
                  </div>
                </section>
              </template>
            </main>
          </div>

          <footer class="enchant-footer">
            <button class="btn-cancel" @click="closeEnchanting">取消</button>
            <button class="btn-save" @click="saveEnchanting">保存附魔</button>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.enchant-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(12, 18, 28, 0.58);
  backdrop-filter: blur(5px);
}

.enchant-panel {
  width: min(980px, 96vw);
  height: min(92vh, 820px);
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(245, 197, 96, 0.45);
  border-radius: 18px;
  background:
    radial-gradient(circle at 12% 0%, rgba(245, 197, 96, 0.18), transparent 34%),
    radial-gradient(circle at 92% 20%, rgba(129, 95, 255, 0.16), transparent 30%),
    linear-gradient(145deg, #1c2531, #121821);
  color: #f5f0df;
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.enchant-header,
.enchant-footer {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(245, 197, 96, 0.2);

  h3 {
    margin: 2px 0 0;
    font-size: 1.2rem;
  }
}

.enchant-footer {
  justify-content: flex-end;
  border-top: 1px solid rgba(245, 197, 96, 0.2);
  border-bottom: 0;
}

.eyebrow {
  color: #f5c560;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.btn-close {
  border: 0;
  background: transparent;
  color: #f5f0df;
  font-size: 1.8rem;
  cursor: pointer;
}

.enchant-body {
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: 270px minmax(0, 1fr);
  overflow: hidden;
}

.enchant-sidebar {
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-right: 1px solid rgba(245, 197, 96, 0.16);
  background: rgba(0, 0, 0, 0.16);
}

.target-card {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  padding: 12px;
  border: 1px solid rgba(245, 197, 96, 0.24);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.07);

  &.empty {
    opacity: 0.72;
  }

  strong,
  small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    color: #b7c2d2;
    margin-top: 3px;
  }
}

.rune-mark,
.empty-rune {
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(245, 197, 96, 0.14);
  color: #f5c560;
}

.rune-mark {
  width: 42px;
  height: 42px;
  font-size: 1.45rem;
}

.preview-stack {
  display: grid;
  gap: 8px;
}

.preview-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 10px;
  border-radius: 10px;
  font-weight: 800;

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  em {
    flex-shrink: 0;
    font-size: 0.72rem;
    font-style: normal;
    opacity: 0.72;
  }
}

.tab-nav {
  display: grid;
  gap: 8px;

  button {
    display: grid;
    gap: 2px;
    text-align: left;
    border: 1px solid rgba(245, 197, 96, 0.16);
    border-radius: 12px;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.055);
    color: #d6dfef;
    cursor: pointer;

    &.active {
      border-color: rgba(245, 197, 96, 0.64);
      background: rgba(245, 197, 96, 0.14);
      color: #f9df9c;
    }
  }

  span {
    font-weight: 900;
  }

  small {
    color: #aeb9c8;
  }
}

.selected-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
  color: #d6dfef;

  strong {
    flex-basis: 100%;
    color: #f7d58a;
  }

  span {
    border-radius: 999px;
    padding: 3px 8px;
    background: rgba(255, 255, 255, 0.08);
    font-size: 0.74rem;
  }
}

.enchant-content {
  min-height: 0;
  padding: 16px 18px 18px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.maker-assignment {
  margin-bottom: 12px;
}

.source-line {
  margin-bottom: 12px;
  color: #b7c2d2;
  font-size: 0.78rem;
}

.empty-state {
  display: grid;
  place-items: center;
  gap: 10px;
  min-height: 430px;
  text-align: center;
  color: #c7d2e2;

  h4,
  p {
    margin: 0;
  }
}

.empty-rune {
  width: 72px;
  height: 72px;
  font-size: 2rem;
}

.form-section {
  padding: 14px;
  border: 1px solid rgba(245, 197, 96, 0.18);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.055);
}

.section-title {
  margin-bottom: 12px;

  h4,
  p {
    margin: 0;
  }

  h4 {
    color: #f7d58a;
    font-size: 0.98rem;
  }

  p {
    margin-top: 4px;
    color: #b7c2d2;
    font-size: 0.78rem;
  }
}

.visual-title {
  margin-top: 16px;
}

.check-row,
.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.color-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.nested-grid {
  margin-top: 10px;
}

.trait-type-note {
  margin-top: 10px;
  padding: 10px 12px;
  border: 1px dashed rgba(245, 197, 96, 0.28);
  border-radius: 10px;
  color: #c7d2e2;
  font-size: 0.78rem;
  background: rgba(0, 0, 0, 0.14);
}

.check-option,
.trait-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid rgba(245, 197, 96, 0.22);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
}

.field-grid label,
.full-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: #d6dfef;
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.full-field {
  grid-column: 1 / -1;
}

input,
select,
textarea {
  min-width: 0;
  border: 1px solid rgba(245, 197, 96, 0.25);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.22);
  color: #f5f0df;
  padding: 8px 9px;
}

input[type='color'] {
  min-height: 38px;
  padding: 3px;
}

.search-input {
  width: 100%;
  margin-bottom: 10px;
}

.trait-list {
  display: grid;
  gap: 8px;
}

.trait-option {
  align-items: flex-start;

  &.selected {
    border-color: rgba(245, 197, 96, 0.64);
    background: rgba(245, 197, 96, 0.13);
  }
}

.trait-main {
  display: grid;
  gap: 2px;
  flex: 1;

  small {
    color: #b7c2d2;
  }

  em {
    color: #d5d0c5;
    font-size: 0.78rem;
    font-style: normal;
  }
}

.trait-pill {
  flex-shrink: 0;
  border-radius: 999px;
  padding: 3px 8px;
  background: rgba(0, 0, 0, 0.24);
  color: #f7d58a;
  font-size: 0.72rem;
  font-weight: 900;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.saved-trait-edit {
  padding: 12px;
  border: 1px solid rgba(245, 197, 96, 0.18);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.14);

  & + & {
    margin-top: 10px;
  }
}

.saved-trait-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.empty-inline {
  padding: 18px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  color: #b7c2d2;
}

.btn-delete-trait,
.btn-add-trait,
.btn-cancel,
.btn-save,
.quick-actions button {
  border: 0;
  border-radius: 8px;
  padding: 8px 12px;
  font-weight: 800;
  cursor: pointer;
}

.btn-delete-trait,
.btn-cancel,
.quick-actions button {
  background: rgba(255, 255, 255, 0.08);
  color: #d6dfef;
}

.btn-delete-trait {
  background: rgba(220, 80, 80, 0.18);
  color: #ffb7b7;
}

.btn-add-trait,
.btn-save {
  margin-top: 10px;
  background: #f5c560;
  color: #20242c;
}

.enchant-fade-enter-active,
.enchant-fade-leave-active {
  transition: opacity 0.2s ease;
}

.enchant-fade-enter-from,
.enchant-fade-leave-to {
  opacity: 0;
}

@media (max-width: 860px) {
  .enchant-body {
    grid-template-columns: 1fr;
  }

  .enchant-sidebar {
    border-right: 0;
    border-bottom: 1px solid rgba(245, 197, 96, 0.16);
  }

  .tab-nav {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .field-grid,
  .check-row,
  .color-grid,
  .tab-nav {
    grid-template-columns: 1fr;
  }
}
</style>
