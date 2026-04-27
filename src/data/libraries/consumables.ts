import { ITEM_LIBRARY } from './itemLibrary';
import type { ConsumableDefinition } from '../../types/Library';

export const CONSUMABLE_LIBRARY: ConsumableDefinition[] = ITEM_LIBRARY.filter(
  (item): item is ConsumableDefinition => item.type === 'consumable'
);
