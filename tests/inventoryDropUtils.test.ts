import { describe, expect, it } from 'vitest';
import {
  clearGlobalDragPayload,
  clearGlobalDragPayloadNow,
  getDragPayloadFromEvent,
  parseDragPayload,
  setupDragData,
} from '../src/utils/inventoryDropUtils';

describe('inventoryDropUtils.parseDragPayload', () => {
  it('parses explicit library item payloads', () => {
    expect(parseDragPayload(JSON.stringify({ type: 'library-item', id: 'dnd5e-default:longsword' }))).toEqual({
      type: 'library-item',
      id: 'dnd5e-default:longsword',
    });
  });

  it('normalizes vuedraggable library clone payloads', () => {
    expect(parseDragPayload(JSON.stringify({ libraryId: 'dnd5e-default:longsword' }))).toEqual({
      type: 'library-item',
      id: 'dnd5e-default:longsword',
    });
  });

  it('normalizes inventory instance payloads used by sortable clones', () => {
    expect(parseDragPayload(JSON.stringify({ instanceId: 'inventory-001' }))).toEqual({
      type: 'inventory-item',
      instanceId: 'inventory-001',
    });
  });

  it('ignores unsupported payloads safely', () => {
    expect(parseDragPayload(JSON.stringify({ libraryId: 42 }))).toBeNull();
    expect(parseDragPayload('not-json')).toBeNull();
  });

  it('reads custom native drag payload types before falling back', () => {
    const event = {
      dataTransfer: {
        getData: (type: string) =>
          type === 'application/x-dnd-drag-payload'
            ? JSON.stringify({ type: 'library-item', id: 'native-item' })
            : '',
      },
    } as DragEvent;

    expect(getDragPayloadFromEvent(event)).toEqual({ type: 'library-item', id: 'native-item' });
  });

  it('keeps global drag payload available when dragend fires before native drop', () => {
    const data: Record<string, string> = {};
    setupDragData({
      dataTransfer: {
        setData: (type: string, value: string) => {
          data[type] = value;
        },
        effectAllowed: 'none',
      },
    } as unknown as DragEvent, 'library-item', 'global-item');

    clearGlobalDragPayload();
    const event = { dataTransfer: { getData: () => '' } } as unknown as DragEvent;
    expect(getDragPayloadFromEvent(event)).toEqual({ type: 'library-item', id: 'global-item' });
    expect(data['application/x-dnd-drag-payload']).toBe(JSON.stringify({ type: 'library-item', id: 'global-item' }));
    clearGlobalDragPayloadNow();
  });
});
