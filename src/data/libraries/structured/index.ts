import { STRUCTURED_PHB_ARMORS } from './phbArmors';
import { STRUCTURED_DMG_ART_OBJECTS } from './dmgArtObjects';
import { STRUCTURED_DMG_GEMSTONES } from './dmgGemstones';
import { STRUCTURED_ERLW_DRAGONSHARDS } from './erlwDragonshards';
import { STRUCTURED_PHB_ADVENTURING_GEAR } from './phbAdventuringGear';
import { STRUCTURED_PHB_COMMERCE_TRINKETS } from './phbCommerceTrinkets';
import { STRUCTURED_PHB_MOUNTS_VEHICLES } from './phbMountsVehicles';
import { STRUCTURED_PHB_PACK_SUPPLEMENTAL_ITEMS } from './phbPackSupplementalItems';
import { STRUCTURED_PHB_TOOLS } from './phbTools';
import { STRUCTURED_PHB_WEAPONS } from './phbWeapons';
import type { StructuredMundaneItem } from './types';

export const STRUCTURED_MUNDANE_ITEM_LIBRARY: StructuredMundaneItem[] = [
  ...STRUCTURED_PHB_ARMORS,
  ...STRUCTURED_PHB_WEAPONS,
  ...STRUCTURED_PHB_ADVENTURING_GEAR,
  ...STRUCTURED_PHB_PACK_SUPPLEMENTAL_ITEMS,
  ...STRUCTURED_PHB_TOOLS,
  ...STRUCTURED_PHB_MOUNTS_VEHICLES,
  ...STRUCTURED_PHB_COMMERCE_TRINKETS,
  ...STRUCTURED_DMG_GEMSTONES,
  ...STRUCTURED_DMG_ART_OBJECTS,
  ...STRUCTURED_ERLW_DRAGONSHARDS
];

export const STRUCTURED_ITEM_AUDIT_SUMMARY = {
  total: STRUCTURED_MUNDANE_ITEM_LIBRARY.length,
  sourceMatched: STRUCTURED_MUNDANE_ITEM_LIBRARY.filter((item) => item.audit.sourceMatched).length,
  sourceMismatched: STRUCTURED_MUNDANE_ITEM_LIBRARY.filter((item) => !item.audit.sourceMatched).length
};
