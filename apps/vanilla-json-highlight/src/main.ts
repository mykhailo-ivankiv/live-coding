import './style.css'

const data = await (await fetch('/data.json')).json()
type JSONValue = boolean | string | number | null | Array<JSONValue> | { [key in string]: JSONValue }
const spaces = (n: number) => ' '.repeat(n * 2)
const jsonToHML = (value: JSONValue, indent: number = 0): string => {
  if (value === null) return `<span class="text-yellow-600">null</span>`
  if (typeof value === 'boolean') return `<span class="text-yellow-600">${value}</span>`
  if (typeof value === 'string') return `<span class="text-green-700">"${value}"</span>`
  if (typeof value === 'number') return `<span class="text-yellow-600">${value}</span>`

  if (Array.isArray(value))
    return `[\n${value.map((value) => spaces(indent + 1) + jsonToHML(value, indent + 1)).join(',\n')}\n${spaces(
      indent,
    )}]`

  return `{\n${Object.entries(value)
    .map(
      ([key, value]) =>
        `${spaces(indent + 1)}<span class="text-red-500">"${key}"</span>: ${jsonToHML(value, indent + 1)}`,
    )
    .join(',\n')}\n${spaces(indent)}}`
}

;(document.getElementById('json-placeholder') as HTMLDivElement).innerHTML = jsonToHML(data)
;(document.getElementById('json-placeholder-ref') as HTMLDivElement).innerHTML = JSON.stringify(data, null, 2)

export {}
