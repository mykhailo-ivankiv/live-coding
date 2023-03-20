<script setup lang="ts">
import { translate, toCSS, compose, scale, inverse, applyToPoint } from 'transformation-matrix'
import { computed, ref } from 'vue'
import Edge from './Edge.vue'
import DataNode from './Node.vue'
import { findYPosition, isRectsIntersect, Rect } from '../utils/geomenty'
import { DragState } from '@vueuse/gesture'
import { Pipeline, Node } from '@live/pipeline-types'
import { v4 as uuidv4 } from 'uuid'
import CommandPalette from './CommandPalette.vue'

const canvas = ref(null)
const root = ref(null)
const matrix = ref(translate(400, 0))
const inverseMatrix = computed(() => inverse(matrix.value))

const pipeline = ref<Pipeline>(await (await fetch('http://localhost:3000/pipelines/1')).json())

type EditorMode = 'navigate' | 'add'
const editorMode = ref<EditorMode>('navigate')

const nodes = computed(() =>
  pipeline.value.nodes.reduce<Record<string, Node>>((acc, node) => {
    acc[node.id] = node
    return acc
  }, {}),
)

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
      selectedNodes.value.forEach((id) => {
        pipeline.value.edges = pipeline.value.edges.filter((edge) => edge.source !== id && edge.target !== id)
        delete nodes.value[id]
      })
      selectedNodes.value = []
    }
  },
  true,
)

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
  if (editorMode.value !== 'navigate') return

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

const createNode = (
  type: Node['type'],
  title: string,
  position?: Rect & { strict?: false },
  existedNodes?: Node[] = [],
): Node => {
  const id = uuidv4()

  let actualPosition: Rect | undefined = position

  if (!position) {
    const reservedPositions = existedNodes.map((node) => node.position)
    actualPosition = {
      x: 0,
      width: 380,
      height: 124,
      y: findYPosition(0, 0, 380, 124, reservedPositions),
    }
  }

  if (position?.strict === false) {
    const reservedPositions = existedNodes.map((node) => node.position)
    actualPosition = {
      x: position?.x ?? 0,
      width: position?.width ?? 380,
      height: position?.height ?? 124,
      y: findYPosition(
        position?.x ?? 0,
        position?.y ?? 0,
        position?.width ?? 380,
        position?.height ?? 124,
        reservedPositions,
      ),
    }
  }

  return { id, type, title: `some title`, position: actualPosition as Rect }
}

const connectNodes = async (sourceNode: Node) => {
  const newNode = createNode(
    'function',
    `function-${pipeline.value.nodes.length}`,
    {
      x: sourceNode.position.x + sourceNode.position.width + 60,
      y: sourceNode.position.y,
      width: 380,
      height: 124,
      strict: false,
    },
    pipeline.value.nodes,
  )

  pipeline.value.nodes.push(newNode)
  pipeline.value.edges.push({ id: uuidv4(), source: sourceNode.id, target: newNode.id })

  pipeline.value = await (
    await fetch('http://localhost:3000/pipelines/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pipeline.value),
    })
  ).json()
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
    const { x, y } = applyToPoint(inverseMatrix.value, { x: ev.x, y: ev.y })

    const newNode = {
      id: uuidv4(),
      type: undefined,
      title: '',
      // -20 to put the node input in the center of the cursor
      position: { x: x - 20, y: y - 20, width: 380, height: 40 },
    }

    pipeline.value.nodes.push(newNode)

    editorMode.value = 'navigate'
  }
}

const isCommandPaletteOpen = ref(false)
const closeCommandPalette = () => {
  console.log('close')
  return (isCommandPaletteOpen.value = false)
}
const executeCommand = (command: string) => {
  console.log('execute', command)
  isCommandPaletteOpen.value = false
}

const changeNodePosition = (nodeId: string, newPosition: Rect) => {
  nodes.value[nodeId].position = newPosition
}
</script>

<template>
  <CommandPalette :is-open="isCommandPaletteOpen" @close="closeCommandPalette" @change="executeCommand" />
  <div
    ref="root"
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
    <div ref="canvas" :style="`transform: ${toCSS(matrix)}`" class="h-0 w-0">
      <!-- Edges -->
      <!-- left-[2px] is hack you fix border size of node-->
      <svg class="absolute left-[2px] z-10 overflow-visible w-screen h-screen pointer-events-none">
        <Edge
          v-for="{ source, target } in pipeline.edges"
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

      <div :class="{ 'pointer-events-none': editorMode === 'add' }">
        <DataNode
          v-for="node in nodes"
          :key="node.id"
          :node="node"
          :matrix="matrix"
          :isSelected="selectedNodes.includes(node.id)"
          @addNode="connectNodes"
          @changePosition="changeNodePosition"
        />
      </div>
    </div>
  </div>
</template>
