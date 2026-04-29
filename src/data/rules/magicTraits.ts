import type { ItemMagicTrait } from '../../types/Library';

export const DEFAULT_MAGIC_INVENTORY_BACKGROUND = '#dcc2ff';
export const DEFAULT_MAGIC_ATTACK_BACKGROUND = '#dcc2ff';
export const DEFAULT_MAGIC_NAME_COLOR = '#4f0b22';

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
