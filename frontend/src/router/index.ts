import Login from '@/pages/Login.vue';
import Settings from '@/pages/Settings.vue';
import Subscriptions from '@/pages/Subscriptions.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/subscriptions'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/subscriptions',
      name: 'Subscriptions',
      component: Subscriptions,
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings,
      meta: { requiresAuth: true }
    }
  ]
})

// 路由守衛 - 認證檢查
router.beforeEach((to: any, _from: any, next: any) => {
  // 檢查是否需要認證
  if (to.meta.requiresAuth) {
    // 檢查是否已登入 (可以從 localStorage 或 store 檢查)
    const userData = localStorage.getItem('user_data')
    if (!userData) {
      // 未登入，重定向到登入頁面
      next('/login')
      return
    }
  }
  
  // 如果已登入且訪問登入頁面，重定向到主頁
  if (to.path === '/login') {
    const userData = localStorage.getItem('user_data')
    if (userData) {
      next('/subscriptions')
      return
    }
  }
  
  next()
})

export default router