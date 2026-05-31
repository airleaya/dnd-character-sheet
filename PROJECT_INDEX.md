# Project Index

Current baseline: `0.15.5`

This file is the root navigation entry for the project index. The detailed, maintained index now lives under `docs/index/` and is written for future development and AI handoff work.

## Recommended Reading Path

1. Start with `docs/index/README.md` for the index map and maintenance rules.
2. Read `docs/index/architecture.md` to understand the application layers and main data flow.
3. Open the subsystem index that matches the change you are planning.
4. Before editing, check `docs/index/tests-and-verification.md` for the expected validation path.

## Index Documents

- `docs/index/architecture.md` - Vue / Electron / Pinia architecture, app lifecycle, and cross-layer flow.
- `docs/index/electron-storage-ipc.md` - Electron main process, preload bridge, storage roots, IPC, logs, avatar assets, packages, and window state.
- `docs/index/frontend-shell.md` - App shell, sidebars, sheet panels, modals, feedback, and tooltip surfaces.
- `docs/index/character-avatar-backup.md` - Character saves, avatar editor, local avatar assets, single JSON backups, and import compatibility.
- `docs/index/state-and-logic.md` - Stores, sheet logic modules, services, migration entrypoints, and runtime data normalization.
- `docs/index/inventory-forge-enchanting.md` - Inventory, equipment, containers, forge, enchanting, magic visuals, and attunement behavior.
- `docs/index/spells-data-packs.md` - Spellbook, runtime libraries, default and imported data packs, GM maker, and passphrase visibility.
- `docs/index/theme-and-design.md` - 40-color theme layer, semantic variables, component usage rules, and design-system boundaries.
- `docs/index/tests-and-verification.md` - Test map, CI commands, and change-to-test guidance.
- `docs/index/documents-and-workflow.md` - README, TODOLIST, UPDATE_LOG, audit docs, and maintenance workflow.

## Historical Generator

`generate_index.js` is an older helper that generated a single large `PROJECT_INDEX.md` from `src/` and `electron/`. It is no longer the source of truth because it does not capture current subsystem intent, tests, documentation, data-pack workflows, theme rules, or avatar backup behavior. Keep it only as a historical aid unless a future task explicitly upgrades it into a generated appendix.
