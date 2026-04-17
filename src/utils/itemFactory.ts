// src/utils/itemFactory.ts
import { generateUUID } from './idGenerator';
import type { ConsumableData, ContainerData, InventoryItem } from '../types/Item';
import type { ConsumableDefinition } from '../types/Library';

// 1. 引入所有数据仓库
import { WEAPON_LIBRARY } from '../data/libraries/weapons';
import { ARMOR_LIBRARY } from '../data/libraries/armors';
import { GEAR_LIBRARY } from '../data/libraries/gears';
import { CONTAINER_LIBRARY } from '../data/libraries/containers';
import { TOOL_LIBRARY } from '../data/libraries/tools';
import { CONSUMABLE_LIBRARY } from '../data/libraries/consumables';
import { TREASURE_LIBRARY } from '../data/libraries/treasures';
import { PACK_LIBRARY } from '../data/libraries/packs';

/**
 * 核心工厂：根据图鉴 ID 创建背包物品实例
 */
export function createItemFromLibrary(templateId: string): InventoryItem | null {
  
  // 2. 聚合所有图鉴 (懒加载模式：每次调用时合并引用，开销很小)
  // 如果未来数据量极大，可以使用 Map 进行索引优化
  const allDefinitions = [
    ...WEAPON_LIBRARY,
    ...ARMOR_LIBRARY,
    ...GEAR_LIBRARY,
    ...CONTAINER_LIBRARY,
    ...TOOL_LIBRARY,
    ...CONSUMABLE_LIBRARY,
    ...PACK_LIBRARY,
    ...TREASURE_LIBRARY
  ];

  // 3. 查找定义
  const def = allDefinitions.find(item => item.id === templateId);

  if (!def) {
    console.warn(`工厂报错: 找不到 ID 为 '${templateId}' 的物品模板`);
    return null;
  }

    // 4. 准备动态数据 (Data)
    // 提取 id，剩余的属性放入 dataProps
  const { id: definitionId, ...dataProps } = def;
  void definitionId;


  // 浅拷贝一份 data，以便我们注入动态状态
  const instanceData: InventoryItem['data'] = { ...dataProps };

  // ==========================================
  // 🟢 特殊逻辑初始化
  // ==========================================
  
  // A. 消耗品：次数初始化
  if (def.type === 'consumable') {
        const consDef = def as ConsumableDefinition;
    const consumableData = instanceData as ConsumableData;
    // 如果定义了最大次数，说明是次数类物品 (如医疗包)
    // 我们需要初始化当前剩余次数
    if (consDef.maxCharges) {
      consumableData.charges = consDef.maxCharges;
    }
  }

  // B. 容器：状态初始化
    if (def.type === 'container') {
    const containerData = instanceData as ContainerData;
    // 默认给容器一个打开状态，方便 UI 处理
    containerData.isOpen = true;
  }

  // ==========================================
  // 🔵 构建实例
  // ==========================================
  return {
    instanceId: generateUUID(), // 唯一身份证
    templateId: def.id,         // 原始型号 ID
    
    name: def.name,
    type: def.type,             // 自动识别 (weapon, gear, tool...)
    weight: def.weight,
    quantity: 1,                // 默认数量 1
    
    parentId: undefined,        // 默认不在容器里
    
    description: def.description,
    
    // 注入处理过的数据 (包含 charges, capacity 等)
    data: instanceData
  };
}