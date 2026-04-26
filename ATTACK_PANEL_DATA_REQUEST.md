# ATTACK_PANEL_DATA_REQUEST

> 用途：把攻击面板 `0.12.x` 后续涉及的“设计数据”工作统一整理给你收集与确认。  
> 约定：本文件只记录数据需求、当前缺口、提交模板与验收口径；**不由 Codex 自行补数据**。

当前关联版本：`0.12.x`  
当前状态：`等待设计数据提交`

---

## 1. 协作分工

- 你负责：
  - 搜集、整理、确认设计数据
  - 决定字段取值、命名、映射关系与描述文本
- 我负责：
  - 说明代码实际依赖哪些字段
  - 核查当前数据结构是否足够支撑功能
  - 接入你提供的数据
  - 做兼容、实现、测试与收尾

---

## 2. 当前攻击面板真实依赖的数据

当前攻击面板的武器/徒手攻击展示，已经在代码中稳定依赖以下字段：

### 2.1 武器主信息依赖

- `name`
- `category`
- `damage`
- `damageType`
- `properties`
- `range`
- `versatileDamage`

### 2.2 武器次要信息依赖

- `properties`
- `range`
- `specialEffect`
- `requiredAmmoType`

### 2.3 弹药追踪依赖

攻击面板当前弹药显示链路为：

1. 武器侧提供 `requiredAmmoType`
2. 背包中的消耗品实例提供 `ammoType`
3. 逻辑层按 `requiredAmmoType === ammoType` 统计数量
4. tooltip 中显示：
   - 有完整映射时：显示精确数量
   - 缺映射时：显示“需弹药”

注意：
- 当前逻辑**不依赖** `isAmmunition` 来计数，只依赖 `ammoType`
- 所以“有弹药条目但没填 `ammoType`”在功能上仍然等于“无法追踪”

---

## 3. 当前已发现的数据缺口

以下是基于现有代码和数据文件得到的“缺口审计结果”。这些是**待你提供数据**的问题，不是待我补算法的问题。

### 3.1 武器已声明需要弹药，但未给出弹药类型

当前发现：

- `blowgun`
  - 已有 `ammunition` 属性
  - 缺少 `requiredAmmoType`
- `sling`
  - 已有 `ammunition` 属性
  - 缺少 `requiredAmmoType`

影响：

- 这两类武器在攻击面板中只能显示“需弹药”
- 不能统计背包中的弹药数量

### 3.2 弹药条目存在，但未写入 `ammoType`

当前发现：

- `arrows`
  - 已标记 `isAmmunition: true`
  - 未写 `ammoType`
- `bolts`
  - 已标记 `isAmmunition: true`
  - 未写 `ammoType`
- `bullets`
  - 已标记 `isAmmunition: true`
  - 未写 `ammoType`

影响：

- 即使背包里已有这些弹药，当前逻辑也不会把它们计入攻击项弹药数量

### 3.3 类型层已预留，但数据层未覆盖完整

当前类型中已存在：

- `arrow`
- `bolt`
- `bullet`
- `needle`

当前数据层仍需你确认：

- `needle` 是否需要正式启用
- 如果启用，对应弹药条目是什么
- 对应武器有哪些

### 3.4 特殊说明文本仍依赖你来决定是否补齐

当前攻击 tooltip 可读取：

- `specialEffect`

但这属于设计数据，不应由我自行补写。若你希望某些武器在悬浮信息里展示更明确的规则摘要，需要你提供：

- 哪些武器要补
- 每条的最终文本

---

## 4. 你需要提交的数据模板

你后续给我数据时，建议直接按下面格式提交，我可以直接接入。

### 4.1 武器弹药映射模板

```md
## Weapon Ammo Mapping

- weaponId:
  requiredAmmoType:
  note:
```

示例模板：

```md
## Weapon Ammo Mapping

- weaponId: blowgun
  requiredAmmoType: needle
  note: 用于吹箭

- weaponId: sling
  requiredAmmoType: bullet
  note: 用于投石索弹丸
```

### 4.2 弹药条目模板

```md
## Ammunition Items

- itemId:
  ammoType:
  displayName:
  stackRule:
  note:
```

最少必填字段：

- `itemId`
- `ammoType`

如果你只想做最小接入，也可以只给我：

```md
- itemId: arrows
  ammoType: arrow

- itemId: bolts
  ammoType: bolt

- itemId: bullets
  ammoType: bullet
```

### 4.3 特殊说明文本模板

```md
## Weapon Special Text

- weaponId:
  specialEffect:
```

用途：

- 仅用于 tooltip 次要信息展示
- 不改变计算规则

---

## 5. 当前建议你优先提交的数据

为了让攻击面板的弹药显示先完整可用，建议优先只提交这一小批：

### P0

- `blowgun` 的 `requiredAmmoType`
- `sling` 的 `requiredAmmoType`
- `arrows` 的 `ammoType`
- `bolts` 的 `ammoType`
- `bullets` 的 `ammoType`
- 是否启用 `needle`

### P1

- 需要补 `specialEffect` 的武器清单

### P2

- 更细的展示命名、翻译、说明文本统一

---

## 6. 验收口径

当你把上述数据交给我后，我会按以下口径完成接入并验证：

- 攻击面板中需要弹药的武器能显示准确的弹药状态
- 有明确映射时显示数量
- 没有明确映射时仍显示“需弹药”，不会伪造 `0`
- tooltip 中的次要信息与数据字段一致
- 不额外扩规则，不擅自改你的数据语义

---

## 7. 当前结论

当前攻击面板后续最需要的不是新算法，而是你提供一批最小设计数据。  
在你提交这些数据前，我这边暂不继续补任何 ammo / weapon 设计内容，只保留实现接入口与验证能力。
