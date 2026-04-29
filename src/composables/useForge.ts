import { ref, computed } from 'vue';
import { useActiveSheetStore } from '../stores/activeSheet';
import { createItemFromLibrary } from '../utils/itemFactory';
import { parseDragPayload } from '../utils/inventoryDropUtils';
import { createRendererLogger } from '../utils/rendererLogger';
import type { InventoryItem } from '../types/Item';
import type {
  AbilityKey,
  AmmoTypeKey,
  ArmorType,
  CurrencyUnit,
  ItemRarity,
  ItemType,
  WeaponCategory,
  WeaponPropertyKey,
} from '../types/Library';


export interface ForgeDraftData {
  cost: {
    value: number;
    unit: CurrencyUnit;
  };
  type?: ItemType;
  category?: WeaponCategory | string;
  subcategory?: string;
  displayCategory?: string;
  displaySubcategory?: string;
  source?: string;
  englishName?: string;
  rarity?: string;
  tags?: string[];
  damage?: string;
  damageType?: string;
  properties?: WeaponPropertyKey[];
  range?: string;
  versatileDamage?: string;
  specialEffect?: string;
  requiredAmmoType?: AmmoTypeKey;
  ac?: number;
  armorType?: ArmorType;
  dexBonusMax?: number;
  strReq?: number;
  stealthDis?: boolean;
  donTime?: string;
  doffTime?: string;
  baseAbility?: AbilityKey;
  activation?: string;
  effectDescription?: string;
  isAmmunition?: boolean;
  ammoType?: AmmoTypeKey;
  maxCharges?: number;
  charges?: number;
  capacityWeight?: number;
  capacityVolume?: string;
  ignoreContentWeight?: boolean;
  maxItems?: number;
  magic?: {
    isMagic: boolean;
    magicBonus?: number;
    rarity?: ItemRarity;
    attunement?: {
      requires: boolean;
      condition?: string;
    };
  };
  [key: string]: unknown;
}


// --- 全局单例状态 ---

const draftItem = ref<InventoryItem | null>(null);
const forgeMode = ref<'create' | 'edit'>('create');
const logger = createRendererLogger('composables/useForge');

export function useForge() {
  const store = useActiveSheetStore();
  const draftData = computed<ForgeDraftData>(() => {
    if (!draftItem.value) {
      return {
        cost: { value: 0, unit: 'gp' },
      };
    }

    return draftItem.value.data as ForgeDraftData;
  });

  const ensureTypeDefaults = (type: ItemType) => {
    if (!draftItem.value) return;
    const data = draftData.value;
    data.type = type;

    if (type === 'weapon') {
      data.category = data.category ?? 'simple_melee';
      data.damage = data.damage ?? '1d4';
      data.damageType = data.damageType ?? 'bludgeoning';
      data.properties = Array.isArray(data.properties) ? data.properties : [];
      data.range = data.range ?? '5 尺';
      data.requiredAmmoType = data.requiredAmmoType ?? 'none';
    }

    if (type === 'armor') {
      data.armorType = data.armorType ?? 'light';
      data.ac = typeof data.ac === 'number' ? data.ac : 11;
      data.donTime = data.donTime ?? '1 分钟';
      data.doffTime = data.doffTime ?? '1 分钟';
    }

    if (type === 'tool') {
      data.baseAbility = data.baseAbility ?? 'dex';
    }

    if (type === 'consumable') {
      data.isAmmunition = data.isAmmunition === true;
      data.ammoType = data.ammoType ?? 'none';
    }

    if (type === 'container') {
      data.capacityWeight = typeof data.capacityWeight === 'number' ? data.capacityWeight : 0;
      data.capacityVolume = data.capacityVolume ?? '';
      data.ignoreContentWeight = data.ignoreContentWeight === true;
    }
  };





  // 🛡️ 新增：最小化的数据补全函数
  const ensureCostStructure = () => {
    if (!draftItem.value) return;
    const data = draftData.value;
    data.type = draftItem.value.type;
    data.name = draftItem.value.name;
    data.weight = draftItem.value.weight;
    data.description = draftItem.value.description ?? '';

    
    // 如果 cost 不存在，或者格式不对，初始化它
    // 基于 Library.ts 的 ItemCost 定义: { value, unit }
    if (!('cost' in data) || !data.cost) {
      data.cost = { value: 0, unit: 'gp' };
    } else {
      // 兼容性检查：确保 value 存在 (防止 undefined 显示)
      if (typeof data.cost.value !== 'number') data.cost.value = 0;
      if (!data.cost.unit) data.cost.unit = 'gp';
    }

    if (!draftItem.value.magic) {
      draftItem.value.magic = { isMagic: false };
    }
    if (!draftItem.value.magic.attunement) {
      draftItem.value.magic.attunement = { requires: false };
    }

    data.magic = {
      isMagic: draftItem.value.magic.isMagic ?? false,
      magicBonus: draftItem.value.magic.magicBonus,
      rarity: draftItem.value.magic.rarity,
      attunement: draftItem.value.magic.attunement,
    };

    ensureTypeDefaults(draftItem.value.type);
  };


  const handleDropData = (jsonStr: string) => {
    const parsedPayload = parseDragPayload(jsonStr);
    if (!parsedPayload) {
      logger.error('Invalid drag payload');
      return;
    }

    try {
      // 2. 分支判断
      if (parsedPayload.type === 'library-item') {
        const newItem = createItemFromLibrary(parsedPayload.id);
        if (newItem) {
          draftItem.value = newItem;
          forgeMode.value = 'create';
          ensureCostStructure();
        } else {
          logger.error('Failed to create library item', undefined, { libraryId: parsedPayload.id });
          if (parsedPayload.id === 'TEST-ID') {
            draftItem.value = {
              instanceId: 'test-inst',
              templateId: 'test',
              name: '测试物品',
              type: 'gear',
              weight: 1,
              quantity: 1,
              data: {},
            };
            forgeMode.value = 'create';
            ensureCostStructure();
          }
        }
      } else if (parsedPayload.type === 'inventory-item') {
        const original = store.character?.inventory.find(i => i.instanceId === parsedPayload.instanceId);
        if (original) {
          draftItem.value = JSON.parse(JSON.stringify(original));
          forgeMode.value = 'edit';
          ensureCostStructure();
        } else {
          logger.error('Inventory item not found', undefined, { instanceId: parsedPayload.instanceId });
        }
      } else {
        logger.error('Unknown drag payload shape', undefined, { payload: parsedPayload });
      }
    } catch (e) {
      logger.error('Failed to handle dropped item', e);
    }
  };

  const updateItemType = (type: ItemType) => {
    if (!draftItem.value) return;
    draftItem.value.type = type;
    ensureTypeDefaults(type);
  };

  const toggleWeaponProperty = (property: WeaponPropertyKey) => {
    const data = draftData.value;
    data.properties = Array.isArray(data.properties) ? data.properties : [];
    const index = data.properties.indexOf(property);
    if (index >= 0) {
      data.properties.splice(index, 1);
    } else {
      data.properties.push(property);
    }
  };

  const syncRootFieldsToData = () => {
    if (!draftItem.value) return;
    const data = draftData.value;
    data.type = draftItem.value.type;
    data.name = draftItem.value.name;
    data.weight = draftItem.value.weight;
    data.description = draftItem.value.description ?? '';
    data.magic = draftItem.value.magic ?? { isMagic: false };
  };

    // --- 动作：保存 ---
  const save = () => {
    if (!draftItem.value) return;

    ensureCostStructure(); // ✅ 确保新物品有价格结构
    syncRootFieldsToData();

    if (forgeMode.value === 'create') {
      store.character?.inventory.push(draftItem.value);
      store.save();
    } else {
      store.updateInventoryItem(draftItem.value);
    }
    close();
  };

  // --- 动作：关闭 ---
  const close = () => { draftItem.value = null; };

  return {
    draftItem,
    draftData,
    forgeMode,
    handleDropData,
    updateItemType,
    toggleWeaponProperty,
    save,
    close
  };
}
