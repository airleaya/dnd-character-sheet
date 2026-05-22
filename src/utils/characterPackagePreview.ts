import { strFromU8, unzipSync } from 'fflate';
import type { Character } from '../types/Character';
import {
  CHARACTER_PACKAGE_FORMAT,
  type CharacterPackageEmbeddedAsset,
  type CharacterPackagePayload,
} from '../types/CharacterPackage';

export interface CharacterImportPreview {
  fileName: string;
  format: 'backup-json' | 'legacy-json' | 'legacy-dndchar';
  name: string;
  level: number;
  race: string;
  avatarObjectUrl: string | null;
}

const CHARACTER_JSON_PATH = 'character.json';
const MANIFEST_JSON_PATH = 'manifest.json';

const base64ToUint8Array = (base64: string): Uint8Array => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};

const bytesToObjectUrl = (bytes: Uint8Array, mime: string): string => {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return URL.createObjectURL(new Blob([copy], { type: mime }));
};

const createAvatarPreviewUrl = (asset?: CharacterPackageEmbeddedAsset): string | null => {
  if (!asset?.dataBase64) return null;
  return bytesToObjectUrl(base64ToUint8Array(asset.dataBase64), asset.mime);
};

const readCharacterSummary = (character: Character) => ({
  name: character.profile?.name || '未命名角色',
  level: character.profile?.level || 1,
  race: character.profile?.race || '未知种族',
});

export const revokeImportPreview = (preview: CharacterImportPreview | null) => {
  if (preview?.avatarObjectUrl) {
    URL.revokeObjectURL(preview.avatarObjectUrl);
  }
};

export const createCharacterImportPreview = async (file: File): Promise<CharacterImportPreview> => {
  const isLegacyDndchar = file.name.toLowerCase().endsWith('.dndchar');
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (isLegacyDndchar) {
    const entries = unzipSync(bytes);
    const characterBytes = entries[CHARACTER_JSON_PATH];
    const manifestBytes = entries[MANIFEST_JSON_PATH];
    if (!characterBytes || !manifestBytes) {
      throw new Error('无效的旧版角色备份');
    }

    const character = JSON.parse(strFromU8(characterBytes)) as Character;
    return {
      fileName: file.name,
      format: 'legacy-dndchar',
      avatarObjectUrl: null,
      ...readCharacterSummary(character),
    };
  }

  const text = strFromU8(bytes);
  const parsed = JSON.parse(text) as Partial<CharacterPackagePayload> | Character;
  if (
    'manifest' in parsed &&
    parsed.manifest?.format === CHARACTER_PACKAGE_FORMAT &&
    'character' in parsed &&
    parsed.character
  ) {
    const avatarAsset = parsed.embeddedAssets?.find(asset => asset.type === 'avatar' && asset.size === 'large');
    const summary = parsed.manifest.preview ?? readCharacterSummary(parsed.character);
    return {
      fileName: file.name,
      format: 'backup-json',
      name: summary.name,
      level: summary.level,
      race: summary.race,
      avatarObjectUrl: createAvatarPreviewUrl(avatarAsset),
    };
  }

  const character = parsed as Character;
  if (!character.profile) {
    throw new Error('无效的角色 JSON');
  }

  return {
    fileName: file.name,
    format: 'legacy-json',
    avatarObjectUrl: character.profile.avatarUrl ?? null,
    ...readCharacterSummary(character),
  };
};
