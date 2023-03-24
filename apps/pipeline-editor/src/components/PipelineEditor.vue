<script setup lang="ts">
import { translate, toCSS, compose, scale, inverse, applyToPoint } from 'transformation-matrix'
import { computed, ref, watch } from 'vue'
import NodeEdge from './NodeEdge.vue'
import DataNode from './Node.vue'
import { isRectsIntersect, normalizeRect, Rect, transformRect } from '../utils/geomenty'
import { DragState, useDrag, useWheel } from '@vueuse/gesture'
import { Node } from '@live/pipeline-types'
import CommandPalette from './CommandPalette.vue'
import { usePipelineListStore } from '../stores/PipelineListStore'
import { usePipelineStore } from '../stores/PipelineStore'
import { useRoute } from 'vue-router'

const route = useRoute()
const pipelineId = route.params.pipelineId

const pipelineListStore = usePipelineListStore()
await pipelineListStore.fetchPipelines()

const pipelineStore = usePipelineStore()

pipelineStore.init(pipelineListStore.getPipelineById(pipelineId))

const expandedNodeId = route.params.nodeId
const expandedNode = ref(expandedNodeId ? pipelineStore.getNodeById(expandedNodeId) : null)

watch(
  () => route.params.nodeId,
  () => {
    const expandedNodeId = route.params.nodeId
    expandedNode.value = expandedNodeId ? pipelineStore.getNodeById(expandedNodeId) : null
  },
)

const matrix = ref(translate(400, 200))
const editorMode = ref<'navigate' | 'add'>('navigate')
const selectedNodes = ref<string[]>([])
const selection = ref<Rect | null>(null)
const normalizedSelection = computed<Rect | null>(() => selection.value && normalizeRect(selection.value))

document.addEventListener(
  'keydown',
  (e) => {
    // TODO: fixit!
    if (e.target.matches('input, textarea')) return

    if (editorMode.value === 'add' && e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()

      editorMode.value = 'navigate'
      return
    }

    if (e.key === '/') {
      e.preventDefault()
      e.stopPropagation()
      isCommandPaletteOpen.value = true
      return
    }

    if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
      e.preventDefault()
      selectedNodes.value = pipelineStore.nodes.map(({ id }) => id)
      return
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      selectedNodes.value.forEach((id) => pipelineStore.deleteNode(id))
      selectedNodes.value = []
      return
    }
  },
  true,
)

const handleCanvasDrag = ({ delta: [x, y] }: DragState) => {
  matrix.value = compose(translate(x, y), matrix.value)
}
const handleSelection = ({ delta: [x, y], xy, first, last }: DragState) => {
  if (first) {
    selection.value = { x: xy[0], y: xy[1], width: 0, height: 0 }
    return
  }

  if (!selection.value) return

  if (last) {
    const inverseMatrix = inverse(matrix.value)
    const selectionRectangle = transformRect(inverseMatrix, normalizedSelection.value as Rect)

    selectedNodes.value = pipelineStore.nodes
      .filter((node) => isRectsIntersect(node.position, selectionRectangle))
      .map((node) => node.id)

    selection.value = null
    return
  }

  selection.value.height += y
  selection.value.width += x
}

const canvasDragHandler = (dragState: DragState) => {
  const { metaKey, ctrlKey, event } = dragState

  if (editorMode.value !== 'navigate') return
  if (event.target !== event.currentTarget) return

  if (metaKey || ctrlKey) return handleCanvasDrag(dragState)
  return handleSelection(dragState)
}

const canvasZoomHandler = ({ event, delta }: DragState) => {
  const zoom = 1 + delta[1] / 1000

  // matrix.current.a === zoom
  if (zoom > 1 && matrix.value.a >= 4) return matrix
  if (zoom < 1 && matrix.value.a <= 0.1) return matrix

  matrix.value = compose(scale(zoom, zoom, event.x, event.y), matrix.value)
}

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
    const newNode = pipelineStore.createNode('data', 'data.json')
    pipelineStore.addNode(newNode)
  }
}

const root = ref<HTMLDivElement>()

useDrag(canvasDragHandler, { domTarget: root })
useWheel(canvasZoomHandler, { domTarget: root })

const expandedNodeMargins = {
  top: 10,
  bottom: 10,
  left: 420,
  right: 20,
}
</script>

<template>
  <CommandPalette :is-open="isCommandPaletteOpen" @close="isCommandPaletteOpen = false" @change="executeCommand" />
  <div
    @click="handleCanvasClick"
    ref="root"
    class="absolute inset-0 overflow-hidden w-screen h-screen"
    :class="{
      'cursor-crosshair': editorMode === 'add',
      'select-none': selection !== null,
    }"
  >
    <div
      v-if="selection"
      class="bg-blue-300/50 absolute z-20"
      :style="{
        left: `${normalizedSelection?.x}px`,
        top: `${normalizedSelection?.y}px`,
        width: `${normalizedSelection?.width}px`,
        height: `${normalizedSelection?.height}px`,
      }"
    ></div>

    <!-- Canvas -->
    <div
      class="h-0 w-0"
      :style="{
        transform: toCSS(
          expandedNode
            ? translate(
                -expandedNode.position.x + expandedNodeMargins.left,
                -expandedNode.position.y + expandedNodeMargins.top,
              )
            : matrix,
        ),
      }"
    >
      <!-- Edges -->
      <svg class="absolute z-10 overflow-visible w-screen h-screen pointer-events-none">
        <NodeEdge v-for="{ source, target } in pipelineStore.edges" :source="source" :target="target" />
      </svg>

      <div
        v-if="root"
        :class="{
          'pointer-events-none': editorMode === 'add',
        }"
      >
        <div v-for="node in pipelineStore.nodes" class="relative" :class="{ 'z-50': expandedNode?.id === node.id }">
          <DataNode
            :position="{
              x: node.position.x,
              y: node.position.y,
              width:
                expandedNode?.id === node.id
                  ? root.getBoundingClientRect().width - (expandedNodeMargins.left + expandedNodeMargins.right)
                  : node.position.width,
              height:
                expandedNode?.id === node.id
                  ? root.getBoundingClientRect().height - (expandedNodeMargins.top + expandedNodeMargins.bottom)
                  : node.position.height,
            }"
            :isExpanded="expandedNode?.id === node.id"
            :pipelineId="pipelineStore.id"
            :key="node.id"
            :node="node"
            :matrix="matrix"
            :isSelected="selectedNodes.includes(node.id)"
            @addNodeOutputConnector="createConnectedFunctionNode"
            @change="pipelineStore.updateNode"
            @changePosition="pipelineStore.changeNodePosition"
            @expand=""
          />
        </div>
      </div>
    </div>
  </div>
</template>
