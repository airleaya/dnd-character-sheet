// src/data/libraries/packs.ts
import type { PackDefinition } from '../../types/Library';

export const PACK_LIBRARY: PackDefinition[] = [
  // ===================================
  // 🎒 通用冒险套组 (General Packs)
  // ===================================
  {
    id: 'pack_dungeoneer',
    name: '地城探险家套组 (Dungeoneer\'s Pack)',
    type: 'pack',
    cost: { value: 12, unit: 'gp' },
    weight: 61.5, // 5E 标准重量
    description: '深入地下城所需的各种装备。包含背包、撬棍、锤子、岩钉、火把、火绒盒、口粮、水袋和麻绳。',
    containerId: 'backpack', // 容器：背包
    contents: [
      { id: 'crowbar', quantity: 1 },
      { id: 'hammer', quantity: 1 },
      { id: 'piton', quantity: 10 },
      { id: 'torch', quantity: 10 },
      { id: 'tinderbox', quantity: 1 },
      { id: 'rations', quantity: 10 },
      { id: 'waterskin', quantity: 1 },
      { id: 'rope_hempen', quantity: 1 }, // 这里的麻绳通常挂在背包外，但为了管理方便放入包内
    ]
  },
  {
    id: 'pack_explorer',
    name: '探索者套组 (Explorer\'s Pack)',
    type: 'pack',
    cost: { value: 10, unit: 'gp' },
    weight: 59,
    description: '适合长途跋涉和野外露营的装备。包含背包、铺盖卷、餐具包、火绒盒、火把、口粮、水袋和麻绳。',
    containerId: 'backpack',
    contents: [
      { id: 'bedroll', quantity: 1 },
      { id: 'mess_kit', quantity: 1 },
      { id: 'tinderbox', quantity: 1 },
      { id: 'torch', quantity: 10 },
      { id: 'rations', quantity: 10 },
      { id: 'waterskin', quantity: 1 },
      { id: 'rope_hempen', quantity: 1 },
    ]
  },

  // ===================================
  // 🎭 职业/背景类套组 (Class/Background Packs)
  // ===================================
  {
    id: 'pack_burglar',
    name: '盗贼套组 (Burglar\'s Pack)',
    type: 'pack',
    cost: { value: 16, unit: 'gp' },
    weight: 47.5,
    description: '潜入、侦查和应对陷阱的必备工具。包含背包、滚珠、细绳、铃铛、蜡烛、撬棍、锤子、岩钉、遮光提灯、灯油、口粮、火绒盒和水袋。',
    containerId: 'backpack',
    contents: [
      { id: 'ball_bearings', quantity: 1 },  
      { id: 'string_10ft', quantity: 1 },    
      { id: 'bell', quantity: 1 },           
      { id: 'candle', quantity: 5 },         
      { id: 'crowbar', quantity: 1 },
      { id: 'hammer', quantity: 1 },
      { id: 'piton', quantity: 10 },
      { id: 'lantern_hooded', quantity: 1 }, 
      { id: 'oil', quantity: 2 },            
      { id: 'rations', quantity: 5 },
      { id: 'tinderbox', quantity: 1 },
      { id: 'waterskin', quantity: 1 },
    ]
  },
  {
    id: 'pack_diplomat',
    name: '外交官套组 (Diplomat\'s Pack)',
    type: 'pack',
    cost: { value: 39, unit: 'gp' },
    weight: 46,
    description: '包含保存卷轴、地图以及体面书写所需的工具。所有物品装在一个箱子中。',
    containerId: 'chest', // 🚨 注意：这个套组用的是箱子
    contents: [
      { id: 'case_map_scroll', quantity: 2 },
      { id: 'clothes_fine', quantity: 1 },   
      { id: 'ink_bottle', quantity: 1 },     
      { id: 'ink_pen', quantity: 1 },        
      { id: 'lamp', quantity: 1 },           
      { id: 'oil', quantity: 2 },
      { id: 'paper', quantity: 5 },          
      { id: 'perfume', quantity: 1 },        
      { id: 'sealing_wax', quantity: 1 },    
      { id: 'soap', quantity: 1 },           
    ]
  },
  {
    id: 'pack_entertainer',
    name: '艺人套组 (Entertainer\'s Pack)',
    type: 'pack',
    cost: { value: 40, unit: 'gp' },
    weight: 38,
    description: '包含伪装工具和旅途用品。',
    containerId: 'backpack',
    contents: [
      { id: 'bedroll', quantity: 1 },
      { id: 'costume', quantity: 2 },        
      { id: 'candle', quantity: 5 },
      { id: 'rations', quantity: 5 },
      { id: 'waterskin', quantity: 1 },
      { id: 'disguise_kit', quantity: 1 },   
    ]
  },
  {
    id: 'pack_priest',
    name: '祭司套组 (Priest\'s Pack)',
    type: 'pack',
    cost: { value: 19, unit: 'gp' },
    weight: 26,
    description: '适合神职人员进行仪式和生活。包含背包、毛毯、蜡烛、火绒盒、奉献箱、香块、香炉、祭袍、口粮和水袋。',
    containerId: 'backpack',
    contents: [
      { id: 'blanket', quantity: 1 },        
      { id: 'candle', quantity: 10 },
      { id: 'tinderbox', quantity: 1 },
      { id: 'alms_box', quantity: 1 },       
      { id: 'incense_block', quantity: 2 },  
      { id: 'censer', quantity: 1 },         
      { id: 'vestments', quantity: 1 },      
      { id: 'rations', quantity: 2 },
      { id: 'waterskin', quantity: 1 },
    ]
  },
  {
    id: 'pack_scholar',
    name: '学者套组 (Scholar\'s Pack)',
    type: 'pack',
    cost: { value: 40, unit: 'gp' },
    weight: 11,
    description: '包含记录学识和研究用的文具。',
    containerId: 'backpack',
    contents: [
      { id: 'book_lore', quantity: 1 },      
      { id: 'ink_bottle', quantity: 1 },
      { id: 'ink_pen', quantity: 1 },
      { id: 'parchment', quantity: 10 },     
      { id: 'sand_bag', quantity: 1 },       
      { id: 'knife_small', quantity: 1 },    
    ]
  }
];