<script setup lang="ts">
// import JsonEditor from './JsonEditor.vue'
// import JavascriptEditor from './JavascriptEditor.vue'
import { translate, toCSS, compose, scale, applyToPoint, inverse } from 'transformation-matrix'
import { computed, ref } from 'vue'
import Egde from './Edge.vue'

type Rect = { x: number; y: number; width: number; height: number }

const canvas = ref(null)
const root = ref(null)
const matrix = ref(translate(0, 0))

const dag = ref([
  { id: 'node-0', type: 'data', position: { x: 40, y: 200, width: 380, height: 124 } },
  { id: 'node-1', type: 'function', position: { x: 480, y: 200, width: 380, height: 124 } },
  { id: 'node-2', type: 'data', position: { x: 920, y: 200, width: 380, height: 124 } },
  { id: 'node-3', type: 'function', position: { x: 480, y: 350, width: 380, height: 124 } },
  { id: 'edge-0', source: 'node-0', target: 'node-1' },
  { id: 'edge-1', source: 'node-0', target: 'node-3' },
  { id: 'edge-2', source: 'node-1', target: 'node-2' },
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

type Range = { start: number; end: number }
const isRangesIntersect = (a: Range, b: Range): boolean => a.start < b.end && b.start < a.end
const findYPosition = (x: number, approximateY: number, width: number, height: number, rects: Rect[]) => {
  const margin = 20
  let yRange = { start: approximateY - margin, end: approximateY + height + margin }
  let xRange = { start: x - margin, end: x + width + margin }

  const rectsInTheSameColumn = rects.filter(({ x, width }) => isRangesIntersect({ start: x, end: x + width }, xRange))
  const intersectWith = rectsInTheSameColumn.find((rect) =>
    isRangesIntersect(yRange, { start: rect.y, end: rect.y + rect.height }),
  )

  if (!intersectWith) return approximateY

  let intersectOnTop: Rect | undefined = intersectWith
  let freeYPositionOnTop: Range = { ...yRange }

  while (intersectOnTop) {
    freeYPositionOnTop.start = intersectOnTop.y - height - margin
    freeYPositionOnTop.end = intersectOnTop.y - margin
    intersectOnTop = rectsInTheSameColumn.find((rect) =>
      isRangesIntersect(freeYPositionOnTop, { start: rect.y, end: rect.y + rect.height }),
    )
  }

  let intersectOnBottom: Rect | undefined = intersectWith
  let freeYPositionOnBottom: Range = { ...yRange }

  while (intersectOnBottom) {
    freeYPositionOnBottom.start = intersectOnBottom.y + intersectOnBottom.height + margin
    freeYPositionOnBottom.end = intersectOnBottom.y + intersectOnBottom.height + height + margin
    intersectOnBottom = rectsInTheSameColumn.find((rect) =>
      isRangesIntersect(freeYPositionOnBottom, { start: rect.y, end: rect.y + rect.height }),
    )
  }

  return Math.abs(approximateY - freeYPositionOnTop.start) < Math.abs(approximateY - freeYPositionOnBottom.start)
    ? freeYPositionOnTop.start
    : freeYPositionOnBottom.start
}
const addDataNode = (node) => {
  const width = 380
  const height = 124

  const reservedPositions = Object.values(nodes.value).map((node) => node.position)

  const x = node.position.x + node.position.width + 60
  const y = findYPosition(x, node.position.y, width, height, reservedPositions)

  const id = 'node-' + reservedPositions.length

  dag.value.push(
    { id, type: 'function', position: { x, y, width, height } }, // new node
    { id: 'edge-' + edges.value.length, source: node.id, target: id }, // new edge
  )
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
        <Egde
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
        class="absolute"
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
          class="absolute z-20 top-1/2 -right-7 transform -translate-y-1/2"
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
          class="h-32 w-96 box-border rounded-md overflow-hidden border-2 border-blue-700 shadow shadow-blue-300 bg-white"
        >
          <div class="py-1 px-2 pl-4 border-b-2">title</div>
          <!--
          Using css transform results in incorrect tooltip positioning
          https://github.com/codemirror/dev/issues/324
        -->
          <iframe v-if="node.type === 'data'" class="h-full w-full" src="/codemirror/json" />
          <iframe v-else class="h-full w-full" src="/codemirror/javascript" />

          <!--        <JsonEditor v-if="node?.type === 'data'" />-->
          <!--        <JavascriptEditor v-else-if="node?.type === 'function'" />-->
        </div>
      </div>
    </div>
  </div>
</template>
