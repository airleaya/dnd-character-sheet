// src/utils/currencyUtils.ts
import type { ItemCost, CurrencyUnit } from '../types/Library';

const RATES: Record<CurrencyUnit, number> = {
  cp: 1,
  sp: 10,
  ep: 50,
  gp: 100,
  pp: 1000
};

/**
 * 格式化价格显示
 * @example formatCost({value: 1500, unit: 'gp'}) => "1,500 gp"
 */
export const formatCost = (cost?: ItemCost): string => {
  if (!cost) return '--';
  // 加逗号分隔符，看起来更专业
  return `${cost.value.toLocaleString()} ${cost.unit}`;
};

/**
 * 转化为铜币（用于比较价格）
 */
export const toCopper = (cost: ItemCost): number => {
  return cost.value * (RATES[cost.unit] || 1);
};

/**
 * 价格相加（返回 gp 为单位的大概值，或者按需处理）
 * 这部分逻辑可以等以后做商店系统再细化
 */
export const addCosts = (c1: ItemCost, c2: ItemCost): number => {
  return toCopper(c1) + toCopper(c2);
};