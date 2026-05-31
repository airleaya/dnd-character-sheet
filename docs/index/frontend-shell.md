# Frontend Shell Index

## Purpose

The frontend shell organizes the desktop workspace: character list and controls on the left, active character sheet in the center, and library/data-pack tools on the right. Components should stay presentation-oriented while stores and composables own behavior.

## Core Entry Points

- `src/App.vue` initializes app-level state and global overlays.
- `src/components/layout/AppLayout.vue` defines the three-column shell.
- `src/components/layout/SidebarLeft.vue` owns character list, groups, import/export controls, zoom, and theme switching.
- `src/components/layout/SidebarRight.vue` hosts library and workbench surfaces.
- `src/components/ui/GlobalFeedback.vue` and `src/components/ui/GlobalTooltip.vue` provide shared overlay behavior.

## Character Sheet Areas

- Bio/header: identity, avatar upload, class/level/race, XP, alignment, bio, stats, proficiencies.
- Combat: HP, AC, initiative, death saves, exhaustion, attacks, inspiration, combat spell/equipment actions.
- Inventory: carried items, containers, equipment slots, trash, wallet, weight, attunement, charges.
- Spellbook: known/prepared spells, slots, pact slots, grouped spell panels.
- Modals: forge, enchanting, proficiency/expertise settings, data-pack manager/unlock, avatar editor.

## UI Data Flow

- Layout and sheet components read from `activeSheet` and related stores.
- Mutations should call active sheet/store methods rather than rewriting nested character data in arbitrary components.
- User-facing failures should go through `uiFeedback`; diagnostic errors should use `createRendererLogger`.
- Tooltips should prefer the shared tooltip store/components rather than local floating implementations.

## Change Risks

- `SidebarLeft.vue` touches many workflows: character selection, groups, import/export, theme, zoom, delete, and bulk mode. Keep edits tightly scoped.
- Avatar object URLs must be revoked on replacement/unmount.
- Hidden file inputs should reset their value after processing so the same file can be selected again.
- Modal z-index and overlay behavior should reuse existing semantic variables and not create new hardcoded color stacks.

## Related Tests

- `tests/appRoot.smoke.test.ts`
- `tests/sidebarLeftTheme.ui.test.ts`
- `tests/globalFeedback.ui.test.ts`
- `tests/globalTooltip.ui.test.ts`
- `tests/avatarEditorModal.ui.test.ts`
- `tests/libraryTooltip.ui.test.ts`
- `tests/inventoryItemRow.ui.test.ts`
