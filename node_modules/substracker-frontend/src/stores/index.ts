import api from '@/api';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// 日期驗證工具函數
function isValidDate(dateString: string): boolean {
  try {
    const date = new Date(dateString)
    return !Number.isNaN(date.getTime()) && 
           date.getFullYear() > 1900 && 
           date.getFullYear() < 2100
  } catch {
    return false
  }
}

// 日期格式化工具函數
function formatDateForBackend(dateString: string): string | undefined {
  if (!isValidDate(dateString)) {
    return undefined
  }
  try {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0] // 轉換為 YYYY-MM-DD 格式
  } catch {
    return undefined
  }
}

// 簡化的訂閱介面定義
export interface Subscription {
  id: number
  name: string
  description?: string
  price: number
  currency: string
  billingCycle: 'monthly' | 'yearly' | 'weekly'
  nextBilling: string
  status: 'active' | 'paused' | 'cancelled'
  category: string
  website?: string
  logo?: string  // 新增可選的 logo 屬性
  createdAt: string
  updatedAt: string
}

// 用戶狀態
export const useUserStore = defineStore('user', () => {
  const user = ref<any>(null)
  const isLoggedIn = computed(() => !!user.value)
  
  // 本地存儲鍵
  const USER_STORAGE_KEY = 'user_data'
  
  function setUser(userData: any) {
    user.value = userData
    // 保存到 localStorage
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))
    } catch (error) {
      console.warn('無法保存用戶資料到本地存儲:', error)
    }
  }
  
  function logout() {
    user.value = null
    // 清除 localStorage
    try {
      localStorage.removeItem(USER_STORAGE_KEY)
    } catch (error) {
      console.warn('無法清除用戶資料:', error)
    }
  }
  
  // 從 localStorage 載入用戶資料
  function loadUserFromStorage() {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY)
      if (stored) {
        user.value = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('無法從本地存儲載入用戶資料:', error)
    }
  }
  
  // 初始化時載入用戶資料
  loadUserFromStorage()
  
  return { user, isLoggedIn, setUser, logout, loadUserFromStorage }
})

// 頁面狀態管理
export const usePageStore = defineStore('page', () => {
  // 設定頁面狀態
  const settings = ref({
    profile: {
      name: 'admin'
    },
    notifications: {
      billing: true,
      monthly: true,
      lunar: false
    }
  })

  // 訂閱頁面狀態
  const subscriptions = ref({
    showAddForm: false,
    showEditForm: false,
    editingSubscription: null as any
  })

  // 設定頁面方法
  function updateProfile(profileData: { name: string }) {
    settings.value.profile = { ...settings.value.profile, ...profileData }
  }

  function updateNotifications(notificationData: { billing?: boolean; monthly?: boolean; lunar?: boolean }) {
    settings.value.notifications = { ...settings.value.notifications, ...notificationData }
  }

  // 訂閱頁面方法
  function setShowAddForm(show: boolean) {
    subscriptions.value.showAddForm = show
  }

  function setShowEditForm(show: boolean) {
    subscriptions.value.showEditForm = show
  }

  function setEditingSubscription(subscription: any) {
    subscriptions.value.editingSubscription = subscription
  }

  function closeModal() {
    subscriptions.value.showAddForm = false
    subscriptions.value.showEditForm = false
    subscriptions.value.editingSubscription = null
  }

  return {
    settings,
    subscriptions,
    updateProfile,
    updateNotifications,
    setShowAddForm,
    setShowEditForm,
    setEditingSubscription,
    closeModal
  }
})

// 簡化的訂閱狀態管理
export const useSubscriptionStore = defineStore('subscription', () => {
  // 基本狀態
  const subscriptions = ref<Subscription[]>([])
  const loading = ref(false)
  
  // 本地存儲鍵
  const STORAGE_KEY = 'subscriptions_data'
  
  // 計算屬性
  const activeSubscriptions = computed(() => 
    subscriptions.value.filter(sub => sub.status === 'active')
  )
  
  // 數據持久化
  function saveToLocalStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions.value))
    } catch (error) {
      console.warn('無法保存到本地存儲:', error)
    }
  }
  
  function loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        subscriptions.value = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('無法從本地存儲加載:', error)
    }
  }
  
  // CRUD 操作
  async function fetchSubscriptions() {
    if (loading.value) return
    
    loading.value = true
    
    try {
      // 先加載本地數據
      if (subscriptions.value.length === 0) {
        loadFromLocalStorage()
      }
      
      const result = await api.getSubscriptions()
      if (result.success && result.data && Array.isArray(result.data.data)) {
        // 轉換後端數據格式為前端格式，添加防護性檢查
        subscriptions.value = result.data.data
          .filter((backendItem: any) => backendItem.id && backendItem.id > 0) // 過濾掉無效 ID
          .map((backendItem: any) => ({
            id: backendItem.id,
            name: backendItem.name || '未命名服務',
            description: backendItem.description || '',
            price: backendItem.price || 0,
            currency: backendItem.currency || 'TWD',
            billingCycle: backendItem.billing_cycle || 'monthly',
            nextBilling: backendItem.next_billing_date || new Date().toISOString().split('T')[0],
            status: backendItem.status || 'active',
            category: backendItem.category || '',
            website: backendItem.website || '',
            createdAt: backendItem.created_at || new Date().toISOString(),
            updatedAt: backendItem.updated_at || new Date().toISOString()
          }))
      } else {
        subscriptions.value = []
      }
      saveToLocalStorage()
    } catch (err) {
      console.error('獲取訂閱列表失敗:', err)
      // 如果網絡失敗，嘗試加載本地數據
      if (subscriptions.value.length === 0) {
        loadFromLocalStorage()
      }
    } finally {
      loading.value = false
    }
  }
  
  async function addSubscription(subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) {
    loading.value = true
    
    try {
      // 整理 payload：移除空字串欄位並確保基本型別
      const payload: any = { ...subscription }
      if (typeof payload.price !== 'number') payload.price = Number(payload.price)
      if (payload.description === '') delete payload.description
      if (payload.website === '') delete payload.website
      if (!payload.logo) delete payload.logo
      // 標準化日期（若非 ISO，轉為 ISO）
      if (isValidDate(payload.nextBilling)) {
        const d = new Date(payload.nextBilling)
        payload.nextBilling = d.toISOString()
      } else {
        console.warn('無效的日期格式:', payload.nextBilling)
      }

      // 先調用 API 創建訂閱，獲取後端返回的真實 ID
      const backendPayload = {
        name: payload.name,
        description: payload.description || '', // 可選，有默認值
        price: Number(payload.price), // 必須是非負數
        currency: payload.currency || 'TWD', // 必須是 ['TWD','USD','JPY','EUR'] 之一
        billing_cycle: payload.billingCycle === 'weekly' ? 'monthly' : payload.billingCycle, // 後端不支援 weekly，轉為 monthly
        // 使用後端期望的日期字段名稱，確保格式正確
        next_billing_date: formatDateForBackend(payload.nextBilling),
        status: payload.status || 'active', // 必須是 ['active','paused','cancelled'] 之一
        category: payload.category || '', // 可選，有默認值
        website: payload.website && payload.website.trim() !== '' ? payload.website : undefined // 只有當有值時才發送，避免空字串 URL 驗證錯誤
      }
      
      // 檢查日期是否有效
      if (!backendPayload.next_billing_date) {
        throw new Error('請輸入有效的日期格式（YYYY-MM-DD）')
      }
      
      console.log('發送到後端的數據:', JSON.stringify(backendPayload, null, 2))
      const result = await api.createSubscription(backendPayload)
      
      if (!result.success) {
        throw new Error(result.error || '創建訂閱失敗')
      }
      
      // 使用後端返回的數據創建本地訂閱對象，添加防護性檢查
      const backendData = result.data.data // result.data 是整個響應，result.data.data 是實際的訂閱數據
      
      console.log('Backend response data:', result.data)
      console.log('Backend subscription data:', backendData)
      
      // 驗證後端返回的 ID
      if (!backendData || !backendData.id || backendData.id <= 0) {
        throw new Error('後端返回無效的訂閱 ID')
      }
      
      const newSubscription: Subscription = {
        id: backendData.id,
        name: backendData.name || '未命名服務',
        description: backendData.description || '',
        price: backendData.price || 0,
        currency: backendData.currency || 'TWD',
        billingCycle: backendData.billing_cycle || 'monthly',
        nextBilling: backendData.next_billing_date || new Date().toISOString().split('T')[0],
        status: backendData.status || 'active',
        category: backendData.category || '',
        website: backendData.website || '',
        createdAt: backendData.created_at || new Date().toISOString(),
        updatedAt: backendData.updated_at || new Date().toISOString()
      }
      
      // 本地新增
      subscriptions.value.push(newSubscription)
      saveToLocalStorage()
      
      return newSubscription
    } catch (err) {
      console.error('新增訂閱失敗:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function updateSubscription(id: number, updates: Partial<Subscription>) {
    loading.value = true
    
    try {
      const index = subscriptions.value.findIndex(sub => sub.id === id)
      if (index === -1) {
        throw new Error('訂閱不存在')
      }
      
      const currentSubscription = subscriptions.value[index]
      const updatedData = {
        ...currentSubscription,
        ...updates
      }
      
      // 準備後端 payload
      const backendPayload = {
        name: updatedData.name,
        description: updatedData.description || '',
        price: Number(updatedData.price),
        currency: updatedData.currency || 'TWD',
        billing_cycle: updatedData.billingCycle === 'weekly' ? 'monthly' : updatedData.billingCycle,
          next_billing_date: formatDateForBackend(updatedData.nextBilling),
        status: updatedData.status || 'active',
        category: updatedData.category || '',
        website: updatedData.website && updatedData.website.trim() !== '' ? updatedData.website : undefined
      }
      
      // 檢查日期是否有效（如果提供了日期）
      if (backendPayload.next_billing_date === undefined && updatedData.nextBilling) {
        throw new Error('請輸入有效的日期格式（YYYY-MM-DD）')
      }
      
      // 先調用 API 更新
      const result = await api.updateSubscription(id.toString(), backendPayload)
      
      if (!result.success) {
        throw new Error(result.error || '更新訂閱失敗')
      }
      
      // 使用後端返回的數據更新本地訂閱，添加防護性檢查
      const backendData = result.data.data // result.data 是整個響應，result.data.data 是實際的訂閱數據
      
      // 驗證後端返回的 ID
      if (!backendData || !backendData.id || backendData.id <= 0) {
        throw new Error('後端返回無效的訂閱 ID')
      }
      
      const updatedSubscription: Subscription = {
        id: backendData.id,
        name: backendData.name || '未命名服務',
        description: backendData.description || '',
        price: backendData.price || 0,
        currency: backendData.currency || 'TWD',
        billingCycle: backendData.billing_cycle || 'monthly',
        nextBilling: backendData.next_billing_date || new Date().toISOString().split('T')[0],
        status: backendData.status || 'active',
        category: backendData.category || '',
        website: backendData.website || '',
        createdAt: backendData.created_at || new Date().toISOString(),
        updatedAt: backendData.updated_at || new Date().toISOString()
      }
      
      // 本地更新
      subscriptions.value[index] = updatedSubscription
      saveToLocalStorage()
      
      return updatedSubscription
    } catch (err) {
      console.error('更新訂閱失敗:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function removeSubscription(id: number) {
    loading.value = true
    
    try {
      const index = subscriptions.value.findIndex(sub => sub.id === id)
      if (index === -1) {
        throw new Error('訂閱不存在')
      }
      
      // 先調用 API 刪除
      const result = await api.deleteSubscription(id.toString())
      
      if (!result.success) {
        throw new Error(result.error || '刪除訂閱失敗')
      }
      
      // 本地刪除
      subscriptions.value.splice(index, 1)
      saveToLocalStorage()
      
      return true
    } catch (err) {
      console.error('刪除訂閱失敗:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 初始化時加載本地數據
  loadFromLocalStorage()
  
  return {
    // 狀態
    subscriptions,
    loading,
    activeSubscriptions,
    
    // CRUD 方法
    fetchSubscriptions,
    addSubscription,
    updateSubscription,
    removeSubscription,
    deleteSubscription: removeSubscription,
    updateSubscriptionStatus: (id: number, status: string) => updateSubscription(id, { status: status as Subscription['status'] })
  }
})