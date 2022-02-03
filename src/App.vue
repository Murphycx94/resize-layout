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

<style lang="scss">
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  user-select: none;
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
/* 滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

/* 定义滚动条轨道 内阴影 + 圆角 */
/* ::-webkit-scrollbar-track {
} */

::-webkit-scrollbar-thumb:hover {
  background-color: #4f586b;
}

::-webkit-scrollbar-track:hover {
  border-radius: 2px;
  background-color: rgba($color: #343d4d, $alpha: 0.3);
}

/** 滚动条角落 */
::-webkit-scrollbar-corner {
  background: transparent;
}

/* 定义滑块 内阴影 + 圆角 */
::-webkit-scrollbar-thumb {
  border-radius: 2px;
  box-shadow: inset 0 0 6px rgba(26, 25, 25, 0.3);
  -webkit-box-shadow: inset 0 0 6px rgba(26, 25, 25, 0.3);
  background-color: #343d4d;
}

</style>
