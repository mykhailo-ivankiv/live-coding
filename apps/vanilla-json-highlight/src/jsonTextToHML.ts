import {
  anyCharExcept,
  char,
  choice,
  digits,
  endOfInput,
  many,
  optionalWhitespace,
  Parser,
  recursiveParser,
  sequenceOf,
  startOfInput,
  str,
} from 'arcsecond'
import { possibly } from 'arcsecond/src'

const join = (arr: any[], separator = '') => arr.join(separator)
const string = sequenceOf([char('"'), many(choice([str('\\"'), anyCharExcept(char('"'))])).map(join), char('"')]).map(
  join,
)
const jsonString = string.map((value) => `<span class="text-green-700">${value}</span>`)

const notZeroDigit = choice([
  char('1'),
  char('2'),
  char('3'),
  char('4'),
  char('5'),
  char('6'),
  char('7'),
  char('8'),
  char('9'),
])

const numberDecimalPart = sequenceOf([char('.'), digits]).map(join)
const jsonNumber = sequenceOf([possibly(char('-')), notZeroDigit, possibly(digits), possibly(numberDecimalPart)])
  .map(join)
  .map((value) => `<span class="text-yellow-600">${value}</span>`)

const jonsNull = str('null').map(() => `<span class="text-yellow-600">null</span>`)
const jonsBoolean = choice([str('false'), str('true')]).map((value) => `<span class="text-yellow-600">${value}</span>`)

const value = recursiveParser(() => choice([jsonString, jsonNumber, jonsNull, jonsBoolean, jsonArray, jsonObject]))

const sepByEager = (separator: Parser<any>) => (parser: Parser<any>) =>
  sequenceOf([parser, many(sequenceOf([separator, parser]))]).map(([first, rest]) => [first, ...rest.flat(1)])

const commaSeparated = sepByEager(sequenceOf([optionalWhitespace, char(','), optionalWhitespace]).map(join))

const jsonArray: Parser<string> = sequenceOf([
  sequenceOf([char('['), optionalWhitespace]).map(join),
  commaSeparated(value).map(join),
  sequenceOf([optionalWhitespace, char(']')]).map(join),
]).map(join)

const keyValuePair: Parser<string> = sequenceOf([
  string.map((key) => `<span class="text-red-500">${key}</span>`),
  optionalWhitespace,
  char(':'),
  optionalWhitespace,
  value,
]).map(join)

const jsonObject: Parser<string> = sequenceOf([
  sequenceOf([char('{'), optionalWhitespace]).map(join),
  commaSeparated(keyValuePair).map(join),
  sequenceOf([optionalWhitespace, char('}')]).map(join),
]).map(join)

const json = sequenceOf([startOfInput, optionalWhitespace, value, optionalWhitespace, endOfInput]).map(join)

export const jsonTextToHML = (jsonStr: string): string => {
  const ast = json.run(jsonStr)

  return ast.isError ? `${jsonStr}\n${ast.error}` : ast.result
}
