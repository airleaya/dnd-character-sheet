import type { ItemCost, ItemMagicDefinition, ItemType } from '../../types/Library';

export type IntakeStatus = 'raw' | 'parsed' | 'normalized' | 'embedded';

export interface ItemIntakeAudit {
  sourceMatched: boolean;
  checkedAt: string;
  summary: string;
  issues: string[];
}

export interface ItemIntakeEntry {
  id: string;
  source: string;
  status: IntakeStatus;
  rawText: string;
  understanding?: string;
  usefulFields?: string[];
  notes?: string;
  parsed?: {
    id?: string;
    name?: string;
    type?: ItemType | 'unknown';
    cost?: ItemCost;
    weight?: number;
    description?: string;
    rarity?: string;
    magic?: ItemMagicDefinition;
    aliases?: string[];
    tags?: string[];
    [key: string]: unknown;
  };
  audit?: ItemIntakeAudit;
}

import { PHB_ARMOR_INTAKE } from './intake/phbArmors';
import { PHB_ADVENTURING_GEAR_INTAKE } from './intake/phbAdventuringGear';
import { PHB_COMMERCE_TRINKET_INTAKE } from './intake/phbCommerceTrinkets';
import { PHB_MOUNTS_VEHICLES_INTAKE } from './intake/phbMountsVehicles';
import { PHB_TOOL_INTAKE } from './intake/phbTools';
import { PHB_WEAPON_INTAKE } from './intake/phbWeapons';
import { DMG_ART_OBJECT_INTAKE } from './intake/dmgArtObjects';
import { DMG_GEMSTONE_INTAKE } from './intake/dmgGemstones';
import { DMG_MAGIC_ITEM_INTAKE } from './intake/dmgMagicItems';
import { ERLW_TREASURE_MAGIC_ITEM_INTAKE } from './intake/erlwTreasureMagicItems';
import { XGE_MAGIC_ITEM_INTAKE } from './intake/xgeMagicItems';
import { XGE_TOOL_DESCRIPTION_INTAKE } from './intake/xgeToolDescriptions';

export const ITEM_INTAKE_LIBRARY: ItemIntakeEntry[] = [
  ...PHB_ARMOR_INTAKE,
  ...PHB_WEAPON_INTAKE,
  ...PHB_ADVENTURING_GEAR_INTAKE,
  ...PHB_TOOL_INTAKE,
  ...PHB_MOUNTS_VEHICLES_INTAKE,
  ...PHB_COMMERCE_TRINKET_INTAKE,
  ...DMG_GEMSTONE_INTAKE,
  ...DMG_ART_OBJECT_INTAKE,
  ...DMG_MAGIC_ITEM_INTAKE,
  ...ERLW_TREASURE_MAGIC_ITEM_INTAKE,
  ...XGE_MAGIC_ITEM_INTAKE,
  ...XGE_TOOL_DESCRIPTION_INTAKE
];
