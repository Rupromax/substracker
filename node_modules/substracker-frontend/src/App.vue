<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">SubsTracker</h1>
          </div>
          <div class="flex items-center space-x-4">
            <router-link 
              to="/subscriptions" 
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              active-class="text-primary-600 bg-primary-50"
            >
              訂閱管理
            </router-link>
            <router-link 
              to="/settings" 
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              active-class="text-primary-600 bg-primary-50"
            >
              設定
            </router-link>
            <button 
              @click="handleLogout"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              登出
            </button>
          </div>
        </div>
      </div>
    </nav>
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <keep-alive :include="['Subscriptions', 'Settings']">
        <router-view />
      </keep-alive>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'

const router = useRouter()
const userStore = useUserStore()

function handleLogout() {
  if (confirm('確定要登出嗎？')) {
    userStore.logout()
    router.push('/login')
  }
}
</script>