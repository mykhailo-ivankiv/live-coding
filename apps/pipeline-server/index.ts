import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import fs from 'fs/promises'
import bodyParser from 'body-parser'
import WebSocket, { WebSocketServer } from 'ws'
import path from 'path'
import { Pipeline } from '@live/pipeline-types'

const app = express()
const port = 3000

const wss = new WebSocketServer({ port: '3001' })
wss.on('connection', function connection(ws) {
  ws.on('error', console.error)
})
const broadcastMessage = (message: string) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}

let pipeline: Pipeline
//https://github.com/nodejs/modules/issues/307#issuecomment-1382183511
async function importFresh(modulePath: string) {
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
const runPipeline = async (pipeline: Pipeline) => {
  try {
    const sourceNodes = pipeline.nodes
      .filter((node) => node.type === 'data')
      .filter((node) => !pipeline.edges.find((edge) => edge.target === node.id))

    sourceNodes.map(async (node) => {
      const sourceData = JSON.parse(await fs.readFile(`./sources/${pipeline.id}/${node.source}`, 'utf-8'))
      const targetFunctionNodes = pipeline.edges.filter((edge) => edge.source === node.id)

      await Promise.all(
        targetFunctionNodes
          .map((edge) => pipeline.nodes.find((node) => node.id === edge.target))
          .map(async (functionNode) => {
            try {
              const module = await importFresh(`./sources/${pipeline.id}/${functionNode.source}`)
              const data = await module.default(sourceData)

              await fs.writeFile(`./sources/${pipeline.id}/${functionNode.source}.cache`, JSON.stringify(data, null, 2))
              broadcastMessage(`Source changed: ${functionNode.source}.cache`)
            } catch (error) {
              console.error(error)
            }
          }),
      )
    })
  } catch (error) {
    console.error(error)
  }
}

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors())
app.use(bodyParser.text())
app.use(bodyParser.json())

app.get('/pipelines/:pipelineId', async (req, res) => {
  const { pipelineId } = req.params
  if (!pipeline) {
    pipeline = JSON.parse(await fs.readFile(`./sources/${pipelineId}/pipeline.json`, 'utf-8'))
  }

  await runPipeline(pipeline)

  return res.json(pipeline)
})

app.put('/pipelines/:pipelineId', async (req, res) => {
  const { pipelineId } = req.params
  if (!pipeline) {
    pipeline = JSON.parse(await fs.readFile(`./sources/${pipelineId}/pipeline.json`, 'utf-8'))
  }

  pipeline = req.body

  await Promise.all(
    pipeline.nodes.map(async (node: any) => {
      if (!node.source && node.type === 'function') {
        node.source = `${node.id}.js`
        node.cache = `${node.source}.cache`
        await fs.writeFile(`./sources/${pipelineId}/${node.source}`, 'export default (data) => data')
        await fs.writeFile(`./sources/${pipelineId}/${node.source}.cache`, '')
      }
    }),
  )

  await runPipeline(pipeline)

  res.json(pipeline)
})

app.put('/sources/:pipelineId/:source', async (req, res) => {
  const { source, pipelineId } = req.params
  const content = req.body

  try {
    await fs.writeFile(`./sources/${pipelineId}/${source}`, content)
    await runPipeline(pipeline)

    res.send('ok')
  } catch (error) {
    res.status(404).send('Not found')
  }
})

app.get('/sources/:pipelineId/:source', async (req, res) => {
  const { source, pipelineId } = req.params
  try {
    const content = await fs.readFile(`./sources/${pipelineId}/${source}`, 'utf-8')

    res.send(content)
  } catch (error) {
    res.status(404).send('Not found')
  }
})

app.use('/*', (req, res) => res.status(404).send('Not found'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
