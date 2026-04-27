import type { ItemIntakeAudit, ItemIntakeEntry } from '../itemIntake';

const VEHICLE_SOURCE = 'PHB玩家手册';
const VEHICLE_CHECK_DATE = '2026-04-27';

interface MountDraft {
  id: string;
  name: string;
  englishName: string;
  cost: { value: number; unit: 'gp' };
  speed: string;
  carryingCapacity: number;
}

interface GearVehicleDraft {
  id: string;
  name: string;
  englishName: string;
  category: '鞍具挽具陆运载具';
  cost?: { value: number; unit: 'cp' | 'sp' | 'gp' };
  weight?: number;
  rawCost: string;
  rawWeight: string;
  description?: string;
  auditIssues?: string[];
}

interface WaterVehicleDraft {
  id: string;
  name: string;
  englishName: string;
  cost: { value: number; unit: 'gp' };
  speed?: string;
  rawSpeed: string;
  auditIssues?: string[];
}

const VEHICLE_USEFUL_FIELDS = [
  '中英文名称',
  '类别',
  '价格',
  '速度',
  '载重',
  '重量',
  '规则说明'
];

const audit = (summary: string, issues: string[] = []): ItemIntakeAudit => ({
  sourceMatched: issues.length === 0,
  checkedAt: VEHICLE_CHECK_DATE,
  summary,
  issues
});

const mount = (draft: MountDraft): ItemIntakeEntry => ({
  id: `mount_${draft.id}`,
  source: VEHICLE_SOURCE,
  status: 'parsed',
  rawText: `${draft.name}${draft.englishName} | ${draft.cost.value} gp | 速度${draft.speed} | 载重${draft.carryingCapacity}磅`,
  understanding: '坐骑或动物条目，来自PHB“坐骑和其他动物”表。',
  usefulFields: VEHICLE_USEFUL_FIELDS,
  parsed: {
    id: draft.id,
    name: `${draft.name} (${draft.englishName})`,
    type: 'gear',
    cost: draft.cost,
    weight: 0,
    speed: draft.speed,
    carryingCapacity: draft.carryingCapacity,
    tags: ['坐骑和其他动物'],
    description: `速度${draft.speed}，基础载重${draft.carryingCapacity}磅。`
  },
  audit: audit(`已核对 ${draft.name} 的名称、价格、速度和载重。`)
});

const gearVehicle = (draft: GearVehicleDraft): ItemIntakeEntry => ({
  id: `vehicle_gear_${draft.id}`,
  source: VEHICLE_SOURCE,
  status: 'parsed',
  rawText: `${draft.name}${draft.englishName} | ${draft.rawCost} | ${draft.rawWeight}`,
  understanding: '鞍具、挽具或陆运载具条目，来自PHB“鞍具、挽具及陆运载具”表。',
  usefulFields: VEHICLE_USEFUL_FIELDS,
  parsed: {
    id: draft.id,
    name: `${draft.name} (${draft.englishName})`,
    type: 'gear',
    cost: draft.cost,
    weight: draft.weight,
    tags: [draft.category],
    description: draft.description ?? `PHB鞍具、挽具及陆运载具表中的${draft.name}。`
  },
  audit: audit(`已核对 ${draft.name} 的名称、价格和重量。`, draft.auditIssues)
});

const waterVehicle = (draft: WaterVehicleDraft): ItemIntakeEntry => ({
  id: `water_vehicle_${draft.id}`,
  source: VEHICLE_SOURCE,
  status: 'parsed',
  rawText: `${draft.name}${draft.englishName} | ${draft.cost.value} gp | ${draft.rawSpeed}`,
  understanding: '水运载具条目，来自PHB“水运载具”表。',
  usefulFields: VEHICLE_USEFUL_FIELDS,
  notes: draft.auditIssues?.length ? '原文速度存在问号，需用户确认后再清空审核问题。' : undefined,
  parsed: {
    id: draft.id,
    name: `${draft.name} (${draft.englishName})`,
    type: 'gear',
    cost: draft.cost,
    weight: 0,
    speed: draft.speed,
    rawSpeed: draft.rawSpeed,
    tags: ['水运载具'],
    description: `PHB水运载具表中的${draft.name}，速度${draft.rawSpeed}。`
  },
  audit: audit(`已核对 ${draft.name} 的名称、价格和速度。`, draft.auditIssues)
});

export const PHB_MOUNTS_VEHICLES_INTAKE: ItemIntakeEntry[] = [
  mount({ id: 'camel', name: '骆驼', englishName: 'Camel', cost: { value: 50, unit: 'gp' }, speed: '50尺', carryingCapacity: 480 }),
  mount({ id: 'donkey_mule', name: '驴或骡', englishName: 'Donkey or Mule', cost: { value: 8, unit: 'gp' }, speed: '40尺', carryingCapacity: 420 }),
  mount({ id: 'elephant', name: '象', englishName: 'Elephant', cost: { value: 200, unit: 'gp' }, speed: '40尺', carryingCapacity: 1320 }),
  mount({ id: 'draft_horse', name: '驮用马', englishName: 'Draft Horse', cost: { value: 50, unit: 'gp' }, speed: '40尺', carryingCapacity: 540 }),
  mount({ id: 'riding_horse', name: '乘用马', englishName: 'Riding Horse', cost: { value: 75, unit: 'gp' }, speed: '60尺', carryingCapacity: 480 }),
  mount({ id: 'mastiff', name: '獒犬', englishName: 'Mastiff', cost: { value: 25, unit: 'gp' }, speed: '40尺', carryingCapacity: 195 }),
  mount({ id: 'pony', name: '矮种马', englishName: 'Pony', cost: { value: 30, unit: 'gp' }, speed: '40尺', carryingCapacity: 225 }),
  mount({ id: 'warhorse', name: '战马', englishName: 'Warhorse', cost: { value: 400, unit: 'gp' }, speed: '60尺', carryingCapacity: 540 }),

  gearVehicle({ id: 'barding', name: '具装', englishName: 'Barding', category: '鞍具挽具陆运载具', rawCost: '同款护甲×4', rawWeight: '同款护甲×2', description: '具装是用以保护动物头、颈、胸、身的护甲。护甲表中的任何护甲都可加工成具装，其价格为同款类人生物护甲的四倍，重量为两倍。', auditIssues: ['具装价格和重量是公式而非固定数值。'] }),
  gearVehicle({ id: 'bit_and_bridle', name: '辔具', englishName: 'Bit and Bridle', category: '鞍具挽具陆运载具', cost: { value: 2, unit: 'gp' }, weight: 1, rawCost: '2 gp', rawWeight: '1磅' }),
  gearVehicle({ id: 'carriage', name: '四轮客车', englishName: 'Carriage', category: '鞍具挽具陆运载具', cost: { value: 100, unit: 'gp' }, weight: 600, rawCost: '100 gp', rawWeight: '600磅' }),
  gearVehicle({ id: 'cart', name: '二轮货车', englishName: 'Cart', category: '鞍具挽具陆运载具', cost: { value: 15, unit: 'gp' }, weight: 200, rawCost: '15 gp', rawWeight: '200磅' }),
  gearVehicle({ id: 'chariot', name: '二轮战车', englishName: 'Chariot', category: '鞍具挽具陆运载具', cost: { value: 250, unit: 'gp' }, weight: 100, rawCost: '250 gp', rawWeight: '100磅' }),
  gearVehicle({ id: 'feed_day', name: '饲料', englishName: 'Feed (per day)', category: '鞍具挽具陆运载具', cost: { value: 5, unit: 'cp' }, weight: 10, rawCost: '5 cp', rawWeight: '10磅' }),
  gearVehicle({ id: 'saddle_exotic', name: '特制鞍座', englishName: 'Saddle, Exotic', category: '鞍具挽具陆运载具', cost: { value: 60, unit: 'gp' }, weight: 40, rawCost: '60 gp', rawWeight: '40磅', description: '水栖和飞行坐骑只能使用特别制作的鞍座。' }),
  gearVehicle({ id: 'saddle_military', name: '军用鞍座', englishName: 'Saddle, Military', category: '鞍具挽具陆运载具', cost: { value: 20, unit: 'gp' }, weight: 30, rawCost: '20 gp', rawWeight: '30磅', description: '军用鞍座用以稳固骑师坐姿。使用鞍座时，你为维持骑乘姿势所进行的任何检定都具有优势。' }),
  gearVehicle({ id: 'saddle_pack', name: '驮役鞍座', englishName: 'Saddle, Pack', category: '鞍具挽具陆运载具', cost: { value: 5, unit: 'gp' }, weight: 15, rawCost: '5 gp', rawWeight: '15磅' }),
  gearVehicle({ id: 'saddle_riding', name: '骑乘鞍座', englishName: 'Saddle, Riding', category: '鞍具挽具陆运载具', cost: { value: 10, unit: 'gp' }, weight: 25, rawCost: '10 gp', rawWeight: '25磅' }),
  gearVehicle({ id: 'saddlebags', name: '鞍囊', englishName: 'Saddlebags', category: '鞍具挽具陆运载具', cost: { value: 4, unit: 'gp' }, weight: 8, rawCost: '4 gp', rawWeight: '8磅' }),
  gearVehicle({ id: 'sled', name: '木橇', englishName: 'Sled', category: '鞍具挽具陆运载具', cost: { value: 20, unit: 'gp' }, weight: 300, rawCost: '20 gp', rawWeight: '300磅' }),
  gearVehicle({ id: 'stabling_day', name: '马厩', englishName: 'Stabling (per day)', category: '鞍具挽具陆运载具', cost: { value: 5, unit: 'sp' }, weight: 0, rawCost: '5 sp', rawWeight: '－' }),
  gearVehicle({ id: 'wagon', name: '四轮货车', englishName: 'Wagon', category: '鞍具挽具陆运载具', cost: { value: 35, unit: 'gp' }, weight: 400, rawCost: '35 gp', rawWeight: '400磅' }),

  waterVehicle({ id: 'galley', name: '桨帆船', englishName: 'Galley', cost: { value: 30000, unit: 'gp' }, speed: '4 mph', rawSpeed: '4 mph' }),
  waterVehicle({ id: 'keelboat', name: '龙骨船', englishName: 'Keelboat', cost: { value: 3000, unit: 'gp' }, speed: '1 mph', rawSpeed: '1 mph' }),
  waterVehicle({ id: 'longship', name: '单帆长船', englishName: 'Longship', cost: { value: 10000, unit: 'gp' }, speed: '3 mph', rawSpeed: '3 mph' }),
  waterVehicle({ id: 'rowboat', name: '划艇', englishName: 'Rowboat', cost: { value: 50, unit: 'gp' }, speed: '1.5 mph', rawSpeed: '1又1/2 mph' }),
  waterVehicle({ id: 'sailing_ship', name: '帆船', englishName: 'Sailing Ship', cost: { value: 10000, unit: 'gp' }, speed: '2 mph', rawSpeed: '2 mph' }),
  waterVehicle({ id: 'warship', name: '战舰', englishName: 'Warship', cost: { value: 25000, unit: 'gp' }, speed: '2.5 mph', rawSpeed: '2又1/2 mph' })
];
