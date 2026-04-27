import { ITEM_LIBRARY } from './itemLibrary';
import type { ArmorDefinition } from '../../types/Library';

export const ARMOR_LIBRARY: ArmorDefinition[] = ITEM_LIBRARY.filter(
  (item): item is ArmorDefinition => item.type === 'armor'
);
