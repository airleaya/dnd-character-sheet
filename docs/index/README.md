# Project Index Group

Current baseline: `0.16.0`

This index group is for future development and AI handoff. It is intentionally module-level: it explains responsibilities, entrypoints, data flow, risks, and tests without trying to list every function.

## How To Use This Index

- Start with `architecture.md` when you need the whole project shape.
- Use a subsystem page before editing related code.
- Use `tests-and-verification.md` before finishing a change.
- Use `documents-and-workflow.md` when updating version records, plans, or audit docs.

## Index Map

- `architecture.md` - application layers, lifecycle, and cross-module flow.
- `electron-storage-ipc.md` - main process, preload API, filesystem layout, IPC, logs, avatar assets, character backups, data packs, and window state.
- `frontend-shell.md` - app shell, layout components, character sheet panels, modal surfaces, feedback, and tooltip behavior.
- `character-avatar-backup.md` - character save shape, avatar editor, local assets, embedded backup JSON, legacy import compatibility.
- `state-and-logic.md` - stores, composables, services, migration, runtime normalization, and save/load responsibilities.
- `inventory-forge-enchanting.md` - inventory, equipment, containers, forge, enchanting, magic visuals, and attunement.
- `spells-data-packs.md` - spellbook, item/spell libraries, runtime data packs, maker workflow, and passphrase visibility.
- `theme-and-design.md` - color/theme architecture, semantic variables, component styling rules, and content color boundaries.
- `tests-and-verification.md` - tests by subsystem, validation commands, and CI expectations.
- `documents-and-workflow.md` - documentation roles, version logs, todo hygiene, and maintenance workflow.

## Maintenance Rules

- Keep this index semantic, not exhaustive. Prefer "what owns this behavior" and "what breaks when edited" over full symbol lists.
- When a feature crosses Electron, store, UI, and tests, update the relevant subsystem page plus `tests-and-verification.md`.
- When version records or baseline status change, update `README.md`, `TODOLIST.md`, `UPDATE_LOG.md`, and this index if the project shape changed.
- Do not index `node_modules/`, `dist/`, `dist-electron/`, `release/`, `saves/`, or temporary log files as source.
