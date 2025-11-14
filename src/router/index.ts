import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/blog/edit',
      name: 'edit',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/pages/BlogEdit.vue'),
    },
    {
      path: '/blog/detail/',
      name: 'detail',
      component: () => import('@/pages/BlogEditDetail.vue'),
    },
        {
      path: '/blog/admin/',
      name: 'admin',
      component: () => import('@/pages/AdminHomePage.vue'),
    },
  ],
})

export default router
