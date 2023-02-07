import {
  betweenCurlyBrackets,
  betweenSquareBrackets,
  commaSeparated,
  jsonKeyValuePair,
  parseJonsBoolean,
  parseJsonNull,
  parseJsonNumber,
  parseJsonString,
} from './json.ts'
import { expect, test } from 'vitest'

test('parseJsonNull', () => {
  expect(parseJsonNull.run(`null`)).toEqual({ data: null, isError: false, result: 'null', index: 4 })
})

test('parseJonsBoolean', () => {
  expect(parseJonsBoolean.run(`false`)).toEqual({ data: null, isError: false, result: 'false', index: 5 })
  expect(parseJonsBoolean.run(`true`)).toEqual({ data: null, isError: false, result: 'true', index: 4 })
})

test('parseJsonString', () => {
  expect(parseJsonString.run(`"hello"`)).toEqual({ data: null, isError: false, result: `"hello"`, index: 7 })
})

test('parseJsonNumber', () => {
  expect(parseJsonNumber.run(`0`)).toEqual({ data: null, isError: false, result: '0', index: 1 })
  expect(parseJsonNumber.run(`1`)).toEqual({ data: null, isError: false, result: '1', index: 1 })
  expect(parseJsonNumber.run(`10`)).toEqual({ data: null, isError: false, result: '10', index: 2 })
  expect(parseJsonNumber.run(`-10`)).toEqual({ data: null, isError: false, result: '-10', index: 3 })
  expect(parseJsonNumber.run(`0.01`)).toEqual({ data: null, isError: false, result: '0.01', index: 4 })
  expect(parseJsonNumber.run(`1.01`)).toEqual({ data: null, isError: false, result: '1.01', index: 4 })
  expect(parseJsonNumber.run(`-1.01`)).toEqual({ data: null, isError: false, result: '-1.01', index: 5 })
})

test('betweenSquareBrackets', () => {
  expect(betweenSquareBrackets(parseJsonNumber).run(`[1]`)).toEqual({
    data: null,
    isError: false,
    result: ['[', '1', ']'],
    index: 3,
  })
})

test('betweenCurlyBrackets', () => {
  expect(betweenCurlyBrackets(parseJsonNumber).run(`{1}`)).toEqual({
    data: null,
    isError: false,
    result: ['{', '1', '}'],
    index: 3,
  })
})

test('commaSeparated', () => {
  expect(commaSeparated(parseJsonNumber).run(`1,2,3`)).toEqual({
    data: null,
    isError: false,
    result: ['1', ',', '2', ',', '3'],
    index: 5,
  })
})

test('jsonKeyValuePair', () => {
  expect(jsonKeyValuePair(parseJsonString, parseJsonNumber).run(`"key": 1`)).toEqual({
    data: null,
    isError: false,
    result: ['"key"', '', ':', ' ', '1'],
    index: 8,
  })
})
