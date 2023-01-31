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

const join = (arr: string[], separator = '') => arr.join(separator)

const value = recursiveParser(() => choice([jsonString, jsonNumber, jonsNull, jonsBoolean, jsonArray, jsonObject]))

const jsonString = parseJsonString.map((value) => `<span class="text-green-700">${value}</span>`)
const jsonNumber = parseJsonNumber.map((value) => `<span class="text-yellow-600">${value}</span>`)
const jonsNull = parseJsonNull.map(() => `<span class="text-yellow-600">null</span>`)
const jonsBoolean = parseJonsBoolean.map((value) => `<span class="text-yellow-600">${value}</span>`)

const jsonArray: Parser<string> = betweenSquareBrackets(commaSeparated(value).map(join)).map(join)

const key = parseJsonString.map((key) => `<span class="text-red-500">${key}</span>`)
const keyValuePair: Parser<string> = jsonKeyValuePair(key, value).map(join)
const jsonObject: Parser<string> = betweenCurlyBrackets(commaSeparated(keyValuePair).map(join)).map(join)

const json = sequenceOf([startOfInput, optionalWhitespace, value, optionalWhitespace, endOfInput]).map(join)

export const jsonTextToHML = (jsonStr: string): string => {
  const ast = json.run(jsonStr)

  return ast.isError ? `${jsonStr}\n${ast.error}` : ast.result
}
