import { Fragment } from 'react'

type JSONValue = boolean | string | number | null | Array<JSONValue> | { [key in string]: JSONValue }

const Spaces = ({ n }: { n: number }) => <span className="text-gray-300">{'  '.repeat(n)}</span>
export default function ViewJson({ json, indent = 0 }: { json: JSONValue; indent?: number }) {
  if (json === null) return <span className="text-yellow-600">null</span>
  if (typeof json === 'boolean') return <span className="text-yellow-600">{json ? 'true' : 'false'}</span>
  if (typeof json === 'string') return <span className="text-green-700">"{json.replaceAll('"', '\\"')}"</span>
  if (typeof json === 'number') return <span className="text-yellow-600">{json}</span>

  if (Array.isArray(json))
    return (
      <>
        {'[\n'}
        {json.map((value, index, arr) => (
          <Fragment key={index}>
            <Spaces n={indent + 1} />
            <ViewJson json={value} indent={indent + 1} />
            {index !== arr.length - 1 ? ',\n' : ''}
          </Fragment>
        ))}
        {'\n'}
        <Spaces n={indent} />]
      </>
    )

  return (
    <>
      {'{\n'}
      {Object.entries(json).map(([key, value], index, arr) => (
        <Fragment key={index}>
          <Spaces n={indent + 1} />
          <span className="text-red-500">"{key}"</span>: <ViewJson json={value} indent={indent + 1} />
          {index !== arr.length - 1 ? ',\n' : ''}
        </Fragment>
      ))}
      {'\n'}
      <Spaces n={indent} /> {'}'}
    </>
  )
}
