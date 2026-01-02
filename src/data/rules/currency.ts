// src/data/rules/currency.ts

export type CurrencyUnit = 'cp' | 'sp' | 'ep' | 'gp' | 'pp';

// 汇率常量：以 1 cp 为基准
export const CURRENCY_RATES: Record<CurrencyUnit, number> = {
  cp: 1,
  sp: 10,
  ep: 50,   // 琥珀金 (Electrum)，D&D 特有货币
  gp: 100,
  pp: 1000  // 铂金 (Platinum)
};

// 辅助函数：将任意金额转换为铜币 (用于比较价格高低)
export const toCopper = (value: number, unit: CurrencyUnit): number => {
  return value * (CURRENCY_RATES[unit] || 1);
};