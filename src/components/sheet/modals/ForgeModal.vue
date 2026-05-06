<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useForge } from '../../../composables/useForge';
import { useUiFeedbackStore } from '../../../stores/uiFeedback';
import { useDataPackStore } from '../../../stores/dataPackStore';
import { DAMAGE_TYPE_OPTIONS } from '../../../data/rules/damageTypes';
import { WEAPON_PROPERTIES } from '../../../data/rules/weaponProperties';
import { getRuntimeLibraryItemById } from '../../../data/dataPacks/runtimeDataPacks';
import { useEnchanting } from '../../../composables/useEnchanting';
import type {
  AbilityKey,
  AmmoTypeKey,
  ArmorType,
  CurrencyUnit,
  ItemType,
  WeaponCategory,
  WeaponPropertyKey,
} from '../../../types/Library';

import EditableText from '../../common/EditableText.vue';
import EditableTextarea from '../../common/EditableTextarea.vue';

// 获取状态和方法
const {
  draftItem,
  draftData,
  forgeMode,
  editorContext,
  save,
  close,
  updateItemType,
  updateItemTemplate,
  toggleWeaponProperty,
} = useForge();
const { openEnchantingForItem } = useEnchanting();
const feedback = useUiFeedbackStore();
const dataPackStore = useDataPackStore();
const weaponProperties = computed(() => draftData.value.properties ?? []);

const itemTypeOptions: Array<{ value: ItemType; label: string }> = [
  { value: 'weapon', label: '武器' },
  { value: 'armor', label: '护甲' },
  { value: 'gear', label: '冒险装备' },
  { value: 'tool', label: '工具' },
  { value: 'consumable', label: '消耗品/弹药' },
  { value: 'treasure', label: '财宝/贸易品' },
  { value: 'container', label: '容器' },
  { value: 'pack', label: '套组' },
  { value: 'misc', label: '其他' },
];

const weaponCategoryOptions: Array<{ value: WeaponCategory; label: string }> = [
  { value: 'simple_melee', label: '简易近战' },
  { value: 'simple_ranged', label: '简易远程' },
  { value: 'martial_melee', label: '军用近战' },
  { value: 'martial_ranged', label: '军用远程' },
];

const armorTypeOptions: Array<{ value: ArmorType; label: string }> = [
  { value: 'light', label: '轻甲' },
  { value: 'medium', label: '中甲' },
  { value: 'heavy', label: '重甲' },
  { value: 'shield', label: '盾牌' },
];

const currencyOptions: CurrencyUnit[] = ['cp', 'sp', 'ep', 'gp', 'pp'];
const ammoTypeOptions: AmmoTypeKey[] = ['none', 'arrow', 'bolt', 'bullet', 'needle'];
const abilityOptions: Array<{ value: AbilityKey; label: string }> = [
  { value: 'str', label: '力量' },
  { value: 'dex', label: '敏捷' },
  { value: 'con', label: '体质' },
  { value: 'int', label: '智力' },
  { value: 'wis', label: '感知' },
  { value: 'cha', label: '魅力' },
];
const weaponPropertyOptions = Object.values(WEAPON_PROPERTIES);
const templateSearch = ref('');

const templateOptions = computed(() => {
  const query = templateSearch.value.trim().toLowerCase();
  const source = query
    ? dataPackStore.itemLibraryItems.filter(item => {
        const haystack = [
          item.name,
          item.englishName,
          item.id,
          item.displayCategory,
          item.displaySubcategory,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      })
    : dataPackStore.itemLibraryItems;

  return source.slice(0, 80);
});

const selectedTemplateName = computed(() => getRuntimeLibraryItemById(draftItem.value?.templateId ?? '')?.name ?? '');

const isDataPackMakerEditor = computed(() => editorContext.value?.dataPackMaker === true);
const dataPackMenuGroups = computed(() => dataPackStore.activeDraftPack?.editorMeta?.menuGroups?.items ?? []);
const dataPackEncryptionGroups = computed(() => dataPackStore.activeDraftPack?.editorMeta?.encryptionGroups ?? []);
const itemGroupCategoryOptions = computed(() => dataPackMenuGroups.value.map(group => group.name));
const itemGroupSubcategoryOptions = computed(() =>
  dataPackMenuGroups.value.flatMap(group => group.children?.map(child => child.name) ?? [])
);
const selectedUnlockGroupId = computed({
  get: () =>
    (draftData.value.visibility as { unlockGroupId?: string } | undefined)?.unlockGroupId
    ?? (draftData.value.encryptionGroupId as string | undefined)
    ?? '',
  set: (value: string) => {
    const groupId = value || undefined;
    draftData.value.encryptionGroupId = groupId;
    draftData.value.visibility = groupId
      ? { public: false, unlockGroupId: groupId }
      : { public: true };
  },
});

const tagsText = computed({
  get: () => (Array.isArray(draftData.value.tags) ? draftData.value.tags.join(', ') : ''),
  set: (value: string) => {
    draftData.value.tags = value
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
  },
});

const onTypeChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value as ItemType;
  updateItemType(value);
};

const onTemplateChange = (event: Event) => {
  const templateId = (event.target as HTMLSelectElement).value;
  updateItemTemplate(templateId);
  const template = getRuntimeLibraryItemById(templateId);
  templateSearch.value = template?.name ?? '';
};

const updateDescription = (value: string) => {
  if (!draftItem.value) return;
  draftItem.value.description = value;
  // Once the GM writes custom text, the old structured source blocks must not shadow it in library tooltips.
  draftItem.value.descriptionBlocks = undefined;
};

// 记录鼠标按下时是否在遮罩层上
const isMouseDownOnBackdrop = ref(false);

// 数据安全层（未保存修改的拦截确认）
const initialStateStr = ref('');

// 监听 draftItem 的引用变化（通常在打开弹窗或切换编辑物品时发生赋值）
// 注意这里只监听引用，不加 deep，这样就能正好捕获初始状态，而不会在每次输入时被覆盖
watch(() => draftItem.value, (newVal) => {
  if (newVal) {
    initialStateStr.value = JSON.stringify(newVal);
    templateSearch.value = getRuntimeLibraryItemById(newVal.templateId)?.name ?? '';
  } else {
    initialStateStr.value = '';
    templateSearch.value = '';
  }
});

// 安全关闭逻辑
const safeClose = async () => {
  if (draftItem.value) {
    const currentStr = JSON.stringify(draftItem.value);
    // 比对当前状态与初始快照
    if (currentStr !== initialStateStr.value) {
      const confirmed = await feedback.confirm({
        title: '放弃未保存更改',
        message: '检测到未保存的更改，确认要舍弃并退出吗？',
        tone: 'warning',
        confirmText: '放弃更改',
      });
      if (!confirmed) {
        return; // 用户点击了“取消”，终止关闭动作
      }
    }
  }
  close(); // 执行真正的关闭
};

const openEnchantFromForge = () => {
  if (!draftItem.value) return;
  openEnchantingForItem(draftItem.value, 'button', updated => {
    draftItem.value = updated;
  }, editorContext.value ?? undefined);
};

const onBackdropMousedown = () => {
  isMouseDownOnBackdrop.value = true;
};

const onBackdropMouseup = async () => {
  // 只有当 mousedown 和 mouseup 都在遮罩层上时，才执行关闭操作
  if (isMouseDownOnBackdrop.value) {
    await safeClose();
  }
  // 无论如何，松开鼠标后重置状态
  isMouseDownOnBackdrop.value = false;
};

const flushActiveEditor = async () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
    await nextTick();
  }
};

const handleSave = async () => {
  await flushActiveEditor();
  save();
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div class="modal-backdrop" v-if="draftItem" @mousedown.self="onBackdropMousedown" @mouseup.self="onBackdropMouseup">

        <div class="modal-content">

          <div class="modal-header">
            <div class="title-group">
              <span class="emoji">🔨</span>
              <h3>{{ forgeMode === 'create' ? '自定义物品' : '改造物品' }}</h3>
            </div>
            <button v-if="draftItem" class="btn-enchant" @click="openEnchantFromForge">✨ 附魔制作</button>
            <button class="btn-close" @click="safeClose" title="关闭 (Esc)">×</button>
          </div>

          <div class="modal-body custom-scrollbar">

            <div class="form-section highlight">
              <div class="form-row main-name">
                <label>物品名称</label>
                <EditableText v-model="draftItem!.name" class="input-lg" placeholder="输入物品名称..." />
              </div>

              <div class="stats-grid">
                <div class="field">
                  <label>物品类型</label>
                  <select :value="draftItem!.type" class="input-std" @change="onTypeChange">
                    <option v-for="option in itemTypeOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>
                <div class="field">
                  <label>物品模板</label>
                  <div class="template-picker">
                    <input
                      type="text"
                      v-model="templateSearch"
                      class="input-std"
                      placeholder="搜索中文模板名..."
                    >
                    <select :value="draftItem!.templateId" class="input-std" @change="onTemplateChange">
                      <option value="">自定义模板</option>
                      <option v-for="option in templateOptions" :key="option.id" :value="option.id">
                        {{ option.name }}（{{ option.displaySubcategory ?? option.type }}）
                      </option>
                    </select>
                    <small v-if="selectedTemplateName" class="template-current">
                      当前：{{ selectedTemplateName }}
                    </small>
                  </div>
                </div>
                <div class="field">
                  <label>数量</label>
                  <input type="number" v-model.number="draftItem!.quantity" min="1" class="input-std">
                </div>
                <div class="field">
                  <label>重量 (lb)</label>
                  <input type="number" v-model.number="draftItem!.weight" step="0.1" class="input-std">
                </div>
                <div class="field cost-field">
                  <label>价值</label>
                  <div class="cost-input-group">
                    <input type="number" v-model.number="draftData.cost.value" placeholder="0" class="input-std">
                    <select v-model="draftData.cost.unit" class="unit-select">
                      <option v-for="unit in currencyOptions" :key="unit" :value="unit">{{ unit }}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="isDataPackMakerEditor" class="form-section maker-assignment">
              <div class="section-header">
                <h4>数据包归档</h4>
              </div>
              <div class="row-2">
                <div class="field">
                  <label>分组</label>
                  <input
                    v-model="draftData.displayCategory"
                    class="input-std"
                    list="forge-maker-category-list"
                    placeholder="可选择已有分组或输入新一级分组"
                  >
                  <datalist id="forge-maker-category-list">
                    <option v-for="option in itemGroupCategoryOptions" :key="option" :value="option" />
                  </datalist>
                </div>
                <div class="field">
                  <label>子分组</label>
                  <input
                    v-model="draftData.displaySubcategory"
                    class="input-std"
                    list="forge-maker-subcategory-list"
                    placeholder="可选择已有子分组或输入新二级分组"
                  >
                  <datalist id="forge-maker-subcategory-list">
                    <option v-for="option in itemGroupSubcategoryOptions" :key="option" :value="option" />
                  </datalist>
                </div>
                <div class="field">
                  <label>口令分组</label>
                  <select v-model="selectedUnlockGroupId" class="input-std">
                    <option value="">公开</option>
                    <option v-for="group in dataPackEncryptionGroups" :key="group.id" :value="group.id">
                      {{ group.name }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="form-section">
              <label>物品描述 / 备注</label>
              <EditableTextarea
                :model-value="draftItem!.description ?? ''"
                @update:model-value="updateDescription"
                :rows="6"
                class="desc-area"
              />
            </div>

            <hr class="divider" />

            <div v-if="draftItem!.type === 'weapon'" class="form-section type-specific weapon">
              <div class="section-header">
                <h4>⚔️ 战斗属性</h4>
              </div>
              <div class="row-3">
                <div class="field">
                  <label>武器分类</label>
                  <select v-model="draftData.category" class="input-std">
                    <option v-for="option in weaponCategoryOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>
                <div class="field">
                  <label>伤害骰 (Damage)</label>
                  <input type="text" v-model="draftData.damage" placeholder="1d8" class="input-std">
                </div>
                <div class="field">
                  <label>伤害类型</label>
                  <select v-model="draftData.damageType" class="input-std">
                    <option v-for="option in DAMAGE_TYPE_OPTIONS" :key="option.key" :value="option.key">
                      {{ option.label }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="row-3">
                <div class="field">
                  <label>射程 / 触及</label>
                  <input type="text" v-model="draftData.range" placeholder="5 尺 / 20/60 尺" class="input-std">
                </div>
                <div class="field">
                  <label>两用伤害</label>
                  <input type="text" v-model="draftData.versatileDamage" placeholder="1d10" class="input-std">
                </div>
                <div class="field">
                  <label>弹药类型</label>
                  <select v-model="draftData.requiredAmmoType" class="input-std">
                    <option v-for="type in ammoTypeOptions" :key="type" :value="type">{{ type }}</option>
                  </select>
                </div>
              </div>
              <div class="field mt-2">
                <label>武器词条属性 (Properties)</label>
                <div class="check-grid">
                  <label
                    v-for="property in weaponPropertyOptions"
                    :key="property.key"
                    class="check-option"
                    :title="property.description"
                  >
                    <input
                      type="checkbox"
                      :checked="weaponProperties.includes(property.key)"
                      @change="toggleWeaponProperty(property.key)"
                    >
                    <span>{{ property.label }} <em>{{ property.key }}</em></span>
                  </label>
                </div>
              </div>
              <div class="field">
                <label>特殊规则文本</label>
                <EditableTextarea :model-value="draftData.specialEffect as string ?? ''" @update:model-value="val => draftData.specialEffect = val" :rows="3" class="desc-area" />
              </div>
            </div>

            <div v-if="draftItem!.type === 'armor'" class="form-section type-specific armor">
              <div class="section-header">
                <h4>🛡️ 防御属性</h4>
              </div>
              <div class="row-2">
                <div class="field">
                  <label>AC (防御等级)</label>
                  <input type="number" v-model.number="draftData.ac" class="input-std">
                </div>
                <div class="field">
                  <label>护甲类型</label>
                  <select v-model="draftData.armorType" class="input-std">
                    <option v-for="option in armorTypeOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="row-3">
                <div class="field">
                  <label>敏捷加值上限</label>
                  <input type="number" v-model.number="draftData.dexBonusMax" class="input-std">
                </div>
                <div class="field">
                  <label>力量需求</label>
                  <input type="number" v-model.number="draftData.strReq" class="input-std">
                </div>
                <label class="check-option standalone">
                  <input type="checkbox" v-model="draftData.stealthDis">
                  <span>潜行劣势</span>
                </label>
              </div>
              <div class="row-2">
                <div class="field">
                  <label>穿戴时间</label>
                  <input type="text" v-model="draftData.donTime" class="input-std">
                </div>
                <div class="field">
                  <label>脱下时间</label>
                  <input type="text" v-model="draftData.doffTime" class="input-std">
                </div>
              </div>
            </div>

            <div v-if="draftItem!.type === 'tool'" class="form-section type-specific">
              <div class="section-header">
                <h4>🧰 工具属性</h4>
              </div>
              <div class="field">
                <label>关联属性</label>
                <select v-model="draftData.baseAbility" class="input-std">
                  <option v-for="option in abilityOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>

            <div v-if="draftItem!.type === 'consumable'" class="form-section type-specific">
              <div class="section-header">
                <h4>🧪 消耗品 / 弹药属性</h4>
              </div>
              <div class="row-3">
                <div class="field">
                  <label>使用动作</label>
                  <input type="text" v-model="draftData.activation" class="input-std" placeholder="1 Action">
                </div>
                <div class="field">
                  <label>最大充能</label>
                  <input type="number" v-model.number="draftData.maxCharges" class="input-std">
                </div>
                <div class="field">
                  <label>当前充能</label>
                  <input type="number" v-model.number="draftData.charges" class="input-std">
                </div>
              </div>
              <div class="row-2">
                <label class="check-option standalone">
                  <input type="checkbox" v-model="draftData.isAmmunition">
                  <span>作为弹药</span>
                </label>
                <div class="field">
                  <label>弹药类型</label>
                  <select v-model="draftData.ammoType" class="input-std">
                    <option v-for="type in ammoTypeOptions" :key="type" :value="type">{{ type }}</option>
                  </select>
                </div>
              </div>
              <div class="field">
                <label>效果描述</label>
                <EditableTextarea :model-value="draftData.effectDescription as string ?? ''" @update:model-value="val => draftData.effectDescription = val" :rows="3" class="desc-area" />
              </div>
            </div>

            <div v-if="draftItem!.type === 'container'" class="form-section type-specific">
              <div class="section-header">
                <h4>🎒 容器属性</h4>
              </div>
              <div class="row-3">
                <div class="field">
                  <label>承重上限 (lb)</label>
                  <input type="number" v-model.number="draftData.capacityWeight" class="input-std">
                </div>
                <div class="field">
                  <label>容量体积</label>
                  <input type="text" v-model="draftData.capacityVolume" class="input-std" placeholder="1 立方尺">
                </div>
                <div class="field">
                  <label>最大物品数</label>
                  <input type="number" v-model.number="draftData.maxItems" class="input-std">
                </div>
              </div>
              <label class="check-option standalone">
                <input type="checkbox" v-model="draftData.ignoreContentWeight">
                <span>忽略内容重量</span>
              </label>
            </div>


            <div class="form-section">
              <div class="section-header">
                <h4>🏷️ 分类与来源</h4>
              </div>
              <div class="row-2">
                <div class="field">
                  <label>显示大类</label>
                  <input type="text" v-model="draftData.displayCategory" class="input-std" placeholder="装备 / 财宝 / 自定义">
                </div>
                <div class="field">
                  <label>显示子类</label>
                  <input type="text" v-model="draftData.displaySubcategory" class="input-std" placeholder="武器 / 容器 / 自定义">
                </div>
              </div>
              <div class="row-2">
                <div class="field">
                  <label>来源</label>
                  <input type="text" v-model="draftData.source" class="input-std" placeholder="PHB / 自定义">
                </div>
                <div class="field">
                  <label>英文名</label>
                  <input type="text" v-model="draftData.englishName" class="input-std" placeholder="English name">
                </div>
              </div>
              <div class="field">
                <label>标签（用英文逗号分隔）</label>
                <input type="text" v-model="tagsText" class="input-std" placeholder="magic, homebrew, quest">
              </div>
            </div>

          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="safeClose">取消 (Esc)</button>
            <button class="btn-save" @mousedown.capture="flushActiveEditor" @click="handleSave">保存更改</button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
/* 1. 背景遮罩层
  必须 fixed 铺满全屏，负责模糊背景和点击关闭
*/
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  z-index: 2000;

  /* Flex 布局确保内容居中 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 2. 模态框主体卡片
  移除原来的 fixed 定位，改由 backdrop 居中
  增加宽度到 600px (原为自适应或挤压)
*/
.modal-content {
  background: #fff;
  width: 900px; /* 增大宽度 */
  max-width: 95vw;
  //max-height: 85vh;
  height: 85vh;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止圆角被子元素破坏 */
  animation: popIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.modal-header {
  padding: 14px 22px;
  background: #2c3e50;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;

  .title-group {
    display: flex; align-items: center; gap: 12px;
    h3 { margin: 0; font-size: 1.2rem; letter-spacing: 0.5px; font-weight: 600; }
    .emoji { font-size: 1.5rem; }
  }
  .btn-enchant {
    margin-left: auto;
    border: 1px solid rgba(245, 197, 96, 0.55);
    border-radius: 999px;
    background: rgba(245, 197, 96, 0.12);
    color: #f5d184;
    padding: 7px 12px;
    font-weight: 700;
    cursor: pointer;

    &:hover {
      background: rgba(245, 197, 96, 0.22);
      color: #fff1c4;
    }
  }
  .btn-close {
    background: none; border: none; color: #bdc3c7; font-size: 2rem; line-height: 1; cursor: pointer; padding: 0;
    &:hover { color: #fff; }
  }
}

.modal-body {
  padding: 18px 22px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: #fdfdfd;
}

/* 表单区域通用样式 */
.form-section {
  display: flex; flex-direction: column; gap: 8px;

  &.highlight {
    background: #f1f2f6;
    padding: 14px;
    border-radius: 8px;
    border: 1px solid #e1e2e6;
  }

  &.maker-assignment {
    background: #eef4ef;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #cfe0d1;
  }

  &.type-specific {
    position: relative;
    padding: 14px;
    border-radius: 8px;
    background: #fff8f3;
    border: 1px solid #ffeaa7;

    &.weapon { border-left: 4px solid #d35400; }
    &.armor { border-left: 4px solid #2980b9; background: #f0f8ff; border-color: #d6eaf8; }

    h4 { margin: 0 0 4px 0; color: #555; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.8px; }
  }

  label {
    font-size: 0.75rem;
    color: #7f8c8d;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }
}

/* 输入框统一样式 */
.input-std, .unit-select {
  padding: 7px 9px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s;
  background: #fff;

  &:focus {
    border-color: #d35400;
    outline: none;
    box-shadow: 0 0 0 3px rgba(211, 84, 0, 0.1);
  }
}

.main-name .input-lg {
  font-size: 1.35rem;
  font-weight: 700;
  color: #2c3e50;
  border: none;
  border-bottom: 2px solid #ced4da;
  border-radius: 0;
  padding: 5px 0;
  background: transparent;
  width: 100%;

  &:focus {
    border-bottom-color: #d35400;
    box-shadow: none;
  }
}

/* 网格布局优化 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  align-items: start;

  /* ⚡️ 修复换行问题：强制所有字段都是上下结构 */
  .field {
    display: flex;
    flex-direction: column; /* 确保 Label 永远在 Input 上方 */
    gap: 5px;
  }

  /* ⚡️ 修复宽度问题：缩短数字输入框 */
  /* 只影响第一层级的 input，不影响 text 等其他类型 */
  .field input[type="number"] {
    width: 100%;       /* 填满父容器 */
    max-width: 100px;  /* 但最大不超过 100px */
  }
}

/* 价值字段的特殊组合样式 */
.cost-input-group {
  display: flex;
  gap: 5px;

  input {
    /* 缩短价值输入框 */
    min-width: 60px;
    max-width: 80px; /* 特别限制价值输入框的宽度 */
  }
  select {
    width: 70px; flex-shrink: 0; cursor: pointer; background-color: #f8f9fa;
  }
}

.template-picker {
  display: flex;
  flex-direction: column;
  gap: 5px;

  select {
    width: 100%;
  }
}

.template-current {
  color: #95a5a6;
  font-size: 0.72rem;
  line-height: 1.2;
}

.row-2 {
  display: flex; gap: 12px;
  .field { flex: 1; display: flex; flex-direction: column; gap: 5px; }
}

.row-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  .field {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.check-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.check-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: 1px solid #e1e2e6;
  border-radius: 8px;
  background: #fff;
  color: #2c3e50;
  font-size: 0.85rem;
  cursor: pointer;

  &.standalone {
    align-self: end;
    min-height: 36px;
  }

  input {
    margin: 0;
  }

  em {
    color: #95a5a6;
    font-size: 0.75rem;
    font-style: normal;
  }
}

.tags-container {
  display: flex; flex-wrap: wrap; gap: 8px;
  min-height: 34px; align-items: center;
  .tag {
    background: #e9ecef; color: #2c3e50; padding: 4px 10px;
    border-radius: 15px; font-size: 0.85rem; font-weight: 500;
  }
  .hint { color: #bdc3c7; font-style: italic; font-size: 0.9rem; }
}

.divider { border: 0; border-top: 1px dashed #dcdde1; margin: 10px 0; }

.modal-footer {
  padding: 14px 22px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;

  button {
    padding: 8px 18px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    font-size: 0.95rem;
    transition: transform 0.1s, box-shadow 0.2s;

    &:active { transform: translateY(1px); }
  }

  .btn-cancel {
    background: #fff; border: 1px solid #ced4da; color: #495057;
    &:hover { background: #f1f3f5; }
  }

  .btn-save {
    background: #d35400; color: white; box-shadow: 0 4px 6px rgba(211, 84, 0, 0.2);
    &:hover { background: #e67e22; box-shadow: 0 6px 8px rgba(211, 84, 0, 0.3); }
  }
}

/* 动画 */
@keyframes popIn {
  0% { opacity: 0; transform: scale(0.95) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
