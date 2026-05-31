# Spells And Data Packs Index

## Purpose

Spells and data packs provide the runtime content library for characters. The app combines built-in default D&D data with imported third-party packs, visibility settings, passphrase unlocks, and GM maker editing.

## Core Entry Points

- `src/stores/sheet/useSpellLogic.ts` owns known/prepared spells and slot state for the active character.
- `src/components/sheet/spellbook/*` renders the spellbook.
- `src/components/sheet/library/LibraryItemsPanel.vue` and `LibrarySpellsPanel.vue` render runtime library browsing.
- `src/stores/dataPackStore.ts` owns pack state, enabled order, unlocks, maker context, and runtime refresh.
- `src/data/dataPacks/runtimeDataPacks.ts` builds runtime item/spell/trait lookup from default and imported packs.
- `src/components/sheet/dataPackMaker/DataPackMakerPanel.vue` owns the GM maker workflow.
- `src/components/sheet/modals/DataPackManagerModal.vue` and `DataPackUnlockModal.vue` own pack management and unlock UI.

## Data Pack Responsibilities

- Default pack data is source-controlled and exportable.
- Imported `.dndpack.json` files live in Electron user data.
- Data-pack settings track enablement, ordering, and other local user preferences.
- Unlock progress can expose passphrase-gated content locally.
- Maker edits can create and update pack metadata, item/spell content, shop catalogs, trait placeholders, and visibility metadata.

## Spell Flow

- Spell definitions live under `src/data/spells/` and runtime data packs.
- Active character spell state is normalized by migration and handled in `useSpellLogic`.
- Spell library browsing reads from runtime data packs, not only static spell files.
- Spellbook UI groups spells by level and prepared/known state.

## Change Risks

- Data-pack validation must reject malformed packs without crashing app startup.
- Unlock progress is local visibility state, not strong cryptographic encryption.
- Exports should avoid leaking local unlock progress unless the chosen export mode says to keep it.
- Runtime library lookups should stay consistent across inventory, forge, enchanting, spellbook, and library UI.

## Related Tests

- `tests/useSpellLogic.test.ts`
- `tests/spellRitualBadges.ui.test.ts`
- `tests/dataPackUtils.test.ts`
- `tests/dataPackRuntime.test.ts`
- `tests/dataPackStoreUnlock.test.ts`
- `tests/dataPackMakerPanel.ui.test.ts`
- `tests/libraryItemsPanel.ui.test.ts`
- `tests/itemLibraryAudit.test.ts`
- `tests/itemLibraryAdapter.test.ts`
- `tests/itemLibraryMigration.test.ts`
