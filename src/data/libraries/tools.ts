import { ITEM_LIBRARY } from './itemLibrary';
import type { ToolDefinition } from '../../types/Library';

export const TOOL_LIBRARY: ToolDefinition[] = ITEM_LIBRARY.filter(
  (item): item is ToolDefinition => item.type === 'tool'
);
