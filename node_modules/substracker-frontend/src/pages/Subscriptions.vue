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
      <div v-else>
        <SubscriptionList
          :subscriptions="subscriptions"
          @edit="handleEdit"
          @delete="handleDelete"
          @status-change="handleStatusChange"
        />
      </div>
    </div>


  
  <!-- 訂閱模態框 -->
    <Teleport to="body">
      <!-- 新增模態框 -->
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

      <!-- 編輯模態框 -->
      <div v-if="pageStore.subscriptions.showEditForm && pageStore.subscriptions.editingSubscription" class="modal-overlay" @click.self="pageStore.closeModal">
        <div class="modal-container">
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold text-gray-900">編輯訂閱</h2>
              <button @click="pageStore.closeModal" class="text-gray-400 hover:text-gray-500">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SubscriptionForm 
              :subscription="pageStore.subscriptions.editingSubscription"
              :loading="false"
              @submit="handleEditSubmit"
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
import { usePageStore, useSubscriptionStore } from '@/stores'
import type { Subscription } from '@/stores'
import SubscriptionForm from '@/components/SubscriptionForm.vue'
import SubscriptionList from '@/components/SubscriptionList.vue'

defineOptions({
  name: 'Subscriptions'
})

// 引入 pageStore
const pageStore = usePageStore()

// 新增/編輯表單資料型別（沿用 stores 的 Subscription 型別）
type FormData = Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>

// 訂閱資料狀態
const subscriptions = ref<Subscription[]>([])

// subscription store
const subscriptionStore = useSubscriptionStore()

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

// 使用 FormData 型別作為參數類型
async function handleAddSubmit(formData: FormData) {
  try {
    const created = await subscriptionStore.addSubscription(formData)
    // 同步頁面本地陣列（可直接覆蓋為 store 的狀態，避免重複）
    const exists = subscriptions.value.find(s => s.id === created.id)
    if (!exists) {
      subscriptions.value.push(created)
    }
    pageStore.closeModal()
  } catch (err) {
    console.error('新增訂閱失敗:', err)
    // 顯示用戶友好的錯誤訊息
    const errorMessage = err instanceof Error ? err.message : '新增訂閱失敗，請檢查輸入的資料'
    alert(`錯誤：${errorMessage}`)
  }
}


function handleEdit(subscription: Subscription) {
  // 開啟編輯 modal 並設定要編輯的資料
  console.log('handleEdit invoked for', subscription)
  pageStore.setEditingSubscription(subscription)
  pageStore.setShowEditForm(true)
}

async function handleDelete(id: number) {
  if (!confirm('確定要刪除這個訂閱嗎？')) return
  try {
    await subscriptionStore.removeSubscription(id)
    subscriptions.value = subscriptions.value.filter(sub => sub.id !== id)
  } catch (err) {
    console.error('刪除訂閱失敗:', err)
  }
}

// 狀態切換（由 SubscriptionCard 透過 SubscriptionList 冒泡）
async function handleStatusChange(id: number, status: string) {
  try {
    const updated = await subscriptionStore.updateSubscriptionStatus(id, status)
    const idx = subscriptions.value.findIndex(s => s.id === id)
    if (idx !== -1) {
      subscriptions.value[idx] = { ...subscriptions.value[idx], ...updated }
    }
  } catch (err) {
    console.error('更新狀態失敗:', err)
    // fallback: 本地更新，避免操作無感
    const idx = subscriptions.value.findIndex(s => s.id === id)
    if (idx !== -1) {
      subscriptions.value[idx] = { ...subscriptions.value[idx], status: status as any }
    }
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(price)
}

// 編輯表單提交
async function handleEditSubmit(formData: FormData) {
  const editing = pageStore.subscriptions.editingSubscription
  if (!editing) {
    console.warn('handleEditSubmit: no editing subscription set')
    return
  }

  console.log('handleEditSubmit called with', formData, 'editing id', editing.id)

  try {
    // 嘗試使用 subscription store 更新
    const updated = await subscriptionStore.updateSubscription(editing.id, formData)

    // 更新頁面本地陣列
    const idx = subscriptions.value.findIndex(s => s.id === editing.id)
    if (idx !== -1) {
      subscriptions.value[idx] = { ...subscriptions.value[idx], ...updated }
    }

    pageStore.closeModal()
  } catch (err) {
    console.error('更新訂閱失敗 (store):', err)
    // fallback: 直接在本地陣列做更新，避免使用者看不到變更
    try {
      const idx = subscriptions.value.findIndex(s => s.id === editing.id)
      if (idx !== -1) {
        subscriptions.value[idx] = { ...subscriptions.value[idx], ...formData }
      }
      pageStore.closeModal()
    } catch (err2) {
      console.error('更新訂閱失敗 (fallback):', err2)
    }
  }
}

// 初始化：從 subscription store 載入資料並同步
onMounted(async () => {
  console.log('訂閱管理頁面已載入 - fetching subscriptions')
  try {
    await subscriptionStore.fetchSubscriptions()
    // 將 store 的資料同步到本地狀態
    subscriptions.value = subscriptionStore.subscriptions
  } catch (err) {
    console.error('載入訂閱失敗:', err)
  }
})
</script>