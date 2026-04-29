<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useActiveSheetStore } from '../../../stores/activeSheet';
import { useEnchanting } from '../../../composables/useEnchanting';
import { DAMAGE_TYPE_OPTIONS } from '../../../data/rules/damageTypes';
import {
  DEFAULT_MAGIC_ATTACK_BACKGROUND,
  DEFAULT_MAGIC_INVENTORY_BACKGROUND,
  DEFAULT_MAGIC_NAME_COLOR,
  PRESET_MAGIC_TRAITS,
} from '../../../data/rules/magicTraits';
import { SPELL_LIBRARY } from '../../../data/spells';
import type { ItemMagicTrait, ItemRarity } from '../../../types/Library';

const store = useActiveSheetStore();
const {
  isEnchantingOpen,
  entrySource,
  targetPayload,
  targetItem,
  saveEnchanting,
  addCustomTrait,
  deleteCustomTrait,
  toggleTraitSelection,
  closeEnchanting,
} = useEnchanting();

const rarityOptions: ItemRarity[] = ['common', 'uncommon', 'rare', 'very_rare', 'legendary', 'artifact', 'varies'];

const spellSearch = reactive({ value: '' });
const customDraft = reactive({
  type: 'damage' as ItemMagicTrait['type'],
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

const availableTraits = computed<ItemMagicTrait[]>(() => [
  ...PRESET_MAGIC_TRAITS,
  ...(store.character?.customMagicTraits ?? []),
]);

const filteredSpells = computed(() => {
  const keyword = spellSearch.value.trim().toLowerCase();
  const spells = keyword
    ? SPELL_LIBRARY.filter(spell => `${spell.name} ${spell.id}`.toLowerCase().includes(keyword))
    : SPELL_LIBRARY;
  return spells.slice(0, 80);
});

const isTraitSelected = (id: string) => targetItem.value?.magic?.selectedTraitIds?.includes(id) ?? false;

const ensureVisualDefaults = () => {
  if (!targetItem.value?.magic) return;
  targetItem.value.magic.visuals = {
    inventoryBackground: targetItem.value.magic.visuals?.inventoryBackground || DEFAULT_MAGIC_INVENTORY_BACKGROUND,
    attackBackground: targetItem.value.magic.visuals?.attackBackground || DEFAULT_MAGIC_ATTACK_BACKGROUND,
    nameColor: targetItem.value.magic.visuals?.nameColor || DEFAULT_MAGIC_NAME_COLOR,
  };
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
  }

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
            <div class="target-summary">
              <div class="placeholder-rune">✦</div>
              <div>
                <p>{{ targetItem ? `正在附魔：${targetItem.name}` : '附魔制作界面占位中。' }}</p>
                <small>
                  来源：{{ entrySource === 'drop' ? '右侧栏拖拽目标区' : '自定义物品按钮' }}
                  <template v-if="targetPayload">
                    · 目标：{{ targetPayload.type === 'inventory-item' ? targetPayload.instanceId : targetPayload.id }}
                  </template>
                </small>
              </div>
            </div>

            <div v-if="targetItem" class="magic-form">
              <section class="form-section">
                <h4>基础附魔</h4>
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
                      <option v-for="rarity in rarityOptions" :key="rarity" :value="rarity">{{ rarity }}</option>
                    </select>
                  </label>
                  <label class="full-field">
                    <span>同调条件</span>
                    <input type="text" v-model="targetItem.magic!.attunement!.condition" placeholder="例如：需要由法师同调">
                  </label>
                </div>
              </section>

              <section class="form-section">
                <h4>魔法视觉</h4>
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

              <section class="form-section">
                <h4>可选魔法词条</h4>
                <div class="trait-list">
                  <label v-for="trait in availableTraits" :key="trait.id" class="trait-option">
                    <input type="checkbox" :checked="isTraitSelected(trait.id)" @change="toggleTraitSelection(trait.id)">
                    <span class="trait-main">
                      <strong>{{ trait.name }}</strong>
                      <small>
                        {{ trait.type === 'spell' ? '附带法术' : '伤害词条' }} ·
                        {{ trait.activationMode === 'charged' ? '消耗充能' : '默认生效' }}
                      </small>
                      <em>{{ trait.description || trait.spellExtraDescription || '暂无描述' }}</em>
                    </span>
                    <button
                      v-if="trait.source === 'custom'"
                      type="button"
                      class="btn-delete-trait"
                      title="删除自定义词条"
                      @click.prevent="deleteCustomTrait(trait.id)"
                    >
                      删除
                    </button>
                  </label>
                </div>
              </section>

              <section class="form-section custom-trait-editor">
                <h4>新建自定义词条</h4>
                <div class="field-grid">
                  <label>
                    <span>词条类别</span>
                    <select v-model="customDraft.type">
                      <option value="damage">伤害词条</option>
                      <option value="spell">附带法术</option>
                    </select>
                  </label>
                  <label>
                    <span>触发方式</span>
                    <select v-model="customDraft.activationMode">
                      <option value="always">默认作用</option>
                      <option value="charged">消耗充能</option>
                    </select>
                  </label>
                  <label class="full-field">
                    <span>词条名</span>
                    <input type="text" v-model="customDraft.name" placeholder="例如：烈焰">
                  </label>
                  <label class="full-field">
                    <span>词条描述</span>
                    <textarea v-model="customDraft.description" rows="2" placeholder="描述该词条的规则文本"></textarea>
                  </label>
                </div>

                <div v-if="customDraft.type === 'damage'" class="field-grid nested-grid">
                  <label class="check-option full-field">
                    <input type="checkbox" v-model="customDraft.participatesInDamage">
                    <span>参与每次攻击的伤害计算</span>
                  </label>
                  <label>
                    <span>伤害骰</span>
                    <input type="text" v-model="customDraft.damageDice" placeholder="例如：1d6">
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

                <div v-else class="field-grid nested-grid">
                  <label class="full-field">
                    <span>搜索法术</span>
                    <input type="search" v-model="spellSearch.value" placeholder="输入中文法术名搜索">
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
                    <textarea v-model="customDraft.spellExtraDescription" rows="2" placeholder="记录该物品施展该法术时的额外规则"></textarea>
                  </label>
                </div>

                <div v-if="customDraft.activationMode === 'charged' || customDraft.type === 'spell'" class="field-grid nested-grid">
                  <label>
                    <span>当前充能</span>
                    <input type="number" min="0" v-model.number="customDraft.chargesCurrent">
                  </label>
                  <label>
                    <span>最大充能</span>
                    <input type="number" min="0" v-model.number="customDraft.chargesMax">
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

                <button type="button" class="btn-add-trait" @click="saveNewCustomTrait">保存为可选词条</button>
              </section>

              <section v-if="store.character?.customMagicTraits?.length" class="form-section custom-trait-editor">
                <h4>编辑已保存的自定义词条</h4>
                <div v-for="trait in store.character.customMagicTraits" :key="trait.id" class="saved-trait-edit">
                  <input v-model="trait.name" aria-label="词条名">
                  <select v-model="trait.type" aria-label="词条类别">
                    <option value="damage">伤害词条</option>
                    <option value="spell">附带法术</option>
                  </select>
                  <select v-model="trait.activationMode" aria-label="触发方式">
                    <option value="always">默认作用</option>
                    <option value="charged">消耗充能</option>
                  </select>
                  <label v-if="trait.type === 'damage'" class="inline-check">
                    <input type="checkbox" v-model="trait.participatesInDamage">
                    参与伤害
                  </label>
                  <input v-if="trait.type === 'damage'" v-model="trait.damageDice" placeholder="伤害骰，如 1d6">
                  <input v-if="trait.type === 'damage'" v-model.number="trait.damageBonus" type="number" placeholder="伤害加值">
                  <select v-if="trait.type === 'damage'" v-model="trait.damageType">
                    <option v-for="type in DAMAGE_TYPE_OPTIONS" :key="type.key" :value="type.key">{{ type.label }}</option>
                  </select>
                  <select v-if="trait.type === 'spell'" v-model="trait.spellId" aria-label="指定法术">
                    <option value="">未指定</option>
                    <option v-for="spell in SPELL_LIBRARY" :key="spell.id" :value="spell.id">
                      {{ spell.name }}（{{ spell.level === 0 ? '戏法' : `${spell.level}环` }}）
                    </option>
                  </select>
                  <textarea v-model="trait.description" rows="2" aria-label="词条描述"></textarea>
                  <textarea v-if="trait.type === 'spell'" v-model="trait.spellExtraDescription" rows="2" placeholder="法术额外描述"></textarea>
                </div>
              </section>
            </div>

            <div v-else class="empty-note">
              当前未绑定具体物品，后续附魔内容将在这里扩展。
            </div>
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
  width: min(760px, 94vw);
  max-height: 92vh;
  border: 1px solid rgba(245, 197, 96, 0.45);
  border-radius: 16px;
  background:
    radial-gradient(circle at top left, rgba(245, 197, 96, 0.18), transparent 35%),
    linear-gradient(145deg, #1c2531, #121821);
  color: #f5f0df;
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.enchant-header,
.enchant-footer {
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
  max-height: calc(92vh - 132px);
  padding: 16px 20px;
  overflow-y: auto;
}

.target-summary {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;

  p {
    margin: 0 0 4px;
    font-weight: 800;
  }

  small {
    color: #b7c2d2;
  }
}

.placeholder-rune {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(245, 197, 96, 0.14);
  color: #f5c560;
  font-size: 1.6rem;
  flex-shrink: 0;
}

.magic-form {
  display: grid;
  gap: 12px;
}

.form-section {
  padding: 12px;
  border: 1px solid rgba(245, 197, 96, 0.18);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.055);

  h4 {
    margin: 0 0 10px;
    color: #f7d58a;
    font-size: 0.9rem;
  }
}

.check-row,
.field-grid,
.saved-trait-edit {
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

.check-option,
.trait-option,
.inline-check {
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

.full-field,
.saved-trait-edit textarea {
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

.trait-list {
  display: grid;
  gap: 8px;
}

.trait-option {
  align-items: flex-start;
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

.btn-delete-trait,
.btn-add-trait,
.btn-cancel,
.btn-save {
  border: 0;
  border-radius: 8px;
  padding: 7px 10px;
  font-weight: 800;
  cursor: pointer;
}

.btn-delete-trait,
.btn-cancel {
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

.empty-note {
  margin-top: 18px;
  color: #b7c2d2;
  font-size: 0.9rem;
}

.enchant-fade-enter-active,
.enchant-fade-leave-active {
  transition: opacity 0.2s ease;
}

.enchant-fade-enter-from,
.enchant-fade-leave-to {
  opacity: 0;
}

@media (max-width: 720px) {
  .field-grid,
  .check-row,
  .color-grid,
  .saved-trait-edit {
    grid-template-columns: 1fr;
  }
}
</style>
