import { GesturePlugin } from '@vueuse/gesture'
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

const app = createApp(App)

app.use(GesturePlugin)
app.mount('#app')
