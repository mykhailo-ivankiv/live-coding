<script setup lang="ts">
import HighlightAsJson from '@live/components-vue/HighlightAsJson.vue'
import { useRoute } from 'vue-router'
import { ref } from 'vue'

const sourceId = useRoute().params.sourceId
// Create WebSocket connection.
const socket = new WebSocket('ws://localhost:3001')

// Connection opened
socket.addEventListener('open', (event) => {
  // socket.send('Hello Server!')
})

// Listen for messages
socket.addEventListener('message', async (event) => {
  console.log(event.data)

  if (event.data === `Source changed: ${sourceId}`) {
    code.value = await getData()
  }
  console.log('Message from server ', event.data)
})

const getData = async () => await (await fetch(`http://localhost:3000/sources/${sourceId}`)).text()
const code = ref(await getData())
</script>

<template>
  <div class="p-1 text-sm">
    <HighlightAsJson :text="code" />
  </div>
</template>
