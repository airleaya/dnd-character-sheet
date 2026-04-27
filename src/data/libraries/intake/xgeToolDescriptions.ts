import type { ItemIntakeAudit, ItemIntakeEntry } from '../itemIntake';

const XGE_TOOL_SOURCE = 'XGE珊娜萨的万事指南';
const XGE_TOOL_CHECK_DATE = '2026-04-27';

interface XgeToolDescriptionDraft {
  id: string;
  name: string;
  englishName: string;
  components?: string[];
  skills?: Record<string, string>;
  specialUses?: Record<string, string>;
  sampleDcs?: Array<[string, number | '可变']>;
  notes?: string;
  auditIssues?: string[];
}

const XGE_TOOL_USEFUL_FIELDS = [
  '来源',
  '工具名称',
  '组件',
  '关联技能',
  '特殊用途',
  '难度示例',
  '审核问题'
];

const audit = (draft: XgeToolDescriptionDraft): ItemIntakeAudit => ({
  sourceMatched: !draft.auditIssues?.length,
  checkedAt: XGE_TOOL_CHECK_DATE,
  summary: `已核对 ${draft.name} 的组件、关联技能、特殊用途和难度示例。`,
  issues: draft.auditIssues ?? []
});

const toolDescription = (draft: XgeToolDescriptionDraft): ItemIntakeEntry => ({
  id: `xge_tool_description_${draft.id}`,
  source: XGE_TOOL_SOURCE,
  status: 'parsed',
  rawText: `${draft.name}${draft.englishName}：XGE工具说明扩展。`,
  understanding: 'XGE工具熟练项扩展规则，作为普通工具条目的规则补充，不属于魔法物品。',
  usefulFields: XGE_TOOL_USEFUL_FIELDS,
  notes: draft.notes,
  parsed: {
    id: draft.id,
    name: `${draft.name} (${draft.englishName})`,
    type: 'tool',
    description: [
      draft.components?.length ? `组件：${draft.components.join('、')}。` : undefined,
      draft.skills ? `技能配合：${Object.entries(draft.skills).map(([skill, text]) => `${skill}：${text}`).join('；')}` : undefined,
      draft.specialUses ? `特殊用途：${Object.entries(draft.specialUses).map(([use, text]) => `${use}：${text}`).join('；')}` : undefined
    ].filter(Boolean).join('\n'),
    xgeToolDescription: {
      components: draft.components,
      skills: draft.skills,
      specialUses: draft.specialUses,
      sampleDcs: draft.sampleDcs
    },
    tags: ['tool_description', 'xge', 'non_magical_default']
  },
  audit: audit(draft)
});

export const XGE_TOOL_DESCRIPTION_INTAKE: ItemIntakeEntry[] = [
  toolDescription({
    id: 'tool_descriptions_overview',
    name: '工具说明总则',
    englishName: 'Tool Descriptions Overview',
    notes: '本总则说明XGE工具条目的结构：组件、技能、特殊用途与难度示例。工具熟练项可在与相关技能配合时提供优势或额外信息，具体由DM裁定；这些好处只适用于具有对应工具熟练项的角色。'
  }),
  toolDescription({
    id: 'alchemists_supplies',
    name: '炼金工具',
    englishName: "Alchemist's Supplies",
    components: ['两只玻璃烧杯', '铁架台', '玻璃搅拌棒', '小研钵和药杵', '常用炼金术材料（盐、铁粉、纯净水）'],
    skills: {
      奥秘: '鉴定药水或类似物质时获得更多信息。',
      调查: '调查曾使用化合物或其他物质的区域时获得额外洞察。'
    },
    specialUses: {
      道具制作: '可制作炼金道具；原材料每磅50金币。长休中可制作一份强酸、炽火胶、抗毒剂、油、香水或香皂，并从原材料价值中扣除成品价值的一半。'
    },
    sampleDcs: [['制造一股浓烟', 10], ['鉴定一瓶药水', 10], ['鉴定一种物质', 15], ['点火', 15], ['中和强酸', 20]]
  }),
  toolDescription({
    id: 'brewers_supplies',
    name: '酿酒工具',
    englishName: "Brewer's Supplies",
    components: ['大玻璃罐', '酵母', '虹吸管', '几尺长的管子'],
    skills: {
      历史: '了解与酒相关的事件。',
      医药: '治疗酒精中毒或用酒精减轻疼痛时获得启示。',
      游说: '以私酿美酒改善关系。'
    },
    specialUses: {
      饮用水: '可用非饮用水蒸馏纯净水；长休蒸馏6加仑，短休蒸馏1加仑。'
    },
    sampleDcs: [['检查饮品中的毒素或杂质', 10], ['鉴定酒精饮料', 15], ['抵抗酒精的影响', 20]]
  }),
  toolDescription({
    id: 'calligraphers_supplies',
    name: '书法工具',
    englishName: "Calligrapher's Supplies",
    components: ['墨水', '一打羊皮纸', '三支羽毛笔'],
    skills: {
      奥秘: '可帮助判断魔法密文或鬼画符的作者。',
      历史: '分析古代文稿、卷轴、符文、壁画文字等文本时获得好处。'
    },
    specialUses: {
      解读藏宝图: '可用智力检定判断地图年代、隐藏信息或类似内容。'
    },
    sampleDcs: [['判断非魔法手迹的作者', 10], ['理解作者的心态', 15], ['现场伪造文稿', 15], ['伪造签名', 20]]
  }),
  toolDescription({
    id: 'carpenters_tools',
    name: '木匠工具',
    englishName: "Carpenter's Tools",
    components: ['锯子', '锤子', '钉子', '短斧', '角尺', '直尺', '扁斧', '木工刨', '凿子'],
    skills: {
      历史: '分辨木结构建筑和大型木制品的用途与来历。',
      调查: '调查木结构建筑时发现隐藏区域。',
      察觉: '发现木墙或地板的不自然之处以寻找陷阱门或秘密通道。',
      隐匿: '判断木地板薄弱点，避开发出嘎吱声。'
    },
    specialUses: {
      加固: '消耗原材料并加工1分钟，使门或窗的强行打开DC增加5。',
      临时住所: '长休中建造棚屋或类似遮蔽物，提供阴凉干燥休息环境，1d3日后倒塌。'
    },
    sampleDcs: [['建造简单的木结构', 10], ['设计复杂的木结构', 15], ['在木墙上找到薄弱点', 15], ['撬门', 20]]
  }),
  toolDescription({
    id: 'cartographers_tools',
    name: '制图工具',
    englishName: "Cartographer's Tools",
    components: ['鹅毛笔', '墨水', '羊皮纸', '圆规', '卡尺', '直尺'],
    skills: {
      奥秘历史宗教: '利用地图和定位知识挖掘更详细的信息，如隐藏信息或地图年代。',
      自然: '更容易回答或解释周遭地形问题。',
      求生: '帮助找路、判断村镇方向、避免迷路，并理解贸易路线与定居点模式。'
    },
    specialUses: {
      绘制地图: '旅行时，除参加其他活动外可以画地图。'
    },
    sampleDcs: [['确定地图的年代和来历', 10], ['估测地标的方向和距离', 15], ['辨别地图的真伪', 15], ['填补地图缺漏部分', 20]]
  }),
  toolDescription({
    id: 'cobblers_tools',
    name: '鞋匠工具',
    englishName: "Cobbler's Tools",
    components: ['锤子', '锥子', '小刀', '鞋架', '切刀', '备用皮革和线'],
    skills: {
      奥秘历史: '识别魔法靴的魔法属性或历史。',
      调查: '通过鞋子的磨损和污迹推断某人最近到过的地方，并判断磨损原因。'
    },
    specialUses: {
      修鞋: '长休中保养至多六名同伴的鞋；接下来24小时内，这些生物在需要对抗力竭豁免前可旅行至多10小时。',
      秘密夹层: '8小时工作可在一双鞋内制作秘密夹层，容纳至多长3寸、宽1寸物品；以带工具熟练的智力检定结果决定发现夹层的调查DC。'
    },
    sampleDcs: [['判断一双鞋子的年龄和来历', 10], ['找出鞋后跟的秘密夹层', 15]]
  }),
  toolDescription({
    id: 'cooks_utensils',
    name: '厨师工具',
    englishName: "Cook's Utensils",
    components: ['金属锅', '餐刀', '餐叉', '搅拌勺', '长柄勺'],
    skills: {
      历史: '从餐饮习惯中品味社会模式。',
      医药: '改善药物口感，使其更容易服用。',
      求生: '寻找食物时把他人认为不可食用的东西处理成可食用。'
    },
    specialUses: {
      准备饭菜: '短休中准备饭菜；你和至多五个选定生物每消耗一枚生命骰可额外恢复1点生命值，前提是能使用厨师工具且食材充足。'
    },
    sampleDcs: [['稍微改善伙食', 10], ['做一顿同样的饭', 10], ['检验饭菜中的毒素或杂质', 15]]
  }),
  toolDescription({
    id: 'disguise_kit',
    name: '易容工具',
    englishName: 'Disguise Kit',
    components: ['化妆品', '染发剂', '小道具', '几套衣服'],
    skills: {
      欺瞒: '伪装可提高撒谎能力。',
      恐吓: '合适伪装可让你看起来更可怕。',
      表演: '巧妙化妆可提升观众体验。',
      说服: '伪装成权威人物时更有说服力。'
    },
    specialUses: {
      易容: '长休中可制造一套伪装物品，之后花费1分钟变装；通常一次只能携带一套伪装，每套重1磅。其他时候，适当修改外观需10分钟，大幅改变外观需30分钟。'
    },
    sampleDcs: [['遮盖伤疤或特征性标记', 10], ['识破他人的伪装', 15], ['易容成另一个类人生物', 20]]
  }),
  toolDescription({
    id: 'forgery_kit',
    name: '文书伪造工具',
    englishName: 'Forgery Kit',
    components: ['不同类型的墨水', '各种羊皮纸和普通纸', '几支鹅毛笔', '印章和封蜡', '金银叶饰', '伪造蜡封的小型雕刻工具'],
    skills: {
      奥秘: '与奥秘技能搭配可鉴定魔法物品真伪。',
      欺瞒: '精心伪造文书可让谎言更可信。',
      历史: '更容易伪造历史文献或鉴定文献真伪。',
      调查: '检查物件时判断其制作方式和真伪。',
      其他工具: '其他工具熟练可提高赝品可信度，如结合制图工具制造假地图。'
    },
    specialUses: {
      快速伪造: '短休中可伪造不超过1页的假文书；长休中至多4页。以带工具熟练的智力检定结果决定他人识破赝品的调查DC。'
    },
    sampleDcs: [['伪造笔迹', 15], ['伪造蜡封', 20]]
  }),
  toolDescription({
    id: 'gaming_set',
    name: '赌博工具',
    englishName: 'Gaming Set',
    components: ['对应赌博游戏的全套赌具，如扑克牌或棋盘与棋子'],
    skills: {
      历史: '了解赌博历史、重要事件和相关历史名人。',
      洞悉: '赌博可帮助了解对手个性、分辨谎言和情绪。',
      巧手: '可用于出千，如棋子换位、藏牌、控制骰点，或趁赌局扒窃。'
    },
    sampleDcs: [['抓住作弊的玩家', 15], ['洞悉对手的个性', 15]]
  }),
  toolDescription({
    id: 'glassblowers_tools',
    name: '玻璃匠工具',
    englishName: "Glassblower's Tools",
    components: ['吹管', '小搓板', '模具', '工钳', '热源'],
    skills: {
      奥秘历史: '检查玻璃制品，如药剂瓶或藏宝库玻璃物品，并从残液、变形或色斑判断药水效果。',
      调查: '调查有碎玻璃或玻璃制品线索的区域时提供帮助。'
    },
    specialUses: {
      发现弱点: '研究玻璃制品1分钟后找出薄弱点，击打薄弱点造成双倍伤害。'
    },
    sampleDcs: [['判断玻璃的产地', 10], ['判断玻璃制品曾经装过什么', 20]]
  }),
  toolDescription({
    id: 'herbalism_kit',
    name: '草药工具',
    englishName: 'Herbalism Kit',
    components: ['装药材的袋子', '剪钳和皮手套', '研钵和药杵', '几个玻璃瓶'],
    skills: {
      奥秘: '研究植物魔法或鉴定药剂时获得额外洞察。',
      调查: '调查长有植物的区域时发现他人忽视的细节或线索。',
      医药: '提高使用药用植物治疗疾病和创伤的水平。',
      自然求生: '野外旅行时辨认植物并找到一般人不知道的食物来源。'
    },
    specialUses: {
      辨认植物: '仅凭外观和气味快速辨认大部分植物。'
    },
    sampleDcs: [['发现植物', 15], ['辨别药剂', 20]]
  }),
  toolDescription({
    id: 'jewelers_tools',
    name: '珠宝匠工具',
    englishName: "Jeweler's Tools",
    components: ['小锯', '小锤', '锉刀', '钳子', '镊子'],
    skills: {
      奥秘: '了解宝石的魔法用途，对宝石或镶嵌宝石物品进行奥秘检定时有用。',
      调查: '检查珠宝类物件时发现可能存在的线索。'
    },
    specialUses: {
      鉴定宝石: '快速鉴定宝石的种类和价值。'
    },
    sampleDcs: [['宝石外观加工', 15], ['鉴定宝石历史', 20]],
    auditIssues: ['原文英文写作“Eweler’s Tools”，根据中文“珠宝匠工具”和标准工具名规范化为“Jeweler’s Tools”。']
  }),
  toolDescription({
    id: 'land_and_water_vehicles',
    name: '水陆载具',
    englishName: 'Land and Water Vehicles',
    skills: {
      奥秘: '研究魔法载具时有助于想起传说或搞懂载具用法。',
      调查察觉: '检查载具上的线索或隐藏信息时发现他人忽略的信息。'
    },
    specialUses: {
      载具掌控: '驾驶载具时，可将熟练加值加到该载具的AC和豁免检定上。'
    },
    sampleDcs: [['在崎岖地形或困难水域行驶', 10], ['评估载具状况', 15], ['高速转向', 20]]
  }),
  toolDescription({
    id: 'leatherworkers_tools',
    name: '皮匠工具',
    englishName: "Leatherworker's Tools",
    components: ['小刀', '小木槌', '磨边机', '打孔器', '纺锤', '皮革碎料'],
    skills: {
      奥秘: '检查皮制魔法物品，如鞋子和部分斗篷时提供额外洞察。',
      调查: '研究皮制物品或相关线索时发现他人忽略的细节。'
    },
    specialUses: {
      皮革鉴定: '检查皮革物品时分辨皮料种类和特殊工艺。'
    },
    sampleDcs: [['皮革外观加工', 10], ['检定皮革制品的历史', 20]]
  }),
  toolDescription({
    id: 'masons_tools',
    name: '泥瓦匠工具',
    englishName: "Mason's Tools",
    components: ['泥刀', '锤子', '凿子', '刷子', '角尺'],
    skills: {
      历史: '确定石质建筑的建造日期、用途和可能的建造者。',
      调查: '检查石质建筑区域时获得额外洞察。',
      察觉: '在石墙或地板上发现不规则处，寻找陷阱门或秘密通道。'
    },
    specialUses: {
      拆迁: '发现砖石结构薄弱点；武器攻击对这类建筑造成双倍伤害。'
    },
    sampleDcs: [['在石墙上开个小洞', 10], ['找出石墙的薄弱点', 20]]
  }),
  toolDescription({
    id: 'musical_instruments',
    name: '乐器',
    englishName: 'Musical Instruments',
    skills: {
      历史: '回忆与乐器有关的知识。',
      表演: '将乐器融入表演时让表演更有张力。'
    },
    specialUses: {
      作曲: '长休中可为乐器谱写新曲子和歌词，用于打动贵族或在市井传唱故事。'
    },
    sampleDcs: [['辩论一首歌曲', 10], ['即兴创作歌曲', 20]]
  }),
  toolDescription({
    id: 'navigators_tools',
    name: '领航工具',
    englishName: "Navigator's Tools",
    components: ['六分仪', '罗盘', '卡尺', '直尺', '羊皮纸', '墨水', '鹅毛笔'],
    skills: {
      求生: '避免迷路，并推断最可能出现道路和定居点的位置。'
    },
    specialUses: {
      观测: '通过仔细测量，确定你在航海图上的位置和当前时间。'
    },
    sampleDcs: [['地图导航', 10], ['海图定位', 15]]
  }),
  toolDescription({
    id: 'painters_supplies',
    name: '画家工具',
    englishName: "Painter's Supplies",
    components: ['画架', '画布', '颜料', '画笔', '炭笔', '调色板'],
    skills: {
      奥秘历史宗教: '了解与艺术有关的知识，如画作魔法属性或奇怪壁画来历。',
      调查察觉: '检查画作或图画类艺术作品时获得额外洞察。'
    },
    specialUses: {
      作画: '短休或长休中创作简单艺术品，展现图像或场景，或快速还原见过的艺术品。'
    },
    sampleDcs: [['画一幅精确的肖像画', 10], ['创作带有隐藏信息的画作', 20]]
  }),
  toolDescription({
    id: 'poisoners_kit',
    name: '制毒工具',
    englishName: "Poisoner's Kit",
    components: ['玻璃瓶', '研钵和杵', '化学制剂', '玻璃搅拌棒'],
    skills: {
      历史: '回想与毒药有关的事件。',
      调查察觉: '检查有毒物品或搜索毒药相关线索时具有优势。',
      医药: '医治中毒患者时提供最佳处理知识。',
      自然求生: '分辨有毒动植物。'
    },
    specialUses: {
      操作毒药: '可安全操作或使用毒药，而不会令自身暴露在毒素环境中。'
    },
    sampleDcs: [['辨认有毒物件', 10], ['鉴定毒素效果', 20]]
  }),
  toolDescription({
    id: 'potters_tools',
    name: '陶匠工具',
    englishName: "Potter's Tools",
    components: ['穿刺针', '骨架刀', '刮刀', '小刀', '卡尺'],
    skills: {
      历史: '鉴定陶器的生产时间、可能产地或产地文化。',
      调查察觉: '检查陶器时从小细节发现线索。'
    },
    specialUses: {
      复原: '检查陶器碎片后推断物件原本完整形状及可能用途。'
    },
    sampleDcs: [['确认一件陶器装过什么', 10], ['制作一个可用的陶罐', 15], ['找出一件陶器的薄弱点', 20]]
  }),
  toolDescription({
    id: 'smiths_tools',
    name: '铁匠工具',
    englishName: "Smith's Tools",
    components: ['锤子', '钳子', '木炭', '破布', '磨刀石'],
    skills: {
      奥秘历史: '检查金属物体，如武器时获得额外洞察。',
      调查: '调查护甲、武器或其他金属制品时发现他人忽略的线索并推论。'
    },
    specialUses: {
      修复: '具备工具和足以热塑金属的明火时，每工作1小时为一件损坏金属制品恢复10点生命值。'
    },
    sampleDcs: [['磨刀', 10], ['修复一套护甲', 15], ['熔解非魔法金属物件', 15]]
  }),
  toolDescription({
    id: 'thieves_tools',
    name: '盗贼工具',
    englishName: "Thieves' Tools",
    components: ['小锉刀', '开锁器', '安装在金属柄上的小镜子', '窄刃剪刀', '镊子'],
    skills: {
      历史: '回答关于以陷阱出名的名胜问题时获得额外洞察。',
      调查察觉: '搜索陷阱时获得额外洞察，因为熟知各类陷阱外在迹象。'
    },
    specialUses: {
      设置陷阱: '短休中使用手头物品制造陷阱；检定结果作为发现或解除陷阱的DC。伤害由材料决定，或等同检定结果一半，由DM决定。'
    },
    sampleDcs: [['溜门撬锁', '可变'], ['解除陷阱', '可变']]
  }),
  toolDescription({
    id: 'tinkers_tools',
    name: '修补工具',
    englishName: "Tinker's Tools",
    components: ['各种手工用品', '针线', '磨刀石', '碎布料和皮料', '一小壶胶'],
    skills: {
      历史: '即使只剩碎片，也可确定物件年龄和来历。',
      调查: '检查损坏物件时推测损坏原因和时间。'
    },
    specialUses: {
      修复: '每工作1小时为一件损坏物件恢复10点生命值；必须有对应修补材料，金属制品还需要足以热塑金属的明火。'
    },
    sampleDcs: [['临时修复一件报废设备', 10], ['仅用一半时间修补物品', 15], ['利用废料制造临时物品', 20]]
  }),
  toolDescription({
    id: 'weavers_tools',
    name: '织布工具',
    englishName: "Weaver's Tools",
    components: ['针线', '碎布', '织布机知识（设备太大无法携带）'],
    skills: {
      奥秘历史: '检查纺织品时获得额外洞察，包括斗篷和长袍。',
      调查: '检查挂毯、布饰、服装或其他纺织品时发现他人忽略的线索并推论。'
    },
    specialUses: {
      缝补: '短休中修复一件损坏的纺织品。',
      制衣: '有足够布匹和线时，可在长休中为一个生物制作一套服装。'
    },
    sampleDcs: [['用废布做些小东西', 10], ['打补丁', 10], ['定制服装', 15]],
    auditIssues: ['原文“Weaver‘s Tools”使用弯引号，规范化为“Weaver’s Tools”。']
  }),
  toolDescription({
    id: 'woodcarvers_tools',
    name: '木雕工具',
    englishName: "Woodcarver's Tools",
    components: ['小刀', '凿子', '小锯子'],
    skills: {
      奥秘历史: '检查木制品，如雕像或箭时获得额外洞察。',
      自然: '检查树木时获得额外洞察。'
    },
    specialUses: {
      修复: '短休中修复一件损坏的木制品。',
      制箭: '短休中制作至多五支箭；长休中制作二十支，前提是有足够木料。'
    },
    sampleDcs: [['制作一个小木雕', 10], ['在木头上雕刻复杂花纹', 15]],
    auditIssues: ['原文“加工负责的木制品”疑为“加工复杂的木制品”，按语义摘取。']
  })
];
