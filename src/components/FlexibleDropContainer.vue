<template>
  <div
    class="fl-drop-container"
    ref="fdc"
    v-show="_isActive"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div class="fl-drop-mask" :style="maskStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, VueElement, watch } from 'vue'
import { OutsideEnum } from '../enums'
import { IData } from '../types'
import { Constant, getRelativePosition } from './_utils'

const emits = defineEmits<{
  (e: 'insert', data: IData): void
}>()


const props = defineProps<{
  isActive: boolean
  data: IData
}>()

let position = {
  top: 0,
  left: 0,
  width: 0,
  height: 0,
}

let hT = Constant.width * Constant.dragTriggerBase // 横向阈值
let vT = Constant.height * Constant.dragTriggerBase // 纵向阈值

const fdc = ref<VueElement>()

const _isActive = ref(false)

// 以当前元素左上角为坐标轴的光标位置
const cursorPosition = ref({
  x: 0,
  y: 0,
})

const activeArea = computed(() => {
  const { x, y } = cursorPosition.value
  const t = getThreshold()

  if (x <= t.x1) {
    return OutsideEnum.w
  } else if (x >= t.x2) {
    return OutsideEnum.e
  } else if (y <= t.y1) {
    return OutsideEnum.n
  } else if (y >= t.y2) {
    return OutsideEnum.s
  }
  return OutsideEnum.e
})

// TODO 待优化
const maskStyle = computed(() => {
  const { x, y } = cursorPosition.value
  const t = getThreshold()
  const transition = 'all .1s ease-out'

  const vSize = { width: '100%', height: '50%' }
  const hSize = { width: '50%', height: '100%' }

  if (x <= t.x1) {
    return {
      top: 0,
      left: 0,
      transition,
      ...hSize,
    }
  } else if (x >= t.x2) {
    return {
      top: 0,
      left: '50%',
      transition,
      ...hSize,
    }
  } else if (y <= t.y1) {
    return {
      top: 0,
      left: 0,
      transition,
      ...vSize,
    }
  } else if (y >= t.y2) {
    return {
      top: '50%',
      left: 0,
      transition,
      ...vSize,
    }
  }
  return { top: 0, left: 0, width: '100%', height: '100%', transition }
})

watch(
  () => props.isActive,
  (v) => {
    if (v) _isActive.value = true
  }
)

watch(_isActive, (v) => {
  if (v) {
    nextTick(() => {
      if (fdc.value) {
        position = fdc.value.getBoundingClientRect()
        getThreshold() // 更新触发阈值
      }
    })
  }
})

const onDragOver = (e: DragEvent) => {
  cursorPosition.value = getRelativePosition(e.pageX, e.pageY, position)
  e.preventDefault()
  return false
}

const onDragLeave = (e: DragEvent) => {
  _isActive.value = false
}

const getThreshold = () => {
  hT = Math.floor(Math.max(Constant.width, position.width) * Constant.dragTriggerBase)
  vT = Math.floor(Math.max(Constant.height, position.height) * Constant.dragTriggerBase)

  return {
    x1: hT,
    x2: position.width - hT,
    y1: vT,
    y2: position.height - vT,
  }
}

const onDrop = (e: DragEvent) => {
  _isActive.value = false
  console.log('========', props.isActive, _isActive.value)
  const json = e?.dataTransfer?.getData(Constant.dragDataKey)
  if (json) {
    const data = JSON.parse(json)
    if (data.nodeId) {
      emits('insert', data)
    }
  }
}
</script>

<style lang="scss">
.fl-drop-container {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  .fl-drop-mask {
    position: absolute;
    background-color: rgba(0, 255, 0, 0.2);
    pointer-events: none;
  }
}
</style>
