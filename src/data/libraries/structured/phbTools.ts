import { PHB_TOOL_INTAKE } from '../intake/phbTools';
import type { ItemIntakeEntry } from '../itemIntake';
import type { StructuredAuditField, StructuredToolGroup, StructuredToolItem } from './types';

const SOURCE = 'PHB';
const SOURCE_FILE = 'src/data/libraries/intake/phbTools.ts';
const CHECKED_AT = '2026-04-27';

type ParsedTool = NonNullable<ItemIntakeEntry['parsed']> & {
  id: string;
  name: string;
  type: 'tool';
  tags: [string];
};

const TOOL_GROUP_MAP: Record<string, StructuredToolGroup> = {
  工匠工具: 'artisan_tool',
  赌具: 'gaming_set',
  乐器: 'musical_instrument',
  通用工具: 'general_tool'
};

const isParsedTool = (entry: ItemIntakeEntry): entry is ItemIntakeEntry & { parsed: ParsedTool } =>
  entry.parsed?.type === 'tool' && Boolean(entry.parsed.id && entry.parsed.name && entry.parsed.tags?.[0]);

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

const tool = (entry: ItemIntakeEntry & { parsed: ParsedTool }): StructuredToolItem => {
  const names = splitDisplayName(entry.parsed.name);
  const toolGroupName = entry.parsed.tags[0];
  const subcategory = TOOL_GROUP_MAP[toolGroupName] ?? 'general_tool';
  const proficiencyAppliesTo = entry.parsed.description;
  const comparedFields = [
    field('id', entry.parsed.id, entry.parsed.id),
    field('name', names.name, splitDisplayName(entry.parsed.name).name),
    field('englishName', names.englishName, splitDisplayName(entry.parsed.name).englishName),
    field('source', SOURCE, SOURCE),
    field('category', 'tool', 'tool'),
    field('toolGroupName', toolGroupName, entry.parsed.tags[0]),
    field('cost', entry.parsed.cost, entry.parsed.cost),
    field('weight', entry.parsed.weight, entry.parsed.weight),
    field('description', entry.parsed.description, entry.parsed.description),
    field('proficiencyAppliesTo', proficiencyAppliesTo, entry.parsed.description)
  ];

  return {
    id: entry.parsed.id,
    name: names.name,
    englishName: names.englishName,
    source: SOURCE,
    category: 'tool',
    subcategory,
    cost: entry.parsed.cost,
    weight: entry.parsed.weight,
    description: entry.parsed.description,
    tags: entry.parsed.tags,
    toolGroupName,
    proficiencyAppliesTo,
    audit: audit(entry.id, comparedFields)
  };
};

export const STRUCTURED_PHB_TOOLS: StructuredToolItem[] = PHB_TOOL_INTAKE
  .filter(isParsedTool)
  .map((entry) => tool(entry));

export const STRUCTURED_PHB_TOOLS_AUDIT_SUMMARY = {
  total: STRUCTURED_PHB_TOOLS.length,
  sourceMatched: STRUCTURED_PHB_TOOLS.filter((item) => item.audit.sourceMatched).length,
  sourceMismatched: STRUCTURED_PHB_TOOLS.filter((item) => !item.audit.sourceMatched).length,
  intakeTotal: PHB_TOOL_INTAKE.length
};
