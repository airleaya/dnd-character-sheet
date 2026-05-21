import type { ItemMagicTrait } from '../../types/Library';

export interface MagicVisualPreset {
  id: string;
  label: string;
  inventoryBackground: string;
  attackBackground: string;
  nameColor: string;
  borderColor: string;
}

export const DEFAULT_MAGIC_VISUAL_PRESETS: MagicVisualPreset[] = [
  {
    id: 'arcane-violet',
    label: '奥术紫',
    inventoryBackground: '#dcc2ff',
    attackBackground: '#dcc2ff',
    nameColor: '#4f0b22',
    borderColor: '#b58cff',
  },
  {
    id: 'ember-gold',
    label: '余烬金',
    inventoryBackground: '#ffe1a8',
    attackBackground: '#f7c46c',
    nameColor: '#5b2b00',
    borderColor: '#d89a2b',
  },
  {
    id: 'verdant-rune',
    label: '翠绿符文',
    inventoryBackground: '#bfeccf',
    attackBackground: '#9bd8b2',
    nameColor: '#123d27',
    borderColor: '#34a66a',
  },
  {
    id: 'frost-sigil',
    label: '霜蓝铭文',
    inventoryBackground: '#c8e7ff',
    attackBackground: '#a9d8ff',
    nameColor: '#163a5a',
    borderColor: '#4f9ed8',
  },
  {
    id: 'shadow-hex',
    label: '影咒黑紫',
    inventoryBackground: '#2d2438',
    attackBackground: '#3b2b4d',
    nameColor: '#f1ddff',
    borderColor: '#8f6fb',
  },
];

export const DEFAULT_MAGIC_VISUAL_PRESET_ID = DEFAULT_MAGIC_VISUAL_PRESETS[0]!.id;
export const DEFAULT_MAGIC_INVENTORY_BACKGROUND = DEFAULT_MAGIC_VISUAL_PRESETS[0]!.inventoryBackground;
export const DEFAULT_MAGIC_ATTACK_BACKGROUND = DEFAULT_MAGIC_VISUAL_PRESETS[0]!.attackBackground;
export const DEFAULT_MAGIC_NAME_COLOR = DEFAULT_MAGIC_VISUAL_PRESETS[0]!.nameColor;

export const getMagicVisualPreset = (presetId?: string): MagicVisualPreset =>
  DEFAULT_MAGIC_VISUAL_PRESETS.find(preset => preset.id === presetId) ?? DEFAULT_MAGIC_VISUAL_PRESETS[0]!;

export const PRESET_MAGIC_TRAITS: ItemMagicTrait[] = [
  {
    id: 'placeholder_magic_trait',
    source: 'preset',
    type: 'plain',
    name: '占位魔法词条',
    description: '这是一个预留词条，用于后续替换为正式魔法词条。',
    activationMode: 'always',
    participatesInDamage: false,
  },
];

export const createEmptyCustomMagicTrait = (id: string): ItemMagicTrait => ({
  id,
  source: 'custom',
  type: 'plain',
  name: '自定义魔法词条',
  description: '',
  activationMode: 'always',
  participatesInDamage: false,
  damageDice: '',
  damageBonus: 0,
  damageType: 'damage_none',
});
