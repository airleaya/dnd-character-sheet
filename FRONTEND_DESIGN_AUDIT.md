# Frontend Design Audit

> Baseline: `0.14.23`
> Date: 2026-05-20
> Scope: Vue renderer UI under `src/App.vue`, `src/style.css`, and `src/components/**`.

This document records the current frontend design surface so the next product and UI adjustments can start from a shared map instead of rediscovering the app panel by panel.

## 1. Current Shell

The application is a desktop workbench, not a marketing website or mobile-first web app.

- `src/components/layout/AppLayout.vue` defines a fixed three-column frame:
  - left character management sidebar: `260px`
  - center scrollable sheet workspace
  - right library/workbench sidebar: `320px`
- `src/App.vue` chooses the center experience:
  - loaded character sheet
  - GM data-pack maker
  - empty state
  - spellbook overlay after first open
- Global overlays are always mounted from `App.vue`:
  - `GlobalTooltip`
  - `GlobalFeedback`
  - `DataPackUnlockModal`

Design implication: future redesigns should treat the app as an information-dense desktop tool. The primary screen should stay operational, with compact controls and predictable panel placement.

## 2. Component Families

### Layout

- `SidebarLeft.vue` handles character list, grouping, import/export, save, bulk mode, and zoom.
- `SidebarRight.vue` handles root library tabs, search, library hover tooltip orchestration, forge/enchant drop zones, and data-pack entry.
- `AppLayout.vue` mounts global forge and enchanting modals so they are reachable from the right sidebar and maker flows.

### Character Sheet

- Bio header: `HeaderInfo.vue`, `ClassSelector.vue`, `AlignmentPicker.vue`, `XpProgressBar.vue`
- Ability/skill grid: `StatsAndSkills.vue`
- Combat summary: `CombatPanel.vue`
- Attacks/spell combat actions: `ActionsPanel.vue`
- Equipment and inventory: `EquipmentSlots.vue`, `InventoryPanel.vue`, `InventoryItemRow.vue`, `TrashPanel.vue`

### Library And Overlays

- Right library item tree: `LibraryItemsPanel.vue`
- Right library spell tree: `LibrarySpellsPanel.vue`
- Hover detail card: `LibraryTooltip.vue`
- Spellbook overlay: `SpellbookPanel.vue`, `SpellbookLeftPanel.vue`, `SpellbookRightPanel.vue`

### Authoring Tools

- Forge item editor: `ForgeModal.vue`
- Enchanting editor: `EnchantingModal.vue`
- Data-pack manager: `DataPackManagerModal.vue`
- Data-pack maker: `DataPackMakerPanel.vue`
- Data-pack unlock: `DataPackUnlockModal.vue`

## 3. Visual Languages In Use

The app currently has three distinct visual systems.

### Character Sheet Light Tooling

Used by the center character sheet, inventory, combat, and forge.

- Base colors: white panels, pale gray backgrounds, blue-gray headers.
- Controls: compact rectangular buttons, small badges, table-like rows.
- Strength: readable, dense, utilitarian.
- Risk: many colors are local to components, so the same control role can look different across panels.

### Right Sidebar Dark Library

Used by item/spell library and tooltips.

- Base colors: near-black panels, sticky dark headers, green active accents, gold category accents.
- Controls: collapsible directory headers, compact filter chips, drag rows.
- Strength: library content is visually separated from editable sheet content.
- Risk: sticky header offsets are manually tuned and may break during right-sidebar redesigns.

### Magic / GM Themed Tools

Used mainly by `EnchantingModal.vue`, parts of data-pack UI, and magic item visuals.

- Enchanting uses a dark fantasy palette with gold, purple, radial highlights, and pill controls.
- Data-pack maker uses a warm parchment/green admin palette.
- Magic inventory rows use configurable item colors.
- Strength: feature identity is strong.
- Risk: themed areas diverge from the rest of the tool surface and may need a shared editor-shell standard.

## 4. Interaction Inventory

Current expected interactions:

- Inline edit text fields via `EditableText` and `EditableTextarea`.
- Drag from right library into inventory, spellbook, forge, enchant, or maker targets.
- Nested inventory drag/drop, including containers and backpack hanging slot.
- Hover tooltips for rules, attacks, proficiencies, inventory items, and library entries.
- Modal editing for biography, proficiencies, expertise, forge, enchanting, data packs, unlocks, and attack selection.
- Bulk selection in left sidebar character management.
- Global shortcut `Shift + K + L` opens data-pack unlock.
- Electron zoom control is anchored in the left sidebar.

Design implication: drag/drop and hover cards are core workflows, not decorative affordances. Any design pass must preserve clear drop targets, hover timing, and non-overlapping fixed overlays.

## 5. Responsiveness And Layout Risk

The current renderer is optimized for desktop.

- Main app uses fixed sidebars and a center scroll container.
- Character sheet width is capped at `1240px`.
- Several panels have limited media-query support:
  - `ActionsPanel.vue` stacks at narrower widths through parent CSS.
  - `EnchantingModal.vue` has mobile-ish single-column fallbacks.
  - `DataPackMakerPanel.vue` collapses major grids under `900px`.
  - `DataPackManagerModal.vue` collapses cards under `720px`.
- Many sheet internals rely on fixed heights, fixed widths, manual sticky offsets, or local overflow rules.

Near-term risk areas:

- `StatsAndSkills.vue` uses six ability cards in a single grid with horizontal overflow.
- `SidebarRight.vue` and library panels rely on sticky header math.
- `SpellbookPanel.vue` overlays only `calc(100vw - 320px)`, assuming the right sidebar remains visible.
- `ForgeModal.vue` and `EnchantingModal.vue` use large fixed modal surfaces.

## 6. Accessibility And Semantics

Current coverage is partial.

What exists:

- Several modals declare `role="dialog"` and `aria-modal="true"`.
- Some dialogs include `aria-label`.
- Buttons generally have visible labels or `title` attributes.

Gaps:

- Many icon-like buttons use raw symbols or emoji without consistent accessible names.
- Dialog focus trapping is not standardized.
- Escape-to-close behavior is inconsistent.
- Drag/drop alternatives for keyboard users are not defined.
- Color meaning is often not backed by text labels.

Recommendation: before a large redesign, define a small shared modal, button, tooltip, tab, and form-control accessibility pattern.

## 7. Styling Architecture

Styling is mostly component-scoped SCSS plus a very small global CSS file.

- `src/style.css` only defines base font, body sizing, box sizing, anchor reset, form font inheritance, and `.preserve-user-lines`.
- Most colors, spacing, shadows, radii, z-indexes, and typography are repeated inside individual Vue components.
- There is no shared token file for color roles, elevation, border radius, z-index layers, panel spacing, or control sizes.

This makes local iteration fast but makes global redesign expensive. A future design-system pass should extract tokens gradually rather than rewriting all styles at once.

## 8. Testing Coverage Relevant To UI

The test suite already covers several UI behaviors:

- root shell smoke: `tests/appRoot.smoke.test.ts`
- attack picker and unarmed editor: `tests/actionsPanel.ui.test.ts`
- combat badges: `tests/combatPanelJack.ui.test.ts`
- data-pack maker workflows: `tests/dataPackMakerPanel.ui.test.ts`
- enchanting modal: `tests/enchantingModal.ui.test.ts`
- forge modal: `tests/forgeModal.ui.test.ts`
- global feedback and tooltip: `tests/globalFeedback.ui.test.ts`, `tests/globalTooltip.ui.test.ts`
- inventory rows and panel visuals: `tests/inventoryItemRow.ui.test.ts`, `tests/inventoryPanelLoadColor.ui.test.ts`
- library panels and tooltips: `tests/libraryItemsPanel.ui.test.ts`, `tests/libraryTooltip.ui.test.ts`
- spell ritual badges: `tests/spellRitualBadges.ui.test.ts`

Main coverage gap: visual layout regressions are not screenshot-tested. Playwright or equivalent screenshot checks would be valuable before a broad redesign.

## 9. Recommended Redesign Order

1. Define design tokens and layer rules.
   - colors by semantic role
   - z-index scale
   - spacing/radius/elevation scale
   - control height and typography scale

2. Standardize shared primitives.
   - button variants
   - icon-only button rules
   - modal shell
   - tooltip shell
   - form field shell
   - tabs and segmented controls
   - compact badges/chips

3. Stabilize the desktop shell.
   - left sidebar width and footer controls
   - right sidebar search/tabs/library hierarchy
   - center sheet max width and section rhythm

4. Redesign high-traffic sheet sections.
   - header and character identity
   - stats/skills grid
   - combat/action panels
   - inventory and equipment rows

5. Redesign heavy editor surfaces.
   - Forge
   - Enchanting
   - Data-pack manager
   - Data-pack maker

6. Add visual regression coverage for the shell and the highest-risk overlays.

## 10. Immediate Design Debt Backlog

- Normalize button styling and replace raw symbol buttons with consistent accessible controls.
- Reduce duplicated tooltip implementations across global tooltip, inventory tooltip, and library tooltip.
- Create shared modal shell behavior for close, backdrop, escape, focus, and footer actions.
- Audit z-index values: current overlays range from `2000` to `9999` without a shared scale.
- Replace manual sticky offsets in library trees with a named sidebar header layout contract.
- Decide whether right sidebar dark theme remains distinct or becomes a tokenized variant.
- Add screenshot checks before changing sheet density, sidebars, or overlays.

## 11. Summary

The frontend is feature-rich and already organized into understandable component families. The main risk is not missing UI, but inconsistent local styling and overlay behavior after many feature additions. The safest next phase is to introduce a small design-system layer, then migrate one surface at a time while preserving the existing desktop workbench model.
