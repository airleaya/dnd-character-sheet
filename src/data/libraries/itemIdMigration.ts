import { getLibraryItemById } from './itemLibrary';

export const LEGACY_ITEM_ID_MIGRATION: Record<string, string> = {
  bolts: 'crossbow_bolts'
};

export const migrateItemTemplateId = (templateId: string): string => {
  const migratedId = LEGACY_ITEM_ID_MIGRATION[templateId] ?? templateId;
  return getLibraryItemById(migratedId) ? migratedId : templateId;
};

export const isKnownLibraryItemId = (templateId: string): boolean => Boolean(getLibraryItemById(templateId));
