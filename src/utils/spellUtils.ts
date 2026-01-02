// src/utils/spellUtils.ts

/**
 * 根据角色等级计算戏法的实际伤害
 * @param baseDamage 基础伤害，如 "1d10" 或 "1d8"
 * @param characterLevel 角色当前总等级
 * @returns 计算后的伤害，如 "2d10"
 */
export function calculateCantripDamage(baseDamage: string, characterLevel: number): string {
  // 1. 简单的正则解析：匹配 "1d10", "1d8+2" 等格式
  // 我们假设基础写法都是 "1d(数字)" 开头
  const match = baseDamage.match(/^(\d+)d(\d+)(.*)$/);
  
  if (!match) return baseDamage; // 格式太复杂了解析不了，直接返回原值

  let count = parseInt(match[1]); // 骰子数量 (1)
  const die = match[2];           // 骰子面数 (10)
  const suffix = match[3];        // 后缀 (如果有)

  // 2. D&D 5E 戏法升级规则
  let multiplier = 1;
  if (characterLevel >= 17) multiplier = 4;
  else if (characterLevel >= 11) multiplier = 3;
  else if (characterLevel >= 5)  multiplier = 2;

  // 3. 计算新数量
  const newCount = count * multiplier;

  // 4. 重新组合
  return `${newCount}d${die}${suffix}`;
}