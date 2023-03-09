<script setup lang="ts">
// import JsonEditor from './JsonEditor.vue'
// import JavascriptEditor from './JavascriptEditor.vue'
import { translate, toCSS, compose, scale, applyToPoint, inverse } from 'transformation-matrix'
import { computed, ref } from 'vue'
import Egde from './Edge.vue'

const canvas = ref(null)
const root = ref(null)
const matrix = ref(compose(translate(0, 0), scale(0.9, 0.9)))

const dag = ref([
  { id: '0', type: 'data', data: 1, position: { x: 40, y: 200 }, width: 380, height: 124 },
  { id: '1', type: 'function', data: 1, position: { x: 260, y: 450 }, width: 380, height: 124 },
  { id: 'e0-1', source: '0', target: '1' },
])

const nodes = computed(() =>
  dag.value
    .filter((nodeOrEdge) => nodeOrEdge.type === 'data' || nodeOrEdge.type === 'function')
    .reduce((acc, node) => {
      acc[node.id] = node
      return acc
    }, {}),
)
const edges = computed(() => dag.value.filter((nodeOrEdge) => nodeOrEdge.type === undefined))

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

const nodeDragHandler =
  (node) =>
  ({ delta }) => {
    node.position.x += (delta[0] * 1) / matrix.value.a
    node.position.y += (delta[1] * 1) / matrix.value.a
  }
</script>

<template>
  <div
    ref="root"
    v-drag="canvasDragHandler"
    v-wheel="canvasZoomHandler"
    class="absolute inset-0 overflow-hidden w-screen h-screen"
  >
    <!-- Canvas -->
    <div ref="canvas" :style="`transform: ${toCSS(matrix)}`" class="h-full">
      <!-- Nodes -->
      <div
        v-for="{ position, width, height, id, type } in nodes"
        v-drag="nodeDragHandler(nodes[id])"
        class="absolute h-32 w-96 box-border rounded-md overflow-hidden border-2 border-blue-700 shadow shadow-blue-300"
        :key="id"
        :style="`
          left: ${position.x}px;
          top: ${position.y}px;
          width: ${width}px;
          height: ${height}px;
        `"
      >
        <div class="py-1 px-2 pl-4 border-b-2">title</div>
        <!--
          Using css transform results in incorrect tooltip positioning
          https://github.com/codemirror/dev/issues/324
        -->
        <iframe v-if="type === 'data'" class="h-full w-full" src="/codemirror/json" />
        <iframe v-else class="h-full w-full" src="/codemirror/javascript" />

        <!--        <JsonEditor v-if="node?.type === 'data'" />-->
        <!--        <JavascriptEditor v-else-if="node?.type === 'function'" />-->
      </div>

      <!-- Edges -->
      <svg class="absolute overflow-visible w-0 h-0">
        <Egde
          v-for="{ source, target } in edges"
          :from="{
            x: nodes[source].position.x + nodes[source].width,
            y: nodes[source].position.y + nodes[source].height / 2,
          }"
          :to="{
            x: nodes[target].position.x,
            y: nodes[target].position.y + nodes[target].height / 2,
          }"
        />
      </svg>
    </div>
  </div>
</template>
