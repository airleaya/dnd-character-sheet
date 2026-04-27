import { beforeEach, describe, expect, it } from 'vitest';
import { storageService } from '../src/services/storageService';
import { createDefaultCharacter } from '../src/utils/characterMigration';

describe('storageService', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'window', {
      value: {},
      configurable: true,
    });
  });

  it('throws when electronAPI is unavailable', async () => {
    await expect(storageService.loadAllCharacters()).rejects.toThrow();
  });

  it('returns loaded characters on success', async () => {
    const character = createDefaultCharacter('storage-1');

    Object.defineProperty(globalThis, 'window', {
      value: {
        electronAPI: {
          loadAllCharacters: async () => ({ success: true, data: [character] }),
          saveCharacter: async () => ({ success: true, data: null }),
          deleteCharacter: async () => ({ success: true, data: null }),
        },
      },
      configurable: true,
    });

    await expect(storageService.loadAllCharacters()).resolves.toEqual([character]);
  });

  it('throws the ipc error message when load fails', async () => {
    Object.defineProperty(globalThis, 'window', {
      value: {
        electronAPI: {
          loadAllCharacters: async () => ({ success: false, error: 'load failed' }),
          saveCharacter: async () => ({ success: true, data: null }),
          deleteCharacter: async () => ({ success: true, data: null }),
        },
      },
      configurable: true,
    });

    await expect(storageService.loadAllCharacters()).rejects.toThrow('load failed');
  });

  it('throws when saveCharacter fails', async () => {
    Object.defineProperty(globalThis, 'window', {
      value: {
        electronAPI: {
          loadAllCharacters: async () => ({ success: true, data: [] }),
          saveCharacter: async () => ({ success: false, error: 'save failed' }),
          deleteCharacter: async () => ({ success: true, data: null }),
        },
      },
      configurable: true,
    });

    await expect(storageService.saveCharacter('hero.json', '{}')).rejects.toThrow('save failed');
  });

  it('throws when deleteCharacter fails', async () => {
    Object.defineProperty(globalThis, 'window', {
      value: {
        electronAPI: {
          loadAllCharacters: async () => ({ success: true, data: [] }),
          saveCharacter: async () => ({ success: true, data: null }),
          deleteCharacter: async () => ({ success: false, error: 'delete failed' }),
        },
      },
      configurable: true,
    });

    await expect(storageService.deleteCharacter('hero.json')).rejects.toThrow('delete failed');
  });
});
