<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Codemirror } from 'vue-codemirror'
import { json } from '@codemirror/lang-json'
import { javascript } from '@codemirror/lang-javascript'
import { ref, shallowRef } from 'vue'

const sourceId = useRoute().params.sourceId
const extension = sourceId.match(/\..+$/)[0]

const lang = extension === '.js' ? javascript : json

const code = await (await fetch(`http://localhost:3000/sources/${sourceId}`)).text()

const extensions = [lang()]
// Codemirror EditorView instance ref
const view = shallowRef()
const handleReady = (payload) => {
  view.value = payload.view
}

// Status is available at all times via Codemirror EditorView
const getCodemirrorStates = () => {
  const state = view.value.state
  const ranges = state.selection.ranges
  const selected = ranges.reduce((r, range) => r + range.to - range.from, 0)
  const cursor = ranges[0].anchor
  const length = state.doc.length
  const lines = state.doc.lines
  // more state info ...
  // return ...
}

const log = console.log
</script>

<template>
  <Codemirror
    v-model="code"
    placeholder="Code goes here..."
    :style="{ height: '100%', width: '100%' }"
    :autofocus="false"
    :indent-with-tab="true"
    :tab-size="2"
    :extensions="extensions"
    @ready="handleReady"
    @change="log('change', $event)"
    @focus="log('focus', $event)"
    @blur="log('blur', $event)"
  />
</template>

<style>
.cm-gutters {
  display: none !important;
}
</style>
