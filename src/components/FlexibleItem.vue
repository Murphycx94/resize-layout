<template>
  <div class="fl-item">{{ data.component }} 
  <h1>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate deleniti molestiae voluptate reiciendis veritatis praesentium! Numquam natus sequi vel perferendis inventore enim veniam iusto dignissimos soluta, maxime qui, sunt ad.</h1>
  <h1>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate deleniti molestiae voluptate reiciendis veritatis praesentium! Numquam natus sequi vel perferendis inventore enim veniam iusto dignissimos soluta, maxime qui, sunt ad.</h1>
  <h1>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate deleniti molestiae voluptate reiciendis veritatis praesentium! Numquam natus sequi vel perferendis inventore enim veniam iusto dignissimos soluta, maxime qui, sunt ad.</h1>
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
