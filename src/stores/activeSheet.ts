// src/stores/activeSheet.ts
import { defineStore } from 'pinia';
import { useCharacterStore } from './characterStore';
import type { Character, CharacterProficiencies } from '../types/Character';
import type { InventoryItem } from '../types/Item';
import { ATTR_MAP, SKILL_DEFINITIONS, XP_TABLE } from '../data/rules/dndRules';
import { createItemFromLibrary } from '../utils/itemFactory';
import { DAMAGE_TYPES } from '../data/rules/damageTypes';
import { CURRENCY_RATES } from '../data/rules/currency';
import { SPELL_LIBRARY } from '../data/spells/index';
import { SpellDefinition } from '../types/Spell';
import { PACK_LIBRARY } from '../data/libraries/packs';
import { AbilityKey } from '../types/Library';
import { WEAPON_LIBRARY } from '../data/libraries/weapons';

//定义法术分组的接口
export interface SpellGroup {
  level: number;
  label: string;
  spells: SpellDefinition[];
  slots: {
    current: number;
    max: number;
  } | null;
}

// 纯函数：递归计算重量
// 不依赖 Store 的 this 上下文，确保计算绝对准确且实时
function computeItemWeightRecursive(item: any, allItems: any[]): number {
  // 1. 基础重量
  let w = (item.weight || 0) * (item.quantity || 1);
  
  // 2. 容器逻辑
  if (item.type === 'container') {
    const data = item.data || {};
    // 如果是魔法容器，忽略内容重
    if (data.ignoreContentWeight) return w;
    
    // 找出所有子物品
    const children = allItems.filter(child => child.parentId === item.instanceId);
    
    // 递归累加
    const childrenWeight = children.reduce((acc, child) => {
      return acc + computeItemWeightRecursive(child, allItems);
    }, 0);
    
    return w + childrenWeight;
  }
  return w;
}

// 辅助函数：分组逻辑
function groupSpellsByLevel(spells: SpellDefinition[], slots: any): SpellGroup[] {
  const groups = [];
  // 0环
  const cantrips = spells.filter(s => s.level === 0);
  if (cantrips.length > 0) {
    groups.push({ level: 0, label: '🔮 戏法', spells: cantrips, slots: null });
  }
  // 1-9环
  for (let i = 1; i <= 9; i++) {
    const levelSpells = spells.filter(s => s.level === i);
    // ⚠️ 安全访问：防止 slots 数组长度不足导致报错
    const maxSlots = slots.max[i] || 0;
    const currentSlots = slots.current[i] || 0;
    // 如果有法术 OR 有槽位上限，则显示该组
    if (levelSpells.length > 0 || maxSlots > 0) {
      groups.push({
        level: i,
        label: `${i} 环法术`,
        spells: levelSpells,
        slots: { current: slots.current[i] || 0, max: maxSlots }
      });
    }
  }
  return groups;
}

export const useActiveSheetStore = defineStore('activeSheet', {
  state: () => ({
    // ✅ 不再需要 ExtendedCharacter，直接用 Character
    character: null as Character | null, 

    // 临时垃圾箱
    // 放在 character 外部，意味着它不会被 save() 持久化
    // 页面刷新/关闭后，Store 重置，这里自然就清空了
    trash: [] as InventoryItem[],

    ui: {
    isSpellbookOpen: false, // ✅ 全局控制法术书开关
  }
  }),

  getters: {
    // ==========================================
    // 📖 Getter 1: 法术书视图 (所有已学会的)
    // ==========================================
    allKnownSpells(state): SpellDefinition[] {
      if (!state.character) return [];
      // 映射 known ID 到法术对象
      return state.character.spells.known
        .map(id => SPELL_LIBRARY.find(s => s.id === id))
        .filter(s => !!s) as SpellDefinition[];
    },

    spellbookGroups(state): SpellGroup[] {
      if (!state.character) return [];
      // @ts-ignore
      return groupSpellsByLevel(this.allKnownSpells, state.character.spells.slots);
    },

    // ==========================================
    // ⚔️ Getter 2: 战斗视图 (仅已准备 + 戏法)
    // ==========================================
    battleSpells(state): SpellDefinition[] {
      if (!state.character) return [];
      const { known, prepared } = state.character.spells;
      
      // 逻辑：
      // 1. 戏法 (level 0) 不需要准备，只要学会了(known)就能用
      // 2. 非戏法 (level > 0) 必须在 prepared 列表中才显示
      
      const knownObjs = known
        .map(id => SPELL_LIBRARY.find(s => s.id === id))
        .filter(s => !!s) as SpellDefinition[];

      return knownObjs.filter(s => {
        if (s.level === 0) return true; // 戏法总是可见
        return prepared.includes(s.id); // 其他必须已准备
      });
    },

    battleGroups(state): SpellGroup[] {
      if (!state.character) return [];
      // @ts-ignore
      return groupSpellsByLevel(this.battleSpells, state.character.spells.slots);
    },


    // 1. 施法关键属性调整值
    spellAbilityMod(state): number {
      if (!state.character) return 0;
      const key = state.character.spells.spellcastingAbility; // 'int', 'wis', 'cha'
      const val = state.character.stats[key];
      return Math.floor((val - 10) / 2);
    },

    // 2. 法术豁免 DC (8 + PB + Mod)
    calculatedSpellSaveDC(state): number {
      // @ts-ignore
      return 8 + this.proficiencyBonus + this.spellAbilityMod;
    },

    // 3. 法术攻击加值 (PB + Mod)
    calculatedSpellAttackMod(state): number {
      // @ts-ignore
      return this.proficiencyBonus + this.spellAbilityMod;
    },

    // 副施法属性相关的自动计算 Getter
    secondarySpellAbilityMod(state): number {
      if (!state.character || !state.character.spells.secondaryCastingAbility) return 0;
      const key = state.character.spells.secondaryCastingAbility;
      const val = state.character.stats[key];
      return Math.floor((val - 10) / 2);
    },

    secondaryCalculatedSpellSaveDC(state): number {
      // @ts-ignore
      return 8 + this.proficiencyBonus + this.secondarySpellAbilityMod;
    },

    secondaryCalculatedSpellAttackMod(state): number {
      // @ts-ignore
      return this.proficiencyBonus + this.secondarySpellAbilityMod;
    },

    // 4. 获取“已准备/已知”的法术列表 (按 ID 映射回对象)
    mySpells(state): SpellDefinition[] {
      if (!state.character) return [];
      const { known, prepared } = state.character.spells;
      
      // 合并列表：包括“已准备的”和“已知的(通常是戏法)”
      // 这里做一个简化逻辑：如果是戏法，查 known；如果是 1+ 环，查 prepared
      // (为了兼容性，我们把两者去重合并显示，UI 层再过滤)
      const allIds = Array.from(new Set([...known, ...prepared]));
      
      return allIds
        .map(id => SPELL_LIBRARY.find(s => s.id === id))
        .filter(s => !!s) as SpellDefinition[];
    },

    // 5. 分组显示的法术书 (核心 Getter)
    // 返回结构：[ { level: 0, label: '戏法', spells: [], slots: null }, { level: 1, ... } ]
    groupedSpells(state): any[] {
      if (!state.character) return [];
      // @ts-ignore
      const spells = this.mySpells as SpellDefinition[];
      
      // 直接复用顶部的纯函数，不再重复写循环逻辑
      return groupSpellsByLevel(spells, state.character.spells.slots);
    },


    // 1. 总负重 (逻辑不变)
    totalWeight(state): number {
      // if (!state.character) return 0;
      // return state.character.inventory.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
      return this.totalInventoryWeight;
    },
    
    //递归计算物品重量 (修改：调用纯函数)
    getItemWeight: (state) => (item: any): number => {
      if (!state.character) return 0;
      // 直接调用文件顶部的纯函数，传入当前的 inventory 数组
      const val = computeItemWeightRecursive(item, state.character.inventory);
      return parseFloat(val.toFixed(2));
    },

    //计算总负重 (修改：基于根节点递归)
    totalInventoryWeight(state): number {
        if (!state.character) return 0;
        
        // 1. 获取当前的背包数据 (建立响应式依赖)
        const inventory = state.character.inventory;
        
        // 2. 找出所有“根节点物品” (背在身上的，而不是装在包里的)
        const roots = inventory.filter(i => !i.parentId);
        
        // 3. 使用纯函数计算总和
        // 只有根物品需要被累加，因为容器内的物品重量已经被 computeItemWeightRecursive 包含在容器重量里了
        const total = roots.reduce((sum, item) => {
            return sum + computeItemWeightRecursive(item, inventory);
        }, 0);

        return parseFloat(total.toFixed(2));
    },
    // 负重上限 (Carrying Capacity)
    // 规则：力量 * 15 (lb)
    carryingCapacity(state): number {
      if (!state.character) return 0;
      return state.character.stats.str * 15;
    }, 

    

    /**
     * 计算最终 AC (防御等级)
     * 规则：基础AC (取决于护甲类型) + 敏捷修正 + 盾牌加值
     */
    armorClass(state): number {
      // 0. 安全检查
      if (!state.character) return 10;
      const char = state.character;
      const combat = char.combat; // [ADD] 获取 combat 对象以读取 acMode
      
      // 1. 计算敏捷调整值 (向下取整)
      const dexMod = Math.floor((char.stats.dex - 10) / 2);

      // 2. 获取所有“已装备”的物品对象
      const equippedItems = char.equippedIds
        .map(id => char.inventory.find(i => i.instanceId === id))
        .filter(i => i !== undefined) as InventoryItem[];

      // =================================================================
      // 🛑 【现有逻辑保留】 核心判定：分离主甲和盾牌
      // =================================================================
      // 逻辑：类型是 armor，且 armorType 不是 'shield' 的就是主甲
      const mainArmor = equippedItems.find(i => {
        const d = i.data as any;
        return i.type === 'armor' && d.armorType !== 'shield';
      });

      // 找出所有盾牌
      const shields = equippedItems.filter(i => {
        const d = i.data as any;
        return i.type === 'armor' && d.armorType === 'shield';
      });
      // =================================================================

      // 4. 计算基础 AC
      let finalAC = 10 + dexMod; // 默认基准

      if (mainArmor) {
        // ===============================================================
        // 🛑 【现有逻辑保留】 穿甲时的计算公式 (重/中/轻)
        // ===============================================================
        const d = mainArmor.data as any;
        const base = d.ac || 10;
        
        switch (d.armorType) {
          case 'heavy':
            finalAC = base; // 重甲无敏捷
            break;
          case 'medium':
            finalAC = base + Math.min(dexMod, 2); // 中甲敏捷上限 2
            break;
          case 'light':
            finalAC = base + dexMod; // 轻甲全敏捷
            break;
          default:
            finalAC = base + dexMod;
        }
      } else {
        // ===============================================================
        // ✨ 【新增逻辑】 只有在“未判定出主甲”时，才检查无甲设置
        // ===============================================================
        const mode = combat.acMode || 'default';
        
        switch (mode) {
          case 'barbarian':
            // 野蛮人: 10 + Dex + Con
            const conMod = Math.floor((char.stats.con - 10) / 2);
            finalAC = 10 + dexMod + conMod;
            break;
          case 'monk':
            // 武僧: 10 + Dex + Wis
            const wisMod = Math.floor((char.stats.wis - 10) / 2);
            finalAC = 10 + dexMod + wisMod;
            break;
          case 'draconic':
            // 龙脉: 13 + Dex
            finalAC = 13 + dexMod;
            break;
          case 'default':
          default:
            // 默认: 10 + Dex
            finalAC = 10 + dexMod;
            break;
        }
      }

      // 5. 盾牌加值处理
      // D&D 5E 规则 - 同一时间只能获益于一面盾牌
      if (shields.length > 0) {
        // 无论装备了多少盾牌，只取第一面的数值
        const shieldBonus = (shields[0].data as any).ac || 2;
        
        // ✨ 【逻辑完善】 处理武僧持盾失效的特殊规则
        // 如果开启了武僧模式，但手里拿了盾牌，根据规则无甲防御失效，必须回退到普通模式
        if (!mainArmor && combat.acMode === 'monk') {
             // 回退公式：10 + Dex + Shield
             // (此时 finalAC 里已经包含了 Wis，我们需要修正它，或者直接覆盖)
             finalAC = 10 + dexMod + shieldBonus;
        } else {
             // 其他情况直接叠加
             finalAC += shieldBonus;
        }
      }

      return finalAC;
    },

    // 【新增】先攻 (Initiative)
    initiative(state): string {
      if (!state.character) return "+0";
      const dexMod = Math.floor((state.character.stats.dex - 10) / 2);
      return dexMod >= 0 ? `+${dexMod}` : `${dexMod}`;
    },

    // ✅ 4. 攻击面板 (核心修改：接入熟练度计算)
    attacks(state): any[] {
      if (!state.character) return [];
      const char = state.character;
      const hiddenIds = char.hiddenAttacks || []; 
      
      const strMod = Math.floor((char.stats.str - 10) / 2);
      const dexMod = Math.floor((char.stats.dex - 10) / 2);
      const pb = this.proficiencyBonus; // 获取 PB

      // 2. 获取激活的额外属性 (e.g. ['cha', 'int'])
      // 过滤掉 str 和 dex，因为它们是默认逻辑，不需要额外生成
      const activeModes = (char.activeAttackModes || [])
        .filter(k => k !== 'str' && k !== 'dex') as AbilityKey[];

      const attackList: any[] = [];

      // A. 徒手打击 (通常角色都熟练)
      const unarmedHit = strMod + pb;
      const unarmedDmg = 1 + strMod;
      attackList.push({
        id: 'unarmed',
        baseId: 'unarmed',
        name: '👊 徒手打击',
        hit: unarmedHit >= 0 ? `+${unarmedHit}` : `${unarmedHit}`,
        damage: `${unarmedDmg} (钝击)`,
        range: '5 尺',
        properties: [],
        isHidden: hiddenIds.includes('unarmed'),
        needsAmmo: false,
        ammoCount: null
      });

      // [新增] 徒手打击的额外属性版本 (例如武僧用感知/敏捷，或者特殊的种族能力)
      // 虽然规则上少见直接用智力打拳，但为了系统一致性，如果用户开了开关，我们也生成。
      activeModes.forEach(attr => {
        const mod = Math.floor((char.stats[attr] - 10) / 2);
        const hit = mod + pb; // 徒手总是熟练
        const dmg = 1 + mod;
        const attrLabel = ATTR_MAP[attr] || attr; // 需确保引入 ATTR_MAP 或手写映射
        
        attackList.push({
          id: `unarmed_${attr}`,
          baseId: 'unarmed',
          name: `👊 徒手打击 (${attrLabel})`,
          hit: hit >= 0 ? `+${hit}` : `${hit}`,
          damage: `${dmg} (钝击)`,
          range: '5 尺',
          properties: [],
          isHidden: hiddenIds.includes(`unarmed_${attr}`),
          needsAmmo: false,
          ammoCount: null
        });
      });

      // B. 武器逻辑
      char.inventory.forEach(item => {
        if (item.type !== 'weapon') return;
        const data = item.data as any;
        if (!data) return;
        const props = data.properties || [];

        // 🎯 判断是否熟练
        let isProficient = false;
        const cat = data.category || '';
        // 简单匹配逻辑：
        // simple_melee / simple_ranged -> 需要 'simple' 熟练
        // martial_melee / martial_ranged -> 需要 'martial' 熟练
        if (cat.startsWith('simple')) {
          if (char.proficiencies.weapons.includes('simple')) isProficient = true;
        } else if (cat.startsWith('martial')) {
          if (char.proficiencies.weapons.includes('martial')) isProficient = true;
        }
        // 单项白名单判定 (Specific Weapon Check)
        // 如果类别判定未通过，检查该具体武器是否在熟练列表中
        if (!isProficient && item.templateId) {
           if (char.proficiencies.weapons.includes(item.templateId)) {
             isProficient = true;
           }
        }

        // 弹药逻辑 (保持你之前的代码)
        const needsAmmo = props.includes('ammunition');
        const requiredType = data.requiredAmmoType;
        let ammoCount = 0;
        let ammoItemIds: string[] = [];
        if (needsAmmo && requiredType) {
          const matchingStacks = char.inventory.filter(i => {
            if (i.type !== 'consumable') return false;
            const cData = i.data as any;
            return cData && cData.ammoType === requiredType;
          });
          matchingStacks.forEach(stack => {
            ammoCount += (stack.quantity || 0);
            ammoItemIds.push(stack.instanceId);
          });
        }

        const isFinesse = props.includes('finesse');
        const isVersatile = props.includes('versatile');
        const isThrown = props.includes('thrown');
        const isTwoHanded = props.includes('two_handed');
        const isRanged = data.category?.includes('ranged') || (data.range && data.range.includes('/') && !isThrown);

        // --- 通用生成函数 ---
        // modVal: 用于计算的属性调整值 (数字)
        // suffix: ID 后缀 (如 '_cha')
        // label: 显示名称后缀 (如 ' (魅力)')
        // damageDice: 伤害骰子 (如 '1d8')
        // isOffhand: 是否副手 (不加伤害调整值)
        const addEntry = (modVal: number, suffix: string, label: string, damageDice: string, isOffhand = false) => {
          const derivedId = `${item.instanceId}${suffix}`;
          
          // 命中 = 属性调整值 + (熟练 ? PB : 0)
          const hitVal = modVal + (isProficient ? pb : 0);
          const hitStr = hitVal >= 0 ? `+${hitVal}` : `${hitVal}`;

          // 伤害 = 骰子 + 属性调整值 (副手只有负修正，没有正修正)
          let dmgModVal = modVal;
          if (isOffhand && modVal > 0) dmgModVal = 0;
          const dmgModStr = dmgModVal > 0 ? `+${dmgModVal}` : (dmgModVal < 0 ? `${dmgModVal}` : '');

          const rawType = data.damageType || 'none';
          const typeKey = rawType.toLowerCase();
          const dictItem = DAMAGE_TYPES ? (DAMAGE_TYPES as any)[typeKey] : undefined;
          const typeLabel = dictItem ? dictItem.label : typeKey;

          attackList.push({
            id: derivedId,
            baseId: item.instanceId,
            name: `${item.name}${label}`,
            hit: hitStr,
            damage: `${damageDice} ${dmgModStr} ${typeLabel}`,
            range: data.range || '5 尺',
            properties: props,
            isHidden: hiddenIds.includes(derivedId),
            needsAmmo: needsAmmo,
            ammoType: requiredType,
            ammoCount: needsAmmo ? ammoCount : null,
            availableAmmoIds: ammoItemIds
          });
        };

        // --- 1. 标准物理属性 (STR/DEX) ---
        if (isRanged) {
          addEntry(dexMod, '_ranged', '', data.damage); // 远程默认敏捷
        } else {
          // 近战默认力量
          addEntry(strMod, '_str', ' (力量)', data.damage);
          
          // 灵巧武器：额外生成敏捷版
          if (isFinesse) addEntry(dexMod, '_dex', ' (敏捷)', data.damage);
          
          // 灵活武器 (双手使用)：额外生成双手力量版
          if (isVersatile && data.versatileDamage) addEntry(strMod, '_2h', ' (双手)', data.versatileDamage);
          
          // 投掷武器：
          if (isThrown) {
             addEntry(strMod, '_thrown_str', ' (投掷/力)', data.range || '20/60');
             // 投掷且灵巧：额外生成敏捷投掷版
             if (isFinesse) addEntry(dexMod, '_thrown_dex', ' (投掷/敏)', data.range || '20/60');
          }

          // 副手攻击 (仅在非双手时)
          if (!isTwoHanded) {
             const bestStatIsDex = dexMod > strMod && isFinesse;
             const offhandMod = bestStatIsDex ? dexMod : strMod;
             // 注意：副手逻辑比较复杂，这里简化处理，如果开启了异能属性，通常不用异能打副手，除非有特定专长。
             // 暂时保持原样，只生成物理属性的副手。
             addEntry(offhandMod, '_off', ' (副手)', data.damage, true);
          }
        }
        // --- 2. [新增] 额外激活属性 (INT/WIS/CHA/CON) ---
        activeModes.forEach(attr => {
          const mod = Math.floor((char.stats[attr] - 10) / 2);
          const attrLabel = ATTR_MAP[attr] || attr; // 使用中文映射

          // 逻辑：魔法武器通常可以用单手或双手，如果它有 flexible，我们怎么处理？
          // 简化策略：
          // 1. 生成标准单手/默认伤害版本
          addEntry(mod, `_${attr}`, ` (${attrLabel})`, data.damage);

          // 2. 如果是 Versatile (如长剑)，也生成该属性的双手版本 (因为 Hexblade 可以双手持剑砍)
          if (isVersatile && data.versatileDamage) {
            addEntry(mod, `_${attr}_2h`, ` (${attrLabel}/双手)`, data.versatileDamage);
          }
          
          // 3. 如果是投掷武器，也生成该属性的投掷版本 (如魔法飞锤)
          if (isThrown) {
            addEntry(mod, `_${attr}_thrown`, ` (${attrLabel}/投掷)`, data.range || '20/60');
          }
        });

      });
      return attackList;
    },

    // --- 新增：熟练加值 (PB) ---
    proficiencyBonus(state): number {
      if (!state.character) return 2;
      // 公式: ceil(level / 4) + 1
      return Math.ceil(state.character.profile.level / 4) + 1;
    },

    //护甲穿戴检查 (用于 UI 警示)
    // 返回 true 表示穿着了不熟练的护甲
    isWearingNonProficientArmor(state): boolean {
      if (!state.character) return false;
      const char = state.character;
      
      // 找出所有装备的护甲
      const equippedArmor = char.inventory.filter(i => 
        char.equippedIds.includes(i.instanceId) && i.type === 'armor'
      );

      for (const item of equippedArmor) {
        const data = item.data as any;
        const type = data.armorType; // 'light', 'medium', 'heavy', 'shield'
        
        // 如果角色没有这个类型的熟练项，则报警
        if (type && !char.proficiencies.armor.includes(type)) {
          return true;
        }
      }
      return false;
    },



    // --- 技能列表计算引擎 ---
    skills(state): any[] {
      if (!state.character) return [];
      const char = state.character;
      const pb = this.proficiencyBonus;

      // 【修改点】不需要 await import 了，直接使用顶部引入的 SKILL_DEFINITIONS
      return Object.entries(SKILL_DEFINITIONS).map(([key, def]) => {
        // 1. 找对应属性的调整值
        const attrVal = char.stats[def.attr as keyof typeof char.stats];
        const attrMod = Math.floor((attrVal - 10) / 2);
        
        // 2. 找熟练等级
        const isProficient = !!char.skillProficiencies[key]; // key 应该是 def.key 或者 map 的 key
        
        // 3. 计算最终值
        // 旧逻辑：const total = attrMod + (profLevel * pb);
        // 新逻辑：如果是熟练(true)，就加上 pb，否则不加
        const total = attrMod + (isProficient ? pb : 0);
        
        return {
          key: key,
          label: def.label,
          attr: def.attr.toUpperCase(),
          mod: total >= 0 ? `+${total}` : `${total}`,
          rawMod: total,
          profLevel: isProficient
        };
      });
    },

    // --- 新增：被动觉察 (Passive Perception) ---
    passivePerception(state): number {
      // 依赖上面的 skills 计算结果
      // @ts-ignore (因为 getter 互相调用在 TS 中有时需要显式类型，这里偷懒一下)
      const skills = this.skills; 
      const perception = skills.find((s: any) => s.key === 'perception');
      return 10 + (perception ? perception.rawMod : 0);
    },

    // --- 新增：升级所需经验值 ---
    nextLevelXp(state): number | null {
      if (!state.character) return null;
      const currentLevel = state.character.profile.level;
      if (currentLevel >= 20) return null;

      const nextStage = XP_TABLE.find(x => x.level === currentLevel + 1);
      return nextStage ? nextStage.xp : null;
    },

    //获取根目录物品 (用于 UI 列表显示)
    // 只有 parentId 为 undefined 的物品才应该直接显示在顶层列表
    rootInventory(state): any[] {
      if (!state.character) return [];
      return state.character.inventory.filter(i => !i.parentId);
    },

    //获取某容器内的所有物品
    getContainerContents: (state) => (containerId: string) => {
      if (!state.character) return [];
      return state.character.inventory.filter(i => i.parentId === containerId);
    },

    
  },

  actions: {
    // ==========================================
    // ✨ 法术管理 Actions
    // ==========================================

    // 确保有 learnSpell 和 togglePreparedSpell；修改返回值：boolean (true=新学会, false=已存在)
    learnSpell(spellId: string, source: 'primary' | 'secondary' = 'primary'): boolean {
      if (!this.character) return false;
      if (!this.character.spells.known.includes(spellId)) {
        this.character.spells.known.push(spellId);
        
        // 初始化 spellSources 字典（防御性编程）
        if (!this.character.spells.spellSources) {
          this.character.spells.spellSources = {};
        }
        // 记录该法术的来源
        this.character.spells.spellSources[spellId] = source;
        
        this.save();
        return true; // successful
      } else {
        return false; // fail
      }
    },

    togglePreparedSpell(spellId: string) {
      if (!this.character) return;
      const list = this.character.spells.prepared;
      const idx = list.indexOf(spellId);
      if (idx > -1) {
        list.splice(idx, 1); // 取消准备
      } else {
        list.push(spellId); // 准备
      }
      this.save();
    },

    forgetSpell(spellId: string) {
      if (!this.character) return;
      this.character.spells.known = this.character.spells.known.filter(id => id !== spellId);
      this.character.spells.prepared = this.character.spells.prepared.filter(id => id !== spellId);
      this.save();
    },

    // 1. 消耗/恢复法术位
    updateSpellSlot(level: number, newVal: number) {
      if (!this.character) return;
      // 边界检查
      if (newVal < 0) newVal = 0;
      if (newVal > this.character.spells.slots.max[level]) {
        newVal = this.character.spells.slots.max[level];
      }
      this.character.spells.slots.current[level] = newVal;
      this.save();
    },

    //更新法术位上限 (用于法术书配置)
    updateSpellSlotMax(level: number, newMax: number) {
      if (!this.character) return;
      
      // 1. 边界限制 (0 - 99)
      if (newMax < 0) newMax = 0;
      if (newMax > 99) newMax = 99;

      // 2. 更新上限
      this.character.spells.slots.max[level] = newMax;

      // 3. 自动修正：如果当前法术位超过了新上限，将其砍掉
      if (this.character.spells.slots.current[level] > newMax) {
        this.character.spells.slots.current[level] = newMax;
      }

      this.save();
    },

    // 邪术师契约法术位专门的操作方法
    updatePactSlot(newVal: number) {
      if (!this.character || !this.character.spells.pactSlots) return;
      const pact = this.character.spells.pactSlots;
      if (newVal < 0) newVal = 0;
      if (newVal > pact.max) newVal = pact.max;
      pact.current = newVal;
      this.save();
    },

    updatePactSlotMax(newMax: number, newLevel?: number) {
      if (!this.character) return;
      if (!this.character.spells.pactSlots) {
        this.character.spells.pactSlots = { level: 1, current: 0, max: 0 };
      }
      const pact = this.character.spells.pactSlots;
      
      if (newMax < 0) newMax = 0;
      pact.max = newMax;
      
      // 允许同时更新契约法术位的环阶 (因为邪术师的法术位会自动升级)
      if (newLevel !== undefined) {
        pact.level = newLevel;
      }
      
      if (pact.current > pact.max) {
        pact.current = pact.max;
      }
      this.save();
    },

    // 2. 长休 (恢复所有法术位)
    recoverAllSlots() {
      if (!this.character) return;
      const slots = this.character.spells.slots;
      // 遍历 1-9 环，把 current 设为 max
      for (let i = 1; i < slots.max.length; i++) {
        slots.current[i] = slots.max[i];
      }
      // 恢复血量和重置骰子逻辑也可以放在这里调用
      this.save();
    },
    
    // 强制移除准备
    unprepareSpell(spellId: string) {
      if (!this.character) return;
      this.character.spells.prepared = this.character.spells.prepared.filter(id => id !== spellId);
      this.save();
    },

    // 6. 更新施法能力配置 (修改属性、DC、法术位上限等)
    updateSpellConfig(path: string, value: any) {
        if (!this.character) return;
        // 简单粗暴的路径更新，实际项目中建议拆分
        if (path === 'ability') this.character.spells.spellcastingAbility = value;
        // 如果是更新法术位上限 array
        // ... (在UI组件里直接操作 character 对象通常是反模式，但为了极简，这里暂略)
        this.save();
    },  
    
    //更新 Bio 数据的通用方法
    updateBio(field: keyof import('../types/Character').CharacterBio, value: string) {
      if (!this.character) return;
      this.character.bio[field] = value;
      this.save();
    },

    // [新增] 切换攻击模式开关
    toggleAttackMode(attr: AbilityKey) {
      if (!this.character) return;
      
      // 初始化数组 (防御性编程)
      if (!this.character.activeAttackModes) {
        this.character.activeAttackModes = [];
      }

      const list = this.character.activeAttackModes;
      const idx = list.indexOf(attr);

      if (idx > -1) {
        list.splice(idx, 1); // 关闭
      } else {
        list.push(attr);     // 开启
      }
      this.save();
    },

    // 载入角色时，确保 equippedIds 存在
    loadCharacter(id: string) {
      const charStore = useCharacterStore();
      const data = charStore.getCharacterData(id);
      
      if (data) {
        // ✅ 补全可能缺失的字段 (兼容旧数据)
        if (!data.equippedIds) data.equippedIds = [];
        if (!data.hiddenAttacks) data.hiddenAttacks = [];

        // 👇👇👇【新增】初始化钱包 (如果存档里没有) 👇👇👇
        if (!data.wallet) {
          data.wallet = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
        }
        // 🔥🔥🔥 强制初始化熟练项结构 🔥🔥🔥
        // 如果 proficiencies 不存在，或者其中的子数组不存在，全部补齐
        if (!data.proficiencies) {
          data.proficiencies = { armor: [], weapons: [], tools: [], languages: [] };
        } else {
          // 深度防御：防止 proficienties 存在但 tools 缺失的情况
          if (!data.proficiencies.armor) data.proficiencies.armor = [];
          if (!data.proficiencies.weapons) data.proficiencies.weapons = [];
          if (!data.proficiencies.tools) data.proficiencies.tools = [];
          if (!data.proficiencies.languages) data.proficiencies.languages = [];
        }
        /// 新增 初始化额外攻击属性开关
        if (!data.activeAttackModes){
          data.activeAttackModes = [];
        }

        // 补全战斗数据：生命骰类型
        // 确保旧存档加载后，不仅有数量，也有类型
        if (!data.combat.hitDiceType) {
           data.combat.hitDiceType = 'd8'; // 默认为 d8
        }

        // 🔥🔥🔥 法术数据初始化 🔥🔥🔥
        if (!data.spells) {
          data.spells = {
            spellcastingAbility: 'int', // 默认为智力，用户可改
            spellSaveDC: 10,
            spellAttackMod: 2,
            slots: {
              // 0-9环，初始化全为 0
              current: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              max:     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            pactSlots: {
              level: 1,
              current: 0,
              max: 0
            },
            known: [],
            prepared: []
          };
        }

        //补全可能缺失的新增字段，兼容老存档
        if (!data.spells.spellSources) {
          data.spells.spellSources = {};
        }
        if (!data.spells.pactSlots) {
          data.spells.pactSlots = { level: 1, current: 0, max: 0 };
        }

        // 🔥🔥🔥 新增：角色简介初始化 🔥🔥🔥
        if (!data.bio) {
          data.bio = {
            age: '', height: '', weight: '', eyes: '', skin: '', hair: '',
            personalityTraits: '', ideals: '', bonds: '', flaws: '',
            backstory: '', featureText: '', treasureNotes: ''
          };
        }

        // ✅ 初始化 Profile 新字段 (防止 undefined)
        if (!data.profile.playerName) data.profile.playerName = '';
        if (!data.profile.background) data.profile.background = '';
        if (!data.profile.alignment) data.profile.alignment = '';
        
        
        this.character = data;
      }
    },

    // ✅ 新增 Action: 切换固定熟练项 (护甲/武器)
    // category: 'armor' | 'weapons'
    toggleProficiency(category: 'armor' | 'weapons', key: string) {
      if (!this.character) return;
      const list = this.character.proficiencies[category];
      const idx = list.indexOf(key);
      if (idx > -1) {
        list.splice(idx, 1);
      } else {
        list.push(key);
      }
      this.save();
    },

    // 修复后的 Action: 添加列表项 (增强了健壮性)
    addProficiencyList(category: 'tools' | 'languages', val: string) {
      if (!this.character || !val.trim()) return;
      
      // 1. 安全检查：如果 proficiencies 整个不存在，初始化它
      if (!this.character.proficiencies) {
        this.character.proficiencies = { armor: [], weapons: [], tools: [], languages: [] };
      }

      // 2. 安全检查：如果具体的 category (如 'tools') 数组不存在，初始化它
      // (这是为了兼容旧存档的关键步骤)
      if (!this.character.proficiencies[category]) {
        this.character.proficiencies[category] = [];
      }

      // 3. 执行添加 (避免重复)
      const list = this.character.proficiencies[category];
      if (!list.includes(val)) {
        list.push(val);
        this.save();
      }
    },

    // ✅ 新增 Action: 移除列表项
    removeProficiencyList(category: 'tools' | 'languages', index: number) {
      if (!this.character) return;
      this.character.proficiencies[category].splice(index, 1);
      this.save();
    },

    // 辅助：确保钱包存在
    initWalletIfMissing() {
      if (this.character && !this.character.wallet) {
        this.character.wallet = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
      }
    },

    /**
     * ✅ 升级版：货币修改 (GP 不自动合并为 PP)
     */
    modifyCurrency(type: keyof typeof CURRENCY_RATES, amount: number): boolean {
      console.log('take!');
      
      if (!this.character) return false;
      this.initWalletIfMissing();
      const wallet = this.character!.wallet;

      // 1. 初始化两个资金池 (单位：铜币 CP)
      // 高位池：只包含 PP
      let highPoolPP = wallet.pp; 
      
      // 低位池：包含 GP, EP, SP, CP (我们将在这里进行大部分运算)
      let lowPoolCP = 
        (wallet.gp * CURRENCY_RATES.gp) +
        (wallet.ep * CURRENCY_RATES.ep) +
        (wallet.sp * CURRENCY_RATES.sp) +
        (wallet.cp * CURRENCY_RATES.cp);

      // 2. 根据操作类型，决定动用哪个池子
      if (type === 'pp') {
        // 如果直接操作 PP，只动高位池
        highPoolPP += amount;
      } else {
        // 如果操作其他货币，动低位池
        lowPoolCP += amount * CURRENCY_RATES[type];
      }

      // 3. 债务平衡 (自动找零逻辑)
      
      // 情况 A: 低位池不够了 (比如有 1PP, 0GP，花了 10GP)
      // 借用高位池 (打散 PP 变成 GP/SP/CP)
      while (lowPoolCP < 0) {
        if (highPoolPP > 0) {
          highPoolPP -= 1; // 破开 1 个 PP
          lowPoolCP += CURRENCY_RATES.pp; // 获得 1000 CP
        } else {
          break; // 没 PP 可借了，彻底没钱
        }
      }

      // 情况 B: 高位池不够了 (比如有 0PP, 20GP，花了 1PP)
      // 借用低位池 (用 GP 凑出 PP 支付)
      while (highPoolPP < 0) {
        const cost = CURRENCY_RATES.pp; // 1 PP 的价格
        if (lowPoolCP >= cost) {
          lowPoolCP -= cost; // 支付 1000 CP
          highPoolPP += 1;   // 填补 1 PP 的空缺
        } else {
          break; // 低位池也不够还债
        }
      }

      // 4. 最终破产检查
      if (lowPoolCP < 0 || highPoolPP < 0) {
        return false; // 交易失败
      }

      // 5. 结算入账
      // PP 保持独立
      wallet.pp = highPoolPP;

      // 低位池重新铸币 (最高只到 GP，不再合成 PP)
      let remaining = lowPoolCP;

      wallet.gp = Math.floor(remaining / CURRENCY_RATES.gp);
      remaining %= CURRENCY_RATES.gp;

      wallet.ep = 0; // EP 继续熔断归零

      wallet.sp = Math.floor(remaining / CURRENCY_RATES.sp);
      remaining %= CURRENCY_RATES.sp;

      wallet.cp = remaining;

      this.save();
      return true;
    },

    // ✅ 【新增】更新钱包余额
    // type 参数对应 Wallet 接口的 key ('cp', 'sp', 'gp', 'pp')
    updateWallet(type: 'cp' | 'sp' | 'ep' | 'gp' | 'pp', value: number) {
      if (!this.character) return;
      
      // 双重保险：如果当前角色没钱包，先给一个空的
      if (!this.character.wallet) {
        this.character.wallet = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
      }
      
      this.character.wallet[type] = value;
      this.save(); // 自动保存
    },
    
    save() {
      if (this.character) {
        this.character.lastModified = Date.now();
        const charStore = useCharacterStore();
        charStore.saveCharacterData(this.character);
      }
    },

    // ==========================================================
    // 🧠 核心逻辑：创建与合并
    // ==========================================================

    /**
     * [内部] 纯粹的新建逻辑 (总是创建新行)
     */
    _createNewItem(libraryId: string, quantity: number, parentId?: string, index?: number) {
       const newItem = createItemFromLibrary(libraryId);
       if (!newItem) return;

       newItem.quantity = quantity;
       newItem.parentId = parentId;

       // 如果指定了 index (拖拽插入)，用 splice；否则 push 到最后
       if (typeof index === 'number') {
         this.character!.inventory.splice(index, 0, newItem);
       } else {
         this.character!.inventory.push(newItem);
       }
       
       this.save();
    },

    /**
     * [内部] 尝试合并逻辑
     * 只有白名单内的物品会真的去合并，否则直接新建
     */
    _addOrMerge(libraryId: string, quantity: number, targetParentId?: string) {
      if (!this.character) return;

      // 🚨 1. 白名单检查 (Whitelist Check)
      // 只有这些 ID 允许堆叠，其他物品(药水、火把、武器等)一律分开存放
      const STACKABLE_IDS = ['arrows', 'bolts', 'dart'];
      const canStack = STACKABLE_IDS.includes(libraryId);

      if (!canStack) {
        // 如果不允许堆叠，直接转去新建
        this._createNewItem(libraryId, quantity, targetParentId);
        return;
      }

      // 🔍 2. 搜索：在目标容器内，是否已经有同类物品？
      const existingItem = this.character.inventory.find(
        i => i.templateId === libraryId && i.parentId === targetParentId
      );

      if (existingItem) {
        // ✅ A. 合并路径
        existingItem.quantity += quantity;
        this.save();
      } else {
        // ❎ B. 新建路径
        this._createNewItem(libraryId, quantity, targetParentId);
      }
    },

    /**
     * 内部处理：解压套组
     */
    _addPack(packId: string, index?: number, parentId?: string) {
      const packDef = PACK_LIBRARY.find(p => p.id === packId);
      if (!packDef) return;

      let targetContainerId = parentId;

      // 1. 创建容器 (如果定义了 containerId)
      if (packDef.containerId) {
        // 创建该容器实例 (比如背包)
        const containerItem = createItemFromLibrary(packDef.containerId);
        
        if (containerItem) {
          containerItem.parentId = parentId; // 背包放在哪 (比如地上，或者另一个大箱子里)
          
          // 插入到指定位置
          if (typeof index === 'number') {
            this.character!.inventory.splice(index, 0, containerItem);
          } else {
            this.character!.inventory.push(containerItem);
          }
          
          // 接下来的物品都装进这个新背包里
          targetContainerId = containerItem.instanceId; 
        }
      }

      // 2. 创建内容物
      packDef.contents.forEach(content => {
        // 使用 _addOrMerge 确保如果包里本来就有同类物品(如箭矢)可以自动堆叠
        // 强制 parentId 为刚创建的容器 ID
        this._addOrMerge(content.id, content.quantity, targetContainerId);
      });
      
      this.save();
    },
    /**
     * [对外接口] 添加物品
     * 包含业务逻辑路由：自动箭袋、默认数量等
     */
    addItem(libraryId: string, index?: number, parentId?: string) {
      if (!this.character) return;

      // ✅ 拦截套组逻辑
      if (PACK_LIBRARY.some(p => p.id === libraryId)) {
        this._addPack(libraryId, index, parentId);
        return;
      }

      // =================================================
      // 🏹 场景 A：箭矢与弩矢 (自动进箭袋 + 堆叠)
      // =================================================
      if (libraryId === 'arrows' || libraryId === 'bolts') {
        const AMMO_BUNDLE_QTY = 20; // 商店一捆的数量

        // 1. 寻找箭袋 (优先用指定的 parentId，没有则去搜现有的，再没有才买新的)
        let targetContainerId = parentId;
        
        if (!targetContainerId) {
          const existingQuiver = this.character.inventory.find(i => i.templateId === 'quiver');
          if (existingQuiver) {
            targetContainerId = existingQuiver.instanceId;
          } else {
            // 自动买个箭袋
            const newQuiver = createItemFromLibrary('quiver');
            if (newQuiver) {
              this.character.inventory.push(newQuiver);
              targetContainerId = newQuiver.instanceId;
            }
          }
        }

        // 2. 执行合并逻辑
        // 注意：这里不需要传 index，因为自动进箭袋意味着位置由箭袋决定
        this._addOrMerge(libraryId, AMMO_BUNDLE_QTY, targetContainerId);
        return;
      }

      // =================================================
      // 🎯 场景 B：飞镖 (仅堆叠，不进箭袋)
      // =================================================
      if (libraryId === 'dart') {
        // 如果用户是“点击添加”(index undefined)，我们尝试合并
        if (typeof index === 'undefined') {
           this._addOrMerge(libraryId, 1, parentId);
           return;
        }
        // 如果用户是“拖拽插入”(index number)，通常意味着他想拆分或放在特定位置
        // 这种情况下，我们遵从用户的操作，不强制合并，直接新建
        // (如果你希望拖拽也强制合并，可以把上面这个 if 判断去掉，直接调 _addOrMerge)
      }

      // =================================================
      // 📦 场景 C：其他所有物品 (药水、武器、杂物)
      // =================================================
      // 所有的“不可堆叠”逻辑都在 _addOrMerge 的白名单里被拦截了，
      // 但为了代码清晰，我们这里直接调用 _createNewItem 也可以。
      // 为了保持逻辑统一，我们还是调用 _addOrMerge，让白名单去拒绝合并。
      
      // 数量默认 1
      this._addOrMerge(libraryId, 1, parentId);
      
      // 注意：如果带有 index (拖拽)，_addOrMerge 内部目前的实现比较简单，
      // 如果你想支持“拖拽非堆叠物品到特定位置”，建议直接调 _createNewItem：
      // if (typeof index === 'number') {
      //    this._createNewItem(libraryId, 1, parentId, index);
      // } else {
      //    this._addOrMerge(libraryId, 1, parentId);
      // }
    },

    removeItem(instanceId: string) {
      if (!this.character) return;
      this.character.inventory = this.character.inventory.filter(i => i.instanceId !== instanceId);
      // 同时从装备栏移除
      this.character.equippedIds = this.character.equippedIds.filter(id => id !== instanceId);
      this.save();
    },

    moveItemToTrash(instanceId: string) {
      if (!this.character) return;
      // 1. 模拟动作 A：手动把物品放进垃圾桶数组
      const item = this.character.inventory.find(i => i.instanceId === instanceId);
      if (item) {
        this.trash.push(item);
        
        // 2. 执行动作 B：从背包移除
        this.removeItem(instanceId);
      }
    },

    // 更新背包中的某个物品实例
    updateInventoryItem(newItem: InventoryItem) {
      if (!this.character) return;
      
      const index = this.character.inventory.findIndex(i => i.instanceId === newItem.instanceId);
      if (index > -1) {
        // 直接替换
        this.character.inventory[index] = newItem;
        this.save();
      }
    },

    // 【新】更新装备栏列表
    updateEquippedList(newIds: string[]) {
        if (!this.character) return;
        // 去重，防止同一个物品被放进去两次
        this.character.equippedIds = [...new Set(newIds)];
        this.save();
    },

    // 更新属性 (例如把 strength 改成 18)
    updateStat(statName: keyof Character['stats'], value: number) {
      if (!this.character) return;
      this.character.stats[statName] = value;
      this.save();
    },

    toggleSkill(skillKey: string) {
      if (!this.character) return;

      if (!this.character.skillProficiencies) {
        this.character.skillProficiencies = {};
      }

      // 1. 获取当前状态 (如果是 undefined 则视为 false)
      const current = !!this.character.skillProficiencies[skillKey];

      // 2. 取反 (true 变 false, false 变 true)
      const next = !current;

      // 3. 赋值
      this.character.skillProficiencies[skillKey] = next;
      this.save();
    },

    // 【新增】切换豁免熟练度
  toggleSavingThrow(attrKey: string) {
    // 1. 安全检查
    if (!this.character) return;

    // 2. 初始化对象（如果尚未存在）
    // 为了防止 undefined 报错，如果 savingThrows 为空，先给它赋一个默认全 false 的值
    if (!this.character.savingThrows) {
      this.character.savingThrows = {
        str: false, dex: false, con: false, int: false, wis: false, cha: false
      };
    }

    // 3. 类型断言
    // 我们知道前端传来的 attrKey 肯定是 'str', 'dex' 等之一，所以断言为 keyof stats
    const key = attrKey as keyof typeof this.character.stats;

    // 4. 切换状态 (取反)
    const current = !!this.character.savingThrows[key];
    this.character.savingThrows[key] = !current;

    // 5. 保存更改
    this.save();
  },

  // 【调试版】增加 XP
    addExperience(amount: number) {
      //console.log("1. addExperience 被调用，增加值:", amount);

      if (!this.character) {
        console.error("2. 错误：character 为空");
        return;
      }

      // 1. 增加 XP
      const oldXp = this.character.profile.xp;
      this.character.profile.xp += amount;
      
      // 防止负数
      if (this.character.profile.xp < 0) this.character.profile.xp = 0;
      
      //console.log(`3. XP 更新: ${oldXp} -> ${this.character.profile.xp}`);

      // 2. 计算新等级
      let newLevel = 1;
      // 倒序查找：找到第一个 "当前XP >= 标准XP" 的等级
      for (let i = XP_TABLE.length - 1; i >= 0; i--) {
        if (this.character.profile.xp >= XP_TABLE[i].xp) {
          newLevel = XP_TABLE[i].level;
          //console.log(`4. 匹配等级表: XP ${XP_TABLE[i].xp} (等级 ${newLevel})`);
          break;
        }
      }

      //console.log(`5. 当前等级: ${this.character.profile.level}, 计算等级: ${newLevel}`);

      // 3. 如果等级变了，更新等级
      if (this.character.profile.level !== newLevel) {
        //console.log(`6. !!! 升级 !!! ${this.character.profile.level} -> ${newLevel}`);
        this.character.profile.level = newLevel;
      } else {
        //console.log("6. 等级未发生变化");
      }

      // 4. 保存
      this.save();
      //console.log("7. 已保存");
    },


    // 【新增】更新角色基础信息 (Profile) 的通用方法
  updateProfile(field: string, value: any) {
    if (!this.character) return;

    // 使用断言 (as any) 允许动态通过字符串 key 修改属性
    (this.character.profile as any)[field] = value;
    
    // 保存更改
    this.save();
  },

  // 重置 XP
    resetExperience() {
        //console.log("Store: resetExperience 动作被调用了！");

        if (!this.character) {
            //console.error("Store: 错误！this.character 是空的 (null/undefined)");
            return;
        }

        //console.log("Store: 当前 XP 是", this.character.profile.xp);
        //console.log("Store: 正在执行重置...");

        // 执行重置
        this.character.profile.xp = 0;
        this.character.profile.level = 1;

        //console.log("Store: 重置完成。XP 现在是", this.character.profile.xp);

        // 保存
        this.save();
        //console.log("Store: 已调用 save() 保存数据");
    },

    // =========================================
    //         战斗面板专属 Actions
    // =========================================

    // 1. 造成伤害
    applyDamage(amount: number) {
      if (!this.character || amount <= 0) return;
      const combat = this.character.combat;

      let remainingDmg = amount;

      // 先扣临时生命
      if (combat.tempHp > 0) {
        if (combat.tempHp >= remainingDmg) {
          combat.tempHp -= remainingDmg;
          remainingDmg = 0;
        } else {
          remainingDmg -= combat.tempHp;
          combat.tempHp = 0;
        }
      }

      // 再扣当前生命
      if (remainingDmg > 0) {
        combat.hpCurrent -= remainingDmg;
        if (combat.hpCurrent < 0) combat.hpCurrent = 0;
      }

      this.save();
    },

    // 2. 治疗
    applyHeal(amount: number) {
      if (!this.character || amount <= 0) return;
      const combat = this.character.combat;

      combat.hpCurrent += amount;
      if (combat.hpCurrent > combat.hpMax) combat.hpCurrent = combat.hpMax;

      // 治疗后，自动移除濒死状态（重置死亡豁免）
      if (combat.hpCurrent > 0) {
        this.resetDeathSaves();
      }

      this.save();
    },

    // 3. 一键回满
    fullHeal() {
      if (!this.character) return;
      const combat = this.character.combat;
      combat.hpCurrent = combat.hpMax;
      this.resetDeathSaves();
      this.save();
    },

    // 4. 设置临时生命 (覆盖模式)
    setTempHp(amount: number) {
      if (!this.character) return;
      this.character.combat.tempHp = amount;
      this.save();
    },

    // 5. 更新通用战斗数值 (速度, 生命骰, 状态)
    updateCombatStat(field: keyof Character['combat'], value: any) {
      if (!this.character) return;
      (this.character.combat as any)[field] = value;
      this.save();
    },

    // 6. 重置死亡豁免
    resetDeathSaves() {
      if (!this.character) return;
      this.character.combat.deathSaves = { success: 0, failure: 0 };
      this.save();
    },

    // 7. 切换激励 (index: 0, 1, 2)
    toggleInspiration(index: number) {
      if (!this.character) return;
      // 确保数组存在
      if (!this.character.combat.inspiration) {
        this.character.combat.inspiration = [false, false, false];
      }
      this.character.combat.inspiration[index] = !this.character.combat.inspiration[index];
      this.save();
    },

    // 【新增】切换攻击条目的显隐状态
    toggleAttackVisibility(derivedId: string) {
      if (!this.character) return;
      
      // 初始化数组
      if (!this.character.hiddenAttacks) {
        this.character.hiddenAttacks = [];
      }

      const list = this.character.hiddenAttacks;
      const index = list.indexOf(derivedId);

      if (index > -1) {
        // 如果已存在，则移除 (即“取消隐藏”)
        list.splice(index, 1);
      } else {
        // 如果不存在，则添加 (即“隐藏”)
        list.push(derivedId);
      }
      
      this.save();
    },

    // 从背包中通过 ID 移除物品 (复用现有的 removeItem 即可)
    // 现有的 removeItem 逻辑是：从 inventory 移除，从 equippedIds 移除，并保存
    // 这完全符合我们的需求：当物品被“克隆”进垃圾箱后，我们调用这个方法删掉背包里的原件。

    // 为了方便，我们可以加一个专门清空垃圾箱的方法（可选）
    emptyTrash() {
      this.trash = [];
    },
    
    // ==========================================
    // 📦 物品移动与排序核心逻辑
    // ==========================================

    // [内部助手] 将物品物理移动到数组的指定位置
    _reinsertItem(item: any, index?: number) {
      if (!this.character) return;
      // 1. 先从旧位置移除
      const oldIndex = this.character.inventory.indexOf(item);
      if (oldIndex > -1) {
        this.character.inventory.splice(oldIndex, 1);
      }

      // 2. 计算新位置
      // 如果没有指定 index，默认插到最后
      let finalIndex = (typeof index === 'number') ? index : this.character.inventory.length;

      // ⚠️ 关键修正：如果物品原本在目标位置的前面，移除它会导致后面的元素下标 -1
      // 所以我们需要把目标 index 也对应 -1，保证相对位置正确
      if (oldIndex > -1 && oldIndex < finalIndex) {
        finalIndex--;
      }

      // 3. 插入新位置
      this.character.inventory.splice(finalIndex, 0, item);
    },

    // 动作：把物品放入容器 (支持指定位置)
    moveItemToContainer(itemId: string, containerId: string, targetIndex?: number) {
      if (!this.character) return;
      // 防止套娃
      if (itemId === containerId) return;

      const item = this.character.inventory.find(i => i.instanceId === itemId);
      if (item) {
        item.parentId = containerId; // 修改归属
        this._reinsertItem(item, targetIndex); // 修改物理顺序
        this.save();
      }
    },

    // 动作：把物品移到根目录 (支持指定位置)
    moveItemToRoot(itemId: string, targetIndex?: number) {
      if (!this.character) return;

      const item = this.character.inventory.find(i => i.instanceId === itemId);
      if (item) {
        item.parentId = undefined; // 清空归属
        this._reinsertItem(item, targetIndex); // 修改物理顺序
        this.save();
      }
    },

    // ✅ 新增：同级排序 (只改位置，不改 parentId)
    reorderItem(itemId: string, targetIndex: number) {
      if (!this.character) return;
      const item = this.character.inventory.find(i => i.instanceId === itemId);
      if (item) {
        this._reinsertItem(item, targetIndex);
        this.save();
      }
    },

    // ✅ 【新增】更新物品数量 (用于点击 +/- 按钮)
    updateItemQuantity(instanceId: string, delta: number) {
      if (!this.character) return;
      
      const item = this.character.inventory.find(i => i.instanceId === instanceId);
      if (item) {
        const newQty = item.quantity + delta;
        // 限制最小数量为 1。如果用户想删除，应该点击删除按钮，而不是减到 0。
        if (newQty < 1) return;
        
        item.quantity = newQty;
        this.save();
      }
    },

    toggleSpellbook(isOpen: boolean) {
    this.ui.isSpellbookOpen = isOpen;
  }

  }
});