import { createRouter, createWebHashHistory } from 'vue-router'
import AppShell from '@/app/layout/AppShell.vue'
import { tools } from '@/tools/registry'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppShell,
      children: [
        {
          path: '',
          redirect: tools[0].path,
        },
        ...tools.map((tool) => ({
          path: tool.path.replace(/^\//, ''),
          component: tool.component,
          meta: {
            toolId: tool.id,
          },
        })),
        {
          path: ':pathMatch(.*)*',
          redirect: tools[0].path,
        },
      ],
    },
  ],
})

export default router
