<script setup lang="ts">
import { defineProps, computed } from 'vue'
import {
  choice,
  endOfInput,
  optionalWhitespace,
  Parser,
  recursiveParser,
  sequenceOf,
  startOfInput,
  whitespace,
} from 'arcsecond'
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
import RenderAst from './RenderAst.vue'

const props = defineProps<{ text: string }>()

const value = recursiveParser(() => choice([jsonString, jsonNumber, jonsNull, jonsBoolean, jsonArray, jsonObject]))

const jsonString = parseJsonString.map((value) => ({ type: 'string', value }))
const jsonNumber = parseJsonNumber.map((value) => ({ type: 'number', value }))
const jonsNull = parseJsonNull.map(() => ({ type: 'null', value: 'null' }))
const jonsBoolean = parseJonsBoolean.map((value) => ({ type: 'boolean', value }))

const jsonArray: Parser<string> = betweenSquareBrackets(choice([commaSeparated(value), optionalWhitespace]))

const key = parseJsonString.map((value) => ({ type: 'key', value }))
const keyValuePair: Parser<string> = jsonKeyValuePair(key, value)
const jsonObject: Parser<string> = betweenCurlyBrackets(choice([commaSeparated(keyValuePair), optionalWhitespace]))

const json = sequenceOf([startOfInput, optionalWhitespace, value, optionalWhitespace, endOfInput])

const ast = computed(() => json.run(props.text))
</script>

<template>
  <span v-if="ast.isError" class="text-red-600">{{ ast.error }}</span>
  <template v-else>
    <RenderAst :values="ast.result" />
  </template>
</template>
