import { CSSProperties, h, version } from 'vue'
import { IData, IPosition, ISize, IDragPosition, IKeys } from '../types'
import { ActionEnum, DirectionEnum, NodeTypeEnum, OutsideEnum } from '../enums'

const useSafeNumber = (v: string | number = 0, backup = 0) => Number(v) || backup

export class Constant {
  static readonly width = 220
  static readonly height = 80
  static readonly dragTriggerBase = 0.3
  static readonly dragDataKey = 'fl-drag-data'
}

/**
 * 当容器尺寸变化重新计算子节点宽高以及布局
 * @param data
 * @param size
 * @param position
 */
export const useAutoResize = (data: IData, size: ISize, position: IPosition = { top: 0, left: 0 }): void => {
  data.height = size.height
  data.width = size.width
  data.top = useSafeNumber(position.top)
  data.left = useSafeNumber(position.left)

  if (data.children?.length) {
    const children = data.children

    const sizeKey = data.direction === DirectionEnum.vertical ? 'height' : 'width'
    const positionKey = data.direction === DirectionEnum.vertical ? 'top' : 'left'

    // 依据排列方向，求总高度或总宽度
    const sum = children.reduce((s, c) => {
      s += useSafeNumber(c[sizeKey], 1)
      return s
    }, 0)

    const base = size[sizeKey]

    let positionValue = 0

    children.forEach((node, index) => {
      const currentSize = { ...size }

      let value = 0

      const currentPosition = { [positionKey]: positionValue }

      const minValue = node.minSize[sizeKey]

      // 最后一个不要按占比计算了，直接取剩余长度就可以了（因为每次取值四舍五入最后值可能会大于预期值）
      if (index === children.length - 1) {
        value = Math.max(base - positionValue, minValue)
      } else {
        value = Math.max(Math.floor((useSafeNumber(node[sizeKey], 1) / sum) * base), minValue)
        positionValue += value
      }

      currentSize[sizeKey] = value

      useAutoResize(node, currentSize, currentPosition)
    })
  }
}

/**
 * 计算并设置各个节点最小尺寸，以及横纵最大成员数，并返回当前节点最小尺寸信息
 * @param data
 * @returns
 */
export const calcNodeMinSize = (data: IData) => {
  const loop = (data: IData) => {
    let horizontal = 0
    let vertical = 0
    const count = data.children.length

    if (data.direction === DirectionEnum.horizontal) {
      horizontal += count
    } else if (data.direction === DirectionEnum.vertical) {
      vertical += count
    }

    let childrenH = 0
    let childrenV = 0

    data.children.forEach((c) => {
      const res = loop(c)
      childrenH = Math.max(childrenH, res.horizontal)
      childrenV = Math.max(childrenV, res.vertical)
    })

    horizontal += childrenH
    vertical += childrenV

    data.minSize = {
      width: Math.max(horizontal, 1) * Constant.width,
      height: Math.max(vertical, 1) * Constant.height,
      horizontal,
      vertical,
    }

    return {
      ...data.minSize,
    }
  }

  const res = loop(data)

  return res
}

/**
 * 传入宽高、排列方向，获得容器 style 对象
 * @param data
 * @param direction
 * @returns
 */
export const getViewStyle = (data: IData, direction: DirectionEnum): CSSProperties => {
  const sizeKey = direction === DirectionEnum.vertical ? 'height' : 'width'
  const positionKey = direction === DirectionEnum.vertical ? 'top' : 'left'

  return {
    [sizeKey]: data[sizeKey] + 'px',
    [positionKey]: data[positionKey] + 'px',
  }
}

export const getKeysByDirection = (direction: DirectionEnum): IKeys => {
  const keys: IKeys = {
    size: 'width',
    position: 'left',
    distance: 'xDistance',
    axis: 'x',
  }

  if (direction === DirectionEnum.vertical) {
    keys.size = 'height'
    keys.position = 'top'
    keys.distance = 'yDistance'
    keys.axis = 'y'
  }

  return keys
}

/**
 * 拖动计算并设置节点尺寸和位置信息，如果有返回值，说明已经拖到阈值之外了
 * @param data
 * @param position
 * @param index
 * @returns
 */
export const calcDragSize = (data: IData, position: IDragPosition, index: number, keys: IKeys): void => {
  const children = data.children

  const distance = position[keys.distance]

  // 获取拖动方向
  const action = ActionEnum.getAction(distance)

  // 如果移动距离为零，则无需往下计算
  if (action === ActionEnum.static) return

  const value = extrusionHandler(children, Math.abs(distance), action, index, keys)
}

/**
 * 传入节点信息，获取尺寸、位置信息
 * @param data
 * @returns
 */
export const getSize = (data: IData) => {
  const size = {
    height: data.height,
    width: data.width,
  }

  const position = {
    top: data.top,
    left: data.left,
  }
  return {
    size,
    position,
  }
}

/**
 * 获取连续节点的尺寸信息和最小尺寸信息之和，并计算出尺寸与最小尺寸的差值（可挤压的部分）
 * @param list
 * @param key
 * @returns
 */
export const getNodesSize = (list: IData[]) => {
  const res = list.reduce(
    (s, c) => {
      s.minSize.height += c.minSize.height
      s.minSize.width += c.minSize.width

      s.size.height += c.height
      s.size.width += c.width
      return s
    },
    { minSize: { height: 0, width: 0 }, size: { height: 0, width: 0 } }
  )
  return {
    ...res,
    diff: {
      width: res.size.width - res.minSize.width,
      height: res.size.height - res.minSize.height,
    },
  }
}

/**
 * 挤压节点函数
 * @param list
 * @param distance 挤压距离
 * @param action 方向
 * @param originIndex 节点 index
 * @param keys 挤压主轴所关联的 key（比如挤压的是高度还是宽度，x 轴还是 y 轴，用于取值）
 * @returns
 */
const extrusionHandler = (list: IData[], distance: number, action: ActionEnum, originIndex: number, keys: IKeys) => {
  if (action === ActionEnum.forward) {
    const len = list.length
    let i = originIndex

    // 把挤压出的空间分给被拉大的节点
    const current = list[originIndex - 1]
    const { size, position } = getSize(current)
    size[keys.size] += distance
    useAutoResize(current, size, position)

    // 计算被挤压的节点
    for (; i < len; i++) {
      const node = list[i]
      const remainder = node[keys.size] - distance
      const minValue = node.minSize[keys.size]

      const { size, position } = getSize(node)

      size[keys.size] = Math.max(remainder, minValue)
      position[keys.position] += distance

      useAutoResize(node, size, position)

      if (minValue > remainder) {
        distance = minValue - remainder
      } else {
        distance = 0
        break
      }
    }
  } else if (action === ActionEnum.backward) {
    const len = 0
    let i = originIndex - 1

    const current = list[originIndex]
    const { size, position } = getSize(current)
    size[keys.size] += distance
    position[keys.position] -= distance
    useAutoResize(current, size, position)

    for (; i >= len; i--) {
      const node = list[i]
      const remainder = node[keys.size] - distance
      const minValue = node.minSize[keys.size]

      const { size, position } = getSize(node)

      size[keys.size] = Math.max(remainder, minValue) // 剩余空间不能小于最小限制
      useAutoResize(node, size, position)

      if (i < originIndex - 1) {
        const prevNode = list[i + 1]
        const { size, position } = getSize(prevNode)
        position[keys.position] -= distance
        useAutoResize(prevNode, size, position)
      }

      if (minValue > remainder) {
        distance = minValue - remainder
      } else {
        distance = 0
        break
      }
    }
  }
}

/**
 * 获取鼠标点击相对容器的位置
 * @param x 鼠标相对视口的 x 轴位置
 * @param y 鼠标相对视口的 y 轴位置
 * @param position 容器左上角距离视口左上角的位置
 */
export const getRelativePosition = (x: number, y: number, position: { top: number; left: number }) => {
  return {
    x: x - position.left,
    y: y - position.top,
  }
}

/**
 * 获取安全的坐标，防止超出边界阈值
 * @param axis
 * @param threshold
 * @param key
 * @returns
 */
export const getSafeAxis = (
  axis: {
    x: number
    y: number
  },
  threshold: {
    min: number
    max: number
  },
  key: 'x' | 'y'
) => {
  const _axis = {
    ...axis,
  }

  _axis[key] = Math.max(threshold.min, _axis[key])
  _axis[key] = Math.min(threshold.max, _axis[key])

  let outsideDirection = OutsideEnum.none

  if (axis.x > _axis.x) {
    outsideDirection = OutsideEnum.e
  } else if (axis.x < _axis.x) {
    outsideDirection = OutsideEnum.w
  } else if (axis.y > _axis.y) {
    outsideDirection = OutsideEnum.s
  } else if (axis.y < _axis.y) {
    outsideDirection = OutsideEnum.n
  }

  return { ..._axis, outsideDirection }
}

export const getMoveThreshold = (data: IData, index: number, keys: IKeys) => {
  const children = data.children

  const leftList = children.slice(0, index)
  const rightList = children.slice(index)

  const leftSize = getNodesSize(leftList)
  const rightSize = getNodesSize(rightList)

  return {
    min: leftSize.minSize[keys.size],
    max: data[keys.size] - rightSize.minSize[keys.size],
  }
}

/**
 * 修改全局光标样式，拖拽修改尺寸大小时使用
 * @param globalCursor
 */
export const setGlobalCursor = (globalCursor?: string) => {
  // @ts-ignore
  if (!window._flGlobalCursorStyle) {
    // @ts-ignore
    window._flGlobalCursorStyle = document.createElement('style')
  }
  // @ts-ignore
  const styleEl = window._flGlobalCursorStyle

  if (globalCursor) {
    styleEl.innerHTML = globalCursor
    if (!styleEl.parentElement) {
      document.body.appendChild(styleEl)
    }
  } else if (styleEl.parentElement) {
    styleEl.parentElement.removeChild(styleEl)
  }
}

/**
 * 找到该节点的父节点
 * @param data
 * @param nodeId
 * @returns
 */
export const getNodeParent = (data: IData, nodeId: string): IData | undefined => {
  let target: IData | undefined
  data.children.forEach((node) => {
    if (target) return
    if (node.children.length) {
      target = getNodeParent(node, nodeId)
    } else if (nodeId === node.nodeId) {
      target = data
    }
  })

  return target
}

/**
 * 创建一个新的节点
 * @param data
 * @param children
 * @returns
 */
export const createFlNode = (data: Partial<IData> = {}, children: IData[] = []) => {
  return {
    nodeId: `${Math.random()}`, // TODO 待优化
    type: NodeTypeEnum.node,
    direction: DirectionEnum.horizontal,
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    minSize: { width: 0, height: 0, horizontal: 0, vertical: 0 },
    children,
    ...data,
  }
}

export const nodeToItem = (node: IData, item: IData) => {
  Object.assign(node, {
    children: [],
    nodeId: item.nodeId,
    type: item.type,
    component: item.component,
    direction: DirectionEnum.unknown,
    minSize: item.minSize,
  })
}

/**
 * 移除节点，移出完需要调用 calcNodeMinSize 重新计算最小尺寸
 * @param data 
 * @param full 
 * @returns 
 */
export const removeNode = (data: IData, full: IData) => {
  let targetParent = getNodeParent(full, data.nodeId)
  if (!targetParent) return

  const targetIndex = targetParent.children.findIndex((node) => node.nodeId === data.nodeId)

  targetParent.children.splice(targetIndex, 1)

  if (targetParent.children.length === 1) {
    if (targetParent.nodeId === full.nodeId) return
    nodeToItem(targetParent, targetParent.children[0])
  }
}

export const insetNode = (source: IData, target: IData, full: IData, type: OutsideEnum) => {
  let targetParent = getNodeParent(full, target.nodeId)
  if (!targetParent) return

  removeNode(source, full)

  // removeNode 之后需要重新找目标的父元素，因为如果source 和 target 是兄弟元素有可能会改变父元素结构的（但是这里很不优雅，需要优化）
  targetParent = getNodeParent(full, target.nodeId)

  if (!targetParent) return
  
  const direction = DirectionEnum.getDirection(type)
  const targetIndex = targetParent.children.findIndex((node) => node.nodeId === target.nodeId)


  if (direction === targetParent.direction) {
    // 西北插在目标前面，东南插在目标后面
    targetParent.children.splice(targetIndex + (OutsideEnum.isWN(type) ? 0 : 1), 0, source)
    targetParent.children.forEach((node) => {
      node.width = 0
      node.height = 0
    })
  } else {
    const children = [target]

    children.splice(OutsideEnum.isWN(type) ? 0 : 1, 0, source)

    const node = createFlNode({
      direction,
      width: target.width,
      height: target.height,
      top: target.top,
      left: target.left,
      children,
    })

    children.forEach((node) => {
      node.width = 0
      node.height = 0
    })

    targetParent.children.splice(targetIndex, 1, node)
  }

  calcNodeMinSize(full)
  useAutoResize(full, full)
}
