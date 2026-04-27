export type CarryingLoadTone = 'normal' | 'yellow' | 'orange' | 'red';

export const getCarryingLoadTone = (weight: number, capacity: number): CarryingLoadTone => {
  if (capacity <= 0) {
    return weight > 0 ? 'red' : 'normal';
  }

  const ratio = weight / capacity;

  if (ratio < 0.5) return 'normal';
  if (ratio < 0.75) return 'yellow';
  if (ratio <= 1) return 'orange';
  return 'red';
};
