<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { formatCost } from '../../utils/currencyUtils';
import type { ItemCost, ItemDescriptionBlock, ShopCatalogData } from '../../types/Library';
import { getSchoolLabel } from '../../data/rules/dndRules';
import { DAMAGE_TYPES } from '../../data/rules/damageTypes';
import { WEAPON_PROPERTIES } from '../../data/rules/weaponProperties';
import { WEAPON_CAT_MAP, ARMOR_TYPE_MAP } from '../../data/rules/proficiencies'
import { ITEM_TYPE_MAP } from '../../data/rules/dndRules';
import { getTooltipViewportMaxHeight, getTooltipViewportPosition } from '../../stores/tooltip';
import { formatContainerCapacity } from '../../utils/containerCapacity';
import {
  formatMagicItemName,
  formatMagicTraitDamage,
  formatMagicTraitMeta,
  getMagicInventoryStyle,
  resolveMagicTraitsForItem,
} from '../../utils/magicItems';
import { getRuntimeSpellById } from '../../data/dataPacks/runtimeDataPacks';
import ItemDescriptionRenderer from '../common/ItemDescriptionRenderer.vue';
import type { ItemMagicDefinition } from '../../types/Library';

type TooltipItemType = 'item' | 'spell';

type SpellComponents = {
  v?: boolean;
  s?: boolean;
  m?: string | null;
};

type TooltipItem = {
  id?: string;
  name: string;
  type?: string;
  category?: string;
  displayCategory?: string;
  displaySubcategory?: string;
  armorType?: string;
  ac?: number;
  dexBonusMax?: number | null;
  strReq?: number;
  stealthDis?: boolean;
  damage?: string;
  damageType?: string;
  range?: string | number;
  properties?: string[];
  versatileDamage?: string;
  weight?: number;
  capacityWeight?: number;
  capacityVolume?: string;
  cost?: ItemCost;
  description?: string;
  descriptionBlocks?: ItemDescriptionBlock[];
  shopCatalog?: ShopCatalogData;
  magic?: ItemMagicDefinition;
  level?: number;
  school?: string;
  ritual?: boolean;
  concentration?: boolean;
  castingTime?: string;
  components?: SpellComponents;
  duration?: string;
  attackType?: 'melee' | 'ranged' | 'save' | 'auto' | 'none';
  saveAttr?: string;
  scaling?: string;
};

const props = defineProps<{
  item: TooltipItem;
  position: { x: number; y: number };
  type: TooltipItemType; // 显式区分类型
}>();

const tooltipRef = ref<HTMLElement | null>(null);
const tooltipSize = ref({ width: 320, height: 0 });

const measureTooltip = () => {
  const rect = tooltipRef.value?.getBoundingClientRect();
  if (!rect) return;

  tooltipSize.value = {
    width: rect.width || 320,
    height: rect.height || 0
  };
};

const measureAfterRender = async () => {
  await nextTick();
  measureTooltip();
};

watch(
  () => [props.item.name, props.position.x, props.position.y, props.type],
  () => {
    void measureAfterRender();
  },
  { flush: 'post', immediate: true }
);

const onWindowResize = () => {
  measureTooltip();
};

onMounted(() => {
  window.addEventListener('resize', onWindowResize);
  void measureAfterRender();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize);
});

const tooltipStyle = computed(() => {
  if (typeof window === 'undefined') {
    return {
      top: `${props.position.y}px`,
      left: `${props.position.x}px`
    };
  }

  const safePosition = getTooltipViewportPosition({
    x: props.position.x,
    y: props.position.y,
    tooltipWidth: tooltipSize.value.width,
    tooltipHeight: tooltipSize.value.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    offset: 0,
    padding: 12
  });

  return {
    top: `${safePosition.top}px`,
    left: `${safePosition.left}px`,
    maxHeight: `${getTooltipViewportMaxHeight(window.innerHeight)}px`
  };
});

// ==========================================
// ✅ 新增：辅助计算函数
// ==========================================

// 获取物品右上角的子类型标签
const subTypeLabel = computed(() => {
  const i = props.item;
    if (props.type === 'spell') return '法术';
  if (i.type === 'weapon') return WEAPON_CAT_MAP[i.category ?? ''] || '武器';
  if (i.type === 'armor') return ARMOR_TYPE_MAP[i.armorType ?? ''] || '防具';
  return ITEM_TYPE_MAP[i.type ?? ''] || '物品';
});

// 获取伤害类型的定义（颜色、中文名）
const getDamageDef = (key: string) => DAMAGE_TYPES[key as keyof typeof DAMAGE_TYPES] || DAMAGE_TYPES.damage_none;

// 获取武器属性的定义
const getPropDef = (key: string) => WEAPON_PROPERTIES[key as keyof typeof WEAPON_PROPERTIES];

// 格式化 AC 显示字符串
const formatAC = (i: TooltipItem) => {
  if (i.armorType === 'shield') return `+${i.ac} 护甲等级`;
  
  let text = `${i.ac}`;
  if (i.dexBonusMax === undefined || i.dexBonusMax === null) {
    // 轻甲：AC + 敏捷
    text += ' + 敏捷调整值';
  } else if (i.dexBonusMax > 0) {
    // 中甲：AC + 敏捷 (max 2)
    text += ` + 敏捷调整值 (最大 ${i.dexBonusMax})`;
  } 
  // 重甲：仅 AC
  return text;
};

// --- 移植过来的展示辅助函数 ---

const formatComponents = (comps?: SpellComponents) => {
  if (!comps) return '-';
  const parts = [];
  if (comps.v) parts.push('V');
  if (comps.s) parts.push('S');
  if (comps.m) parts.push(`M (${comps.m})`);
  return parts.join(', ');
};

const displayCost = computed(() => formatCost(props.item.cost));

const containerCapacity = computed(() =>
  props.item.type === 'container' ? formatContainerCapacity(props.item) : ''
);

const schoolLabel = computed(() => getSchoolLabel(props.item.school ?? ''));

const attackSaveInfo = computed(() => {
  const s = props.item;
  if (s.attackType === 'melee') return '近战法术攻击';
  if (s.attackType === 'ranged') return '远程法术攻击';
  if (s.attackType === 'save') return `${s.saveAttr?.toUpperCase() || ''} 豁免`;
  if (s.attackType === 'auto') return '自动命中';
  return null;
});

const itemHeaderStyle = computed(() =>
  props.type === 'item' ? getMagicInventoryStyle(props.item) : undefined
);

const displayName = computed(() =>
  props.type === 'item' ? formatMagicItemName(props.item) : props.item.name
);

const shouldPreferPlainDescription = computed(() =>
  props.type === 'item' && Boolean(props.item.id?.includes(':')) && !props.item.shopCatalog
);

const magicTraits = computed(() =>
  props.type === 'item' ? resolveMagicTraitsForItem(props.item) : []
);

const getMagicTraitSpellName = (spellId?: string) =>
  spellId ? getRuntimeSpellById(spellId)?.name ?? spellId : '';
</script>

<template>
  <div 
    ref="tooltipRef"
    class="item-tooltip-card"
    :style="tooltipStyle"
  >
    <div class="card-header" :class="{ magic: type === 'item' && item.magic?.isMagic }" :style="itemHeaderStyle">
      <div class="card-title">{{ displayName }}</div>
      <div class="card-subtitle">{{ subTypeLabel }}</div>
    </div>
    
    <div class="card-body" v-if="type === 'item'">
      
      <div v-if="item.type === 'weapon'" class="combat-stats-section">
        <div class="stat-row-visual">
          <span class="label">伤害</span>
          <div class="value-group" v-if="item.damage">
            <span class="damage-text">{{ item.damage }}</span>
            <span 
              class="damage-tag"
              :style="{ backgroundColor: getDamageDef(item.damageType ?? '').color }"
            >
              {{ getDamageDef(item.damageType ?? '').label.split(' ')[0] }}
            </span>
          </div>
          <span v-else class="text-muted">-</span>
        </div>
        
        <div class="stat-row-visual" v-if="item.range">
          <span class="label">射程</span>
          <span>{{ item.range }} 尺</span>
        </div>

        <div class="tags-container" v-if="item.properties && item.properties.length">
          <span 
            v-for="propKey in item.properties" 
            :key="propKey"
            class="prop-capsule"
          >
            {{ getPropDef(propKey)?.label || propKey }}
          </span>
        </div>
        
        <div class="extra-info" v-if="item.versatileDamage">
          <small>双手持用: {{ item.versatileDamage }} 伤害</small>
        </div>
      </div>

      <div v-if="item.type === 'armor'" class="combat-stats-section">
        <div class="stat-row-visual">
          <span class="label">AC</span>
          <span class="highlight-val">{{ formatAC(item) }}</span>
        </div>
        
        <div class="stat-row-visual" v-if="item.strReq">
          <span class="label">力量要求</span>
          <span>{{ item.strReq }}</span>
        </div>
        
        <div class="warning-box" v-if="item.stealthDis">
          <span class="icon">⚠️</span> 隐匿检定具有劣势
        </div>
      </div>

      <div class="divider"></div>

      <div class="stat-row">
        <span>重量: {{ item.weight }} lb</span>
        <span class="gold">{{ displayCost }}</span>
      </div>

      <div v-if="item.type === 'container'" class="stat-row capacity-row">
        <span>容量: {{ containerCapacity }}</span>
      </div>

      <div v-if="magicTraits.length > 0" class="magic-traits-section">
        <div class="magic-traits-title">附魔词条</div>
        <div v-for="trait in magicTraits" :key="trait.id" class="magic-trait-card">
          <div class="trait-head">
            <strong>{{ trait.name }}</strong>
            <span>{{ formatMagicTraitMeta(trait) }}</span>
          </div>
          <p v-if="trait.description" class="preserve-user-lines">{{ trait.description }}</p>
          <p v-if="trait.type === 'spell' && trait.spellId">
            法术：{{ getMagicTraitSpellName(trait.spellId) }}
          </p>
          <p v-if="trait.spellExtraDescription" class="preserve-user-lines">{{ trait.spellExtraDescription }}</p>
          <p v-if="formatMagicTraitDamage(trait)" class="trait-damage">
            伤害：{{ formatMagicTraitDamage(trait) }}
          </p>
        </div>
      </div>
      
      <ItemDescriptionRenderer
        :description="item.description"
        :blocks="item.descriptionBlocks"
        :prefer-plain-description="shouldPreferPlainDescription"
      />
    </div>

    <div class="card-body" v-if="type === 'spell'">
      <div class="spell-meta-header">
        <span class="spell-school">
          {{ item.level === 0 ? '戏法' : `${item.level}环` }} 
          {{ schoolLabel }}系
        </span>
        <div class="meta-tags">
          <span v-if="item.ritual" class="tag ritual">仪式</span>
          <span v-if="item.concentration" class="tag conc">专注</span>
        </div>
      </div>

      <div class="spell-stats-grid">
        <div class="stat-cell">
          <span class="label">施法时间</span>
          <span class="val">{{ item.castingTime }}</span>
        </div>
        <div class="stat-cell">
          <span class="label">距离</span>
          <span class="val">{{ item.range }}</span>
        </div>
        <div class="stat-cell">
          <span class="label">成分</span>
          <span class="val">{{ formatComponents(item.components) }}</span>
        </div>
        <div class="stat-cell">
          <span class="label">持续</span>
          <span class="val">{{ item.duration }}</span>
        </div>
      </div>

      <div class="combat-line" v-if="attackSaveInfo || item.damage">
        <span v-if="attackSaveInfo" class="combat-badge type">
          {{ attackSaveInfo }}
        </span>
        <span v-if="item.damage" class="combat-badge dmg">
          {{ item.damage }} {{ item.damageType }}
        </span>
      </div>

      <div class="desc-divider"></div>
      
      <div class="desc scrollable-desc preserve-user-lines" v-html="item.description"></div>
      
      <div class="scaling" v-if="item.scaling">
        <strong>升环效应:</strong> {{ item.scaling }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.item-tooltip-card {
  position: fixed; 
  z-index: 9999;
  pointer-events: auto;
  background-color: var(--color-library-tooltip-bg-solid);
  background: var(--color-library-tooltip-bg);
  border: 1px solid var(--color-library-tooltip-border);
  box-shadow: -4px 4px 15px var(--color-library-tooltip-shadow);
  border-radius: 6px;
  width: 320px; 

  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  .card-header { 
    padding: 10px 12px; 
    background: var(--color-library-tooltip-header-bg);
    border-bottom: 1px solid var(--color-library-tooltip-header-border);
    border-radius: 6px 6px 0 0;

    /* ✅ 新增：Flex布局支持副标题 */
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .card-title { 
    color: var(--color-library-tooltip-title); font-weight: bold; font-size: 0.95rem;
  }
  .card-header.magic {
    border-bottom-color: var(--color-library-magic-border);

    .card-title,
    .card-subtitle {
      color: inherit;
    }
  }
  /* ✅ 新增：副标题样式 */
  .card-subtitle {
    font-size: 0.75rem; color: var(--color-library-tooltip-subtitle); font-style: italic;
  }
  .card-body { 
    padding: 12px; 
    font-size: 0.85rem; 
    color: var(--color-library-tooltip-body);

    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    display: flex;
    flex-direction: column;

    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-track { background: var(--color-library-tooltip-scroll-track); }
    &::-webkit-scrollbar-thumb { background: var(--color-library-tooltip-scroll-thumb); border-radius: 999px; }
    &::-webkit-scrollbar-thumb:hover { background: var(--color-library-tooltip-scroll-thumb-hover); }
  }

  /* ✅ 新增：战斗属性区域样式 */
  .combat-stats-section {
    background: var(--color-library-tooltip-section-bg);
    border-radius: 4px;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid var(--color-library-tooltip-section-border);
  }

  .stat-row-visual {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    
    .label { color: var(--color-library-tooltip-body-muted); font-size: 0.75rem; }
    .value-group { display: flex; align-items: center; gap: 6px; }
    .damage-text { color: var(--color-library-tooltip-body-strong); font-weight: bold; }
    .highlight-val { color: var(--color-library-tooltip-body-strong); font-weight: bold; }
  }

  /* ✅ 新增：伤害类型标签 */
  .damage-tag {
    font-size: 0.7rem;
    padding: 1px 6px;
    border-radius: 4px;
    color: var(--color-library-tooltip-body-strong);
    text-shadow: 0 1px 2px var(--color-library-tooltip-text-shadow);
    font-weight: bold;
  }

  /* ✅ 新增：词条胶囊容器 */
  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 6px;
  }

  /* ✅ 新增：属性胶囊样式 */
  .prop-capsule {
    font-size: 0.7rem;
    background-color: var(--color-library-tooltip-capsule-bg);
    color: var(--color-library-tooltip-capsule-text);
    padding: 2px 8px;
    border-radius: 10px; /* 圆角胶囊 */
    border: 1px solid var(--color-library-tooltip-capsule-border);
  }

  /* ✅ 新增：警告框样式 */
  .warning-box {
    margin-top: 6px;
    padding: 4px 8px;
    background: var(--color-library-tooltip-warning-bg);
    border-left: 3px solid var(--color-library-tooltip-warning-border);
    color: var(--color-library-tooltip-warning-text);
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .extra-info {
    margin-top: 4px; font-size: 0.75rem; color: var(--color-library-tooltip-subtitle);
  }
  
  .divider {
    height: 1px; background: var(--color-library-tooltip-section-border); margin: 10px 0;
  }

  /* 法术样式 */
  .spell-meta-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 8px; font-style: italic; color: var(--color-library-tooltip-spell-meta); font-size: 0.85rem;
  }
  .meta-tags {
    display: flex; gap: 4px;
    .tag {
      font-size: 0.7rem; padding: 1px 4px; border-radius: 2px; font-style: normal; font-weight: bold;
      &.ritual { background: var(--color-library-tooltip-tag-ritual-bg); color: var(--color-library-tooltip-tag-ritual-text); border: 1px solid var(--color-library-tooltip-tag-ritual-border); }
      &.conc { background: var(--color-library-tooltip-tag-conc-bg); color: var(--color-library-tooltip-body-strong); }
    }
  }
  .spell-stats-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px;
    background: var(--color-library-tooltip-section-bg-strong); padding: 8px; border-radius: 4px; margin-bottom: 10px;
    .stat-cell {
      display: flex; flex-direction: column;
      .label { font-size: 0.65rem; color: var(--color-library-tooltip-subtitle); font-weight: bold; text-transform: uppercase; }
      .val { font-size: 0.8rem; color: var(--color-library-main-header-text); }
    }
  }
  .combat-line {
    display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;
    .combat-badge {
      font-size: 0.75rem; padding: 2px 6px; border-radius: 3px; font-weight: bold;
      &.type { background: var(--color-library-tooltip-combat-type-bg); color: var(--color-library-tooltip-body-strong); border: 1px solid var(--color-library-tooltip-tag-ritual-border); }
      &.dmg { background: var(--color-library-tooltip-combat-dmg-bg); color: var(--color-library-tooltip-body-strong); }
    }
  }
  .desc-divider { height: 1px; background: var(--color-library-tooltip-divider); margin-bottom: 8px; }
  .desc { max-height: 250px; overflow-y: hidden; line-height: 1.5; overflow-wrap: anywhere; }
  .scaling {
    margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--color-library-tooltip-tag-ritual-border); font-size: 0.75rem; color: var(--color-library-tooltip-spell-meta);
    strong { color: var(--color-library-tooltip-body-muted); }
  }
  
  /* 物品样式 */
  .stat-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: bold; }
  .capacity-row {
    justify-content: flex-start;
    color: var(--color-library-main-header-text);
    font-size: 0.8rem;
    line-height: 1.35;
  }
  .gold { color: var(--color-tooltip-title); }

  .magic-traits-section {
    display: grid;
    gap: 6px;
    margin: 8px 0;
  }

  .magic-traits-title {
    color: var(--color-library-magic-text);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
  }

  .magic-trait-card {
    border: 1px solid var(--content-magic-tooltip-border);
    border-radius: 6px;
    padding: 6px;
    background: var(--content-magic-tooltip-bg);

    p {
      margin: 4px 0 0;
      color: var(--content-magic-tooltip-label);
      line-height: 1.35;
    }
  }

  .trait-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;

    strong {
      color: var(--content-magic-item-bg-default);
    }

    span {
      color: var(--palette-arcane-400);
      font-size: 0.68rem;
    }
  }

  .trait-damage {
    color: var(--content-magic-trait-damage) !important;
    font-weight: 800;
  }

  /* [新增]：专门针对长文本描述的滚动条样式 */
  .desc.scrollable-desc {
    /* 给文本一个最大高度（例如屏幕一半），超过则出现滚动条 */
    max-height: 50vh; 
    overflow-y: auto; 
    padding-right: 4px; /* 防止文字紧贴滚动条 */
    
    /* 美化滚动条 (Chrome/Safari) */
    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-track { background: var(--color-library-tooltip-scroll-track); }
    &::-webkit-scrollbar-thumb { background: var(--color-library-tooltip-scroll-thumb); border-radius: 3px; }
    &::-webkit-scrollbar-thumb:hover { background: var(--color-library-tooltip-scroll-thumb-hover); }
  }
}
</style>
