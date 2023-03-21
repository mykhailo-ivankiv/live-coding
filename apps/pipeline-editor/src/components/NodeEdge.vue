<script setup lang="ts">
import { usePipelineStore } from '../stores/PipelineStore'
import Edge from './Edge.vue'
import { computed } from 'vue'

const pipelineStore = usePipelineStore()
const props = defineProps<{ source: string; target: string }>()
const from = computed(() => (pipelineStore.getNodeById(props.source) as Node).position)
const to = computed(() => (pipelineStore.getNodeById(props.target) as Node).position)
</script>

<template>
  <Edge :from="{ x: from.x + from.width, y: from.y + from.height / 2 }" :to="{ x: to.x, y: to.y + to.height / 2 }" />
</template>
