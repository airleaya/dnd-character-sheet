<script setup lang="ts">
import { ref, reactive, computed, provide, nextTick, onBeforeUnmount, onMounted, watch } from 'vue';
import draggable from 'vuedraggable';
import { useActiveSheetStore } from '../../../stores/activeSheet';
import { useUiFeedbackStore } from '../../../stores/uiFeedback';
import TrashPanel from './TrashPanel.vue';
import InventoryItemRow from './InventoryItemRow.vue';
import ItemDescriptionRenderer from '../../common/ItemDescriptionRenderer.vue';
import { getTooltipViewportMaxHeight, getTooltipViewportPosition } from '../../../stores/tooltip';
import {
  calcRealIndex,
  isInventoryInstanceDragElement,
  isLibraryCloneDragElement,
  setupDragData,
} from '../../../utils/inventoryDropUtils';
import type { InventoryDragChangeEvent } from '../../../utils/inventoryDropUtils';

import { formatCost } from '../../../utils/currencyUtils';
import { formatContainerCapacity } from '../../../utils/containerCapacity';
import { getCarryingLoadTone } from '../../../utils/carryingLoad';
import {
  formatMagicItemName,
  formatMagicRarity,
  formatMagicTraitDamage,
  formatMagicTraitMeta,
  getMagicInventoryStyle,
  hasExplicitMagicBonus,
  resolveMagicTraitsForItem,
} from '../../../utils/magicItems';
import { getRuntimeSpellById } from '../../../data/dataPacks/runtimeDataPacks';
import type { ItemCost } from '../../../types/Library';
import type { InventoryItem } from '../../../types/Item';

const store = useActiveSheetStore();
const feedback = useUiFeedbackStore();

// =========================================
// 💰 钱包逻辑
// =========================================
const inputs = reactive({
  pp: '' as string | number,
  gp: '' as string | number,
  sp: '' as string | number,
  cp: '' as string | number
});

const adjustMoney = (type: 'pp' | 'gp' | 'sp' | 'cp', isAdd: boolean) => {
  let val = Number(inputs[type]);
  if (!val || val <= 0) val = 1;
  const amount = isAdd ? val : -val;
  const success = store.modifyCurrency(type, amount);
  if (!success) {
    feedback.showToast('余额不足', 'warning');
  } else {
    inputs[type] = ''; 
  }
};

// =========================================
// 📦 物品列表逻辑
// =========================================

type InventoryTooltipBadge = {
  text: string;
  color: 'blue' | 'orange' | 'cyan' | 'red';
};



const getItemCost = (item: InventoryItem): ItemCost | undefined => {
  if ('cost' in item.data) {
    return item.data.cost as ItemCost | undefined;
  }
  return undefined;
};

const formatContainerContentPreviewItem = (item: InventoryItem): string =>
  item.quantity > 1 ? `${item.name} x${item.quantity}` : item.name;

const getContainerContentPreview = (item: InventoryItem): string => {
  if (item.type !== 'container') {
    return '';
  }

  const contents = store.getContainerContents(item.instanceId);
  const hanging = store.getContainerHangingItem(item.instanceId);
  const parts = contents.map(formatContainerContentPreviewItem);

  if (hanging) {
    parts.push(`悬挂 ${formatContainerContentPreviewItem(hanging)}`);
  }

  return parts.length > 0 ? parts.join('，') : '空';
};

const rootItems = computed({
  get: () => store.rootInventory,
  set: () => {
    // draggable 需要 setter，即使我们主要靠 change 事件处理逻辑
  }
});

const handleRootDrop = (evt: InventoryDragChangeEvent) => {
  const insertIndex = calcRealIndex(store.rootInventory, evt, store.character!.inventory);

  if (evt.added) {
    const newItem = evt.added.element;
    if (isLibraryCloneDragElement(newItem)) {
      store.addItem(newItem.libraryId, insertIndex);
    } else if (isInventoryInstanceDragElement(newItem)) {
      store.moveItemToRoot(newItem.instanceId, insertIndex);
    }
  } else if (evt.moved) {
    const movedItem = evt.moved.element;
    if (isInventoryInstanceDragElement(movedItem)) {
      store.reorderItem(movedItem.instanceId, insertIndex);
    }
  }
};


// =========================================
// 🖱️ 悬浮窗逻辑 (Tooltip)
// =========================================
const hoveredItem = ref<InventoryItem | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);
const tooltipPoint = ref({ x: 0, y: 0 });
const tooltipSize = ref({ width: 320, height: 0 });
let tooltipHideTimer: number | undefined;

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
  () => hoveredItem.value?.instanceId,
  (instanceId) => {
    if (instanceId) {
      void measureAfterRender();
    }
  },
  { flush: 'post' }
);

const onWindowResize = () => {
  if (hoveredItem.value) {
    measureTooltip();
  }
};

onMounted(() => {
  window.addEventListener('resize', onWindowResize);
});

const carryingLoadTone = computed(() =>
  getCarryingLoadTone(store.totalWeight, store.carryingCapacity)
);

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize);
  clearTooltipHideTimer();
});

const tooltipStyle = computed(() => {
  if (typeof window === 'undefined') {
    return {
      top: `${tooltipPoint.value.y + 15}px`,
      left: `${tooltipPoint.value.x + 15}px`
    };
  }

  const position = getTooltipViewportPosition({
    x: tooltipPoint.value.x,
    y: tooltipPoint.value.y,
    tooltipWidth: tooltipSize.value.width,
    tooltipHeight: tooltipSize.value.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight
  });

  return {
    top: `${position.top}px`,
    left: `${position.left}px`,
    maxHeight: `${getTooltipViewportMaxHeight(window.innerHeight)}px`
  };
});

const clearTooltipHideTimer = () => {
  if (tooltipHideTimer === undefined) return;
  window.clearTimeout(tooltipHideTimer);
  tooltipHideTimer = undefined;
};

// 1. 获取徽章 (Badges)
const getBadges = (item: InventoryItem): InventoryTooltipBadge[] => {
  const badges: InventoryTooltipBadge[] = [];
  const data = item.data;

  if ('charges' in data && typeof data.charges === 'number' && data.charges > 0) {
    badges.push({ text: `${data.charges}次`, color: 'blue' });
  }
  if (item.type === 'container') {
    badges.push({ text: '容器', color: 'orange' });
  }
  if ('ac' in data && typeof data.ac === 'number') {
    badges.push({ text: `AC ${data.ac}`, color: 'cyan' });
  }
  if ('damage' in data && typeof data.damage === 'string') {
    badges.push({ text: data.damage, color: 'red' });
  }

  return badges;
};

const formatSigned = (value: number) => (value >= 0 ? `+${value}` : `${value}`);

const getMagicAttributeRows = (item: InventoryItem): Array<{ label: string; value: string }> => {
  if (!item.magic?.isMagic) return [];
  const magic = item.magic;
  const rows: Array<{ label: string; value: string }> = [
    { label: '魔法物品', value: '是' },
  ];

  if (hasExplicitMagicBonus(item)) {
    rows.push({ label: '魔法加值', value: formatSigned(magic.magicBonus!) });
  }

  rows.push({ label: '稀有度', value: formatMagicRarity(magic.rarity) });

  if (magic.attunement?.requires) {
    rows.push({ label: '同调', value: magic.attunement.attuned ? '需要 · 已同调' : '需要 · 未同调' });
    if (magic.attunement.condition) {
      rows.push({ label: '同调条件', value: magic.attunement.condition });
    }
  } else {
    rows.push({ label: '同调', value: '不需要' });
  }

  if (magic.isCursed) {
    rows.push({ label: '诅咒', value: '是' });
  }

  return rows;
};

const getMagicTraits = (item: InventoryItem) => resolveMagicTraitsForItem(item);

const getMagicTraitSpellName = (spellId?: string) => {
  if (!spellId) return '';
  return getRuntimeSpellById(spellId)?.name ?? spellId;
};

// 2. 显示悬浮窗
const onShowTooltip = (item: InventoryItem, event: MouseEvent) => {
  clearTooltipHideTimer();
  hoveredItem.value = item;
  // 简单的位置计算：鼠标右下方偏移
  tooltipPoint.value = {
    x: event.clientX,
    y: event.clientY
  };
  void measureAfterRender();
};

// 3. 隐藏悬浮窗
const onHideTooltip = () => {
  clearTooltipHideTimer();
  tooltipHideTimer = window.setTimeout(() => {
    hoveredItem.value = null;
    tooltipHideTimer = undefined;
  }, 180);
};

const onTooltipEnter = () => {
  clearTooltipHideTimer();
};

const onTooltipLeave = () => {
  clearTooltipHideTimer();
  hoveredItem.value = null;
};

// 4. 向所有子组件提供 API
provide('inventoryTooltip', {
  onEnter: onShowTooltip,
  onLeave: onHideTooltip
});

// 拖拽开始处理函数
const onDragStart = (e: DragEvent, item: InventoryItem) => {
  setupDragData(e, 'inventory-item', item.instanceId);
};
</script>

<template>
  <div class="inventory-panel" v-if="store.character">
    
    <div class="panel-header">
      <h3 class="carrying-load" :class="`load-${carryingLoadTone}`">
        行囊 ({{ store.totalWeight.toFixed(1) }} / {{ store.carryingCapacity }} lb) · 同调 {{ store.attunedMagicItemCount }}/3
      </h3>
      <span class="tip">支持容器嵌套与拖拽</span>
    </div>

    <div class="wallet-row" v-if="store.character.wallet">
      <div class="coin-control pp">
        <div class="coin-header">
          <span class="label">PP</span>
          <span class="value">{{ store.character.wallet.pp }}</span>
        </div>
        <div class="coin-actions">
          <input type="number" v-model="inputs.pp" placeholder="0" min="0" />
          <div class="btns">
            <button class="btn-add" @click="adjustMoney('pp', true)">+</button>
            <button class="btn-sub" @click="adjustMoney('pp', false)">-</button>
          </div>
        </div>
      </div>

      <div class="coin-control gp">
        <div class="coin-header">
          <span class="label">GP</span>
          <span class="value">{{ store.character.wallet.gp }}</span>
        </div>
        <div class="coin-actions">
          <input type="number" v-model="inputs.gp" placeholder="0" min="0" />
          <div class="btns">
            <button class="btn-add" @click="adjustMoney('gp', true)">+</button>
            <button class="btn-sub" @click="adjustMoney('gp', false)">-</button>
          </div>
        </div>
      </div>

      <div class="coin-control sp">
        <div class="coin-header">
          <span class="label">SP</span>
          <span class="value">{{ store.character.wallet.sp }}</span>
        </div>
        <div class="coin-actions">
          <input type="number" v-model="inputs.sp" placeholder="0" min="0" />
          <div class="btns">
            <button class="btn-add" @click="adjustMoney('sp', true)">+</button>
            <button class="btn-sub" @click="adjustMoney('sp', false)">-</button>
          </div>
        </div>
      </div>

      <div class="coin-control cp">
        <div class="coin-header">
          <span class="label">CP</span>
          <span class="value">{{ store.character.wallet.cp }}</span>
        </div>
        <div class="coin-actions">
          <input type="number" v-model="inputs.cp" placeholder="0" min="0" />
          <div class="btns">
            <button class="btn-add" @click="adjustMoney('cp', true)">+</button>
            <button class="btn-sub" @click="adjustMoney('cp', false)">-</button>
          </div>
        </div>
      </div>
    </div>

    <draggable 
      v-model="rootItems" 
      :group="{ name: 'inventory', put: ['library', 'inventory','equipment'] }"
      item-key="instanceId"
      class="inventory-list"
      @change="handleRootDrop"
      ghost-class="ghost"
    >
      <template #item="{ element }">
        <InventoryItemRow
          :item="element" 
          @dragstart="onDragStart($event, element)" 
        />
      </template>
    </draggable>

    <TrashPanel />

    <Teleport to="body">
      <Transition name="fade">
        <div 
          v-if="hoveredItem" 
          ref="tooltipRef"
          class="inventory-tooltip"
          :style="tooltipStyle"
          @mouseenter="onTooltipEnter"
          @mouseleave="onTooltipLeave"
        >
          <div class="card-header">
            <div class="card-title" :style="getMagicInventoryStyle(hoveredItem)">{{ formatMagicItemName(hoveredItem) }}</div>
          </div>
          
          <div class="card-body">
            <div class="stat-row">
              <span>重量: {{ store.getItemWeight(hoveredItem) }} lb</span>
              
              <span class="gold" v-if="hoveredItem.type !== 'container'">
                {{ formatCost(getItemCost(hoveredItem)) }}
              </span>
            </div>
            
            <div class="badges-row" v-if="getBadges(hoveredItem).length > 0">
              <span 
                v-for="(b, i) in getBadges(hoveredItem)" 
                :key="i" 
                class="badge" 
                :class="b.color"
              >
                {{ b.text }}
              </span>
            </div>

            <div v-if="hoveredItem.magic?.isMagic" class="magic-attributes-section">
              <div class="magic-traits-title">魔法属性</div>
              <div class="magic-attribute-grid">
                <div
                  v-for="row in getMagicAttributeRows(hoveredItem)"
                  :key="`${row.label}:${row.value}`"
                  class="magic-attribute-row"
                >
                  <span>{{ row.label }}</span>
                  <strong class="preserve-user-lines">{{ row.value }}</strong>
                </div>
              </div>
              <div v-if="hoveredItem.magic.visuals" class="magic-visual-row">
                <span>视觉</span>
                <i
                  v-if="hoveredItem.magic.visuals.inventoryBackground"
                  class="color-swatch"
                  :style="{ backgroundColor: hoveredItem.magic.visuals.inventoryBackground }"
                  title="行囊背景"
                ></i>
                <i
                  v-if="hoveredItem.magic.visuals.attackBackground"
                  class="color-swatch"
                  :style="{ backgroundColor: hoveredItem.magic.visuals.attackBackground }"
                  title="攻击项背景"
                ></i>
                <i
                  v-if="hoveredItem.magic.visuals.nameColor"
                  class="color-swatch"
                  :style="{ backgroundColor: hoveredItem.magic.visuals.nameColor }"
                  title="名字字体颜色"
                ></i>
              </div>
            </div>

            <div v-if="getMagicTraits(hoveredItem).length > 0" class="magic-traits-section">
              <div class="magic-traits-title">附魔词条</div>
              <div v-for="trait in getMagicTraits(hoveredItem)" :key="trait.id" class="magic-trait-card">
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

            <ItemDescriptionRenderer :description="hoveredItem.description" :blocks="hoveredItem.descriptionBlocks" />
            
            <div v-if="hoveredItem.type === 'container'" class="extra-info">
               容量: {{ formatContainerCapacity(hoveredItem) }}
              <br />
               内容: {{ getContainerContentPreview(hoveredItem) }}
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    
  </div>
</template>

<style scoped lang="scss">
.inventory-panel {
  margin-top: 1rem;
  background: var(--color-inventory-panel-bg);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 500px;
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 0.5rem 1rem;
    background: var(--color-inventory-header-bg);
    border-bottom: 1px solid var(--color-inventory-header-border);
    .tip { font-size: 0.8rem; color: var(--color-inventory-muted); }

    .carrying-load {
      color: var(--color-inventory-strong);
      transition: color 0.2s ease;

      &.load-yellow {
        color: var(--color-inventory-load-warning);
      }

      &.load-orange {
        color: var(--color-inventory-load-heavy);
      }

      &.load-red {
        color: var(--color-inventory-load-over);
      }
    }
  }

  .wallet-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 8px;
    padding: 10px;
    background: var(--color-inventory-soft-bg);
    border-bottom: 1px solid var(--color-inventory-soft-border);
    flex-shrink: 0;
  }

  .coin-control {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--color-inventory-card-bg);
    border: 1px solid var(--color-inventory-soft-border);
    border-radius: 6px;
    padding: 6px;
    min-width: 80px;

    .coin-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-weight: bold;
      .label { font-size: 0.7rem; color: var(--color-inventory-muted); }
      .value { font-size: 1rem; color: var(--color-inventory-value-text); }
    }

    .coin-actions {
      display: flex; gap: 4px;
      input {
        width: 100%; min-width: 0; border: 1px solid var(--color-inventory-control-border); border-radius: 4px; padding: 2px 4px; text-align: center; font-size: 0.8rem;
        &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      }
      .btns {
        display: flex; flex-direction: column; gap: 1px;
        button {
          flex: 1; border: none; color: var(--color-text-inverse); font-size: 10px; line-height: 1; padding: 2px 6px; cursor: pointer;
          &.btn-add { background: var(--color-inventory-action-add); border-radius: 2px 2px 0 0; }
          &.btn-sub { background: var(--color-inventory-action-subtract); border-radius: 0 0 2px 2px; }
          &:hover { filter: brightness(1.1); }
        }
      }
    }

    &.pp { border-top: 3px solid var(--color-inventory-coin-pp); .value { color: var(--color-inventory-coin-pp-text); } }
    &.gp { border-top: 3px solid var(--color-inventory-coin-gp); .value { color: var(--color-inventory-coin-gp-text); } }
    &.sp { border-top: 3px solid var(--color-inventory-coin-sp); .value { color: var(--color-inventory-coin-sp-text); } }
    &.cp { border-top: 3px solid var(--color-inventory-coin-cp); .value { color: var(--color-inventory-coin-cp-text); } }
  }

  .inventory-list { 
    flex: 1;
    overflow-y: auto;
    padding: 0; 
    min-height: 200px;
  }

  .ghost { opacity: 0.5; background: var(--color-inventory-ghost-bg); }
}

/* ✅ 悬浮窗样式 */
.inventory-tooltip {
  position: fixed; /* 必须是 fixed 才能配合 e.clientXY 定位 */
  width: 260px;
  background: var(--color-inventory-tooltip-bg);
  border: 1px solid var(--color-inventory-tooltip-border);
  border-radius: 8px;
  z-index: 9999;
  pointer-events: none; /* 让鼠标穿透，避免 hover 闪烁 */
  box-shadow: 0 5px 20px var(--color-inventory-tooltip-shadow);
  backdrop-filter: blur(4px);
  color: var(--color-inventory-tooltip-text);
  pointer-events: auto;
  overflow-y: auto;
  overscroll-behavior: contain;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: var(--color-inventory-tooltip-scroll-track); }
  &::-webkit-scrollbar-thumb { background: var(--color-inventory-tooltip-scroll-thumb); border-radius: 999px; }
  &::-webkit-scrollbar-thumb:hover { background: var(--color-inventory-tooltip-scroll-thumb-hover); }

  .card-header { padding: 10px; background: var(--color-inventory-tooltip-header-bg); border-radius: 8px 8px 0 0; border-bottom: 1px solid var(--color-inventory-tooltip-header-border); }
  .card-title { color: var(--color-inventory-tooltip-title); font-weight: bold; font-size: 0.95rem; }
  
  .card-body { padding: 10px; font-size: 0.85rem; color: var(--color-inventory-tooltip-body); }
  .stat-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-weight: bold; font-family: monospace; }
  .gold { color: var(--color-inventory-coin-gp); }
  
  .desc { font-style: italic; color: var(--color-inventory-tooltip-desc); line-height: 1.4; margin-top: 8px; margin-bottom: 4px; }
  .extra-info { color: var(--color-inventory-tooltip-extra); margin-top: 6px; font-size: 0.8rem; }

  .badges-row { display: flex; gap: 4px; margin-bottom: 6px; flex-wrap: wrap; }
  .badge { font-size: 0.65rem; padding: 2px 5px; border-radius: 3px; background: var(--color-inventory-tooltip-badge-bg); color: var(--color-inventory-tooltip-badge-text); }
  .badge.blue { color: var(--color-inventory-tooltip-badge-blue-text); background: var(--color-inventory-tooltip-badge-blue-bg); }
  .badge.orange { color: var(--color-inventory-tooltip-badge-orange-text); background: var(--color-inventory-tooltip-badge-orange-bg); }
  .badge.cyan { color: var(--color-inventory-tooltip-badge-cyan-text); background: var(--color-inventory-tooltip-badge-cyan-bg); }
  .badge.red { color: var(--color-inventory-tooltip-badge-red-text); background: var(--color-inventory-tooltip-badge-red-bg); }

  .magic-attributes-section,
  .magic-traits-section {
    display: grid;
    gap: 6px;
    margin: 8px 0;
  }

  .magic-traits-title {
    color: var(--content-magic-tooltip-title);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
  }

  .magic-attribute-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
  }

  .magic-attribute-row {
    display: flex;
    justify-content: space-between;
    gap: 6px;
    padding: 4px 6px;
    border: 1px solid var(--content-magic-tooltip-border);
    border-radius: 5px;
    background: var(--content-magic-tooltip-bg);

    span {
      color: var(--content-magic-tooltip-label);
    }

    strong {
      color: var(--content-magic-tooltip-value);
      text-align: right;
      font-weight: 800;
    }
  }

  .magic-visual-row {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--content-magic-tooltip-label);
    font-size: 0.76rem;
  }

  .color-swatch {
    width: 16px;
    height: 16px;
    border: 1px solid var(--color-inventory-swatch-border);
    border-radius: 50%;
    box-shadow: 0 0 0 1px var(--color-inventory-swatch-shadow);
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
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
