import { CSSProperties, h, version } from 'vue'
import { IData, IPosition, ISize, IDragPosition } from '../types'
import { ActionEnum, DirectionEnum } from '../enums'

const useSafeNumber = (v: string | number = 0, backup = 0) => Number(v) || backup

class Constant {
  static readonly width = 220
  static readonly height = 80
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
        value = Math.max(Math.round((useSafeNumber(node[sizeKey], 1) / sum) * base), minValue)
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

type IKeys = { size: 'width' | 'height'; position: 'top' | 'left'; distance: 'xDistance' | 'yDistance' }

/**
 * 拖动计算并设置节点尺寸和位置信息，如果有返回值，说明已经拖到阈值之外了
 * @param data 
 * @param position 
 * @param index 
 * @returns 
 */
export const calcDragSize = (
  data: IData,
  position: IDragPosition,
  index: number
): { action: ActionEnum; direction: DirectionEnum } | undefined => {
  const keys: IKeys = {
    size: 'width',
    position: 'left',
    distance: 'xDistance',
  }

  if (data.direction === DirectionEnum.vertical) {
    keys.size = 'height'
    keys.position = 'top'
    keys.distance = 'yDistance'
  }

  const children = data.children

  const distance = position[keys.distance]

  // 获取拖动方向
  const action = ActionEnum.getAction(distance)

  // 如果移动距离为零，则无需往下计算
  if (action === ActionEnum.static) return {
    action,
    direction: data.direction,
  }

  const value = extrusionHandler(children, Math.abs(distance), action, index, keys)

  if (value === 0) {
    return {
      action,
      direction: data.direction,
    }
  }
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
    let i = originIndex + 1
    const leftList = list.slice(i)

    const { diff } = getNodesSize(leftList)

    const threshold = diff[keys.size] // 可以挤压的空间
    distance = Math.min(threshold, distance) // 挤压距离不能超出挤压空间
    const value = distance // 可以挤压出的空间

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

    // 计算好被挤压的节点之后，可以把挤压出的空间分给被拉大的节点
    if (value) {
      const current = list[originIndex]
      const { size, position } = getSize(current)
      size[keys.size] += value

      useAutoResize(current, size, position)
    }

    return value
  } else if (action === ActionEnum.backward) {
    const len = 0
    let i = originIndex
    const rightList = list.slice(0, i + 1)

    const { diff } = getNodesSize(rightList)

    const threshold = diff[keys.size]

    distance = Math.min(threshold, distance)
    const value = distance // 可以挤压出的空间

    for (; i >= len; i--) {
      const node = list[i]
      const remainder = node[keys.size] - distance
      const minValue = node.minSize[keys.size]

      const { size, position } = getSize(node)

      size[keys.size] = Math.max(remainder, minValue) // 剩余空间不能小于最小限制
      useAutoResize(node, size, position)

      if (i < originIndex) {
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

    // 计算好被挤压的节点之后，可以把挤压出的空间分给被拉大的节点
    if (value) {
      const current = list[originIndex + 1]
      const { size, position } = getSize(current)
      size[keys.size] += value
      position[keys.position] -= value

      useAutoResize(current, size, position)
    }

    return value
  }
}
