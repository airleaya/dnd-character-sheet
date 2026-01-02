// src/data/libraries/containers.ts
import type { ContainerDefinition } from '../../types/Library';

export const CONTAINER_LIBRARY: ContainerDefinition[] = [
  {
    id: 'backpack',
    name: '背包 (Backpack)',
    type: 'container',
    cost: { value: 2, unit: 'gp' },
    weight: 5,
    capacityWeight: 30,
    capacityVolume: '1 立方尺', // ✅ 新增
    description: '一个可以装载物品的背包。除了你穿在身上的衣物，它可以容纳 1 立方尺/ 30 磅重的物品。',
    rarity: 'Common'
  },
  {
    id: 'barrel',
    name: '木桶 (Barrel)',
    type: 'container',
    cost: { value: 2, unit: 'gp' },
    weight: 70,
    capacityWeight: 400, // 液体重量估算
    capacityVolume: '40 加仑 / 4 立方尺', // ✅ 新增
    description: '一个巨大的木桶，通常用于储存液体或散装货物。',
    rarity: 'Common'
  },
  {
    id: 'basket',
    name: '篮子 (Basket)',
    type: 'container',
    cost: { value: 4, unit: 'sp' },
    weight: 2,
    capacityWeight: 40,
    capacityVolume: '2 立方尺', // ✅ 新增
    description: '编织的篮子。',
    rarity: 'Common'
  },
  {
    id: 'chest',
    name: '箱子 (Chest)',
    type: 'container',
    cost: { value: 5, unit: 'gp' },
    weight: 25,
    capacityWeight: 300,
    capacityVolume: '12 立方尺', // ✅ 新增
    description: '带有铰链盖子和锁扣的木箱（锁需另购）。',
    rarity: 'Common'
  },
  {
    id: 'flask',
    name: '扁瓶 (Flask)',
    type: 'container',
    cost: { value: 2, unit: 'cp' },
    weight: 1,
    capacityWeight: 1.5, // 约等于 1 品脱水的重
    capacityVolume: '1 品脱', // ✅ 新增
    description: '通常用来装油或酒的容器。',
    rarity: 'Common'
  },
  {
    id: 'jug',
    name: '陶罐 (Jug)', // 补充一个常用的
    type: 'container',
    cost: { value: 2, unit: 'cp' },
    weight: 4,
    capacityWeight: 8, // 1加仑水重约8磅
    capacityVolume: '1 加仑',
    description: '带有塞子的陶制罐子。',
    rarity: 'Common'
  },
  {
    id: 'pouch',
    name: '腰包 (Pouch)',
    type: 'container',
    cost: { value: 5, unit: 'sp' },
    weight: 1,
    capacityWeight: 6,
    capacityVolume: '1/5 立方尺', // ✅ 新增
    description: '系在腰带上的皮囊。',
    rarity: 'Common'
  },
  {
    id: 'sack',
    name: '布袋 (Sack)',
    type: 'container',
    cost: { value: 1, unit: 'cp' },
    weight: 0.5,
    capacityWeight: 30,
    capacityVolume: '1 立方尺', // ✅ 新增
    description: '粗麻布制成的袋子。',
    rarity: 'Common'
  },
  {
    id: 'vial',
    name: '小瓶 (Vial)',
    type: 'container',
    cost: { value: 1, unit: 'gp' },
    weight: 0,
    capacityWeight: 0.25, // 极轻
    capacityVolume: '4 盎司', // ✅ 新增
    description: '用来装药水或毒药的玻璃小瓶。',
    rarity: 'Common'
  },
  {
    id: 'waterskin',
    name: '水袋 (Waterskin)',
    type: 'container',
    cost: { value: 2, unit: 'sp' },
    weight: 5, 
    capacityWeight: 4, 
    capacityVolume: '4 品脱', // ✅ 新增
    description: '装满水时重5磅。',
    rarity: 'Common'
  },
  {
    id: 'quiver',
    name: '箭袋 (Quiver)',
    type: 'container',
    cost: { value: 1, unit: 'gp' },
    weight: 1, // 皮重 1 磅
    capacityWeight: 20, // 理论承重 (虽然我们主要看数量)
    capacityVolume: '20 支弹药',
    description: '一个皮制的筒，可以容纳 20 支箭或弩箭。在箭袋内的弹药不计入负重。',
    rarity: 'Common',
    
    // ✨ 魔法属性：忽略内容重量 & 限制数量
    ignoreContentWeight: true, 
    maxItems: 20 
  },
  {
    id: 'case_map_scroll',
    name: '地图/卷轴筒 (Case, Map or Scroll)',
    type: 'container',
    cost: { value: 1, unit: 'gp' },
    weight: 1,
    capacityWeight: 0, // 忽略纸张重量
    capacityVolume: '10 张纸',
    description: '皮革或木制的圆筒，防水，用于保护地图或卷轴。',
    rarity: 'Common'
  },
  {
    id: 'alms_box',
    name: '奉献箱 (Alms Box)',
    type: 'container',
    cost: { value: 5, unit: 'gp' }, // 估算值，通常为木制或金属制精美盒子
    weight: 2,
    capacityWeight: 10, // 假设能装一些硬币
    capacityVolume: '500枚硬币',
    description: '用于在仪式中收集信徒捐赠的容器。',
    rarity: 'Common'
  }
];