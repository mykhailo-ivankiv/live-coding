export type Rectangle = { x: number; y: number; width: number; height: number }

type BasicNode = { id: string; title: string; position: Rectangle }
type FunctionNode = BasicNode & { type: 'function'; source: string; cache: string }
type JsonNode = BasicNode & { type: 'data'; source: string }
type DataURLNode = BasicNode & { type: 'data-by-url'; cache: string; dataUrl: string }

export type Node = BasicNode | FunctionNode | JsonNode | DataURLNode

export type Edge = { id: string; source: string; target: string }
export type Pipeline = {
  id: string
  title: string
  nodes: Node[]
  edges: Edge[]
}
