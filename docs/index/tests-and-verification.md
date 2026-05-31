# Tests And Verification Index

## Purpose

Use this page to choose the smallest useful verification path for a change. CI currently expects typecheck, lint, tests, and build, but local work can run narrower tests first.

## Main Commands

- `npm run typecheck` - Vue/TypeScript type validation.
- `npm run test` - full Vitest suite.
- `npm run build` - Vite and Electron builder production build.
- `npm run lint` - ESLint validation.
- `npm run audit:item-library` - focused item-library audit script.
- `git diff --check` - whitespace/conflict marker sanity check.

## Test Map By Area

- App shell and startup: `appRoot.smoke`, `activeSheet.integration`, `sidebarLeftTheme.ui`.
- Character persistence and migration: `characterStore`, `characterMigration`, `storageService`.
- Electron/preload/window/logging: `preload`, `windowState`, `logging`.
- Avatar and backups: `avatarUtils`, `avatarEditorModal.ui`, `characterPackage`, `characterPackagePreview`.
- Bio/combat/spells: `useBioLogic`, `useCombatLogic`, `combatPanelJack.ui`, `actionsPanel.ui`, `useSpellLogic`, `spellRitualBadges.ui`.
- Inventory/forge/enchanting: `useInventoryLogic`, `inventoryDropUtils`, `inventoryItemRow.ui`, `inventoryPanelLoadColor.ui`, `containerCapacity`, `useForge`, `forgeModal.ui`, `enchantingModal.ui`.
- Libraries/data packs: `itemLibraryAudit`, `itemLibraryAdapter`, `itemLibraryMigration`, `itemMagicDefinition`, `dataPackUtils`, `dataPackRuntime`, `dataPackStoreUnlock`, `dataPackMakerPanel.ui`, `libraryItemsPanel.ui`, `libraryTooltip.ui`.
- UI infrastructure: `globalFeedback.ui`, `globalTooltip.ui`, `expertiseSettingsModal.ui`, `headerInfoProficiencyTooltip.ui`.
- Theme: `themeColorStructure`, `appTheme`, `sidebarLeftTheme.ui`.

## Change-To-Test Guidance

- Store or migration changes: run affected store tests plus `npm run typecheck`.
- Electron IPC changes: run `preload`, affected Electron/domain tests, then `npm run typecheck`.
- Backup/avatar changes: run avatar and character package tests, then at least `sidebarLeftTheme.ui`.
- Theme/CSS variable changes: run `themeColorStructure`, `appTheme`, and UI tests for touched surfaces.
- Data-pack or library changes: run data-pack tests plus `npm run audit:item-library` when item library content changes.
- Broad cross-layer changes: run `npm run typecheck`, `npm run test`, and `npm run build`.

## CI Expectations

The GitHub Actions workflow currently follows the repository scripts and should remain aligned with `package.json`. If scripts change, update this page, `README.md`, and workflow documentation together.
