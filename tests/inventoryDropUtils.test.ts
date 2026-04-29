import { describe, expect, it } from 'vitest';
import { parseDragPayload } from '../src/utils/inventoryDropUtils';

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
});
