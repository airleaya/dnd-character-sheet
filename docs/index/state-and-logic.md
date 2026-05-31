# State And Logic Index

## Purpose

State is split between persistent character collection state, active character editing state, and domain-specific sheet logic. The project avoids one giant store by using an active sheet facade plus focused logic modules.

## Core Entry Points

- `src/stores/characterStore.ts` owns character list metadata, cache, create/save/load/delete/import/export, and character groups.
- `src/stores/activeSheet.ts` owns the active character facade and composes bio/combat/inventory/spell logic.
- `src/stores/sheet/useBioLogic.ts` owns profile, class, stats, skills, proficiencies, XP, and derived proficiency values.
- `src/stores/sheet/useCombatLogic.ts` owns HP, AC, initiative, death saves, exhaustion, attacks, and combat state.
- `src/stores/sheet/useInventoryLogic.ts` owns wallet, inventory, equipment, containers, trash, weight, and item movement.
- `src/stores/sheet/useSpellLogic.ts` owns known/prepared spells, spell slots, pact slots, and spell grouping.
- `src/utils/characterMigration.ts` normalizes old and new character data.

## Supporting Stores And Services

- `src/stores/dataPackStore.ts` owns runtime data-pack state, enabled packs, unlock progress, maker context, and imported/default pack coordination.
- `src/stores/customMagicTraitStore.ts` owns custom magic trait persistence.
- `src/stores/uiFeedback.ts` owns toast/confirm/alert state.
- `src/stores/tooltip.ts` owns global tooltip state.
- `src/services/storageService.ts` wraps character file IPC.
- `src/services/avatarService.ts` wraps avatar IPC.

## Data Flow

- Character data enters the app through `characterStore.init`, import APIs, or new-character creation.
- Data is normalized before being cached or loaded into `activeSheet`.
- UI calls active sheet methods; active sheet delegates to sheet logic and calls `save`.
- `saveCharacterData` updates cache/list metadata and persists normalized JSON through `storageService`.
- Deleting a character also removes group references and avatar assets when available.

## Change Risks

- Do not mutate active character data in a way that skips save/normalization for persisted state.
- Keep list metadata fields synchronized with `Character.profile` fields, especially avatar metadata.
- Store tests mock Electron APIs; update mocks when IPC contract changes.
- When adding fields to `Character`, update migration defaults and any import/export expectations.

## Related Tests

- `tests/characterMigration.test.ts`
- `tests/characterStore.test.ts`
- `tests/activeSheet.integration.test.ts`
- `tests/useBioLogic.test.ts`
- `tests/useCombatLogic.test.ts`
- `tests/useInventoryLogic.test.ts`
- `tests/useSpellLogic.test.ts`
