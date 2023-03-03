<script setup lang="ts">
import { defineProps } from 'vue'
import Spaces from './Spaces.vue'

type JSONValue = boolean | string | number | null | JSONValue | Record<string, JSONValue>

withDefaults(defineProps<{ json: JSONValue; indent?: number }>(), { indent: 0 })
</script>

<template>
  <span v-if="json === null" class="text-yellow-600">null</span>
  <span v-else-if="typeof json === 'boolean'" class="text-yellow-600">{{ json }}</span>
  <span v-else-if="typeof json === 'number'" class="text-yellow-600">{{ json }}</span>
  <span v-else-if="typeof json === 'string'" class="text-green-700">"{{ json.replaceAll('"', '\\"') }}"</span>

  <template v-else-if="Array.isArray(json)">
    <span>{{ '[\n' }}</span>
    <template v-for="(value, index) in json">
      <Spaces :n="indent + 1" />
      <JsonView :json="value" :indent="indent + 1" />
      <template v-if="index !== json.length - 1">{{ ',\n' }}</template>
    </template>
    <span>{{ '\n' }}</span>
    <Spaces :n="indent" />
    <span>{{ ']' }}</span>
  </template>

  <template v-else>
    <span>{{ '{\n' }}</span>
    <template v-for="(value, key, index) in json">
      <Spaces :n="indent + 1" />
      <span class="text-red-500">"{{ key }}"</span>: <JsonView :json="value" :indent="indent + 1" />
      <template v-if="index !== Object.keys(json).length - 1">{{ ',\n' }}</template>
    </template>
    <span>{{ '\n' }}</span>
    <Spaces :n="indent" />{{ '}' }}
  </template>
</template>
