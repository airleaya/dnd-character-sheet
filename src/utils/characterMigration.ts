import type {
  AbilityScores,
  Character,
  CharacterBio,
  CharacterClassRecord,
  CharacterExpertise,
  CharacterProficiencies,
  CharacterUnarmedStrike,
  CharacterSpells,
  CombatStats,
  UnarmedStrikeDamageDice,
  UnarmedStrikeDamageType,
  UnarmedStrikeTagKey,
  Wallet,
} from '../types/Character';
import type { AbilityKey, ItemMagicTrait } from '../types/Library';
import type { InventoryItem } from '../types/Item';
import { isKnownLibraryItemId, migrateItemTemplateId } from '../data/libraries/itemIdMigration';
import { cloneMagicDefinition, cloneMagicTrait } from './magicItems';

export type LegacyCharacterData = Partial<Character> & {
  id?: string;
  lastModified?: number;
  profile?: Partial<Character['profile']>;
  stats?: Partial<AbilityScores>;
  combat?: Partial<CombatStats> & {
    hitDiceType?: string;
    hitDiceCurrent?: number;
    hitDiceMax?: number;
  };
  bio?: Partial<CharacterBio>;
  wallet?: Partial<Wallet>;
  currency?: Partial<Record<keyof Wallet, unknown>>;
  money?: Partial<Record<keyof Wallet, unknown>>;
  coins?: Partial<Record<keyof Wallet, unknown>>;
  cp?: unknown;
  sp?: unknown;
  ep?: unknown;
  gp?: unknown;
  pp?: unknown;
  skillProficiencies?: Record<string, boolean>;
  savingThrows?: Partial<Character['savingThrows']>;
  proficiencies?: Partial<CharacterProficiencies>;
  expertise?: Partial<CharacterExpertise>;
  spells?: Partial<CharacterSpells>;
};

const DEFAULT_WALLET: Wallet = {
  cp: 0,
  sp: 0,
  ep: 0,
  gp: 0,
  pp: 0,
};

const DEFAULT_CLASSES: CharacterClassRecord[] = [
  { classId: '', subclassId: null, level: 1 },
];

const DEFAULT_BIO: CharacterBio = {
  age: '',
  height: '',
  weight: '',
  eyes: '',
  skin: '',
  hair: '',
  personalityTraits: '',
  ideals: '',
  bonds: '',
  flaws: '',
  backstory: '',
  featureText: '',
  treasureNotes: '',
};

const DEFAULT_STATS: AbilityScores = {
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
};

const DEFAULT_COMBAT: CombatStats = {
  hpCurrent: 10,
  hpMax: 10,
  tempHp: 0,
  hitDice: {},
  deathSaves: { success: 0, failure: 0 },
  speed: 30,
  exhaustion: 0,
  inspiration: [false, false, false],
  conditions: '',
};

const DEFAULT_PROFICIENCIES: CharacterProficiencies = {
  armor: [],
  weapons: [],
  tools: [],
  languages: [],
};

const DEFAULT_EXPERTISE: CharacterExpertise = {
  skills: [],
  tools: [],
  custom: [],
};

export const DEFAULT_UNARMED_STRIKE: CharacterUnarmedStrike = {
  id: 'unarmed_default',
  name: '徒手打击',
  tags: ['none'],
  hitAbility: 'str',
  damageDice: '1',
  damageAbility: 'str',
  damageType: 'bludgeoning',
  isMagic: false,
};

const ABILITY_KEYS: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const UNARMED_DAMAGE_DICE: UnarmedStrikeDamageDice[] = ['1', '1d4', '1d6', '1d8', '1d10'];
const UNARMED_DAMAGE_TYPES: UnarmedStrikeDamageType[] = ['bludgeoning', 'piercing', 'slashing', 'force'];
const UNARMED_TAGS: UnarmedStrikeTagKey[] = [
  'none',
  'natural_weapon',
  'unarmed_fighting',
  'martial_arts',
  'tavern_brawler',
  'astral_arms',
  'custom',
];

const WALLET_KEYS = ['cp', 'sp', 'ep', 'gp', 'pp'] as const;

const DEFAULT_SAVING_THROWS: Character['savingThrows'] = {
  str: false,
  dex: false,
  con: false,
  int: false,
  wis: false,
  cha: false,
};

const DEFAULT_SPELLS: CharacterSpells = {
  spellcastingAbility: 'int',
  spellSaveDC: 10,
  spellAttackMod: 2,
  slots: {
    current: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    max: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  pactSlots: { level: 1, current: 0, max: 0 },
  known: [],
  prepared: [],
  spellSources: {},
};

const cloneArray = <T>(value: T[] | undefined, fallback: T[]): T[] =>
  Array.isArray(value) ? [...value] : [...fallback];

const normalizeInventory = (inventory?: InventoryItem[]): InventoryItem[] => {
  if (!Array.isArray(inventory)) {
    return [];
  }

  return inventory.map((item) => {
    const templateId = migrateItemTemplateId(item.templateId);
    const knownTemplate = isKnownLibraryItemId(templateId);
    const data = { ...(item.data ?? {}) } as InventoryItem['data'] & Record<string, unknown>;

    if (!knownTemplate) {
      data.migrationAudit = {
        status: 'unresolved_template',
        originalTemplateId: item.templateId,
        checkedAt: '2026-04-27'
      };
    }

    return {
      ...item,
      templateId,
      magic: cloneMagicDefinition(item.magic ?? { isMagic: false }),
      data
    };
  });
};

const normalizeCustomMagicTraits = (traits?: unknown): ItemMagicTrait[] => {
  if (!Array.isArray(traits)) return [];

  const normalizeMagicTraitType = (type: unknown): ItemMagicTrait['type'] => {
    if (type === 'spell' || type === 'damage' || type === 'plain' || type === 'defense') {
      return type;
    }
    return 'damage';
  };

  return traits
    .filter((trait): trait is Partial<ItemMagicTrait> => Boolean(trait) && typeof trait === 'object')
    .map((trait, index) =>
      cloneMagicTrait({
        id: typeof trait.id === 'string' && trait.id.trim() ? trait.id : `custom_magic_trait_${index}`,
        source: 'custom',
        type: normalizeMagicTraitType(trait.type),
        name:
          typeof trait.name === 'string' && trait.name.trim()
            ? trait.name.trim()
            : '自定义魔法词条',
        description: typeof trait.description === 'string' ? trait.description : '',
        activationMode: trait.activationMode === 'charged' ? 'charged' : 'always',
        participatesInDamage: trait.participatesInDamage === true,
        damageDice: typeof trait.damageDice === 'string' ? trait.damageDice : undefined,
        damageBonus: typeof trait.damageBonus === 'number' ? trait.damageBonus : undefined,
        damageType: typeof trait.damageType === 'string' ? trait.damageType : undefined,
        spellId: typeof trait.spellId === 'string' ? trait.spellId : undefined,
        spellExtraDescription:
          typeof trait.spellExtraDescription === 'string' ? trait.spellExtraDescription : undefined,
        charges:
          trait.charges && typeof trait.charges === 'object'
            ? {
                current:
                  typeof trait.charges.current === 'number'
                    ? trait.charges.current
                    : typeof trait.charges.max === 'number'
                      ? trait.charges.max
                      : 0,
                max: typeof trait.charges.max === 'number' ? trait.charges.max : 0,
                resetCondition:
                  typeof trait.charges.resetCondition === 'string'
                    ? trait.charges.resetCondition
                    : undefined,
                resetFormula:
                  typeof trait.charges.resetFormula === 'string' ? trait.charges.resetFormula : undefined,
              }
            : undefined,
      })
    );
};

const normalizeClasses = (classes?: Partial<CharacterClassRecord>[]): CharacterClassRecord[] => {
  if (!Array.isArray(classes) || classes.length === 0) {
    return DEFAULT_CLASSES.map(item => ({ ...item }));
  }

  return classes.map((record, index) => ({
    classId: record.classId ?? '',
    subclassId: record.subclassId ?? null,
    level: record.level ?? (index === 0 ? 1 : 1),
  }));
};

const normalizeHitDice = (combat?: LegacyCharacterData['combat']): CombatStats['hitDice'] => {
  const hitDice: CombatStats['hitDice'] = {};

  if (combat?.hitDice && typeof combat.hitDice === 'object') {
    Object.entries(combat.hitDice).forEach(([dieType, value]) => {
      if (!value || typeof value !== 'object') return;
      const current = typeof value.current === 'number' ? value.current : 0;
      const max = typeof value.max === 'number' ? value.max : 0;
      hitDice[dieType] = { current, max };
    });
  }

  if (combat?.hitDiceType || combat?.hitDiceCurrent !== undefined || combat?.hitDiceMax !== undefined) {
    const legacyType = combat.hitDiceType ?? 'd6';
    const legacyCurrent = combat.hitDiceCurrent ?? 0;
    const legacyMax = combat.hitDiceMax ?? 0;
    hitDice[legacyType] = {
      current: typeof legacyCurrent === 'number' ? legacyCurrent : 0,
      max: typeof legacyMax === 'number' ? legacyMax : 0,
    };
  }

  return hitDice;
};

const normalizeSpells = (spells?: LegacyCharacterData['spells']): CharacterSpells => ({
  spellcastingAbility: spells?.spellcastingAbility ?? DEFAULT_SPELLS.spellcastingAbility,
  secondaryCastingAbility: spells?.secondaryCastingAbility,
  spellSaveDC: spells?.spellSaveDC ?? DEFAULT_SPELLS.spellSaveDC,
  spellAttackMod: spells?.spellAttackMod ?? DEFAULT_SPELLS.spellAttackMod,
  secondarySpellSaveDC: spells?.secondarySpellSaveDC,
  secondarySpellAttackMod: spells?.secondarySpellAttackMod,
  slots: {
    current: cloneArray(spells?.slots?.current, DEFAULT_SPELLS.slots.current),
    max: cloneArray(spells?.slots?.max, DEFAULT_SPELLS.slots.max),
  },
  pactSlots: {
    level: spells?.pactSlots?.level ?? DEFAULT_SPELLS.pactSlots!.level,
    current: spells?.pactSlots?.current ?? DEFAULT_SPELLS.pactSlots!.current,
    max: spells?.pactSlots?.max ?? DEFAULT_SPELLS.pactSlots!.max,
  },
  known: cloneArray(spells?.known, DEFAULT_SPELLS.known),
  prepared: cloneArray(spells?.prepared, DEFAULT_SPELLS.prepared),
  spellSources: { ...(spells?.spellSources ?? DEFAULT_SPELLS.spellSources ?? {}) },
});

const normalizeExpertise = (expertise?: LegacyCharacterData['expertise']): CharacterExpertise => ({
  skills: cloneArray(expertise?.skills, DEFAULT_EXPERTISE.skills),
  tools: cloneArray(expertise?.tools, DEFAULT_EXPERTISE.tools),
  custom: cloneArray(expertise?.custom, DEFAULT_EXPERTISE.custom),
});

const coerceWalletValue = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const normalizeWallet = (raw: LegacyCharacterData): Wallet => {
  const legacyWallets = [raw.wallet, raw.currency, raw.money, raw.coins];
  const wallet = { ...DEFAULT_WALLET };

  WALLET_KEYS.forEach((key) => {
    const sourceValue = legacyWallets.find(source => source?.[key] !== undefined)?.[key] ?? raw[key];
    wallet[key] = coerceWalletValue(sourceValue, DEFAULT_WALLET[key]);
  });

  return wallet;
};

const isAbilityKey = (value: unknown): value is AbilityKey =>
  typeof value === 'string' && ABILITY_KEYS.includes(value as AbilityKey);

const isUnarmedDamageDice = (value: unknown): value is UnarmedStrikeDamageDice =>
  typeof value === 'string' && UNARMED_DAMAGE_DICE.includes(value as UnarmedStrikeDamageDice);

const isUnarmedDamageType = (value: unknown): value is UnarmedStrikeDamageType =>
  typeof value === 'string' && UNARMED_DAMAGE_TYPES.includes(value as UnarmedStrikeDamageType);

const normalizeUnarmedTags = (tags: unknown, customTag?: unknown): UnarmedStrikeTagKey[] => {
  const sourceTags = Array.isArray(tags) ? tags : DEFAULT_UNARMED_STRIKE.tags;
  const validTags = sourceTags.filter(
    (tag): tag is UnarmedStrikeTagKey =>
      typeof tag === 'string' && UNARMED_TAGS.includes(tag as UnarmedStrikeTagKey)
  );
  const withoutNone = validTags.filter(tag => tag !== 'none');
  const uniqueTags = Array.from(new Set(withoutNone));
  const hasCustomText = typeof customTag === 'string' && customTag.trim().length > 0;

  if (hasCustomText && !uniqueTags.includes('custom')) {
    uniqueTags.push('custom');
  }

  return uniqueTags.length > 0 ? uniqueTags : ['none'];
};

export const createDefaultUnarmedStrike = (): CharacterUnarmedStrike => ({
  ...DEFAULT_UNARMED_STRIKE,
});

export const createUnarmedStrikeSignature = (strike: CharacterUnarmedStrike): string => {
  const tags = [...strike.tags].filter(tag => tag !== 'none').sort().join(',');
  const customTag = strike.tags.includes('custom') ? (strike.customTag ?? '').trim() : '';
  return [
    strike.hitAbility,
    strike.damageDice,
    strike.damageAbility,
    strike.damageType,
    strike.isMagic ? 'magic' : 'mundane',
    tags || 'none',
    customTag,
  ].join('|');
};

export const normalizeUnarmedStrikes = (strikes?: unknown): CharacterUnarmedStrike[] => {
  if (!Array.isArray(strikes) || strikes.length === 0) {
    return [createDefaultUnarmedStrike()];
  }

  const normalized = strikes
    .filter((strike): strike is Partial<CharacterUnarmedStrike> =>
      Boolean(strike) && typeof strike === 'object'
    )
    .map((strike, index): CharacterUnarmedStrike => {
      const tags = normalizeUnarmedTags(strike.tags, strike.customTag);
      const usesCustomTag = tags.includes('custom');
      const customTag =
        usesCustomTag && typeof strike.customTag === 'string' ? strike.customTag.trim() : undefined;

      return {
        id:
          typeof strike.id === 'string' && strike.id.trim()
            ? strike.id
            : `unarmed_${Date.now()}_${index}`,
        name:
          typeof strike.name === 'string' && strike.name.trim()
            ? strike.name.trim()
            : DEFAULT_UNARMED_STRIKE.name,
        tags,
        customTag,
        hitAbility: isAbilityKey(strike.hitAbility) ? strike.hitAbility : DEFAULT_UNARMED_STRIKE.hitAbility,
        damageDice: isUnarmedDamageDice(strike.damageDice)
          ? strike.damageDice
          : DEFAULT_UNARMED_STRIKE.damageDice,
        damageAbility: isAbilityKey(strike.damageAbility)
          ? strike.damageAbility
          : DEFAULT_UNARMED_STRIKE.damageAbility,
        damageType: isUnarmedDamageType(strike.damageType)
          ? strike.damageType
          : DEFAULT_UNARMED_STRIKE.damageType,
        isMagic: strike.isMagic === true,
      };
    });

  const deduped = new Map<string, CharacterUnarmedStrike>();
  normalized.forEach(strike => {
    const signature = createUnarmedStrikeSignature(strike);
    if (!deduped.has(signature)) {
      deduped.set(signature, strike);
    }
  });

  return deduped.size > 0 ? Array.from(deduped.values()) : [createDefaultUnarmedStrike()];
};

export const createDefaultCharacter = (id: string): Character => ({
  id,
  lastModified: Date.now(),
  profile: {
    name: '新角色',
    playerName: '',
    race: '人类',
    background: '',
    alignment: '',
    level: 1,
    xp: 0,
    classes: DEFAULT_CLASSES.map(item => ({ ...item })),
  },
  bio: { ...DEFAULT_BIO },
  stats: { ...DEFAULT_STATS },
  combat: {
    ...DEFAULT_COMBAT,
    hitDice: { d6: { current: 1, max: 1 } },
    deathSaves: { ...DEFAULT_COMBAT.deathSaves },
    inspiration: [...DEFAULT_COMBAT.inspiration],
  },
  inventory: [],
  equippedIds: [],
  wallet: { ...DEFAULT_WALLET },
  skillProficiencies: {},
  savingThrows: { ...DEFAULT_SAVING_THROWS },
  hiddenAttacks: [],
  selectedAttackKeys: [],
  attackSelectionInitialized: true,
  proficiencies: {
    armor: [],
    weapons: [],
    tools: [],
    languages: [],
  },
  expertise: normalizeExpertise(),
  spells: normalizeSpells(),
  activeAttackModes: [],
  unarmedStrikes: [createDefaultUnarmedStrike()],
  customMagicTraits: [],
});

export const normalizeCharacterData = (raw: LegacyCharacterData): Character => ({
  id: raw.id ?? '',
  lastModified: raw.lastModified ?? Date.now(),
  profile: {
    name: raw.profile?.name ?? '新角色',
    playerName: raw.profile?.playerName ?? '',
    race: raw.profile?.race ?? '人类',
    classes: normalizeClasses(raw.profile?.classes),
    background: raw.profile?.background ?? '',
    alignment: raw.profile?.alignment ?? '',
    level: raw.profile?.level ?? 1,
    xp: raw.profile?.xp ?? 0,
    avatar: raw.profile?.avatar,
    avatarUrl: raw.profile?.avatarUrl,
  },
  bio: {
    ...DEFAULT_BIO,
    ...(raw.bio ?? {}),
  },
  stats: {
    ...DEFAULT_STATS,
    ...(raw.stats ?? {}),
  },
  combat: {
    hpCurrent: raw.combat?.hpCurrent ?? DEFAULT_COMBAT.hpCurrent,
    hpMax: raw.combat?.hpMax ?? DEFAULT_COMBAT.hpMax,
    tempHp: raw.combat?.tempHp ?? DEFAULT_COMBAT.tempHp,
    acMode: raw.combat?.acMode,
    hitDice: normalizeHitDice(raw.combat),
    speed: raw.combat?.speed ?? DEFAULT_COMBAT.speed,
    exhaustion: raw.combat?.exhaustion ?? DEFAULT_COMBAT.exhaustion,
    inspiration: cloneArray(raw.combat?.inspiration, DEFAULT_COMBAT.inspiration),
    conditions: raw.combat?.conditions ?? DEFAULT_COMBAT.conditions,
    deathSaves: {
      success: raw.combat?.deathSaves?.success ?? DEFAULT_COMBAT.deathSaves.success,
      failure: raw.combat?.deathSaves?.failure ?? DEFAULT_COMBAT.deathSaves.failure,
    },
  },
  inventory: normalizeInventory(raw.inventory),
  equippedIds: cloneArray(raw.equippedIds, []),
  wallet: normalizeWallet(raw),
  skillProficiencies: { ...(raw.skillProficiencies ?? {}) },
  savingThrows: {
    str: raw.savingThrows?.str ?? DEFAULT_SAVING_THROWS.str,
    dex: raw.savingThrows?.dex ?? DEFAULT_SAVING_THROWS.dex,
    con: raw.savingThrows?.con ?? DEFAULT_SAVING_THROWS.con,
    int: raw.savingThrows?.int ?? DEFAULT_SAVING_THROWS.int,
    wis: raw.savingThrows?.wis ?? DEFAULT_SAVING_THROWS.wis,
    cha: raw.savingThrows?.cha ?? DEFAULT_SAVING_THROWS.cha,
  },
  hiddenAttacks: cloneArray(raw.hiddenAttacks, []),
  selectedAttackKeys: cloneArray(raw.selectedAttackKeys, []),
  attackSelectionInitialized:
    typeof raw.attackSelectionInitialized === 'boolean'
      ? raw.attackSelectionInitialized
      : Array.isArray(raw.selectedAttackKeys),
  proficiencies: {
    armor: cloneArray(raw.proficiencies?.armor, DEFAULT_PROFICIENCIES.armor),
    weapons: cloneArray(raw.proficiencies?.weapons, DEFAULT_PROFICIENCIES.weapons),
    tools: cloneArray(raw.proficiencies?.tools, DEFAULT_PROFICIENCIES.tools),
    languages: cloneArray(raw.proficiencies?.languages, DEFAULT_PROFICIENCIES.languages),
  },
  expertise: normalizeExpertise(raw.expertise),
  spells: normalizeSpells(raw.spells),
  activeAttackModes: cloneArray(raw.activeAttackModes, []),
  unarmedStrikes: normalizeUnarmedStrikes(raw.unarmedStrikes),
  customMagicTraits: normalizeCustomMagicTraits(raw.customMagicTraits),
});
