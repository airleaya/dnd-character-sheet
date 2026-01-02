// src/types/Item.ts
import type { 
  ItemDefinition, 
  WeaponDefinition, 
  ArmorDefinition, 
  GearDefinition,
  ToolDefinition,
  ConsumableDefinition,
  TreasureDefinition,
  ContainerDefinition,
  ItemType
} from './Library';

// 1. 公共排除项 (这些属性直接存在于 InventoryItem 根层级，不在 data 里重复)
type CommonExclude = 'id' | 'name' | 'weight' | 'description' | 'type' | 'rarity' | 'cost';

// 2. 利用 Omit 生成 Data 类型
// 这样 WeaponData 就只包含 damage, range 等战斗属性，而不包含 weight
export type WeaponData = Omit<WeaponDefinition, CommonExclude>;
export type ArmorData = Omit<ArmorDefinition, CommonExclude>;
export type GearData = Omit<GearDefinition, CommonExclude>;
export type ToolData = Omit<ToolDefinition, CommonExclude>;

export type ConsumableData = Omit<ConsumableDefinition, CommonExclude> & {
  // 动态状态：当前剩余次数
  // 如果物品定义里有 maxCharges，这里就必须有 charges
  charges?: number; 
};
export type TreasureData = Omit<TreasureDefinition, CommonExclude>;
export type ContainerData = Omit<ContainerDefinition, CommonExclude> & {
  // 容器实例特有属性
  isOpen?: boolean; // 比如：箱子是否打开
};

// 3. 核心物品实例
export interface InventoryItem {
  // --- 身份标识 ---
  instanceId: string; 
  templateId: string; 

  // --- 基础信息 (快照) ---
  name: string;       
  description?: string; 
  weight: number;     
  quantity: number;   
  
  type: ItemType;     
  
  // --- 状态 ---
  parentId?: string; // 如果放在容器里，指向容器的 instanceId

  // --- ✅ 动态数据 (特有属性联合类型) ---
  // 这里使用了具体的类型，而不是 Record<string, any>，会有更好的智能提示
  data: 
    | WeaponData 
    | ArmorData 
    | GearData 
    | ToolData 
    | ConsumableData 
    | TreasureData
    | ContainerData
    | Record<string, any>; // 兜底，兼容未知情况
}