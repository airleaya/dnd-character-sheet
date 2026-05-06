# TODOLIST

> 2026-05-06 version iteration update:
> Current baseline grows from `0.14.20` to `0.14.21`; this round adds data-pack maker shop catalog generation and removes the behavior monitor panel.
> 2026-05-06 data-pack maker shop catalog update:
> Shop catalog can select items from chosen data-pack sources, save snapshot-only custom display data without changing source items, and live under the trade-goods shop-catalog category; the floating behavior monitor UI has been removed.

> 2026-05-06 version iteration update:
> Current baseline grows from `0.14.19` to `0.14.20`; this round adds data-pack maker copy-to-forge editing and maker workflow diagnostics.
> 2026-05-06 data-pack maker forge workflow update:
> Data-pack content items can now be copied into a new independent draft item before opening the forge editor via either the `??????` item button or by dragging a content item to the maker forge target; maker save diagnostics now stay available in a floating behavior monitor with one-click copy.

> 2026-04-30 version iteration update:
> Current baseline grows from `0.14.18` to `0.14.19`; this round synchronizes enchanted item magic visuals and magic attributes across inventory, data-pack maker, and item library UI.
> 2026-04-30 magic item UI update:
> Inventory hover cards expose magic attributes, data-pack maker content cards inherit enchanted-item visual styling, and right-side item library rows/tooltips now show magic colors, magic badges, and weapon `+N` names.

> 2026-04-30 version iteration update:
> Current baseline grows from `0.14.17` to `0.14.18`; this round upgrades the enchanting trait editor and selection UI.
> 2026-04-30 enchanting trait editor update:
> The enchanting interface now exposes custom-trait editing from the trait selection area, propagates saved custom-trait edits to all inventory items selecting that trait, and renders selectable traits as compact badges with hover-only detail cards instead of full text rows.

> 2026-04-30 version iteration update:
> Current baseline grows from `0.14.16` to `0.14.17`; this round adds persistent data-pack unlock progress, global passphrases, public/total information counts, and export reset controls.
> 2026-04-30 data-pack unlock persistence update:
> Data Pack Manager now shows ?????/???? for items+spells+traits; PL passphrase unlocks are stored in the local third-party pack file, global passphrases mark the whole pack visible, and exports default to stripping local unlock progress unless the exporter chooses to keep it.

> 2026-04-30 version iteration update:
> Current baseline grows from `0.14.15` to `0.14.16`; this round closes phase-four passphrase workflow with group statistics and metadata warnings.
> 2026-04-30 phase-four wrap-up:
> Maker and Data Pack Manager now show passphrase-group counts and visibility warnings; import flow logs invalid visibility metadata without exposing passphrases or raw pack content.

> 2026-04-30 version iteration update:
> Current baseline grows from `0.14.14` to `0.14.15`; this round adds runtime relock controls for passphrase-unlocked data-pack content.
> 2026-04-30 passphrase relock update:
> Data Pack Manager can relock one pack, and the global `Shift + K + L` unlock dialog can clear all session unlocks without changing data-pack files.

> 2026-04-30 version iteration update:
> Current baseline grows from `0.14.13` to `0.14.14`; this round upgrades phase-four authoring so GM can manage passphrase groups and assign explicit visibility from maker editors.
> 2026-04-30 passphrase authoring update:
> Maker terminology now uses 口令分组; item forge/enchant editors, spell placeholders, and trait placeholders write public/non-public visibility metadata tied to passphrase groups.

> 2026-04-30 version iteration update:
> Current baseline grows from `0.14.12` to `0.14.13`; this round starts data-pack phase four with passphrase unlock visibility.
> 2026-04-30 passphrase unlock update:
> Third-party data packs can hide entries behind passphrase groups; PL can unlock content from Data Pack Manager or the global `Shift + K + L` dialog, and GM maker can temporarily ignore passphrases while editing.

> 2026-04-29 version iteration update:
> Current baseline grows from `0.14.11` to `0.14.12`; this round links maker workbench group assignment back into data-pack metadata and improves right-sidebar visibility for newly enabled packs.
> 2026-04-29 maker group/library visibility update:
> Maker-launched forge and enchanting editors can enter or select normal item groups; saved items sync those groups into `editorMeta.menuGroups.items` for the maker group-management panel, and newly enabled third-party packs auto-expand in the right sidebar.

> 2026-04-29 version iteration update:
> Current baseline grows from `0.14.10` to `0.14.11`; this round adds the shared `dnd_5e_characters` parent directory for local character and data-pack storage.
> 2026-04-29 storage parent update:
> Character saves now live under Electron `userData/dnd_5e_characters/characters/`, while third-party data packs live under `userData/dnd_5e_characters/data-packs/imported/`. Existing `userData/storage/*`, `userData/saves`, `userData/data-packs`, and project `saves/` paths remain migration sources.

> 2026-04-29 version iteration update:
> Current baseline grows from `0.14.9` to `0.14.10`; this round removes the temporary maker diagnostics panel, adds data-pack group assignment fields to maker-launched item/enchant editors, and moves user data packs and character saves under one storage root.
> 2026-04-29 data pack saving update:
> The GM maker save flow now persists third-party packs under Electron `userData/storage/data-packs/imported/`; character saves live under `userData/storage/characters/`. Maker-launched 铁匠台 and 附魔台 modals expose 普通分组 and 加密分组 assignment fields, while the visual diagnostic panel has been removed.

> 2026-04-29 version iteration update:
> Current baseline grows from `0.14.8` to `0.14.9`; this round reworks the GM maker item area into a grouped data pack content view with drag sorting and existing DIY/enchant editor reuse.
> 2026-04-29 maker content UI update:
> The maker now displays data pack items grouped by normal menu fields, supports item/group drag ordering, routes DIY item edits through the existing item window, routes enchant edits through the existing enchant window, and renames visible 铁匠铺 labels to 铁匠台.

> 2026-04-29 version iteration update:
> Current baseline grows from `0.14.7` to `0.14.8`; this round routes right-sidebar forge/enchant drops into the GM data pack maker.
> 2026-04-29 right-sidebar workbench routing fix:
> When the GM maker is open, dragging a library item to the right-sidebar forge/enchant zones now imports it into the active data pack and activates the maker's matching edit step instead of using the character inventory forge/enchant workflow.

> 2026-04-29 version iteration update:
> Current baseline grows from `0.14.6` to `0.14.7`; this round hardens item drop activation after the first maker drop fix was still insufficient.
> 2026-04-29 drag activation hardening:
> Drag payloads now survive Sortable/native drag ordering by using multiple native payload types, delayed global payload cleanup, shared drop payload resolution, and maker document-level capture fallback for forge/enchant workbench targets.

> 2026-04-29 version iteration update:
> Current baseline grows from `0.14.5` to `0.14.6`; this round fixes maker item drop editor activation in `0.14.6`.
> 2026-04-29 maker editor activation fix:
> The maker now accepts right-library `vuedraggable` clone payloads and selects the copied item by id after drop, so dropping into the forge/enchant workbench immediately opens the matching edit step.

> 2026-04-29 版本迭代更新：
> 当前基线已从 `0.14.4` 自增长到 `0.14.5`；本轮制作器铁匠铺/附魔台拖拽接收修复进入 `0.14.5`。
> 2026-04-29 制作器拖拽修复：
> 制作器内铁匠铺与附魔台已补齐原生拖拽事件接管、悬停反馈和全局 payload 回退，修复从右侧栏拖拽物品进入制作器目标区不稳定或无响应的问题。

> 2026-04-29 版本迭代更新：
> 当前基线已从 `0.14.3` 自增长到 `0.14.4`；本轮数据包制作器 UI 与分组功能增强进入 `0.14.4`。
> 2026-04-29 制作器分组更新：
> 制作器新增物品/法术切换并同步右侧栏，铁匠铺/附魔台拖拽接收增强；从其他数据包导入时会合并普通分组与加密分组；制作器内可创建、删除和管理物品/法术普通一二级菜单及阶段四预留加密分组，物品/法术可同时记录普通分组和加密分组。

> 2026-04-29 版本迭代更新：
> 当前基线已从 `0.14.2` 自增长到 `0.14.3`；本轮 GM 数据包制作器进入 `0.14.3`。
> 2026-04-29 数据包阶段三更新：
> 已新增中间栏 GM 数据包制作器；新建数据包时填写元数据且 id 创建后不可修改；第三方数据包支持编辑锁、仅本 PC 编辑、从其他数据包导入快照、从右侧物品/法术库拖拽导入，并提供铁匠铺/附魔台/法术编辑占位/词条编辑占位入口。

> 2026-04-29 版本迭代更新：
> 当前基线已从 `0.14.1` 自增长到 `0.14.2`；本轮数据包系统阶段二实现进入 `0.14.2`。
> 2026-04-29 数据包阶段二更新：
> 已建立 `.dndpack.json` 导入/导出、启用/禁用、排序、删除和数据包管理 UI；默认数据包仍是源码内锁死静态数据，只允许启用/禁用和导出，导出 id 为 `dnd5e-output`；第三方包存放在 Electron `userData/data-packs/imported/`。数据包 schema 已预留 `traits` 词条接口，第三方包编辑入口只做占位，后续 GM 制作器阶段实装。

> 2026-04-29 版本迭代更新：
> 当前基线已从 `0.13.11` 进入 `0.14.1`；本轮数据包系统阶段一实现进入 `0.14.1`。
> 2026-04-29 数据包系统工作栈：
> 数据包功能拆分为四阶段：阶段一已建立数据包类型、默认数据包封装、物品库三级目录与法术库数据包来源层；阶段二实现导入/导出、启用/禁用、排序和来源筛选；阶段三实现 GM 数据包制作器；阶段四实现分级加密、密码解锁与本机解锁状态。法术库已支持按环级、学派、职业三条并列分支分类。

> 2026-04-29 版本迭代更新：
> 当前基线已从 `0.13.10` 自增长到 `0.13.11`；本轮普通物品堆叠与装备充能描边进入 `0.13.11`。
> 2026-04-29 行囊堆叠规则更新：
> 从物品库拖入普通未改造同模板物品时，现在会复用已有物品项、数量 `+1` 并移动到本次拖放位置；容器和需要同调的物品不参与堆叠，已改名、改描述、改类型数据或带附魔改造的实例也不会作为堆叠目标。
> 2026-04-29 装备充能 UI 更新：
> 攻击栏法术区域“装备”分组中的附魔词条充能点已增加黑色描边。

> 2026-04-29 版本迭代更新：
> 当前基线已从 `0.13.9` 自增长到 `0.13.10`；本轮空白模板菜单排序进入 `0.13.10`。
> 2026-04-29 空白模板排序更新：
> 物品库菜单中的“空白模板”顶层分组现在固定排在最后，避免模板项抢占真实物品分类前置位置；Forge 无搜索时也会在普通物品之后看到空白模板。

> 2026-04-29 版本迭代更新：
> 当前基线已从 `0.13.8` 自增长到 `0.13.9`；本轮物品库空白模板进入 `0.13.9`。
> 2026-04-29 空白模板更新：
> 物品库新增武器、护甲、冒险装备、工具、消耗品、财宝、容器、套组、其他 9 个空白模板；名称采用“xx模板”，数值必填项填 `0`，其余说明/文本保持空置，便于 Forge 从零开始自定义。

> 2026-04-29 版本迭代更新：
> 当前基线已从 `0.13.7` 自增长到 `0.13.8`；本轮默认魔法视觉微调进入 `0.13.8`。
> 2026-04-29 魔法视觉默认色更新：
> 默认魔法物品背景紫色调整为更浓的 `#dcc2ff`，默认名字深红调整为更暗的 `#4f0b22`；行囊词条标签与同调按钮同步跟随新版默认视觉。

> 2026-04-29 版本迭代更新：
> 当前基线已从 `0.13.6` 自增长到 `0.13.7`；本轮附魔词条类别、装备充能与护甲附魔进入 `0.13.7`。
> 2026-04-29 附魔护甲与装备充能更新：
> 附魔词条新增普通/防御类别；带充能的装备词条进入攻击栏“装备”分组并独立计数，防御词条在 AC 面板展示，同调与物品级词条快照继续保持独立。

> 2026-04-29 版本迭代更新：
> 当前基线已从 `0.13.5` 自增长到 `0.13.6`；本轮物品库拖入行囊独立实例修正进入 `0.13.6`。
> 2026-04-29 行囊实例独立性更新：
> 从物品库拖入武器、护甲、容器等普通物品时现在创建新的库存实例，不再合并并移动已有同模板物品；已有附魔或改造实例不会成为合并目标。

> 2026-04-29 版本迭代更新：
> 当前基线已从 `0.13.4` 自增长到 `0.13.5`；本轮附魔词条物品级快照与行囊展示进入 `0.13.5`。
> 2026-04-29 附魔词条独立化更新：
> 行囊物品会保存附魔词条快照，不再跟随角色词条库或预设词条库联动变化；行囊物品项与悬停窗已显示附魔词条、描述和伤害。

> 2026-04-29 版本迭代更新：
> 当前基线已从 `0.13.3` 自增长到 `0.13.4`；本轮附魔制作界面实装进入 `0.13.4`。
> 2026-04-29 附魔制作界面更新：
> 附魔界面已改为侧栏预览 + 分区编辑；支持基础设置、词条搜索选择、新建自定义词条、管理已有自定义词条，并修正入口目标共享。

> 2026-04-29 版本迭代更新：
> 当前基线已从 `0.13.2` 自增长到 `0.13.3`；本轮附魔系统进入 `0.13.3`。
> 2026-04-29 附魔系统更新：
> 已建立第一版附魔词条、魔法武器加值、魔法视觉与同调系统；魔法武器显式 `+0/+N` 会显示到名字并参与命中/伤害计算，自定义词条会保存为角色级可复用选项。

> 2026-04-29 版本迭代更新：
> 当前基线已从 `0.13.1` 自增长到 `0.13.2`；本轮铁匠铺自由编辑增强进入 `0.13.2`。
> 2026-04-29 铁匠铺自由编辑更新：
> 铁匠铺现在允许直接修改物品类型、模板 ID、分类显示、来源、魔法属性和各类型专属属性；武器词条属性已改为可勾选编辑。原始 `data` JSON 不暴露给普通用户，避免误改内部结构。
> 2026-04-29 附魔入口占位更新：
> 自定义物品界面新增“附魔制作”按钮，右侧栏新增“附魔台”拖拽目标区，并接入独立附魔制作悬浮窗；魔法属性已从自定义物品界面迁入附魔制作界面。
> 2026-04-29 自定义物品模板显示更新：
> 自定义物品在库存中优先显示玩家自定义名，并以浅色小号括号展示模板中文名；DIY 界面的模板字段改为可按中文名搜索的下拉选择。

> 2026-04-29 版本迭代更新：
> 当前基线已从 `0.12.5` 自增长到 `0.13.1`；本轮本地日志系统进入 `0.13.1`。
> 2026-04-29 本地日志系统更新：
> 已建立主进程 JSONL 文件日志、渲染进程 IPC 日志转发、7 天日志轮转、生产代码 logger 替换与日志序列化测试。日志落点为 Electron `userData/logs/YYYY-MM-DD.jsonl`，用于排查用户本机问题。

> 2026-04-28 构建修复：
> 已恢复 `package.json` 的 build 脚本和打包配置，并修正 Electron 生产环境加载 `dist/index.html` 的路径；`npm run build` 已通过，打包产物中已包含前端页面和主进程文件。

> 2026-04-28 物品库拖入位置修正：
> 从物品库拖拽物品到行囊时，新建物品或合并后的堆叠现在会保持用户放置前一刻预览物品项所在的位置。

> 2026-04-28 攻击栏拖拽排序更新：
> 攻击栏已选攻击项现在支持通过左侧把手拖拽排序；排序写回 `selectedAttackKeys`，仅接受当前仍有效且已选中的攻击项。

> 2026-04-28 徒手打击与先攻 UI 更新：
> 徒手打击编辑入口已降噪为普通灰白按钮；先攻实际获得万事通加成时，现在会在先攻数值旁显示“万”字徽章。

> 2026-04-28 版本迭代更新：
> 当前基线已从 `0.12.4` 自增长到 `0.12.5`；本轮独立徒手打击子系统进入 `0.12.5`。
> 2026-04-28 徒手打击子系统更新：
> 已建立角色级 `unarmedStrikes` 配置、旧存档默认回补、攻击面板编辑入口、候选攻击项弹窗入口、说明词条悬浮展示、魔法攻击展示状态、去重与删空回补规则。`activeAttackModes` 不再额外生成徒手攻击变体，后续徒手变体统一通过该子系统维护。

> 2026-04-28 版本迭代更新：
> 当前基线已从 `0.12.3` 自增长到 `0.12.4`；本轮万事通 Bugfix 进入 `0.12.4`。
> 2026-04-28 万事通 Bugfix 更新：
> 万事通判定已支持单主职缺省等级数据，并在吟游诗人显式降回 1 级时立即失效；先攻现在也会获得万事通加值。熟练项悬停悬浮窗不再展示技能和豁免。
> 2026-04-28 版本迭代更新：
> 当前基线已从 `0.12.2` 自增长到 `0.12.3`；本轮法术仪式标识进入 `0.12.3`。
> 2026-04-28 动态负重数值上色更新：
> 行囊标题负重数值会按当前负重比例自动上色：低于一半正常，1/2 到 3/4 黄色，3/4 到上限橙色，超过上限红色。
> 2026-04-28 法术仪式标识更新：
> 法术库列表中的仪式法术显示中文“仪式”徽章并提供悬停提示；角色攻击面板的法术卡标题行也显示“仪式”徽章，未展开详情时即可识别。
> 2026-04-28 版本迭代更新：
> 当前基线已从 `0.12.1` 自增长到 `0.12.2`；本轮专精系统与万事通/半熟练规则进入 `0.12.2`。
> 2026-04-28 专精系统更新：
> 已建立角色专精字段、专精按钮、专精选择悬浮窗、专精摘要悬停提示、熟练按钮悬停穿透提示，并对技能专精启用双倍熟练加值；非自定义专精在属性面板和熟练浮窗中有独特视觉标识。
> 2026-04-28 万事通系统更新：
> 吟游诗人职业等级达到 2 级时，未熟练技能会获得向下取整的一半熟练加值，并在技能行显示“万”字低圆角矩形徽章但不改变技能行颜色；兼职数量限制已改为职业条目数不能超过角色总等级。专精技能视觉已改为琥珀金边框、纯紫色填满背景、金色文字与无描边金色熟练圆点的金紫混合配色。
> 2026-04-28 物品库展示卡容量更新：
> 物品库展示卡中的容器条目现在必须显示容量，并与物品栏容器行、库存悬浮框共用 `formatContainerCapacity`；后续修改容量字段时要同时验证库物品根字段与库存实例 `data` 字段两条路径。
> 2026-04-28 物品翻译版本统一更新：
> 物品侧翻译版本统一已通过本轮物品库重构完成；P1 中保留的待办已改为法术侧翻译版本统一，不再重复排期物品侧工作。
> 2026-04-28 容器重量显示更新：
> 物品栏中的容器重量必须以“自重 + 内容重量”分解显示；忽略内容重量的容器内容栏按负重口径显示为 `0.0`。
> 2026-04-28 容器容量显示更新：
> 物品栏容器行现在直接显示容量；若原文同时提供重量容量与体积容量，软件中必须同时保留并展示两项描述。
> 2026-04-28 版本迭代更新：
> 当前基线已从 `0.12.0` 自增长到 `0.12.1`；本轮物品库正式替换与迁移条目已收口，后续体验修正进入 `0.12.2` 或后续自增长补丁版本。
> 2026-04-28 全物品堆叠规则更新：
> 消耗品堆叠口径已扩展到所有物品；同位置同模板默认合并数量。含有内容物的容器不参与容器本体堆叠，空容器仍可堆叠。
> 2026-04-28 贸易品重量口径更新：
> 所有 `trade_good` 贸易品运行时重量统一为 1 磅；这是项目内的负重口径，不影响服务、食宿、生活开销、小饰品等非贸易品条目。
> 2026-04-28 容器内容透视更新：
> 所有容器行已扩展内容物预览，预览数据完整输出，行宽不足时由 UI 省略号截断；数量穿透调控仅在容器合计只有 1 个内容物时启用，普通内容区与悬挂栏都会参与“是否唯一”的判断。
> 2026-04-28 拆分物品重量口径更新：
> 拆分物品在物品库中仍显示来源表的一组价格和一组重量；进入行囊时，库存实例按 `weight / sourceQuantity` 写入单体重量，并由 `quantity` 参与总负重计算。

> 2026-04-28 复数子个体迁移更新：
> 复数子个体审定结果已迁入结构化数据与通用获取规则，迁移报告见 `src/data/libraries/structured/pluralItemMigrationReport.md`。后续新增类似物品时，必须先审定再迁移，不能直接手写特殊分支。

> 2026-04-28 复数子个体审定更新：
> 已生成 `src/data/libraries/structured/pluralItemReview.md`，用于逐项决定复数组合、数据拆分、数据拆分但成组生成、数据拆分且额外生成规则。本轮只建立审定表和静态字段接口，未修改正式物品重量、价格或获取逻辑。

> 2026-04-28 悬浮框边缘保护更新：
> 物品库/法术库查看悬浮框与库存物品查看悬浮框已接入统一视口边缘保护。后续如新增其他固定定位 tooltip，应复用 `getTooltipViewportPosition`，避免重新写一套边界算法。

> 2026-04-27 描述溯源更新：
> 当前运行时物品描述已统一加入来源前缀，并保留结构化源条目的描述/规则文本。深度审计已加入“来源前缀缺失”和“原文细节迁移缺失”检查；后续新增或修改物品描述时，必须同步确认 `npm run audit:item-library` 通过。

> 2026-04-27 记录纪律更新：
> 后续所有物品库、库存 UI、套组、容器、负重、迁移与审计相关改动，无论大小，都必须同步更新相关清单与工作记录。
> 本轮已记录：菜单吸附、武器/护甲筛选、武器属性展示、背包悬挂栏、套组容器命名、套组总重、箭袋穿透规则。

> 2026-04-27 审计闭环更新：
> 物品库正式替换的 1-4 步已经完成：迁移审计报告、二级目录中文标签、深度审计命令、旧库存迁移验证均已落地。
> 当前剩余风险主要是手动 UI 验收：库面板显示、拖拽加入、套组展开、容器重量、弹药堆叠、库 tooltip 与库存 tooltip 表格渲染。

> 2026-04-27 状态说明：
> `0.12.1` 已完成物品库正式替换与迁移的阶段收口。
> 注意：版本号里的 `N` 代表自增长补丁版本，例如 `0.12.1`、`0.12.2`，不是字面量 `x`。

> 用途：记录尚未完成、待验证、待澄清的事项。完成后将结果迁移到 `UPDATE_LOG.md`。

当前基线版本：`0.14.19`
默认负责人：雪荔枝 / Codex

## 版本规划

- `0.14.N`：数据包系统；`N` 为自增长补丁版本号。
- `0.14.19`：已完成附魔物品魔法属性与魔法视觉在行囊、数据包制作器和物品库中的同步展示。
- `0.14.18`：已完成附魔界面词条编辑入口、词条徽章化与悬停详情。
- `0.14.17`：已完成数据包口令进度持久化、全局口令、公开/总数信息与导出重置控制。
- `0.14.16`：已完成阶段四收尾：口令组内容统计、可见性元数据警告与导入校验提示。
- `0.14.15`：已完成数据包口令解锁状态的本包重新锁定与全局清空本次解锁。
- `0.14.14`：已完成 GM 制作器口令分组管理、物品/法术/词条公开状态写回与旧“加密分组”文案收敛。
- `0.14.13`：已完成阶段四第一版口令解锁可见性、数据包管理口令入口、`Shift + K + L` 快捷解锁窗口与编辑时忽视口令开关。
- `0.14.5`：已修复制作器铁匠铺/附魔台从右侧栏接收物品拖拽的问题。
- `0.14.4`：已完成制作器物品/法术切换、拖拽入口强化、普通分组管理与加密分组预留。
- `0.14.3`：已完成 GM 数据包制作器第一版，实现新建元数据、编辑锁、内容导入、拖拽入口与编辑占位。
- `0.14.2`：已完成数据包系统阶段二，实现第三方包导入/启用/排序/导出/删除、默认包导出与词条接口预留。
- `0.14.1`：已完成数据包系统阶段一，实现内置默认数据包、物品库三级目录与法术库并列分类目录。
- `0.13.11`：已完成普通物品堆叠规则恢复、容器/需同调物品例外与装备充能黑色描边。
- `0.13.10`：已完成空白模板菜单排序调整。
- `0.13.9`：已完成物品库各类别空白模板。
- `0.13.8`：已完成默认魔法视觉颜色微调。
- `0.13.7`：已完成附魔词条类别扩展、装备充能入口、防御词条 AC 徽章与护甲/盾牌魔法加值加入 AC。

- `0.12.0`：攻击面板核心改造与关键体验修复。
- `0.12.N`：数据补全、规则增强、中等规模功能增强；`N` 为自增长补丁版本号。
- `0.13.N`：较大交互增强或系统性功能；`N` 为自增长补丁版本号。
- `Backlog`：需求不清晰、依赖规则确认或暂不排期。

---

## P0 / 当前迭代

### 0. 数据包系统四阶段工作栈
- [ ] 状态：阶段三已完成第一版，阶段四待开始，作为 `0.14.N` 主线
- 目标版本：`0.14.N`
- 类型：架构 / 数据包 / 物品库 / 法术库 / 加密
- 阶段一：数据包读取与目录改造
  - [x] 建立数据包类型系统与运行时注册表。
  - [x] 将默认物品库封装为物品库一级菜单 `DND-5E物品仓库`。
  - [x] 将默认法术库封装为法术库一级菜单 `DND 5E法术全书`。
  - [x] 物品库目录升级为：数据包 / 分类 / 子分类。
  - [x] 法术库目录升级为：数据包 / 分类方式 / 分类项；分类方式支持环级、学派、职业。
  - [x] 先只挂载内置数据包，不做导入/导出和加密。
- 阶段二：数据包导入、启用与运行时合并
  - [x] 支持导入/导出明文 `.dndpack.json`。
  - [x] 支持数据包启用、禁用、删除、排序。
  - [x] 支持物品/法术搜索结果按数据包来源进入对应一级目录。
  - [x] 建立运行时 ID 命名空间与导入冲突检测。
  - [x] 默认数据包只允许启用/禁用和导出；导出 id 为 `dnd5e-output`。
  - [x] 预留 `traits` 词条接口与第三方包编辑入口占位。
- 阶段三：GM 数据包制作器
  - [x] 支持新建/编辑数据包元信息，创建后不允许修改 `manifest.id`。
  - [x] 支持从物品库、其他数据包和拖拽入口制作数据包物品。
  - [x] 支持从默认/第三方法术复制为数据包法术，法术编辑器正文暂占位。
  - [x] 支持数据包编辑密码锁与“仅本 PC 用户可编辑”。
  - [x] 支持导出给 PL 使用。
- 阶段四：分级加密与解锁
  - [x] 阶段四预备：制作器已可创建、删除、管理加密分组，并为物品/法术记录加密分组归属。
  - [x] 支持口令分组的非公开内容运行时可见性过滤。
  - [x] 支持 GM 在制作器中创建、改名、描述、删除口令分组，并为物品/法术/词条写入公开状态。
  - [ ] 如未来需要，再评估 Web Crypto 的 PBKDF2 + AES-GCM 真加密；当前无强密码学加密需求。
  - [x] 支持 PL 在数据包管理界面或 `Shift + K + L` 独立窗口输入 GM 口令解锁更多物品/法术/词条。
  - [x] 支持清空本次运行解锁状态：可在数据包管理中重新锁定单包，或在 `Shift + K + L` 窗口清空全部。
  - [x] 支持口令组内容统计和可见性元数据校验警告。
  - [ ] 评估是否需要本机保存解锁状态；当前解锁状态仅本次运行有效，且不保存明文口令。
- 已确认并完成：
  - 阶段一只挂载内置数据包，不做任何文件导入。
  - 法术库三种分类方式采用并列目录展开。
  - 默认数据包内部使用同一个 pack id `dnd5e-default`，物品/法术展示两个不同菜单名。

### 0. 物品库拖入行囊独立实例修正
- [x] 状态：已完成，作为 `0.13.6` 收口
- 目标版本：`0.13.6`
- 类型：Bugfix / 行囊 / 物品实例 / 测试
- 描述：修正从物品库拖入同模板物品时复用并移动已有库存实例的问题，确保普通装备进入行囊时创建新的独立对象。
- 关联文件：
  - `src/stores/sheet/useInventoryLogic.ts`
  - `tests/useInventoryLogic.test.ts`
- 已完成：
  - 武器、护甲、容器等普通物品从库加入时不再合并已有同模板库存项。
  - 已有附魔、同调、改名、描述修改或词条快照的库存项不会作为合并目标。
  - 仅保留经审定的可拆分/成组数量物品合并，例如长铁钉这类明确数量堆叠条目。
- 验收标准：
  - 行囊已有附魔长剑时，再从物品库拖入长剑会新增一把独立长剑，而不是移动/增加已有附魔长剑。
  - `npm run test`、`npm run typecheck`、`npm run build` 通过。

### 0. 附魔词条物品级快照与行囊展示
- [x] 状态：已完成，作为 `0.13.5` 收口
- 目标版本：`0.13.5`
- 类型：Bugfix / 附魔 / 行囊 / 测试
- 描述：切断行囊物品与类型库/词条库之间的运行时数据耦合，并在行囊中展示物品已绑定的附魔词条。
- 关联文件：
  - `src/utils/magicItems.ts`
  - `src/composables/useEnchanting.ts`
  - `src/utils/itemFactory.ts`
  - `src/components/sheet/inventory/InventoryItemRow.vue`
  - `src/components/sheet/inventory/InventoryPanel.vue`
  - `tests/enchantingModal.ui.test.ts`
  - `tests/inventoryItemRow.ui.test.ts`
  - `tests/inventoryPanelLoadColor.ui.test.ts`
- 已完成：
  - 物品实例创建时对运行时数据和描述块进行深拷贝。
  - 选择附魔词条时将词条完整快照写入 `item.magic.customTraits`。
  - 攻击计算、行囊行展示和悬停窗读取物品自身词条快照，而不是角色级词条库。
  - 删除或编辑角色级自定义词条不再影响已附魔物品。
  - 行囊物品项显示附魔词条名；悬停窗显示词条名、描述、伤害、充能/触发摘要和附带法术。
- 验收标准：
  - 已绑定词条的物品在角色级词条库修改后保持原词条数据不变。
  - 行囊物品项可直接看到附魔词条名。
  - 悬停窗可看到词条、描述和伤害信息。
  - `npm run test`、`npm run typecheck`、`npm run build` 通过。

### 0. 附魔制作界面实装
- [x] 状态：已完成，作为 `0.13.4` 收口
- 目标版本：`0.13.4`
- 类型：UI / 附魔系统 / 交互 / 测试
- 描述：将附魔制作悬浮窗从基础表单升级为完整可用界面，覆盖目标预览、基础设置、词条选择、新建词条和词条管理。
- 关联文件：
  - `src/components/sheet/modals/EnchantingModal.vue`
  - `src/composables/useEnchanting.ts`
  - `src/components/sheet/inventory/InventoryPanel.vue`
  - `tests/enchantingModal.ui.test.ts`
- 已完成：
  - 附魔制作界面新增左侧目标卡、行囊/攻击项颜色预览、已选词条摘要。
  - 编辑区按“基础 / 选择词条 / 新建词条 / 管理词条”分区。
  - 词条选择支持搜索、已选高亮、伤害/充能摘要展示。
  - 新建词条保存后自动进入角色级自定义词条库并绑定到当前物品。
  - 管理区支持编辑自定义词条的类型、触发方式、伤害参数、法术、描述和充能信息。
  - 修正附魔目标状态共享，确保 DIY 按钮与右侧拖拽入口打开的是同一个目标。
  - 行囊标题红色超重状态不再有呼吸动画。
- 验收标准：
  - 从 DIY 和右侧拖拽入口打开附魔窗时能显示当前目标。
  - 玩家能在界面内完成魔法视觉预览、词条选择、新建与管理。
  - `npm run test`、`npm run typecheck`、`npm run build` 通过。

### 0. 附魔系统
- [x] 状态：已完成，作为 `0.13.3` 收口
- 目标版本：`0.13.3`
- 类型：功能增强 / 附魔 / 攻击计算 / 同调 / 测试
- 描述：建立玩家可编辑的附魔系统，使魔法武器加值、魔法词条、附带法术、魔法视觉与同调状态进入运行时角色数据。
- 关联文件：
  - `src/types/Library.ts`
  - `src/types/Character.ts`
  - `src/data/rules/magicTraits.ts`
  - `src/utils/magicItems.ts`
  - `src/composables/useEnchanting.ts`
  - `src/components/sheet/modals/EnchantingModal.vue`
  - `src/components/sheet/inventory/InventoryItemRow.vue`
  - `src/components/sheet/inventory/InventoryPanel.vue`
  - `src/components/sheet/combat/ActionsPanel.vue`
  - `src/stores/sheet/useCombatLogic.ts`
  - `src/stores/sheet/useInventoryLogic.ts`
  - `tests/useCombatLogic.test.ts`
  - `tests/inventoryItemRow.ui.test.ts`
- 已完成：
  - 魔法武器显式设置 `+0/+N` 时显示在名字中，并将加值加入命中和伤害。
  - 词条系统支持预设占位词条、自定义伤害词条、默认作用与消耗充能两种触发方式。
  - 附带法术词条支持指定法术、词条级充能和额外描述。
  - 自定义词条保存为角色级 `customMagicTraits`，可持续复用、编辑和删除。
  - 魔法视觉支持行囊背景、攻击项背景和名字字体颜色，未设置时使用浅紫背景与深红字体。
  - 行囊标题显示同调 `x/3`，需要同调的魔法物品在数量位置提供同调按钮并限制最多 3 件。
  - 需要同调的魔法物品从添加、保存和数量控制上都按非堆叠单件处理。
- 验收标准：
  - 显式 `+0` 显示为 `物品名+0`，未设置魔法加值则不显示后缀。
  - `+1` 等魔法加值同时影响命中和伤害。
  - 默认作用伤害词条能追加到攻击项伤害文本，消耗充能/附带法术词条不自动套入每次攻击。
  - 同调超过 3 件时失败且不改变状态。
  - `npm run test`、`npm run typecheck`、`npm run build` 通过。

### 0. 铁匠铺自由编辑增强
- [x] 状态：已完成，作为 `0.13.2` 收口
- 目标版本：`0.13.2`
- 类型：功能增强 / Forge / 自定义物品 / 测试
- 描述：提高玩家修改物品的自由度，允许修改物品类型与运行时 `data` 属性，并为武器词条属性提供显式编辑入口。
- 关联文件：
  - `src/components/sheet/modals/ForgeModal.vue`
  - `src/components/sheet/modals/EnchantingModal.vue`
  - `src/components/sidebar/EnchantDropZone.vue`
  - `src/components/layout/AppLayout.vue`
  - `src/components/layout/SidebarRight.vue`
  - `src/components/sheet/inventory/InventoryItemRow.vue`
  - `src/composables/useEnchanting.ts`
  - `src/composables/useForge.ts`
  - `tests/inventoryItemRow.ui.test.ts`
  - `tests/useForge.test.ts`
- 已完成：
  - 新增物品类型选择，切换类型时自动补齐该类型的基础运行时字段。
  - 扩展通用字段：模板 ID、显示分类、来源、英文名、标签、魔法属性与同调信息。
  - 扩展武器、护甲、工具、消耗品、容器等类型专属字段编辑。
  - 武器词条属性改为可勾选编辑，并继续写入 `data.properties`。
  - 不暴露原始 `data` JSON，所有可修改项通过表单控件完成，避免误改内部结构。
  - 物品描述已前置到战斗/类型专属属性之前，便于先编辑描述再处理规则字段。
  - 新增附魔制作悬浮窗，并在自定义物品界面提供按钮入口、右侧栏提供拖拽目标区入口。
  - 魔法物品、魔法加值、稀有度、同调与同调条件已迁入附魔制作界面，不再占用自定义物品主表单。
  - 库存行对改名物品显示“自定义名（模板中文名）”，模板中文名使用浅色小号样式。
  - DIY 模板字段从文本 ID 改为中文搜索 + 下拉选择，不覆盖玩家自定义物品名。
- 验收标准：
  - 玩家能把物品改成任意 `ItemType`。
  - 玩家能编辑武器词条、伤害、射程、弹药类型等战斗字段。
  - 自定义物品界面和右侧栏均能打开附魔制作悬浮窗。
  - 魔法属性只能在附魔制作悬浮窗中修改。
  - 改名物品能保留自定义名，并显示模板中文名作为辅助信息。
  - `npm run test -- tests/useForge.test.ts`、`npm run typecheck`、`npm run build` 通过。

### 1. 本地日志系统
- [x] 状态：已完成，作为 `0.13.1` 收口
- 目标版本：`0.13.1`
- 类型：工程能力 / Electron / 诊断 / 测试
- 描述：建立本地 JSONL 日志系统，主进程写入 Electron `userData/logs/`，渲染进程通过 IPC 转发，生产代码统一使用 logger。
- 关联文件：
  - `electron/logger.ts`
  - `electron/main.ts`
  - `electron/preload.ts`
  - `src/types/logging.ts`
  - `src/utils/logging.ts`
  - `src/utils/rendererLogger.ts`
  - `src/components/layout/SidebarLeft.vue`
  - `src/composables/useForge.ts`
  - `src/stores/characterStore.ts`
  - `src/stores/sheet/useBioLogic.ts`
  - `src/utils/inventoryDropUtils.ts`
  - `src/utils/itemFactory.ts`
  - `tests/logging.test.ts`
- 已完成：
  - 新增 `debug/info/warn/error` 结构化日志字段与安全序列化，错误统一记录 `name/message/stack`。
  - 正式环境默认记录 `info/warn/error`，开发环境额外允许 `debug`。
  - 日志按日期写入 `YYYY-MM-DD.jsonl`，应用启动时清理 7 天前日志。
  - `src/` 与 `electron/` 中生产代码 console 调用已替换为命名 logger。
- 验收标准：
  - 日志写入 JSONL，每行可独立解析为 JSON。
  - 渲染进程日志通过 `window.electronAPI.writeLog` 转发。
  - Electron API 缺失或写入失败时，不阻断业务流程。
  - `npm run test`、`npm run typecheck`、`npm run build` 通过。

### 1. 物品库正式替换与迁移
- [x] 状态：已完成，作为 `0.12.1` 收口
- 目标版本：`0.12.1`
- 类型：数据 / 重构 / 迁移 / UI
- 描述：将 `STRUCTURED_MUNDANE_ITEM_LIBRARY` 提升为正式运行时物品库来源，替换旧的分散数组物品库，并保留附魔属性预留接口。
- 关联文件：
  - `src/data/libraries/itemLibrary.ts`
  - `src/data/libraries/itemIdMigration.ts`
  - `src/data/libraries/structured/`
  - `src/data/libraries/intake/`
  - `src/types/Library.ts`
  - `src/types/Item.ts`
  - `src/utils/itemFactory.ts`
  - `src/utils/characterMigration.ts`
  - `src/components/sheet/library/LibraryItemsPanel.vue`
  - `src/components/common/ItemDescriptionRenderer.vue`
- 已完成：
  - 新增统一运行时入口 `ITEM_LIBRARY`，当前接入 `489` 条非魔法物品。
  - 旧分散库文件改为兼容导出，由 `ITEM_LIBRARY` 过滤生成。
  - 保留 `magic?: ItemMagicDefinition`；非魔法物品默认 `magic.isMagic === false`。
  - 物品库面板改为按 `displayCategory/displaySubcategory` 动态生成二级目录。
  - 新增共享描述渲染组件，支持段落、列表、表格。
  - 新增旧 id 迁移入口，当前包含 `bolts -> crossbow_bolts`。
  - `.gitignore` 已修正：`intake/` 与 `structured/` 在正式运行时依赖期间必须进入 git。
  - 新增复数子个体审定表 `src/data/libraries/structured/pluralItemReview.md`，并预留 `multiplicity` / `acquisitionRule` 静态字段。
  - 复数子个体审定结果已迁移：拆分弹药/长铁钉单体数据，建立通用 `acquisitionRule` 获取执行器，并生成 `pluralItemMigrationReport.md`。
  - 拆分物品已采用双口径：物品库显示组重量/组价格，行囊实例使用单体重量。
- 收口说明：
  - 二级目录本地化、迁移审计、结构化描述、复数子个体迁移、容器透视、全物品堆叠、贸易品重量口径均已进入本轮版本。
  - 自动化验收已覆盖数据审计、adapter、迁移、库存逻辑与库存行 UI；后续若发现体验问题，进入 `0.12.2` 或后续自增长补丁版本。
- 验收标准：
  - `ITEM_LIBRARY_AUDIT_REPORT.total === 489`
  - `sourceMismatched === 0`
  - `duplicateIds === 0`
  - `magicItems === 0`
  - 套组引用全部闭合。
  - 带表格描述的物品在库 tooltip 和库存 tooltip 中都以真实表格展示。
  - 旧存档库存不丢失；无法映射的自定义物品保留并带迁移审计标记。

---

## P1 / 近期版本

### 1. 法术翻译版本统一
- [ ] 状态：未开始
- 目标版本：`0.12.N`
- 类型：数据一致性 / 文案规范
- 描述：物品侧已通过物品库重构完成；本项仅保留法术侧翻译来源、命名风格与展示口径的统一工作。

### 2. 法术来源与可用职业
- [ ] 状态：未开始
- 目标版本：`0.12.N`
- 类型：功能增强 / 数据结构扩展
- 描述：法术详情增加来源书籍与可用职业信息。

---

## P2 / 中期增强

### 6. 自定义物品模板
- [ ] 状态：未开始
- 目标版本：`0.13.N`
- 类型：功能增强
- 描述：为 DIY / Forge 系统提供预设模板，降低用户创建成本。

### 7. 角色特性词条化
- [ ] 状态：未开始
- 目标版本：`0.13.N`
- 类型：结构化数据增强
- 描述：将角色特性从纯文本演进为可管理词条。

### 8. 投掷类武器堆叠与计数
- [ ] 状态：未开始
- 目标版本：`0.13.N`
- 类型：规则 / 背包 / 战斗联动
- 描述：支持飞镖、标枪等投掷类武器的堆叠显示与数量消耗。

---

## Backlog / 待澄清

### 9. 数据来源范围控制
- [ ] 状态：待澄清
- 目标版本：`Backlog`
- 类型：需求待确认
- 描述：确认是否需要按来源书、规则范围或数据完整度筛选物品/法术/规则数据。

### 10. 制作团队资源记录
- [ ] 状态：未开始
- 目标版本：`Backlog`
- 类型：低优先级 / 资料管理 / 团队协作
- 描述：建立用于记录制作团队资源、分工、素材来源、参考链接与维护说明的轻量功能或数据区。

### 11. 自建信息数据包
- [ ] 状态：未开始
- 目标版本：`Backlog`
- 类型：低优先级 / 数据扩展 / 自定义内容
- 描述：支持用户建立自建信息数据包，用于收纳自定义规则、物品、职业、法术、世界观资料等可迁移内容。

---

## 使用规则

1. 新问题先进入 `TODOLIST.md`。
2. 开始开发时将状态更新为“进行中”。
3. 完成或确认合并后，将结果写入 `UPDATE_LOG.md`。
4. `TODOLIST.md` 只保留未完成、待验证、待澄清事项。
5. 工程进度记录必须使用中文。




