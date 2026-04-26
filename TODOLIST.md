# TODOLIST

> 2026-04-19 status note:
> `0.12.0` attack panel core redesign has been implemented and passed targeted verification.
> This todo list should now treat that work as closed and focus on remaining `0.12.x` follow-up items rather than the already-landed panel baseline.

> 用途：记录**尚未完成**的事项、优先级、负责人、目标版本、关联文件与下一步计划。  
> 不记录详细实施过程；实施完成后，请将结果迁移到 `UPDATE_LOG.md`。

当前基线版本：`0.12.0`  
默认负责人：**雪荔枝**

> 已按 `0.11.7` 稳定版完成状态核查本清单。项目当前已进入 `0.12.0` 功能开发阶段；已在代码健全专项中解决并写入 `UPDATE_LOG.md` 的事项，不再继续保留在当前待办中。

## 版本规划建议

- `0.12.0`：以**攻击面板改造 + 关键体验修复**为主
- `0.12.x`：以**数据补全 / 规则增强 / 中等功能增强**为主
- `0.13.x`：以**较大交互增强 / 系统性功能**为主
- `Backlog`：需求不清晰、依赖规则确认或暂不排期

---

## P0 / 紧急修复

### 1. 攻击面板改造：默认空面板 + 手动添加攻击项
- [ ] 状态：进行中
- 负责人：雪荔枝
- 目标版本：`0.12.0`
- 类型：Bug / 交互改造 / 规则计算
- 描述：攻击面板默认不展示攻击项，改为通过“添加攻击项”入口，由用户从候选攻击列表中手动选择展示项；候选列表需覆盖完整攻击项并对重复项去重。
- 初步关联文件：
- 宸ヤ綔鏂囦欢锛?`ATTACK_PANEL_PLAN.md`
  - `src/stores/sheet/useCombatLogic.ts`
  - `src/stores/sheet/useInventoryLogic.ts`
  - `src/components/sheet/combat/ActionsPanel.vue`
  - `src/stores/activeSheet.ts`
  - `src/types/Item.ts`
  - `src/types/Character.ts`
- 验收标准：
  - 攻击面板默认不展示任何攻击项，但可通过明确入口手动添加
  - 浮窗面板中的候选攻击项完整且无重复
  - 用户选择后的攻击项可持久化保存，并在重载后保持
  - 投掷武器、双持、副手与额外属性模式逻辑不回归

---

## P1 / 近期版本

### 2. 物品 / 法术的翻译版本问题
- [ ] 状态：未开始
- 负责人：雪荔枝
- 目标版本：`0.12.x`
- 类型：数据一致性 / 文案规范
- 描述：统一物品与法术的翻译来源、命名风格与展示口径。
- 初步关联文件：
  - `src/data/libraries/*.ts`
  - `src/data/spells/*.ts`
  - `src/types/Library.ts`
  - `src/types/Spell.ts`
- 验收标准：
  - 同类术语翻译前后一致
  - UI 展示不出现同一条目多种译名
  - 必要时保留原文别名供搜索匹配

### 3. 法术信息加入法术来源和支持的职业
- [ ] 状态：未开始
- 负责人：雪荔枝
- 目标版本：`0.12.x`
- 类型：功能增强 / 数据结构扩展
- 描述：法术详情增加来源书籍与可用职业信息。
- 初步关联文件：
  - `src/types/Spell.ts`
  - `src/data/spells/*.ts`
  - `src/data/spells/index.ts`
  - `src/components/sheet/library/LibrarySpellsPanel.vue`
  - `src/components/sidebar/LibraryTooltip.vue`
- 验收标准：
  - 法术数据结构可记录来源与职业
  - 列表和提示层可展示相关信息
  - 不影响现有已知 / 预备法术逻辑

### 4. 添加法术仪式标识
- [ ] 状态：未开始
- 负责人：雪荔枝
- 目标版本：`0.12.x`
- 类型：规则展示增强
- 描述：在法术列表和法术详情中增加 Ritual 标识。
- 初步关联文件：
  - `src/types/Spell.ts`
  - `src/data/spells/*.ts`
  - `src/components/sheet/spellbook/*.vue`
  - `src/components/sidebar/LibraryTooltip.vue`
- 验收标准：
  - 可在法术数据中标记 `ritual`
  - 列表与详情都能正确展示
  - 搜索 / 过滤逻辑不受影响

### 5. 动态负重数值上色渲染
- [ ] 状态：未开始
- 负责人：雪荔枝
- 目标版本：`0.12.x`
- 类型：UI / 可视化增强
- 描述：根据负重接近或超过上限的程度，为数值提供颜色反馈。
- 初步关联文件：
  - `src/stores/sheet/useInventoryLogic.ts`
  - `src/components/sheet/inventory/InventoryPanel.vue`
  - `src/components/sheet/inventory/EquipmentSlots.vue`
- 验收标准：
  - 低负重 / 临界 / 超载有明显视觉区别
  - 颜色规则统一且可读
  - 不影响现有重量计算

### 6. 缺失马鞍、马具、书本
- [ ] 状态：未开始
- 负责人：雪荔枝
- 目标版本：`0.12.x`
- 类型：数据补全
- 描述：补充常用基础物品条目。
- 初步关联文件：
  - `src/data/libraries/gears.ts`
  - `src/data/basicItems.ts`
  - `src/utils/itemFactory.ts`
- 验收标准：
  - 物品库中可检索这些条目
  - 拖入背包后属性正常
  - 成本、重量、描述字段完整

### 7. 无普通衣服
- [ ] 状态：未开始
- 负责人：雪荔枝
- 目标版本：`0.12.x`
- 类型：数据补全
- 描述：补充“普通衣服”等基础日用品条目。
- 初步关联文件：
  - `src/data/libraries/gears.ts`
  - `src/data/basicItems.ts`
- 验收标准：
  - 可在物品库搜索到普通衣服
  - 数据字段完整、可正常加入背包

### 8. 万事通 / 专精
- [ ] 状态：未开始
- 负责人：雪荔枝
- 目标版本：`0.12.x`
- 类型：规则增强
- 描述：支持技能检定中的“半熟练（万事通）”与“专精”。
- 初步关联文件：
  - `src/stores/sheet/useBioLogic.ts`
  - `src/data/rules/dndRules.ts`
  - `src/components/sheet/bio/StatsAndSkills.vue`
  - `src/types/Character.ts`
- 验收标准：
  - 技能可区分未熟练 / 半熟练 / 熟练 / 专精
  - 计算结果正确
  - 旧存档有兼容逻辑

---

## P2 / 中期增强

### 9. 自定义物品模板
- [ ] 状态：未开始
- 负责人：雪荔枝
- 目标版本：`0.13.x`
- 类型：功能增强
- 描述：为 DIY / Forge 系统提供预设模板，降低用户创建成本。
- 初步关联文件：
  - `src/composables/useForge.ts`
  - `src/components/sheet/modals/ForgeModal.vue`
  - `src/components/sidebar/ForgeDropZone.vue`
  - `src/types/Item.ts`
- 验收标准：
  - 用户可从模板快速生成自定义物品
  - 模板类型至少覆盖武器 / 护甲 / 杂项中的核心类别
  - 模板字段可编辑并最终保存为正常物品

### 10. 角色特性词条化
- [ ] 状态：未开始
- 负责人：雪荔枝
- 目标版本：`0.13.x`
- 类型：结构化数据增强
- 描述：将角色特性从纯文本演进为可管理词条。
- 初步关联文件：
  - `src/types/Character.ts`
  - `src/stores/sheet/useBioLogic.ts`
  - `src/components/sheet/bio/BioPanel.vue`
- 验收标准：
  - 支持新增 / 删除 / 编辑特性词条
  - 可保留说明文本
  - 老存档的纯文本特性可迁移或兼容展示

### 11. 投掷类武器堆叠与计数
- [ ] 状态：未开始
- 负责人：雪荔枝
- 目标版本：`0.13.x`
- 类型：规则 / 背包 / 战斗联动
- 描述：支持飞镖、标枪等投掷类武器的堆叠显示与数量消耗。
- 初步关联文件：
  - `src/stores/sheet/useInventoryLogic.ts`
  - `src/stores/sheet/useCombatLogic.ts`
  - `src/data/libraries/weapons.ts`
  - `src/types/Item.ts`
  - `src/components/sheet/combat/ActionsPanel.vue`
- 验收标准：
  - 同类投掷武器可堆叠
  - 攻击时可减少数量或具备数量联动基础
  - 不破坏现有武器逻辑

---

## Backlog / 待澄清

### 12. 采用不全书数据*
- [ ] 状态：待澄清
- 负责人：雪荔枝
- 目标版本：`Backlog`
- 类型：需求待确认
- 描述：原始记录含义不明确，可能指“采用不完整规则书 / 非全书数据源 / 按来源裁剪数据集”。
- 需要补充：
  - 是要控制数据来源范围，还是修复缺失数据？
  - 面向物品、法术，还是职业规则？
  - 是否需要做来源筛选开关？
- 初步关联文件：
  - `src/data/spells/*.ts`
  - `src/data/libraries/*.ts`
  - `README.md`

---

## 使用规则

1. 新问题先进入 `TODOLIST.md`
2. 开始开发时更新“状态”为“进行中”
3. 合并或确认完成后，将结果写入 `UPDATE_LOG.md`
4. `TODOLIST.md` 只保留未完成 / 待验证 / 待澄清事项
5. 若问题已完成，应从此处移除，或在迁移到 `UPDATE_LOG.md` 后不再重复保留
