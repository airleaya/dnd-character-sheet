# CSS Color Usage Audit

> Baseline: `0.15.0`
> Date: 2026-05-21
> Scope: `src/style.css` plus `<style>` blocks in `src/**/*.vue`. Inline runtime `:style` bindings are not included unless their color literals also appear in CSS/style blocks.

## Summary

- Style sources scanned: 37
- Color literal uses: 1411
- Unique color values after light normalization: 501
- Normalization lowercases values and removes whitespace inside functional colors, so `rgba(0, 0, 0, 0.2)` and `rgba(0,0,0,0.2)` are counted together.

## Area Summary

| Area | Files | Unique Colors | Uses | Most Used Colors |
|---|---:|---:|---:|---|
| App root / empty states | 1 | 5 | 5 | #7f8c8d (1)<br>#ced4da (1)<br>#f8f9fa (1)<br>rgba(0,0,0,0.1) (1)<br>white (1) |
| Bio / stats / character header | 6 | 53 | 165 | #2c3e50 (21)<br>white (13)<br>#7f8c8d (10)<br>#bdc3c7 (10)<br>#3498db (8)<br>#ecf0f1 (8)<br>rgba(0,0,0,0.05) (7)<br>#95a5a6 (6) |
| Combat / actions | 2 | 86 | 212 | #fff (19)<br>#34495e (18)<br>#eee (11)<br>#7f8c8d (8)<br>#2c3e50 (7)<br>#c0392b (6)<br>#333 (5)<br>#555 (5) |
| Desktop shell / sidebars | 3 | 45 | 93 | #34495e (7)<br>#3498db (5)<br>#bdc3c7 (5)<br>#ecf0f1 (5)<br>#f1c40f (4)<br>#fff (4)<br>white (4)<br>#233140 (3) |
| Global overlays / feedback | 2 | 37 | 40 | #355c7d (2)<br>#ecf0f1 (2)<br>#fff (2)<br>#2b241e (1)<br>#2d7d46 (1)<br>#2f7a4b (1)<br>#31724a (1)<br>#34495e (1) |
| Global stylesheet | 1 | 2 | 3 | #f0f2f5 (2)<br>#213547 (1) |
| GM data-pack maker | 1 | 73 | 91 | white (8)<br>#263126 (5)<br>#d8ded8 (4)<br>#536052 (2)<br>#9a79bd (2)<br>#ead9a8 (2)<br>purple (2)<br>#20252b (1) |
| Inventory / equipment | 4 | 113 | 184 | #e74c3c (6)<br>#ffcdd2 (5)<br>white (5)<br>#4f0b22 (4)<br>#7f8c8d (4)<br>#adb5bd (4)<br>#dee2e6 (4)<br>#f1f3f5 (4) |
| Library panels | 2 | 67 | 140 | #333 (9)<br>#42b983 (8)<br>#fff (8)<br>#555 (6)<br>#d7c1ff (5)<br>#282828 (4)<br>#2c2c2c (4)<br>#2d2d2d (4) |
| Modals / editors | 6 | 174 | 292 | #fff (13)<br>#2c3e50 (6)<br>#ddd (6)<br>#8e44ad (5)<br>#b7c2d2 (5)<br>#d6dfef (5)<br>#eee (5)<br>#f7d58a (5) |
| Right sidebar tools / tooltips | 3 | 42 | 73 | #fff (7)<br>#333 (5)<br>#555 (5)<br>#777 (5)<br>#d35400 (3)<br>#f5c560 (3)<br>rgba(0,0,0,0.2) (3)<br>#34495e (2) |
| Shared common components | 3 | 12 | 16 | #3498db (2)<br>#bdc3c7 (2)<br>#ddd (2)<br>white (2)<br>#282828 (1)<br>#2c3e50 (1)<br>#3a3a3a (1)<br>#95a5a6 (1) |
| Spellbook | 3 | 48 | 97 | #fff (7)<br>#7f8c8d (6)<br>#dcd6cb (6)<br>#9b59b6 (5)<br>#e0e0e0 (5)<br>#555 (4)<br>#ccc (4)<br>#fdfbf7 (4) |

## Full Color Index

| Color | Uses | Areas | Representative Files / Selectors / Properties |
|---|---:|---|---|
| `#fff` | 67 | Bio / stats / character header<br>Combat / actions<br>Desktop shell / sidebars<br>GM data-pack maker<br>Global overlays / feedback<br>Inventory / equipment<br>Library panels<br>Modals / editors<br>Right sidebar tools / tooltips<br>Spellbook | src/components/layout/SidebarLeft.vue:681 .inline-edit-input -> border<br>src/components/layout/SidebarLeft.vue:715 .char-name -> font-weight<br>src/components/layout/SidebarRight.vue:225 .root-tab-btn<br>src/components/layout/SidebarRight.vue:234 input -> border-radius<br>src/components/sheet/bio/BioPanel.vue:166 .card -> background |
| `#2c3e50` | 44 | Bio / stats / character header<br>Combat / actions<br>Desktop shell / sidebars<br>Inventory / equipment<br>Modals / editors<br>Right sidebar tools / tooltips<br>Shared common components<br>Spellbook | src/components/common/EditableTextarea.vue:135 .display-text -> color<br>src/components/layout/SidebarLeft.vue:612 .sidebar-left -> background-color<br>src/components/layout/SidebarLeft.vue:681 .inline-edit-input -> border<br>src/components/sheet/bio/AlignmentPicker.vue:90 .alignment-trigger -> color<br>src/components/sheet/bio/AlignmentPicker.vue:147 &:hover -> color |
| `white` | 41 | App root / empty states<br>Bio / stats / character header<br>Combat / actions<br>Desktop shell / sidebars<br>GM data-pack maker<br>Inventory / equipment<br>Library panels<br>Modals / editors<br>Shared common components<br>Spellbook | src/App.vue:123 .sheet-container -> background<br>src/components/common/EditableText.vue:112 .edit-input -> background<br>src/components/common/EditableTextarea.vue:160 .edit-textarea -> background<br>src/components/layout/SidebarLeft.vue:637 .btn-text<br>src/components/layout/SidebarLeft.vue:643 .btn-create -> width |
| `#7f8c8d` | 36 | App root / empty states<br>Bio / stats / character header<br>Combat / actions<br>Desktop shell / sidebars<br>Inventory / equipment<br>Library panels<br>Modals / editors<br>Spellbook | src/App.vue:172 .empty-state -> color<br>src/components/layout/SidebarLeft.vue:677 .group-header<br>src/components/layout/SidebarLeft.vue:685 .group-tools<br>src/components/layout/SidebarLeft.vue:693 .empty-group -> padding<br>src/components/sheet/bio/AlignmentPicker.vue:141 .grid-item -> color |
| `#34495e` | 31 | Bio / stats / character header<br>Combat / actions<br>Desktop shell / sidebars<br>Global overlays / feedback<br>Inventory / equipment<br>Right sidebar tools / tooltips<br>Spellbook | src/components/layout/SidebarLeft.vue:616 .sidebar-left -> border-right<br>src/components/layout/SidebarLeft.vue:620 .header -> border-bottom<br>src/components/layout/SidebarLeft.vue:702 li -> padding<br>src/components/layout/SidebarLeft.vue:704 li<br>src/components/layout/SidebarLeft.vue:737 .footer-wrapper -> border-top |
| `#333` | 29 | Bio / stats / character header<br>Combat / actions<br>Desktop shell / sidebars<br>Inventory / equipment<br>Library panels<br>Modals / editors<br>Right sidebar tools / tooltips<br>Spellbook | src/components/layout/SidebarRight.vue:217 .sidebar-right -> background-color<br>src/components/layout/SidebarRight.vue:221 .root-tabs -> display<br>src/components/sheet/bio/BioPanel.vue:131 .modal-header<br>src/components/sheet/combat/CombatPanel.vue:417 &:hover -> color<br>src/components/sheet/combat/CombatPanel.vue:436 &.active |
| `#eee` | 28 | Bio / stats / character header<br>Combat / actions<br>Inventory / equipment<br>Library panels<br>Modals / editors<br>Spellbook | src/components/sheet/bio/BioPanel.vue:128 .modal-header -> padding<br>src/components/sheet/bio/BioPanel.vue:142 .modal-body<br>src/components/sheet/bio/BioPanel.vue:166 .card -> background<br>src/components/sheet/bio/ClassSelector.vue:417 .search-input -> border-bottom<br>src/components/sheet/bio/HeaderInfo.vue:209 .avatar-box -> background |
| `#555` | 25 | Combat / actions<br>Desktop shell / sidebars<br>Inventory / equipment<br>Library panels<br>Modals / editors<br>Right sidebar tools / tooltips<br>Spellbook | src/components/layout/SidebarRight.vue:245 .scroll-container<br>src/components/sheet/combat/ActionsPanel.vue:1530 .mini-stat -> color<br>src/components/sheet/combat/ActionsPanel.vue:1749 .card-detail -> color<br>src/components/sheet/combat/ActionsPanel.vue:1847 .desc-text -> color<br>src/components/sheet/combat/ActionsPanel.vue:1859 strong -> color |
| `#bdc3c7` | 25 | Bio / stats / character header<br>Combat / actions<br>Desktop shell / sidebars<br>Inventory / equipment<br>Modals / editors<br>Right sidebar tools / tooltips<br>Shared common components<br>Spellbook | src/components/common/EditableText.vue:97 .editable-container -> border-bottom<br>src/components/common/EditableTextarea.vue:141 .display-text:hover -> border-color<br>src/components/layout/SidebarLeft.vue:635 .btn-text -> background<br>src/components/layout/SidebarLeft.vue:651 .bulk-header -> font-size<br>src/components/layout/SidebarLeft.vue:678 .group-header |
| `transparent` | 24 | Bio / stats / character header<br>Combat / actions<br>Desktop shell / sidebars<br>GM data-pack maker<br>Library panels<br>Modals / editors<br>Shared common components<br>Spellbook | src/components/common/EditableTextarea.vue:132 .display-text -> border<br>src/components/layout/SidebarLeft.vue:635 .btn-text -> background<br>src/components/layout/SidebarRight.vue:223 .root-tab-btn -> flex<br>src/components/layout/SidebarRight.vue:224 .root-tab-btn -> font-weight<br>src/components/sheet/bio/AlignmentPicker.vue:137 .grid-item -> border |
| `#e74c3c` | 23 | Bio / stats / character header<br>Combat / actions<br>Desktop shell / sidebars<br>Inventory / equipment<br>Modals / editors<br>Right sidebar tools / tooltips<br>Spellbook | src/components/layout/SidebarLeft.vue:727 .btn-delete -> background<br>src/components/layout/SidebarLeft.vue:767 .bulk-tools<br>src/components/sheet/bio/ClassSelector.vue:240 &:hover -> background<br>src/components/sheet/bio/ClassSelector.vue:242 &:hover -> border-right-color<br>src/components/sheet/bio/XpProgressBar.vue:161 .btn-reset -> background |
| `#ddd` | 21 | Bio / stats / character header<br>Combat / actions<br>Inventory / equipment<br>Library panels<br>Modals / editors<br>Right sidebar tools / tooltips<br>Shared common components<br>Spellbook | src/components/common/ItemDescriptionRenderer.vue:67 .desc-table-caption -> color<br>src/components/common/ItemDescriptionRenderer.vue:89 .desc-table th -> color<br>src/components/sheet/bio/XpProgressBar.vue:124 input -> border<br>src/components/sheet/combat/CombatPanel.vue:576 .btn-full -> background<br>src/components/sheet/combat/CombatPanel.vue:654 button -> background |
| `#ecf0f1` | 20 | Bio / stats / character header<br>Combat / actions<br>Desktop shell / sidebars<br>Global overlays / feedback<br>Inventory / equipment | src/components/layout/SidebarLeft.vue:613 .sidebar-left -> color<br>src/components/layout/SidebarLeft.vue:623 .header<br>src/components/layout/SidebarLeft.vue:686 .group-tools -> button<br>src/components/layout/SidebarLeft.vue:749 .btn-zoom -> background<br>src/components/layout/SidebarLeft.vue:759 .btn-tool -> flex |
| `#3498db` | 19 | Bio / stats / character header<br>Combat / actions<br>Desktop shell / sidebars<br>Inventory / equipment<br>Modals / editors<br>Shared common components | src/components/common/EditableText.vue:108 .edit-input -> outline<br>src/components/common/EditableTextarea.vue:152 .edit-textarea -> border<br>src/components/layout/SidebarLeft.vue:631 .btn-text-small -> background<br>src/components/layout/SidebarLeft.vue:652 .bulk-header<br>src/components/layout/SidebarLeft.vue:681 .inline-edit-input -> border |
| `#95a5a6` | 19 | Bio / stats / character header<br>Combat / actions<br>Inventory / equipment<br>Modals / editors<br>Shared common components<br>Spellbook | src/components/common/EditableTextarea.vue:145 .display-text.empty -> color<br>src/components/sheet/bio/ClassSelector.vue:354 .subclass-name-btn<br>src/components/sheet/bio/HeaderInfo.vue:249 .row-player-name -> color<br>src/components/sheet/bio/HeaderInfo.vue:264 .field<br>src/components/sheet/bio/HeaderInfo.vue:278 .field |
| `#42b983` | 14 | Desktop shell / sidebars<br>Inventory / equipment<br>Library panels | src/components/layout/SidebarRight.vue:226 .root-tab-btn<br>src/components/layout/SidebarRight.vue:235 input<br>src/components/sheet/inventory/InventoryItemRow.vue:666 .empty-slot<br>src/components/sheet/inventory/InventoryPanel.vue:589 .inventory-list<br>src/components/sheet/inventory/InventoryPanel.vue:621 .inventory-tooltip |
| `#c0392b` | 13 | Combat / actions<br>Desktop shell / sidebars<br>Inventory / equipment<br>Right sidebar tools / tooltips<br>Spellbook | src/components/layout/SidebarLeft.vue:767 .bulk-tools<br>src/components/sheet/combat/ActionsPanel.vue:1075 .attack-card -> border-left<br>src/components/sheet/combat/ActionsPanel.vue:1137 .atk-hit -> background<br>src/components/sheet/combat/ActionsPanel.vue:1468 .danger-link -> color<br>src/components/sheet/combat/ActionsPanel.vue:1687 &.atk -> color |
| `#e0e0e0` | 13 | Bio / stats / character header<br>Combat / actions<br>Desktop shell / sidebars<br>Inventory / equipment<br>Spellbook | src/components/layout/SidebarRight.vue:217 .sidebar-right -> background-color<br>src/components/sheet/bio/StatsAndSkills.vue:203 .card-body<br>src/components/sheet/bio/StatsAndSkills.vue:215 .saving-throw-row -> border-bottom<br>src/components/sheet/combat/ActionsPanel.vue:1017 .sec-header -> border-bottom<br>src/components/sheet/combat/ActionsPanel.vue:1526 .spell-dashboard-mini -> border |
| `#f8f9fa` | 13 | App root / empty states<br>Bio / stats / character header<br>Combat / actions<br>Inventory / equipment<br>Modals / editors<br>Shared common components | src/App.vue:136 .inventory-placeholder -> background-color<br>src/components/common/EditableTextarea.vue:140 .display-text:hover -> background-color<br>src/components/sheet/bio/AlignmentPicker.vue:136 .grid-item -> background-color<br>src/components/sheet/bio/BioPanel.vue:128 .modal-header -> padding<br>src/components/sheet/bio/ClassSelector.vue:201 .class-badge -> background |
| `rgba(0,0,0,0.2)` | 12 | Bio / stats / character header<br>Combat / actions<br>Global overlays / feedback<br>Inventory / equipment<br>Modals / editors<br>Right sidebar tools / tooltips<br>Spellbook | src/components/sheet/bio/BioPanel.vue:123 .modal-content.bio-modal -> box-shadow<br>src/components/sheet/bio/StatsAndSkills.vue:191 .val-stepper -> display<br>src/components/sheet/combat/CombatPanel.vue:685 .insp-star<br>src/components/sheet/inventory/EquipmentSlots.vue:300 .rejected-card -> font-weight<br>src/components/sheet/inventory/EquipmentSlots.vue:389 .rejected-card -> box-shadow |
| `#8e44ad` | 11 | Bio / stats / character header<br>Combat / actions<br>Modals / editors<br>Spellbook | src/components/sheet/bio/HeaderInfo.vue:312 .btn-tool<br>src/components/sheet/combat/ActionsPanel.vue:1571 .equipment-count -> color<br>src/components/sheet/combat/ActionsPanel.vue:1699 .equipment-action-card -> border-left-color<br>src/components/sheet/combat/CombatPanel.vue:694 .ex-level<br>src/components/sheet/modals/ExpertiseSettingsModal.vue:187 &:hover -> border-color |
| `#ccc` | 11 | Combat / actions<br>Library panels<br>Right sidebar tools / tooltips<br>Spellbook | src/components/sheet/combat/CombatPanel.vue:356 .combat-panel -> border<br>src/components/sheet/combat/CombatPanel.vue:556 input -> border<br>src/components/sheet/combat/CombatPanel.vue:602 .circle -> border<br>src/components/sheet/combat/CombatPanel.vue:625 .hd-edit-row -> background<br>src/components/sheet/library/LibraryItemsPanel.vue:423 .weapon-filter-button |
| `#f1f3f5` | 11 | Bio / stats / character header<br>Combat / actions<br>Inventory / equipment<br>Modals / editors | src/components/sheet/bio/BioPanel.vue:155 .field-box -> background<br>src/components/sheet/combat/ActionsPanel.vue:1524 .spell-dashboard-mini -> background<br>src/components/sheet/combat/ActionsPanel.vue:1589 &:hover -> background<br>src/components/sheet/inventory/InventoryItemRow.vue:382 &:hover -> background<br>src/components/sheet/inventory/InventoryItemRow.vue:537 .btn-mini |
| `rgba(0,0,0,0.05)` | 11 | Bio / stats / character header<br>Combat / actions<br>Inventory / equipment<br>Spellbook | src/components/sheet/bio/ClassSelector.vue:231 .badge-remove-control -> border-right<br>src/components/sheet/bio/ClassSelector.vue:281 &:hover:not(:disabled) -> background<br>src/components/sheet/bio/ClassSelector.vue:334 .badge-bottom -> border-top<br>src/components/sheet/bio/ClassSelector.vue:354 .subclass-name-btn<br>src/components/sheet/bio/HeaderInfo.vue:211 .avatar-box -> overflow |
| `#27ae60` | 10 | Bio / stats / character header<br>Combat / actions<br>Desktop shell / sidebars<br>Inventory / equipment<br>Library panels<br>Spellbook | src/components/layout/SidebarLeft.vue:643 .btn-create -> width<br>src/components/sheet/bio/StatsAndSkills.vue:247 .skill-row<br>src/components/sheet/combat/CombatPanel.vue:534 &:has(.hp-bar-fill[style*="width: 5"])<br>src/components/sheet/combat/CombatPanel.vue:571 button<br>src/components/sheet/combat/CombatPanel.vue:603 .circle |
| `#2980b9` | 10 | Bio / stats / character header<br>Combat / actions<br>Desktop shell / sidebars<br>Inventory / equipment<br>Modals / editors | src/components/layout/SidebarLeft.vue:705 li<br>src/components/layout/SidebarLeft.vue:768 .bulk-tools<br>src/components/sheet/bio/AlignmentPicker.vue:154 &.active -> color<br>src/components/sheet/combat/CombatPanel.vue:546 .hp-text<br>src/components/sheet/combat/CombatPanel.vue:572 button |
| `#999` | 10 | Bio / stats / character header<br>Combat / actions<br>Inventory / equipment<br>Library panels<br>Modals / editors | src/components/sheet/bio/BioPanel.vue:131 .modal-header<br>src/components/sheet/bio/BioPanel.vue:156 .field-box<br>src/components/sheet/bio/ClassSelector.vue:444 .empty-text -> color<br>src/components/sheet/combat/ActionsPanel.vue:1758 .spell-meta-header -> color<br>src/components/sheet/combat/CombatPanel.vue:591 .resource-item |
| `#9b59b6` | 10 | Bio / stats / character header<br>Combat / actions<br>Library panels<br>Spellbook | src/components/sheet/bio/HeaderInfo.vue:313 .btn-tool<br>src/components/sheet/combat/ActionsPanel.vue:1615 .slot-dot -> border<br>src/components/sheet/combat/ActionsPanel.vue:1620 &.filled -> background<br>src/components/sheet/library/LibrarySpellsPanel.vue:214 .learned-mark<br>src/components/sheet/library/LibrarySpellsPanel.vue:218 .learned-mark |
| `#d35400` | 9 | Inventory / equipment<br>Modals / editors<br>Right sidebar tools / tooltips | src/components/sheet/inventory/InventoryPanel.vue:524 &.load-orange -> color<br>src/components/sheet/inventory/InventoryPanel.vue:579 button<br>src/components/sheet/modals/ForgeModal.vue:679 &.type-specific<br>src/components/sheet/modals/ForgeModal.vue:705 &:focus -> border-color<br>src/components/sheet/modals/ForgeModal.vue:723 &:focus -> border-bottom-color |
| `#f1c40f` | 9 | Combat / actions<br>Desktop shell / sidebars<br>Global overlays / feedback<br>Inventory / equipment<br>Right sidebar tools / tooltips | src/components/layout/SidebarLeft.vue:638 .btn-text<br>src/components/layout/SidebarLeft.vue:762 .btn-tool<br>src/components/sheet/combat/CombatPanel.vue:685 .insp-star<br>src/components/sheet/inventory/InventoryPanel.vue:577 button<br>src/components/sheet/inventory/InventoryPanel.vue:618 .inventory-tooltip |
| `#fdfdfd` | 9 | Bio / stats / character header<br>Combat / actions<br>Inventory / equipment<br>Modals / editors | src/components/sheet/bio/BioPanel.vue:155 .field-box -> background<br>src/components/sheet/bio/StatsAndSkills.vue:201 .card-body -> background<br>src/components/sheet/combat/ActionsPanel.vue:1038 .btn-toggle -> background<br>src/components/sheet/combat/ActionsPanel.vue:1381 .unarmed-config-btn -> background<br>src/components/sheet/combat/ActionsPanel.vue:1580 .group-header -> background |
| `#e9ecef` | 8 | Bio / stats / character header<br>Inventory / equipment<br>Modals / editors | src/components/sheet/bio/ClassSelector.vue:202 .class-badge -> border<br>src/components/sheet/bio/ClassSelector.vue:260 .badge-level-controls -> border-left<br>src/components/sheet/bio/ClassSelector.vue:390 .dropdown-menu -> border<br>src/components/sheet/inventory/InventoryItemRow.vue:391 &.is-container<br>src/components/sheet/inventory/InventoryItemRow.vue:534 .btn-mini |
| `#5dade2` | 7 | Desktop shell / sidebars<br>Inventory / equipment<br>Library panels | src/components/layout/SidebarLeft.vue:632 .btn-text-small<br>src/components/layout/SidebarLeft.vue:750 .btn-zoom<br>src/components/layout/SidebarLeft.vue:760 .btn-tool<br>src/components/sheet/inventory/InventoryPanel.vue:576 button<br>src/components/sheet/inventory/InventoryPanel.vue:625 .inventory-tooltip |
| `#777` | 7 | Inventory / equipment<br>Right sidebar tools / tooltips<br>Spellbook | src/components/sheet/inventory/InventoryPanel.vue:611 .inventory-tooltip<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:204 .radio-btn -> padding<br>src/components/sidebar/LibraryTooltip.vue:413 .card-subtitle -> font-size<br>src/components/sidebar/LibraryTooltip.vue:429 .card-body<br>src/components/sidebar/LibraryTooltip.vue:495 .extra-info -> margin-top |
| `#888` | 7 | Desktop shell / sidebars<br>Inventory / equipment<br>Library panels<br>Right sidebar tools / tooltips | src/components/layout/SidebarRight.vue:223 .root-tab-btn -> flex<br>src/components/sheet/inventory/InventoryPanel.vue:620 .inventory-tooltip<br>src/components/sheet/library/LibraryItemsPanel.vue:368 .main-group-header<br>src/components/sheet/library/LibraryItemsPanel.vue:415 .weapon-filter-button -> border<br>src/components/sheet/library/LibrarySpellsPanel.vue:177 .main-group-header |
| `#aaa` | 7 | Inventory / equipment<br>Library panels<br>Right sidebar tools / tooltips | src/components/sheet/inventory/InventoryPanel.vue:624 .inventory-tooltip<br>src/components/sheet/library/LibraryItemsPanel.vue:389 .sticky-sub-header -> font-size<br>src/components/sheet/library/LibraryItemsPanel.vue:428 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:183 .sticky-sub-header -> font-size<br>src/components/sheet/library/LibrarySpellsPanel.vue:221 .learned-mark |
| `#d7c1ff` | 7 | Inventory / equipment<br>Library panels<br>Right sidebar tools / tooltips | src/components/sheet/inventory/InventoryPanel.vue:638 .magic-traits-title -> color<br>src/components/sheet/library/LibraryItemsPanel.vue:375 .passphrase-toggle -> color<br>src/components/sheet/library/LibraryItemsPanel.vue:384 .passphrase-toggle<br>src/components/sheet/library/LibraryItemsPanel.vue:407 .category-header.passphrase-header -> color<br>src/components/sheet/library/LibraryItemsPanel.vue:410 .category-header.passphrase-header |
| `#e67e22` | 7 | Bio / stats / character header<br>Combat / actions<br>Modals / editors<br>Right sidebar tools / tooltips<br>Spellbook | src/components/sheet/bio/HeaderInfo.vue:310 .btn-tool<br>src/components/sheet/combat/ActionsPanel.vue:1780 &.conc -> background<br>src/components/sheet/combat/CombatPanel.vue:431 &.active -> color<br>src/components/sheet/combat/CombatPanel.vue:618 .gear-icon<br>src/components/sheet/modals/ForgeModal.vue:879 .btn-save |
| `#f5c560` | 7 | Modals / editors<br>Right sidebar tools / tooltips | src/components/sheet/modals/EnchantingModal.vue:787 .eyebrow -> color<br>src/components/sheet/modals/EnchantingModal.vue:855 .empty-rune -> color<br>src/components/sheet/modals/EnchantingModal.vue:1131 input -> accent-color<br>src/components/sheet/modals/EnchantingModal.vue:1290 .btn-save -> background<br>src/components/sidebar/EnchantDropZone.vue:92 &.is-active -> border-top-color |
| `#666` | 6 | Combat / actions<br>Library panels<br>Modals / editors<br>Right sidebar tools / tooltips | src/components/sheet/combat/CombatPanel.vue:404 .label -> color<br>src/components/sheet/combat/CombatPanel.vue:717 .hd-type-select -> color<br>src/components/sheet/library/LibraryItemsPanel.vue:394 .sticky-sub-header<br>src/components/sheet/library/LibrarySpellsPanel.vue:188 .sticky-sub-header<br>src/components/sheet/modals/ProficiencySettingsModal.vue:248 .btn-toggle -> border |
| `#dcd6cb` | 6 | Spellbook | src/components/sheet/spellbook/SpellbookLeftPanel.vue:206 .panel-header -> border-bottom<br>src/components/sheet/spellbook/SpellbookLeftPanel.vue:236 .ability-card -> border<br>src/components/sheet/spellbook/SpellbookLeftPanel.vue:311 .slot-item -> display<br>src/components/sheet/spellbook/SpellbookPanel.vue:118 .layout-left -> border-right<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:191 .panel-header -> border-bottom |
| `rgba(0,0,0,0.1)` | 6 | App root / empty states<br>Bio / stats / character header<br>Combat / actions | src/App.vue:126 .sheet-container -> box-shadow<br>src/components/sheet/bio/AlignmentPicker.vue:98 .alignment-trigger -> box-shadow<br>src/components/sheet/bio/ClassSelector.vue:394 .dropdown-menu -> box-shadow<br>src/components/sheet/bio/HeaderInfo.vue:294 .pb-badge -> box-shadow<br>src/components/sheet/bio/HeaderInfo.vue:304 .btn-tool -> transition |
| `rgba(255,255,255,0.08)` | 6 | Library panels<br>Modals / editors | src/components/sheet/library/LibraryItemsPanel.vue:421 .weapon-filter-button<br>src/components/sheet/modals/DataPackManagerModal.vue:244 .modal-header -> border-bottom<br>src/components/sheet/modals/DataPackManagerModal.vue:255 .close-btn -> background<br>src/components/sheet/modals/DataPackUnlockModal.vue:123 .close-btn -> background<br>src/components/sheet/modals/EnchantingModal.vue:938 span -> background |
| `#1e1e1e` | 5 | Desktop shell / sidebars<br>Library panels<br>Right sidebar tools / tooltips | src/components/layout/SidebarRight.vue:217 .sidebar-right -> background-color<br>src/components/layout/SidebarRight.vue:231 .search-header -> padding<br>src/components/sheet/library/LibraryItemsPanel.vue:420 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:200 .branch-header<br>src/components/sidebar/LibraryTooltip.vue:378 .item-tooltip-card -> background-color |
| `#263126` | 5 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1202 .unlock-override<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1204 .unlock-override<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1208 .unlock-override<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1230 .import-strip<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1285 .import-strip |
| `#282828` | 5 | Library panels<br>Shared common components | src/components/common/ItemDescriptionRenderer.vue:88 .desc-table th -> background<br>src/components/sheet/library/LibraryItemsPanel.vue:393 .sticky-sub-header<br>src/components/sheet/library/LibraryItemsPanel.vue:420 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:187 .sticky-sub-header<br>src/components/sheet/library/LibrarySpellsPanel.vue:200 .branch-header |
| `#2c2c2c` | 5 | Desktop shell / sidebars<br>Library panels | src/components/layout/SidebarRight.vue:233 input -> width<br>src/components/sheet/library/LibraryItemsPanel.vue:369 .main-group-header<br>src/components/sheet/library/LibraryItemsPanel.vue:400 .category-header<br>src/components/sheet/library/LibrarySpellsPanel.vue:178 .main-group-header<br>src/components/sheet/library/LibrarySpellsPanel.vue:194 .branch-header |
| `#2ecc71` | 5 | Bio / stats / character header<br>Combat / actions<br>Desktop shell / sidebars | src/components/layout/SidebarLeft.vue:646 .btn-create<br>src/components/layout/SidebarLeft.vue:670 &.drag-over -> border<br>src/components/sheet/bio/XpProgressBar.vue:157 .btn-add -> background<br>src/components/sheet/bio/XpProgressBar.vue:176 .progress-fill -> background<br>src/components/sheet/combat/CombatPanel.vue:571 button |
| `#adb5bd` | 5 | Inventory / equipment<br>Modals / editors | src/components/sheet/inventory/InventoryItemRow.vue:410 .btn-expand -> background<br>src/components/sheet/inventory/InventoryItemRow.vue:443 .template-name -> color<br>src/components/sheet/inventory/InventoryItemRow.vue:587 .btn-del -> border<br>src/components/sheet/inventory/InventoryItemRow.vue:657 .empty-slot -> color<br>src/components/sheet/modals/ProficiencySettingsModal.vue:270 &.expertise |
| `#b7c2d2` | 5 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:844 small -> color<br>src/components/sheet/modals/EnchantingModal.vue:956 .source-line -> color<br>src/components/sheet/modals/EnchantingModal.vue:1002 p -> color<br>src/components/sheet/modals/EnchantingModal.vue:1149 small -> color<br>src/components/sheet/modals/EnchantingModal.vue:1260 .empty-inline -> color |
| `#ced4da` | 5 | App root / empty states<br>Inventory / equipment<br>Modals / editors | src/App.vue:137 .inventory-placeholder -> border<br>src/components/sheet/inventory/InventoryItemRow.vue:388 &.is-container -> border-left<br>src/components/sheet/modals/ForgeModal.vue:698 .input-std, .unit-select -> border<br>src/components/sheet/modals/ForgeModal.vue:716 .main-name .input-lg -> border-bottom<br>src/components/sheet/modals/ForgeModal.vue:873 .btn-cancel -> background |
| `#d6dfef` | 5 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:904 button -> color<br>src/components/sheet/modals/EnchantingModal.vue:928 .selected-summary -> color<br>src/components/sheet/modals/EnchantingModal.vue:1052 .full-field -> color<br>src/components/sheet/modals/EnchantingModal.vue:1098 .trait-badge -> color<br>src/components/sheet/modals/EnchantingModal.vue:1279 .quick-actions button -> color |
| `#f2c94c` | 5 | Bio / stats / character header | src/components/sheet/bio/StatsAndSkills.vue:250 &.expertise -> border-left<br>src/components/sheet/bio/StatsAndSkills.vue:251 &.expertise<br>src/components/sheet/bio/StatsAndSkills.vue:252 &.expertise<br>src/components/sheet/bio/StatsAndSkills.vue:270 &.expertise -> background-color<br>src/components/sheet/bio/StatsAndSkills.vue:280 .expertise-chip -> border |
| `#f7d58a` | 5 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:932 strong -> color<br>src/components/sheet/modals/EnchantingModal.vue:996 h4 -> color<br>src/components/sheet/modals/EnchantingModal.vue:1159 .btn-edit-trait -> color<br>src/components/sheet/modals/EnchantingModal.vue:1194 strong -> color<br>src/components/sheet/modals/EnchantingModal.vue:1214 .trait-pill -> color |
| `#ffcdd2` | 5 | Inventory / equipment | src/components/sheet/inventory/EquipmentSlots.vue:297 .rejected-card -> background<br>src/components/sheet/inventory/EquipmentSlots.vue:383 .rejected-card -> background<br>src/components/sheet/inventory/TrashPanel.vue:68 .trash-panel -> border<br>src/components/sheet/inventory/TrashPanel.vue:75 .panel-header -> background<br>src/components/sheet/inventory/TrashPanel.vue:100 .trash-item -> border |
| `#ffffff` | 5 | Bio / stats / character header<br>Combat / actions<br>Inventory / equipment | src/components/sheet/bio/AlignmentPicker.vue:116 .alignment-popover -> background<br>src/components/sheet/bio/ClassSelector.vue:241 &:hover -> color<br>src/components/sheet/bio/ClassSelector.vue:389 .dropdown-menu -> background<br>src/components/sheet/combat/ActionsPanel.vue:1357 &.selected -> background<br>src/components/sheet/inventory/InventoryItemRow.vue:375 .item-row -> background |
| `#222` | 4 | Desktop shell / sidebars<br>Inventory / equipment<br>Library panels | src/components/layout/SidebarRight.vue:226 .root-tab-btn<br>src/components/sheet/inventory/InventoryPanel.vue:613 .inventory-tooltip<br>src/components/sheet/library/LibraryItemsPanel.vue:388 .sticky-sub-header -> position<br>src/components/sheet/library/LibrarySpellsPanel.vue:182 .sticky-sub-header -> position |
| `#252525` | 4 | Desktop shell / sidebars<br>Library panels<br>Right sidebar tools / tooltips | src/components/layout/SidebarRight.vue:225 .root-tab-btn<br>src/components/sheet/library/LibraryItemsPanel.vue:363 .main-group-header -> padding<br>src/components/sheet/library/LibrarySpellsPanel.vue:173 .main-group-header -> padding<br>src/components/sidebar/LibraryTooltip.vue:391 .card-header -> background |
| `#2d2d2d` | 4 | Library panels | src/components/sheet/library/LibraryItemsPanel.vue:366 .main-group-header<br>src/components/sheet/library/LibraryItemsPanel.vue:420 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:175 .main-group-header<br>src/components/sheet/library/LibrarySpellsPanel.vue:200 .branch-header |
| `#444` | 4 | Desktop shell / sidebars<br>Right sidebar tools / tooltips | src/components/layout/SidebarRight.vue:233 input -> width<br>src/components/layout/SidebarRight.vue:242 .scroll-container<br>src/components/sidebar/LibraryTooltip.vue:380 .item-tooltip-card -> border<br>src/components/sidebar/LibraryTooltip.vue:532 .combat-badge |
| `#4f0b22` | 4 | Inventory / equipment | src/components/sheet/inventory/InventoryItemRow.vue:485 .enchant-more -> color<br>src/components/sheet/inventory/InventoryItemRow.vue:567 .btn-attune -> color<br>src/components/sheet/inventory/InventoryItemRow.vue:574 &.active -> background<br>src/components/sheet/inventory/InventoryItemRow.vue:575 &.active -> border-color |
| `#d0d7de` | 4 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1315 .filter-chip -> border<br>src/components/sheet/combat/ActionsPanel.vue:1362 .picker-action -> border<br>src/components/sheet/combat/ActionsPanel.vue:1451 select -> border<br>src/components/sheet/combat/ActionsPanel.vue:1482 .tag-choice -> border |
| `#d8c36a` | 4 | Library panels | src/components/sheet/library/LibraryItemsPanel.vue:403 .category-header<br>src/components/sheet/library/LibrarySpellsPanel.vue:197 .branch-header |
| `#d8ded8` | 4 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1211 .import-strip -> background<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1216 .import-strip<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1217 .import-strip<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1243 .import-strip |
| `#dcdcdc` | 4 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1037 .btn-toggle -> border<br>src/components/sheet/combat/ActionsPanel.vue:1074 .attack-card -> border<br>src/components/sheet/combat/ActionsPanel.vue:1153 .divider -> color<br>src/components/sheet/combat/ActionsPanel.vue:1380 .unarmed-config-btn -> border-color |
| `#dee2e6` | 4 | Inventory / equipment | src/components/sheet/inventory/EquipmentSlots.vue:220 .equip-card -> border<br>src/components/sheet/inventory/InventoryItemRow.vue:517 .qty-controls -> border<br>src/components/sheet/inventory/InventoryItemRow.vue:535 .btn-mini<br>src/components/sheet/inventory/InventoryItemRow.vue:660 .empty-slot -> border |
| `#fdfbf7` | 4 | Spellbook | src/components/sheet/spellbook/SpellbookLeftPanel.vue:299 .btn-step<br>src/components/sheet/spellbook/SpellbookPanel.vue:110 .book-layout -> background<br>src/components/sheet/spellbook/SpellbookPanel.vue:131 .layout-right -> background<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:242 .spell-paper-card -> background |
| `blue` | 4 | GM data-pack maker<br>Inventory / equipment<br>Library panels | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1228 .import-strip<br>src/components/sheet/inventory/InventoryPanel.vue:625 .inventory-tooltip<br>src/components/sheet/library/LibraryItemsPanel.vue:429 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:222 .learned-mark |
| `orange` | 4 | Inventory / equipment<br>Library panels | src/components/sheet/inventory/InventoryPanel.vue:523 &.load-orange<br>src/components/sheet/inventory/InventoryPanel.vue:626 .inventory-tooltip<br>src/components/sheet/library/LibraryItemsPanel.vue:430 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:223 .learned-mark |
| `rgba(0,0,0,0.03)` | 4 | Bio / stats / character header<br>Combat / actions<br>Inventory / equipment | src/components/sheet/bio/ClassSelector.vue:204 .class-badge -> box-shadow<br>src/components/sheet/bio/ClassSelector.vue:315 .badge-btn<br>src/components/sheet/combat/ActionsPanel.vue:1078 .attack-card -> box-shadow<br>src/components/sheet/inventory/EquipmentSlots.vue:227 .equip-card -> box-shadow |
| `rgba(0,0,0,0.5)` | 4 | Inventory / equipment<br>Right sidebar tools / tooltips<br>Spellbook | src/components/sheet/inventory/InventoryPanel.vue:601 .inventory-tooltip -> box-shadow<br>src/components/sheet/spellbook/SpellbookPanel.vue:96 .book-frame -> box-shadow<br>src/components/sidebar/LibraryTooltip.vue:381 .item-tooltip-card -> box-shadow<br>src/components/sidebar/LibraryTooltip.vue:459 .damage-tag -> text-shadow |
| `rgba(245,197,96,0.22)` | 4 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:1042 .trait-option -> border<br>src/components/sheet/modals/EnchantingModal.vue:1103 &.selected -> background<br>src/components/sheet/modals/EnchantingModal.vue:1156 .btn-edit-trait -> border-left<br>src/components/sheet/modals/ForgeModal.vue:635 &:hover -> background |
| `rgba(255,255,255,0.06)` | 4 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:267 .toolbar -> border-bottom<br>src/components/sheet/modals/DataPackManagerModal.vue:293 .create-form -> border-bottom<br>src/components/sheet/modals/EnchantingModal.vue:1044 .trait-option -> background<br>src/components/sheet/modals/EnchantingModal.vue:1259 .empty-inline -> background |
| `#1976d2` | 3 | Inventory / equipment<br>Spellbook | src/components/sheet/inventory/EquipmentSlots.vue:329 .zone-label -> color<br>src/components/sheet/inventory/EquipmentSlots.vue:364 .ghost -> border<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:290 .source-badge |
| `#1a1a1a` | 3 | Library panels | src/components/sheet/library/LibraryItemsPanel.vue:394 .sticky-sub-header<br>src/components/sheet/library/LibrarySpellsPanel.vue:188 .sticky-sub-header<br>src/components/sheet/library/LibrarySpellsPanel.vue:204 .library-item.is-learned -> background-color |
| `#233140` | 3 | Desktop shell / sidebars | src/components/layout/SidebarLeft.vue:665 .group-block -> border-bottom<br>src/components/layout/SidebarLeft.vue:738 .footer-wrapper -> background<br>src/components/layout/SidebarLeft.vue:756 .footer-tools -> padding |
| `#242424` | 3 | Library panels | src/components/sheet/library/LibraryItemsPanel.vue:398 .category-header -> position<br>src/components/sheet/library/LibraryItemsPanel.vue:416 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:192 .branch-header -> position |
| `#2a2a2a` | 3 | Desktop shell / sidebars<br>Library panels | src/components/layout/SidebarRight.vue:231 .search-header -> padding<br>src/components/sheet/library/LibraryItemsPanel.vue:390 .sticky-sub-header<br>src/components/sheet/library/LibrarySpellsPanel.vue:184 .sticky-sub-header |
| `#3d3d3d` | 3 | Library panels<br>Spellbook | src/components/sheet/library/LibraryItemsPanel.vue:398 .category-header -> position<br>src/components/sheet/library/LibrarySpellsPanel.vue:192 .branch-header -> position<br>src/components/sheet/spellbook/SpellbookPanel.vue:111 .book-layout -> color |
| `#495057` | 3 | Inventory / equipment<br>Modals / editors | src/components/sheet/inventory/InventoryItemRow.vue:411 .btn-expand<br>src/components/sheet/inventory/InventoryItemRow.vue:527 .btn-mini -> color<br>src/components/sheet/modals/ForgeModal.vue:873 .btn-cancel -> background |
| `#5f6c7b` | 3 | Inventory / equipment | src/components/sheet/inventory/InventoryItemRow.vue:464 .container-capacity -> color<br>src/components/sheet/inventory/InventoryItemRow.vue:616 .hanging-slot-label -> color<br>src/components/sheet/inventory/InventoryItemRow.vue:650 .hanging-badge -> color |
| `#6c3483` | 3 | Modals / editors | src/components/sheet/modals/ExpertiseSettingsModal.vue:193 &.active -> color<br>src/components/sheet/modals/ExpertiseSettingsModal.vue:226 .tag -> color<br>src/components/sheet/modals/ProficiencySettingsModal.vue:265 &.expertise -> color |
| `#868e96` | 3 | Inventory / equipment | src/components/sheet/inventory/InventoryItemRow.vue:457 .container-badge -> color<br>src/components/sheet/inventory/InventoryItemRow.vue:500 .col-weight -> color<br>src/components/sheet/inventory/InventoryItemRow.vue:552 .qty-static -> color |
| `#bbb` | 3 | Inventory / equipment<br>Modals / editors<br>Shared common components | src/components/common/ItemDescriptionRenderer.vue:42 .item-description -> color<br>src/components/sheet/inventory/InventoryPanel.vue:616 .inventory-tooltip<br>src/components/sheet/modals/ProficiencySettingsModal.vue:250 .btn-toggle |
| `#bbdefb` | 3 | Inventory / equipment<br>Spellbook | src/components/sheet/inventory/EquipmentSlots.vue:343 .equip-card -> border<br>src/components/sheet/inventory/EquipmentSlots.vue:363 .ghost -> background<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:290 .source-badge |
| `#c62828` | 3 | Inventory / equipment | src/components/sheet/inventory/EquipmentSlots.vue:297 .rejected-card -> background<br>src/components/sheet/inventory/EquipmentSlots.vue:384 .rejected-card -> color<br>src/components/sheet/inventory/TrashPanel.vue:105 .trash-item -> color |
| `#c9b458` | 3 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1293 .add-unarmed-btn -> border<br>src/components/sheet/combat/ActionsPanel.vue:1421 .unarmed-row -> border-left<br>src/components/sheet/combat/ActionsPanel.vue:1493 &.active -> border-color |
| `#dcc2ff` | 3 | Inventory / equipment<br>Right sidebar tools / tooltips | src/components/sheet/inventory/InventoryItemRow.vue:566 .btn-attune -> background<br>src/components/sheet/inventory/InventoryPanel.vue:706 strong -> color<br>src/components/sidebar/LibraryTooltip.vue:582 strong -> color |
| `#e57373` | 3 | Inventory / equipment | src/components/sheet/inventory/EquipmentSlots.vue:298 .rejected-card -> border<br>src/components/sheet/inventory/EquipmentSlots.vue:385 .rejected-card -> border<br>src/components/sheet/inventory/TrashPanel.vue:90 .empty-tip -> color |
| `#eb984e` | 3 | Inventory / equipment<br>Library panels | src/components/sheet/inventory/InventoryPanel.vue:626 .inventory-tooltip<br>src/components/sheet/library/LibraryItemsPanel.vue:430 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:223 .learned-mark |
| `#f0f8ff` | 3 | Bio / stats / character header<br>Modals / editors | src/components/sheet/bio/ClassSelector.vue:368 .empty-btn<br>src/components/sheet/bio/ClassSelector.vue:377 .btn-multiclass-add<br>src/components/sheet/modals/ForgeModal.vue:680 &.type-specific |
| `#f4ecf7` | 3 | Modals / editors | src/components/sheet/modals/ExpertiseSettingsModal.vue:192 &.active -> background<br>src/components/sheet/modals/ExpertiseSettingsModal.vue:225 .tag -> background<br>src/components/sheet/modals/ProficiencySettingsModal.vue:264 &.expertise -> background |
| `#f5f0df` | 3 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:759 .enchant-panel -> color<br>src/components/sheet/modals/EnchantingModal.vue:797 .btn-close -> color<br>src/components/sheet/modals/EnchantingModal.vue:1070 textarea -> color |
| `purple` | 3 | GM data-pack maker<br>Library panels | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1226 .import-strip<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1227 .import-strip<br>src/components/sheet/library/LibraryItemsPanel.vue:434 .weapon-filter-button |
| `red` | 3 | Inventory / equipment<br>Library panels | src/components/sheet/inventory/InventoryPanel.vue:527 &.load-red<br>src/components/sheet/inventory/InventoryPanel.vue:628 .inventory-tooltip<br>src/components/sheet/library/LibraryItemsPanel.vue:432 .weapon-filter-button |
| `rgba(0,0,0,0.02)` | 3 | Bio / stats / character header<br>Inventory / equipment<br>Spellbook | src/components/sheet/bio/BioPanel.vue:167 .card -> box-shadow<br>src/components/sheet/inventory/InventoryItemRow.vue:597 .container-contents -> box-shadow<br>src/components/sheet/spellbook/SpellbookLeftPanel.vue:239 .ability-card -> box-shadow |
| `rgba(0,0,0,0.15)` | 3 | Bio / stats / character header | src/components/sheet/bio/AlignmentPicker.vue:106 &:hover -> box-shadow<br>src/components/sheet/bio/AlignmentPicker.vue:119 .alignment-popover -> box-shadow<br>src/components/sheet/bio/HeaderInfo.vue:306 .btn-tool |
| `rgba(0,0,0,0.22)` | 3 | Global overlays / feedback<br>Inventory / equipment<br>Modals / editors | src/components/sheet/inventory/InventoryPanel.vue:609 .inventory-tooltip<br>src/components/sheet/modals/EnchantingModal.vue:1069 textarea -> background<br>src/components/ui/GlobalFeedback.vue:208 .feedback-toast -> box-shadow |
| `rgba(0,0,0,0.3)` | 3 | Global overlays / feedback<br>Modals / editors<br>Right sidebar tools / tooltips | src/components/sheet/modals/ForgeModal.vue:603 .modal-content -> box-shadow<br>src/components/sidebar/LibraryTooltip.vue:517 .spell-stats-grid -> background<br>src/components/ui/GlobalTooltip.vue:111 .global-tooltip -> box-shadow |
| `rgba(0,0,0,0.6)` | 3 | Bio / stats / character header<br>Modals / editors | src/components/sheet/bio/BioPanel.vue:113 .modal-backdrop -> background<br>src/components/sheet/modals/ExpertiseSettingsModal.vue:104 .modal-backdrop -> background<br>src/components/sheet/modals/ProficiencySettingsModal.vue:223 .modal-backdrop -> background |
| `rgba(235,152,78,0.1)` | 3 | Inventory / equipment<br>Library panels | src/components/sheet/inventory/InventoryPanel.vue:626 .inventory-tooltip<br>src/components/sheet/library/LibraryItemsPanel.vue:430 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:223 .learned-mark |
| `rgba(236,112,99,0.1)` | 3 | Inventory / equipment<br>Library panels<br>Modals / editors | src/components/sheet/inventory/InventoryPanel.vue:628 .inventory-tooltip<br>src/components/sheet/library/LibraryItemsPanel.vue:432 .weapon-filter-button<br>src/components/sheet/modals/DataPackManagerModal.vue:421 .unlock-inline button.secondary -> background |
| `rgba(245,197,96,0.16)` | 3 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:817 .enchant-sidebar -> border-right<br>src/components/sheet/modals/EnchantingModal.vue:900 button -> border<br>src/components/sheet/modals/EnchantingModal.vue:1311 .enchant-sidebar -> border-bottom |
| `rgba(245,197,96,0.18)` | 3 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:756 .enchant-panel<br>src/components/sheet/modals/EnchantingModal.vue:982 .form-section -> border<br>src/components/sheet/modals/EnchantingModal.vue:1228 .saved-trait-edit -> border |
| `rgba(93,173,226,0.1)` | 3 | Inventory / equipment<br>Library panels | src/components/sheet/inventory/InventoryPanel.vue:625 .inventory-tooltip<br>src/components/sheet/library/LibraryItemsPanel.vue:429 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:222 .learned-mark |
| `#117864` | 2 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1670 .ritual-badge -> color<br>src/components/sheet/combat/ActionsPanel.vue:1775 &.ritual -> color |
| `#15191e` | 2 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:266 .toolbar -> background<br>src/components/sheet/modals/DataPackManagerModal.vue:357 span -> background |
| `#171b21` | 2 | Modals / editors | src/components/sheet/modals/DataPackUnlockModal.vue:99 .unlock-modal -> background<br>src/components/sheet/modals/DataPackUnlockModal.vue:111 .unlock-header -> background |
| `#181818` | 2 | Desktop shell / sidebars<br>Right sidebar tools / tooltips | src/components/layout/SidebarRight.vue:221 .root-tabs -> display<br>src/components/sidebar/ForgeDropZone.vue:94 .forge-drop-zone -> background |
| `#355c7d` | 2 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:180 .btn-primary -> background<br>src/components/ui/GlobalFeedback.vue:209 .feedback-toast -> background |
| `#39424c` | 2 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:299 input, textarea -> border<br>src/components/sheet/modals/DataPackManagerModal.vue:404 .unlock-inline input -> border |
| `#3e5871` | 2 | Desktop shell / sidebars | src/components/layout/SidebarLeft.vue:750 .btn-zoom<br>src/components/layout/SidebarLeft.vue:760 .btn-tool |
| `#455a64` | 2 | Desktop shell / sidebars | src/components/layout/SidebarLeft.vue:749 .btn-zoom -> background<br>src/components/layout/SidebarLeft.vue:759 .btn-tool -> flex |
| `#48c9b0` | 2 | Inventory / equipment<br>Library panels | src/components/sheet/inventory/InventoryPanel.vue:627 .inventory-tooltip<br>src/components/sheet/library/LibraryItemsPanel.vue:431 .weapon-filter-button |
| `#4e342e` | 2 | Spellbook | src/components/sheet/spellbook/SpellbookLeftPanel.vue:209 .panel-header<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:193 .panel-header |
| `#536052` | 2 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1199 .unlock-override -> color<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1211 .import-strip -> background |
| `#5b2a86` | 2 | Bio / stats / character header | src/components/sheet/bio/StatsAndSkills.vue:249 &.expertise -> background<br>src/components/sheet/bio/StatsAndSkills.vue:281 .expertise-chip -> background |
| `#5d6d7e` | 2 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1252 p -> color<br>src/components/sheet/combat/ActionsPanel.vue:1711 .equipment-badge -> color |
| `#82e0aa` | 2 | Library panels | src/components/sheet/library/LibraryItemsPanel.vue:417 .weapon-filter-button<br>src/components/sheet/library/LibraryItemsPanel.vue:433 .weapon-filter-button |
| `#8a5a00` | 2 | Bio / stats / character header<br>Combat / actions | src/components/sheet/bio/StatsAndSkills.vue:293 .jack-chip -> color<br>src/components/sheet/combat/CombatPanel.vue:451 .jack-chip -> color |
| `#8e9aaf` | 2 | Inventory / equipment | src/components/sheet/inventory/InventoryItemRow.vue:605 .hanging-slot-shell -> border-left<br>src/components/sheet/inventory/InventoryItemRow.vue:632 .hanging-dot -> background |
| `#9a79bd` | 2 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1226 .import-strip<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1239 .import-strip |
| `#9fb2c8` | 2 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:1204 span -> color<br>src/components/sheet/modals/EnchantingModal.vue:1251 span -> color |
| `#a996c8` | 2 | Inventory / equipment | src/components/sheet/inventory/InventoryPanel.vue:660 span -> color<br>src/components/sheet/inventory/InventoryPanel.vue:674 .magic-visual-row -> color |
| `#aab7c4` | 2 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:373 .unlock-result-bar -> color<br>src/components/sheet/modals/DataPackUnlockModal.vue:114 .unlock-header |
| `#b7a2e6` | 2 | Inventory / equipment<br>Right sidebar tools / tooltips | src/components/sheet/inventory/InventoryPanel.vue:710 span -> color<br>src/components/sidebar/LibraryTooltip.vue:586 span -> color |
| `#c7d2e2` | 2 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:966 .empty-state -> color<br>src/components/sheet/modals/EnchantingModal.vue:1031 .trait-type-note -> color |
| `#c8c8c8` | 2 | Library panels | src/components/sheet/library/LibraryItemsPanel.vue:399 .category-header -> font-size<br>src/components/sheet/library/LibrarySpellsPanel.vue:193 .branch-header -> font-size |
| `#c9c1d8` | 2 | Inventory / equipment<br>Right sidebar tools / tooltips | src/components/sheet/inventory/InventoryPanel.vue:694 p -> color<br>src/components/sidebar/LibraryTooltip.vue:570 p -> color |
| `#d4ac0d` | 2 | Inventory / equipment<br>Library panels | src/components/sheet/inventory/InventoryPanel.vue:577 button<br>src/components/sheet/library/LibraryItemsPanel.vue:425 .weapon-filter-button |
| `#d6a84f` | 2 | Bio / stats / character header<br>Combat / actions | src/components/sheet/bio/StatsAndSkills.vue:295 .jack-chip -> border<br>src/components/sheet/combat/CombatPanel.vue:453 .jack-chip -> border |
| `#dfe6e9` | 2 | Bio / stats / character header | src/components/sheet/bio/StatsAndSkills.vue:162 .attr-card -> border<br>src/components/sheet/bio/StatsAndSkills.vue:303 .jack-chip |
| `#e1e2e6` | 2 | Modals / editors | src/components/sheet/modals/ForgeModal.vue:662 &.highlight -> border<br>src/components/sheet/modals/ForgeModal.vue:816 .check-option -> border |
| `#e3f2fd` | 2 | Inventory / equipment<br>Spellbook | src/components/sheet/inventory/EquipmentSlots.vue:317 .equipment-zone -> background<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:290 .source-badge |
| `#e8f5e9` | 2 | Inventory / equipment<br>Modals / editors | src/components/sheet/inventory/InventoryItemRow.vue:666 .empty-slot<br>src/components/sheet/modals/ProficiencySettingsModal.vue:262 .tag |
| `#e8f8f5` | 2 | Spellbook | src/components/sheet/spellbook/SpellbookPanel.vue:155 .book-toast<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:278 &:before |
| `#ead9a8` | 2 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1263 .import-strip<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1271 .import-strip |
| `#ec7063` | 2 | Inventory / equipment<br>Library panels | src/components/sheet/inventory/InventoryPanel.vue:628 .inventory-tooltip<br>src/components/sheet/library/LibraryItemsPanel.vue:432 .weapon-filter-button |
| `#eef3f6` | 2 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1194 .add-card -> background<br>src/components/sheet/combat/ActionsPanel.vue:1280 .attack-ghost -> background |
| `#eef4ef` | 2 | GM data-pack maker<br>Modals / editors | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1211 .import-strip -> background<br>src/components/sheet/modals/ForgeModal.vue:666 &.maker-assignment -> background |
| `#f0f0f0` | 2 | Bio / stats / character header<br>Combat / actions | src/components/sheet/bio/StatsAndSkills.vue:244 .skill-row -> display<br>src/components/sheet/combat/CombatPanel.vue:397 &:hover -> background |
| `#f0f2f5` | 2 | Global stylesheet | src/style.css:10 :root -> background-color<br>src/style.css:23 body -> background-color |
| `#f1f2f6` | 2 | Bio / stats / character header<br>Modals / editors | src/components/sheet/bio/ClassSelector.vue:214 .is-multiclass .class-badge -> background<br>src/components/sheet/modals/ForgeModal.vue:659 &.highlight -> background |
| `#f4f1ea` | 2 | Spellbook | src/components/sheet/spellbook/SpellbookLeftPanel.vue:276 .stat-box -> flex<br>src/components/sheet/spellbook/SpellbookPanel.vue:119 .layout-left -> background |
| `#f8fbfd` | 2 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1223 .attack-picker-modal -> background<br>src/components/sheet/combat/ActionsPanel.vue:1392 .unarmed-editor-modal -> background |
| `#f9df9c` | 2 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:910 &.active -> color<br>src/components/sheet/modals/EnchantingModal.vue:1104 &.selected -> color |
| `#f9f9f9` | 2 | Combat / actions<br>Inventory / equipment | src/components/sheet/combat/CombatPanel.vue:384 .stat-box -> background<br>src/components/sheet/inventory/InventoryPanel.vue:547 .coin-control -> background |
| `#ffbc8a` | 2 | Inventory / equipment<br>Right sidebar tools / tooltips | src/components/sheet/inventory/InventoryPanel.vue:716 .trait-damage -> color<br>src/components/sidebar/LibraryTooltip.vue:592 .trait-damage -> color |
| `#ffc5be` | 2 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:422 .unlock-inline button.secondary -> color<br>src/components/sheet/modals/DataPackUnlockModal.vue:156 .clear-btn -> color |
| `#fff0f0` | 2 | Combat / actions<br>Inventory / equipment | src/components/sheet/combat/CombatPanel.vue:578 .btn-full<br>src/components/sheet/inventory/TrashPanel.vue:67 .trash-panel -> background |
| `#fff3cd` | 2 | Bio / stats / character header<br>Combat / actions | src/components/sheet/bio/StatsAndSkills.vue:294 .jack-chip -> background<br>src/components/sheet/combat/CombatPanel.vue:452 .jack-chip -> background |
| `currentcolor` | 2 | GM data-pack maker<br>Library panels | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1288 .import-strip<br>src/components/sheet/library/LibraryItemsPanel.vue:424 .weapon-filter-button |
| `cyan` | 2 | Inventory / equipment<br>Library panels | src/components/sheet/inventory/InventoryPanel.vue:627 .inventory-tooltip<br>src/components/sheet/library/LibraryItemsPanel.vue:431 .weapon-filter-button |
| `gold` | 2 | Inventory / equipment<br>Right sidebar tools / tooltips | src/components/sheet/inventory/InventoryPanel.vue:618 .inventory-tooltip<br>src/components/sidebar/LibraryTooltip.vue:547 .capacity-row |
| `rgba(0,0,0,0.08)` | 2 | Combat / actions<br>Inventory / equipment | src/components/sheet/combat/CombatPanel.vue:491 .ac-magic-badge -> box-shadow<br>src/components/sheet/inventory/EquipmentSlots.vue:236 &:hover -> box-shadow |
| `rgba(0,0,0,0.14)` | 2 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:1033 .trait-type-note -> background<br>src/components/sheet/modals/EnchantingModal.vue:1230 .saved-trait-edit -> background |
| `rgba(0,0,0,0.24)` | 2 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:1189 .trait-hover-card<br>src/components/sheet/modals/EnchantingModal.vue:1213 .trait-pill -> background |
| `rgba(0,0,0,0.45)` | 2 | Inventory / equipment<br>Modals / editors | src/components/sheet/inventory/InventoryPanel.vue:683 .color-swatch -> box-shadow<br>src/components/sheet/modals/DataPackManagerModal.vue:234 .data-pack-modal -> box-shadow |
| `rgba(130,224,170,0.08)` | 2 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:430 .unlock-result-bar -> background<br>src/components/sheet/modals/DataPackUnlockModal.vue:174 .result-card -> background |
| `rgba(142,154,175,0.08)` | 2 | Inventory / equipment | src/components/sheet/inventory/InventoryItemRow.vue:607 .hanging-slot-shell -> background<br>src/components/sheet/inventory/InventoryItemRow.vue:619 .hanging-slot-label -> background |
| `rgba(142,68,173,0.2)` | 2 | Spellbook | src/components/sheet/spellbook/SpellbookLeftPanel.vue:283 .warlock-block -> background<br>src/components/sheet/spellbook/SpellbookLeftPanel.vue:284 .warlock-block |
| `rgba(15,23,42,0.25)` | 2 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1226 .attack-picker-modal -> box-shadow<br>src/components/sheet/combat/ActionsPanel.vue:1395 .unarmed-editor-modal -> box-shadow |
| `rgba(215,193,255,0.24)` | 2 | Inventory / equipment<br>Right sidebar tools / tooltips | src/components/sheet/inventory/InventoryPanel.vue:687 .magic-trait-card -> border<br>src/components/sidebar/LibraryTooltip.vue:563 .magic-trait-card -> border |
| `rgba(22,160,133,0.12)` | 2 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1668 .ritual-badge -> background<br>src/components/sheet/combat/ActionsPanel.vue:1774 &.ritual -> background |
| `rgba(22,160,133,0.35)` | 2 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1669 .ritual-badge -> border<br>src/components/sheet/combat/ActionsPanel.vue:1776 &.ritual -> border |
| `rgba(240,231,255,0.08)` | 2 | Inventory / equipment<br>Right sidebar tools / tooltips | src/components/sheet/inventory/InventoryPanel.vue:690 .magic-trait-card -> background<br>src/components/sidebar/LibraryTooltip.vue:566 .magic-trait-card -> background |
| `rgba(245,197,96,0.12)` | 2 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:1238 &.focused -> box-shadow<br>src/components/sheet/modals/ForgeModal.vue:628 .btn-enchant -> background |
| `rgba(245,197,96,0.14)` | 2 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:854 .empty-rune -> background<br>src/components/sheet/modals/EnchantingModal.vue:909 &.active -> background |
| `rgba(245,197,96,0.2)` | 2 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:772 .enchant-footer -> border-bottom<br>src/components/sheet/modals/EnchantingModal.vue:782 .enchant-footer -> border-top |
| `rgba(245,197,96,0.24)` | 2 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:827 .target-card -> border<br>src/components/sheet/modals/EnchantingModal.vue:1095 .trait-badge -> border |
| `rgba(245,197,96,0.45)` | 2 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:753 .enchant-panel -> border<br>src/components/sheet/modals/EnchantingModal.vue:1190 .trait-hover-card |
| `rgba(245,197,96,0.72)` | 2 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:1110 &:focus-within -> border-color<br>src/components/sheet/modals/EnchantingModal.vue:1237 &.focused -> border-color |
| `rgba(255,255,255,0.055)` | 2 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:903 button -> background<br>src/components/sheet/modals/EnchantingModal.vue:984 .form-section -> background |
| `rgba(255,255,255,0.07)` | 2 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:321 .pack-card -> border<br>src/components/sheet/modals/EnchantingModal.vue:829 .target-card -> background |
| `rgba(255,255,255,0.1)` | 2 | Desktop shell / sidebars<br>Library panels | src/components/layout/SidebarLeft.vue:637 .btn-text<br>src/components/sheet/library/LibrarySpellsPanel.vue:225 .learned-mark |
| `rgba(255,255,255,0.2)` | 2 | GM data-pack maker<br>Global overlays / feedback | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1286 .import-strip<br>src/components/ui/GlobalTooltip.vue:128 .tooltip-title -> border-bottom |
| `rgba(255,255,255,0.42)` | 2 | GM data-pack maker<br>Inventory / equipment | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1196 .unlock-override -> background<br>src/components/sheet/inventory/InventoryPanel.vue:681 .color-swatch -> border |
| `rgba(30,30,30,0.98)` | 2 | Inventory / equipment<br>Right sidebar tools / tooltips | src/components/sheet/inventory/InventoryPanel.vue:596 .inventory-tooltip -> background<br>src/components/sidebar/LibraryTooltip.vue:379 .item-tooltip-card -> background |
| `rgba(44,62,80,0.95)` | 2 | Global overlays / feedback<br>Spellbook | src/components/sheet/spellbook/SpellbookPanel.vue:144 .book-toast -> background<br>src/components/ui/GlobalTooltip.vue:103 .global-tooltip -> background |
| `rgba(52,152,219,0.2)` | 2 | Bio / stats / character header<br>Desktop shell / sidebars | src/components/layout/SidebarLeft.vue:703 li<br>src/components/sheet/bio/AlignmentPicker.vue:156 &.active -> box-shadow |
| `rgba(52,73,94,0.16)` | 2 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1224 .attack-picker-modal -> border<br>src/components/sheet/combat/ActionsPanel.vue:1393 .unarmed-editor-modal -> border |
| `rgba(72,201,176,0.1)` | 2 | Inventory / equipment<br>Library panels | src/components/sheet/inventory/InventoryPanel.vue:627 .inventory-tooltip<br>src/components/sheet/library/LibraryItemsPanel.vue:431 .weapon-filter-button |
| `#000` | 1 | Spellbook | src/components/sheet/spellbook/SpellbookLeftPanel.vue:296 .btn-step |
| `#111` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1726 .equipment-dot -> border |
| `#11151a` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:292 .create-form -> background |
| `#121821` | 1 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:758 .enchant-panel |
| `#151a20` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:406 .unlock-inline input -> background |
| `#16191f` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:243 .modal-header -> background |
| `#16a085` | 1 | Library panels | src/components/sheet/library/LibrarySpellsPanel.vue:224 .learned-mark |
| `#171b23` | 1 | Right sidebar tools / tooltips | src/components/sidebar/EnchantDropZone.vue:81 .enchant-drop-zone -> background |
| `#191d22` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:230 .data-pack-modal -> background |
| `#1a252f` | 1 | Desktop shell / sidebars | src/components/layout/SidebarLeft.vue:675 .group-header -> background-color |
| `#1b1b1b` | 1 | Library panels | src/components/sheet/library/LibraryItemsPanel.vue:415 .weapon-filter-button -> border |
| `#1c2229` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:301 input, textarea -> background |
| `#1c2531` | 1 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:758 .enchant-panel |
| `#20242c` | 1 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:1291 .btn-save -> color |
| `#20252b` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1181 |
| `#20262d` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:320 .pack-card -> background |
| `#211f16` | 1 | Right sidebar tools / tooltips | src/components/sidebar/EnchantDropZone.vue:91 &.is-active -> background |
| `#212529` | 1 | Inventory / equipment | src/components/sheet/inventory/InventoryItemRow.vue:534 .btn-mini |
| `#213547` | 1 | Global stylesheet | src/style.css:9 :root -> color |
| `#222934` | 1 | Modals / editors | src/components/sheet/modals/DataPackUnlockModal.vue:140 input -> background |
| `#223044` | 1 | Modals / editors | src/components/sheet/modals/DataPackUnlockModal.vue:111 .unlock-header -> background |
| `#22313f` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1246 h3 -> color |
| `#251e1e` | 1 | Right sidebar tools / tooltips | src/components/sidebar/ForgeDropZone.vue:102 &.is-active -> background |
| `#26313b` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:243 .modal-header -> background |
| `#2b241e` | 1 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:101 .feedback-dialog -> color |
| `#2b5e89` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1228 .import-strip |
| `#2d7d46` | 1 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:122 .feedback-dialog.tone-success .dialog-accent -> background |
| `#2e7d32` | 1 | Modals / editors | src/components/sheet/modals/ProficiencySettingsModal.vue:262 .tag |
| `#2f7a4b` | 1 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:213 .feedback-toast.tone-success -> background |
| `#31724a` | 1 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:193 .btn-primary.tone-success -> background |
| `#333333` | 1 | Inventory / equipment | src/components/sheet/inventory/InventoryItemRow.vue:376 .item-row -> color |
| `#343a40` | 1 | Inventory / equipment | src/components/sheet/inventory/InventoryItemRow.vue:546 .qty-val -> color |
| `#354333` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1278 .import-strip |
| `#3a175f` | 1 | Library panels | src/components/sheet/library/LibraryItemsPanel.vue:384 .passphrase-toggle |
| `#3a3a3a` | 1 | Shared common components | src/components/common/ItemDescriptionRenderer.vue:81 .desc-table td -> border |
| `#3a4653` | 1 | Modals / editors | src/components/sheet/modals/DataPackUnlockModal.vue:138 input -> border |
| `#4a235a` | 1 | Modals / editors | src/components/sheet/modals/ExpertiseSettingsModal.vue:188 &:hover -> color |
| `#4a6278` | 1 | Right sidebar tools / tooltips | src/components/sidebar/LibraryTooltip.vue:478 .prop-capsule -> border |
| `#4b2d73` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1492 &.active -> background |
| `#546e7a` | 1 | Inventory / equipment | src/components/sheet/inventory/EquipmentSlots.vue:194 .zone-label -> color |
| `#55614f` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1282 .import-strip |
| `#56473b` | 1 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:147 .dialog-message -> color |
| `#566056` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1235 .import-strip |
| `#566573` | 1 | Modals / editors | src/components/sheet/modals/ExpertiseSettingsModal.vue:176 .btn-toggle -> color |
| `#573777` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1226 .import-strip |
| `#58a86e` | 1 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:122 .feedback-dialog.tone-success .dialog-accent -> background |
| `#596359` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1219 .import-strip |
| `#5b4736` | 1 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:176 .btn-secondary -> color |
| `#5c8fbd` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1228 .import-strip |
| `#5d4775` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1239 .import-strip |
| `#5f7182` | 1 | Global overlays / feedback | src/components/ui/GlobalTooltip.vue:120 .global-tooltip |
| `#604d23` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1221 .import-strip |
| `#607080` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1446 span -> color |
| `#66706a` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1187 .maker-header |
| `#66788a` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1275 .attack-picker-subtitle -> color |
| `#6a4a1f` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1224 .import-strip |
| `#6a5632` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1186 .maker-header |
| `#6c4a7f` | 1 | Inventory / equipment | src/components/sheet/inventory/InventoryItemRow.vue:492 .enchant-more -> color |
| `#6f4e00` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1295 .add-unarmed-btn -> color |
| `#6f7890` | 1 | Right sidebar tools / tooltips | src/components/sidebar/EnchantDropZone.vue:86 .enchant-drop-zone -> color |
| `#718071` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1279 .import-strip |
| `#746b58` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1270 .import-strip |
| `#75808b` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:465 .empty -> color |
| `#778077` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1253 .import-strip |
| `#788178` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1249 .import-strip |
| `#7890a4` | 1 | Global overlays / feedback | src/components/ui/GlobalTooltip.vue:121 .global-tooltip |
| `#7a5520` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1250 .import-strip |
| `#7b847b` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1252 .import-strip |
| `#7f8b96` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:285 &:disabled |
| `#7f8d9b` | 1 | Modals / editors | src/components/sheet/modals/DataPackUnlockModal.vue:187 .hint -> color |
| `#8c6f58` | 1 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:134 .dialog-kicker -> color |
| `#8d2f2f` | 1 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:114 .feedback-dialog.tone-danger .dialog-accent -> background |
| `#90a4ae` | 1 | Inventory / equipment | src/components/sheet/inventory/EquipmentSlots.vue:179 &:hover -> border-color |
| `#90caf9` | 1 | Inventory / equipment | src/components/sheet/inventory/EquipmentSlots.vue:318 .equipment-zone -> border |
| `#922b21` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1412 .unarmed-error -> color |
| `#92c7ff` | 1 | Modals / editors | src/components/sheet/modals/DataPackUnlockModal.vue:115 .unlock-header |
| `#95a38d` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1202 .unlock-override |
| `#98a2ad` | 1 | Inventory / equipment | src/components/sheet/inventory/InventoryItemRow.vue:641 .hanging-empty-slot -> color |
| `#98a5b1` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:345 .description -> color |
| `#9aa5b1` | 1 | Inventory / equipment | src/components/sheet/inventory/InventoryItemRow.vue:623 small -> color |
| `#9b5a17` | 1 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:118 .feedback-dialog.tone-warning .dialog-accent -> background |
| `#9ba89b` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1290 .import-strip |
| `#9c3026` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1206 .unlock-override |
| `#9ed0ff` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:333 .tag -> color |
| `#a03b3b` | 1 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:221 .feedback-toast.tone-danger -> background |
| `#a04000` | 1 | Inventory / equipment | src/components/sheet/inventory/InventoryPanel.vue:579 button |
| `#a3641f` | 1 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:217 .feedback-toast.tone-warning -> background |
| `#aab5c0` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:247 .modal-header |
| `#aab7b8` | 1 | Right sidebar tools / tooltips | src/components/sidebar/LibraryTooltip.vue:511 .tag |
| `#ad6a21` | 1 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:185 .btn-primary.tone-warning -> background |
| `#aeb9c5` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:444 .export-option -> color |
| `#aeb9c8` | 1 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:919 small -> color |
| `#af7ac5` | 1 | Modals / editors | src/components/sheet/modals/ExpertiseSettingsModal.vue:238 .tag-remove -> color |
| `#b13a37` | 1 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:189 .btn-primary.tone-danger -> background |
| `#b46a32` | 1 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:110 .dialog-accent -> background |
| `#b58cff` | 1 | Inventory / equipment | src/components/sheet/inventory/InventoryItemRow.vue:564 .btn-attune -> border |
| `#b78945` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1224 .import-strip |
| `#b7950b` | 1 | Inventory / equipment | src/components/sheet/inventory/InventoryPanel.vue:520 &.load-yellow -> color |
| `#b7c4ce` | 1 | Modals / editors | src/components/sheet/modals/DataPackUnlockModal.vue:176 .result-card |
| `#b8c2cc` | 1 | Inventory / equipment | src/components/sheet/inventory/InventoryItemRow.vue:604 .hanging-slot-shell -> border |
| `#b9c4ce` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:296 .create-form |
| `#bdf0d5` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:274 .pack-actions button -> color |
| `#c2185b` | 1 | Spellbook | src/components/sheet/spellbook/SpellbookRightPanel.vue:291 .source-badge |
| `#c6d0da` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:358 span -> color |
| `#c6d1dc` | 1 | Modals / editors | src/components/sheet/modals/DataPackUnlockModal.vue:136 .unlock-form |
| `#c7b4df` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1244 .import-strip |
| `#c86f66` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1206 .unlock-override |
| `#c8e6ff` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:414 .unlock-inline button -> color |
| `#c9d2df` | 1 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:1199 p -> color |
| `#cbd8c8` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1281 .import-strip |
| `#cdb8ff` | 1 | Library panels | src/components/sheet/library/LibraryItemsPanel.vue:409 .category-header.passphrase-header |
| `#cdeaff` | 1 | Modals / editors | src/components/sheet/modals/DataPackUnlockModal.vue:148 button -> color |
| `#cfd8cf` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1237 .import-strip |
| `#cfd8dc` | 1 | Inventory / equipment | src/components/sheet/inventory/EquipmentSlots.vue:170 .equipment-zone -> border |
| `#cfe0d1` | 1 | Modals / editors | src/components/sheet/modals/ForgeModal.vue:669 &.maker-assignment -> border |
| `#d6eaf8` | 1 | Modals / editors | src/components/sheet/modals/ForgeModal.vue:680 &.type-specific |
| `#d75a4a` | 1 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:114 .feedback-dialog.tone-danger .dialog-accent -> background |
| `#d7bde2` | 1 | Modals / editors | src/components/sheet/modals/ProficiencySettingsModal.vue:266 &.expertise -> border |
| `#d7dde3` | 1 | Modals / editors | src/components/sheet/modals/ExpertiseSettingsModal.vue:174 .btn-toggle -> border |
| `#d7e1eb` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:458 .switch -> color |
| `#d7e5df` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1184 .maker-header -> background |
| `#d8a15d` | 1 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:110 .dialog-accent -> background |
| `#d8ebff` | 1 | Desktop shell / sidebars | src/components/layout/SidebarRight.vue:252 .data-pack-entry -> color |
| `#d9982c` | 1 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:118 .feedback-dialog.tone-warning .dialog-accent -> background |
| `#d9c49e` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:387 .visibility-line.subtle span -> color |
| `#dbe5db` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1219 .import-strip |
| `#dbe8f5` | 1 | Modals / editors | src/components/sheet/modals/DataPackUnlockModal.vue:165 .result-list |
| `#dcdde1` | 1 | Modals / editors | src/components/sheet/modals/ForgeModal.vue:849 .tag |
| `#dde6db` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1284 .import-strip |
| `#dfc27b` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1255 .import-strip |
| `#dfe6ee` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1420 .unarmed-row -> border |
| `#e0e5df` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1240 .import-strip |
| `#e0e6df` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1277 .import-strip |
| `#e2d2ad` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1221 .import-strip |
| `#e3e8e3` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1248 .import-strip |
| `#e3e8ea` | 1 | Bio / stats / character header | src/components/sheet/bio/StatsAndSkills.vue:217 .saving-throw-row |
| `#e4b46a` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1250 .import-strip |
| `#e6d8ff` | 1 | Inventory / equipment | src/components/sheet/inventory/InventoryPanel.vue:664 strong -> color |
| `#e8e4db` | 1 | Spellbook | src/components/sheet/spellbook/SpellbookLeftPanel.vue:276 .stat-box -> flex |
| `#e8edf2` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:231 .data-pack-modal -> color |
| `#e8edf7` | 1 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:1179 .trait-hover-card -> color |
| `#e8eef4` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1238 .attack-picker-header -> background |
| `#e8f4fd` | 1 | Bio / stats / character header | src/components/sheet/bio/AlignmentPicker.vue:152 &.active -> background-color |
| `#e8f6f3` | 1 | Bio / stats / character header | src/components/sheet/bio/StatsAndSkills.vue:247 .skill-row |
| `#eadbff` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1227 .import-strip |
| `#eaf0f6` | 1 | Modals / editors | src/components/sheet/modals/DataPackUnlockModal.vue:98 .unlock-modal -> color |
| `#eaf5ff` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1228 .import-strip |
| `#edf3ea` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1278 .import-strip |
| `#eef2f3` | 1 | Shared common components | src/components/common/EditableText.vue:103 .editable-container:hover -> background-color |
| `#eef2f5` | 1 | Bio / stats / character header | src/components/sheet/bio/ClassSelector.vue:259 .badge-level-controls -> background |
| `#eef4f8` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1357 &.selected -> background |
| `#ef9a9a` | 1 | Inventory / equipment | src/components/sheet/inventory/TrashPanel.vue:123 .ghost -> background |
| `#f0cfaa` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:398 .visibility-warning -> color |
| `#f0e7ff` | 1 | Library panels | src/components/sheet/library/LibraryItemsPanel.vue:410 .category-header.passphrase-header |
| `#f0f4f8` | 1 | Bio / stats / character header | src/components/sheet/bio/ClassSelector.vue:440 li:hover -> background |
| `#f2e9ff` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1226 .import-strip |
| `#f2eadb` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1184 .maker-header -> background |
| `#f39c12` | 1 | Desktop shell / sidebars | src/components/layout/SidebarLeft.vue:718 .player-name -> color |
| `#f3db82` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:337 &.builtin -> color |
| `#f3f6f8` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1326 &:hover -> background |
| `#f4d06f` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1494 &.active -> color |
| `#f4f6f7` | 1 | Bio / stats / character header | src/components/sheet/bio/StatsAndSkills.vue:212 .saving-throw-row -> background |
| `#f5d184` | 1 | Modals / editors | src/components/sheet/modals/ForgeModal.vue:629 .btn-enchant -> color |
| `#f5f5f5` | 1 | Combat / actions | src/components/sheet/combat/CombatPanel.vue:640 .hd-controls -> background |
| `#f5f6fa` | 1 | Desktop shell / sidebars | src/components/layout/AppLayout.vue:33 .main-sheet -> background-color |
| `#f5f8fb` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1238 .attack-picker-header -> background |
| `#f7f3ea` | 1 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:100 .feedback-dialog -> background |
| `#f8bbd0` | 1 | Spellbook | src/components/sheet/spellbook/SpellbookRightPanel.vue:291 .source-badge |
| `#f8fafc` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1483 .tag-choice -> background |
| `#f8fbf6` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1219 .import-strip |
| `#f9fbfc` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1194 .add-card -> background |
| `#fadbd8` | 1 | Inventory / equipment | src/components/sheet/inventory/EquipmentSlots.vue:202 .global-warning -> background |
| `#faf6ff` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1239 .import-strip |
| `#faf9f7` | 1 | Spellbook | src/components/sheet/spellbook/SpellbookLeftPanel.vue:241 .ability-card |
| `#fbfcfa` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1284 .import-strip |
| `#fbfdfa` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1277 .import-strip |
| `#fce4ec` | 1 | Spellbook | src/components/sheet/spellbook/SpellbookRightPanel.vue:291 .source-badge |
| `#fcf8ff` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1244 .import-strip |
| `#fcfcfc` | 1 | Inventory / equipment | src/components/sheet/inventory/InventoryItemRow.vue:595 .container-contents -> background |
| `#fdedec` | 1 | Inventory / equipment | src/components/sheet/inventory/EquipmentSlots.vue:244 &.non-proficient -> background-color |
| `#fef5e7` | 1 | Spellbook | src/components/sheet/spellbook/SpellbookPanel.vue:156 .book-toast |
| `#ff6b6b` | 1 | Desktop shell / sidebars | src/components/layout/SidebarLeft.vue:729 .btn-delete |
| `#ffb7b7` | 1 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:1284 .btn-delete-trait -> color |
| `#ffc3bc` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:451 .pack-actions .danger -> color |
| `#ffeaa7` | 1 | Modals / editors | src/components/sheet/modals/ForgeModal.vue:677 &.type-specific -> border |
| `#ffebee` | 1 | Inventory / equipment | src/components/sheet/inventory/TrashPanel.vue:116 &:hover -> background |
| `#fff0b8` | 1 | Bio / stats / character header | src/components/sheet/bio/StatsAndSkills.vue:279 .expertise-chip -> color |
| `#fff1b8` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1303 &:hover -> background |
| `#fff1c4` | 1 | Modals / editors | src/components/sheet/modals/ForgeModal.vue:636 &:hover -> color |
| `#fff1c7` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1225 .import-strip |
| `#fff7fb` | 1 | Inventory / equipment | src/components/sheet/inventory/InventoryItemRow.vue:576 &.active -> color |
| `#fff8dc` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1294 .add-unarmed-btn -> background |
| `#fff8e7` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1224 .import-strip |
| `#fff8e9` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1250 .import-strip |
| `#fff8f3` | 1 | Modals / editors | src/components/sheet/modals/ForgeModal.vue:676 &.type-specific -> background |
| `#fff9e9` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1221 .import-strip |
| `#fffaf0` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1255 .import-strip |
| `#fffdf6` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1202 .unlock-override |
| `gray` | 1 | Library panels | src/components/sheet/library/LibrarySpellsPanel.vue:225 .learned-mark |
| `green` | 1 | Library panels | src/components/sheet/library/LibraryItemsPanel.vue:433 .weapon-filter-button |
| `rgba(0,0,0,0.01)` | 1 | Inventory / equipment | src/components/sheet/inventory/InventoryItemRow.vue:663 .empty-slot -> background |
| `rgba(0,0,0,0.015)` | 1 | Bio / stats / character header | src/components/sheet/bio/ClassSelector.vue:353 .subclass-name-btn -> background |
| `rgba(0,0,0,0.16)` | 1 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:818 .enchant-sidebar -> background |
| `rgba(0,0,0,0.18)` | 1 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:1158 .btn-edit-trait -> background |
| `rgba(0,0,0,0.28)` | 1 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:103 .feedback-dialog -> box-shadow |
| `rgba(0,0,0,0.35)` | 1 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:760 .enchant-panel -> box-shadow |
| `rgba(0,0,0,0.36)` | 1 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:1180 .trait-hover-card -> box-shadow |
| `rgba(0,0,0,0.48)` | 1 | Modals / editors | src/components/sheet/modals/DataPackUnlockModal.vue:102 .unlock-modal -> box-shadow |
| `rgba(0,0,0,0.55)` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:221 .data-pack-backdrop -> background |
| `rgba(0,0,0,0.65)` | 1 | Modals / editors | src/components/sheet/modals/ForgeModal.vue:585 .modal-backdrop -> background |
| `rgba(0,0,0,0.75)` | 1 | Spellbook | src/components/sheet/spellbook/SpellbookPanel.vue:82 .spellbook-overlay -> background |
| `rgba(100,124,148,0.45)` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:232 .data-pack-modal -> border |
| `rgba(12,18,28,0.58)` | 1 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:743 .enchant-backdrop -> background |
| `rgba(126,160,196,0.34)` | 1 | Modals / editors | src/components/sheet/modals/DataPackUnlockModal.vue:100 .unlock-modal -> border |
| `rgba(126,83,183,0.42)` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1286 .import-strip |
| `rgba(129,95,255,0.12)` | 1 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:1103 &.selected -> background |
| `rgba(129,95,255,0.16)` | 1 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:757 .enchant-panel |
| `rgba(130,224,170,0.1)` | 1 | Library panels | src/components/sheet/library/LibraryItemsPanel.vue:433 .weapon-filter-button |
| `rgba(130,224,170,0.12)` | 1 | Library panels | src/components/sheet/library/LibraryItemsPanel.vue:417 .weapon-filter-button |
| `rgba(130,224,170,0.22)` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:428 .unlock-result-bar -> border |
| `rgba(130,224,170,0.24)` | 1 | Modals / editors | src/components/sheet/modals/DataPackUnlockModal.vue:172 .result-card -> border |
| `rgba(130,224,170,0.55)` | 1 | Library panels | src/components/sheet/library/LibraryItemsPanel.vue:417 .weapon-filter-button |
| `rgba(14,18,25,0.97)` | 1 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:1178 .trait-hover-card -> background |
| `rgba(142,154,175,0.14)` | 1 | Inventory / equipment | src/components/sheet/inventory/InventoryItemRow.vue:633 .hanging-dot -> box-shadow |
| `rgba(142,68,173,0.05)` | 1 | Spellbook | src/components/sheet/spellbook/SpellbookLeftPanel.vue:283 .warlock-block -> background |
| `rgba(142,68,173,0.1)` | 1 | Combat / actions | src/components/sheet/combat/CombatPanel.vue:393 &.is-magic-ac -> box-shadow |
| `rgba(142,68,173,0.18)` | 1 | Modals / editors | src/components/sheet/modals/ExpertiseSettingsModal.vue:195 &.active -> box-shadow |
| `rgba(142,68,173,0.36)` | 1 | Combat / actions | src/components/sheet/combat/CombatPanel.vue:392 &.is-magic-ac -> border-color |
| `rgba(154,121,189,0.24)` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1227 .import-strip |
| `rgba(155,89,182,0.04)` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1566 .equipment-group -> background |
| `rgba(155,89,182,0.15)` | 1 | Spellbook | src/components/sheet/spellbook/SpellbookRightPanel.vue:248 &.is-prepared -> box-shadow |
| `rgba(155,89,182,0.18)` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1564 .equipment-group -> border |
| `rgba(160,64,0,0.9)` | 1 | Spellbook | src/components/sheet/spellbook/SpellbookPanel.vue:156 .book-toast |
| `rgba(17,24,39,0.58)` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1216 .attack-picker-overlay -> background |
| `rgba(180,151,93,0.08)` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:386 .visibility-line.subtle span -> background |
| `rgba(180,151,93,0.22)` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:385 .visibility-line.subtle span -> border-color |
| `rgba(183,137,69,0.22)` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1225 .import-strip |
| `rgba(192,57,43,0.08)` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1411 .unarmed-error -> background |
| `rgba(192,57,43,0.1)` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1688 &.atk -> background |
| `rgba(192,57,43,0.25)` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1410 .unarmed-error -> border |
| `rgba(20,26,34,0.55)` | 1 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:94 .feedback-overlay -> background |
| `rgba(211,84,0,0.1)` | 1 | Modals / editors | src/components/sheet/modals/ForgeModal.vue:707 &:focus -> box-shadow |
| `rgba(211,84,0,0.2)` | 1 | Modals / editors | src/components/sheet/modals/ForgeModal.vue:878 .btn-save -> background |
| `rgba(211,84,0,0.3)` | 1 | Modals / editors | src/components/sheet/modals/ForgeModal.vue:879 .btn-save |
| `rgba(215,193,255,0.08)` | 1 | Library panels | src/components/sheet/library/LibraryItemsPanel.vue:374 .passphrase-toggle -> background |
| `rgba(215,193,255,0.1)` | 1 | Library panels | src/components/sheet/library/LibraryItemsPanel.vue:409 .category-header.passphrase-header |
| `rgba(215,193,255,0.12)` | 1 | Library panels | src/components/sheet/library/LibraryItemsPanel.vue:434 .weapon-filter-button |
| `rgba(215,193,255,0.16)` | 1 | Library panels | src/components/sheet/library/LibraryItemsPanel.vue:383 .passphrase-toggle |
| `rgba(215,193,255,0.18)` | 1 | Inventory / equipment | src/components/sheet/inventory/InventoryPanel.vue:655 .magic-attribute-row -> border |
| `rgba(215,193,255,0.28)` | 1 | Library panels | src/components/sheet/library/LibraryItemsPanel.vue:373 .passphrase-toggle -> border |
| `rgba(215,193,255,0.5)` | 1 | Library panels | src/components/sheet/library/LibraryItemsPanel.vue:408 .category-header.passphrase-header -> border-left-color |
| `rgba(215,193,255,0.55)` | 1 | Right sidebar tools / tooltips | src/components/sidebar/LibraryTooltip.vue:404 .card-header.magic -> border-bottom-color |
| `rgba(215,193,255,0.6)` | 1 | Library panels | src/components/sheet/library/LibraryItemsPanel.vue:383 .passphrase-toggle |
| `rgba(215,193,255,0.75)` | 1 | Library panels | src/components/sheet/library/LibraryItemsPanel.vue:421 .weapon-filter-button |
| `rgba(216,195,106,0.13)` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:338 &.builtin -> background |
| `rgba(216,195,106,0.34)` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:324 .pack-card |
| `rgba(22,160,133,0.14)` | 1 | Library panels | src/components/sheet/library/LibrarySpellsPanel.vue:224 .learned-mark |
| `rgba(22,160,133,0.32)` | 1 | Library panels | src/components/sheet/library/LibrarySpellsPanel.vue:224 .learned-mark |
| `rgba(220,194,255,0.8)` | 1 | Inventory / equipment | src/components/sheet/inventory/InventoryItemRow.vue:484 .enchant-more -> background |
| `rgba(220,80,80,0.18)` | 1 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:1283 .btn-delete-trait -> background |
| `rgba(231,76,60,0.05)` | 1 | Spellbook | src/components/sheet/spellbook/SpellbookRightPanel.vue:222 .empty-state -> background-color |
| `rgba(231,76,60,0.1)` | 1 | Inventory / equipment | src/components/sheet/inventory/InventoryItemRow.vue:589 .btn-del |
| `rgba(231,76,60,0.15)` | 1 | Right sidebar tools / tooltips | src/components/sidebar/LibraryTooltip.vue:485 .warning-box -> background |
| `rgba(235,152,78,0.08)` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:395 .visibility-warning -> background |
| `rgba(235,152,78,0.26)` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:394 .visibility-warning -> border |
| `rgba(236,112,99,0.08)` | 1 | Modals / editors | src/components/sheet/modals/DataPackUnlockModal.vue:181 .result-card.warning -> background |
| `rgba(236,112,99,0.11)` | 1 | Modals / editors | src/components/sheet/modals/DataPackUnlockModal.vue:155 .clear-btn -> background |
| `rgba(236,112,99,0.13)` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:450 .pack-actions .danger -> background |
| `rgba(236,112,99,0.25)` | 1 | Modals / editors | src/components/sheet/modals/DataPackUnlockModal.vue:180 .result-card.warning -> border-color |
| `rgba(236,112,99,0.35)` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:420 .unlock-inline button.secondary -> border-color |
| `rgba(236,112,99,0.4)` | 1 | Modals / editors | src/components/sheet/modals/DataPackUnlockModal.vue:154 .clear-btn -> border-color |
| `rgba(236,112,99,0.45)` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:449 .pack-actions .danger -> border-color |
| `rgba(24,28,34,0.95)` | 1 | Desktop shell / sidebars | src/components/layout/SidebarRight.vue:251 .data-pack-entry -> background |
| `rgba(240,231,255,0.06)` | 1 | Inventory / equipment | src/components/sheet/inventory/InventoryPanel.vue:657 .magic-attribute-row -> background |
| `rgba(241,196,15,0.9)` | 1 | Global overlays / feedback | src/components/ui/GlobalTooltip.vue:153 .section-label -> color |
| `rgba(242,201,76,0.2)` | 1 | Bio / stats / character header | src/components/sheet/bio/StatsAndSkills.vue:272 &.expertise -> box-shadow |
| `rgba(245,197,96,0.25)` | 1 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:1067 textarea -> border |
| `rgba(245,197,96,0.28)` | 1 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:1029 .trait-type-note -> border |
| `rgba(245,197,96,0.36)` | 1 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:1176 .trait-hover-card -> border |
| `rgba(245,197,96,0.55)` | 1 | Modals / editors | src/components/sheet/modals/ForgeModal.vue:626 .btn-enchant -> border |
| `rgba(245,197,96,0.64)` | 1 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:908 &.active -> border-color |
| `rgba(245,197,96,0.68)` | 1 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:1191 .trait-hover-card |
| `rgba(245,197,96,0.76)` | 1 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:1102 &.selected -> border-color |
| `rgba(255,255,255,0.065)` | 1 | Modals / editors | src/components/sheet/modals/EnchantingModal.vue:1097 .trait-badge -> background |
| `rgba(255,255,255,0.18)` | 1 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:231 .toast-icon -> background |
| `rgba(255,255,255,0.55)` | 1 | Combat / actions | src/components/sheet/combat/CombatPanel.vue:490 .ac-magic-badge -> border |
| `rgba(255,255,255,0.56)` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1263 .import-strip |
| `rgba(255,255,255,0.62)` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1710 .equipment-badge -> background |
| `rgba(255,255,255,0.65)` | 1 | Inventory / equipment | src/components/sheet/inventory/InventoryItemRow.vue:645 .hanging-empty-slot -> background |
| `rgba(255,255,255,0.72)` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1728 .equipment-dot -> box-shadow |
| `rgba(255,255,255,0.8)` | 1 | Combat / actions | src/components/sheet/combat/CombatPanel.vue:543 .hp-text -> text-shadow |
| `rgba(255,255,255,0.85)` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1258 .picker-close -> background |
| `rgba(255,255,255,0.9)` | 1 | Inventory / equipment | src/components/sheet/inventory/InventoryItemRow.vue:607 .hanging-slot-shell -> background |
| `rgba(29,35,42,0.98)` | 1 | Desktop shell / sidebars | src/components/layout/SidebarRight.vue:260 &:hover -> background |
| `rgba(38,49,38,0.12)` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1285 .import-strip |
| `rgba(38,57,72,0.95)` | 1 | Desktop shell / sidebars | src/components/layout/SidebarRight.vue:251 .data-pack-entry -> background |
| `rgba(45,70,90,0.98)` | 1 | Desktop shell / sidebars | src/components/layout/SidebarRight.vue:260 &:hover -> background |
| `rgba(46,204,113,0.2)` | 1 | Desktop shell / sidebars | src/components/layout/SidebarLeft.vue:669 &.drag-over -> background-color |
| `rgba(5,8,12,0.62)` | 1 | Modals / editors | src/components/sheet/modals/DataPackUnlockModal.vue:93 .unlock-backdrop -> background |
| `rgba(52,152,219,0.3)` | 1 | Modals / editors | src/components/sheet/modals/ProficiencySettingsModal.vue:251 .btn-toggle |
| `rgba(52,73,94,0.12)` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1239 .attack-picker-header -> border-bottom |
| `rgba(52,73,94,0.18)` | 1 | Combat / actions | src/components/sheet/combat/ActionsPanel.vue:1707 .equipment-badge -> border |
| `rgba(58,46,35,0.12)` | 1 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:105 .feedback-dialog -> border |
| `rgba(66,185,131,0.14)` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:273 .pack-actions button -> background |
| `rgba(70,80,70,0.18)` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1184 .maker-header -> background |
| `rgba(77,60,46,0.08)` | 1 | Global overlays / feedback | src/components/ui/GlobalFeedback.vue:175 .btn-secondary -> background |
| `rgba(79,11,34,0.2)` | 1 | Inventory / equipment | src/components/sheet/inventory/InventoryItemRow.vue:481 .enchant-more -> border |
| `rgba(85,162,232,0.14)` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:334 .tag -> background |
| `rgba(90,118,96,0.28)` | 1 | GM data-pack maker | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1195 .unlock-override -> border |
| `rgba(93,173,226,0.08)` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:379 .visibility-line span -> background |
| `rgba(93,173,226,0.12)` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:413 .unlock-inline button -> background |
| `rgba(93,173,226,0.16)` | 1 | Modals / editors | src/components/sheet/modals/DataPackUnlockModal.vue:147 button -> background |
| `rgba(93,173,226,0.18)` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:378 .visibility-line span -> border |
| `rgba(93,173,226,0.35)` | 1 | Desktop shell / sidebars | src/components/layout/SidebarRight.vue:250 .data-pack-entry -> border |
| `rgba(93,173,226,0.38)` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:412 .unlock-inline button -> border |
| `rgba(93,173,226,0.5)` | 1 | Modals / editors | src/components/sheet/modals/DataPackUnlockModal.vue:145 button -> border |
| `rgba(93,173,226,0.7)` | 1 | Desktop shell / sidebars | src/components/layout/SidebarRight.vue:259 &:hover -> border-color |
| `rgba(98,180,135,0.4)` | 1 | Modals / editors | src/components/sheet/modals/DataPackManagerModal.vue:272 .pack-actions button -> border |
| `yellow` | 1 | Inventory / equipment | src/components/sheet/inventory/InventoryPanel.vue:519 &.load-yellow |

## Area Details

### App root / empty states

| Color | Uses | Files / Selectors / Properties |
|---|---:|---|
| `#7f8c8d` | 1 | src/App.vue:172 .empty-state -> color |
| `#ced4da` | 1 | src/App.vue:137 .inventory-placeholder -> border |
| `#f8f9fa` | 1 | src/App.vue:136 .inventory-placeholder -> background-color |
| `rgba(0,0,0,0.1)` | 1 | src/App.vue:126 .sheet-container -> box-shadow |
| `white` | 1 | src/App.vue:123 .sheet-container -> background |

### Bio / stats / character header

| Color | Uses | Files / Selectors / Properties |
|---|---:|---|
| `#2c3e50` | 21 | src/components/sheet/bio/AlignmentPicker.vue:90 .alignment-trigger -> color<br>src/components/sheet/bio/AlignmentPicker.vue:147 &:hover -> color<br>src/components/sheet/bio/BioPanel.vue:130 .modal-header<br>src/components/sheet/bio/ClassSelector.vue:280 &:hover:not(:disabled) -> color<br>src/components/sheet/bio/ClassSelector.vue:292 .level-text -> color<br>src/components/sheet/bio/ClassSelector.vue:327 .class-name-btn -> color |
| `white` | 13 | src/components/sheet/bio/BioPanel.vue:118 .modal-content.bio-modal -> background<br>src/components/sheet/bio/HeaderInfo.vue:310 .btn-tool<br>src/components/sheet/bio/HeaderInfo.vue:312 .btn-tool<br>src/components/sheet/bio/HeaderInfo.vue:313 .btn-tool<br>src/components/sheet/bio/StatsAndSkills.vue:161 .attr-card -> background<br>src/components/sheet/bio/StatsAndSkills.vue:173 .card-header -> color |
| `#7f8c8d` | 10 | src/components/sheet/bio/AlignmentPicker.vue:141 .grid-item -> color<br>src/components/sheet/bio/BioPanel.vue:145 .section h4 -> margin<br>src/components/sheet/bio/ClassSelector.vue:267 .level-btn -> color<br>src/components/sheet/bio/ClassSelector.vue:343 .subclass-name-btn -> color<br>src/components/sheet/bio/ClassSelector.vue:366 .empty-btn -> color<br>src/components/sheet/bio/ClassSelector.vue:375 .btn-multiclass-add -> font-size |
| `#bdc3c7` | 10 | src/components/sheet/bio/ClassSelector.vue:229 .badge-remove-control -> color<br>src/components/sheet/bio/ClassSelector.vue:352 .subclass-name-btn -> color<br>src/components/sheet/bio/ClassSelector.vue:362 .empty-btn -> border<br>src/components/sheet/bio/ClassSelector.vue:374 .btn-multiclass-add -> background<br>src/components/sheet/bio/StatsAndSkills.vue:189 .header-controls<br>src/components/sheet/bio/StatsAndSkills.vue:192 .val-stepper |
| `#3498db` | 8 | src/components/sheet/bio/AlignmentPicker.vue:153 &.active -> border-color<br>src/components/sheet/bio/BioPanel.vue:145 .section h4 -> margin<br>src/components/sheet/bio/ClassSelector.vue:368 .empty-btn<br>src/components/sheet/bio/ClassSelector.vue:377 .btn-multiclass-add<br>src/components/sheet/bio/XpProgressBar.vue:132 &:focus -> border-color<br>src/components/sheet/bio/XpProgressBar.vue:176 .progress-fill -> background |
| `#ecf0f1` | 8 | src/components/sheet/bio/AlignmentPicker.vue:89 .alignment-trigger -> background<br>src/components/sheet/bio/AlignmentPicker.vue:122 .alignment-popover -> border<br>src/components/sheet/bio/AlignmentPicker.vue:146 &:hover -> background-color<br>src/components/sheet/bio/HeaderInfo.vue:195 .char-header -> display<br>src/components/sheet/bio/HeaderInfo.vue:311 .btn-tool<br>src/components/sheet/bio/StatsAndSkills.vue:246 .skill-row |
| `rgba(0,0,0,0.05)` | 7 | src/components/sheet/bio/ClassSelector.vue:231 .badge-remove-control -> border-right<br>src/components/sheet/bio/ClassSelector.vue:281 &:hover:not(:disabled) -> background<br>src/components/sheet/bio/ClassSelector.vue:334 .badge-bottom -> border-top<br>src/components/sheet/bio/ClassSelector.vue:354 .subclass-name-btn<br>src/components/sheet/bio/HeaderInfo.vue:211 .avatar-box -> overflow<br>src/components/sheet/bio/StatsAndSkills.vue:167 .attr-card -> box-shadow |
| `#95a5a6` | 6 | src/components/sheet/bio/ClassSelector.vue:354 .subclass-name-btn<br>src/components/sheet/bio/HeaderInfo.vue:249 .row-player-name -> color<br>src/components/sheet/bio/HeaderInfo.vue:264 .field<br>src/components/sheet/bio/HeaderInfo.vue:278 .field<br>src/components/sheet/bio/StatsAndSkills.vue:257 &.expertise<br>src/components/sheet/bio/XpProgressBar.vue:96 .label -> color |
| `transparent` | 6 | src/components/sheet/bio/AlignmentPicker.vue:137 .grid-item -> border<br>src/components/sheet/bio/ClassSelector.vue:228 .badge-remove-control -> background<br>src/components/sheet/bio/ClassSelector.vue:265 .level-btn -> background<br>src/components/sheet/bio/ClassSelector.vue:309 .badge-btn -> background<br>src/components/sheet/bio/ClassSelector.vue:424 .search-input -> background<br>src/components/sheet/bio/StatsAndSkills.vue:271 &.expertise -> border-color |
| `#eee` | 5 | src/components/sheet/bio/BioPanel.vue:128 .modal-header -> padding<br>src/components/sheet/bio/BioPanel.vue:142 .modal-body<br>src/components/sheet/bio/BioPanel.vue:166 .card -> background<br>src/components/sheet/bio/ClassSelector.vue:417 .search-input -> border-bottom<br>src/components/sheet/bio/HeaderInfo.vue:209 .avatar-box -> background |
| `#f2c94c` | 5 | src/components/sheet/bio/StatsAndSkills.vue:250 &.expertise -> border-left<br>src/components/sheet/bio/StatsAndSkills.vue:251 &.expertise<br>src/components/sheet/bio/StatsAndSkills.vue:252 &.expertise<br>src/components/sheet/bio/StatsAndSkills.vue:270 &.expertise -> background-color<br>src/components/sheet/bio/StatsAndSkills.vue:280 .expertise-chip -> border |
| `rgba(0,0,0,0.1)` | 4 | src/components/sheet/bio/AlignmentPicker.vue:98 .alignment-trigger -> box-shadow<br>src/components/sheet/bio/ClassSelector.vue:394 .dropdown-menu -> box-shadow<br>src/components/sheet/bio/HeaderInfo.vue:294 .pb-badge -> box-shadow<br>src/components/sheet/bio/HeaderInfo.vue:304 .btn-tool -> transition |
| `#999` | 3 | src/components/sheet/bio/BioPanel.vue:131 .modal-header<br>src/components/sheet/bio/BioPanel.vue:156 .field-box<br>src/components/sheet/bio/ClassSelector.vue:444 .empty-text -> color |
| `#e74c3c` | 3 | src/components/sheet/bio/ClassSelector.vue:240 &:hover -> background<br>src/components/sheet/bio/ClassSelector.vue:242 &:hover -> border-right-color<br>src/components/sheet/bio/XpProgressBar.vue:161 .btn-reset -> background |
| `#e9ecef` | 3 | src/components/sheet/bio/ClassSelector.vue:202 .class-badge -> border<br>src/components/sheet/bio/ClassSelector.vue:260 .badge-level-controls -> border-left<br>src/components/sheet/bio/ClassSelector.vue:390 .dropdown-menu -> border |
| `#f8f9fa` | 3 | src/components/sheet/bio/AlignmentPicker.vue:136 .grid-item -> background-color<br>src/components/sheet/bio/BioPanel.vue:128 .modal-header -> padding<br>src/components/sheet/bio/ClassSelector.vue:201 .class-badge -> background |
| `#ffffff` | 3 | src/components/sheet/bio/AlignmentPicker.vue:116 .alignment-popover -> background<br>src/components/sheet/bio/ClassSelector.vue:241 &:hover -> color<br>src/components/sheet/bio/ClassSelector.vue:389 .dropdown-menu -> background |
| `rgba(0,0,0,0.15)` | 3 | src/components/sheet/bio/AlignmentPicker.vue:106 &:hover -> box-shadow<br>src/components/sheet/bio/AlignmentPicker.vue:119 .alignment-popover -> box-shadow<br>src/components/sheet/bio/HeaderInfo.vue:306 .btn-tool |
| `#2ecc71` | 2 | src/components/sheet/bio/XpProgressBar.vue:157 .btn-add -> background<br>src/components/sheet/bio/XpProgressBar.vue:176 .progress-fill -> background |
| `#5b2a86` | 2 | src/components/sheet/bio/StatsAndSkills.vue:249 &.expertise -> background<br>src/components/sheet/bio/StatsAndSkills.vue:281 .expertise-chip -> background |
| `#dfe6e9` | 2 | src/components/sheet/bio/StatsAndSkills.vue:162 .attr-card -> border<br>src/components/sheet/bio/StatsAndSkills.vue:303 .jack-chip |
| `#e0e0e0` | 2 | src/components/sheet/bio/StatsAndSkills.vue:203 .card-body<br>src/components/sheet/bio/StatsAndSkills.vue:215 .saving-throw-row -> border-bottom |
| `#f0f8ff` | 2 | src/components/sheet/bio/ClassSelector.vue:368 .empty-btn<br>src/components/sheet/bio/ClassSelector.vue:377 .btn-multiclass-add |
| `#fdfdfd` | 2 | src/components/sheet/bio/BioPanel.vue:155 .field-box -> background<br>src/components/sheet/bio/StatsAndSkills.vue:201 .card-body -> background |
| `#fff` | 2 | src/components/sheet/bio/BioPanel.vue:166 .card -> background<br>src/components/sheet/bio/HeaderInfo.vue:293 .pb-badge -> background |
| `rgba(0,0,0,0.03)` | 2 | src/components/sheet/bio/ClassSelector.vue:204 .class-badge -> box-shadow<br>src/components/sheet/bio/ClassSelector.vue:315 .badge-btn |
| `rgba(0,0,0,0.2)` | 2 | src/components/sheet/bio/BioPanel.vue:123 .modal-content.bio-modal -> box-shadow<br>src/components/sheet/bio/StatsAndSkills.vue:191 .val-stepper -> display |
| `#27ae60` | 1 | src/components/sheet/bio/StatsAndSkills.vue:247 .skill-row |
| `#2980b9` | 1 | src/components/sheet/bio/AlignmentPicker.vue:154 &.active -> color |
| `#333` | 1 | src/components/sheet/bio/BioPanel.vue:131 .modal-header |
| `#34495e` | 1 | src/components/sheet/bio/HeaderInfo.vue:293 .pb-badge -> background |
| `#8a5a00` | 1 | src/components/sheet/bio/StatsAndSkills.vue:293 .jack-chip -> color |
| `#8e44ad` | 1 | src/components/sheet/bio/HeaderInfo.vue:312 .btn-tool |
| `#9b59b6` | 1 | src/components/sheet/bio/HeaderInfo.vue:313 .btn-tool |
| `#d6a84f` | 1 | src/components/sheet/bio/StatsAndSkills.vue:295 .jack-chip -> border |
| `#ddd` | 1 | src/components/sheet/bio/XpProgressBar.vue:124 input -> border |
| `#e3e8ea` | 1 | src/components/sheet/bio/StatsAndSkills.vue:217 .saving-throw-row |
| `#e67e22` | 1 | src/components/sheet/bio/HeaderInfo.vue:310 .btn-tool |
| `#e8f4fd` | 1 | src/components/sheet/bio/AlignmentPicker.vue:152 &.active -> background-color |
| `#e8f6f3` | 1 | src/components/sheet/bio/StatsAndSkills.vue:247 .skill-row |
| `#eef2f5` | 1 | src/components/sheet/bio/ClassSelector.vue:259 .badge-level-controls -> background |
| `#f0f0f0` | 1 | src/components/sheet/bio/StatsAndSkills.vue:244 .skill-row -> display |
| `#f0f4f8` | 1 | src/components/sheet/bio/ClassSelector.vue:440 li:hover -> background |
| `#f1f2f6` | 1 | src/components/sheet/bio/ClassSelector.vue:214 .is-multiclass .class-badge -> background |
| `#f1f3f5` | 1 | src/components/sheet/bio/BioPanel.vue:155 .field-box -> background |
| `#f4f6f7` | 1 | src/components/sheet/bio/StatsAndSkills.vue:212 .saving-throw-row -> background |
| `#fff0b8` | 1 | src/components/sheet/bio/StatsAndSkills.vue:279 .expertise-chip -> color |
| `#fff3cd` | 1 | src/components/sheet/bio/StatsAndSkills.vue:294 .jack-chip -> background |
| `rgba(0,0,0,0.015)` | 1 | src/components/sheet/bio/ClassSelector.vue:353 .subclass-name-btn -> background |
| `rgba(0,0,0,0.02)` | 1 | src/components/sheet/bio/BioPanel.vue:167 .card -> box-shadow |
| `rgba(0,0,0,0.6)` | 1 | src/components/sheet/bio/BioPanel.vue:113 .modal-backdrop -> background |
| `rgba(242,201,76,0.2)` | 1 | src/components/sheet/bio/StatsAndSkills.vue:272 &.expertise -> box-shadow |
| `rgba(52,152,219,0.2)` | 1 | src/components/sheet/bio/AlignmentPicker.vue:156 &.active -> box-shadow |

### Combat / actions

| Color | Uses | Files / Selectors / Properties |
|---|---:|---|
| `#fff` | 19 | src/components/sheet/combat/ActionsPanel.vue:1054 &.active -> color<br>src/components/sheet/combat/ActionsPanel.vue:1073 .attack-card -> background<br>src/components/sheet/combat/ActionsPanel.vue:1136 .atk-hit -> color<br>src/components/sheet/combat/ActionsPanel.vue:1268 &:hover -> background<br>src/components/sheet/combat/ActionsPanel.vue:1316 .filter-chip -> background<br>src/components/sheet/combat/ActionsPanel.vue:1332 &.active -> color |
| `#34495e` | 18 | src/components/sheet/combat/ActionsPanel.vue:1053 &.active -> background<br>src/components/sheet/combat/ActionsPanel.vue:1093 .row-sub -> color<br>src/components/sheet/combat/ActionsPanel.vue:1193 .add-card -> border-left-color<br>src/components/sheet/combat/ActionsPanel.vue:1197 .add-hit -> background<br>src/components/sheet/combat/ActionsPanel.vue:1259 .picker-close -> color<br>src/components/sheet/combat/ActionsPanel.vue:1317 .filter-chip -> color |
| `#eee` | 11 | src/components/sheet/combat/ActionsPanel.vue:1581 .group-header -> border-bottom<br>src/components/sheet/combat/ActionsPanel.vue:1631 .spell-card -> border<br>src/components/sheet/combat/ActionsPanel.vue:1746 .card-detail -> border-top<br>src/components/sheet/combat/ActionsPanel.vue:1794 .spell-stats-grid -> border<br>src/components/sheet/combat/ActionsPanel.vue:1841 .desc-divider -> background<br>src/components/sheet/combat/ActionsPanel.vue:1854 .scaling -> border-top |
| `#7f8c8d` | 8 | src/components/sheet/combat/ActionsPanel.vue:1049 &:hover -> color<br>src/components/sheet/combat/ActionsPanel.vue:1149 .atk-range -> color<br>src/components/sheet/combat/ActionsPanel.vue:1183 .tag -> color<br>src/components/sheet/combat/ActionsPanel.vue:1352 .picker-card -> border-left-color<br>src/components/sheet/combat/ActionsPanel.vue:1379 .unarmed-config-btn -> color<br>src/components/sheet/combat/ActionsPanel.vue:1385 &:hover -> color |
| `#2c3e50` | 7 | src/components/sheet/combat/ActionsPanel.vue:1027 h3 -> color<br>src/components/sheet/combat/ActionsPanel.vue:1055 &.active -> border-color<br>src/components/sheet/combat/ActionsPanel.vue:1099 .atk-name -> color<br>src/components/sheet/combat/ActionsPanel.vue:1453 select -> color<br>src/components/sheet/combat/ActionsPanel.vue:1533 strong -> color<br>src/components/sheet/combat/ActionsPanel.vue:1548 &:hover -> background |
| `#c0392b` | 6 | src/components/sheet/combat/ActionsPanel.vue:1075 .attack-card -> border-left<br>src/components/sheet/combat/ActionsPanel.vue:1137 .atk-hit -> background<br>src/components/sheet/combat/ActionsPanel.vue:1468 .danger-link -> color<br>src/components/sheet/combat/ActionsPanel.vue:1687 &.atk -> color<br>src/components/sheet/combat/ActionsPanel.vue:1834 &.dmg -> background<br>src/components/sheet/combat/CombatPanel.vue:570 button |
| `#333` | 5 | src/components/sheet/combat/CombatPanel.vue:417 &:hover -> color<br>src/components/sheet/combat/CombatPanel.vue:436 &.active<br>src/components/sheet/combat/CombatPanel.vue:542 .hp-text -> color<br>src/components/sheet/combat/CombatPanel.vue:614 .toggle-btn<br>src/components/sheet/combat/CombatPanel.vue:726 .hd-type-select:hover -> color |
| `#555` | 5 | src/components/sheet/combat/ActionsPanel.vue:1530 .mini-stat -> color<br>src/components/sheet/combat/ActionsPanel.vue:1749 .card-detail -> color<br>src/components/sheet/combat/ActionsPanel.vue:1847 .desc-text -> color<br>src/components/sheet/combat/ActionsPanel.vue:1859 strong -> color<br>src/components/sheet/combat/CombatPanel.vue:629 .hd-type-badge -> font-weight |
| `#e74c3c` | 5 | src/components/sheet/combat/CombatPanel.vue:524 .hp-bar-fill -> background<br>src/components/sheet/combat/CombatPanel.vue:570 button<br>src/components/sheet/combat/CombatPanel.vue:577 .btn-full -> color<br>src/components/sheet/combat/CombatPanel.vue:604 .circle |
| `#fdfdfd` | 5 | src/components/sheet/combat/ActionsPanel.vue:1038 .btn-toggle -> background<br>src/components/sheet/combat/ActionsPanel.vue:1381 .unarmed-config-btn -> background<br>src/components/sheet/combat/ActionsPanel.vue:1580 .group-header -> background<br>src/components/sheet/combat/ActionsPanel.vue:1747 .card-detail -> background<br>src/components/sheet/combat/CombatPanel.vue:625 .hd-edit-row -> background |
| `#27ae60` | 4 | src/components/sheet/combat/CombatPanel.vue:534 &:has(.hp-bar-fill[style*="width: 5"])<br>src/components/sheet/combat/CombatPanel.vue:571 button<br>src/components/sheet/combat/CombatPanel.vue:603 .circle |
| `#95a5a6` | 4 | src/components/sheet/combat/ActionsPanel.vue:1039 .btn-toggle -> color<br>src/components/sheet/combat/ActionsPanel.vue:1114 .attack-drag-handle -> color<br>src/components/sheet/combat/ActionsPanel.vue:1693 &.save -> background<br>src/components/sheet/combat/ActionsPanel.vue:1803 .label -> color |
| `#ccc` | 4 | src/components/sheet/combat/CombatPanel.vue:356 .combat-panel -> border<br>src/components/sheet/combat/CombatPanel.vue:556 input -> border<br>src/components/sheet/combat/CombatPanel.vue:602 .circle -> border<br>src/components/sheet/combat/CombatPanel.vue:625 .hd-edit-row -> background |
| `#d0d7de` | 4 | src/components/sheet/combat/ActionsPanel.vue:1315 .filter-chip -> border<br>src/components/sheet/combat/ActionsPanel.vue:1362 .picker-action -> border<br>src/components/sheet/combat/ActionsPanel.vue:1451 select -> border<br>src/components/sheet/combat/ActionsPanel.vue:1482 .tag-choice -> border |
| `#dcdcdc` | 4 | src/components/sheet/combat/ActionsPanel.vue:1037 .btn-toggle -> border<br>src/components/sheet/combat/ActionsPanel.vue:1074 .attack-card -> border<br>src/components/sheet/combat/ActionsPanel.vue:1153 .divider -> color<br>src/components/sheet/combat/ActionsPanel.vue:1380 .unarmed-config-btn -> border-color |
| `#e0e0e0` | 4 | src/components/sheet/combat/ActionsPanel.vue:1017 .sec-header -> border-bottom<br>src/components/sheet/combat/ActionsPanel.vue:1526 .spell-dashboard-mini -> border<br>src/components/sheet/combat/CombatPanel.vue:381 .stat-box -> border<br>src/components/sheet/combat/CombatPanel.vue:465 .shield-shape -> background |
| `#8e44ad` | 3 | src/components/sheet/combat/ActionsPanel.vue:1571 .equipment-count -> color<br>src/components/sheet/combat/ActionsPanel.vue:1699 .equipment-action-card -> border-left-color<br>src/components/sheet/combat/CombatPanel.vue:694 .ex-level |
| `#999` | 3 | src/components/sheet/combat/ActionsPanel.vue:1758 .spell-meta-header -> color<br>src/components/sheet/combat/CombatPanel.vue:591 .resource-item<br>src/components/sheet/combat/CombatPanel.vue:632 .hd-type-badge |
| `#bdc3c7` | 3 | src/components/sheet/combat/ActionsPanel.vue:1203 .empty-tip -> color<br>src/components/sheet/combat/ActionsPanel.vue:1594 .fold-arrow -> color<br>src/components/sheet/combat/ActionsPanel.vue:1866 .empty-battle-spells -> color |
| `#c9b458` | 3 | src/components/sheet/combat/ActionsPanel.vue:1293 .add-unarmed-btn -> border<br>src/components/sheet/combat/ActionsPanel.vue:1421 .unarmed-row -> border-left<br>src/components/sheet/combat/ActionsPanel.vue:1493 &.active -> border-color |
| `#ddd` | 3 | src/components/sheet/combat/CombatPanel.vue:576 .btn-full -> background<br>src/components/sheet/combat/CombatPanel.vue:654 button -> background<br>src/components/sheet/combat/CombatPanel.vue:684 .insp-star -> font-size |
| `#e67e22` | 3 | src/components/sheet/combat/ActionsPanel.vue:1780 &.conc -> background<br>src/components/sheet/combat/CombatPanel.vue:431 &.active -> color<br>src/components/sheet/combat/CombatPanel.vue:618 .gear-icon |
| `#ecf0f1` | 3 | src/components/sheet/combat/ActionsPanel.vue:1048 &:hover -> background<br>src/components/sheet/combat/ActionsPanel.vue:1182 .tag -> background<br>src/components/sheet/combat/ActionsPanel.vue:1384 &:hover -> background |
| `transparent` | 3 | src/components/sheet/combat/ActionsPanel.vue:1467 .danger-link -> background<br>src/components/sheet/combat/CombatPanel.vue:500 .ac-select -> background<br>src/components/sheet/combat/CombatPanel.vue:716 .hd-type-select -> background |
| `#117864` | 2 | src/components/sheet/combat/ActionsPanel.vue:1670 .ritual-badge -> color<br>src/components/sheet/combat/ActionsPanel.vue:1775 &.ritual -> color |
| `#2980b9` | 2 | src/components/sheet/combat/CombatPanel.vue:546 .hp-text<br>src/components/sheet/combat/CombatPanel.vue:572 button |
| `#5d6d7e` | 2 | src/components/sheet/combat/ActionsPanel.vue:1252 p -> color<br>src/components/sheet/combat/ActionsPanel.vue:1711 .equipment-badge -> color |
| `#666` | 2 | src/components/sheet/combat/CombatPanel.vue:404 .label -> color<br>src/components/sheet/combat/CombatPanel.vue:717 .hd-type-select -> color |
| `#9b59b6` | 2 | src/components/sheet/combat/ActionsPanel.vue:1615 .slot-dot -> border<br>src/components/sheet/combat/ActionsPanel.vue:1620 &.filled -> background |
| `#eef3f6` | 2 | src/components/sheet/combat/ActionsPanel.vue:1194 .add-card -> background<br>src/components/sheet/combat/ActionsPanel.vue:1280 .attack-ghost -> background |
| `#f1f3f5` | 2 | src/components/sheet/combat/ActionsPanel.vue:1524 .spell-dashboard-mini -> background<br>src/components/sheet/combat/ActionsPanel.vue:1589 &:hover -> background |
| `#f8fbfd` | 2 | src/components/sheet/combat/ActionsPanel.vue:1223 .attack-picker-modal -> background<br>src/components/sheet/combat/ActionsPanel.vue:1392 .unarmed-editor-modal -> background |
| `rgba(15,23,42,0.25)` | 2 | src/components/sheet/combat/ActionsPanel.vue:1226 .attack-picker-modal -> box-shadow<br>src/components/sheet/combat/ActionsPanel.vue:1395 .unarmed-editor-modal -> box-shadow |
| `rgba(22,160,133,0.12)` | 2 | src/components/sheet/combat/ActionsPanel.vue:1668 .ritual-badge -> background<br>src/components/sheet/combat/ActionsPanel.vue:1774 &.ritual -> background |
| `rgba(22,160,133,0.35)` | 2 | src/components/sheet/combat/ActionsPanel.vue:1669 .ritual-badge -> border<br>src/components/sheet/combat/ActionsPanel.vue:1776 &.ritual -> border |
| `rgba(52,73,94,0.16)` | 2 | src/components/sheet/combat/ActionsPanel.vue:1224 .attack-picker-modal -> border<br>src/components/sheet/combat/ActionsPanel.vue:1393 .unarmed-editor-modal -> border |
| `white` | 2 | src/components/sheet/combat/ActionsPanel.vue:1541 .btn-rest-mini -> color<br>src/components/sheet/combat/CombatPanel.vue:563 button -> border |
| `#111` | 1 | src/components/sheet/combat/ActionsPanel.vue:1726 .equipment-dot -> border |
| `#22313f` | 1 | src/components/sheet/combat/ActionsPanel.vue:1246 h3 -> color |
| `#2ecc71` | 1 | src/components/sheet/combat/CombatPanel.vue:571 button |
| `#3498db` | 1 | src/components/sheet/combat/CombatPanel.vue:572 button |
| `#4b2d73` | 1 | src/components/sheet/combat/ActionsPanel.vue:1492 &.active -> background |
| `#607080` | 1 | src/components/sheet/combat/ActionsPanel.vue:1446 span -> color |
| `#66788a` | 1 | src/components/sheet/combat/ActionsPanel.vue:1275 .attack-picker-subtitle -> color |
| `#6f4e00` | 1 | src/components/sheet/combat/ActionsPanel.vue:1295 .add-unarmed-btn -> color |
| `#8a5a00` | 1 | src/components/sheet/combat/CombatPanel.vue:451 .jack-chip -> color |
| `#922b21` | 1 | src/components/sheet/combat/ActionsPanel.vue:1412 .unarmed-error -> color |
| `#d6a84f` | 1 | src/components/sheet/combat/CombatPanel.vue:453 .jack-chip -> border |
| `#dfe6ee` | 1 | src/components/sheet/combat/ActionsPanel.vue:1420 .unarmed-row -> border |
| `#e8eef4` | 1 | src/components/sheet/combat/ActionsPanel.vue:1238 .attack-picker-header -> background |
| `#eef4f8` | 1 | src/components/sheet/combat/ActionsPanel.vue:1357 &.selected -> background |
| `#f0f0f0` | 1 | src/components/sheet/combat/CombatPanel.vue:397 &:hover -> background |
| `#f1c40f` | 1 | src/components/sheet/combat/CombatPanel.vue:685 .insp-star |
| `#f3f6f8` | 1 | src/components/sheet/combat/ActionsPanel.vue:1326 &:hover -> background |
| `#f4d06f` | 1 | src/components/sheet/combat/ActionsPanel.vue:1494 &.active -> color |
| `#f5f5f5` | 1 | src/components/sheet/combat/CombatPanel.vue:640 .hd-controls -> background |
| `#f5f8fb` | 1 | src/components/sheet/combat/ActionsPanel.vue:1238 .attack-picker-header -> background |
| `#f8f9fa` | 1 | src/components/sheet/combat/ActionsPanel.vue:1790 .spell-stats-grid -> background |
| `#f8fafc` | 1 | src/components/sheet/combat/ActionsPanel.vue:1483 .tag-choice -> background |
| `#f9f9f9` | 1 | src/components/sheet/combat/CombatPanel.vue:384 .stat-box -> background |
| `#f9fbfc` | 1 | src/components/sheet/combat/ActionsPanel.vue:1194 .add-card -> background |
| `#fff0f0` | 1 | src/components/sheet/combat/CombatPanel.vue:578 .btn-full |
| `#fff1b8` | 1 | src/components/sheet/combat/ActionsPanel.vue:1303 &:hover -> background |
| `#fff3cd` | 1 | src/components/sheet/combat/CombatPanel.vue:452 .jack-chip -> background |
| `#fff8dc` | 1 | src/components/sheet/combat/ActionsPanel.vue:1294 .add-unarmed-btn -> background |
| `#ffffff` | 1 | src/components/sheet/combat/ActionsPanel.vue:1357 &.selected -> background |
| `rgba(0,0,0,0.03)` | 1 | src/components/sheet/combat/ActionsPanel.vue:1078 .attack-card -> box-shadow |
| `rgba(0,0,0,0.05)` | 1 | src/components/sheet/combat/ActionsPanel.vue:1639 &:hover -> box-shadow |
| `rgba(0,0,0,0.08)` | 1 | src/components/sheet/combat/CombatPanel.vue:491 .ac-magic-badge -> box-shadow |
| `rgba(0,0,0,0.1)` | 1 | src/components/sheet/combat/CombatPanel.vue:520 .hp-bar-container -> box-shadow |
| `rgba(0,0,0,0.2)` | 1 | src/components/sheet/combat/CombatPanel.vue:685 .insp-star |
| `rgba(142,68,173,0.1)` | 1 | src/components/sheet/combat/CombatPanel.vue:393 &.is-magic-ac -> box-shadow |
| `rgba(142,68,173,0.36)` | 1 | src/components/sheet/combat/CombatPanel.vue:392 &.is-magic-ac -> border-color |
| `rgba(155,89,182,0.04)` | 1 | src/components/sheet/combat/ActionsPanel.vue:1566 .equipment-group -> background |
| `rgba(155,89,182,0.18)` | 1 | src/components/sheet/combat/ActionsPanel.vue:1564 .equipment-group -> border |
| `rgba(17,24,39,0.58)` | 1 | src/components/sheet/combat/ActionsPanel.vue:1216 .attack-picker-overlay -> background |
| `rgba(192,57,43,0.08)` | 1 | src/components/sheet/combat/ActionsPanel.vue:1411 .unarmed-error -> background |
| `rgba(192,57,43,0.1)` | 1 | src/components/sheet/combat/ActionsPanel.vue:1688 &.atk -> background |
| `rgba(192,57,43,0.25)` | 1 | src/components/sheet/combat/ActionsPanel.vue:1410 .unarmed-error -> border |
| `rgba(255,255,255,0.55)` | 1 | src/components/sheet/combat/CombatPanel.vue:490 .ac-magic-badge -> border |
| `rgba(255,255,255,0.62)` | 1 | src/components/sheet/combat/ActionsPanel.vue:1710 .equipment-badge -> background |
| `rgba(255,255,255,0.72)` | 1 | src/components/sheet/combat/ActionsPanel.vue:1728 .equipment-dot -> box-shadow |
| `rgba(255,255,255,0.8)` | 1 | src/components/sheet/combat/CombatPanel.vue:543 .hp-text -> text-shadow |
| `rgba(255,255,255,0.85)` | 1 | src/components/sheet/combat/ActionsPanel.vue:1258 .picker-close -> background |
| `rgba(52,73,94,0.12)` | 1 | src/components/sheet/combat/ActionsPanel.vue:1239 .attack-picker-header -> border-bottom |
| `rgba(52,73,94,0.18)` | 1 | src/components/sheet/combat/ActionsPanel.vue:1707 .equipment-badge -> border |

### Desktop shell / sidebars

| Color | Uses | Files / Selectors / Properties |
|---|---:|---|
| `#34495e` | 7 | src/components/layout/SidebarLeft.vue:616 .sidebar-left -> border-right<br>src/components/layout/SidebarLeft.vue:620 .header -> border-bottom<br>src/components/layout/SidebarLeft.vue:702 li -> padding<br>src/components/layout/SidebarLeft.vue:704 li<br>src/components/layout/SidebarLeft.vue:737 .footer-wrapper -> border-top<br>src/components/layout/SidebarLeft.vue:749 .btn-zoom -> background |
| `#3498db` | 5 | src/components/layout/SidebarLeft.vue:631 .btn-text-small -> background<br>src/components/layout/SidebarLeft.vue:652 .bulk-header<br>src/components/layout/SidebarLeft.vue:681 .inline-edit-input -> border<br>src/components/layout/SidebarLeft.vue:705 li<br>src/components/layout/SidebarLeft.vue:768 .bulk-tools |
| `#bdc3c7` | 5 | src/components/layout/SidebarLeft.vue:635 .btn-text -> background<br>src/components/layout/SidebarLeft.vue:651 .bulk-header -> font-size<br>src/components/layout/SidebarLeft.vue:678 .group-header<br>src/components/layout/SidebarLeft.vue:723 .player-name<br>src/components/layout/SidebarLeft.vue:746 .zoom-bar |
| `#ecf0f1` | 5 | src/components/layout/SidebarLeft.vue:613 .sidebar-left -> color<br>src/components/layout/SidebarLeft.vue:623 .header<br>src/components/layout/SidebarLeft.vue:686 .group-tools -> button<br>src/components/layout/SidebarLeft.vue:749 .btn-zoom -> background<br>src/components/layout/SidebarLeft.vue:759 .btn-tool -> flex |
| `#f1c40f` | 4 | src/components/layout/SidebarLeft.vue:638 .btn-text<br>src/components/layout/SidebarLeft.vue:762 .btn-tool |
| `#fff` | 4 | src/components/layout/SidebarLeft.vue:681 .inline-edit-input -> border<br>src/components/layout/SidebarLeft.vue:715 .char-name -> font-weight<br>src/components/layout/SidebarRight.vue:225 .root-tab-btn<br>src/components/layout/SidebarRight.vue:234 input -> border-radius |
| `white` | 4 | src/components/layout/SidebarLeft.vue:637 .btn-text<br>src/components/layout/SidebarLeft.vue:643 .btn-create -> width<br>src/components/layout/SidebarLeft.vue:767 .bulk-tools<br>src/components/layout/SidebarLeft.vue:768 .bulk-tools |
| `#233140` | 3 | src/components/layout/SidebarLeft.vue:665 .group-block -> border-bottom<br>src/components/layout/SidebarLeft.vue:738 .footer-wrapper -> background<br>src/components/layout/SidebarLeft.vue:756 .footer-tools -> padding |
| `#2980b9` | 3 | src/components/layout/SidebarLeft.vue:705 li<br>src/components/layout/SidebarLeft.vue:768 .bulk-tools |
| `#42b983` | 3 | src/components/layout/SidebarRight.vue:226 .root-tab-btn<br>src/components/layout/SidebarRight.vue:235 input |
| `#5dade2` | 3 | src/components/layout/SidebarLeft.vue:632 .btn-text-small<br>src/components/layout/SidebarLeft.vue:750 .btn-zoom<br>src/components/layout/SidebarLeft.vue:760 .btn-tool |
| `#7f8c8d` | 3 | src/components/layout/SidebarLeft.vue:677 .group-header<br>src/components/layout/SidebarLeft.vue:685 .group-tools<br>src/components/layout/SidebarLeft.vue:693 .empty-group -> padding |
| `transparent` | 3 | src/components/layout/SidebarLeft.vue:635 .btn-text -> background<br>src/components/layout/SidebarRight.vue:223 .root-tab-btn -> flex<br>src/components/layout/SidebarRight.vue:224 .root-tab-btn -> font-weight |
| `#1e1e1e` | 2 | src/components/layout/SidebarRight.vue:217 .sidebar-right -> background-color<br>src/components/layout/SidebarRight.vue:231 .search-header -> padding |
| `#2c3e50` | 2 | src/components/layout/SidebarLeft.vue:612 .sidebar-left -> background-color<br>src/components/layout/SidebarLeft.vue:681 .inline-edit-input -> border |
| `#2ecc71` | 2 | src/components/layout/SidebarLeft.vue:646 .btn-create<br>src/components/layout/SidebarLeft.vue:670 &.drag-over -> border |
| `#333` | 2 | src/components/layout/SidebarRight.vue:217 .sidebar-right -> background-color<br>src/components/layout/SidebarRight.vue:221 .root-tabs -> display |
| `#3e5871` | 2 | src/components/layout/SidebarLeft.vue:750 .btn-zoom<br>src/components/layout/SidebarLeft.vue:760 .btn-tool |
| `#444` | 2 | src/components/layout/SidebarRight.vue:233 input -> width<br>src/components/layout/SidebarRight.vue:242 .scroll-container |
| `#455a64` | 2 | src/components/layout/SidebarLeft.vue:749 .btn-zoom -> background<br>src/components/layout/SidebarLeft.vue:759 .btn-tool -> flex |
| `#c0392b` | 2 | src/components/layout/SidebarLeft.vue:767 .bulk-tools |
| `#e74c3c` | 2 | src/components/layout/SidebarLeft.vue:727 .btn-delete -> background<br>src/components/layout/SidebarLeft.vue:767 .bulk-tools |
| `#181818` | 1 | src/components/layout/SidebarRight.vue:221 .root-tabs -> display |
| `#1a252f` | 1 | src/components/layout/SidebarLeft.vue:675 .group-header -> background-color |
| `#222` | 1 | src/components/layout/SidebarRight.vue:226 .root-tab-btn |
| `#252525` | 1 | src/components/layout/SidebarRight.vue:225 .root-tab-btn |
| `#27ae60` | 1 | src/components/layout/SidebarLeft.vue:643 .btn-create -> width |
| `#2a2a2a` | 1 | src/components/layout/SidebarRight.vue:231 .search-header -> padding |
| `#2c2c2c` | 1 | src/components/layout/SidebarRight.vue:233 input -> width |
| `#555` | 1 | src/components/layout/SidebarRight.vue:245 .scroll-container |
| `#888` | 1 | src/components/layout/SidebarRight.vue:223 .root-tab-btn -> flex |
| `#d8ebff` | 1 | src/components/layout/SidebarRight.vue:252 .data-pack-entry -> color |
| `#e0e0e0` | 1 | src/components/layout/SidebarRight.vue:217 .sidebar-right -> background-color |
| `#f39c12` | 1 | src/components/layout/SidebarLeft.vue:718 .player-name -> color |
| `#f5f6fa` | 1 | src/components/layout/AppLayout.vue:33 .main-sheet -> background-color |
| `#ff6b6b` | 1 | src/components/layout/SidebarLeft.vue:729 .btn-delete |
| `rgba(24,28,34,0.95)` | 1 | src/components/layout/SidebarRight.vue:251 .data-pack-entry -> background |
| `rgba(255,255,255,0.1)` | 1 | src/components/layout/SidebarLeft.vue:637 .btn-text |
| `rgba(29,35,42,0.98)` | 1 | src/components/layout/SidebarRight.vue:260 &:hover -> background |
| `rgba(38,57,72,0.95)` | 1 | src/components/layout/SidebarRight.vue:251 .data-pack-entry -> background |
| `rgba(45,70,90,0.98)` | 1 | src/components/layout/SidebarRight.vue:260 &:hover -> background |
| `rgba(46,204,113,0.2)` | 1 | src/components/layout/SidebarLeft.vue:669 &.drag-over -> background-color |
| `rgba(52,152,219,0.2)` | 1 | src/components/layout/SidebarLeft.vue:703 li |
| `rgba(93,173,226,0.35)` | 1 | src/components/layout/SidebarRight.vue:250 .data-pack-entry -> border |
| `rgba(93,173,226,0.7)` | 1 | src/components/layout/SidebarRight.vue:259 &:hover -> border-color |

### Global overlays / feedback

| Color | Uses | Files / Selectors / Properties |
|---|---:|---|
| `#355c7d` | 2 | src/components/ui/GlobalFeedback.vue:180 .btn-primary -> background<br>src/components/ui/GlobalFeedback.vue:209 .feedback-toast -> background |
| `#ecf0f1` | 2 | src/components/ui/GlobalTooltip.vue:104 .global-tooltip -> color<br>src/components/ui/GlobalTooltip.vue:166 .section-item -> color |
| `#fff` | 2 | src/components/ui/GlobalFeedback.vue:181 .btn-primary -> color<br>src/components/ui/GlobalFeedback.vue:207 .feedback-toast -> color |
| `#2b241e` | 1 | src/components/ui/GlobalFeedback.vue:101 .feedback-dialog -> color |
| `#2d7d46` | 1 | src/components/ui/GlobalFeedback.vue:122 .feedback-dialog.tone-success .dialog-accent -> background |
| `#2f7a4b` | 1 | src/components/ui/GlobalFeedback.vue:213 .feedback-toast.tone-success -> background |
| `#31724a` | 1 | src/components/ui/GlobalFeedback.vue:193 .btn-primary.tone-success -> background |
| `#34495e` | 1 | src/components/ui/GlobalTooltip.vue:105 .global-tooltip -> border |
| `#56473b` | 1 | src/components/ui/GlobalFeedback.vue:147 .dialog-message -> color |
| `#58a86e` | 1 | src/components/ui/GlobalFeedback.vue:122 .feedback-dialog.tone-success .dialog-accent -> background |
| `#5b4736` | 1 | src/components/ui/GlobalFeedback.vue:176 .btn-secondary -> color |
| `#5f7182` | 1 | src/components/ui/GlobalTooltip.vue:120 .global-tooltip |
| `#7890a4` | 1 | src/components/ui/GlobalTooltip.vue:121 .global-tooltip |
| `#8c6f58` | 1 | src/components/ui/GlobalFeedback.vue:134 .dialog-kicker -> color |
| `#8d2f2f` | 1 | src/components/ui/GlobalFeedback.vue:114 .feedback-dialog.tone-danger .dialog-accent -> background |
| `#9b5a17` | 1 | src/components/ui/GlobalFeedback.vue:118 .feedback-dialog.tone-warning .dialog-accent -> background |
| `#a03b3b` | 1 | src/components/ui/GlobalFeedback.vue:221 .feedback-toast.tone-danger -> background |
| `#a3641f` | 1 | src/components/ui/GlobalFeedback.vue:217 .feedback-toast.tone-warning -> background |
| `#ad6a21` | 1 | src/components/ui/GlobalFeedback.vue:185 .btn-primary.tone-warning -> background |
| `#b13a37` | 1 | src/components/ui/GlobalFeedback.vue:189 .btn-primary.tone-danger -> background |
| `#b46a32` | 1 | src/components/ui/GlobalFeedback.vue:110 .dialog-accent -> background |
| `#d75a4a` | 1 | src/components/ui/GlobalFeedback.vue:114 .feedback-dialog.tone-danger .dialog-accent -> background |
| `#d8a15d` | 1 | src/components/ui/GlobalFeedback.vue:110 .dialog-accent -> background |
| `#d9982c` | 1 | src/components/ui/GlobalFeedback.vue:118 .feedback-dialog.tone-warning .dialog-accent -> background |
| `#f1c40f` | 1 | src/components/ui/GlobalTooltip.vue:126 .tooltip-title -> color |
| `#f7f3ea` | 1 | src/components/ui/GlobalFeedback.vue:100 .feedback-dialog -> background |
| `rgba(0,0,0,0.2)` | 1 | src/components/ui/GlobalTooltip.vue:119 .global-tooltip |
| `rgba(0,0,0,0.22)` | 1 | src/components/ui/GlobalFeedback.vue:208 .feedback-toast -> box-shadow |
| `rgba(0,0,0,0.28)` | 1 | src/components/ui/GlobalFeedback.vue:103 .feedback-dialog -> box-shadow |
| `rgba(0,0,0,0.3)` | 1 | src/components/ui/GlobalTooltip.vue:111 .global-tooltip -> box-shadow |
| `rgba(20,26,34,0.55)` | 1 | src/components/ui/GlobalFeedback.vue:94 .feedback-overlay -> background |
| `rgba(241,196,15,0.9)` | 1 | src/components/ui/GlobalTooltip.vue:153 .section-label -> color |
| `rgba(255,255,255,0.18)` | 1 | src/components/ui/GlobalFeedback.vue:231 .toast-icon -> background |
| `rgba(255,255,255,0.2)` | 1 | src/components/ui/GlobalTooltip.vue:128 .tooltip-title -> border-bottom |
| `rgba(44,62,80,0.95)` | 1 | src/components/ui/GlobalTooltip.vue:103 .global-tooltip -> background |
| `rgba(58,46,35,0.12)` | 1 | src/components/ui/GlobalFeedback.vue:105 .feedback-dialog -> border |
| `rgba(77,60,46,0.08)` | 1 | src/components/ui/GlobalFeedback.vue:175 .btn-secondary -> background |

### Global stylesheet

| Color | Uses | Files / Selectors / Properties |
|---|---:|---|
| `#f0f2f5` | 2 | src/style.css:10 :root -> background-color<br>src/style.css:23 body -> background-color |
| `#213547` | 1 | src/style.css:9 :root -> color |

### GM data-pack maker

| Color | Uses | Files / Selectors / Properties |
|---|---:|---|
| `white` | 8 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1204 .unlock-override<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1208 .unlock-override<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1216 .import-strip<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1217 .import-strip<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1230 .import-strip<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1243 .import-strip |
| `#263126` | 5 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1202 .unlock-override<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1204 .unlock-override<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1208 .unlock-override<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1230 .import-strip<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1285 .import-strip |
| `#d8ded8` | 4 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1211 .import-strip -> background<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1216 .import-strip<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1217 .import-strip<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1243 .import-strip |
| `#536052` | 2 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1199 .unlock-override -> color<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1211 .import-strip -> background |
| `#9a79bd` | 2 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1226 .import-strip<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1239 .import-strip |
| `#ead9a8` | 2 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1263 .import-strip<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1271 .import-strip |
| `purple` | 2 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1226 .import-strip<br>src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1227 .import-strip |
| `#20252b` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1181 |
| `#2b5e89` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1228 .import-strip |
| `#354333` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1278 .import-strip |
| `#55614f` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1282 .import-strip |
| `#566056` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1235 .import-strip |
| `#573777` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1226 .import-strip |
| `#596359` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1219 .import-strip |
| `#5c8fbd` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1228 .import-strip |
| `#5d4775` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1239 .import-strip |
| `#604d23` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1221 .import-strip |
| `#66706a` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1187 .maker-header |
| `#6a4a1f` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1224 .import-strip |
| `#6a5632` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1186 .maker-header |
| `#718071` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1279 .import-strip |
| `#746b58` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1270 .import-strip |
| `#778077` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1253 .import-strip |
| `#788178` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1249 .import-strip |
| `#7a5520` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1250 .import-strip |
| `#7b847b` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1252 .import-strip |
| `#95a38d` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1202 .unlock-override |
| `#9ba89b` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1290 .import-strip |
| `#9c3026` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1206 .unlock-override |
| `#b78945` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1224 .import-strip |
| `#c7b4df` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1244 .import-strip |
| `#c86f66` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1206 .unlock-override |
| `#cbd8c8` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1281 .import-strip |
| `#cfd8cf` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1237 .import-strip |
| `#d7e5df` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1184 .maker-header -> background |
| `#dbe5db` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1219 .import-strip |
| `#dde6db` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1284 .import-strip |
| `#dfc27b` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1255 .import-strip |
| `#e0e5df` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1240 .import-strip |
| `#e0e6df` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1277 .import-strip |
| `#e2d2ad` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1221 .import-strip |
| `#e3e8e3` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1248 .import-strip |
| `#e4b46a` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1250 .import-strip |
| `#eadbff` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1227 .import-strip |
| `#eaf5ff` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1228 .import-strip |
| `#edf3ea` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1278 .import-strip |
| `#eef4ef` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1211 .import-strip -> background |
| `#f2e9ff` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1226 .import-strip |
| `#f2eadb` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1184 .maker-header -> background |
| `#f8fbf6` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1219 .import-strip |
| `#faf6ff` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1239 .import-strip |
| `#fbfcfa` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1284 .import-strip |
| `#fbfdfa` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1277 .import-strip |
| `#fcf8ff` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1244 .import-strip |
| `#fff` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1281 .import-strip |
| `#fff1c7` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1225 .import-strip |
| `#fff8e7` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1224 .import-strip |
| `#fff8e9` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1250 .import-strip |
| `#fff9e9` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1221 .import-strip |
| `#fffaf0` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1255 .import-strip |
| `#fffdf6` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1202 .unlock-override |
| `blue` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1228 .import-strip |
| `currentcolor` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1288 .import-strip |
| `rgba(126,83,183,0.42)` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1286 .import-strip |
| `rgba(154,121,189,0.24)` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1227 .import-strip |
| `rgba(183,137,69,0.22)` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1225 .import-strip |
| `rgba(255,255,255,0.2)` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1286 .import-strip |
| `rgba(255,255,255,0.42)` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1196 .unlock-override -> background |
| `rgba(255,255,255,0.56)` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1263 .import-strip |
| `rgba(38,49,38,0.12)` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1285 .import-strip |
| `rgba(70,80,70,0.18)` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1184 .maker-header -> background |
| `rgba(90,118,96,0.28)` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1195 .unlock-override -> border |
| `transparent` | 1 | src/components/sheet/dataPackMaker/DataPackMakerPanel.vue:1205 .unlock-override |

### Inventory / equipment

| Color | Uses | Files / Selectors / Properties |
|---|---:|---|
| `#e74c3c` | 6 | src/components/sheet/inventory/EquipmentSlots.vue:242 &.non-proficient -> border-color<br>src/components/sheet/inventory/EquipmentSlots.vue:243 &.non-proficient -> border-left-color<br>src/components/sheet/inventory/EquipmentSlots.vue:278 .btn-unequip<br>src/components/sheet/inventory/InventoryItemRow.vue:589 .btn-del<br>src/components/sheet/inventory/InventoryPanel.vue:528 &.load-red -> color<br>src/components/sheet/inventory/InventoryPanel.vue:570 button |
| `#ffcdd2` | 5 | src/components/sheet/inventory/EquipmentSlots.vue:297 .rejected-card -> background<br>src/components/sheet/inventory/EquipmentSlots.vue:383 .rejected-card -> background<br>src/components/sheet/inventory/TrashPanel.vue:68 .trash-panel -> border<br>src/components/sheet/inventory/TrashPanel.vue:75 .panel-header -> background<br>src/components/sheet/inventory/TrashPanel.vue:100 .trash-item -> border |
| `white` | 5 | src/components/sheet/inventory/EquipmentSlots.vue:219 .equip-card -> background<br>src/components/sheet/inventory/EquipmentSlots.vue:271 .ac-badge -> background<br>src/components/sheet/inventory/EquipmentSlots.vue:342 .equip-card -> background<br>src/components/sheet/inventory/EquipmentSlots.vue:354 .ac-badge -> color<br>src/components/sheet/inventory/InventoryPanel.vue:568 button -> flex |
| `#4f0b22` | 4 | src/components/sheet/inventory/InventoryItemRow.vue:485 .enchant-more -> color<br>src/components/sheet/inventory/InventoryItemRow.vue:567 .btn-attune -> color<br>src/components/sheet/inventory/InventoryItemRow.vue:574 &.active -> background<br>src/components/sheet/inventory/InventoryItemRow.vue:575 &.active -> border-color |
| `#7f8c8d` | 4 | src/components/sheet/inventory/EquipmentSlots.vue:268 .meta-row<br>src/components/sheet/inventory/InventoryPanel.vue:513 .panel-header<br>src/components/sheet/inventory/InventoryPanel.vue:555 .coin-header<br>src/components/sheet/inventory/InventoryPanel.vue:578 button |
| `#adb5bd` | 4 | src/components/sheet/inventory/InventoryItemRow.vue:410 .btn-expand -> background<br>src/components/sheet/inventory/InventoryItemRow.vue:443 .template-name -> color<br>src/components/sheet/inventory/InventoryItemRow.vue:587 .btn-del -> border<br>src/components/sheet/inventory/InventoryItemRow.vue:657 .empty-slot -> color |
| `#dee2e6` | 4 | src/components/sheet/inventory/EquipmentSlots.vue:220 .equip-card -> border<br>src/components/sheet/inventory/InventoryItemRow.vue:517 .qty-controls -> border<br>src/components/sheet/inventory/InventoryItemRow.vue:535 .btn-mini<br>src/components/sheet/inventory/InventoryItemRow.vue:660 .empty-slot -> border |
| `#f1f3f5` | 4 | src/components/sheet/inventory/InventoryItemRow.vue:382 &:hover -> background<br>src/components/sheet/inventory/InventoryItemRow.vue:537 .btn-mini<br>src/components/sheet/inventory/InventoryItemRow.vue:538 .btn-mini<br>src/components/sheet/inventory/InventoryItemRow.vue:596 .container-contents -> border-top |
| `#fff` | 4 | src/components/sheet/inventory/InventoryItemRow.vue:516 .qty-controls -> background<br>src/components/sheet/inventory/InventoryPanel.vue:497 .inventory-panel -> background<br>src/components/sheet/inventory/InventoryPanel.vue:614 .inventory-tooltip<br>src/components/sheet/inventory/TrashPanel.vue:99 .trash-item -> background |
| `#2c3e50` | 3 | src/components/sheet/inventory/EquipmentSlots.vue:260 .name-row<br>src/components/sheet/inventory/EquipmentSlots.vue:353 .ac-badge -> background<br>src/components/sheet/inventory/InventoryPanel.vue:516 .carrying-load -> color |
| `#333` | 3 | src/components/sheet/inventory/InventoryPanel.vue:556 .coin-header<br>src/components/sheet/inventory/InventoryPanel.vue:613 .inventory-tooltip<br>src/components/sheet/inventory/InventoryPanel.vue:624 .inventory-tooltip |
| `#42b983` | 3 | src/components/sheet/inventory/InventoryItemRow.vue:666 .empty-slot<br>src/components/sheet/inventory/InventoryPanel.vue:589 .inventory-list<br>src/components/sheet/inventory/InventoryPanel.vue:621 .inventory-tooltip |
| `#5f6c7b` | 3 | src/components/sheet/inventory/InventoryItemRow.vue:464 .container-capacity -> color<br>src/components/sheet/inventory/InventoryItemRow.vue:616 .hanging-slot-label -> color<br>src/components/sheet/inventory/InventoryItemRow.vue:650 .hanging-badge -> color |
| `#868e96` | 3 | src/components/sheet/inventory/InventoryItemRow.vue:457 .container-badge -> color<br>src/components/sheet/inventory/InventoryItemRow.vue:500 .col-weight -> color<br>src/components/sheet/inventory/InventoryItemRow.vue:552 .qty-static -> color |
| `#c0392b` | 3 | src/components/sheet/inventory/EquipmentSlots.vue:201 .global-warning -> color<br>src/components/sheet/inventory/EquipmentSlots.vue:246 &.non-proficient<br>src/components/sheet/inventory/TrashPanel.vue:77 .panel-header -> color |
| `#c62828` | 3 | src/components/sheet/inventory/EquipmentSlots.vue:297 .rejected-card -> background<br>src/components/sheet/inventory/EquipmentSlots.vue:384 .rejected-card -> color<br>src/components/sheet/inventory/TrashPanel.vue:105 .trash-item -> color |
| `#ddd` | 3 | src/components/sheet/inventory/InventoryPanel.vue:512 .panel-header -> border-bottom<br>src/components/sheet/inventory/InventoryPanel.vue:562 input -> width<br>src/components/sheet/inventory/InventoryPanel.vue:603 .inventory-tooltip -> color |
| `#e57373` | 3 | src/components/sheet/inventory/EquipmentSlots.vue:298 .rejected-card -> border<br>src/components/sheet/inventory/EquipmentSlots.vue:385 .rejected-card -> border<br>src/components/sheet/inventory/TrashPanel.vue:90 .empty-tip -> color |
| `#f8f9fa` | 3 | src/components/sheet/inventory/EquipmentSlots.vue:169 .equipment-zone -> background<br>src/components/sheet/inventory/InventoryItemRow.vue:387 &.is-container -> background<br>src/components/sheet/inventory/InventoryItemRow.vue:526 .btn-mini -> background |
| `#1976d2` | 2 | src/components/sheet/inventory/EquipmentSlots.vue:329 .zone-label -> color<br>src/components/sheet/inventory/EquipmentSlots.vue:364 .ghost -> border |
| `#2980b9` | 2 | src/components/sheet/inventory/InventoryItemRow.vue:396 &.is-proxy .qty-val -> color<br>src/components/sheet/inventory/InventoryPanel.vue:576 button |
| `#495057` | 2 | src/components/sheet/inventory/InventoryItemRow.vue:411 .btn-expand<br>src/components/sheet/inventory/InventoryItemRow.vue:527 .btn-mini -> color |
| `#555` | 2 | src/components/sheet/inventory/InventoryPanel.vue:597 .inventory-tooltip -> border<br>src/components/sheet/inventory/InventoryPanel.vue:610 .inventory-tooltip |
| `#5dade2` | 2 | src/components/sheet/inventory/InventoryPanel.vue:576 button<br>src/components/sheet/inventory/InventoryPanel.vue:625 .inventory-tooltip |
| `#8e9aaf` | 2 | src/components/sheet/inventory/InventoryItemRow.vue:605 .hanging-slot-shell -> border-left<br>src/components/sheet/inventory/InventoryItemRow.vue:632 .hanging-dot -> background |
| `#95a5a6` | 2 | src/components/sheet/inventory/EquipmentSlots.vue:276 .btn-unequip -> background<br>src/components/sheet/inventory/InventoryPanel.vue:578 button |
| `#a996c8` | 2 | src/components/sheet/inventory/InventoryPanel.vue:660 span -> color<br>src/components/sheet/inventory/InventoryPanel.vue:674 .magic-visual-row -> color |
| `#bbdefb` | 2 | src/components/sheet/inventory/EquipmentSlots.vue:343 .equip-card -> border<br>src/components/sheet/inventory/EquipmentSlots.vue:363 .ghost -> background |
| `#d35400` | 2 | src/components/sheet/inventory/InventoryPanel.vue:524 &.load-orange -> color<br>src/components/sheet/inventory/InventoryPanel.vue:579 button |
| `#dcc2ff` | 2 | src/components/sheet/inventory/InventoryItemRow.vue:566 .btn-attune -> background<br>src/components/sheet/inventory/InventoryPanel.vue:706 strong -> color |
| `#e9ecef` | 2 | src/components/sheet/inventory/InventoryItemRow.vue:391 &.is-container<br>src/components/sheet/inventory/InventoryItemRow.vue:534 .btn-mini |
| `#ecf0f1` | 2 | src/components/sheet/inventory/EquipmentSlots.vue:284 .ghost -> background<br>src/components/sheet/inventory/InventoryPanel.vue:511 .panel-header -> background |
| `#eee` | 2 | src/components/sheet/inventory/InventoryPanel.vue:539 .wallet-row -> border-bottom<br>src/components/sheet/inventory/InventoryPanel.vue:548 .coin-control -> border |
| `#f1c40f` | 2 | src/components/sheet/inventory/InventoryPanel.vue:577 button<br>src/components/sheet/inventory/InventoryPanel.vue:618 .inventory-tooltip |
| `orange` | 2 | src/components/sheet/inventory/InventoryPanel.vue:523 &.load-orange<br>src/components/sheet/inventory/InventoryPanel.vue:626 .inventory-tooltip |
| `red` | 2 | src/components/sheet/inventory/InventoryPanel.vue:527 &.load-red<br>src/components/sheet/inventory/InventoryPanel.vue:628 .inventory-tooltip |
| `rgba(0,0,0,0.05)` | 2 | src/components/sheet/inventory/EquipmentSlots.vue:349 .equip-card -> box-shadow<br>src/components/sheet/inventory/InventoryItemRow.vue:520 .qty-controls -> box-shadow |
| `rgba(0,0,0,0.2)` | 2 | src/components/sheet/inventory/EquipmentSlots.vue:300 .rejected-card -> font-weight<br>src/components/sheet/inventory/EquipmentSlots.vue:389 .rejected-card -> box-shadow |
| `rgba(142,154,175,0.08)` | 2 | src/components/sheet/inventory/InventoryItemRow.vue:607 .hanging-slot-shell -> background<br>src/components/sheet/inventory/InventoryItemRow.vue:619 .hanging-slot-label -> background |
| `#212529` | 1 | src/components/sheet/inventory/InventoryItemRow.vue:534 .btn-mini |
| `#222` | 1 | src/components/sheet/inventory/InventoryPanel.vue:613 .inventory-tooltip |
| `#27ae60` | 1 | src/components/sheet/inventory/InventoryPanel.vue:569 button |
| `#333333` | 1 | src/components/sheet/inventory/InventoryItemRow.vue:376 .item-row -> color |
| `#343a40` | 1 | src/components/sheet/inventory/InventoryItemRow.vue:546 .qty-val -> color |
| `#34495e` | 1 | src/components/sheet/inventory/EquipmentSlots.vue:271 .ac-badge -> background |
| `#3498db` | 1 | src/components/sheet/inventory/EquipmentSlots.vue:221 .equip-card -> border-left |
| `#48c9b0` | 1 | src/components/sheet/inventory/InventoryPanel.vue:627 .inventory-tooltip |
| `#546e7a` | 1 | src/components/sheet/inventory/EquipmentSlots.vue:194 .zone-label -> color |
| `#6c4a7f` | 1 | src/components/sheet/inventory/InventoryItemRow.vue:492 .enchant-more -> color |
| `#777` | 1 | src/components/sheet/inventory/InventoryPanel.vue:611 .inventory-tooltip |
| `#888` | 1 | src/components/sheet/inventory/InventoryPanel.vue:620 .inventory-tooltip |
| `#90a4ae` | 1 | src/components/sheet/inventory/EquipmentSlots.vue:179 &:hover -> border-color |
| `#90caf9` | 1 | src/components/sheet/inventory/EquipmentSlots.vue:318 .equipment-zone -> border |
| `#98a2ad` | 1 | src/components/sheet/inventory/InventoryItemRow.vue:641 .hanging-empty-slot -> color |
| `#999` | 1 | src/components/sheet/inventory/TrashPanel.vue:112 .trash-item |
| `#9aa5b1` | 1 | src/components/sheet/inventory/InventoryItemRow.vue:623 small -> color |
| `#a04000` | 1 | src/components/sheet/inventory/InventoryPanel.vue:579 button |
| `#aaa` | 1 | src/components/sheet/inventory/InventoryPanel.vue:624 .inventory-tooltip |
| `#b58cff` | 1 | src/components/sheet/inventory/InventoryItemRow.vue:564 .btn-attune -> border |
| `#b7950b` | 1 | src/components/sheet/inventory/InventoryPanel.vue:520 &.load-yellow -> color |
| `#b7a2e6` | 1 | src/components/sheet/inventory/InventoryPanel.vue:710 span -> color |
| `#b8c2cc` | 1 | src/components/sheet/inventory/InventoryItemRow.vue:604 .hanging-slot-shell -> border |
| `#bbb` | 1 | src/components/sheet/inventory/InventoryPanel.vue:616 .inventory-tooltip |
| `#bdc3c7` | 1 | src/components/sheet/inventory/EquipmentSlots.vue:285 .ghost -> border |
| `#c9c1d8` | 1 | src/components/sheet/inventory/InventoryPanel.vue:694 p -> color |
| `#ced4da` | 1 | src/components/sheet/inventory/InventoryItemRow.vue:388 &.is-container -> border-left |
| `#cfd8dc` | 1 | src/components/sheet/inventory/EquipmentSlots.vue:170 .equipment-zone -> border |
| `#d4ac0d` | 1 | src/components/sheet/inventory/InventoryPanel.vue:577 button |
| `#d7c1ff` | 1 | src/components/sheet/inventory/InventoryPanel.vue:638 .magic-traits-title -> color |
| `#e0e0e0` | 1 | src/components/sheet/inventory/InventoryItemRow.vue:367 .inventory-row-wrapper -> border-bottom |
| `#e3f2fd` | 1 | src/components/sheet/inventory/EquipmentSlots.vue:317 .equipment-zone -> background |
| `#e6d8ff` | 1 | src/components/sheet/inventory/InventoryPanel.vue:664 strong -> color |
| `#e8f5e9` | 1 | src/components/sheet/inventory/InventoryItemRow.vue:666 .empty-slot |
| `#eb984e` | 1 | src/components/sheet/inventory/InventoryPanel.vue:626 .inventory-tooltip |
| `#ec7063` | 1 | src/components/sheet/inventory/InventoryPanel.vue:628 .inventory-tooltip |
| `#ef9a9a` | 1 | src/components/sheet/inventory/TrashPanel.vue:123 .ghost -> background |
| `#f9f9f9` | 1 | src/components/sheet/inventory/InventoryPanel.vue:547 .coin-control -> background |
| `#fadbd8` | 1 | src/components/sheet/inventory/EquipmentSlots.vue:202 .global-warning -> background |
| `#fcfcfc` | 1 | src/components/sheet/inventory/InventoryItemRow.vue:595 .container-contents -> background |
| `#fdedec` | 1 | src/components/sheet/inventory/EquipmentSlots.vue:244 &.non-proficient -> background-color |
| `#fdfdfd` | 1 | src/components/sheet/inventory/InventoryPanel.vue:538 .wallet-row -> background |
| `#ffbc8a` | 1 | src/components/sheet/inventory/InventoryPanel.vue:716 .trait-damage -> color |
| `#ffebee` | 1 | src/components/sheet/inventory/TrashPanel.vue:116 &:hover -> background |
| `#fff0f0` | 1 | src/components/sheet/inventory/TrashPanel.vue:67 .trash-panel -> background |
| `#fff7fb` | 1 | src/components/sheet/inventory/InventoryItemRow.vue:576 &.active -> color |
| `#ffffff` | 1 | src/components/sheet/inventory/InventoryItemRow.vue:375 .item-row -> background |
| `blue` | 1 | src/components/sheet/inventory/InventoryPanel.vue:625 .inventory-tooltip |
| `cyan` | 1 | src/components/sheet/inventory/InventoryPanel.vue:627 .inventory-tooltip |
| `gold` | 1 | src/components/sheet/inventory/InventoryPanel.vue:618 .inventory-tooltip |
| `rgba(0,0,0,0.01)` | 1 | src/components/sheet/inventory/InventoryItemRow.vue:663 .empty-slot -> background |
| `rgba(0,0,0,0.02)` | 1 | src/components/sheet/inventory/InventoryItemRow.vue:597 .container-contents -> box-shadow |
| `rgba(0,0,0,0.03)` | 1 | src/components/sheet/inventory/EquipmentSlots.vue:227 .equip-card -> box-shadow |
| `rgba(0,0,0,0.08)` | 1 | src/components/sheet/inventory/EquipmentSlots.vue:236 &:hover -> box-shadow |
| `rgba(0,0,0,0.22)` | 1 | src/components/sheet/inventory/InventoryPanel.vue:609 .inventory-tooltip |
| `rgba(0,0,0,0.45)` | 1 | src/components/sheet/inventory/InventoryPanel.vue:683 .color-swatch -> box-shadow |
| `rgba(0,0,0,0.5)` | 1 | src/components/sheet/inventory/InventoryPanel.vue:601 .inventory-tooltip -> box-shadow |
| `rgba(142,154,175,0.14)` | 1 | src/components/sheet/inventory/InventoryItemRow.vue:633 .hanging-dot -> box-shadow |
| `rgba(215,193,255,0.18)` | 1 | src/components/sheet/inventory/InventoryPanel.vue:655 .magic-attribute-row -> border |
| `rgba(215,193,255,0.24)` | 1 | src/components/sheet/inventory/InventoryPanel.vue:687 .magic-trait-card -> border |
| `rgba(220,194,255,0.8)` | 1 | src/components/sheet/inventory/InventoryItemRow.vue:484 .enchant-more -> background |
| `rgba(231,76,60,0.1)` | 1 | src/components/sheet/inventory/InventoryItemRow.vue:589 .btn-del |
| `rgba(235,152,78,0.1)` | 1 | src/components/sheet/inventory/InventoryPanel.vue:626 .inventory-tooltip |
| `rgba(236,112,99,0.1)` | 1 | src/components/sheet/inventory/InventoryPanel.vue:628 .inventory-tooltip |
| `rgba(240,231,255,0.06)` | 1 | src/components/sheet/inventory/InventoryPanel.vue:657 .magic-attribute-row -> background |
| `rgba(240,231,255,0.08)` | 1 | src/components/sheet/inventory/InventoryPanel.vue:690 .magic-trait-card -> background |
| `rgba(255,255,255,0.42)` | 1 | src/components/sheet/inventory/InventoryPanel.vue:681 .color-swatch -> border |
| `rgba(255,255,255,0.65)` | 1 | src/components/sheet/inventory/InventoryItemRow.vue:645 .hanging-empty-slot -> background |
| `rgba(255,255,255,0.9)` | 1 | src/components/sheet/inventory/InventoryItemRow.vue:607 .hanging-slot-shell -> background |
| `rgba(30,30,30,0.98)` | 1 | src/components/sheet/inventory/InventoryPanel.vue:596 .inventory-tooltip -> background |
| `rgba(72,201,176,0.1)` | 1 | src/components/sheet/inventory/InventoryPanel.vue:627 .inventory-tooltip |
| `rgba(79,11,34,0.2)` | 1 | src/components/sheet/inventory/InventoryItemRow.vue:481 .enchant-more -> border |
| `rgba(93,173,226,0.1)` | 1 | src/components/sheet/inventory/InventoryPanel.vue:625 .inventory-tooltip |
| `yellow` | 1 | src/components/sheet/inventory/InventoryPanel.vue:519 &.load-yellow |

### Library panels

| Color | Uses | Files / Selectors / Properties |
|---|---:|---|
| `#333` | 9 | src/components/sheet/library/LibraryItemsPanel.vue:363 .main-group-header -> padding<br>src/components/sheet/library/LibraryItemsPanel.vue:389 .sticky-sub-header -> font-size<br>src/components/sheet/library/LibraryItemsPanel.vue:399 .category-header -> font-size<br>src/components/sheet/library/LibraryItemsPanel.vue:415 .weapon-filter-button -> border<br>src/components/sheet/library/LibraryItemsPanel.vue:428 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:173 .main-group-header -> padding |
| `#42b983` | 8 | src/components/sheet/library/LibraryItemsPanel.vue:369 .main-group-header<br>src/components/sheet/library/LibrarySpellsPanel.vue:178 .main-group-header |
| `#fff` | 8 | src/components/sheet/library/LibraryItemsPanel.vue:366 .main-group-header<br>src/components/sheet/library/LibraryItemsPanel.vue:383 .passphrase-toggle<br>src/components/sheet/library/LibraryItemsPanel.vue:384 .passphrase-toggle<br>src/components/sheet/library/LibraryItemsPanel.vue:390 .sticky-sub-header<br>src/components/sheet/library/LibraryItemsPanel.vue:400 .category-header<br>src/components/sheet/library/LibrarySpellsPanel.vue:175 .main-group-header |
| `#555` | 6 | src/components/sheet/library/LibraryItemsPanel.vue:363 .main-group-header -> padding<br>src/components/sheet/library/LibraryItemsPanel.vue:416 .weapon-filter-button<br>src/components/sheet/library/LibraryItemsPanel.vue:435 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:173 .main-group-header -> padding<br>src/components/sheet/library/LibrarySpellsPanel.vue:206 .library-item.is-learned<br>src/components/sheet/library/LibrarySpellsPanel.vue:227 .learned-mark |
| `#d7c1ff` | 5 | src/components/sheet/library/LibraryItemsPanel.vue:375 .passphrase-toggle -> color<br>src/components/sheet/library/LibraryItemsPanel.vue:384 .passphrase-toggle<br>src/components/sheet/library/LibraryItemsPanel.vue:407 .category-header.passphrase-header -> color<br>src/components/sheet/library/LibraryItemsPanel.vue:410 .category-header.passphrase-header<br>src/components/sheet/library/LibraryItemsPanel.vue:434 .weapon-filter-button |
| `#282828` | 4 | src/components/sheet/library/LibraryItemsPanel.vue:393 .sticky-sub-header<br>src/components/sheet/library/LibraryItemsPanel.vue:420 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:187 .sticky-sub-header<br>src/components/sheet/library/LibrarySpellsPanel.vue:200 .branch-header |
| `#2c2c2c` | 4 | src/components/sheet/library/LibraryItemsPanel.vue:369 .main-group-header<br>src/components/sheet/library/LibraryItemsPanel.vue:400 .category-header<br>src/components/sheet/library/LibrarySpellsPanel.vue:178 .main-group-header<br>src/components/sheet/library/LibrarySpellsPanel.vue:194 .branch-header |
| `#2d2d2d` | 4 | src/components/sheet/library/LibraryItemsPanel.vue:366 .main-group-header<br>src/components/sheet/library/LibraryItemsPanel.vue:420 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:175 .main-group-header<br>src/components/sheet/library/LibrarySpellsPanel.vue:200 .branch-header |
| `#aaa` | 4 | src/components/sheet/library/LibraryItemsPanel.vue:389 .sticky-sub-header -> font-size<br>src/components/sheet/library/LibraryItemsPanel.vue:428 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:183 .sticky-sub-header -> font-size<br>src/components/sheet/library/LibrarySpellsPanel.vue:221 .learned-mark |
| `#d8c36a` | 4 | src/components/sheet/library/LibraryItemsPanel.vue:403 .category-header<br>src/components/sheet/library/LibrarySpellsPanel.vue:197 .branch-header |
| `#1a1a1a` | 3 | src/components/sheet/library/LibraryItemsPanel.vue:394 .sticky-sub-header<br>src/components/sheet/library/LibrarySpellsPanel.vue:188 .sticky-sub-header<br>src/components/sheet/library/LibrarySpellsPanel.vue:204 .library-item.is-learned -> background-color |
| `#242424` | 3 | src/components/sheet/library/LibraryItemsPanel.vue:398 .category-header -> position<br>src/components/sheet/library/LibraryItemsPanel.vue:416 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:192 .branch-header -> position |
| `#888` | 3 | src/components/sheet/library/LibraryItemsPanel.vue:368 .main-group-header<br>src/components/sheet/library/LibraryItemsPanel.vue:415 .weapon-filter-button -> border<br>src/components/sheet/library/LibrarySpellsPanel.vue:177 .main-group-header |
| `#ddd` | 3 | src/components/sheet/library/LibraryItemsPanel.vue:364 .main-group-header -> font-size<br>src/components/sheet/library/LibraryItemsPanel.vue:416 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:174 .main-group-header -> font-size |
| `transparent` | 3 | src/components/sheet/library/LibraryItemsPanel.vue:388 .sticky-sub-header -> position<br>src/components/sheet/library/LibrarySpellsPanel.vue:182 .sticky-sub-header -> position<br>src/components/sheet/library/LibrarySpellsPanel.vue:214 .learned-mark |
| `#1e1e1e` | 2 | src/components/sheet/library/LibraryItemsPanel.vue:420 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:200 .branch-header |
| `#222` | 2 | src/components/sheet/library/LibraryItemsPanel.vue:388 .sticky-sub-header -> position<br>src/components/sheet/library/LibrarySpellsPanel.vue:182 .sticky-sub-header -> position |
| `#252525` | 2 | src/components/sheet/library/LibraryItemsPanel.vue:363 .main-group-header -> padding<br>src/components/sheet/library/LibrarySpellsPanel.vue:173 .main-group-header -> padding |
| `#2a2a2a` | 2 | src/components/sheet/library/LibraryItemsPanel.vue:390 .sticky-sub-header<br>src/components/sheet/library/LibrarySpellsPanel.vue:184 .sticky-sub-header |
| `#3d3d3d` | 2 | src/components/sheet/library/LibraryItemsPanel.vue:398 .category-header -> position<br>src/components/sheet/library/LibrarySpellsPanel.vue:192 .branch-header -> position |
| `#5dade2` | 2 | src/components/sheet/library/LibraryItemsPanel.vue:429 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:222 .learned-mark |
| `#666` | 2 | src/components/sheet/library/LibraryItemsPanel.vue:394 .sticky-sub-header<br>src/components/sheet/library/LibrarySpellsPanel.vue:188 .sticky-sub-header |
| `#82e0aa` | 2 | src/components/sheet/library/LibraryItemsPanel.vue:417 .weapon-filter-button<br>src/components/sheet/library/LibraryItemsPanel.vue:433 .weapon-filter-button |
| `#9b59b6` | 2 | src/components/sheet/library/LibrarySpellsPanel.vue:214 .learned-mark<br>src/components/sheet/library/LibrarySpellsPanel.vue:218 .learned-mark |
| `#c8c8c8` | 2 | src/components/sheet/library/LibraryItemsPanel.vue:399 .category-header -> font-size<br>src/components/sheet/library/LibrarySpellsPanel.vue:193 .branch-header -> font-size |
| `#ccc` | 2 | src/components/sheet/library/LibraryItemsPanel.vue:423 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:217 .learned-mark |
| `#eb984e` | 2 | src/components/sheet/library/LibraryItemsPanel.vue:430 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:223 .learned-mark |
| `#eee` | 2 | src/components/sheet/library/LibraryItemsPanel.vue:393 .sticky-sub-header<br>src/components/sheet/library/LibrarySpellsPanel.vue:187 .sticky-sub-header |
| `blue` | 2 | src/components/sheet/library/LibraryItemsPanel.vue:429 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:222 .learned-mark |
| `orange` | 2 | src/components/sheet/library/LibraryItemsPanel.vue:430 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:223 .learned-mark |
| `rgba(235,152,78,0.1)` | 2 | src/components/sheet/library/LibraryItemsPanel.vue:430 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:223 .learned-mark |
| `rgba(93,173,226,0.1)` | 2 | src/components/sheet/library/LibraryItemsPanel.vue:429 .weapon-filter-button<br>src/components/sheet/library/LibrarySpellsPanel.vue:222 .learned-mark |
| `#16a085` | 1 | src/components/sheet/library/LibrarySpellsPanel.vue:224 .learned-mark |
| `#1b1b1b` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:415 .weapon-filter-button -> border |
| `#27ae60` | 1 | src/components/sheet/library/LibrarySpellsPanel.vue:210 .learned-mark -> color |
| `#3a175f` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:384 .passphrase-toggle |
| `#48c9b0` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:431 .weapon-filter-button |
| `#7f8c8d` | 1 | src/components/sheet/library/LibrarySpellsPanel.vue:205 .library-item.is-learned |
| `#999` | 1 | src/components/sheet/library/LibrarySpellsPanel.vue:225 .learned-mark |
| `#cdb8ff` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:409 .category-header.passphrase-header |
| `#d4ac0d` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:425 .weapon-filter-button |
| `#ec7063` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:432 .weapon-filter-button |
| `#f0e7ff` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:410 .category-header.passphrase-header |
| `currentcolor` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:424 .weapon-filter-button |
| `cyan` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:431 .weapon-filter-button |
| `gray` | 1 | src/components/sheet/library/LibrarySpellsPanel.vue:225 .learned-mark |
| `green` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:433 .weapon-filter-button |
| `purple` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:434 .weapon-filter-button |
| `red` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:432 .weapon-filter-button |
| `rgba(130,224,170,0.1)` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:433 .weapon-filter-button |
| `rgba(130,224,170,0.12)` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:417 .weapon-filter-button |
| `rgba(130,224,170,0.55)` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:417 .weapon-filter-button |
| `rgba(215,193,255,0.08)` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:374 .passphrase-toggle -> background |
| `rgba(215,193,255,0.1)` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:409 .category-header.passphrase-header |
| `rgba(215,193,255,0.12)` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:434 .weapon-filter-button |
| `rgba(215,193,255,0.16)` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:383 .passphrase-toggle |
| `rgba(215,193,255,0.28)` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:373 .passphrase-toggle -> border |
| `rgba(215,193,255,0.5)` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:408 .category-header.passphrase-header -> border-left-color |
| `rgba(215,193,255,0.6)` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:383 .passphrase-toggle |
| `rgba(215,193,255,0.75)` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:421 .weapon-filter-button |
| `rgba(22,160,133,0.14)` | 1 | src/components/sheet/library/LibrarySpellsPanel.vue:224 .learned-mark |
| `rgba(22,160,133,0.32)` | 1 | src/components/sheet/library/LibrarySpellsPanel.vue:224 .learned-mark |
| `rgba(236,112,99,0.1)` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:432 .weapon-filter-button |
| `rgba(255,255,255,0.08)` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:421 .weapon-filter-button |
| `rgba(255,255,255,0.1)` | 1 | src/components/sheet/library/LibrarySpellsPanel.vue:225 .learned-mark |
| `rgba(72,201,176,0.1)` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:431 .weapon-filter-button |
| `white` | 1 | src/components/sheet/library/LibraryItemsPanel.vue:425 .weapon-filter-button |

### Modals / editors

| Color | Uses | Files / Selectors / Properties |
|---|---:|---|
| `#fff` | 13 | src/components/sheet/modals/DataPackManagerModal.vue:256 .close-btn -> color<br>src/components/sheet/modals/DataPackManagerModal.vue:302 input, textarea -> color<br>src/components/sheet/modals/DataPackManagerModal.vue:407 .unlock-inline input -> color<br>src/components/sheet/modals/DataPackUnlockModal.vue:124 .close-btn -> color<br>src/components/sheet/modals/DataPackUnlockModal.vue:141 input -> color<br>src/components/sheet/modals/ExpertiseSettingsModal.vue:175 .btn-toggle -> background |
| `#2c3e50` | 6 | src/components/sheet/modals/ExpertiseSettingsModal.vue:135 h3 -> color<br>src/components/sheet/modals/ForgeModal.vue:612 .modal-header -> background<br>src/components/sheet/modals/ForgeModal.vue:714 .main-name .input-lg -> color<br>src/components/sheet/modals/ForgeModal.vue:819 .check-option -> color<br>src/components/sheet/modals/ForgeModal.vue:843 .tag -> background<br>src/components/sheet/modals/ProficiencySettingsModal.vue:237 .modal-header |
| `#ddd` | 6 | src/components/sheet/modals/ExpertiseSettingsModal.vue:252 input -> border<br>src/components/sheet/modals/ExpertiseSettingsModal.vue:264 .btn-add -> border<br>src/components/sheet/modals/ProficiencySettingsModal.vue:248 .btn-toggle -> border<br>src/components/sheet/modals/ProficiencySettingsModal.vue:278 .select-preset -> border<br>src/components/sheet/modals/ProficiencySettingsModal.vue:287 &.full-width<br>src/components/sheet/modals/ProficiencySettingsModal.vue:288 &.full-width |
| `#8e44ad` | 5 | src/components/sheet/modals/ExpertiseSettingsModal.vue:187 &:hover -> border-color<br>src/components/sheet/modals/ExpertiseSettingsModal.vue:194 &.active -> border-color<br>src/components/sheet/modals/ExpertiseSettingsModal.vue:202 .mark -> color<br>src/components/sheet/modals/ExpertiseSettingsModal.vue:257 &:focus -> border-color<br>src/components/sheet/modals/ProficiencySettingsModal.vue:269 &.expertise |
| `#b7c2d2` | 5 | src/components/sheet/modals/EnchantingModal.vue:844 small -> color<br>src/components/sheet/modals/EnchantingModal.vue:956 .source-line -> color<br>src/components/sheet/modals/EnchantingModal.vue:1002 p -> color<br>src/components/sheet/modals/EnchantingModal.vue:1149 small -> color<br>src/components/sheet/modals/EnchantingModal.vue:1260 .empty-inline -> color |
| `#d6dfef` | 5 | src/components/sheet/modals/EnchantingModal.vue:904 button -> color<br>src/components/sheet/modals/EnchantingModal.vue:928 .selected-summary -> color<br>src/components/sheet/modals/EnchantingModal.vue:1052 .full-field -> color<br>src/components/sheet/modals/EnchantingModal.vue:1098 .trait-badge -> color<br>src/components/sheet/modals/EnchantingModal.vue:1279 .quick-actions button -> color |
| `#eee` | 5 | src/components/sheet/modals/ExpertiseSettingsModal.vue:127 .modal-header -> border-bottom<br>src/components/sheet/modals/ExpertiseSettingsModal.vue:213 .divider -> border-top<br>src/components/sheet/modals/ForgeModal.vue:854 .modal-footer -> border-top<br>src/components/sheet/modals/ProficiencySettingsModal.vue:235 .modal-header -> padding<br>src/components/sheet/modals/ProficiencySettingsModal.vue:255 .btn-toggle |
| `#f7d58a` | 5 | src/components/sheet/modals/EnchantingModal.vue:932 strong -> color<br>src/components/sheet/modals/EnchantingModal.vue:996 h4 -> color<br>src/components/sheet/modals/EnchantingModal.vue:1159 .btn-edit-trait -> color<br>src/components/sheet/modals/EnchantingModal.vue:1194 strong -> color<br>src/components/sheet/modals/EnchantingModal.vue:1214 .trait-pill -> color |
| `rgba(255,255,255,0.08)` | 5 | src/components/sheet/modals/DataPackManagerModal.vue:244 .modal-header -> border-bottom<br>src/components/sheet/modals/DataPackManagerModal.vue:255 .close-btn -> background<br>src/components/sheet/modals/DataPackUnlockModal.vue:123 .close-btn -> background<br>src/components/sheet/modals/EnchantingModal.vue:938 span -> background<br>src/components/sheet/modals/EnchantingModal.vue:1278 .quick-actions button -> background |
| `#d35400` | 4 | src/components/sheet/modals/ForgeModal.vue:679 &.type-specific<br>src/components/sheet/modals/ForgeModal.vue:705 &:focus -> border-color<br>src/components/sheet/modals/ForgeModal.vue:723 &:focus -> border-bottom-color<br>src/components/sheet/modals/ForgeModal.vue:878 .btn-save -> background |
| `#f1f3f5` | 4 | src/components/sheet/modals/ExpertiseSettingsModal.vue:263 .btn-add -> background<br>src/components/sheet/modals/ForgeModal.vue:874 .btn-cancel<br>src/components/sheet/modals/ProficiencySettingsModal.vue:260 .tag -> background<br>src/components/sheet/modals/ProficiencySettingsModal.vue:288 &.full-width |
| `#f5c560` | 4 | src/components/sheet/modals/EnchantingModal.vue:787 .eyebrow -> color<br>src/components/sheet/modals/EnchantingModal.vue:855 .empty-rune -> color<br>src/components/sheet/modals/EnchantingModal.vue:1131 input -> accent-color<br>src/components/sheet/modals/EnchantingModal.vue:1290 .btn-save -> background |
| `#f8f9fa` | 4 | src/components/sheet/modals/ExpertiseSettingsModal.vue:126 .modal-header -> background<br>src/components/sheet/modals/ForgeModal.vue:761 select -> width<br>src/components/sheet/modals/ForgeModal.vue:853 .modal-footer -> background<br>src/components/sheet/modals/ProficiencySettingsModal.vue:235 .modal-header -> padding |
| `rgba(245,197,96,0.22)` | 4 | src/components/sheet/modals/EnchantingModal.vue:1042 .trait-option -> border<br>src/components/sheet/modals/EnchantingModal.vue:1103 &.selected -> background<br>src/components/sheet/modals/EnchantingModal.vue:1156 .btn-edit-trait -> border-left<br>src/components/sheet/modals/ForgeModal.vue:635 &:hover -> background |
| `rgba(255,255,255,0.06)` | 4 | src/components/sheet/modals/DataPackManagerModal.vue:267 .toolbar -> border-bottom<br>src/components/sheet/modals/DataPackManagerModal.vue:293 .create-form -> border-bottom<br>src/components/sheet/modals/EnchantingModal.vue:1044 .trait-option -> background<br>src/components/sheet/modals/EnchantingModal.vue:1259 .empty-inline -> background |
| `transparent` | 4 | src/components/sheet/modals/EnchantingModal.vue:756 .enchant-panel<br>src/components/sheet/modals/EnchantingModal.vue:757 .enchant-panel<br>src/components/sheet/modals/EnchantingModal.vue:796 .btn-close -> background<br>src/components/sheet/modals/ForgeModal.vue:719 .main-name .input-lg -> background |
| `white` | 4 | src/components/sheet/modals/ExpertiseSettingsModal.vue:112 .modal-content -> background<br>src/components/sheet/modals/ForgeModal.vue:878 .btn-save -> background<br>src/components/sheet/modals/ProficiencySettingsModal.vue:229 .modal-content -> background<br>src/components/sheet/modals/ProficiencySettingsModal.vue:251 .btn-toggle |
| `#333` | 3 | src/components/sheet/modals/ExpertiseSettingsModal.vue:146 &:hover -> color<br>src/components/sheet/modals/ProficiencySettingsModal.vue:238 .modal-header<br>src/components/sheet/modals/ProficiencySettingsModal.vue:260 .tag -> background |
| `#6c3483` | 3 | src/components/sheet/modals/ExpertiseSettingsModal.vue:193 &.active -> color<br>src/components/sheet/modals/ExpertiseSettingsModal.vue:226 .tag -> color<br>src/components/sheet/modals/ProficiencySettingsModal.vue:265 &.expertise -> color |
| `#7f8c8d` | 3 | src/components/sheet/modals/ExpertiseSettingsModal.vue:162 .section h4 -> color<br>src/components/sheet/modals/ForgeModal.vue:687 label -> color<br>src/components/sheet/modals/ProficiencySettingsModal.vue:243 .modal-header |
| `#95a5a6` | 3 | src/components/sheet/modals/ExpertiseSettingsModal.vue:206 .empty-note -> color<br>src/components/sheet/modals/ForgeModal.vue:776 .template-current -> color<br>src/components/sheet/modals/ForgeModal.vue:833 em -> color |
| `#ced4da` | 3 | src/components/sheet/modals/ForgeModal.vue:698 .input-std, .unit-select -> border<br>src/components/sheet/modals/ForgeModal.vue:716 .main-name .input-lg -> border-bottom<br>src/components/sheet/modals/ForgeModal.vue:873 .btn-cancel -> background |
| `#e9ecef` | 3 | src/components/sheet/modals/ExpertiseSettingsModal.vue:270 &:hover -> background<br>src/components/sheet/modals/ForgeModal.vue:843 .tag -> background<br>src/components/sheet/modals/ProficiencySettingsModal.vue:288 &.full-width |
| `#f4ecf7` | 3 | src/components/sheet/modals/ExpertiseSettingsModal.vue:192 &.active -> background<br>src/components/sheet/modals/ExpertiseSettingsModal.vue:225 .tag -> background<br>src/components/sheet/modals/ProficiencySettingsModal.vue:264 &.expertise -> background |
| `#f5f0df` | 3 | src/components/sheet/modals/EnchantingModal.vue:759 .enchant-panel -> color<br>src/components/sheet/modals/EnchantingModal.vue:797 .btn-close -> color<br>src/components/sheet/modals/EnchantingModal.vue:1070 textarea -> color |
| `rgba(245,197,96,0.16)` | 3 | src/components/sheet/modals/EnchantingModal.vue:817 .enchant-sidebar -> border-right<br>src/components/sheet/modals/EnchantingModal.vue:900 button -> border<br>src/components/sheet/modals/EnchantingModal.vue:1311 .enchant-sidebar -> border-bottom |
| `rgba(245,197,96,0.18)` | 3 | src/components/sheet/modals/EnchantingModal.vue:756 .enchant-panel<br>src/components/sheet/modals/EnchantingModal.vue:982 .form-section -> border<br>src/components/sheet/modals/EnchantingModal.vue:1228 .saved-trait-edit -> border |
| `#15191e` | 2 | src/components/sheet/modals/DataPackManagerModal.vue:266 .toolbar -> background<br>src/components/sheet/modals/DataPackManagerModal.vue:357 span -> background |
| `#171b21` | 2 | src/components/sheet/modals/DataPackUnlockModal.vue:99 .unlock-modal -> background<br>src/components/sheet/modals/DataPackUnlockModal.vue:111 .unlock-header -> background |
| `#2980b9` | 2 | src/components/sheet/modals/ForgeModal.vue:680 &.type-specific<br>src/components/sheet/modals/ProficiencySettingsModal.vue:251 .btn-toggle |
| `#3498db` | 2 | src/components/sheet/modals/ProficiencySettingsModal.vue:251 .btn-toggle<br>src/components/sheet/modals/ProficiencySettingsModal.vue:287 &.full-width |
| `#39424c` | 2 | src/components/sheet/modals/DataPackManagerModal.vue:299 input, textarea -> border<br>src/components/sheet/modals/DataPackManagerModal.vue:404 .unlock-inline input -> border |
| `#555` | 2 | src/components/sheet/modals/ForgeModal.vue:682 &.type-specific<br>src/components/sheet/modals/ProficiencySettingsModal.vue:278 .select-preset -> border |
| `#999` | 2 | src/components/sheet/modals/ExpertiseSettingsModal.vue:143 .btn-close -> color<br>src/components/sheet/modals/ProficiencySettingsModal.vue:238 .modal-header |
| `#9fb2c8` | 2 | src/components/sheet/modals/EnchantingModal.vue:1204 span -> color<br>src/components/sheet/modals/EnchantingModal.vue:1251 span -> color |
| `#aab7c4` | 2 | src/components/sheet/modals/DataPackManagerModal.vue:373 .unlock-result-bar -> color<br>src/components/sheet/modals/DataPackUnlockModal.vue:114 .unlock-header |
| `#bdc3c7` | 2 | src/components/sheet/modals/ForgeModal.vue:640 .btn-close -> background<br>src/components/sheet/modals/ForgeModal.vue:846 .tag |
| `#c7d2e2` | 2 | src/components/sheet/modals/EnchantingModal.vue:966 .empty-state -> color<br>src/components/sheet/modals/EnchantingModal.vue:1031 .trait-type-note -> color |
| `#e1e2e6` | 2 | src/components/sheet/modals/ForgeModal.vue:662 &.highlight -> border<br>src/components/sheet/modals/ForgeModal.vue:816 .check-option -> border |
| `#e74c3c` | 2 | src/components/sheet/modals/ExpertiseSettingsModal.vue:241 &:hover -> color<br>src/components/sheet/modals/ProficiencySettingsModal.vue:270 &.expertise |
| `#f9df9c` | 2 | src/components/sheet/modals/EnchantingModal.vue:910 &.active -> color<br>src/components/sheet/modals/EnchantingModal.vue:1104 &.selected -> color |
| `#ffc5be` | 2 | src/components/sheet/modals/DataPackManagerModal.vue:422 .unlock-inline button.secondary -> color<br>src/components/sheet/modals/DataPackUnlockModal.vue:156 .clear-btn -> color |
| `rgba(0,0,0,0.14)` | 2 | src/components/sheet/modals/EnchantingModal.vue:1033 .trait-type-note -> background<br>src/components/sheet/modals/EnchantingModal.vue:1230 .saved-trait-edit -> background |
| `rgba(0,0,0,0.2)` | 2 | src/components/sheet/modals/ExpertiseSettingsModal.vue:117 .modal-content -> box-shadow<br>src/components/sheet/modals/ProficiencySettingsModal.vue:230 .modal-content -> max-width |
| `rgba(0,0,0,0.24)` | 2 | src/components/sheet/modals/EnchantingModal.vue:1189 .trait-hover-card<br>src/components/sheet/modals/EnchantingModal.vue:1213 .trait-pill -> background |
| `rgba(0,0,0,0.6)` | 2 | src/components/sheet/modals/ExpertiseSettingsModal.vue:104 .modal-backdrop -> background<br>src/components/sheet/modals/ProficiencySettingsModal.vue:223 .modal-backdrop -> background |
| `rgba(130,224,170,0.08)` | 2 | src/components/sheet/modals/DataPackManagerModal.vue:430 .unlock-result-bar -> background<br>src/components/sheet/modals/DataPackUnlockModal.vue:174 .result-card -> background |
| `rgba(245,197,96,0.12)` | 2 | src/components/sheet/modals/EnchantingModal.vue:1238 &.focused -> box-shadow<br>src/components/sheet/modals/ForgeModal.vue:628 .btn-enchant -> background |
| `rgba(245,197,96,0.14)` | 2 | src/components/sheet/modals/EnchantingModal.vue:854 .empty-rune -> background<br>src/components/sheet/modals/EnchantingModal.vue:909 &.active -> background |
| `rgba(245,197,96,0.2)` | 2 | src/components/sheet/modals/EnchantingModal.vue:772 .enchant-footer -> border-bottom<br>src/components/sheet/modals/EnchantingModal.vue:782 .enchant-footer -> border-top |
| `rgba(245,197,96,0.24)` | 2 | src/components/sheet/modals/EnchantingModal.vue:827 .target-card -> border<br>src/components/sheet/modals/EnchantingModal.vue:1095 .trait-badge -> border |
| `rgba(245,197,96,0.45)` | 2 | src/components/sheet/modals/EnchantingModal.vue:753 .enchant-panel -> border<br>src/components/sheet/modals/EnchantingModal.vue:1190 .trait-hover-card |
| `rgba(245,197,96,0.72)` | 2 | src/components/sheet/modals/EnchantingModal.vue:1110 &:focus-within -> border-color<br>src/components/sheet/modals/EnchantingModal.vue:1237 &.focused -> border-color |
| `rgba(255,255,255,0.055)` | 2 | src/components/sheet/modals/EnchantingModal.vue:903 button -> background<br>src/components/sheet/modals/EnchantingModal.vue:984 .form-section -> background |
| `rgba(255,255,255,0.07)` | 2 | src/components/sheet/modals/DataPackManagerModal.vue:321 .pack-card -> border<br>src/components/sheet/modals/EnchantingModal.vue:829 .target-card -> background |
| `#11151a` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:292 .create-form -> background |
| `#121821` | 1 | src/components/sheet/modals/EnchantingModal.vue:758 .enchant-panel |
| `#151a20` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:406 .unlock-inline input -> background |
| `#16191f` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:243 .modal-header -> background |
| `#191d22` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:230 .data-pack-modal -> background |
| `#1c2229` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:301 input, textarea -> background |
| `#1c2531` | 1 | src/components/sheet/modals/EnchantingModal.vue:758 .enchant-panel |
| `#20242c` | 1 | src/components/sheet/modals/EnchantingModal.vue:1291 .btn-save -> color |
| `#20262d` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:320 .pack-card -> background |
| `#222934` | 1 | src/components/sheet/modals/DataPackUnlockModal.vue:140 input -> background |
| `#223044` | 1 | src/components/sheet/modals/DataPackUnlockModal.vue:111 .unlock-header -> background |
| `#26313b` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:243 .modal-header -> background |
| `#2e7d32` | 1 | src/components/sheet/modals/ProficiencySettingsModal.vue:262 .tag |
| `#3a4653` | 1 | src/components/sheet/modals/DataPackUnlockModal.vue:138 input -> border |
| `#495057` | 1 | src/components/sheet/modals/ForgeModal.vue:873 .btn-cancel -> background |
| `#4a235a` | 1 | src/components/sheet/modals/ExpertiseSettingsModal.vue:188 &:hover -> color |
| `#566573` | 1 | src/components/sheet/modals/ExpertiseSettingsModal.vue:176 .btn-toggle -> color |
| `#666` | 1 | src/components/sheet/modals/ProficiencySettingsModal.vue:248 .btn-toggle -> border |
| `#75808b` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:465 .empty -> color |
| `#7f8b96` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:285 &:disabled |
| `#7f8d9b` | 1 | src/components/sheet/modals/DataPackUnlockModal.vue:187 .hint -> color |
| `#92c7ff` | 1 | src/components/sheet/modals/DataPackUnlockModal.vue:115 .unlock-header |
| `#98a5b1` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:345 .description -> color |
| `#9ed0ff` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:333 .tag -> color |
| `#aab5c0` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:247 .modal-header |
| `#adb5bd` | 1 | src/components/sheet/modals/ProficiencySettingsModal.vue:270 &.expertise |
| `#aeb9c5` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:444 .export-option -> color |
| `#aeb9c8` | 1 | src/components/sheet/modals/EnchantingModal.vue:919 small -> color |
| `#af7ac5` | 1 | src/components/sheet/modals/ExpertiseSettingsModal.vue:238 .tag-remove -> color |
| `#b7c4ce` | 1 | src/components/sheet/modals/DataPackUnlockModal.vue:176 .result-card |
| `#b9c4ce` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:296 .create-form |
| `#bbb` | 1 | src/components/sheet/modals/ProficiencySettingsModal.vue:250 .btn-toggle |
| `#bdf0d5` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:274 .pack-actions button -> color |
| `#c6d0da` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:358 span -> color |
| `#c6d1dc` | 1 | src/components/sheet/modals/DataPackUnlockModal.vue:136 .unlock-form |
| `#c8e6ff` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:414 .unlock-inline button -> color |
| `#c9d2df` | 1 | src/components/sheet/modals/EnchantingModal.vue:1199 p -> color |
| `#cdeaff` | 1 | src/components/sheet/modals/DataPackUnlockModal.vue:148 button -> color |
| `#cfe0d1` | 1 | src/components/sheet/modals/ForgeModal.vue:669 &.maker-assignment -> border |
| `#d6eaf8` | 1 | src/components/sheet/modals/ForgeModal.vue:680 &.type-specific |
| `#d7bde2` | 1 | src/components/sheet/modals/ProficiencySettingsModal.vue:266 &.expertise -> border |
| `#d7dde3` | 1 | src/components/sheet/modals/ExpertiseSettingsModal.vue:174 .btn-toggle -> border |
| `#d7e1eb` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:458 .switch -> color |
| `#d9c49e` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:387 .visibility-line.subtle span -> color |
| `#dbe8f5` | 1 | src/components/sheet/modals/DataPackUnlockModal.vue:165 .result-list |
| `#dcdde1` | 1 | src/components/sheet/modals/ForgeModal.vue:849 .tag |
| `#e67e22` | 1 | src/components/sheet/modals/ForgeModal.vue:879 .btn-save |
| `#e8edf2` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:231 .data-pack-modal -> color |
| `#e8edf7` | 1 | src/components/sheet/modals/EnchantingModal.vue:1179 .trait-hover-card -> color |
| `#e8f5e9` | 1 | src/components/sheet/modals/ProficiencySettingsModal.vue:262 .tag |
| `#eaf0f6` | 1 | src/components/sheet/modals/DataPackUnlockModal.vue:98 .unlock-modal -> color |
| `#eef4ef` | 1 | src/components/sheet/modals/ForgeModal.vue:666 &.maker-assignment -> background |
| `#f0cfaa` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:398 .visibility-warning -> color |
| `#f0f8ff` | 1 | src/components/sheet/modals/ForgeModal.vue:680 &.type-specific |
| `#f1f2f6` | 1 | src/components/sheet/modals/ForgeModal.vue:659 &.highlight -> background |
| `#f3db82` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:337 &.builtin -> color |
| `#f5d184` | 1 | src/components/sheet/modals/ForgeModal.vue:629 .btn-enchant -> color |
| `#fdfdfd` | 1 | src/components/sheet/modals/ForgeModal.vue:651 .modal-body -> background |
| `#ffb7b7` | 1 | src/components/sheet/modals/EnchantingModal.vue:1284 .btn-delete-trait -> color |
| `#ffc3bc` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:451 .pack-actions .danger -> color |
| `#ffeaa7` | 1 | src/components/sheet/modals/ForgeModal.vue:677 &.type-specific -> border |
| `#fff1c4` | 1 | src/components/sheet/modals/ForgeModal.vue:636 &:hover -> color |
| `#fff8f3` | 1 | src/components/sheet/modals/ForgeModal.vue:676 &.type-specific -> background |
| `rgba(0,0,0,0.16)` | 1 | src/components/sheet/modals/EnchantingModal.vue:818 .enchant-sidebar -> background |
| `rgba(0,0,0,0.18)` | 1 | src/components/sheet/modals/EnchantingModal.vue:1158 .btn-edit-trait -> background |
| `rgba(0,0,0,0.22)` | 1 | src/components/sheet/modals/EnchantingModal.vue:1069 textarea -> background |
| `rgba(0,0,0,0.3)` | 1 | src/components/sheet/modals/ForgeModal.vue:603 .modal-content -> box-shadow |
| `rgba(0,0,0,0.35)` | 1 | src/components/sheet/modals/EnchantingModal.vue:760 .enchant-panel -> box-shadow |
| `rgba(0,0,0,0.36)` | 1 | src/components/sheet/modals/EnchantingModal.vue:1180 .trait-hover-card -> box-shadow |
| `rgba(0,0,0,0.45)` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:234 .data-pack-modal -> box-shadow |
| `rgba(0,0,0,0.48)` | 1 | src/components/sheet/modals/DataPackUnlockModal.vue:102 .unlock-modal -> box-shadow |
| `rgba(0,0,0,0.55)` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:221 .data-pack-backdrop -> background |
| `rgba(0,0,0,0.65)` | 1 | src/components/sheet/modals/ForgeModal.vue:585 .modal-backdrop -> background |
| `rgba(100,124,148,0.45)` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:232 .data-pack-modal -> border |
| `rgba(12,18,28,0.58)` | 1 | src/components/sheet/modals/EnchantingModal.vue:743 .enchant-backdrop -> background |
| `rgba(126,160,196,0.34)` | 1 | src/components/sheet/modals/DataPackUnlockModal.vue:100 .unlock-modal -> border |
| `rgba(129,95,255,0.12)` | 1 | src/components/sheet/modals/EnchantingModal.vue:1103 &.selected -> background |
| `rgba(129,95,255,0.16)` | 1 | src/components/sheet/modals/EnchantingModal.vue:757 .enchant-panel |
| `rgba(130,224,170,0.22)` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:428 .unlock-result-bar -> border |
| `rgba(130,224,170,0.24)` | 1 | src/components/sheet/modals/DataPackUnlockModal.vue:172 .result-card -> border |
| `rgba(14,18,25,0.97)` | 1 | src/components/sheet/modals/EnchantingModal.vue:1178 .trait-hover-card -> background |
| `rgba(142,68,173,0.18)` | 1 | src/components/sheet/modals/ExpertiseSettingsModal.vue:195 &.active -> box-shadow |
| `rgba(180,151,93,0.08)` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:386 .visibility-line.subtle span -> background |
| `rgba(180,151,93,0.22)` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:385 .visibility-line.subtle span -> border-color |
| `rgba(211,84,0,0.1)` | 1 | src/components/sheet/modals/ForgeModal.vue:707 &:focus -> box-shadow |
| `rgba(211,84,0,0.2)` | 1 | src/components/sheet/modals/ForgeModal.vue:878 .btn-save -> background |
| `rgba(211,84,0,0.3)` | 1 | src/components/sheet/modals/ForgeModal.vue:879 .btn-save |
| `rgba(216,195,106,0.13)` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:338 &.builtin -> background |
| `rgba(216,195,106,0.34)` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:324 .pack-card |
| `rgba(220,80,80,0.18)` | 1 | src/components/sheet/modals/EnchantingModal.vue:1283 .btn-delete-trait -> background |
| `rgba(235,152,78,0.08)` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:395 .visibility-warning -> background |
| `rgba(235,152,78,0.26)` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:394 .visibility-warning -> border |
| `rgba(236,112,99,0.08)` | 1 | src/components/sheet/modals/DataPackUnlockModal.vue:181 .result-card.warning -> background |
| `rgba(236,112,99,0.1)` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:421 .unlock-inline button.secondary -> background |
| `rgba(236,112,99,0.11)` | 1 | src/components/sheet/modals/DataPackUnlockModal.vue:155 .clear-btn -> background |
| `rgba(236,112,99,0.13)` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:450 .pack-actions .danger -> background |
| `rgba(236,112,99,0.25)` | 1 | src/components/sheet/modals/DataPackUnlockModal.vue:180 .result-card.warning -> border-color |
| `rgba(236,112,99,0.35)` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:420 .unlock-inline button.secondary -> border-color |
| `rgba(236,112,99,0.4)` | 1 | src/components/sheet/modals/DataPackUnlockModal.vue:154 .clear-btn -> border-color |
| `rgba(236,112,99,0.45)` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:449 .pack-actions .danger -> border-color |
| `rgba(245,197,96,0.25)` | 1 | src/components/sheet/modals/EnchantingModal.vue:1067 textarea -> border |
| `rgba(245,197,96,0.28)` | 1 | src/components/sheet/modals/EnchantingModal.vue:1029 .trait-type-note -> border |
| `rgba(245,197,96,0.36)` | 1 | src/components/sheet/modals/EnchantingModal.vue:1176 .trait-hover-card -> border |
| `rgba(245,197,96,0.55)` | 1 | src/components/sheet/modals/ForgeModal.vue:626 .btn-enchant -> border |
| `rgba(245,197,96,0.64)` | 1 | src/components/sheet/modals/EnchantingModal.vue:908 &.active -> border-color |
| `rgba(245,197,96,0.68)` | 1 | src/components/sheet/modals/EnchantingModal.vue:1191 .trait-hover-card |
| `rgba(245,197,96,0.76)` | 1 | src/components/sheet/modals/EnchantingModal.vue:1102 &.selected -> border-color |
| `rgba(255,255,255,0.065)` | 1 | src/components/sheet/modals/EnchantingModal.vue:1097 .trait-badge -> background |
| `rgba(5,8,12,0.62)` | 1 | src/components/sheet/modals/DataPackUnlockModal.vue:93 .unlock-backdrop -> background |
| `rgba(52,152,219,0.3)` | 1 | src/components/sheet/modals/ProficiencySettingsModal.vue:251 .btn-toggle |
| `rgba(66,185,131,0.14)` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:273 .pack-actions button -> background |
| `rgba(85,162,232,0.14)` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:334 .tag -> background |
| `rgba(93,173,226,0.08)` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:379 .visibility-line span -> background |
| `rgba(93,173,226,0.12)` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:413 .unlock-inline button -> background |
| `rgba(93,173,226,0.16)` | 1 | src/components/sheet/modals/DataPackUnlockModal.vue:147 button -> background |
| `rgba(93,173,226,0.18)` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:378 .visibility-line span -> border |
| `rgba(93,173,226,0.38)` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:412 .unlock-inline button -> border |
| `rgba(93,173,226,0.5)` | 1 | src/components/sheet/modals/DataPackUnlockModal.vue:145 button -> border |
| `rgba(98,180,135,0.4)` | 1 | src/components/sheet/modals/DataPackManagerModal.vue:272 .pack-actions button -> border |

### Right sidebar tools / tooltips

| Color | Uses | Files / Selectors / Properties |
|---|---:|---|
| `#fff` | 7 | src/components/sidebar/LibraryTooltip.vue:401 .card-title -> color<br>src/components/sidebar/LibraryTooltip.vue:449 .stat-row-visual<br>src/components/sidebar/LibraryTooltip.vue:450 .stat-row-visual<br>src/components/sidebar/LibraryTooltip.vue:458 .damage-tag -> color<br>src/components/sidebar/LibraryTooltip.vue:512 .tag<br>src/components/sidebar/LibraryTooltip.vue:528 .combat-badge |
| `#333` | 5 | src/components/sidebar/EnchantDropZone.vue:80 .enchant-drop-zone -> border-top<br>src/components/sidebar/ForgeDropZone.vue:93 .forge-drop-zone -> border-top<br>src/components/sidebar/LibraryTooltip.vue:392 .card-header -> border-bottom<br>src/components/sidebar/LibraryTooltip.vue:438 .combat-stats-section -> border<br>src/components/sidebar/LibraryTooltip.vue:499 .divider -> height |
| `#555` | 5 | src/components/sidebar/LibraryTooltip.vue:428 .card-body<br>src/components/sidebar/LibraryTooltip.vue:511 .tag<br>src/components/sidebar/LibraryTooltip.vue:528 .combat-badge<br>src/components/sidebar/LibraryTooltip.vue:535 .scaling -> margin-top<br>src/components/sidebar/LibraryTooltip.vue:606 .desc.scrollable-desc |
| `#777` | 5 | src/components/sidebar/LibraryTooltip.vue:413 .card-subtitle -> font-size<br>src/components/sidebar/LibraryTooltip.vue:429 .card-body<br>src/components/sidebar/LibraryTooltip.vue:495 .extra-info -> margin-top<br>src/components/sidebar/LibraryTooltip.vue:520 .stat-cell<br>src/components/sidebar/LibraryTooltip.vue:607 .desc.scrollable-desc |
| `#d35400` | 3 | src/components/sidebar/ForgeDropZone.vue:103 &.is-active -> border-top-color<br>src/components/sidebar/ForgeDropZone.vue:104 &.is-active -> color<br>src/components/sidebar/ForgeDropZone.vue:107 &.is-active |
| `#f5c560` | 3 | src/components/sidebar/EnchantDropZone.vue:92 &.is-active -> border-top-color<br>src/components/sidebar/EnchantDropZone.vue:93 &.is-active -> color<br>src/components/sidebar/EnchantDropZone.vue:100 .text strong -> color |
| `rgba(0,0,0,0.2)` | 3 | src/components/sidebar/LibraryTooltip.vue:427 .card-body<br>src/components/sidebar/LibraryTooltip.vue:434 .combat-stats-section -> background<br>src/components/sidebar/LibraryTooltip.vue:605 .desc.scrollable-desc |
| `#34495e` | 2 | src/components/sidebar/LibraryTooltip.vue:474 .prop-capsule -> background-color<br>src/components/sidebar/LibraryTooltip.vue:528 .combat-badge |
| `#444` | 2 | src/components/sidebar/LibraryTooltip.vue:380 .item-tooltip-card -> border<br>src/components/sidebar/LibraryTooltip.vue:532 .combat-badge |
| `#888` | 2 | src/components/sidebar/LibraryTooltip.vue:447 .stat-row-visual<br>src/components/sidebar/LibraryTooltip.vue:536 .scaling |
| `#aaa` | 2 | src/components/sidebar/LibraryTooltip.vue:505 .spell-meta-header -> margin-bottom<br>src/components/sidebar/LibraryTooltip.vue:535 .scaling -> margin-top |
| `#ddd` | 2 | src/components/sidebar/LibraryTooltip.vue:521 .stat-cell<br>src/components/sidebar/LibraryTooltip.vue:543 .capacity-row -> color |
| `#e74c3c` | 2 | src/components/sidebar/LibraryTooltip.vue:486 .warning-box -> border-left<br>src/components/sidebar/LibraryTooltip.vue:487 .warning-box -> color |
| `rgba(0,0,0,0.5)` | 2 | src/components/sidebar/LibraryTooltip.vue:381 .item-tooltip-card -> box-shadow<br>src/components/sidebar/LibraryTooltip.vue:459 .damage-tag -> text-shadow |
| `#171b23` | 1 | src/components/sidebar/EnchantDropZone.vue:81 .enchant-drop-zone -> background |
| `#181818` | 1 | src/components/sidebar/ForgeDropZone.vue:94 .forge-drop-zone -> background |
| `#1e1e1e` | 1 | src/components/sidebar/LibraryTooltip.vue:378 .item-tooltip-card -> background-color |
| `#211f16` | 1 | src/components/sidebar/EnchantDropZone.vue:91 &.is-active -> background |
| `#251e1e` | 1 | src/components/sidebar/ForgeDropZone.vue:102 &.is-active -> background |
| `#252525` | 1 | src/components/sidebar/LibraryTooltip.vue:391 .card-header -> background |
| `#2c3e50` | 1 | src/components/sidebar/LibraryTooltip.vue:511 .tag |
| `#4a6278` | 1 | src/components/sidebar/LibraryTooltip.vue:478 .prop-capsule -> border |
| `#666` | 1 | src/components/sidebar/ForgeDropZone.vue:96 .forge-drop-zone -> color |
| `#6f7890` | 1 | src/components/sidebar/EnchantDropZone.vue:86 .enchant-drop-zone -> color |
| `#aab7b8` | 1 | src/components/sidebar/LibraryTooltip.vue:511 .tag |
| `#b7a2e6` | 1 | src/components/sidebar/LibraryTooltip.vue:586 span -> color |
| `#bdc3c7` | 1 | src/components/sidebar/LibraryTooltip.vue:475 .prop-capsule -> color |
| `#c0392b` | 1 | src/components/sidebar/LibraryTooltip.vue:529 .combat-badge |
| `#c9c1d8` | 1 | src/components/sidebar/LibraryTooltip.vue:570 p -> color |
| `#ccc` | 1 | src/components/sidebar/LibraryTooltip.vue:418 .card-body -> color |
| `#d7c1ff` | 1 | src/components/sidebar/LibraryTooltip.vue:556 .magic-traits-title -> color |
| `#dcc2ff` | 1 | src/components/sidebar/LibraryTooltip.vue:582 strong -> color |
| `#e67e22` | 1 | src/components/sidebar/LibraryTooltip.vue:512 .tag |
| `#f1c40f` | 1 | src/components/sidebar/LibraryTooltip.vue:547 .capacity-row |
| `#ffbc8a` | 1 | src/components/sidebar/LibraryTooltip.vue:592 .trait-damage -> color |
| `gold` | 1 | src/components/sidebar/LibraryTooltip.vue:547 .capacity-row |
| `rgba(0,0,0,0.3)` | 1 | src/components/sidebar/LibraryTooltip.vue:517 .spell-stats-grid -> background |
| `rgba(215,193,255,0.24)` | 1 | src/components/sidebar/LibraryTooltip.vue:563 .magic-trait-card -> border |
| `rgba(215,193,255,0.55)` | 1 | src/components/sidebar/LibraryTooltip.vue:404 .card-header.magic -> border-bottom-color |
| `rgba(231,76,60,0.15)` | 1 | src/components/sidebar/LibraryTooltip.vue:485 .warning-box -> background |
| `rgba(240,231,255,0.08)` | 1 | src/components/sidebar/LibraryTooltip.vue:566 .magic-trait-card -> background |
| `rgba(30,30,30,0.98)` | 1 | src/components/sidebar/LibraryTooltip.vue:379 .item-tooltip-card -> background |

### Shared common components

| Color | Uses | Files / Selectors / Properties |
|---|---:|---|
| `#3498db` | 2 | src/components/common/EditableText.vue:108 .edit-input -> outline<br>src/components/common/EditableTextarea.vue:152 .edit-textarea -> border |
| `#bdc3c7` | 2 | src/components/common/EditableText.vue:97 .editable-container -> border-bottom<br>src/components/common/EditableTextarea.vue:141 .display-text:hover -> border-color |
| `#ddd` | 2 | src/components/common/ItemDescriptionRenderer.vue:67 .desc-table-caption -> color<br>src/components/common/ItemDescriptionRenderer.vue:89 .desc-table th -> color |
| `white` | 2 | src/components/common/EditableText.vue:112 .edit-input -> background<br>src/components/common/EditableTextarea.vue:160 .edit-textarea -> background |
| `#282828` | 1 | src/components/common/ItemDescriptionRenderer.vue:88 .desc-table th -> background |
| `#2c3e50` | 1 | src/components/common/EditableTextarea.vue:135 .display-text -> color |
| `#3a3a3a` | 1 | src/components/common/ItemDescriptionRenderer.vue:81 .desc-table td -> border |
| `#95a5a6` | 1 | src/components/common/EditableTextarea.vue:145 .display-text.empty -> color |
| `#bbb` | 1 | src/components/common/ItemDescriptionRenderer.vue:42 .item-description -> color |
| `#eef2f3` | 1 | src/components/common/EditableText.vue:103 .editable-container:hover -> background-color |
| `#f8f9fa` | 1 | src/components/common/EditableTextarea.vue:140 .display-text:hover -> background-color |
| `transparent` | 1 | src/components/common/EditableTextarea.vue:132 .display-text -> border |

### Spellbook

| Color | Uses | Files / Selectors / Properties |
|---|---:|---|
| `#fff` | 7 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:235 .ability-card -> background<br>src/components/sheet/spellbook/SpellbookLeftPanel.vue:265 .select-ability -> background<br>src/components/sheet/spellbook/SpellbookLeftPanel.vue:295 .btn-step -> border<br>src/components/sheet/spellbook/SpellbookLeftPanel.vue:311 .slot-item -> display<br>src/components/sheet/spellbook/SpellbookPanel.vue:145 .book-toast -> color<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:207 .radio-btn |
| `#7f8c8d` | 6 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:210 .panel-header<br>src/components/sheet/spellbook/SpellbookLeftPanel.vue:277 .stat-box<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:194 .panel-header<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:224 .empty-state<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:232 .section-header<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:277 &:before |
| `#dcd6cb` | 6 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:206 .panel-header -> border-bottom<br>src/components/sheet/spellbook/SpellbookLeftPanel.vue:236 .ability-card -> border<br>src/components/sheet/spellbook/SpellbookLeftPanel.vue:311 .slot-item -> display<br>src/components/sheet/spellbook/SpellbookPanel.vue:118 .layout-left -> border-right<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:191 .panel-header -> border-bottom<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:242 .spell-paper-card -> background |
| `#9b59b6` | 5 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:268 .select-ability<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:207 .radio-btn<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:247 &.is-prepared -> opacity<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:249 &.is-prepared<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:274 &:before -> input |
| `#e0e0e0` | 5 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:229 .section-title -> border-bottom<br>src/components/sheet/spellbook/SpellbookLeftPanel.vue:251 .ability-title -> border-bottom<br>src/components/sheet/spellbook/SpellbookLeftPanel.vue:296 .btn-step<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:206 .radio-btn<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:231 .section-header -> border-bottom |
| `#555` | 4 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:248 .ability-title -> color<br>src/components/sheet/spellbook/SpellbookLeftPanel.vue:289 .warlock-block<br>src/components/sheet/spellbook/SpellbookLeftPanel.vue:295 .btn-step -> border<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:200 .source-toggle |
| `#ccc` | 4 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:263 .select-ability -> border<br>src/components/sheet/spellbook/SpellbookLeftPanel.vue:297 .btn-step<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:202 .radio-group -> display<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:253 .prep-indicator -> position |
| `#fdfbf7` | 4 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:299 .btn-step<br>src/components/sheet/spellbook/SpellbookPanel.vue:110 .book-layout -> background<br>src/components/sheet/spellbook/SpellbookPanel.vue:131 .layout-right -> background<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:242 .spell-paper-card -> background |
| `#2c3e50` | 3 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:228 .section-title -> color<br>src/components/sheet/spellbook/SpellbookLeftPanel.vue:299 .btn-step<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:259 .card-top |
| `#95a5a6` | 3 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:213 .btn-close -> background<br>src/components/sheet/spellbook/SpellbookLeftPanel.vue:308 &.compact<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:285 .card-footer |
| `#e74c3c` | 3 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:214 .btn-close<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:221 .empty-state -> text-align<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:294 .source-badge |
| `#eee` | 3 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:293 .stepper -> display<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:202 .radio-group -> display<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:282 .card-footer -> display |
| `transparent` | 3 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:268 .select-ability<br>src/components/sheet/spellbook/SpellbookPanel.vue:93 .book-frame -> background<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:215 .drag-area -> border |
| `#27ae60` | 2 | src/components/sheet/spellbook/SpellbookPanel.vue:155 .book-toast<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:278 &:before |
| `#4e342e` | 2 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:209 .panel-header<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:193 .panel-header |
| `#8e44ad` | 2 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:278 .stat-box<br>src/components/sheet/spellbook/SpellbookLeftPanel.vue:284 .warlock-block |
| `#e8f8f5` | 2 | src/components/sheet/spellbook/SpellbookPanel.vue:155 .book-toast<br>src/components/sheet/spellbook/SpellbookRightPanel.vue:278 &:before |
| `#f4f1ea` | 2 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:276 .stat-box -> flex<br>src/components/sheet/spellbook/SpellbookPanel.vue:119 .layout-left -> background |
| `rgba(142,68,173,0.2)` | 2 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:283 .warlock-block -> background<br>src/components/sheet/spellbook/SpellbookLeftPanel.vue:284 .warlock-block |
| `#000` | 1 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:296 .btn-step |
| `#1976d2` | 1 | src/components/sheet/spellbook/SpellbookRightPanel.vue:290 .source-badge |
| `#333` | 1 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:267 .select-ability -> color |
| `#34495e` | 1 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:312 .slot-item |
| `#3d3d3d` | 1 | src/components/sheet/spellbook/SpellbookPanel.vue:111 .book-layout -> color |
| `#777` | 1 | src/components/sheet/spellbook/SpellbookRightPanel.vue:204 .radio-btn -> padding |
| `#bbdefb` | 1 | src/components/sheet/spellbook/SpellbookRightPanel.vue:290 .source-badge |
| `#bdc3c7` | 1 | src/components/sheet/spellbook/SpellbookRightPanel.vue:268 .slider-round -> background-color |
| `#c0392b` | 1 | src/components/sheet/spellbook/SpellbookRightPanel.vue:222 .empty-state -> background-color |
| `#c2185b` | 1 | src/components/sheet/spellbook/SpellbookRightPanel.vue:291 .source-badge |
| `#ddd` | 1 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:293 .stepper -> display |
| `#e3f2fd` | 1 | src/components/sheet/spellbook/SpellbookRightPanel.vue:290 .source-badge |
| `#e67e22` | 1 | src/components/sheet/spellbook/SpellbookPanel.vue:156 .book-toast |
| `#e8e4db` | 1 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:276 .stat-box -> flex |
| `#f8bbd0` | 1 | src/components/sheet/spellbook/SpellbookRightPanel.vue:291 .source-badge |
| `#faf9f7` | 1 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:241 .ability-card |
| `#fce4ec` | 1 | src/components/sheet/spellbook/SpellbookRightPanel.vue:291 .source-badge |
| `#fef5e7` | 1 | src/components/sheet/spellbook/SpellbookPanel.vue:156 .book-toast |
| `rgba(0,0,0,0.02)` | 1 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:239 .ability-card -> box-shadow |
| `rgba(0,0,0,0.05)` | 1 | src/components/sheet/spellbook/SpellbookPanel.vue:123 .layout-left -> box-shadow |
| `rgba(0,0,0,0.2)` | 1 | src/components/sheet/spellbook/SpellbookPanel.vue:152 .book-toast -> box-shadow |
| `rgba(0,0,0,0.5)` | 1 | src/components/sheet/spellbook/SpellbookPanel.vue:96 .book-frame -> box-shadow |
| `rgba(0,0,0,0.75)` | 1 | src/components/sheet/spellbook/SpellbookPanel.vue:82 .spellbook-overlay -> background |
| `rgba(142,68,173,0.05)` | 1 | src/components/sheet/spellbook/SpellbookLeftPanel.vue:283 .warlock-block -> background |
| `rgba(155,89,182,0.15)` | 1 | src/components/sheet/spellbook/SpellbookRightPanel.vue:248 &.is-prepared -> box-shadow |
| `rgba(160,64,0,0.9)` | 1 | src/components/sheet/spellbook/SpellbookPanel.vue:156 .book-toast |
| `rgba(231,76,60,0.05)` | 1 | src/components/sheet/spellbook/SpellbookRightPanel.vue:222 .empty-state -> background-color |
| `rgba(44,62,80,0.95)` | 1 | src/components/sheet/spellbook/SpellbookPanel.vue:144 .book-toast -> background |
| `white` | 1 | src/components/sheet/spellbook/SpellbookRightPanel.vue:271 &:before -> background-color |
