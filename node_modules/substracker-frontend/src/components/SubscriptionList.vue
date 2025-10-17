<template>
  <div class="subscription-list">
    <!-- 簡單搜索 -->
    <div class="mb-6">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索訂閱服務..."
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>

    <!-- 訂閱列表 -->
    <div v-if="filteredSubscriptions.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SubscriptionCard
        v-for="subscription in filteredSubscriptions"
        :key="subscription.id"
        :subscription="subscription"
        @edit="(subscription) => $emit('edit', subscription)"
        @delete="(id) => $emit('delete', id)"
        @status-change="(id, status) => $emit('statusChange', id, status)"
      />
    </div>

    <!-- 空狀態 -->
    <div v-else class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">沒有找到訂閱</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ searchQuery ? '嘗試調整搜索條件' : '開始新增您的第一個訂閱服務' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Subscription } from '@/stores'
import SubscriptionCard from './SubscriptionCard.vue'

interface Props {
  subscriptions: Subscription[]
  loading?: boolean
}

interface Emits {
  edit: [subscription: Subscription]
  delete: [id: number]
  statusChange: [id: number, status: string]
}

const props = defineProps<Props>()
defineEmits<Emits>()

// 搜索狀態
const searchQuery = ref('')

// 篩選後的訂閱列表
const filteredSubscriptions = computed(() => {
  let result = [...props.subscriptions]

  // 搜索篩選
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(sub => 
      sub.name.toLowerCase().includes(query) ||
      (sub.description && sub.description.toLowerCase().includes(query)) ||
      sub.category.toLowerCase().includes(query)
    )
  }

  return result
})
</script>

<style scoped lang="postcss">
.subscription-list {
  @apply w-full;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .subscription-list {
    @apply px-4;
  }
}
</style>