# Architecture Index

## Purpose

The app is an Electron desktop character manager built with Vue 3, Pinia, and Vite. The renderer owns interaction and state composition; Electron owns local filesystem access, export/import, logs, and native window behavior.

## Core Entry Points

- `src/main.ts` initializes theme state, creates the Vue app, registers global UI helpers, and mounts `App.vue`.
- `src/App.vue` initializes character/data-pack state and composes the application shell.
- `src/components/layout/AppLayout.vue` places the left sidebar, center character sheet, and right library/sidebar.
- `electron/main.ts` owns storage roots, migrations, IPC handlers, window creation, logs, and export/import APIs.
- `electron/preload.ts` exposes the typed `window.electronAPI` bridge defined in `src/types/electron.ts`.

## Main Layers

- Electron layer: filesystem, native dialogs, package import/export, avatar asset files, data-pack files, logs, and window state.
- Renderer service layer: thin wrappers around `window.electronAPI`, currently including character storage and avatar operations.
- State layer: Pinia stores for character list/cache, active sheet facade, data packs, tooltips, feedback, and custom magic traits.
- Domain logic layer: `src/stores/sheet/*` owns bio, combat, inventory, and spell behavior for the active character.
- UI layer: layout, character sheet panels, library panels, modals, and shared feedback/tooltip components.
- Data layer: D&D rules, item libraries, spell libraries, structured item data, runtime data packs, and migration helpers.

## Cross-Layer Flow

- Startup: Electron creates the window and preload bridge; renderer initializes theme, Pinia, character data, and data-pack state.
- Character editing: UI calls active sheet methods; active sheet delegates to sheet logic; save writes through `characterStore` and `storageService`.
- Library usage: runtime data-pack helpers merge default and enabled imported packs; inventory/spell UI reads from runtime libraries.
- Export/import: Sidebar calls Electron package IPC; Electron packages character JSON and avatar bytes or imports legacy/new formats.
- Feedback/logging: renderer uses `uiFeedback` for user-facing messages and `createRendererLogger` for diagnostics; Electron writes JSONL logs.

## Change Risks

- Avoid bypassing migration: character data should pass through `normalizeCharacterData` before entering stores or active sheet.
- Avoid direct renderer filesystem access; route file IO through Electron IPC.
- Avoid mixing content color data with UI theme variables. Magic item visuals and avatar image bytes are user/content data, not app theme state.
- Keep preload and `src/types/electron.ts` synchronized whenever IPC changes.

## Related Tests

- `tests/appRoot.smoke.test.ts`
- `tests/activeSheet.integration.test.ts`
- `tests/characterStore.test.ts`
- `tests/preload.test.ts`
- `tests/storageService.test.ts`
