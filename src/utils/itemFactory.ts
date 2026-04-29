import { getLibraryItemById } from '../data/libraries/itemLibrary';
import type { ConsumableData, ContainerData, InventoryItem } from '../types/Item';
import type { ConsumableDefinition } from '../types/Library';
import { generateUUID } from './idGenerator';
import { createRendererLogger } from './rendererLogger';
import { cloneMagicDefinition } from './magicItems';

const logger = createRendererLogger('utils/itemFactory');

const inventoryUnitWeight = (def: NonNullable<ReturnType<typeof getLibraryItemById>>): number => {
  const multiplicity = def.multiplicity;

  if (
    multiplicity &&
    ['split', 'split_grouped', 'split_custom_rule'].includes(multiplicity.mode) &&
    multiplicity.sourceQuantity > 0
  ) {
    return def.weight / multiplicity.sourceQuantity;
  }

  return def.weight;
};

export function createItemFromLibrary(templateId: string): InventoryItem | null {
  const def = getLibraryItemById(templateId);

  if (!def) {
    logger.warn('Cannot find library item', { templateId });
    return null;
  }

  const {
    id: definitionId,
    magic,
    multiplicity,
    acquisitionRule,
    descriptionBlocks,
    audit,
    ...dataProps
  } = def;
  void definitionId;
  void multiplicity;
  void acquisitionRule;
  void descriptionBlocks;
  void audit;

  const instanceData: InventoryItem['data'] = { ...dataProps };

  if (def.type === 'consumable') {
    const consDef = def as ConsumableDefinition;
    const consumableData = instanceData as ConsumableData;
    if (consDef.maxCharges) {
      consumableData.charges = consDef.maxCharges;
    }
  }

  if (def.type === 'container') {
    const containerData = instanceData as ContainerData;
    containerData.isOpen = true;
  }

  return {
    instanceId: generateUUID(),
    templateId: def.id,
    name: def.name,
    type: def.type,
    magic: cloneMagicDefinition(magic),
    weight: inventoryUnitWeight(def),
    quantity: 1,
    parentId: undefined,
    description: def.description,
    descriptionBlocks: def.descriptionBlocks,
    data: instanceData
  };
}
