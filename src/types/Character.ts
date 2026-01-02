// src/types/Character.ts
import type { InventoryItem } from './Item';
import type { AbilityKey } from './Library'; // 复用 str, dex, int...

// 1. 六维属性
export interface AbilityScores {
  str: number; // 力量
  dex: number; // 敏捷
  con: number; // 体质
  int: number; // 智力
  wis: number; // 感知
  cha: number; // 魅力
}

export interface Wallet {
  cp: number; // 铜币
  sp: number; // 银币
  ep: number; // 琥珀金 (虽然你没要求显示，但保留字段以防万一)
  gp: number; // 金币
  pp: number; // 铂金币
}

// ✅ 新增：熟练项结构
export interface CharacterProficiencies {
  armor: string[];    // e.g. ['light', 'shield']
  weapons: string[];  // e.g. ['simple']
  tools: string[];    // e.g. ['thieves_tools', 'flute']
  languages: string[];// e.g. ['common']
}


// 扩充 CharacterProfile (增加玩家名、阵营、背景)
export interface CharacterProfile {
  name: string;
  playerName?: string; // <--- 新增
  race: string;
  class: string; 
  background?: string; // <--- 新增
  alignment?: string;  // <--- 新增
  level: number;
  xp: number;
  avatarUrl?: string; 
}

// 新增 CharacterBio (生平详细数据)
export interface CharacterBio {
  // 生理特征
  age: string;
  height: string;
  weight: string;
  eyes: string;
  skin: string;
  hair: string;

  // 个性 (四大格)
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;

  // 长文本
  backstory: string;       // 背景故事
  featureText: string;     // 额外特性与特质 (纯文本记录)
  treasureNotes: string;   // 财宝笔记
}

// 3. 战斗相关数据
export interface CombatStats {
  hpCurrent: number;
  hpMax: number;
  tempHp: number;
  
  hitDiceCurrent: number;
  hitDiceMax: number;
  
  // 【新增】速度 (手动修改)
  speed: number; 

  // 【新增】力竭 (0-6级)
  exhaustion: number;

  // 【新增】激励 (3个槽位，true表示已获得)
  inspiration: boolean[]; 

  // 【新增】状态 (文本备注)
  conditions: string;

  deathSaves: {
    success: number; // 0-3
    failure: number; // 0-3
  };
}

// ✅ 新增：法术书状态 (Character Spellbook)
export interface CharacterSpells {
  // 1. 核心数值 (手动设定，解决兼职计算难题)
  spellcastingAbility: AbilityKey; // 施法关键属性 (int/wis/cha)
  spellSaveDC: number;                  // 手动填写的豁免 DC (或者提供自动计算开关)
  spellAttackMod: number;          // 手动填写的攻击加值

  // 2. 法术位 (Slots)
  // 数组索引 0 对应 0 环(通常不用), 1 对应 1 环... 到 9
  slots: {
    current: number[]; // [0, 4, 3, 0...]
    max: number[];     // [0, 4, 3, 2...]
  };

  // 3. 邪术师契约魔法 (Pact Magic) - 如果需要单独处理
  pactSlots?: {
    level: number;
    current: number;
    max: number;
  };

  // 4. 法术列表 (只存 ID)
  known: string[];    // 已知法术 (法师的法术书，或术士的已知表)
  prepared: string[]; // 已准备法术 (牧师/德鲁伊/法师每日准备的)
}


// 4. 完整的角色卡数据结构
export interface Character {
  id: string;             // 角色的唯一 UUID
  lastModified: number;   // 最后修改时间戳
  
  profile: CharacterProfile;
  stats: AbilityScores;
  combat: CombatStats;

  bio: CharacterBio;
  
  inventory: InventoryItem[]; // 背包
  
  equippedIds: string[]; // 已装备物品 ID

  wallet:Wallet

  // 【技能熟练项】
  // 二元选项：Key 存在且为 true 即为熟练，否则为不熟练
  skillProficiencies: Record<string, boolean>; 

  // 【新增：豁免熟练项】
  // 二元选项：Key 是属性名 ('str', 'dex'...)，Value 是 true/false
  // 使用 keyof AbilityScores 强制 Key 必须是六维属性之一
  savingThrows: Record<keyof AbilityScores, boolean>;

  /** 用户手动隐藏的攻击条目 ID 列表 (用于 ActionsPanel) */
  hiddenAttacks: string[];

  proficiencies: CharacterProficiencies;

  // ✅ 新增：法术书状态
  spells: CharacterSpells;
}