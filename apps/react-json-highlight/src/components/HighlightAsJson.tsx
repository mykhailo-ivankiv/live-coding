import { choice, endOfInput, optionalWhitespace, Parser, recursiveParser, sequenceOf, startOfInput } from 'arcsecond'
import {
  parseJsonString,
  betweenCurlyBrackets,
  betweenSquareBrackets,
  commaSeparated,
  jsonKeyValuePair,
  parseJsonNull,
  parseJsonNumber,
  parseJonsBoolean,
} from '@live/parser-utils/json.ts'

const value = recursiveParser(() => choice([jsonString, jsonNumber, jonsNull, jonsBoolean, jsonArray, jsonObject]))

const jsonString = parseJsonString.map((value) => <span className="text-green-700">{value}</span>)
const jsonNumber = parseJsonNumber.map((value) => <span className="text-yellow-600">{value}</span>)
const jonsNull = parseJsonNull.map(() => <span className="text-yellow-600">null</span>)
const jonsBoolean = parseJonsBoolean.map((value) => <span className="text-yellow-600">{value ? 'ture' : 'false'}</span>)

const jsonArray: Parser<string> = betweenSquareBrackets(commaSeparated(value))

const key = parseJsonString.map((key) => <span className="text-red-500">{key}</span>)
const keyValuePair: Parser<string> = jsonKeyValuePair(key, value)
const jsonObject: Parser<string> = betweenCurlyBrackets(commaSeparated(keyValuePair))

const json = sequenceOf([startOfInput, optionalWhitespace, value, optionalWhitespace, endOfInput])
export default function HighlightAsJson({ text }: { text: string }) {
  const ast = json.run(text)

  return ast.isError ? (
    <>
      <div>{text}</div>
      <div>{ast.error}</div>
    </>
  ) : (
    ast.result
  )
}
