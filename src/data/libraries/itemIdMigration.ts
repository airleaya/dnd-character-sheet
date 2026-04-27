import { getLibraryItemById } from './itemLibrary';

export const LEGACY_ITEM_ID_MIGRATION: Record<string, string> = {
  alchemist_supplies: 'alchemists_supplies',
  basic_poison: 'basic_poison_vial',
  bolts: 'crossbow_bolts',
  bullets: 'sling_bullets',
  case_map_scroll: 'map_scroll_case',
  flask: 'flask_tankard',
  healer_kit: 'healers_kit',
  heavy_crossbow: 'crossbow_heavy',
  hand_crossbow: 'crossbow_hand',
  ink_bottle: 'ink_1oz',
  jug: 'jug_pitcher',
  knife_small: 'small_knife',
  light_crossbow: 'crossbow_light',
  mirror_steel: 'steel_mirror',
  navigator_tools: 'navigators_tools',
  oil: 'oil_flask',
  pack_burglar: 'burglars_pack',
  pack_diplomat: 'diplomats_pack',
  pack_dungeoneer: 'dungeoneers_pack',
  pack_entertainer: 'entertainers_pack',
  pack_explorer: 'explorers_pack',
  pack_priest: 'priests_pack',
  pack_scholar: 'scholars_pack',
  paper: 'paper_sheet',
  parchment: 'parchment_sheet',
  perfume: 'perfume_vial',
  poisoner_kit: 'poisoners_kit',
  rope_hempen: 'hempen_rope_50ft',
  rope_silk: 'silk_rope_50ft',
  sand_bag: 'sand_bag',
  smith_tools: 'smiths_tools',
  tinker_tools: 'tinkers_tools',
  vial_acid: 'acid_vial',
  vial_holy_water: 'holy_water_flask',
  woodcarver_tools: 'woodcarvers_tools'
};

export const migrateItemTemplateId = (templateId: string): string => {
  const migratedId = LEGACY_ITEM_ID_MIGRATION[templateId] ?? templateId;
  return getLibraryItemById(migratedId) ? migratedId : templateId;
};

export const isKnownLibraryItemId = (templateId: string): boolean => Boolean(getLibraryItemById(templateId));
