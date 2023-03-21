<script setup lang="ts">
import { translate, toCSS, compose, scale, inverse, applyToPoint, Point } from 'transformation-matrix'
import { computed, ref } from 'vue'
import Edge from './Edge.vue'
import DataNode from './Node.vue'
import { isRectsIntersect, Rect } from '../utils/geomenty'
import { DragState } from '@vueuse/gesture'
import { Node } from '@live/pipeline-types'
import CommandPalette from './CommandPalette.vue'
import { usePipelineListStore } from '../stores/PipelineListStore'
import { usePipelineStore } from '../stores/PipelineStore'

const pipelineListStore = usePipelineListStore()
await pipelineListStore.fetchPipelines()

const pipelineStore = usePipelineStore()
pipelineStore.init(pipelineListStore.getPipelineById('pipeline-1'))

const matrix = ref(translate(400, 200))

type EditorMode = 'navigate' | 'add'
const editorMode = ref<EditorMode>('navigate')

document.addEventListener(
  'keydown',
  (e) => {
    if (e.key === '/') {
      e.preventDefault()
      e.stopPropagation()
      isCommandPaletteOpen.value = true
      return
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      selectedNodes.value.forEach((id) => pipelineStore.deleteNode(id))
      selectedNodes.value = []
    }
  },
  true,
)

const handleCanvasDrag = ({ delta: [x, y] }: DragState) => {
  matrix.value = compose(translate(x, y), matrix.value)
}

const selectedNodes = ref<string[]>([])

const handleSelection = ({ xy, first, last }: DragState) => {
  if (first) {
    selection.value = { x: xy[0], y: xy[1], width: 0, height: 0 }
    return
  }

  const { width, height, x: sx, y: sy } = selection.value as Rect

  if (last) {
    const inverseMatrix = inverse(matrix.value)
    const zoom = inverseMatrix.a
    const [x, y] = applyToPoint(inverseMatrix, [
      width >= 0 ? sx : sx + width, //
      height >= 0 ? sy : sy + height,
    ])

    const normalizedSelection = { x, y, width: Math.abs(width) * zoom, height: Math.abs(height) * zoom }

    selectedNodes.value = Object.values(pipelineStore.nodes)
      .filter((node) => isRectsIntersect(node.position, normalizedSelection))
      .map((node) => node.id)

    selection.value = null
    return
  }

  selection.value.height = xy[1] - sy
  selection.value.width = xy[0] - sx
}

const canvasDragHandler = (dragState: DragState) => {
  if (editorMode.value !== 'navigate') return

  const { metaKey, ctrlKey, event } = dragState
  if (event.target !== event.currentTarget) return

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

const createConnectedFunctionNode = async (sourceNode: Node) => {
  const newNode = pipelineStore.createNode('function', `function-${pipelineStore.nodes.length}`, {
    x: sourceNode.position.x + sourceNode.position.width + 60,
    y: sourceNode.position.y,
    width: 380,
    height: 124,
    strict: false,
  })
  await pipelineStore.addNode(newNode)

  const edge = pipelineStore.createEdge(sourceNode.id, newNode.id)
  await pipelineStore.addEdge(edge)
}

document.addEventListener(
  'keydown',
  (e) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      editorMode.value = 'add'
    }
  },
  true,
)

const handleCanvasClick = (ev: MouseEvent) => {
  if (editorMode.value === 'add') {
    const inverseMatrix = inverse(matrix.value)
    const { x, y } = applyToPoint(inverseMatrix, { x: ev.x, y: ev.y })

    const newNode = pipelineStore.createNode(undefined, '', { x: x - 20, y: y - 20, width: 380, height: 40 })
    pipelineStore.addNode(newNode)

    editorMode.value = 'navigate'
  }
}

const isCommandPaletteOpen = ref(false)

const executeCommand = (command: string) => {
  isCommandPaletteOpen.value = false

  if (command === 'add-json-data') {
    const newNode = createNode('data', 'data.json', undefined, pipelineStore.value.nodes)
    pipelineStore.value.nodes.push(newNode)
  }
}

const getNodeOutputPosition = (nodeId: string): Point => {
  const { x, y, width, height } = (pipelineStore.getNodeById(nodeId) as Node).position
  return { x: x + width, y: y + height / 2 }
}
const getNodeInputPosition = (nodeId: string): Point => {
  const { x, y, height } = (pipelineStore.getNodeById(nodeId) as Node).position

  return { x: x, y: y + height / 2 }
}
</script>

<template>
  <CommandPalette :is-open="isCommandPaletteOpen" @close="isCommandPaletteOpen = false" @change="executeCommand" />
  <div
    @click="handleCanvasClick"
    v-drag="canvasDragHandler"
    v-wheel="canvasZoomHandler"
    class="absolute inset-0 overflow-hidden w-screen h-screen"
    :class="{ 'cursor-crosshair': editorMode === 'add' }"
  >
    <div
      v-if="selection"
      class="bg-blue-300/50 absolute z-20"
      :style="{
        left: `${selection.width >= 0 ? selection.x : selection.x + selection.width}px`,
        top: `${selection.height >= 0 ? selection.y : selection.y + selection.height}px`,
        width: `${Math.abs(selection.width)}px`,
        height: `${Math.abs(selection.height)}px`,
      }"
    ></div>

    <!-- Canvas -->
    <div :style="`transform: ${toCSS(matrix)}`" class="h-0 w-0">
      <!-- Edges -->
      <!-- left-[2px] is hack you fix border size of node-->
      <svg class="absolute left-[2px] z-10 overflow-visible w-screen h-screen pointer-events-none">
        <Edge
          v-for="{ source, target } in pipelineStore.edges"
          :from="getNodeOutputPosition(source)"
          :to="getNodeInputPosition(target)"
        />
      </svg>

      <div :class="{ 'pointer-events-none': editorMode === 'add' }">
        <DataNode
          :pipelineId="pipelineStore.id"
          v-for="node in pipelineStore.nodes"
          :key="node.id"
          :node="node"
          :matrix="matrix"
          :isSelected="selectedNodes.includes(node.id)"
          @addNode="createConnectedFunctionNode"
          @changePosition="pipelineStore.changeNodePosition"
        />
      </div>
    </div>
  </div>
</template>
