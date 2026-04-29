# DnD5e 角色卡管理器

![Vue.js](https://img.shields.io/badge/Vue-3-42b883?style=flat&logo=vuedotjs&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-39-47848f?style=flat&logo=electron&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646cff?style=flat&logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-State-yellow?style=flat&logo=pinia)

一个基于 **Vue 3 + Pinia + Electron + Vite** 的桌面端 D&D 5e 角色卡管理工具。

它的目标不是做一个纯展示型角色卡，而是提供一套适合长期跑团使用的本地管理器：

- 管理多角色存档
- 编辑角色基础信息、属性、技能、职业与兼职
- 跟踪生命值、死亡豁免、护甲等级与攻击面板
- 管理物品、装备、容器、货币与负重
- 制作自定义物品、附魔词条、装备充能、防御徽章、魔法视觉与同调状态
- 使用法术书面板管理已知法术、预备法术与法术位
- 使用数据包目录浏览默认与第三方物品/法术数据；后续将支持 GM 制作器与分级密码解锁
- 通过本地 JSON 文件保存角色数据，适合离线使用
- 通过本地 JSONL 日志记录关键流程与错误，便于排查本机问题

> ?????`0.14.9`

---

## 项目定位

这是一个 **Electron 桌面应用**，而不是纯 Web 页面。

项目采用以下基本架构：

- **渲染进程**：Vue 3 应用，负责 UI、交互与状态管理
- **主进程**：Electron，负责窗口创建、本地文件读写、导出与关闭前保存
- **本地持久化**：角色以 `.json` 文件形式保存在 `saves/` 目录
- **本地日志**：运行日志以 `.jsonl` 文件形式保存在 Electron `userData/logs/` 目录，默认保留 7 天
- **本地数据包**：默认数据包保留在源码/打包资源中，第三方 `.dndpack.json` 保存在 Electron `userData/data-packs/imported/`

这意味着：

- 角色数据不依赖远程服务
- 可以离线使用
- 更适合个人跑团、线下团或本地资料管理

---

## 主要功能

### 1. 角色管理

- 创建、读取、删除角色
- 左侧角色列表与分组管理
- 本地缓存当前角色数据
- 支持导入 / 导出角色 JSON

核心实现：

- `src/stores/characterStore.ts`
- `src/components/layout/SidebarLeft.vue`

### 2. 基础信息与职业系统

- 角色名、玩家名、种族、背景、阵营、等级、XP
- 属性值与技能计算
- 职业 / 子职 / 兼职结构
- 熟练项、语言、豁免与技能熟练

核心实现：

- `src/stores/sheet/useBioLogic.ts`
- `src/components/sheet/bio/`
- `src/data/rules/classes.ts`

### 3. 战斗面板

- 当前生命值 / 最大生命值 / 临时生命值
- 死亡豁免
- 护甲等级、先攻、状态、疲劳
- 攻击条目与动作面板
- 已装备武器与战斗逻辑联动

核心实现：

- `src/stores/sheet/useCombatLogic.ts`
- `src/components/sheet/combat/CombatPanel.vue`
- `src/components/sheet/combat/ActionsPanel.vue`

### 4. 背包与装备

- 背包物品管理
- 装备栏与已装备物品追踪
- 容器嵌套与拖拽整理
- 普通未改造同模板物品会堆叠并移动到本次拖放位置；容器与需要同调的物品不参与堆叠
- 货币管理
- 负重与携带能力计算
- 同调计数 `x/3` 与需要同调物品的同调按钮
- 垃圾箱 / 回收区机制

核心实现：

- `src/stores/sheet/useInventoryLogic.ts`
- `src/components/sheet/inventory/`
- `src/data/libraries/`

### 5. 法术书

- 已知法术与预备法术管理
- 按环级分组展示法术
- 法术位 current / max 管理
- 契约法术位支持
- 法术库浏览与法术详情提示；默认法术库挂载在 `DND 5E法术全书` 下，并按环级、学派、职业三条并列分支分类

核心实现：

- `src/stores/sheet/useSpellLogic.ts`
- `src/components/sheet/spellbook/`
- `src/components/sheet/library/LibrarySpellsPanel.vue`
- `src/data/dataPacks/`
- `src/data/spells/`

### 6. 自定义物品 / Forge

- 通过 Forge 流程创建自定义物品
- 拖放进入自定义编辑区
- 保存为角色可用物品
- 物品库菜单末尾提供各类别空白模板（如武器模板、护甲模板、容器模板），便于从零开始 DIY
- 在不暴露原始 JSON 的前提下编辑物品类型、模板、描述与类型专属属性
- 通过附魔制作界面编辑魔法加值、稀有度、同调、魔法视觉与魔法词条；默认魔法视觉为更浓的浅紫背景与更暗的深红文字
- 附魔界面提供基础、选择词条、新建词条、管理词条分区，并展示行囊/攻击项颜色预览
- 魔法武器显式 `+0/+N` 会显示在名字中，并参与命中与伤害计算
- 魔法护甲/盾牌加值会加入 AC；防御词条在满足同调后以 AC 面板小徽章展示
- 带充能的装备词条会进入攻击栏法术面板的“装备”分组，并按词条独立计数
- 玩家自定义词条会保存为角色级可复用选项，可编辑、删除并重新选择
- 已绑定到行囊物品的附魔词条会保存为物品自身快照，不再跟随角色词条库或预设词条库联动变化
- 从物品库拖入行囊的武器、护甲、容器等会创建独立实例，不会移动或合并已有改造/附魔实例
- 默认物品库挂载在 `DND-5E物品仓库` 下，物品库目录为“数据包 / 分类 / 子分类”三级结构

核心实现：

- `src/composables/useForge.ts`
- `src/composables/useEnchanting.ts`
- `src/components/sheet/modals/ForgeModal.vue`
- `src/components/sheet/modals/EnchantingModal.vue`
- `src/components/sidebar/ForgeDropZone.vue`
- `src/components/sidebar/EnchantDropZone.vue`

### 7. 数据包

- 默认数据包 id 为 `dnd5e-default`，作为锁死静态数据保留在源码/打包资源中
- 默认数据包允许启用 / 禁用和导出；导出文件 id 改为 `dnd5e-output`，后续视为第三方数据包副本
- 第三方 `.dndpack.json` 数据包保存在 Electron `userData/data-packs/imported/`
- 数据包管理界面支持第三方包导入、启用 / 禁用、排序、导出和删除
- GM 数据包制作器会直接占据中间栏，支持新建元数据、编辑第三方包、导入其他包内容快照和从右侧库拖拽内容
- 制作器支持物品/法术切换并同步右侧栏，可管理数据包内物品/法术普通一二级菜单
- 外部包物品 / 法术使用 `packId:localId` 运行时命名空间，避免覆盖默认数据
- 数据包 schema 已预留 `traits` 词条接口；词条编辑与法术编辑当前为占位，不参与规则计算
- 数据包制作器已预留加密分组管理，物品/法术可同时记录普通分组和加密分组，实际加密解锁留待后续阶段
- 第三方数据包可以设置编辑密码锁和“仅本 PC 用户可编辑”；这是应用内编辑保护，不是内容加密

核心实现：

- `src/stores/dataPackStore.ts`
- `src/components/sheet/modals/DataPackManagerModal.vue`
- `src/components/sheet/dataPackMaker/DataPackMakerPanel.vue`
- `src/data/dataPacks/`
- `src/utils/dataPackUtils.ts`

---

## 技术栈

### 前端

- **Vue 3**
- **Pinia**
- **TypeScript**（项目中也存在少量 `.js` 文件，如 `src/main.js`）
- **vuedraggable**

### 桌面端

- **Electron 39**
- **preload + contextBridge** 暴露安全 IPC 接口

### 构建

- **Vite 7**
- **electron-builder**

---

## 实际目录结构

下面这份结构基于当前仓库代码，而不是理想化示意：

```text README.md
.
├─ electron/                 # Electron 主进程与 preload
│  ├─ main.ts
│  └─ preload.ts
├─ public/                   # 静态资源
├─ release/                  # 打包输出目录
├─ src/
│  ├─ components/
│  │  ├─ common/             # 可编辑文本等通用组件
│  │  ├─ layout/             # 应用布局、左右侧栏
│  │  ├─ sheet/              # 角色卡核心面板
│  │  │  ├─ bio/
│  │  │  ├─ combat/
│  │  │  ├─ inventory/
│  │  │  ├─ library/
│  │  │  ├─ modals/
│  │  │  └─ spellbook/
│  │  ├─ sidebar/            # 锻造区、悬浮提示等
│  │  └─ ui/                 # 全局 UI 组件
│  ├─ composables/           # useForge、useLibraryFilter
│  ├─ data/
│  │  ├─ dataPacks/          # 运行时数据包注册与默认数据包封装
│  │  ├─ libraries/          # 物品库
│  │  ├─ rules/              # D&D 规则数据
│  │  └─ spells/             # 法术库
│  ├─ directives/            # 自定义指令
│  ├─ stores/
│  │  ├─ sheet/              # 分领域业务逻辑
│  │  ├─ activeSheet.ts      # 当前打开角色的 Facade Store
│  │  ├─ characterStore.ts   # 角色列表与存档管理
│  │  └─ tooltip.ts
│  ├─ types/                 # Character / Item / Spell 等类型
│  ├─ utils/                 # 工具函数
│  ├─ App.vue
│  └─ main.js
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.js
├─ window-config.json        # 窗口位置与大小配置
├─ TODOLIST.md
└─ UPDATE_LOG.md
```

---

## 核心设计说明

### 1. Store 分层

项目不是把所有逻辑都堆在一个巨大 store 中，而是做了分层：

- `characterStore.ts`
  - 管理角色列表
  - 管理本地缓存
  - 执行导入 / 导出 / 删除 / 初始化读取
  - 管理左侧角色分组

- `activeSheet.ts`
  - 管理当前打开的角色
  - 聚合各领域逻辑
  - 作为角色编辑页的统一入口

- `stores/sheet/`
  - `useBioLogic.ts`
  - `useCombatLogic.ts`
  - `useInventoryLogic.ts`
  - `useSpellLogic.ts`

这种结构的优点是：

- UI 层更薄
- 业务逻辑按领域拆分
- 便于逐模块维护和重构

### 2. 数据驱动

项目中的大量规则不是硬编码在组件里，而是放在：

- `src/data/rules/`
- `src/data/libraries/`
- `src/data/spells/`

这让你可以：

- 单独维护规则数据
- 扩充物品库与法术库
- 让 UI 和规则数据解耦

### 3. 本地 JSON 存档

角色通过 Electron 主进程保存到：

- `saves/*.json`

窗口状态会保存到：

- `window-config.json`

关闭应用时，渲染进程会先收到 `app-will-close` 事件，触发：

1. 当前输入框失焦
2. 将最新 store 数据保存到硬盘
3. 通知主进程允许关闭

这部分逻辑主要在：

- `electron/main.ts`
- `electron/preload.ts`
- `src/App.vue`

---

## 开发环境要求

建议环境：

- **Node.js**：建议使用较新的 LTS 版本
- **npm**：随 Node 一同安装即可
- **操作系统**：Windows 优先，macOS / Linux 理论可开发，但当前打包配置以 Windows 为主

> 当前项目的 `electron-builder` 配置明确包含 Windows 的 `nsis` 与 `portable` 目标。

---

## 安装与运行

### 1. 克隆项目

```bash README.md
git clone https://github.com/airleaya/dnd-character-sheet.git
cd dnd-character-sheet
```

### 2. 安装依赖

```bash README.md
npm install
```

### 3. 启动开发环境

```bash README.md
npm run dev
```

当前脚本定义：

- `npm run dev`：启动 Vite 开发环境
- `npm run build`：构建前端并使用 `electron-builder` 打包
- `npm run preview`：预览 Vite 构建结果
- `npm run typecheck`：执行 Vue + TypeScript 类型检查
- `npm run lint`：执行 ESLint 检查
- `npm run lint:fix`：自动修复部分 ESLint 问题
- `npm run format`：使用 Prettier 格式化项目文件
- `npm run format:check`：检查 Prettier 格式是否一致

> 说明：仓库当前的 `package.json` 中 `dev` 脚本是 `vite`。如果你的本地开发流程需要 Electron 窗口自动联动启动，请结合现有 Vite / Electron 插件配置实际验证。

### 3.1 开发前建议先执行检查

```bash README.md
npm run typecheck
npm run lint
npm run build
```

推荐在提交前至少执行一次：

```bash README.md
npm run format
npm run lint
npm run typecheck
```


### 4. 构建发布版本

```bash README.md
npm run build
```

构建结果输出到：

- `release/`

Windows 目标包括：

- `nsis` 安装包
- `portable` 便携版

---

## 数据文件说明

### 角色存档

- 保存目录：`saves/`
- 文件格式：JSON
- 当前命名策略：`<角色ID>.json`

### 导出角色

导出时会生成更适合阅读的文件名，例如：

- `角色名_Lv等级.json`

### 窗口配置

- 文件：`window-config.json`
- 用途：保存窗口大小与位置

---

## 与代码一致的功能边界

这份 README 尽量基于当前代码，而不是理想目标，因此也明确写出一些边界：

- 项目目前是 **本地单机存档**，不包含云同步
- 项目数据与规则在持续补全中，物品、法术、职业表现仍会继续迭代
- 当前代码为 **JS + TS 混合结构**，并非全量 TypeScript
- 一些高级 5e 规则仍在逐步实现中，具体可参考：
  - `TODOLIST.md`
  - `UPDATE_LOG.md`
  - `问题收集.txt`

---

## 适合谁

这个项目比较适合：

- 想在本地维护 D&D 5e 角色卡的玩家
- 有多个角色，需要批量管理的人
- 喜欢 Homebrew 物品与本地数据可控的用户
- 希望在 Electron / Vue 项目里学习状态分层与本地持久化实现的开发者

---

## 贡献建议

如果你准备继续扩展这个项目，建议优先遵循下面的方式：

### 新增规则或数据

优先修改：

- `src/data/rules/`
- `src/data/libraries/`
- `src/data/spells/`

尽量不要把规则常量直接写死在组件内。

### 新增角色卡逻辑

优先放入：

- `src/stores/sheet/useBioLogic.ts`
- `src/stores/sheet/useCombatLogic.ts`
- `src/stores/sheet/useInventoryLogic.ts`
- `src/stores/sheet/useSpellLogic.ts`

尽量让组件负责展示，让 store / composable 负责逻辑。

### 修改存档结构

请同步考虑：

- `src/types/Character.ts`
- `src/stores/characterStore.ts`
- `src/stores/activeSheet.ts`
- 旧存档兼容与迁移逻辑

---

## 工程质量与自动检查

项目已开始补充基础工程护栏：

- `ESLint`：静态检查代码风格与常见问题
- `Prettier`：统一格式化输出
- `vue-tsc`：执行 Vue + TypeScript 类型检查
- `GitHub Actions`：在 push / pull request 时执行最小 CI

当前 CI 工作流会执行：

- `npm ci`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

如果后续扩展测试体系，建议再补充：

- 单元测试
- 存档回归测试
- 关键规则计算测试

---

## 相关文档

- `PROJECT_INDEX.md`：项目结构索引
- `TODOLIST.md`：未完成事项与计划
- `UPDATE_LOG.md`：已完成更新记录
- `CODE_HEALTH_PLAN.md`：代码健康度评估与治理计划
- `问题收集.txt`：原始问题记录


---

## 致谢

作者信息见 `package.json`：

- **雪荔枝 snowlitch & Gemini 3.0 Pro & Codex**


如果你正在继续维护这个项目，建议把版本更新、规则补全和兼容策略持续写入 `UPDATE_LOG.md`，这样会让整个仓库更清晰、更可持续。

---

**Built for adventurers, DMs, and character hoarders.**
