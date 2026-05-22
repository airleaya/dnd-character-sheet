// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDefaultCharacter } from '../src/utils/characterMigration';
import {
  createCharacterImportPreview,
  revokeImportPreview,
} from '../src/utils/characterPackagePreview';
import {
  CHARACTER_PACKAGE_FORMAT,
  CHARACTER_PACKAGE_VERSION,
  type CharacterPackagePayload,
} from '../src/types/CharacterPackage';

describe('character package import preview', () => {
  const createObjectURL = vi.fn(() => 'blob:preview-avatar');
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURL,
      configurable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeObjectURL,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads a single-file backup json and builds an avatar preview url', async () => {
    const character = createDefaultCharacter('preview-json-1');
    character.profile.name = 'Preview Hero';
    character.profile.level = 5;
    character.profile.race = 'Elf';

    const payload: CharacterPackagePayload = {
      manifest: {
        format: CHARACTER_PACKAGE_FORMAT,
        version: CHARACTER_PACKAGE_VERSION,
        exportedAt: 123,
        characterId: character.id,
        preview: {
          name: 'Preview Hero',
          level: 5,
          race: 'Elf',
          avatarPath: 'assets/avatar/large.webp',
        },
        assets: [
          {
            type: 'avatar',
            assetId: 'avatar-preview',
            size: 'large',
            path: 'assets/avatar/large.webp',
            encoding: 'base64',
            mime: 'image/webp',
            sizeBytes: 3,
            width: 160,
            height: 213,
          },
        ],
      },
      character,
      embeddedAssets: [
        {
          type: 'avatar',
          assetId: 'avatar-preview',
          size: 'large',
          path: 'assets/avatar/large.webp',
          encoding: 'base64',
          mime: 'image/webp',
          sizeBytes: 3,
          width: 160,
          height: 213,
          dataBase64: btoa(String.fromCharCode(1, 2, 3)),
        },
      ],
    };

    const file = new File([JSON.stringify(payload)], 'Preview_Hero_Lv5.json', {
      type: 'application/json',
    });
    const preview = await createCharacterImportPreview(file);

    expect(preview).toMatchObject({
      fileName: 'Preview_Hero_Lv5.json',
      format: 'backup-json',
      name: 'Preview Hero',
      level: 5,
      race: 'Elf',
      avatarObjectUrl: 'blob:preview-avatar',
    });
    expect(createObjectURL).toHaveBeenCalledTimes(1);

    revokeImportPreview(preview);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:preview-avatar');
  });

  it('reads a legacy bare character json without package metadata', async () => {
    const character = createDefaultCharacter('legacy-json-1');
    character.profile.name = 'Legacy Hero';
    character.profile.level = 2;
    character.profile.race = 'Human';
    character.profile.avatarUrl = 'blob:legacy-avatar';

    const file = new File([JSON.stringify(character)], 'legacy-hero.json', {
      type: 'application/json',
    });
    const preview = await createCharacterImportPreview(file);

    expect(preview).toEqual({
      fileName: 'legacy-hero.json',
      format: 'legacy-json',
      name: 'Legacy Hero',
      level: 2,
      race: 'Human',
      avatarObjectUrl: 'blob:legacy-avatar',
    });
    expect(createObjectURL).not.toHaveBeenCalled();
  });
});
