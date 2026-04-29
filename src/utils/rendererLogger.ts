import type { LogLevel } from '../types/logging';
import { normalizeLogEntry, shouldWriteLogLevel } from './logging';

type Logger = {
  debug: (message: string, details?: unknown) => void;
  info: (message: string, details?: unknown) => void;
  warn: (message: string, details?: unknown, error?: unknown) => void;
  error: (message: string, error?: unknown, details?: unknown) => void;
};

const nativeConsole = globalThis['console'];
const isDevelopment = import.meta.env.DEV;

const fallbackToConsole = (level: LogLevel, message: string, details?: unknown, error?: unknown) => {
  const writer = level === 'debug' ? nativeConsole?.debug : nativeConsole?.[level];
  writer?.call(nativeConsole, message, details ?? '', error ?? '');
};

export const createRendererLogger = (namespace: string): Logger => {
  const write = (level: LogLevel, message: string, details?: unknown, error?: unknown) => {
    if (!shouldWriteLogLevel(level, isDevelopment)) return;

    const entry = normalizeLogEntry({
      level,
      scope: 'renderer',
      namespace,
      message,
      details,
      error,
    });

    if (typeof window === 'undefined' || !window.electronAPI?.writeLog) {
      fallbackToConsole(level, message, details, error);
      return;
    }

    void window.electronAPI.writeLog(entry).catch(() => {
      fallbackToConsole(level, message, details, error);
    });
  };

  return {
    debug: (message, details) => write('debug', message, details),
    info: (message, details) => write('info', message, details),
    warn: (message, details, error) => write('warn', message, details, error),
    error: (message, error, details) => write('error', message, details, error),
  };
};
