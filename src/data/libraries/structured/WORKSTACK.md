# Structured Item Library Work Stack

## 2026-04-28 容器重量展示
- [x] 库存物品栏容器重量从合计值改为 `自重 + 内容重量` 分解显示。
- [x] 内容重量改用运行时负重口径，包含普通内容、悬挂栏内容和嵌套内容。
- [x] `ignoreContentWeight` 容器的内容重量显示为 `0.0`，保持只计自重规则。
- [x] 增加库存行 UI 测试，覆盖普通容器、空容器和忽略内容重量容器。
- [x] 验证命令：
  - `npm run typecheck`
  - `npm run test -- tests\inventoryItemRow.ui.test.ts tests\useInventoryLogic.test.ts`

## 2026-04-28 容器容量展示
- [x] 新增 `formatContainerCapacity`，统一格式化容器重量容量与体积容量。
- [x] 库存物品行显示容器容量，同时保留内容物预览。
- [x] 库存悬浮框改用同一容量格式化工具，避免只显示体积容量。
- [x] 物品库展示卡显示容器容量，并共用同一格式化工具。
- [x] `formatContainerCapacity` 同时支持运行时库物品根字段和库存实例 `data` 字段。
- [x] 对背包等双容量容器增加 adapter 断言，确保 `capacityWeight` 与 `capacityVolume` 同时保留。
- [x] 验证命令：
  - `npm run typecheck`
  - `npm run test -- tests\containerCapacity.test.ts tests\inventoryItemRow.ui.test.ts tests\useInventoryLogic.test.ts tests\itemLibraryAdapter.test.ts`
  - `npm run test -- tests\containerCapacity.test.ts tests\libraryTooltip.ui.test.ts tests\inventoryItemRow.ui.test.ts tests\itemLibraryAdapter.test.ts`

## 2026-04-28 版本收口
- [x] 将项目版本号从 `0.12.0` 提升到 `0.12.1`。
- [x] 将 `0.12.1-进行中` 日志收口为正式 `0.12.1`。
- [x] `TODOLIST.md` 当前基线更新为 `0.12.1`，物品库正式替换与迁移条目标记为已完成。
- [x] 验证命令：
  - `npm run typecheck`
  - `npm run audit:item-library`
  - `npm run test -- tests\useInventoryLogic.test.ts tests\inventoryItemRow.ui.test.ts tests\itemLibraryAdapter.test.ts tests\itemLibraryAudit.test.ts`
  - `npm run build`

## 2026-04-28 全物品堆叠规则
- [x] `useInventoryLogic.addOrMerge` 从白名单堆叠改为同位置同模板默认合并数量。
- [x] 含有内容物的容器不作为堆叠合并目标；空容器仍可合并数量。
- [x] `InventoryItemRow` 将数量按钮扩展到所有普通物品和空容器；含内容容器继续按内容透视/穿透规则处理。
- [x] 增加库存逻辑测试，覆盖非消耗品合并、空容器合并与含物容器分离。
- [x] 增加库存行 UI 测试，覆盖普通物品数量按钮与空容器自身数量按钮。
- [x] 验证命令：
  - `npm run typecheck`
  - `npm run test -- tests\useInventoryLogic.test.ts tests\inventoryItemRow.ui.test.ts`

## 2026-04-28 贸易品重量口径
- [x] 在 `phbCommerceTrinkets.ts` 结构化适配中将所有 `trade_good` 条目的重量统一为 1 磅。
- [x] 保持服务、食宿、生活开销、施法服务和小饰品的原有重量口径不变。
- [x] 在 `tests/itemLibraryAdapter.test.ts` 中新增贸易品重量断言，当前 23 个贸易品必须全部为 1 磅。
- [x] 验证命令：
  - `npm run typecheck`
  - `npm run test -- tests\itemLibraryAdapter.test.ts tests\itemLibraryAudit.test.ts`
  - `npm run audit:item-library`

## 2026-04-28 容器内容透视与穿透数量控制
- [x] 将容器行内容预览从箭袋/特殊容器扩展到所有容器。
- [x] 容器行预览改为完整内容清单，行宽不足时由 CSS 省略号截断，不再生成“另 N 项”文本。
- [x] 库存悬浮框新增容器内容预览，完整展示普通内容区与悬挂栏内容。
- [x] 数量穿透调控改为通用容器规则，且仅在普通内容区与悬挂栏合计只有 1 个内容物时启用。
- [x] 增加 `tests/inventoryItemRow.ui.test.ts`，覆盖完整预览、单内容穿透、多内容禁用穿透。
- [x] 验证命令：
  - `npm run typecheck`
  - `npm run test -- tests\inventoryItemRow.ui.test.ts tests\useInventoryLogic.test.ts`

## 2026-04-28 复数子个体物品审定

- [x] 在结构化类型中预留 `multiplicity`，用于记录来源数量、单位、审定模式、来源文本和审定备注。
- [x] 在结构化类型中预留 `acquisitionRule`，用于记录未来获取规则的可见文本和生成清单。
- [x] 在运行时 `ItemDefinition` 中暴露相同静态字段，并由 `itemLibrary.ts` adapter 透传。
- [x] `itemFactory` 暂不把 `multiplicity` / `acquisitionRule` 复制进库存实例 `data`，避免提前引入运行时状态。
- [x] 生成 `pluralItemReview.md`，覆盖强审定候选、连续长度候选、容量/使用次数候选、套组候选和套组补充条目候选。
- [x] 增加 `tests/pluralItemReview.test.ts`，确认审定表存在、四个选项完整、关键候选被记录。
- [x] 验证命令：
  - `npm run typecheck`
  - `npm run test -- tests\pluralItemReview.test.ts tests\itemLibraryAudit.test.ts tests\itemLibraryAdapter.test.ts`
- [x] 用户审定已结束，可明确执行项已迁移到正式结构化数据。
- [x] 拆分单体数据：`arrows`、`crossbow_bolts`、`blowgun_needles`、`sling_bullets`、`iron_spikes_10`。
- [x] 不拆数据但建立获取规则：`ball_bearings`、`caltrops`。
- [x] 建立通用 `acquisitionRule` 执行器，替换箭/弩矢硬编码获取逻辑。
- [x] 运行时描述追加“在本软件中获取该物品时：...”。
- [x] 生成迁移报告：`src/data/libraries/structured/pluralItemMigrationReport.md`。
- [x] 按用户复核意见修正拆分物品口径：物品库保留组重量/组价格，行囊实例使用单体重量。
- [x] `itemFactory` 负责把拆分物品的库重量换算成库存单体重量。
- [x] 套组重量计算和深度审计同步使用拆分物品的库存单体重量口径。
- [x] 迁移验证命令：
  - `npm run typecheck`
  - `npm run test -- tests\itemLibraryAdapter.test.ts tests\useInventoryLogic.test.ts tests\pluralItemReview.test.ts tests\itemLibraryAudit.test.ts`
  - `npm run audit:item-library`
- [x] 口径修正验证命令：
  - `npm run typecheck`
  - `npm run test -- tests\itemLibraryAdapter.test.ts tests\useInventoryLogic.test.ts tests\itemLibraryAudit.test.ts`
  - `npm run audit:item-library`

## 2026-04-28 物品查看悬浮框边缘保护

- [x] 物品库/法术库悬浮框在组件内部测量真实宽高。
- [x] 物品库/法术库悬浮框复用 `getTooltipViewportPosition` 进行视口边缘保护。
- [x] 库存物品悬浮框同步接入同一套视口边缘保护。
- [x] 保持原有悬浮框续命交互、描述块和表格渲染路径不变。
- [x] 验证命令：
  - `npm run typecheck`
  - `npm run test -- tests/globalTooltip.ui.test.ts tests/useInventoryLogic.test.ts tests/itemLibraryAdapter.test.ts`

## 2026-04-27 描述溯源增强

- [x] 运行时物品描述统一加入来源前缀：`这是来自xx的xx物品。`
- [x] 运行时描述保留结构化源条目的具体描述或规则文本。
- [x] 套组补全条目不再只保留“来自xx套组的xx物品”占位文本，改为说明其来自套组清单、原文未提供独立规则描述，以及当前补全数据依据。
- [x] `descriptionBlocks` 改为先输出来源与细节段落，再追加套组内容、工具 DC、财宝信息、龙晶材料信息等表格。
- [x] 深度审计新增描述来源前缀与原文细节迁移检查。
- [x] 验证命令：
  - `npm run typecheck`
  - `npm run test -- tests/itemLibraryAdapter.test.ts tests/itemLibraryAudit.test.ts`
  - `npm run test -- tests/useInventoryLogic.test.ts tests/itemLibraryAdapter.test.ts tests/itemLibraryAudit.test.ts`
  - `npm run audit:item-library`

## 2026-04-27 UI 与库存规则迭代记录

- [x] 物品库菜单改为一级菜单与当前二级菜单双层吸附。
- [x] 武器条目展示属性徽章，并加入 `简近 / 简远 / 军近 / 军远` 筛选。
- [x] 护甲二级菜单加入 `轻甲 / 中甲 / 重甲` 筛选。
- [x] 背包实例加入唯一 `悬挂栏`，用于表示背包外附加空间。
- [x] 套组物品放入套组提供的容器，并将该容器重命名为 `容器名（套组名）`。
- [x] 套组重量由内容自引用计算，并在物品库条目中标注。
- [x] 箭袋恢复穿透规则：只计自重，单一弹药内容时在箭袋行暴露数量控制。
- [x] 记录纪律：后续所有物品库与库存规则改动必须同步更新清单和工作记录。

## 2026-04-27 正式接入审计闭环

- [x] 建立逐项迁移审计报告：`src/data/libraries/itemMigrationAuditReport.ts`。
- [x] 建立深度审计报告与断言入口：`src/data/libraries/itemLibraryDeepAudit.ts`。
- [x] 建立固定审计命令：`npm run audit:item-library`。
- [x] 修正二级目录中文显示标签，避免暴露 `lifestyle_expense`、`food_drink_lodging`、`service`、`spellcasting_service`、`trade_good`、`trinket` 等内部 id。
- [x] 扩展旧物品 id 迁移表，覆盖旧套组、旧工具、旧弹药、旧容器与旧消耗品常见路径。
- [x] 验证旧库存迁移：可映射条目迁移到新 id，无法映射的自定义物品保留并附带 `migrationAudit`。
- [x] 验证命令：
  - `npm run typecheck`
  - `npm run audit:item-library`
  - `npm run test -- tests/itemLibraryAdapter.test.ts tests/itemMagicDefinition.test.ts tests/characterMigration.test.ts tests/useInventoryLogic.test.ts tests/itemLibraryAudit.test.ts tests/itemLibraryMigration.test.ts`

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
