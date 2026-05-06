import { ref, computed } from 'vue';
import { useActiveSheetStore } from '../stores/activeSheet';
import { useDataPackStore } from '../stores/dataPackStore';
import { useUiFeedbackStore } from '../stores/uiFeedback';
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


export interface ForgeEditorContext {
  dataPackMaker?: boolean;
}

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
  encryptionGroupId?: string;
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
const editorContext = ref<ForgeEditorContext | null>(null);
const saveOverride = ref<((item: InventoryItem) => void) | null>(null);
const logger = createRendererLogger('composables/useForge');

export function useForge() {
  const store = useActiveSheetStore();
  const dataPackStore = useDataPackStore();
  const feedback = useUiFeedbackStore();
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
          editorContext.value = null;
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
            editorContext.value = null;
            ensureCostStructure();
          }
        }
      } else if (parsedPayload.type === 'inventory-item') {
        const original = store.character?.inventory.find(i => i.instanceId === parsedPayload.instanceId);
        if (original) {
          draftItem.value = JSON.parse(JSON.stringify(original));
          forgeMode.value = 'edit';
          editorContext.value = null;
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

  const openForgeForItem = (
    item: InventoryItem,
    mode: 'create' | 'edit' = 'edit',
    onSave?: (item: InventoryItem) => void,
    context?: ForgeEditorContext
  ) => {
    draftItem.value = JSON.parse(JSON.stringify(item));
    forgeMode.value = mode;
    editorContext.value = context ?? null;
    saveOverride.value = onSave ?? null;
    ensureCostStructure();
    if (editorContext.value?.dataPackMaker) {
      const itemDraft = draftItem.value;
      if (!itemDraft) return;
      dataPackStore.recordMakerDragDiagnostic('forge.open', 'info', 'Data-pack forge editor opened', {
        mode,
        itemName: itemDraft.name,
        instanceId: itemDraft.instanceId,
        templateId: itemDraft.templateId,
        itemType: itemDraft.type,
      });
    }
  };

  const updateItemType = (type: ItemType) => {
    if (!draftItem.value) return;
    draftItem.value.type = type;
    ensureTypeDefaults(type);
  };

  const updateItemTemplate = (templateId: string) => {
    if (!draftItem.value) return;
    if (!templateId) {
      draftItem.value.templateId = '';
      return;
    }

    const templateItem = createItemFromLibrary(templateId);
    if (!templateItem) {
      logger.warn('Cannot apply missing forge template', { templateId });
      draftItem.value.templateId = templateId;
      return;
    }

    const current = draftItem.value;
    const currentData = draftData.value;
    const preservedDataPackFields = editorContext.value?.dataPackMaker
      ? {
          displayCategory: currentData.displayCategory,
          displaySubcategory: currentData.displaySubcategory,
          encryptionGroupId: currentData.encryptionGroupId,
          visibility: currentData.visibility,
          source: currentData.source,
        }
      : {};

    Object.assign(current, {
      ...templateItem,
      instanceId: current.instanceId,
      quantity: current.quantity,
      parentId: current.parentId,
      data: {
        ...(templateItem.data as ForgeDraftData),
        ...preservedDataPackFields,
      },
    });
    ensureCostStructure();
    if (editorContext.value?.dataPackMaker) {
      dataPackStore.recordMakerDragDiagnostic('forge.template-change', 'info', 'Forge template applied in data-pack editor', {
        templateId,
        itemName: draftItem.value.name,
        itemType: draftItem.value.type,
      });
    }
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
    draftItem.value.magic = data.magic;
    data.displayCategory = data.displayCategory?.trim() || undefined;
    data.displaySubcategory = data.displaySubcategory?.trim() || undefined;
    data.encryptionGroupId = data.encryptionGroupId?.trim() || undefined;
  };

    // --- 动作：保存 ---
  const save = () => {
    if (!draftItem.value) return;

    ensureCostStructure(); // ✅ 确保新物品有价格结构
    syncRootFieldsToData();

    if (editorContext.value?.dataPackMaker) {
      dataPackStore.recordMakerDragDiagnostic('forge.save-start', 'info', 'Forge save button invoked', {
        mode: forgeMode.value,
        itemName: draftItem.value.name,
        instanceId: draftItem.value.instanceId,
        templateId: draftItem.value.templateId,
        itemType: draftItem.value.type,
        displayCategory: draftData.value.displayCategory,
        displaySubcategory: draftData.value.displaySubcategory,
        encryptionGroupId: draftData.value.encryptionGroupId,
        hasSaveOverride: Boolean(saveOverride.value),
      });
    }

    const runSaveOverride = () => {
      if (!saveOverride.value || !draftItem.value) return false;
      try {
        saveOverride.value(draftItem.value);
        if (editorContext.value?.dataPackMaker) {
          dataPackStore.recordMakerDragDiagnostic('forge.save-override', 'ok', 'Forge save override completed', {
            itemName: draftItem.value.name,
            templateId: draftItem.value.templateId,
            itemType: draftItem.value.type,
          });
        }
        close();
        return true;
      } catch (error) {
        logger.error('Forge save override failed', error, {
          itemName: draftItem.value.name,
          templateId: draftItem.value.templateId,
          itemType: draftItem.value.type,
          dataPackMaker: Boolean(editorContext.value?.dataPackMaker),
        });
        if (editorContext.value?.dataPackMaker) {
          dataPackStore.recordMakerDragDiagnostic('forge.save-override', 'error', 'Forge save override failed', {
            itemName: draftItem.value.name,
            templateId: draftItem.value.templateId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
        feedback.showToast(`铁匠台保存失败：${error instanceof Error ? error.message : String(error)}`, 'danger', 5200);
        return true;
      }
    };

    if (forgeMode.value === 'create') {
      if (runSaveOverride()) return;
      store.character?.inventory.push(draftItem.value);
      store.save();
    } else {
      if (runSaveOverride()) return;
      store.updateInventoryItem(draftItem.value);
    }
    close();
  };

  // --- 动作：关闭 ---
  const close = () => {
    draftItem.value = null;
    editorContext.value = null;
    saveOverride.value = null;
  };

  return {
    draftItem,
    draftData,
    forgeMode,
    editorContext,
    openForgeForItem,
    handleDropData,
    updateItemType,
    updateItemTemplate,
    toggleWeaponProperty,
    save,
    close
  };
}
