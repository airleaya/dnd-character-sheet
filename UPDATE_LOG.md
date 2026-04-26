# UPDATE_LOG

## [0.12.0] - 2026-04-19
- 类型：Feature / Bugfix / UI / Test
- 条目：攻击面板完成 `0.12.0` 首轮改造并通过专项验证
- 负责人：雪荔枝
- 关联文件：
  - `src/stores/sheet/useCombatLogic.ts`
  - `src/components/sheet/combat/ActionsPanel.vue`
  - `src/stores/tooltip.ts`
  - `src/components/ui/GlobalTooltip.vue`
  - `src/types/Character.ts`
  - `src/utils/characterMigration.ts`
  - `tests/useCombatLogic.test.ts`
  - `tests/actionsPanel.ui.test.ts`
  - `tests/globalTooltip.ui.test.ts`
- 说明：
  - 攻击面板从“默认展示全部攻击项”切换为“默认空面板 + 用户手动选择显示项”的正向选择模型，正式引入 `selectedAttackKeys`
  - 建立 `rawAttacks -> attackCatalog -> selectedAttacks` 的稳定数据链路，并补上旧档从 `hiddenAttacks` 到新模型的兼容迁移
  - 攻击项选择入口改为队尾虚拟攻击项，点击后以浮窗面板进行选择，且支持直接点击卡片选中/取消选中
  - 候选攻击项目录已做去重，保留不同攻击路径；即使力量版与敏捷版最终展示一致，也仍作为两条不同路径保留
  - 攻击项主信息与次要信息完成分层，次要信息通过结构化 tooltip 展示，并补上视口边缘保护
  - 为攻击选择浮窗补上 `全部 / 已选 / 未选` 轻量筛选，满足当前“不做搜索、只做简单筛选”的设计结论
- 验证结果：
  - `npm run typecheck` 通过
  - `npm run test -- tests/actionsPanel.ui.test.ts tests/globalTooltip.ui.test.ts tests/useCombatLogic.test.ts` 通过
  - `npm run build` 通过
- 关联待办：`TODOLIST.md` 中 `0.12.x` 后续功能开发项

> 用途：记录**已经完成**的修复、优化与功能更新，强调“发生了什么变化”。  
> 与 `TODOLIST.md` 的区别：
> - `TODOLIST.md` 关注：**还要做什么**
> - `UPDATE_LOG.md` 关注：**已经做了什么**

当前基线版本：`0.11.7`
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

### [0.11.7] - 2026-04-18
- 类型：Refactor / Release / Verification
- 条目：完成 Phase 7，正式收口集成验证与测试工程化迭代
- 负责人：雪荔枝
- 关联文件：
  - `package.json`
  - `package-lock.json`
  - `.github/workflows/ci.yml`
  - `CODE_HEALTH_PLAN.md`
  - `UPDATE_LOG.md`
  - `tests/preload.test.ts`
  - `tests/storageService.test.ts`
  - `tests/activeSheet.integration.test.ts`
  - `tests/globalFeedback.ui.test.ts`
  - `tests/appRoot.smoke.test.ts`
- 说明：
  - 已将 Phase 7 的 CI 接入、Electron / IPC 边界验证、store 集成级回归、最小 UI smoke 与 App 根壳 smoke 一并正式收口到稳定版本 `0.11.7`
  - 当前测试体系已从纯逻辑与持久化保护，扩展到更接近桌面应用主链路的 renderer / UI 装配层验证，同时继续保持轻量，不引入更重的 E2E 自动化成本
  - 已同步回收阶段版本号、计划文档与更新日志，使当前稳定基线、阶段状态与验收口径重新保持一致
  - 已将 `CODE_HEALTH_PLAN.md` 整理为专项归档文档，并明确后续默认进入系统功能开发阶段，不再继续按本轮重构 Phase 推进
- 验证结果：
  - `npm run test` 通过
  - `npm run typecheck` 通过
  - `npm run lint` 通过
  - `npm run build` 通过
  - 当前测试基线为 10 个测试文件、30 个测试全部通过
- 关联待办：`CODE_HEALTH_PLAN.md` / Phase 7

### [0.11.7-phase.4] - 2026-04-18
- 类型：Refactor / Test / Smoke
- 条目：推进 Phase 7.3，补齐 App 根壳级只读 smoke
- 负责人：雪荔枝
- 关联文件：
  - `package.json`
  - `package-lock.json`
  - `CODE_HEALTH_PLAN.md`
  - `UPDATE_LOG.md`
  - `tests/appRoot.smoke.test.ts`
- 说明：
  - 已围绕 `App` 根节点建立只读 smoke，验证根壳能安全挂载、启动时触发 `characterStore.init()`，并注册桌面关闭前回调
  - 已覆盖空态壳子、已加载角色时的主面板壳子，以及法术书在首次打开后仍保持根层挂载的边界行为
  - 本轮继续保持轻量策略，真实复用 Pinia store，只对重型子组件做 stub，让根层 smoke 尽量贴近实际装配方式
- 验证结果：
  - `npm run test -- tests/appRoot.smoke.test.ts` 通过
- 关联待办：`CODE_HEALTH_PLAN.md` / Phase 7.3

### [0.11.7-phase.3] - 2026-04-18
- 类型：Refactor / Test / UI
- 条目：推进 Phase 7.3，补齐最小 smoke / UI 层验证
- 负责人：雪荔枝
- 关联文件：
  - `package.json`
  - `package-lock.json`
  - `CODE_HEALTH_PLAN.md`
  - `UPDATE_LOG.md`
  - `tests/globalFeedback.ui.test.ts`
- 说明：
  - 已围绕 `GlobalFeedback + uiFeedback` 建立最小 UI smoke 测试，验证确认框渲染、主按钮确认、`Escape` 取消与 toast 自动消失
  - 本轮保持轻量策略，只引入 `@vue/test-utils` 与 `jsdom` 来补 UI 层回归基线，不把范围扩展到更重的整页挂载或 E2E
  - 同步将 `pinia` 补齐为显式运行时依赖，避免应用入口与测试入口对状态管理依赖的声明继续漂移
- 验证结果：
  - `npm run test -- tests/globalFeedback.ui.test.ts` 通过
- 关联待办：`CODE_HEALTH_PLAN.md` / Phase 7.3

### [0.11.7-phase.2] - 2026-04-18
- 类型：Refactor / Test / Integration
- 条目：推进 Phase 7.3，补齐最小集成级 store 链路回归
- 负责人：雪荔枝
- 关联文件：
  - `package.json`
  - `package-lock.json`
  - `CODE_HEALTH_PLAN.md`
  - `UPDATE_LOG.md`
  - `tests/activeSheet.integration.test.ts`
- 说明：
  - 已为 `characterStore + activeSheet` 建立最小集成级回归测试，验证创建角色、加载编辑、保存、重载、删除的完整 store 主链路
  - 本轮测试把前面 Phase 6 的纯逻辑保护与 Phase 7.2 的 Electron 边界验证向前串起来，更接近真实使用路径
  - 当前仍保持在 store 与持久化边界层，不额外引入更重的 UI / E2E 自动化成本
- 验证结果：
  - `npm run test` 通过
  - `npm run typecheck` 通过
  - `npm run lint` 通过
  - `npm run build` 通过
- 关联待办：`CODE_HEALTH_PLAN.md` / Phase 7.3

### [0.11.7-phase.1] - 2026-04-18
- 类型：Refactor / Test / IPC
- 条目：推进 Phase 7.2，补齐 Electron / IPC 边界契约测试
- 负责人：雪荔枝
- 关联文件：
  - `package.json`
  - `package-lock.json`
  - `CODE_HEALTH_PLAN.md`
  - `UPDATE_LOG.md`
  - `tests/storageService.test.ts`
  - `tests/preload.test.ts`
- 说明：
  - 已为 `storageService` 补上成功/失败分支测试，验证缺失 `electronAPI` 以及 IPC 失败返回时的错误传播行为
  - 已为 `preload` 补上暴露契约测试，确认 renderer 端拿到的 `electronAPI` 对象与 `ipcRenderer`、`webFrame` 的转发关系保持稳定
  - 当前 Phase 7.2 的第一轮工作已把 renderer 侧 Electron 边界从“类型定义”推进到“可执行回归验证”
- 验证结果：
  - `npm run test` 通过
  - `npm run typecheck` 通过
  - `npm run lint` 通过
  - `npm run build` 通过
- 关联待办：`CODE_HEALTH_PLAN.md` / Phase 7.2

### [0.11.7-phase.0] - 2026-04-18
- 类型：Refactor / Process / CI
- 条目：进入 Phase 7，并将测试正式接入持续集成
- 负责人：雪荔枝
- 关联文件：
  - `package.json`
  - `package-lock.json`
  - `.github/workflows/ci.yml`
  - `CODE_HEALTH_PLAN.md`
  - `UPDATE_LOG.md`
- 说明：
  - 已将项目从 Phase 6 稳定版 `0.11.6` 切换到 Phase 7 起步版本 `0.11.7-phase.0`
  - 已在 GitHub Actions 中补入 `npm run test`，让 Phase 6 建立的测试基线正式进入持续集成
  - 已为 Phase 7 建立新的阶段计划，明确下一步聚焦 Electron / IPC 边界验证与更贴近真实链路的集成回归
- 验证结果：
  - `npm run test` 通过
  - `npm run typecheck` 通过
  - `npm run lint` 通过
- 关联待办：`CODE_HEALTH_PLAN.md` / Phase 7

### [0.11.6] - 2026-04-18
- 类型：Refactor / Test / Verification
- 条目：完成代码健康计划 Phase 6，建立最小测试与存档回归保护
- 负责人：雪荔枝
- 关联文件：
  - `package.json`
  - `package-lock.json`
  - `CODE_HEALTH_PLAN.md`
  - `UPDATE_LOG.md`
  - `vite.config.js`
  - `tsconfig.json`
  - `tests/characterMigration.test.ts`
  - `tests/useCombatLogic.test.ts`
  - `tests/useInventoryLogic.test.ts`
  - `tests/useSpellLogic.test.ts`
  - `tests/characterStore.test.ts`
- 说明：
  - 已将 Phase 6 的测试基座、纯逻辑回归测试与关键存档流程测试正式收口，稳定版版本号回收为 `0.11.6`
  - 已确认迁移、战斗、背包、法术、存档五类高风险逻辑全部纳入本次正式迭代的回归保护范围
  - 已同步更新计划文档与更新日志，使当前稳定基线、阶段状态与下一阶段起点保持一致
- 验证结果：
  - `npm run test` 通过
  - `npm run typecheck` 通过
  - `npm run lint` 通过
  - `npm run build` 通过
  - 当前测试基线为 5 个测试文件、16 个测试全部通过
- 关联待办：`CODE_HEALTH_PLAN.md` / Phase 6

### [0.11.6-phase.2] - 2026-04-18
- 类型：Refactor / Test / Persistence
- 条目：推进 Phase 6.2，补齐关键存档流程测试
- 负责人：雪荔枝
- 关联文件：
  - `package.json`
  - `package-lock.json`
  - `CODE_HEALTH_PLAN.md`
  - `UPDATE_LOG.md`
  - `tests/characterStore.test.ts`
- 说明：
  - 已围绕 `characterStore` 建立关键存档流程回归测试，用 mock 存储层隔离 Electron，聚焦 store 到持久化边界的契约
  - 已覆盖旧角色导入、编辑后保存、重启后重新读取、删除角色、导出角色五条高风险链路
  - 已补充对分组引用清理、按角色 ID 持久化文件名、导出文件名净化等存档细节的验证
  - 当前 Phase 6 已同时具备纯逻辑测试和最小存档流程测试，后续可继续向更细的 Electron 集成验证推进
- 验证结果：
  - `npm run test` 通过
  - `npm run typecheck` 通过
  - `npm run lint` 通过
  - `npm run build` 通过
- 关联待办：`CODE_HEALTH_PLAN.md` / Phase 6.2

### [0.11.6-phase.1] - 2026-04-18
- 类型：Refactor / Test / Regression
- 条目：推进 Phase 6.1，补齐法术逻辑与攻击面板生成测试
- 负责人：雪荔枝
- 关联文件：
  - `package.json`
  - `package-lock.json`
  - `CODE_HEALTH_PLAN.md`
  - `UPDATE_LOG.md`
  - `tests/useCombatLogic.test.ts`
  - `tests/useSpellLogic.test.ts`
- 说明：
  - 已继续沿着纯逻辑回归保护推进，为攻击面板生成补上精巧武器条目生成测试
  - 已为 `useSpellLogic` 补上法术分组、战斗法术过滤、学习来源记录、法术位恢复与契约法术位收敛测试
  - 当前 Phase 6.1 的首轮高风险逻辑点已从“迁移 / 战斗 / 背包”扩展到“迁移 / 战斗 / 背包 / 法术”
  - 本轮仍保持只测纯逻辑，不把 UI 呈现和 Electron 行为混进同一批测试
- 验证结果：
  - `npm run test` 通过
  - `npm run typecheck` 通过
  - `npm run lint` 通过
  - `npm run build` 通过
- 关联待办：`CODE_HEALTH_PLAN.md` / Phase 6.1

### [0.11.6-phase.0] - 2026-04-18
- 类型：Refactor / Test / Process
- 条目：进入 Phase 6，并建立最小逻辑测试基座
- 负责人：雪荔枝
- 关联文件：
  - `package.json`
  - `package-lock.json`
  - `tsconfig.json`
  - `vite.config.js`
  - `tests/characterMigration.test.ts`
  - `tests/useCombatLogic.test.ts`
  - `tests/useInventoryLogic.test.ts`
  - `CODE_HEALTH_PLAN.md`
  - `UPDATE_LOG.md`
- 说明：
  - 已将项目从 Phase 5 稳定版 `0.11.5` 切换到 Phase 6 起步版本 `0.11.6-phase.0`
  - 已重新引入 `Vitest`，补回 `test / test:watch` 脚本，并建立 `node` 环境的最小测试配置
  - 已优先为 `characterMigration`、`useCombatLogic`、`useInventoryLogic` 建立首批纯逻辑测试，覆盖生命骰迁移、AC、负重、货币换算与箭矢入包等关键回归点
  - 当前阶段仍刻意保持范围克制，先构建“可运行、可扩展、可回归”的测试基座，再逐步补 Spellbook 与存档链路
- 验证结果：
  - `npm run test` 通过
  - `npm run typecheck` 通过
  - `npm run lint` 通过
  - `npm run build` 通过
- 关联待办：`CODE_HEALTH_PLAN.md` / Phase 6

### [0.11.5] - 2026-04-18
- 类型：Refactor / Release / Verification
- 条目：完成代码健康计划 Phase 5，建立正式稳定迭代版本
- 负责人：雪荔枝
- 关联文件：
  - `package.json`
  - `package-lock.json`
  - `CODE_HEALTH_PLAN.md`
  - `UPDATE_LOG.md`
  - `vite.config.js`
  - `src/App.vue`
  - `src/components/layout/SidebarRight.vue`
  - `src/stores/uiFeedback.ts`
  - `src/components/ui/GlobalFeedback.vue`
  - `src/composables/useForge.ts`
  - `src/stores/characterStore.ts`
  - `electron/main.ts`
- 说明：
  - 已将 Phase 5 的三个子任务正式收口，稳定版版本号回收为 `0.11.5`
  - 已确认首包拆分、调试日志收敛与全局反馈统一全部纳入本次正式迭代
  - 已将未完成的 Phase 6 `vitest / tests` 脚手架从本次版本中剥离，避免规划中工作混入稳定版
  - 已同步更新计划文档与更新日志，使当前稳定基线、阶段状态与下一阶段起点保持一致
- 验证结果：
  - `npm run typecheck` 通过
  - `npm run lint` 通过
  - `npm run build` 通过
  - 本次正式版不包含未完成的 Phase 6 测试脚手架
- 关联待办：`CODE_HEALTH_PLAN.md` / Phase 5

### [0.11.5-phase.3] - 2026-04-18
- 类型：Refactor / UX / UI
- 条目：推进 Phase 5.3，统一确认弹窗与全局提示反馈
- 负责人：雪荔枝
- 关联文件：
  - `src/stores/uiFeedback.ts`
  - `src/components/ui/GlobalFeedback.vue`
  - `src/App.vue`
  - `src/components/layout/SidebarLeft.vue`
  - `src/components/sheet/bio/XpProgressBar.vue`
  - `src/components/sheet/combat/ActionsPanel.vue`
  - `src/components/sheet/combat/CombatPanel.vue`
  - `src/components/sheet/inventory/InventoryPanel.vue`
  - `src/components/sheet/modals/ForgeModal.vue`
  - `src/components/sheet/spellbook/SpellbookRightPanel.vue`
  - `package.json`
  - `package-lock.json`
  - `CODE_HEALTH_PLAN.md`
  - `UPDATE_LOG.md`
- 说明：
  - 已新增全局 `Modal / Toast` 反馈层，统一接管确认操作与轻量提示
  - 已将删除、重置、长休、遗忘法术、放弃未保存更改等高频确认链路迁移到统一确认框
  - 已将保存成功、余额不足、导出失败、批量导出完成等反馈迁移到非阻塞式 toast
  - 当前桌面端体验已从浏览器原生弹窗收敛为项目内统一交互风格
- 验证结果：
  - `npm run typecheck` 通过
  - `npm run lint` 通过
  - `npm run build` 通过
  - 运行时代码中的高频 `alert / confirm` 调用已完成替换
- 关联待办：`CODE_HEALTH_PLAN.md` / Phase 5.3

### [0.11.5-phase.2] - 2026-04-18
- 类型：Refactor / Maintainability / Logging
- 条目：推进 Phase 5.2，完成第一轮调试日志清理
- 负责人：雪荔枝
- 关联文件：
  - `src/App.vue`
  - `src/components/layout/SidebarLeft.vue`
  - `src/composables/useForge.ts`
  - `src/stores/characterStore.ts`
  - `src/utils/inventoryDropUtils.ts`
  - `electron/main.ts`
  - `package.json`
  - `package-lock.json`
  - `CODE_HEALTH_PLAN.md`
  - `UPDATE_LOG.md`
- 说明：
  - 已删除退出保存、角色初始化、旧文件清理、拖拽分支命中、批量导入完成等成功路径与开发调试日志
  - 已为保留的异常日志补充统一模块前缀，降低后续排查时的上下文成本
  - 已保留仍具定位价值的错误与兼容性告警，避免为了“安静”而丢失排障信息
  - 当前控制台已从“调试信息 + 异常混杂”收敛为“以异常和兼容提醒为主”
- 验证结果：
  - `npm run typecheck` 通过
  - `npm run lint` 通过
  - 剩余控制台输出已主要收敛为 `warn / error`
- 关联待办：`CODE_HEALTH_PLAN.md` / Phase 5.2

### [0.11.5-phase.1] - 2026-04-18
- 类型：Refactor / Performance / Build
- 条目：推进 Phase 5.1，完成首轮包体切分与懒加载优化
- 负责人：雪荔枝
- 关联文件：
  - `src/App.vue`
  - `src/components/layout/SidebarRight.vue`
  - `vite.config.js`
  - `package.json`
  - `package-lock.json`
  - `CODE_HEALTH_PLAN.md`
  - `UPDATE_LOG.md`
- 说明：
  - 已将 `SpellbookPanel` 改为首次打开后再异步加载，避免法术书 UI 在应用初始渲染时进入主入口 chunk
  - 已将右侧 `LibraryItemsPanel` / `LibrarySpellsPanel` 改为异步组件，并让法术库只在用户首次切换到法术标签时再加载
  - 已在 `vite.config.js` 中补充最小 `manualChunks` 策略，将 Vue 运行时、拖拽库、法术数据、物品数据、法术书 UI、图书馆 UI 拆分为独立 chunk
  - 当前策略优先解决构建时已经明确暴露的首包与 chunk 组织问题，不做过度切包
- 验证结果：
  - `npm run typecheck` 通过
  - `npm run lint` 通过
  - `npm run build` 通过
  - 构建结果由单一主入口 `index-*.js 904.12 kB` 收敛为多 chunk 结构，主入口 `index-*.js` 降至 `81.33 kB`
  - `vite build` 已不再出现 `Some chunks are larger than 500 kB after minification` 警告
- 关联待办：`CODE_HEALTH_PLAN.md` / Phase 5.1

### [0.11.5-phase.0] - 2026-04-18
- 类型：Refactor / Process / Planning
- 条目：进入 Phase 5 并建立性能与可维护性工作计划
- 负责人：雪荔枝
- 关联文件：
  - `package.json`
  - `package-lock.json`
  - `CODE_HEALTH_PLAN.md`
  - `UPDATE_LOG.md`
- 说明：
  - 已将项目从 Phase 4 稳定版 `0.11.4` 切换到 Phase 5 规划版 `0.11.5-phase.0`
  - 已为 Phase 5 明确执行顺序：先包体优化，再日志治理，最后替换原生弹窗
  - 已补充每个子任务的实施计划、推荐策略与验收口径，后续可以按子任务逐步推进
  - 已同步修正优先级列表中此前仍未勾选的 Phase 4 项，保证计划文档状态一致
- 验证结果：
  - 版本规则与阶段状态已同步到文档
  - Phase 5 已具备可执行工作计划
- 关联待办：`CODE_HEALTH_PLAN.md` / Phase 5

### [0.11.4] - 2026-04-18
- 类型：Refactor / Electron / Persistence / Verification
- 条目：完成代码健康计划 Phase 4（稳定 Electron 与持久化层）
- 负责人：雪荔枝
- 关联文件：
  - `electron/main.ts`
  - `electron/preload.ts`
  - `src/types/electron.ts`
  - `src/services/storageService.ts`
  - `src/stores/characterStore.ts`
  - `src/vite-env.d.ts`
  - `scripts/verify-phase4-storage.cjs`
  - `package.json`
  - `package-lock.json`
  - `CODE_HEALTH_PLAN.md`
  - `UPDATE_LOG.md`
- 说明：
  - 已完成存档路径迁移到 `app.getPath('userData')`，并保留旧路径兼容读取与复制迁移策略
  - 已统一 Electron IPC 类型边界，主进程、preload 与渲染进程共享同一套返回结构与 API 接口
  - 已抽离最小 `storageService`，让角色持久化链路从“store 直连 IPC”收敛为“store -> service -> Electron API”
  - 已完成脚本回归验证与手工验收，当前 Phase 4 的核心目标已达到结项条件
  - 兼容策略为：读取优先新路径，新路径为空时回退旧路径，写入统一走新路径，首轮迁移不删除旧数据
- 验证结果：
  - `npm run verify:phase4-storage` 通过
  - 开发环境、旧存档环境、重启恢复场景的手工验收通过
  - `npm run typecheck` 通过
  - `npm run lint` 通过
  - `npm run build` 通过
- 关联待办：`CODE_HEALTH_PLAN.md` / Phase 4

### [0.11.4-phase.5] - Phase 4 进度 5（日期待补）
- 类型：Refactor / Electron / Persistence / Verification
- 条目：为 Phase 4 存档迁移补最小回归验证脚本
- 负责人：雪荔枝
- 关联文件：
  - `scripts/verify-phase4-storage.cjs`
  - `scripts/README.md`
  - `package.json`
  - `package-lock.json`
  - `CODE_HEALTH_PLAN.md`
  - `UPDATE_LOG.md`
- 说明：
  - 已新增 `verify:phase4-storage` 脚本，覆盖旧存档迁移、兼容读取以及不覆盖已有新路径数据这三类关键场景
  - 这轮验证聚焦文件系统契约，先把最容易回归的持久化规则固化下来
  - 手工验收仍保留给开发环境启动、重启恢复和界面交互链路，不和纯文件系统验证混在一起
  - 当前 Phase 4 的验收方式已从“完全依赖手工”推进到“脚本验证 + 手工补充”
- 验证结果：
  - `npm run verify:phase4-storage` 通过
  - `npm run typecheck` 通过
  - `npm run lint` 通过
  - `npm run build` 通过
- 关联待办：`CODE_HEALTH_PLAN.md` / Phase 4.1 手工验收

### [0.11.4-phase.4] - 版本规则修正（日期待补）
- 类型：Refactor / Process
- 条目：将重构专项版本规则修正为 SemVer 兼容的 `0.11.x-phase.y`
- 负责人：雪荔枝
- 关联文件：
  - `package.json`
  - `package-lock.json`
  - `CODE_HEALTH_PLAN.md`
  - `UPDATE_LOG.md`
- 说明：
  - 已将先前不兼容打包工具的四段数字版本写法，修正为 SemVer 兼容的 `0.11.x-phase.y`
  - 新规则为：进入某个 Phase 后先切到 `0.11.x-phase.0`，Phase 内推进递增 `y`，Phase 完成后回收为稳定版本 `0.11.x`
  - 本次修正的直接原因是 `electron-builder` 拒绝 `0.11.4.3`，导致打包失败
  - 当前项目已正式进入 Phase 4，并在完成前三次推进后补上版本规则修正，因此当前基线版本更新为 `0.11.4-phase.4`
  - 后续每次阶段推进都需同步更新 `package.json`、`package-lock.json`、`CODE_HEALTH_PLAN.md` 与 `UPDATE_LOG.md`
- 验证结果：
  - `npm run build` 通过
  - 版本规则已写入计划文档
  - 项目版本号已更新到 `0.11.4-phase.4`
- 关联待办：`CODE_HEALTH_PLAN.md` / 版本推进规则

### [0.11.4-phase.3] - Phase 4 进度 3（日期待补）
- 类型：Refactor / Electron / Persistence / Architecture
- 条目：推进 Phase 4.3，抽离最小 `storageService`
- 负责人：雪荔枝
- 关联文件：
  - `src/services/storageService.ts`
  - `src/stores/characterStore.ts`
  - `package.json`
  - `CODE_HEALTH_PLAN.md`
  - `UPDATE_LOG.md`
- 说明：
  - 已新增 `storageService`，统一封装角色读取、保存、删除三条核心持久化路径
  - `characterStore.ts` 已优先通过 service 调用底层 Electron IO，不再直接依赖 `window.electronAPI`
  - 第一轮抽象保持最小化，暂不迁移窗口配置等非核心路径，以降低回归风险
  - 当前持久化分层已从“store 直连 IPC”演进为“store -> service -> Electron API”
- 验证结果：
  - `npm run typecheck` 通过
  - `npm run lint` 通过
- 关联待办：`CODE_HEALTH_PLAN.md` / Phase 4.3

### [0.11.4-phase.2] - Phase 4 进度 2（日期待补）
- 类型：Refactor / Electron / Type Safety / IPC
- 条目：推进 Phase 4.2，统一 Electron IPC 类型边界
- 负责人：雪荔枝
- 关联文件：
  - `src/types/electron.ts`
  - `electron/main.ts`
  - `electron/preload.ts`
  - `src/vite-env.d.ts`
  - `src/stores/characterStore.ts`
  - `package.json`
  - `CODE_HEALTH_PLAN.md`
  - `UPDATE_LOG.md`
- 说明：
  - 已新增共享 IPC 类型文件 `src/types/electron.ts`，集中定义 `IpcResult<T>`、`IpcVoidResult` 与 `ElectronApi`
  - 已在主进程中统一 `saveCharacter / loadAllCharacters / deleteCharacter / exportCharacter` 的返回结构，失败分支收敛为字符串错误信息
  - 已在 `electron/preload.ts` 中以正式接口承载 `window.electronAPI` 暴露对象，并在 `src/vite-env.d.ts` 中复用同一接口
  - 已在 `characterStore.ts` 中按统一返回结构消费结果，减少宽泛成功判断与隐式错误分支
- 验证结果：
  - `npm run typecheck` 通过
  - `npm run lint` 通过
- 关联待办：`CODE_HEALTH_PLAN.md` / Phase 4.2

### [0.11.4-phase.1] - Phase 4 进度 1（日期待补）
- 类型：Refactor / Electron / Persistence
- 条目：开始 Phase 4.1 并完成 userData 路径迁移第一轮落地
- 负责人：雪荔枝
- 关联文件：
  - `electron/main.ts`
  - `package.json`
  - `CODE_HEALTH_PLAN.md`
  - `UPDATE_LOG.md`
- 说明：
  - 已将 Electron 角色存档默认路径从 `process.cwd()/saves` 迁移到 `app.getPath('userData')/saves`
  - 已将窗口配置默认路径从 `process.cwd()/window-config.json` 迁移到 `app.getPath('userData')/window-config.json`
  - 已建立新旧路径 helper，并补充目录创建、旧数据复制迁移与兼容读取逻辑
  - 当前策略为：读取优先新路径、新路径为空时回退旧路径、写入统一走新路径、第一轮不删除旧数据
- 验证结果：
  - `npm run typecheck` 通过
  - `npm run lint` 通过
- 关联待办：`CODE_HEALTH_PLAN.md` / Phase 4.1

### [0.11.3] - Phase 3 完成（日期待补）
- 类型：Refactor / Type Safety / Frontend / Store
- 条目：完成代码健康计划 Phase 3（类型安全、前端入口统一与核心 store 收紧）
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
  - `src/stores/sheet/useInventoryLogic.ts`
  - `src/stores/sheet/useSpellLogic.ts`
  - `src/stores/sheet/useBioLogic.ts`
  - `src/stores/activeSheet.ts`
  - `src/main.ts`
  - `index.html`
  - `CODE_HEALTH_PLAN.md`
- 说明：
  - 已完成 `StatsAndSkills.vue`、`BioPanel.vue`、`ActionsPanel.vue` 的组件层类型收紧，去除对组件侧忽略与脆弱推断的依赖
  - 已为 `useCombatLogic.ts` 导出 `AttackEntry`，并在战斗面板中直接复用正式攻击项类型
  - 已为 Forge 草稿数据、价格结构与拖拽 payload 建立显式类型，清理 `ForgeModal.vue` 中一批 `(draftData as any)`
  - 已为背包拖拽链路建立正式拖拽元素类型、payload 解析入口与类型守卫，并同步接入 Inventory / Library / Forge 调用侧
  - 已继续收紧 `useInventoryLogic.ts`、`useSpellLogic.ts`、`useBioLogic.ts` 的核心计算与动作接口类型，减少隐式字符串与宽泛推断
  - 已为 `activeSheet.ts` 补充 Facade UI 状态类型，并统一 `characterStore` 依赖注入与基础动作边界
  - 已将前端入口从 `src/main.js` 迁移到 `src/main.ts`，并将 `index.html` 的入口引用统一到 TypeScript
- 验证结果：
  - `npm run typecheck` 通过
  - `npm run lint` 通过
- 验收补充：
  - 组件层 `@ts-ignore / @ts-expect-error` 目标已完成清理
  - `src/main.js` 已移除，前端入口已统一到 `src/main.ts`
  - 背包拖拽 payload、Forge 数据结构、sheet 核心 store 类型边界已完成收紧
  - `npm run typecheck` 与 `npm run lint` 再次通过，可支持 Phase 3 结项
- 关联待办：`CODE_HEALTH_PLAN.md` / Phase 3


### [0.11.2] - Phase 2 完成（日期待补）
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

### [0.11.1] - Phase 1 完成（日期待补）
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
