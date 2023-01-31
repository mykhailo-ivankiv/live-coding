import { jsonToHML } from './jsonToHML.ts'
import { jsonTextToHML } from './jsonTextToHML.ts'

(async () => {
  const request = await fetch('/data.json')
  const text = await request.text()
  const data = JSON.parse(text)

  ;(document.getElementById('json-text-placeholder') as HTMLDivElement).innerHTML = jsonTextToHML(text)
  ;(document.getElementById('json-placeholder') as HTMLDivElement).innerHTML = jsonToHML(data)
  ;(document.getElementById('json-placeholder-ref') as HTMLDivElement).innerHTML = JSON.stringify(data, null, 2)
})()


export {}
