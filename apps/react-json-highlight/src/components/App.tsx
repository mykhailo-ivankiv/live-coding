import ViewJson from './ViewJson'
import { useEffect, useMemo, useState } from 'react'
import HighlightAsJson from './HighlightAsJson'

export default function App() {
  const [error, setError] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [text, setText] = useState<string>('null')
  const json = useMemo(() => JSON.parse(text), [text])

  useEffect(() => {
    fetch('/data.json')
      .then((res) => res.text())
      .then(
        (result) => {
          setIsLoaded(true)
          setText(result)
        },
        (error) => {
          setIsLoaded(true)
          setError(error)
        },
      )
  }, [])

  if (error) return <div>Error: {error.message}</div>
  if (!isLoaded) return <div>Loading...</div>

  return (
    <div className="max-w-[960px] min-h-screen m-auto p-2">
      <h1 className="text-4xl font-bold leading-relaxed text-center">React JSON highlight 🍭</h1>
      <div className="flex gap-2 flex-col">
        <pre id="json-text-placeholder" className="text-xs whitespace-pre-wrap bg-gray-100 p-4 rounded-md">
          <HighlightAsJson text={text} />
        </pre>
        <pre id="json-placeholder" className="text-xs whitespace-pre-wrap bg-gray-100 p-4 rounded-md">
          <ViewJson json={json} />
        </pre>
        <pre id="json-placeholder-ref" className="text-xs whitespace-pre-wrap bg-gray-100 p-4 rounded-md">
          {JSON.stringify(json, null, 2)}
        </pre>
      </div>
    </div>
  )
}
