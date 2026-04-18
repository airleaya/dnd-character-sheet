/// <reference types="vite/client" />

import type { ElectronApi } from './types/electron';

export {};

declare global {
  interface Window {
    electronAPI: ElectronApi;
  }
}