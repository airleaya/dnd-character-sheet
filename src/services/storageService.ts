import type { Character } from '../types/Character';

const ensureElectronApi = () => {
  if (!window.electronAPI) {
    throw new Error('Electron API 不可用');
  }

  return window.electronAPI;
};

export const storageService = {
  async loadAllCharacters(): Promise<Character[]> {
    const electronAPI = ensureElectronApi();
    const result = await electronAPI.loadAllCharacters();

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  },

  async saveCharacter(filename: string, content: string): Promise<void> {
    const electronAPI = ensureElectronApi();
    const result = await electronAPI.saveCharacter(filename, content);

    if (!result.success) {
      throw new Error(result.error);
    }
  },

  async deleteCharacter(filename: string): Promise<void> {
    const electronAPI = ensureElectronApi();
    const result = await electronAPI.deleteCharacter(filename);

    if (!result.success) {
      throw new Error(result.error);
    }
  },
};
