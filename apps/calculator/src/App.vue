<script setup lang="ts">
import Calculator from './components/Calculator.vue'
</script>

<template>
  <main class="w-[60ch] p-4 m-auto">
    <h1 class="text-4xl font-bold my-4">Calculator for nerds 🤓</h1>
    <p class="my-4">
      This is simple calculator for nerds. It supports variables, expressions, and assignments. You can use it to calculate
      your taxes, or to calculate the price of your new <span class="line-through">car</span> or bicycle .
    </p>
    <Calculator />
  </main>
</template>
