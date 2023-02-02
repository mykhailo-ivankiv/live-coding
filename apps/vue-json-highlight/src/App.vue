<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import ViewJson from "./components/ViewJson.vue";


const state = reactive({ text: '', isLoading: false, error: null })
const json = computed(() => (state.text ? JSON.parse(state.text) : null))
async function loadData() {
  state.text = await (await fetch(`/data.json`)).text()
}

loadData()
</script>

<template>
  <div class="max-w-[960px] min-h-screen m-auto p-2">
    <h1 class="text-4xl font-bold leading-relaxed text-center">React JSON highlight 🍭</h1>
    <div class="flex gap-2 flex-col">
      <div id="json-text-placeholder" class="text-xs whitespace-pre-wrap bg-gray-100 p-4 rounded-md">
        HighlightAsJson
      </div>
      <div id="json-placeholder" class="text-xs whitespace-pre-wrap bg-gray-100 p-4 rounded-md">
        <ViewJson :json="json" />
      </div>
      <div id="json-placeholder-ref" class="text-xs whitespace-pre-wrap bg-gray-100 p-4 rounded-md">
        {{ JSON.stringify(json, null, 2) }}
      </div>
    </div>
  </div>
</template>
