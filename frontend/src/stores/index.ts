import api from '@/api';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// 簡化的訂閱接口定義
export interface Subscription {
  id: number
  name: string
  description?: string
  price: number
  currency: string
  billingCycle: 'monthly' | 'yearly'
  nextBilling: string
  status: 'active' | 'paused' | 'cancelled'
  category: string
  website?: string
  logo?: string  // 添加可選的 logo 屬性
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
      if (result.success && result.data) {
        subscriptions.value = result.data
        saveToLocalStorage()
      }
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
      const newSubscription: Subscription = {
        ...subscription,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // 本地添加
      subscriptions.value.push(newSubscription)
      saveToLocalStorage()
      
      // API 調用
      try {
        const result = await api.createSubscription(newSubscription)
        if (!result.success) {
          console.warn('API 調用失敗，數據已保存到本地')
        }
      } catch (apiError) {
        console.warn('API 調用失敗，數據已保存到本地:', apiError)
      }
      
      return newSubscription
    } catch (err) {
      console.error('添加訂閱失敗:', err)
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
      
      const updatedSubscription = {
        ...subscriptions.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      // 本地更新
      subscriptions.value[index] = updatedSubscription
      saveToLocalStorage()
      
      // API 調用
      try {
        const result = await api.updateSubscription(id.toString(), updatedSubscription)
        if (!result.success) {
          console.warn('API 調用失敗，數據已保存到本地')
        }
      } catch (apiError) {
        console.warn('API 調用失敗，數據已保存到本地:', apiError)
      }
      
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
      
      // 本地刪除
      subscriptions.value.splice(index, 1)
      saveToLocalStorage()
      
      // API 調用
      try {
        const result = await api.deleteSubscription(id.toString())
        if (!result.success) {
          console.warn('API 調用失敗，數據已保存到本地')
        }
      } catch (apiError) {
        console.warn('API 調用失敗，數據已保存到本地:', apiError)
      }
      
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