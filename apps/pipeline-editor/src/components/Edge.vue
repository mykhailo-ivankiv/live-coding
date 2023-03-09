<script setup lang="ts">
type Point = { x: number; y: number }

const { from, to } = defineProps<{ from: Point; to: Point }>()
const tail = 30
</script>

<template>
  <g>
    <path
      class="stroke-2 stroke-blue-700 fill-none"
      :d="
        to.x - from.x >= tail * 2
          ? `
            M${from.x},${from.y}
            h${tail + (to.x - from.x - tail *2)/2}
            v${(to.y - from.y)}
            h${tail + (to.x - from.x - tail *2)/2}
          `
          : `
            M${from.x},${from.y}
            h${tail}
            v${(to.y - from.y) / 2}
            h${to.x - from.x - 2 * tail}
            v${(to.y - from.y) / 2}
            h${tail}
          `
      "
    />
  </g>
</template>
