import { defineStore } from 'pinia';

interface TooltipData {
  title?: string;
  content: string;
}

export const useTooltipStore = defineStore('tooltip', {
  state: () => ({
    visible: false,
    data: { title: '', content: '' } as TooltipData,
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