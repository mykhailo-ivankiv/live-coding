import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import fs from 'fs/promises'

const app = express()
const port = 3000

type Rectangle = { x: number; y: number; width: number; height: number }
type Node = { id: string; source: string; type: 'data' | 'function' | 'cache'; position: Rectangle }
type Edge = { id: string; source: string; target: string }

type Pipeline = { nodes: Node[]; edges: Edge[] }
const pipeline: Pipeline = {
  nodes: [
    { id: 'node-0', source: 'data-0.json', type: 'data', position: { x: 40, y: 200, width: 380, height: 124 } },
    { id: 'node-1', source: 'function-1.js', type: 'function', position: { x: 480, y: 200, width: 380, height: 124 } },
    { id: 'node-2', source: 'data-2.json', type: 'cache', position: { x: 920, y: 200, width: 380, height: 124 } },
    { id: 'node-3', source: 'function-3.js', type: 'function', position: { x: 480, y: 350, width: 380, height: 124 } },
    { id: 'node-4', source: 'data-4.json', type: 'cache', position: { x: 920, y: 350, width: 380, height: 124 } },
  ],
  edges: [
    { id: 'edge-0', source: 'node-0', target: 'node-1' },
    { id: 'edge-1', source: 'node-0', target: 'node-3' },
    { id: 'edge-2', source: 'node-1', target: 'node-2' },
    { id: 'edge-2', source: 'node-3', target: 'node-4' },
  ],
}

// this is a very naive implementation, but it works for now
const runPipeline = async (pipeline) => {
  const sourceNodes = pipeline.nodes
    .filter((node) => node.type === 'data')
    .filter((node) => {
      return !pipeline.edges.find((edge) => edge.target === node.id)
    })

  sourceNodes.map(async (node) => {
    const sourceData = JSON.parse(await fs.readFile(`./sources/${node.source}`, 'utf-8'))

    const targetFunctionNodes = pipeline.edges.filter((edge) => edge.source === node.id)

    await Promise.all(
      targetFunctionNodes
        .map((edge) => pipeline.nodes.find((node) => node.id === edge.target))
        .map(async (functionNode) => {
          const module = await import(`./sources/${functionNode.source}`)
          const data = await module.default(sourceData)

          const targetDataNodeId = pipeline.edges.find((edge) => edge.source === functionNode.id).target
          const targetDataNode = pipeline.nodes.find((node) => node.id === targetDataNodeId)

          return await fs.writeFile(`./sources/${targetDataNode.source}`, JSON.stringify(data, null, 2))
        }),
    )
  })
}

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors())
app.get('/pipelines/1', async (req, res) => {
  await runPipeline(pipeline)

  return res.json(pipeline)
})
app.get('/sources/:source', async (req, res) => {
  const { source } = req.params
  try {
    console.log(`./sources/${source}`)

    const content = await fs.readFile(`./sources/${source}`, 'utf-8')

    res.send(content)
  } catch (error) {
    res.status(404).send('Not found')
  }
})

app.use('/*', (req, res) => res.status(404).send('Not found'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
