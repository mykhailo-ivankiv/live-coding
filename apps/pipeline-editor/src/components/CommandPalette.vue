<script setup lang="ts">
import { Dialog, DialogOverlay, Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/vue'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { defineProps, defineEmits, ref, computed } from 'vue'

const emit = defineEmits(['close', 'change'])
const query = ref('')
const commands = [
  { id: 'add-json-data', tags: ['data'], title: 'Add .json data' },
  { id: '2', tags: ['function'], title: 'Add javascript function' },
  { id: '3', tags: ['data', 'function'], title: 'Get data from AWS S3' },
  { id: '4', tags: ['data', 'function'], title: 'Get data from Google spreadsheet' },
  { id: '5', tags: ['function'], title: 'Get data from Postgres' },
  { id: '6', tags: ['function'], title: 'Add sort operator' },
  { id: '7', tags: ['function'], title: 'Add filter operator' },
  { id: '8', tags: ['function'], title: 'Add map operator' },
  { id: '9', tags: ['function'], title: 'Add reduce operator' },
  { id: '10', tags: ['function'], title: 'Add operator from repository' },
]

const filteredCommands = computed(() =>
  query.value === ''
    ? commands
    : commands.filter((command) => {
        return command.title.toLowerCase().includes(query.value.toLowerCase())
      }),
)

defineProps<{ isOpen: boolean }>()
</script>

<template>
  <Dialog :open="isOpen" @close="emit('close')" class="fixed inset-0 p-4 pt-[25vh] overflow-y-auto">
    <DialogOverlay class="fixed inset-0 bg-gray-500/75" />
    <Combobox
      @update:modelValue="
        (value) => {
          emit('change', value)
        }
      "
      as="div"
      class="relative bg-white max-w-xl mx-auto rounded-xl shadow-2xl ring-1 ring-black/5 divide-y divide-gray-100 overflow-hidden"
    >
      <div class="flex items-center px-4 gap-1">
        <MagnifyingGlassIcon class="h-6 w-6 text-gray-500" />
        <ComboboxInput
          @change="query = $event.target.value"
          class="w-full bg-transparent border-0 focus:ring-0 focus-visible:outline-none text-sm text-gray-800 placeholder-gray-400 h-12"
          placeholder="Search..."
        />
      </div>

      <ComboboxOptions v-if="filteredCommands.length" static class="py-4 text-sm max-h-96 overflow-y-auto">
        <ComboboxOption
          v-for="command in filteredCommands"
          :key="command.id"
          v-slot="{ active, selected }"
          :value="command.id"
        >
          <div class="px-4 py-2 space-x-1" :class="{ 'bg-indigo-600': active, 'bg-white': !active }">
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

      <div v-if="query !== '' && filteredCommands.length === 0" class="p-4 text-sm text-gray-500">
        No results found.
      </div>
    </Combobox>
  </Dialog>
</template>
