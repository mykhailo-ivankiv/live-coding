<script setup lang="ts">
type Point = { x: number; y: number }

const { from, to } = defineProps<{ from: Point; to: Point }>()
</script>

<template>
  <g>
    <path
      class="stroke-2 stroke-blue-700 fill-none"
      :d="`
              M${from.x},${from.y}
              h30
              v${(to.y - from.y)/2}
              h${to.x - from.x - 60}
              L${to.x - 30},${to.y}
              h30
            `"
    />
  </g>
</template>
