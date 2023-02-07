<script setup lang="ts">
import { computed, ref } from 'vue'
import { anyCharExcept, between, char, choice, many, possibly, recursiveParser, sepBy, sequenceOf } from 'arcsecond'
import { parseJsonNumber, sepByEager } from '@live/parser-utils/json.ts'

const text = ref(`1 - 2 * 3
3 * 2 + 1`)

const optionalWhitespace = many(char(' '))

const number = parseJsonNumber.map((n) => Number(n))
const plus = sequenceOf([optionalWhitespace, char('+'), optionalWhitespace]).map(() => '+')
const minus = sequenceOf([optionalWhitespace, char('-'), optionalWhitespace]).map(() => '-')
const multiply = sequenceOf([optionalWhitespace, char('*'), optionalWhitespace]).map(() => '*')
const divide = sequenceOf([optionalWhitespace, char('/'), optionalWhitespace]).map(() => '/')
const openBracket = sequenceOf([optionalWhitespace, char('('), optionalWhitespace]).map(() => '(')
const closeBracket = sequenceOf([optionalWhitespace, char(')'), optionalWhitespace]).map(() => ')')

const anyString = many(anyCharExcept(char('\n'))).map((r) => r.join(''))

const expressionInBrackets = recursiveParser(() => between(openBracket)(closeBracket)(sumExpression))

const multiplicationTerm = sepByEager(choice([multiply, divide]))(choice([expressionInBrackets, number])).map(
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
const sumExpression = sepByEager(choice([plus, minus]))(choice([multiplicationTerm, expressionInBrackets, number])).map(
  (res: (number | string)[]) => {
    let result: number = Number(res[0])

    for (let i = 1; i < res.length; i += 2) {
      const operator = res[i]
      const value = Number(res[i + 1])

      if (operator === '+') result += value
      if (operator === '-') result -= value
    }

    return result
  },
)

const expressionString = sequenceOf([optionalWhitespace, possibly(sumExpression), anyString]).map(
  ([_, res]) => res || ' ',
)
const expressions = sepBy(char('\n'))(expressionString)

const values = computed(() => expressions.run(text.value).result)
</script>

<template>
  <div class="flex ring-2 ring-gray-300 focus-within:ring-blue-500">
    <textarea v-model="text" class="resize-none border-none w-full p-2 focus:outline-none" />
    <div class="p-2 border-l w-32 text-red-800">
      <div class="whitespace-pre" v-for="value in values">{{ value }}</div>
    </div>
  </div>
</template>
