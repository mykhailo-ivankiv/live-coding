import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: () => import('../pages/PipelinePage.vue') },
    // { path: '/edit/:source', component: JavascriptEditor },
    { path: '/edit/:sourceId', component: () => import('../pages/EditSource.vue') },
    { path: '/view/:sourceId', component: () => import('../pages/VueSource.vue') },
    { path: '/:any(.*)*', component: () => import('../pages/404.vue') },
  ],
})

export default router
