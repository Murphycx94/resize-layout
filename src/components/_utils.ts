import { CSSProperties } from 'vue'
import { IData, IPosition, ISize } from '../types'
import { DirectionEnum, NodeTypeEnum } from '../enums'

const useSafeNumber = (v: string | number = 0, backup = 0) => Number(v) || backup

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

      // 最后一个不要按占比计算了，直接取剩余长度就可以了（因为每次取值四舍五入最后值可能会大于预期值）
      if (index === children.length - 1) {
        value = base - positionValue
      } else {
        value = Math.round((useSafeNumber(node[sizeKey], 1) / sum) * base)
        positionValue += value
      }

      currentSize[sizeKey] = value

      useAutoResize(node, currentSize, currentPosition)
    })
  }
}

export const getViewStyle = (data: IData, direction: DirectionEnum): CSSProperties => {
  const sizeKey = direction === DirectionEnum.vertical ? 'height' : 'width'
  const positionKey = direction === DirectionEnum.vertical ? 'top' : 'left'

  return {
    [sizeKey]: data[sizeKey] + 'px',
    [positionKey]: data[positionKey] + 'px',
  }
}
