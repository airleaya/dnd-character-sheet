# Inventory, Forge, And Enchanting Index

## Purpose

This subsystem manages carried items, equipment, containers, weight, wallet, magic item editing, forge-created custom items, enchanting traits, charges, attunement, and magic visuals.

## Core Entry Points

- `src/stores/sheet/useInventoryLogic.ts` owns inventory mutation and derived weight/capacity.
- `src/components/sheet/inventory/*` renders inventory panels, rows, equipment slots, and trash.
- `src/composables/useForge.ts` powers the forge modal workflow.
- `src/composables/useEnchanting.ts` powers enchanting modal behavior.
- `src/components/sheet/modals/ForgeModal.vue` edits custom item data.
- `src/components/sheet/modals/EnchantingModal.vue` edits magic traits, charges, attunement, and magic visuals.
- `src/utils/itemFactory.ts`, `src/utils/magicItems.ts`, `src/utils/inventoryDropUtils.ts`, and `src/utils/containerCapacity.ts` hold shared item behavior.

## Runtime Data Sources

- Static item definitions live under `src/data/libraries/`.
- Structured item sources and migration/audit data live under `src/data/libraries/structured/`.
- Runtime item lookup goes through data-pack helpers so default and enabled imported packs share one lookup path.
- Magic trait defaults live in `src/data/rules/magicTraits.ts`; user-created traits go through `customMagicTraitStore`.

## Key Behavior

- Ordinary identical non-container/non-attunement items may stack.
- Containers and attunement-sensitive items preserve instance identity.
- Container movement must preserve parent/child relationships and ordering.
- Equipment affects AC, attacks, charges, attunement, and visual state.
- Magic visuals are item-instance content overrides; changing one item's DIY colors must not mutate global theme colors or other magic items.
- Maker-launched forge/enchant flows can write data-pack assignment metadata when editing pack content.

## Change Risks

- Drag/drop changes can affect inventory rows, right sidebar drop zones, maker workbench routing, and native payload fallback.
- Item schema changes must be checked against old inventory migrations and data-pack export/import.
- Magic trait edits may need synchronization across selected item instances.
- Content color values are allowed for magic visuals; UI chrome colors should still use semantic CSS variables.

## Related Tests

- `tests/useInventoryLogic.test.ts`
- `tests/inventoryDropUtils.test.ts`
- `tests/inventoryItemRow.ui.test.ts`
- `tests/inventoryPanelLoadColor.ui.test.ts`
- `tests/containerCapacity.test.ts`
- `tests/useForge.test.ts`
- `tests/forgeModal.ui.test.ts`
- `tests/enchantingModal.ui.test.ts`
- `tests/itemMagicDefinition.test.ts`
