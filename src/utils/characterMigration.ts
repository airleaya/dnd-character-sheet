import type {
  AbilityScores,
  Character,
  CharacterBio,
  CharacterClassRecord,
  CharacterProficiencies,
  CharacterSpells,
  CombatStats,
  Wallet,
} from '../types/Character';

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
  skillProficiencies?: Record<string, boolean>;
  savingThrows?: Partial<Character['savingThrows']>;
  proficiencies?: Partial<CharacterProficiencies>;
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
  proficiencies: {
    armor: [],
    weapons: [],
    tools: [],
    languages: [],
  },
  spells: normalizeSpells(),
  activeAttackModes: [],
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
  inventory: cloneArray(raw.inventory, []),
  equippedIds: cloneArray(raw.equippedIds, []),
  wallet: {
    cp: raw.wallet?.cp ?? DEFAULT_WALLET.cp,
    sp: raw.wallet?.sp ?? DEFAULT_WALLET.sp,
    ep: raw.wallet?.ep ?? DEFAULT_WALLET.ep,
    gp: raw.wallet?.gp ?? DEFAULT_WALLET.gp,
    pp: raw.wallet?.pp ?? DEFAULT_WALLET.pp,
  },
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
  proficiencies: {
    armor: cloneArray(raw.proficiencies?.armor, DEFAULT_PROFICIENCIES.armor),
    weapons: cloneArray(raw.proficiencies?.weapons, DEFAULT_PROFICIENCIES.weapons),
    tools: cloneArray(raw.proficiencies?.tools, DEFAULT_PROFICIENCIES.tools),
    languages: cloneArray(raw.proficiencies?.languages, DEFAULT_PROFICIENCIES.languages),
  },
  spells: normalizeSpells(raw.spells),
  activeAttackModes: cloneArray(raw.activeAttackModes, []),
});
