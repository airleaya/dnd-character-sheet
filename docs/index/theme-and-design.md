# Theme And Design Index

## Purpose

The theme system separates concrete theme colors from semantic UI variables and component usage. Components should read semantic/domain variables; only the theme layer should hold concrete theme color values.

## Core Entry Points

- `src/styles/theme-colors.css` is the concrete color layer. Each app theme defines the same 40 `--theme-*` colors.
- `src/styles/theme.css` is the variable layer. It maps theme colors into semantic, domain, and content fallback variables.
- `src/style.css` imports theme files and sets global base styling.
- `src/utils/appTheme.ts` owns known theme ids, local storage, validation, and root `data-theme`.
- `src/main.ts` initializes the theme before app mount.
- `src/components/layout/SidebarLeft.vue` exposes the current theme switcher.

## Current App Themes

- `classic`
- `night`
- `byzantine`
- `remilia`

Every app theme should keep the same 40 theme keys. Adding or removing a key should be deliberate and reflected in tests.

## Color Layer Rules

- Theme layer: concrete `--theme-*` colors live in `theme-colors.css`.
- Variable layer: `--color-*`, `--content-*`, and compatibility aliases are derived in `theme.css`.
- Component layer: Vue/CSS files should use semantic/domain variables, not direct `--theme-*` or old palette variables.
- Content colors: magic item visuals and user DIY colors are content data and may remain instance-specific.

## Design Boundaries

- Avoid adding new hardcoded UI color literals in components.
- Avoid making global UI theme changes when editing item-instance magic visuals.
- Use existing semantic variables for modals, sidebars, buttons, text, borders, overlays, avatars, inventory, combat, spellbook, and data-pack surfaces.
- If a new subsystem needs colors, add semantic/domain variables in `theme.css` and map them from the 40-color layer.

## Related Tests

- `tests/themeColorStructure.test.ts`
- `tests/appTheme.test.ts`
- `tests/sidebarLeftTheme.ui.test.ts`
- `tests/inventoryPanelLoadColor.ui.test.ts`
- Color-sensitive UI tests for changed surfaces, when applicable.
