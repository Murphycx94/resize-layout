import { throttle } from 'lodash'
import { ref } from 'vue'
import { IDragPosition } from '../types'

/**
 * 拖拽 composition
 * @returns {
 *  onDragStart: @mousedown="onDragStart" 拖拽开始的回调
 *  position: { x: 鼠标 x 坐标，y: 鼠标 y 坐标，xDistance: 本次移动的 x 轴距离，yDistance: 本次移动的 y 轴距离 }
 * }
 */
 export const useDrag = () => {
  const isMoving = ref(false)

  const position = ref<IDragPosition>({
    x: 0,
    y: 0,
    xDistance: 0,
    yDistance: 0,
  })

  const onDragStart = (e: Event) => {
    console.log('=====start', e.target)
    const event = e as MouseEvent
    
    isMoving.value = true

    position.value = {
      x: event.pageX,
      y: event.pageY,
      xDistance: 0,
      yDistance: 0,
    }

    document.addEventListener('mousemove', onDragMove)
    document.addEventListener('mouseup', onDragEnd)
  }

  const onDragMove = throttle((e: MouseEvent) => {
    updateHandler(e.pageX, e.pageY)
  }, 16, { trailing: true, leading: true })

  const onDragEnd = () => {
    isMoving.value = false

    document.removeEventListener('mousemove', onDragMove)
    document.removeEventListener('mouseup', onDragEnd)
  }

  const updateHandler = (x: number, y: number) => {
    const xDistance = x - position.value.x
    const yDistance = y - position.value.y

    position.value = {
      x,
      y,
      xDistance,
      yDistance,
    }
  }

  return {
    onDragStart,
    position,
    isMoving,
  }
}
