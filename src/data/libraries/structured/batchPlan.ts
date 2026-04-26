export type StructuredBatchStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export interface StructuredBatchPlanItem {
  id: string;
  label: string;
  sourceFile: string;
  outputFile: string;
  status: StructuredBatchStatus;
  scope: string[];
  auditFocus: string[];
}

export const STRUCTURED_BATCH_PLAN: StructuredBatchPlanItem[] = [
  {
    id: 'phb_armors',
    label: 'PHB armor and shields',
    sourceFile: 'src/data/libraries/intake/phbArmors.ts',
    outputFile: 'src/data/libraries/structured/phbArmors.ts',
    status: 'completed',
    scope: ['light armor', 'medium armor', 'heavy armor', 'shield'],
    auditFocus: ['name', 'cost', 'weight', 'armor kind', 'AC', 'dex cap', 'strength requirement', 'stealth disadvantage', 'don time', 'doff time']
  },
  {
    id: 'phb_weapons',
    label: 'PHB weapons',
    sourceFile: 'src/data/libraries/intake/phbWeapons.ts',
    outputFile: 'src/data/libraries/structured/phbWeapons.ts',
    status: 'completed',
    scope: ['simple melee weapons', 'simple ranged weapons', 'martial melee weapons', 'martial ranged weapons'],
    auditFocus: ['name', 'cost', 'weight', 'weapon category', 'damage dice', 'damage type', 'properties', 'range', 'versatile damage', 'ammunition type', 'special rules']
  },
  {
    id: 'phb_adventuring_gear',
    label: 'PHB adventuring gear, containers, consumables, and packs',
    sourceFile: 'src/data/libraries/intake/phbAdventuringGear.ts',
    outputFile: 'src/data/libraries/structured/phbAdventuringGear.ts',
    status: 'completed',
    scope: ['standard gear', 'containers', 'consumables', 'ammunition', 'equipment packs'],
    auditFocus: ['name', 'cost', 'weight', 'quantity', 'capacity', 'activation', 'duration', 'pack contents', 'special rules']
  },
  {
    id: 'phb_tools',
    label: 'PHB tools',
    sourceFile: 'src/data/libraries/intake/phbTools.ts',
    outputFile: 'src/data/libraries/structured/phbTools.ts',
    status: 'completed',
    scope: ["artisan's tools", 'gaming sets', 'musical instruments', 'general tools and kits', 'vehicle proficiency references'],
    auditFocus: ['name', 'cost', 'weight', 'tool group', 'description', 'carryable vs reference-only classification']
  },
  {
    id: 'xge_tool_descriptions',
    label: 'XGE tool descriptions',
    sourceFile: 'src/data/libraries/intake/xgeToolDescriptions.ts',
    outputFile: 'src/data/libraries/structured/xgeToolDescriptions.ts',
    status: 'completed',
    scope: ['components', 'skill interactions', 'special uses', 'sample DCs'],
    auditFocus: ['matching PHB tool id', 'components', 'skills', 'special uses', 'sample DC values', 'source typo notes']
  },
  {
    id: 'phb_mounts_vehicles',
    label: 'PHB mounts and vehicles',
    sourceFile: 'src/data/libraries/intake/phbMountsVehicles.ts',
    outputFile: 'src/data/libraries/structured/phbMountsVehicles.ts',
    status: 'completed',
    scope: ['mounts', 'tack and harness', 'drawn vehicles', 'waterborne vehicles'],
    auditFocus: ['name', 'cost', 'weight', 'speed', 'capacity', 'vehicle subtype', 'reference-only classification']
  },
  {
    id: 'phb_commerce_trinkets',
    label: 'PHB commerce, services, expenses, and trinkets',
    sourceFile: 'src/data/libraries/intake/phbCommerceTrinkets.ts',
    outputFile: 'src/data/libraries/structured/phbCommerceTrinkets.ts',
    status: 'completed',
    scope: ['trade goods', 'food and lodging', 'services', 'spellcasting services', 'lifestyle expenses', 'trinkets'],
    auditFocus: ['name', 'cost', 'unit', 'quantity', 'service duration', 'reference-only classification', 'trinket roll number']
  },
  {
    id: 'dmg_gemstones',
    label: 'DMG gemstones',
    sourceFile: 'src/data/libraries/intake/dmgGemstones.ts',
    outputFile: 'src/data/libraries/structured/dmgGemstones.ts',
    status: 'completed',
    scope: ['gemstone value tiers', 'individual gemstones'],
    auditFocus: ['name', 'value', 'currency', 'tier grouping', 'duplicate value consistency']
  },
  {
    id: 'dmg_art_objects',
    label: 'DMG art objects',
    sourceFile: 'src/data/libraries/intake/dmgArtObjects.ts',
    outputFile: 'src/data/libraries/structured/dmgArtObjects.ts',
    status: 'completed',
    scope: ['art object value tiers', 'individual art objects'],
    auditFocus: ['name', 'value', 'currency', 'tier grouping', 'incomplete table notes']
  },
  {
    id: 'erlw_dragonshards',
    label: 'ERLW dragonshards and non-magic treasure materials',
    sourceFile: 'src/data/libraries/intake/erlwTreasureMagicItems.ts',
    outputFile: 'src/data/libraries/structured/erlwDragonshards.ts',
    status: 'completed',
    scope: ['Eberron dragonshards', 'Khyber dragonshards', 'Siberys dragonshards'],
    auditFocus: ['name', 'non-magic classification', 'appearance', 'source environment', 'use cases', 'setting notes']
  }
];
