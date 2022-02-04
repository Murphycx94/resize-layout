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
  data.top = position.top
  data.left = position.left

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
 * 重新计算并设置各个节点最小尺寸，以及横纵最大成员数，并返回当前节点最小尺寸信息
 * @param data
 * @returns
 */
export const getNodeMinSize = (data: IData) => {
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

/**
 * 找到最近的一个可以借空间的成员
 * @param list
 * @param originIndex
 * @param action
 * @param key
 * @param threshold
 * @returns
 */
const findNeighbor = (
  list: IData[],
  originIndex: number,
  action: ActionEnum,
  key: 'width' | 'height',
  threshold: number
) => {
  let target
  let targetIndex

  if (action === ActionEnum.forward) {
    const len = list.length
    let i = originIndex + 1

    for (; i < len; i++) {
      const item = list[i]
      if (item[key] > threshold) {
        target = item
        targetIndex = i
        break
      }
    }
  } else if (action === ActionEnum.backward) {
    const len = 0
    let i = originIndex - 1

    for (; i >= len; i--) {
      const item = list[i]
      if (item[key] > threshold) {
        target = item
        targetIndex = i
        break
      }
    }
  }

  return target
    ? {
        index: targetIndex,
        target,
      }
    : null
}

type IKeys = { size: 'width' | 'height'; position: 'top' | 'left'; distance: 'xDistance' | 'yDistance' }

export const setSize = (data: IData, position: IDragPosition, index: number, disabledCallback?: () => void): void => {
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

  // 宽高阈值
  const threshold = Constant[keys.size]

  // 如果移动距离为零，则无需往下计算
  if (distance === 0) return

  const current = children[index]
  const next = children[index + 1]

  // 获取拖动方向
  const action = ActionEnum.getAction(distance)

  const neighbor = findNeighbor(children, index, action, keys.size, threshold)

  // console.log('======', neighbor)
  console.log('======', distance)

  // TODO 拖动同轴挤压

  // if (action === ActionEnum.forward) {
  //   const diff = distance
  //   const currentValue = current[keys.size] + distance
  // }
  extrusionHandler(children, Math.abs(distance), action, index, keys)

  // current[keys.size] = Math.max(current[keys.size] + distance, threshold)
  // next[keys.size] -= distance
  // next[keys.position] = useSafeNumber(next[keys.position]) + distance
}

const extrusionHandler = (
  list: IData[],
  distance: number,
  action: ActionEnum,
  originIndex: number,
  keys: IKeys
) => {
  if (action === ActionEnum.forward) {
    const len = list.length
    let i = originIndex + 1

    for (; i < len; i++) {
      const node = list[i]
      const remainder = node[keys.size] - distance
      const minValue = node.minSize[keys.size]

      const size = {
        height: node.height,
        width: node.width,
      }

      const position = {
        top: node.top,
        left: node.left,
      }

      size[keys.size] = Math.max(remainder, minValue)
      position[keys.position] = useSafeNumber(node[keys.position]) + distance

      useAutoResize(node, size, position)

      if (minValue > remainder) {
        distance = minValue - remainder
      } else {
        break
      }
    }
  } else if (action === ActionEnum.backward) {
  }
}
