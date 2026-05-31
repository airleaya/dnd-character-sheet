# Character Avatar And Backup Index

## Purpose

Character avatars are user assets attached to character saves and portable backups. The current design keeps normal character JSON light during daily saves, stores avatar files locally, and embeds avatar bytes only when exporting a backup JSON.

## Core Entry Points

- `src/components/sheet/bio/HeaderInfo.vue` exposes avatar upload, display, replace, delete, and editor launch.
- `src/components/sheet/bio/AvatarEditorModal.vue` handles crop, zoom, and large/medium/small previews.
- `src/utils/avatarUtils.ts` owns avatar specs, supported MIME checks, crop math, and canvas rendering.
- `src/services/avatarService.ts` bridges renderer avatar actions to Electron IPC.
- `electron/avatarAssets.ts` stores real WebP files and metadata.
- `electron/characterPackage.ts` creates/imports character backup JSON and legacy packages.
- `src/utils/characterPackagePreview.ts` reads import previews before the user confirms import.

## Data Shape

- `profile.avatar` stores metadata: asset id, MIME, size specs, byte sizes, timestamps, and known renditions.
- `profile.avatarUrl` remains as a legacy compatibility field.
- Local asset files are stored outside the character JSON under the Electron user-data storage root.
- Exported backup JSON contains `manifest`, `character`, and trailing `embeddedAssets`.
- Avatar bytes are base64 inside `embeddedAssets`; this affects backup size but not normal autosave size.

## Import And Export Flow

- Export always creates a single visible `.json` backup, not a zipped `.dndchar`.
- Avatarless characters still export with the backup wrapper shape.
- New backup JSON imports through Electron package import and restores avatar files.
- Old bare character JSON remains importable.
- Old zipped `.dndchar` remains importable for compatibility.
- Sidebar import shows a preview modal before writing anything to the store.

## Change Risks

- Do not reintroduce long-term base64 storage into normal character save files.
- Do not remove legacy JSON or legacy `.dndchar` import compatibility.
- Preserve object URL cleanup in header, sidebar avatar display, and import preview.
- If adding medium/small file generation later, keep large as the source of truth unless a new design says otherwise.

## Related Tests

- `tests/avatarUtils.test.ts`
- `tests/avatarEditorModal.ui.test.ts`
- `tests/characterPackage.test.ts`
- `tests/characterPackagePreview.test.ts`
- `tests/sidebarLeftTheme.ui.test.ts`
- `tests/characterStore.test.ts`
