import { PHB_MOUNTS_VEHICLES_INTAKE } from '../intake/phbMountsVehicles';
import type { ItemIntakeEntry } from '../itemIntake';
import type {
  StructuredAuditField,
  StructuredBaseItem,
  StructuredGearItem,
  StructuredMountItem,
  StructuredVehicleItem
} from './types';

const SOURCE = 'PHB';
const SOURCE_FILE = 'src/data/libraries/intake/phbMountsVehicles.ts';
const CHECKED_AT = '2026-04-27';

type ParsedMountVehicle = NonNullable<ItemIntakeEntry['parsed']> & {
  id: string;
  name: string;
  speed?: string;
  rawSpeed?: string;
  carryingCapacity?: number;
};

type StructuredMountVehicleItem =
  | StructuredMountItem
  | StructuredVehicleItem
  | StructuredGearItem
  | StructuredBaseItem;

const LAND_VEHICLE_IDS = new Set(['carriage', 'cart', 'chariot', 'sled', 'wagon']);
const WATER_VEHICLE_TAG = '水运载具';
const SERVICE_IDS = new Set(['stabling_day']);

const isParsed = (entry: ItemIntakeEntry): entry is ItemIntakeEntry & { parsed: ParsedMountVehicle } =>
  Boolean(entry.parsed?.id && entry.parsed?.name);

const splitDisplayName = (displayName: string) => {
  const match = /^(.+?) \((.*)\)$/.exec(displayName);

  return {
    name: match?.[1] ?? displayName,
    englishName: match?.[2]
  };
};

const field = (fieldName: string, structuredValue: unknown, sourceValue: unknown): StructuredAuditField => ({
  field: fieldName,
  structuredValue,
  sourceValue,
  matched: JSON.stringify(structuredValue) === JSON.stringify(sourceValue)
});

const audit = (sourceIntakeId: string, comparedFields: StructuredAuditField[], issues: string[] = []) => {
  const driftIssues = comparedFields
    .filter((entry) => !entry.matched)
    .map((entry) => `${entry.field} differs from intake value.`);

  return {
    sourceIntakeId,
    sourceFile: SOURCE_FILE,
    checkedAt: CHECKED_AT,
    sourceMatched: comparedFields.every((entry) => entry.matched),
    comparedFields,
    issues: [...issues, ...driftIssues]
  };
};

const baseFields = (entry: ItemIntakeEntry & { parsed: ParsedMountVehicle }) => {
  const names = splitDisplayName(entry.parsed.name);

  return {
    id: entry.parsed.id,
    name: names.name,
    englishName: names.englishName,
    source: SOURCE,
    cost: entry.parsed.cost,
    weight: entry.parsed.weight,
    description: entry.parsed.description,
    tags: entry.parsed.tags
  };
};

const baseAuditFields = (
  entry: ItemIntakeEntry & { parsed: ParsedMountVehicle },
  base: ReturnType<typeof baseFields>
) => [
  field('id', base.id, entry.parsed.id),
  field('name', base.name, splitDisplayName(entry.parsed.name).name),
  field('englishName', base.englishName, splitDisplayName(entry.parsed.name).englishName),
  field('source', base.source, SOURCE),
  field('cost', base.cost, entry.parsed.cost),
  field('weight', base.weight, entry.parsed.weight),
  field('description', base.description, entry.parsed.description),
  field('tags', base.tags, entry.parsed.tags)
];

const asMount = (entry: ItemIntakeEntry & { parsed: ParsedMountVehicle }): StructuredMountItem => {
  const base = baseFields(entry);
  const comparedFields = [
    ...baseAuditFields(entry, base),
    field('category', 'transport', 'transport'),
    field('subcategory', 'mount', 'mount'),
    field('speed', entry.parsed.speed, entry.parsed.speed),
    field('carryingCapacity', entry.parsed.carryingCapacity, entry.parsed.carryingCapacity)
  ];

  return {
    ...base,
    category: 'transport',
    subcategory: 'mount',
    speed: entry.parsed.speed ?? '',
    carryingCapacity: entry.parsed.carryingCapacity ?? 0,
    audit: audit(entry.id, comparedFields)
  };
};

const asVehicle = (
  entry: ItemIntakeEntry & { parsed: ParsedMountVehicle },
  vehicleType: 'land' | 'water'
): StructuredVehicleItem => {
  const base = baseFields(entry);
  const comparedFields = [
    ...baseAuditFields(entry, base),
    field('category', 'transport', 'transport'),
    field('subcategory', 'vehicle', 'vehicle'),
    field('vehicleType', vehicleType, vehicleType),
    field('speed', entry.parsed.speed, entry.parsed.speed),
    field('rawSpeed', entry.parsed.rawSpeed, entry.parsed.rawSpeed)
  ];

  return {
    ...base,
    category: 'transport',
    subcategory: 'vehicle',
    vehicleType,
    speed: entry.parsed.speed,
    rawSpeed: entry.parsed.rawSpeed,
    audit: audit(entry.id, comparedFields)
  };
};

const asGear = (entry: ItemIntakeEntry & { parsed: ParsedMountVehicle }): StructuredGearItem => {
  const base = baseFields(entry);
  const comparedFields = [
    ...baseAuditFields(entry, base),
    field('category', 'equipment', 'equipment'),
    field('subcategory', 'adventuring_gear', 'adventuring_gear')
  ];

  return {
    ...base,
    category: 'equipment',
    subcategory: 'adventuring_gear',
    audit: audit(entry.id, comparedFields, entry.audit?.issues)
  };
};

const asServiceReference = (entry: ItemIntakeEntry & { parsed: ParsedMountVehicle }): StructuredBaseItem => {
  const base = baseFields(entry);
  const comparedFields = [
    ...baseAuditFields(entry, base),
    field('category', 'service', 'service'),
    field('subcategory', 'stabling', 'stabling')
  ];

  return {
    ...base,
    category: 'service',
    subcategory: 'stabling',
    audit: audit(entry.id, comparedFields)
  };
};

export const STRUCTURED_PHB_MOUNTS_VEHICLES: StructuredMountVehicleItem[] = PHB_MOUNTS_VEHICLES_INTAKE
  .filter(isParsed)
  .map((entry) => {
    if (entry.id.startsWith('mount_')) {
      return asMount(entry);
    }

    if (entry.parsed.tags?.includes(WATER_VEHICLE_TAG)) {
      return asVehicle(entry, 'water');
    }

    if (LAND_VEHICLE_IDS.has(entry.parsed.id)) {
      return asVehicle(entry, 'land');
    }

    if (SERVICE_IDS.has(entry.parsed.id)) {
      return asServiceReference(entry);
    }

    return asGear(entry);
  });

export const STRUCTURED_PHB_MOUNTS_VEHICLES_AUDIT_SUMMARY = {
  total: STRUCTURED_PHB_MOUNTS_VEHICLES.length,
  sourceMatched: STRUCTURED_PHB_MOUNTS_VEHICLES.filter((item) => item.audit.sourceMatched).length,
  sourceMismatched: STRUCTURED_PHB_MOUNTS_VEHICLES.filter((item) => !item.audit.sourceMatched).length,
  intakeTotal: PHB_MOUNTS_VEHICLES_INTAKE.length
};
