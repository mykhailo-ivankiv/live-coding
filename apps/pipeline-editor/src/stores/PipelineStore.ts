import { acceptHMRUpdate, defineStore } from 'pinia'
import { Edge, Node, Pipeline } from '@live/pipeline-types'
import { computed, ref } from 'vue'
import { findYPosition, Rect } from '../utils/geomenty'
import { v4 as uuidv4 } from 'uuid'

export const usePipelineStore = defineStore('PipelineStore', () => {
  const id = ref<string>('')
  const nodes = ref<Node[]>([])
  const edges = ref<Edge[]>([])

  const init = (pipeline: Pipeline) => {
    nodes.value = pipeline.nodes
    edges.value = pipeline.edges
    id.value = pipeline.id
  }

  const getNodeById = computed(() => (id: string) => {
    return nodes.value.find((node) => node.id === id)
  })

  const changeNodePosition = (nodeId: string, position: Rect) => {
    const node = getNodeById.value(nodeId)
    if (node) node.position = position
  }

  const deleteNode = (nodeId: string) => {
    edges.value = edges.value.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    nodes.value = nodes.value.filter((node) => node.id !== nodeId)

    syncWithServer()
  }

  const syncWithServer = async () => {
    const data = await (
      await fetch(`http://localhost:3000/pipelines/${id.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id.value,
          nodes: nodes.value,
          edges: edges.value,
        }),
      })
    ).json()

    init(data)
  }

  return {
    id,
    nodes,
    edges,
    getNodeById,
    init,
    deleteNode,
    changeNodePosition,
    addNode: async (node: Node) => {
      nodes.value.push(node)
      return syncWithServer()
    },
    addEdge: async (edge: Edge) => {
      edges.value.push(edge)
      return syncWithServer()
    },

    createEdge: (sourceNodeId: string, targetNodeId: string) => ({
      id: uuidv4(),
      source: sourceNodeId,
      target: targetNodeId,
    }),

    updateNode: async (node: Node) => {
      const nodeIndex = nodes.value.find(({ id }) => node.id)

      nodes.value[nodeIndex] = node;
      return syncWithServer();
    },

    createNode: (type: Node['type'], title: string, position?: Rect & { strict?: false }): Node => ({
      id: uuidv4(),
      type,
      title: `some title`,
      position: {
        x: position?.x ?? 0,
        y:
          !position || position?.strict === false
            ? findYPosition(
                position?.x ?? 0,
                position?.y ?? 0,
                position?.width ?? 380,
                position?.height ?? 124,
                nodes.value.map((node) => node.position),
              )
            : position?.y ?? 0,
        width: position?.width ?? 380,
        height: position?.height ?? 124,
      },
    }),
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePipelineStore, import.meta.hot))
}
