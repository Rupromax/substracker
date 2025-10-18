// API 服務配置

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
        // 印出請求詳情
        console.log('=== Frontend API Request ===')
        console.log('URL:', url)
        console.log('Method:', config.method || 'GET')
        console.log('Headers:', config.headers)
        if (config.body) {
            console.log('Body:', config.body)
        }
        console.log('============================')

        try {
            const res = await fetch(url, config)
            const text = await res.text() // 不要直接 res.json()，先拿 raw 文字

            // 記錄響應詳情
            console.log('=== Frontend API Response ===')
            console.log('Status:', res.status)
            console.log('Response body:', text)
            console.log('=============================')

            if (!res.ok) {
                console.error('API error body:', text) // 這裡會看到 zod/schema 的錯誤細節
                try {
                    const errorData = JSON.parse(text)
                    if (errorData.issues) {
                        console.error('Zod validation issues:', errorData.issues)
                    }
                } catch (e) {
                    // 如果不是 JSON，直接顯示文字
                }
                throw new Error(`HTTP ${res.status}: ${text}`)
            }

            return { success: true, data: text ? JSON.parse(text) : null }
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

// 動態API配置 - 根據環境自動切換
const getApiBaseUrl = () => {
    // 檢查是否在本地開發環境
    if (import.meta.env.DEV) {
        // 本地開發環境
        return 'http://localhost:8787'
    } else {
        // 生產環境（雲端部署）
        return 'https://subs-backend.andy9729701.workers.dev'
    }
}

const API_BASE_URL = getApiBaseUrl()

// 調試信息 - 顯示當前使用的API URL
console.log('=== API Configuration ===')
console.log('Environment:', import.meta.env.DEV ? 'Development (Local)' : 'Production (Cloud)')
console.log('API Base URL:', API_BASE_URL)
console.log('========================')

// 導出 API 實例
export const api = new ApiService(API_BASE_URL)
export default api
