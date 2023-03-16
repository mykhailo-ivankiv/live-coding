<script setup lang="ts">
import { translate, toCSS, compose, scale, inverse, applyToPoint } from 'transformation-matrix'
import { computed, ref } from 'vue'
import Edge from './Edge.vue'
import DataNode from './Node.vue'
import { findYPosition, isRectsIntersect, Rect } from '../utils/geomenty'
import { DragState } from '@vueuse/gesture'
import { Pipeline, Node } from '@live/pipeline-types'

const canvas = ref(null)
const root = ref(null)
const matrix = ref(translate(400, 0))
const inverseMatrix = computed(() => inverse(matrix.value))

const pipeline: Pipeline = await (await fetch('http://localhost:3000/pipelines/1')).json()

const nodes = ref(
  pipeline.nodes.reduce<Record<string, Node>>((acc, node) => {
    acc[node.id] = node
    return acc
  }, {}),
)

const edges = ref(pipeline.edges)

document.addEventListener('keydown', (e) => {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    selectedNodes.value.forEach((id) => {
      delete nodes.value[id]
      edges.value = edges.value.filter((edge) => edge.source !== id && edge.target !== id)
    })
    selectedNodes.value = []
  }
})

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

const addNode = (node: Node) => {
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

      <DataNode
        v-for="node in nodes"
        :node="node"
        :matrix="matrix"
        :isSelected="selectedNodes.includes(node.id)"
        @addNode="addNode"
      />
    </div>
  </div>
</template>
