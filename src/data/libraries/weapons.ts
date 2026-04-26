import { ITEM_LIBRARY } from './itemLibrary';
import type { WeaponDefinition } from '../../types/Library';

export const WEAPON_LIBRARY: WeaponDefinition[] = ITEM_LIBRARY.filter(
  (item): item is WeaponDefinition => item.type === 'weapon'
);
