/// <reference types="vite/client" />

import type { Character } from './types/Character';

export {};

declare global {
  interface Window {
    electronAPI: {
      saveCharacter: (filename: string, content: string) => Promise<{ success: boolean; error?: unknown }>;
      loadAllCharacters: () => Promise<{ success: boolean; data?: Character[] }>;
      deleteCharacter: (filename: string) => Promise<{ success: boolean; error?: unknown }>;
      onAppWillClose: (callback: () => void) => void;
      confirmClose: () => Promise<void>;
      //缩放接口定义
      setZoomFactor: (factor: number) => void;
      // 批量处理导出接口
      selectDirectory: () => Promise<string | null>;
      exportCharacter: (dirPath: string, filename: string, content: string) => Promise<{ success: boolean; error?: unknown }>;
    };
  }
}