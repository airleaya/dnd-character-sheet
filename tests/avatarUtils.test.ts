// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getAvatarSourceCrop,
  renderAvatarRenditionFromImage,
} from '../src/utils/avatarUtils';

const installCanvasMock = () => {
  const drawImage = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function toBlob(
    this: HTMLCanvasElement,
    callback: BlobCallback
  ) {
    callback(new Blob([`${this.width}x${this.height}`], { type: 'image/webp' }));
  });

  return { drawImage };
};

describe('avatarUtils', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps the saved avatar rendition at the source crop resolution', async () => {
    installCanvasMock();
    const image = {
      naturalWidth: 3000,
      naturalHeight: 4000,
    } as HTMLImageElement;

    const rendition = await renderAvatarRenditionFromImage(image, { zoom: 1, offsetX: 0, offsetY: 0 });

    expect(rendition.width).toBe(3000);
    expect(rendition.height).toBe(3994);
  });

  it('calculates crop dimensions from the original image pixels', () => {
    const crop = getAvatarSourceCrop(5000, 2500, { zoom: 2, offsetX: 120, offsetY: 0 });

    expect(Math.round(crop.sourceWidth)).toBe(939);
    expect(Math.round(crop.sourceHeight)).toBe(1250);
  });
});
