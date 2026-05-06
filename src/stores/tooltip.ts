import { defineStore } from 'pinia';

export interface TooltipSection {
  label?: string;
  items: string[];
}

export interface TooltipData {
  title?: string;
  content?: string;
  sections?: TooltipSection[];
}

export interface TooltipViewportPositionInput {
  x: number;
  y: number;
  tooltipWidth: number;
  tooltipHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  offset?: number;
  padding?: number;
}

export const DEFAULT_TOOLTIP_OFFSET = 15;
export const DEFAULT_TOOLTIP_PADDING = 12;
export const MIN_TOOLTIP_MAX_HEIGHT = 120;

export const getTooltipViewportMaxHeight = (
  viewportHeight: number,
  padding = DEFAULT_TOOLTIP_PADDING
) => Math.max(MIN_TOOLTIP_MAX_HEIGHT, viewportHeight - padding * 2);

let tooltipHideTimer: number | undefined;

const clearTooltipHideTimer = () => {
  if (tooltipHideTimer === undefined || typeof window === 'undefined') return;
  window.clearTimeout(tooltipHideTimer);
  tooltipHideTimer = undefined;
};

export const getTooltipViewportPosition = ({
  x,
  y,
  tooltipWidth,
  tooltipHeight,
  viewportWidth,
  viewportHeight,
  offset = DEFAULT_TOOLTIP_OFFSET,
  padding = DEFAULT_TOOLTIP_PADDING,
}: TooltipViewportPositionInput) => {
  const rawLeft = x + offset;
  const rawTop = y + offset;
  const maxLeft = Math.max(padding, viewportWidth - tooltipWidth - padding);
  const maxTop = Math.max(padding, viewportHeight - tooltipHeight - padding);

  return {
    left: Math.min(Math.max(rawLeft, padding), maxLeft),
    top: Math.min(Math.max(rawTop, padding), maxTop),
  };
};

export const useTooltipStore = defineStore('tooltip', {
  state: () => ({
    visible: false,
    data: { title: '', content: '', sections: [] } as TooltipData,
    x: 0,
    y: 0
  }),
  actions: {
    show(data: TooltipData, x: number, y: number) {
      clearTooltipHideTimer();
      this.data = data;
      this.x = x;
      this.y = y;
      this.visible = true;
    },
    hide() {
      clearTooltipHideTimer();
      this.visible = false;
    },
    hideSoon(delay = 180) {
      clearTooltipHideTimer();
      if (typeof window === 'undefined') {
        this.visible = false;
        return;
      }
      tooltipHideTimer = window.setTimeout(() => {
        this.visible = false;
        tooltipHideTimer = undefined;
      }, delay);
    },
    cancelHide() {
      clearTooltipHideTimer();
    },
    updatePosition(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
  }
});
