export type StructuredItemSource = 'PHB' | 'DMG' | 'XGE' | 'ERLW' | string;

export type StructuredItemCategory =
  | 'equipment'
  | 'tool'
  | 'transport'
  | 'trade_good'
  | 'service'
  | 'treasure'
  | 'special_material'
  | 'misc';

export type StructuredItemSubcategory =
  | 'armor'
  | 'weapon'
  | 'adventuring_gear'
  | 'container'
  | 'consumable'
  | 'pack'
  | 'artisan_tool'
  | 'general_tool'
  | 'gaming_set'
  | 'musical_instrument'
  | 'vehicle'
  | 'mount'
  | 'gemstone'
  | 'art_object'
  | 'dragonshard'
  | string;

export type StructuredCurrencyUnit = 'cp' | 'sp' | 'ep' | 'gp' | 'pp';

export type StructuredItemRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'very_rare'
  | 'legendary'
  | 'artifact'
  | 'varies';

export type StructuredEnchantmentEffect =
  | { kind: 'attack_bonus'; value: number; note?: string }
  | { kind: 'damage_bonus'; value: number; damageType?: string; note?: string }
  | { kind: 'ac_bonus'; value: number; note?: string }
  | { kind: 'extra_damage'; dice: string; damageType: string; note?: string }
  | { kind: 'ability_override'; ability: string; value: number; note?: string }
  | { kind: 'skill_bonus'; skill: string; value: number; note?: string }
  | { kind: 'resistance'; damageType: string; note?: string }
  | { kind: 'spell_grant'; spellId?: string; name?: string; note?: string }
  | { kind: 'custom_text'; text: string };

export interface StructuredItemMagicDefinition {
  isMagic: boolean;
  magicBonus?: number;
  rarity?: StructuredItemRarity;
  attunement?: {
    requires: boolean;
    condition?: string;
  };
  enchantmentEffects?: StructuredEnchantmentEffect[];
  charges?: {
    max: number;
    resetCondition?: string;
    resetFormula?: string;
  };
  isCursed?: boolean;
}

export interface StructuredItemCost {
  value: number;
  unit: StructuredCurrencyUnit;
}

export interface StructuredAuditField {
  field: string;
  structuredValue: unknown;
  sourceValue: unknown;
  matched: boolean;
}

export interface StructuredItemAudit {
  sourceIntakeId: string;
  sourceFile: string;
  checkedAt: string;
  sourceMatched: boolean;
  comparedFields: StructuredAuditField[];
  issues: string[];
}

export interface StructuredBaseItem {
  id: string;
  name: string;
  englishName?: string;
  source: StructuredItemSource;
  category: StructuredItemCategory;
  subcategory?: StructuredItemSubcategory;
  cost?: StructuredItemCost;
  weight?: number;
  description?: string;
  magic?: StructuredItemMagicDefinition;
  tags?: string[];
  audit: StructuredItemAudit;
}

export type StructuredArmorKind = 'light' | 'medium' | 'heavy' | 'shield';

export interface StructuredArmorItem extends StructuredBaseItem {
  category: 'equipment';
  subcategory: 'armor';
  armorKind: StructuredArmorKind;
  armorClass: {
    base?: number;
    bonus?: number;
    dexBonusMax?: number;
  };
  strengthRequirement?: number;
  stealthDisadvantage: boolean;
  donTime: string;
  doffTime: string;
}

export type StructuredWeaponCategory = 'simple_melee' | 'simple_ranged' | 'martial_melee' | 'martial_ranged';

export type StructuredWeaponDamageType = 'bludgeoning' | 'piercing' | 'slashing';

export type StructuredWeaponProperty =
  | 'ammunition'
  | 'finesse'
  | 'heavy'
  | 'light'
  | 'loading'
  | 'reach'
  | 'special'
  | 'thrown'
  | 'two_handed'
  | 'versatile';

export type StructuredAmmoType = 'arrow' | 'bolt' | 'bullet' | 'needle' | 'none';

export type StructuredToolGroup = 'artisan_tool' | 'gaming_set' | 'musical_instrument' | 'general_tool';

export interface StructuredWeaponItem extends StructuredBaseItem {
  category: 'equipment';
  subcategory: 'weapon';
  weaponCategory: StructuredWeaponCategory;
  damage: {
    dice: string;
    type?: StructuredWeaponDamageType;
  };
  properties: StructuredWeaponProperty[];
  range?: {
    normal: number;
    long?: number;
    unit: 'ft';
  };
  versatileDamage?: string;
  requiredAmmoType?: StructuredAmmoType;
  specialRules?: string;
}

export interface StructuredGearItem extends StructuredBaseItem {
  category: 'equipment';
  subcategory: 'adventuring_gear';
  quantity?: number;
  activation?: string;
  duration?: string;
  rules?: string;
}

export interface StructuredContainerItem extends StructuredBaseItem {
  category: 'equipment';
  subcategory: 'container';
  capacity?: {
    weight?: number;
    volume?: string;
    items?: string;
  };
  rules?: string;
}

export interface StructuredConsumableItem extends StructuredBaseItem {
  category: 'equipment';
  subcategory: 'consumable';
  quantity?: number;
  activation?: string;
  duration?: string;
  effect: string;
  isAmmunition?: boolean;
  ammoType?: StructuredAmmoType;
}

export interface StructuredPackContent {
  itemId: string;
  name: string;
  quantity: number;
}

export interface StructuredPackItem extends StructuredBaseItem {
  category: 'equipment';
  subcategory: 'pack';
  containerId?: string;
  contents: StructuredPackContent[];
}

export interface StructuredToolItem extends StructuredBaseItem {
  category: 'tool';
  subcategory: StructuredToolGroup;
  toolGroupName: string;
  proficiencyAppliesTo?: string;
}

export interface StructuredMountItem extends StructuredBaseItem {
  category: 'transport';
  subcategory: 'mount';
  speed: string;
  carryingCapacity: number;
}

export interface StructuredVehicleItem extends StructuredBaseItem {
  category: 'transport';
  subcategory: 'vehicle';
  vehicleType: 'land' | 'water';
  speed?: string;
  rawSpeed?: string;
}

export interface StructuredCommerceItem extends StructuredBaseItem {
  category: 'trade_good' | 'service' | 'treasure';
  commerceType: string;
  quantity?: string;
}

export interface StructuredTreasureItem extends StructuredBaseItem {
  category: 'treasure';
  subcategory: 'gemstone' | 'art_object' | string;
  valueCategory?: string;
  roll?: number;
  die?: string;
}

export interface StructuredSpecialMaterialItem extends StructuredBaseItem {
  category: 'special_material';
  subcategory: 'dragonshard' | string;
  sourceEnvironment?: string;
  appearance?: string;
  uses?: string;
}

export type StructuredMundaneItem =
  | StructuredBaseItem
  | StructuredArmorItem
  | StructuredWeaponItem
  | StructuredGearItem
  | StructuredContainerItem
  | StructuredConsumableItem
  | StructuredPackItem
  | StructuredToolItem
  | StructuredMountItem
  | StructuredVehicleItem
  | StructuredCommerceItem
  | StructuredTreasureItem
  | StructuredSpecialMaterialItem;
