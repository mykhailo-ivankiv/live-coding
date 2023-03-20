<script setup lang="ts">
import { DragState } from '@vueuse/gesture'
import { ref } from 'vue'
import { translate, compose, toCSS, scale, inverse, applyToPoint } from 'transformation-matrix'

const matrix = ref(translate(0, 0))

const elements = ref([
  { x: 100, y: 100, height: 100, width: 100, color: 'bg-red-200' },
  { x: 150, y: 150, height: 100, width: 100, color: 'bg-blue-200' },
])

const selectedElement = ref(null)
const isDragging = ref(false)
const dragHandler = ({ delta: [x, y], dragging }: DragState) => {
  matrix.value = compose(translate(x, y), matrix.value)
}

const wheelHandler = ({ delta, event, first, last }: DragState) => {
  if (first) isDragging.value = true
  if (last) isDragging.value = false

  const zoom = 1 + delta[1] / 1000

  // matrix.current.a === zoom
  if (zoom > 1 && matrix.value.a >= 4) return matrix
  if (zoom < 1 && matrix.value.a <= 0.1) return matrix

  matrix.value = compose(scale(zoom, zoom, event.clientX, event.clientY), matrix.value)
}

const addRect = (ev) => {
  if (isDragging) return

  const [x, y] = applyToPoint(inverse(matrix.value), [ev.clientX, ev.clientY])

  elements.value.push({ x, y, height: 100, width: 100, color: 'bg-green-600' })
}
</script>

<template>
  <div @click="addRect" v-drag="dragHandler" v-wheel="wheelHandler" class="absolute inset-0 overflow-hidden">
    <div class="absolute bg-yellow-300/60 h-0 w-0" :style="{ transform: toCSS(matrix) }">
      <div
        v-for="element in elements"
        :class="element.color + ' absolute'"
        :style="{
          left: element.x + 'px',
          top: element.y + 'px',
          height: element.height + 'px',
          width: element.width + 'px',
        }"
      />
      <div
        v-for="element in elements"
        class="rounded-full absolute bg-indigo-300 z-50 transform -translate-x-1/2 -translate-y-1/2"
        :style="{
          left: element.x + element.height / 2 + 'px',
          top: element.y + element.width / 2 + 'px',
          height: 5 + 'px',
          width: 5 + 'px',
        }"
      />
    </div>

    <div
      v-for="element in elements"
      class="rounded-full absolute bg-blue-700 z-50 transform -translate-x-1/2 -translate-y-1/2"
      :style="{
        left: applyToPoint(matrix, { x: element.x + element.height / 2, y: element.y + element.width / 2 }).x + 'px',
        top: applyToPoint(matrix, { x: element.x + element.height / 2, y: element.y + element.width / 2 }).y + 'px',
        height: 5 + 'px',
        width: 5 + 'px',
      }"
    />
  </div>
</template>
