<script setup lang="ts">
import { computed, ref } from 'vue';
import { useActiveSheetStore } from '../../../stores/activeSheet';
import { WEAPON_PROPERTIES } from '../../../data/rules/weaponProperties';
import { calculateCantripDamage } from '../../../utils/spellUtils';
import { useTooltipStore } from '../../../stores/tooltip';
import { getSchoolLabel } from '../../../data/rules/dndRules';
import { AbilityKey } from '../../../types/Library';


const store = useActiveSheetStore();
const tooltipStore = useTooltipStore();

// 定义我们要显示的额外属性开关 (排除 Str/Dex)
const extraAttributes: { key: AbilityKey; label: string; short: string }[] = [
  { key: 'con', label: '体质', short: '体' },
  { key: 'int', label: '智力', short: '智' },
  { key: 'wis', label: '感知', short: '感' },
  { key: 'cha', label: '魅力', short: '魅' },
];

// 检查某个属性是否已激活
const isModeActive = (key: AbilityKey) => {
  return store.character?.activeAttackModes?.includes(key) || false;
};

// 切换开关
const toggleMode = (key: AbilityKey) => {
  store.toggleAttackMode(key);
};

// ==========================================
// 处理属性提示逻辑 (Trait Tooltip Logic)
// ==========================================
// 处理鼠标进入
const onTraitEnter = (traitKey: string, event: MouseEvent) => {
  // 查表获取详情
  // 注意：你的 weaponProperties.ts 里 key 是小写 (light, finesse)，
  // 但数据里可能是大写，建议统一转小写
  const def = WEAPON_PROPERTIES[traitKey.toLowerCase() as keyof typeof WEAPON_PROPERTIES];

  if (def) {
    tooltipStore.show({
      title: def.label,        // 标题：比如 "灵巧"
      content: def.description // 内容：比如 "使用灵巧武器..."
    }, event.clientX, event.clientY);
  } else {
    // 如果找不到定义，至少显示个原始名字
    tooltipStore.show({
      title: traitKey,
      content: '暂无详细规则描述'
    }, event.clientX, event.clientY);
  }
};

// 处理移动 (让提示框跟随鼠标，体验更好)
const onTraitMove = (event: MouseEvent) => {
  tooltipStore.updatePosition(event.clientX, event.clientY);
};

// 处理离开
const onTraitLeave = () => {
  tooltipStore.hide();
};


// 👇 2. 添加格式化辅助函数 (与 SidebarRight 保持一致)
const formatComponents = (comps: any) => {
  if (!comps) return '-';
  const parts = [];
  if (comps.v) parts.push('V');
  if (comps.s) parts.push('S');
  if (comps.m) parts.push(comps.m === true ? 'M' : `M (${comps.m})`);
  return parts.join(', ');
};

const getAttackSaveInfo = (spell: any) => {
  if (spell.attackType === 'melee') return '近战法术攻击';
  if (spell.attackType === 'ranged') return '远程法术攻击';
  if (spell.attackType === 'save') return `${spell.saveAttr?.toUpperCase() || ''} 豁免`;
  if (spell.attackType === 'auto') return '自动命中';
  return null;
};

// ==========================================
// 1. 攻击部分逻辑 (Attacks Logic)
// ==========================================
const getLabel = (key: string) => {
  // @ts-ignore
  return WEAPON_PROPERTIES[key]?.label || key;
};

// 分流逻辑
const visibleAttacks = computed(() => store.attacks.filter(a => !a.isHidden));
const hiddenAttacks = computed(() => store.attacks.filter(a => a.isHidden));
const showHiddenSection = ref(false);
const toggleVisibility = (id: string) => store.toggleAttackVisibility(id);

// ==========================================
// 2. 法术部分逻辑 (Spells Logic)
// ==========================================
// 追踪展开状态
const expandedSpellId = ref<string | null>(null);
const toggleSpellExpand = (id: string) => {
  expandedSpellId.value = expandedSpellId.value === id ? null : id;
};

//记录被折叠的法术组 (Key: level, Value: true 表示折叠)
const collapsedGroups = ref<Record<number, boolean>>({});

const toggleGroupCollapse = (level: number) => {
  collapsedGroups.value[level] = !collapsedGroups.value[level];
};

// 学派颜色映射
const schoolColors: Record<string, string> = {
  evocation: '#e74c3c',   // 塑能-红
  necromancy: '#2c3e50',  // 死灵-黑
  divination: '#95a5a6',  // 预言-银
  abjuration: '#3498db',  // 防护-蓝
  transmutation: '#27ae60',// 变化-绿
  enchantment: '#9b59b6', // 惑控-紫
  illusion: '#8e44ad',    // 幻术-深紫
  conjuration: '#e67e22', // 咒法-橙
};

// 法术位点击处理 (智能增减)
const handleSlotClick = (level: number, index: number, current: number) => {
  if (index < current) {
    store.updateSpellSlot(level, index); // 消耗
  } else {
    store.updateSpellSlot(level, index + 1); // 恢复
  }
};

// 长休逻辑
const handleLongRest = () => {
  if(confirm('💤 确定要进行长休吗？\n将恢复所有生命值和法术位。')) {
    store.fullHeal();
    store.recoverAllSlots();
  }
};
</script>

<template>
  <div class="actions-panel" v-if="store.character">
    
    <div class="panel-column attacks-col">
      <div class="sec-header">
        <h3>⚔️ 攻击</h3>

        <div class="attr-toggles">
          <button 
            v-for="attr in extraAttributes" 
            :key="attr.key"
            class="btn-toggle"
            :class="{ active: isModeActive(attr.key) }"
            :title="`开启/关闭 ${attr.label} 调整值攻击`"
            @click="toggleMode(attr.key)"
          >
            {{ attr.short }}
          </button>
        </div>
      </div>

      <div class="attack-list">
        <div v-for="atk in visibleAttacks" :key="atk.id" class="attack-card">
          <div class="row-main">
            <span class="atk-name">{{ atk.name }}</span>
            <div class="header-right">
              <button class="btn-icon" @click.stop="toggleVisibility(atk.id)" title="隐藏">🚫</button>
              <span class="atk-hit">{{ atk.hit }}</span>
            </div>
          </div>
          <div class="row-sub">
            <div class="info-group">
              <span class="atk-dmg">{{ atk.damage }}</span>
              <span class="divider">|</span>
              <span class="atk-range">{{ atk.range }}</span>
            </div>
            <div class="tags" v-if="atk.properties?.length">
              <!-- 属性提示 -->
              <span 
              v-for="p in atk.properties" 
              :key="p" 
              class="tag" 
              :title="p"
              @mouseenter="onTraitEnter(p, $event)"
              @mousemove="onTraitMove"
              @mouseleave="onTraitLeave"
              >
                {{ getLabel(p) }}</span>
            </div>
          </div>
        </div>
        
        <div v-if="visibleAttacks.length === 0" class="empty-tip">暂无攻击，请查看隐藏栏</div>
      </div>

      <div class="hidden-section" v-if="hiddenAttacks.length > 0">
        <div class="hidden-header" @click="showHiddenSection = !showHiddenSection">
          <span>👁️ 已隐藏 ({{ hiddenAttacks.length }})</span>
          <span class="arrow">{{ showHiddenSection ? '▼' : '▶' }}</span>
        </div>
        <div class="hidden-list" v-show="showHiddenSection">
          <div v-for="atk in hiddenAttacks" :key="atk.id" class="attack-card is-hidden">
            <div class="row-main">
              <span class="atk-name">{{ atk.name }}</span>
              <button class="btn-icon restore" @click.stop="toggleVisibility(atk.id)" title="恢复显示">✅</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel-column spells-col">
      
      <div class="spell-dashboard-mini">
        <div class="mini-stat">DC <strong>{{ store.calculatedSpellSaveDC }}</strong></div>
        <div class="mini-stat">Atk <strong>+{{ store.calculatedSpellAttackMod }}</strong></div>
        <button class="btn-rest-mini" @click="handleLongRest" title="长休：恢复法术位">💤</button>
      </div>

      <div class="spell-list-container">
        
        <div v-if="store.battleGroups.length === 0" class="empty-battle-spells">
          <p>未准备任何法术</p>
          <small>点击顶部“📖 法术书”进行准备</small>
        </div>

        <div v-else class="spell-groups">
          <div 
            v-for="group in store.battleGroups" 
            :key="group.level" 
            class="spell-group"
          >
            <div class="group-header" @click="toggleGroupCollapse(group.level)">
              <span class="fold-arrow">{{ collapsedGroups[group.level] ? '▶' : '▼' }}</span>
              <span class="group-label">{{ group.label }}</span>
              
              <div v-if="group.slots" class="slot-tracker" @click.stop>
                <div 
                  v-for="(n, idx) in group.slots.max" 
                  :key="idx"
                  class="slot-dot"
                  :class="{ filled: idx < group.slots.current }"
                  @click="handleSlotClick(group.level, idx, group.slots.current)"
                ></div>
              </div>
            </div>

            <div class="group-items" v-show="!collapsedGroups[group.level]">
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
                      {{ spell.level === 0 ? '戏法' : `${spell.level}环` }} 
                      {{ getSchoolLabel(spell.school) }}系
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
                      <span class="label">持续</span>
                      <span class="val">{{ spell.duration }}</span>
                    </div>
                  </div>

                  <div class="combat-line" v-if="getAttackSaveInfo(spell) || spell.damage">
                    <span v-if="getAttackSaveInfo(spell)" class="combat-badge type">
                      {{ getAttackSaveInfo(spell) }}
                    </span>
                    
                    <span v-if="spell.damage" class="combat-badge dmg">
                      <strong>
                        <span v-if="spell.cantripScaling">
                          {{ calculateCantripDamage(spell.damage, store.character.profile.level) }}
                        </span>
                        <span v-else>{{ spell.damage }}</span>
                      </strong>
                      {{ spell.damageType }}
                    </span>
                  </div>

                  <div class="desc-divider"></div>

                  <div class="desc-text" v-html="spell.description"></div>

                  <div class="scaling" v-if="spell.scaling">
                    <strong>升环效应:</strong> {{ spell.scaling }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped lang="scss">
.actions-panel {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  margin-top: 0.5rem;
  min-height: 450px; /* ✅ 调高高度，给列表更多空间 */
  align-items: start;
}

/* ============================
   左侧：攻击栏样式
   ============================ */
.panel-column {
  display: flex; flex-direction: column; gap: 8px;
}
.sec-header {
  border-bottom: 2px solid #e0e0e0; 
  padding-bottom: 4px;
  height: 28px; 
  display: flex; 
  align-items: center;
  justify-content: space-between;  
  h3 { margin: 0; font-size: 0.95rem; color: #2c3e50; font-weight: bold; }
}
/* [新增] 开关按钮组样式 */
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
      background: #34495e; /* 深色激活态 */
      color: #fff;
      border-color: #2c3e50;
    }
  }
}

.attack-list { display: flex; flex-direction: column; gap: 4px; }

.attack-card {
  background: #fff; border: 1px solid #dcdcdc; border-left: 3px solid #c0392b;
  border-radius: 3px; padding: 4px 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); transition: all 0.2s;
  
  .row-main {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;
    .atk-name { font-weight: bold; font-size: 0.9rem; color: #2c3e50; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .header-right { display: flex; gap: 6px; align-items: center; }
    .atk-hit { font-weight: bold; font-size: 0.9rem; color: #fff; background: #c0392b; padding: 0 5px; border-radius: 3px; min-width: 24px; text-align: center; }
    .btn-icon { border: none; background: none; cursor: pointer; font-size: 0.8rem; opacity: 0.3; &:hover { opacity: 1; } }
  }
  .row-sub {
    display: flex; justify-content: space-between; font-size: 0.75rem; color: #34495e;
    .atk-dmg { font-weight: bold; }
    .divider { color: #dcdcdc; margin: 0 4px; }
    .atk-range { color: #7f8c8d; }
    .tags { display: flex; gap: 3px; }
    .tag { background: #ecf0f1; color: #7f8c8d; padding: 0 3px; border-radius: 2px; font-size: 0.65rem; }
  }
  &.is-hidden { border-left-color: #95a5a6; background: #f4f6f8; opacity: 0.8; }
}

.hidden-section { margin-top: 10px; border-top: 1px dashed #eee; padding-top: 5px; }
.hidden-header { font-size: 0.75rem; color: #95a5a6; cursor: pointer; display: flex; justify-content: space-between; }
.hidden-list { margin-top: 4px; display: flex; flex-direction: column; gap: 4px; }
.empty-tip { font-size: 0.75rem; color: #bdc3c7; text-align: center; padding: 10px; }

/* ============================
   右侧：战斗法术样式
   ============================ */
.spell-dashboard-mini {
  display: flex; justify-content: flex-end; align-items: center; gap: 12px;
  height: 28px; /* 与左侧标题高度一致 */
  padding: 0 8px; background: #f1f3f5; border-radius: 4px; border: 1px solid #e0e0e0;
  .mini-stat { font-size: 0.8rem; color: #555; strong { color: #2c3e50; font-size: 0.9rem; } }
  .btn-rest-mini { border: none; background: #34495e; color: white; border-radius: 3px; cursor: pointer; padding: 2px 6px; font-size: 0.8rem; &:hover { background: #2c3e50; } }
}

.spell-list-container {
  display: flex; flex-direction: column; gap: 8px;
}

.spell-group { margin-bottom: 8px; }

.group-header {
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  background: #fdfdfd; 
  border-bottom: 1px solid #eee; 
  padding: 6px 8px; /* 稍微增加一点点击区域 */
  margin-bottom: 4px;
  cursor: pointer; /* 👈 变成手型 */
  user-select: none; /* 防止双击选中文本 */
  transition: background 0.2s;

  &:hover {
    background: #f1f3f5;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 6px;
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
    display: flex; gap: 3px;
    .slot-dot {
      width: 10px; height: 10px; border-radius: 50%; border: 1px solid #9b59b6; cursor: pointer; background: #fff;
      &.filled { background: #9b59b6; }
      &:hover { transform: scale(1.2); }
    }
  }
}

.spell-card {
  background: #fff; border: 1px solid #eee; border-left-width: 3px;
  border-radius: 3px; margin-bottom: 4px; cursor: pointer; transition: all 0.2s;
  &:hover { box-shadow: 0 2px 5px rgba(0,0,0,0.05); }

  .card-top {
    padding: 4px 8px; display: flex; justify-content: space-between; align-items: center;
  }

  .spell-name {
    font-weight: 600; font-size: 0.9rem; color: #34495e; display: flex; align-items: center; gap: 4px;
    .conc-badge { background: #34495e; color: #fff; font-size: 0.6rem; padding: 0 3px; border-radius: 2px; height: 14px; line-height: 14px; }
  }

  .combat-tag {
    font-size: 0.75rem; font-weight: bold; padding: 1px 4px; border-radius: 3px;
    &.atk { color: #c0392b; background: rgba(192, 57, 43, 0.1); }
    &.save { color: #fff; background: #95a5a6; }
  }
}

/* 当整个组折叠时，可以稍微去掉下边距，让排版更紧凑 */
.spell-group.is-collapsed {
  margin-bottom: 2px;
  .group-header { border-bottom: none; }
}

/* 详情区域 */
.card-detail {
  padding: 10px; 
  border-top: 1px dashed #eee; 
  background: #fdfdfd; 
  font-size: 0.85rem; 
  color: #555;
  cursor: default; /* 详情区域恢复默认鼠标 */

  /* 1. 顶部元数据 */
  .spell-meta-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 8px; font-style: italic; color: #999; font-size: 0.8rem;
  }
  .meta-tags {
    display: flex; gap: 4px;
    .tag {
      font-size: 0.7rem; padding: 1px 4px; border-radius: 2px; font-style: normal; font-weight: bold;
      &.ritual { background: #ecf0f1; color: #7f8c8d; border: 1px solid #bdc3c7; }
      &.conc { background: #e67e22; color: #fff; }
    }
  }

  /* 2. 属性网格 (适配浅色主题) */
  .spell-stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 12px;
    background: #f8f9fa; /* 浅灰背景 */
    padding: 8px;
    border-radius: 4px;
    margin-bottom: 10px;
    border: 1px solid #eee;

    .stat-cell {
      display: flex; flex-direction: column;
      .label { font-size: 0.65rem; color: #95a5a6; font-weight: bold; text-transform: uppercase; }
      .val { font-size: 0.8rem; color: #2c3e50; font-weight: 600; }
    }
  }

  /* 3. 战斗徽章 */
  .combat-line {
    display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;
    .combat-badge {
      font-size: 0.75rem; padding: 2px 6px; border-radius: 3px; font-weight: bold;
      &.type { background: #34495e; color: #fff; }
      &.dmg { background: #c0392b; color: #fff; }
    }
  }

  .desc-divider {
    height: 1px; background: #eee; margin-bottom: 8px;
  }

  .desc-text { 
    line-height: 1.5; color: #555; 
    margin-bottom: 8px;
  }

  .scaling {
    padding-top: 8px; border-top: 1px dashed #eee;
    font-size: 0.8rem; color: #7f8c8d;
    strong { color: #555; }
  }
}

.empty-battle-spells {
  text-align: center; color: #bdc3c7; padding: 40px 20px; border: 2px dashed #eee; border-radius: 6px; margin-top: 20px;
  p { margin: 0 0 5px 0; font-weight: bold; }
  small { font-size: 0.75rem; }
}
</style>