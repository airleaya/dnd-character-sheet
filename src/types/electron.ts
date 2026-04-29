import type { Character } from './Character';
import type { DataPackImportResult, DataPackSettings, DataPackState } from './DataPack';
import type { LogWriteInput } from './logging';

export type IpcSuccessResult<T> = {
  success: true;
  data: T;
};

export type IpcFailureResult = {
  success: false;
  error: string;
};

export type IpcResult<T> = IpcSuccessResult<T> | IpcFailureResult;

export type IpcVoidResult = IpcResult<null>;

export interface ElectronApi {
  saveCharacter: (filename: string, content: string) => Promise<IpcVoidResult>;
  loadAllCharacters: () => Promise<IpcResult<Character[]>>;
  deleteCharacter: (filename: string) => Promise<IpcVoidResult>;
  onAppWillClose: (callback: () => void) => void;
  confirmClose: () => Promise<void>;
  setZoomFactor: (factor: number) => void;
  selectDirectory: () => Promise<string | null>;
  exportCharacter: (dirPath: string, filename: string, content: string) => Promise<IpcVoidResult>;
  writeLog: (entry: LogWriteInput) => Promise<IpcVoidResult>;
  readDataPackState?: () => Promise<IpcResult<DataPackState>>;
  importDataPack?: () => Promise<IpcResult<DataPackImportResult | null>>;
  exportDataPack?: (packId: string) => Promise<IpcVoidResult>;
  deleteDataPack?: (packId: string) => Promise<IpcVoidResult>;
  updateDataPackSettings?: (settings: DataPackSettings) => Promise<IpcResult<DataPackSettings>>;
}
