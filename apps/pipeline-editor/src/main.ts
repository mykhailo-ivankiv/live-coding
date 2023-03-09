import { GesturePlugin } from '@vueuse/gesture'
import { createApp } from 'vue'
import './style.css'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import PipelinePage from "./pages/PipelinePage.vue";
import JavascriptEditor from './components/JavascriptEditor.vue'
import JsonEditor from './components/JsonEditor.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: PipelinePage },
    { path: '/codemirror/javascript', component: JavascriptEditor },
    { path: '/codemirror/json', component: JsonEditor },
  ],
})

createApp(App).use(router).use(GesturePlugin).mount('#app')
