// src/data/basicItems.ts
import type { InventoryItem } from '../types/Item';

// 这里我们定义“模板”，所以不需要 instanceId
// 使用 Partial<InventoryItem> 表示这些只是半成品
export const basicItems: Partial<InventoryItem>[] = [
  {
    templateId: 'srd_longsword',
    name: '长剑 (Longsword)',
    type: 'weapon',
    weight: 3,
    description: '一把普通的精钢长剑，泛着寒光。',
    data: {
      damage: '1d8',
      damageType: 'slashing',
      properties: ['versatile (1d10)']
    }
  },
  {
    templateId: 'srd_dager',
    name: '匕首 (Dagger)',
    type: 'weapon',
    weight: 1,
    description: '便于隐藏的短刀。',
    data: {
      damage: '1d4',
      damageType: 'piercing',
      properties: ['finesse', 'light', 'thrown']
    }
  },
  {
    templateId: 'srd_chainmail',
    name: '链甲衫 (Chain Shirt)',
    type: 'armor',
    weight: 20,
    description: '由锁环编织成的护甲。',
    data: {
      ac: 13,
      type: 'medium',
      maxDexModifier: 2
    }
  },
  {
    templateId: 'srd_potion_heal',
    name: '治疗药水 (Potion of Healing)',
    type: 'consumable',
    weight: 0.5,
    description: '红色的液体，喝下恢复 2d4+2 生命值。',
    data: {
      heal: '2d4+2'
    }
  },
  {
    templateId: 'srd_backpack',
    name: '探险家背包',
    type: 'container',
    weight: 5,
    description: '这就叫专业。',
    data: {
      capacity: 30
    }
  }
];