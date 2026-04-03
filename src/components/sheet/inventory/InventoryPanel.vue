<script setup lang="ts">
import { ref, reactive, computed, provide } from 'vue';
import draggable from 'vuedraggable';
import { useActiveSheetStore } from '../../../stores/activeSheet';
import TrashPanel from './TrashPanel.vue';
import InventoryItemRow from './InventoryItemRow.vue';
import { calcRealIndex,setupDragData } from '../../../utils/inventoryDropUtils';
import { formatCost } from '../../../utils/currencyUtils';

const store = useActiveSheetStore();

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
    alert('余额不足！');
  } else {
    inputs[type] = ''; 
  }
};

// =========================================
// 📦 物品列表逻辑
// =========================================

const rootItems = computed({
  get: () => store.rootInventory,
  set: (val) => {
    // draggable 需要 setter，即使我们主要靠 change 事件处理逻辑
  }
});

const handleRootDrop = (evt: any) => {
  const insertIndex = calcRealIndex(store.rootInventory, evt, store.character!.inventory);

  if (evt.added) {
    const newItem = evt.added.element;
    if (!newItem.instanceId) {
      store.addItem(newItem.libraryId, insertIndex);
    } else {
      store.moveItemToRoot(newItem.instanceId, insertIndex);
    }
  }
  else if (evt.moved) {
    store.reorderItem(evt.moved.element.instanceId, insertIndex);
  }
};

// =========================================
// 🖱️ 悬浮窗逻辑 (Tooltip)
// =========================================
const hoveredItem = ref<any>(null);
const tooltipStyle = ref({ top: '0px', left: '0px' });

// 1. 获取徽章 (Badges)
const getBadges = (item: any) => {
  const badges = [];
  const data = item.data || {};

  // 这里的属性取值取决于你的 Item 数据结构
  // 因为 item.data 包含了大部分属性
  if (data.charges) badges.push({ text: `${data.charges}次`, color: 'blue' });
  if (item.type === 'container') badges.push({ text: '容器', color: 'orange' });
  if (data.ac) badges.push({ text: `AC ${data.ac}`, color: 'cyan' });
  if (data.damage) badges.push({ text: data.damage, color: 'red' });
  
  return badges;
};

// 2. 显示悬浮窗
const onShowTooltip = (item: any, event: MouseEvent) => {
  hoveredItem.value = item;
  // 简单的位置计算：鼠标右下方偏移
  tooltipStyle.value = {
    top: `${event.clientY + 15}px`,
    left: `${event.clientX + 15}px`
  };
};

// 3. 隐藏悬浮窗
const onHideTooltip = () => {
  hoveredItem.value = null;
};

// 4. 向所有子组件提供 API
provide('inventoryTooltip', {
  onEnter: onShowTooltip,
  onLeave: onHideTooltip
});

// 拖拽开始处理函数
const onDragStart = (e: DragEvent, item: any) => {
  setupDragData(e, 'inventory-item', item.instanceId);
};
</script>

<template>
  <div class="inventory-panel" v-if="store.character">
    
    <div class="panel-header">
      <h3 :class="{ 'text-overweight': store.totalWeight > store.carryingCapacity }">
        行囊 ({{ store.totalWeight.toFixed(1) }} / {{ store.carryingCapacity }} lb)
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
          class="inventory-tooltip"
          :style="tooltipStyle"
        >
          <div class="card-header">
            <div class="card-title">{{ hoveredItem.name }}</div>
          </div>
          
          <div class="card-body">
            <div class="stat-row">
              <span>重量: {{ store.getItemWeight(hoveredItem) }} lb</span>
              
              <span class="gold" v-if="hoveredItem.type !== 'container'">
                {{ formatCost(hoveredItem.data?.cost || hoveredItem.cost) }}
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

            <div class="desc">{{ hoveredItem.description }}</div>
            
            <div v-if="hoveredItem.type === 'container'" class="extra-info">
               容量: {{ hoveredItem.data?.capacityVolume || '未知' }}
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
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 500px;
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    background: #ecf0f1;
    border-bottom: 1px solid #ddd;
    .tip { font-size: 0.8rem; color: #7f8c8d; }

    /* ✅ 新增：超重时的红色警示 */
    .text-overweight {
      color: #e74c3c; /* 红色 */
      animation: pulse 2s infinite; /* 可选：加个呼吸灯效果 */
    }
  }

  @keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

  .wallet-row {
    display: flex;
    gap: 8px;
    padding: 10px;
    background: #fdfdfd;
    border-bottom: 1px solid #eee;
    overflow-x: auto;
    flex-shrink: 0;
  }

  .coin-control {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 6px;
    padding: 6px;
    min-width: 80px;

    .coin-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-weight: bold;
      .label { font-size: 0.7rem; color: #7f8c8d; }
      .value { font-size: 1rem; color: #333; }
    }

    .coin-actions {
      display: flex; gap: 4px;
      input {
        width: 100%; min-width: 0; border: 1px solid #ddd; border-radius: 4px; padding: 2px 4px; text-align: center; font-size: 0.8rem;
        &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      }
      .btns {
        display: flex; flex-direction: column; gap: 1px;
        button {
          flex: 1; border: none; color: white; font-size: 10px; line-height: 1; padding: 2px 6px; cursor: pointer;
          &.btn-add { background: #27ae60; border-radius: 2px 2px 0 0; }
          &.btn-sub { background: #e74c3c; border-radius: 0 0 2px 2px; }
          &:hover { filter: brightness(1.1); }
        }
      }
    }

    &.pp { border-top: 3px solid #5dade2; .value { color: #2980b9; } }
    &.gp { border-top: 3px solid #f1c40f; .value { color: #d4ac0d; } }
    &.sp { border-top: 3px solid #95a5a6; .value { color: #7f8c8d; } }
    &.cp { border-top: 3px solid #d35400; .value { color: #a04000; } }
  }

  .inventory-list { 
    flex: 1;
    overflow-y: auto;
    padding: 0; 
    min-height: 200px;
  }

  .ghost { opacity: 0.5; background: #42b983; }
}

/* ✅ 悬浮窗样式 */
.inventory-tooltip {
  position: fixed; /* 必须是 fixed 才能配合 e.clientXY 定位 */
  width: 260px;
  background: rgba(30, 30, 30, 0.98);
  border: 1px solid #555;
  border-radius: 8px;
  z-index: 9999;
  pointer-events: none; /* 让鼠标穿透，避免 hover 闪烁 */
  box-shadow: 0 5px 20px rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  color: #ddd;

  .card-header { padding: 10px; background: #222; border-radius: 8px 8px 0 0; border-bottom: 1px solid #333; }
  .card-title { color: #fff; font-weight: bold; font-size: 0.95rem; }
  
  .card-body { padding: 10px; font-size: 0.85rem; color: #bbb; }
  .stat-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-weight: bold; font-family: monospace; }
  .gold { color: #f1c40f; }
  
  .desc { font-style: italic; color: #888; line-height: 1.4; margin-top: 8px; margin-bottom: 4px; }
  .extra-info { color: #42b983; margin-top: 6px; font-size: 0.8rem; }

  .badges-row { display: flex; gap: 4px; margin-bottom: 6px; flex-wrap: wrap; }
  .badge { font-size: 0.65rem; padding: 2px 5px; border-radius: 3px; background: #333; color: #aaa; }
  .badge.blue { color: #5dade2; background: rgba(93, 173, 226, 0.1); }
  .badge.orange { color: #eb984e; background: rgba(235, 152, 78, 0.1); }
  .badge.cyan { color: #48c9b0; background: rgba(72, 201, 176, 0.1); }
  .badge.red { color: #ec7063; background: rgba(236, 112, 99, 0.1); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>