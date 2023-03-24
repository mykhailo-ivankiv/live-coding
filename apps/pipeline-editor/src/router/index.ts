import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/edit/:pipelineId/:sourceId', component: () => import('../pages/EditSource.vue') },
    { path: '/view/:pipelineId/:sourceId', component: () => import('../pages/VueSource.vue') },
    { path: '/:any(.*)*', component: () => import('../pages/404.vue') },

    { path: '/', name: 'Home', component: () => import('../pages/PipelineList.vue') },
    { path: '/:pipelineId', component: () => import('../pages/PipelinePage.vue') },
    { path: '/:pipelineId/:nodeId', component: () => import('../pages/PipelinePage.vue') },
  ],
})

export default router
