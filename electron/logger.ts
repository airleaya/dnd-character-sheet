import fs from 'fs';
import path from 'path';
import type { LogEntry, LogLevel } from '../src/types/logging';
import {
  normalizeLogEntry,
  serializeLogEntryLine,
  shouldWriteLogLevel
} from '../src/utils/logging';

type MainLogger = {
  debug: (message: string, details?: unknown) => void;
  info: (message: string, details?: unknown) => void;
  warn: (message: string, details?: unknown, error?: unknown) => void;
  error: (message: string, error?: unknown, details?: unknown) => void;
};

const LOG_RETENTION_DAYS = 7;
const nativeConsole = globalThis['console'];
let logsDir = '';

const isDevelopment = (): boolean => Boolean(process.env.VITE_DEV_SERVER_URL);

const getDateStamp = (date = new Date()): string => date.toISOString().slice(0, 10);

const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export const getLogsDir = (userDataRoot: string): string => path.join(userDataRoot, 'logs');

export const cleanupOldLogFiles = (
  targetLogsDir: string,
  now = new Date(),
  retentionDays = LOG_RETENTION_DAYS
): void => {
  if (!fs.existsSync(targetLogsDir)) return;

  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - retentionDays);
  const cutoffStamp = getDateStamp(cutoff);

  fs.readdirSync(targetLogsDir)
    .filter(file => /^\d{4}-\d{2}-\d{2}\.jsonl$/.test(file))
    .forEach(file => {
      const fileStamp = file.slice(0, 10);
      if (fileStamp < cutoffStamp) {
        fs.unlinkSync(path.join(targetLogsDir, file));
      }
    });
};

export const initializeLogging = (userDataRoot: string): void => {
  logsDir = getLogsDir(userDataRoot);
  ensureDirectoryExists(logsDir);
  cleanupOldLogFiles(logsDir);
};

export const writeLogEntry = (entry: LogEntry): void => {
  if (!logsDir) return;

  ensureDirectoryExists(logsDir);
  const filePath = path.join(logsDir, `${getDateStamp(new Date(entry.timestamp))}.jsonl`);
  fs.appendFileSync(filePath, serializeLogEntryLine(entry), 'utf-8');
};

const fallbackToConsole = (level: LogLevel, message: string, details?: unknown, error?: unknown) => {
  const writer = level === 'debug' ? nativeConsole?.debug : nativeConsole?.[level];
  writer?.call(nativeConsole, message, details ?? '', error ?? '');
};

export const createMainLogger = (namespace: string): MainLogger => {
  const write = (level: LogLevel, message: string, details?: unknown, error?: unknown) => {
    if (!shouldWriteLogLevel(level, isDevelopment())) return;

    const entry = normalizeLogEntry({
      level,
      scope: 'main',
      namespace,
      message,
      details,
      error,
    });

    try {
      writeLogEntry(entry);
    } catch (writeError) {
      fallbackToConsole(level, message, details, error ?? writeError);
    }
  };

  return {
    debug: (message, details) => write('debug', message, details),
    info: (message, details) => write('info', message, details),
    warn: (message, details, error) => write('warn', message, details, error),
    error: (message, error, details) => write('error', message, details, error),
  };
};
