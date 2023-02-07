import type { Parser } from 'arcsecond'
import { char, choice, digits, sequenceOf, str, many, possibly, anyCharExcept, optionalWhitespace } from 'arcsecond'

const join = (arr: any[], separator = '') => arr.join(separator)
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
const numberFullPart = choice([
  char('0'),
  sequenceOf([notZeroDigit, possibly(digits)]).map(join), //
])

export const parseJsonNumber = sequenceOf([
  possibly(char('-')),
  numberFullPart,
  possibly(digits),
  possibly(numberDecimalPart),
]).map(join)
export const parseJsonNull = str('null')
export const parseJonsBoolean = choice([str('false'), str('true')])

export const sepByEager = (separator: Parser<any>) => (parser: Parser<any>) =>
  sequenceOf([parser, many(sequenceOf([separator, parser]))]).map(([first, rest]) => [first, ...rest.flat(1)])

export const commaSeparated = sepByEager(sequenceOf([optionalWhitespace, char(','), optionalWhitespace]).map(join))

export const parseJsonString = sequenceOf([
  char('"'),
  many(choice([str('\\"'), anyCharExcept(char('"'))])).map(join),
  char('"'),
]).map(join)

const betweenEager = (openParser: Parser<string>, closeParser: Parser<string>) => (content: Parser<any>) =>
  sequenceOf([
    sequenceOf([openParser, optionalWhitespace]).map(join),
    content,
    sequenceOf([optionalWhitespace, closeParser]).map(join),
  ])

export const betweenSquareBrackets = betweenEager(char('['), char(']'))
export const betweenCurlyBrackets = betweenEager(char('{'), char('}'))

export const jsonKeyValuePair = (keyParser: Parser<unknown>, valueParser: Parser<unknown>) =>
  sequenceOf([keyParser, optionalWhitespace, char(':'), optionalWhitespace, valueParser])
