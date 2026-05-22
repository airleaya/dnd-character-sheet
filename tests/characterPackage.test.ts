import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createDefaultCharacter } from '../src/utils/characterMigration';
import {
  buildCharacterPackageFilename,
  createCharacterPackage,
  createLegacyCharacterPackageForTests,
  importCharacterPackage,
  writeCharacterPackage,
} from '../electron/characterPackage';
import { saveCharacterAvatarAsset } from '../electron/avatarAssets';
import type { CharacterPackagePayload } from '../src/types/CharacterPackage';

const tempRoots: string[] = [];

const makeTempRoot = (): string => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dnd-avatar-package-'));
  tempRoots.push(root);
  return root;
};

const readPackageJson = (bytes: Uint8Array): CharacterPackagePayload =>
  JSON.parse(Buffer.from(bytes).toString('utf-8')) as CharacterPackagePayload;

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

describe('character package export and import', () => {
  it('uses a plain json filename for new single-file backups', () => {
    const storageRoot = makeTempRoot();
    const exportRoot = makeTempRoot();
    const character = createDefaultCharacter('json-filename-1');
    character.profile.name = 'Json Hero';
    character.profile.level = 3;

    expect(buildCharacterPackageFilename(character)).toBe('Json Hero_Lv3.json');
    const filename = writeCharacterPackage({ storageRoot }, exportRoot, character);

    expect(filename).toBe('Json Hero_Lv3.json');
    expect(fs.readFileSync(path.join(exportRoot, filename), 'utf-8').trim().startsWith('{')).toBe(true);
  });

  it('exports a single json backup without avatar assets for avatarless characters', () => {
    const storageRoot = makeTempRoot();
    const character = createDefaultCharacter('avatarless-1');
    character.profile.name = 'Avatarless';

    const bytes = createCharacterPackage({ storageRoot }, character);
    const text = Buffer.from(bytes).toString('utf-8');
    const payload = readPackageJson(bytes);

    expect(text.trim().startsWith('{')).toBe(true);
    expect(text.lastIndexOf('"embeddedAssets"')).toBeGreaterThan(text.lastIndexOf('"character"'));
    expect(payload.manifest.format).toBe('dnd-character-package');
    expect(payload.manifest.version).toBe(2);
    expect(payload.manifest.preview).toEqual({
      name: 'Avatarless',
      level: character.profile.level,
      race: character.profile.race,
    });
    expect(payload.manifest.assets).toEqual([]);
    expect(payload.character.profile.avatar).toBeUndefined();
    expect(payload.embeddedAssets).toEqual([]);
  });

  it('exports the large avatar rendition as base64 at the end of the visible backup json', () => {
    const storageRoot = makeTempRoot();
    const character = createDefaultCharacter('avatar-1');
    const avatarBytes = new Uint8Array([1, 2, 3, 4, 5]);
    character.profile.avatar = saveCharacterAvatarAsset(
      { storageRoot },
      { characterId: character.id, bytes: avatarBytes, dimensions: { width: 1234, height: 1642 } }
    );
    expect(character.profile.avatar.sizes.large).toMatchObject({
      width: 1234,
      height: 1642,
      sizeBytes: avatarBytes.byteLength,
    });

    const packageBytes = createCharacterPackage({ storageRoot }, character);
    const packageText = Buffer.from(packageBytes).toString('utf-8');
    const payload = readPackageJson(packageBytes);

    expect(packageText.lastIndexOf('"embeddedAssets"')).toBeGreaterThan(packageText.lastIndexOf('"character"'));
    expect(payload.manifest.assets).toHaveLength(1);
    expect(payload.manifest.preview).toEqual({
      name: character.profile.name,
      level: character.profile.level,
      race: character.profile.race,
      avatarPath: 'assets/avatar/large.webp',
    });
    expect(payload.manifest.assets[0]).toMatchObject({
      path: 'assets/avatar/large.webp',
      encoding: 'base64',
      size: 'large',
      width: 1234,
      height: 1642,
      sizeBytes: avatarBytes.byteLength,
    });
    expect(payload.embeddedAssets).toHaveLength(1);
    expect(payload.embeddedAssets[0]).toMatchObject({
      path: 'assets/avatar/large.webp',
      encoding: 'base64',
      size: 'large',
      width: 1234,
      height: 1642,
      sizeBytes: avatarBytes.byteLength,
      dataBase64: Buffer.from(avatarBytes).toString('base64'),
    });

    const imported = importCharacterPackage({ storageRoot }, packageBytes, 'avatar-imported');
    expect(imported.character.id).toBe('avatar-imported');
    expect(imported.character.profile.avatar?.assetId).toBe(character.profile.avatar.assetId);
    expect(imported.character.profile.avatar?.sizes.large).toMatchObject({
      width: 1234,
      height: 1642,
      sizeBytes: avatarBytes.byteLength,
    });

    const importedPath = path.join(
      storageRoot,
      'assets',
      'avatars',
      'avatar-imported',
      character.profile.avatar.assetId,
      'large.webp'
    );
    expect(fs.readFileSync(importedPath)).toEqual(Buffer.from(avatarBytes));
  });

  it('continues to import legacy zipped dndchar packages', () => {
    const storageRoot = makeTempRoot();
    const character = createDefaultCharacter('legacy-avatar-1');
    const avatarBytes = new Uint8Array([9, 8, 7, 6]);
    character.profile.avatar = saveCharacterAvatarAsset(
      { storageRoot },
      { characterId: character.id, bytes: avatarBytes, dimensions: { width: 320, height: 426 } }
    );

    const legacyPackageBytes = createLegacyCharacterPackageForTests({ storageRoot }, character);
    const imported = importCharacterPackage({ storageRoot }, legacyPackageBytes, 'legacy-imported');

    expect(imported.character.id).toBe('legacy-imported');
    expect(imported.character.profile.avatar?.sizes.large).toMatchObject({
      width: 320,
      height: 426,
      sizeBytes: avatarBytes.byteLength,
    });

    const importedPath = path.join(
      storageRoot,
      'assets',
      'avatars',
      'legacy-imported',
      character.profile.avatar.assetId,
      'large.webp'
    );
    expect(fs.readFileSync(importedPath)).toEqual(Buffer.from(avatarBytes));
  });
});
