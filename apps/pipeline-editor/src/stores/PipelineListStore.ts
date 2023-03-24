import { defineStore, acceptHMRUpdate } from 'pinia'
import { Pipeline } from '@live/pipeline-types'
import { computed, reactive, ref } from 'vue'

export const usePipelineListStore = defineStore('PipelinesListStore', () => {
  const pipelines = ref<Pipeline[]>([])

  const fetchPipelines = async () => {
    const data = await (await fetch('http://localhost:3000/pipelines/pipeline-1')).json()
    pipelines.value = [data]
  }

  const getPipelineById = computed(() => (id: string) => pipelines.value.find((pipeline) => pipeline.id === id))

  return { getPipelineById, pipelines, fetchPipelines }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePipelineListStore, import.meta.hot))
}
