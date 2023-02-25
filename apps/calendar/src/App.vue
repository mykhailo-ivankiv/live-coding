<script setup lang="ts">
import Calendar from './Calendar.vue'
</script>
<template>
  <main class="w-[60ch] p-4 m-auto">
    <h1 class="text-4xl font-bold my-4">Vue Calendar 📆</h1>
    <p class="my-4">
      This is a simple calendar app built with Vue 3 and TypeScript. It is not a feature complete calendar app, but it
      does the basics things you would expect from a calendar app.
    </p>
    <p class="my-4">
      Probably the main use case for this component is to copy the code and use it as a starting point for your own
      implementation.
    </p>

    <Calendar />
  </main>
</template>
