<script setup lang="ts">
import PipelineEditor from '../components/PipelineEditor.vue'
</script>

<template>
  <article class="p-3 w-96 pointer-events-none">
    <h1 class="text-4xl font-bold my-4">Data Collection Editor</h1>
    <p class="my-4">
      The Data Collection Editor is a tool for creating and editing pipelines. Pipelines are a series of steps that are
      executed in order.
    </p>

    <hr class="m-4" />

    <h3 class="my-4 text-sm font-bold">Create data:</h3>
    <ul class="my-4 text-sm list-disc list-inside">
      <li>Enter data from "data connectors". (Google spreadsheets, Amazon S3, Postgres connector etc)</li>
      <li>D-n-D data files from local machine</li>
      <li>Enter/Edit data manually</li>
      <li>Generators (not implemented)</li>
    </ul>

    <hr class="m-4" />

    <h3 class="my-4 text-sm font-bold">Key bindings:</h3>
    <ul class="my-4 text-sm list-disc list-inside">
      <li>⌘+k — create node</li>
      <li>/ — open command palette</li>
    </ul>
  </article>
  <PipelineEditor />
</template>
