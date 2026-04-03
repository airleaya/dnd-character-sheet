import { defineStore } from 'pinia';
import { generateUUID } from '../utils/idGenerator';
import type { Character } from '../types/Character';

// 分组元数据接口
export interface CharacterGroup {
  id: string;
  name: string;
  characterIds: string[]; // 存储角色 ID
  isExpanded: boolean;    // UI 折叠状态
}

interface CharacterMeta {
  id: string;
  name: string;
  playerName?: string;
  race: string;
  level: number;
  classes: any[];
  avatarUrl?: string; 
}

// 🔧 辅助函数：生成标准化的文件名
const getFilename = (char: Character): string => {
  // const safeName = (char.profile.name || '未命名').replace(/[\\/:*?"<>|]/g, '_');
  // const safeClass = (char.profile.class || '无职业').replace(/[\\/:*?"<>|]/g, '_');
  // return `${safeName}-${safeClass}.json`;

  return `${char.id}.json`;
};

// 旧数据兼容清洗辅助函数
const migrateLegacyData = (char: any) => {
  if (!char.combat) return;
  
  // 如果发现旧存档的生命骰字段，则进行迁移清洗
  if (char.combat.hitDiceType || char.combat.hitDiceCurrent !== undefined) {
    const type = char.combat.hitDiceType || 'd6';
    const current = char.combat.hitDiceCurrent || 0;
    const max = char.combat.hitDiceMax || 0;

    char.combat.hitDice = {
      [type]: { current, max }
    };

    // 彻底销毁旧字段，保持状态树纯净
    delete char.combat.hitDiceType;
    delete char.combat.hitDiceCurrent;
    delete char.combat.hitDiceMax;
  }
  
  // 兜底：如果完全没有，初始化为空对象
  if (!char.combat.hitDice) {
    char.combat.hitDice = {};
  }
};

export const useCharacterStore = defineStore('characterStore', {
  state: () => ({
    characterList: [] as CharacterMeta[], 
    _characterCache: new Map<string, Character>(),
    // 用于记录角色当前在硬盘上的文件名，以便改名时删除旧文件
    _filenameMap: new Map<string, string>(),
    // 分组状态
    groups: [] as CharacterGroup[],
    ungroupedExpanded: true,
  }),

  getters: {
    // 获取每个分组及其包含的角色详细元数据
    groupedList: (state) => {
      return state.groups.map(group => {
        const chars = group.characterIds
          .map(id => state.characterList.find(c => c.id === id))
          .filter((c): c is CharacterMeta => c !== undefined);
        return { ...group, chars };
      });
    },
    // 获取未分配任何分组的角色
    ungroupedList: (state) => {
      const groupedIds = new Set(state.groups.flatMap(g => g.characterIds));
      return state.characterList.filter(c => !groupedIds.has(c.id));
    }
  },

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
          migrateLegacyData(char);
          this._characterCache.set(char.id, char);
          
          // 记录初始文件名
          this._filenameMap.set(char.id, getFilename(char));

          this.characterList.push({
            id: char.id,
            name: char.profile.name,
            playerName: char.profile.playerName,
            race: char.profile.race,
            level: char.profile.level,
            classes: char.profile.classes || [],
            avatarUrl: char.profile.avatarUrl
          });
        });
        this.loadGroups();
      }
    },

    // --- 2. 创建新角色 (修改：不再自动保存) ---
    async createNewCharacter() {
      const newId = generateUUID();
      
      const newChar: Character = {
        id: newId,
        lastModified: Date.now(),
        profile: { name: '新角色', playerName: '', race: '人类', background: '', alignment: '', level: 1, xp: 0, classes: [{ classId: '', subclassId: null, level: 1 }] },
        bio: { age: '', height: '', weight: '', eyes: '', skin: '', hair: '', personalityTraits: '', ideals: '', bonds: '', flaws: '', backstory: '', featureText: '', treasureNotes: '' },
        stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        combat: { hpCurrent: 10, hpMax: 10, tempHp: 0, hitDice: { 'd6': { current: 1, max: 1 } }, deathSaves: { success: 0, failure: 0 }, speed: 30, exhaustion: 0, inspiration: [false, false, false], conditions: '' },
        inventory: [], equippedIds: [], wallet: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }, skillProficiencies: {}, savingThrows: { str: false, dex: false, con: false, int: false, wis: false, cha: false }, hiddenAttacks: [],
        proficiencies: { armor: [], weapons: [], tools: [], languages: [] },
        spells: { spellcastingAbility: 'int', spellSaveDC: 10, spellAttackMod: 2, slots: { current: [0,0,0,0,0,0,0,0,0,0], max: [0,0,0,0,0,0,0,0,0,0] }, pactSlots: { level: 1, current: 0, max: 0 }, known: [], prepared: [] },
        activeAttackModes: [],
      };

      // 1. 只更新内存，不写硬盘！
      this._characterCache.set(newId, newChar);
      
      // 2. 更新 UI 列表
      this.characterList.push({
        id: newChar.id,
        name: newChar.profile.name,
        playerName: newChar.profile.playerName,
        race: newChar.profile.race,
        level: newChar.profile.level,
        classes: newChar.profile.classes || [],
        avatarUrl: newChar.profile.avatarUrl
      });

      // 初始化时记录一个文件名，防止 save 时报错
      this._filenameMap.set(newId, getFilename(newChar));

      // ⚠️ 注意：这里不再调用 saveCharacterData
      // 只有当用户在界面上修改了数据（触发 input/change）时，才会第一次保存
      
      return newId; 
    },

    // --- 3. 保存逻辑 (核心迁移逻辑) ---
    async saveCharacterData(char: Character) {
      this._characterCache.set(char.id, char);
      
      const metaIndex = this.characterList.findIndex(c => c.id === char.id);
      const meta = { id: char.id, name: char.profile.name, playerName: char.profile.playerName, race: char.profile.race, level: char.profile.level, classes: char.profile.classes || [], avatarUrl: char.profile.avatarUrl };
      if (metaIndex !== -1) 
        {this.characterList[metaIndex] = meta;}
      else {
        // 如果是新 ID，必须 push 到列表，UI 才会刷新
        this.characterList.push(meta);
      }

      if (window.electronAPI) {
        // 1. 计算新的标准文件名 (UUID.json)
        const newFilename = getFilename(char);
        
        // 2. 获取内存中记录的“上一次的文件名”
        // 注意：如果是旧存档第一次运行，_filenameMap 里存的可能是错误的（因为 init 时被强制设为了 UUID.json）
        // 这会导致旧文件（Name.json）无法被自动删除。
        // 为了完美解决这个问题，我们需要在 init 时尽量去推断旧文件名，或者接受会有一次“残留文件”。
        // 鉴于不修改 Electron 端，我们这里接受：
        // "用户改动数据并保存后，会生成新的 UUID.json，旧的 Name.json 可能残留，但不影响程序运行（因为下次读取会读两份，然后去重或并在列表显示）"。
        // *优化方案*：用户可以手动在资源管理器删除旧文件，或者我们在 Electron 端做去重。
        const oldFilename = this._filenameMap.get(char.id);

        // A. 保存新文件
        await window.electronAPI.saveCharacter(newFilename, JSON.stringify(char, null, 2));
        
        // B. 尝试清理旧文件
        if (oldFilename && oldFilename !== newFilename) {
            console.log(`文件名策略变更，尝试删除旧文件: ${oldFilename}`);
            // 这一步可能会失败（如果 oldFilename 其实不存在），但 catch 住不影响流程
            try {
              await window.electronAPI.deleteCharacter(oldFilename);
            } catch (e) {
              console.warn('删除旧文件失败，可能是文件不存在或权限问题', e);
            }
        }

        // C. 更新映射
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

      // 删除角色时，从所有分组中移除该角色的引用
      this.groups.forEach(group => {
        group.characterIds = group.characterIds.filter(charId => charId !== id);
      });
      this.saveGroups();
    },

    // --- 6. 导出 ---
    exportCharacter(id: string) {
      const char = this.getCharacterData(id);
      if (!char) return null;
      // 导出给用户的文件名依然使用易读的格式，而不是 UUID
      const safeName = (char.profile.name || '未命名').replace(/[\\/:*?"<>|]/g, '_');
      const filename = `${safeName}_Lv${char.profile.level}.json`;
      return { json: JSON.stringify(char, null, 2), filename };
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
        migrateLegacyData(data);

        await this.saveCharacterData(data);
        return data.id;
      } catch (e) {
        console.error(e);
        return null;
      }
    },

    // --- 8. 分组管理逻辑 ---
    // 加载分组数据 (带数据清洗)
    loadGroups() {
      try {
        const stored = localStorage.getItem('dnd_app_groups');
        if (stored) {
          const parsed = JSON.parse(stored) as CharacterGroup[];
          const allCharIds = new Set(this.characterList.map(c => c.id));
          
          this.groups = parsed.map(group => ({
            ...group,
            // 确保旧数据也有折叠属性，默认为展开
            isExpanded: group.isExpanded !== undefined ? group.isExpanded : true,
            characterIds: group.characterIds.filter(id => allCharIds.has(id))
          }));
        }

        // 读取未分组区域的状态
        const ungroupedState = localStorage.getItem('dnd_app_ungrouped_expanded');
        if (ungroupedState !== null) {
          this.ungroupedExpanded = ungroupedState === 'true';
        }
      } catch (e) {
        console.error('加载分组数据失败', e);
      }
    },

    // 保存分组数据到本地
    saveGroups() {
      localStorage.setItem('dnd_app_groups', JSON.stringify(this.groups));
      localStorage.setItem('dnd_app_ungrouped_expanded', String(this.ungroupedExpanded));
    },

    // 切换未分组区域状态
    toggleUngrouped() {
      this.ungroupedExpanded = !this.ungroupedExpanded;
      this.saveGroups();
    },

    // 创建新分组
    createGroup() {
      let maxNum = 0;
      const regex = /^未命名分组\s*(\d+)$/;
      
      // 遍历现有分组，找出最大的编号
      this.groups.forEach(g => {
        if (g.name === '未命名分组') {
          maxNum = Math.max(maxNum, 1);
        } else {
          const match = g.name.match(regex);
          if (match) {
            maxNum = Math.max(maxNum, parseInt(match[1], 10));
          }
        }
      });
      
      const newName = maxNum === 0 ? '未命名分组 1' : `未命名分组 ${maxNum + 1}`;

      this.groups.push({
        id: generateUUID(),
        name: newName,
        characterIds: [],
        isExpanded: true
      });
      this.saveGroups();
    },

    // 删除分组 (角色不会被删除，仅变为未分组)
    deleteGroup(groupId: string) {
      this.groups = this.groups.filter(g => g.id !== groupId);
      this.saveGroups();
    },

    // 重命名分组
    renameGroup(groupId: string, newName: string) {
      const group = this.groups.find(g => g.id === groupId);
      if (group) {
        group.name = newName;
        this.saveGroups();
      }
    },

    // 切换分组展开/折叠
    toggleGroup(groupId: string) {
      const group = this.groups.find(g => g.id === groupId);
      if (group) {
        group.isExpanded = !group.isExpanded;
        this.saveGroups();
      }
    },

    // 将角色移入某个分组 (groupId 为 null 表示移入未分组)
    moveCharacterToGroup(charId: string, targetGroupId: string | null) {
      // 1. 先从所有分组中移除
      this.groups.forEach(g => {
        g.characterIds = g.characterIds.filter(id => id !== charId);
      });
      
      // 2. 如果指定了目标分组，则加入
      if (targetGroupId) {
        const targetGroup = this.groups.find(g => g.id === targetGroupId);
        if (targetGroup && !targetGroup.characterIds.includes(charId)) {
          targetGroup.characterIds.push(charId);
        }
      }
      
      this.saveGroups();
    }
  }
});