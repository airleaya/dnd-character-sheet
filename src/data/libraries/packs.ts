import { ITEM_LIBRARY } from './itemLibrary';
import type { PackDefinition } from '../../types/Library';

export const PACK_LIBRARY: PackDefinition[] = ITEM_LIBRARY.filter(
  (item): item is PackDefinition => item.type === 'pack'
);
