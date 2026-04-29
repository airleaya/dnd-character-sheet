import type { LogEntry, LogLevel, LogScope, LogWriteInput, SerializedLogError } from '../types/logging';

const LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error'];
const LOG_SCOPES: LogScope[] = ['main', 'renderer'];

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const isLogLevel = (value: unknown): value is LogLevel =>
  typeof value === 'string' && LOG_LEVELS.includes(value as LogLevel);

const isLogScope = (value: unknown): value is LogScope =>
  typeof value === 'string' && LOG_SCOPES.includes(value as LogScope);

export const shouldWriteLogLevel = (level: LogLevel, isDevelopment: boolean): boolean =>
  isDevelopment || level !== 'debug';

export const serializeLogError = (error: unknown): SerializedLogError | undefined => {
  if (!error) return undefined;

  if (error instanceof Error) {
    return {
      name: error.name || 'Error',
      message: error.message,
      stack: error.stack,
    };
  }

  if (isPlainObject(error)) {
    const name = typeof error.name === 'string' ? error.name : 'Error';
    const message = typeof error.message === 'string' ? error.message : safeStringify(error);
    const stack = typeof error.stack === 'string' ? error.stack : undefined;
    return { name, message, stack };
  }

  return {
    name: 'Error',
    message: String(error),
  };
};

export const sanitizeLogValue = (value: unknown): unknown => {
  if (value === undefined) return undefined;

  try {
    const seen = new WeakSet<object>();
    const serialized = JSON.stringify(value, (_key, current) => {
      if (typeof current === 'bigint') return current.toString();
      if (typeof current === 'function') return `[Function ${current.name || 'anonymous'}]`;
      if (typeof current === 'symbol') return String(current);
      if (current instanceof Error) return serializeLogError(current);

      if (current && typeof current === 'object') {
        if (seen.has(current)) return '[Circular]';
        seen.add(current);
      }

      return current;
    });

    return serialized === undefined ? String(value) : JSON.parse(serialized);
  } catch {
    return safeStringify(value);
  }
};

export const normalizeLogEntry = (input: LogWriteInput | unknown): LogEntry => {
  const source = isPlainObject(input) ? input : {};
  const level = isLogLevel(source.level) ? source.level : 'info';
  const scope = isLogScope(source.scope) ? source.scope : 'renderer';
  const namespace =
    typeof source.namespace === 'string' && source.namespace.trim()
      ? source.namespace.trim()
      : 'unknown';
  const message = typeof source.message === 'string' ? source.message : String(source.message ?? '');
  const timestamp =
    typeof source.timestamp === 'string' && !Number.isNaN(Date.parse(source.timestamp))
      ? source.timestamp
      : new Date().toISOString();
  const details = sanitizeLogValue(source.details);
  const error = serializeLogError(source.error);

  return {
    timestamp,
    level,
    scope,
    namespace,
    message,
    ...(details !== undefined ? { details } : {}),
    ...(error ? { error } : {}),
  };
};

export const serializeLogEntryLine = (entry: LogEntry): string =>
  `${JSON.stringify(normalizeLogEntry(entry))}\n`;

const safeStringify = (value: unknown): string => {
  try {
    return String(value);
  } catch {
    return '[Unserializable]';
  }
};
