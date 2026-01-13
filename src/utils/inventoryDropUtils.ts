//src/utils/InventoryDropUtils.ts


// 传递数据的全局变量
let _globalDragPayload: any = null;
// 获取数据接口
export const getGlobalDragPayload = () => {
  return _globalDragPayload;
};
export const clearGlobalDragPayload = () => {
  _globalDragPayload = null;
}

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


/**
 * 设置拖拽数据的通用工具函数 (修正版)
 * 1. 同步写入数据：确保铁匠铺/垃圾桶能接收到数据。
 * 2. 使用标记防冲突：确保拖拽子物品时，父容器不会被一起拖走。
 * 3. 允许冒泡：确保 vuedraggable 排序功能正常工作。
 */
export const setupDragData = (
  e: DragEvent, 
  type: 'inventory-item' | 'library-item', 
  id: string,
  _unusedStopPropagation?: boolean 
) => {
  if (!e.dataTransfer) {
    console.error('❌ [DRAG START] No dataTransfer object found!');
    return;}

  // 🛑 智能防冲突逻辑
  // 检查事件是否已经被“更深层级”的子组件处理过
  if ((e as any).__dragHandled) {
    console.log('⚠️ [DRAG START] Prevented by child element');
    // 如果已经处理过，我们什么都不做，直接返回。
    // 这意味着当前层级（父容器）不会覆盖数据，也不会被视为拖拽源。
    return;
  }
  
  // 🏷️ 标记事件已被处理
  // 这行代码会跟随事件冒泡，后续的父级 handler 都能看到这个标记
  (e as any).__dragHandled = true;

  // 📦 准备数据
  const payload = {
    type,
    ...(type === 'inventory-item' ? { instanceId: id } : { id: id })
  };
  
  // ✨ 同步写入 (关键修正)
  // 必须在当前 tick 完成，否则原生 drop 区域读取不到数据
  const jsonStr = JSON.stringify(payload);  
  // 同时写入全局变量中
  _globalDragPayload = jsonStr
  e.dataTransfer.setData('text/plain', jsonStr);
  e.dataTransfer.effectAllowed = 'copyMove';

  // ⚠️ 关键：不要调用 stopPropagation()
  // 让事件继续冒泡，vuedraggable (Sortable.js) 监听的是容器层的事件，
  // 只有冒泡上去，它才能检测到拖拽并启动排序逻辑。
};