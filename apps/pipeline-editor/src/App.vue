<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Suspense } from 'vue'
</script>

<template>
  <Suspense>
    <main class="fixed w-screen h-screen overflow-hidden">
      <RouterView />
    </main>
  </Suspense>
</template>
