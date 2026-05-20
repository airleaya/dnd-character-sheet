import { defineStore } from 'pinia';
import { generateUUID } from '../utils/idGenerator';
import type { Character, CharacterClassRecord } from '../types/Character';
import { createDefaultCharacter, normalizeCharacterData } from '../utils/characterMigration';
import { storageService } from '../services/storageService';
import { createRendererLogger } from '../utils/rendererLogger';


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
  classes: CharacterClassRecord[];
  avatarUrl?: string;
}

const logger = createRendererLogger('stores/characterStore');
const GROUPS_STORAGE_KEY = 'dnd_app_groups';
const UNGROUPED_STORAGE_KEY = 'dnd_app_ungrouped_expanded';

const cloneGroupsForPersistence = (groups: CharacterGroup[]): CharacterGroup[] =>
  groups.map(group => ({
    ...group,
    characterIds: [...group.characterIds],
  }));

const writeGroupsBackup = (groups: CharacterGroup[], ungroupedExpanded: boolean) => {
  localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(cloneGroupsForPersistence(groups)));
  localStorage.setItem(UNGROUPED_STORAGE_KEY, String(ungroupedExpanded));
};

// 🔧 辅助函数：生成标准化的文件名
const getFilename = (char: Character): string => {
  // const safeName = (char.profile.name || '未命名').replace(/[\\/:*?"<>|]/g, '_');
  // const safeClass = (char.profile.class || '无职业').replace(/[\\/:*?"<>|]/g, '_');
  // return `${safeName}-${safeClass}.json`;

  return `${char.id}.json`;
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
      try {
        const characters = await storageService.loadAllCharacters();

        this.characterList = [];
        this._characterCache.clear();
        this._filenameMap.clear(); // 清空文件名映射

        characters.forEach((rawChar: Character) => {
          const char = normalizeCharacterData(rawChar);
          this._characterCache.set(char.id, char);

          // 记录初始文件名
          this._filenameMap.set(char.id, getFilename(char));

          this.characterList.push({
            id: char.id,
            name: char.profile.name,
            playerName: char.profile.playerName,
            race: char.profile.race,
            level: char.profile.level,
            classes: char.profile.classes,
            avatarUrl: char.profile.avatarUrl,
          });
        });
        await this.loadGroups();
      } catch (error) {
        logger.warn('Failed to load characters', undefined, error);
      }
    },


    // --- 2. 创建新角色 (修改：不再自动保存) ---
    async createNewCharacter() {
      const newId = generateUUID();
      
      const newChar = createDefaultCharacter(newId);

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
        avatarUrl: newChar.profile.avatarUrl,
      });

      // 初始化时记录一个文件名，防止 save 时报错
      this._filenameMap.set(newId, getFilename(newChar));

      // ⚠️ 注意：这里不再调用 saveCharacterData
      // 只有当用户在界面上修改了数据（触发 input/change）时，才会第一次保存
      
      return newId; 
    },

    // --- 3. 保存逻辑 (核心迁移逻辑) ---
    async saveCharacterData(char: Character) {
      const normalizedChar = normalizeCharacterData(char);
      this._characterCache.set(normalizedChar.id, normalizedChar);

      const metaIndex = this.characterList.findIndex(c => c.id === normalizedChar.id);
      const meta = {
        id: normalizedChar.id,
        name: normalizedChar.profile.name,
        playerName: normalizedChar.profile.playerName,
        race: normalizedChar.profile.race,
        level: normalizedChar.profile.level,
        classes: normalizedChar.profile.classes,
        avatarUrl: normalizedChar.profile.avatarUrl,
      };

      if (metaIndex !== -1) {
        this.characterList[metaIndex] = meta;
      }
      else {
        // 如果是新 ID，必须 push 到列表，UI 才会刷新
        this.characterList.push(meta);
      }

      // 1. 计算新的标准文件名 (UUID.json)
      const newFilename = getFilename(normalizedChar);
      
      // 2. 获取内存中记录的“上一次的文件名”
      // 注意：如果是旧存档第一次运行，_filenameMap 里存的可能是错误的（因为 init 时被强制设为了 UUID.json）
      // 这会导致旧文件（Name.json）无法被自动删除。
      // 为了完美解决这个问题，我们需要在 init 时尽量去推断旧文件名，或者接受会有一次“残留文件”。
      // 鉴于不修改 Electron 端，我们这里接受：
      // "用户改动数据并保存后，会生成新的 UUID.json，旧的 Name.json 可能残留，但不影响程序运行（因为下次读取会读两份，然后去重或并在列表显示）"。
      // *优化方案*：用户可以手动在资源管理器删除旧文件，或者我们在 Electron 端做去重。
      const oldFilename = this._filenameMap.get(normalizedChar.id);

      // A. 保存新文件
      await storageService.saveCharacter(newFilename, JSON.stringify(normalizedChar, null, 2));
      
      // B. 尝试清理旧文件
      if (oldFilename && oldFilename !== newFilename) {
        try {
          await storageService.deleteCharacter(oldFilename);
        } catch (error) {
          logger.warn('Failed to delete legacy filename', { oldFilename }, error);
        }
      }

      // C. 更新映射
      this._filenameMap.set(normalizedChar.id, newFilename);

    },

    // --- 4. 读取 ---
    getCharacterData(id: string): Character | null {
      return this._characterCache.get(id) || null;
    },

    // --- 5. 删除逻辑 ---
    async deleteCharacter(id: string) {
      const char = this.getCharacterData(id);
      if (char) {
        const filename = this._filenameMap.get(id) || getFilename(char);
        await storageService.deleteCharacter(filename);
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
        const parsed = JSON.parse(jsonStr) as Character;
        if (!parsed.profile) throw new Error('无效数据');

        const data = normalizeCharacterData({
          ...parsed,
          id: generateUUID(),
          lastModified: Date.now(),
        });

        await this.saveCharacterData(data);
        return data.id;
      } catch (e) {
        logger.error('Failed to import character', e);
        return null;
      }
    },

    // --- 8. 分组管理逻辑 ---
    // 加载分组数据 (带数据清洗)
    async loadGroups() {
      try {
        const localGroups = localStorage.getItem(GROUPS_STORAGE_KEY);
        const localUngroupedExpanded = localStorage.getItem(UNGROUPED_STORAGE_KEY);
        const localState = localGroups
          ? {
              groups: JSON.parse(localGroups) as CharacterGroup[],
              ungroupedExpanded: localUngroupedExpanded !== null ? localUngroupedExpanded === 'true' : true,
            }
          : null;
        const result = await window.electronAPI?.readCharacterGroups?.();
        const persistedState = result?.success ? result.data : null;
        const nextState = persistedState && persistedState.groups.length > 0 ? persistedState : localState;

        if (nextState) {
          const allCharIds = new Set(this.characterList.map(c => c.id));
          this.groups = nextState.groups.map(group => ({
            ...group,
            // 确保旧数据也有折叠属性，默认为展开
            isExpanded: group.isExpanded !== undefined ? group.isExpanded : true,
            characterIds: Array.isArray(group.characterIds)
              ? group.characterIds.filter(id => allCharIds.has(id))
              : []
          }));
          this.ungroupedExpanded = nextState.ungroupedExpanded;

          if (localState && (!persistedState || persistedState.groups.length === 0)) {
            await this.saveGroups();
          }
        }
      } catch (e) {
        logger.error('Failed to load groups', e);
      }
    },

    // 保存分组数据到本地
    saveGroups() {
      const state = {
        groups: cloneGroupsForPersistence(this.groups),
        ungroupedExpanded: this.ungroupedExpanded,
      };
      writeGroupsBackup(state.groups, state.ungroupedExpanded);

      if (window.electronAPI?.saveCharacterGroups) {
        void window.electronAPI.saveCharacterGroups(state).then(result => {
          if (!result.success) {
            logger.warn('Failed to persist character groups via Electron API', { error: result.error });
          }
        }).catch(error => {
          logger.warn('Failed to persist character groups via Electron API', undefined, error);
        });
      }
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
            maxNum = Math.max(maxNum, parseInt(match[1] ?? '0', 10));
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
