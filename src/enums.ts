/** 排列方向 */
export enum DirectionEnum {
  unknown,
  horizontal,
  vertical,
}

export enum NodeTypeEnum {
  item,
  node
}

export enum ActionEnum {
  forward,
  backward,
  static
}

export namespace ActionEnum {
  export const getAction = (value: number = 0) => {
    if (value > 0) return ActionEnum.forward
    if (value < 0) return ActionEnum.backward
    return ActionEnum.static
  }
}
