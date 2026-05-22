import fs from 'fs';
import path from 'path';
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import type { Character } from '../src/types/Character';
import {
  CHARACTER_PACKAGE_JSON_EXTENSION,
  CHARACTER_PACKAGE_FORMAT,
  CHARACTER_PACKAGE_VERSION,
  LEGACY_CHARACTER_PACKAGE_VERSION,
  type CharacterPackageEmbeddedAsset,
  type CharacterPackageManifest,
  type CharacterPackagePayload,
} from '../src/types/CharacterPackage';
import { AVATAR_OUTPUT_MIME, CHARACTER_AVATAR_DISPLAY_SPECS } from '../src/utils/avatarUtils';
import {
  copyImportedAvatarAsset,
  getAvatarRenditionPath,
  type AvatarAssetPaths,
} from './avatarAssets';

export interface CharacterPackageImportResult {
  character: Character;
  importedFromPackage: boolean;
}

const CHARACTER_JSON_PATH = 'character.json';
const MANIFEST_JSON_PATH = 'manifest.json';
const AVATAR_LARGE_PATH = 'assets/avatar/large.webp';

const safeExportName = (name: string): string =>
  (name || 'Unnamed').replace(/[\\/:*?"<>|]/g, '_');

const parseJsonBytes = <T>(bytes: Uint8Array): T => JSON.parse(strFromU8(bytes)) as T;

const bytesToBase64 = (bytes: Uint8Array): string =>
  Buffer.from(bytes).toString('base64');

const base64ToBytes = (base64: string): Uint8Array =>
  new Uint8Array(Buffer.from(base64, 'base64'));

const cloneCharacterForExport = (character: Character): Character =>
  JSON.parse(JSON.stringify(character)) as Character;

const stripMissingAvatar = (character: Character): Character => {
  const clone = cloneCharacterForExport(character);
  delete clone.profile.avatar;
  return clone;
};

export const buildCharacterPackageFilename = (character: Character): string =>
  `${safeExportName(character.profile.name)}_Lv${character.profile.level}${CHARACTER_PACKAGE_JSON_EXTENSION}`;

export const createCharacterPackage = (
  paths: AvatarAssetPaths,
  character: Character
): Uint8Array => {
  const avatar = character.profile.avatar;
  const avatarPath = avatar
    ? getAvatarRenditionPath(paths, character.id, avatar.assetId, 'large')
    : null;
  const hasAvatarFile = Boolean(avatarPath && fs.existsSync(avatarPath));
  const exportCharacter = hasAvatarFile ? cloneCharacterForExport(character) : stripMissingAvatar(character);
  const assets: CharacterPackageManifest['assets'] = [];
  const embeddedAssets: CharacterPackageEmbeddedAsset[] = [];

  if (hasAvatarFile && avatar) {
    const bytes = fs.readFileSync(avatarPath!);
    const spec = avatar.sizes.large ?? CHARACTER_AVATAR_DISPLAY_SPECS.large;
    const asset: CharacterPackageEmbeddedAsset = {
      type: 'avatar',
      assetId: avatar.assetId,
      size: 'large',
      path: AVATAR_LARGE_PATH,
      encoding: 'base64',
      mime: AVATAR_OUTPUT_MIME,
      sizeBytes: bytes.byteLength,
      width: spec.width,
      height: spec.height,
      dataBase64: bytesToBase64(bytes),
    };
    const { dataBase64: _dataBase64, ...manifestAsset } = asset;
    assets.push(manifestAsset);
    embeddedAssets.push(asset);
  }

  const manifest: CharacterPackageManifest = {
    format: CHARACTER_PACKAGE_FORMAT,
    version: CHARACTER_PACKAGE_VERSION,
    exportedAt: Date.now(),
    characterId: character.id,
    preview: {
      name: character.profile.name,
      level: character.profile.level,
      race: character.profile.race,
      ...(hasAvatarFile ? { avatarPath: AVATAR_LARGE_PATH } : {}),
    },
    assets,
  };

  const payload: CharacterPackagePayload = {
    manifest,
    character: exportCharacter,
    embeddedAssets,
  };

  return strToU8(JSON.stringify(payload, null, 2));
};

const createLegacyZipCharacterPackage = (
  paths: AvatarAssetPaths,
  character: Character
): Uint8Array => {
  const avatar = character.profile.avatar;
  const avatarPath = avatar
    ? getAvatarRenditionPath(paths, character.id, avatar.assetId, 'large')
    : null;
  const hasAvatarFile = Boolean(avatarPath && fs.existsSync(avatarPath));
  const exportCharacter = hasAvatarFile ? cloneCharacterForExport(character) : stripMissingAvatar(character);
  const assets: CharacterPackageManifest['assets'] = [];
  const zipEntries: Record<string, Uint8Array> = {};

  if (hasAvatarFile && avatar) {
    const bytes = fs.readFileSync(avatarPath!);
    const spec = avatar.sizes.large ?? CHARACTER_AVATAR_DISPLAY_SPECS.large;
    assets.push({
      type: 'avatar',
      assetId: avatar.assetId,
      size: 'large',
      path: AVATAR_LARGE_PATH,
      mime: AVATAR_OUTPUT_MIME,
      sizeBytes: bytes.byteLength,
      width: spec.width,
      height: spec.height,
    });
    zipEntries[AVATAR_LARGE_PATH] = bytes;
  }

  const manifest: CharacterPackageManifest = {
    format: CHARACTER_PACKAGE_FORMAT,
    version: LEGACY_CHARACTER_PACKAGE_VERSION,
    exportedAt: Date.now(),
    characterId: character.id,
    assets,
  };

  zipEntries[MANIFEST_JSON_PATH] = strToU8(JSON.stringify(manifest, null, 2));
  zipEntries[CHARACTER_JSON_PATH] = strToU8(JSON.stringify(exportCharacter, null, 2));

  return zipSync(zipEntries, { level: 6 });
};

export const writeCharacterPackage = (
  paths: AvatarAssetPaths,
  targetDir: string,
  character: Character
): string => {
  const filename = buildCharacterPackageFilename(character);
  const fullPath = path.join(targetDir, filename);
  fs.writeFileSync(fullPath, Buffer.from(createCharacterPackage(paths, character)));
  return filename;
};

export const importCharacterPackage = (
  paths: AvatarAssetPaths,
  bytes: Uint8Array,
  newCharacterId: string
): CharacterPackageImportResult => {
  const trimmed = strFromU8(bytes).trimStart();
  if (trimmed.startsWith('{')) {
    return importJsonCharacterPackage(paths, bytes, newCharacterId);
  }

  try {
    return importLegacyZipCharacterPackage(paths, bytes, newCharacterId);
  } catch (error) {
    throw new Error(`Invalid character package: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const importJsonCharacterPackage = (
  paths: AvatarAssetPaths,
  bytes: Uint8Array,
  newCharacterId: string
): CharacterPackageImportResult => {
  const payload = parseJsonBytes<CharacterPackagePayload>(bytes);
  if (
    payload.manifest?.format !== CHARACTER_PACKAGE_FORMAT ||
    payload.manifest.version !== CHARACTER_PACKAGE_VERSION ||
    !payload.character
  ) {
    throw new Error('Unsupported character package');
  }

  const character = payload.character;
  character.id = newCharacterId;
  character.lastModified = Date.now();

  const avatarAsset = payload.embeddedAssets?.find(asset => asset.type === 'avatar' && asset.size === 'large');
  if (avatarAsset?.dataBase64) {
    character.profile.avatar = copyImportedAvatarAsset(
      paths,
      newCharacterId,
      base64ToBytes(avatarAsset.dataBase64),
      avatarAsset.assetId,
      { width: avatarAsset.width, height: avatarAsset.height }
    );
  } else {
    delete character.profile.avatar;
  }

  return { character, importedFromPackage: true };
};

const importLegacyZipCharacterPackage = (
  paths: AvatarAssetPaths,
  bytes: Uint8Array,
  newCharacterId: string
): CharacterPackageImportResult => {
  const entries = unzipSync(bytes);
  const manifestBytes = entries[MANIFEST_JSON_PATH];
  const characterBytes = entries[CHARACTER_JSON_PATH];

  if (!manifestBytes || !characterBytes) {
    throw new Error('Invalid character package');
  }

  const manifest = parseJsonBytes<CharacterPackageManifest>(manifestBytes);
  if (manifest.format !== CHARACTER_PACKAGE_FORMAT || manifest.version !== LEGACY_CHARACTER_PACKAGE_VERSION) {
    throw new Error('Unsupported character package');
  }

  const character = parseJsonBytes<Character>(characterBytes);
  character.id = newCharacterId;
  character.lastModified = Date.now();

  const avatarAsset = manifest.assets.find(asset => asset.type === 'avatar' && asset.size === 'large');
  const avatarBytes = avatarAsset ? entries[avatarAsset.path] : undefined;
  if (avatarAsset && avatarBytes) {
    character.profile.avatar = copyImportedAvatarAsset(
      paths,
      newCharacterId,
      avatarBytes,
      avatarAsset.assetId,
      { width: avatarAsset.width, height: avatarAsset.height }
    );
  } else {
    delete character.profile.avatar;
  }

  return { character, importedFromPackage: true };
};

export const createLegacyCharacterPackageForTests = createLegacyZipCharacterPackage;

export const readLegacyCharacterJson = (
  content: string,
  newCharacterId: string
): CharacterPackageImportResult => {
  const character = JSON.parse(content) as Character;
  character.id = newCharacterId;
  character.lastModified = Date.now();
  return { character, importedFromPackage: false };
};
