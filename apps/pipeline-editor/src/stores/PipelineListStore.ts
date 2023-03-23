import { defineStore, acceptHMRUpdate } from 'pinia'
import { Pipeline } from '@live/pipeline-types'
import { computed, reactive } from 'vue'

export const usePipelineListStore = defineStore('PipelinesListStore', () => {
  const pipelines = reactive<Pipeline[]>([])

  const fetchPipelines = async () => {
    pipelines.push(await (await fetch('http://localhost:3000/pipelines/pipeline-1')).json())
  }

  const getPipelineById = computed(() => (id: string) => pipelines.find((pipeline) => pipeline.id === id))

  return { getPipelineById, pipelines, fetchPipelines }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePipelineListStore, import.meta.hot))
}
