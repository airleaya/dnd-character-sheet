# CODE_HEALTH_PLAN

> 用途：记录当前项目的代码健康度评估结果，以及后续的治理计划。  
> 与其他文档的区别：
> - `TODOLIST.md`：记录功能问题与待办事项
> - `UPDATE_LOG.md`：记录已经完成的修复与更新
> - `CODE_HEALTH_PLAN.md`：记录**工程质量、结构治理、技术债清理**的专项计划

评估基线版本：`0.11.3`  
评估分支：`codex-fix`  
默认负责人：**雪荔枝**

---

## 1. 本次检查范围

本次检查基于当前仓库代码进行，主要覆盖：

- 项目配置
  - `package.json`
  - `tsconfig.json`
  - `vite.config.js`
- Electron 层
  - `electron/main.ts`
  - `electron/preload.ts`
- 核心状态管理
  - `src/stores/activeSheet.ts`
  - `src/stores/characterStore.ts`
  - `src/stores/sheet/*.ts`
- 关键组件
  - `src/App.vue`
  - `src/components/sheet/bio/*.vue`
  - `src/components/sheet/combat/*.vue`
- 工具与组合式逻辑
  - `src/composables/useForge.ts`
  - `src/utils/*.ts`

并执行了以下验证：

- 检索 `any`
- 检索 `@ts-ignore`
- 检索 `console.log / warn / error`
- 检查 `window.electronAPI`、`localStorage`、`JSON.parse` 的使用情况
- 执行构建验证：`npm run build`

---

## 2. 总体结论

当前项目属于：

> **功能基本可用、模块拆分方向正确，但工程护栏不足、类型安全偏弱、数据模型与兼容逻辑仍有技术债。**

### 优点

- 已有较清晰的模块分区：`bio / combat / inventory / spellbook`
- `activeSheet` + `stores/sheet/*` 的 Facade 拆分方向正确
- 本地 JSON 存档方案与 Electron 桌面项目定位匹配
- 当前能够完成生产构建与打包
- 数据层、类型层、UI 层已有初步分离

### 主要问题

- 缺少 `lint / typecheck / test` 等工程护栏
- `strict: true` 已开启，但代码中仍存在大量 `any` / `@ts-ignore`
- 旧存档兼容逻辑分散，数据模型未完全收敛
- 存档路径使用 `process.cwd()`，不够稳健
- 调试日志较多，说明项目仍处于中间态
- 前端主包体积较大，已有 chunk warning

---

## 3. 关键发现

### 3.1 构建状态

已执行：

```text CODE_HEALTH_PLAN.md
npm run build
```

结果：

- Vite 前端构建成功
- Electron 主进程 / preload 构建成功
- electron-builder 打包成功

发现的问题：

- 前端主 chunk 约 **902.85 kB**
- 已出现 Vite 的 chunk size warning

结论：

- 当前项目能正常构建
- 但前端包体已偏大，需纳入后续优化计划

---

### 3.2 工程化不足

`package.json` 当前仅包含：

- `dev`
- `build`
- `preview`

缺少：

- `lint`
- `typecheck`
- `test`
- CI 自动检查

风险：

- 代码风格无法自动统一
- 类型问题难以及时暴露
- 回归问题主要依赖手工发现

---

### 3.3 类型安全不足

检索结果显示，项目中存在较多：

- `any`
- `Record<string, any>`
- `(xxx as any)`
- `@ts-ignore`

典型文件包括：

- `src/stores/sheet/useCombatLogic.ts`
- `src/stores/sheet/useInventoryLogic.ts`
- `src/stores/sheet/useBioLogic.ts`
- `src/stores/sheet/useSpellLogic.ts`
- `src/composables/useForge.ts`
- `src/components/sheet/bio/StatsAndSkills.vue`
- `src/components/sheet/bio/BioPanel.vue`
- `src/components/sheet/combat/ActionsPanel.vue`
- `src/utils/inventoryDropUtils.ts`

风险：

- 重构时容易引入隐蔽错误
- 规则计算逻辑难以被类型系统保护
- 存档结构扩展时，容易因字段不明确而出错

---

### 3.4 数据迁移与运行时补丁分散

当前旧数据兼容与字段补全逻辑分散在：

- `src/stores/characterStore.ts`
- `src/stores/activeSheet.ts`

具体表现：

- `characterStore.ts` 中有 `migrateLegacyData`
- `activeSheet.ts` 中又存在大量字段补全逻辑
- 某些旧字段已迁移，但代码中仍保留其补丁痕迹

风险：

- 数据结构真实边界不清晰
- 同一个问题可能在多个位置重复修补
- 新字段加入时容易漏掉迁移点

---

### 3.5 生命骰模型疑似存在结构性问题

从代码观察，生命骰相关字段存在历史演化痕迹：

- 旧字段：`hitDiceType / hitDiceCurrent / hitDiceMax`
- 新字段：`combat.hitDice`

目前现象：

- 迁移逻辑中已尝试统一到 `combat.hitDice`
- 但 `activeSheet.ts` 中仍有 `hitDiceType` 相关兼容补丁
- `CombatPanel.vue` 中通过深拷贝写回生命骰对象以触发更新

结论：

- 生命骰问题很可能不只是 UI 层 bug
- 更可能是 **数据模型未完全收束 + 保存链路不够统一** 的综合结果

---

### 3.6 Electron 存档路径设计不够稳健

当前 `electron/main.ts` 中：

- 存档目录：`path.join(process.cwd(), 'saves')`
- 窗口配置：`path.join(process.cwd(), 'window-config.json')`

风险：

- 启动目录变化时，存档位置可能变化
- 安装版 / 便携版 / 开发模式行为不完全一致
- 用户数据和程序目录耦合，不利于长期维护

建议：

- 迁移至 `app.getPath('userData')`

---

### 3.7 调试日志较多

检索发现较多：

- `console.log`
- `console.warn`
- `console.error`

集中于：

- `src/composables/useForge.ts`
- `src/stores/characterStore.ts`
- `src/App.vue`
- `src/utils/inventoryDropUtils.ts`
- `electron/main.ts`

结论：

- 当前项目仍保留较多调试痕迹
- 建议后续区分开发日志与正式错误日志

---

### 3.8 包体偏大

构建结果显示：

- `dist/assets/index-*.js` 约 **902.85 kB**

可能原因：

- 法术库全量静态导入
- 物品库全量静态导入
- Library / Spellbook 等模块未做动态拆分

建议：

- 评估动态导入和 `manualChunks`
- 对数据量较大的模块进行按需拆分

---

## 4. 当前健康度评分（主观评估）

- 架构清晰度：**7 / 10**
- 工程化程度：**4 / 10**
- 类型安全：**4 / 10**
- 持久化设计：**5 / 10**
- 可维护性趋势：**6 / 10**
- 综合代码健康度：**5.5 / 10**

解释：

> 当前项目已经脱离“纯 Demo”阶段，但距离“稳定、长期可维护的桌面项目”还有一轮系统治理工作。

---

## 5. 版本推进规则（重构专项）

为配合本轮代码健康治理，重构专项版本号统一进入 **`0.11.x`** 轨道，并采用以下规则：

- `0.11.0`：重构专项起始版本
- `0.11.1`：Phase 1 完成
- `0.11.2`：Phase 2 完成
- `0.11.3`：Phase 3 完成
- `0.11.4`：Phase 4 完成
- `0.11.5`：Phase 5 完成
- `0.11.6`：Phase 6 完成

当前执行口径：
- 由于 **Phase 1** 与 **Phase 2** 已完成，当前重构基线版本提升为 **`0.11.2`**
- 后续每完成一个 Phase，`x` 自动加一，并同步更新：
  - `package.json`
  - `CODE_HEALTH_PLAN.md`
  - `UPDATE_LOG.md`

维护要求：
- Phase 完成时必须补一条正式更新记录
- 若某个 Phase 仍处于进行中，不提前推进到下一个 `0.11.x`
- 若期间有功能性热修复，可单独记录，但不改变本轮 Phase 版本推进规则

## 5. 治理目标

本专项计划的目标不是一次性“重写项目”，而是：

1. 建立最小工程护栏
2. 收敛数据模型
3. 降低类型风险
4. 稳定持久化与 Electron 侧行为
5. 控制后续扩展成本
6. 为未来测试体系铺路

---

## 6. 分阶段任务计划

---

### Phase 1：建立工程护栏

目标：**先让问题更容易被发现**

阶段版本：**`0.11.1`**
当前状态：**已完成**

#### 任务 1.1 添加基础脚本
- [x] 新增 `typecheck` 脚本
- [x] 新增 `lint` 脚本
- [x] 新增 `format` 脚本
- [x] 在 README 中补充开发检查命令

关联文件：
- `package.json`
- `README.md`

验收标准：
- [x] 本地可运行 `npm run typecheck`
- [x] 本地可运行 `npm run lint`
- [x] 本地可运行 `npm run format`

完成说明：
- 已在 `package.json` 中补充 `typecheck / lint / lint:fix / format / format:check`
- README 已补充开发检查命令、提交前建议命令与工程质量说明
- 当前验证结果：`npm run typecheck` 通过，`npm run lint` 通过

#### 任务 1.2 引入 ESLint + Prettier
- [x] 配置 Vue 3 + TypeScript 的 ESLint
- [x] 配置 Prettier
- [x] 统一项目代码风格

关联文件：
- `eslint.config.*`
- `.prettierrc.*`
- `package.json`

验收标准：
- [x] 项目存在统一风格配置
- [x] 常见格式问题能被自动修复
- [x] 无需继续依赖人工维持基础风格一致性

完成说明：
- 已引入 ESLint 9、`typescript-eslint`、`eslint-plugin-vue`、`eslint-config-prettier`
- 已引入 Prettier，并形成 `format / format:check` 工作流
- 已完成一轮集中治理，历史 lint warning 从 116 条下降到 0

#### 任务 1.3 建立最小 CI
- [x] 新增 GitHub Actions 工作流
- [x] 自动执行安装、类型检查、构建

关联文件：
- `.github/workflows/*.yml`

验收标准：
- [x] push / PR 后自动执行检查
- [x] 类型错误或构建失败可被 CI 阻断

完成说明：
- 已新增 `.github/workflows/ci.yml`
- CI 当前执行：`npm ci`、`npm run typecheck`、`npm run lint`、`npm run build`
- 触发范围包含 `push` 与 `pull_request`

**Phase 1 明确成果**：
- 项目已建立最小工程护栏：本地检查、格式化、静态检查、类型检查、最小 CI 全部可用
- 工程质量从“主要依赖人工检查”升级为“本地 + CI 双重校验”
- 在护栏建立过程中完成了首轮类型与风格治理，当前仓库状态为：
  - `npm run typecheck` ✅
  - `npm run lint` ✅
  - lint warning：**0**
  - 类型/风格基础链路已可持续维护

---

### Phase 2：收敛数据模型

目标：**把运行时补丁变成明确的数据规范**

阶段版本：**`0.11.2`**
当前状态：**已完成**

**Phase 2 明确成果**：
- 项目已建立统一的 `characterMigration` 入口，角色数据进入 store / activeSheet 前先完成规范化
- 生命骰模型已统一收敛到 `combat.hitDice`，旧字段兼容逻辑仅保留在 migration 层
- 生命骰状态更新职责已下沉到 store，组件层不再直接承担数据结构修补
- `Character` 与 `CharacterSpells` 的关键边界已收紧，一批运行时补丁已被 migration + 类型契约取代
- 已完成旧存档、切换角色、重启应用、多职业生命骰等关键链路验收

#### 任务 2.1 建立统一 migration 层
- [x] 新建 `characterMigration` 模块
- [x] 统一旧存档清洗、补全、升级逻辑
- [x] 避免在 `activeSheet.ts` 中散落补丁

建议新增文件：
- `src/utils/characterMigration.ts`

关联文件：
- `src/stores/characterStore.ts`
- `src/stores/activeSheet.ts`
- `src/types/Character.ts`

验收标准：
- [x] 角色数据进入 store 前先完成规范化
- [x] 旧数据兼容逻辑集中维护
- [x] `activeSheet.ts` 中不再承担大量迁移职责

完成说明：
- 已新增 `src/utils/characterMigration.ts`
- 已建立统一入口：`normalizeCharacterData(raw)` 与 `createDefaultCharacter(id)`
- `characterStore.ts` 的 `init / createNewCharacter / saveCharacterData / importCharacter` 已统一接入规范化流程
- `activeSheet.ts` 的 `loadCharacter()` 已不再散落字段补丁，改为统一调用 migration

#### 任务 2.2 清理生命骰模型
- [x] 全面审计生命骰结构使用点
- [x] 正式废弃旧字段 `hitDiceType / hitDiceCurrent / hitDiceMax`
- [x] 全项目统一使用 `combat.hitDice`
- [x] 复核保存、加载、UI 编辑、迁移是否一致

关联文件：
- `src/components/sheet/combat/CombatPanel.vue`
- `src/stores/sheet/useCombatLogic.ts`
- `src/stores/characterStore.ts`
- `src/stores/activeSheet.ts`
- `src/types/Character.ts`

验收标准：
- [x] 修改生命骰后切换角色 / 重启应用数据仍正确
- [x] 兼职角色多生命骰结构稳定
- [x] 旧存档导入后会自动转换到统一格式

完成说明：
- 旧字段 `hitDiceType / hitDiceCurrent / hitDiceMax` 已在 migration 中统一转换到 `combat.hitDice`
- 已在 `src/types/Character.ts` 中抽出 `HitDieEntry / HitDiceMap`，明确生命骰正式结构
- `CombatPanel.vue` 不再通过组件层深拷贝直接写回生命骰对象
- `useCombatLogic.ts` 已下沉生命骰更新逻辑，新增 `changeHitDiceCurrent()` 与 `setHitDiceMax()`
- 已完成旧存档导入、切换角色、重启应用、多职业生命骰显示与保存的回归验收

#### 任务 2.3 补强 Character 类型定义
- [x] 清理 `CharacterMeta.classes: any[]`
- [x] 为 spells 扩展字段补正式类型
- [x] 为可选字段建立明确策略

关联文件：
- `src/types/Character.ts`
- `src/stores/characterStore.ts`
- `src/stores/activeSheet.ts`

验收标准：
- [x] 核心角色结构不再依赖模糊数组或任意对象
- [x] 存档结构定义更稳定、可读

完成说明：
- `CharacterMeta.classes` 已明确为 `CharacterClassRecord[]`
- `Character.ts` 已补充 `HitDieEntry / HitDiceMap`
- `CharacterSpells.pactSlots` 与 `CharacterSpells.spellSources` 已提升为必填字段
- 一批 `wallet / spells / proficiencies / hiddenAttacks / activeAttackModes / savingThrows` 的运行时兜底已移除，改由 migration + 类型契约共同保证

---

### Phase 3：提升类型安全

目标：**减少 any 和 ts-ignore 对核心逻辑的侵蚀**

阶段版本：**`0.11.3`**
当前状态：**已完成**

#### 任务 3.1 消除组件层 `@ts-ignore`
优先目标：
- [x] `src/components/sheet/bio/StatsAndSkills.vue`
- [x] `src/components/sheet/bio/BioPanel.vue`
- [x] `src/components/sheet/combat/ActionsPanel.vue`

验收标准：
- [x] 上述文件不再依赖 `@ts-ignore`
- [x] 组件调用 store 的接口具备明确类型

完成说明：
- 已为 `StatsAndSkills.vue` 收紧 `AbilityScores`、豁免计算与技能分组类型
- 已为 `BioPanel.vue` 明确 `bio` 的 `computed<CharacterBio | null>` 边界
- 已为 `ActionsPanel.vue` 复用 `AttackEntry` 正式类型，并收紧攻击列表与角色引用访问

#### 任务 3.2 替换核心模块中的高频 `any`
优先目标：
- [x] `src/stores/sheet/useCombatLogic.ts`
- [x] `src/stores/sheet/useInventoryLogic.ts`
- [x] `src/stores/sheet/useBioLogic.ts`
- [x] `src/stores/sheet/useSpellLogic.ts`
- [x] `src/composables/useForge.ts`

具体目标：
- [x] 为攻击项建立正式类型
- [x] 为 hitDice 建立正式类型
- [x] 为 Forge payload 建立联合类型
- [x] 为拖拽 payload 建立类型

验收标准：
- [x] 关键逻辑模块中的 `any` 数量明显下降
- [x] IDE 可提供更可靠的类型提示

完成说明（当前进展）：
- `useCombatLogic.ts` 已导出 `AttackEntry`，组件层可直接复用正式攻击项类型
- `useInventoryLogic.ts` 已为钱包、容器物品、重量计算与背包操作补充显式类型，并收紧内部 helper 语义
- `useSpellLogic.ts` 已为法术来源、配置项、法术解析 helper 与法术位更新逻辑建立明确类型边界
- `useBioLogic.ts` 已为技能摘要、熟练项分类、职业等级分配与字段更新接口建立正式类型
- `useForge.ts` 已为草稿数据、拖拽 payload、价格结构建立显式类型，并移除 `ForgeModal.vue` 中一批 `(draftData as any)`
- `inventoryDropUtils.ts` 已统一定义拖拽元素、拖拽 payload、解析入口与类型守卫
- `InventoryPanel.vue`、`InventoryItemRow.vue`、`ForgeDropZone.vue`、`LibraryItemsPanel.vue` 已接入正式拖拽类型链路
- `activeSheet.ts` 已补充 Facade UI 状态类型，并统一 `characterStore` 依赖注入与基础动作边界

#### 任务 3.3 统一入口语言栈
- [x] 将 `src/main.js` 迁移为 `src/main.ts`
- [x] 保证项目入口与整体 TS 方案一致

关联文件：
- `src/main.js`
- `src/main.ts`
- `tsconfig.json`

验收标准：
- [x] 前端入口为 TypeScript
- [x] 全局类型与 Electron API 类型调用更一致

完成说明：
- 已新增 `src/main.ts` 作为前端唯一入口
- `index.html` 已改为加载 `/src/main.ts`
- 已补充入口样式导入与全局指令注册，保持运行时行为与原入口一致

---

### Phase 4：稳定 Electron 与持久化层

目标：**让桌面应用的数据保存行为更稳健**

阶段版本：**`0.11.4`**

当前执行策略：**先路径、再类型、后分层**

执行顺序建议：
1. **4.1 存档路径迁移到 `app.getPath('userData')`**
2. **4.2 统一 IPC 类型**
3. **4.3 抽象持久化服务层**

阶段原则：
- 先解决高风险的桌面端数据落盘位置问题
- 再统一主进程 / preload / 渲染进程之间的类型契约
- 最后再把 store 中的 IO 细节逐步抽离，避免一次性大重构

#### 任务 4.1 使用 `app.getPath('userData')`
- [ ] 将角色存档目录迁移到用户数据目录
- [ ] 将窗口配置文件迁移到用户数据目录
- [ ] 设计旧目录迁移 / 兼容策略

关联文件：
- `electron/main.ts`

验收标准：
- 存档路径不再依赖 `process.cwd()`
- 安装版 / 开发版的保存行为更一致
- 旧用户数据有迁移或兼容方案

实施计划：
- [ ] 审计 `electron/main.ts` 中所有基于 `process.cwd()` 的路径使用点
- [ ] 为存档目录与窗口配置路径建立统一 helper（如 `getSavesDir()`、`getWindowConfigPath()`）
- [ ] 将角色存档默认写入 `app.getPath('userData')/saves`
- [ ] 将窗口配置默认写入 `app.getPath('userData')/window-config.json`
- [ ] 加入旧路径兼容读取逻辑
- [ ] 在“新路径为空 + 旧路径存在”时执行一次性复制迁移
- [ ] 第一轮迁移中不主动删除旧路径数据，降低用户数据风险
- [ ] 完成开发环境、旧存档环境、重启恢复场景的手工验收

推荐策略：
- 读取时优先新路径
- 新路径为空时回退读取旧路径
- 写入时统一落到新路径
- 复制成功后继续保留旧文件，后续版本再考虑清理

#### 任务 4.2 统一 IPC 类型
- [ ] 为 IPC 返回结构建立统一类型
- [ ] preload 暴露的 API 不再大量使用 `any`
- [ ] 渲染进程调用获得更稳定的类型约束

关联文件：
- `electron/preload.ts`
- `electron/main.ts`
- `src/vite-env.d.ts`

验收标准：
- `window.electronAPI` 定义更明确
- 常用 IPC 的返回值具备统一格式与类型

实施计划：
- [ ] 为 IPC 建立统一返回结构（如 `IpcResult<T>`）
- [ ] 为 `loadAllCharacters / saveCharacter / deleteCharacter` 等方法建立正式返回类型
- [ ] 在 `electron/preload.ts` 中为暴露 API 建正式接口
- [ ] 在 `src/vite-env.d.ts` 中将 `window.electronAPI` 收紧为统一接口
- [ ] 清理渲染进程中依赖宽泛返回值的调用写法
- [ ] 验证主进程实现、preload 暴露与渲染进程消费三侧结构一致

推荐策略：
- 成功统一为 `{ success: true, data }`
- 失败统一为 `{ success: false, error }`
- 共享类型尽量放在前后端都可引用的位置，避免重复定义

#### 任务 4.3 抽象持久化服务层
- [ ] 将 store 中对 `window.electronAPI` 的直接调用抽离
- [ ] 建立 `storageService` 或 `characterRepository`

建议新增文件：
- `src/services/storageService.ts`
- 或 `src/repositories/characterRepository.ts`

关联文件：
- `src/stores/characterStore.ts`
- `src/stores/activeSheet.ts`

验收标准：
- Store 不直接承担太多底层 IO 细节
- 后续更易扩展到其他持久化方案

实施计划：
- [ ] 新建 `src/services/storageService.ts`（或后续演进为 repository）
- [ ] 先封装角色读取、保存、删除三条核心 IO 路径
- [ ] 让 `characterStore.ts` 优先改为调用 service，而不是直接调用 `window.electronAPI`
- [ ] 后续再迁移窗口配置等非核心路径
- [ ] 保持第一轮抽象最小化，不一次性搬空所有存储逻辑

推荐策略：
- 第一轮先采用 `storageService` 小步抽象
- 等路径和 IPC 约定稳定后，再评估是否进一步升级为 `characterRepository`

---

### Phase 5：性能与可维护性优化

目标：**减少未来扩展成本**

阶段版本：**`0.11.5`**

#### 任务 5.1 控制首包体积
- [ ] 评估法术库的动态拆分
- [ ] 评估物品库的模块化拆分
- [ ] 评估 Spellbook / Library 面板懒加载
- [ ] 配置 `manualChunks`

关联文件：
- `vite.config.js`
- `src/data/spells/*.ts`
- `src/data/libraries/*.ts`
- `src/components/sheet/spellbook/*.vue`
- `src/components/sheet/library/*.vue`

验收标准：
- 首包体积下降
- 构建警告得到缓解或消除
- 新增法术 / 物品数据后增长更可控

#### 任务 5.2 清理调试日志
- [ ] 区分开发调试日志和正式错误日志
- [ ] 清理无意义 `console.log`
- [ ] 保留必要错误日志并统一风格

关联文件：
- `src/composables/useForge.ts`
- `src/stores/characterStore.ts`
- `src/App.vue`
- `src/utils/inventoryDropUtils.ts`
- `electron/main.ts`

验收标准：
- 控制台输出明显收敛
- 关键错误仍可追踪
- 无大量开发残留日志污染生产环境

#### 任务 5.3 替换 `alert / confirm`
- [ ] 用统一 Modal / Toast 机制替换浏览器原生弹窗
- [ ] 统一用户反馈体验

关联文件：
- `src/components/layout/SidebarLeft.vue`
- `src/components/**`
- `src/stores/**`

验收标准：
- 用户确认、错误提示、保存反馈风格统一
- Electron 桌面体验更一致

---

### Phase 6：补测试

目标：**防止规则逻辑和存档逻辑反复回归**

阶段版本：**`0.11.6`**

#### 任务 6.1 补纯逻辑测试
优先测试点：
- [ ] AC 计算
- [ ] 生命骰迁移
- [ ] 攻击面板生成
- [ ] 负重计算
- [ ] 法术分组与法术位逻辑

建议涉及文件：
- `src/stores/sheet/useCombatLogic.ts`
- `src/stores/sheet/useInventoryLogic.ts`
- `src/stores/sheet/useSpellLogic.ts`
- `src/utils/characterMigration.ts`

验收标准：
- 关键纯逻辑具备最小回归保护
- 后续重构时能快速发现计算回归

#### 任务 6.2 补关键存档流程测试
优先测试点：
- [ ] 导入旧角色
- [ ] 编辑后保存
- [ ] 重启后重新读取
- [ ] 删除角色
- [ ] 导出角色

验收标准：
- 核心存档路径具备最小验证闭环
- 关键数据不会因重构而静默损坏

---

## 7. 推荐优先级排序

### 第一轮：先修高风险结构问题
1. [x] 建立 `typecheck / lint`
2. [x] 建立统一 migration 层
3. [x] 收敛生命骰模型
4. [x] 去掉组件层 `@ts-ignore`

### 第二轮：再做类型与持久化
5. [x] 逐步替换核心模块 `any`
6. [x] `src/main.js -> src/main.ts`
7. [ ] 存档目录迁移到 `app.getPath('userData')`
8. [ ] 统一 IPC 类型

### 第三轮：最后处理长期维护项
9. 包体拆分
10. 调试日志治理
11. 替换 `alert / confirm`
12. 补关键测试

---

## 8. 建议立即立项的 8 个任务

以下任务建议优先纳入近期版本：

- [x] 建立 `typecheck` 脚本
- [x] 建立 `lint` 脚本
- [x] 建立统一 `characterMigration` 模块
- [x] 完整梳理并收敛 `hitDice` 数据模型
- [x] 去掉 `StatsAndSkills.vue` / `BioPanel.vue` / `ActionsPanel.vue` 中的 `@ts-ignore`
- [x] 给 `useCombatLogic.ts` 的攻击项建立正式类型
- [ ] 将 Electron 存档目录迁移到 `app.getPath('userData')`
- [ ] 为 AC / 生命骰 / 负重 / 法术位补最小单元测试

---

## 9. 管理建议

为了让这份计划真正可执行，建议采用以下方式维护：

1. **健康度任务单独管理**
   - 功能需求放 `TODOLIST.md`
   - 工程治理放 `CODE_HEALTH_PLAN.md`

2. **每完成一项治理任务，写入 `UPDATE_LOG.md`**
   - 记录改了什么
   - 记录为什么改
   - 记录是否影响旧存档兼容

3. **为高风险结构改动补验收说明**
   - 尤其是：存档结构、生命骰、法术结构、Electron 存档路径

4. **不要一次性大重构**
   - 建议按 Phase 分批推进
   - 每一轮都保持“可构建、可运行、可回退”

---

## 10. 下一步建议

推荐下一步从以下方向开始：

### 当前建议 A：进入 Phase 4
- 先完成 `app.getPath('userData')` 存档路径迁移
- 再统一 Electron IPC 类型
- 最后抽离最小 `storageService`

### 当前建议 B：准备最小测试保护
- 为 AC、生命骰迁移、负重、法术位补最小单元测试
- 为旧存档导入与保存链路补最小回归验证

> 建议实际执行顺序：**先完成 Phase 4.1 与 4.2，再补测试**。

---

## 11. 结语

这份文档的核心目标不是“证明代码不好”，而是帮助项目从：

- 能跑
- 能扩功能

逐步走向：

- 可验证
- 可维护
- 可长期迭代

当前项目已经具备不错的业务拆分基础，只要把工程护栏、数据模型和类型安全补齐，整体质量会有明显提升。
