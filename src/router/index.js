import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '$/store/user/index.js'

const routes = [
  // ... 其他路由配置 ...
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/components/Admin/index.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 检查是否需要登录
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
    return
  }

  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next('/')
    return
  }

  next()
})

export default router
