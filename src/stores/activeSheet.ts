// 彻底重构为 Setup Store (Facade 模式)
import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { useCharacterStore } from './characterStore';
import type { Character } from '../types/Character';
import type { InventoryItem } from '../types/Item';

// 引入拆分后的领域逻辑模块
import { useBioLogic } from './sheet/useBioLogic';
import { useCombatLogic } from './sheet/useCombatLogic';
import { useInventoryLogic } from './sheet/useInventoryLogic';
import { useSpellLogic } from './sheet/useSpellLogic';

export const useActiveSheetStore = defineStore('activeSheet', () => {
  // ==========================================
  // 1. 核心状态 (Core State)
  // ==========================================
  const character = ref<Character | null>(null);
  const trash = ref<InventoryItem[]>([]);
  const ui = reactive({
    isSpellbookOpen: false,
  });

  // ==========================================
  // 2. 基础控制方法 (Base Actions)
  // ==========================================
  const save = () => {
    if (character.value) {
      character.value.lastModified = Date.now();
      const charStore = useCharacterStore();
      charStore.saveCharacterData(character.value);
    }
  };

  const toggleSpellbook = (isOpen: boolean) => {
    ui.isSpellbookOpen = isOpen;
  };

  const loadCharacter = (id: string) => {
    const charStore = useCharacterStore();
    const data = charStore.getCharacterData(id);
    
    if (data) {
      // ✅ 补全可能缺失的字段 (兼容旧数据)
      if (!data.equippedIds) data.equippedIds = [];
      if (!data.hiddenAttacks) data.hiddenAttacks = [];

      // 初始化钱包
      if (!data.wallet) {
        data.wallet = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
      }

      // 初始化熟练项结构
      if (!data.proficiencies) {
        data.proficiencies = { armor: [], weapons: [], tools: [], languages: [] };
      } else {
        if (!data.proficiencies.armor) data.proficiencies.armor = [];
        if (!data.proficiencies.weapons) data.proficiencies.weapons = [];
        if (!data.proficiencies.tools) data.proficiencies.tools = [];
        if (!data.proficiencies.languages) data.proficiencies.languages = [];
      }

      // 初始化额外攻击属性开关
      if (!data.activeAttackModes){
        data.activeAttackModes = [];
      }

      // 补全战斗数据：生命骰类型
      if (!data.combat.hitDiceType) {
         data.combat.hitDiceType = 'd8'; // 默认为 d8
      }

      // 法术数据初始化
      if (!data.spells) {
        data.spells = {
          spellcastingAbility: 'int',
          spellSaveDC: 10,
          spellAttackMod: 2,
          slots: {
            current: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            max:     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          },
          pactSlots: { level: 1, current: 0, max: 0 },
          known: [],
          prepared: []
        };
      }
      if (!data.spells.spellSources) data.spells.spellSources = {};
      if (!data.spells.pactSlots) data.spells.pactSlots = { level: 1, current: 0, max: 0 };

      // 角色简介初始化
      if (!data.bio) {
        data.bio = {
          age: '', height: '', weight: '', eyes: '', skin: '', hair: '',
          personalityTraits: '', ideals: '', bonds: '', flaws: '',
          backstory: '', featureText: '', treasureNotes: ''
        };
      }

      // 初始化 Profile 新字段
      if (!data.profile.playerName) data.profile.playerName = '';
      if (!data.profile.background) data.profile.background = '';
      if (!data.profile.alignment) data.profile.alignment = '';
      
      character.value = data;
    }
  };

  // ==========================================
  // 3. 依赖注入与模块挂载 (Composables Integration)
  // ==========================================
  
  // A. 挂载基础生平逻辑 (产出 proficiencyBonus 给后续模块使用)
  const bioLogic = useBioLogic(character, save);

  // B. 挂载战斗逻辑 (依赖 character, save, 以及刚刚算出的 proficiencyBonus)
  const combatLogic = useCombatLogic(character, save, bioLogic.proficiencyBonus);

  // C. 挂载法术逻辑 (同样依赖 proficiencyBonus)
  const spellLogic = useSpellLogic(character, save, bioLogic.proficiencyBonus);

  // D. 挂载背包与经济逻辑 (依赖 trash)
  const inventoryLogic = useInventoryLogic(character, trash, save);

  // ==========================================
  // 4. 暴露最终接口 (Expose API)
  // ==========================================
  return {
    // 核心状态与方法
    character,
    trash,
    ui,
    save,
    loadCharacter,
    toggleSpellbook,

    // 展开所有拆分出去的属性和方法
    ...bioLogic,
    ...combatLogic,
    ...spellLogic,
    ...inventoryLogic,
  };
});