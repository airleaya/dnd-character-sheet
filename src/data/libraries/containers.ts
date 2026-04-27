import { ITEM_LIBRARY } from './itemLibrary';
import type { ContainerDefinition } from '../../types/Library';

export const CONTAINER_LIBRARY: ContainerDefinition[] = ITEM_LIBRARY.filter(
  (item): item is ContainerDefinition => item.type === 'container'
);
