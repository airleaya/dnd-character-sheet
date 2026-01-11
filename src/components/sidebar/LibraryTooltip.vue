<script setup lang="ts">
import { computed } from 'vue';
import { formatCost } from '../../utils/currencyUtils';
import { getSchoolLabel } from '../../data/rules/dndRules';

const props = defineProps<{
  item: any;
  position: { x: number; y: number };
  type: 'item' | 'spell'; // 显式区分类型
}>();

// --- 移植过来的展示辅助函数 ---

const formatComponents = (comps: any) => {
  if (!comps) return '-';
  const parts = [];
  if (comps.v) parts.push('V');
  if (comps.s) parts.push('S');
  if (comps.m) parts.push(comps.m === true ? 'M' : `M (${comps.m})`);
  return parts.join(', ');
};

const attackSaveInfo = computed(() => {
  const s = props.item;
  if (s.attackType === 'melee') return '近战法术攻击';
  if (s.attackType === 'ranged') return '远程法术攻击';
  if (s.attackType === 'save') return `${s.saveAttr?.toUpperCase() || ''} 豁免`;
  if (s.attackType === 'auto') return '自动命中';
  return null;
});
</script>

<template>
  <div 
    class="item-tooltip-card"
    :style="{ top: position.y + 'px', left: position.x + 'px' }"
  >
    <div class="card-header">
      <div class="card-title">{{ item.name }}</div>
    </div>
    
    <div class="card-body" v-if="type === 'item'">
      <div class="stat-row">
        <span>重量: {{ item.weight }} lb</span>
        <span class="gold">{{ formatCost(item.cost) }}</span>
      </div>
      <div class="desc">{{ item.description }}</div>
    </div>

    <div class="card-body" v-if="type === 'spell'">
      <div class="spell-meta-header">
        <span class="spell-school">
          {{ item.level === 0 ? '戏法' : `${item.level}环` }} 
          {{ getSchoolLabel(item.school) }}系
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
      
      <div class="desc" v-html="item.description"></div>
      
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
  pointer-events: none;
  background-color: #1e1e1e;
  background: rgba(30, 30, 30, 0.98);
  border: 1px solid #444;
  box-shadow: -4px 4px 15px rgba(0,0,0,0.5);
  border-radius: 6px;
  width: 320px; 
  
  .card-header { 
    padding: 10px 12px; 
    background: #252525; 
    border-bottom: 1px solid #333; 
    border-radius: 6px 6px 0 0;
  }
  .card-title { 
    color: #fff; font-weight: bold; font-size: 0.95rem; 
  }
  .card-body { 
    padding: 12px; font-size: 0.85rem; color: #ccc; 
  }

  /* 法术样式 */
  .spell-meta-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 8px; font-style: italic; color: #aaa; font-size: 0.85rem;
  }
  .meta-tags {
    display: flex; gap: 4px;
    .tag {
      font-size: 0.7rem; padding: 1px 4px; border-radius: 2px; font-style: normal; font-weight: bold;
      &.ritual { background: #2c3e50; color: #aab7b8; border: 1px solid #555; }
      &.conc { background: #e67e22; color: #fff; }
    }
  }
  .spell-stats-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px;
    background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px; margin-bottom: 10px;
    .stat-cell {
      display: flex; flex-direction: column;
      .label { font-size: 0.65rem; color: #777; font-weight: bold; text-transform: uppercase; }
      .val { font-size: 0.8rem; color: #ddd; }
    }
  }
  .combat-line {
    display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;
    .combat-badge {
      font-size: 0.75rem; padding: 2px 6px; border-radius: 3px; font-weight: bold;
      &.type { background: #34495e; color: #fff; border: 1px solid #555; }
      &.dmg { background: #c0392b; color: #fff; }
    }
  }
  .desc-divider { height: 1px; background: #444; margin-bottom: 8px; }
  .desc { max-height: 250px; overflow-y: hidden; line-height: 1.5; }
  .scaling {
    margin-top: 8px; padding-top: 8px; border-top: 1px dashed #555; font-size: 0.75rem; color: #aaa;
    strong { color: #888; }
  }
  
  /* 物品样式 */
  .stat-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: bold; }
  .gold { color: #f1c40f; }
}
</style>