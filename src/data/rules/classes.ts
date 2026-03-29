// 职业与子职静态数据字典
export interface ClassDef {
  id: string;
  name: string;
}

export interface SubclassDef {
  id: string;
  classId: string;
  name: string;
  source: string; // 出处 (例如 'phb')
}

// 占位符数据：主职
export const CLASS_DICTIONARY: ClassDef[] = [
  { id: '0', name: '诗人' }
];

// 占位符数据：子职
export const SUBCLASS_DICTIONARY: SubclassDef[] = [
  { id: '0-0', classId: '0', name: '雄辩学院', source: 'phb' }
];