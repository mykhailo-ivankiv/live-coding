<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  anyCharExcept,
  between,
  char,
  choice,
  coroutine,
  fail,
  getData,
  letters,
  many,
  Parser,
  possibly,
  recursiveParser,
  sepBy,
  sequenceOf,
  setData,
  withData,
} from 'arcsecond'
import { parseJsonNumber, sepByEager } from '@live/parser-utils/json.ts'

const optionalWhitespace = many(char(' '))

const number = parseJsonNumber.map((n) => Number(n))
const plus = sequenceOf([optionalWhitespace, char('+'), optionalWhitespace]).map(() => '+')
const minus = sequenceOf([optionalWhitespace, char('-'), optionalWhitespace]).map(() => '-')
const multiply = sequenceOf([optionalWhitespace, char('*'), optionalWhitespace]).map(() => '*')
const divide = sequenceOf([optionalWhitespace, char('/'), optionalWhitespace]).map(() => '/')
const openBracket = sequenceOf([optionalWhitespace, char('('), optionalWhitespace]).map(() => '(')
const closeBracket = sequenceOf([optionalWhitespace, char(')'), optionalWhitespace]).map(() => ')')
const equal = sequenceOf([optionalWhitespace, char('='), optionalWhitespace]).map(() => '=')

const anyString = many(anyCharExcept(char('\n')))
const expressionInBrackets = recursiveParser(() => between(openBracket)(closeBracket)(expression)) as Parser<number>
const identifier = letters

const variable = coroutine((run) => {
  const key = run(identifier)
  const value = run(getData)?.[key]

  if (value === undefined) run(fail(`Variable ${key} is not defined`))

  return value
})

const multiplicationTerm = sepByEager(choice([multiply, divide]))(choice([expressionInBrackets, number, variable])).map(
  (res: (number | string)[]) => {
    let result: number = Number(res[0])

    for (let i = 1; i < res.length; i += 2) {
      const operator = res[i]
      const value = Number(res[i + 1])

      if (operator === '*') result *= value
      if (operator === '/') result /= value
    }

    return result
  },
)
const expression = sepByEager(choice([plus, minus]))(
  choice([multiplicationTerm, expressionInBrackets, number, variable]),
).map((res: (number | string)[]) => {
  let result: number = Number(res[0])

  for (let i = 1; i < res.length; i += 2) {
    const operator = res[i]
    const value = Number(res[i + 1])

    if (operator === '+') result += value
    if (operator === '-') result -= value
  }

  return result
})
const assignment = coroutine((run) => {
  const [id, _, value] = run(sequenceOf([identifier, equal, expression]))

  const state = run(getData)
  run(setData({ ...state, [id]: value }))

  return value
})
const expressionString = sequenceOf([optionalWhitespace, possibly(choice([assignment, expression])), anyString]).map(
  ([_, res]) => res || ' ',
)
const expressions = withData(sepBy(char('\n'))(expressionString))

const el = ref<HTMLDivElement | null>(null)
const text = ref(`a = 10
b = 2

(a + b) * 4 - 6
`)
const values = computed(() => expressions({}).run(text.value).result)
const lines = computed(() => text.value.split('\n'))
</script>

<template>
  <div class="ring-2 ring-gray-300 focus-within:ring-blue-500">
    <div class="relative p-2 w-3/4">
      <div class="whitespace-pre-wrap break-words relative text-transparent" v-for="(line, index) in lines">
        {{ line || ' ' }}
        <div class="absolute z-20 left-full border-l min-h-full ml-2 p-2 -top-2 text-red-800">{{ values[index] }}</div>
      </div>
      <textarea
        ref="el"
        v-model="text"
        class="absolute break-words z-10 inset-0 h-full w-full resize-none border-none p-2 focus:outline-none"
      />
    </div>
  </div>
</template>
