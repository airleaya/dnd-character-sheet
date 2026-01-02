<script setup lang="ts">
import { ref, computed } from 'vue';
import draggable from 'vuedraggable';
import { useActiveSheetStore } from '../../stores/activeSheet';
import { formatCost } from '../../utils/currencyUtils';

// ---------------------------------------
// 1. 数据源引入
// ---------------------------------------
import { WEAPON_LIBRARY } from '../../data/libraries/weapons';
import { ARMOR_LIBRARY } from '../../data/libraries/armors';
import { GEAR_LIBRARY } from '../../data/libraries/gears';
import { CONTAINER_LIBRARY } from '../../data/libraries/containers';
import { TOOL_LIBRARY } from '../../data/libraries/tools';
import { CONSUMABLE_LIBRARY } from '../../data/libraries/consumables';
import { TREASURE_LIBRARY } from '../../data/libraries/treasures';
import { SPELL_LIBRARY } from '../../data/spells/index';
import { getSchoolLabel } from '../../data/rules/dndRules';   
import { PACK_LIBRARY } from '../../data/libraries/packs';
const store = useActiveSheetStore();

// ---------------------------------------
// 2. 状态管理
// ---------------------------------------
type RootTab = 'items' | 'spells' | 'features';
const activeTab = ref<RootTab>('items');

const searchQuery = ref('');

// 展开/折叠状态管理
const expandedState = ref<Record<string, boolean>>({});

const toggleExpand = (key: string) => {
  expandedState.value[key] = !expandedState.value[key];
};

const isVisible = (key: string) => {
  return !!expandedState.value[key] || searchQuery.value.length > 0;
};

// ---------------------------------------
// 3. 数据分类与计算属性
// ---------------------------------------
interface SubGroup { title: string; items: any[]; }
interface MainGroup { id: string; label: string; subGroups: SubGroup[]; }

// 🟢 升级版列表过滤函数
const filterList = (list: any[]) => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return list;

  return list.filter(item => {
    // 1. 基础匹配：名字或 ID
    const matchName = item.name.toLowerCase().includes(q);
    const matchId = item.id.toLowerCase().includes(q);
    if (matchName || matchId) return true;

    // 2. 针对法术的高级匹配：学派
    // 只有法术对象才有 'school' 属性
    if (item.school) {
      // 匹配英文学派 ID (e.g. "evocation")
      if (item.school.toLowerCase().includes(q)) return true;
      
      // 匹配中文学派名 (e.g. "塑能")
      // 利用 getSchoolLabel 获取中文名，然后检查是否包含搜索词
      const cnSchool = getSchoolLabel(item.school);
      if (cnSchool && cnSchool.includes(q)) return true;
    }

    return false;
  });
};

// A. 物品库数据树
const itemLibraryTree = computed<MainGroup[]>(() => {
  if (activeTab.value !== 'items') return [];

  const weapons = filterList(WEAPON_LIBRARY);
  const weaponGroups = [
    { title: '简易近战', items: weapons.filter(i => i.category === 'simple_melee') },
    { title: '简易远程', items: weapons.filter(i => i.category === 'simple_ranged') },
    { title: '军用近战', items: weapons.filter(i => i.category === 'martial_melee') },
    { title: '军用远程', items: weapons.filter(i => i.category === 'martial_ranged') },
  ].filter(g => g.items.length > 0);

  const armors = filterList(ARMOR_LIBRARY);
  const armorGroups = [
    { title: '轻甲', items: armors.filter(i => i.armorType === 'light') },
    { title: '中甲', items: armors.filter(i => i.armorType === 'medium') },
    { title: '重甲', items: armors.filter(i => i.armorType === 'heavy') },
    { title: '盾牌', items: armors.filter(i => i.armorType === 'shield') },
  ].filter(g => g.items.length > 0);

  const gearGroups = [
    { title: '冒险装备', items: filterList(GEAR_LIBRARY) },
    { title: '容器 & 背包', items: filterList(CONTAINER_LIBRARY) },
    { title: '初始套组', items: filterList(PACK_LIBRARY) },
    { title: '工具 & 套件', items: filterList(TOOL_LIBRARY) },
  ].filter(g => g.items.length > 0);

  const allConsumables = filterList(CONSUMABLE_LIBRARY);
  const consumableGroups = [
    { title: '药水 & 炼金', items: allConsumables.filter(i => i.id.startsWith('potion') || i.id.startsWith('vial') || i.id === 'oil') },
    { title: '弹药', items: allConsumables.filter(i => i.isAmmunition) },
    { title: '其他物资', items: allConsumables.filter(i => !i.isAmmunition && !i.id.startsWith('potion') && !i.id.startsWith('vial') && i.id !== 'oil') },
  ].filter(g => g.items.length > 0);

  const allTreasures = filterList(TREASURE_LIBRARY);
  const treasureGroups = [
    { title: '宝石', items: allTreasures.filter(i => i.id.startsWith('gem')) },
    { title: '艺术品', items: allTreasures.filter(i => i.id.startsWith('art')) },
    { title: '贸易货品', items: allTreasures.filter(i => i.id.endsWith('bar')) },
  ].filter(g => g.items.length > 0);

  return [
    { id: 'weapon', label: '⚔️ 武器库', subGroups: weaponGroups },
    { id: 'armor', label: '🛡️ 防具库', subGroups: armorGroups },
    { id: 'gear', label: '🎒 杂物箱', subGroups: gearGroups },
    { id: 'consumable', label: '🧪 消耗品', subGroups: consumableGroups },
    { id: 'treasure', label: '💎 藏宝库', subGroups: treasureGroups },
  ].filter(main => main.subGroups.length > 0);
});

// 格式化法术成分 (V, S, M)
const formatComponents = (comps: any) => {
  if (!comps) return '-';
  const parts = [];
  if (comps.v) parts.push('V');
  if (comps.s) parts.push('S');
  if (comps.m) parts.push(comps.m === true ? 'M' : `M (${comps.m})`);
  return parts.join(', ');
};

// 格式化攻击类型/豁免属性
const getAttackSaveInfo = (spell: any) => {
  if (spell.attackType === 'melee') return '近战法术攻击';
  if (spell.attackType === 'ranged') return '远程法术攻击';
  if (spell.attackType === 'save') return `${spell.saveAttr?.toUpperCase() || ''} 豁免`;
  if (spell.attackType === 'auto') return '自动命中';
  return null;
};

// B. 法术库数据树
const spellLibraryTree = computed<MainGroup[]>(() => {
  if (activeTab.value !== 'spells') return [];

  const spells = filterList(SPELL_LIBRARY);
  
  const groups: SubGroup[] = [];
  
  const cantrips = spells.filter(s => s.level === 0);
  if (cantrips.length > 0) groups.push({ title: '🔮 戏法 (Cantrips)', items: cantrips });

  for (let i = 1; i <= 9; i++) {
    const levelSpells = spells.filter(s => s.level === i);
    if (levelSpells.length > 0) {
      groups.push({ title: `${i} 环法术`, items: levelSpells });
    }
  }

  return [
    { id: 'spells_root', label: '📜 法术全书', subGroups: groups }
  ].filter(main => main.subGroups.length > 0);
});
// 🟢 修改：增加坐标状态
const hoveredItem = ref<any>(null);
const tooltipPos = ref({ x: 0, y: 0 }); // 新增

// 🟢 新增：更新位置的函数
const updateTooltipPos = (e: MouseEvent) => {
  // 核心逻辑：
  // 提示框宽度约 320px。
  // 我们希望它在鼠标左侧，所以 x = 鼠标X - 宽度 - 间距(20px)
  tooltipPos.value = {
    x: e.clientX - 340, 
    y: e.clientY + 10 // Y轴稍微向下偏移，避免遮挡光标
  };
};

// 🟢 修改：鼠标进入时记录位置
const onMouseEnter = (item: any, e: MouseEvent) => { 
  hoveredItem.value = item; 
  updateTooltipPos(e); // 初始化位置
};

// 🟢 新增：鼠标移动时更新位置
const onMouseMove = (e: MouseEvent) => {
  if (hoveredItem.value) {
    updateTooltipPos(e);
  }
};

const onMouseLeave = () => { hoveredItem.value = null; };

// ---------------------------------------
// 4. 拖拽与交互逻辑
// ---------------------------------------
const handleDragStart = (evt: any) => { 
  hoveredItem.value = null; 
};

// 物品克隆逻辑
const cloneItem = (item: any) => ({ libraryId: item.id });

/**
 * 法术克隆逻辑
 * 生成绝对唯一的 ID 以防止 vuedraggable 追踪失败
 */
const cloneSpell = (spell: any) => {
  const dragId = `drag_${spell.id}_${Date.now()}`;
  return { 
    id: dragId, 
    spellId: spell.id, 
    type: 'spell_drop' 
  };
};


const getBadges = (item: any) => {
  const badges = [];
  if (item.charges) badges.push({ text: `${item.charges}次`, color: 'blue' });
  if (item.capacityVolume) badges.push({ text: '容器', color: 'orange' });
  if (item.ac) badges.push({ text: `AC ${item.ac}`, color: 'cyan' });
  if (item.damage) badges.push({ text: item.damage, color: 'red' });
  return badges;
};

const getSpellBadges = (spell: any) => {
  const badges = [];
  let time = spell.castingTime;
  if (time.includes('动作')) time = '1A';
  if (time.includes('附赠')) time = 'BA';
  if (time.includes('反应')) time = 'R';
  badges.push({ text: time, color: 'blue' });

  if (spell.concentration) badges.push({ text: 'C', color: 'orange' });
  if (spell.ritual) badges.push({ text: 'R', color: 'cyan' });
  
  const comps = [];
  if (spell.components.v) comps.push('V');
  if (spell.components.s) comps.push('S');
  if (spell.components.m) comps.push('M');
  if (comps.length) badges.push({ text: comps.join(''), color: 'gray' });

  return badges;
};
</script>

<template>
  <div class="sidebar-right">
    
    <div class="root-tabs">
      <button class="root-tab-btn" :class="{ active: activeTab === 'items' }" @click="activeTab = 'items'">📦 物品</button>
      <button class="root-tab-btn" :class="{ active: activeTab === 'spells' }" @click="activeTab = 'spells'">✨ 法术</button>
      <button class="root-tab-btn" :class="{ active: activeTab === 'features' }" @click="activeTab = 'features'">🏷️ 词条</button>
    </div>

    <div class="search-header">
      <input v-model="searchQuery" type="text" :placeholder="`🔍 搜索${activeTab === 'items' ? '物品' : activeTab === 'spells' ? '法术' : '...'}`" />
    </div>

    <div class="scroll-container">
      
      <div v-if="activeTab === 'items'">
        <div v-for="group in itemLibraryTree" :key="group.id" class="main-group">
          <div class="main-group-header" @click="toggleExpand(group.id)" :class="{ 'is-open': isVisible(group.id) }">
            <div class="header-content"><span class="arrow-icon">▶</span>{{ group.label }}</div>
          </div>
          <div v-show="isVisible(group.id)">
            <div v-for="sub in group.subGroups" :key="sub.title" class="sub-group">
              <div class="sticky-sub-header" @click="toggleExpand(`${group.id}_${sub.title}`)" :class="{ 'is-open': isVisible(`${group.id}_${sub.title}`) }">
                <div class="header-left"><span class="arrow-icon">▶</span>{{ sub.title }}</div>
                <span class="count">{{ sub.items.length }}</span>
              </div>
              <div v-show="isVisible(`${group.id}_${sub.title}`)">
                <draggable 
                  :list="sub.items" 
                  :group="{ name: 'library', pull: 'clone', put: false }" 
                  :clone="cloneItem" 
                  item-key="id" 
                  @start="handleDragStart"
                  class="item-list"
                >
                  <template #item="{ element }">
                    <div class="library-item" 
                        @mouseenter="onMouseEnter(element, $event)" 
                        @mousemove="onMouseMove($event)" 
                        @mouseleave="onMouseLeave">
                      <div class="item-row">
                        <span class="item-name">{{ element.name }}</span>
                        <span class="item-cost">{{ formatCost(element.cost) }}</span>
                      </div>
                      <div class="badges-row" v-if="getBadges(element).length > 0">
                        <span v-for="(b, i) in getBadges(element)" :key="i" class="badge" :class="b.color">{{ b.text }}</span>
                      </div>
                    </div>
                  </template>
                </draggable>
              </div>
            </div>
          </div>
        </div>
        <div v-if="itemLibraryTree.length === 0" class="empty-state">未找到匹配物品</div>
      </div>

      <div v-if="activeTab === 'spells'">
        <div v-for="group in spellLibraryTree" :key="group.id" class="main-group">
          <div class="main-group-header" @click="toggleExpand(group.id)" :class="{ 'is-open': isVisible(group.id) }">
            <div class="header-content"><span class="arrow-icon">▶</span>{{ group.label }}</div>
          </div>
          <div v-show="isVisible(group.id)">
            <div v-for="sub in group.subGroups" :key="sub.title" class="sub-group">
              <div class="sticky-sub-header" @click="toggleExpand(`${group.id}_${sub.title}`)" :class="{ 'is-open': isVisible(`${group.id}_${sub.title}`) }">
                <div class="header-left"><span class="arrow-icon">▶</span>{{ sub.title }}</div>
                <span class="count">{{ sub.items.length }}</span>
              </div>
              <div v-show="isVisible(`${group.id}_${sub.title}`)">
                <draggable 
                  :list="sub.items" 
                  :group="{ name: 'spells', pull: 'clone', put: false }" 
                  :clone="cloneSpell" 
                  item-key="id" 
                  @start="handleDragStart"
                  class="item-list"
                >
                  <template #item="{ element }">
                    <div class="library-item spell-item" 
                    @mouseenter="onMouseEnter(element, $event)" 
                    @mousemove="onMouseMove($event)" 
                    @mouseleave="onMouseLeave">
                      <div class="item-row">
                        <span class="item-name">{{ element.name }}</span>
                        <span class="item-cost level-tag">{{ element.level === 0 ? '戏法' : `${element.level}环` }}</span>
                      </div>
                      <div class="badges-row">
                        <span v-for="(b, i) in getSpellBadges(element)" :key="i" class="badge" :class="b.color">{{ b.text }}</span>
                      </div>
                    </div>
                  </template>
                </draggable>
              </div>
            </div>
          </div>
        </div>
        <div v-if="spellLibraryTree.length === 0" class="empty-state">未找到匹配法术</div>
      </div>

      <div v-if="activeTab === 'features'" class="empty-state">🚧 开发中...</div>
    </div>

    <Transition name="fade">
      <div 
          v-if="hoveredItem" 
          class="item-tooltip-card"
          :style="{ top: tooltipPos.y + 'px', left: tooltipPos.x + 'px' }">
         <div class="card-header">
           <div class="card-title">{{ hoveredItem.name }}</div>
         </div>
         
         <div class="card-body" v-if="activeTab === 'items'">
             <div class="stat-row">
               <span>重量: {{ hoveredItem.weight }} lb</span>
               <span class="gold">{{ formatCost(hoveredItem.cost) }}</span>
             </div>
             <div class="desc">{{ hoveredItem.description }}</div>
         </div>

         <div class="card-body" v-if="activeTab === 'spells'">
             <div class="spell-meta-header">
               <span class="spell-school">
                 {{ hoveredItem.level === 0 ? '戏法' : `${hoveredItem.level}环` }} 
                 {{ getSchoolLabel(hoveredItem.school) }}系
               </span>
               <div class="meta-tags">
                 <span v-if="hoveredItem.ritual" class="tag ritual">仪式</span>
                 <span v-if="hoveredItem.concentration" class="tag conc">专注</span>
               </div>
             </div>

             <div class="spell-stats-grid">
               <div class="stat-cell">
                 <span class="label">施法时间</span>
                 <span class="val">{{ hoveredItem.castingTime }}</span>
               </div>
               <div class="stat-cell">
                 <span class="label">距离</span>
                 <span class="val">{{ hoveredItem.range }}</span>
               </div>
               <div class="stat-cell">
                 <span class="label">成分</span>
                 <span class="val">{{ formatComponents(hoveredItem.components) }}</span>
               </div>
               <div class="stat-cell">
                 <span class="label">持续</span>
                 <span class="val">{{ hoveredItem.duration }}</span>
               </div>
             </div>

             <div class="combat-line" v-if="getAttackSaveInfo(hoveredItem) || hoveredItem.damage">
               <span v-if="getAttackSaveInfo(hoveredItem)" class="combat-badge type">
                 {{ getAttackSaveInfo(hoveredItem) }}
               </span>
               <span v-if="hoveredItem.damage" class="combat-badge dmg">
                 {{ hoveredItem.damage }} {{ hoveredItem.damageType }}
               </span>
             </div>

             <div class="desc-divider"></div>
             
             <div class="desc" v-html="hoveredItem.description"></div>
             
             <div class="scaling" v-if="hoveredItem.scaling">
               <strong>升环效应:</strong> {{ hoveredItem.scaling }}
             </div>
         </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped lang="scss">
.sidebar-right {
  display: flex; flex-direction: column; width: 320px; min-width: 320px;
  background-color: #1e1e1e; border-left: 1px solid #333; color: #e0e0e0; height: 100%;
}
.root-tabs { display: flex; border-bottom: 1px solid #333; background: #181818; flex-shrink: 0; .root-tab-btn { flex: 1; background: transparent; border: none; color: #888; padding: 14px 0; font-weight: bold; cursor: pointer; border-bottom: 3px solid transparent; &:hover { background: #252525; color: #fff; } &.active { color: #42b983; border-bottom-color: #42b983; background: #222; } } }
.search-header { padding: 10px; background: #1e1e1e; border-bottom: 1px solid #2a2a2a; input { width: 100%; padding: 8px 10px; background: #2c2c2c; border: 1px solid #444; border-radius: 4px; color: #fff; box-sizing: border-box; outline: none; &:focus { border-color: #42b983; } } }
.scroll-container { flex: 1; overflow-y: auto; &::-webkit-scrollbar { width: 5px; } &::-webkit-scrollbar-thumb { background: #444; border-radius: 2px; } }

.main-group-header {
  padding: 14px 12px; margin-top: 1px; background-color: #252525; border-bottom: 1px solid #333; border-left: 4px solid #555;
  font-size: 0.95rem; font-weight: 800; color: #ddd; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; user-select: none; transition: all 0.2s;
  &:hover { background-color: #2d2d2d; color: #fff; }
  .header-content { display: flex; align-items: center; gap: 8px; }
  .arrow-icon { font-size: 0.75rem; color: #888; transition: transform 0.2s ease; display: inline-block; }
  &.is-open { background-color: #2c2c2c; border-left-color: #42b983; border-bottom-color: #42b983; color: #42b983; .arrow-icon { transform: rotate(90deg); color: #42b983; } }
}

.sticky-sub-header {
  position: sticky; top: 0; z-index: 10; background-color: #222; border-left: 4px solid transparent; padding: 8px 12px 8px 24px;
  font-size: 0.85rem; font-weight: bold; color: #aaa; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none; transition: background-color 0.2s;
  &:hover { background-color: #2a2a2a; color: #fff; }
  .header-left { display: flex; align-items: center; gap: 6px; }
  .arrow-icon { font-size: 0.7rem; transition: transform 0.2s; }
  &.is-open { color: #eee; background-color: #282828; .arrow-icon { transform: rotate(90deg); } }
  .count { font-size: 0.7rem; color: #666; background: #1a1a1a; padding: 1px 6px; border-radius: 8px; }
}

.library-item { background-color: #1e1e1e; border-bottom: 1px solid #282828; padding: 10px 14px; cursor: grab; transition: background 0.1s; &:hover { background-color: #2d2d2d; } }
.spell-item { border-left: 2px solid transparent; &:hover { border-left-color: #9b59b6; } }

.item-row { display: flex; justify-content: space-between; }
.item-name { color: #ccc; font-size: 0.9rem; font-weight: 500; }
.item-cost { color: #d4ac0d; font-size: 0.8rem; font-family: monospace; }
.level-tag { color: #9b59b6; font-weight: bold; }

.badges-row { margin-top: 4px; display: flex; gap: 4px; }
.badge { font-size: 0.65rem; padding: 2px 5px; border-radius: 3px; background: #333; color: #aaa; }
.badge.blue { color: #5dade2; background: rgba(93, 173, 226, 0.1); }
.badge.orange { color: #eb984e; background: rgba(235, 152, 78, 0.1); }
.badge.cyan { color: #48c9b0; background: rgba(72, 201, 176, 0.1); }
.badge.red { color: #ec7063; background: rgba(236, 112, 99, 0.1); }
.badge.gray { color: #999; background: rgba(255, 255, 255, 0.1); }

.empty-state { padding: 40px; text-align: center; color: #555; }

.item-tooltip-card {
  /* 🟢 必须是 fixed，以便 JS 根据鼠标屏幕坐标定位 */
  position: fixed; 
  z-index: 9999;
  pointer-events: none; /* 让鼠标事件穿透，防止闪烁 */

  /* 🟢 核心修复：背景与边框 */
  background-color: #1e1e1e; /* 纯色深灰底色 */
  background: rgba(30, 30, 30, 0.98); /* 微透深色背景 */
  border: 1px solid #444; /* 深灰边框 */
  box-shadow: -4px 4px 15px rgba(0,0,0,0.5); /* 阴影向左投射，增加立体感 */
  border-radius: 6px;

  /* 尺寸 */
  width: 320px; 
  
  /* 基础排版 */
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

  /* 👇👇👇 法术详情样式 (保留你提供的结构) 👇👇👇 */

  .spell-meta-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 8px; font-style: italic; color: #aaa; font-size: 0.85rem;
  }

  .meta-tags {
    display: flex; gap: 4px;
    .tag {
      font-size: 0.7rem; padding: 1px 4px; border-radius: 2px; font-style: normal; font-weight: bold;
      &.ritual { background: #2c3e50; color: #aab7b8; border: 1px solid #555; }
      &.conc { background: #e67e22; color: #fff; } /* 橙色专注标记 */
    }
  }

  /* 2x2 属性网格 */
  .spell-stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 12px;
    background: rgba(0,0,0,0.3); /* 网格背景稍深 */
    padding: 8px;
    border-radius: 4px;
    margin-bottom: 10px;

    .stat-cell {
      display: flex; flex-direction: column;
      .label { font-size: 0.65rem; color: #777; font-weight: bold; text-transform: uppercase; }
      .val { font-size: 0.8rem; color: #ddd; }
    }
  }

  /* 战斗徽章 */
  .combat-line {
    display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;
    .combat-badge {
      font-size: 0.75rem; padding: 2px 6px; border-radius: 3px; font-weight: bold;
      &.type { background: #34495e; color: #fff; border: 1px solid #555; }
      &.dmg { background: #c0392b; color: #fff; }
    }
  }

  .desc-divider {
    height: 1px; background: #444; margin-bottom: 8px;
  }
  
  .desc {
    max-height: 250px; overflow-y: hidden; /* 防止过长 */
    line-height: 1.5;
  }

  .scaling {
    margin-top: 8px; padding-top: 8px; border-top: 1px dashed #555;
    font-size: 0.75rem; color: #aaa;
    strong { color: #888; }
  }
  
  /* 物品详情特定样式 (兼容 activeTab === 'items') */
  .stat-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: bold; }
  .gold { color: #f1c40f; }
  .extra-info { color: #42b983; margin-top: 2px; }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>