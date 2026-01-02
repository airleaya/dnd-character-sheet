import { defineStore } from 'pinia';
import { generateUUID } from '../utils/idGenerator';
import type { Character } from '../types/Character';

interface CharacterMeta {
  id: string;
  name: string;
  race: string;
  level: number;
  class: string;
  avatarUrl?: string; 
}

// 🔧 辅助函数：生成标准化的文件名
const getFilename = (char: Character): string => {
  const safeName = (char.profile.name || '未命名').replace(/[\\/:*?"<>|]/g, '_');
  const safeClass = (char.profile.class || '无职业').replace(/[\\/:*?"<>|]/g, '_');
  return `${safeName}-${safeClass}.json`;
};

export const useCharacterStore = defineStore('characterStore', {
  state: () => ({
    characterList: [] as CharacterMeta[], 
    _characterCache: new Map<string, Character>(),
    // 🆕 新增：用于记录角色当前在硬盘上的文件名，以便改名时删除旧文件
    _filenameMap: new Map<string, string>(),
  }),

  actions: {
    // --- 1. 初始化 ---
    async init() {
      if (!window.electronAPI) return;

      console.log('📂 正在读取角色...');
      const result = await window.electronAPI.loadAllCharacters();
      
      if (result.success && result.data) {
        this.characterList = [];
        this._characterCache.clear();
        this._filenameMap.clear(); // 清空文件名映射

        result.data.forEach((char: Character) => {
          this._characterCache.set(char.id, char);
          
          // 记录初始文件名
          this._filenameMap.set(char.id, getFilename(char));

          this.characterList.push({
            id: char.id,
            name: char.profile.name,
            race: char.profile.race,
            level: char.profile.level,
            class: char.profile.class,
            avatarUrl: char.profile.avatarUrl
          });
        });
      }
    },

    // --- 2. 创建新角色 (修改：不再自动保存) ---
    async createNewCharacter() {
      const newId = generateUUID();
      
      const newChar: Character = {
        id: newId,
        lastModified: Date.now(),
        profile: { name: '新角色', playerName: '', race: '人类', class: '战士', background: '', alignment: '', level: 1, xp: 0 },
        bio: { age: '', height: '', weight: '', eyes: '', skin: '', hair: '', personalityTraits: '', ideals: '', bonds: '', flaws: '', backstory: '', featureText: '', treasureNotes: '' },
        stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        combat: { hpCurrent: 10, hpMax: 10, tempHp: 0, hitDiceCurrent: 1, hitDiceMax: 1, deathSaves: { success: 0, failure: 0 }, speed: 30, exhaustion: 0, inspiration: [false, false, false], conditions: '' },
        inventory: [], equippedIds: [], wallet: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }, skillProficiencies: {}, savingThrows: { str: false, dex: false, con: false, int: false, wis: false, cha: false }, hiddenAttacks: [],
        proficiencies: { armor: [], weapons: [], tools: [], languages: [] },
        spells: { spellcastingAbility: 'int', spellSaveDC: 10, spellAttackMod: 2, slots: { current: [0,0,0,0,0,0,0,0,0,0], max: [0,0,0,0,0,0,0,0,0,0] }, pactSlots: { level: 1, current: 0, max: 0 }, known: [], prepared: [] }
      };

      // 1. 只更新内存，不写硬盘！
      this._characterCache.set(newId, newChar);
      
      // 2. 更新 UI 列表
      this.characterList.push({
        id: newChar.id,
        name: newChar.profile.name,
        race: newChar.profile.race,
        level: newChar.profile.level,
        class: newChar.profile.class,
        avatarUrl: newChar.profile.avatarUrl
      });

      // ⚠️ 注意：这里不再调用 saveCharacterData
      // 只有当用户在界面上修改了数据（触发 input/change）时，才会第一次保存
      
      return newId; 
    },

    // --- 3. 保存逻辑 (修改：增加清理旧文件逻辑) ---
    async saveCharacterData(char: Character) {
      // 1. 更新内存
      this._characterCache.set(char.id, char);
      
      // 2. 更新列表 UI
      const metaIndex = this.characterList.findIndex(c => c.id === char.id);
      const meta = { id: char.id, name: char.profile.name, race: char.profile.race, level: char.profile.level, class: char.profile.class, avatarUrl: char.profile.avatarUrl };
      if (metaIndex !== -1) this.characterList[metaIndex] = meta;

      // 3. 写入硬盘
      if (window.electronAPI) {
        const newFilename = getFilename(char);
        const oldFilename = this._filenameMap.get(char.id); // 获取上次保存的文件名

        // A. 保存新文件
        await window.electronAPI.saveCharacter(newFilename, JSON.stringify(char, null, 2));
        
        // B. ♻️ 自动清理：如果文件名变了，且旧文件存在，则删除旧文件
        if (oldFilename && oldFilename !== newFilename) {
            console.log(`文件名变更，删除旧文件: ${oldFilename}`);
            await window.electronAPI.deleteCharacter(oldFilename);
        }

        // C. 更新记录
        this._filenameMap.set(char.id, newFilename);
      }
    },

    // --- 4. 读取 ---
    getCharacterData(id: string): Character | null {
      return this._characterCache.get(id) || null;
    },

    // --- 5. 删除逻辑 ---
    async deleteCharacter(id: string) {
      const char = this.getCharacterData(id);
      if (window.electronAPI && char) {
        // 使用记录的文件名，或者重新计算
        const filename = this._filenameMap.get(id) || getFilename(char);
        await window.electronAPI.deleteCharacter(filename);
      }

      this._characterCache.delete(id);
      this._filenameMap.delete(id);
      this.characterList = this.characterList.filter(c => c.id !== id);
    },

    // --- 6. 导出 ---
    exportCharacter(id: string) {
      const char = this.getCharacterData(id);
      if (!char) return null;
      return { json: JSON.stringify(char, null, 2), filename: getFilename(char) };
    },

    // --- 7. 导入 ---
    async importCharacter(jsonStr: string) {
      try {
        const data = JSON.parse(jsonStr) as Character;
        if (!data.profile) throw new Error('无效数据');
        
        data.id = generateUUID(); 
        data.lastModified = Date.now();
        
        // 兼容性补全
        if (!data.bio) data.bio = { age: '', height: '', weight: '', eyes: '', skin: '', hair: '', personalityTraits: '', ideals: '', bonds: '', flaws: '', backstory: '', featureText: '', treasureNotes: '' };
        if (!data.spells) data.spells = { spellcastingAbility: 'int', spellSaveDC: 10, spellAttackMod: 2, slots: { current: [0,0,0,0,0,0,0,0,0,0], max: [0,0,0,0,0,0,0,0,0,0] }, pactSlots: { level: 1, current: 0, max: 0 }, known: [], prepared: [] };
        if (!data.proficiencies) data.proficiencies = { armor: [], weapons: [], tools: [], languages: [] };
        if (!data.savingThrows) data.savingThrows = { str: false, dex: false, con: false, int: false, wis: false, cha: false };

        await this.saveCharacterData(data);
        return data.id;
      } catch (e) {
        console.error(e);
        return null;
      }
    }
  }
});