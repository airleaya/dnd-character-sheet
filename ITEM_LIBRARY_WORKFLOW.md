# Item Library Intake

本文件记录 DnD 物品库从原始文本到正式运行时数据的工作流。

## Current Goal

截至 2026-04-27，物品库工作已经从“纯录入/临时结构化”进入“正式项目接入”阶段。

当前目标：使用已经审计过的结构化非魔法物品库作为应用的正式运行时物品来源，同时保留原始录入与审计数据，确保每个字段都可以追溯。

当前运行时路径：

- `src/data/libraries/itemLibrary.ts` 将 `STRUCTURED_MUNDANE_ITEM_LIBRARY` 适配为运行时 `LibraryItem`。
- `weapons.ts`、`armors.ts`、`packs.ts` 等旧分散文件只作为兼容导出，从统一运行时库中过滤生成。
- 当运行时代码仍依赖 `src/data/libraries/intake/` 与 `src/data/libraries/structured/` 时，这些目录必须同步到 git。

## Scope Rules

- Unless explicitly stated otherwise, "items" and "item library" discussions exclude magic items by default.
- Magic items are a special category. They may still be recorded in this intake library, but they should not be mixed into ordinary equipment, gear, trade goods, services, treasure, or carryable mundane item discussions.
- 旧的“本地临时库不同步”规则不再适用于 `itemIntake.ts`、`intake/` 和 `structured/`：在运行时 adapter 解耦之前，它们是正式项目数据。
- 真正的本地临时草稿数据应放入 `src/data/libraries/local/`，该目录继续被忽略。

## Intake Location

Raw and partially parsed entries live in:

- `src/data/libraries/itemIntake.ts`
- Category or source-specific intake files under `src/data/libraries/intake/`

The intake files are intentionally separate from the live item library so new text can be captured without breaking the character sheet. `itemIntake.ts` should stay as a small aggregation entry point.

## File Splitting

Split intake data proactively when a file becomes hard to scan or when a batch has a clear category/source boundary.

- Prefer category files first, such as `intake/phbArmors.ts`, `intake/phbWeapons.ts`, `intake/phbAdventuringGear.ts`, or `intake/magicItems.ts`.
- Keep shared intake types in `itemIntake.ts` unless they become large enough to justify `intake/types.ts`.
- Keep each intake file focused on one source/category combination when practical.
- Avoid large all-purpose files. If a file approaches roughly 300-500 lines or mixes unrelated item families, split it.
- The aggregation file should export `ITEM_INTAKE_LIBRARY` by combining smaller arrays.

## Entry Lifecycle

- `raw`: original text has been saved, with minimal metadata.
- `parsed`: key fields have been extracted, but may still need review.
- `normalized`: entry matches one of the app's `LibraryItem` shapes.
- `embedded`: entry has been moved into the final library file, such as `weapons.ts`, `armors.ts`, `gears.ts`, `tools.ts`, `consumables.ts`, `containers.ts`, `packs.ts`, or `treasures.ts`.

## Standard Fields

Every final item should resolve to these shared fields when possible:

- `source`: source book, document, or user-provided label, such as `PHB玩家手册`.
- `id`: stable snake_case identifier.
- `name`: display name, preferably Chinese plus English in parentheses when available.
- `type`: `weapon`, `armor`, `gear`, `tool`, `consumable`, `treasure`, `container`, `pack`, or `misc`.
- `cost`: `{ value, unit }`, where unit is `cp`, `sp`, `ep`, `gp`, or `pp`.
- `weight`: number in pounds.
- `description`: rules text and useful flavor text.
- `rarity`: optional rarity label.

Category-specific fields follow `src/types/Library.ts`.

## How We Will Add New Text

When new item text is provided:

1. Text understanding: identify what the text describes, such as a single item, a table, a rule paragraph, or a mixed source block.
2. Key marking: list the parts that are useful for the database, such as names, item type, price, weight, rarity, rules text, activation, damage, armor class, capacity, charges, and source notes.
3. Data extraction: add the original text and source label to `ITEM_INTAKE_LIBRARY`, then extract obvious fields into `parsed`.
4. Audit: compare the written data against the original text before finishing the turn.
5. Normalize later: after review, move the normalized entry into the correct live library file.

## Audit Requirements

Every intake entry should include an `audit` block before it is considered reliable.

- `sourceMatched`: `true` only when the written fields match the original text as far as can be determined.
- `checkedAt`: ISO date string for when the comparison was performed.
- `summary`: short explanation of what was checked.
- `issues`: empty when no mismatch is found; otherwise list missing, ambiguous, inferred, or conflicting fields.

During audit, compare at least:

- name and aliases
- item type
- price and currency
- weight
- rarity
- rules description
- category-specific fields, such as damage, AC, capacity, charges, range, properties, or activation

If the source text does not provide a field, do not invent it silently. Either omit it, mark it in `notes`, or put the uncertainty in `audit.issues`.

## 正式接入状态

- 运行时非魔法物品数量：`489`。
- 默认范围：仅非魔法物品。
- 魔法物品可以继续保留在 intake 中，但除非后续明确启用，否则不能进入默认运行时物品库。
- 附魔预留接口：`magic?: ItemMagicDefinition`；非魔法物品应解析为 `magic.isMagic === false`。
- 当前 UI 分组来源：`displayCategory` 与 `displaySubcategory`。
- 当前富描述渲染：通过 `ItemDescriptionRenderer` 支持段落、列表、表格。

## Open Intake Queue

- 当前没有新的原始录入队列。
- 当前工程队列记录在 `TODOLIST.md` 的“物品库正式替换与迁移”中。
