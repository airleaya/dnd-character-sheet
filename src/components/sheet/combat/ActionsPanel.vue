<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import draggable from 'vuedraggable';
import { useActiveSheetStore } from '../../../stores/activeSheet';
import { useUiFeedbackStore } from '../../../stores/uiFeedback';
import { WEAPON_PROPERTIES } from '../../../data/rules/weaponProperties';
import { calculateCantripDamage } from '../../../utils/spellUtils';
import { useTooltipStore } from '../../../stores/tooltip';
import { ATTR_MAP, getSchoolLabel } from '../../../data/rules/dndRules';
import type { AbilityKey } from '../../../types/Library';
import type {
  CharacterUnarmedStrike,
  UnarmedStrikeDamageDice,
  UnarmedStrikeDamageType,
  UnarmedStrikeTagKey,
} from '../../../types/Character';
import type { SpellComponents, SpellDefinition } from '../../../types/Spell';
import {
  UNARMED_DAMAGE_DICE_OPTIONS,
  UNARMED_DAMAGE_TYPE_LABELS,
  UNARMED_STRIKE_TAG_LABELS,
} from '../../../stores/sheet/useCombatLogic';
import type { AttackCatalogEntry } from '../../../stores/sheet/useCombatLogic';
import { createUnarmedStrikeSignature } from '../../../utils/characterMigration';
import type { TooltipData, TooltipSection } from '../../../stores/tooltip';

const store = useActiveSheetStore();
const feedback = useUiFeedbackStore();
const character = computed(() => store.character);
const tooltipStore = useTooltipStore();

const extraAttributes: { key: AbilityKey; label: string; short: string }[] = [
  { key: 'con', label: '体质', short: '体' },
  { key: 'int', label: '智力', short: '智' },
  { key: 'wis', label: '感知', short: '感' },
  { key: 'cha', label: '魅力', short: '魅' },
];

const ATTACK_MODE_LABELS: Record<AttackCatalogEntry['attackMode'], string> = {
  base: '基础攻击',
  ranged: '远程攻击',
  thrown: '投掷攻击',
  offhand: '副手攻击',
  versatile: '双手伤害',
};

const HAND_MODE_LABELS: Record<AttackCatalogEntry['handMode'], string> = {
  none: '无持握差异',
  one_hand: '单手',
  two_hand: '双手',
  offhand: '副手',
};

const schoolColors: Record<string, string> = {
  evocation: '#e74c3c',
  necromancy: '#2c3e50',
  divination: '#95a5a6',
  abjuration: '#3498db',
  transmutation: '#27ae60',
  enchantment: '#9b59b6',
  illusion: '#8e44ad',
  conjuration: '#e67e22',
};

const selectedAttacks = computed<AttackCatalogEntry[]>(() => store.selectedAttacks);
const draggableSelectedAttacks = computed({
  get: () => selectedAttacks.value,
  set: (attacks: AttackCatalogEntry[]) => {
    store.reorderSelectedAttacks(attacks.map(attack => attack.catalogKey));
  },
});
const catalogAttacks = computed<AttackCatalogEntry[]>(() => store.attackCatalog);
const selectedAttackKeys = computed<string[]>(() => store.selectedAttackKeys);
const unarmedStrikes = computed<CharacterUnarmedStrike[]>(() => character.value?.unarmedStrikes ?? []);
type AttackPickerFilter = 'all' | 'selected' | 'unselected';

const attackPickerFilter = ref<AttackPickerFilter>('all');
const showAttackPicker = ref(false);
const showUnarmedEditor = ref(false);
const unarmedEditorError = ref('');
const expandedSpellId = ref<string | null>(null);
const collapsedGroups = ref<Record<number, boolean>>({});

const abilityOptions: Array<{ key: AbilityKey; label: string }> = [
  { key: 'str', label: '力量' },
  { key: 'dex', label: '敏捷' },
  { key: 'con', label: '体质' },
  { key: 'int', label: '智力' },
  { key: 'wis', label: '感知' },
  { key: 'cha', label: '魅力' },
];

const unarmedTagOptions: Array<{ key: UnarmedStrikeTagKey; label: string }> = [
  { key: 'none', label: UNARMED_STRIKE_TAG_LABELS.none },
  { key: 'natural_weapon', label: UNARMED_STRIKE_TAG_LABELS.natural_weapon },
  { key: 'unarmed_fighting', label: UNARMED_STRIKE_TAG_LABELS.unarmed_fighting },
  { key: 'martial_arts', label: UNARMED_STRIKE_TAG_LABELS.martial_arts },
  { key: 'tavern_brawler', label: UNARMED_STRIKE_TAG_LABELS.tavern_brawler },
  { key: 'astral_arms', label: UNARMED_STRIKE_TAG_LABELS.astral_arms },
  { key: 'custom', label: UNARMED_STRIKE_TAG_LABELS.custom },
];

const damageTypeOptions = Object.entries(UNARMED_DAMAGE_TYPE_LABELS).map(([key, label]) => ({
  key: key as UnarmedStrikeDamageType,
  label,
}));

const eventValue = (event: Event) => (event.target as HTMLInputElement | HTMLSelectElement).value;
const eventChecked = (event: Event) => (event.target as HTMLInputElement).checked;

const isModeActive = (key: AbilityKey) => character.value?.activeAttackModes.includes(key) ?? false;
const toggleMode = (key: AbilityKey) => store.toggleAttackMode(key);

const getLabel = (key: string) =>
  WEAPON_PROPERTIES[key as keyof typeof WEAPON_PROPERTIES]?.label || key;

const formatSigned = (value: number) => (value >= 0 ? `+${value}` : `${value}`);

const buildSection = (label: string, items: Array<string | null | undefined>): TooltipSection | null => {
  const filteredItems = items.filter((item): item is string => Boolean(item));
  return filteredItems.length ? { label, items: filteredItems } : null;
};

const formatAttackAmmo = (attack: AttackCatalogEntry) => {
  if (attack.ammoDisplay === 'hidden') return null;

  const ammoLabel = attack.ammoType ? `（${attack.ammoType}）` : '';
  if (attack.ammoDisplay === 'tracked') {
    return `弹药：${attack.ammoCount ?? 0}${ammoLabel}`;
  }

  return attack.ammoType ? `弹药：需弹药${ammoLabel}` : '弹药：需弹药';
};

const formatAttackBonusBreakdown = (attack: AttackCatalogEntry) => {
  const breakdown = attack.bonusBreakdown;
  const abilityLabel = ATTR_MAP[attack.abilityPath] || attack.abilityPath;
  const damageAbilityLabel =
    ATTR_MAP[attack.damageAbilityPath || attack.abilityPath] || attack.damageAbilityPath || attack.abilityPath;
  const proficiencyText = breakdown.proficiencyApplied
    ? `熟练 ${formatSigned(breakdown.proficiencyBonus)}`
    : '未熟练 +0';
  const damageText = breakdown.offhandDamagePenalty
    ? '副手攻击不加入正属性调整值'
    : `${damageAbilityLabel} ${formatSigned(breakdown.damageBonus)}`;

  return [
    `命中：${formatSigned(breakdown.hitBonus)} = ${abilityLabel} ${formatSigned(breakdown.abilityModifier)} + ${proficiencyText}`,
    `伤害：${formatSigned(breakdown.damageBonus)} = ${damageText}`,
  ];
};

const formatUnarmedTags = (attack: AttackCatalogEntry) => {
  if (!attack.unarmedTags?.length) return null;
  const labels = attack.unarmedTags.map(tag =>
    tag === 'custom' && attack.customTag?.trim()
      ? attack.customTag.trim()
      : UNARMED_STRIKE_TAG_LABELS[tag]
  );
  return labels.join(' / ');
};

const buildAttackTooltip = (attack: AttackCatalogEntry): TooltipData => {
  const sections = [
    buildSection('攻击路径', [
      `属性：${ATTR_MAP[attack.abilityPath] || attack.abilityPath}`,
      `模式：${ATTACK_MODE_LABELS[attack.attackMode]}`,
      `持握：${HAND_MODE_LABELS[attack.handMode]}`,
    ]),
    buildSection('加值拆分', formatAttackBonusBreakdown(attack)),
    buildSection('战术信息', [
      `射程：${attack.range}`,
      attack.properties.length ? `属性：${attack.properties.map(getLabel).join(' / ')}` : null,
      formatAttackAmmo(attack),
    ]),
    attack.sourceType === 'unarmed'
      ? buildSection('徒手打击', [
          `说明词条：${formatUnarmedTags(attack) || '无'}`,
          `攻击性质：${attack.isMagicAttack ? '魔法攻击' : '非魔法攻击'}`,
          '说明词条仅用于记录来源，不会自动改变命中、伤害或其他属性。',
        ])
      : null,
    buildSection('附加效果', [attack.specialText]),
  ].filter((section): section is TooltipSection => section !== null);

  return {
    title: attack.name,
    sections,
  };
};

const onTraitEnter = (traitKey: string, event: MouseEvent) => {
  const def = WEAPON_PROPERTIES[traitKey.toLowerCase() as keyof typeof WEAPON_PROPERTIES];
  if (def) {
    tooltipStore.show({ title: def.label, content: def.description }, event.clientX, event.clientY);
    return;
  }

  tooltipStore.show({ title: traitKey, content: '暂无详细规则描述' }, event.clientX, event.clientY);
};

const onTraitMove = (event: MouseEvent) => {
  tooltipStore.updatePosition(event.clientX, event.clientY);
};

const onTraitLeave = () => {
  tooltipStore.hide();
};

const onAttackEnter = (attack: AttackCatalogEntry, event: MouseEvent) => {
  tooltipStore.show(buildAttackTooltip(attack), event.clientX, event.clientY);
};

const onAttackMove = (event: MouseEvent) => {
  tooltipStore.updatePosition(event.clientX, event.clientY);
};

const onAttackLeave = () => {
  tooltipStore.hide();
};

const openAttackPicker = () => {
  showAttackPicker.value = true;
};

const closeAttackPicker = () => {
  showAttackPicker.value = false;
};

const openUnarmedEditor = () => {
  unarmedEditorError.value = '';
  showUnarmedEditor.value = true;
};

const closeUnarmedEditor = () => {
  showUnarmedEditor.value = false;
  unarmedEditorError.value = '';
};

const buildNewUnarmedStrike = (): CharacterUnarmedStrike => {
  const existingSignatures = new Set(unarmedStrikes.value.map(createUnarmedStrikeSignature));
  const tagCandidates: UnarmedStrikeTagKey[] = [
    'natural_weapon',
    'unarmed_fighting',
    'martial_arts',
    'tavern_brawler',
    'astral_arms',
  ];
  const diceCandidates: UnarmedStrikeDamageDice[] = ['1d4', '1d6', '1d8', '1d10', '1'];

  for (const tag of tagCandidates) {
    for (const dice of diceCandidates) {
      const candidate: CharacterUnarmedStrike = {
        id: `unarmed_${Date.now()}_${tag}_${dice}`,
        name: `徒手打击 ${unarmedStrikes.value.length + 1}`,
        tags: [tag],
        hitAbility: 'str',
        damageDice: dice,
        damageAbility: 'str',
        damageType: 'bludgeoning',
        isMagic: false,
      };

      if (!existingSignatures.has(createUnarmedStrikeSignature(candidate))) {
        return candidate;
      }
    }
  }

  return {
    id: `unarmed_${Date.now()}_custom`,
    name: `徒手打击 ${unarmedStrikes.value.length + 1}`,
    tags: ['custom'],
    customTag: `自定义 ${unarmedStrikes.value.length + 1}`,
    hitAbility: 'str',
    damageDice: '1',
    damageAbility: 'str',
    damageType: 'bludgeoning',
    isMagic: false,
  };
};

const addUnarmedStrike = () => {
  const created = store.addUnarmedStrike(buildNewUnarmedStrike());
  unarmedEditorError.value = created ? '' : '已经存在相同结果的徒手打击。';
};

const updateUnarmedStrike = (strike: CharacterUnarmedStrike, patch: Partial<CharacterUnarmedStrike>) => {
  const updated = store.updateUnarmedStrike(strike.id, patch);
  unarmedEditorError.value = updated ? '' : '已经存在相同结果的徒手打击，未保存本次修改。';
};

const deleteUnarmedStrike = (strikeId: string) => {
  store.deleteUnarmedStrike(strikeId);
  unarmedEditorError.value = '';
};

const setUnarmedTag = (strike: CharacterUnarmedStrike, tag: UnarmedStrikeTagKey) => {
  if (tag === 'none') {
    updateUnarmedStrike(strike, { tags: ['none'], customTag: undefined });
    return;
  }

  const activeTags = strike.tags.filter(item => item !== 'none');
  const nextTags = activeTags.includes(tag)
    ? activeTags.filter(item => item !== tag)
    : [...activeTags, tag];

  updateUnarmedStrike(strike, {
    tags: nextTags.length ? nextTags : ['none'],
    customTag: nextTags.includes('custom') ? strike.customTag : undefined,
  });
};

const isAttackSelected = (catalogKey: string) => selectedAttackKeys.value.includes(catalogKey);
const toggleAttackSelection = (catalogKey: string) => store.toggleAttackSelection(catalogKey);
const setAttackPickerFilter = (filter: AttackPickerFilter) => {
  attackPickerFilter.value = filter;
};

const filteredCatalogAttacks = computed<AttackCatalogEntry[]>(() => {
  if (attackPickerFilter.value === 'selected') {
    return catalogAttacks.value.filter(attack => isAttackSelected(attack.catalogKey));
  }

  if (attackPickerFilter.value === 'unselected') {
    return catalogAttacks.value.filter(attack => !isAttackSelected(attack.catalogKey));
  }

  return catalogAttacks.value;
});

const onAttackPickerKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeAttackPicker();
    closeUnarmedEditor();
  }
};

watch([showAttackPicker, showUnarmedEditor], ([isPickerOpen, isEditorOpen]) => {
  if (typeof window === 'undefined') return;

  if (isPickerOpen || isEditorOpen) {
    window.addEventListener('keydown', onAttackPickerKeydown);
    return;
  }

  window.removeEventListener('keydown', onAttackPickerKeydown);
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', onAttackPickerKeydown);
  }
});

const toggleSpellExpand = (id: string) => {
  expandedSpellId.value = expandedSpellId.value === id ? null : id;
};

const toggleGroupCollapse = (level: number) => {
  collapsedGroups.value[level] = !collapsedGroups.value[level];
};

const formatComponents = (components?: SpellComponents) => {
  if (!components) return '-';

  const parts: string[] = [];
  if (components.v) parts.push('V');
  if (components.s) parts.push('S');
  if (components.m) parts.push(`M (${components.m})`);
  return parts.join(', ');
};

const getAttackSaveInfo = (spell: SpellDefinition) => {
  if (spell.attackType === 'melee') return '近战法术攻击';
  if (spell.attackType === 'ranged') return '远程法术攻击';
  if (spell.attackType === 'save') return `${spell.saveAttr?.toUpperCase() || ''} 豁免`;
  if (spell.attackType === 'auto') return '自动命中';
  return null;
};

const handleSlotClick = (level: number, index: number, current: number) => {
  if (index < current) {
    store.updateSpellSlot(level, index);
    return;
  }

  store.updateSpellSlot(level, index + 1);
};

const handleLongRest = async () => {
  const confirmed = await feedback.confirm({
    title: '进行长休',
    message: '确定要进行长休吗？\n这会恢复生命值与法术位。',
    tone: 'warning',
    confirmText: '开始长休',
  });

  if (confirmed) {
    store.fullHeal();
    store.recoverAllSlots();
  }
};
</script>

<template>
  <div v-if="character" class="actions-panel">
    <div class="panel-column attacks-col">
      <div class="sec-header">
        <h3>攻击</h3>

        <div class="attr-toggles">
          <button
            class="btn-toggle unarmed-config-btn"
            data-test="open-unarmed-editor"
            type="button"
            title="编辑徒手打击"
            @click="openUnarmedEditor"
          >
            徒手
          </button>
          <button
            v-for="attr in extraAttributes"
            :key="attr.key"
            class="btn-toggle"
            :class="{ active: isModeActive(attr.key) }"
            :title="`开启/关闭 ${attr.label} 攻击路径`"
            @click="toggleMode(attr.key)"
          >
            {{ attr.short }}
          </button>
        </div>
      </div>

      <div class="attack-list">
        <draggable
          v-model="draggableSelectedAttacks"
          item-key="catalogKey"
          class="selected-attack-drag-list"
          handle=".attack-drag-handle"
          ghost-class="attack-ghost"
          drag-class="attack-dragging"
        >
          <template #item="{ element: attack }">
            <div
              class="attack-card"
              :data-test="`selected-attack-${attack.catalogKey}`"
              @mouseenter="onAttackEnter(attack, $event)"
              @mousemove="onAttackMove"
              @mouseleave="onAttackLeave"
            >
              <div class="row-main">
                <div class="attack-title">
                  <span class="attack-drag-handle" title="拖拽排序">≡</span>
                  <span class="atk-name">{{ attack.name }}</span>
                </div>
                <div class="header-right">
                  <button
                    class="btn-icon"
                    type="button"
                    title="移除"
                    @click.stop="toggleAttackSelection(attack.catalogKey)"
                  >
                    ✕
                  </button>
                  <span class="atk-hit">{{ attack.hit }}</span>
                </div>
              </div>
              <div class="row-sub">
                <div class="info-group">
                  <span class="atk-dmg">{{ attack.damage }}</span>
                  <span class="divider">|</span>
                  <span class="atk-range">{{ attack.range }}</span>
                </div>
                <div v-if="attack.properties.length" class="tags">
                  <span
                    v-for="property in attack.properties"
                    :key="property"
                    class="tag"
                    :title="property"
                    @mouseenter="onTraitEnter(property, $event)"
                    @mousemove="onTraitMove"
                    @mouseleave="onTraitLeave"
                  >
                    {{ getLabel(property) }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </draggable>

        <button
          class="attack-card is-virtual add-card"
          data-test="open-attack-picker"
          type="button"
          @click="openAttackPicker"
        >
          <div class="row-main">
            <span class="atk-name">+ 添加攻击项</span>
            <div class="header-right">
              <span class="atk-hit add-hit">{{ selectedAttackKeys.length }}/{{ catalogAttacks.length }}</span>
            </div>
          </div>
          <div class="row-sub">
            <div class="info-group">
              <span class="atk-range">打开候选浮窗，自行选择要展示在攻击栏中的项目。</span>
            </div>
          </div>
        </button>

        <div v-if="selectedAttacks.length === 0" class="empty-tip">
          当前没有已选攻击项，请从上方入口添加。
        </div>
      </div>
    </div>

    <div class="panel-column spells-col">
      <div class="spell-dashboard-mini">
        <div class="mini-stat">DC <strong>{{ store.calculatedSpellSaveDC }}</strong></div>
        <div class="mini-stat">Atk <strong>+{{ store.calculatedSpellAttackMod }}</strong></div>
        <button class="btn-rest-mini" type="button" title="长休：恢复生命值和法术位" @click="handleLongRest">
          休
        </button>
      </div>

      <div class="spell-list-container">
        <div v-if="store.battleGroups.length === 0" class="empty-battle-spells">
          <p>未准备任何法术</p>
          <small>点击顶部“法术书”进行准备</small>
        </div>

        <div v-else class="spell-groups">
          <div v-for="group in store.battleGroups" :key="group.level" class="spell-group">
            <div class="group-header" @click="toggleGroupCollapse(group.level)">
              <span class="fold-arrow">{{ collapsedGroups[group.level] ? '▸' : '▾' }}</span>
              <span class="group-label">{{ group.label }}</span>

              <div v-if="group.slots" class="slot-tracker" @click.stop>
                <div
                  v-for="(_, index) in group.slots.max"
                  :key="index"
                  class="slot-dot"
                  :class="{ filled: index < group.slots.current }"
                  @click="handleSlotClick(group.level, index, group.slots.current)"
                ></div>
              </div>
            </div>

            <div v-show="!collapsedGroups[group.level]" class="group-items">
              <div
                v-for="spell in group.spells"
                :key="spell.id"
                class="spell-card"
                :style="{ borderLeftColor: schoolColors[spell.school] || '#ccc' }"
                @click="toggleSpellExpand(spell.id)"
              >
                <div class="card-top">
                  <div class="spell-name">
                    {{ spell.name }}
                    <span v-if="spell.ritual" class="ritual-badge" title="可作为仪式施放">仪式</span>
                    <span v-if="spell.concentration" class="conc-badge" title="专注">C</span>
                  </div>

                  <div class="spell-meta">
                    <span v-if="['melee', 'ranged'].includes(spell.attackType)" class="combat-tag atk">
                      +{{ store.calculatedSpellAttackMod }}
                    </span>
                    <span v-else-if="spell.attackType === 'save'" class="combat-tag save">
                      DC{{ store.calculatedSpellSaveDC }}
                    </span>
                  </div>
                </div>

                <div v-if="expandedSpellId === spell.id" class="card-detail" @click.stop>
                  <div class="spell-meta-header">
                    <span class="spell-school">
                      {{ spell.level === 0 ? '戏法' : `${spell.level} 环` }}
                      {{ getSchoolLabel(spell.school) }}
                    </span>
                    <div class="meta-tags">
                      <span v-if="spell.ritual" class="tag ritual">仪式</span>
                      <span v-if="spell.concentration" class="tag conc">专注</span>
                    </div>
                  </div>

                  <div class="spell-stats-grid">
                    <div class="stat-cell">
                      <span class="label">施法时间</span>
                      <span class="val">{{ spell.castingTime }}</span>
                    </div>
                    <div class="stat-cell">
                      <span class="label">距离</span>
                      <span class="val">{{ spell.range }}</span>
                    </div>
                    <div class="stat-cell">
                      <span class="label">成分</span>
                      <span class="val">{{ formatComponents(spell.components) }}</span>
                    </div>
                    <div class="stat-cell">
                      <span class="label">持续时间</span>
                      <span class="val">{{ spell.duration }}</span>
                    </div>
                  </div>

                  <div v-if="getAttackSaveInfo(spell) || spell.damage" class="combat-line">
                    <span v-if="getAttackSaveInfo(spell)" class="combat-badge type">
                      {{ getAttackSaveInfo(spell) }}
                    </span>

                    <span v-if="spell.damage" class="combat-badge dmg">
                      <strong>
                        <span v-if="spell.cantripScaling">
                          {{ calculateCantripDamage(spell.damage, character.profile.level) }}
                        </span>
                        <span v-else>{{ spell.damage }}</span>
                      </strong>
                      {{ spell.damageType }}
                    </span>
                  </div>

                  <div class="desc-divider"></div>
                  <div class="desc-text" v-html="spell.description"></div>

                  <div v-if="spell.scaling" class="scaling">
                    <strong>升环效果:</strong> {{ spell.scaling }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="showAttackPicker"
        class="attack-picker-overlay"
        data-test="attack-picker-overlay"
        @click.self="closeAttackPicker"
      >
        <div class="attack-picker-modal" role="dialog" aria-modal="true" aria-label="攻击项选择器">
          <div class="attack-picker-header">
            <div class="attack-picker-title-group">
              <h3>候选攻击项</h3>
              <p>{{ selectedAttackKeys.length }} / {{ catalogAttacks.length }} 已选显示项</p>
            </div>
            <button
              class="picker-close"
              data-test="attack-picker-close"
              type="button"
              @click="closeAttackPicker"
            >
              ✕
            </button>
          </div>

          <div class="attack-picker-subtitle">
            悬停查看次要信息，点击按钮添加或移除攻击项。
          </div>

          <div class="attack-picker-tools">
            <button
              class="unarmed-editor-link"
              data-test="picker-open-unarmed-editor"
              type="button"
              @click="openUnarmedEditor"
            >
              编辑徒手打击
            </button>
          </div>

          <div class="attack-picker-filters">
            <button
              class="filter-chip"
              :class="{ active: attackPickerFilter === 'all' }"
              data-test="picker-filter-all"
              type="button"
              @click="setAttackPickerFilter('all')"
            >
              全部
            </button>
            <button
              class="filter-chip"
              :class="{ active: attackPickerFilter === 'selected' }"
              data-test="picker-filter-selected"
              type="button"
              @click="setAttackPickerFilter('selected')"
            >
              已选
            </button>
            <button
              class="filter-chip"
              :class="{ active: attackPickerFilter === 'unselected' }"
              data-test="picker-filter-unselected"
              type="button"
              @click="setAttackPickerFilter('unselected')"
            >
              未选
            </button>
          </div>

          <div v-if="filteredCatalogAttacks.length === 0" class="empty-tip picker-empty">
            当前没有可用攻击项。
          </div>

          <div v-else class="picker-list attack-picker-list">
          <div
            v-for="attack in filteredCatalogAttacks"
            :key="attack.catalogKey"
            class="attack-card picker-card"
            :class="{ selected: isAttackSelected(attack.catalogKey) }"
            :data-test="`picker-card-${attack.catalogKey}`"
            @mouseenter="onAttackEnter(attack, $event)"
            @mousemove="onAttackMove"
            @mouseleave="onAttackLeave"
            @click="toggleAttackSelection(attack.catalogKey)"
          >
              <div class="row-main">
                <span class="atk-name">{{ attack.name }}</span>
                <div class="header-right">
                  <button
                    class="picker-action"
                    :class="{ active: isAttackSelected(attack.catalogKey) }"
                    :data-test="`picker-action-${attack.catalogKey}`"
                    type="button"
                    @click.stop="toggleAttackSelection(attack.catalogKey)"
                  >
                    {{ isAttackSelected(attack.catalogKey) ? '已选' : '添加' }}
                  </button>
                  <span class="atk-hit">{{ attack.hit }}</span>
                </div>
              </div>
              <div class="row-sub">
                <div class="info-group">
                  <span class="atk-dmg">{{ attack.damage }}</span>
                  <span class="divider">|</span>
                  <span class="atk-range">{{ attack.range }}</span>
                </div>
                <div v-if="attack.properties.length" class="tags">
                  <span
                    v-for="property in attack.properties"
                    :key="property"
                    class="tag"
                    :title="property"
                    @click.stop
                    @mouseenter="onTraitEnter(property, $event)"
                    @mousemove="onTraitMove"
                    @mouseleave="onTraitLeave"
                  >
                    {{ getLabel(property) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="showUnarmedEditor"
        class="attack-picker-overlay"
        data-test="unarmed-editor-overlay"
        @click.self="closeUnarmedEditor"
      >
        <div class="unarmed-editor-modal" role="dialog" aria-modal="true" aria-label="徒手打击设置">
          <div class="attack-picker-header">
            <div class="attack-picker-title-group">
              <h3>徒手打击设置</h3>
              <p>词条只是说明来源，不会自动改变命中、伤害或其他属性。</p>
            </div>
            <button
              class="picker-close"
              data-test="unarmed-editor-close"
              type="button"
              @click="closeUnarmedEditor"
            >
              ✕
            </button>
          </div>

          <div class="unarmed-editor-body">
            <div v-if="unarmedEditorError" class="unarmed-error">
              {{ unarmedEditorError }}
            </div>

            <div
              v-for="strike in unarmedStrikes"
              :key="strike.id"
              class="unarmed-row"
              data-test="unarmed-editor-row"
            >
              <div class="unarmed-row-header">
                <label class="field name-field">
                  <span>名称</span>
                  <input
                    :value="strike.name"
                    type="text"
                    @input="updateUnarmedStrike(strike, { name: eventValue($event) })"
                  />
                </label>
                <button
                  class="danger-link"
                  type="button"
                  @click="deleteUnarmedStrike(strike.id)"
                >
                  删除
                </button>
              </div>

              <div class="unarmed-tags">
                <button
                  v-for="tag in unarmedTagOptions"
                  :key="tag.key"
                  class="tag-choice"
                  :class="{ active: strike.tags.includes(tag.key) }"
                  type="button"
                  @click="setUnarmedTag(strike, tag.key)"
                >
                  {{ tag.label }}
                </button>
              </div>

              <label v-if="strike.tags.includes('custom')" class="field">
                <span>自定义词条</span>
                <input
                  :value="strike.customTag || ''"
                  type="text"
                  placeholder="输入自定义说明词条"
                  @input="updateUnarmedStrike(strike, { customTag: eventValue($event) })"
                />
              </label>

              <div class="unarmed-grid">
                <label class="field">
                  <span>命中属性</span>
                  <select
                    :value="strike.hitAbility"
                    @change="updateUnarmedStrike(strike, { hitAbility: eventValue($event) as AbilityKey })"
                  >
                    <option v-for="ability in abilityOptions" :key="ability.key" :value="ability.key">
                      {{ ability.label }}
                    </option>
                  </select>
                </label>

                <label class="field">
                  <span>伤害骰</span>
                  <select
                    :value="strike.damageDice"
                    @change="updateUnarmedStrike(strike, { damageDice: eventValue($event) as UnarmedStrikeDamageDice })"
                  >
                    <option v-for="dice in UNARMED_DAMAGE_DICE_OPTIONS" :key="dice" :value="dice">
                      {{ dice === '1' ? '1点' : dice }}
                    </option>
                  </select>
                </label>

                <label class="field">
                  <span>伤害加值</span>
                  <select
                    :value="strike.damageAbility"
                    @change="updateUnarmedStrike(strike, { damageAbility: eventValue($event) as AbilityKey })"
                  >
                    <option v-for="ability in abilityOptions" :key="ability.key" :value="ability.key">
                      {{ ability.label }}
                    </option>
                  </select>
                </label>

                <label class="field">
                  <span>伤害类型</span>
                  <select
                    :value="strike.damageType"
                    @change="updateUnarmedStrike(strike, { damageType: eventValue($event) as UnarmedStrikeDamageType })"
                  >
                    <option v-for="damageType in damageTypeOptions" :key="damageType.key" :value="damageType.key">
                      {{ damageType.label }}
                    </option>
                  </select>
                </label>
              </div>

              <label class="magic-toggle">
                <input
                  :checked="strike.isMagic"
                  type="checkbox"
                  @change="updateUnarmedStrike(strike, { isMagic: eventChecked($event) })"
                />
                <span>视为魔法攻击</span>
              </label>
            </div>

            <button
              class="add-unarmed-btn"
              data-test="add-unarmed-strike"
              type="button"
              @click="addUnarmedStrike"
            >
              + 新增徒手打击
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.actions-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 0.5rem;
  min-height: 450px;
  align-items: start;
}

.panel-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sec-header {
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 4px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    margin: 0;
    font-size: 0.95rem;
    color: #2c3e50;
    font-weight: bold;
  }
}

.attr-toggles {
  display: flex;
  gap: 4px;

  .btn-toggle {
    border: 1px solid #dcdcdc;
    background: #fdfdfd;
    color: #95a5a6;
    border-radius: 3px;
    font-size: 0.7rem;
    padding: 1px 6px;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: bold;

    &:hover {
      background: #ecf0f1;
      color: #7f8c8d;
    }

    &.active {
      background: #34495e;
      color: #fff;
      border-color: #2c3e50;
    }
  }
}

.attack-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.selected-attack-drag-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.attack-card {
  background: #fff;
  border: 1px solid #dcdcdc;
  border-left: 3px solid #c0392b;
  border-radius: 3px;
  padding: 4px 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: all 0.2s;

  .row-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2px;
  }

  .row-sub {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 0.75rem;
    color: #34495e;
  }

  .atk-name {
    font-weight: bold;
    font-size: 0.9rem;
    color: #2c3e50;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .attack-title {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .attack-drag-handle {
    color: #95a5a6;
    cursor: grab;
    font-size: 0.9rem;
    font-weight: 900;
    line-height: 1;
    user-select: none;

    &:active {
      cursor: grabbing;
    }
  }

  .header-right {
    display: flex;
    gap: 6px;
    align-items: center;
    flex-shrink: 0;
  }

  .atk-hit {
    font-weight: bold;
    font-size: 0.9rem;
    color: #fff;
    background: #c0392b;
    padding: 0 5px;
    border-radius: 3px;
    min-width: 24px;
    text-align: center;
  }

  .atk-dmg {
    font-weight: bold;
  }

  .atk-range {
    color: #7f8c8d;
  }

  .divider {
    color: #dcdcdc;
    margin: 0 4px;
  }

  .btn-icon {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 0.85rem;
    opacity: 0.45;

    &:hover {
      opacity: 1;
    }
  }
}

.info-group {
  min-width: 0;
}

.tags {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.tag {
  background: #ecf0f1;
  color: #7f8c8d;
  padding: 0 3px;
  border-radius: 2px;
  font-size: 0.65rem;
}

.add-card {
  width: 100%;
  text-align: left;
  cursor: pointer;
  border-left-color: #34495e;
  background: linear-gradient(135deg, #f9fbfc 0%, #eef3f6 100%);

  .add-hit {
    background: #34495e;
  }
}

.empty-tip {
  font-size: 0.75rem;
  color: #bdc3c7;
  text-align: center;
  padding: 10px;
}

.attack-picker-overlay {
  position: fixed;
  inset: 0;
  z-index: 2100;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background: rgba(17, 24, 39, 0.58);
  backdrop-filter: blur(4px);
}

.attack-picker-modal {
  width: min(860px, 100%);
  max-height: min(78vh, 920px);
  background: #f8fbfd;
  border: 1px solid rgba(52, 73, 94, 0.16);
  border-radius: 14px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.attack-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 18px 20px 14px;
  background: linear-gradient(135deg, #f5f8fb 0%, #e8eef4 100%);
  border-bottom: 1px solid rgba(52, 73, 94, 0.12);
}

.attack-picker-title-group {
  h3 {
    margin: 0;
    font-size: 1.02rem;
    color: #22313f;
  }

  p {
    margin: 4px 0 0;
    font-size: 0.8rem;
    color: #5d6d7e;
  }
}

.picker-close {
  border: none;
  background: rgba(255, 255, 255, 0.85);
  color: #34495e;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;

  &:hover {
    background: #fff;
  }
}

.attack-picker-subtitle {
  padding: 12px 20px 0;
  font-size: 0.8rem;
  color: #66788a;
}

.attack-ghost {
  opacity: 0.45;
  background: #eef3f6;
}

.attack-dragging {
  cursor: grabbing;
}

.attack-picker-tools {
  padding: 10px 20px 0;
}

.unarmed-editor-link,
.add-unarmed-btn {
  border: 1px solid #c9b458;
  background: #fff8dc;
  color: #6f4e00;
  border-radius: 4px;
  font-size: 0.76rem;
  font-weight: 800;
  padding: 5px 10px;
  cursor: pointer;

  &:hover {
    background: #fff1b8;
  }
}

.attack-picker-filters {
  display: flex;
  gap: 8px;
  padding: 12px 20px 0;
  flex-wrap: wrap;
}

.filter-chip {
  border: 1px solid #d0d7de;
  background: #fff;
  color: #34495e;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f6f8;
  }

  &.active {
    background: #34495e;
    border-color: #34495e;
    color: #fff;
  }
}

.picker-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.attack-picker-list {
  padding: 14px 20px 20px;
  overflow-y: auto;
}

.picker-empty {
  padding: 24px 20px 28px;
}

.picker-card {
  border-left-color: #7f8c8d;
  cursor: pointer;

  &.selected {
    border-left-color: #34495e;
    background: linear-gradient(135deg, #ffffff 0%, #eef4f8 100%);
  }
}

.picker-action {
  border: 1px solid #d0d7de;
  background: #fff;
  color: #34495e;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  cursor: pointer;

  &.active {
    background: #34495e;
    border-color: #34495e;
    color: #fff;
  }
}

.unarmed-config-btn {
  color: #7f8c8d !important;
  border-color: #dcdcdc !important;
  background: #fdfdfd !important;

  &:hover {
    background: #ecf0f1 !important;
    color: #7f8c8d !important;
  }
}

.unarmed-editor-modal {
  width: min(760px, 100%);
  max-height: min(84vh, 920px);
  background: #f8fbfd;
  border: 1px solid rgba(52, 73, 94, 0.16);
  border-radius: 14px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.unarmed-editor-body {
  padding: 14px 20px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.unarmed-error {
  border: 1px solid rgba(192, 57, 43, 0.25);
  background: rgba(192, 57, 43, 0.08);
  color: #922b21;
  border-radius: 5px;
  padding: 8px 10px;
  font-size: 0.78rem;
  font-weight: 700;
}

.unarmed-row {
  border: 1px solid #dfe6ee;
  border-left: 3px solid #c9b458;
  background: #fff;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.unarmed-row-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;

  span {
    font-size: 0.68rem;
    font-weight: 800;
    color: #607080;
  }

  input,
  select {
    border: 1px solid #d0d7de;
    background: #fff;
    color: #2c3e50;
    border-radius: 4px;
    min-height: 30px;
    padding: 4px 7px;
    font-size: 0.82rem;
  }
}

.name-field {
  flex: 1;
}

.danger-link {
  border: none;
  background: transparent;
  color: #c0392b;
  font-size: 0.76rem;
  font-weight: 800;
  cursor: pointer;
  padding: 6px 0;
}

.unarmed-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag-choice {
  border: 1px solid #d0d7de;
  background: #f8fafc;
  color: #34495e;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 4px 8px;
  cursor: pointer;

  &.active {
    background: #4b2d73;
    border-color: #c9b458;
    color: #f4d06f;
  }
}

.unarmed-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.magic-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 800;
  color: #34495e;
}

.add-unarmed-btn {
  align-self: flex-start;
}

.spell-dashboard-mini {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  height: 28px;
  padding: 0 8px;
  background: #f1f3f5;
  border-radius: 4px;
  border: 1px solid #e0e0e0;

  .mini-stat {
    font-size: 0.8rem;
    color: #555;

    strong {
      color: #2c3e50;
      font-size: 0.9rem;
    }
  }

  .btn-rest-mini {
    border: none;
    background: #34495e;
    color: white;
    border-radius: 3px;
    cursor: pointer;
    padding: 2px 6px;
    font-size: 0.8rem;

    &:hover {
      background: #2c3e50;
    }
  }
}

.spell-list-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.spell-group {
  margin-bottom: 8px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fdfdfd;
  border-bottom: 1px solid #eee;
  padding: 6px 8px;
  margin-bottom: 4px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;

  &:hover {
    background: #f1f3f5;
  }

  .fold-arrow {
    font-size: 0.7rem;
    color: #bdc3c7;
    width: 12px;
    display: inline-block;
    text-align: center;
  }

  .group-label {
    font-weight: bold;
    font-size: 0.8rem;
    color: #7f8c8d;
  }

  .slot-tracker {
    display: flex;
    gap: 3px;
  }

  .slot-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid #9b59b6;
    cursor: pointer;
    background: #fff;

    &.filled {
      background: #9b59b6;
    }

    &:hover {
      transform: scale(1.2);
    }
  }
}

.spell-card {
  background: #fff;
  border: 1px solid #eee;
  border-left-width: 3px;
  border-radius: 3px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }

  .card-top {
    padding: 4px 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .spell-name {
    font-weight: 600;
    font-size: 0.9rem;
    color: #34495e;
    display: flex;
    align-items: center;
    gap: 4px;

    .conc-badge {
      background: #34495e;
      color: #fff;
      font-size: 0.6rem;
      padding: 0 3px;
      border-radius: 2px;
      height: 14px;
      line-height: 14px;
    }

    .ritual-badge {
      background: rgba(22, 160, 133, 0.12);
      border: 1px solid rgba(22, 160, 133, 0.35);
      color: #117864;
      font-size: 0.6rem;
      font-weight: 800;
      padding: 0 4px;
      border-radius: 2px;
      height: 15px;
      line-height: 13px;
    }
  }

  .combat-tag {
    font-size: 0.75rem;
    font-weight: bold;
    padding: 1px 4px;
    border-radius: 3px;

    &.atk {
      color: #c0392b;
      background: rgba(192, 57, 43, 0.1);
    }

    &.save {
      color: #fff;
      background: #95a5a6;
    }
  }
}

.card-detail {
  padding: 10px;
  border-top: 1px dashed #eee;
  background: #fdfdfd;
  font-size: 0.85rem;
  color: #555;
  cursor: default;

  .spell-meta-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-style: italic;
    color: #999;
    font-size: 0.8rem;
  }

  .meta-tags {
    display: flex;
    gap: 4px;

    .tag {
      font-size: 0.7rem;
      padding: 1px 4px;
      border-radius: 2px;
      font-style: normal;
      font-weight: bold;

      &.ritual {
        background: rgba(22, 160, 133, 0.12);
        color: #117864;
        border: 1px solid rgba(22, 160, 133, 0.35);
      }

      &.conc {
        background: #e67e22;
        color: #fff;
      }
    }
  }

  .spell-stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 12px;
    background: #f8f9fa;
    padding: 8px;
    border-radius: 4px;
    margin-bottom: 10px;
    border: 1px solid #eee;

    .stat-cell {
      display: flex;
      flex-direction: column;
    }

    .label {
      font-size: 0.65rem;
      color: #95a5a6;
      font-weight: bold;
      text-transform: uppercase;
    }

    .val {
      font-size: 0.8rem;
      color: #2c3e50;
      font-weight: 600;
    }
  }

  .combat-line {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 10px;
  }

  .combat-badge {
    font-size: 0.75rem;
    padding: 2px 6px;
    border-radius: 3px;
    font-weight: bold;

    &.type {
      background: #34495e;
      color: #fff;
    }

    &.dmg {
      background: #c0392b;
      color: #fff;
    }
  }

  .desc-divider {
    height: 1px;
    background: #eee;
    margin-bottom: 8px;
  }

  .desc-text {
    line-height: 1.5;
    color: #555;
    margin-bottom: 8px;
  }

  .scaling {
    padding-top: 8px;
    border-top: 1px dashed #eee;
    font-size: 0.8rem;
    color: #7f8c8d;

    strong {
      color: #555;
    }
  }
}

.empty-battle-spells {
  text-align: center;
  color: #bdc3c7;
  padding: 40px 20px;
  border: 2px dashed #eee;
  border-radius: 6px;
  margin-top: 20px;

  p {
    margin: 0 0 5px 0;
    font-weight: bold;
  }

  small {
    font-size: 0.75rem;
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 720px) {
  .attack-picker-overlay {
    padding: 12px;
  }

  .attack-picker-modal {
    max-height: 86vh;
  }

  .unarmed-editor-modal {
    max-height: 88vh;
  }

  .unarmed-grid {
    grid-template-columns: 1fr 1fr;
  }

  .attack-picker-header {
    align-items: flex-start;
  }

  .picker-close {
    flex-shrink: 0;
  }
}
</style>
