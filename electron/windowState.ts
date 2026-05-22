export type WindowBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PersistedWindowState = WindowBounds & {
  isMaximized: boolean;
};

export type WindowStateSource = {
  isMaximized: () => boolean;
  getBounds: () => WindowBounds;
  getNormalBounds: () => WindowBounds;
};

export const resolveWindowStateToSave = (source: WindowStateSource): PersistedWindowState => {
  const isMaximized = source.isMaximized();
  const bounds = isMaximized ? source.getNormalBounds() : source.getBounds();

  return {
    ...bounds,
    isMaximized,
  };
};
