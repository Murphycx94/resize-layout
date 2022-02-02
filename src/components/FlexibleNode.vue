<template>
    <div class="split-view-container" :class="[directionClassName]">
      <div class="split-view" v-for="item in data.children" :key="item.nodeId" :style="getViewStyle(item, direction)">
        <FlexibleNode :direction="item.direction" v-if="item.type === NodeTypeEnum.node" :data="item" />
        <FlexibleItem  v-else-if="item.type === NodeTypeEnum.item" :data="item" />
      </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IData } from '../types'
import { DirectionEnum, NodeTypeEnum } from '../enums'
import FlexibleItem from './FlexibleItem.vue'
import { getViewStyle } from './_utils';


const props = defineProps<{
  data: IData
  direction: DirectionEnum
}>()

const directionClassName = computed(() => {
  const name: Record<DirectionEnum, string> = {
    [DirectionEnum.unknown]: '',
    [DirectionEnum.horizontal]: 'fl-horizontal',
    [DirectionEnum.vertical]: 'fl-vertical',
  }
  return name[props.data.direction] || ''
})
</script>

<style lang="scss">
.split-view-container {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  .split-view {
    position: absolute;
  }
  &.fl-horizontal {
    & > .split-view {
      height: 100%;
    }
  }
  &.fl-vertical {
    & > .split-view {
      width: 100%;
    }
  }
}
</style>
