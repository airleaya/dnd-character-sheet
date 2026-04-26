import { computed, watchEffect } from 'vue';
import type { Ref } from 'vue';
import type { Character, HitDiceMap } from '../../types/Character';
import type { ArmorData, InventoryItem, WeaponData } from '../../types/Item';
import type { AbilityKey } from '../../types/Library';
import { DAMAGE_TYPES } from '../../data/rules/damageTypes';
import { ATTR_MAP } from '../../data/rules/dndRules';

export type AttackSourceType = 'unarmed' | 'weapon';
export type AttackMode = 'base' | 'ranged' | 'thrown' | 'offhand' | 'versatile';
export type HandMode = 'none' | 'one_hand' | 'two_hand' | 'offhand';
export type AmmoDisplay = 'hidden' | 'tracked' | 'required_unknown';

export interface AttackBonusBreakdown {
  abilityModifier: number;
  proficiencyBonus: number;
  proficiencyApplied: boolean;
  hitBonus: number;
  damageBonus: number;
  offhandDamagePenalty: boolean;
}

export interface RawAttackEntry {
  rawKey: string;
  legacyId: string;
  sourceType: AttackSourceType;
  sourceId: string;
  sourceTemplateId?: string;
  sourceFingerprint: string;
  name: string;
  abilityPath: AbilityKey;
  attackMode: AttackMode;
  handMode: HandMode;
  hit: string;
  damage: string;
  bonusBreakdown: AttackBonusBreakdown;
  range: string;
  properties: string[];
  needsAmmo: boolean;
  ammoType?: string;
  ammoCount: number | null;
  specialText?: string;
}

export interface AttackCatalogEntry {
  catalogKey: string;
  name: string;
  sourceType: AttackSourceType;
  abilityPath: AbilityKey;
  attackMode: AttackMode;
  handMode: HandMode;
  hit: string;
  damage: string;
  bonusBreakdown: AttackBonusBreakdown;
  range: string;
  properties: string[];
  needsAmmo: boolean;
  ammoType?: string;
  ammoCount: number | null;
  ammoDisplay: AmmoDisplay;
  specialText?: string;
  rawKeys: string[];
}

const DEFAULT_MELEE_RANGE = '5 尺';

const isArmorItem = (item: InventoryItem): item is InventoryItem & { data: ArmorData } => item.type === 'armor';
const isWeaponItem = (item: InventoryItem): item is InventoryItem & { data: WeaponData } => item.type === 'weapon';
const isAmmoConsumable = (item: InventoryItem, requiredType: string) =>
  item.type === 'consumable' && 'ammoType' in item.data && item.data.ammoType === requiredType;

const cloneHitDice = (hitDice: HitDiceMap): HitDiceMap =>
  Object.fromEntries(Object.entries(hitDice).map(([type, entry]) => [type, { ...entry }]));

const abilityModifier = (score: number) => Math.floor((score - 10) / 2);

const formatSigned = (value: number) => (value >= 0 ? `+${value}` : `${value}`);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'unknown';

const formatDamage = (damageDice: string, modifier: number, damageType: string) => {
  const modifierText = modifier > 0 ? `+${modifier}` : modifier < 0 ? `${modifier}` : '';
  return `${damageDice} ${modifierText} ${damageType}`.replace(/\s+/g, ' ').trim();
};

const resolveDamageTypeLabel = (rawType: string) => {
  const typeKey = rawType.toLowerCase();
  const damageDef =
    typeKey in DAMAGE_TYPES ? DAMAGE_TYPES[typeKey as keyof typeof DAMAGE_TYPES] : undefined;
  return damageDef ? damageDef.label : rawType;
};

const createWeaponFingerprint = (item: InventoryItem & { data: WeaponData }) => {
  const props = [...(item.data.properties || [])].sort().join(',');
  const parts = [
    item.templateId || 'custom',
    item.name,
    item.data.damage,
    item.data.damageType,
    item.data.range || DEFAULT_MELEE_RANGE,
    props,
    item.data.requiredAmmoType || 'none',
    item.data.specialEffect || '',
  ];
  return `tpl:${parts.map(slugify).join(':')}`;
};

const createCatalogKey = (entry: RawAttackEntry) =>
  `${entry.sourceType}:${entry.sourceFingerprint}:${entry.attackMode}:${entry.abilityPath}:${entry.handMode}`;

const resolveAmmoDisplay = (entry: RawAttackEntry): AmmoDisplay => {
  if (!entry.needsAmmo) return 'hidden';
  if (entry.ammoType) return 'tracked';
  return 'required_unknown';
};

const uniqueKeys = (values: string[]) => Array.from(new Set(values));

export function useCombatLogic(
  character: Ref<Character | null>,
  save: () => void,
  proficiencyBonus: Ref<number>
) {
  const initiative = computed(() => {
    if (!character.value) return '+0';
    return formatSigned(abilityModifier(character.value.stats.dex));
  });

  const armorClass = computed(() => {
    if (!character.value) return 10;
    const char = character.value;
    const combat = char.combat;
    const dexMod = abilityModifier(char.stats.dex);

    const equippedItems = char.equippedIds
      .map(id => char.inventory.find(i => i.instanceId === id))
      .filter((item): item is InventoryItem => item !== undefined);
    const equippedArmor = equippedItems.filter(isArmorItem);

    const mainArmor = equippedArmor.find(i => i.data.armorType !== 'shield');
    const shields = equippedArmor.filter(i => i.data.armorType === 'shield');

    let finalAC = 10 + dexMod;

    if (mainArmor) {
      const armorData = mainArmor.data;
      const base = armorData.ac || 10;
      switch (armorData.armorType) {
        case 'heavy':
          finalAC = base;
          break;
        case 'medium':
          finalAC = base + Math.min(dexMod, 2);
          break;
        case 'light':
          finalAC = base + dexMod;
          break;
        default:
          finalAC = base + dexMod;
          break;
      }
    } else {
      const mode = combat.acMode || 'default';
      switch (mode) {
        case 'barbarian':
          finalAC = 10 + dexMod + abilityModifier(char.stats.con);
          break;
        case 'monk':
          finalAC = 10 + dexMod + abilityModifier(char.stats.wis);
          break;
        case 'draconic':
          finalAC = 13 + dexMod;
          break;
        default:
          finalAC = 10 + dexMod;
          break;
      }
    }

    if (shields.length > 0) {
      const shieldBonus = shields[0]?.data.ac || 2;
      if (!mainArmor && combat.acMode === 'monk') {
        finalAC = 10 + dexMod + shieldBonus;
      } else {
        finalAC += shieldBonus;
      }
    }

    return finalAC;
  });

  const isWearingNonProficientArmor = computed(() => {
    if (!character.value) return false;
    const char = character.value;

    const equippedArmor = char.inventory.filter(
      (item): item is InventoryItem & { data: ArmorData } =>
        char.equippedIds.includes(item.instanceId) && isArmorItem(item)
    );

    return equippedArmor.some(item => {
      const type = item.data.armorType;
      return Boolean(type && !char.proficiencies.armor.includes(type));
    });
  });

  const rawAttacks = computed<RawAttackEntry[]>(() => {
    if (!character.value) return [];

    const char = character.value;
    const pb = proficiencyBonus.value;
    const strMod = abilityModifier(char.stats.str);
    const dexMod = abilityModifier(char.stats.dex);
    const activeModes = char.activeAttackModes.filter(k => k !== 'str' && k !== 'dex') as AbilityKey[];

    const attackList: RawAttackEntry[] = [];

    const pushAttack = (entry: RawAttackEntry) => {
      attackList.push(entry);
    };

    const buildUnarmedEntry = (abilityPath: AbilityKey) => {
      const modifier = abilityModifier(char.stats[abilityPath]);
      const rawKey = abilityPath === 'str' ? 'unarmed' : `unarmed_${abilityPath}`;
      const attrLabel = ATTR_MAP[abilityPath] || abilityPath;
      const name = abilityPath === 'str' ? '👊 徒手攻击' : `👊 徒手攻击 (${attrLabel})`;

      pushAttack({
        rawKey,
        legacyId: rawKey,
        sourceType: 'unarmed',
        sourceId: 'unarmed',
        sourceFingerprint: 'unarmed',
        name,
        abilityPath,
        attackMode: 'base',
        handMode: 'none',
        hit: formatSigned(modifier + pb),
        damage: `${1 + modifier} (钝击)`,
        bonusBreakdown: {
          abilityModifier: modifier,
          proficiencyBonus: pb,
          proficiencyApplied: true,
          hitBonus: modifier + pb,
          damageBonus: modifier,
          offhandDamagePenalty: false,
        },
        range: DEFAULT_MELEE_RANGE,
        properties: [],
        needsAmmo: false,
        ammoCount: null,
      });
    };

    buildUnarmedEntry('str');
    activeModes.forEach(buildUnarmedEntry);

    char.inventory.forEach(item => {
      if (!isWeaponItem(item)) return;

      const data = item.data;
      const properties = data.properties || [];
      const sourceFingerprint = createWeaponFingerprint(item);

      let isProficient = false;
      const category = data.category || '';
      if (category.startsWith('simple') && char.proficiencies.weapons.includes('simple')) {
        isProficient = true;
      } else if (category.startsWith('martial') && char.proficiencies.weapons.includes('martial')) {
        isProficient = true;
      }
      if (!isProficient && item.templateId && char.proficiencies.weapons.includes(item.templateId)) {
        isProficient = true;
      }

      const needsAmmo = properties.includes('ammunition');
      const requiredType = data.requiredAmmoType;
      let ammoCount = 0;
      if (needsAmmo && requiredType) {
        const matchingStacks = char.inventory.filter(i => isAmmoConsumable(i, requiredType));
        matchingStacks.forEach(stack => {
          ammoCount += stack.quantity || 0;
        });
      }

      const damageTypeLabel = resolveDamageTypeLabel(data.damageType || 'none');
      const isFinesse = properties.includes('finesse');
      const isVersatile = properties.includes('versatile');
      const isThrown = properties.includes('thrown');
      const isTwoHanded = properties.includes('two_handed');
      const isRanged =
        data.category?.includes('ranged') || (Boolean(data.range?.includes('/')) && !isThrown);

      const addWeaponEntry = (
        abilityPath: AbilityKey,
        {
          suffix,
          nameLabel,
          damageDice,
          attackMode,
          handMode,
          offhand = false,
          rangeOverride,
        }: {
          suffix: string;
          nameLabel: string;
          damageDice: string;
          attackMode: AttackMode;
          handMode: HandMode;
          offhand?: boolean;
          rangeOverride?: string;
        }
      ) => {
        const modifier = abilityModifier(char.stats[abilityPath]);
        const hitValue = modifier + (isProficient ? pb : 0);
        const damageModifier = offhand && modifier > 0 ? 0 : modifier;
        const rawKey = `${item.instanceId}${suffix}`;

        pushAttack({
          rawKey,
          legacyId: rawKey,
          sourceType: 'weapon',
          sourceId: item.instanceId,
          sourceTemplateId: item.templateId,
          sourceFingerprint,
          name: `${item.name}${nameLabel}`,
          abilityPath,
          attackMode,
          handMode,
          hit: formatSigned(hitValue),
          damage: formatDamage(damageDice, damageModifier, damageTypeLabel),
          bonusBreakdown: {
            abilityModifier: modifier,
            proficiencyBonus: pb,
            proficiencyApplied: isProficient,
            hitBonus: hitValue,
            damageBonus: damageModifier,
            offhandDamagePenalty: offhand && modifier > 0,
          },
          range: rangeOverride || data.range || DEFAULT_MELEE_RANGE,
          properties,
          needsAmmo,
          ammoType: requiredType,
          ammoCount: needsAmmo && requiredType ? ammoCount : null,
          specialText: data.specialEffect,
        });
      };

      if (isRanged) {
        addWeaponEntry('dex', {
          suffix: '_ranged',
          nameLabel: '',
          damageDice: data.damage,
          attackMode: 'ranged',
          handMode: isTwoHanded ? 'two_hand' : 'one_hand',
        });
      } else {
        addWeaponEntry('str', {
          suffix: '_str',
          nameLabel: ' (力量)',
          damageDice: data.damage,
          attackMode: 'base',
          handMode: 'one_hand',
        });

        if (isFinesse) {
          addWeaponEntry('dex', {
            suffix: '_dex',
            nameLabel: ' (敏捷)',
            damageDice: data.damage,
            attackMode: 'base',
            handMode: 'one_hand',
          });
        }

        if (isVersatile && data.versatileDamage) {
          addWeaponEntry('str', {
            suffix: '_2h',
            nameLabel: ' (双手)',
            damageDice: data.versatileDamage,
            attackMode: 'versatile',
            handMode: 'two_hand',
          });
        }

        if (isThrown) {
          addWeaponEntry('str', {
            suffix: '_thrown_str',
            nameLabel: ' (投掷/力量)',
            damageDice: data.damage,
            attackMode: 'thrown',
            handMode: 'one_hand',
            rangeOverride: data.range || '20/60',
          });

          if (isFinesse) {
            addWeaponEntry('dex', {
              suffix: '_thrown_dex',
              nameLabel: ' (投掷/敏捷)',
              damageDice: data.damage,
              attackMode: 'thrown',
              handMode: 'one_hand',
              rangeOverride: data.range || '20/60',
            });
          }
        }

        if (!isTwoHanded) {
          const bestStatIsDex = dexMod > strMod && isFinesse;
          addWeaponEntry(bestStatIsDex ? 'dex' : 'str', {
            suffix: '_off',
            nameLabel: ' (副手)',
            damageDice: data.damage,
            attackMode: 'offhand',
            handMode: 'offhand',
            offhand: true,
          });
        }
      }

      activeModes.forEach(attr => {
        const attrLabel = ATTR_MAP[attr] || attr;
        addWeaponEntry(attr, {
          suffix: `_${attr}`,
          nameLabel: ` (${attrLabel})`,
          damageDice: data.damage,
          attackMode: 'base',
          handMode: 'one_hand',
        });

        if (isVersatile && data.versatileDamage) {
          addWeaponEntry(attr, {
            suffix: `_${attr}_2h`,
            nameLabel: ` (${attrLabel}/双手)`,
            damageDice: data.versatileDamage,
            attackMode: 'versatile',
            handMode: 'two_hand',
          });
        }

        if (isThrown) {
          addWeaponEntry(attr, {
            suffix: `_${attr}_thrown`,
            nameLabel: ` (${attrLabel}/投掷)`,
            damageDice: data.damage,
            attackMode: 'thrown',
            handMode: 'one_hand',
            rangeOverride: data.range || '20/60',
          });
        }
      });
    });

    return attackList;
  });

  const attackCatalog = computed<AttackCatalogEntry[]>(() => {
    const grouped = new Map<string, AttackCatalogEntry>();

    rawAttacks.value.forEach(entry => {
      const catalogKey = createCatalogKey(entry);
      const existing = grouped.get(catalogKey);
      if (existing) {
        existing.rawKeys.push(entry.rawKey);
        return;
      }

      grouped.set(catalogKey, {
        catalogKey,
        name: entry.name,
        sourceType: entry.sourceType,
        abilityPath: entry.abilityPath,
        attackMode: entry.attackMode,
        handMode: entry.handMode,
        hit: entry.hit,
        damage: entry.damage,
        bonusBreakdown: entry.bonusBreakdown,
        range: entry.range,
        properties: entry.properties,
        needsAmmo: entry.needsAmmo,
        ammoType: entry.ammoType,
        ammoCount: entry.ammoCount,
        ammoDisplay: resolveAmmoDisplay(entry),
        specialText: entry.specialText,
        rawKeys: [entry.rawKey],
      });
    });

    return Array.from(grouped.values());
  });

  const attackCatalogMap = computed(() => {
    const map = new Map<string, AttackCatalogEntry>();
    attackCatalog.value.forEach(entry => map.set(entry.catalogKey, entry));
    return map;
  });

  const selectedAttackKeys = computed(() => character.value?.selectedAttackKeys ?? []);

  const selectedAttacks = computed<AttackCatalogEntry[]>(() =>
    selectedAttackKeys.value
      .map(key => attackCatalogMap.value.get(key))
      .filter((entry): entry is AttackCatalogEntry => entry !== undefined)
  );

  const availableAttacks = computed<AttackCatalogEntry[]>(() => {
    const selected = new Set(selectedAttackKeys.value);
    return attackCatalog.value.filter(entry => !selected.has(entry.catalogKey));
  });

  watchEffect(() => {
    const char = character.value;
    if (!char || char.attackSelectionInitialized) return;

    const hiddenIds = new Set(char.hiddenAttacks);
    const visibleCatalogKeys = uniqueKeys(
      rawAttacks.value
        .filter(entry => !hiddenIds.has(entry.legacyId))
        .map(entry => createCatalogKey(entry))
    );

    char.selectedAttackKeys = visibleCatalogKeys;
    char.attackSelectionInitialized = true;
    save();
  });

  const selectAttack = (catalogKey: string) => {
    if (!character.value) return;
    if (!attackCatalogMap.value.has(catalogKey)) return;
    if (character.value.selectedAttackKeys.includes(catalogKey)) return;

    character.value.selectedAttackKeys = [...character.value.selectedAttackKeys, catalogKey];
    save();
  };

  const removeSelectedAttack = (catalogKey: string) => {
    if (!character.value) return;
    if (!character.value.selectedAttackKeys.includes(catalogKey)) return;

    character.value.selectedAttackKeys = character.value.selectedAttackKeys.filter(
      key => key !== catalogKey
    );
    save();
  };

  const toggleAttackSelection = (catalogKey: string) => {
    if (!character.value) return;
    if (character.value.selectedAttackKeys.includes(catalogKey)) {
      removeSelectedAttack(catalogKey);
      return;
    }
    selectAttack(catalogKey);
  };

  const applyDamage = (amount: number) => {
    if (!character.value || amount <= 0) return;
    const combat = character.value.combat;
    let remainingDmg = amount;

    if (combat.tempHp > 0) {
      if (combat.tempHp >= remainingDmg) {
        combat.tempHp -= remainingDmg;
        remainingDmg = 0;
      } else {
        remainingDmg -= combat.tempHp;
        combat.tempHp = 0;
      }
    }

    if (remainingDmg > 0) {
      combat.hpCurrent -= remainingDmg;
      if (combat.hpCurrent < 0) combat.hpCurrent = 0;
    }
    save();
  };

  const resetDeathSaves = () => {
    if (!character.value) return;
    character.value.combat.deathSaves = { success: 0, failure: 0 };
    save();
  };

  const applyHeal = (amount: number) => {
    if (!character.value || amount <= 0) return;
    const combat = character.value.combat;
    combat.hpCurrent += amount;
    if (combat.hpCurrent > combat.hpMax) combat.hpCurrent = combat.hpMax;
    if (combat.hpCurrent > 0) resetDeathSaves();
    save();
  };

  const fullHeal = () => {
    if (!character.value) return;
    character.value.combat.hpCurrent = character.value.combat.hpMax;
    resetDeathSaves();
    save();
  };

  const setTempHp = (amount: number) => {
    if (!character.value) return;
    character.value.combat.tempHp = amount;
    save();
  };

  const changeHitDiceCurrent = (type: string, delta: number) => {
    if (!character.value) return;

    const currentHitDice = character.value.combat.hitDice;
    const entry = currentHitDice[type];
    if (!entry) return;

    const nextCurrent = Math.min(Math.max(entry.current + delta, 0), entry.max);
    if (nextCurrent === entry.current) return;

    const nextHitDice = cloneHitDice(currentHitDice);
    nextHitDice[type].current = nextCurrent;
    character.value.combat.hitDice = nextHitDice;
    save();
  };

  const setHitDiceMax = (type: string, newMax: number) => {
    if (!character.value) return;

    const sanitizedMax = Math.max(0, newMax);
    const currentHitDice = character.value.combat.hitDice;
    const nextHitDice = cloneHitDice(currentHitDice);
    const existingEntry = nextHitDice[type] ?? { current: 0, max: 0 };

    nextHitDice[type] = {
      current: Math.min(existingEntry.current, sanitizedMax),
      max: sanitizedMax,
    };

    character.value.combat.hitDice = nextHitDice;
    save();
  };

  const updateCombatStat = <K extends keyof Character['combat']>(
    field: K,
    value: Character['combat'][K]
  ) => {
    if (!character.value) return;
    character.value.combat[field] = value;
    save();
  };

  const toggleInspiration = (index: number) => {
    if (!character.value) return;
    character.value.combat.inspiration[index] = !character.value.combat.inspiration[index];
    save();
  };

  const toggleAttackMode = (attr: AbilityKey) => {
    if (!character.value) return;
    const list = character.value.activeAttackModes;
    const idx = list.indexOf(attr);
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push(attr);
    }
    save();
  };

  return {
    initiative,
    armorClass,
    isWearingNonProficientArmor,
    rawAttacks,
    attackCatalog,
    availableAttacks,
    selectedAttackKeys,
    selectedAttacks,
    attacks: selectedAttacks,
    applyDamage,
    applyHeal,
    fullHeal,
    setTempHp,
    changeHitDiceCurrent,
    setHitDiceMax,
    updateCombatStat,
    resetDeathSaves,
    toggleInspiration,
    selectAttack,
    removeSelectedAttack,
    toggleAttackSelection,
    toggleAttackMode,
  };
}
