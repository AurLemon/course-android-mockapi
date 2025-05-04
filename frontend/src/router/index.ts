import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '../stores/auth'

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
      path: '/manager/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/manager',
      component: () => import('../views/ManagerView.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('../components/manager/Dashboard.vue'),
        },
        {
          path: 'users',
          name: 'UserManagement',
          component: () => import('../components/manager/UserManagement.vue'),
        },
        {
          path: 'notices',
          name: 'NoticeManagement',
          component: () => import('../components/manager/NoticeManagement.vue'),
        },
        {
          path: 'albums',
          name: 'AlbumManagement',
          component: () => import('../components/manager/AlbumManagement.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const shouldBeIgnored = ignorePaths.some((path) => to.path.startsWith(path))
  if (shouldBeIgnored) {
    window.location.href = to.fullPath
    return
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const authStore = useAuthStore()

  if (requiresAuth && !authStore.isLoggedIn) {
    if (to.name === 'Login') {
      next()
      return
    }

    sessionStorage.setItem('redirectPath', to.fullPath)

    next({ path: '/manager/login' })
  } else {
    next()
  }
})

export default router
