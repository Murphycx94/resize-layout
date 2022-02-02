<template>
  <div class="fl" ref="flRef">
    <div class="fl-resize-wrap" :style="sizeStyle">
    <div class="split-view-container">
      <FlexibleNode :data="data" :direction="data.direction" />
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, VueElement, computed, watch } from 'vue'
import { IData, ISize } from '../types'
import FlexibleNode from './FlexibleNode.vue'
import { useAutoResize } from './_utils'

const props = defineProps<{
  data: IData
}>()

const flRef = ref<Element>()

const originFlSize = reactive<ISize>({
  width: 0,
  height: 0,
})

const sizeStyle = computed(() => {
  return {
    width: `${originFlSize.width}px`,
    height: `${originFlSize.height}px`,
  }
})

const getOriginFlSize = (target: VueElement) => {
  if (target) {
    originFlSize.width = target.offsetWidth
    originFlSize.height = target.offsetHeight
  }
}

let count = 0

onMounted(() => {
  const resizeObserver = new ResizeObserver((entries) => {
    const [fl] = entries
    const target = fl.target as VueElement
    getOriginFlSize(target)
    useAutoResize(props.data, originFlSize)
  })
  if (flRef.value) {
    resizeObserver.observe(flRef.value)
  }
})
</script>

<style lang="scss">
.fl {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  .fl-resize-wrap {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}
</style>
