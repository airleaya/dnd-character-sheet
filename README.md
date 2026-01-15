# D&D 5E Character Sheet Manager

![Vue.js](https://img.shields.io/badge/vue-%2335495e.svg?style=flat&logo=vuedotjs&logoColor=%234FC08D)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-State-yellow?style=flat&logo=pinia)
![D&D 5E](https://img.shields.io/badge/D&D-5th_Edition-c9302c?style=flat)

一个基于 **Vue 3** 和 **TypeScript** 构建的现代化 D&D 5E (龙与地下城) 角色卡管理工具。本项目旨在提供一个响应迅速、规则严谨且高度可定制的数字化角色面板，帮助玩家专注于跑团叙事而非繁琐的数据计算。

***所有代码在Gemini3.0 Pro的指导下完成***

## ✨ 核心特性 (Features)

本项目采用模块化设计，将复杂的 D&D 规则拆解为直观的 UI 组件：

* **⚔️ 战斗指挥中心 (Combat Dashboard)**
    * 实时追踪 HP、临时生命值与死亡豁免。
    * 集成化的 **动作面板 (Actions Panel)** 模块，实现**攻击**与**法术**的面板展示。
    * 状态 (Conditions) 管理与效果提示。

* **🎒 智能背包管理 (Smart Inventory)**
    * 可视化物品清单，支持分类过滤（武器、护甲、消耗品等）。
    * 自动化负重计算（基于力量属性）。
    * 支持货币 (GP/SP/CP) 自动换算与管理。

* **🔨 锻造工坊 (The Forge - Customization)**
    * **自定义物品生成器**：允许玩家跳出标准规则书，创建独特的 Homebrew 装备。
    * 通过 `ForgeDropZone` 支持直观的交互体验，自由定义物品属性、伤害骰与描述。

* **🔮 法术书 (Spell Grimoire)**
    * 分环阶管理已知法术与预备法术。
    * 自动追踪法术位消耗 (Spell Slots)。
    * 内置标准法术数据库索引。

* **📐 严谨的 5E 规则引擎**
    * 基于 SRD 规则集的数据校验。
    * 内置熟练项 (Proficiencies)、伤害类型与武器属性逻辑。

## 🛠 技术栈 (Tech Stack)

* **桌面端运行时**: [Electron](https://www.electronjs.org/) (v39) - 提供原生桌面应用体验。
* **核心框架**: [Vue 3](https://vuejs.org/) (Script Setup) - 响应式 UI 构建。
* **语言**: [TypeScript](https://www.typescriptlang.org/) - 确保业务逻辑的类型安全。
* **状态管理**: [Pinia](https://pinia.vuejs.org/) - 集中式管理角色属性与背包数据。
* **交互库**: [vuedraggable](https://github.com/NrZn/vuedraggable) - 实现背包物品与锻造台的拖拽交互。
* **构建工具**: [Vite](https://vitejs.dev/) - 极速的开发与构建体验。
* **样式方案**: CSS Variables + Scoped Styles - 无依赖的轻量级样式系统。

## 📂 项目结构 (Project Structure)


src
├── assets              # 静态资源
├── components
│   ├── common          # 通用原子组件 (EditableText 等)
│   ├── sheet           # 核心业务组件 (Combat, Inventory, Spellbook)
│   ├── sidebar         # 侧边栏与拖放区域 (ForgeDropZone)
│   └── ui              # 全局 UI 组件 (Tooltip 等)
├── composables         # 组合式函数 (useForge, useLibraryFilter)
├── data                # D&D 规则数据库 (Single Source of Truth)
│   ├── libraries       # 物品库 (Armors, Weapons, Gears...)
│   ├── rules           # 核心规则 (Conditions, DamageTypes...)
│   └── spells          # 法术数据库 (分环阶存储)
├── stores              # Pinia 状态仓库 (Character, ActiveSheet)
├── types               # TypeScript 类型定义 (Character, Item, Spell)
└── utils               # 工具函数 (Currency, Dice Rollers)

## 🚀 快速开始 (Getting Started)

### 前置要求 (Prerequisites)
请确保你的开发环境满足以下版本要求，以避免依赖冲突：

* **Node.js**: v24.12.0 或更高版本
* **包管理器**: npm (v11.6.2+) 或 yarn
* **操作系统**: Windows, macOS, 或 Linux (支持 Electron 开发环境)

### 安装与运行

1.  **克隆项目**
    ```bash
    git clone 'https://github.com/airleaya/dnd-character-sheet.git'
    cd dnd-character-sheet
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **启动开发服务器**
    ```bash
    npm run dev
    ```
    * 这将同时启动 Vite 开发服务器与 Electron 窗口。
    * Web 预览地址通常为: `http://localhost:5173`

4.  **构建生产版本**
    ```bash
    npm run build
    ```
    * 构建产物将输出至 `release` 目录 (Windows 下为 .exe,NSIS 安装包)。

## 🤝 贡献 (Contribution)

本项目数据层与 UI 层分离，如果你想为项目添加新的 D&D 规则数据：

1.  在 `src/data/libraries` 中添加新的物品定义。
2.  在 `src/data/spells` 中补充缺失的法术。

---
*Built for the adventurers.* 🎲