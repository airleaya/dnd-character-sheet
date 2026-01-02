// src/data/libraries/treasures.ts
import type { TreasureDefinition } from '../../types/Library';

export const TREASURE_LIBRARY: TreasureDefinition[] = [
  // ===================================
  // 💎 宝石 (Gemstones)
  // ===================================
  {
    id: 'gem_10gp',
    name: '虎眼石 (Tiger Eye)',
    type: 'treasure',
    cost: { value: 10, unit: 'gp' },
    weight: 0, // 忽略不计
    description: '一颗半透明的棕色宝石，拥有金色的猫眼效应。价值 10 gp。',
    rarity: 'Common'
  },
  {
    id: 'gem_50gp',
    name: '血石 (Bloodstone)',
    type: 'treasure',
    cost: { value: 50, unit: 'gp' },
    weight: 0,
    description: '深灰色的宝石，带有红色的斑点。价值 50 gp。',
    rarity: 'Common'
  },
  {
    id: 'gem_100gp_pearl',
    name: '珍珠 (Pearl)',
    type: 'treasure',
    cost: { value: 100, unit: 'gp' },
    weight: 0,
    description: '一颗光洁圆润的白色珍珠。这是施展“鉴定术 (Identify)”所需的材料。价值 100 gp。',
    rarity: 'Uncommon'
  },
  {
    id: 'gem_300gp_diamond',
    name: '钻石 (Diamond, 300gp)',
    type: 'treasure',
    cost: { value: 300, unit: 'gp' },
    weight: 0,
    description: '一颗透明的切割钻石。这是施展“回生术 (Revivify)”所需的材料。价值 300 gp。',
    rarity: 'Rare'
  },
  {
    id: 'gem_500gp',
    name: '黄玉 (Topaz)',
    type: 'treasure',
    cost: { value: 500, unit: 'gp' },
    weight: 0,
    description: '一颗金黄色的透明宝石。价值 500 gp。',
    rarity: 'Rare'
  },
  {
    id: 'gem_1000gp',
    name: '星彩红宝石 (Star Ruby)',
    type: 'treasure',
    cost: { value: 1000, unit: 'gp' },
    weight: 0,
    description: '一颗中心带有白色星芒的红宝石。价值 1,000 gp。',
    rarity: 'Very Rare'
  },
  {
    id: 'gem_5000gp',
    name: '极品钻石 (Diamond, 5,000gp)',
    type: 'treasure',
    cost: { value: 5000, unit: 'gp' },
    weight: 0,
    description: '一颗完美无瑕的巨大钻石。这是施展“完全复活术 (True Resurrection)”等强力法术所需的材料。',
    rarity: 'Very Rare'
  },

  // ===================================
  // 🎨 艺术品 (Art Objects)
  // ===================================
  {
    id: 'art_25gp',
    name: '银酒杯 (Silver Goblet)',
    type: 'treasure',
    cost: { value: 25, unit: 'gp' },
    weight: 1,
    description: '一个做工简单的纯银酒杯。',
    rarity: 'Common'
  },
  {
    id: 'art_250gp',
    name: '金戒指 (Gold Ring)',
    type: 'treasure',
    cost: { value: 250, unit: 'gp' },
    weight: 0,
    description: '一枚镶嵌着小块宝石的金戒指。',
    rarity: 'Uncommon'
  },
  {
    id: 'art_750gp',
    name: '银质高脚杯 (Silver Chalice)',
    type: 'treasure',
    cost: { value: 750, unit: 'gp' },
    weight: 2,
    description: '镶嵌着月光石的银质高脚杯，通常用于宗教仪式。',
    rarity: 'Rare'
  },
  {
    id: 'art_2500gp',
    name: '精金匕首 (Platinum Dagger)',
    type: 'treasure',
    cost: { value: 2500, unit: 'gp' },
    weight: 1,
    description: '一把柄头镶嵌着黑玉的铂金匕首（由于质地太软，无法作为武器使用，仅作为艺术品）。',
    rarity: 'Very Rare'
  },

  // ===================================
  // ⚖️ 贸易货品 (Trade Goods)
  // ===================================
  {
    id: 'gold_bar',
    name: '金条 (Gold Bar)',
    type: 'treasure',
    cost: { value: 50, unit: 'gp' },
    weight: 1, // 标准设定：1磅黄金=50gp
    description: '重1磅的纯金条，刻有铸币厂的印记。',
    rarity: 'Common'
  },
  {
    id: 'silver_bar',
    name: '银条 (Silver Bar)',
    type: 'treasure',
    cost: { value: 5, unit: 'gp' },
    weight: 1, // 标准设定：1磅白银=5gp
    description: '重1磅的纯银条。',
    rarity: 'Common'
  }
];