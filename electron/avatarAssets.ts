import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { CharacterAvatar, CharacterAvatarSize, CharacterAvatarSizeMeta } from '../src/types/Character';
import { AVATAR_OUTPUT_MIME, CHARACTER_AVATAR_DISPLAY_SPECS } from '../src/utils/avatarUtils';

export interface AvatarAssetPaths {
  storageRoot: string;
}

export interface SaveAvatarInput {
  characterId: string;
  bytes: Uint8Array;
  dimensions?: AvatarDimensions;
  previousAssetId?: string;
}

export interface AvatarReadResult {
  mime: CharacterAvatar['mime'];
  bytes: Uint8Array;
}

const AVATAR_FILE_EXTENSION = '.webp';

export interface AvatarDimensions {
  width: number;
  height: number;
}

const normalizeAvatarDimensions = (
  dimensions: AvatarDimensions | undefined,
  size: CharacterAvatarSize
): AvatarDimensions => {
  const fallback = CHARACTER_AVATAR_DISPLAY_SPECS[size];
  const width = Math.round(Number(dimensions?.width));
  const height = Math.round(Number(dimensions?.height));
  return {
    width: Number.isFinite(width) && width > 0 ? width : fallback.width,
    height: Number.isFinite(height) && height > 0 ? height : fallback.height,
  };
};

const createAvatarSizeMeta = (
  bytes: Uint8Array,
  size: CharacterAvatarSize,
  dimensions?: AvatarDimensions
): CharacterAvatarSizeMeta => ({
  ...normalizeAvatarDimensions(dimensions, size),
  sizeBytes: bytes.byteLength,
});

const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const getAvatarRoot = ({ storageRoot }: AvatarAssetPaths): string =>
  path.join(storageRoot, 'assets', 'avatars');

const sanitizePathSegment = (segment: string): string =>
  segment.replace(/[^a-zA-Z0-9_-]/g, '_');

const getCharacterAvatarRoot = (paths: AvatarAssetPaths, characterId: string): string =>
  path.join(getAvatarRoot(paths), sanitizePathSegment(characterId));

export const getAvatarAssetDir = (
  paths: AvatarAssetPaths,
  characterId: string,
  assetId: string
): string => path.join(getCharacterAvatarRoot(paths, characterId), sanitizePathSegment(assetId));

export const getAvatarRenditionPath = (
  paths: AvatarAssetPaths,
  characterId: string,
  assetId: string,
  size: CharacterAvatarSize = 'large'
): string => path.join(getAvatarAssetDir(paths, characterId, assetId), `${size}${AVATAR_FILE_EXTENSION}`);

export const saveCharacterAvatarAsset = (
  paths: AvatarAssetPaths,
  input: SaveAvatarInput
): CharacterAvatar => {
  const assetId = `avatar_${crypto.randomUUID()}`;
  const assetDir = getAvatarAssetDir(paths, input.characterId, assetId);

  if (input.previousAssetId) {
    deleteCharacterAvatarAsset(paths, input.characterId, input.previousAssetId);
  }

  ensureDirectoryExists(assetDir);
  fs.writeFileSync(getAvatarRenditionPath(paths, input.characterId, assetId, 'large'), Buffer.from(input.bytes));

  return {
    assetId,
    mime: AVATAR_OUTPUT_MIME,
    sizes: {
      large: createAvatarSizeMeta(input.bytes, 'large', input.dimensions),
    },
    updatedAt: Date.now(),
  };
};

export const readCharacterAvatarAsset = (
  paths: AvatarAssetPaths,
  characterId: string,
  assetId: string,
  size: CharacterAvatarSize = 'large'
): AvatarReadResult | null => {
  const filePath = getAvatarRenditionPath(paths, characterId, assetId, size);
  if (!fs.existsSync(filePath)) return null;

  return {
    mime: AVATAR_OUTPUT_MIME,
    bytes: fs.readFileSync(filePath),
  };
};

export const writeAvatarRenditionAsset = (
  paths: AvatarAssetPaths,
  characterId: string,
  assetId: string,
  size: CharacterAvatarSize,
  bytes: Uint8Array,
  dimensions?: AvatarDimensions
): CharacterAvatar['sizes'][CharacterAvatarSize] => {
  const assetDir = getAvatarAssetDir(paths, characterId, assetId);
  ensureDirectoryExists(assetDir);
  fs.writeFileSync(getAvatarRenditionPath(paths, characterId, assetId, size), Buffer.from(bytes));

  return createAvatarSizeMeta(bytes, size, dimensions);
};

export const deleteCharacterAvatarAsset = (
  paths: AvatarAssetPaths,
  characterId: string,
  assetId?: string
): void => {
  const target = assetId
    ? getAvatarAssetDir(paths, characterId, assetId)
    : getCharacterAvatarRoot(paths, characterId);

  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
};

export const copyImportedAvatarAsset = (
  paths: AvatarAssetPaths,
  characterId: string,
  bytes: Uint8Array,
  sourceAssetId?: string,
  dimensions?: AvatarDimensions
): CharacterAvatar => {
  const assetId = sourceAssetId ? sanitizePathSegment(sourceAssetId) : `avatar_${crypto.randomUUID()}`;
  const assetDir = getAvatarAssetDir(paths, characterId, assetId);
  ensureDirectoryExists(assetDir);
  fs.writeFileSync(getAvatarRenditionPath(paths, characterId, assetId, 'large'), Buffer.from(bytes));

  return {
    assetId,
    mime: AVATAR_OUTPUT_MIME,
    sizes: {
      large: createAvatarSizeMeta(bytes, 'large', dimensions),
    },
    updatedAt: Date.now(),
  };
};
