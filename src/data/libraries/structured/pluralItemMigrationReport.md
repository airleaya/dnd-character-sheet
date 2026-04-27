# 复数子个体物品迁移报告

状态：已按 `pluralItemReview.md` 的用户审定结果完成第一批可执行迁移。

迁移日期：2026-04-28

## 执行原则

- 审定为“数据拆分”的物品，正式库仍保存来源表的一组重量与一组价格；库存实例创建时再换算为单体重量。
- 审定为“不拆数据但额外生成规则”的物品，正式库保留原重量与原价格，只增加获取规则。
- 容量、使用次数、页数和容器容量候选不作为复数子个体迁移。
- 套组仍走 `pack.contents` 展开流程，不混入单物品 `acquisitionRule`。
- 所有带特殊获取规则的物品，运行时描述都会追加“在本软件中获取该物品时：...”。
- 行囊负重口径：`InventoryItem.weight = LibraryItem.weight / multiplicity.sourceQuantity`，再乘以库存 `quantity`。

## 已迁移条目

| id | 名称 | 审定结果 | 来源数量 | 物品库重量/价格 | 行囊单体重量 | 获取规则 |
| --- | --- | --- | --- | --- | --- | --- |
| arrows | 箭 | 数据拆分且额外生成规则 | 20支 | 1磅 / 1 gp | 0.05磅 | 20支一组，附赠一个新的箭袋，箭支放入箭袋内。 |
| crossbow_bolts | 弩矢 | 数据拆分且额外生成规则 | 20支 | 1.5磅 / 1 gp | 0.075磅 | 20支一组，附赠一个弩矢匣，弩矢放入弩矢匣中。 |
| blowgun_needles | 吹矢 | 数据拆分且额外生成规则 | 50支 | 1磅 / 1 gp | 0.02磅 | 50支一组，赠送一个小包，吹矢装入小包中。 |
| sling_bullets | 投石索弹丸 | 数据拆分且额外生成规则 | 20发 | 1.5磅 / 4 cp | 0.075磅 | 20发一组，赠送一个小包，弹丸装入小包中。 |
| ball_bearings | 滚珠 | 不拆数据，额外生成规则 | 1000粒/袋 | 2磅 / 1 gp | 2磅 | 赠送一个小包，一组滚珠作为一件物品放入小包中。 |
| caltrops | 铁蒺藜 | 不拆数据，额外生成规则 | 20枚/包 | 2磅 / 1 gp | 2磅 | 赠送一个小包，一组铁蒺藜作为一件物品放入小包中。 |
| iron_spikes_10 | 长铁钉 | 数据拆分但成组生成 | 10支 | 5磅 / 1 gp | 0.5磅 | 一次生成10支长铁钉。 |

## 已记录但不改变获取逻辑的条目

| id | 名称 | 处理 |
| --- | --- | --- |
| rations | 口粮 | 记录为一天份复数组合，数据不拆分。 |
| hempen_rope_50ft | 麻绳 | 记录为50尺连续长度规格，数据不拆分。 |
| silk_rope_50ft | 丝绳 | 记录为50尺连续长度规格，数据不拆分。 |
| chain_10ft | 链条 | 记录为10尺连续长度规格，数据不拆分。 |
| ladder_10ft | 爬梯 | 记录为10尺尺寸规格，数据不拆分。 |
| pole_10ft | 长杆 | 记录为10尺尺寸规格，数据不拆分。 |
| string_10ft | 弦线 | 记录为10尺连续长度补充条目，描述已保留“10尺”信息。 |

## 审定为非复数物品的候选

以下条目的复数数字来自容量、使用次数、页数或影响上限，不作为复数子个体处理：

- `quiver`
- `crossbow_bolt_case`
- `pouch`
- `map_scroll_case`
- `healers_kit`
- `spellbook`
- `basic_poison_vial`
- `incense`

## 验证

- `npm run typecheck` 通过。
- `npm run test -- tests\itemLibraryAdapter.test.ts tests\useInventoryLogic.test.ts tests\pluralItemReview.test.ts tests\itemLibraryAudit.test.ts` 通过，4 个测试文件，19 个用例。
- `npm run audit:item-library` 通过，2 个测试文件，5 个用例。
