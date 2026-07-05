import { createRouter, createWebHashHistory } from 'vue-router'
import AppShell from '@/app/layout/AppShell.vue'
import { isToolCategory } from '@/tools/catalog'
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
          redirect: '/tools',
        },
        {
          path: 'tools',
          component: () => import('@/tools/catalog/ToolDirectory.vue'),
          meta: {
            page: 'directory',
          },
        },
        {
          path: 'tools/category/:category',
          component: () => import('@/tools/catalog/ToolCategory.vue'),
          beforeEnter: (to) => {
            const category = String(to.params.category ?? '')

            return isToolCategory(category) ? true : '/tools'
          },
          meta: {
            page: 'category',
          },
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
          redirect: '/tools',
        },
      ],
    },
  ],
})

export default router
