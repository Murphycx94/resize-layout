/** 排列方向 */
export enum DirectionEnum {
  unknown,
  horizontal,
  vertical,
}

/** 节点类型 */
export enum NodeTypeEnum {
  item,
  node,
}

/** 拖拽方向 */
export enum ActionEnum {
  forward, // 向前
  backward, // 向后
  static, // 静止
}

export namespace ActionEnum {
  export const getAction = (value: number = 0) => {
    if (value > 0) return ActionEnum.forward
    if (value < 0) return ActionEnum.backward
    return ActionEnum.static
  }
}

/** 出界方向 */
export enum OutsideEnum {
  n, // 北
  s, // 南
  w, // 西
  e, // 东
}
