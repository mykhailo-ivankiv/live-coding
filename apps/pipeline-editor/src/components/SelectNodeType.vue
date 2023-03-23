<script setup lang="ts">
import { ref, computed, defineEmits } from 'vue'
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption, ComboboxButton } from '@headlessui/vue'

const emit = defineEmits(['change'])
const nodeTypes = [
  { id: 'json-data', tags: ['data'], title: '.json data node' },
  { id: 'google-spreadsheet-connector', tags: ['data'], title: 'Google spreadsheet adapter' },
]
const selectedNode = ref('')
const query = ref('')

const filteredCommand = computed(() =>
  query.value === ''
    ? nodeTypes
    : nodeTypes.filter((command) => command.title.toLowerCase().includes(query.value.toLowerCase())),
)
</script>

<template>
  <Combobox v-model="selectedNode" as="div" class="relative" @update:modelValue="(value) => emit('change', value.id)">
    <ComboboxButton as="div">
      <ComboboxInput
        placeholder="Choose node type"
        class="bg-transparent focus-within:outline-none h-9 w-full px-2"
        @change="query = $event.target.value"
      />
    </ComboboxButton>
    <ComboboxOptions class="absolute left-0 right-0 top-10 text-xs">
      <ComboboxOption
        v-for="command in filteredCommand"
        :key="command.id"
        :value="command"
        v-slot="{ active, selected }"
      >
        <div class="px-4 py-2 space-x-1 shadow" :class="{ 'bg-indigo-600': active, 'bg-white': !active }">
          <span class="font-medium" :class="{ 'text-white': active, 'text-gray-900': !active }">{{
            command.title
          }}</span>
          <span
            class="text-xs"
            :class="{ 'text-indigo-200': active, 'text-gray-400': !active }"
            v-for="tag in command.tags"
            >{{ tag }}</span
          >
        </div>
      </ComboboxOption>
    </ComboboxOptions>
  </Combobox>
</template>
