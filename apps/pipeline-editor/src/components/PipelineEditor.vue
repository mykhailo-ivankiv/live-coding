<script setup lang="ts">
import JsonEditor from './JsonEditor.vue'
import JavascriptEditor from './JavascriptEditor.vue'
import { translate, toCSS, compose, scale } from 'transformation-matrix'
import { ref } from 'vue'

const canvas = ref(null)
const root = ref(null)
const matrix = ref(translate(0, 0))

const dag = [
  { id: '0', type: 'data', data: 1, position: { x: 40, y: 200 } },
  { id: '1', type: 'function', data: 1, position: { x: 260, y: 450 } },
  { id: 'e0-1', source: '0', target: '1' },
]

const nodes = dag
  .filter((nodeOrEdge) => nodeOrEdge.type === 'data' || nodeOrEdge.type === 'function')
  .reduce((acc, node) => {
    acc[node.id] = node
    return acc
  }, {})
const edges = dag.filter((nodeOrEdge) => nodeOrEdge.type === undefined)

const canvasDragHandler = ({ delta: [x, y], event }) => {
  if (event.target !== canvas.value && event.target !== root.value) return
  // Do something with dragState
  matrix.value = compose(translate(x, y), matrix.value)
}

const canvasZoomHandler = ({ event, delta }) => {
  const width = canvas.value?.clientWidth ?? 0
  const height = canvas.value?.clientHeight ?? 0

  const zoom = 1 + delta[1] / 1000

  // matrix.current.a === zoom
  if (zoom > 1 && matrix.value.a >= 4) return matrix
  if (zoom < 1 && matrix.value.a <= 0.1) return matrix

  matrix.value = compose(scale(zoom, zoom, event.x - width / 2, event.y - height / 2), matrix.value)
}

const nodeDragHandler = () => {
  console.log('nodeDragHandler')
  // Do something with dragState
}
</script>

<template>
  <div
    ref="root"
    v-drag="canvasDragHandler"
    v-wheel="canvasZoomHandler"
    class="absolute inset-0 overflow-hidden w-screen h-screen bg-blue-100"
  >
    <!-- Canvas -->
    <div ref="canvas" :style="`transform: ${toCSS(matrix)}`" class="h-full">
      <!-- Edges -->
      <svg class="absolute overflow-visible">
        <path
          v-for="{ source, target } in edges"
          class="stroke-2 stroke-blue-700"
          :d="`
            M${nodes[source].position.x},${nodes[source].position.y}
            L${nodes[target].position.x},${nodes[target].position.y}`"
        />
      </svg>

      <!-- Nodes -->
      <div
        v-drag="nodeDragHandler"
        v-for="node in nodes"
        class="p-3 absolute bg-blue-400 h-32 w-96 flex box-border"
        :style="`left: ${node.position.x}px; top: ${node.position.y}px`"
      >
        <JsonEditor v-if="node?.type === 'data'" />
        <JavascriptEditor v-else-if="node?.type === 'function'" />
      </div>
    </div>
  </div>
</template>
