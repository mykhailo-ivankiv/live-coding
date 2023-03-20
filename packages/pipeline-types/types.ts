export type Rectangle = { x: number; y: number; width: number; height: number }
export type Node = {
  id: string
  source?: string
  cache?: string
  type: 'data' | 'function' | undefined
  position: Rectangle
  title: string
}
export type Edge = { id: string; source: string; target: string }
export type Pipeline = { id: string; nodes: Node[]; edges: Edge[] }
