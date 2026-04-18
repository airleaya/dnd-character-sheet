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
import { normalizeCharacterData } from '../utils/characterMigration';

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
      character.value = normalizeCharacterData(data);
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