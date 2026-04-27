import { describe, expect, it } from 'vitest';
import { formatContainerCapacity } from '../src/utils/containerCapacity';
import type { InventoryItem } from '../src/types/Item';

const container = (data: InventoryItem['data']): InventoryItem => ({
  instanceId: 'container-1',
  templateId: 'backpack',
  name: '背包',
  description: '',
  weight: 5,
  quantity: 1,
  type: 'container',
  data,
});

describe('formatContainerCapacity', () => {
  it('preserves both weight and volume capacity descriptions', () => {
    expect(formatContainerCapacity(container({ capacityWeight: 30, capacityVolume: '1立方尺' }))).toBe('30 lb；1立方尺');
  });

  it('formats single capacity descriptions without inventing another capacity', () => {
    expect(formatContainerCapacity(container({ capacityVolume: '40加仑液体，4立方尺固体' }))).toBe('40加仑液体，4立方尺固体');
    expect(formatContainerCapacity(container({ capacityWeight: 6 }))).toBe('6 lb');
  });

  it('also formats library container capacity fields stored on the item root', () => {
    expect(
      formatContainerCapacity({
        type: 'container',
        capacityWeight: 30,
        capacityVolume: '1立方尺',
      })
    ).toBe('30 lb；1立方尺');
  });
});
