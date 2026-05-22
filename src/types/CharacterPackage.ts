import type { Character, CharacterAvatar, CharacterAvatarSize } from './Character';

export const CHARACTER_PACKAGE_EXTENSION = '.dndchar';
export const CHARACTER_PACKAGE_JSON_EXTENSION = '.json';
export const CHARACTER_PACKAGE_FORMAT = 'dnd-character-package';
export const CHARACTER_PACKAGE_VERSION = 2;
export const LEGACY_CHARACTER_PACKAGE_VERSION = 1;
export type CharacterPackageVersion =
  | typeof CHARACTER_PACKAGE_VERSION
  | typeof LEGACY_CHARACTER_PACKAGE_VERSION;

export interface CharacterPackageAsset {
  type: 'avatar';
  assetId: string;
  size: CharacterAvatarSize;
  path: string;
  encoding?: 'base64';
  mime: CharacterAvatar['mime'];
  sizeBytes: number;
  width: number;
  height: number;
}

export interface CharacterPackageManifest {
  format: typeof CHARACTER_PACKAGE_FORMAT;
  version: CharacterPackageVersion;
  exportedAt: number;
  characterId: string;
  preview?: {
    name: string;
    level: number;
    race: string;
    avatarPath?: string;
  };
  assets: CharacterPackageAsset[];
}

export interface CharacterPackageEmbeddedAsset extends CharacterPackageAsset {
  encoding: 'base64';
  dataBase64: string;
}

export interface CharacterPackagePayload {
  manifest: CharacterPackageManifest;
  character: Character;
  embeddedAssets: CharacterPackageEmbeddedAsset[];
}
