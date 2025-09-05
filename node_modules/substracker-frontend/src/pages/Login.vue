<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">登入 SubsTracker</h2>
        <p class="mt-2 text-gray-600">管理您的訂閱服務</p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">帳號</label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="user_name"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">密碼</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="••••••••"
            />
          </div>
        </div>
        
        <button type="submit" class="w-full btn-primary">
          登入
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'

// 定義組件名稱，用於路由
defineOptions({
  name: 'Login'
})

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  username: '',
  password: ''
})

function handleLogin() {
  // 驗證帳號密碼
  if (form.value.username === 'admin' && form.value.password === '123456') {
    // 登入成功
    userStore.setUser({
      id: 1,
      username: form.value.username,
      name: 'admin'
    })
    
    router.push('/subscriptions')
  } else {
    // 登入失敗
    alert('帳號或密碼錯誤！')
  }
}
</script>