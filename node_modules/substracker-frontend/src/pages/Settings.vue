<template>
  <div class="px-4 sm:px-0">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">設定</h1>
        <p class="mt-2 text-sm text-gray-700">管理您的帳戶設定和偏好</p>
      </div>
    </div>
    
    <div class="mt-8 space-y-6">
      <!-- 個人資料 -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">個人資料</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">姓名</label>
            <input
              v-model="pageStore.settings.profile.name"
              type="text"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
        </div>
        
        <div class="mt-6">
          <button @click="saveProfile" class="btn-primary">
            儲存變更
          </button>
        </div>
      </div>
      
      <!-- 通知設定 -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">通知設定</h3>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900">扣款提醒</h4>
              <p class="text-sm text-gray-500">在扣款前 3 天發送提醒</p>
            </div>
            <input
              v-model="pageStore.settings.notifications.billing"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900">月度報告</h4>
              <p class="text-sm text-gray-500">每月發送支出統計報告</p>
            </div>
            <input
              v-model="pageStore.settings.notifications.monthly"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900">農曆顯示</h4>
              <p class="text-sm text-gray-500">在日期旁顯示農曆資訊</p>
            </div>
            <input
              v-model="pageStore.settings.notifications.lunar"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
      
      <!-- 危險區域 -->
      <div class="card border-red-200">
        <h3 class="text-lg font-medium text-red-900 mb-4">危險區域</h3>
        
        <div class="space-y-4">
          <button class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            刪除帳戶
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePageStore } from '@/stores'

// 定義組件名稱，用於 keep-alive
defineOptions({
  name: 'Settings'
})

const pageStore = usePageStore()

// 儲存個人資料
function saveProfile() {
  // 這裡可以新增 API 調用來保存資料
  console.log('儲存個人資料:', pageStore.settings.profile)
  alert('個人資料已儲存！')
}
</script>