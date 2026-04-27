import { XGE_TOOL_DESCRIPTION_INTAKE } from '../intake/xgeToolDescriptions';
import type { ItemIntakeEntry } from '../itemIntake';
import type { StructuredAuditField } from './types';

const SOURCE = 'XGE';
const SOURCE_FILE = 'src/data/libraries/intake/xgeToolDescriptions.ts';
const CHECKED_AT = '2026-04-27';

export interface StructuredToolSampleDc {
  task: string;
  dc: number | '可变';
}

export interface StructuredToolDescription {
  id: string;
  name: string;
  englishName?: string;
  source: string;
  linkedToolIds: string[];
  components?: string[];
  skills?: Record<string, string>;
  specialUses?: Record<string, string>;
  sampleDcs?: StructuredToolSampleDc[];
  description?: string;
  tags?: string[];
  audit: {
    sourceIntakeId: string;
    sourceFile: string;
    checkedAt: string;
    sourceMatched: boolean;
    comparedFields: StructuredAuditField[];
    issues: string[];
  };
}

type ParsedXgeToolDescription = NonNullable<ItemIntakeEntry['parsed']> & {
  id: string;
  name: string;
  xgeToolDescription?: {
    components?: string[];
    skills?: Record<string, string>;
    specialUses?: Record<string, string>;
    sampleDcs?: Array<[string, number | '可变']>;
  };
};

const MULTI_TOOL_LINKS: Record<string, string[]> = {
  gaming_set: ['dice_set', 'dragonchess_set', 'playing_card_set', 'three_dragon_ante_set'],
  land_and_water_vehicles: ['land_vehicles', 'water_vehicles'],
  musical_instruments: ['bagpipes', 'drum', 'dulcimer', 'flute', 'horn', 'lute', 'lyre', 'pan_flute', 'shawm', 'viol'],
  tool_descriptions_overview: []
};

const isParsedDescription = (
  entry: ItemIntakeEntry
): entry is ItemIntakeEntry & { parsed: ParsedXgeToolDescription } =>
  Boolean(entry.parsed?.id && entry.parsed?.name);

const splitDisplayName = (displayName: string) => {
  const match = /^(.+?) \((.*)\)$/.exec(displayName);

  return {
    name: match?.[1] ?? displayName,
    englishName: match?.[2]
  };
};

const field = (fieldName: string, structuredValue: unknown, sourceValue: unknown): StructuredAuditField => ({
  field: fieldName,
  structuredValue,
  sourceValue,
  matched: JSON.stringify(structuredValue) === JSON.stringify(sourceValue)
});

const audit = (sourceIntakeId: string, comparedFields: StructuredAuditField[], issues: string[] = []) => {
  const driftIssues = comparedFields
    .filter((entry) => !entry.matched)
    .map((entry) => `${entry.field} differs from intake value.`);

  return {
    sourceIntakeId,
    sourceFile: SOURCE_FILE,
    checkedAt: CHECKED_AT,
    sourceMatched: comparedFields.every((entry) => entry.matched),
    comparedFields,
    issues: [...issues, ...driftIssues]
  };
};

const linkedToolIdsFor = (id: string) => MULTI_TOOL_LINKS[id] ?? [id];

const toolDescription = (entry: ItemIntakeEntry & { parsed: ParsedXgeToolDescription }): StructuredToolDescription => {
  const names = splitDisplayName(entry.parsed.name);
  const detail = entry.parsed.xgeToolDescription ?? {};
  const sampleDcs = detail.sampleDcs?.map(([task, dc]) => ({ task, dc }));
  const linkedToolIds = linkedToolIdsFor(entry.parsed.id);
  const issues = entry.parsed.id === 'land_and_water_vehicles'
    ? ['This XGE record describes vehicle proficiencies; linked vehicle ids are resolved in the PHB mounts and vehicles batch.']
    : [];
  const comparedFields = [
    field('id', entry.parsed.id, entry.parsed.id),
    field('name', names.name, splitDisplayName(entry.parsed.name).name),
    field('englishName', names.englishName, splitDisplayName(entry.parsed.name).englishName),
    field('source', SOURCE, SOURCE),
    field('linkedToolIds', linkedToolIds, linkedToolIdsFor(entry.parsed.id)),
    field('components', detail.components, detail.components),
    field('skills', detail.skills, detail.skills),
    field('specialUses', detail.specialUses, detail.specialUses),
    field('sampleDcs', sampleDcs, detail.sampleDcs?.map(([task, dc]) => ({ task, dc }))),
    field('description', entry.parsed.description, entry.parsed.description),
    field('tags', entry.parsed.tags, entry.parsed.tags)
  ];

  return {
    id: entry.parsed.id,
    name: names.name,
    englishName: names.englishName,
    source: SOURCE,
    linkedToolIds,
    components: detail.components,
    skills: detail.skills,
    specialUses: detail.specialUses,
    sampleDcs,
    description: entry.parsed.description,
    tags: entry.parsed.tags,
    audit: audit(entry.id, comparedFields, issues)
  };
};

export const STRUCTURED_XGE_TOOL_DESCRIPTIONS: StructuredToolDescription[] = XGE_TOOL_DESCRIPTION_INTAKE
  .filter(isParsedDescription)
  .map((entry) => toolDescription(entry));

export const STRUCTURED_XGE_TOOL_DESCRIPTIONS_AUDIT_SUMMARY = {
  total: STRUCTURED_XGE_TOOL_DESCRIPTIONS.length,
  sourceMatched: STRUCTURED_XGE_TOOL_DESCRIPTIONS.filter((item) => item.audit.sourceMatched).length,
  sourceMismatched: STRUCTURED_XGE_TOOL_DESCRIPTIONS.filter((item) => !item.audit.sourceMatched).length,
  intakeTotal: XGE_TOOL_DESCRIPTION_INTAKE.length
};
