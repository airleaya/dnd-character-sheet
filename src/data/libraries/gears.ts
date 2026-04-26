import { ITEM_LIBRARY } from './itemLibrary';
import type { GearDefinition } from '../../types/Library';

export const GEAR_LIBRARY: GearDefinition[] = ITEM_LIBRARY.filter(
  (item): item is GearDefinition => item.type === 'gear'
);
