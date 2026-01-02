// src/data/rules/conditions.ts

export type ConditionKey = 
  | 'blinded' | 'charmed' | 'deafened' | 'frightened' | 'grappled' 
  | 'incapacitated' | 'invisible' | 'paralyzed' | 'petrified' | 'poisoned' 
  | 'prone' | 'restrained' | 'stunned' | 'unconscious' | 'exhaustion';

export interface ConditionDef {
  key: ConditionKey;
  label: string;
  description: string; // 规则描述
}

export const CONDITIONS: Record<ConditionKey, ConditionDef> = {
  blinded: {
    key: 'blinded',
    label: '目盲 (Blinded)',
    description: '自动承受攻击检定优势；自身攻击检定劣势；无法看见目标。'
  },
  charmed: {
    key: 'charmed',
    label: '魅惑 (Charmed)',
    description: '无法攻击魅惑者；魅惑者在社交检定上具有优势。'
  },
  deafened: {
    key: 'deafened',
    label: '耳聋 (Deafened)',
    description: '无法听见；听觉相关的察觉检定自动失败。'
  },
  frightened: {
    key: 'frightened',
    label: '恐慌 (Frightened)',
    description: '在可视源头的视线内，属性检定和攻击检定具有劣势；无法自愿靠近源头。'
  },
  grappled: {
    key: 'grappled',
    label: '被擒 (Grappled)',
    description: '速度变为 0。'
  },
  incapacitated: {
    key: 'incapacitated',
    label: '失能 (Incapacitated)',
    description: '无法执行动作或反应。'
  },
  invisible: {
    key: 'invisible',
    label: '隐形 (Invisible)',
    description: '被视为重度遮蔽；攻击检定具有优势；受到的攻击检定具有劣势。'
  },
  paralyzed: {
    key: 'paralyzed',
    label: '麻痹 (Paralyzed)',
    description: '失能；无法移动或说话；力量和敏捷豁免自动失败；受到的攻击具有优势；5尺内受到的攻击必定重击。'
  },
  petrified: {
    key: 'petrified',
    label: '石化 (Petrified)',
    description: '转化为物体；失能；无视毒素与疾病；全伤害抗性。'
  },
  poisoned: {
    key: 'poisoned',
    label: '中毒 (Poisoned)',
    description: '攻击检定和属性检定具有劣势。'
  },
  prone: {
    key: 'prone',
    label: '倒地 (Prone)',
    description: '只能爬行；自身攻击劣势；5尺内受到的攻击优势；5尺外受到的攻击劣势。'
  },
  restrained: {
    key: 'restrained',
    label: '被束缚 (Restrained)',
    description: '速度为0；攻击检定劣势；受到的攻击优势；敏捷豁免劣势。'
  },
  stunned: {
    key: 'stunned',
    label: '震慑 (Stunned)',
    description: '失能；无法移动；力量和敏捷豁免失败；受到的攻击优势。'
  },
  unconscious: {
    key: 'unconscious',
    label: '昏迷 (Unconscious)',
    description: '失能；丢弃物品；倒地；力量敏捷豁免失败；受到的攻击优势；5尺内受到的攻击必定重击。'
  },
  exhaustion: {
    key: 'exhaustion',
    label: '力竭 (Exhaustion)',
    description: '1级: 检定劣势; 2级: 速度减半; 3级: 攻击/豁免劣势; 4级:生命上限减半; 5级: 速度为0; 6级: 死亡。'
  }
};

// 辅助列表
export const CONDITION_OPTIONS = Object.values(CONDITIONS);