/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    saveCharacter: (filename: string, content: string) => Promise<{ success: boolean; error?: any }>;
    loadAllCharacters: () => Promise<{ success: boolean; data: any[] }>;
    deleteCharacter: (filename: string) => Promise<{ success: boolean; error?: any }>;
    onAppWillClose: (callback: () => void) => void; 
    confirmClose: () => Promise<void>;             
  }
}