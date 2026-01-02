import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  saveCharacter: (filename: string, content: string) => ipcRenderer.invoke('save-character', filename, content),
  loadAllCharacters: () => ipcRenderer.invoke('load-all-characters'),
  deleteCharacter: (filename: string) => ipcRenderer.invoke('delete-character', filename),
  onAppWillClose: (callback: () => void) => ipcRenderer.on('app-will-close', callback),
  confirmClose: () => ipcRenderer.invoke('app-can-close')
})