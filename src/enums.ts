/** 排列方向 */
export enum DirectionEnum {
  unknown,
  horizontal,
  vertical,
}

export namespace DirectionEnum {
  export const getDirection = (value: OutsideEnum):DirectionEnum  => {
    if (value === OutsideEnum.w || value === OutsideEnum.e) return DirectionEnum.horizontal
    if (value === OutsideEnum.n || value === OutsideEnum.s) return DirectionEnum.vertical
    return DirectionEnum.unknown
  }
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
  none,
  n, // 北
  s, // 南
  w, // 西
  e, // 东
}

export namespace OutsideEnum {
  /**
   * 是否西或北
   * @param value 
   * @returns 
   */
  export const isWN = (value: OutsideEnum) => {
    return [OutsideEnum.n, OutsideEnum.w].includes(value)
  }
}
