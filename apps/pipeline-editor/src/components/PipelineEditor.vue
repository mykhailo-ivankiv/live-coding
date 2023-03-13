<script setup lang="ts">
// import JsonEditor from './JsonEditor.vue'
// import JavascriptEditor from './JavascriptEditor.vue'
import { translate, toCSS, compose, scale } from 'transformation-matrix'
import { ref } from 'vue'
import Edge from './Edge.vue'
import { findYPosition } from '../utils/geomenty'

const canvas = ref(null)
const root = ref(null)
const matrix = ref(translate(0, 0))

const pipeline = await (await fetch('http://localhost:3000/pipelines/1')).json()

const nodes = ref(
  pipeline.nodes.reduce((acc, node) => {
    acc[node.id] = node
    return acc
  }, {}),
)

const edges = ref(pipeline.edges)

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

const addDataNode = (node) => {
  const width = 380
  const height = 124

  const reservedPositions = Object.values(nodes.value).map((node) => node.position)

  const x = node.position.x + node.position.width + 60
  const y = findYPosition(x, node.position.y, width, height, reservedPositions)

  const id = 'node-' + reservedPositions.length

  nodes.value[id] = { id, type: 'function', position: { x, y, width, height } }
  edges.value.push({ id: 'edge-' + edges.value.length, source: node.id, target: id })
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
      <!-- Edges -->
      <!-- left-[2px] is hack you fix border size of node-->
      <svg class="absolute left-[2px] z-10 overflow-visible w-screen h-screen pointer-events-none">
        <Edge
          v-for="{ source, target } in edges"
          :from="{
            x: nodes[source].position.x + nodes[source].position.width,
            y: nodes[source].position.y + nodes[source].position.height / 2,
          }"
          :to="{
            x: nodes[target].position.x,
            y: nodes[target].position.y + nodes[target].position.height / 2,
          }"
        />
      </svg>

      <!-- Nodes -->
      <div
        v-for="node in nodes"
        v-drag="nodeDragHandler(nodes[node.id])"
        class="absolute z-20"
        :key="node.id"
        :style="`
          left: ${node.position.x}px;
          top: ${node.position.y}px;
          width: ${node.position.width}px;
          height: ${node.position.height}px;
        `"
      >
        <button
          v-if="node.type === 'data'"
          class="absolute top-1/2 -right-5 transform -translate-y-1/2"
          @click="addDataNode(node)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6 fill-white"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
        <div
          class="h-32 w-96 box-border rounded-md overflow-hidden border-2 border-blue-700 shadow shadow-blue-300 bg-white flex flex-col"
        >
          <div class="py-1 px-2 pl-4 border-b-2">title</div>
          <!--
          Using css transform results in incorrect tooltip positioning
          https://github.com/codemirror/dev/issues/324
        -->
          <iframe v-if="node.type === 'data'" class="h-full w-full" :src="`/edit/${node.source}`" />
          <iframe v-else class="h-full w-full" :src="`/edit/${node.source}`" />

          <!--        <JsonEditor v-if="node?.type === 'data'" />-->
          <!--        <JavascriptEditor v-else-if="node?.type === 'function'" />-->
        </div>
      </div>
    </div>
  </div>
</template>
