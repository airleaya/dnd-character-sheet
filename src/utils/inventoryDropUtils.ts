//src/utils/InventoryDropUtils.ts
/**
 * 计算物品在全局 Inventory 数组中应该插入的真实索引
 * @param viewList 当前视图可见的列表 (例如 rootItems 或 某背包的 childItems)
 * @param evt 拖拽事件对象 (包含 added 或 moved)
 * @param globalInventory Store 中的完整物品大数组
 * @returns 全局索引 number
 */
export const calcRealIndex = (viewList: any[], evt: any, globalInventory: any[]): number => {
  let visualIndex = 0;
  let targetVisualIndex = 0;

  // 1. 根据事件类型确定视觉索引
  if (evt.added) {
    visualIndex = evt.added.newIndex;
    // 【新增】：如果是新加入的物品，直接插在目标位置物品的前面
    targetVisualIndex = visualIndex;
  } else if (evt.moved) {
    visualIndex = evt.moved.newIndex;
    // 【排序】：如果是列表内排序，需要区分向上还是向下
    // 如果是向下拖 (0 -> 2)，目标位置的物品会因为我的离开而上移，所以我应该插在它【后面】(index + 1)
    // 如果是向上拖 (2 -> 0)，我直接插在它【前面】(index)
    const isMovingDown = evt.moved.newIndex > evt.moved.oldIndex;
    targetVisualIndex = isMovingDown ? visualIndex + 1 : visualIndex;
  } else {
    // 兜底
    return globalInventory.length;
  }

  // 2. 边界检查：如果目标位置超过了当前列表长度（即拖到了末尾）
  if (targetVisualIndex >= viewList.length) {
    // 找到当前列表的最后一个物品，插在它后面
    if (viewList.length > 0) {
      const lastItem = viewList[viewList.length - 1];
      const lastItemGlobalIndex = globalInventory.findIndex(i => i.instanceId === lastItem.instanceId);
      // 返回最后一个物品的全局位置 + 1
      return lastItemGlobalIndex === -1 ? globalInventory.length : lastItemGlobalIndex + 1;
    } else {
      // 空列表，直接放在全局最后
      return globalInventory.length;
    }
  }

  // 3. 普通情况：插在某个参考物品的前面
  const referenceItem = viewList[targetVisualIndex];
  
  if (!referenceItem) return globalInventory.length;

  const realIndex = globalInventory.findIndex(i => i.instanceId === referenceItem.instanceId);

  // 如果找不到，默认最后
  return realIndex === -1 ? globalInventory.length : realIndex;
};