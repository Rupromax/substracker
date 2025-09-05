<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- 基本信息 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label for="name" class="form-label">服務名稱 *</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          class="form-input"
          :class="{ 'border-red-300': errors.name }"
          placeholder="例如：Netflix"
        />
        <p v-if="errors.name" class="form-error">{{ errors.name }}</p>
      </div>
      
      <div>
        <label for="category" class="form-label">分類 *</label>
        <select
          id="category"
          v-model="form.category"
          required
          class="form-select"
          :class="{ 'border-red-300': errors.category }"
        >
          <option value="">請選擇分類</option>
          <option value="娛樂">娛樂</option>
          <option value="工具">工具</option>
          <option value="教育">教育</option>
          <option value="健康">健康</option>
          <option value="新聞">新聞</option>
          <option value="其他">其他</option>
        </select>
        <p v-if="errors.category" class="form-error">{{ errors.category }}</p>
      </div>
    </div>
    
    <!-- 描述 -->
    <div>
      <label for="description" class="form-label">描述</label>
      <textarea
        id="description"
        v-model="form.description"
        rows="3"
        class="form-textarea"
        placeholder="簡短描述這個服務..."
      ></textarea>
    </div>
    
    <!-- 價格信息 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label for="price" class="form-label">價格 *</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">NT$</span>
          <input
            id="price"
            v-model.number="form.price"
            type="number"
            min="0"
            step="1"
            required
            class="form-input pl-12 text-right"
            :class="{ 'border-red-300': errors.price }"
            placeholder="390"
          />
        </div>
        <p v-if="errors.price" class="form-error">{{ errors.price }}</p>
      </div>
      
      <div>
        <label for="billingCycle" class="form-label">計費週期 *</label>
        <select
          id="billingCycle"
          v-model="form.billingCycle"
          required
          class="form-select"
          :class="{ 'border-red-300': errors.billingCycle }"
        >
          <option value="monthly">每月</option>
          <option value="yearly">每年</option>
        </select>
        <p v-if="errors.billingCycle" class="form-error">{{ errors.billingCycle }}</p>
      </div>
      
      <div>
        <label for="status" class="form-label">狀態</label>
        <select
          id="status"
          v-model="form.status"
          class="form-select"
        >
          <option value="active">活躍</option>
          <option value="paused">暫停</option>
          <option value="cancelled">已取消</option>
        </select>
      </div>
    </div>
    
    <!-- 下次扣款日期 -->
    <div>
      <label for="nextBilling" class="form-label">下次扣款日期 *</label>
      <input
        id="nextBilling"
        v-model="form.nextBilling"
        type="date"
        required
        class="form-input"
        :class="{ 'border-red-300': errors.nextBilling }"
        :min="today"
      />
      <p v-if="errors.nextBilling" class="form-error">{{ errors.nextBilling }}</p>
    </div>
    
    <!-- 網站 URL -->
    <div>
      <label for="website" class="form-label">官方網站</label>
      <input
        id="website"
        v-model="form.website"
        type="url"
        class="form-input"
        :class="{ 'border-red-300': errors.website }"
        placeholder="https://example.com"
      />
      <p v-if="errors.website" class="form-error">{{ errors.website }}</p>
    </div>
    
    <!-- 提交按鈕 -->
    <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
      <button
        type="button"
        @click="$emit('cancel')"
        class="btn-secondary"
      >
        取消
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="btn-primary"
      >
        {{ loading ? '保存中...' : (isEdit ? '更新' : '創建') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Subscription } from '@/stores'

interface Props {
  subscription?: Subscription
  loading?: boolean
}

interface Emits {
  submit: [data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>]
  cancel: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isEdit = computed(() => !!props.subscription)

// 表單數據
const form = ref({
  name: '',
  description: '',
  price: 0,
  currency: 'TWD',
  billingCycle: 'monthly' as 'monthly' | 'yearly',
  nextBilling: '',
  status: 'active' as 'active' | 'paused' | 'cancelled',
  category: '',
  website: ''
})

// 錯誤狀態
const errors = ref<Record<string, string>>({})

// 今天的日期（用於日期輸入的最小值）
const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// 監聽 props 變化，初始化表單
watch(
  () => props.subscription,
  (subscription) => {
    if (subscription) {
      form.value = {
        name: subscription.name,
        description: subscription.description || '',
        price: subscription.price,
        currency: subscription.currency,
        billingCycle: subscription.billingCycle,
        nextBilling: subscription.nextBilling.split('T')[0], // 只取日期部分
        status: subscription.status,
        category: subscription.category,
        website: subscription.website || ''
      }
    } else {
      // 重置表單
      form.value = {
        name: '',
        description: '',
        price: 0,
        currency: 'TWD',
        billingCycle: 'monthly',
        nextBilling: '',
        status: 'active',
        category: '',
        website: ''
      }
    }
    errors.value = {}
  },
  { immediate: true }
)

// 表單驗證
function validateForm(): boolean {
  errors.value = {}
  
  if (!form.value.name.trim()) {
    errors.value.name = '服務名稱為必填項'
  }
  
  if (!form.value.category) {
    errors.value.category = '請選擇分類'
  }
  
  if (form.value.price <= 0) {
    errors.value.price = '價格必須大於 0'
  }
  
  if (!form.value.nextBilling) {
    errors.value.nextBilling = '請選擇下次扣款日期'
  }
  
  return Object.keys(errors.value).length === 0
}

// 提交表單
function handleSubmit() {
  if (!validateForm()) {
    return
  }
  
  const submitData = {
    ...form.value,
    nextBilling: new Date(form.value.nextBilling).toISOString()
  }
  
  emit('submit', submitData)
}
</script>

<style scoped lang="postcss">
.form-label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

.form-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.form-select {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.form-textarea {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none;
}

.form-error {
  @apply mt-1 text-sm text-red-600;
}
</style>