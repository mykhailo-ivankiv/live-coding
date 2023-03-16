<script setup lang="ts">
import { translate, toCSS, compose, scale, inverse, applyToPoint } from 'transformation-matrix'
import { computed, ref } from 'vue'
import Edge from './Edge.vue'
import { findYPosition, isRectsIntersect, Rect } from '../utils/geomenty'
import { DragState } from '@vueuse/gesture'

const canvas = ref(null)
const root = ref(null)
const matrix = ref(translate(400, 0))
const inverseMatrix = computed(() => inverse(matrix.value))

const pipeline = await (await fetch('http://localhost:3000/pipelines/1')).json()

const nodes = ref(
  pipeline.nodes.reduce((acc, node) => {
    acc[node.id] = node
    return acc
  }, {}),
)

const edges = ref(pipeline.edges)

const handleCanvasDrag = ({ delta: [x, y] }: DragState) => {
  // Do something with dragState
  matrix.value = compose(translate(x, y), matrix.value)
}

const selectedNodes = ref<string[]>([])

const handleSelection = ({ xy, first, last }: DragState) => {
  if (first) {
    selection.value = { x: xy[0], y: xy[1], width: 0, height: 0 }
    return
  }

  if (last) {
    const { x, y } = applyToPoint(inverseMatrix.value, {
      x: selection.value.width >= 0 ? selection.value.x : selection.value.x + selection.value.width,
      y: selection.value.height >= 0 ? selection.value.y : selection.value.y + selection.value.height,
    })

    const normalizedSelection = {
      x,
      y,
      width: Math.abs(selection.value.width) * inverseMatrix.value.a,
      height: Math.abs(selection.value.height) * inverseMatrix.value.a,
    }

    selectedNodes.value = Object.values(nodes.value)
      .filter((node) => isRectsIntersect(node.position, normalizedSelection))
      .map((node) => node.id)

    selection.value = null
    return
  }

  selection.value.height = xy[1] - selection.value.y
  selection.value.width = xy[0] - selection.value.x
}

const canvasDragHandler = (dragState: DragState) => {
  const { metaKey, ctrlKey, event } = dragState
  if (event.target !== root.value) return

  if (metaKey || ctrlKey) return handleCanvasDrag(dragState)

  return handleSelection(dragState)
}

const canvasZoomHandler = ({ event, delta }) => {
  const zoom = 1 + delta[1] / 1000

  // matrix.current.a === zoom
  if (zoom > 1 && matrix.value.a >= 4) return matrix
  if (zoom < 1 && matrix.value.a <= 0.1) return matrix

  matrix.value = compose(scale(zoom, zoom, event.x, event.y), matrix.value)
}

const selection = ref<Rect | null>(null)

const nodeDragHandler =
  (node) =>
  ({ delta }: DragState) => {
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
    <div
      v-if="selection"
      class="bg-blue-300/50 absolute z-20"
      :style="`
        left: ${selection.width >= 0 ? selection.x : selection.x + selection.width}px;
        top:${selection.height >= 0 ? selection.y : selection.y + selection.height}px; 
        width: ${Math.abs(selection.width)}px; height: ${Math.abs(selection.height)}px;`"
    ></div>

    <!-- Canvas -->
    <div ref="canvas" :style="`transform: ${toCSS(matrix)}`" class="h-0 w-0">
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
          class="h-32 w-96 box-border rounded-md overflow-hidden border-2 bg-white flex flex-col"
          :class="selectedNodes.includes(node.id) ? 'border-blue-700 shadow shadow-blue-300' : 'border-gray-700'"
        >
          <div class="py-1 px-2 pl-4 border-b-2">title</div>
          <!--
          Using css transform results in incorrect tooltip positioning
          https://github.com/codemirror/dev/issues/324
        -->
          <iframe v-if="node.type === 'data'" class="h-full w-full" :src="`/edit/${node.source}`" />
          <iframe v-else-if="node.type === 'cache'" class="h-full w-full" :src="`/view/${node.source}`" />
          <iframe v-else class="h-full w-full" :src="`/edit/${node.source}`" />
          <!-- <JsonEditor v-if="node?.type === 'data'" />-->
          <!-- <JavascriptEditor v-else-if="node?.type === 'function'" />-->
        </div>
      </div>
    </div>
  </div>
</template>
