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
      this.data = data;
      this.x = x;
      this.y = y;
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    updatePosition(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
  }
});
