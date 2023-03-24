<script setup lang="ts">
import { usePipelineListStore } from '../stores/PipelineListStore'

const pipelineStore = usePipelineListStore()
await pipelineStore.fetchPipelines()

console.log(pipelineStore.pipelines)
</script>
<template>
  <h3>Pipelines</h3>
  <ul>
    <li v-for="pipeline in pipelineStore.pipelines">
      <RouterLink :to="`${pipeline.id}`">{{ pipeline.title }}</RouterLink>
    </li>
  </ul>
</template>
