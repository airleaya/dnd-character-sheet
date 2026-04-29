export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogScope = 'main' | 'renderer';

export interface SerializedLogError {
  name: string;
  message: string;
  stack?: string;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  scope: LogScope;
  namespace: string;
  message: string;
  details?: unknown;
  error?: SerializedLogError;
}

export interface LogWriteInput {
  timestamp?: string;
  level: LogLevel;
  scope: LogScope;
  namespace: string;
  message: string;
  details?: unknown;
  error?: unknown;
}
