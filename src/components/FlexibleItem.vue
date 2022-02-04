<template>
  <div class="fl-item">{{ data.component }} 
  </div>
</template>

<script setup lang="ts">
import { IData } from '../types'

const props = defineProps<{
  data: IData
}>()


</script>


<style>
.fl-item {
  border: 1px solid #ccc;
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
