# ATTACK_PANEL_PLAN

## Implementation Status Snapshot - 2026-04-19

Current release target: `0.12.0`

Completed in code:
- positive-selection persistence via `selectedAttackKeys`
- compatibility migration from legacy `hiddenAttacks`
- `rawAttacks -> attackCatalog -> selectedAttacks` data flow
- floating attack picker modal with direct click select/deselect
- deduped candidate attack catalog while preserving distinct attack paths
- structured secondary-info tooltip shared by panel cards and picker cards
- tooltip viewport edge protection
- lightweight picker filter: `all / selected / unselected`

Verified:
- `npm run typecheck`
- `npm run test -- tests/actionsPanel.ui.test.ts tests/globalTooltip.ui.test.ts tests/useCombatLogic.test.ts`
- `npm run build`

Remaining follow-up scope for `0.12.x`:
- data completeness audit for ammo-related weapon metadata
- broader doc normalization / todo cleanup
- any future rule expansion should be discussed item by item after the current baseline is accepted

> 用途：记录 `0.12.x` 阶段“攻击面板改造”专项的设计结论、数据审计、分阶段计划、规则冻结结果与验收标准。  
> 与其他文档的区别：  
> - `TODOLIST.md`：记录当前未完成事项与优先级  
> - `UPDATE_LOG.md`：记录已经完成的修复与更新  
> - `ATTACK_PANEL_PLAN.md`：记录攻击面板专项从讨论到实施的工作基线

当前计划版本：`0.12.0`  
当前状态：`规则已确认，待实现拆解`  
默认负责人：**雪茸树**

---

## 1. 背景

当前攻击面板存在以下核心问题：

- 背包中的武器会被直接遍历并生成攻击项，导致展示结果过多且不稳定
- 当前模型是“默认全部显示，再手动隐藏”，不符合本次想要的“默认空面板，再手动添加”
- 面板中直接显示的字段与用户真正高频需要的战斗信息没有明确分层
- 候选攻击项缺少统一目录、稳定标识与去重规则

本次专项的目标，是把攻击面板从“被动生成列表”改造成“用户主动配置的战斗快捷栏”。

---

## 2. 已确认的设计方向

### 2.1 面板交互

- 攻击面板默认不展示任何普通攻击项
- 面板尾部固定保留一个虚拟攻击项：`添加攻击项`
- 用户点击该虚拟项后，打开攻击项选择浮窗
- 用户从浮窗中选择希望展示在攻击面板中的攻击项

### 2.2 信息分层

#### 主信息

- 攻击/武器名称
- 命中加值
- 伤害骰与伤害类型

#### 次要信息

- 武器属性
- 射程
- 弹药/消耗品数量
- 特殊豁免要求
- 附加效果/描述文本

### 2.3 适用范围

- 上述主信息/次要信息分层，不仅适用于攻击面板中的已选攻击项
- 也适用于攻击项选择浮窗中的候选攻击项

---

## 3. 当前实现审计

### 3.1 当前攻击面板行为

当前实现位于：

- `src/stores/sheet/useCombatLogic.ts`
- `src/components/sheet/combat/ActionsPanel.vue`

当前特征：

- 攻击列表由 `inventory` 中全部武器实例直接生成
- 当前持久化模型为 `hiddenAttacks`
- 当前 UI 支持“隐藏/恢复显示”，不支持“主动添加攻击项”
- 当前 UI 没有候选攻击浮窗，也没有虚拟的“添加攻击项”卡片

### 3.2 当前数据字段支撑情况

| 信息项 | 当前支撑度 | 数据来源 | 说明 |
| :--- | :--- | :--- | :--- |
| 名称 | 足够 | `InventoryItem.name` | 可直接读取 |
| 命中加值 | 足够 | `useCombatLogic.ts` 计算结果 | 武器/徒手已具备 |
| 伤害骰 | 足够 | `WeaponDefinition.damage` | 可直接读取 |
| 伤害类型 | 足够 | `WeaponDefinition.damageType` | 可直接读取 |
| 属性 | 足够 | `WeaponDefinition.properties` | 武器已明确 |
| 射程 | 足够 | `WeaponDefinition.range` | 可直接读取 |
| 弹药数量 | 部分足够 | `requiredAmmoType` + 背包统计 | 逻辑已有，但基础数据不完整 |
| 附加效果/描述 | 基本足够 | `specialEffect` / `description` | 武器有部分缺失 |
| 候选项稳定标识 | 不足 | 当前无专门字段 | 需要单独设计 `catalogKey` |
| 去重依据 | 不足 | 当前无专门字段 | 需要规则冻结后实现 |

### 3.3 已知数据缺口

- 当前 `Character` 仍使用 `hiddenAttacks`，不适合作为新模型核心字段
- 当前没有 `selectedAttackKeys` 或同等意义的正向选择字段
- 当前没有“候选攻击目录”层
- 部分需要弹药的武器未补齐 `requiredAmmoType`
- 当前未确认基础弹药物品库是否完整覆盖 `arrow / bolt / bullet / needle`
- 当前全局 tooltip 只支持 `title + content` 纯文本，不适合复杂结构化次要信息

---

## 4. 本次专项的目标边界

### 4.1 本次要完成

- 建立“默认空面板 + 手动添加攻击项”的交互模型
- 建立攻击项候选目录与稳定 key
- 建立候选项去重规则
- 建立已选攻击项持久化方案
- 在攻击面板与选择浮窗中落地主信息展示
- 在攻击面板与选择浮窗中落地次要信息悬浮展示
- 覆盖旧存档兼容与基础测试

### 4.2 本次暂不直接拍板实现

- 战斗法术并轨
- 法术位/专注联动
- 特殊法术攻击与武器攻击的统一规则增强
- 全局 tooltip 系统的大型通用化重构

### 4.3 工作原则

- 先确认规则，再实现计算
- 先完成数据与状态模型，再做 UI 装配
- 对旧存档要提供迁移或兼容，不允许用户升级后面板直接失真

---

## 5. 分阶段工作计划

## Phase A. 规则冻结

目标：先把本次范围内必须先确认的规则问题拆开并逐项定稿。

当前状态：

- 已完成

产出：

- `R1-R5` 已确认，可进入实现前拆解

## Phase B. 数据模型与兼容设计

目标：建立从“原始攻击数据”到“候选目录”再到“已选列表”的清晰状态链。

建议模型：

- `rawAttacks`：原始计算结果，完整保留所有来源攻击项
- `attackCatalog`：面向用户的候选攻击目录，带稳定 key 与去重结果
- `selectedAttackKeys`：用户主动选择展示的攻击项 key 列表

兼容要求：

- 旧存档的 `hiddenAttacks` 需要兼容迁移
- 已开启的 `activeAttackModes` 不应在迁移中丢失

## Phase C. 候选目录与去重实现

目标：生成全面但无重复的候选攻击项列表。

工作项：

- 为候选项设计稳定 `catalogKey`
- 建立目录生成逻辑
- 建立去重规则
- 为面板与浮窗统一整理主信息/次要信息数据

验收点：

- 同一来源不会重复展示多个等价候选项
- 合理不同的攻击模式不会被误合并

## Phase D. 面板 UI 改造

目标：把左侧攻击面板改造成用户配置型快捷栏。

工作项：

- 已选攻击项列表渲染
- 尾部虚拟项 `添加攻击项`
- 空面板状态展示
- 旧“已隐藏”分区的退场或兼容处理

## Phase E. 浮窗选择器

目标：提供用于选择攻击项的候选面板。

工作项：

- 候选项列表渲染
- 去重后候选项展示
- 选择/取消选择交互
- 主信息直接可见
- 次要信息悬浮可见

## Phase F. 悬浮次要信息

目标：把次要信息作为轻量查阅层，而不是挤在主卡片里。

工作项：

- 统一攻击项次要信息的数据结构
- 建立攻击项专用结构化 tooltip
- 支持属性、射程、弹药、附加描述

## Phase G. 验证与收尾

目标：确保新模型稳定、兼容、可回归。

工作项：

- 旧存档兼容验证
- 主要交互 smoke 验证
- store 层逻辑测试
- 关键 UI 层只读 smoke / 状态测试
- 更新 `TODOLIST.md` 与 `UPDATE_LOG.md`

---

## 6. 已确认规则结论

### R1. 攻击项范围

已确认结论：

- `0.12.0 / 0.12.x` 当前这一轮的新可选攻击面板，仅覆盖徒手攻击与武器攻击
- 右侧战斗法术区保持现有独立结构，本轮不并入同一候选攻击体系
- 本轮范围内的攻击项包括：
  - 徒手攻击
  - 武器攻击
  - 武器衍生模式：单手、双手、副手、投掷、额外属性模式
- 本轮范围外暂不处理：
  - 战斗法术并轨
  - 法术位/专注联动
  - 法术攻击与武器攻击混合候选目录

### R2. 去重标准

已确认结论：

- 候选攻击项按“攻击路径 + 战术行为 + 展示结果”综合判定是否重复
- 同一把武器的不同战术模式必须保留为不同项，例如：
  - 单手 / 双手
  - 近战 / 投掷
  - 主手 / 副手
  - 普通 / 多用伤害
- 不同物品实例如果生成的候选项在“路径、战术行为、展示结果”上完全一致，则合并为一个候选项
- 同名但数值不同、属性不同、效果不同的武器候选项必须保留为不同项
- 即使“力量版”和“敏捷版”最终展示结果完全一样，也保留两个不同路径得到的候选项

实现约束：

- 运行时保留完整 `rawAttacks`
- 用户可见层使用去重后的 `attackCatalog`
- `catalogKey` 不能只基于显示结果生成，必须编码攻击路径信息

### R3. 持久化模型

已确认结论：

- 新攻击面板正式采用 `selectedAttackKeys: string[]` 作为主选择持久化字段
- `activeAttackModes: AbilityKey[]` 继续保留，负责控制额外攻击路径生成
- `hiddenAttacks` 仅用于旧存档兼容迁移，不再作为新逻辑主字段
- `selectedAttackKeys` 的数组顺序即面板展示顺序

旧存档兼容规则：

- 当旧存档没有 `selectedAttackKeys` 时，基于旧逻辑生成原本可见攻击项，并迁移为新的 `selectedAttackKeys`
- 迁移目标是保证旧用户升级后，攻击面板尽量保持原本可见结果，而不是突然清空
- 无效 key 采取“运行时跳过、后续整理时清理”的策略

无效 key 处理规则：

- 如果 `selectedAttackKeys` 中的某项当前不在 `attackCatalog` 中，则渲染时直接跳过
- 不因为一次临时失效而立刻删除该 key
- 在明确的保存、迁移或整理节点，再清理确认永久无效的 key

### R4. 弹药显示策略

已确认结论：

- 弹药信息只在次要信息层展示，不进入主信息层
- 需要弹药且能可靠统计时，显示准确数量
- 需要弹药但当前无法可靠统计时，显示 `需弹药`
- 不需要弹药的攻击项不显示弹药字段
- 攻击项是否存在，不由弹药数量决定

显示规则：

- `弹药：20（箭）`
- `弹药：0（箭）`
- `弹药：需弹药`

补充原则：

- 本轮允许“部分启用”，不等待弹药数据 100% 补齐后再上线
- 只有统计链路完整时才显示具体数量，不能把“未知”误显示成 `0`

### R5. 次要信息展示形式

已确认结论：

- 次要信息采用结构化 tooltip 展示，而不是纯文本拼接
- 本轮只落地“攻击项专用结构化 tooltip”，暂不把全局 tooltip 系统做成大型通用重构
- 攻击面板中的攻击项与候选浮窗中的攻击项，共用同一套次要信息展示结构

结构建议：

- 标题区：攻击名称 / 模式标签
- 核心次要信息区：属性、射程、弹药、附加描述
- 附加描述区：特殊效果、补充说明

显示原则：

- 缺失字段不显示
- 不使用占位文案强行填满
- 结构以可快速扫读为优先

---

## 7. 初步任务拆分清单

- [x] 明确 Phase A 的五个规则结论
- [ ] 设计 `attackCatalog` 与 `selectedAttackKeys`
- [ ] 明确旧存档兼容策略
- [ ] 审计全部候选攻击来源
- [ ] 审计武器弹药字段完整度
- [ ] 审计基础弹药物品是否齐备
- [ ] 设计虚拟攻击项与空状态 UI
- [ ] 设计候选浮窗交互
- [ ] 统一主信息/次要信息的数据结构
- [ ] 补齐测试与 smoke 验证

### 7.1 实现前拆解：数据流

建议采用如下运行时数据流：

`character + proficiencyBonus + activeAttackModes`
-> `rawAttacks`
-> `attackCatalog`
-> `selectedAttackKeys`
-> `visibleAttackCatalog`
-> `ActionsPanel`

说明：

- `rawAttacks`：完整保留所有攻击来源与路径，不做用户向去重
- `attackCatalog`：对 `rawAttacks` 做候选目录整理与去重，得到用户可选择的攻击项
- `selectedAttackKeys`：用户当前选择显示在面板中的候选项 key 列表
- `visibleAttackCatalog`：从 `attackCatalog` 中按 `selectedAttackKeys` 顺序过滤出的最终显示列表

### 7.2 实现前拆解：建议类型分层

建议把当前 `AttackEntry` 拆成两层，而不是继续让一个结构同时承担“原始计算结果”和“UI 展示结果”。

#### A. `RawAttackEntry`

用途：

- 表示一次具体的攻击计算结果
- 保留来源实例与路径信息
- 用于目录生成、迁移计算和调试

建议字段：

- `rawKey: string`
- `sourceType: 'unarmed' | 'weapon'`
- `sourceId: string`
- `sourceTemplateId?: string`
- `displayName: string`
- `abilityPath: AbilityKey`
- `attackMode: 'base' | 'ranged' | 'thrown' | 'offhand' | 'versatile'`
- `handMode: 'none' | 'one_hand' | 'two_hand' | 'offhand'`
- `hit: string`
- `damage: string`
- `range: string`
- `properties: string[]`
- `needsAmmo: boolean`
- `ammoType?: string`
- `ammoCount: number | null`
- `specialText?: string`

#### B. `AttackCatalogEntry`

用途：

- 表示用户可见、可选择、可持久化的一条候选攻击项
- 作为攻击面板和候选浮窗的共用展示模型

建议字段：

- `catalogKey: string`
- `displayName: string`
- `modeLabel?: string`
- `sourceType: 'unarmed' | 'weapon'`
- `abilityPath: AbilityKey`
- `attackMode: 'base' | 'ranged' | 'thrown' | 'offhand' | 'versatile'`
- `handMode: 'none' | 'one_hand' | 'two_hand' | 'offhand'`
- `hit: string`
- `damage: string`
- `range: string`
- `properties: string[]`
- `needsAmmo: boolean`
- `ammoType?: string`
- `ammoCount: number | null`
- `ammoDisplay: 'hidden' | 'tracked' | 'required_unknown'`
- `specialText?: string`
- `rawKeys: string[]`

补充说明：

- `rawKeys` 用于记录这条候选项由哪些原始攻击项折叠而来
- 同一候选项可能对应多个物品实例，但只向用户显示一条

### 7.3 实现前拆解：`rawKey` 与 `catalogKey`

#### `rawKey`

用途：

- 唯一标识一次原始攻击计算结果
- 必须包含物品实例或徒手来源本身
- 只用于运行时，不建议直接作为用户持久化选择 key

建议组成：

- 徒手：`unarmed:<abilityPath>:<attackMode>`
- 武器：`weapon:<instanceId>:<attackMode>:<abilityPath>:<handMode>`

例子：

- `unarmed:str:base`
- `unarmed:cha:base`
- `weapon:9b2f:ranged:dex:two_hand`
- `weapon:2cd1:thrown:str:one_hand`
- `weapon:2cd1:offhand:dex:offhand`

#### `catalogKey`

用途：

- 作为去重后的候选攻击项稳定身份
- 作为 `selectedAttackKeys` 的持久化 key
- 不能依赖单个 `instanceId`

设计原则：

- 必须编码攻击路径信息
- 必须区分不同战术模式
- 要允许相同实例来源折叠为一个候选项
- 要区分同名但数值或效果不同的武器

建议组成：

- `sourceFingerprint`
- `attackMode`
- `abilityPath`
- `handMode`

其中 `sourceFingerprint` 建议优先使用：

- 标准物品：`tpl:<templateId>`
- 无模板或被改造到与模板不一致的物品：使用由下列字段组成的签名
  - 名称
  - 伤害骰
  - 伤害类型
  - 射程
  - 属性集合
  - `requiredAmmoType`
  - `specialEffect`

建议格式：

- `unarmed:<abilityPath>:<attackMode>`
- `weapon:<sourceFingerprint>:<attackMode>:<abilityPath>:<handMode>`

例子：

- `unarmed:str:base`
- `unarmed:cha:base`
- `weapon:tpl:dagger:base:str:one_hand`
- `weapon:tpl:dagger:base:dex:one_hand`
- `weapon:tpl:dagger:thrown:str:one_hand`
- `weapon:tpl:dagger:thrown:dex:one_hand`
- `weapon:sig:ancestral_blade_1d8_slashing_5_lightless:base:str:one_hand`

### 7.4 实现前拆解：去重落点

去重只发生在 `rawAttacks -> attackCatalog` 这一步。

实现规则：

- 先生成完整 `rawAttacks`
- 按 `catalogKey` 分组
- 每组生成一个 `AttackCatalogEntry`
- 把命中的 `rawKey` 收集到 `rawKeys`

这样可以保证：

- 原始计算结果不丢
- 用户看到的目录无重复
- 面板和迁移逻辑都能基于同一候选目录工作

### 7.5 实现前拆解：`selectedAttackKeys`

建议行为：

- 作为 `Character` 上的新字段持久化保存
- 顺序即展示顺序
- 新角色默认值为 `[]`
- 不再继续使用 `hiddenAttacks` 作为主逻辑

运行时规则：

- `selectedAttackKeys` 中存在且当前 `attackCatalog` 中可命中的 key，进入显示列表
- 当前目录中不存在的 key，运行时跳过
- 不在运行时立刻清除失效 key

### 7.6 实现前拆解：旧存档迁移位置

迁移落点建议集中在：

- `src/utils/characterMigration.ts`

需要处理的内容：

- `createDefaultCharacter` 增加 `selectedAttackKeys: []`
- `normalizeCharacterData` 支持读取旧档与新档
- 当旧档只有 `hiddenAttacks` 时，后续在攻击逻辑初始化阶段完成“旧可见项 -> selectedAttackKeys”的迁移

备注：

- 迁移本身依赖运行时 `attackCatalog`，因此不建议只在纯数据 normalize 阶段强行完成全部映射
- 更合理的是：`normalizeCharacterData` 先保底补字段，真正的旧可见项迁移在攻击目录可用后执行一次

### 7.7 实现前拆解：优先改动文件

第一批核心文件：

- `src/types/Character.ts`
- `src/stores/sheet/useCombatLogic.ts`
- `src/components/sheet/combat/ActionsPanel.vue`
- `src/utils/characterMigration.ts`

第二批配套文件：

- `src/stores/activeSheet.ts`
- `src/stores/tooltip.ts`
- `src/components/ui/GlobalTooltip.vue`
- `tests/*combat*`
- `tests/*appRoot*`

---

## 8. 验收标准

- 攻击面板默认不自动展示攻击项
- 面板尾部始终存在清晰的 `添加攻击项` 入口
- 候选攻击项列表完整且无重复
- 用户选择的攻击项可持久化保存
- 重载后展示结果保持稳定
- 主信息在面板中可一眼完成战斗检定
- 次要信息可通过悬浮轻量查阅
- 旧存档升级后不会出现攻击面板异常丢失或严重错乱

---

## 9. 文档同步规则

- 本文件用于记录“攻击面板专项”的工作基线与推进结果
- 规则确认后，先更新本文件，再进入代码实现
- 每完成一个阶段，在 `TODOLIST.md` 中同步状态
- 功能真正落地并验证后，再把结果写入 `UPDATE_LOG.md`

---

## 10. 当前下一步

按顺序推进：

1. 基于已确认的 `R1-R5`，整理实现前任务拆解
2. 设计 `attackCatalog`、`catalogKey` 与 `selectedAttackKeys`
3. 明确旧存档迁移流程与无效 key 清理时机
4. 再进入 Phase B 和 Phase C 的具体实现
