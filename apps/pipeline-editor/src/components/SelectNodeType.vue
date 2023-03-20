<template>
  <Combobox v-model="selectedNode">
    <ComboboxInput @change="query = $event.target.value" autofocus />
    <ComboboxOptions>
      <ComboboxOption v-for="person in filteredPeople" :key="person.id" :value="person">
        {{ person }}
      </ComboboxOption>
    </ComboboxOptions>
  </Combobox>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/vue'

const nodeTypes = ['add json data', 'add custom function']
const selectedNode = ref('')
const query = ref('')

const filteredPeople = computed(() =>
  query.value === ''
    ? nodeTypes
    : nodeTypes.filter((person) => {
        return person.toLowerCase().includes(query.value.toLowerCase())
      }),
)
</script>
