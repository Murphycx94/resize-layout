<template>
  <div ref="fscr" class="fl-sash-container">
    <div
      @mousedown="onStart($event, index)"
      class="sash-bar"
      v-for="(item, index) in data.children"
      :key="item.nodeId"
      :style="`${keys.position}:${item[keys.position] - 2}px`"
      :class="[isMoving && currentIndex === index && 'hover', isMoving && currentIndex !== index && 'unhover']"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { throttle } from 'lodash'
import { computed, ref, VueElement, watch } from 'vue'
import { DirectionEnum, OutsideEnum } from '../enums'
import { IData } from '../types'
import {
  calcDragSize,
  getKeysByDirection,
  getMoveThreshold,
  getRelativePosition,
  getSafeAxis,
  setGlobalCursor,
} from './_utils'

const props = defineProps<{
  data: IData
}>()

const fscr = ref<VueElement>()

const fscrInfo = {
  top: 0,
  left: 0,
}

const position = ref({
  x: 0,
  y: 0,
  xDistance: 0,
  yDistance: 0,
})

const isMoving = ref(false)

const outside = ref<OutsideEnum>(OutsideEnum.none)

const currentIndex = ref(0)

let threshold: {
  min: number
  max: number
}

const keys = computed(() => {
  return getKeysByDirection(props.data.direction)
})

const globalCursor = computed(() => {
  let value
  if (isMoving.value) {
    switch (outside.value) {
      case OutsideEnum.e:
        value = 'w-resize'
        break
      case OutsideEnum.w:
        value = 'e-resize'
        break
      case OutsideEnum.n:
        value = 's-resize'
        break
      case OutsideEnum.s:
        value = 'n-resize'
        break
      default:
        break
    }

    if (!value) {
      switch (props.data.direction) {
        case DirectionEnum.horizontal:
          value = 'col-resize'
          break
        case DirectionEnum.vertical:
          value = 'row-resize'
          break
        default:
          break
      }
    }
  }
  return value && `* { cursor: ${value}!important}`
})

watch(globalCursor, (v) => {
  setGlobalCursor(v)
})

const onStart = (event: MouseEvent, index: number) => {
  if (!fscr.value) return

  isMoving.value = true

  const info = fscr.value.getBoundingClientRect()
  fscrInfo.top = info.top
  fscrInfo.left = info.left

  currentIndex.value = index

  const { x, y } = getRelativePosition(event.pageX, event.pageY, fscrInfo)

  threshold = getMoveThreshold(props.data, index, keys.value)

  position.value = {
    x,
    y,
    xDistance: 0,
    yDistance: 0,
  }

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onEnd)
  // 防止右键菜单弹出导致 bug，所以在拖动时先关闭右键菜单
  document.addEventListener('contextmenu', onContextmenu)
}

const onMove = throttle(
  (event: MouseEvent) => {
    if (!isMoving.value) return

    const { x, y, outsideDirection } = getSafeAxis(
      getRelativePosition(event.pageX, event.pageY, fscrInfo),
      threshold,
      keys.value.axis
    )

    outside.value = outsideDirection

    position.value = {
      x,
      y,
      xDistance: x - position.value.x,
      yDistance: y - position.value.y,
    }

    calcDragSize(props.data, position.value, currentIndex.value, keys.value)
  },
  16,
  { trailing: true, leading: true }
)

const onEnd = () => {
  isMoving.value = false
  outside.value = OutsideEnum.none
  currentIndex.value = 0

  document.removeEventListener('mousemove', onMove)
  document.removeEventListener('mouseup', onEnd)
  document.removeEventListener('contextmenu', onContextmenu)
}

const onContextmenu = (e: Event) => e.preventDefault()
</script>

<style lang="scss">
.fl-sash-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  .sash-bar {
    position: absolute;
    pointer-events: auto;
    background-color: rgba(59, 130, 246, 0.5);
    opacity: 0;
    touch-action: none;
    &:hover,
    &.hover {
      transition: opacity 0.1s ease-out 0.2s;
      opacity: 1;
    }
    &.unhover {
      opacity: 0;
    }
  }
  .sash-bar:first-of-type {
    display: none;
  }
  &.fl-horizontal {
    .sash-bar {
      width: 4px;
      height: 100%;
      cursor: col-resize;
    }
  }
  &.fl-vertical {
    .sash-bar {
      height: 4px;
      width: 100%;
      cursor: row-resize;
    }
  }
}
</style>
