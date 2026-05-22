import type { CharacterAvatarSize } from '../types/Character';

export const AVATAR_OUTPUT_MIME = 'image/webp' as const;
export const AVATAR_OUTPUT_QUALITY = 0.84;
export const AVATAR_EDITOR_VIEWPORT = { width: 320, height: 426 };

export type CharacterAvatarPixelSpec = { width: number; height: number };

export const CHARACTER_AVATAR_DISPLAY_SPECS: Record<CharacterAvatarSize, CharacterAvatarPixelSpec> = {
  large: { width: 160, height: 213 },
  medium: { width: 80, height: 107 },
  small: { width: 40, height: 53 },
};

export const CHARACTER_AVATAR_SPECS = CHARACTER_AVATAR_DISPLAY_SPECS;

export interface AvatarRendition {
  bytes: Uint8Array;
  width: number;
  height: number;
}

export interface AvatarCropTransform {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export interface AvatarImagePlacement {
  displayWidth: number;
  displayHeight: number;
  left: number;
  top: number;
  maxOffsetX: number;
  maxOffsetY: number;
}

export interface AvatarSourceCrop {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
}

export const isSupportedAvatarMime = (mime: string): boolean =>
  ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(mime);

const blobToImage = (blob: Blob): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load avatar image'));
    };
    image.src = url;
  });

const canvasToBlob = (canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to encode avatar image'));
        return;
      }
      resolve(blob);
    }, mime, quality);
  });

export const getAvatarImagePlacement = (
  imageWidth: number,
  imageHeight: number,
  transform: AvatarCropTransform,
  viewport = AVATAR_EDITOR_VIEWPORT
): AvatarImagePlacement => {
  const baseScale = Math.max(viewport.width / imageWidth, viewport.height / imageHeight);
  const zoom = Math.max(1, transform.zoom);
  const displayWidth = imageWidth * baseScale * zoom;
  const displayHeight = imageHeight * baseScale * zoom;
  const maxOffsetX = Math.max(0, (displayWidth - viewport.width) / 2);
  const maxOffsetY = Math.max(0, (displayHeight - viewport.height) / 2);
  const offsetX = Math.min(Math.max(transform.offsetX, -maxOffsetX), maxOffsetX);
  const offsetY = Math.min(Math.max(transform.offsetY, -maxOffsetY), maxOffsetY);

  return {
    displayWidth,
    displayHeight,
    left: (viewport.width - displayWidth) / 2 + offsetX,
    top: (viewport.height - displayHeight) / 2 + offsetY,
    maxOffsetX,
    maxOffsetY,
  };
};

export const clampAvatarTransform = (
  imageWidth: number,
  imageHeight: number,
  transform: AvatarCropTransform,
  viewport = AVATAR_EDITOR_VIEWPORT
): AvatarCropTransform => {
  const placement = getAvatarImagePlacement(imageWidth, imageHeight, transform, viewport);
  return {
    zoom: Math.max(1, transform.zoom),
    offsetX: Math.min(Math.max(transform.offsetX, -placement.maxOffsetX), placement.maxOffsetX),
    offsetY: Math.min(Math.max(transform.offsetY, -placement.maxOffsetY), placement.maxOffsetY),
  };
};

export const getAvatarSourceCrop = (
  imageWidth: number,
  imageHeight: number,
  transform: AvatarCropTransform,
  viewport = AVATAR_EDITOR_VIEWPORT
): AvatarSourceCrop => {
  const placement = getAvatarImagePlacement(imageWidth, imageHeight, transform, viewport);
  const imageToViewportScale = placement.displayWidth / imageWidth;
  const sourceWidth = Math.min(imageWidth, viewport.width / imageToViewportScale);
  const sourceHeight = Math.min(imageHeight, viewport.height / imageToViewportScale);

  return {
    sourceX: Math.min(
      Math.max(0, -placement.left / imageToViewportScale),
      Math.max(0, imageWidth - sourceWidth)
    ),
    sourceY: Math.min(
      Math.max(0, -placement.top / imageToViewportScale),
      Math.max(0, imageHeight - sourceHeight)
    ),
    sourceWidth,
    sourceHeight,
  };
};

const renderCanvasToRendition = async (
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): Promise<AvatarRendition> => {
  const blob = await canvasToBlob(canvas, AVATAR_OUTPUT_MIME, AVATAR_OUTPUT_QUALITY);
  return {
    bytes: new Uint8Array(await blob.arrayBuffer()),
    width,
    height,
  };
};

export const renderAvatarPreviewRenditionFromImage = async (
  image: HTMLImageElement,
  transform: AvatarCropTransform,
  size: CharacterAvatarSize = 'large',
  viewport = AVATAR_EDITOR_VIEWPORT
): Promise<AvatarRendition> => {
  const spec = CHARACTER_AVATAR_DISPLAY_SPECS[size];
  const canvas = document.createElement('canvas');
  canvas.width = spec.width;
  canvas.height = spec.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas is unavailable');
  }

  const placement = getAvatarImagePlacement(image.naturalWidth, image.naturalHeight, transform, viewport);
  const scaleX = spec.width / viewport.width;
  const scaleY = spec.height / viewport.height;

  ctx.drawImage(
    image,
    placement.left * scaleX,
    placement.top * scaleY,
    placement.displayWidth * scaleX,
    placement.displayHeight * scaleY
  );

  return renderCanvasToRendition(canvas, spec.width, spec.height);
};

export const renderAvatarRenditionFromImage = async (
  image: HTMLImageElement,
  transform: AvatarCropTransform,
  viewport = AVATAR_EDITOR_VIEWPORT
): Promise<AvatarRendition> => {
  const sourceCrop = getAvatarSourceCrop(
    image.naturalWidth,
    image.naturalHeight,
    transform,
    viewport
  );
  const outputWidth = Math.max(1, Math.round(sourceCrop.sourceWidth));
  const outputHeight = Math.max(1, Math.round(sourceCrop.sourceHeight));
  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas is unavailable');
  }

  ctx.drawImage(
    image,
    sourceCrop.sourceX,
    sourceCrop.sourceY,
    sourceCrop.sourceWidth,
    sourceCrop.sourceHeight,
    0,
    0,
    outputWidth,
    outputHeight
  );

  return renderCanvasToRendition(canvas, outputWidth, outputHeight);
};

export const createAvatarRendition = async (
  file: File | Blob
): Promise<AvatarRendition> => {
  if ('type' in file && file.type && !isSupportedAvatarMime(file.type)) {
    throw new Error('Unsupported avatar image type');
  }

  const image = await blobToImage(file);
  return renderAvatarRenditionFromImage(image, { zoom: 1, offsetX: 0, offsetY: 0 });
};
