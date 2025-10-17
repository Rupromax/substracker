<template>
  <div class="px-4 sm:px-0">
    <!-- 頁面標題和操作 -->
    <div class="sm:flex sm:items-center sm:justify-between mb-6">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">訂閱管理</h1>
        <p class="mt-2 text-sm text-gray-700">管理您的所有訂閱服務</p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button
          @click="handleAddClick"
          class="btn-primary"
        >
          新增訂閱
        </button>
      </div>
    </div>

    <!-- 統計 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white overflow-hidden shadow rounded-lg p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">活躍訂閱</dt>
              <dd class="text-lg font-medium text-gray-900">{{ activeCount }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">月支出</dt>
              <dd class="text-lg font-medium text-gray-900">{{ formatPrice(monthlySpend) }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">總訂閱</dt>
              <dd class="text-lg font-medium text-gray-900">{{ totalCount }}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- 訂閱列表 -->
    <div class="bg-white shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">訂閱列表</h3>
      <div v-if="subscriptions.length === 0" class="text-center py-8">
        <p class="text-gray-500">目前沒有訂閱服務</p>
        <button @click="handleAddClick" class="mt-4 btn-primary">
          新增第一個訂閱
        </button>
      </div>
      <div v-else class="space-y-4">
        <div v-for="subscription in subscriptions" :key="subscription.id" 
             class="border border-gray-200 rounded-lg p-4">
          <div class="flex justify-between items-start">
            <div>
              <h4 class="font-medium text-gray-900">{{ subscription.name }}</h4>
              <p class="text-sm text-gray-500">{{ subscription.category }}</p>
              <p class="text-sm text-gray-600">{{ formatPrice(subscription.price) }} / {{ subscription.billingCycle === 'monthly' ? '月' : '年' }}</p>
            </div>
            <div class="flex space-x-2">
              <button @click="handleEdit(subscription)" class="text-blue-600 hover:text-blue-800">編輯</button>
              <button @click="handleDelete(subscription.id)" class="text-red-600 hover:text-red-800">刪除</button>
            </div>
          </div>
        </div>
      </div>
    </div>


  
  <!-- 訂閱模態框 -->
  <Teleport to="body">
    <div v-if="pageStore.subscriptions.showAddForm" class="modal-overlay" @click.self="pageStore.closeModal">
      <div class="modal-container">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-900">新增訂閱</h2>
            <button @click="pageStore.closeModal" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <SubscriptionForm 
            :loading="false" 
            @submit="handleAddSubmit" 
            @cancel="pageStore.closeModal" 
          />
        </div>
      </div>
    </div>
  </Teleport>
  </div>
</template>



<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePageStore } from '@/stores'
import SubscriptionForm from '@/components/SubscriptionForm.vue'

// 定義組件名稱，用於 keep-alive
defineOptions({
  name: 'Subscriptions'
})

// 引入 pageStore
const pageStore = usePageStore()

// 訂閱類型定義
// 在 Subscription 介面定義後新增 FormData 介面
interface Subscription {
  id: number
  name: string
  category: string
  price: number
  billingCycle: 'monthly' | 'yearly'
  status: 'active' | 'paused' | 'cancelled'
}

// 新增 FormData 介面
interface FormData {
  name: string
  category: string
  price: number
  billingCycle: 'monthly' | 'yearly'
  status?: 'active' | 'paused' | 'cancelled'
}

// 訂閱資料狀態
const subscriptions = ref<Subscription[]>([])

// 統計數據
const activeCount = computed(() => {
  return subscriptions.value.filter(sub => sub.status === 'active').length
})

const totalCount = computed(() => {
  return subscriptions.value.length
})

const monthlySpend = computed(() => {
  return subscriptions.value
    .filter(sub => sub.status === 'active')
    .reduce((total, sub) => {
      const monthlyPrice = sub.billingCycle === 'yearly' ? sub.price / 12 : sub.price
      return total + monthlyPrice
    }, 0)
})

// 事件處理
function handleAddClick() {
  pageStore.setShowAddForm(true)
}

// 使用 FormData 介面作為參數類型
function handleAddSubmit(formData: FormData) {
  console.log('新增新訂閱:', formData)

  const newSubscription = {
    ...formData,
    id: Date.now(),
    status: formData.status || 'active'
  }

  subscriptions.value.push(newSubscription)

  // 關閉模態框
  pageStore.closeModal()
}


function handleEdit(subscription: Subscription) {
  // TODO: 實作編輯訂閱功能
  console.log('編輯訂閱:', subscription.name)
}

function handleDelete(id: number) {
  if (confirm('確定要刪除這個訂閱嗎？')) {
    subscriptions.value = subscriptions.value.filter(sub => sub.id !== id)
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(price)
}

// 初始化
onMounted(() => {
  // TODO: 載入訂閱數據
  console.log('訂閱管理頁面已載入')
})
</script>