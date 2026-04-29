import fs from 'fs';
import path from 'path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanupOldLogFiles, initializeLogging, writeLogEntry } from '../electron/logger';
import { createRendererLogger } from '../src/utils/rendererLogger';
import { normalizeLogEntry, serializeLogError, sanitizeLogValue } from '../src/utils/logging';
import type { ElectronApi } from '../src/types/electron';

const testRoot = path.join(process.cwd(), 'node_modules', '.cache', 'logging-test');
const originalWindowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');

const resetTestRoot = () => {
  fs.rmSync(testRoot, { recursive: true, force: true });
  fs.mkdirSync(testRoot, { recursive: true });
};

afterEach(() => {
  vi.restoreAllMocks();
  fs.rmSync(testRoot, { recursive: true, force: true });
  if (originalWindowDescriptor) {
    Object.defineProperty(globalThis, 'window', originalWindowDescriptor);
  } else {
    Reflect.deleteProperty(globalThis, 'window');
  }
});

describe('logging serialization', () => {
  it('keeps ordinary details JSON serializable', () => {
    const entry = normalizeLogEntry({
      level: 'info',
      scope: 'renderer',
      namespace: 'test',
      message: 'details',
      details: { characterName: '阿莱娜', count: 2 },
    });

    expect(entry.details).toEqual({ characterName: '阿莱娜', count: 2 });
    expect(() => JSON.stringify(entry)).not.toThrow();
  });

  it('serializes Error objects with name, message, and stack', () => {
    const error = new TypeError('bad payload');
    const serialized = serializeLogError(error);

    expect(serialized?.name).toBe('TypeError');
    expect(serialized?.message).toBe('bad payload');
    expect(serialized?.stack).toContain('TypeError');
  });

  it('turns circular details into a safe summary', () => {
    const circular: { self?: unknown } = {};
    circular.self = circular;

    expect(sanitizeLogValue(circular)).toEqual({ self: '[Circular]' });
  });
});

describe('main process file logging', () => {
  it('writes valid JSONL lines and appends entries for the same day', () => {
    resetTestRoot();
    initializeLogging(testRoot);

    writeLogEntry(normalizeLogEntry({
      timestamp: '2026-04-29T01:00:00.000Z',
      level: 'info',
      scope: 'main',
      namespace: 'test/main',
      message: 'first',
    }));
    writeLogEntry(normalizeLogEntry({
      timestamp: '2026-04-29T02:00:00.000Z',
      level: 'error',
      scope: 'main',
      namespace: 'test/main',
      message: 'second',
      error: new Error('boom'),
    }));

    const content = fs.readFileSync(path.join(testRoot, 'logs', '2026-04-29.jsonl'), 'utf-8');
    const lines = content.trim().split('\n').map(line => JSON.parse(line));

    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatchObject({ level: 'info', message: 'first' });
    expect(lines[1]).toMatchObject({
      level: 'error',
      message: 'second',
      error: { name: 'Error', message: 'boom' },
    });
  });

  it('cleans log files older than the retention window', () => {
    const logsDir = path.join(testRoot, 'logs');
    fs.mkdirSync(logsDir, { recursive: true });
    fs.writeFileSync(path.join(logsDir, '2026-04-20.jsonl'), '{}\n');
    fs.writeFileSync(path.join(logsDir, '2026-04-23.jsonl'), '{}\n');
    fs.writeFileSync(path.join(logsDir, 'notes.txt'), 'keep');

    cleanupOldLogFiles(logsDir, new Date('2026-04-30T00:00:00.000Z'), 7);

    expect(fs.existsSync(path.join(logsDir, '2026-04-20.jsonl'))).toBe(false);
    expect(fs.existsSync(path.join(logsDir, '2026-04-23.jsonl'))).toBe(true);
    expect(fs.existsSync(path.join(logsDir, 'notes.txt'))).toBe(true);
  });
});

describe('renderer logger', () => {
  it('sends logs through electronAPI when available', async () => {
    const writeLog = vi.fn(async (_entry: unknown) => ({ success: true as const, data: null }));
    Object.defineProperty(globalThis, 'window', {
      value: { electronAPI: { writeLog } as Partial<ElectronApi> },
      configurable: true,
    });

    const logger = createRendererLogger('test/renderer');
    logger.info('hello', { fileName: 'hero.json' });

    await vi.waitFor(() => expect(writeLog).toHaveBeenCalledTimes(1));
    expect(writeLog.mock.calls[0]?.[0]).toMatchObject({
      level: 'info',
      scope: 'renderer',
      namespace: 'test/renderer',
      message: 'hello',
      details: { fileName: 'hero.json' },
    });
  });

  it('does not throw when electronAPI is unavailable', () => {
    Object.defineProperty(globalThis, 'window', {
      value: {},
      configurable: true,
    });

    const logger = createRendererLogger('test/renderer');
    expect(() => logger.error('fallback only', new Error('offline'))).not.toThrow();
  });
});
