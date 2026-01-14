<script setup lang="ts">
import { computed } from 'vue';
import { formatCost } from '../../utils/currencyUtils';
import { getSchoolLabel } from '../../data/rules/dndRules';
import { DAMAGE_TYPES } from '../../data/rules/damageTypes';
import { WEAPON_PROPERTIES } from '../../data/rules/weaponProperties';
import { WEAPON_CAT_MAP, ARMOR_TYPE_MAP } from '../../data/rules/proficiencies'
import { ATTR_MAP, ITEM_TYPE_MAP } from '../../data/rules/dndRules';

const props = defineProps<{
  item: any;
  position: { x: number; y: number };
  type: 'item' | 'spell'; // 显式区分类型
}>();

// ==========================================
// ✅ 新增：辅助计算函数
// ==========================================

// 获取物品右上角的子类型标签
const subTypeLabel = computed(() => {
  const i = props.item;
  if (props.type === 'spell') return '法术';
  if (i.type === 'weapon') return WEAPON_CAT_MAP[i.category] || '武器';
  if (i.type === 'armor') return ARMOR_TYPE_MAP[i.armorType] || '防具';
  return ITEM_TYPE_MAP[i.type] || '物品';
});

// 获取伤害类型的定义（颜色、中文名）
const getDamageDef = (key: string) => DAMAGE_TYPES[key as keyof typeof DAMAGE_TYPES] || DAMAGE_TYPES.damage_none;

// 获取武器属性的定义
const getPropDef = (key: string) => WEAPON_PROPERTIES[key as keyof typeof WEAPON_PROPERTIES];

// 格式化 AC 显示字符串
const formatAC = (i: any) => {
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
              :style="{ backgroundColor: getDamageDef(item.damageType).color }"
            >
              {{ getDamageDef(item.damageType).label.split(' ')[0] }}
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
      
      <div class="desc scrollable-desc" v-html="item.description"></div>
      
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
  background-color: #1e1e1e;
  background: rgba(30, 30, 30, 0.98);
  border: 1px solid #444;
  box-shadow: -4px 4px 15px rgba(0,0,0,0.5);
  border-radius: 6px;
  width: 320px; 

  max-height: 90vh;
  display: flex;
  flex-direction: column;
  
  .card-header { 
    padding: 10px 12px; 
    background: #252525; 
    border-bottom: 1px solid #333; 
    border-radius: 6px 6px 0 0;

    /* ✅ 新增：Flex布局支持副标题 */
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .card-title { 
    color: #fff; font-weight: bold; font-size: 0.95rem; 
  }
  /* ✅ 新增：副标题样式 */
  .card-subtitle {
    font-size: 0.75rem; color: #777; font-style: italic;
  }
  .card-body { 
    padding: 12px; 
    font-size: 0.85rem; 
    color: #ccc; 

    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* ✅ 新增：战斗属性区域样式 */
  .combat-stats-section {
    background: rgba(0,0,0,0.2);
    border-radius: 4px;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid #333;
  }

  .stat-row-visual {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    
    .label { color: #888; font-size: 0.75rem; }
    .value-group { display: flex; align-items: center; gap: 6px; }
    .damage-text { color: #fff; font-weight: bold; }
    .highlight-val { color: #fff; font-weight: bold; }
  }

  /* ✅ 新增：伤害类型标签 */
  .damage-tag {
    font-size: 0.7rem;
    padding: 1px 6px;
    border-radius: 4px;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
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
    background-color: #34495e;
    color: #bdc3c7;
    padding: 2px 8px;
    border-radius: 10px; /* 圆角胶囊 */
    border: 1px solid #4a6278;
  }

  /* ✅ 新增：警告框样式 */
  .warning-box {
    margin-top: 6px;
    padding: 4px 8px;
    background: rgba(231, 76, 60, 0.15);
    border-left: 3px solid #e74c3c;
    color: #e74c3c;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .extra-info {
    margin-top: 4px; font-size: 0.75rem; color: #777;
  }
  
  .divider {
    height: 1px; background: #333; margin: 10px 0;
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

  /* [新增]：专门针对长文本描述的滚动条样式 */
  .desc.scrollable-desc {
    /* 给文本一个最大高度（例如屏幕一半），超过则出现滚动条 */
    max-height: 50vh; 
    overflow-y: auto; 
    padding-right: 4px; /* 防止文字紧贴滚动条 */
    
    /* 美化滚动条 (Chrome/Safari) */
    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
    &::-webkit-scrollbar-thumb { background: #555; border-radius: 3px; }
    &::-webkit-scrollbar-thumb:hover { background: #777; }
  }
}
</style>