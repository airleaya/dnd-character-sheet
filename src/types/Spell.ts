// src/types/Spell.ts

import type { DamageTypeKey } from '../data/rules/damageTypes';
import type { AbilityKey } from './Library'; // 复用 str, dex, int...

// ==========================================
// 1. 枚举与辅助类型
// ==========================================

// 法术学派
export type SpellSchool = 
  | 'abjuration'    // 防护
  | 'conjuration'   // 咒法
  | 'divination'    // 预言
  | 'enchantment'   // 附魔
  | 'evocation'     // 塑能
  | 'illusion'      // 幻术
  | 'necromancy'    // 死灵
  | 'transmutation';// 变化

// 攻击类型 (决定 UI 如何显示攻击信息)
// melee/ranged -> 显示命中加值
// save -> 显示豁免 DC
// auto -> 必中 (如魔法飞弹)
// none -> 无攻击判定 (如法师护甲)
export type SpellAttackType = 'melee' | 'ranged' | 'save' | 'auto' | 'none';

// 施法成分结构
export interface SpellComponents {
  v: boolean; // 言语 (Verbal)
  s: boolean; // 姿势 (Somatic)
  m: string | null; // 材料 (Material) - 存描述文本，如 "一根羽毛"
}

// 职业标签 (用于筛选)
// 这里列出 SRD 基础职业，未来可扩展
export type SpellClassKey = 
  | 'bard' | 'cleric' | 'druid' | 'paladin' | 'ranger' 
  | 'sorcerer' | 'warlock' | 'wizard';

// ==========================================
// 2. 法术定义 (Library Definition)
// ==========================================

export interface SpellDefinition {
  id: string;             // e.g. "fireball"
  name: string;           // e.g. "火球术"
  level: number;          // 0-9 (0=戏法)
  school: SpellSchool;
  ritual: boolean;        // 是否仪式

  // --- 施法消耗 ---
  castingTime: string;    // e.g. "1 Action", "1 Reaction"
  range: string;          // e.g. "150 feet", "Self (15-foot cone)"
  components: SpellComponents;

  // --- 持续时间 ---
  concentration: boolean; // 是否专注
  duration: string;       // e.g. "Instantaneous", "1 minute"

  // --- 战斗/自动化数据 (轻量级) ---
  target?: string;           // e.g. "20-foot radius sphere"
  attackType: SpellAttackType;
  
  // 如果是豁免法术，豁免属性是什么？
  saveAttr?: AbilityKey;     // e.g. 'dex' for Fireball
  
  // 基础伤害/治疗公式 (仅用于显示和简单的掷骰按钮)
  damage?: string;           // e.g. "8d6"
  damageType?: DamageTypeKey;// e.g. 'fire'
  
  // --- 文本描述 ---
  description: string;       // 完整的 HTML 描述
  scaling?: string;          // 升环/升级效果简述, e.g. "每高一环 +1d6"
  
  // --- 索引标签 ---
  classes: SpellClassKey[];

  // ✅ 新增：标记这个法术是否遵循“戏法升级规则”
  // 规则：角色等级 5/11/17 时，基础伤害骰数量 +1
  cantripScaling?: boolean;
}