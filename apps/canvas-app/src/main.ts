import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { GesturePlugin } from '@vueuse/gesture'

const app = createApp(App)

app.use(GesturePlugin)
app.mount('#app')
