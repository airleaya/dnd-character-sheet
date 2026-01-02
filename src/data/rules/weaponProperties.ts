// src/data/rules/weaponProperties.ts
import type { WeaponPropertyKey } from '../../types/Library';

export interface WeaponPropertyDef {
  key: WeaponPropertyKey;
  label: string;      // UI 显示的短标签，如 "灵巧"
  description: string;// UI 弹窗/Tooltip 显示的长文本
}

export const WEAPON_PROPERTIES: Record<WeaponPropertyKey, WeaponPropertyDef> = {
  light: {
    key: 'light',
    label: '轻型',
    description: '轻型武器灵巧且易于操控，让你可以进行双持攻击。'
  },
  finesse: {
    key: 'finesse',
    label: '灵巧',
    description: '使用灵巧武器进行攻击时，你可以自由选择力量或敏捷调整值作为攻击检定和伤害加值。你必须在两个数值上使用相同的属性。'
  },
  heavy: {
    key: 'heavy',
    label: '重型',
    description: '小型体型生物在使用重型武器时的攻击检定具有劣势。'
  },
  two_handed: {
    key: 'two_handed',
    label: '双手',
    description: '这把武器需要双手持用才能进行攻击。'
  },
  versatile: {
    key: 'versatile',
    label: '两用',
    description: '这把武器可以用单手或双手持用。双手持用时会造成更高的伤害（详见伤害数值）。'
  },
  thrown: {
    key: 'thrown',
    label: '投掷',
    description: '具有该特性的武器可以投掷来进行远程攻击。如果该武器是近战武器，你可以使用原本用于近战攻击的属性（力量或敏捷）来进行攻击检定和伤害加值。'
  },
  reach: {
    key: 'reach',
    label: '触及',
    description: '使用该武器进行攻击时，你的触及范围增加 5 尺。'
  },
  ammunition: {
    key: 'ammunition',
    label: '弹药',
    description: '你可以使用该武器进行远程攻击，前提是你拥有相应的弹药。每次攻击消耗一发弹药。你需要一只手装填弹药。'
  },
  loading: {
    key: 'loading',
    label: '装填',
    description: '由于该武器需要时间装填，你每回合只能使用它发射一次弹药，无论你拥有多少次攻击机会。'
  },
  special: {
    key: 'special',
    label: '特殊',
    description: '该武器具有特殊的规则，请查看物品详情中的特殊描述。'
  }
};