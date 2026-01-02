// src/data/rules/damageTypes.ts

export type DamageTypeKey = 
  | 'acid' | 'bludgeoning' | 'cold' | 'fire' | 'force' 
  | 'lightning' | 'necrotic' | 'piercing' | 'poison' 
  | 'psychic' | 'radiant' | 'slashing' | 'thunder' | 'damage_none';

export interface DamageTypeDef {
  key: DamageTypeKey;
  label: string;
  color: string; // 用于 UI 标签颜色
}

export const DAMAGE_TYPES: Record<DamageTypeKey, DamageTypeDef> = {
  slashing:   { key: 'slashing',   label: '挥砍 (Slashing)',    color: '#95a5a6' }, // 灰
  piercing:   { key: 'piercing',   label: '穿刺 (Piercing)',    color: '#7f8c8d' }, // 深灰
  bludgeoning:{ key: 'bludgeoning',label: '钝击 (Bludgeoning)', color: '#bdc3c7' }, // 浅灰
  
  fire:       { key: 'fire',       label: '火焰 (Fire)',        color: '#e74c3c' }, // 红
  cold:       { key: 'cold',       label: '寒冷 (Cold)',        color: '#3498db' }, // 蓝
  lightning:  { key: 'lightning',  label: '闪电 (Lightning)',   color: '#f1c40f' }, // 黄
  thunder:    { key: 'thunder',    label: '雷鸣 (Thunder)',     color: '#8e44ad' }, // 紫
  
  acid:       { key: 'acid',       label: '酸蚀 (Acid)',        color: '#2ecc71' }, // 绿
  poison:     { key: 'poison',     label: '毒素 (Poison)',      color: '#16a085' }, // 深绿
  
  necrotic:   { key: 'necrotic',   label: '黯蚀 (Necrotic)',    color: '#2c3e50' }, // 黑/深蓝
  radiant:    { key: 'radiant',    label: '光耀 (Radiant)',     color: '#f39c12' }, // 金/橙
  force:      { key: 'force',      label: '力场 (Force)',       color: '#d35400' }, // 深橙
  psychic:    { key: 'psychic',    label: '心灵 (Psychic)',     color: '#e056fd' }, // 粉紫

  damage_none:{ key: 'damage_none',       label: '无 (None)',             color: '#bdc3c7' }

};

// 辅助列表，用于下拉菜单
export const DAMAGE_TYPE_OPTIONS = Object.values(DAMAGE_TYPES);