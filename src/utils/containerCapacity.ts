type ContainerCapacityLike = {
  type?: string;
  data?: Record<string, unknown>;
  capacityWeight?: number;
  capacityVolume?: string;
};

const getCapacityData = (item: ContainerCapacityLike): Record<string, unknown> => ({
  ...(item.data ?? {}),
  capacityWeight: item.data?.capacityWeight ?? item.capacityWeight,
  capacityVolume: item.data?.capacityVolume ?? item.capacityVolume,
});

const hasCapacityWeight = (data: Record<string, unknown>): data is Record<string, unknown> & { capacityWeight: number } =>
  typeof data.capacityWeight === 'number';

const hasCapacityVolume = (data: Record<string, unknown>): data is Record<string, unknown> & { capacityVolume: string } =>
  typeof data.capacityVolume === 'string' && data.capacityVolume.trim().length > 0;

export const formatContainerCapacity = (item: ContainerCapacityLike): string => {
  if (item.type !== 'container') {
    return '';
  }

  const data = getCapacityData(item);
  const parts: string[] = [];

  if (hasCapacityWeight(data)) {
    parts.push(`${data.capacityWeight} lb`);
  }

  if (hasCapacityVolume(data)) {
    parts.push(data.capacityVolume.trim());
  }

  return parts.length > 0 ? parts.join('；') : '未知';
};
