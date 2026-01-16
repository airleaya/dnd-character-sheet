// src/data/spells/level9.ts
import type { SpellDefinition } from '../../types/Spell';

export const LEVEL_9_SPELLS: SpellDefinition[] = [
  // ==========================================
  // 防护系 (Abjuration)
  // ==========================================
  {
    id: 'imprisonment',
    name: '禁锢术',
    level: 9,
    school: 'abjuration',
    ritual: false,
    castingTime: '1 分钟',
    range: '30 尺',
    components: { v: true, s: true, m: '一张描绘目标的牛皮纸或一座雕刻成目标模样的雕像，以及一种根据你选择的法术版本而定的特殊成分，价值至少每目标生命骰 500 gp' },
    concentration: false,
    duration: '永久',
    target: '一个生物',
    attackType: 'save',
    saveAttr: 'wis',
    description: '<p>你创造一个魔法拘束来囚禁射程内你可见的一个生物。目标必须进行感知豁免，失败则被法术束缚；若成功，该生物对再次施展的此法术免疫。受此法术影响期间，生物不需要呼吸、进食或饮水，也不会变老。预言系法术无法定位或感知目标。</p><p>施法时，你从以下禁锢形式中选择一种：</p><ul><li><b>埋葬 (Burial)</b>：目标被埋在地下深处的魔法力场球中。没有任何东西能穿过球体，也没有生物能通过传送或位面旅行进出。特殊成分：一个小秘银球。</li><li><b>束缚 (Chaining)</b>：沉重的锁链深深扎根于地下，将目标固定在原地。目标陷入束缚状态，且无法移动或被移动。特殊成分：一条贵金属制成的精细链条。</li><li><b>异界监牢 (Hedged Prison)</b>：法术将目标传送位一个微型半位面，该位面受防传送和防位面旅行结界保护。特殊成分：一个玉制的微型监牢模型。</li><li><b>微缩牢笼 (Minimus Containment)</b>：目标缩小至 1 英寸高，被囚禁在一颗宝石或类似物体内。光线可穿过宝石，但除此之外任何东西（包括传送）都无法通过。特殊成分：一颗透明的大宝石（如刚玉、钻石或红宝石）。</li><li><b>沉睡 (Slumber)</b>：目标陷入沉睡且无法被唤醒。特殊成分：稀有的催眠草药。</li></ul><p><b>结束法术</b>：施法时，你可以设定一个结束法术并释放目标的条件。条件可以是任何你选择的事情，但必须合理且有可能发生。条件可以基于生物的名字、身份或神祇，但必须基于可观察的行为或品质，而非等级、生命值等无形数据。</p><p>只有作为 9 环法术施展的<i>解除魔法</i>才能结束此法术，目标可以是监牢本身或用于创造它的特殊成分。</p><p>你使用特定的特殊成分一次只能维持一个监牢。如果你使用该成分再次施法，第一次施法的目标立即获释。</p>',
    scaling: '无',
    classes: ['warlock', 'wizard'],
    cantripScaling: false
  },
  {
    id: 'invulnerability',
    name: '无敌术',
    level: 9,
    school: 'abjuration',
    ritual: false,
    castingTime: '1 动作',
    range: '自身',
    components: { v: true, s: true, m: '一小块精金，价值至少 500 gp，法术会消耗掉' },
    concentration: true,
    duration: '10 分钟',
    target: '自身',
    attackType: 'none',
    description: '<p>在法术结束前，你免疫所有伤害。</p><p>**最短描述桂冠**</p>',
    scaling: '无',
    classes: ['wizard'],
    cantripScaling: false
  },
  {
    id: 'prismatic_wall',
    name: '虹光法墙',
    level: 9,
    school: 'abjuration',
    ritual: false,
    castingTime: '1 动作',
    range: '60 尺',
    components: { v: true, s: true, m: null },
    concentration: false,
    duration: '10 分钟',
    target: '一堵光墙',
    attackType: 'save',
    saveAttr: 'dex', // 通过层时
    description: '<p>一个闪烁的七彩光平面形成一堵不透明的垂直墙壁（长至多 90 尺、高 30 尺、厚 1 英寸），或者形成直径至多 30 尺的球体。墙壁持续存在。如果你将墙定位在穿过生物占据的空间，法术失败。</p><p>墙壁发出 100 尺明亮光照和额外 100 尺微暗光照。你和你指定的生物可无害穿过。其他能看见墙的生物若进入墙 20 尺内或在那里开始回合，必须通过体质豁免，否则目盲 1 分钟。</p><p>墙壁由七层不同颜色的光组成。生物试图穿过墙壁时，必须逐层通过，每层都需进行敏捷豁免。墙壁也可逐层被特定手段摧毁（从红到紫）。<i>反魔法场</i>对虹光法墙无效。</p><ul><li><b>红 (Red)</b>：失败受 10d6 火焰伤害，成功减半。阻挡非魔法远程攻击。解除：受至少 25 点冷冻伤害。</li><li><b>橙 (Orange)</b>：失败受 10d6 酸蚀伤害，成功减半。阻挡魔法远程攻击。解除：强风。</li><li><b>黄 (Yellow)</b>：失败受 10d6 闪电伤害，成功减半。解除：受至少 60 点力场伤害。</li><li><b>绿 (Green)</b>：失败受 10d6 毒素伤害，成功减半。解除：<i>穿墙术</i>或能在固体表面开门的同级/更高级法术。</li><li><b>蓝 (Blue)</b>：失败受 10d6 冷冻伤害，成功减半。解除：受至少 25 点火焰伤害。</li><li><b>靛 (Indigo)</b>：失败被束缚。之后每回合结束进行体质豁免，三次成功结束，三次失败永久石化。阻挡法术穿过。解除：<i>昼明术</i>或更高级强光法术。</li><li><b>紫 (Violet)</b>：失败目盲。下回合开始进行感知豁免，成功结束目盲，失败被放逐到其他位面（不再目盲）。解除：<i>解除魔法</i>或同级/更高级解除法术。</li></ul><p>**最长描述桂冠**</p>',
    scaling: '无',
    classes: ['wizard'],
    cantripScaling: false
  },
  // ==========================================
  // 咒法系 (Conjuration)
  // ==========================================
  {
    id: 'blade_of_disaster',
    name: '灾厄之刃',
    level: 9,
    school: 'conjuration',
    ritual: false,
    castingTime: '1 附赠动作',
    range: '60 尺',
    components: { v: true, s: true, m: null },
    concentration: true,
    duration: '1 分钟',
    target: '一个生物、物体或结构',
    attackType: 'melee',
    damage: '4d12',
    damageType: 'force',
    description: '<p>你在射程内一处你可见的未被占据空间创造一道约 3 尺长的剑形位面裂隙。该剑持续至法术结束。当你施展此法术时，你可以用该剑进行至多两次近战法术攻击，每次攻击针对剑周围 5 尺内的一个生物、未被固定的物体或结构。若命中，目标受到 4d12 点力场伤害。如果 d20 投出 18 或更高，此次攻击造成重击。重击造成额外 8d12 力场伤害（共计 12d12）。</p><p>在你的回合，你可以用附赠动作将剑移动至多 30 尺到一处你可见的未被占据空间，并再次用它进行至多两次近战法术攻击。</p><p>该剑可以无害穿过任何屏障，包括<i>力场墙</i>。</p>',
    scaling: '无',
    classes: ['sorcerer', 'warlock', 'wizard'],
    cantripScaling: false
  },
  {
    id: 'gate',
    name: '异界之门',
    level: 9,
    school: 'conjuration',
    ritual: false,
    castingTime: '1 动作',
    range: '60 尺',
    components: { v: true, s: true, m: '一颗价值至少 5,000 gp 的钻石' },
    concentration: true,
    duration: '1 分钟',
    target: '创造一个传送门',
    attackType: 'none',
    description: '<p>你召唤出一个传送门，连接射程内你可见的一处未被占据空间与另一个存在位面的精确位置。传送门是一个圆形开口，直径可设为 5 到 20 尺。你可以任意选择传送门的朝向。传送门持续至法术结束。</p><p>传送门在其出现的每个位面上都有正面和背面。只有穿过正面才能通过传送门。任何穿过正面的事物会瞬间被传送到另一个位面，出现在离传送门最近的未被占据空间。</p><p>神祇和其他位面统治者可以阻止此法术在其面前或其领域内的任何地方开启传送门。</p><p>施展此法术时，你可以说出一个特定生物的名字（假名、头衔或昵称无效）。如果该生物处于除你所在位面以外的位面，传送门会在该生物附近开启，并将其拉过传送门，出现在你这一侧最近的未被占据空间。你对该生物没有特殊控制权，它可以按 DM 认为合适的方式行动（离开、攻击你或帮助你）。</p>',
    scaling: '无',
    classes: ['cleric', 'sorcerer', 'wizard'],
    cantripScaling: false
  },
  {
    id: 'storm_of_vengeance',
    name: '复仇风暴',
    level: 9,
    school: 'conjuration',
    ritual: false,
    castingTime: '1 动作',
    range: '视线',
    components: { v: true, s: true, m: null },
    concentration: true,
    duration: '1 分钟',
    target: '360尺半径区域',
    attackType: 'save',
    saveAttr: 'con', // 第1轮
    damage: '2d6', // 第1轮
    damageType: 'thunder', // 第1轮
    description: '<p>一团翻滚的风暴云在你可见的一点上方形成，扩散至 360 尺半径。区域内雷电交加，狂风怒号。云层出现时，位于云下（至多云下 5,000 尺）的每个生物必须进行体质豁免。失败者受到 2d6 点雷鸣伤害并耳聋 5 分钟。</p><p>只要你维持专注，风暴在随后的每轮你的回合产生不同效果：</p><ul><li><b>第 2 轮</b>：酸雨降下。云下每个生物和物体受到 1d6 点酸蚀伤害。</li><li><b>第 3 轮</b>：你召唤六道闪电击中云下你选择的六个生物或物体（每个目标限一道）。目标须进行敏捷豁免，失败受 10d6 闪电伤害，成功减半。</li><li><b>第 4 轮</b>：冰雹降下。云下每个生物受到 2d6 点钝击伤害。</li><li><b>第 5-10 轮</b>：狂风和冻雨袭击该区域。区域变为困难地形且重度遮蔽。每个生物受到 1d6 点冷冻伤害。区域内无法进行远程武器攻击。风雨对维持法术专注构成严重干扰。强风（20-50 英里/小时）会自动吹散区域内的雾气等现象。</li></ul>',
    scaling: '无',
    classes: ['druid'],
    cantripScaling: false
  },
  {
    id: 'wish',
    name: '祈愿术',
    level: 9,
    school: 'conjuration',
    ritual: false,
    castingTime: '1 动作',
    range: '自身',
    components: { v: true, s: false, m: null },
    concentration: false,
    duration: '立即',
    target: '改变现实',
    attackType: 'none',
    description: '<p>祈愿术是凡人生物能施展的最强法术。只需大声说出愿望，你就能按你的意愿改变现实的基础。</p><p>此法术的基本用途是复制任何 8 环或更低环阶的法术。你无需满足该法术的任何要求（包括昂贵成分），法术直接生效。</p><p>或者，你可以创造以下效果之一：</p><ul><li>创造一个价值不超过 25,000 gp 的非魔法物品（尺寸不超过 300 尺）。</li><li>使至多 20 个你可见的生物恢复所有生命值，并结束<i>高等复原术</i>能结束的所有效果。</li><li>使至多 10 个你可见的生物获得对一种你选择伤害类型的抗性。</li><li>使至多 10 个你可见的生物免疫某个单一法术或魔法效应，持续 8 小时。</li><li>撤销最近发生的一个事件，强制重投上一轮内（包括你的上一回合）进行的任意掷骰。现实会重塑以适应新结果。</li></ul><p>你也可能实现上述范例之外的愿望。尽可能精确地向 DM 陈述你的愿望。DM 在判定上有很大的自由度；愿望越大，出错的可能性越大（法术可能失败、部分实现或产生不可预见的后果）。</p><p><b>施法反噬</b>：若你用此法术产生除复制法术以外的任何效果，你会变得虚弱。直到你完成一次长休，每当你施展法术，你会受到每环阶 1d10 点黯蚀伤害（无法减免）。此外，你的力量降为 3，持续 2d4 天（每休息一天减少 2 天恢复时间）。最后，如果你承受了这种压力，有 33% 的几率你将永远无法再次施展祈愿术。</p>',
    scaling: '无',
    classes: ['sorcerer', 'wizard'],
    cantripScaling: false
  },

  // ==========================================
  // 预言系 (Divination)
  // ==========================================
  {
    id: 'foresight',
    name: '预警术',
    level: 9,
    school: 'divination',
    ritual: false,
    castingTime: '1 分钟',
    range: '触及',
    components: { v: true, s: true, m: '一根蜂鸟羽毛' },
    concentration: false,
    duration: '8 小时',
    target: '一个自愿生物',
    attackType: 'none',
    description: '<p>你触碰一个自愿生物，赋予其预见不久将来的有限能力。在法术持续期间，目标无法被受惊 (Surprised)，且进行攻击检定、属性检定和豁免检定具有优势。此外，在法术持续期间，其他生物对目标的攻击检定具有劣势。</p><p>如果你在持续时间结束前再次施展此法术，该法术立即结束。</p>',
    scaling: '无',
    classes: ['bard', 'druid', 'warlock', 'wizard'],
    cantripScaling: false
  },

  // ==========================================
  // 惑控系 (Enchantment)
  // ==========================================
  {
    id: 'power_word_kill',
    name: '律令死亡',
    level: 9,
    school: 'enchantment',
    ritual: false,
    castingTime: '1 动作',
    range: '60 尺',
    components: { v: true, s: false, m: null },
    concentration: false,
    duration: '立即',
    target: '一个生物',
    attackType: 'none',
    description: '<p>你说出一个充满力量的词，可以迫使射程内一个你可见的生物立即死亡。如果你选择的生物现有生命值为 100 点或更少，它死亡。否则，法术无效。</p>',
    scaling: '无',
    classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    cantripScaling: false
  },
  {
    id: 'psychic_scream',
    name: '心灵尖啸',
    level: 9,
    school: 'enchantment',
    ritual: false,
    castingTime: '1 动作',
    range: '90 尺',
    components: { v: false, s: true, m: null },
    concentration: false,
    duration: '立即',
    target: '至多10个生物',
    attackType: 'save',
    saveAttr: 'int',
    damage: '14d6',
    damageType: 'psychic',
    description: '<p>你释放心灵力量，冲击射程内你可见的至多十个生物的心智。智力属性为 2 或更低的生物不受影响。</p><p>每个目标必须进行一次智力豁免。失败者受到 14d6 点心灵伤害并陷入震慑状态。成功者伤害减半且不被震慑。如果目标被此伤害杀死，它的头颅会炸裂（只要它有头）。</p><p>被震慑的目标可以在其每个回合结束时进行一次智力豁免。若成功，震慑效果结束。</p>',
    scaling: '无',
    classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    cantripScaling: false
  },

  // ==========================================
  // 塑能系 (Evocation)
  // ==========================================
  {
    id: 'mass_heal',
    name: '群体医疗',
    level: 9,
    school: 'evocation',
    ritual: false,
    castingTime: '1 动作',
    range: '60 尺',
    components: { v: true, s: true, m: null },
    concentration: false,
    duration: '立即',
    target: '任意数量的生物',
    attackType: 'none',
    damage: '700', // 治疗池
    description: '<p>一股治疗能量的洪流从你流向周围受伤的生物。你恢复至多 700 点生命值，由你随意分配给射程内任意数量你可见的生物。被此法术治疗的生物也会被治愈所有疾病，以及任何使其目盲或耳聋的效果。此法术对不死生物和构装体无效。</p>',
    scaling: '无',
    classes: ['cleric'],
    cantripScaling: false
  },
  {
    id: 'meteor_swarm',
    name: '流星爆',
    level: 9,
    school: 'evocation',
    ritual: false,
    castingTime: '1 动作',
    range: '1 英里', // 原文为 See description，通常为 1 英里
    components: { v: true, s: true, m: null },
    concentration: false,
    duration: '立即',
    target: '4个40尺半径球体',
    attackType: 'save',
    saveAttr: 'dex',
    damage: '20d6+20d6', // 火焰 + 钝击
    damageType: 'fire', // 实际上是混合，但在数据结构中通常只列一个主要的，描述中详述
    description: '<p>燃烧的火球坠落到射程内你可见的四个不同地点。每个地点为中心的 40 尺半径球状区域内的每个生物必须进行敏捷豁免。球状区域可以绕过转角。失败者受到 20d6 点火焰伤害和 20d6 点钝击伤害，成功者减半。处于多个火球爆发区域内的生物只受一次影响。</p><p>法术会伤害区域内的物体，并点燃未被穿戴或携带的易燃物。</p>',
    scaling: '无',
    classes: ['sorcerer', 'wizard'],
    cantripScaling: false
  },
  {
    id: 'power_word_heal',
    name: '律令医疗',
    level: 9,
    school: 'evocation',
    ritual: false,
    castingTime: '1 动作',
    range: '触及',
    components: { v: true, s: true, m: null },
    concentration: false,
    duration: '立即',
    target: '一个生物',
    attackType: 'none',
    description: '<p>一股治疗能量浪潮洗涤你触碰的生物。目标恢复所有生命值。如果生物处于魅惑、恐慌、麻痹或震慑状态，该状态结束。如果生物处于伏地状态，它可以用反应站起来。此法术对不死生物和构装体无效。</p>',
    scaling: '无',
    classes: ['bard'],
    cantripScaling: false
  },

  // ==========================================
  // 幻术系 (Illusion)
  // ==========================================
  {
    id: 'weird',
    name: '怪影杀手',
    level: 9,
    school: 'illusion',
    ritual: false,
    castingTime: '1 动作',
    range: '120 尺',
    components: { v: true, s: true, m: null },
    concentration: true,
    duration: '1 分钟',
    target: '30尺半径球体',
    attackType: 'save',
    saveAttr: 'wis',
    damage: '4d10',
    damageType: 'psychic',
    description: '<p>你唤起一群生物内心最深处的恐惧，在它们脑海中创造出只有它们自己能看到的幻象生物。以射程内你选择的一点为中心，30 尺半径球状区域内的每个生物必须进行一次感知豁免。失败者在法术持续期间陷入恐慌状态。幻象唤起生物最深层的恐惧，将其最可怕的噩梦具象化为无法逃避的威胁。在该恐慌生物的每个回合结束时，它必须进行一次感知豁免。失败则受到 4d10 点心灵伤害。成功则该法术对该生物结束。</p>',
    scaling: '无',
    classes: ['wizard'],
    cantripScaling: false
  },

  // ==========================================
  // 死灵系 (Necromancy)
  // ==========================================
  {
    id: 'astral_projection',
    name: '星界投射',
    level: 9,
    school: 'necromancy',
    ritual: false,
    castingTime: '1 小时',
    range: '10 尺',
    components: { v: true, s: true, m: '每位受术生物一颗价值至少 1,000 gp 的风信子石和一根价值至少 100 gp 的精雕银棒，法术会消耗这些材料' },
    concentration: false,
    duration: '立即',
    target: '你和至多8个自愿生物',
    attackType: 'none',
    description: '<p>你和射程内至多八个自愿生物将星界躯体投射到星界（如果你已在星界，则施法失败并浪费）。你们留下的肉体陷入昏迷并处于假死状态，不需要食物或空气，也不会变老。</p><p>你的星界躯体在几乎所有方面都类似于你的凡人形态，复制你的游戏数据和物品。主要区别在于一条从你肩胛骨之间延伸出来并拖在身后的银线，延伸 1 尺后隐形。这条银线是你与肉体的系带。只要系带完好，你就能找到回家的路。如果银线被切断（只有在效果明确说明会切断它时才会发生），你的灵魂与肉体分离，你将立即死亡。</p><p>你的星界形态可以在星界自由旅行，并穿过那里的传送门前往任何其他位面。如果你进入一个新的位面或回到施法时所在的位面，你的肉体和物品会沿着银线被传送过去，让你在进入新位面时重回肉体。你的星界形态是一个独立的化身。对它造成的任何伤害或其他效果不会影响你的肉体，当你返回肉体时也不会保留。</p><p>当你使用动作解消法术时，法术对你和你的同伴结束。法术结束时，受影响的生物返回其肉体并苏醒。</p><p>法术也可能对你或你的某个同伴提前结束。对星界躯体或肉体成功施展<i>解除魔法</i>会结束该生物的法术。如果生物的原肉体或星界形态生命值降至 0，法术对该生物结束。如果法术结束且银线完好，银线会将生物的星界形态拉回肉体，结束其假死状态。</p><p>如果你被提前送回肉体，你的同伴仍保持星界形态，必须自己寻找回肉体的方法（通常通过将生命值降至 0）。</p>',
    scaling: '无',
    classes: ['cleric', 'warlock', 'wizard'],
    cantripScaling: false
  },
  {
    id: 'true_resurrection',
    name: '完全复生术',
    level: 9,
    school: 'necromancy',
    ritual: false,
    castingTime: '1 小时',
    range: '触及',
    components: { v: true, s: true, m: '洒一点圣水和价值至少 25,000 gp 的钻石，法术会消耗掉' },
    concentration: false,
    duration: '立即',
    target: '一个生物',
    attackType: 'none',
    description: '<p>你触碰一个死亡时间不超过 200 年且死因非年老的生物。如果该生物的灵魂自由且自愿，它将以满生命值复活。</p><p>该法术会愈合所有伤口，中和任何毒素，治愈所有疾病，并移除生物死时影响它的任何诅咒。法术会替换受损或缺失的器官和肢体。如果该生物是不死生物，它会恢复为非不死形态。</p><p>如果原尸体已不存在，该法术甚至可以提供一个新的身体，这种情况下你必须说出该生物的名字。该生物随后出现在你 10 尺内你选择的一处未被占据空间。</p>',
    scaling: '无',
    classes: ['cleric', 'druid'],
    cantripScaling: false
  },

  // ==========================================
  // 变化系 (Transmutation)
  // ==========================================
  {
    id: 'mass_polymorph',
    name: '群体变形术',
    level: 9,
    school: 'transmutation',
    ritual: false,
    castingTime: '1 动作',
    range: '120 尺',
    components: { v: true, s: true, m: '一个毛虫茧' },
    concentration: true,
    duration: '1 小时',
    target: '至多10个生物',
    attackType: 'save',
    saveAttr: 'wis',
    description: '<p>你将射程内你可见的至多十个生物变形。不愿意的目标必须通过感知豁免以抵抗变形。不愿意的变形生物自动成功通过豁免。</p><p>每个目标变成你选择的一种野兽形态，你可以为每个目标选择相同或不同的形态。新形态可以是任何你见过的野兽，其挑战等级必须等于或低于目标的挑战等级（若目标无挑战等级，则为等级的一半）。目标的游戏数据（包括心理属性）被所选野兽的数据取代，但保留其生命值、阵营和人格。</p><p>每个目标获得等同于新形态生命值的临时生命值。这些临时生命值不能被其他来源的临时生命值取代。当目标的临时生命值耗尽或它死亡时，它恢复原形。如果法术在那之前结束，该生物失去所有临时生命值并恢复原形。</p><p>生物受限于新形态的自然特性，无法说话、施法或做任何需要手或语言的事情。</p><p>目标的装备融入新形态。目标无法启动、持用或以其他方式受益于其任何装备。</p>',
    scaling: '无',
    classes: ['bard', 'sorcerer', 'wizard'],
    cantripScaling: false
  },
  {
    id: 'shapechange',
    name: '形体变化',
    level: 9,
    school: 'transmutation',
    ritual: false,
    castingTime: '1 动作',
    range: '自身',
    components: { v: true, s: true, m: '一个价值至少 1,500 gp 的翡翠头环，施法前你必须将其戴在头上' },
    concentration: true,
    duration: '1 小时',
    target: '自身',
    attackType: 'none',
    description: '<p>在法术持续期间，你变成另一种生物的形态。新形态可以是挑战等级等于或低于你等级的任何生物。该生物不能是构装体或不死生物，且你必须见过该种生物至少一次。你变成该生物的平均样本，不具备任何职业等级或“施法”特质。</p><p>你的游戏数据被所选生物的数据取代，但你保留你的阵营以及智力、感知和魅力属性。你保留所有的技能和豁免熟练项，并获得该生物的熟练项。若该生物拥有与你相同的熟练项且加值更高，则使用该生物的加值。你无法使用新形态的任何传奇动作或巢穴动作。</p><p>你获得新形态的生命值和生命骰。当你恢复原形时，生命值恢复为变形前的数值。如果因生命值降至 0 而恢复原形，任何溢出的伤害由其原形承受。只要溢出伤害未将原形生命值降至 0，你都不会陷入昏迷。</p><p>你保留职业、种族或其他来源特性的益处，并可以使用它们，前提是新形态在生理上能够做到。你无法使用你原本拥有的特殊感官（如黑暗视觉），除非新形态也有该感官。你只能在该生物通常能说话的情况下说话。</p><p>变形时，你选择你的装备是掉落在地、融入新形态还是被其穿戴。穿戴的装备功能正常。DM 根据生物的体型和形状决定穿戴是否可行。装备不会改变大小或形状来适应新形态，无法穿戴的装备必须掉落或融入。融入的装备无效。</p><p>在法术持续期间，你可以用动作变成另一种形态，遵循相同的限制和规则，唯一的例外是：若新形态的生命值高于你当前生命值，你的生命值保持当前数值不变。</p>',
    scaling: '无',
    classes: ['druid', 'wizard'],
    cantripScaling: false
  },
  {
    id: 'time_stop',
    name: '时间停止',
    level: 9,
    school: 'transmutation',
    ritual: false,
    castingTime: '1 动作',
    range: '自身',
    components: { v: true, s: false, m: null },
    concentration: false,
    duration: '立即',
    target: '自身',
    attackType: 'none',
    description: '<p>你让除你之外的所有人的时间流动短暂停止。对其他生物而言时间没有流逝，而你连续进行 1d4 + 1 个回合。在此期间，你可以正常移动和使用动作。</p><p>如果你在此期间使用的动作或创造的效果影响了除你以外的生物，或影响了被除你以外生物穿戴或携带的物体，该法术结束。此外，如果你移动到离施法点超过 1,000 尺的地方，法术也会结束。</p>',
    scaling: '无',
    classes: ['sorcerer', 'wizard'],
    cantripScaling: false
  },
  {
    id: 'true_polymorph',
    name: '完全变形术',
    level: 9,
    school: 'transmutation',
    ritual: false,
    castingTime: '1 动作',
    range: '30 尺',
    components: { v: true, s: true, m: '一滴水银、一团阿拉伯树胶和一缕烟' },
    concentration: true,
    duration: '1 小时',
    target: '一个生物或物体',
    attackType: 'save',
    saveAttr: 'wis',
    description: '<p>选择射程内你可见的一个生物或非魔法物体。你可以将生物变成不同的生物，将生物变成非魔法物体，或将物体变成生物（物体不能被其他生物穿戴或携带）。变形持续至法术结束，或直到目标生命值降至 0 或死亡。如果你维持专注满 1 小时，变形变为永久，直到被驱散。</p><p>此法术对变形生物或生命值为 0 的生物无效。不愿意的生物可以进行感知豁免，成功则不受影响。</p><p><b>生物变生物</b>：新形态可以是挑战等级等于或低于目标（或其等级）的任何种类。目标的游戏数据（包括心理属性）被新形态取代。它保留其阵营和人格。目标获得新形态的生命值，恢复原形时生命值还原。溢出伤害由原形承受。生物受限于新形态的自然特性，无法说话或施法（除非新形态能）。目标的装备融入新形态并失效。</p><p><b>物体变生物</b>：你可以将物体变成任何种类的生物，只要生物体型不大于物体，且挑战等级为 9 或更低。生物对你和你的同伴友善。它在你的每个回合行动，由你决定其动作和移动。DM 拥有该生物的数据并结算其行为。若法术变为永久，你不再控制该生物，它对你的态度取决于你如何对待它。</p><p><b>生物变物体</b>：若将生物变成物体，其穿戴和携带的所有物品也随之变形，只要物体体型不大于生物。生物的数据变为物体的数据。法术结束恢复原形后，生物对此期间没有记忆。</p>',
    scaling: '无',
    classes: ['bard', 'warlock', 'wizard'],
    cantripScaling: false
  }
];