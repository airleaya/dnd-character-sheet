/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    saveCharacter: (filename: string, content: string) => Promise<{ success: boolean; error?: any }>;
    loadAllCharacters: () => Promise<{ success: boolean; data: any[] }>;
    deleteCharacter: (filename: string) => Promise<{ success: boolean; error?: any }>;
    onAppWillClose: (callback: () => void) => void; 
    confirmClose: () => Promise<void>;   
    //缩放接口定义
    setZoomFactor: (factor: number) => void;  
    // 批量处理导出接口
    selectDirectory: () => Promise<string | null>;
    exportCharacter: (dirPath: string, filename: string, content: string) => Promise<{success: boolean, error?: any}>;        
  }
}