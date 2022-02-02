import { computed, CSSProperties } from 'vue'
import { DirectionEnum } from '../enums'
import { IData } from '../types'

export const useComposition = (props: {
  data: IData
  direction: DirectionEnum
}) => {
  const styleInfo = computed<CSSProperties>(() => {
    const sizeKey = props.direction === DirectionEnum.vertical ? 'height' : 'width'
    const positionKey = props.direction === DirectionEnum.vertical ? 'top' : 'left'

    return {
      [sizeKey]: props.data[sizeKey] + 'px',
      [positionKey]: props.data[positionKey] + 'px',
    }
  })

  return {
    styleInfo
  }
}
