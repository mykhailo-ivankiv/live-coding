<script setup lang="ts">
import { defineProps, ref } from 'vue'
import { Matrix } from 'transformation-matrix'
import { DragState, useDrag } from '@vueuse/gesture'
import { Node } from '@live/pipeline-types'
import SelectNodeType from './SelectNodeType.vue'
import {
  PlusCircleIcon,
  ArrowRightCircleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowDownLeftIcon,
} from '@heroicons/vue/24/outline'
import { Rect } from '../utils/geomenty'

const props = defineProps<{
  position: Rect
  pipelineId: string
  node: Node
  matrix: Matrix
  isSelected: boolean
  isExpanded: boolean
}>()

const emit = defineEmits(['addNodeOutputConnector', 'addNodeInputConnector', 'changePosition', 'change', 'expand'])

const nodeDragHandler = ({ delta, event, cancel }: DragState) => {
  // TODO: fix it;
  if (event.target.matches('input, ul, li')) {
    cancel()
    return
  }
  if (props.isExpanded) return

  emit('changePosition', props.node.id, {
    x: props.position.x + delta[0] / props.matrix.a,
    y: props.position.y + delta[1] / props.matrix.a,
    width: props.position.width,
    height: props.position.height,
  })
}
const root = ref()
useDrag(nodeDragHandler, { domTarget: root, enabled: !props.isExpanded, capture: true, delay: true })

const setNodeType = async (command: string) => {
  if (command === 'json-data') {
    props.node.type = 'data'
    props.node.position.height = 124
    emit('change', props.node)
  }

  if (command === 'data-by-url') {
    props.node.type = 'data-by-url'
    props.node.dataUrl = 'https://swapi.dev/api/people'
    props.node.title = 'Get data from public url'
    props.node.position.height = 124
    emit('change', props.node)
  }
}
</script>

<template>
  <div
    ref="root"
    class="absolute z-20 box-border rounded-md border-2 bg-white flex flex-col align-content-stretch divide-y divide-gray-200"
    :class="isSelected ? 'border-blue-700 shadow shadow-blue-300' : 'border-gray-700'"
    :key="node.id"
    :style="{
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: `${position.width}px`,
      height: `${node.cache ? position.height : position.height}px`,
    }"
  >
    <template v-if="node.type === undefined">
      <SelectNodeType @change="setNodeType" />
    </template>

    <template v-else-if="node.type === 'data-by-url'">
      <button
        class="absolute top-1/2 -right-4 transform -translate-y-1/2"
        @click="emit('addNodeOutputConnector', node)"
      >
        <ArrowRightCircleIcon class="w-6 h-6 fill-white stroke-current" />
      </button>

      <div class="py-1 px-2 pl-4 flex justify-between">
        {{ node.title }}
        <RouterLink :to="isExpanded ? `/${pipelineId}` : `/${pipelineId}/${node.id}`">
          <ArrowDownLeftIcon v-if="isExpanded" class="w-4 h-4 fill-white stroke-current" />
          <ArrowTopRightOnSquareIcon v-else class="w-4 h-4 fill-white stroke-current" />
        </RouterLink>
      </div>

      <div>
        <input
          placeholder="Data url"
          class="bg-transparent focus-within:outline-none h-9 w-full px-2"
          type="text"
          v-model="node.dataUrl"
        />
      </div>
      <iframe v-if="node.cache" class="border-t h-full w-full" :src="`/view/${pipelineId}/${node.cache}`" />
    </template>

    <template v-else>
      <button
        v-if="node.type === 'function'"
        class="absolute top-1/2 -left-4 transform -translate-y-1/2"
        @click="emit('addNodeInputConnector', node)"
      >
        <PlusCircleIcon class="w-6 h-6 fill-white stroke-current" />
      </button>

      <button
        class="absolute top-1/2 -right-4 transform -translate-y-1/2"
        @click="emit('addNodeOutputConnector', node)"
      >
        <ArrowRightCircleIcon class="w-6 h-6 fill-white stroke-current" />
      </button>

      <div class="py-1 px-2 pl-4 flex justify-between">
        {{ node.title }}
        <RouterLink :to="isExpanded ? `/${pipelineId}` : `/${pipelineId}/${node.id}`">
          <ArrowDownLeftIcon v-if="isExpanded" class="w-4 h-4 fill-white stroke-current" />
          <ArrowTopRightOnSquareIcon v-else class="w-4 h-4 fill-white stroke-current" />
        </RouterLink>
      </div>
      <!-- Using css transform results in incorrect tooltip positioning https://github.com/codemirror/dev/issues/324 -->
      <div class="flex-1 overflow-auto">
        <iframe v-if="node.source" class="h-full w-full" :src="`/edit/${pipelineId}/${node.source}`" />
      </div>

      <!-- <JsonEditor v-if="node?.type === 'data'" />-->
      <!-- <JavascriptEditor v-else-if="node?.type === 'function'" />-->

      <iframe v-if="node.cache" class="h-8 w-full" :src="`/view/${pipelineId}/${node.cache}`" />
    </template>
  </div>
</template>
