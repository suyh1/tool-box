import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/tools/json',
    },
    {
      path: '/tools/:toolId',
      component: () => import('@/app/layout/AppShell.vue'),
    },
  ],
})

export default router
