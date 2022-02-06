import { throttle, uniqueId } from 'lodash'
import { ref, provide, inject, Ref } from 'vue'
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
    id: '',
  })

  const onDragStart = (e: Event) => {
    const event = e as MouseEvent

    isMoving.value = true

    position.value = {
      x: event.pageX,
      y: event.pageY,
      xDistance: 0,
      yDistance: 0,
      id: uniqueId('fl-drag')
    }

    document.addEventListener('mousemove', onDragMove)
    document.addEventListener('mouseup', onDragEnd)
     // 防止右键菜单弹出导致 bug，所以在拖动时先关闭右键菜单
    document.addEventListener('contextmenu', onContextmenu)
  }

  const onContextmenu = (e: Event) => e.preventDefault()

  const onDragMove = throttle(
    (e: MouseEvent) => {
      updateHandler(e.pageX, e.pageY)
    },
    16,
    { trailing: true, leading: true }
  )

  const onDragEnd = () => {
    isMoving.value = false

    document.removeEventListener('mousemove', onDragMove)
    document.removeEventListener('mouseup', onDragEnd)
    document.removeEventListener('contextmenu', onContextmenu)
  }


  const updateHandler = (x: number, y: number) => {
    const xDistance = x - position.value.x
    const yDistance = y - position.value.y

    position.value = {
      x,
      y,
      xDistance,
      yDistance,
      id: position.value.id
    }
  }

  return {
    onDragStart,
    position,
    isMoving,
  }
}

type IUseDraggable = {
  isActive: Ref<boolean>;
  changeHandler: (v: boolean) => boolean;
}
const draggableKey = 'fl-draggable-key'
export const useDraggableInit = () => {
  const isActive = ref(false)

  const changeHandler = (v: boolean) => isActive.value = v

  provide(draggableKey, {
    isActive,
    changeHandler
  })
}

export const useDraggable = (): IUseDraggable => {
  return inject(draggableKey) as IUseDraggable
}
