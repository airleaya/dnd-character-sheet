# Structured Item Library Work Stack

This is a local temporary work stack for structuring the intake item library.

## Scope

- Default scope excludes magic items.
- Output stays under `src/data/libraries/structured/`.
- Do not move these records into the formal app database until a later explicit step.

## Per-Item Workflow

1. Pick one intake item.
2. Copy only the stable fields needed by the base item model.
3. Add category-specific fields when the item clearly supports them.
4. Compare every structured field with the intake record.
5. Record the comparison in `audit.comparedFields`.
6. Set `audit.sourceMatched` to `false` if any field drifts.

## Review Gate

No structured batch is considered complete until all of these checks pass:

- Every structured item has one matching intake source id.
- Every structured item has a field-level audit.
- Every non-derived field is compared with the intake record.
- Derived fields must be explicitly explained in `audit.issues` or `notes` when they are not literal source text.
- `audit.sourceMatched` must be `false` if any compared field differs.
- Prices, weights, quantities, dice expressions, DCs, ranges, capacities, and durations must be checked as exact values.
- Category and subcategory must be checked against the agreed non-magic item scope.
- Magic items remain excluded from this default structuring pass unless explicitly requested later.
- Ambiguous services, expenses, rules, or story devices must not be forced into carryable item categories.

## Error-Killing Checklist

Use this checklist for every item, not just every file:

- Name: Chinese name and English name are preserved or consciously normalized.
- Source: source book label remains correct.
- Category: item is not accidentally classified as magic or mundane incorrectly.
- Cost: value and currency match the intake text.
- Weight: value is in pounds where provided.
- Quantity: bundles, packs, ammunition counts, trade-good units, and container contents are preserved.
- Mechanics: damage, AC, properties, capacity, speed, skill links, DCs, and special rules match the source.
- Description: no rules text is lost when shortening flavor text.
- Audit: all important fields appear in `comparedFields`.
- Issues: source typos, uncertain translations, or inferred fields are recorded before the item is accepted.

## Current Stack

- [x] Define base structured item model.
- [x] Define per-item audit model.
- [x] Structure PHB armor and shield items.
- [x] Structure PHB weapons.
  - [x] Simple melee weapons.
  - [x] Simple ranged weapons.
  - [x] Martial melee weapons.
  - [x] Martial ranged weapons.
  - [x] Weapon properties and ammunition links.
- [x] Structure PHB adventuring gear.
  - [x] Standard gear.
  - [x] Containers and capacities.
  - [x] Consumables and ammunition.
  - [x] Packs and pack contents.
  - [x] Gear with special rules.
- [x] Structure PHB tools.
  - [x] Artisan's tools.
  - [x] Gaming sets.
  - [x] Musical instruments.
  - [x] General tools and kits.
  - [x] Vehicle proficiencies reserved for the mounts and vehicles batch.
- [x] Structure XGE tool descriptions.
  - [x] Components.
  - [x] Skill interactions.
  - [x] Special uses.
  - [x] Sample DCs.
  - [x] Link records back to matching PHB tool ids.
- [x] Structure PHB mounts and vehicles.
  - [x] Mounts.
  - [x] Tack, harness, and drawn vehicles.
  - [x] Waterborne vehicles.
  - [x] Speed and carrying-capacity fields where present.
- [x] Structure PHB commerce and references.
  - [x] Trade goods.
  - [x] Food and lodging references.
  - [x] Services and hirelings.
  - [x] Spellcasting services.
  - [x] Lifestyle expenses.
  - [x] Trinkets.
- [x] Structure DMG gemstones.
  - [x] Gem value tiers.
  - [x] Individual gemstone entries.
  - [x] Duplicate-value consistency checks.
- [x] Structure DMG art objects.
  - [x] Art value tiers.
  - [x] Individual art object entries.
  - [x] Incomplete table audit notes.
- [x] Structure ERLW dragonshards and other non-magic treasure materials.
  - [x] Eberron dragonshards.
  - [x] Khyber dragonshards.
  - [x] Siberys dragonshards.
  - [x] Material use cases and non-magic classification.

## 正式运行时接入工作栈

- [x] 将结构化非魔法物品库提升为运行时 adapter 入口。
  - 运行时入口：`src/data/libraries/itemLibrary.ts`。
  - 当前运行时数量：`489`。
  - 审计门槛：`sourceMismatched === 0`、`duplicateIds === 0`、`magicItems === 0`。
- [x] 保留附魔字段定义，但不启用规则行为。
  - 静态定义：`magic?: ItemMagicDefinition`。
  - 非魔法默认值：`magic.isMagic === false`。
- [x] 用兼容导出替代旧分散库的数据所有权。
  - `weapons.ts`、`armors.ts`、`gears.ts`、`containers.ts`、`tools.ts`、`consumables.ts`、`treasures.ts`、`packs.ts` 均从 `ITEM_LIBRARY` 派生。
- [x] 增加运行时分组元数据。
  - 物品库 UI 现在按 `displayCategory` 与 `displaySubcategory` 分组。
- [x] 增加结构化描述渲染能力。
  - 支持段落、列表、表格描述块。
  - 套组内容、XGE 工具 DC 示例、财宝表信息、龙晶材料信息可以渲染为表格。
- [x] 增加初始旧 id 迁移。
  - 当前显式映射：`bolts -> crossbow_bolts`。
  - 未知自定义模板会保留，并写入迁移审计数据。
- [ ] 本地化剩余展示子分类。
  - 已知示例：`lifestyle_expense`、`food_drink_lodging`、`service`、`spellcasting_service`、`trade_good`、`trinket`。
- [ ] 生成最终迁移报告。
  - 必需字段：源录入 id、结构化 id、运行时 id、字段映射、审计结果、备注。
- [ ] 完成验证。
  - `npm run typecheck` 已于 2026-04-27 通过。
  - Vitest 在当前沙箱中被 esbuild 子进程 `EPERM` 阻塞；需要在可运行测试子进程的环境中补跑。
  - 仍需手动检查物品库分组、拖放、套组展开、弹药堆叠、表格 tooltip 渲染。

## Batch Order

1. PHB weapons.
2. PHB adventuring gear, containers, consumables, and packs.
3. PHB tools.
4. XGE tool descriptions linked to PHB tools.
5. PHB mounts and vehicles.
6. PHB commerce, services, expenses, and trinkets.
7. DMG gemstones.
8. DMG art objects.
9. ERLW dragonshards and non-magic treasure materials.

## Completion Rule

A batch can only move from pending to complete when:

- Typecheck passes.
- Item count matches the source intake count for that batch.
- No structured item has `audit.sourceMatched: false` unless the mismatch is an intentional, documented source issue.
- A short batch summary records count, scope, skipped records, and audit issues.
