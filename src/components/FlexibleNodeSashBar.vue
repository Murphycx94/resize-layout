<template>
  <div class="fl-sash-bar" @mousedown="dragHandler"></div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useDrag } from './_composition'
import { IDragPosition } from '../types'

const { onDragStart, position, isMoving } = useDrag()

const emits = defineEmits<{
  (
    e: 'resize',
    v: IDragPosition
  ): void
}>()

watch(position, (e) => {
  emits('resize', e)
})
// isMoving TODO 未做拖动后的鼠标状态

const dragHandler = (e: Event) => {
  onDragStart(e)
}
</script>

<style lang="scss">
.fl-sash-bar {
  display: none;
  background-color: rgba(59, 130, 246, 0.5);
  opacity: 0;
  touch-action: none;
  &:hover {
    transition: opacity 0.1s ease-out 0.2s;
    opacity: 1;
  }
}
.fl-horizontal {
  .fl-sash-bar {
    top: 0;
    left: -2px;
    width: 4px;
    height: inherit;
    cursor: col-resize;
  }
}
.fl-vertical {
  .fl-sash-bar {
    top: -2px;
    left: 0;
    height: 4px;
    width: inherit;
    cursor: row-resize;
  }
}
</style>
