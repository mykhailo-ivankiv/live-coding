<script setup lang="ts">
import { defineProps } from 'vue'
defineProps<{ n: number }>()
</script>

<template>{{ '  '.repeat(n) }}</template>
