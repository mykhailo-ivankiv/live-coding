import './style.css'
import { jsonToHML } from './jsonToHML'
import { jsonTextToHML } from './jsonTextToHML'

const request = await fetch('/data.json')
const text = await request.text()
const data = JSON.parse(text)

;(document.getElementById('json-text-placeholder') as HTMLDivElement).innerHTML = jsonTextToHML(text)
;(document.getElementById('json-placeholder') as HTMLDivElement).innerHTML = jsonToHML(data)
;(document.getElementById('json-placeholder-ref') as HTMLDivElement).innerHTML = JSON.stringify(data, null, 2)

export {}
