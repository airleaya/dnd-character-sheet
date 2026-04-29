// src/types/Library.ts

import type { DamageTypeKey } from '../data/rules/damageTypes';

// ==========================================
// 1. 基础枚举与类型
// ==========================================

// ✅ 1. 扩充物品类型枚举
export type ItemType = 
  | 'weapon' 
  | 'armor' 
  | 'gear'       // 冒险装备 (普通杂物)
  | 'tool'       // 工具
  | 'consumable' // 消耗品
  | 'treasure'   // 宝物/贸易品
  | 'container'  // 容器 (背包等)
  | 'pack'       // 套组
  | 'misc';      // 其他未分类

export type CurrencyUnit = 'cp' | 'sp' | 'ep' | 'gp' | 'pp';

// 定义弹药类型枚举 (放在文件顶部附近)
export type AmmoTypeKey = 'arrow' | 'bolt' | 'bullet' | 'needle' | 'none';


// 属性键名类型 (用于工具检定关联)
export type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export type ItemRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'very_rare'
  | 'legendary'
  | 'artifact'
  | 'varies';

export type EnchantmentEffect =
  | { kind: 'attack_bonus'; value: number; note?: string }
  | { kind: 'damage_bonus'; value: number; damageType?: string; note?: string }
  | { kind: 'ac_bonus'; value: number; note?: string }
  | { kind: 'extra_damage'; dice: string; damageType: string; note?: string }
  | { kind: 'ability_override'; ability: AbilityKey | string; value: number; note?: string }
  | { kind: 'skill_bonus'; skill: string; value: number; note?: string }
  | { kind: 'resistance'; damageType: string; note?: string }
  | { kind: 'spell_grant'; spellId?: string; name?: string; note?: string }
  | { kind: 'custom_text'; text: string };

export type MagicTraitSource = 'preset' | 'custom';
export type MagicTraitType = 'damage' | 'spell';
export type MagicTraitActivationMode = 'always' | 'charged';

export interface MagicTraitCharges {
  current: number;
  max: number;
  resetCondition?: string;
  resetFormula?: string;
}

export interface ItemMagicTrait {
  id: string;
  source: MagicTraitSource;
  type: MagicTraitType;
  name: string;
  description: string;
  activationMode: MagicTraitActivationMode;
  participatesInDamage: boolean;
  damageDice?: string;
  damageBonus?: number;
  damageType?: DamageTypeKey | string;
  spellId?: string;
  spellExtraDescription?: string;
  charges?: MagicTraitCharges;
}

export interface ItemMagicVisuals {
  inventoryBackground?: string;
  attackBackground?: string;
  nameColor?: string;
}

export interface ItemMagicDefinition {
  isMagic: boolean;
  magicBonus?: number;
  rarity?: ItemRarity;
  attunement?: {
    requires: boolean;
    condition?: string;
    attuned?: boolean;
  };
  enchantmentEffects?: EnchantmentEffect[];
  selectedTraitIds?: string[];
  customTraits?: ItemMagicTrait[];
  visuals?: ItemMagicVisuals;
  /** @deprecated Charges now live on individual magic traits. */
  charges?: {
    max: number;
    resetCondition?: string;
    resetFormula?: string;
  };
  isCursed?: boolean;
}

export type ItemMultiplicityMode = 'bundle' | 'split' | 'split_grouped' | 'split_custom_rule';

export interface ItemMultiplicity {
  sourceQuantity: number;
  unitName: string;
  mode: ItemMultiplicityMode;
  sourceText: string;
  reviewNote?: string;
}

export interface ItemAcquisitionRuleCreate {
  itemId: string;
  quantity: number;
  containerId?: string;
  containerSlot?: 'main' | 'hanging';
}

export interface ItemAcquisitionRule {
  text: string;
  creates?: ItemAcquisitionRuleCreate[];
}

export type ItemDescriptionBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; caption?: string; columns: string[]; rows: string[][] };

export interface ItemLibraryAudit {
  sourceIntakeId: string;
  sourceFile: string;
  checkedAt: string;
  sourceMatched: boolean;
  comparedFields: Array<{
    field: string;
    structuredValue: unknown;
    sourceValue: unknown;
    matched: boolean;
  }>;
  issues: string[];
}



export interface ItemCost {
  value: number;
  unit: CurrencyUnit;
}

// ==========================================
// 2. 物品基类 (Parent Interface)
// ==========================================

export interface ItemDefinition {
  id: string;            
  name: string;          
  englishName?: string;
  type: ItemType;        
  source?: string;
  category?: string;
  subcategory?: string;
  displayCategory?: string;
  displaySubcategory?: string;
  cost?: ItemCost;       
  weight: number;        
  description: string;   
  descriptionBlocks?: ItemDescriptionBlock[];
  magic?: ItemMagicDefinition;
  multiplicity?: ItemMultiplicity;
  acquisitionRule?: ItemAcquisitionRule;
  audit?: ItemLibraryAudit;
  tags?: string[];
  /** @deprecated Keep legacy library data readable; new rarity belongs in magic.rarity. */
  rarity?: string;       
}

// ==========================================
// 3. 现有定义 (保持不变)
// ==========================================

export type WeaponCategory = 'simple_melee' | 'simple_ranged' | 'martial_melee' | 'martial_ranged';
export type WeaponPropertyKey = 'light' | 'heavy' | 'finesse' | 'two_handed' | 'versatile' | 'thrown' | 'reach' | 'ammunition' | 'loading' | 'special';

export interface WeaponDefinition extends ItemDefinition {
  type: 'weapon';
  category: WeaponCategory; 
  damage: string;        
  damageType: DamageTypeKey; 
  properties: WeaponPropertyKey[]; 
  range?: string;        
  versatileDamage?: string; 
  specialEffect?: string;

  // 该武器消耗什么类型的弹药？
  // 只有 properties 包含 'ammunition' 时该字段才有效
  requiredAmmoType?: AmmoTypeKey;
}

export type ArmorType = 'light' | 'medium' | 'heavy' | 'shield';

export interface ArmorDefinition extends ItemDefinition {
  type: 'armor';
  armorType: ArmorType;
  ac: number;            
  dexBonusMax?: number;  
  strReq?: number;       
  stealthDis?: boolean;  
  donTime: string;       
  doffTime: string;      
}

// ==========================================
// 4. ✅ 新增定义 (New Definitions)
// ==========================================

// A. 冒险装备 (Gear)
// 最基础的物品，目前属性和基类一致，但预留接口方便未来扩展
export interface GearDefinition extends ItemDefinition {
  type: 'gear';
}

// B. 工具 (Tool)
export interface ToolDefinition extends ItemDefinition {
  type: 'tool';
  // 核心字段：关联属性
  // 比如 "盗贼工具" 关联 'dex'，"鲁特琴" 关联 'cha'
  baseAbility?: AbilityKey; 
}

// C. 消耗品 (Consumable)
export interface ConsumableDefinition extends ItemDefinition {
  type: 'consumable';
  // 核心字段：使用逻辑
  activation?: string;      // e.g. "1 Action", "1 Bonus Action"
  effectDescription?: string; // e.g. "回复 2d4+2 HP", "获得黑暗视觉60尺"
  
  // 可选：是否也是弹药？(比如箭矢既是gear也是consumable，这里先简单化处理)
  isAmmunition?: boolean; 
  // 这是什么类型的弹药？
  ammoType?: AmmoTypeKey;

  maxCharges?: number;
}

// D. 宝物 (Treasure)
// 纯粹的价值载体，通常没有功能
export interface TreasureDefinition extends ItemDefinition {
  type: 'treasure';
}

// E. 容器 (Container)
export interface ContainerDefinition extends ItemDefinition {
  type: 'container';
  capacityWeight?: number; // 承重上限

  capacityVolume?:string;// 容积上限 (可选)

  //特种容器逻辑
  ignoreContentWeight?: boolean; // 是否忽略内部物品的重量？(如箭袋、次元袋)
  maxItems?: number;             // 最大物品数量限制 (例如箭袋限 20 支)
}

// F. 套组 (Pack) - 新增
export interface PackContent {
  id: string;      // 物品库 ID (e.g., 'torch')
  quantity: number; // 数量
}

export interface PackDefinition extends ItemDefinition {
  type: 'pack';
  // 套组自带的容器 ID (e.g. 'backpack')
  // 如果为 null，说明这些东西是散乱的一堆，没有统一容器
  containerId?: string; 
  // 套组内的物品清单
  contents: PackContent[];
}


// ==========================================
// 5. 导出联合类型
// ==========================================
export type LibraryItem = 
  | WeaponDefinition 
  | ArmorDefinition 
  | GearDefinition 
  | ToolDefinition 
  | ConsumableDefinition 
  | TreasureDefinition
  | ContainerDefinition
  | PackDefinition
  | ItemDefinition; // 兜底
