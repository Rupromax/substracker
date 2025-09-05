// API 服務配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787'

// API 請求封裝
class ApiService {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  // 通用請求方法
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('API request failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // 測試 API 連接
  async testConnection() {
    return this.request('/')
  }

  // 健康檢查
  async healthCheck() {
    return this.request('/api/health')
  }

  // 獲取訂閱列表
  async getSubscriptions() {
    return this.request('/api/subscriptions')
  }

  // 創建訂閱
  async createSubscription(subscription: any) {
    return this.request('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscription),
    })
  }

  // 更新訂閱
  async updateSubscription(id: string, subscription: any) {
    return this.request(`/api/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subscription),
    })
  }

  // 刪除訂閱
  async deleteSubscription(id: string) {
    return this.request(`/api/subscriptions/${id}`, {
      method: 'DELETE',
    })
  }
}

// 導出 API 實例
export const api = new ApiService(API_BASE_URL)
export default api