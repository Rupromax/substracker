export interface Subscription {
  /** 訂閱服務的唯一識別碼 */
  id: string
  
  /** 訂閱服務名稱 */
  name: string
  
  /** 下次續約日期 (ISO 8601 格式) */
  renewAt: string
  
  /** 訂閱費用 */
  price: number
  
  /** 貨幣代碼 (例如: TWD, USD) */
  currency: string
  
  /** 計費週期 */
  billingCycle: 'monthly' | 'yearly' | 'weekly'
  
  /** 訂閱狀態 */
  status: 'active' | 'cancelled' | 'expired'
  
  /** 備註 (可選) */
  note?: string
  
  /** 提前幾天通知 (可選，預設為 3 天) */
  notifyBeforeDays?: number
  
  /** 建立時間 */
  createdAt: string
  
  /** 最後更新時間 */
  updatedAt: string
}

export interface CreateSubscriptionRequest {
  name: string
  renewAt: string
  price: number
  currency: string
  billingCycle: 'monthly' | 'yearly' | 'weekly'
  note?: string
  notifyBeforeDays?: number
}

export interface UpdateSubscriptionRequest extends Partial<CreateSubscriptionRequest> {
  status?: 'active' | 'cancelled' | 'expired'
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}