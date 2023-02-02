<script setup lang="ts">
import { defineProps } from 'vue'

type NodeType = 'string' | 'number' | 'null' | 'boolean' | 'key'

type Value = null | string | { type: NodeType; value: string } | Value[]

defineProps<{ values: Value[] }>()
</script>

<template>
  <template v-for="value in values">
    <template v-if="value === null"></template>
    <template v-else-if="typeof value === 'string'">{{ value }}</template>
    <RenderAst v-else-if="Array.isArray(value)" :values="value" />
    <template v-else>
      <span v-if="value.type === 'null'" class="text-yellow-600">null</span>
      <span v-else-if="value.type === 'number'" class="text-yellow-600">{{ value.value }}</span>
      <span v-else-if="value.type === 'boolean'" class="text-yellow-600">{{ value.value }}</span>
      <span v-else-if="value.type === 'string'" class="text-green-700">{{ value.value }}</span>
      <span v-else-if="value.type === 'key'" class="text-red-500">{{ value.value }}</span>
    </template>
  </template>
</template>
