import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import fs from 'fs/promises'
import bodyParser from 'body-parser'
import WebSocket, { WebSocketServer } from 'ws'
import path from 'path'

type Rectangle = { x: number; y: number; width: number; height: number }
type Node = { id: string; source: string; type: 'data' | 'function' | 'cache'; position: Rectangle }
type Edge = { id: string; source: string; target: string }

type Pipeline = { nodes: Node[]; edges: Edge[] }

const app = express()
const port = 3000

const wss = new WebSocketServer({ port: '3001' })
wss.on('connection', function connection(ws) {
  ws.on('error', console.error)
})
const broadcastMessage = (message) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}

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

async function importFresh(modulePath) {
  const filepath = path.resolve(modulePath)
  const fileContent = await fs.readFile(filepath, 'utf8')
  const ext = path.extname(filepath)
  const extRegex = new RegExp(`\\${ext}$`)
  const newFilepath = `${filepath.replace(extRegex, '')}${Date.now()}${ext}`

  await fs.writeFile(newFilepath, fileContent)
  const module = await import(newFilepath)
  fs.unlink(newFilepath, () => {})

  return module
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
          const module = await importFresh(`./sources/${functionNode.source}`)
          const data = await module.default(sourceData)

          console.log(module.default.toString())

          const targetDataNodeId = pipeline.edges.find((edge) => edge.source === functionNode.id).target
          const targetDataNode = pipeline.nodes.find((node) => node.id === targetDataNodeId)

          await fs.writeFile(`./sources/${targetDataNode.source}`, JSON.stringify(data, null, 2))
          broadcastMessage(`Source changed: ${targetDataNode.source}`)
        }),
    )
  })
}

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors())
app.use(bodyParser.text())
// app.use(bodyParser.json())
app.get('/pipelines/1', async (req, res) => {
  await runPipeline(pipeline)

  return res.json(pipeline)
})

app.put('/sources/:source', async (req, res) => {
  const { source } = req.params
  const content = req.body

  try {
    await fs.writeFile(`./sources/${source}`, content)
    await runPipeline(pipeline)

    res.send('ok')
  } catch (error) {
    res.status(404).send('Not found')
  }
})

app.get('/sources/:source', async (req, res) => {
  const { source } = req.params
  try {
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
