import { ITEM_LIBRARY } from '../libraries/itemLibrary';
import { SPELL_LIBRARY } from '../spells';
import type { RuntimeDataPack } from '../../types/DataPack';

export const DEFAULT_DND5E_DATA_PACK: RuntimeDataPack = {
  id: 'dnd5e-default',
  name: 'DND 5E默认数据',
  version: '0.14.3',
  builtin: true,
  enabled: true,
  sourceKind: 'builtin',
  manifest: {
    schemaVersion: 1,
    id: 'dnd5e-default',
    name: 'DND 5E默认数据',
    version: '0.14.3',
    author: 'letsDND',
    description: '内置 DND 5E 默认物品与法术数据',
  },
  itemMenuName: 'DND-5E物品仓库',
  spellMenuName: 'DND 5E法术全书',
  items: ITEM_LIBRARY,
  spells: SPELL_LIBRARY,
  traits: [],
};
