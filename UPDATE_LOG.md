# UPDATE_LOG

> 用途：记录**已经完成**的修复、优化与功能更新，强调“发生了什么变化”。  
> 与 `TODOLIST.md` 的区别：
> - `TODOLIST.md` 关注：**还要做什么**
> - `UPDATE_LOG.md` 关注：**已经做了什么**

当前基线版本：`0.10.2`
默认记录人：**雪荔枝**

---

## 建议记录模板

### [版本号] - YYYY-MM-DD
- 类型：Bugfix / Feature / Refactor / Data / UI
- 条目：问题标题
- 负责人：雪荔枝
- 关联文件：
  - `路径/文件名`
- 说明：
  - 做了哪些改动
  - 为什么这样改
  - 是否涉及旧存档兼容
- 验证结果：
  - 如何验证通过
- 关联待办：`TODOLIST.md` 中的对应条目

---

## 历史完成记录（由 `问题收集.txt` 整理）

### [0.10.2] - Phase 3 进行中（日期待补）
- 类型：Refactor / Type Safety / Frontend
- 条目：推进代码健康计划 Phase 3（类型安全与前端入口统一）
- 负责人：雪荔枝
- 关联文件：
  - `src/components/sheet/bio/StatsAndSkills.vue`
  - `src/components/sheet/bio/BioPanel.vue`
  - `src/components/sheet/combat/ActionsPanel.vue`
  - `src/components/sheet/modals/ForgeModal.vue`
  - `src/components/sheet/inventory/InventoryPanel.vue`
  - `src/components/sheet/inventory/InventoryItemRow.vue`
  - `src/components/sheet/library/LibraryItemsPanel.vue`
  - `src/components/sidebar/ForgeDropZone.vue`
  - `src/composables/useForge.ts`
  - `src/utils/inventoryDropUtils.ts`
  - `src/stores/sheet/useCombatLogic.ts`
  - `src/main.ts`
  - `index.html`
  - `CODE_HEALTH_PLAN.md`
- 说明：
  - 已完成 `StatsAndSkills.vue`、`BioPanel.vue`、`ActionsPanel.vue` 的组件层类型收紧，去除对组件侧忽略与脆弱推断的依赖
  - 已为 `useCombatLogic.ts` 导出 `AttackEntry`，并在战斗面板中直接复用正式攻击项类型
  - 已为 Forge 草稿数据、价格结构与拖拽 payload 建立显式类型，清理 `ForgeModal.vue` 中一批 `(draftData as any)`
  - 已为背包拖拽链路建立正式拖拽元素类型、payload 解析入口与类型守卫，并同步接入 Inventory / Library / Forge 调用侧
  - 已将前端入口从 `src/main.js` 迁移到 `src/main.ts`，并将 `index.html` 的入口引用统一到 TypeScript
- 验证结果：
  - `npm run typecheck` 通过
  - `npm run lint` 通过
- 关联待办：`CODE_HEALTH_PLAN.md` / Phase 3


### [0.10.2] - Phase 2 完成（日期待补）
- 类型：Refactor / Data / Type Safety
- 条目：完成代码健康计划 Phase 2（收敛数据模型）
- 负责人：雪荔枝
- 关联文件：
  - `src/utils/characterMigration.ts`
  - `src/stores/characterStore.ts`
  - `src/stores/activeSheet.ts`
  - `src/stores/sheet/useCombatLogic.ts`
  - `src/stores/sheet/  useBioLogic.ts`
  - `src/stores/sheet/useInventoryLogic.ts`
  - `src/stores/sheet/useSpellLogic.ts`
  - `src/components/sheet/combat/CombatPanel.vue`
  - `src/types/Character.ts`
  - `CODE_HEALTH_PLAN.md`
- 说明：
  - 已新增统一迁移模块 `characterMigration.ts`，集中处理旧存档补全、默认值规范化与历史生命骰字段迁移
  - `characterStore.ts` 与 `activeSheet.ts` 已统一接入规范化入口，角色数据进入 store / activeSheet 前先完成收敛
  - 旧生命骰字段 `hitDiceType / hitDiceCurrent / hitDiceMax` 已统一迁移到 `combat.hitDice`
  - 生命骰修改逻辑已从 `CombatPanel.vue` 下沉到 `useCombatLogic.ts`，组件不再直接深拷贝并写回状态
  - 已补充 `HitDieEntry / HitDiceMap` 等正式类型，并将 `spells.pactSlots / spells.spellSources` 收紧为必填字段
  - 已清理一批 `wallet / spells / proficiencies / savingThrows / hiddenAttacks / activeAttackModes` 的运行时兜底，改由 migration + 类型契约统一保证
  - 已完成旧存档导入、生命骰修改后切换角色、重启应用、多职业生命骰显示与保存等关键链路验收
  - 项目数据模型已从“运行时分散补丁”推进为“统一迁移 + 统一类型 + 统一状态更新”的可维护结构
- 验证结果：
  - 旧存档导入通过
  - 生命骰切换角色保留通过
  - 重启应用后生命骰保留通过
  - 多职业生命骰显示与保存通过
  - `npm run typecheck` 通过
  - `npm run lint` 通过
- 关联待办：`CODE_HEALTH_PLAN.md` / Phase 2

### [0.10.2] - Phase 1 完成（日期待补）
- 类型：Refactor / Tooling / CI
- 条目：完成代码健康计划 Phase 1（建立工程护栏）
- 负责人：雪荔枝
- 关联文件：
  - `package.json`
  - `README.md`
  - `.github/workflows/ci.yml`
  - `CODE_HEALTH_PLAN.md`
  - `src/stores/sheet/useCombatLogic.ts`
  - `src/stores/sheet/useInventoryLogic.ts`
  - `src/stores/sheet/useSpellLogic.ts`
  - `src/stores/characterStore.ts`
  - `src/utils/inventoryDropUtils.ts`
  - `src/utils/itemFactory.ts`
  - `src/types/Item.ts`
  - `src/vite-env.d.ts`
  - `src/components/sheet/inventory/*.vue`
  - `src/components/sheet/combat/CombatPanel.vue`
  - `src/directives/vTooltip.ts`
  - `src/composables/useForge.ts`
- 说明：
  - 已补充 `typecheck / lint / lint:fix / format / format:check` 脚本，建立本地检查入口
  - 已引入 ESLint + Prettier，并完成一轮全仓风格与类型治理
  - 已新增最小 GitHub Actions CI，自动执行安装、类型检查、Lint 与构建
  - 在 Phase 1 推进过程中，同步清理了关键模块中的高频类型债与风格问题，使仓库从 116 条 lint warning 收敛到 0
  - 当前项目已达到“本地可检查、CI 可阻断、类型与风格可持续维护”的最小工程护栏目标
- 验证结果：
  - `npm run typecheck` 通过
  - `npm run lint` 通过
  - `npm run build` 已纳入 CI 流程
- 关联待办：`CODE_HEALTH_PLAN.md` / Phase 1


### [未标注版本] - 已完成
- 类型：规则 / 数据
- 条目：没有无甲防护
- 负责人：雪荔枝
- 关联文件（推测）：
  - `src/stores/sheet/useCombatLogic.ts`
  - `src/types/Character.ts`
- 说明：已补充无甲防护相关支持。

### [未标注版本] - 已完成
- 类型：数据
- 条目：物品牛眼提灯用的提灯的属性
- 负责人：雪荔枝
- 关联文件（推测）：
  - `src/data/libraries/gears.ts`
  - `src/utils/itemFactory.ts`
- 说明：已修正牛眼提灯 / 提灯的属性定义。

### [未标注版本] - 已完成
- 类型：规则 / 数据
- 条目：没有详细的针对某件武器的熟练项
- 负责人：雪荔枝
- 关联文件（推测）：
  - `src/data/rules/proficiencies.ts`
  - `src/stores/sheet/useBioLogic.ts`
  - `src/stores/sheet/useCombatLogic.ts`
- 说明：已补充更细粒度的武器熟练支持。

### [未标注版本] - 已完成
- 类型：数据
- 条目：没有圣徽
- 负责人：雪荔枝
- 关联文件（推测）：
  - `src/data/libraries/gears.ts`
- 说明：已补充圣徽条目。

### [未标注版本] - 已完成
- 类型：交互 / 法术书
- 条目：将已学会的法术拖入法术书中不会出现反馈
- 负责人：雪荔枝
- 关联文件（推测）：
  - `src/components/sheet/spellbook/*.vue`
  - `src/stores/sheet/useSpellLogic.ts`
- 说明：已补充拖拽后的界面反馈或状态更新。

### [未标注版本] - 2026-04-03
- 类型：UI / 角色管理
- 条目：左侧的角色卡管理器中需要折叠栏便于用户进行大量的角色卡管理
- 负责人：雪荔枝
- 关联文件（推测）：
  - `src/components/layout/SidebarLeft.vue`
  - `src/stores/characterStore.ts`
- 说明：已完成左侧角色分组 / 折叠相关支持。

### [未标注版本] - 2026-03-26
- 类型：Bugfix / Forge
- 条目：diy物品界面缩放导致无法正常保存的问题
- 负责人：雪荔枝
- 关联文件（推测）：
  - `src/composables/useForge.ts`
  - `src/components/sheet/modals/ForgeModal.vue`
  - `electron/preload.ts`
- 说明：已修复缩放条件下 DIY 物品保存异常。

### [未标注版本] - 已完成
- 类型：数据
- 条目：七彩喷射的描述错误
- 负责人：雪荔枝
- 关联文件（推测）：
  - `src/data/spells/*.ts`
- 说明：已修正法术描述文本。

### [未标注版本] - 2026-04-03
- 类型：Bugfix / 职业系统 / 战斗
- 条目：因为兼职导致一个角色有多种生命骰
- 负责人：雪荔枝
- 关联文件（推测）：
  - `src/stores/sheet/useBioLogic.ts`
  - `src/stores/sheet/useCombatLogic.ts`
  - `src/stores/characterStore.ts`
  - `src/types/Character.ts`
- 说明：已支持兼职角色的多生命骰结构。

### [未标注版本] - 2026-03-29
- 类型：Bugfix / 法术书
- 条目：无法术状态下调整法术位
- 负责人：雪荔枝
- 关联文件（推测）：
  - `src/stores/sheet/useSpellLogic.ts`
  - `src/stores/activeSheet.ts`
- 说明：通过重构法术书更新逻辑，修复了无完整法术状态时的法术位调整问题。

### [未标注版本] - 2026-03-26
- 类型：Bugfix / 输入交互
- 条目：文本框点击bug
- 负责人：雪荔枝
- 关联文件（推测）：
  - `src/components/common/EditableText.vue`
  - `src/components/common/EditableTextarea.vue`
- 说明：已修复文本输入相关交互问题。

### [未标注版本] - 2026-03-29
- 类型：Bugfix / 法术书 / 职业系统
- 条目：兼职导致混合的施法属性
- 负责人：雪荔枝
- 关联文件（推测）：
  - `src/stores/sheet/useSpellLogic.ts`
  - `src/stores/sheet/useBioLogic.ts`
  - `src/data/rules/classes.ts`
- 说明：通过重构法术书相关逻辑，修复兼职角色施法属性混合计算问题。

### [未标注版本] - 2026-03-30
- 类型：UI
- 条目：新法术书界面调整
- 负责人：雪荔枝
- 关联文件（推测）：
  - `src/components/sheet/spellbook/*.vue`
- 说明：已完成法术书界面样式 / 布局调整。

### [未标注版本] - 2026-03-30
- 类型：UI
- 条目：新职业的ui样式调整
- 负责人：雪荔枝
- 关联文件（推测）：
  - `src/components/sheet/bio/ClassSelector.vue`
  - `src/components/sheet/bio/*.vue`
- 说明：已完成职业相关 UI 样式调整。

### [未标注版本] - 2026-04-03
- 类型：UX / 新手引导
- 条目：没有设置初始职业的时候，用户找不到初始的职业创建接口
- 负责人：雪荔枝
- 关联文件（推测）：
  - `src/components/sheet/bio/ClassSelector.vue`
  - `src/stores/sheet/useBioLogic.ts`
- 说明：已增强初始职业创建入口的可发现性。

---

## 维护约定

1. 完成一个待办后，在这里补一条正式记录
2. 如果能确认版本号，请不要再写“未标注版本”
3. 若改动涉及存档结构，请在说明中明确写出“兼容策略”
4. 若改动涉及多个模块，优先写最关键的关联文件
5. 可在版本发布前，将同版本记录汇总到正式 `CHANGELOG` 中
