import { ITEM_LIBRARY } from './itemLibrary';
import type { TreasureDefinition } from '../../types/Library';

export const TREASURE_LIBRARY: TreasureDefinition[] = ITEM_LIBRARY.filter(
  (item): item is TreasureDefinition => item.type === 'treasure'
);
