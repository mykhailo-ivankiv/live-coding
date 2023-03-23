<script setup lang="ts">
import { defineProps, ref } from 'vue'
import { Matrix } from 'transformation-matrix'
import { DragState, useDrag } from '@vueuse/gesture'
import { Node } from '@live/pipeline-types'
import SelectNodeType from './SelectNodeType.vue'

const props = defineProps<{
  pipelineId: string
  node: Node
  matrix: Matrix
  isSelected: boolean
}>()

const emit = defineEmits(['addNode', 'changePosition', 'change'])

const nodeDragHandler = ({ delta, event, cancel, canceled, first, last }: DragState) => {
  // TODO: fix it;
  if (event.target.matches('input, ul, li')) {
    cancel()
    return
  }

  emit('changePosition', props.node.id, {
    x: props.node.position.x + delta[0] / props.matrix.a,
    y: props.node.position.y + delta[1] / props.matrix.a,
    width: props.node.position.width,
    height: props.node.position.height,
  })
}
const root = ref()
useDrag(nodeDragHandler, { domTarget: root, enabled: true, capture: true })

const setNodeType = (command: string) => {
  if (command === 'json-data') {
    props.node.type = 'data'
    props.node.position.height = 124
    emit('change', props.node)
  }
}
</script>

<template>
  <div
    ref="root"
    class="absolute z-20 box-border rounded-md border-2 bg-white flex flex-col align-content-stretch"
    :class="isSelected ? 'border-blue-700 shadow shadow-blue-300' : 'border-gray-700'"
    :key="node.id"
    :style="{
      left: `${node.position.x}px`,
      top: `${node.position.y}px`,
      width: `${node.position.width}px`,
      height: `${node.cache ? node.position.height : node.position.height}px`,
    }"
  >
    <template v-if="node.type === undefined">
      <SelectNodeType @change="setNodeType" />
    </template>

    <template v-else>
      <button class="absolute top-1/2 -right-4 transform -translate-y-1/2" @click="emit('addNode', node)">
        <svg viewBox="0 0 24 24" stroke-width="1.5" class="w-6 h-6 fill-white stroke-current">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
      <div class="py-1 px-2 pl-4 border-b-2">{{ node.title }}</div>
      <!--
        Using css transform results in incorrect tooltip positioning
        https://github.com/codemirror/dev/issues/324
      -->
      <div class="flex-1 overflow-hidden">
        <iframe v-if="node.source" class="h-full w-full" :src="`/edit/${pipelineId}/${node.source}`" />
      </div>

      <!-- <JsonEditor v-if="node?.type === 'data'" />-->
      <!-- <JavascriptEditor v-else-if="node?.type === 'function'" />-->

      <iframe v-if="node.cache" class="border-t h-8 w-full" :src="`/view/${pipelineId}/${node.cache}`" />
    </template>
  </div>
</template>
