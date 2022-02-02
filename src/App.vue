<template>
  <div class="app">
    <FlexibleLayout :data="data" />
  </div>
</template>

<script setup lang="ts">
import FlexibleLayout from './components/FlexibleLayout.vue'
import { reactive } from 'vue'
import { DirectionEnum, NodeTypeEnum } from './enums'
import { IData } from './types'

const data = reactive<IData>({
  type: NodeTypeEnum.node,
  direction: DirectionEnum.horizontal,
  nodeId: '1',
  width: 0,
  height: 0,
  top: 0,
  left: 0,
  children: [
    {
      nodeId: '2',
      type: NodeTypeEnum.item,
      direction: DirectionEnum.unknown,
      component: 'text1',
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      children: [],
    },
    {
      nodeId: '3',
      type: NodeTypeEnum.item,
      direction: DirectionEnum.unknown,
      component: 'text2',
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      children: [],
    },
    {
      nodeId: '4',
      type: NodeTypeEnum.node,
      direction: DirectionEnum.vertical,
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      children: [
        {
          nodeId: '5',
          type: NodeTypeEnum.item,
          direction: DirectionEnum.unknown,
          component: 'text3',
          width: 0,
          height: 0,
          top: 0,
          left: 0,
          children: [],
        },
        {
          nodeId: '6',
          type: NodeTypeEnum.item,
          direction: DirectionEnum.unknown,
          component: 'text4',
          width: 0,
          height: 0,
          top: 0,
          left: 0,
          children: [],
        },
        {
          nodeId: '7',
          type: NodeTypeEnum.item,
          direction: DirectionEnum.unknown,
          component: 'text5',
          width: 0,
          height: 0,
          top: 0,
          left: 0,
          children: [],
        },
      ],
    },
  ],
})
</script>

<style>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
.app {
  width: 100vw;
  height: 100vh;
}
.fl-node,
.fl-item,
.fl-resize-wrap {
  /* border: 1px solid #ccc; */
}
</style>
