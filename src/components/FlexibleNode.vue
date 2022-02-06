<template>
  <div class="fl-node">
    <div class="split-view-container" :class="[directionClassName]">
      <section
        class="split-view"
        v-for="item in data.children"
        :key="item.nodeId"
        :style="getViewStyle(item, direction)"
      >
        <FlexibleNode :direction="item.direction" v-if="item.type === NodeTypeEnum.node" :data="item" />
        <FlexibleItem @insert="onInsert" v-else-if="item.type === NodeTypeEnum.item" :data="item" />
      </section>
    </div>
    <FlexibleSash :data="data" :class="[directionClassName]" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FlexibleItem from './FlexibleItem.vue'
import FlexibleSash from './FlexibleSash.vue'

import { IData } from '../types'
import { DirectionEnum, NodeTypeEnum } from '../enums'
import { getViewStyle } from './_utils'

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

const onInsert = (e: IData) => {
  console.log(e)
}
</script>

<style lang="scss">
.fl-node {
  position: relative;
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
