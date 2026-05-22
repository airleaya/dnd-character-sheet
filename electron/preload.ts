import { contextBridge, ipcRenderer, webFrame } from 'electron'
import type { ElectronApi } from '../src/types/electron'

const electronAPI: ElectronApi = {
  saveCharacter: (filename: string, content: string) => ipcRenderer.invoke('save-character', filename, content),
  loadAllCharacters: () => ipcRenderer.invoke('load-all-characters'),
  deleteCharacter: (filename: string) => ipcRenderer.invoke('delete-character', filename),
  readCharacterGroups: () => ipcRenderer.invoke('read-character-groups'),
  saveCharacterGroups: (state) => ipcRenderer.invoke('save-character-groups', state),
  onAppWillClose: (callback: () => void) => ipcRenderer.on('app-will-close', callback),
  confirmClose: () => ipcRenderer.invoke('app-can-close'),
  //设置缩放比例 (factor: 1.0 = 100%, 1.2 = 120%)
  setZoomFactor: (factor: number) => webFrame.setZoomFactor(factor),
  //批量导出相关接口
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  exportCharacter: (dirPath: string, filename: string, content: string) =>
    ipcRenderer.invoke('export-character', dirPath, filename, content),
  exportCharacterPackage: (dirPath, character) => ipcRenderer.invoke('export-character-package', dirPath, character),
  importCharacterPackage: (bytes, newCharacterId) => ipcRenderer.invoke('import-character-package', bytes, newCharacterId),
  saveCharacterAvatar: (characterId, bytes, dimensions, previousAssetId) =>
    ipcRenderer.invoke('save-character-avatar', characterId, bytes, dimensions, previousAssetId),
  readCharacterAvatar: (characterId, assetId, size) =>
    ipcRenderer.invoke('read-character-avatar', characterId, assetId, size),
  saveCharacterAvatarRendition: (characterId, assetId, size, bytes, dimensions) =>
    ipcRenderer.invoke('save-character-avatar-rendition', characterId, assetId, size, bytes, dimensions),
  deleteCharacterAvatar: (characterId, assetId) => ipcRenderer.invoke('delete-character-avatar', characterId, assetId),
  writeLog: (entry) => ipcRenderer.invoke('write-log', entry),
  readCustomMagicTraits: () => ipcRenderer.invoke('read-custom-magic-traits'),
  saveCustomMagicTraits: (traits) => ipcRenderer.invoke('save-custom-magic-traits', traits),
  readDataPackState: () => ipcRenderer.invoke('read-data-pack-state'),
  importDataPack: () => ipcRenderer.invoke('import-data-pack'),
  exportDataPack: (packId: string, options) => ipcRenderer.invoke('export-data-pack', packId, options),
  deleteDataPack: (packId: string) => ipcRenderer.invoke('delete-data-pack', packId),
  updateDataPackSettings: (settings) => ipcRenderer.invoke('update-data-pack-settings', settings),
  updateDataPackUnlockProgress: (packId, progress) => ipcRenderer.invoke('update-data-pack-unlock-progress', packId, progress),
  readEditableDataPack: (packId: string) => ipcRenderer.invoke('read-editable-data-pack', packId),
  saveEditableDataPack: (packFile, mode) => ipcRenderer.invoke('save-editable-data-pack', packFile, mode),
  getLocalEditorIdHash: () => ipcRenderer.invoke('get-local-editor-id-hash'),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
