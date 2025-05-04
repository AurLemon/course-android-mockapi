import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const ignorePaths = ['/docs', '/api']

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView,
    },
    {
      path: '/manager',
      name: 'Manager',
      component: () => import('../views/ManagerView.vue'),
    },
  ],
})

router.beforeEach((to, from, next) => {
  const shouldBeIgnored = ignorePaths.some((path) => to.path.startsWith(path))

  if (shouldBeIgnored) {
    window.location.href = to.fullPath
    return
  }

  next()
})

export default router
