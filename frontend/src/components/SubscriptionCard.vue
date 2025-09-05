<template>
  <div class="subscription-card group">
    <!-- 卡片頭部 -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center space-x-3">
        <div class="subscription-logo">
          <img
            v-if="subscription.logo"
            :src="subscription.logo"
            :alt="subscription.name"
            class="w-full h-full object-cover"
          />
          <span v-else class="text-lg font-semibold text-gray-600">
            {{ subscription.name.charAt(0) }}
          </span>
        </div>
        <div>
          <h3 class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {{ subscription.name }}
          </h3>
          <p v-if="subscription.description" class="text-sm text-gray-500 mt-1">
            {{ subscription.description }}
          </p>
        </div>
      </div>
      
      <!-- 狀態標籤 -->
      <span :class="statusClasses" class="status-badge">
        {{ statusText }}
      </span>
    </div>
    
    <!-- 價格信息 -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <div class="flex items-baseline space-x-1">
          <span class="text-2xl font-bold text-gray-900">
            {{ formatPrice(subscription.price) }}
          </span>
          <span class="text-sm text-gray-500">
            / {{ subscription.billingCycle === 'monthly' ? '月' : '年' }}
          </span>
        </div>
        <p class="text-sm text-gray-500 mt-1">
          分類：{{ subscription.category }}
        </p>
      </div>
    </div>
    
    <!-- 下次扣款 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2">
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="text-sm text-gray-600">
          下次扣款：{{ formatDate(subscription.nextBilling) }}
        </span>
      </div>
      <span :class="billingUrgencyClasses" class="text-xs px-2 py-1 rounded-full">
        {{ billingUrgencyText }}
      </span>
    </div>
    
    <!-- 操作按鈕 -->
    <div class="flex items-center justify-between pt-4 border-t border-gray-100">
      <div class="flex space-x-2">
        <button 
          @click="$emit('edit', subscription)"
          class="btn-icon text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          title="編輯"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        
        
        <button 
          @click="toggleStatus"
          :class="subscription.status === 'active' ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50' : 'text-green-600 hover:text-green-800 hover:bg-green-50'"
          class="btn-icon"
          :title="subscription.status === 'active' ? '暫停' : '啟用'"
        >
          <svg v-if="subscription.status === 'active'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
      
      <button 
        @click="$emit('delete', subscription.id)"
        class="btn-icon text-red-600 hover:text-red-800 hover:bg-red-50"
        title="刪除"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Subscription } from '@/stores'

interface Props {
  subscription: Subscription
}

interface Emits {
  edit: [subscription: Subscription]
  delete: [id: number]
  statusChange: [id: number, status: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 狀態樣式
const statusClasses = computed(() => {
  const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full'
  switch (props.subscription.status) {
    case 'active':
      return `${baseClasses} bg-green-100 text-green-800`
    case 'paused':
      return `${baseClasses} bg-yellow-100 text-yellow-800`
    case 'cancelled':
      return `${baseClasses} bg-red-100 text-red-800`
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`
  }
})

const statusText = computed(() => {
  switch (props.subscription.status) {
    case 'active': return '活躍'
    case 'paused': return '暫停'
    case 'cancelled': return '已取消'
    default: return '未知'
  }
})

// 扣款緊急程度
const billingUrgencyClasses = computed(() => {
  const daysUntilBilling = getDaysUntilBilling()
  const baseClasses = 'font-medium'
  
  if (daysUntilBilling <= 3) {
    return `${baseClasses} bg-red-100 text-red-800`
  } else if (daysUntilBilling <= 7) {
    return `${baseClasses} bg-yellow-100 text-yellow-800`
  } else {
    return `${baseClasses} bg-gray-100 text-gray-600`
  }
})

const billingUrgencyText = computed(() => {
  const days = getDaysUntilBilling()
  if (days < 0) return '已過期'
  if (days === 0) return '今天'
  if (days === 1) return '明天'
  return `${days} 天後`
})

// 工具函數
function getDaysUntilBilling(): number {
  const nextBilling = new Date(props.subscription.nextBilling)
  const today = new Date()
  const diffTime = nextBilling.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(price)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}


function toggleStatus() {
  const newStatus = props.subscription.status === 'active' ? 'paused' : 'active'
  emit('statusChange', props.subscription.id, newStatus)
}
</script>

<style scoped lang="postcss">
.subscription-card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200;
}

.subscription-logo {
  @apply w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0;
}

.btn-icon {
  @apply p-2 rounded-lg transition-colors duration-200;
}

.status-badge {
  @apply inline-flex items-center;
}
</style>