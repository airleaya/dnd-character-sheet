import { computed } from 'vue';
import type { Ref } from 'vue';
import type { Character } from '../../types/Character';
import type { InventoryItem } from '../../types/Item';
import type { AbilityKey } from '../../types/Library';
import { DAMAGE_TYPES } from '../../data/rules/damageTypes';
import { ATTR_MAP } from '../../data/rules/dndRules';

// 注意：这里我们需要传入 proficiencyBonus 的引用，因为计算攻击命中时需要用到熟练加值
export function useCombatLogic(
  character: Ref<Character | null>,
  save: () => void,
  proficiencyBonus: Ref<number>
) {
  // ==========================================
  // 🧠 Getters (计算属性)
  // ==========================================

  // --- 先攻 (Initiative) ---
  const initiative = computed(() => {
    if (!character.value) return "+0";
    const dexMod = Math.floor((character.value.stats.dex - 10) / 2);
    return dexMod >= 0 ? `+${dexMod}` : `${dexMod}`;
  });

  // --- 护甲等级 (Armor Class) ---
  const armorClass = computed(() => {
    if (!character.value) return 10;
    const char = character.value;
    const combat = char.combat;
    
    // 1. 计算敏捷调整值
    const dexMod = Math.floor((char.stats.dex - 10) / 2);

    // 2. 获取已装备物品
    const equippedItems = char.equippedIds
      .map(id => char.inventory.find(i => i.instanceId === id))
      .filter(i => i !== undefined) as InventoryItem[];

    // 3. 分离主甲和盾牌
    const mainArmor = equippedItems.find(i => {
      const d = i.data as any;
      return i.type === 'armor' && d.armorType !== 'shield';
    });
    const shields = equippedItems.filter(i => {
      const d = i.data as any;
      return i.type === 'armor' && d.armorType === 'shield';
    });

    // 4. 计算基础 AC
    let finalAC = 10 + dexMod;

    if (mainArmor) {
      const d = mainArmor.data as any;
      const base = d.ac || 10;
      switch (d.armorType) {
        case 'heavy':  finalAC = base; break;
        case 'medium': finalAC = base + Math.min(dexMod, 2); break;
        case 'light':  finalAC = base + dexMod; break;
        default:       finalAC = base + dexMod;
      }
    } else {
      const mode = combat.acMode || 'default';
      switch (mode) {
        case 'barbarian':
          const conMod = Math.floor((char.stats.con - 10) / 2);
          finalAC = 10 + dexMod + conMod;
          break;
        case 'monk':
          const wisMod = Math.floor((char.stats.wis - 10) / 2);
          finalAC = 10 + dexMod + wisMod;
          break;
        case 'draconic':
          finalAC = 13 + dexMod;
          break;
        case 'default':
        default:
          finalAC = 10 + dexMod;
          break;
      }
    }

    // 5. 盾牌加值处理
    if (shields.length > 0) {
      const shieldBonus = (shields[0].data as any).ac || 2;
      if (!mainArmor && combat.acMode === 'monk') {
         // 武僧持盾失效回退
         finalAC = 10 + dexMod + shieldBonus;
      } else {
         finalAC += shieldBonus;
      }
    }
    return finalAC;
  });

  // --- 护甲穿戴熟练检查 ---
  const isWearingNonProficientArmor = computed(() => {
    if (!character.value) return false;
    const char = character.value;
    
    const equippedArmor = char.inventory.filter(i => 
      char.equippedIds.includes(i.instanceId) && i.type === 'armor'
    );

    for (const item of equippedArmor) {
      const data = item.data as any;
      const type = data.armorType;
      if (type && !char.proficiencies.armor.includes(type)) {
        return true;
      }
    }
    return false;
  });

  // --- 攻击面板计算 (核心) ---
  const attacks = computed(() => {
    if (!character.value) return [];
    const char = character.value;
    const hiddenIds = char.hiddenAttacks || []; 
    
    const strMod = Math.floor((char.stats.str - 10) / 2);
    const dexMod = Math.floor((char.stats.dex - 10) / 2);
    const pb = proficiencyBonus.value;

    const activeModes = (char.activeAttackModes || [])
      .filter(k => k !== 'str' && k !== 'dex') as AbilityKey[];

    const attackList: any[] = [];

    // A. 徒手打击
    const unarmedHit = strMod + pb;
    const unarmedDmg = 1 + strMod;
    attackList.push({
      id: 'unarmed',
      baseId: 'unarmed',
      name: '👊 徒手打击',
      hit: unarmedHit >= 0 ? `+${unarmedHit}` : `${unarmedHit}`,
      damage: `${unarmedDmg} (钝击)`,
      range: '5 尺',
      properties: [],
      isHidden: hiddenIds.includes('unarmed'),
      needsAmmo: false,
      ammoCount: null
    });

    activeModes.forEach(attr => {
      const mod = Math.floor((char.stats[attr] - 10) / 2);
      const hit = mod + pb;
      const dmg = 1 + mod;
      const attrLabel = ATTR_MAP[attr] || attr;
      
      attackList.push({
        id: `unarmed_${attr}`,
        baseId: 'unarmed',
        name: `👊 徒手打击 (${attrLabel})`,
        hit: hit >= 0 ? `+${hit}` : `${hit}`,
        damage: `${dmg} (钝击)`,
        range: '5 尺',
        properties: [],
        isHidden: hiddenIds.includes(`unarmed_${attr}`),
        needsAmmo: false,
        ammoCount: null
      });
    });

    // B. 武器逻辑
    char.inventory.forEach(item => {
      if (item.type !== 'weapon') return;
      const data = item.data as any;
      if (!data) return;
      const props = data.properties || [];

      // 熟练度判定
      let isProficient = false;
      const cat = data.category || '';
      if (cat.startsWith('simple') && char.proficiencies.weapons.includes('simple')) isProficient = true;
      else if (cat.startsWith('martial') && char.proficiencies.weapons.includes('martial')) isProficient = true;
      if (!isProficient && item.templateId && char.proficiencies.weapons.includes(item.templateId)) {
         isProficient = true;
      }

      // 弹药逻辑
      const needsAmmo = props.includes('ammunition');
      const requiredType = data.requiredAmmoType;
      let ammoCount = 0;
      let ammoItemIds: string[] = [];
      if (needsAmmo && requiredType) {
        const matchingStacks = char.inventory.filter(i => i.type === 'consumable' && (i.data as any)?.ammoType === requiredType);
        matchingStacks.forEach(stack => {
          ammoCount += (stack.quantity || 0);
          ammoItemIds.push(stack.instanceId);
        });
      }

      const isFinesse = props.includes('finesse');
      const isVersatile = props.includes('versatile');
      const isThrown = props.includes('thrown');
      const isTwoHanded = props.includes('two_handed');
      const isRanged = data.category?.includes('ranged') || (data.range && data.range.includes('/') && !isThrown);

      const addEntry = (modVal: number, suffix: string, label: string, damageDice: string, isOffhand = false) => {
        const derivedId = `${item.instanceId}${suffix}`;
        const hitVal = modVal + (isProficient ? pb : 0);
        const hitStr = hitVal >= 0 ? `+${hitVal}` : `${hitVal}`;

        let dmgModVal = modVal;
        if (isOffhand && modVal > 0) dmgModVal = 0;
        const dmgModStr = dmgModVal > 0 ? `+${dmgModVal}` : (dmgModVal < 0 ? `${dmgModVal}` : '');

        const rawType = data.damageType || 'none';
        const typeKey = rawType.toLowerCase();
        const dictItem = DAMAGE_TYPES ? (DAMAGE_TYPES as any)[typeKey] : undefined;
        const typeLabel = dictItem ? dictItem.label : typeKey;

        attackList.push({
          id: derivedId,
          baseId: item.instanceId,
          name: `${item.name}${label}`,
          hit: hitStr,
          damage: `${damageDice} ${dmgModStr} ${typeLabel}`,
          range: data.range || '5 尺',
          properties: props,
          isHidden: hiddenIds.includes(derivedId),
          needsAmmo: needsAmmo,
          ammoType: requiredType,
          ammoCount: needsAmmo ? ammoCount : null,
          availableAmmoIds: ammoItemIds
        });
      };

      if (isRanged) {
        addEntry(dexMod, '_ranged', '', data.damage);
      } else {
        addEntry(strMod, '_str', ' (力量)', data.damage);
        if (isFinesse) addEntry(dexMod, '_dex', ' (敏捷)', data.damage);
        if (isVersatile && data.versatileDamage) addEntry(strMod, '_2h', ' (双手)', data.versatileDamage);
        if (isThrown) {
           addEntry(strMod, '_thrown_str', ' (投掷/力)', data.range || '20/60');
           if (isFinesse) addEntry(dexMod, '_thrown_dex', ' (投掷/敏)', data.range || '20/60');
        }
        if (!isTwoHanded) {
           const bestStatIsDex = dexMod > strMod && isFinesse;
           const offhandMod = bestStatIsDex ? dexMod : strMod;
           addEntry(offhandMod, '_off', ' (副手)', data.damage, true);
        }
      }

      activeModes.forEach(attr => {
        const mod = Math.floor((char.stats[attr] - 10) / 2);
        const attrLabel = ATTR_MAP[attr] || attr;
        addEntry(mod, `_${attr}`, ` (${attrLabel})`, data.damage);
        if (isVersatile && data.versatileDamage) {
          addEntry(mod, `_${attr}_2h`, ` (${attrLabel}/双手)`, data.versatileDamage);
        }
        if (isThrown) {
          addEntry(mod, `_${attr}_thrown`, ` (${attrLabel}/投掷)`, data.range || '20/60');
        }
      });
    });
    return attackList;
  });

  // ==========================================
  // 🛠️ Actions (操作方法)
  // ==========================================

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

  const updateCombatStat = (field: keyof Character['combat'], value: any) => {
    if (!character.value) return;
    (character.value.combat as any)[field] = value;
    save();
  };

  const toggleInspiration = (index: number) => {
    if (!character.value) return;
    if (!character.value.combat.inspiration) {
      character.value.combat.inspiration = [false, false, false];
    }
    character.value.combat.inspiration[index] = !character.value.combat.inspiration[index];
    save();
  };

  const toggleAttackVisibility = (derivedId: string) => {
    if (!character.value) return;
    if (!character.value.hiddenAttacks) {
      character.value.hiddenAttacks = [];
    }
    const list = character.value.hiddenAttacks;
    const index = list.indexOf(derivedId);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(derivedId);
    }
    save();
  };

  const toggleAttackMode = (attr: AbilityKey) => {
    if (!character.value) return;
    if (!character.value.activeAttackModes) {
      character.value.activeAttackModes = [];
    }
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
    attacks,
    applyDamage,
    applyHeal,
    fullHeal,
    setTempHp,
    updateCombatStat,
    resetDeathSaves,
    toggleInspiration,
    toggleAttackVisibility,
    toggleAttackMode
  };
}