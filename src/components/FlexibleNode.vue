<template>
  <div class="fl-node">
    <div class="split-view-container" :class="[directionClassName]">
      <section
        class="split-view"
        v-for="(item, index) in data.children"
        :key="item.nodeId"
        :style="getViewStyle(item, direction)"
      >
        <FlexibleNode :direction="item.direction" v-if="item.type === NodeTypeEnum.node" :data="item" />
        <FlexibleItem v-else-if="item.type === NodeTypeEnum.item" :data="item" />
        <FlexibleNodeSashBar :data="item" :direction="data.direction" @resize="(e) => onViewResize(e, index)" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FlexibleItem from './FlexibleItem.vue'
import FlexibleNodeSashBar from './FlexibleNodeSashBar.vue'
import { IData, IDragPosition } from '../types'
import { DirectionEnum, NodeTypeEnum } from '../enums'
import { getViewStyle, setSize } from './_utils'

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

/** @method */
const onViewResize = (position: IDragPosition, index: number) => {
  setSize(props.data, position, index - 1)
}
</script>

<style lang="scss">
.fl-node {
  width: 100%;
  height: 100%;
}
.split-view-container {
  position: relative;
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
  .split-view + .split-view {
    .fl-sash-bar {
      display: block;
      position: absolute;
    }
  }
}
</style>
