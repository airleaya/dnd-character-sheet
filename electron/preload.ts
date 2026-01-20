import { contextBridge, ipcRenderer,webFrame } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  saveCharacter: (filename: string, content: string) => ipcRenderer.invoke('save-character', filename, content),
  loadAllCharacters: () => ipcRenderer.invoke('load-all-characters'),
  deleteCharacter: (filename: string) => ipcRenderer.invoke('delete-character', filename),
  onAppWillClose: (callback: () => void) => ipcRenderer.on('app-will-close', callback),
  confirmClose: () => ipcRenderer.invoke('app-can-close'),
  //设置缩放比例 (factor: 1.0 = 100%, 1.2 = 120%)
  setZoomFactor: (factor: number) => webFrame.setZoomFactor(factor),
  //批量导出相关接口
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  exportCharacter: (dirPath: string, filename: string, content: string) =>
    ipcRenderer.invoke('export-character', dirPath, filename, content),
})