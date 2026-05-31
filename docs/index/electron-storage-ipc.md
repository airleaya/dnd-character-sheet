# Electron, Storage, And IPC Index

## Purpose

Electron is the only layer that touches local files directly. It owns persistent storage roots, compatibility migration, native dialogs, character export/import, avatar assets, data-pack files, logs, and window state.

## Core Entry Points

- `electron/main.ts` registers IPC handlers and owns storage/data-pack helpers.
- `electron/preload.ts` exposes a safe renderer API through `contextBridge`.
- `src/types/electron.ts` defines the renderer-visible API and IPC result types.
- `electron/avatarAssets.ts` saves, reads, replaces, and deletes avatar WebP assets.
- `electron/characterPackage.ts` creates/imports visible JSON character backups and legacy `.dndchar` packages.
- `electron/windowState.ts` decides whether to persist normal or maximized window bounds.
- `electron/logger.ts` writes local JSONL logs and cleans old log files.

## Storage Layout

- Characters live under Electron user data in `dnd_5e_characters/characters/`.
- Imported data packs live under `dnd_5e_characters/data-packs/imported/`.
- Avatar assets live under `dnd_5e_characters/assets/avatars/<characterId>/<assetId>/`.
- Logs live under Electron `userData/logs/`.
- Legacy storage roots are still read for migration and compatibility where supported.

## IPC Responsibilities

- Character files: load all, save one, delete one.
- Character groups: read/write group state.
- Character backup: export single visible JSON backup and import JSON or legacy package bytes.
- Avatar assets: save large rendition, read rendition, save generated rendition, delete asset.
- Data packs: import/export/delete, read/update settings, unlock progress, editable pack read/write, local editor id hash.
- Window/app: zoom factor, directory selection, close confirmation, logging.

## Change Risks

- Any preload API change must update `src/types/electron.ts` and `tests/preload.test.ts`.
- IPC results should keep using `IpcResult<T>` / `IpcVoidResult`; do not return ad hoc shapes.
- Never write full character JSON, full data-pack content, avatar bytes, or passphrases into logs.
- Character backup import must keep supporting current visible JSON backups, old bare JSON, and old zipped `.dndchar` packages.
- Window state must save normal bounds when maximized, not the maximized screen size.

## Related Tests

- `tests/preload.test.ts`
- `tests/storageService.test.ts`
- `tests/characterPackage.test.ts`
- `tests/windowState.test.ts`
- `tests/logging.test.ts`
- `tests/dataPackRuntime.test.ts`
- `tests/dataPackUtils.test.ts`
