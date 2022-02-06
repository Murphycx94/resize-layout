<template>
  <div class="fl-item" @dragover="onDragOver" @dragleave="onDragLeave">
    <div draggable="true" @dragstart="onDragStart" class="fl-item-header" @dragend="onDragEnd">
      {{ data.component }}
    </div>
    <div>{{ content }}</div>
    <div>{{ data.nodeId }}</div>
    <FlexibleDropContainer :data="data" :is-active="isHovering" />
  </div>
</template>

<script setup lang="ts">
import { throttle } from 'lodash'
import { ref } from 'vue'
import { IData } from '../types'
import FlexibleDropContainer from './FlexibleDropContainer.vue'
import { Constant } from './_utils'

const props = defineProps<{
  data: IData,
}>()

const content = ref('content: ' + Math.random())

const isDragging = ref(false)

const isHovering = ref(false)

const onDragStart = (e: DragEvent) => {
  isDragging.value = true
  e?.dataTransfer?.setData(Constant.dragDataKey, JSON.stringify(props.data))
}

const onDragEnd = (e: DragEvent) => {
  isDragging.value = false
}

const onDragOver = throttle(
  (e: DragEvent) => {
    if (isDragging.value) return
    isHovering.value = true
  },
  100,
  {
    trailing: false,
  }
)

const onDragLeave = (e: DragEvent) => {
  if (isDragging.value) return
  isHovering.value = false
}
</script>

<style>
.fl-item {
  border: 1px solid #ccc;
  width: 100%;
  height: 100%;
  overflow: auto;
}
.fl-item-header {
  width: 100%;
  height: 36px;
  background-color: #ccc;
  border: 2px solid rgba(59, 130, 246, 0.5);
}
</style>
