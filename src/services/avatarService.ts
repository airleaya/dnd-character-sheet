import type { Character, CharacterAvatar, CharacterAvatarSize } from '../types/Character';
import { createAvatarRendition, type AvatarRendition } from '../utils/avatarUtils';

const ensureElectronApi = () => {
  if (!window.electronAPI) {
    throw new Error('Electron API is unavailable');
  }

  return window.electronAPI;
};

const toUint8Array = (bytes: Uint8Array | ArrayBuffer): Uint8Array =>
  bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
};

export const avatarService = {
  async saveAvatar(character: Character, file: File): Promise<CharacterAvatar> {
    const rendition = await createAvatarRendition(file);
    return this.saveAvatarRendition(character, rendition);
  },

  async saveAvatarBytes(character: Character, bytes: Uint8Array): Promise<CharacterAvatar> {
    return this.saveAvatarRendition(character, {
      bytes,
      width: character.profile.avatar?.sizes.large?.width ?? 160,
      height: character.profile.avatar?.sizes.large?.height ?? 213,
    });
  },

  async saveAvatarRendition(character: Character, rendition: AvatarRendition): Promise<CharacterAvatar> {
    const api = ensureElectronApi();
    if (!api.saveCharacterAvatar) {
      throw new Error('Avatar save API is unavailable');
    }

    const result = await api.saveCharacterAvatar(
      character.id,
      rendition.bytes,
      { width: rendition.width, height: rendition.height },
      character.profile.avatar?.assetId
    );
    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  },

  async deleteAvatar(character: Character): Promise<void> {
    const api = ensureElectronApi();
    if (!api.deleteCharacterAvatar) return;

    const result = await api.deleteCharacterAvatar(character.id, character.profile.avatar?.assetId);
    if (!result.success) {
      throw new Error(result.error);
    }
  },

  async readAvatarObjectUrl(
    characterId: string,
    avatar: CharacterAvatar,
    size: CharacterAvatarSize = 'large'
  ): Promise<string | null> {
    const api = ensureElectronApi();
    if (!api.readCharacterAvatar) return null;

    const result = await api.readCharacterAvatar(characterId, avatar.assetId, size);
    if (!result.success) {
      throw new Error(result.error);
    }

    if (!result.data) return null;
    const bytes = toUint8Array(result.data.bytes);
    const blob = new Blob([toArrayBuffer(bytes)], {
      type: result.data.mime,
    });
    return URL.createObjectURL(blob);
  },
};
