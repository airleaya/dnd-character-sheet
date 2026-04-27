# CODE_HEALTH_PLAN

> 用途：记录当前项目的代码健康度评估结果，以及后续的治理计划。  
> 与其他文档的区别：
> - `TODOLIST.md`：记录功能问题与待办事项
> - `UPDATE_LOG.md`：记录已经完成的修复与更新
> - `CODE_HEALTH_PLAN.md`：记录**工程质量、结构治理、技术债清理**的专项计划

评估基线版本：`0.11.5`  
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

为配合本轮代码健康治理，重构专项版本号统一进入 **`0.11.x-phase.y`** 轨道，并采用以下规则：

- `0.11.x`：本轮重构专项主线版本，`x` 表示当前所处 Phase 编号
- `-phase.y`：当前 Phase 内的进行中迭代号
- **不带 `-phase.y` 的版本**：表示该 Phase 已完成并形成阶段性稳定点

执行口径：
- **一旦正式进入某个 Phase，先切换到 `0.11.x-phase.0`**
- **在该 Phase 内每发生一次可独立记录的推进，`y` 递增**
- **Phase 完成本身回收为不带预发布标记的 `0.11.x`**
- **`package.json` 必须保持 SemVer 兼容，避免 Electron 打包器拒绝版本号**

推荐示例：
- `0.11.1-phase.0`：进入 Phase 1
- `0.11.1-phase.1`：Phase 1 中的首个可记录推进
- `0.11.1`：Phase 1 完成
- `0.11.2-phase.0`：进入 Phase 2
- `0.11.2-phase.1`：Phase 2 中的推进
- `0.11.2`：Phase 2 完成
- `0.11.3-phase.0`：进入 Phase 3
- `0.11.3-phase.1`：Phase 3 中的推进
- `0.11.3`：Phase 3 完成
- `0.11.4-phase.0`：进入 Phase 4
- `0.11.4-phase.1`：Phase 4 当前首个已记录推进
- `0.11.4-phase.2`：Phase 4 第二个已记录推进（IPC 类型统一）
- `0.11.4-phase.3`：Phase 4 第三个已记录推进（最小 `storageService` 抽象）
- `0.11.4-phase.4`：Phase 4 第四个已记录推进（版本规则改为 SemVer 兼容）
- `0.11.4-phase.5`：Phase 4 第五个已记录推进（补存档迁移回归脚本）

当前执行口径：
- 项目已完成 Phase 3，并已正式进入 **Phase 4**
- 项目已完成 **Phase 4**，并已正式进入 **Phase 5**
- 项目已完成 **Phase 5**，稳定结项版本为 **`0.11.5`**
- 项目已完成 **Phase 6**，稳定结项版本为 **`0.11.6`**
- 项目已完成 **Phase 7**，稳定结项版本为 **`0.11.7`**
- 本轮“代码健全专项”已正式归档，不再继续按 `Phase 8+` 的重构节奏推进
- `CODE_HEALTH_PLAN.md` 现作为本专项的历史档案与后续高风险治理参考
- 后续工作主轴切换为系统功能开发；仅当涉及兼容策略、工程护栏、测试基线或架构治理时，再回写本文件

维护要求：
- 进入新 Phase 时必须先更新版本号中的 `x`
- 同一 Phase 内每次明确推进都要评估是否递增 `y`
- 文档中的阶段状态与版本号必须保持一致
- 若涉及存档结构、路径迁移、IPC 协议等高风险改动，必须补充兼容策略说明

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

阶段版本：**`0.11.1.y`**
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

阶段版本：**`0.11.2.y`**
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

阶段版本：**`0.11.3.y`**
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

阶段版本：**`0.11.4-phase.y`**
当前状态：**已完成（结项版本：`0.11.4`）**

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
- [x] 将角色存档目录迁移到用户数据目录
- [x] 将窗口配置文件迁移到用户数据目录
- [x] 设计旧目录迁移 / 兼容策略

关联文件：
- `electron/main.ts`

验收标准：
- 存档路径不再依赖 `process.cwd()`
- 安装版 / 开发版的保存行为更一致
- 旧用户数据有迁移或兼容方案

实施计划：
- [x] 审计 `electron/main.ts` 中所有基于 `process.cwd()` 的路径使用点
- [x] 为存档目录与窗口配置路径建立统一 helper（如 `getSavesDir()`、`getWindowConfigPath()`）
- [x] 将角色存档默认写入 `app.getPath('userData')/saves`
- [x] 将窗口配置默认写入 `app.getPath('userData')/window-config.json`
- [x] 加入旧路径兼容读取逻辑
- [x] 在“新路径为空 + 旧路径存在”时执行一次性复制迁移
- [x] 第一轮迁移中不主动删除旧路径数据，降低用户数据风险
- [x] 补充最小文件系统回归脚本，覆盖迁移与兼容读取的关键契约
- [x] 完成开发环境、旧存档环境、重启恢复场景的手工验收

建议手工验收清单：
1. 在旧路径 `./saves` 放入一个可识别的历史角色，启动开发环境并确认角色能自动出现。
2. 修改该角色任意字段并触发保存，确认新文件落到 `app.getPath('userData')/saves`，且旧文件仍保留。
3. 关闭并重新启动应用，确认角色仍从新路径正常读取，窗口大小与位置也能恢复。
4. 删除该角色并确认新路径中的目标文件被移除，不影响其他角色。
5. 执行一次导出，确认导出链路不受新存档路径切换影响。

推荐策略：
- 读取时优先新路径
- 新路径为空时回退读取旧路径
- 写入时统一落到新路径
- 复制成功后继续保留旧文件，后续版本再考虑清理

#### 任务 4.2 统一 IPC 类型
- [x] 为 IPC 返回结构建立统一类型
- [x] preload 暴露的 API 不再大量使用 `any`
- [x] 渲染进程调用获得更稳定的类型约束

关联文件：
- `electron/preload.ts`
- `electron/main.ts`
- `src/vite-env.d.ts`

验收标准：
- `window.electronAPI` 定义更明确
- 常用 IPC 的返回值具备统一格式与类型

实施计划：
- [x] 为 IPC 建立统一返回结构（如 `IpcResult<T>`）
- [x] 为 `loadAllCharacters / saveCharacter / deleteCharacter` 等方法建立正式返回类型
- [x] 在 `electron/preload.ts` 中为暴露 API 建正式接口
- [x] 在 `src/vite-env.d.ts` 中将 `window.electronAPI` 收紧为统一接口
- [x] 清理渲染进程中依赖宽泛返回值的调用写法
- [x] 验证主进程实现、preload 暴露与渲染进程消费三侧结构一致

推荐策略：
- 成功统一为 `{ success: true, data }`
- 失败统一为 `{ success: false, error }`
- 共享类型尽量放在前后端都可引用的位置，避免重复定义

#### 任务 4.3 抽象持久化服务层
- [x] 将 store 中对 `window.electronAPI` 的直接调用抽离
- [x] 建立 `storageService` 或 `characterRepository`

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
- [x] 新建 `src/services/storageService.ts`（或后续演进为 repository）
- [x] 先封装角色读取、保存、删除三条核心 IO 路径
- [x] 让 `characterStore.ts` 优先改为调用 service，而不是直接调用 `window.electronAPI`
- [ ] 后续再迁移窗口配置等非核心路径
- [x] 保持第一轮抽象最小化，不一次性搬空所有存储逻辑

推荐策略：
- 第一轮先采用 `storageService` 小步抽象
- 等路径和 IPC 约定稳定后，再评估是否进一步升级为 `characterRepository`

---

### Phase 5：性能与可维护性优化

目标：**减少未来扩展成本**

阶段版本：**`0.11.5.y`**
当前状态：**已完成（结项版本：`0.11.5`）**

当前执行策略：**先拆首包，再收日志，最后统一交互反馈**

执行顺序建议：
1. **5.1 先解决构建已暴露的首包过大 warning**
2. **5.2 再收敛调试日志，减少运行期噪音**
3. **5.3 最后替换原生弹窗，统一桌面体验**

阶段原则：
- 优先处理已经在构建或运行期明确暴露的问题
- 优先做低风险、高收益、可量化验收的改动
- 保持每个子任务都能独立验证，不把性能、日志、交互体验混成一次性大改
- 避免为了“看起来更整洁”而做大范围无验收支撑的重构

#### 任务 5.1 控制首包体积
- [x] 评估法术库的动态拆分
- [x] 评估物品库的模块化拆分
- [x] 评估 Spellbook / Library 面板懒加载
- [x] 配置 `manualChunks`

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

实施计划：
- [x] 基线记录当前 `vite build` 的产物体积与 chunk warning
- [x] 确认首包主要由法术数据、物品数据还是界面面板共同推高
- [x] 先尝试对 Spellbook / Library 相关面板做懒加载切分
- [x] 再评估法术库 / 物品库是否适合按模块或使用场景拆分
- [x] 在 `vite.config.js` 中补充最小 `manualChunks` 策略
- [x] 对比优化前后的构建结果，补一条正式记录

推荐策略：
- 先做最容易回收收益的路由外或面板级拆分
- 先减少“初次必载”的数据量，再考虑更细粒度的数据模块切分
- `manualChunks` 只做能解释清楚的最小配置，避免过度切包
- 每次切分后都保留体积前后对比，避免“感觉优化了但实际没有”

完成说明（当前进展）：
- 已将 `SpellbookPanel` 改为首次打开后才异步加载，避免法术书 UI 直接进入主入口 chunk
- 已将右侧 `LibraryItemsPanel` / `LibrarySpellsPanel` 改为异步组件，其中法术库仅在切换到法术标签后再加载
- 已在 `vite.config.js` 中按 `vendor-vue / vendor-dnd / spell-data / library-data / spellbook-ui / library-ui` 建立最小 `manualChunks`
- 构建结果已从单一主入口 `index-*.js 904.12 kB` 拆分为多个更清晰的 chunk，其中主入口 `index-*.js` 降至 `81.33 kB`
- 当前 `vite build` 已不再出现 `Some chunks are larger than 500 kB after minification` 的警告

#### 任务 5.2 清理调试日志
- [x] 区分开发调试日志和正式错误日志
- [x] 清理无意义 `console.log`
- [x] 保留必要错误日志并统一风格

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

实施计划：
- [x] 盘点当前主进程、store、组合式逻辑中的 `console.log / warn / error`
- [x] 区分“开发调试信息”“用户可恢复错误”“真正异常”
- [x] 删除无意义调试日志
- [x] 为保留日志统一前缀与输出级别
- [x] 确认打包后的生产链路不再输出大量开发残留日志

推荐策略：
- 默认删除一次性调试日志，而不是保留后再慢慢清
- `console.error` 只保留真正会帮助定位问题的上下文
- 如果某些日志只在开发环境有价值，显式加开发环境保护
- 先治理高频触发路径，再处理低频边角日志

完成说明（当前进展）：
- 已清理 `App` 关闭保存链路、`characterStore` 初始化/旧文件清理链路、`useForge` 拖拽处理链路、`inventoryDropUtils` 拖拽工具链、`electron/main.ts` 成功路径中的开发残留 `console.log`
- 已将保留的错误日志统一收敛为带模块前缀的写法，如 `[forge]`、`[characterStore]`、`[sidebar-left]`、`[electron/main]`
- 已移除批量导入完成、批量导入为零、导出兜底等仅用于开发确认的控制台提示，避免生产环境持续输出噪音
- 当前仍保留少量具备定位价值的 `warn / error`，后续可在第二轮继续评估是否需要改为 UI 反馈或开发环境限定输出

#### 任务 5.3 替换 `alert / confirm`
- [x] 用统一 Modal / Toast 机制替换浏览器原生弹窗
- [x] 统一用户反馈体验

关联文件：
- `src/components/layout/SidebarLeft.vue`
- `src/components/**`
- `src/stores/**`

验收标准：
- 用户确认、错误提示、保存反馈风格统一
- Electron 桌面体验更一致

实施计划：
- [x] 盘点当前项目中 `alert / confirm / prompt` 的使用点
- [x] 确认现有 UI 组件中是否已有可复用的 Modal / Toast 基础能力
- [x] 先替换删除确认、导入导出提示、保存反馈等高频交互
- [x] 为后续新增提示约定统一入口，避免继续直接调用原生弹窗
- [x] 回归验证关键交互链路，确认桌面体验一致且不阻断主要流程

推荐策略：
- 先解决最影响桌面体验的确认弹窗，再做信息提示美化
- 优先复用现有组件能力，避免为了替换弹窗额外引入一套重 UI 方案
- 确认交互文案与错误反馈语义同步收敛，不只换壳不改体验

完成说明（当前进展）：
- 已新增全局反馈层 `uiFeedback`，统一承载确认对话框与全局提示条
- 已在 `App` 根节点挂载 `GlobalFeedback`，让桌面端确认框与提示条不再依赖浏览器原生弹窗
- 已替换分组删除、角色删除、批量删除、XP 重置、长休、回满 HP、遗忘法术、Forge 未保存退出等高频确认交互
- 已将保存成功、导出失败、余额不足、批量导出完成等反馈改为全局 toast，减少阻塞式中断
- 当前项目中的运行时代码已不再直接依赖原生 `alert / confirm`，仅保留注释中的旧调试语句

**Phase 5 明确成果**：
- 已完成首包拆分、日志收敛与全局反馈统一三项既定目标，并形成稳定结项版本 `0.11.5`
- 当前交付状态以 `npm run typecheck`、`npm run lint`、`npm run build` 作为正式验收链路
- Phase 6 暂未开始，本次结项不纳入未完成的测试脚手架，避免把规划中的工作混入稳定版本

---

### Phase 6：补测试

目标：**防止规则逻辑和存档逻辑反复回归**

阶段版本：**`0.11.6.y`**
当前状态：**已完成（结项版本：`0.11.6`）**

当前执行策略：**先测试基座，再纯逻辑，最后补关键存档流程**

#### 任务 6.1 补纯逻辑测试
优先测试点：
- [x] AC 计算
- [x] 生命骰迁移
- [x] 攻击面板生成
- [x] 负重计算
- [x] 法术分组与法术位逻辑

建议涉及文件：
- `src/stores/sheet/useCombatLogic.ts`
- `src/stores/sheet/useInventoryLogic.ts`
- `src/stores/sheet/useSpellLogic.ts`
- `src/utils/characterMigration.ts`

验收标准：
- 关键纯逻辑具备最小回归保护
- 后续重构时能快速发现计算回归

实施计划：
- [x] 引入最小 `Vitest` 测试基座
- [x] 恢复 `test / test:watch` 脚本，并限定首轮只覆盖纯逻辑模块
- [x] 为 `characterMigration`、`useCombatLogic`、`useInventoryLogic` 建立首批回归测试
- [x] 继续补 `useSpellLogic` 与攻击面板生成相关测试

完成说明（当前进展）：
- 已重新引入 `Vitest`，并在 `vite.config.js` 中建立 `node` 环境的最小测试配置
- 已补上 `characterMigration`、`useCombatLogic`、`useInventoryLogic`、`useSpellLogic` 四组测试，优先覆盖生命骰迁移、AC 计算、攻击面板生成、法术分组与法术位恢复、负重统计、货币换算与箭矢入包等高风险逻辑
- 当前 Phase 6 起步版本聚焦“先让关键逻辑可回归验证”，暂不把 UI 交互或 Electron 行为混入同一轮测试范围

#### 任务 6.2 补关键存档流程测试
优先测试点：
- [x] 导入旧角色
- [x] 编辑后保存
- [x] 重启后重新读取
- [x] 删除角色
- [x] 导出角色

验收标准：
- 核心存档路径具备最小验证闭环
- 关键数据不会因重构而静默损坏

实施计划：
- [x] 使用 mock 存储层隔离 Electron，聚焦 `characterStore` 的存档流程契约
- [x] 为保存、重载、导入、删除、导出建立最小回归测试
- [x] 验证分组引用、文件名策略与旧存档规范化在存档流程中保持正确

完成说明（当前进展）：
- 已新增 `characterStore` 存档流程测试，通过 mock `window.electronAPI` 模拟持久化层，覆盖保存后重载、旧角色导入、角色删除、导出命名与分组引用清理
- 当前 Phase 6.2 已形成最小验证闭环：关键纯逻辑之外，核心存档流程也具备了基础回归保护

**Phase 6 明确成果**：
- 已正式建立 `Vitest` 测试基座，并恢复 `test / test:watch` 作为工程内常规校验入口
- 已为迁移、战斗、背包、法术与存档流程补上最小回归保护，当前共形成 5 组测试文件与 16 条测试用例
- 当前交付状态以 `npm run test`、`npm run typecheck`、`npm run lint`、`npm run build` 作为 Phase 6 正式验收链路

---

### Phase 7：集成验证与测试工程化

目标：**把已有测试真正接进工程链路，并继续压实 Electron 边界契约**

阶段版本：**`0.11.7.y`**
当前状态：**已完成（结项版本：`0.11.7`）**

当前执行策略：**先接 CI，再补边界，最后看是否需要更高层集成验证**

#### 任务 7.1 将测试接入 CI
- [x] 让 GitHub Actions 正式执行 `npm run test`
- [x] 保持 `test / typecheck / lint / build` 成为同一条持续验收链

关联文件：
- `.github/workflows/ci.yml`
- `package.json`

验收标准：
- 现有测试不会只停留在本地命令层
- push / PR 时可以自动阻断明显回归

完成说明（当前进展）：
- 已在 GitHub Actions 中补入 `npm run test`
- 当前持续验收链路已收敛为 `npm ci -> npm run typecheck -> npm run lint -> npm run test -> npm run build`

#### 任务 7.2 补 Electron / IPC 边界验证
- [x] 为 `storageService` 失败分支与 Electron API 返回结构补测试
- [x] 验证主进程 / preload / renderer 之间的契约边界

建议涉及文件：
- `src/services/storageService.ts`
- `src/types/electron.ts`
- `electron/preload.ts`
- `electron/main.ts`

验收标准：
- 失败分支与边界契约不再只靠人工回归
- IPC 返回结构变化能被测试及时发现

完成说明（当前进展）：
- 已补上 `storageService` 的成功/失败分支测试，覆盖缺失 `electronAPI`、`load/save/delete` 失败返回等关键异常路径
- 已补上 `preload` 暴露契约测试，验证 `contextBridge.exposeInMainWorld` 暴露对象与 `ipcRenderer.invoke / on`、`webFrame.setZoomFactor` 的转发行为保持一致

#### 任务 7.3 补最小集成级回归
- [x] 创建角色 -> 保存 -> 重载 -> 删除 的端到端式 store 链路验证
- [x] 评估并补一个更接近桌面端的最小 smoke / UI 验证

验收标准：
- 关键主链路具备比单模块测试更贴近真实使用方式的保护
- 后续决定是否需要 UI / E2E 时有清晰基线

完成说明（当前进展）：
- 已补上 `characterStore + activeSheet` 的最小集成级回归测试，覆盖创建角色、加载编辑、保存、重载、删除的完整 store 链路
- 已补上 `GlobalFeedback` 的最小 UI smoke 测试，覆盖确认框渲染、主按钮确认、`Escape` 取消与 toast 自动消失
- 已补上 `App` 根壳级只读 smoke 测试，覆盖初始化触发、空态 / 已加载态壳子切换与法术书根层挂载边界
- 当前这轮验证仍刻意保持轻量，只借助 `@vue/test-utils + jsdom` 建立 UI 层基线，不引入更重的整页自动化或 E2E 成本

**Phase 7 明确成果**：
- 已将测试正式接入持续集成，并把 `test / typecheck / lint / build` 收敛为同一条工程验收链路
- 已为 Electron / IPC 边界、store 集成链路、全局反馈层与 `App` 根壳补上更高层的回归保护，当前共形成 10 组测试文件与 30 条测试用例
- 当前交付状态以 `npm run test`、`npm run typecheck`、`npm run lint`、`npm run build` 作为 Phase 7 正式验收链路

## 7. 专项归档与开发切换说明

至 `0.11.7` 为止，这一轮代码健全工作已经完成既定目标，现正式归档。

归档范围：
- Phase 1：工程护栏与最小 CI
- Phase 2：数据迁移与模型收敛
- Phase 3：类型安全与前端入口统一
- Phase 4：Electron / IPC / 存储层治理
- Phase 5：包体、日志与全局反馈体验优化
- Phase 6：逻辑与存档回归测试基座
- Phase 7：CI 测试接入、集成回归、最小 UI smoke 与 `App` 根壳 smoke

归档结论：
- 项目已从“主要依赖人工检查”推进到“本地 + CI + 回归测试”共同验收
- 当前稳定验收链路为 `npm run test`、`npm run typecheck`、`npm run lint`、`npm run build`
- 当前测试基线为 10 组测试文件、30 条测试用例
- 本专项已达到“可验证、可维护、可继续扩展功能”的目标，可以结束重构型推进

后续维护约定：
1. 项目默认进入**功能开发模式**，不再继续按本轮 `Phase 1-7` 节奏推进重构。
2. `CODE_HEALTH_PLAN.md` 后续只记录高风险治理事项，例如：存档结构调整、兼容策略、IPC 协议变化、测试基线扩展、工程护栏升级。
3. 功能需求、产品迭代、系统开发计划，不再写入本文件，应放入常规需求或开发计划文档。
4. 若未来再次发起专项治理，建议新开独立章节或新文档，而不是继续沿用本轮编号。

说明：
- 本节以下的“推荐优先级排序 / 立项建议 / 下一步建议”等内容保留为本专项推进过程中的历史记录，不再作为当前执行计划。
- 当前工作的默认口径已经从“为了稳住系统而重构”，切换为“在既有质量基线上继续开发系统”。

## 附录 A. 推荐优先级排序（历史记录）

### 第一轮：先修高风险结构问题
1. [x] 建立 `typecheck / lint`
2. [x] 建立统一 migration 层
3. [x] 收敛生命骰模型
4. [x] 去掉组件层 `@ts-ignore`

### 第二轮：再做类型与持久化
5. [x] 逐步替换核心模块 `any`
6. [x] `src/main.js -> src/main.ts`
7. [x] 存档目录迁移到 `app.getPath('userData')`
8. [x] 统一 IPC 类型

### 第三轮：最后处理长期维护项
9. 包体拆分
10. 调试日志治理
11. 替换 `alert / confirm`
12. 补关键测试

---

## 附录 B. 建议立即立项的 8 个任务（历史记录）

以下任务建议优先纳入近期版本：

- [x] 建立 `typecheck` 脚本
- [x] 建立 `lint` 脚本
- [x] 建立统一 `characterMigration` 模块
- [x] 完整梳理并收敛 `hitDice` 数据模型
- [x] 去掉 `StatsAndSkills.vue` / `BioPanel.vue` / `ActionsPanel.vue` 中的 `@ts-ignore`
- [x] 给 `useCombatLogic.ts` 的攻击项建立正式类型
- [x] 将 Electron 存档目录迁移到 `app.getPath('userData')`
- [ ] 为 AC / 生命骰 / 负重 / 法术位补最小单元测试

---

## 附录 C. 管理建议（历史记录）

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

## 附录 D. 下一步建议（历史记录）

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

## 附录 E. 结语（历史记录）

这份文档的核心目标不是“证明代码不好”，而是帮助项目从：

- 能跑
- 能扩功能

逐步走向：

- 可验证
- 可维护
- 可长期迭代

当前项目已经具备不错的业务拆分基础，只要把工程护栏、数据模型和类型安全补齐，整体质量会有明显提升。
