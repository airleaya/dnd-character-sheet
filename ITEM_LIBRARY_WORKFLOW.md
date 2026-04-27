# Item Library Intake

## 2026-04-28 物品库展示卡容量展示规则
- 容器容量不仅要在库存物品行和库存悬浮框中可见，也必须在物品库展示卡中可见。
- `formatContainerCapacity` 必须同时支持两种数据形态：运行时库物品根字段 `capacityWeight/capacityVolume`，以及库存实例 `data.capacityWeight/data.capacityVolume`。
- 展示卡不得压缩或改写来源中的复合容量描述，例如粗腰桶的“40加仑液体，4立方尺固体”必须完整显示。
- 修改物品库展示卡或容量字段后，必须覆盖 `LibraryTooltip` UI 测试、容量格式化工具测试，并按影响范围回归 adapter 或库存 UI 测试。

## 2026-04-28 容器重量展示规则
- 库存物品栏中的容器重量必须分解显示为“自重 + 内容重量”，不能只显示合计数字。
- 内容重量应使用运行时负重口径，包含普通内容、悬挂栏内容和嵌套内容。
- 标记 `ignoreContentWeight` 的容器仍只计算自重，因此内容重量展示为 `0.0`。
- 修改容器重量展示后，必须覆盖普通容器、空容器和忽略内容重量容器的 UI 测试。

## 2026-04-28 容器容量展示规则
- 容器容量属于物品栏一线信息，库存行与库存悬浮框都应可见。
- 如果来源文本同时提供重量容量和体积容量，运行时数据必须同时保留 `capacityWeight` 与 `capacityVolume`，UI 也必须同时展示。
- 容量展示统一通过 `formatContainerCapacity` 输出，避免库存行和悬浮框出现不同口径。
- 修改容器容量数据或展示后，必须覆盖格式化工具、库存行 UI 和 adapter 中的双容量保留测试。

## 2026-04-28 全物品堆叠规则
- 库存获取逻辑默认按“同位置、同模板、同容器槽位”合并数量，不再只对白名单消耗品、弹药或投掷物生效。
- 容器是唯一例外：已有内容物的容器不能作为堆叠合并目标，避免把带内容的容器数量化后丢失内容归属语义。
- 空容器可以堆叠；一旦容器有普通内容或悬挂内容，UI 上优先按容器内容透视规则处理，单一内容物时穿透调控该内容物，多内容物时禁用数量按钮。
- 修改堆叠逻辑后，必须同时验证 `useInventoryLogic` 与 `InventoryItemRow`，防止库存数据合并和行内数量按钮出现口径偏移。

## 2026-04-28 贸易品重量口径
- `trade_good` 分类下的贸易品在正式运行时物品库中统一按 1 磅记录重量。
- 该规则是项目内负重口径，用于保证贸易品可以稳定加入行囊并参与负重计算；不要把来源表中的“1磅 / 1只 / 1头 / 1平方码”等交易单位直接解释为运行时重量。
- 服务、食宿、生活开销、施法服务和小饰品不套用该规则。
- 新增或修改贸易品时，必须确认 adapter 测试中“所有贸易品都是 1 磅”的断言仍然通过。

## 2026-04-28 容器内容透视与穿透调控规则
- 库存 UI 中的所有容器都应提供内容物预览，不再只服务箭袋或忽略内容重量的容器。
- 容器行的预览文本必须基于完整内容清单生成；如果行内空间不足，交由 CSS `text-overflow: ellipsis` 省略显示，不在数据层写“另 N 项”。
- 容器悬浮框可以完整展示内容物清单，普通内容区与悬挂栏内容都要可见。
- 穿透数量调控只在容器内合计只有 1 个内容物时启用；普通内容区和悬挂栏都参与唯一性判断，避免多内容物容器的加减按钮目标不明确。
- 修改容器透视或穿透逻辑后，至少运行 `npm run typecheck` 与库存行 UI / 库存逻辑相关测试。

## 2026-04-28 复数子个体审定规则

- 复数子个体物品先进入 `src/data/libraries/structured/pluralItemReview.md` 审定，不直接修改正式数据。
- 审定选项固定为：复数组合、数据拆分、数据拆分但成组生成、数据拆分且额外生成规则。
- `multiplicity` 只记录来源数量、单位、审定模式和来源文本；`acquisitionRule` 只记录获取时的可见说明和未来生成规则。
- 在用户完成审定前，不拆分正式重量/价格，不迁移特殊获取逻辑，不追加“在本软件中获取该物品时”描述。
- 用户审定完成后，必须生成或更新迁移报告，当前报告为 `src/data/libraries/structured/pluralItemMigrationReport.md`。
- 特殊获取逻辑统一走 `acquisitionRule`，不得再为单个物品在 `addItem` 中新增硬编码分支。
- 拆分物品采用双口径：物品库保留来源表的一组价格和一组重量；行囊实例由 `itemFactory` 按 `weight / sourceQuantity` 写入单体重量。
- 后续执行数据迁移时，必须逐项记录旧重量/价格、来源数量、新单体重量/价格、获取规则文本和审计结果。
- 修改复数规则后必须运行 `npm run typecheck`、`npm run audit:item-library`，并按影响范围运行库存和 adapter 测试。

## 2026-04-28 物品查看悬浮框规则

- 物品库、法术库与库存中的固定定位悬浮框必须进行视口边缘保护。
- 新增或修改悬浮框时优先复用 `src/stores/tooltip.ts` 中的 `getTooltipViewportPosition`。
- 悬浮框组件应在渲染后测量真实宽高，再根据窗口尺寸修正 `top/left`，以覆盖长描述、表格和窗口缩放场景。
- 修改悬浮框后至少运行 `npm run typecheck`，并按影响范围运行 tooltip、物品库或库存相关测试。

## 2026-04-27 描述溯源规则

- 运行时物品描述必须包含来源前缀，格式为：`这是来自xx的xx物品。`
- 来源前缀后必须保留结构化源条目的具体描述或规则文本；如果原文只在套组清单中列名而没有独立描述，必须明确写出“原文未提供独立规则描述”，不能伪造细节。
- `descriptionBlocks` 的首段应与运行时 `description` 保持同一来源说明和细节内容，后续再追加列表或表格。
- 深度审计必须检查：
  - 每个运行时物品描述是否含有来源前缀。
  - 每个运行时物品描述是否包含结构化源条目的描述或规则文本。
  - 带表格的描述仍需以真实表格块保留。
- 修改物品描述后必须运行 `npm run typecheck` 与 `npm run audit:item-library`，并按风险补充对应单元测试。

## 2026-04-27 记录纪律

- 所有物品库相关改动必须同步记录到工程文档中，不能只改代码。
- 需要记录的范围包括：结构化数据、运行时 adapter、库存迁移、物品库 UI、套组展开、容器槽位、负重计算、审计脚本、测试覆盖。
- 本轮已同步记录的改动：双层菜单吸附、武器属性徽章、武器/护甲二级筛选、背包悬挂栏、套组容器重命名、套组总重标注、箭袋穿透规则。
- 后续若新增或修正物品规则，至少检查并更新 `UPDATE_LOG.md`、`TODOLIST.md`、`ITEM_LIBRARY_WORKFLOW.md`，必要时同步更新 `src/data/libraries/structured/WORKSTACK.md`。

## 2026-04-27 审计闭环状态

- 正式运行时物品库仍为 `489` 条非魔法物品。
- 新增 `itemMigrationAuditReport.ts`，用于逐项追踪“源录入 id -> 结构化 id -> 运行时 id”。
- 新增 `itemLibraryDeepAudit.ts`，用于检查重复 id、源文本匹配、非魔法默认值、套组引用闭合、表格描述和价格规则。
- 新增 `npm run audit:item-library`，作为物品库数据审计的固定入口。
- 旧库存迁移现在覆盖旧套组、旧工具、旧弹药、旧容器和旧消耗品的常见 id；无法映射的自定义物品仍保留并写入迁移审计标记。
- 二级目录显示标签已中文化，服务、贸易品、小饰品等不再展示英文内部 id。

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
